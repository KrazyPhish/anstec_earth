/**
 * @description 动态绘制的状态管理
 */
export class State {
  private static isOperating = false

  public static start() {
    this.isOperating = true
  }

  public static end() {
    this.isOperating = false
  }

  public static isOperate() {
    return this.isOperating
  }
}
