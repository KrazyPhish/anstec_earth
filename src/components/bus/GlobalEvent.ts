import type { Earth } from "components/Earth"
import type { GlobalEventType } from "enum"
import { Cartesian2, Entity, ScreenSpaceEventHandler } from "cesium"
import { EventBus } from "./EventBus"
import { Utils } from "utils"

export namespace GlobalEvent {
  /**
   * @property position {@link Cartesian2} 屏幕坐标
   * @property [id] 如果事件触发的是对象则有ID属性
   * @property [module] 如果事件触发的是对象则有模块属性
   * @property [target] 如果事件触发的是对象则有对象实体
   */
  export type CallbackParam = {
    position: Cartesian2
    id?: string
    module?: string
    target?: any
  }
  export type Callback = (param: CallbackParam) => void
}

/**
 * @description 全局事件
 * @param earth {@link Earth} 地球实例
 * @param [delay = 300] 事件触发节流的间隔时间`ms`
 * @example
 * ```
 * const earth = useEarth()
 *
 * //订阅
 * earth.global.subscribe(param => console.log(param), GlobalEventType.LEFT_CLICK, "*")
 *
 * //取消订阅
 * earth.global.subscribe(param => console.log(param), GlobalEventType.LEFT_CLICK, "*")
 * ```
 */
export class GlobalEvent {
  private static readonly types: number[] = [0, 1, 2, 3, 5, 6, 7, 10, 11, 12, 15]
  private bus: EventBus
  private handler: ScreenSpaceEventHandler
  private destroyed: boolean = false

  constructor(earth: Earth, delay: number = 300) {
    this.bus = new EventBus()
    this.handler = new ScreenSpaceEventHandler(earth.viewer.canvas)
    for (const type of GlobalEvent.types) {
      if (type === 15) {
        this.handler.setInputAction(
          Utils.throttle(({ endPosition }: ScreenSpaceEventHandler.MotionEvent) => {
            this.onEvent(earth, endPosition, type)
          }, delay),
          type
        )
      } else {
        this.handler.setInputAction(
          Utils.throttle(({ position }: ScreenSpaceEventHandler.PositionedEvent) => {
            this.onEvent(earth, position, type)
          }, delay),
          type
        )
      }
    }
  }

  private onEvent(earth: Earth, position: Cartesian2, type: number) {
    const rect = earth.viewer.canvas.getBoundingClientRect()
    const scaleX = rect.width / earth.viewer.canvas.width
    const scaleY = rect.height / earth.viewer.canvas.height
    const realPosition = new Cartesian2(position.x / scaleX, position.y / scaleY)
    const pick = earth.scene.pick(realPosition, 5, 5)
    if (!pick) {
      this.bus.emit(`undefined_${type}`, { position })
    } else {
      let id: string | undefined
      if (typeof pick.id === "string") {
        id = pick.id
      } else if (pick.id instanceof Entity) {
        id = pick.id.id
      }
      if (id) {
        const ent = Utils.DecodeId(id)
        if (ent) {
          this.bus.emit(`*_${type}`, { ...ent, target: pick })
        }
        if (ent && ent.module) {
          this.bus.emit(`${ent.module}_${type}`, { ...ent, target: pick })
        }
      }
    }
  }

  /**
   * @description 订阅全局事件
   * @param callback {@link GlobalEvent.Callback} 回调
   * @param event {@link GlobalEventType} 事件类型
   * @param [module] 模块选项
   * 1. 为特定模块订阅事件时传入
   * 2. 通配符 `*` 可以表示所有模块
   * 3. 传入模块名则仅订阅该模块事件
   */
  public subscribe(callback: GlobalEvent.Callback, event: GlobalEventType, module?: string) {
    this.bus.on(`${module}_${event}`, callback)
  }

  /**
   * @description 取消订阅全局事件
   * @param callback {@link GlobalEvent.Callback} 回调
   * @param event {@link GlobalEventType} 事件类型
   * @param [module] 模块选项
   * 1. 为特定模块取消订阅事件时传入
   * 2. 通配符 `*` 可以表示所有模块
   * 3. 传入模块名则仅取消订阅该模块事件
   */
  public unsubscribe(callback: GlobalEvent.Callback, event: GlobalEventType, module?: string) {
    this.bus.on(`${module}_${event}`, callback)
  }

  /**
   * @description 获取销毁状态
   */
  public isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * @description 销毁
   */
  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.handler.destroy()
    this.bus = undefined as any
    this.handler = undefined as any
  }
}
