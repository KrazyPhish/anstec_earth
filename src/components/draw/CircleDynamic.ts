import {
  Entity,
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CallbackProperty,
  HeightReference,
} from "cesium"
import { Geographic } from "components/coordinate"
import { Earth } from "components/Earth"
import { BillboardLayer, EllipseLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Utils, State, Figure } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

/**
 * @description 动态绘制圆
 */
export class CircleDynamic extends Dynamic<EllipseLayer<Dynamic.Circle>> {
  public type: string = "Circle"
  constructor(earth: Earth) {
    super(earth, new EllipseLayer(earth))
  }

  /**
   * @description 订阅绘制或编辑事件
   * @param event 事件类型
   * @param callback 回调
   */
  public subscribe(event: SubEventType, callback: (...args: any) => void): void {
    this.eventBus.on(event, callback)
  }

  /**
   * @description 取消订阅绘制或编辑事件
   * @param event 事件类型
   * @param callback 回调
   */
  public unsubscribe(event: SubEventType, callback: (...args: any) => void): void {
    this.eventBus.off(event, callback)
  }

  /**
   * @description 添加可编辑对象
   * @param option 新增参数以及可编辑附加数据
   */
  public add(option: EllipseLayer.AddParam<Dynamic.Circle>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画圆
   * @param param {@link Draw.Circle} 画圆参数
   * @returns 圆心坐标和半径
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.CIRCLE,
    color = Color.RED.withAlpha(0.4),
    keep = true,
    ground = false,
    onFinish,
  }: Draw.Circle): Promise<Draw.CircleReturn> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    let edge: Cartesian3
    let center: Cartesian3
    let ent: Entity
    const handler = super.startEvent()

    this.cacheHandler = handler

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      if (!center) return
      const point = super.getPointOnEllipsoid(endPosition)
      if (point) {
        edge = point
      }
      this.eventBus.emit(SubEventType.DRAW_MOVE, {
        type: this.type,
        event: SubEventType.DRAW_MOVE,
        data: { id, center, edge },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    return new Promise<Draw.CircleReturn>((resolve, reject) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        super.setViewControl(false)
        const point = super.getPointOnEllipsoid(position)
        if (point) {
          center = point
          const cbp = () => {
            if (!edge) return 1
            const _center = Geographic.fromCartesian(center)
            const _edge = Geographic.fromCartesian(edge)
            const radius = Figure.CalcRhumbDistance(_center, _edge, "meters")
            return radius
          }
          this.cacheEntity = ent = this.viewer.entities.add({
            position: center,
            ellipse: {
              semiMajorAxis: new CallbackProperty(cbp, false),
              semiMinorAxis: new CallbackProperty(cbp, false),
              outline: false,
              material: color,
              heightReference: ground ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
            },
          })
          this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
            type: this.type,
            event: SubEventType.DRAW_CERTAIN,
            data: { id, center },
          })
        } else {
          super.endEvent(handler)
          reject("Please choose a center from Earth.")
        }
      }, ScreenSpaceEventType.LEFT_DOWN)

      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const _point = super.getPointOnEllipsoid(position) ?? edge
        const _center = Geographic.fromCartesian(center)
        const _edge = Geographic.fromCartesian(_point)
        const radius = Figure.CalcRhumbDistance(_center, _edge, "meters")
        const circle = { id, center, radius }
        if (keep) {
          this.layer.add({
            id,
            module,
            center,
            color,
            ground,
            majorAxis: radius,
            minorAxis: radius,
            data: {
              type: DrawType.CIRCLE,
              positions: [center],
              attr: {
                module,
                color,
                radius,
                ground,
              },
            },
          })
        }
        this.viewer.entities.remove(ent)
        super.endEvent(handler)
        onFinish?.(center, radius)
        this.eventBus.emit(SubEventType.DRAW_FINISH, {
          type: this.type,
          event: SubEventType.DRAW_FINISH,
          data: { ...circle },
        })
        resolve(circle)
      }, ScreenSpaceEventType.LEFT_UP)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<unknown> {
    //TODO Edit circle
    // const data: Dynamic.Circle | undefined =
    //   this.layer.getEntity(id)?.data.data
    // if (!data) {
    //   return new Promise((_, reject) => reject(`Object ${id} does not exist.`))
    // } else if (State.isOperate()) {
    //   return new Promise((_, reject) => {
    //     reject("Another drawing or editing is in progress, end it first.")
    //   })
    // }

    // const handler = super.startEvent()
    // const tempPoints: Entity[] = []
    // let ent: Entity
    // let dynamicRadius: number
    // let currentPoint: Entity | undefined

    // data.positions.forEach((value, index) => {
    //   tempPoints.push(
    //     this.viewer.entities.add({
    //       id: `ModifyPoint_${index}`,
    //       position: value,
    //       point: {
    //         pixelSize: 10,
    //         color: Color.LIGHTBLUE,
    //         heightReference: HeightReference.CLAMP_TO_GROUND,
    //         disableDepthTestDistance: Number.POSITIVE_INFINITY,
    //       },
    //     })
    //   )
    // })

    // const radius = new CallbackProperty(() => dynamicRadius, false)

    // ent = this.viewer.entities.add({
    //   ellipse: {
    //     semiMajorAxis: radius,
    //     semiMinorAxis: radius,
    //     material: data.attr.color,
    //     outline: false,
    //     heightReference: data.attr.ground
    //       ? HeightReference.CLAMP_TO_GROUND
    //       : HeightReference.NONE,
    //   },
    // })

    return new Promise((_, reject) => {
      reject(`Circle ${id} cannot be edited at current version.`)
    })
  }
}
