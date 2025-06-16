/**
 * @description 允许销毁
 */
export abstract class DestroyControl {
  abstract _allowDestroy: boolean
  abstract allowDestroy: boolean
  abstract setAllowDestroy(status: boolean): void
}
