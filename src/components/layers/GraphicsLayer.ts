import {
  BillboardLayer,
  EllipseLayer,
  PointLayer,
  PolygonLayer,
  PolylineLayer,
  RectangleLayer,
} from "components/layers"
import type { Earth } from "components/Earth"

/**
 * @description 默认提供图形类
 * @example
 * ```
 * const earth = useEarth()
 * const layers = new GraphicsLayer(earth)
 * //or
 * const layers = earth.useDefaultLayers()
 * ```
 */
export class GraphicsLayer {
  private destroyed: boolean = false
  public billboard: BillboardLayer
  public ellipse: EllipseLayer
  public point: PointLayer
  public polygon: PolygonLayer
  public polyline: PolylineLayer
  public rectangle: RectangleLayer

  constructor(earth: Earth) {
    this.billboard = new BillboardLayer(earth)
    this.ellipse = new EllipseLayer(earth)
    this.point = new PointLayer(earth)
    this.polygon = new PolygonLayer(earth)
    this.polyline = new PolylineLayer(earth)
    this.rectangle = new RectangleLayer(earth)
  }

  /**
   * @description 重置图层
   * @example
   * ```
   * const earth = useEarth()
   * const layers = new GraphicsLayer(earth)
   * layers.reset()
   * ```
   */
  public reset() {
    this.billboard.remove()
    this.ellipse.remove()
    this.point.remove()
    this.polygon.remove()
    this.polyline.remove()
    this.rectangle.remove()

    this.billboard.show()
    this.ellipse.show()
    this.point.show()
    this.polygon.show()
    this.polyline.show()
    this.rectangle.show()
  }

  /**
   * @description 获取销毁状态
   */
  public isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * @description 销毁
   */
  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.billboard.destroy()
    this.ellipse.destroy()
    this.point.destroy()
    this.polygon.destroy()
    this.polyline.destroy()
    this.rectangle.destroy()
  }
}
