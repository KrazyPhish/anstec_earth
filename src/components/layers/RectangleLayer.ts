import {
  Cartesian3,
  ClassificationType,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  GroundPrimitive,
  HorizontalOrigin,
  LabelStyle,
  PerInstanceColorAppearance,
  Primitive,
  PrimitiveCollection,
  Rectangle,
  RectangleGeometry,
  VerticalOrigin,
} from "cesium"
import { Earth } from "components/Earth"
import { Utils } from "utils"
import { LabelLayer } from "./LabelLayer"
import { Layer } from "./Layer"

export namespace RectangleLayer {
  export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

  /**
   * @extends Layer.AddParam {@link Layer.AddParam}
   * @property rectangle {@link Rectangle} 矩形
   * @property [height] 高度
   * @property [color = {@link Color.BLUE}] 填充色
   * @property [ground = false] 是否贴地
   * @property [label] {@link LabelAddParam} 对应标签
   */
  export type AddParam<T> = Layer.AddParam<T> & {
    rectangle: Rectangle
    height?: number
    color?: Color
    ground?: boolean
    label?: LabelAddParam<T>
  }
}

/**
 * @description 矩形图层
 * @extends Layer {@link Layer} 图层基类
 * @param earth {@link Earth} 地球实例
 * @example
 * ```
 * const earth = useEarth()
 * const rectLayer = new RectangleLayer(earth)
 * //or
 * const rectLayer = earth.useDefaultLayers().rectangle
 * ```
 */
export class RectangleLayer<T = unknown> extends Layer<
  PrimitiveCollection,
  Primitive | GroundPrimitive,
  Layer.Data<T>
> {
  public labelLayer: LabelLayer<T>

  constructor(earth: Earth) {
    super(earth, new PrimitiveCollection())
    this.labelLayer = new LabelLayer(earth)
  }

  private getDefaultOption(param: RectangleLayer.AddParam<T>) {
    const option = {
      rectangle: {
        id: param.id ?? Utils.RandomUUID(),
        rectangle: param.rectangle,
        color: param.color ?? Color.BLUE.withAlpha(0.4),
        height: param.height,
        show: param.show ?? true,
        ground: param.ground ?? false,
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
   * @description 新增矩形
   * @param param {@link RectangleLayer.AddParam} 矩形参数
   * @example
   * ```
   * const earth = useEarth()
   * const rectLayer = new RectangleLayer(earth)
   * rectLayer.add({
   *  rectangle: Rectangle.fromDegrees(104, 31, 105, 32),
   *  color: Color.RED,
   *  ground: true,
   * })
   * ```
   */
  public add(param: RectangleLayer.AddParam<T>) {
    const { rectangle, label } = this.getDefaultOption(param)

    const geometry = rectangle.ground
      ? new RectangleGeometry({
          rectangle: rectangle.rectangle,
          vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
        })
      : new RectangleGeometry({
          rectangle: rectangle.rectangle,
          height: rectangle.height,
          vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
        })

    const instance = new GeometryInstance({
      id: Utils.EncodeId(rectangle.id, param.module),
      geometry,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(rectangle.color),
      },
    })

    //TODO outline primitive, use PolylineLayer
    const primitive = rectangle.ground
      ? new GroundPrimitive({
          show: rectangle.show,
          geometryInstances: instance,
          appearance: new PerInstanceColorAppearance(),
          classificationType: ClassificationType.TERRAIN,
        })
      : new Primitive({
          show: rectangle.show,
          geometryInstances: instance,
          appearance: new PerInstanceColorAppearance(),
        })

    if (label) {
      const { west, east, north, south } = rectangle.rectangle
      const longitude = (west + east) / 2
      const latitude = (north + south) / 2
      this.labelLayer.add({
        id: rectangle.id,
        position: Cartesian3.fromRadians(longitude, latitude, rectangle.height),
        ...label,
      })
    }

    super.save(rectangle.id, { primitive, data: { data: param.data } })
  }

  /**
   * @description 隐藏所有矩形
   */
  public hide(): void
  /**
   * @description 隐藏所有矩形
   * @param id 根据ID隐藏矩形
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
   * @description 显示所有矩形
   */
  public show(): void
  /**
   * @description 显示所有矩形
   * @param id 根据ID显示矩形
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
   * @description 移除所有矩形
   */
  public remove(): void
  /**
   * @description 根据ID移除矩形
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
