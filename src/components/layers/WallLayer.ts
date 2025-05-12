import {
  Cartesian3,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  PerInstanceColorAppearance,
  Primitive,
  PrimitiveCollection,
  WallGeometry,
  WallOutlineGeometry,
} from "cesium"
import { Earth } from "components/Earth"
import { Utils } from "utils"
import { Layer } from "./Layer"

export namespace WallLayer {
  /**
   * @extends Layer.AddParam {@link Layer.AddParam}
   * @property positions {@link Cartesian3} 位置
   * @property [maximumHeights = 5000] 最大高度
   * @property [minimumHeights = 0] 最小高度
   * @property [color = {@link Color.LAWNGREEN}] 填充色
   * @property [outline = true] 是否渲染边框
   * @property [outlineColor = {@link Color.WHITESMOKE}] 边框色
   * @property [outlineWidth = 1] 边框宽度
   */
  export type AddParam<T> = Layer.AddParam<T> & {
    positions: Cartesian3[]
    maximumHeights?: number[]
    minimumHeights?: number[]
    color?: Color
    outline?: boolean
    outlineColor?: Color
    outlineWidth?: number
  }
}

/**
 * @description 墙体图层
 * @extends Layer {@link Layer} 图层基类
 * @param earth {@link Earth} 地球实例
 * @example
 * ```
 * const earth = useEarth()
 * const wallLayer = new WallLayer(earth)
 * //or
 * const wallLayer = earth.useDefaultLayers().wall
 * ```
 */
export class WallLayer<T = unknown> extends Layer<PrimitiveCollection, Primitive, Layer.Data<T>> {
  constructor(earth: Earth) {
    super(earth, new PrimitiveCollection())
  }

  private getDefaultOption({
    id = Utils.RandomUUID(),
    color = Color.LAWNGREEN.withAlpha(0.5),
    outline = true,
    outlineColor = Color.WHITESMOKE.withAlpha(0.8),
    outlineWidth = 1,
    show = true,
    positions,
    maximumHeights,
    minimumHeights,
  }: WallLayer.AddParam<T>) {
    const length = positions.length
    const option = {
      id,
      color,
      positions,
      outline,
      outlineColor,
      outlineWidth,
      show,
      maximumHeights: maximumHeights ?? new Array(length).fill(5000),
      minimumHeights: minimumHeights ?? new Array(length).fill(0),
    }
    return option
  }

  /**
   * @description 新增墙体
   * @param param {@link WallLayer.AddParam} 墙体参数
   * @example
   * ```
   * const earth = useEarth()
   * const wallLayer = new WallLayer(earth)
   * wallLayer.add({
   *  positions: [
   *    Cartesian3.fromDegrees(104, 31),
   *    Cartesian3.fromDegrees(105, 31),
   *    Cartesian3.fromDegrees(104, 32),
   *  ],
   *  maximumHeights: [5000, 5000, 5000],
   *  minimumHeights: [0, 0, 0],
   *  color: Color.RED,
   *  outline: false,
   * })
   * ```
   */
  public add(param: WallLayer.AddParam<T>) {
    const { data, module } = param
    const { id, color, outline, outlineColor, outlineWidth, positions, maximumHeights, minimumHeights, show } =
      this.getDefaultOption(param)

    const wall = new GeometryInstance({
      id: Utils.EncodeId(id, module),
      geometry: new WallGeometry({
        positions,
        maximumHeights,
        minimumHeights,
        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(color),
      },
    })

    const primitive = new Primitive({
      show,
      geometryInstances: wall,
      appearance: new PerInstanceColorAppearance(),
    })

    super.save(id, { primitive, data: { data, module } })

    if (outline) {
      const out = new GeometryInstance({
        geometry: new WallOutlineGeometry({
          positions,
          maximumHeights,
          minimumHeights,
        }),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(outlineColor),
        },
      })

      const outPrimitive = new Primitive({
        show,
        geometryInstances: out,
        appearance: new PerInstanceColorAppearance({
          flat: true,
          renderState: {
            lineWidth: outlineWidth,
          },
        }),
      })

      super.save(id + "_outline", { primitive: outPrimitive, data: { data, module } })
    }
  }

  /**
   * @description 隐藏所有墙体
   */
  public hide(): void
  /**
   * @description 隐藏所有墙体
   * @param id 根据ID隐藏墙体
   */
  public hide(id: string): void
  public hide(id?: string) {
    if (id) {
      super.hide(id)
      super.hide(id + "_outline")
    } else {
      super.hide()
    }
  }

  /**
   * @description 显示所有墙体
   */
  public show(): void
  /**
   * @description 显示所有墙体
   * @param id 根据ID显示墙体
   */
  public show(id: string): void
  public show(id?: string) {
    if (id) {
      super.show(id)
      super.show(id + "_outline")
    } else {
      super.show()
    }
  }

  /**
   * @description 移除所有墙体
   */
  public remove(): void
  /**
   * @description 根据ID移除墙体
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      super.remove(id)
      super.remove(id + "_outline")
    } else {
      super.remove()
    }
  }
}
