import mitt, { type Emitter, type Handler } from "mitt"

/**
 * @description 事件调度总线
 * @example
 * ```
 * const eventBus = new EventBus()
 * ```
 */
export class EventBus {
  private emitter: Emitter<{ [key: string]: any }>

  constructor() {
    this.emitter = mitt()
  }

  public on<T>(event: string, handler: Handler<T>) {
    this.emitter.on(event, handler)
  }

  public off<T>(event: string, handler?: Handler<T>) {
    this.emitter.off(event, handler)
  }

  public emit<T>(event: string, context?: T) {
    this.emitter.emit(event, context)
  }
}
