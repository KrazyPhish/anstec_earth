import {
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  NearFarScalar,
  PointPrimitive,
  PointPrimitiveCollection,
} from "cesium"
import { Earth } from "components/Earth"
import { Utils } from "utils"
import { Layer } from "./Layer"

export namespace PointLayer {
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
  }

  export type SetParam<T> = Partial<Omit<AddParam<T>, "id" | "module" | "data">>
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
  //TODO 增加标签选项
  constructor(earth: Earth) {
    super(earth, new PointPrimitiveCollection())
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
    const point = this.getEntity(id)?.primitive
    if (point) {
      Object.assign(point, param)
    }
  }
}
