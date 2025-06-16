import {
  ArcType,
  CallbackProperty,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  type Cartesian3,
  type Entity,
} from "cesium"
import { DefaultModuleName, SubEventType } from "enum"
import { Dynamic } from "./Dynamic"
import { PolylineLayer } from "components/layers"
import { Utils, State } from "utils"
import type { Draw } from "./Draw"
import type { Earth } from "components/Earth"

export class StrokeDynamic<T = unknown> extends Dynamic<PolylineLayer<T>> {
  public type: string = "Stroke"
  constructor(earth: Earth) {
    super(earth, new PolylineLayer(earth))
  }

  /**
   * @description 笔触不支持编辑，添加对象仅增加图形
   * @param option 笔触参数
   */
  public add(option: PolylineLayer.AddParam<T>): void {
    console.warn("Stroke used for displaying, editing is nosupport, run method <add> only add a feature.")
    this.layer.add(option)
  }

  /**
   * @description 笔触
   * @param param {@link Draw.Stroke} 笔触参数
   * @returns 笔触沿途点
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.STROKE,
    width = 2,
    color = Color.RED,
    ground = false,
    keep = true,
    onFinish,
  }: Draw.Stroke): Promise<Draw.StrokeReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    const points: Cartesian3[] = []
    let ent: Entity
    let mouseDown: boolean = false

    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      if (!mouseDown) return
      const point = super.getPointOnEllipsoid(endPosition)
      if (!point) return
      points.push(point)
      if (!ent && points.length >= 2) {
        this.cacheEntity = ent = this.viewer.entities.add({
          polyline: {
            positions: new CallbackProperty(() => {
              return points
            }, false),
            material: color,
            width,
            clampToGround: ground,
            arcType: ground ? ArcType.GEODESIC : ArcType.RHUMB,
          },
        })
      }
      this.eventBus.emit(SubEventType.DRAW_MOVE, {
        type: this.type,
        event: SubEventType.DRAW_MOVE,
        data: { id, position: point },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise<Draw.StrokeReturn>((resolve, reject) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        mouseDown = true
        super.setViewControl(false)
        const point = super.getPointOnEllipsoid(position)
        if (point) {
          points.push(point)
        } else {
          super.endEvent(handler)
          reject("Please choose a point from earth.")
        }
      }, ScreenSpaceEventType.LEFT_DOWN)

      handler.setInputAction(() => {
        points.pop()
        if (points.length < 2) {
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          reject("Stroke needs at least two vertexes.")
        } else {
          const polyline = { id, positions: points }
          if (keep) {
            this.layer.add({
              id,
              module,
              ground,
              width,
              materialType: "Color",
              materialUniforms: { color },
              lines: [points],
            })
          }
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          onFinish?.(points)
          this.eventBus.emit(SubEventType.DRAW_FINISH, {
            type: this.type,
            event: SubEventType.DRAW_FINISH,
            data: { ...polyline },
          })
          resolve(polyline)
        }
      }, ScreenSpaceEventType.LEFT_UP)
    })
  }

  public edit(id: string): Promise<unknown> {
    return new Promise((_, reject) => {
      reject(`Stroke ${id} used for displaying, editing is nosupport.`)
    })
  }
}
