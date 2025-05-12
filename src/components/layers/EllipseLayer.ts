import {
  Cartesian3,
  ClassificationType,
  Color,
  ColorGeometryInstanceAttribute,
  EllipseGeometry,
  GeometryInstance,
  GroundPrimitive,
  HorizontalOrigin,
  LabelStyle,
  PerInstanceColorAppearance,
  Primitive,
  PrimitiveCollection,
  VerticalOrigin,
} from "cesium"
import { Geographic } from "components/coordinate"
import { Earth } from "components/Earth"
import { Utils } from "utils"
import { LabelLayer } from "./LabelLayer"
import { Layer } from "./Layer"

export namespace EllipseLayer {
  export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

  /**
   * @extends Layer.AddParam {@link Layer.AddParam}
   * @property center {@link Cartesian3} 圆心
   * @property majorAxis 长半径
   * @property minorAxis 短半径
   * @property [rotation] 旋转
   * @property [height] 高度
   * @property [color = {@link Color.RED}] 填充色
   * @property [ground = false] 是否贴地
   * @property [label] {@link LabelAddParam} 对应标签
   */
  export type AddParam<T> = Layer.AddParam<T> & {
    center: Cartesian3
    majorAxis: number
    minorAxis: number
    rotation?: number
    height?: number
    color?: Color
    ground?: boolean
    label?: LabelAddParam<T>
  }
}

/**
 * @description 椭圆图层
 * @extends Layer {@link Layer} 图层基类
 * @param earth {@link Earth} 地球实例
 * @example
 * ```
 * const earth = useEarth()
 * const ellipseLayer = new EllipseLayer(earth)
 * //or
 * const ellipseLayer = earth.useDefaultLayers().ellipse
 * ```
 */
export class EllipseLayer<T = unknown> extends Layer<PrimitiveCollection, Primitive | GroundPrimitive, Layer.Data<T>> {
  public labelLayer: LabelLayer<T>

  constructor(earth: Earth) {
    super(earth, new PrimitiveCollection())
    this.labelLayer = new LabelLayer(earth)
  }

  private getDefaultOption(param: EllipseLayer.AddParam<T>) {
    const option = {
      ellipse: {
        id: param.id ?? Utils.RandomUUID(),
        show: param.show,
        center: param.center,
        majorAxis: param.majorAxis,
        minorAxis: param.minorAxis,
        rotation: param.rotation ?? 0,
        color: param.color ?? Color.RED.withAlpha(0.4),
        ground: param.ground ?? false,
        height: param.height ?? Geographic.fromCartesian(param.center).height ?? 0,
      },
      label: param.label
        ? {
            font: "16px Helvetica",
            horizontalOrigin: HorizontalOrigin.CENTER,
            verticalOrigin: VerticalOrigin.CENTER,
            fillColor: Color.RED,
            outlineColor: Color.WHITE,
            outlineWidth: 1,
            style: LabelStyle.FILL_AND_OUTLINE,
            ...param.label,
          }
        : undefined,
    }
    return option
  }

  /**
   * @description 新增椭圆
   * @param param {@link EllipseLayer.AddParam} 椭圆参数
   * @example
   * ```
   * const earth = useEarth()
   * const ellipseLayer = new EllipseLayer(earth)
   * ellipseLayer.add({
   *  center: Cartesian3.fromDegrees(104, 31),
   *  majorAxis: 5000,
   *  minorAxis: 5000,
   *  color: Color.RED,
   *  ground: true,
   * })
   * ```
   */
  public add(param: EllipseLayer.AddParam<T>) {
    const { ellipse, label } = this.getDefaultOption(param)

    const instance = new GeometryInstance({
      id: Utils.EncodeId(ellipse.id, param.module),
      geometry: new EllipseGeometry({
        center: ellipse.center,
        semiMajorAxis: ellipse.majorAxis,
        semiMinorAxis: ellipse.minorAxis,
        rotation: ellipse.rotation,
        height: ellipse.height,
        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(ellipse.color),
      },
    })

    const primitive = ellipse.ground
      ? new GroundPrimitive({
          geometryInstances: instance,
          appearance: new PerInstanceColorAppearance(),
          classificationType: ClassificationType.TERRAIN,
        })
      : new Primitive({
          geometryInstances: instance,
          appearance: new PerInstanceColorAppearance(),
        })

    if (label) {
      const { longitude, latitude } = Geographic.fromCartesian(ellipse.center)
      this.labelLayer.add({
        id: ellipse.id,
        module: param.module,
        position: Cartesian3.fromDegrees(longitude, latitude, ellipse.height),
        ...label,
      })
    }

    super.save(ellipse.id, { primitive, data: { data: param.data } })
  }

  /**
   * @description 隐藏所有椭圆
   */
  public hide(): void
  /**
   * @description 隐藏所有椭圆
   * @param id 根据ID隐藏椭圆
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
   * @description 显示所有椭圆
   */
  public show(): void
  /**
   * @description 根据ID显示椭圆
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
   * @description 移除所有椭圆
   */
  public remove(): void
  /**
   * @description 根据ID移除椭圆
   * @param id ID
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
