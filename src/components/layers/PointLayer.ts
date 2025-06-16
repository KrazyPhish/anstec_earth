import {
  Color,
  PointPrimitiveCollection,
  type Cartesian3,
  type DistanceDisplayCondition,
  type NearFarScalar,
  type PointPrimitive,
} from "cesium"
import { Utils } from "utils"
import { LabelLayer } from "./LabelLayer"
import { Layer } from "./Layer"
import type { Earth } from "components/Earth"

export namespace PointLayer {
  export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

  export type LabelSetParam<T> = Omit<LabelLayer.SetParam<T>, "position">

  /**
   * @extends Layer.AddParam {@link Layer.AddParam}
   * @property position {@link Cartesian3} 位置
   * @property [color = {@link Color.RED}] 填充色
   * @property [pixelSize = 5] 像素大小
   * @property [outlineColor = {@link Color.RED}] 边框色
   * @property [outlineWidth = 1] 边框宽度
   * @property [scaleByDistance] {@link NearFarScalar} 按距离设置缩放
   * @property [disableDepthTestDistance] 按距离禁用地形深度检测
   * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 按距离设置可见性
   * @property [label] {@link LabelAddParam}
   */
  export type AddParam<T> = Layer.AddParam<T> & {
    position: Cartesian3
    color?: Color
    pixelSize?: number
    outlineColor?: Color
    outlineWidth?: number
    scaleByDistance?: NearFarScalar
    disableDepthTestDistance?: number
    distanceDisplayCondition?: DistanceDisplayCondition
    label?: LabelAddParam<T>
  }

  export type SetParam<T> = Partial<Omit<AddParam<T>, "id" | "module" | "data" | "label">> & {
    label?: LabelSetParam<T>
  }
}

/**
 * @description 点图层
 * @extends Layer {@link Layer} 图层基类
 * @param earth {@link Earth} 地球实例
 * @example
 * ```
 * const earth = useEarth()
 * const pointLayer = new PointLayer(earth)
 * //or
 * const pointLayer = earth.useDefaultLayers().point
 * ```
 */
export class PointLayer<T = unknown> extends Layer<PointPrimitiveCollection, PointPrimitive, Layer.Data<T>> {
  public labelLayer: LabelLayer<T>

  constructor(earth: Earth) {
    super(earth, new PointPrimitiveCollection())
    this.labelLayer = new LabelLayer(earth)
  }

  /**
   * @description 新增点
   * @param param {@link PointLayer.AddParam} 点参数
   * @example
   * ```
   * const earth = useEarth()
   * const pointLayer = new PointLayer(earth)
   * pointLayer.add({
   *  position: Cartesian3.fromDegrees(104, 31, 500),
   *  pixelSize: 5,
   *  color: Color.RED,
   *  outlineColor: Color.RED,
   *  outlineWidth: 1,
   * })
   * ```
   */
  public add({
    id = Utils.RandomUUID(),
    module,
    position,
    show = true,
    pixelSize = 5,
    color = Color.RED,
    outlineWidth = 1,
    outlineColor,
    scaleByDistance,
    disableDepthTestDistance = Number.POSITIVE_INFINITY,
    distanceDisplayCondition,
    data,
    label,
  }: PointLayer.AddParam<T>) {
    const primitive = {
      id: Utils.EncodeId(id, module),
      show,
      color,
      position,
      outlineColor: outlineColor ?? color,
      outlineWidth,
      pixelSize,
      scaleByDistance,
      disableDepthTestDistance,
      distanceDisplayCondition,
    } as PointPrimitive

    if (label) {
      this.labelLayer.add({ id, module, position, ...label })
    }
    super.save(id, { primitive, data: { data, module } })
  }

  /**
   * @description 修改点
   * @param id ID
   * @param param {@link PointLayer.SetParam} 点参数
   * @example
   * ```
   * const earth = useEarth()
   * const pointLayer = new PointLayer(earth)
   * pointLayer.set("some_id", {
   *  position: Cartesian3.fromDegrees(104, 31, 500),
   *  pixelSize: 10,
   *  color: Color.LIGHTBLUE,
   *  outlineColor: Color.LIGHTBLUE,
   *  outlineWidth: 1,
   *  disableDepthTestDistance: 0,
   * })
   * ```
   */
  public set(id: string, param: PointLayer.SetParam<T>) {
    const pointParam = { ...param }
    delete pointParam.label
    const point = this.getEntity(id)?.primitive
    if (point) {
      Object.assign(point, pointParam)
    }
    if (param.label) {
      this.labelLayer.set(id, param.label)
    }
  }

  /**
   * @description 隐藏所有点
   */
  public hide(): void
  /**
   * @description 隐藏所有点
   * @param id 根据ID隐藏点
   */
  public hide(id: string): void
  public hide(id?: string) {
    if (id) {
      super.hide(id)
      this.labelLayer.hide(id)
    } else {
      super.hide()
      this.labelLayer.hide()
    }
  }

  /**
   * @description 显示所有点
   */
  public show(): void
  /**
   * @description 根据ID显示点
   * @param id ID
   */
  public show(id: string): void
  public show(id?: string) {
    if (id) {
      super.show(id)
      this.labelLayer.show(id)
    } else {
      super.show()
      this.labelLayer.show()
    }
  }

  /**
   * @description 移除所有点
   */
  public remove(): void
  /**
   * @description 移除所有点
   * @param id 根据ID移除点
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      super.remove(id)
      this.labelLayer.remove(id)
    } else {
      super.remove()
      this.labelLayer.remove()
    }
  }

  /**
   * @description 销毁图层
   * @returns 返回`boolean`值
   */
  public destroy(): boolean {
    if (super.destroy()) {
      this.labelLayer.destroy()
      return true
    } else return false
  }
}
