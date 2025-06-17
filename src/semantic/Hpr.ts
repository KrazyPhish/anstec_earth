import { HeadingPitchRoll } from "cesium"
import { validate, is, moreThan, positive } from "decorators"

const { abs, PI } = window.Math

/**
 * @description 姿态描述 <角度制>
 * @param [heading = 0] 航向 <角度制>
 * @param [pitch = 0] 俯仰 <角度制>
 * @param [roll = 0] 翻滚 <角度制>
 */
@validate
export class Hpr {
  heading: number
  pitch: number
  roll: number
  constructor(@is(Number) heading: number = 0, @is(Number) pitch: number = 0, @is(Number) roll: number = 0) {
    this.heading = heading % 360
    this.pitch = pitch % 360
    this.roll = roll % 360
  }

  /**
   * @description 克隆当前姿态描述
   * @param [result] 存储的对象
   * @example
   * ```
   * const hpr = new Hpr(90, 90, 90)
   * const clone = hpr.clone()
   * ```
   */
  @validate
  clone(@is(Hpr) result?: Hpr) {
    if (result) {
      result.heading = this.heading
      result.pitch = this.pitch
      result.roll = this.roll
      return result
    }
    return new Hpr(this.heading, this.pitch, this.roll)
  }

  /**
   * @description 转换为`HeadingPitchRoll`
   * @returns `HeadingPitchRoll`
   */
  toHeadingPitchRoll() {
    return new HeadingPitchRoll((this.heading * PI) / 360.0, (this.pitch * PI) / 360.0, (this.roll * PI) / 360.0)
  }

  /**
   * @description 比较两个姿态描述是否相等
   * @param left {@link Hpr} 左值
   * @param right {@link Hpr} 右值
   * @param [diff = 0] 可接受的数学误差
   */
  @validate
  static equals(@is(Hpr) left: Hpr, @is(Hpr) right: Hpr, @positive() @is(Number) diff: number = 0) {
    if (left === right) return true
    const diffHeading = abs(left.heading - right.heading) <= diff
    const diffPitch = abs(left.pitch - right.pitch) <= diff
    const diffRoll = abs(left.roll - right.roll) <= diff
    return diffHeading && diffPitch && diffRoll
  }

  /**
   * @description 从 `HeadingPitchRoll` 转换
   * @param hpr {@link HeadingPitchRoll} 航向俯仰翻滚
   * @param [result] 存储的对象
   */
  @validate
  static fromHeadingPitchRoll(@is(HeadingPitchRoll) hpr: HeadingPitchRoll, @is(Hpr) result?: Hpr) {
    const heading = (hpr.heading * PI) / 360.0
    const pitch = (hpr.pitch * PI) / 360.0
    const roll = (hpr.roll * PI) / 360.0
    if (result) {
      result.heading = heading
      result.pitch = pitch
      result.roll = roll
      return result
    }
    return new Hpr(heading, pitch, roll)
  }
}
