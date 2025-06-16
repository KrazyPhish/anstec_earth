import {
  CallbackProperty,
  Cartesian2,
  Color,
  HeightReference,
  PolygonHierarchy,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  type Cartesian3,
  type ConstantPositionProperty,
  type Entity,
} from "cesium"
import { PolygonLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Dynamic } from "./Dynamic"
import { Utils, State } from "utils"
import type { Draw } from "./Draw"
import type { Earth } from "components/Earth"

/**
 * @description 动态绘制多边形
 */
export class PolygonDynamic extends Dynamic<PolygonLayer<Dynamic.Polygon>> {
  public type: string = "Polygon"
  constructor(earth: Earth) {
    super(earth, new PolygonLayer(earth))
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: PolygonLayer.AddParam<Dynamic.Polygon>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画多边形
   * @param param {@link Draw.Polygon} 画多边形参数
   * @returns 多边形点的坐标
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.POLYGON,
    color = Color.RED.withAlpha(0.4),
    outlineColor = Color.RED.withAlpha(0.4),
    outlineWidth = 1,
    keep = true,
    ground = false,
    onMove,
    onEvery,
    onFinish,
  }: Draw.Polygon): Promise<Draw.PolygonReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    const points: Cartesian3[] = []
    let tempLine: Entity
    let ent: Entity
    let index = -1

    const hierarchy = new PolygonHierarchy(points)

    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const _position = new Cartesian2(endPosition.x + 0.000001, endPosition.y + 0.000001)
      const point = super.getPointOnEllipsoid(_position)
      if (!point) return
      points.pop()
      points.push(point)
      onMove?.(point, index)
      this.eventBus.emit(SubEventType.DRAW_MOVE, {
        type: this.type,
        event: SubEventType.DRAW_MOVE,
        data: { id, index, position: point },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise<Draw.PolygonReturn>((resolve, reject) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const point = super.getPointOnEllipsoid(position)
        if (point) {
          index++
          points.push(point)
          onEvery?.(point, index)
          this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
            type: this.type,
            event: SubEventType.DRAW_CERTAIN,
            data: { id, index, position: point },
          })
        } else {
          super.endEvent(handler)
          reject("Please choose a point from earth.")
        }
        if (!tempLine && points.length === 2) {
          tempLine = this.viewer.entities.add({
            polyline: {
              positions: new CallbackProperty(() => {
                return points
              }, false),
              material: outlineColor,
              width: outlineWidth,
              clampToGround: ground,
            },
          })
        }
        if (!ent && points.length > 2) {
          this.viewer.entities.remove(tempLine)
          this.cacheEntity = ent = this.viewer.entities.add({
            polygon: {
              hierarchy: new CallbackProperty(() => {
                return hierarchy
              }, false),
              material: color,
              outline: true,
              outlineColor,
              outlineWidth,
              perPositionHeight: ground ? undefined : true,
              heightReference: ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
            },
          })
        }
      }, ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(() => {
        points.pop()
        if (points.length < 3) {
          tempLine && this.viewer.entities.remove(tempLine)
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          reject("Polygon needs at least three vertexes.")
        } else {
          const polygon = { id, positions: points }
          if (keep) {
            this.layer.add({
              id,
              module,
              positions: points,
              color,
              ground,
              outline: {
                width: outlineWidth,
                materialType: "Color",
                materialUniforms: { color: outlineColor },
              },
              usePointHeight: ground ? false : true,
              data: {
                type: DrawType.POLYGON,
                positions: points,
                attr: { color, outlineColor, outlineWidth, ground, module },
              },
            })
          }
          tempLine && this.viewer.entities.remove(tempLine)
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          onFinish?.(points)
          this.eventBus.emit(SubEventType.DRAW_FINISH, {
            type: this.type,
            event: SubEventType.DRAW_FINISH,
            data: { ...polygon },
          })
          resolve(polygon)
        }
      }, ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.PolygonReturn> {
    const data: Dynamic.Polygon | undefined = this.layer.getEntity(id)?.data.data
    if (!data) {
      return new Promise((_, reject) => reject(`Object ${id} does not exist.`))
    } else if (State.isOperate()) {
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })
    }
    const handler = super.startEvent()
    const tempPoints: Entity[] = []
    const positions: Cartesian3[] = [...data.positions]
    let ent: Entity
    let currentPoint: Entity | undefined
    let currentIndex: number
    let lastPos: Cartesian3

    const hierarchy = new PolygonHierarchy(positions)

    data.positions.forEach((value, index) => {
      tempPoints.push(
        this.viewer.entities.add({
          id: `ModifyPoint_${index}`,
          position: value,
          point: {
            pixelSize: 10,
            color: Color.LIGHTBLUE,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })
      )
    })

    ent = this.viewer.entities.add({
      polygon: {
        hierarchy: new CallbackProperty(() => {
          return hierarchy
        }, false),
        material: data.attr.color,
        outline: true,
        outlineColor: data.attr.outlineColor,
        outlineWidth: data.attr.outlineWidth,
        heightReference: data.attr.ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
      },
    })
    this.layer.remove(id)

    handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!currentPoint) return
      const _position = super.getPointOnEllipsoid(position) ?? lastPos
      ;(currentPoint.position as ConstantPositionProperty).setValue(_position)
      positions.splice(currentIndex, 1, _position)
      currentPoint = undefined
      this.eventBus.emit(SubEventType.EDIT_CERTAIN, {
        type: this.type,
        event: SubEventType.EDIT_CERTAIN,
        data: { id, index: currentIndex, position: _position },
      })
    }, ScreenSpaceEventType.LEFT_UP)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const position = super.getPointOnEllipsoid(endPosition)
      if (!position || !currentPoint) return
      ;(currentPoint.position as ConstantPositionProperty).setValue(position)
      positions.splice(currentIndex, 1, position)
      lastPos = position
      this.eventBus.emit(SubEventType.EDIT_MOVE, {
        type: this.type,
        event: SubEventType.EDIT_MOVE,
        data: { id, position },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise((resolve) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const _position = super.getPointOnEllipsoid(position)
        const pick = this.scene.pick(position)
        if (!_position) return
        if (!pick || !tempPoints.some((entity) => entity.id === pick.id.id)) {
          super.endEvent(handler)
          this.layer.add({
            id,
            positions,
            color: data.attr.color,
            module: data.attr.module,
            ground: data.attr.ground,
            usePointHeight: data.attr.ground ? false : true,
            outline: {
              width: data.attr.outlineWidth,
              materialType: "Color",
              materialUniforms: { color: data.attr.outlineColor },
            },
            data: { type: data.type, positions, attr: data.attr },
          })
          ent && this.viewer.entities.remove(ent)
          tempPoints.forEach((entity) => this.viewer.entities.remove(entity))
          this.eventBus.emit(SubEventType.EDIT_FINISH, {
            type: this.type,
            event: SubEventType.EDIT_FINISH,
            data: { id, positions },
          })
          resolve({ id, positions })
        } else {
          super.setViewControl(false)
          currentIndex = pick.id.id.split("_")[1]
          currentPoint = tempPoints[currentIndex]
        }
      }, ScreenSpaceEventType.LEFT_DOWN)
    })
  }
}
