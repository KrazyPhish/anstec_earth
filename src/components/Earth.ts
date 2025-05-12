import {
  Camera,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Clock,
  Event,
  ImageryLayer,
  ImageryProvider,
  Math as CMath,
  Matrix4,
  Rectangle,
  Scene,
  SceneMode,
  TerrainProvider,
  Viewer,
} from "cesium"
import {
  extendComponentModel,
  extendComponentView,
  CustomSeriesRenderItemAPI,
  ComponentModel,
  graphic,
  matrix,
  registerAction,
  registerCoordinateSystem,
} from "echarts"
import { CameraTool, Utils } from "utils"
import { Coordinate } from "./coordinate"
import { Draw } from "./draw"
import { GraphicsLayer } from "./layers"
import { Measure } from "./measure"
import { ContextMenu } from "./menu"
import { DefaultContextMenuItem as MapMode } from "enum"
import { GlobalEvent } from "./bus"
import { Weather } from "./weather"

export namespace Earth {
  /**
   * @property [defaultViewRectangle] 默认视窗范围
   * @property [showAnimation = false] 是否显示动画控件
   * @property [showTimeline = false] 是否显示时间轴控件
   * @property [lockCamera] {@link CameraLockOptions} 相机锁定选项
   */
  export type ConstructorOptions = {
    defaultViewRectangle?: Rectangle
    showAnimation?: boolean
    showTimeline?: boolean
    lockCamera?: CameraLockOptions
  }

  /**
   * @description 相机锁定选项
   * @property [enable = false] 启用锁定
   * @property [rectangle] 锁定范围
   * @property [height] 锁定高度
   */
  export type CameraLockOptions = {
    enable?: boolean
    rectangle?: Rectangle
    height?: number
  }
}

/**
 * @description 地球
 * @param container 容器ID / 容器 / {@link Viewer} 实例
 * @param [cesiumOptions] {@link Viewer.ConstructorOptions} 视图选项
 * @param [options] {@link Earth.ConstructorOptions} 参数
 * @example
 * ```
 * //use hook
 * //already have a viewer
 * const earth = useEarth("my_earth", viewer)
 *
 * //use hook
 * //no available viewer
 * const earth = useEarth()
 *
 * //use class
 * //already have a viewer
 * const earth = new Earth(viewer)
 *
 * //use class
 * //no available viewer
 * const earth = new Earth("GisContainer", {
 *  animation: true,
 *  timeline: true,
 *  shouldAnimate: true,
 *  fullscreenButton: false,
 *  geocoder: false,
 *  homeButton: false,
 *  sceneModePicker: false,
 *  scene3DOnly: false,
 *  sceneMode: SceneMode.SCENE3D,
 *  selectionIndicator: false,
 *  infoBox: false,
 *  baseLayerPicker: false,
 *  navigationHelpButton: false,
 *  vrButton: false,
 *  shadows: false,
 *  mapMode2D: MapMode2D.INFINITE_SCROLL,
 *  mapProjection: new WebMercatorProjection(Ellipsoid.WGS84),
 * })
 * ```
 */
export class Earth {
  /**
   * @description ID
   */
  public id: string = Utils.RandomUUID()
  /**
   * @description HTML容器
   */
  public readonly container: HTMLElement
  /**
   * @description 视窗实列
   */
  public readonly viewer: Viewer
  /**
   * @description 场景实例
   */
  public readonly scene: Scene
  /**
   * @description 相机实例
   */
  public readonly camera: Camera
  /**
   * @description 时钟实例
   */
  public readonly clock: Clock
  /**
   * @description 动画控件
   */
  public readonly animation: HTMLElement
  /**
   * @description 时间轴控件
   */
  public readonly timeline: HTMLElement
  /**
   * @description 坐标系
   */
  public readonly coordinate: Coordinate
  /**
   * @description 全局事件
   */
  public readonly global: GlobalEvent
  /**
   * @description 默认图层实例
   */
  public readonly layers: GraphicsLayer
  /**
   * @description 测量组件
   */
  public readonly measure: Measure
  /**
   * @description 动态绘制
   */
  public readonly drawTool: Draw
  /**
   * @description 菜单组件
   */
  public readonly contextMenu: ContextMenu
  /**
   * @description 天气场景特效
   */
  public readonly weather: Weather
  /**
   * @description cesium视图选项
   */
  private cesiumOptions: Viewer.ConstructorOptions
  /**
   * @description {@link Earth.ConstructorOptions} 参数
   */
  private options: Earth.ConstructorOptions
  private preRenderCallback?: Event.RemoveCallback

