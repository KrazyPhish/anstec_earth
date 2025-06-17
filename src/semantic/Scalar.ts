import { NearFarScalar } from "cesium"
import { validate, is, lessThan, positive } from "decorators"

const { abs } = window.Math

/**
 * @description 缩放尺度描述
 * @param [near = 0] 近值 `m`
 * @param [nearScale = 1] 近值时的缩放
 * @param [far = 0] 远值 `m`
 * @param [farScale = 1] 远值时的缩放
 */
@validate
export class Scalar {
  near: number
  far: number
  nearScale: number
  farScale: number
  constructor(
    @is(Number) near: number = 0,
    @positive() @is(Number) nearScale: number = 1,
    @is(Number) far: number = 0,
    @positive() @is(Number) farScale: number = 1
  ) {
    this.near = near
    this.nearScale = nearScale
    this.far = far
    this.farScale = farScale
  }

  /**
   * @description 克隆当前缩放尺度
   * @param [result] 存储的对象
   * @returns
   */
  @validate
  clone(@is(Scalar) result?: Scalar) {
    if (result) {
      result.near = this.near
      result.nearScale = this.nearScale
      result.far = this.far
      result.farScale = this.farScale
      return result
    }
    return new Scalar(this.near, this.nearScale, this.far, this.farScale)
  }

  /**
   * @description 转换为 `NearFarScalar`
   */
  toNearFarScalar() {
    return new NearFarScalar(this.near, this.nearScale, this.far, this.farScale)
  }

  /**
   * @description 比较两个缩放尺度是否相等
   * @param left {@link Scalar} 左值
   * @param right {@link Scalar} 右值
   * @param [diff = 0] 可接受的数学误差
   */
  @validate
  static equals(@is(Scalar) left: Scalar, @is(Scalar) right: Scalar, @positive() @is(Number) diff: number = 0) {
    if (left === right) return true
    const diffNear = abs(left.near - right.near) <= diff
    const diffFar = abs(left.far - right.far) <= diff
    const diffNscale = abs(left.nearScale - right.nearScale) <= diff
    const diffFscale = abs(left.farScale - right.farScale) <= diff
    return diffNear && diffFar && diffNscale && diffFscale
  }

  /**
   * @description 从 `NearFarScalar` 转换
   * @param nfs {@link NearFarScalar}
   * @param [result] 存储的对象
   */
  static fromNearFarScalar(nfs: NearFarScalar, result?: Scalar) {
    if (result) {
      result.far = nfs.far
      result.farScale = nfs.farValue
      result.near = nfs.near
      result.nearScale = nfs.nearValue
      return result
    }
    return new Scalar(nfs.near, nfs.nearValue, nfs.far, nfs.farValue)
  }
}
