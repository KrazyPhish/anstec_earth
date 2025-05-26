import {
  Color,
  Cartesian3,
  Entity,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CallbackProperty,
  ConstantPositionProperty,
} from "cesium"
import { Earth } from "components/Earth"
import { WallLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Utils, State } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

/**
 * @description 动态绘制墙体
 */
export class WallDynamic extends Dynamic<WallLayer<Dynamic.Wall>> {
  public type: string = "Wall"
  constructor(earth: Earth) {
    super(earth, new WallLayer(earth))
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: WallLayer.AddParam<Dynamic.Wall>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画墙体
   * @param param {@link Draw.Wall} 画墙体参数
   * @returns 墙体点的坐标
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.WALL,
    color = Color.ORANGE.withAlpha(0.7),
    height = 2000,
    outlineColor = Color.ORANGE,
    outlineWidth = 1,
    closed = true,
    keep = true,
    onMove,
    onEvery,
    onFinish,
  }: Draw.Wall): Promise<Draw.WallReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    const points: Cartesian3[] = []
    let ent: Entity
    let index = -1

    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const point = super.getPointOnEllipsoid(endPosition)
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

    return new Promise<Draw.PolylineReturn>((resolve, reject) => {
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
        if (!ent && points.length >= 2) {
          this.cacheEntity = ent = this.viewer.entities.add({
            wall: {
              positions: new CallbackProperty(() => {
                return points
              }, false),
              material: color,
              minimumHeights: new CallbackProperty(() => {
                return new Array(points.length).fill(0)
              }, false),
              maximumHeights: new CallbackProperty(() => {
                return new Array(points.length).fill(height)
              }, false),
              outline: true,
              outlineColor,
              outlineWidth,
            },
          })
        }
      }, ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(() => {
        points.pop()
        if (points.length < 2) {
          ent && this.viewer.entities.remove(ent)
          super.endEvent(handler)
          reject("Polyline needs at least two vertexes.")
        } else {
          const polyline = { id, positions: points }
          if (keep) {
            if (closed) {
              points.push(points[0].clone())
            }
            this.layer.add({
              id,
              module,
              positions: points,
              color,
              outline: true,
              outlineColor,
              outlineWidth,
              minimumHeights: new Array(points.length).fill(0),
              maximumHeights: new Array(points.length).fill(height),
              data: {
                type: DrawType.WALL,
                positions: closed ? points.slice(0, -1) : points,
                attr: {
                  color,
                  outlineColor,
                  outlineWidth,
                  height,
                  closed,
                  module,
                },
              },
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
      }, ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.WallReturn> {
    const data: Dynamic.Wall | undefined = this.layer.getEntity(id)?.data.data
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

    if (data.attr.closed) positions.push(positions[0].clone())

    data.positions.forEach((value, index) => {
      tempPoints.push(
        this.viewer.entities.add({
          id: `ModifyPoint_${index}`,
          position: value,
          point: {
            pixelSize: 10,
            color: Color.LIGHTBLUE,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })
      )
    })

    ent = this.viewer.entities.add({
      wall: {
        positions: new CallbackProperty(() => {
          return positions
        }, false),
        minimumHeights: new Array(positions.length).fill(0),
        maximumHeights: new Array(positions.length).fill(data.attr.height),
        outline: true,
        material: data.attr.color,
        outlineColor: data.attr.outlineColor,
        outlineWidth: data.attr.outlineWidth,
      },
    })
    this.layer.remove(id)

    handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!currentPoint) return
      const _position = super.getPointOnEllipsoid(position) ?? lastPos
      ;(currentPoint.position as ConstantPositionProperty).setValue(_position)
      positions.splice(currentIndex, 1, _position)
      if (currentIndex === 0 && data.attr.closed) {
        positions[positions.length - 1] = _position.clone()
      }
      currentPoint = undefined
    }, ScreenSpaceEventType.LEFT_UP)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const position = super.getPointOnEllipsoid(endPosition)
      if (!position || !currentPoint) return
      ;(currentPoint.position as ConstantPositionProperty).setValue(position)
      positions.splice(currentIndex, 1, position)
      if (currentIndex === 0 && data.attr.closed) {
        positions[positions.length - 1] = position.clone()
      }
      lastPos = position
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
            ...data.attr,
            minimumHeights: new Array(positions.length).fill(0),
            maximumHeights: new Array(positions.length).fill(data.attr.height),
            data: {
              type: data.type,
              positions: data.attr.closed ? positions.slice(0, -1) : positions,
              attr: data.attr,
            },
          })
          ent && this.viewer.entities.remove(ent)
          tempPoints.forEach((entity) => this.viewer.entities.remove(entity))
          resolve({ id, positions })
        } else {
          super.setViewControl(false)
          currentIndex = Number(pick.id.id.split("_")[1])
          currentPoint = tempPoints[currentIndex]
        }
      }, ScreenSpaceEventType.LEFT_DOWN)
    })
  }
}
