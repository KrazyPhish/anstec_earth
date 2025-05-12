import {
  Math,
  WebMercatorProjection,
  Entity,
  ImageryLayer,
  Rectangle,
  Cartesian3,
  Cartographic,
  SingleTileImageryProvider,
  WebMercatorTilingScheme,
  Cartesian2,
} from "cesium"
import { H337 } from "./H337"
import { Earth } from "../Earth"
import { Utils } from "../../utils"

type IRectangle = {
  north: number
  east: number
  south: number
  west: number
}

export namespace Heatmap {
  /**
   * @property [x] x
   * @property [y] y
   * @property [value = 1] 值
   * @property [radius] 有效范围
   */
  export type Point = {
    x: number
    y: number
    value?: number
    radius?: number
  }

  /**
   * @property [min] 最小值
   * @property [max] 最大值
   * @property [data] {@link Point} 数据
   */
  export type Data = {
    min: number
    max: number
    data: Point[]
  }

  /**
   * @description 热力图构造参数
   * @property [radius = 60] 半径
   * @property [spacingFactor = 1.5] 间距因子
   * @property [maxOpacity = 0.8] 最大透明度
   * @property [minOpacity = 0.1] 最小透明度
   * @property [blur = 0.85] 模糊
   * @property [gradient] 颜色梯度
   * @property [minCanvasSize = 40000] 画布的最小尺寸`px`
   * @property [maxCanvasSize = 4000000] 画布的最大尺寸`px`
   * @property [minScaleDenominator = 700] 最小比例尺
   * @property [maxScaleDenominator = 2000] 最大比例尺
   */
  export type ConstructorOptions = {
    radius: number
    spacingFactor: number
    maxOpacity: number
    minOpacity: number
    blur: number
    gradient: { [key: string]: string }
    minCanvasSize: number
    maxCanvasSize: number
    minScaleDenominator: number
    maxScaleDenominator: number
  }
}

const { PI, abs, floor, max, round } = window.Math

/**
 * @description 热力图
 * @example
 * ```
 * const earth = useEarth()
 * const heatmap = new Heatmap(earth)
 * heatmap.render(data)
 * ```
 */
export class Heatmap {
  public id = Utils.RandomUUID()
  private defaults: Required<Heatmap.ConstructorOptions> = {
    minCanvasSize: 700,
    maxCanvasSize: 2000,
    radius: 60,
    spacingFactor: 1.5,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    blur: 0.85,
    gradient: {
      "0.30": "rgb(0,0,255)",
      "0.50": "rgb(0,255,0)",
      "0.70": "rgb(255,255,0)",
      "0.95": "rgb(255,0,0)",
    },
    minScaleDenominator: 40000,
    maxScaleDenominator: 4000000,
  }
  private WMP: WebMercatorProjection

  private _layer?: Entity | ImageryLayer

  private dom: HTMLDivElement

  private _heatmap?: H337

  private width = 0
  private height = 0
  private _factor = 1
  private _spacing = 0
  private _xoffset = 0
  private _yoffset = 0
  private _container?: HTMLDivElement
  private bounds: IRectangle = { north: 0, east: 0, south: 0, west: 0 }
  private _mbounds: IRectangle = { north: 0, east: 0, south: 0, west: 0 }
  private _thresholdCameraHeight = 50
  private _minBB = 20

  /**
   * @description 最终的矩形边界框
   */
  private _rectangle?: Rectangle
  private data?: Heatmap.Data
  private cameraHeight = 0
  private lastCameraRealHeight = 0
  private moveEndEvent?: () => void
  /**
   * @description 传入的热力点尺寸
   */
  private rawData: Heatmap.Data = { min: 0, max: 0, data: [] }
  private additiveCameraHeight = 0

  constructor(
    private earth: Earth,
    private options: Heatmap.ConstructorOptions
  ) {
    this.dom = document.createElement("div")
    document.body.appendChild(this.dom)
    this.WMP = new WebMercatorProjection()
    this.watchEvent()
  }

  /**
   * @description 将WGS84边界框转换为墨卡托边界框
   * @param bb WGS84边界框bounding box，例如{北，东，南，西}
   * @return 矩形边界
   */
  private wgs84ToMercatorBB(bb: Rectangle): IRectangle {
    const sw = this.WMP.project(Cartographic.fromDegrees(bb.west, bb.south))
    const ne = this.WMP.project(Cartographic.fromDegrees(bb.east, bb.north))
    return {
      north: ne.y,
      east: ne.x,
      south: sw.y,
      west: sw.x,
    }
  }

