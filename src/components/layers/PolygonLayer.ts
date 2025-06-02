import {
  ArcType,
  Cartesian3,
  ClassificationType,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  GroundPrimitive,
  HorizontalOrigin,
  LabelStyle,
  PerInstanceColorAppearance,
  PolygonGeometry,
  Primitive,
  PrimitiveCollection,
  VerticalOrigin,
} from "cesium"
import { Geographic } from "components/coordinate"
import { Earth } from "components/Earth"
import { Utils, Figure } from "utils"
import { LabelLayer } from "./LabelLayer"
import { Layer } from "./Layer"
import { PolylineLayer } from "./PolylineLayer"

export namespace PolygonLayer {
  export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

  export type OutlineAddParam<T> = Pick<PolylineLayer.AddParam<T>, "materialType" | "materialUniforms" | "width">

  /**
   * @extends Layer.AddParam {@link Layer.AddParam}
   * @property positions {@link Cartesian3} 位置
   * @property [height] 高度
   * @property [color = {@link Color.RED}] 填充色
   * @property [usePointHeight = false] 多边形顶点使用其自身高度
   * @property [ground = false] 是否贴地
   * @property [arcType = {@link ArcType.GEODESIC}] 线段弧度类型，贴地时无效
   * @property [outline] {@link OutlineAddParam} 轮廓线
   * @property [label] {@link LabelAddParam} 对应标签
   */
  export type AddParam<T> = Layer.AddParam<T> & {
    positions: Cartesian3[]
    height?: number
    color?: Color
    usePointHeight?: boolean
    ground?: boolean
    arcType?: ArcType
    outline?: OutlineAddParam<T>
    label?: LabelAddParam<T>
  }
}

/**
 * @description 多边形图层
 * @extends Layer {@link Layer} 图层基类
 * @param earth {@link Earth} 地球实例
 * @example
 * ```
 * const earth = useEarth()
 * const polygonLayer = new PolygonLayer(earth)
 * //or
 * const polygonLayer = earth.useDefaultLayers().polygon
 * ```
 */
export class PolygonLayer<T = unknown> extends Layer<PrimitiveCollection, Primitive | GroundPrimitive, Layer.Data<T>> {
  public labelLayer: LabelLayer<T>
  private outlineLayer: PolylineLayer<T>

  constructor(earth: Earth) {
    super(earth, new PrimitiveCollection())
    this.labelLayer = new LabelLayer(earth)
    this.outlineLayer = new PolylineLayer(earth)
  }

  private getDefaultOption(param: PolygonLayer.AddParam<T>) {
    const option = {
      polygon: {
        id: param.id ?? Utils.RandomUUID(),
        positions: param.positions,
        height: param.usePointHeight ? undefined : param.height,
        color: param.color ?? Color.PURPLE.withAlpha(0.4),
        usePointHeight: param.usePointHeight ?? false,
        ground: param.ground ?? false,
        show: param.show ?? true,
        arcType: param.arcType ?? ArcType.GEODESIC,
      },
      outline: param.outline
        ? {
            width: param.outline?.width ?? 2,
            materialType: param.outline?.materialType ?? "Color",
            materialUniforms: param.outline?.materialUniforms ?? { color: Color.PURPLE },
          }
        : undefined,
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
   * @description 新增多边形
   * @param param {@link PolygonLayer.AddParam} 多边形参数
   * @example
   * ```
   * const earth = useEarth()
   * const polygonLayer = new PolygonLayer(earth)
   * polygonLayer.add({
   *  positions: [
   *    Cartesian3.fromDegrees(104, 31, 200),
   *    Cartesian3.fromDegrees(105, 31, 300),
   *    Cartesian3.fromDegrees(104, 32, 500),
   *  ],
   *  color: Color.RED,
   *  usePointHeight: true,
   *  ground: false,
   * })
   * ```
   */
  public add(param: PolygonLayer.AddParam<T>) {
    const { polygon, outline, label } = this.getDefaultOption(param)

    const geometry = polygon.ground
      ? PolygonGeometry.fromPositions({
          arcType: polygon.arcType,
          positions: polygon.positions,
          vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
        })
      : PolygonGeometry.fromPositions({
          arcType: polygon.arcType,
          positions: polygon.positions,
          height: polygon.height,
          vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
          perPositionHeight: polygon.usePointHeight,
        })

    const instance = new GeometryInstance({
      id: Utils.EncodeId(polygon.id, param.module),
      geometry,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(polygon.color),
      },
    })

    const primitive = polygon.ground
      ? new GroundPrimitive({
          geometryInstances: instance,
          appearance: new PerInstanceColorAppearance(),
          classificationType: ClassificationType.TERRAIN,
        })
      : new Primitive({
          geometryInstances: instance,
          appearance: new PerInstanceColorAppearance(),
        })

    if (outline) {
      const { materialType, materialUniforms, width } = outline
      if (polygon.usePointHeight) {
        this.outlineLayer.add({
          id: polygon.id,
          module: param.module,
          data: param.data,
          arcType: param.arcType,
          lines: [polygon.positions],
          loop: true,
          ground: false,
          materialType,
          materialUniforms,
          width,
        })
      } else {
        const positions = polygon.positions.map((p) => p.clone())
        this.outlineLayer.add({
          id: polygon.id,
          module: param.module,
          data: param.data,
          arcType: param.arcType,
          lines: [positions],
          loop: true,
          ground: polygon.ground,
          materialType,
          materialUniforms,
          width,
        })
      }
    }

    if (label) {
      const geos = polygon.positions.map((p) => Geographic.fromCartesian(p))
      const { longitude, latitude } = Figure.CalcMassCenter(geos.concat(geos[0].clone()))!
      this.labelLayer.add({
        id: polygon.id,
        position: Cartesian3.fromDegrees(longitude, latitude, polygon.height),
        ...label,
      })
    }

    super.save(polygon.id, { primitive, data: { module: param.module, data: param.data } })
  }

  //TODO set 方法

  /**
   * @description 根据ID获取多边形外边框实体
   * @param id ID
   * @returns 外边框实体
   */
  public getOutlineEntity(id: string) {
    return this.outlineLayer.getEntity(id)
  }

  /**
   * @description 隐藏所有多边形
   */
  public hide(): void
  /**
   * @description 隐藏所有多边形
   * @param id 根据ID隐藏多边形
   */
  public hide(id: string): void
  public hide(id?: string) {
    if (id) {
      super.hide(id)
      this.outlineLayer.hide(id)
      this.labelLayer.hide(id)
    } else {
      super.hide()
      this.outlineLayer.hide()
      this.labelLayer.hide()
    }
  }

  /**
   * @description 显示所有多边形
   */
  public show(): void
  /**
   * @description 显示所有多边形
   * @param id 根据ID显示多边形
   */
  public show(id: string): void
  public show(id?: string) {
    if (id) {
      super.show(id)
      this.outlineLayer.show(id)
      this.labelLayer.show(id)
    } else {
      super.show()
      this.outlineLayer.show()
      this.labelLayer.show()
    }
  }

  /**
   * @description 移除所有多边形
   */
  public remove(): void
  /**
   * @description 根据ID移除多边形
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      super.remove(id)
      this.outlineLayer.remove(id)
      this.labelLayer.remove(id)
    } else {
      super.remove()
      this.outlineLayer.remove()
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
      this.outlineLayer.destroy()
      return true
    } else return false
  }
}
