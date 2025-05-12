import {
  BillboardLayer,
  EllipseLayer,
  Earth,
  PointLayer,
  PolygonLayer,
  PolylineLayer,
  RectangleLayer,
  WallLayer,
} from ".."

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
  public readonly allowDestroy = false
  public billboard: BillboardLayer
  public ellipse: EllipseLayer
  public point: PointLayer
  public polygon: PolygonLayer
  public polyline: PolylineLayer
  public rectangle: RectangleLayer
  /**
   * @deprecated 已废弃，请使用 `WallLayer` 手动初始化
   */
  public wall: WallLayer

  constructor(earth: Earth) {
    this.billboard = new BillboardLayer(earth)
    this.ellipse = new EllipseLayer(earth)
    this.point = new PointLayer(earth)
    this.polygon = new PolygonLayer(earth)
    this.polyline = new PolylineLayer(earth)
    this.rectangle = new RectangleLayer(earth)
    this.wall = new WallLayer(earth)

    this.billboard.setAllowDestroy(false)
    this.ellipse.setAllowDestroy(false)
    this.point.setAllowDestroy(false)
    this.polygon.setAllowDestroy(false)
    this.polyline.setAllowDestroy(false)
    this.rectangle.setAllowDestroy(false)
    this.wall.setAllowDestroy(false)
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
    this.wall.remove()

    this.billboard.show()
    this.ellipse.show()
    this.point.show()
    this.polygon.show()
    this.polyline.show()
    this.rectangle.show()
    this.wall.show()
  }

  /**
   * @description 强制销毁
   * @example
   * ```
   * const earth = useEarth()
   * const layers = new GraphicsLayer(earth)
   * layers.forceDestroy()
   * ```
   */
  public forceDestroy() {
    this.billboard.setAllowDestroy(true)
    this.ellipse.setAllowDestroy(true)
    this.point.setAllowDestroy(true)
    this.polygon.setAllowDestroy(true)
    this.polyline.setAllowDestroy(true)
    this.rectangle.setAllowDestroy(true)
    this.wall.setAllowDestroy(true)

    this.billboard.destroy()
    this.ellipse.destroy()
    this.point.destroy()
    this.polygon.destroy()
    this.polyline.destroy()
    this.rectangle.destroy()
    this.wall.destroy()
  }
}
