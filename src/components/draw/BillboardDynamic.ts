import {
  Entity,
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ConstantPositionProperty,
  ScreenSpaceEventType,
  Cartesian2,
  HorizontalOrigin,
  VerticalOrigin,
} from "cesium"
import { Earth } from "components/Earth"
import { BillboardLayer } from "components/layers"
import { DrawType, DefaultModuleName, SubEventType } from "enum"
import { Utils, State } from "utils"
import { Draw } from "./Draw"
import { Dynamic } from "./Dynamic"

/**
 * @description 动态绘制广告牌
 */
export class BillboardDynamic extends Dynamic<BillboardLayer<Dynamic.Billboard>> {
  public type: string = "Billboard"
  constructor(earth: Earth) {
    super(earth, new BillboardLayer(earth))
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
  public add(option: BillboardLayer.AddParam<Dynamic.Billboard>) {
    this.layer.add(option)
  }

  /**
   * @description 动态画广告牌
   * @param param {@link Draw.Billboard} 画广告牌参数
   * @returns 点的坐标
   */
  public draw({
    id = Utils.RandomUUID(),
    module = DefaultModuleName.BILLBOARD,
    image,
    width = 48,
    height = 48,
    pixelOffset = new Cartesian2(0, 0),
    horizontalOrigin = HorizontalOrigin.CENTER,
    verticalOrigin = VerticalOrigin.BOTTOM,
    keep = true,
    limit = 1,
    onEvery,
    onFinish,
  }: Draw.Billboard): Promise<Draw.BillboardReturn[]> {
    if (State.isOperate())
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })

    const billboards: Draw.BillboardReturn[] = []

    return new Promise<Draw.BillboardReturn[]>((resolve) => {
      let index = -1
      const handler = super.startEvent()

      this.cacheHandler = handler

      const finish = () => {
        super.endEvent(handler)
        if (!keep) {
          billboards.forEach(({ id }: Draw.PointReturn) => {
            this.layer.remove(id)
          })
        }
        onFinish?.(billboards.map((v) => v.position))
        this.eventBus.emit(SubEventType.DRAW_FINISH, {
          type: this.type,
          event: SubEventType.DRAW_FINISH,
          data: { billboards },
        })
        resolve(billboards)
      }

      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        index++
        const cartesian = super.getPointOnEllipsoid(position)
        if (!cartesian) return
        const _id = `${id}_${index}`
        const billboard = { id: _id, position: cartesian }
        billboards.push(billboard)
        this.layer.add({
          id: _id,
          module,
          position: cartesian,
          image,
          width,
          height,
          horizontalOrigin,
          verticalOrigin,
          pixelOffset,
          data: {
            type: DrawType.BILLBOARD,
            positions: [cartesian],
            attr: {
              module,
              horizontalOrigin,
              verticalOrigin,
              image,
              width,
              height,
              pixelOffset,
            },
          },
        })
        onEvery?.(cartesian, index)
        this.eventBus.emit(SubEventType.DRAW_CERTAIN, {
          type: this.type,
          event: SubEventType.DRAW_CERTAIN,
          data: { ...billboard },
        })
        if (limit !== 0 && index >= limit - 1) {
          finish()
        }
      }, ScreenSpaceEventType.LEFT_CLICK)

      handler.setInputAction(finish, ScreenSpaceEventType.RIGHT_CLICK)
    })
  }

  /**
   * @description 编辑
   * @param id 目标ID
   * @returns
   */
  public edit(id: string): Promise<Draw.BillboardReturn> {
    const data: Dynamic.Billboard | undefined = this.layer.getEntity(id)?.data.data
    if (!data) {
      return new Promise((_, reject) => reject(`Object ${id} does not exist.`))
    } else if (State.isOperate()) {
      return new Promise((_, reject) => {
        reject("Another drawing or editing is in progress, end it first.")
      })
    }
    const handler = super.startEvent()
    const point = data.positions[0]
    let ent: Entity
    let currentPoint: Entity | undefined
    let lastPos: Cartesian3 = point.clone()

    ent = this.viewer.entities.add({
      position: point,
      billboard: { ...data.attr },
      point: {
        color: Color.RED,
        pixelSize: 10,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
    this.layer.remove(id)

    handler.setInputAction(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
      if (!currentPoint) return
      const position = super.getPointOnEllipsoid(endPosition)
      if (position) {
        ;(ent.position as ConstantPositionProperty).setValue(position)
        lastPos = position
      }
      this.eventBus.emit(SubEventType.EDIT_MOVE, {
        type: this.type,
        event: SubEventType.EDIT_MOVE,
        data: { id, position: lastPos },
      })
    }, ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(() => {
      currentPoint = undefined
    }, ScreenSpaceEventType.LEFT_UP)

    return new Promise((resolve) => {
      handler.setInputAction(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
        const pick = this.scene.pick(position)
        if (!pick || pick.id.id !== ent.id) {
          super.endEvent(handler)
          this.layer.add({
            id,
            position: lastPos,
            ...data.attr,
            data: {
              type: data.type,
              positions: [lastPos],
              attr: data.attr,
            },
          })
          ent && this.viewer.entities.remove(ent)
          this.eventBus.emit(SubEventType.EDIT_FINISH, {
            type: this.type,
            event: SubEventType.EDIT_FINISH,
            data: { id, position: lastPos },
          })
          resolve({ id, position: lastPos })
        } else {
          super.setViewControl(false)
          currentPoint = ent
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