  private rad2deg(r: number) {
    const d = r / (PI / 180.0)
    return d
  }

  /**
   * @description 将墨卡托定界框转换为WGS84定界框
   * @param mbb 墨卡托边界框
   * @return 矩形边界
   */
  private mercatorToWgs84BB(mbb: IRectangle) {
    const sw = this.WMP.unproject(new Cartesian3(mbb.west, mbb.south))
    const ne = this.WMP.unproject(new Cartesian3(mbb.east, mbb.north))
    return {
      north: this.rad2deg(ne.latitude),
      east: this.rad2deg(ne.longitude),
      south: this.rad2deg(sw.latitude),
      west: this.rad2deg(sw.longitude),
    }
  }

  /**
   * @description 计算宽高
   * @param mbb 墨卡托边界框
   */
  private setWidthAndHeight(mbb: IRectangle) {
    this.width = mbb.east > 0 && mbb.west < 0 ? mbb.east + abs(mbb.west) : abs(mbb.east - mbb.west)
    this.height = mbb.north > 0 && mbb.south < 0 ? mbb.north + abs(mbb.south) : abs(mbb.north - mbb.south)
    this._factor = 1

    if (this.width > this.height && this.width > this.defaults.maxCanvasSize) {
      this._factor = this.width / this.defaults.maxCanvasSize

      if (this.height / this._factor < this.defaults.minCanvasSize) {
        this._factor = this.height / this.defaults.minCanvasSize
      }
    } else if (this.height > this.width && this.height > this.defaults.maxCanvasSize) {
      this._factor = this.height / this.defaults.maxCanvasSize

      if (this.width / this._factor < this.defaults.minCanvasSize) {
        this._factor = this.width / this.defaults.minCanvasSize
      }
    } else if (this.width < this.height && this.width < this.defaults.minCanvasSize) {
      this._factor = this.width / this.defaults.minCanvasSize

      if (this.height / this._factor > this.defaults.maxCanvasSize) {
        this._factor = this.height / this.defaults.maxCanvasSize
      }
    } else if (this.height < this.width && this.height < this.defaults.minCanvasSize) {
      this._factor = this.height / this.defaults.minCanvasSize

      if (this.width / this._factor > this.defaults.maxCanvasSize) {
        this._factor = this.width / this.defaults.maxCanvasSize
      }
    }

    this.width = this.width / this._factor
    this.height = this.height / this._factor
  }

  /**
   * @description 获取容器DOM
   * @param width
   * @param height
   * @param id
   * @return 容器
   */
  private getContainer(width: number, height: number, id: string) {
    this.dom.childNodes.forEach((c) => c.remove())
    if (id) {
      this.dom.setAttribute("id", id)
    }
    this.dom.setAttribute("style", `width: ${width}px; height: ${height}px; margin: 0px; display: none;`)
    return this.dom
  }

  /**
   * @description 获取影像Provider
   * @return 影像Provider
   */
  private getImageryProvider() {
    if (!this._heatmap) return
    const d = this._heatmap.getDataURL()
    const imgprov: any = new SingleTileImageryProvider({
      url: d,
      tileWidth: this.width,
      tileHeight: this.height,
      rectangle: this._rectangle,
    })

    imgprov._tilingScheme = new WebMercatorTilingScheme({
      rectangleSouthwestInMeters: new Cartesian2(this._mbounds.west, this._mbounds.south),
      rectangleNortheastInMeters: new Cartesian2(this._mbounds.east, this._mbounds.north),
    })

    return new ImageryLayer(imgprov, {})
  }

  /**
   * @description 将墨卡托位置转换为相应的热图位置
   * @param p
   * @return 点数据
   */
  private mercatorPointToHeatmapPoint(p: Cartesian3) {
    const pn: Heatmap.Point = { x: 0, y: 0, value: 0 }

    pn.x = round((p.x - this._xoffset) / this._factor + this._spacing)
    pn.y = round((p.y - this._yoffset) / this._factor + this._spacing)
    pn.y = this.height - pn.y

    return pn
  }

  /**
   * @description 将WGS84位置转换为墨卡托位置
   * @param p
   * @return 点坐标
   */
  private wgs84ToMercator(p: Heatmap.Point) {
    return this.WMP.project(Cartographic.fromDegrees(p.x, p.y))
  }

  /**
   * @description 将WGS84位置转换为相应的热图位置
   * @param {Cartesian3} p
   * @return {*}
   */
  private wgs84PointToHeatmapPoint(p: Heatmap.Point) {
    return this.mercatorPointToHeatmapPoint(this.wgs84ToMercator(p))
  }