  constructor(
    container: string | HTMLDivElement | Viewer,
    cesiumOptions?: Viewer.ConstructorOptions,
    options?: Earth.ConstructorOptions
  ) {
    Camera.DEFAULT_VIEW_RECTANGLE = options?.defaultViewRectangle || Rectangle.fromDegrees(72, 0.83, 137.83, 55.83)

    this.cesiumOptions = {}
    this.options = {}
    this.defaultOptions(cesiumOptions, options)

    if (container instanceof Viewer) {
      this.viewer = container
    } else {
      this.viewer = new Viewer(container, this.cesiumOptions)
    }

    this.scene = this.viewer.scene
    this.camera = this.viewer.camera
    this.clock = this.viewer.clock

    this.container = this.viewer.container as HTMLElement
    this.animation = this.viewer.animation.container as HTMLElement
    this.timeline = this.viewer.timeline.container as HTMLElement

    this.defaultSettings()

    this.global = new GlobalEvent(this)
    this.coordinate = new Coordinate(this)
    this.layers = new GraphicsLayer(this)
    this.measure = new Measure(this)
    this.drawTool = new Draw(this)
    this.contextMenu = new ContextMenu(this)
    this.weather = new Weather(this)

    this.lockCamera()
    this.addSceneRenderListener()
  }

  private addSceneRenderListener() {
    if (!this.preRenderCallback && this.options.lockCamera?.enable) {
      this.preRenderCallback = this.scene.preRender.addEventListener(() => {
        if (this.options.lockCamera?.enable && this.options.lockCamera.rectangle) {
          CameraTool.LockCameraInRectangle(
            this.camera,
            this.options.lockCamera.rectangle,
            this.options.lockCamera.height
          )
        }
      })
    }
  }

  /**
   * @description 地图默认选项
   * @param cesiumOptions cesium视图选项
   * @param [options] {@link Earth.ConstructorOptions} 参数
   */
  private defaultOptions(cesiumOptions?: Viewer.ConstructorOptions, options?: Earth.ConstructorOptions) {
    Object.assign(
      this.options,
      {
        showAnimation: false,
        showTimeline: false,
      },
      options
    )
    Object.assign(this.cesiumOptions, cesiumOptions)
  }

  /**
   * @description 地图默认设置
   */
  private defaultSettings() {
    if (this.options.showAnimation === false && this.animation) this.animation.style.visibility = "hidden"
    if (this.options.showTimeline === false && this.timeline) this.timeline.style.visibility = "hidden"

    // 使Canvas可接受其它HTMLElement的拖动行为
    this.viewer.canvas.ondragover = (ev: DragEvent) => {
      ev.preventDefault()
    }
    this.viewer.canvas.ondragenter = (ev: DragEvent) => {
      ev.preventDefault()
    }
  }

