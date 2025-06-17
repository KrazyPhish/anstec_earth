import { DistanceDisplayCondition } from "cesium"
import { is, positive, validate } from "decorators"

const { abs } = window.Math

/**
 * @description 按距离展示 / 显示实体
 * @param [near = 0] 近值 `m`
 * @param [far = Number.MAX_VALUE] 远值 `m`
 */
export class Display {
  near: number
  far: number
  constructor(near: number = 0, far: number = Number.MAX_VALUE) {
    this.near = near
    this.far = far
  }

  /**
   * @description 克隆当前展示条件
   * @param [result] 存储的对象
   */
  @validate
  clone(@is(Display) result?: Display) {
    if (result) {
      result.near = this.near
      result.far = this.far
      return result
    }
    return new Display(this.near, this.far)
  }

  /**
   * @description 转换为 `DistanceDisplayCondition`
   */
  toDistanceDisplayCondition() {
    return new DistanceDisplayCondition(this.near, this.far)
  }

  /**
   * @description 比较两个展示条件是否相等
   * @param left {@link Display} 左值
   * @param right {@link Display} 右值
   * @param [diff = 0] 可接受的数学误差
   */
  @validate
  static equals(@is(Display) left: Display, @is(Display) right: Display, @positive() @is(Number) diff: number = 0) {
    if (left === right) return true
    const diffNear = abs(left.near - right.near) <= diff
    const diffFar = abs(left.far - right.far) <= diff
    return diffNear && diffFar
  }

  /**
   * @description 从 `DistanceDisplayCondition` 转换
   * @param ddc {@link DistanceDisplayCondition}
   * @param [result] 存储的对象
   */
  static fromDistanceDisplayCondition(ddc: DistanceDisplayCondition, result?: Display) {
    if (result) {
      result.far = ddc.far
      result.near = ddc.near
      return result
    }
    return new Display(ddc.near, ddc.far)
  }
}
