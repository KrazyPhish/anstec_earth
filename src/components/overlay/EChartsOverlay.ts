import { init, type EChartsOption, type ECharts } from "echarts"
import { Utils } from "utils"
import type { Scene, Viewer } from "cesium"
import type { Earth } from "components/Earth"

export namespace EChartsOverlay {
  /**
   * @property [id] ID
   * @property [option] {@link EChartsOption} Echarts设置
   */
  export type ConstructorOptions = {
    id?: string
    option?: EChartsOption
  }
}

/**
 * @description Echarts插件图层
 * @param earth {@link Earth} 地球实例
 * @param param {@link EChartsOverlay.ConstructorOptions} 参数
 * @example
 * ```
 * const earth = useEarth()
 * const overlay = EchartsOverlay(earth, { id: "echarts-map" })
 * overlay.updateOverlay(echartsOption)
 * ```
 */
export class EChartsOverlay {
  private destroyed: boolean = false
  private id: string
  private viewer: Viewer
  private scene: Scene
  private container?: HTMLElement
  private overlay?: ECharts

  constructor(earth: Earth, options: EChartsOverlay.ConstructorOptions) {
    this.id = options.id ?? Utils.RandomUUID()
    this.viewer = earth.viewer
    this.scene = earth.scene
    this.overlay = this.createChartOverlay()
    if (options.option) this.updateOverlay(options.option)
  }

  private createChartOverlay() {
    this.scene.canvas.setAttribute("tabIndex", "0")
    const offset = this.scene.canvas.getBoundingClientRect()
    const echartDom = document.createElement("div")
    echartDom.style.position = "absolute"
    echartDom.style.top = `${offset.top}px`
    echartDom.style.left = `${offset.left}px`
    echartDom.style.width = `${this.scene.canvas.width}px`
    echartDom.style.height = `${this.scene.canvas.height}px`
    echartDom.style.pointerEvents = "none"
    echartDom.style.pointerEvents = "none"
    echartDom.setAttribute("id", this.id)
    echartDom.setAttribute("class", "echarts-overlay")
    this.viewer.container.appendChild(echartDom)
    this.container = echartDom
    return init(echartDom)
  }

  /**
   * @description 加载Echarts设置
   * @param option {@link EChartsOption} Echarts设置
   */
  public updateOverlay(option: EChartsOption) {
    if (!this.overlay) return
    this.overlay.setOption(option)
  }

  /**
   * @description 获取视图
   * @returns 视图
   */
  public getEarthMap() {
    return this.viewer
  }

  /**
   * @description 获取Echarts实例
   * @returns Echarts实例
   */
  public getOverlay() {
    return this.overlay
  }

  /**
   * @description 显示
   */
  public show() {
    if (!this.container) return
    this.container.style.visibility = "visible"
  }

  /**
   * @description 隐藏
   */
  public hide() {
    if (!this.container) return
    this.container.style.visibility = "hidden"
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
    if (this.container) {
      this.viewer.container.removeChild(this.container)
      this.container = undefined
    }
    if (this.overlay) {
      this.overlay.dispose()
      this.overlay = undefined
    }
  }
}