  /**
   * @description 计算定界框
   * @param bb
   */
  private calcBoundingBox(bb: Rectangle) {
    this._mbounds = this.wgs84ToMercatorBB(bb)
    this.options.gradient = this.options.gradient ? this.options.gradient : this.defaults.gradient
    this.options.maxOpacity = this.options.maxOpacity !== undefined ? this.options.maxOpacity : this.defaults.maxOpacity
    this.options.minOpacity = this.options.minOpacity !== undefined ? this.options.minOpacity : this.defaults.minOpacity
    this.options.blur = this.options.blur !== undefined ? this.options.blur : this.defaults.blur

    this.setWidthAndHeight(this._mbounds)
    this.options.radius = round(
      this.options.radius
        ? this.options.radius
        : this.width > this.height
          ? this.width / this.defaults.radius
          : this.height / this.defaults.radius
    )
    this._spacing = this.options.radius * this.defaults.spacingFactor
    this._xoffset = this._mbounds.west
    this._yoffset = this._mbounds.south

    this.width = round(this.width + this._spacing * 2)
    this.height = round(this.height + this._spacing * 2)

    this._mbounds.west -= this._spacing * this._factor
    this._mbounds.east += this._spacing * this._factor
    this._mbounds.south -= this._spacing * this._factor
    this._mbounds.north += this._spacing * this._factor

    this.bounds = this.mercatorToWgs84BB(this._mbounds)

    this._rectangle = Rectangle.fromDegrees(this.bounds.west, this.bounds.south, this.bounds.east, this.bounds.north)
    this._container = this.getContainer(this.width, this.height, this.id)
    const config: H337.ConstructorOptions = {
      container: this._container,
      gradient: this.options.gradient,
      maxOpacity: this.options.maxOpacity,
      minOpacity: this.options.minOpacity,
      blur: this.options.blur,
    }

    this._heatmap = new H337(config)
    this._container.children[0].setAttribute("id", this.id + "-hm")
  }

  /**
   * @description 更新（重新）绘制热图
   */
  private updateLayer() {
    // only works with a Viewer instance since the cesiumWidget
    // instance doesn't contain an entities property
    if (!this._heatmap) return
    if (this._layer instanceof ImageryLayer) {
      this.earth.scene.imageryLayers.remove(this._layer)
    }
    const imageProvider = this.getImageryProvider()
    if (imageProvider) {
      this.earth.scene.imageryLayers.add(imageProvider)
      this._layer = imageProvider
    }
  }

  /**
   * @description 设置热图位置数据
   * @param data
   * @return `boolean`
   */
  private setData({ data }: { data: Heatmap.Data }) {
    if (!this._heatmap || !data) return false
    this.data = data
    this.calcRadius()
    this.refresh()
    this.updateLayer()
    return true
  }
  /**
   * @description 获取热力图点的大小
   * @param {*}
   * @return {*}
   */
  private getRadius() {
    return max((this.cameraHeight / 30000) * 0.5, 40)
  }

  private calcRadius() {
    const radius = this.getRadius()
    if (this.data && this._heatmap) {
      this.data.data.forEach((item, index) => {
        item.radius = this.rawData.data[index].radius || radius
      })
    }
  }

  private refresh() {
    if (!this._heatmap) return
    this._heatmap.setData(this.data)
  }

  private moveEnd() {
    if (!this._layer?.show) return
    let needUpdate = false
    let cameraHeight = this.earth.camera.positionCartographic.height

    if (abs(this.lastCameraRealHeight - cameraHeight) + this.additiveCameraHeight > this._thresholdCameraHeight) {
      needUpdate = true
      this.additiveCameraHeight = 0
    } else {
      this.additiveCameraHeight += abs(this.lastCameraRealHeight - cameraHeight)
    }

    this.lastCameraRealHeight = cameraHeight

    if (this.earth.camera.positionCartographic.height < this.defaults.minScaleDenominator) {
      cameraHeight = this.defaults.minScaleDenominator
    }
    if (this.earth.camera.positionCartographic.height > this.defaults.maxScaleDenominator) {
      cameraHeight = this.defaults.maxScaleDenominator
    }
    this.cameraHeight = cameraHeight
    if (needUpdate) {
      //计算在当前视锥下有的热力图点，重新计算包围盒
      const rect = this.earth.camera.computeViewRectangle() as Rectangle
      const inRectPoints: Heatmap.Point[] = []
      for (let i = 0; i < this.rawData.data.length; i++) {
        const data = this.rawData.data[i]
        if (Rectangle.contains(rect, Cartographic.fromDegrees(data.x, data.y))) {
          inRectPoints.push(data)
        }
      }
      if (inRectPoints.length > 0) {
        const bbRect = this.getBBRect(inRectPoints)
        const data = {
          min: this.rawData.min,
          max: this.rawData.max,
          data: inRectPoints,
        }
        this.setWGS84Data({
          data,
          rect: new Rectangle(
            Math.toDegrees(bbRect.west),
            Math.toDegrees(bbRect.south),
            Math.toDegrees(bbRect.east),
            Math.toDegrees(bbRect.north)
          ),
        })
      }
    }
  }