  /**
   * @description 使用Echarts插件并映射坐标系统
   * 1. 该坐标系统跟随Cesium视角调整Echarts坐标
   * 2. 该坐标系统由于Echarts限制，仅支持单实例
   * 3. 对应视图需要开启Echarts插件时运行该方法
   * 4. 其他Echarts图形实例也可加载，但不随视图更新位置
   * @example
   * ```
   * const earth = useEarth()
   * earth.useEcharts()
   * const overlay = new Overlay({ earth, echartsOption })
   * ```
   */
  public useEcharts() {
    const self = this
    extendComponentModel({
      type: "GLMap",
      defaultOption: {
        roam: false,
      },
    })

    extendComponentView({
      type: "GLMap",
      init(_: any, api: CustomSeriesRenderItemAPI) {
        //@ts-ignore
        this.api = api
        //@ts-ignore
        self.scene.postRender.addEventListener(this.moveHandler, this)
      },
      moveHandler() {
        //@ts-ignore
        this.api.dispatchAction({ type: "GLMapRoam" })
      },
      render() {},
      dispose() {
        //@ts-ignore
        self.scene.postRender.removeEventListener(this.moveHandler, this)
      },
    })

    class EarthCoordinateSystem {
      public static dimensions = ["lng", "lat"]
      public dimensions = ["lng", "lat"]
      private mapOffset = [0, 0]
      constructor(
        public scene: Scene,
        private api: CustomSeriesRenderItemAPI
      ) {}

      public static create(globalModel: any, api: CustomSeriesRenderItemAPI) {
        let coordSys: EarthCoordinateSystem
        globalModel.eachComponent("GLMap", (earthModel: ComponentModel) => {
          coordSys = new EarthCoordinateSystem(self.scene, api)
          //@ts-ignore
          coordSys.setMapOffest(earthModel.__mapOffest || [0, 0])
          //@ts-ignore
          earthModel.coordinateSystem = coordSys
        })

        globalModel.eachSeries((seriesModel: any) => {
          if (seriesModel.get("coordinateSystem") === "GLMap") {
            seriesModel.coordinateSystem = coordSys
          }
        })
      }

      public setMapOffest(offset: number[]) {
        this.mapOffset = [...offset]
      }

      public getEarthMap() {
        return this.scene
      }

      /**
       * @description 数据坐标转坐标点
       * @param data 坐标
       */
      public dataToPoint(data: number[]) {
        const maxRadians = CMath.toRadians(80)
        const position = Cartesian3.fromDegrees(data[0], data[1])
        if (!position) return [undefined, undefined]
        const canvasCoordinate = this.scene.cartesianToCanvasCoordinates(position)
        if (!canvasCoordinate) return [undefined, undefined]
        if (
          this.scene.mode === SceneMode.SCENE3D &&
          Cartesian3.angleBetween(this.scene.camera.position, position) > maxRadians
        ) {
          return [undefined, undefined]
        }
        return [canvasCoordinate.x - this.mapOffset[0], canvasCoordinate.y - this.mapOffset[1]]
      }

      /**
       * @description 坐标点转数据坐标
       * @param point 点
       */
      public pointToData(point: number[]) {
        const pt = new Cartesian2(point[0] + this.mapOffset[0], point[1] + this.mapOffset[1])
        const cartesian = this.scene.pickPosition(pt)
        if (!cartesian) return [999, 999]
        const carto = Cartographic.fromCartesian(cartesian)
        return [carto.longitude, carto.latitude]
      }

      /**
       * @description 获取视窗
       * @returns 视窗
       */
      public getViewRect(): graphic.BoundingRect {
        const rect = new graphic.BoundingRect(0, 0, this.api.getWidth(), this.api.getHeight())
        return rect
      }

      public getRoamTransform() {
        return matrix.create()
      }
    }

    //@ts-ignore
    registerCoordinateSystem("GLMap", EarthCoordinateSystem)

    registerAction(
      {
        type: "GLMapRoam",
        event: "GLMapRoam",
        update: "updateLayout",
      },
      () => {}
    )
  }

  /**
   * @description 使用默认图层类
   * @returns 默认暴露的图层类
   * @deprecated Now can directly read the public value `earth.layers`
   */
  public useDefaultLayers() {
    return this.layers
  }

  /**
   * @description 使用默认测量类
   * @returns 测量工具
   * @deprecated Now can directly read the public value `earth.measure`
   */
  public useMeasure() {
    return this.measure
  }

  /**
   * @description 使用默认绘制类
   * @returns 绘制工具
   * @deprecated Now can directly read the public value `earth.drawTool`
   */
  public useDraw() {
    return this.drawTool
  }

  /**
   * @description 使用默认上下文菜单
   * @returns 上下文菜单实例
   * @deprecated Now can directly read the public value `earth.contextMenu`
   */
  public useContextMenu() {
    return this.contextMenu
  }

  /**
   * @description 锁定相机
   * @param param {@link Earth.CameraLockOptions} 参数
   * @example
   * ```
   * const earth = useEarth()
   * earth.lockCamera({
   *  enable: true,
   *  rectangle: Rectangle.fromDegrees(72.004, 0.8293, 137.8347, 55.8271),
   *  height: 1000000,
   * })
   * ```
   */
  public lockCamera(param?: Earth.CameraLockOptions) {
    const op = param || this.options.lockCamera
    if (!op) return
    if (!this.options.lockCamera) {
      this.options.lockCamera = {}
    }
    if (op.enable !== undefined) {
      this.options.lockCamera.enable = op.enable
      this.addSceneRenderListener()
    }
    if (op.height !== undefined) this.options.lockCamera.height = op.height
    if (op.rectangle) this.options.lockCamera.rectangle = op.rectangle
  }

  /**
   * @description 添加地图影像层
   * @param provider 影像图层
   * @example
   * ```
   * const earth = useEarth()
   * const imageryProvider = useTileImageryProvider({ url: "/api/imagery", maximumLevel: 18 })
   * earth.addImageryProvider(imageryProvider)
   * ```
   */
  public addImageryProvider(provider: ImageryProvider) {
    return this.viewer.imageryLayers.addImageryProvider(provider)
  }

