import {
  Entity,
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ConstantPositionProperty,
  ScreenSpaceEventType,
  CallbackProperty,
  Cartographic,
  HeightReference,
  Rectangle,
} from "cesium"
import { Earth } from "components/Earth"
import { RectangleLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Utils, State } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

const { min, max } = window.Math

/**
 * @description 动态绘制矩形
 */
export class RectangleDynamic extends Dynamic<RectangleLayer<Dynamic.Rectangle>> {
  public type: string = "Rectangle"
  constructor(earth: Earth) {
    super(earth, new RectangleLayer(earth))
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: RectangleLayer.AddParam<Dynamic.Rectangle>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画矩形
   * @param param {@link Draw.Rectangle} 画矩形参数
   * @returns 矩形
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.RECTANGLE,
    color = Color.RED.withAlpha(0.4),
    keep = true,
    ground = false,
    onFinish,
  }: Draw.Rectangle): Promise<Draw.RectangleReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    let start: Cartesian3
    let end: Cartesian3
    let ent: Entity
    const rect = new Rectangle()

    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const position = super.getPointOnEllipsoid(endPosition)
      if (!position || !start) return
      end = position
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise<Draw.RectangleReturn>((resolve, reject) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        super.setViewControl(false)
        const point = super.getPointOnEllipsoid(position)
        if (point) {
          start = point
          end = point.clone()
          this.cacheEntity = ent = this.viewer.entities.add({
            rectangle: {
              coordinates: new CallbackProperty(() => {
                const { longitude: lon1, latitude: lat1 } = Cartographic.fromCartesian(start)
                const { longitude: lon2, latitude: lat2 } = Cartographic.fromCartesian(end)
                rect.north = max(lat1, lat2)
                rect.south = min(lat1, lat2)
                rect.west = min(lon1, lon2)
                rect.east = max(lon1, lon2)
                return rect
              }, false),
              material: color,
              heightReference: ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
            },
          })
          this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
            type: this.type,
            event: SubEventType.DRAW_CERTAIN,
            data: { id, position: point },
          })
        } else {
          super.endEvent(handler)
          reject("Please choose a point from earth.")
        }
      }, ScreenSpaceEventType.LEFT_DOWN)

      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        end = super.getPointOnEllipsoid(position) ?? end
        const { longitude: lon1, latitude: lat1 } = Cartographic.fromCartesian(start)
        const { longitude: lon2, latitude: lat2 } = Cartographic.fromCartesian(end)
        rect.north = max(lat1, lat2)
        rect.south = min(lat1, lat2)
        rect.west = min(lon1, lon2)
        rect.east = max(lon1, lon2)
        const rectangle = { id, rectangle: rect }
        if (keep) {
          this.layer.add({
            id,
            module,
            rectangle: rect,
            height: 0,
            color,
            ground,
            data: {
              type: DrawType.RECTANGLE,
              positions: [
                Cartesian3.fromRadians(rect.west, rect.north),
                Cartesian3.fromRadians(rect.west, rect.south),
                Cartesian3.fromRadians(rect.east, rect.south),
                Cartesian3.fromRadians(rect.east, rect.north),
              ],
              attr: { color, ground, module },
            },
          })
        }
        this.viewer.entities.remove(ent)
        super.endEvent(handler)
        onFinish?.(rect)
        this.eventBus.emit(SubEventType.DRAW_FINISH, {
          type: this.type,
          event: SubEventType.DRAW_FINISH,
          data: { ...rectangle },
        })
        resolve(rectangle)
      }, ScreenSpaceEventType.LEFT_UP)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.RectangleReturn> {
    const data: Dynamic.Rectangle | undefined = this.layer.getEntity(id)?.data.data
    if (!data) {
      return new Promise((_, reject) => reject(`Object ${id} does not exist.`))
    } else if (State.isOperate()) {
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })
    }
    const handler = super.startEvent()
    const tempPoints: Entity[] = []
    let ent: Entity
    let currentPoint: Entity | undefined
    let currentIndex: number
    let lastPos: Cartesian3
    let { longitude: west, latitude: north } = Cartographic.fromCartesian(data.positions[0])
    let { longitude: east, latitude: south } = Cartographic.fromCartesian(data.positions[2])
    const relation = [
      { opposite: 2, sameLon: 1, sameLat: 3, longitude: west, latitude: north },
      { opposite: 3, sameLon: 0, sameLat: 2, longitude: west, latitude: south },
      { opposite: 0, sameLon: 3, sameLat: 1, longitude: east, latitude: south },
      { opposite: 1, sameLon: 2, sameLat: 0, longitude: east, latitude: north },
    ]

    const rect = new Rectangle(west, south, east, north)

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
      rectangle: {
        coordinates: new CallbackProperty(() => {
          rect.north = north
          rect.south = south
          rect.west = west
          rect.east = east
          return rect
        }, false),
        material: data.attr.color,
        heightReference: data.attr.ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
      },
    })
    this.layer.remove(id)

    handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!currentPoint) return
      const _position = super.getPointOnEllipsoid(position) ?? lastPos
      const sameLatIndex = relation[currentIndex].sameLat
      const sameLonIndex = relation[currentIndex].sameLon
      const { longitude: lon1, latitude: lat1 } = Cartographic.fromCartesian(_position)
      const { longitude: lon2, latitude: lat2 } = relation[relation[currentIndex].opposite]
      relation[currentIndex].latitude = lat1
      relation[currentIndex].longitude = lon1
      relation[sameLatIndex].latitude = lat1
      relation[sameLonIndex].longitude = lon1
      north = max(lat1, lat2)
      south = min(lat1, lat2)
      west = min(lon1, lon2)
      east = max(lon1, lon2)
      ;(tempPoints[sameLatIndex].position as ConstantPositionProperty).setValue(
        Cartesian3.fromRadians(relation[sameLatIndex].longitude, relation[sameLatIndex].latitude)
      )
      ;(tempPoints[sameLonIndex].position as ConstantPositionProperty).setValue(
        Cartesian3.fromRadians(relation[sameLonIndex].longitude, relation[sameLonIndex].latitude)
      )
      ;(currentPoint.position as ConstantPositionProperty).setValue(_position)
      currentPoint = undefined
    }, ScreenSpaceEventType.LEFT_UP)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      const position = super.getPointOnEllipsoid(endPosition)
      if (!position || !currentPoint) return
      const sameLatIndex = relation[currentIndex].sameLat
      const sameLonIndex = relation[currentIndex].sameLon
      const { longitude: lon1, latitude: lat1 } = Cartographic.fromCartesian(position)
      const { longitude: lon2, latitude: lat2 } = relation[relation[currentIndex].opposite]
      relation[currentIndex].latitude = lat1
      relation[currentIndex].longitude = lon1
      relation[sameLatIndex].latitude = lat1
      relation[sameLonIndex].longitude = lon1
      north = max(lat1, lat2)
      south = min(lat1, lat2)
      west = min(lon1, lon2)
      east = max(lon1, lon2)
      ;(tempPoints[sameLatIndex].position as ConstantPositionProperty).setValue(
        Cartesian3.fromRadians(relation[sameLatIndex].longitude, relation[sameLatIndex].latitude)
      )
      ;(tempPoints[sameLonIndex].position as ConstantPositionProperty).setValue(
        Cartesian3.fromRadians(relation[sameLonIndex].longitude, relation[sameLonIndex].latitude)
      )
      ;(currentPoint.position as ConstantPositionProperty).setValue(position)
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
            rectangle: rect,
            ...data.attr,
            data: {
              type: data.type,
              positions: [
                Cartesian3.fromRadians(west, north),
                Cartesian3.fromRadians(west, south),
                Cartesian3.fromRadians(east, south),
                Cartesian3.fromRadians(east, north),
              ],
              attr: data.attr,
            },
          })
          ent && this.viewer.entities.remove(ent)
          tempPoints.forEach((entity) => this.viewer.entities.remove(entity))
          this.eventBus.emit(SubEventType.EDIT_FINISH, {
            type: this.type,
            event: SubEventType.EDIT_FINISH,
            data: { id, rectangle: rect },
          })
          resolve({ id, rectangle: rect })
        } else {
          super.setViewControl(false)
          currentIndex = pick.id.id.split("_")[1]
          currentPoint = tempPoints[currentIndex]
          this.eventBus.emit(SubEventType.EDIT_CERTAIN, {
            type: this.type,
            event: SubEventType.EDIT_CERTAIN,
            data: { id, position: lastPos },
          })
        }
      }, ScreenSpaceEventType.LEFT_DOWN)
    })
  }
}
