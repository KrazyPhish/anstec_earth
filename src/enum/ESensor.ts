/**
 * @description 圆锥计算模式
 * 1. `MATH` 将`radius`当作标准的数学值计算
 * 2. `RHUMB` 将`radius`当作大圆圆弧的值计算
 */
export enum ConicMode {
  MATH,
  RHUMB,
}

/**
 * @description 相控阵扫描模式
 */
export enum ScanMode {
  HORIZONTAL,
  VERTICAL,
}