  /**
   * @description 监听地球的缩放
   * @return 视角矩形边界
   */
  private watchEvent() {
    this.moveEndEvent = this.earth.camera.moveEnd.addEventListener(() => {
      this.moveEnd()
    })
  }
  /**
   * @description 根据传入的点集合获取包围盒矩形
   * @return {*}
   */
  private getBBRect(data: Heatmap.Point[]) {
    if (!data.length) return new Rectangle(0, 0, 0, 0)
    const cartoArr: Cartographic[] = []
    let [maxLgd, maxLat, minLgd, minLat] = [0, 0, 0, 0]
    if (data.length === 1) {
      ;[maxLgd, minLgd, maxLat, minLat] = [data[0].x, data[0].x, data[0].y, data[0].y]
    } else {
      data.sort((a, b) => a.x - b.x)
      ;[maxLgd, minLgd] = [data[data.length - 1].x, data[0].x]

      data.sort((a, b) => a.y - b.y)
      ;[maxLat, minLat] = [data[data.length - 1].y, data[0].y]
    }
    //判断如果这个包围盒范围过小，就多扩大一点
    if ((maxLgd - minLgd < this._minBB || maxLat - minLat < this._minBB) && this.cameraHeight > 100000) {
      const diffLgd = maxLgd - minLgd < this._minBB ? this._minBB - floor(maxLgd - minLgd) : 2
      const diffLat = maxLat - minLat < this._minBB ? this._minBB - floor(maxLat - minLat) : 2
      ;[maxLgd, minLgd, maxLat, minLat] = [
        maxLgd + diffLgd / 2,
        minLgd - diffLgd / 2,
        maxLat + diffLat / 2,
        minLat - diffLat / 2,
      ]
    } else {
      ;[maxLgd, minLgd, maxLat, minLat] = [++maxLgd, --minLgd, ++maxLat, --minLat]
    }
    cartoArr.push(Cartographic.fromDegrees(maxLgd, maxLat), Cartographic.fromDegrees(minLgd, minLat))
    return Rectangle.fromCartographicArray(cartoArr)
  }

  /**
   * @description 设置WGS84位置的数据
   * @param param 数据
   * @return `boolean`
   */
  public setWGS84Data({ data, rect }: { data: Heatmap.Data; rect: Rectangle }) {
    this.calcBoundingBox(rect)
    const convdata: Heatmap.Point[] = []
    for (let i = 0; i < data.data.length; i++) {
      const gp = data.data[i]
      const hp = this.wgs84PointToHeatmapPoint(gp)
      if (gp.value || gp.value === 0) {
        hp.value = gp.value
      }
      convdata.push(hp)
    }
    return this.setData({
      data: { min: data.min, max: data.max, data: convdata },
    })
  }

  /**
   * @description 渲染热力图
   * @param data {@link Heatmap.Data} 数据
   */
  public render(data: Heatmap.Data) {
    this.rawData = data
    if (!data.data) return
    const rect = this.getBBRect(data.data)
    this.setWGS84Data({
      data,
      rect: new Rectangle(
        Math.toDegrees(rect.west),
        Math.toDegrees(rect.south),
        Math.toDegrees(rect.east),
        Math.toDegrees(rect.north)
      ),
    })
    this.moveEnd()
  }

  /**
   * @description 设置是否在地图上显示热图
   * @param value
   */
  public show(value: boolean) {
    if (this._layer) {
      this._layer.show = value
    }
  }

  /**
   * @description 移除地图上的热图
   */
  public remove() {
    this.moveEndEvent && this.earth.camera.moveEnd.removeEventListener(this.moveEndEvent)
    if (this._layer && this._layer instanceof Entity) {
      this.earth.viewer.entities.remove(this._layer)
    }
  }

  /**
   * @description 销毁热图
   */
  public destory() {
    this.remove()
    this.dom.remove()
  }
}
