import { PinBuilder, Event, Color, VerticalOrigin, PrimitiveCollection, Billboard, Label, PointPrimitive } from "cesium"
import { Earth } from "../Earth"
import { PrimitiveCluster } from "./PrimitiveCluster"

export namespace Cluster {
  type PinNum = "single" | "pin10" | "pin50" | "pin100" | "pin200" | "pin500" | "pin999"

  /**
   * @property [single = {@link Color.VIOLET}] 单个标签颜色样式
   * @property [pin10 = {@link Color.BLUE}] `10+`标签颜色样式
   * @property [pin50 = {@link Color.GREEN}] `50+`标签颜色样式
   * @property [pin100 = {@link Color.YELLOW}] `100+`标签颜色样式
   * @property [pin200 = {@link Color.ORANGE}] `200+`标签颜色样式
   * @property [pin500 = {@link Color.ORANGERED}] `500+`标签颜色样式
   * @property [pin999 = {@link Color.RED}] `999+`标签颜色样式
   */
  export type PinStyle = { [K in PinNum]?: Color }

  /**
   * @description 自定义样式
   * @param clusteredEntities 聚合实例
   * @param cluster 聚合选项
   */
  export type CustomFunction = (
    clusteredEntities: any[],
    cluster: { billboard: Billboard; label: Label; point: PointPrimitive }
  ) => void

  /**
   * @property pixelRange 触发聚合的像素范围
   * @property minimumClusterSize 最小聚合数
   * @property [style] {@link PinStyle} 聚合样式
   * @property [customStyle] {@link CustomFunction} 自定义样式函数
   */
  export type ConstructorOptions = {
    pixelRange: number
    minimumClusterSize: number
    style?: PinStyle
    customStyle?: CustomFunction
  }
}

/**
 * @description 聚合广告牌，标签，点图层
 * @example
 * ```
 * const earth = useEarth()
 * const cluster = new Cluster(earth)
 * cluster.load(data)
 * ```
 */
export class Cluster {
  private collection: PrimitiveCollection
  private cluster: PrimitiveCluster
  private pinBuilder = new PinBuilder()
  private pin999: string
  private pin500: string
  private pin200: string
  private pin100: string
  private pin50: string
  private pin10: string
  private singlePins = new Array(8)
  private removeListener?: Event.RemoveCallback

  /**
   * @description 构造器函数
   * @param earth 地球
   * @param options {@link Cluster.ConstructorOptions} 自定义聚合参数
   */
  constructor(
    private earth: Earth,
    options: Cluster.ConstructorOptions = { pixelRange: 60, minimumClusterSize: 3 }
  ) {
    this.cluster = new PrimitiveCluster({
      enabled: true,
      pixelRange: options.pixelRange,
      minimumClusterSize: options.minimumClusterSize,
    })

    this.collection = new PrimitiveCollection()
    this.collection.add(this.cluster)
    this.earth.scene.primitives.add(this.collection)

    this.cluster.initialize(this.earth.scene)

    this.pin999 = this.pinBuilder.fromText("999+", options.style?.pin999 || Color.RED, 48).toDataURL()
    this.pin500 = this.pinBuilder.fromText("500+", options.style?.pin500 || Color.ORANGERED, 48).toDataURL()
    this.pin200 = this.pinBuilder.fromText("200+", options.style?.pin200 || Color.ORANGE, 48).toDataURL()
    this.pin100 = this.pinBuilder.fromText("100+", options.style?.pin100 || Color.YELLOW, 48).toDataURL()
    this.pin50 = this.pinBuilder.fromText("50+", options.style?.pin50 || Color.GREEN, 48).toDataURL()
    this.pin10 = this.pinBuilder.fromText("10+", options.style?.pin10 || Color.BLUE, 48).toDataURL()

    for (let i = 0; i < this.singlePins.length; i++) {
      this.singlePins[i] = this.pinBuilder.fromText(`${i + 2}`, options.style?.single || Color.VIOLET, 48).toDataURL()
    }

    this.setStyle(options.customStyle)
  }

  /**
   * @description 设置自定义样式
   * @param callback {@link Cluster.CustomFunction} 自定义样式函数
   */
  public setStyle(callback?: Cluster.CustomFunction) {
    this.removeListener?.()
    if (callback) {
      this.removeListener = this.cluster.clusterEvent.addEventListener(callback)
    } else {
      this.removeListener = this.cluster.clusterEvent.addEventListener((clusteredEntities, cluster) => {
        cluster.label.show = false
        cluster.billboard.show = true
        cluster.billboard.id = cluster.label.id
        cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM

        if (clusteredEntities.length >= 999) {
          cluster.billboard.image = this.pin999
        } else if (clusteredEntities.length >= 500) {
          cluster.billboard.image = this.pin500
        } else if (clusteredEntities.length >= 200) {
          cluster.billboard.image = this.pin200
        } else if (clusteredEntities.length >= 100) {
          cluster.billboard.image = this.pin100
        } else if (clusteredEntities.length >= 50) {
          cluster.billboard.image = this.pin50
        } else if (clusteredEntities.length >= 10) {
          cluster.billboard.image = this.pin10
        } else {
          cluster.billboard.image = this.singlePins[clusteredEntities.length - 2]
        }
      })
    }
  }

  /**
   * @description 加载数据
   * @param data 数据
   */
  public load(
    data: {
      billboard?: Billboard.ConstructorOptions
      label?: Label.ConstructorOptions
      point?: PointPrimitive
    }[]
  ) {
    for (let index = 0; index < data.length - 1; index++) {
      const d = data[index]
      if (d.billboard) this.cluster.billboardCollection.add(d.billboard)
      if (d.label) this.cluster.labelCollection.add(d.label)
      if (d.point) this.cluster.pointCollection.add(d.point)
    }
  }

  /**
   * @description 是否启用聚合，初始时是启用的
   */
  public enable = (status: boolean) => {
    this.cluster.enabled = status
  }

  /**
   * @description 清空数据
   */
  public clear() {
    this.cluster.billboardCollection.removeAll()
    this.cluster.labelCollection.removeAll()
    this.cluster.pointCollection.removeAll()
  }

  /**
   * @description 销毁
   */
  public destroy() {
    this.removeListener?.()
    this.earth.scene.primitives.remove(this.collection)
  }
}