  /**
   * @description 移除所有地图影像层
   */
  public removeImageryProvider(): void
  /**
   * @description 移除地图影像层
   * @param layer 图层
   * @example
   * ```
   * const earth = useEarth()
   * const imageryProvider = useTileImageryProvider({ url: "/api/imagery", maximumLevel: 18 })
   *
   * //remove one
   * earth.removeImageryProvider(imageryProvider)
   *
   * //remove all
   * earth.removeImageryProvider()
   * ```
   */
  public removeImageryProvider(layer: ImageryLayer): void
  public removeImageryProvider(layer?: ImageryLayer): void {
    if (layer) {
      this.viewer.imageryLayers.remove(layer)
    } else {
      this.viewer.imageryLayers.removeAll()
    }
  }

  /**
   * @description 设置地形
   * @param terrainProvider 地形
   * @example
   * ```
   * const earth = useEarth()
   * const terrainProvider = await CesiumTerrainProvider.fromUrl("/api/terrain")
   * earth.setTerrain(terrainProvider)
   * ```
   */
  public setTerrain(terrainProvider: TerrainProvider) {
    this.viewer.terrainProvider = terrainProvider
  }

  /**
   * @description 开启 / 关闭地形深度测试
   * @param value
   * @example
   * ```
   * const earth = useEarth()
   *
   * //turn on
   * earth.setDepthTestAgainstTerrain(true)
   *
   * //turn off
   * earth.setDepthTestAgainstTerrain(false)
   * ```
   */
  public setDepthTestAgainstTerrain(value: boolean) {
    this.scene.globe.depthTestAgainstTerrain = value
  }

  /**
   * @description 移动相机到默认位置
   * @param duration 动画时间，默认`2s`
   */
  public flyHome(duration: number = 2) {
    this.camera.lookAtTransform(Matrix4.IDENTITY)
    this.camera.flyHome(duration)
  }

  /**
   * @description 移动相机到指定位置
   * @param target 目标位置参数
   * @example
   * ```
   * const earth = useEarth()
   * earth.flyTo({ position: Cartesian3.fromDegrees(104, 31) })
   * ```
   */
  public flyTo(target: {
    position?: Cartesian3
    rectangle?: Rectangle
    duration?: number
    orientation?: { heading?: number; pitch?: number; roll?: number }
  }): void
  public flyTo(target: {
    position?: Cartesian3
    rectangle?: { west: number; south: number; east: number; north: number }
    duration?: number
    orientation?: { heading?: number; pitch?: number; roll?: number }
  }): void
  public flyTo(target: {
    position?: Cartesian3
    rectangle?: Rectangle | { west: number; south: number; east: number; north: number }
    duration?: number
    orientation?: { heading?: number; pitch?: number; roll?: number }
  }) {
    let destination: Cartesian3 | Rectangle
    const { position, rectangle, duration, orientation } = target
    if (position) {
      destination = position
    } else if (rectangle) {
      if (rectangle instanceof Rectangle) {
        destination = rectangle
      } else {
        const { west, south, east, north } = rectangle
        destination = Rectangle.fromDegrees(west, south, east, north)
      }
    } else {
      destination = Camera.DEFAULT_VIEW_RECTANGLE
    }
    this.camera.flyTo({ destination, duration: duration ?? 2, orientation })
  }

  /**
   * @description 设置地图视图模式
   * @param mode  `2D视图`，`3D视图`
   * @param duration 动画时间，默认`2s`
   * @example
   * ```
   * const earth = useEarth()
   *
   * //2D
   * earth.morphTo(MapMode.Scene2D)
   *
   * //3D
   * earth.morphTo(MapMode.Scene3D)
   * ```
   */
  public morphTo(mode: MapMode, duration: number = 3) {
    const viewCenter = new Cartesian2(
      Math.floor(this.viewer.canvas.clientWidth / 2),
      Math.floor(this.viewer.canvas.clientHeight / 2)
    )
    const position = this.coordinate.screenToGeographic(viewCenter)!
    let distance: number | undefined
    switch (mode) {
      case MapMode.Scene2D: {
        distance = Cartesian3.distance(this.camera.pickEllipsoid(viewCenter)!, this.camera.positionWC)
        this.scene.morphTo2D(duration)
        break
      }
      case MapMode.Scene3D: {
        distance = this.camera.positionCartographic.height
        this.scene.morphTo3D(duration)
        break
      }
    }
    setTimeout(() => {
      this.scene.completeMorph()
      this.camera.flyTo({
        destination: Cartesian3.fromDegrees(position.longitude, position.latitude, distance),
        duration: 2,
      })
    }, duration * 1000)
  }

  /**
   * @description 销毁
   */
  public destroy() {
    this.viewer.destroy()
    this.layers.forceDestroy()
    this.drawTool.destroy()
    this.contextMenu.destroy()
    this.global.destroy()
  }
}
