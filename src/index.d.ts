/// <reference path="cesium.extend.d.ts" />
import {
  ArcType,
  Billboard,
  BillboardCollection,
  Camera,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Clock,
  Color,
  ColorBlendMode,
  DepthFunction,
  DistanceDisplayCondition,
  Entity,
  GroundPolylinePrimitive,
  GroundPrimitive,
  HeadingPitchRoll,
  HeightReference,
  HorizontalOrigin,
  ImageryLayer,
  ImageryProvider,
  Label,
  LabelCollection,
  LabelStyle,
  Material,
  Matrix4,
  Model,
  ModelAnimationLoop,
  NearFarScalar,
  Particle,
  ParticleBurst,
  ParticleEmitter,
  ParticleSystem,
  PixelDatatype,
  PixelFormat,
  PointPrimitive,
  PointPrimitiveCollection,
  Primitive,
  PrimitiveCollection,
  Rectangle,
  Rectangle as Rect,
  Scene,
  ScreenSpaceEventHandler,
  TerrainProvider,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer,
  FrameState,
  Sampler,
  TextureMagnificationFilter,
  TextureMinificationFilter,
  BillboardGraphics,
  ModelGraphics,
  PathGraphics,
  TimeIntervalCollection,
  Ellipsoid,
  CumulusCloud,
  CloudCollection,
} from "cesium"
import { EChartsOption } from "echarts"

declare module "@anstec/earth" {
  /**
   * @description 默认上下文菜单项
   */
  export enum DefaultContextMenuItem {
    Home = "Home",
    Scene2D = "2D",
    Scene3D = "3D",
    FullScreen = "FullScreen",
    ExitFullScreen = "ExitFullScreen",
    DisableDepth = "DisableDepth",
    EnableDepth = "EnableDepth",
  }

  /**
   * @description 菜单项事件类型
   */
  export enum MenuEventType {
    RightClick = "RightClick",
    ItemClick = "ItemClick",
  }

  /**
   * @description 屏幕捕获模式
   * 1. `SCENE` 基于场景绘制物获取最顶层空间坐标
   * 2. `TERRAIN` 仅基于地形获取空间坐标
   * 3. `ELLIPSOID` 获取椭球表面空间坐标
   */
  export enum ScreenCapture {
    SCENE = "scene",
    TERRAIN = "terrain",
    ELLIPSOID = "ellipsoid",
  }

  /**
   * @description 动态绘制类型
   */
  export enum DrawType {
    BILLBOARD = 0,
    CIRCLE = 1,
    MODEL = 2,
    POINT = 3,
    POLYLINE = 4,
    POLYGON = 5,
    RECTANGLE = 6,
    WALL = 7,
    ATTACK_ARROW = 8,
    STRAIGHT_ARROW = 9,
    PINCER_ARROW = 10,
    STROKE = 11,
    LABEL = 12,
  }

  /**
   * @description 默认动态模块名
   */
  export enum DefaultModuleName {
    BILLBOARD = "D_billboard",
    CIRCLE = "D_circle",
    MODEL = "D_model",
    POINT = "D_point",
    POLYLINE = "D_polyline",
    POLYGON = "D_polygon",
    RECTANGLE = "D_rectangle",
    WALL = "D_wall",
    ATTACK_ARROW = "D_attack_arrow",
    STRAIGHT_ARROW = "D_straight_arrow",
    PINCER_ARROW = "D_pincer_arrow",
    STROKE = "D_stroke",
    LABEL = "D_label",
  }

  /**
   * @description 可编辑类型
   */
  export enum EditableType {
    ATTACK_ARROW = 0,
    BILLBOARD = 1,
    CIRCLE = 2,
    LABEL = 3,
    MODEL = 4,
    PINCER_ARROW = 5,
    POINT = 6,
    POLYGON = 7,
    POLYLINE = 8,
    RECTANGLE = 9,
    STRAIGHT_ARROW = 10,
    WALL = 11,
  }

  /**
   * @description 订阅事件类型
   */
  export enum SubEventType {
    DRAW_MOVE = "Draw_Move",
    /**
     * @description 绘制过程中单击目标或点
     */
    DRAW_CERTAIN = "Draw_Certain",
    DRAW_FINISH = "Draw_Finish",
    EDIT_MOVE = "Edit_Move",
    /**
     * @description 编辑过程中单击目标或点
     */
    EDIT_CERTAIN = "Edit_Certain",
    EDIT_FINISH = "Edit_Finish",
  }

  /**
   * @description 测量会算类型
   */
  export enum MeasureType {
    SPACE_DISTANCE = 0,
    GROUND_DISTANCE = 1,
    SPACE_AREA = 2,
    HEIGHT = 3,
    TRIANGLE = 4,
    POSITION = 5,
    AZIMUTH = 6,
    SECTION = 7,
  }

  /**
   * @description 全局事件类型
   */
  export enum GlobalEventType {
    LEFT_DOWN = 0,
    LEFT_UP = 1,
    LEFT_CLICK = 2,
    LEFT_DOUBLE_CLICK = 3,
    RIGHT_DOWN = 5,
    RIGHT_UP = 6,
    RIGHT_CLICK = 7,
    MIDDLE_DOWN = 10,
    MIDDLE_UP = 11,
    MIDDLE_CLICK = 12,
  }

  /**
   * @description 模型视角
   */
  export enum ViewAngle {
    FIRST = 0,
    THIRD = 1,
  }

  /**
   * @description 圆锥计算模式
   * 1. `MATH` 将`radius`当作标准的数学值计算
   * 2. `RHUMB` 将`radius`当作大圆圆弧的值计算
   */
  export enum ConicMode {
    MATH = 0,
    RHUMB = 1,
  }

  /**
   * @description 传感器相控阵扫描模式
   */
  export enum ScanMode {
    HORIZONTAL = 0,
    VERTICAL = 1,
  }

  /**
   * @description 地球近似半径
   * 1. `AVERAGE`-近似平均半径
   * 2. `EQUATOR`-赤道平均半径
   * 3. `POLE`-两极平均半径
   */
  export enum EarthRadius {
    AVERAGE = 6371393,
    EQUATOR = 6378137,
    POLE = 6356725,
  }

  /**
   * @description uid连接符格式
   * 1. `D`-减号连接符
   * 2. `P`-加号连接符
   * 3. `N`-无连接符
   */
  export enum UidFormat {
    D = "Decrease",
    P = "Plus",
    N = "None",
  }

  /**
   * @description 经纬度格式化格式
   * 1. `DMS`-度分秒(Degrees Minute Second)
   * 2. `DMSS`-度分秒简写(Degrees Minute Second Short)
   */
  export enum CoorFormat {
    DMS = "DMS",
    DMSS = "DMSS",
  }

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
    id: string
    /**
     * @description HTML容器
     */
    readonly container: HTMLElement
    /**
     * @description 视窗实列
     */
    readonly viewer: Viewer
    /**
     * @description 场景实例
     */
    readonly scene: Scene
    /**
     * @description 相机实例
     */
    readonly camera: Camera
    /**
     * @description 时钟实例
     */
    readonly clock: Clock
    /**
     * @description 动画控件
     */
    readonly animation: HTMLElement
    /**
     * @description 时间轴控件
     */
    readonly timeline: HTMLElement
    /**
     * @description 坐标系
     */
    readonly coordinate: Coordinate
    /**
     * @description 全局事件
     */
    readonly global: GlobalEvent
    /**
     * @description 默认图层实例
     */
    readonly layers: GraphicsLayer
    /**
     * @description 测量组件
     */
    readonly measure: Measure
    /**
     * @description 动态绘制
     */
    readonly drawTool: Draw
    /**
     * @description 菜单组件
     */
    readonly contextMenu: ContextMenu
    /**
     * @description 天气场景特效
     */
    readonly weather: Weather
    constructor(
      container: string | HTMLDivElement | Viewer,
      cesiumOptions?: Viewer.ConstructorOptions,
      options?: Earth.ConstructorOptions
    )
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
    useEcharts(): void
    /**
     * @description 使用默认图层类
     * @returns 默认暴露的图层类
     * @deprecated Now can directly read the public value `earth.layers`
     */
    useDefaultLayers(): GraphicsLayer
    /**
     * @description 使用默认测量类
     * @returns 测量工具
     * @deprecated Now can directly read the public value `earth.measure`
     */
    useMeasure(): Measure
    /**
     * @description 使用默认绘制类
     * @returns 绘制工具
     * @deprecated Now can directly read the public value `earth.drawTool`
     */
    useDraw(): Draw
    /**
     * @description 使用默认上下文菜单
     * @returns 上下文菜单实例
     * @deprecated Now can directly read the public value `earth.contextMenu`
     */
    useContextMenu(): ContextMenu
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
    lockCamera(param?: Earth.CameraLockOptions): void
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
    addImageryProvider(provider: ImageryProvider): ImageryLayer
    /**
     * @description 移除所有地图影像层
     */
    removeImageryProvider(): void
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
    removeImageryProvider(layer: ImageryLayer): void
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
    setTerrain(terrainProvider: TerrainProvider): void
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
    setDepthTestAgainstTerrain(value: boolean): void
    /**
     * @description 移动相机到默认位置
     */
    flyHome(): void
    /**
     * @description 移动相机到指定位置
     * @param target 目标位置参数
     * @example
     * ```
     * const earth = useEarth()
     * earth.flyTo({ position: Cartesian3.fromDegrees(104, 31) })
     * ```
     */
    flyTo(target: {
      position?: Cartesian3
      rectangle?: Rectangle
      duration?: number
      orientation?: {
        heading?: number
        pitch?: number
        roll?: number
      }
    }): void
    flyTo(target: {
      position?: Cartesian3
      rectangle?: {
        west: number
        south: number
        east: number
        north: number
      }
      duration?: number
      orientation?: {
        heading?: number
        pitch?: number
        roll?: number
      }
    }): void
    /**
     * @description 设置地图视图模式
     * @param mode  2D视图，3D视图
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
    morphTo(mode: DefaultContextMenuItem.Scene2D | DefaultContextMenuItem.Scene3D, duration?: number): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace AnimationManager {
    /**
     * @description 新增动画对象参数
     * @property [id] ID
     * @property [module] 模块名
     * @property positions 位置及相应事件信息
     * @property [availability] {@link TimeIntervalCollection} 时间依赖
     * @property [billboard] {@link BillboardGraphics} | {@link BillboardGraphics.ConstructorOptions} 广告牌实例 / 构造参数
     * @property [model] {@link ModelGraphics} | {@link ModelGraphics.ConstructorOptions} 模型实例 / 构造参数
     * @property [path] {@link PathGraphics} | {@link PathGraphics.ConstructorOptions} 路径实例 / 构造参数
     */
    export type AddParam = {
      id?: string
      module?: string
      positions: {
        longitude: number
        latitude: number
        height?: number
        time: number | string | Date
      }[]
      availability?: TimeIntervalCollection
      billboard?: BillboardGraphics | BillboardGraphics.ConstructorOptions
      model?: ModelGraphics | ModelGraphics.ConstructorOptions
      path?: PathGraphics | PathGraphics.ConstructorOptions
    }
  }

  /**
   * @description 动画管理器
   * @param earth {@link Earth} 地球实例
   * @exception The instance of 'AnimationManager' can only be constructed once for each earth.
   * @example
   * ```
   * const earth = useEarth()
   * const animationManager = new AnimationManager(earth)
   * animationManager.add({
   *  id: "test",
   *  positions: [
   *    { longitude: 104, latitude: 31, time: "2022-01-01" },
   *    { longitude: 105, latitude: 31, time: "2022-01-02" }
   *  ],
   *  billboard: {
   *    image: "/billboard.png",
   *    scale: 1,
   *  },
   * })
   */
  export class AnimationManager {
    constructor(earth: Earth)
    /**
     * @description 新增动画对象
     * @param param {@link AnimationManager.AddParam} 参数
     */
    add(param: AnimationManager.AddParam): void
    /**
     * @description 根据ID移除动画对象
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 移除所有动画对象
     * @param id ID
     */
    remove(): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace GlobalEvent {
    /**
     * @property position {@link Cartesian2} 屏幕坐标
     * @property [id] 如果点击的是对象则有ID属性
     * @property [module] 如果点击的是对象则有模块属性
     * @property [target] 如果点击的是对象则有对象实体
     */
    export type CallbackParam = {
      position: Cartesian2
      id?: string
      module?: string
      target?: any
    }
    export type Callback = (param: CallbackParam) => void
  }

  /**
   * @description 全局事件
   * @example
   * ```
   * const earth = useEarth()
   *
   * //订阅
   * earth.global.subscribe(param => console.log(param), GlobalEventType.LEFT_CLICK, "*")
   *
   * //取消订阅
   * earth.global.subscribe(param => console.log(param), GlobalEventType.LEFT_CLICK, "*")
   * ```
   */
  export class GlobalEvent {
    constructor(earth: Earth)
    /**
     * @description 订阅全局事件
     * @param callback {@link GlobalEvent.Callback} 回调
     * @param event {@link GlobalEventType} 事件类型
     * @param [module] 模块选项
     * 1. 为特定模块订阅事件时传入
     * 2. 通配符 `*` 可以表示所有模块
     * 3. 传入模块名则仅订阅该模块事件
     */
    subscribe(callback: GlobalEvent.Callback, event: GlobalEventType, module?: string): void
    /**
     * @description 取消订阅全局事件
     * @param callback {@link GlobalEvent.Callback} 回调
     * @param event {@link GlobalEventType} 事件类型
     * @param [module] 模块选项
     * 1. 为特定模块取消订阅事件时传入
     * 2. 通配符 `*` 可以表示所有模块
     * 3. 传入模块名则仅取消订阅该模块事件
     */
    unsubscribe(callback: GlobalEvent.Callback, event: GlobalEventType, module?: string): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace CesiumNavigation {
    /**
     * @property [defaultResetView] {@link Rectangle} 默认视图范围
     * @property [enableCompass = true] 启用或禁用罗盘
     * @property [enableZoomControls = true] 启用或禁用缩放控件
     * @property [enableDistanceLegend = true] 启用或禁用距离图例
     * @property [enableCompassOuterRing = true] 启用或禁用指南针外环
     * @property [resetTooltip] 重置视图的提示
     * @property [zoomInTooltip] 放大按钮的提示
     * @property [zoomOutTooltip] 缩小按钮的提示
     * @property [compassOuterRingSvg] 罗盘圆环图标
     * @property [compassRotationMarkerSvg] 罗盘旋转标记图标
     * @property [compassGyroSvg] 罗盘图标
     * @property [resetSvg] 重置按钮图标
     * @property [zoomInSvg] 放大按钮图标
     * @property [zoomOutSvg] 缩小按钮图标
     */
    export type ConstructorOptions = {
      defaultResetView?: Rectangle
      enableCompass?: boolean
      enableZoomControls?: boolean
      enableDistanceLegend?: boolean
      enableCompassOuterRing?: boolean
      resetTooltip?: string
      zoomInTooltip?: string
      zoomOutTooltip?: string
      compassOuterRingSvg?: string
      compassRotationMarkerSvg?: string
      compassGyroSvg?: string
      resetSvg?: string
      zoomInSvg?: string
      zoomOutSvg?: string
    }
  }

  export class CesiumNavigation {
    constructor(viewer: Viewer, options: CesiumNavigation.ConstructorOptions)
  }

  export namespace EventBus {
    export type Handler<T = unknown> = (event: T) => void
  }

  /**
   * @description 事件调度总线
   * @example
   * ```
   * const eventBus = new EventBus()
   * ```
   */
  export class EventBus {
    constructor()
    on<T>(event: string, handler: EventBus.Handler<T>): void
    off<T>(event: string, handler?: EventBus.Handler<T>): void
    emit<T>(event: string, context?: T): void
  }

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
   * @param earth 地球
   * @param [options] {@link Cluster.ConstructorOptions} 自定义聚合参数
   * @example
   * ```
   * const earth = useEarth()
   * const cluster = new Cluster(earth)
   * cluster.load(data)
   * ```
   */
  export class Cluster {
    constructor(earth: Earth, options?: Cluster.ConstructorOptions)
    /**
     * @description 设置自定义样式
     * @param callback {@link Cluster.CustomFunction} 自定义样式函数
     */
    setStyle(callback?: Cluster.CustomFunction): void
    /**
     * @description 加载数据
     * @param data 数据
     */
    load(
      data: {
        billboard?: Billboard.ConstructorOptions
        label?: Label.ConstructorOptions
        point?: PointPrimitive
      }[]
    ): void
    /**
     * @description 是否启用聚合，初始时是启用的
     */
    enable(status: boolean): void
    /**
     * @description 清空数据
     */
    clear(): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  /**
   * @description 坐标系统
   * @example
   * ```
   * const earth = useEarth()
   * const coordinate = earth.coordinate
   * //or
   * const coordinate = new Coordinate(earth)
   * ```
   */
  export class Coordinate {
    constructor(earth: Earth)
    /**
     * @description 开启鼠标实时获取坐标事件
     * @param callback 回调函数
     * @param [realtime = true] `true`为鼠标移动时实时获取，`false`为鼠标单击时获取
     * @example
     * ```
     * coordinate.registerMouseCoordinate((data) => { console.log(data) }, true)
     * ```
     */
    registerMouseCoordinate(callback: (data: Cartographic) => void, realtime?: boolean): void
    /**
     * @description 销毁实时鼠标获取坐标事件
     * @example
     * ```
     * coordinate.unregisterMouseCoordinate()
     * ```
     */
    unregisterMouseCoordinate(): void
    /**
     * @description 屏幕坐标转空间坐标
     * @param position {@link Cartesian2} 屏幕坐标
     * @param [mode = ScreenCapture.ELLIPSOID] {@link ScreenCapture} 屏幕捕获模式
     * @returns `Cartesian3`坐标
     * @example
     * ```
     * const position = new Cartesian2(50, 50)
     *
     * //scene
     * const cartesian3 = coordinate.screenToCartesian(position, ScreenCapture.SCENE)
     *
     * //terrain
     * const cartesian3 = coordinate.screenToCartesian(position, ScreenCapture.TERRAIN)
     *
     * //ellipsoid
     * const cartesian3 = coordinate.screenToCartesian(position, ScreenCapture.ELLIPSOID)
     * ```
     */
    screenToCartesian(position: Cartesian2, mode?: ScreenCapture): Cartesian3 | undefined
    /**
     * @description 空间坐标转屏幕坐标
     * @param position {@link Cartesian3} 空间坐标
     * @returns `Cartesian2`坐标
     * @example
     * ```
     * const position = Cartesian3.fromDegrees(104, 31, 0)
     * const cartesian2 = coordinate.cartesianToScreen(position)
     * ```
     */
    cartesianToScreen(position: Cartesian3): Cartesian2
    /**
     * @description 地理坐标转空间坐标
     * @param cartographic {@link Cartographic} 地理坐标
     * @returns `Cartesian3`坐标
     * @example
     * ```
     * const position = Cartographic.fromDegrees(104, 31, 0)
     * const cartesian3 = coordinate.cartographicToCartesian(position)
     * ```
     */
    cartographicToCartesian(cartographic: Cartographic): Cartesian3
    /**
     * @description 空间坐标转地理坐标
     * @param position {@link Cartesian3} 空间坐标
     * @return `Cartographic`坐标
     * ```
     * const position = Cartesian3.fromDegrees(104, 31, 0)
     * const carto = coordinate.cartesianToCartographic(position)
     * ```
     */
    cartesianToCartographic(position: Cartesian3): Cartographic
    /**
     * @description 屏幕坐标转经纬度坐标
     * @param position {@link cartesian2} 屏幕坐标
     * @returns `Geographic`坐标
     * @example
     * ```
     * const position = new Cartesian2(50, 50)
     * const geo = coordinate.screenToGeographic(position)
     * ```
     */
    screenToGeographic(position: Cartesian2): Geographic | undefined
    /**
     * @description 屏幕坐标转地理坐标
     * @param position {@link Cartesian2} 屏幕坐标
     * @returns `Cartographic`坐标
     * @example
     * ```
     * const position = new Cartesian2(50, 50)
     * const carto = coordinate.screenToCartographic(position)
     * ```
     */
    screenToCartographic(position: Cartesian2): Cartographic | undefined
    /**
     * @description 获取坐标处位置的地面高度
     * @param position {@link Cartographic} | {@link Geographic} 地理或经纬度坐标
     * @returns 高度
     * @exception Invaid position type, use cartographic or geographic.
     */
    positionSurfaceHeight(position: Cartographic | Geographic): number | undefined
  }

  /**
   * @description 地理坐标，经纬度 <角度制>
   * @example
   * ```
   * const geo = new Geographic(104, 31, 500)
   * ```
   */
  export class Geographic {
    longitude: number
    latitude: number
    height: number
    /**
     * @param longitude 经度 <角度制>
     * @param latitude 纬度 <角度制>
     * @param [height = 0] 海拔高度 `m`
     */
    constructor(longitude: number, latitude: number, height?: number)
    /**
     * @description 转为笛卡尔坐标系
     * @param [ellipsoid = Ellipsoid.WGS84] {@link Ellipsoid} 坐标球体类型
     * @param [result] {@link Cartesian3} 存储结果对象
     * @returns 笛卡尔坐标
     * @example
     * ```
     * const geo = new Geographic(104, 31, 500)
     * const cartesian3 = geo.toCartesian()
     * ```
     */
    toCartesian(ellipsoid?: Ellipsoid, result?: Cartesian3): Cartesian3
    /**
     * @description 转为地理坐标系
     * @param [result] {@link Cartographic} 存储结果对象
     * @returns 地理坐标
     * @example
     * ```
     * const geo = new Geographic(104, 31, 500)
     * const carto = geo.toCartographic()
     * ```
     */
    toCartographic(result?: Cartographic): Cartographic
    /**
     * @description 转为数组
     * @returns 数组格式
     * @example
     * ```
     * const geo = new Geographic(104, 31, 500)
     * const [longitude, latitude] = geo.toArray()
     * ```
     */
    toArray(): number[]
    /**
     * @description 转为带高程的数组
     * @returns 数组格式
     * @example
     * ```
     * const geo = new Geographic(104, 31, 500)
     * const [longitude, latitude, height] = geo.toArrayHeight()
     * ```
     */
    toArrayHeight(): number[]
    /**
     * @description 克隆当前坐标
     * @returns 新的`Geographic`坐标
     * @example
     * ```
     * const geo = new Geographic(104, 31, 500)
     * const clone = geo.clone()
     * ```
     */
    clone(): Geographic
    /**
     * @description 格式化经纬度
     * @param [format = CoorFormat.DMS] {@link CoorFormat} 格式
     * @returns 格式化结果
     * @example
     * ```
     * const geo = new Geographic(104, 31, 500)
     *
     * //DMS
     * const { longitude, latitude } = geo.format(CoorFormat.DMS)
     *
     * //DMSS
     * const { longitude, latitude } = geo.format(CoorFormat.DMSS)
     * ```
     */
    format(format?: CoorFormat): { longitude: string; latitude: string }
    /**
     * @description 从已知地理坐标克隆结果
     * @param geo {@link Geographic} 需要克隆的对象
     * @param [result] {@link Geographic} 存储结果对象
     * @returns 地理坐标
     */
    static clone(geo: Geographic, result?: Geographic): Geographic
    /**
     * @description 比较两个地理坐标是否全等
     * @param left {@link Geographic} 左值
     * @param right {@link Geographic} 右值
     */
    static equals(left: Geographic, right: Geographic): boolean
    /**
     * @description 从弧度制的数据转换
     * @param longitude 经度 <弧度制>
     * @param latitude 纬度 <弧度制>
     * @param [height = 0] 海拔高度 `m`
     * @param [result] {@link Geographic} 存储结果对象
     * @returns 地理坐标
     */
    static fromRadians(longitude: number, latitude: number, height?: number, result?: Geographic): Geographic
    /**
     * @description 从笛卡尔坐标系转换
     * @param cartesian {@link Cartesian3} 笛卡尔坐标
     * @param [ellipsoid = Ellipsoid.WGS84] {@link Ellipsoid} 坐标球体类型
     * @param [result] {@link Geographic} 存储结果对象
     * @returns 经纬度坐标
     * @example
     * ```
     * const cartesian3 = Cartesian3.fromDegrees(104, 31, 500)
     * const geo = Geographic.fromCartesian(cartesian3)
     * ```
     */
    static fromCartesian(cartesian: Cartesian3, ellipsoid?: Ellipsoid, result?: Geographic): Geographic
    /**
     * @description 从地理坐标系转换
     * @param cartographic {@link Cartographic} 地理坐标
     * @param [result] {@link Geographic} 存储结果对象
     * @returns `Geographic`坐标
     * @example
     * ```
     * const carto = Cartographic.fromDegrees(104, 31, 500)
     * const geo = Geographic.fromCartographic(carto)
     * ```
     */
    static fromCartographic(cartographic: Cartographic, result?: Geographic): Geographic
    /**
     * @description 数组批量转坐标
     * @param coordinates 数组坐标
     * @exception Array length must be a mutiple of 2.
     * @exception Invaid longitude or latitude value.
     * @example
     * ```
     * const arr = [104, 31]
     * const geoArr = Geographic.fromDegreesArray(arr)
     * ```
     */
    static fromDegreesArray(coordinates: number[]): Geographic[]
    /**
     * @description 数组批量转坐标 <弧度制>
     * @param coordinates 数组坐标
     * @exception Array length must be a mutiple of 2.
     * @exception Invaid longitude or latitude value.
     * @example
     * ```
     * const arr = [2.1, 1.04]
     * const geoArr = Geographic.fromRadiansArray(arr)
     * ```
     */
    static fromRadiansArray(coordinates: number[]): Geographic[]
    /**
     * @description 带高程的数组批量转坐标
     * @param coordinates 带高程的数组坐标
     * @exception Array length must be a mutiple of 3.
     * @exception Invaid longitude or latitude value.
     * @example
     * ```
     * const arr = [104, 31, 500]
     * const geoArr = Geographic.fromDegreesArrayHeights(arr)
     * ```
     */
    static fromDegreesArrayHeights(coordinates: number[]): Geographic[]
    /**
     * @description 带高程的数组批量转坐标 <弧度制>
     * @param coordinates 带高程的数组坐标
     * @exception Array length must be a mutiple of 3.
     * @exception Invaid longitude or latitude value.
     * @example
     * ```
     * const arr = [2.1, 1.03, 500]
     * const geoArr = Geographic.fromRadiansArrayHeights(arr)
     * ```
     */
    static fromRadiansArrayHeights(coordinates: number[]): Geographic[]
  }

  export namespace Covering {
    export type AnchorPosition = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT"

    /**
     * @property [id] 覆盖物ID
     * @property [customize = false] 是否自定义实现
     * @property [reference] 引用实例，自定义实现时必填
     * @property [className] 实例类名，自定义实现时失效
     * @property [title] 标题，自定义实现时失效
     * @property [content] 内容，自定义实现时失效
     * @property [data] 附加数据
     * @property [anchorPosition = "TOP_LEFT"] 覆盖物锚点方位
     * @property [connectionLine = true] 连接线，拖拽禁用时连接线将始终隐藏
     * @property position {@link Cartesian3} 位置
     */
    export type AddParam<T> = {
      id?: string
      customize?: boolean
      reference?: HTMLDivElement
      className?: string[]
      title?: string
      content?: string
      data?: T
      anchorPosition?: AnchorPosition
      connectionLine?: boolean
      position: Cartesian3
    }

    export type SetParam<T> = Partial<Pick<AddParam<T>, "position" | "title" | "content" | "data">>
  }

  /**
   * @description 自定义覆盖物
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth
   * const cover = new Covering(earth)
   * ```
   */
  export class Covering<T = unknown> {
    constructor(earth: Earth)
    /**
     * @description 设置覆盖物是否可拖拽
     * @param value 是否启用可拖拽
     */
    setDraggable(value: boolean): void
    /**
     * @description 新增覆盖物
     * @param param {@link Covering.AddParam<T>} 参数
     * @exception Reference element is required when customizing.
     * @example
     * ```
     * const earth = useEarth
     * const cover = new Covering(earth)
     *
     * //custom
     * cover.add({
     *  customize: true,
     *  reference: customDivElement,
     * })
     *
     * //default
     * cover.add({
     *  customize: false,
     *  className = ["default-covering"],
     *  title = "Title",
     *  content = "Content",
     * })
     * ```
     */
    add(param: Covering.AddParam<T>): void
    /**
     * @description 按ID设置覆盖物的属性
     * @param id ID
     * @param param {@link Covering.SetParam<T>} 参数
     * @returns
     */
    set(id: string, param: Covering.SetParam<T>): void
    /**
     * @description 按ID查看覆盖物是否存在
     * @param id ID
     * @returns 是否存在覆盖物
     */
    has(id: string): boolean
    /**
     * @description 获取附加数据
     * @param id ID
     */
    getData(id: string): T | undefined
    /**
     * @description 移除所有覆盖物
     */
    remove(): void
    /**
     * @description 按ID移除覆盖物
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace Draw {
    /**
     * @description 绘制基本属性
     * @property [id] ID
     * @property [module] {@link DefaultModuleName} 模块名
     */
    type Base = {
      id?: string
      module?: string
    }

    /**
     * @property type 图形类型
     * @property event {@link SubEventType} 事件类型
     * @property data 事件数据
     */
    export type CallbackParam = {
      type: string
      event: SubEventType
      data: { [key: string]: any }
    }

    export type EventCallback = (param: CallbackParam) => void

    export type Options =
      | AttackArrow
      | Billboard
      | Circle
      | Model
      | PincerArrow
      | Point
      | Polygon
      | Polyline
      | Rectangle
      | StraightArrow
      | Wall
      | Stroke
      | Label

    export type Features =
      | PolygonLayer.AddParam<Dynamic.AttackArrow>
      | BillboardLayer.AddParam<Dynamic.Billboard>
      | EllipseLayer.AddParam<Dynamic.Circle>
      | LabelLayer.AddParam<Dynamic.Label>
      | ModelLayer.AddParam<Dynamic.Model>
      | PolygonLayer.AddParam<Dynamic.PincerArrow>
      | PointLayer.AddParam<Dynamic.Point>
      | PolygonLayer.AddParam<Dynamic.Polygon>
      | PolylineLayer.AddParam<Dynamic.Polyline>
      | RectangleLayer.AddParam<Dynamic.Rectangle>
      | PolygonLayer.AddParam<Dynamic.StraightArrow>
      | WallLayer.AddParam<Dynamic.Wall>

    export type LabelReturn = {
      id: string
      position: Cartesian3
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [text = "新建文本"] 标签文本
     * @property [font = "14px sans-serif"] 字体样式
     * @property [scale = 1] 缩放
     * @property [fillColor = {@link Color.BLACK}] 字体填充色
     * @property [outlineColor = {@link Color.WHITE}] 字体描边色
     * @property [outlineWidth = 1] 字体描边粗细
     * @property [showBackground = true] 是否显示背景
     * @property [backgroundColor = {@link Color.LIGHTGREY}] 标签背景色
     * @property [backgroundPadding = {@link Cartesian2.ZERO}] 背景Padding值
     * @property [style = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [pixelOffset = {@link Cartesian2.ZERO}] 像素偏移
     * @property [limit = 0] 绘制数量，`0`为无限制绘制，手动结束
     * @property [keep = true] 是否保留绘制图形
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Label = Base & {
      text?: string
      font?: string
      scale?: number
      fillColor?: Color
      outlineColor?: Color
      outlineWidth?: number
      showBackground?: boolean
      backgroundColor?: Color
      backgroundPadding?: Cartesian2
      style?: LabelStyle
      pixelOffset?: Cartesian2
      limit?: number
      keep?: boolean
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type StrokeReturn = {
      id: string
      positions: Cartesian3[]
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [color = {@link Color.RED}] 笔触填充色
     * @property [width = 2] 笔触宽度
     * @property [keep = true] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onFinish] 绘制结束的回调
     */
    export type Stroke = Base & {
      color?: Color
      width?: number
      keep?: boolean
      ground?: boolean
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type PointReturn = {
      id: string
      position: Cartesian3
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [color = {@link Color.RED}] 填充色
     * @property [pixelSize = 5] 像素大小
     * @property [limit = 0] 绘制数量，`0`为无限制绘制，手动结束
     * @property [keep = true] 是否保留绘制图形
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Point = Base & {
      color?: Color
      pixelSize?: number
      /**
       * @description 绘制数量，`0`为无限制绘制，手动结束
       */
      limit?: number
      /**
       * @description 是否保留绘制图形
       */
      keep?: boolean
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type CircleReturn = {
      id: string
      center: Cartesian3
      radius: number
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [color = {@link Color.RED}] 填充色
     * @property [keep = true] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onFinish] 绘制结束的回调
     */
    export type Circle = Base & {
      color?: Color
      /**
       * @description 是否保留绘制图形
       */
      keep?: boolean
      ground?: boolean
      onFinish?: (center: Cartesian3, radius: number) => void
    }

    export type RectangleReturn = {
      id: string
      rectangle: Rect
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [color = {@link Color.RED}] 填充色
     * @property [keep = true] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onFinish] 绘制结束的回调
     */
    export type Rectangle = Base & {
      color?: Color
      /**
       * @description 是否保留绘制图形
       */
      keep?: boolean
      ground?: boolean
      onFinish?: (rectangle: Rect) => void
    }

    export type PolygonReturn = {
      id: string
      positions: Cartesian3[]
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [color = {@link Color.RED}] 填充色
     * @property [outlineColor = {@link Color.RED}] 边框颜色
     * @property [outlineWidth = 1] 边框宽度
     * @property [keep = true] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onMove] 绘制时鼠标移动的回调
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Polygon = Base & {
      color?: Color
      outlineColor?: Color
      outlineWidth?: number
      keep?: boolean
      ground?: boolean
      onMove?: (position: Cartesian3, lastIndex: number) => void
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type PolylineReturn = {
      id: string
      positions: Cartesian3[]
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [materialType = "Color"] {@link PolylineLayer.MaterialType} 线条材质类型
     * @property [materialUniforms = { color: {@link Color.RED} }] {@link PolylineLayer.MaterialUniforms} 材质参数
     * @property [width = 2] 线条宽度
     * @property [keep = true] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onMove] 绘制时鼠标移动的回调
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Polyline = Base & {
      materialType?: PolylineLayer.MaterialType
      materialUniforms?: PolylineLayer.MaterialUniforms
      width?: number
      keep?: boolean
      ground?: boolean
      onMove?: (position: Cartesian3, lastIndex: number) => void
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type BillboardReturn = {
      id: string
      position: Cartesian3
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property image 图片
     * @property [width = 48] 图片宽度
     * @property [height = 48] 图片高度
     * @property [pixelOffset = {@link Cartesian2.ZERO}] 像素偏移
     * @property [horizontalOrigin = {@link HorizontalOrigin.CENTER}] 横向对齐
     * @property [verticalOrigin = {@link VerticalOrigin.BOTTOM}] 纵向对齐
     * @property [limit = 0] 绘制数量，`0`为无限制绘制，手动结束
     * @property [keep = true] 是否保留绘制图形
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Billboard = Base & {
      image: string
      width?: number
      height?: number
      pixelOffset?: Cartesian2
      horizontalOrigin?: HorizontalOrigin
      verticalOrigin?: VerticalOrigin
      limit?: number
      keep?: boolean
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type ModelReturn = {
      id: string
      position: Cartesian3
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property url 源
     * @property [scale = 1] 缩放
     * @property [minimumPixelSize = 24] 模型的近似最小像素
     * @property [silhouetteColor = {@link Color.LIGHTYELLOW}] 轮廓颜色
     * @property [silhouetteSize = 1] 轮廓大小
     * @property [limit = 0] 绘制数量，`0`为无限制绘制，手动结束
     * @property [keep = true] 是否保留绘制图形
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Model = Base & {
      url: string
      scale?: number
      minimumPixelSize?: number
      silhouetteColor?: Color
      silhouetteSize?: number
      limit?: number
      keep?: boolean
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type WallReturn = {
      id: string
      positions: Cartesian3[]
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [color = {@link Color.ORANGE}] 墙体颜色
     * @property [height = 2000] 墙体高度
     * @property [outlineColor = {@link Color.ORANGE}] 边框颜色
     * @property [outlineWidth = 1] 边框宽度
     * @property [closed = true] 是否形成闭合墙体
     * @property [keep = false] 是否保留绘制图形
     * @property [onMove] 绘制时鼠标移动的回调
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type Wall = Base & {
      color?: Color
      height?: number
      outlineColor?: Color
      outlineWidth?: number
      closed?: boolean
      keep?: boolean
      onMove?: (position: Cartesian3, lastIndex: number) => void
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type StraightArrowReturn = {
      id: string
      start: Cartesian3
      end: Cartesian3
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [headAngle = PI/8.5] 头部角度
     * @property [neckAngle = PI/13] 颈部角度
     * @property [tailWidthFactor = 0.1] 尾部宽度系数因子
     * @property [neckWidthFactor = 0.2] 颈部宽度系数因子
     * @property [headWidthFactor = 0.25] 头部宽度系数因子
     * @property [color = {@link Color.YELLOW}] 填充颜色
     * @property [outlineColor = {@link Color.YELLOW}] 边框颜色
     * @property [outlineWidth = 1] 边框宽度
     * @property [keep = false] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onFinish] 绘制结束的回调
     */
    export type StraightArrow = Base & {
      headAngle?: number
      neckAngle?: number
      tailWidthFactor?: number
      neckWidthFactor?: number
      headWidthFactor?: number
      color?: Color
      outlineColor?: Color
      outlineWidth?: number
      keep?: boolean
      ground?: boolean
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type AttackArrowReturn = {
      id: string
      positions: Cartesian3[]
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [headHeightFactor = 0.18] 头部高度系数因子
     * @property [headWidthFactor = 0.3] 头部宽度系数因子
     * @property [neckHeightFactor = 0.85] 颈部高度系数因子
     * @property [neckWidthFactor = 0.15] 颈部宽度系数因子
     * @property [tailWidthFactor = 0.1] 尾部宽度系数因子
     * @property [headTailFactor = 0.8] 头尾系数因子
     * @property [swallowTailFactor = 1] 燕尾系数因子
     * @property [color = {@link Color.YELLOW}] 填充颜色
     * @property [outlineColor = {@link Color.YELLOW}] 边框颜色
     * @property [outlineWidth = 1] 边框宽度
     * @property [keep = false] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type AttackArrow = Base & {
      headHeightFactor?: number
      headWidthFactor?: number
      neckHeightFactor?: number
      neckWidthFactor?: number
      tailWidthFactor?: number
      headTailFactor?: number
      swallowTailFactor?: number
      color?: Color
      outlineColor?: Color
      outlineWidth?: number
      keep?: boolean
      ground?: boolean
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    export type PincerArrowReturn = {
      id: string
      positions: Cartesian3[]
    }

    /**
     * @extends Base {@link Base} 基本属性
     * @property [headHeightFactor = 0.25] 头部高度系数因子
     * @property [headWidthFactor = 0.3] 头部宽度系数因子
     * @property [neckHeightFactor = 0.85] 颈部高度系数因子
     * @property [neckWidthFactor = 0.15] 颈部宽度系数因子
     * @property [color = {@link Color.YELLOW}] 填充颜色
     * @property [outlineColor = {@link Color.YELLOW}] 边框颜色
     * @property [outlineWidth = 1] 边框宽度
     * @property [keep = false] 是否保留绘制图形
     * @property [ground = false] 图形是否贴地
     * @property [onEvery] 每一个点绘制的回调
     * @property [onFinish] 绘制结束的回调
     */
    export type PincerArrow = Base & {
      neckWidthFactor?: number
      headWidthFactor?: number
      headHeightFactor?: number
      neckHeightFactor?: number
      color?: Color
      outlineColor?: Color
      outlineWidth?: number
      keep?: boolean
      ground?: boolean
      onEvery?: (position: Cartesian3, index: number) => void
      onFinish?: (positions: Cartesian3[]) => void
    }

    /**
     * @description 按类别移除绘制对象参数
     * @property [point] 点
     * @property [billboard] 广告牌
     * @property [circle] 园
     * @property [model] 模型
     * @property [wall] 墙体
     * @property [rectangle] 矩形
     * @property [polygon] 多边形
     * @property [polyline] 线段
     * @property [straightArrow] 直线箭头
     * @property [attackArrow] 攻击箭头
     * @property [pincerArrow] 嵌击箭头
     * @property [stroke] 笔触
     * @property [label] 标签
     */
    export type RemoveOptions = {
      point?: boolean
      billboard?: boolean
      circle?: boolean
      model?: boolean
      wall?: boolean
      rectangle?: boolean
      polygon?: boolean
      polyline?: boolean
      straightArrow?: boolean
      attackArrow?: boolean
      pincerArrow?: boolean
      stroke?: boolean
      label?: boolean
    }
  }

  /**
   * @description 绘制工具
   * @example
   * ```
   * const earth = useEarth
   * const draw = earth.useDraw()
   * //or
   * const draw = new Draw(earth)
   * ```
   */
  export class Draw {
    constructor(earth: Earth)
    /**
     * @description 根据ID获取动态绘制实体
     * @param id ID
     * @returns 实体
     */
    getEntity(
      id: string
    ):
      | Layer.Cache<Billboard, Layer.Data<unknown>>
      | Layer.Cache<Primitive | GroundPolylinePrimitive, Layer.Data<unknown>>
      | Layer.Cache<PointPrimitive, Layer.Data<unknown>>
      | Layer.Cache<Model, ModelLayer.Data<unknown>>
      | undefined
    /**
     * @description 设置动态绘制对象是否可编辑
     * @param value 是否可编辑
     */
    setEditable(value: boolean): void
    /**
     * @description 动态绘制或编辑事件订阅
     * @param target {@link DrawType} 绘制类型
     * @param event {@link SubEventType} 事件类型
     * @param callback {@link Draw.EventCallback} 回调
     */
    subscribe(target: DrawType, event: SubEventType, callback: Draw.EventCallback): void
    /**
     * @description 取消动态绘制或编辑事件订阅
     * @param target {@link DrawType} 绘制类型
     * @param event {@link SubEventType} 事件类型
     * @param callback {@link Draw.EventCallback} 回调
     */
    unsubscribe(target: DrawType, event: SubEventType, callback: Draw.EventCallback): void
    /**
     * @description 添加可编辑形状到绘制工具中
     * @param type {@link EditableType} 类型
     * @param option {@link Draw.Features} 配置项
     * @example
     * ```
     * const earth = useEarth()
     * const drawTool = earth.useDraw()
     * drawTool.setEditable(true)
     *
     * //polyline
     *  const module = DefaultModuleName.POLYLINE
     *  const ground = false
     *  const width = 2
     *  const materialType = "Color"
     *  const materialUniforms = { color: Color.RED }
     *  const positions = Cartesian3.fromDegreesArray([100, 30, 105, 30, 105, 35])
     *  drawTool.addFeature(EditableType.POLYLINE, {
     *    id: "polyline",
     *    module,
     *    ground,
     *    width,
     *    materialType,
     *    materialUniforms,
     *    lines: [positions],
     *    data: {
     *      type: DrawType.POLYLINE,
     *      positions,
     *      attr: {
     *        module,
     *        ground,
     *        width,
     *        materialType,
     *        materialUniforms,
     *      },
     *    },
     *  })
     *
     * //point
     *   const module = DefaultModuleName.POINT
     *   const pixelSize = 10
     *   const color = Color.RED
     *   const position = Cartesian3.fromDegrees(105, 30)
     *   drawTool.addFeature(EditableType.POINT, {
     *     id: "point",
     *     module,
     *     pixelSize,
     *     color,
     *     position,
     *     outlineWidth: 0,
     *     data: {
     *       type: DrawType.POINT,
     *       positions: [position],
     *       attr: { color, pixelSize, module },
     *     },
     *   })
     *
     * //polygon
     *   const module = DefaultModuleName.POLYGON
     *   const ground = true
     *   const color = Color.RED.withAlpha(0.3)
     *   const positions = Cartesian3.fromDegreesArray([105, 30, 105, 35, 100, 30])
     *   const outlineWidth = 1
     *   const outlineColor = Color.RED
     *   drawTool.addFeature(EditableType.POLYGON, {
     *     id: "polygon",
     *     module,
     *     positions,
     *     color,
     *     ground,
     *     outline: {
     *       width: outlineWidth,
     *       materialType: "Color",
     *       materialUniforms: { color: outlineColor },
     *     },
     *     usePointHeight: false,
     *     data: {
     *       type: DrawType.POLYGON,
     *       positions,
     *       attr: { color, outlineColor, outlineWidth, ground, module },
     *     },
     *   })
     * ```
     */
    addFeature(type: EditableType.ATTACK_ARROW, option: PolygonLayer.AddParam<Dynamic.AttackArrow>): void
    addFeature(type: EditableType.BILLBOARD, option: BillboardLayer.AddParam<Dynamic.Billboard>): void
    addFeature(type: EditableType.CIRCLE, option: EllipseLayer.AddParam<Dynamic.Circle>): void
    addFeature(type: EditableType.LABEL, option: LabelLayer.AddParam<Dynamic.Label>): void
    addFeature(type: EditableType.MODEL, option: ModelLayer.AddParam<Dynamic.Model>): void
    addFeature(type: EditableType.PINCER_ARROW, option: PolygonLayer.AddParam<Dynamic.PincerArrow>): void
    addFeature(type: EditableType.POINT, option: PointLayer.AddParam<Dynamic.Point>): void
    addFeature(type: EditableType.POLYGON, option: PolygonLayer.AddParam<Dynamic.Polygon>): void
    addFeature(type: EditableType.POLYLINE, option: PolylineLayer.AddParam<Dynamic.Polyline>): void
    addFeature(type: EditableType.RECTANGLE, option: RectangleLayer.AddParam<Dynamic.Rectangle>): void
    addFeature(type: EditableType.STRAIGHT_ARROW, option: PolygonLayer.AddParam<Dynamic.StraightArrow>): void
    addFeature(type: EditableType.WALL, option: WallLayer.AddParam<Dynamic.Wall>): void
    /**
     * @description 绘制
     * @param type {@link DrawType} 绘制类型
     * @param option {@link Draw.Options} 类型参数
     * @returns {Promise} 绘制的Promise
     * @example
     * ```
     * const earth = useEarth()
     * const tool = new Draw(earth)
     *
     * //attack arrow
     * tool.draw(DrawType.ATTACK_ARROW, {
     *  headHeightFactor: 0.18,
     *  headWidthFactor: 0.3,
     *  neckHeightFactor: 0.85,
     *  neckWidthFactor: 0.15,
     *  tailWidthFactor: 0.1,
     *  headTailFactor: 0.8,
     *  swallowTailFactor: 1,
     *  color: Color.RED,
     *  outlineColor: Color.RED,
     *  outlineWidth: 1,
     *  keep: true,
     *  ground: true,
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //billboard
     * tool.draw(DrawType.BILLBOARD, {
     *  image: "/billboard.png",
     *  width: 48,
     *  height: 48,
     *  pixelOffset: new Cartesian2(0, 0),
     *  horizontalOrigin: HorizontalOrigin.CENTER,
     *  verticalOrigin: VerticalOrigin.BOTTOM,
     *  limit: 3,
     *  keep: true,
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //circle
     * tool.draw(DrawType.CIRCLE, {
     *  color: Color.RED,
     *  keep: true,
     *  ground: true,
     *  onFinish: (center, radius) => { console.log(center, radius) },
     * })
     *
     * //model
     * tool.draw(DrawType.MODEL, {
     *  url: "/Drone.glb",
     *  scale: 1,
     *  silthouetteSize: 1,
     *  silthouetteColor: Color.YELLOW,
     *  minimumPixelSize: 24,
     *  limit: 3,
     *  keep: true,
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //wall
     * tool.draw(DrawType.WALL, {
     *  color: Color.RED,
     *  height: 2000,
     *  outlineColor: Color.RED,
     *  outlineWidth: 1,
     *  closed: true,
     *  keep: true,
     *  onMove: (position, lastIndex) => { console.log(position, lastIndex) },
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //pincer arrow
     * tool.draw(DrawType.PINCER_ARROW, {
     *  headWidthFactor: 0.3,
     *  headHeightFactor: 0.25,
     *  neckWidthFactor: 0.15,
     *  neckHeightFactor: 0.85,
     *  color: Color.YELLOW,
     *  outlineColor: Color.YELLOW,
     *  outlineWidth: 1,
     *  keep: true,
     *  ground: true,
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //point
     * tool.draw(DrawType.POINT, {
     *  color: Color.RED,
     *  pixelSize: 10,
     *  limit: 3,
     *  keep: true,
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //polygon
     * tool.draw(DrawType.POLYGON, {
     *  color: Color.RED,
     *  outlineColor: Color.RED,
     *  outlineWidth: 1,
     *  keep: true,
     *  ground: true,
     *  onMove: (position, lastIndex) => { console.log(position, lastIndex) },
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //polyline
     * tool.draw(DrawType.POLYLINE, {
     *  width: 2,
     *  materialType: "Color",
     *  materialUniforms: { color: Color.RED },
     *  keep: true
     *  ground: true,
     *  onMove: (position, lastIndex) => { console.log(position, lastIndex) },
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //rectangle
     * tool.draw(DrawType.RECTANGLE, {
     *  color: Color.RED,
     *  keep: true,
     *  ground: true,
     *  onFinish: (rectangle) => { console.log(rectangle) },
     * })
     *
     * //straight arrow
     * tool.draw(DrawType, {
     *  headAngle: Math.PI / 8.5,
     *  neckAngle: Math.PI / 13,
     *  tailWidthFactor: 0.1,
     *  neckWidthFactor: 0.2,
     *  headWidthFactor: 0.25,
     *  color: Color.RED,
     *  outlineColor: Color.RED,
     *  outlineWidth: 1,
     *  keep: true,
     *  ground: true,
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //stroke
     * tool.draw(DrawType.STROKE, {
     *  width: 2,
     *  color: Color.RED,
     *  keep: true
     *  ground: true,
     *  onFinish: (positions) => { console.log(positions) },
     * })
     *
     * //label
     * tool.draw(DrawType.LABEL, {
     *  text = "新建文本",
     *  font = "14px sans-serif",
     *  scale = 1,
     *  fillColor = Color.BLACK,
     *  outlineColor = Color.WHITE,
     *  outlineWidth = 1,
     *  showBackground = true,
     *  backgroundColor = Color.LIGHTGREY,
     *  backgroundPadding = new Cartesian2(5, 5),
     *  style = LabelStyle.FILL_AND_OUTLINE,
     *  pixelOffset = new Cartesian2(0, 0),
     *  limit = 0,
     *  keep = true,
     *  onEvery: (position, index) => { console.log(position, index) },
     *  onFinish: (positions) => { console.log(positions) },
     * })
     * ```
     */
    draw(type: DrawType.ATTACK_ARROW, option: Draw.AttackArrow): Promise<Draw.AttackArrowReturn>
    draw(type: DrawType.BILLBOARD, option: Draw.Billboard): Promise<Draw.BillboardReturn[]>
    draw(type: DrawType.CIRCLE, option: Draw.Circle): Promise<Draw.CircleReturn>
    draw(type: DrawType.MODEL, option: Draw.Model): Promise<Draw.ModelReturn[]>
    draw(type: DrawType.WALL, option: Draw.Wall): Promise<Draw.WallReturn>
    draw(type: DrawType.PINCER_ARROW, option: Draw.PincerArrow): Promise<Draw.PincerArrowReturn>
    draw(type: DrawType.POINT, option: Draw.Point): Promise<Draw.PointReturn[]>
    draw(type: DrawType.POLYGON, option: Draw.Polygon): Promise<Draw.PolygonReturn>
    draw(type: DrawType.POLYLINE, option: Draw.Polyline): Promise<Draw.PolylineReturn>
    draw(type: DrawType.RECTANGLE, option: Draw.Rectangle): Promise<Draw.RectangleReturn>
    draw(type: DrawType.STRAIGHT_ARROW, option: Draw.StraightArrow): Promise<Draw.StraightArrowReturn>
    draw(type: DrawType.STROKE, option: Draw.Stroke): Promise<Draw.StrokeReturn>
    draw(type: DrawType.LABEL, option: Draw.Label): Promise<Draw.LabelReturn[]>
    /**
     * @description 清除所有动态绘制对象
     * @example
     * ```
     * const earth = useEarth()
     * const draw = new Draw()
     * draw.remove()
     * ```
     */
    remove(): void
    /**
     * @description 按ID清除动态绘制对象
     * @param id ID
     * @example
     * ```
     * const earth = useEarth()
     * const draw = new Draw()
     * draw.remove("some_id")
     * ```
     */
    remove(id: string): void
    /**
     * @description 按图形类别清除动态绘制对象
     * @param option 类别
     * @example
     * ```
     * const earth = useEarth()
     * const draw = new Draw()
     * draw.remove({ polygon: true, polyline: true })
     * ```
     */
    remove(option: Draw.RemoveOptions): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace Dynamic {
    export type Layer =
      | PointLayer<Point>
      | BillboardLayer<Billboard>
      | EllipseLayer<Circle>
      | ModelLayer<Model>
      | RectangleLayer<Rectangle>
      | PolygonLayer<Polygon>
      | PolylineLayer<Polyline>
      | WallLayer<Wall>
      | LabelLayer<Label>
      | PolygonLayer<AttackArrow>
      | PolygonLayer<PincerArrow>
      | PolygonLayer<StraightArrow>
      | PolylineLayer

    export type Data<T, D = unknown> = {
      type: T
      positions: Cartesian3[]
      attr: {
        [K in keyof D]-?: D[K]
      }
    }

    export type AttackArrow = Data<
      DrawType.ATTACK_ARROW,
      Omit<Draw.AttackArrow, "onFinish" | "onEvery" | "keep" | "id">
    >

    export type Billboard = Data<
      DrawType.BILLBOARD,
      Omit<Draw.Billboard, "onEvery" | "onFinish" | "keep" | "limit" | "id">
    >

    export type Circle = Data<DrawType.CIRCLE, Omit<Draw.Circle, "onFinish" | "keep" | "id"> & { radius: number }>

    export type Label = Data<DrawType.LABEL, Omit<Draw.Label, "id" | "limit" | "keep" | "onEvery" | "onFinish">>

    export type Model = Data<
      DrawType.MODEL,
      Omit<Draw.Model, "onEvery" | "onFinish" | "keep" | "color" | "limit" | "id">
    >

    export type PincerArrow = Data<
      DrawType.PINCER_ARROW,
      Omit<Draw.PincerArrow, "onFinish" | "onEvery" | "keep" | "id">
    >

    export type Point = Data<DrawType.POINT, Pick<Draw.Point, "color" | "pixelSize" | "module">>

    export type Polygon = Data<DrawType.POLYGON, Omit<Draw.Polygon, "onEvery" | "onFinish" | "onMove" | "keep" | "id">>

    export type Polyline = Data<
      DrawType.POLYLINE,
      Pick<Draw.Polyline, "width" | "ground" | "module" | "materialType" | "materialUniforms">
    >

    export type Rectangle = Data<DrawType.RECTANGLE, Pick<Draw.Rectangle, "color" | "ground" | "module">>

    export type StraightArrow = Data<DrawType.STRAIGHT_ARROW, Omit<Draw.StraightArrow, "onFinish" | "keep" | "id">>

    export type Wall = Data<DrawType.WALL, Omit<Draw.Wall, "id" | "keep" | "onMove" | "onEvery" | "onFinish">>
  }

  /**
   * @description 动态绘制基类
   */
  export abstract class Dynamic<L extends Dynamic.Layer> {
    abstract type: string
    protected layer: L
    protected viewer: Viewer
    protected scene: Scene
    protected camera: Camera
    protected eventBus: EventBus
    protected editHandler: ScreenSpaceEventHandler
    protected cacheHandler?: ScreenSpaceEventHandler
    protected cacheEntity?: Entity
    constructor(earth: Earth, layer: L)
    /**
     * @description 开始绘制事件
     * @returns 事件管理器
     */
    protected startEvent(): ScreenSpaceEventHandler
    /**
     * @description 结束绘制事件
     * @param handler 要结束的事件管理器
     */
    protected endEvent(handler: ScreenSpaceEventHandler): void
    /**
     * @description 屏幕坐标获取球体上的点
     * @param point {@link Cartesian2} 屏幕坐标
     * @returns
     */
    protected getPointOnEllipsoid(point: Cartesian2): Cartesian3 | undefined
    /**
     * @description 锁定镜头控制权
     * @param value 值
     */
    protected setViewControl(value: boolean): void
    /**
     * @description 添加实体的抽象方法
     * @param param 选项
     */
    abstract add(param: any): void
    /**
     * @description 动态绘制的抽象方法
     * @param param 选项
     */
    abstract draw(param: any): Promise<unknown>
    /**
     * @description 动态编辑的抽象方法
     * @param id 编辑的实体ID
     */
    abstract edit(id: string): Promise<unknown>
    /**
     * @description 根据ID获取动态绘制实体
     * @param id ID
     * @returns 实体
     */
    getEntity(
      id: string
    ):
      | Layer.Cache<Billboard, Layer.Data<Dynamic.Billboard>>
      | Layer.Cache<
          Primitive | GroundPolylinePrimitive,
          Layer.Data<
            | Dynamic.AttackArrow
            | Dynamic.Circle
            | Dynamic.PincerArrow
            | Dynamic.Polygon
            | Dynamic.Polyline
            | Dynamic.Rectangle
            | Dynamic.StraightArrow
          >
        >
      | Layer.Cache<PointPrimitive, Layer.Data<Dynamic.Point>>
      | Layer.Cache<Model, ModelLayer.Data<Dynamic.Model>>
      | Layer.Cache<Label, Layer.Data<Dynamic.Label>>
      | undefined
    /**
     * @description 强制终断，仅终断绘制，不终断编辑
     */
    interrupt(): void
    /**
     * @description 清除所有动态绘制对象
     */
    remove(): void
    /**
     * @description 按ID清除动态绘制对象
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): void
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

  /**
   * @description 热力图
   * @param earth {@link Earth} 地球实例
   * @param [options] {@link Heatmap.ConstructorOptions} 参数
   * @example
   * ```
   * const earth = useEarth()
   * const heatmap = new Heatmap(earth)
   * heatmap.render({ min: 0, max: 5, data: [] })
   * ```
   */
  export class Heatmap {
    id: string
    constructor(earth: Earth, options?: Heatmap.ConstructorOptions)
    /**
     * @description 设置WGS84位置的数据
     * @param param 数据
     * @return `boolean`
     */
    setWGS84Data(param: { data: Heatmap.Data; rect: Rectangle }): boolean
    /**
     * @description 渲染热力图
     * @param data {@link Heatmap.Data} 数据
     */
    render(data: Heatmap.Data): void
    /**
     * @description 设置是否在地图上显示热图
     * @param value
     */
    show(value: boolean): void
    /**
     * @description 移除地图上的热图
     */
    remove(): void
    /**
     * @description 销毁热图
     */
    destroy(): void
  }

  export namespace BillboardLayer {
    type Attributes = "color" | "position" | "image" | "rotation" | "scale"

    export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

    export type LabelSetParam<T> = Omit<LabelLayer.SetParam<T>, "position">

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property position {@link Cartesian3} 位置
     * @property [pixelOffset = {@link Cartesian2.ZERO}] 像素偏移
     * @property [horizontalOrigin = {@link HorizontalOrigin.CENTER}] 横向对齐
     * @property [verticalOrigin = {@link VerticalOrigin.BOTTOM}] 纵向对齐
     * @property [heightReference = {@link HeightReference.NONE}] 位置高度参考
     * @property [scale = 1] 缩放
     * @property image 图片
     * @property [color = {@link Color.WHITE}] 颜色
     * @property [rotation = 0] 旋转
     * @property [alignedAxis = {@link Cartesian3.ZERO}] 轴向量
     * @property [width] 宽度
     * @property [height] 高度
     * @property [scaleByDistance] {@link NearFarScalar} 按距离设置缩放
     * @property [translucencyByDistance] {@link NearFarScalar} 按距离设置半透明度
     * @property [pixelOffsetScaleByDistance] {@link NearFarScalar} 按距离设置像素偏移
     * @property [sizeInMeters = false] 宽高以`m`为单位，否则`px`
     * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 按距离设置可见性
     * @property [disableDepthTestDistance] 按距离禁用地形深度检测
     * @property [label] {@link LabelAddParam} 对应标签
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      position: Cartesian3
      pixelOffset?: Cartesian2
      horizontalOrigin?: HorizontalOrigin
      verticalOrigin?: VerticalOrigin
      heightReference?: HeightReference
      scale?: number
      image: string
      color?: Color
      rotation?: number
      alignedAxis?: Cartesian3
      width?: number
      height?: number
      scaleByDistance?: NearFarScalar
      translucencyByDistance?: NearFarScalar
      pixelOffsetScaleByDistance?: NearFarScalar
      sizeInMeters?: boolean
      distanceDisplayCondition?: DistanceDisplayCondition
      disableDepthTestDistance?: number
      label?: LabelAddParam<T>
    }

    export type SetParam<T> = Partial<Pick<AddParam<T>, Attributes>> & { label?: LabelSetParam<T> }
  }

  /**
   * @decription 广告牌图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const billboardLayer = new BillboardLayer(earth)
   * //or
   * const billboardLayer = earth.useDefaultLayers().billboard
   * ```
   */
  export class BillboardLayer<T = unknown> extends Layer<BillboardCollection, Billboard, Layer.Data<T>> {
    labelLayer: LabelLayer<T>
    constructor(earth: Earth)
    /**
     * @description 新增广告牌
     * @param param {@link BillboardLayer.AddParam} 广告牌参数
     * @example
     * ```
     * const earth = useEarth()
     * const billboardLayer = new BillboardLayer(earth)
     * billboardLayer.add({
     *  image: "/billboard.png",
     *  position: Cartesian3.fromDegrees(104, 31),
     *  width: 48,
     *  height: 48,
     *  scale: 1,
     *  rotation: 0,
     *  sizeInMeters: true,
     *  pixelOffset: new Cartesian2(0, 0),
     *  horizontalOrigin: HorizontalOrigin.CENTER,
     *  verticalOrigin: VerticalOrigin.BOTTOM,
     *  heightReference: HeightReference.CLAMP_TO_GROUND,
     *  distanceDisplayCondition: new DistanceDisplayCondition(0, 5000),
     * })
     * ```
     */
    add(param: BillboardLayer.AddParam<T>): void
    /**
     * @description 修改广告牌
     * @param id 广告牌ID
     * @param param {@link BillboardLayer.SetParam} 广告牌参数
     * @example
     * ```
     * const earth = useEarth()
     * const billboardLayer = new BillboardLayer(earth)
     * billboardLayer.set("some_id", {
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  image: "/billboard.png",
     *  scale: 2,
     * })
     * ```
     */
    set(id: string, param: BillboardLayer.SetParam<T>): void
    /**
     * @description 隐藏所有广告牌
     */
    hide(): void
    /**
     * @description 隐藏所有广告牌
     * @param id 根据ID隐藏广告牌
     */
    hide(id: string): void
    /**
     * @description 显示所有广告牌
     */
    show(): void
    /**
     * @description 根据ID显示广告牌
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有广告牌
     */
    remove(): void
    /**
     * @description 根据ID移除广告牌
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

  export namespace CloudLayer {
    /**
     * @property [noiseDetail = 16] 噪声纹理中所需的细节量
     * @property [noiseOffset = {@link Cartesian3.ZERO}] 噪声纹理中所需的偏移量
     */
    export type ConstructorOptions = {
      noiseDetail?: number
      noiseOffset?: Cartesian3
    }

    /**
     * @property position {@link Cartesian3} 位置
     * @property [id] ID
     * @property [data] 附加数据
     * @property [show = true] 是否显示
     * @property [brightness = 0] 灰度 `[0, 1]`
     * @property [color = {@link Color.WHITE}] 颜色
     * @property [scale] {@link Cartesian2} 缩放
     * @property [maximumSize] {@link Cartesian3} 云体最大渲染椭球体积
     * @property [slice = 0.5] 切片值 `[0, 1]`，为云的外观选择特定横截面
     * 1. 低于 0.2 的值可能会导致横截面太小，并且椭圆体的边缘将可见，高于 0.7 的值将导致云看起来更小
     * 2. 应完全避免 [0.1, 0.9] 范围之外的值，因为它们不会产生理想的结果
     * 3. 如果 `slice` 设置为负数，云将不会渲染横截面，相反，它将渲染可见的椭圆体外部
     * 4. 对于 `maximumSize.z` 值较小的云，负值 `slice` 结果理想，但对较大的云，可能会导致云扭曲到填满椭圆体
     */
    export type AddParam<T> = {
      position: Cartesian3
      id?: string
      data?: T
      show?: boolean
      brightness?: number
      color?: Color
      scale?: Cartesian2
      maximumSize?: Cartesian3
      slice?: number
    }

    export type SetParam<T> = Omit<Partial<AddParam<T>>, "id" | "data">
  }

  /**
   * @decription 积云图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @param [options] {@link CloudLayer.ConstructorOptions} 参数
   * @example
   * ```
   * const earth = useEarth()
   * const cloudLayer = new CloudLayer(earth)
   * ```
   */
  export class CloudLayer<T = unknown> extends Layer<CloudCollection, CumulusCloud, Layer.Data<T>> {
    constructor(earth: Earth, options?: CloudLayer.ConstructorOptions)
    /**
     * @description 新增积云
     * @param param {@link CloudLayer.AddParam} 新增参数
     * @example
     * ```
     * const earth = useEarth()
     * const cloudLayer = new CloudLayer(earth)
     * cloudLayer.add({
     *  id: "cloud",
     *  show: true,
     *  brightness: 0.6,
     *  color: Color.WHITE,
     *  position: Cartesian3.fromDegrees(104, 30, 5000),
     *  scale: new Cartesian2(24, 10),
     *  maximumSize: new Cartesian3(14, 9, 10),
     *  slice: 0.4,
     * })
     * ```
     */
    add(param: CloudLayer.AddParam<T>): void
    /**
     * @description 按ID修改积云
     * @param id ID
     * @param param {@link CloudLayer.SetParam} 修改参数
     */
    set(id: string, param: CloudLayer.SetParam<T>): void
  }

  export namespace DiffusePointLayer {
    /**
     * @property pointSVG 点的svg图像
     * @property position {@link Cartesian3} 位置
     * @property [data] 数据
     * @property callback 回调
     */
    export type Data<T> = {
      pointSVG: SVGElement
      position: Cartesian3
      data?: T
      callback: () => void
    }

    /**
     * @property position {@link Cartesian3} 位置
     * @property [id] ID
     * @property [className] 类名
     * @property [pixelSize = 10] 像素大小
     * @property [color = {@link Color.RED}] 颜色
     * @property [strokeColor = {@link Color.RED}] 描线颜色
     * @property [data] 数据
     */
    export type AddParam<T> = {
      position: Cartesian3
      id?: string
      className?: string[]
      pixelSize?: number
      color?: Color
      strokeColor?: Color
      data?: T
    }

    /**
     * @property [position] {@link Cartesian3} 位置
     * @property [data] 数据
     */
    export type SetParam<T> = {
      position?: Cartesian3
      data?: T
    }
  }

  /**
   * @description 扩散点图层
   * @example
   * ```
   * const earth = useEarth()
   * const diffusePointLayer = new DiffusePointLayer(earth)
   * ```
   */
  export class DiffusePointLayer<T = unknown> {
    constructor(earth: Earth)
    /**
     * @description 设置是否可被销毁
     * @param status
     */
    setAllowDestroy(status: boolean): void
    /**
     * @description 获取是否可被销毁的属性
     */
    getAllowDestroy(): boolean
    /**
     * @description 新增一个扩散点
     * @param param 参数
     */
    add(param: DiffusePointLayer.AddParam<T>): void
    /**
     * @description 设置扩散点的位置和数据信息
     * @param id ID
     * @param param {@link DiffusePointLayer.SetParam}，参数
     */
    set(id: string, param: DiffusePointLayer.SetParam<T>): void
    /**
     * @description 获取附加数据
     * @param id ID
     */
    getData(id: string): T
    /**
     * @description 移除所有扩散点
     */
    remove(): void
    /**
     * @description 按ID移除扩散点
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

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
  export class EllipseLayer<T = unknown> extends Layer<
    PrimitiveCollection,
    Primitive | GroundPrimitive,
    Layer.Data<T>
  > {
    labelLayer: LabelLayer<T>
    constructor(earth: Earth)
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
    add(param: EllipseLayer.AddParam<T>): void
    /**
     * @description 隐藏所有椭圆
     */
    hide(): void
    /**
     * @description 隐藏所有椭圆
     * @param id 根据ID隐藏椭圆
     */
    hide(id: string): void
    /**
     * @description 显示所有椭圆
     */
    show(): void
    /**
     * @description 根据ID显示椭圆
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有椭圆
     */
    remove(): void
    /**
     * @description 根据ID移除椭圆
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

  export namespace EllipsoidLayer {
    export type Attributes =
      | "radii"
      | "material"
      | "outlineColor"
      | "outlineWidth"
      | "stackPartitions"
      | "slicePartitions"

    export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

    export type LabelSetParam<T> = Omit<LabelLayer.SetParam<T>, "position">

    /**
     * @extends Layer.Data {@link Layer.Data}
     * @property center {@link Cartesian3} 中心点
     * @property radii {@link Cartesian3} 球体三轴半径
     * @property hpr {@link HeadingPitchRoll} 欧拉角
     */
    export type Data<T> = Layer.Data<T> & {
      center: Cartesian3
      radii: Cartesian3
      hpr: HeadingPitchRoll
    }

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property center {@link Cartesian3} 中心点
     * @property radii {@link Cartesian3} 球体三轴半径
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [material] {@link Material} 材质
     * @property [outlineColor = {@link Color.AQUAMARINE}]  边框颜色
     * @property [outlineWidth = 1] 边框宽度
     * @property [stackPartitions = 16] 纵向切片数
     * @property [slicePartitions = 8] 径向切片数
     * @property [label] {@link LabelAddParam} 对应标签
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      center: Cartesian3
      radii: Cartesian3
      hpr?: HeadingPitchRoll
      material?: Material
      outlineColor?: Color
      outlineWidth?: number
      stackPartitions?: number
      slicePartitions?: number
      label?: LabelAddParam<T>
    }

    /**
     * @property [center] {@link Cartesian3} 中心点
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [label] {@link LabelSetParam} 对应标签
     */
    export type SetParam<T> = {
      center?: Cartesian3
      hpr?: HeadingPitchRoll
      label?: LabelSetParam<T>
    }
  }

  /**
   * @description 球、椭球、模型包络
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const ellipsoidLayer = new EllipsoidLayer(earth)
   * ```
   */
  export class EllipsoidLayer<T = unknown> extends Layer<PrimitiveCollection, Primitive, EllipsoidLayer.Data<T>> {
    labelLayer: LabelLayer<T>
    constructor(earth: Earth)
    /**
     * @description 当前球体集合的二维投影包络计算
     * @example
     * ```
     * const earth = useEarth()
     * const envelope = new EllipsoidLayer(earth)
     * envelope.calcEnvProjection()
     * ```
     */
    calcEnvProjection(): void
    /**
     * @description 新增椭球 / 包络
     * @param param {@link EllipsoidLayer.AddParam} 新增参数
     * @example
     * ```
     * const earth = useEarth()
     * const ellipsoidLayer = new EllipsoidLayer(earth)
     * ellipsoidLayer.add({
     *  center: Cartesian3.fromDegrees(104, 31, 5000),
     *  radii: new Cartesian3(1000, 2000, 1500),
     *  material: Material.fromType("Color", {
     *    color: Color.AQUAMARINE.withAlpha(0.25),
     *  }),
     *  outlineColor: Color.AQUAMARINE.withAlpha(0.5),
     *  outlineWidth: 1,
     *  stackPartitions: 16,
     *  slicePartitions: 8,
     *  hpr: HeadingPitchRoll.fromDegrees(0, 0, 0),
     * })
     * ```
     */
    add(param: EllipsoidLayer.AddParam<T>): void
    /**
     * @description 根据ID修改包络
     * @param id 包络ID
     * @param param {@link EllipsoidLayer.SetParam} 包络参数
     * @example
     * ```
     * const earth = useEarth()
     * const ellipsoidLayer = new EllipsoidLayer(earth)
     * ellipsoidLayer.set("some_id", {
     *  center: Cartesian3.fromDegrees(104, 31, 8000),
     *  hpr: HeadingPitchRoll.fromDegrees(0, 0, Math.PI / 4),
     * })
     * ```
     */
    set(id: string, param: EllipsoidLayer.SetParam<T>): void
    /**
     * @description 隐藏所有包络
     */
    hide(): void
    /**
     * @description 隐藏所有包络
     * @param id 根据ID隐藏包络
     */
    hide(id: string): void
    /**
     * @description 显示所有包络
     */
    show(): void
    /**
     * @description 根据ID显示包络
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有包络
     */
    remove(): void
    /**
     * @description 根据ID移除包络
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

  export namespace LabelLayer {
    export type Attributes = "id" | "module" | "position"

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property position {@link Cartesian3} 位置
     * @property text 文本
     * @property [font = ”14px sans-serif] 字体
     * @property [fillColor = {@link Color.RED}] 字体色
     * @property [outlineColor = {@link Color.RED}] 字体描边色
     * @property [outlineWidth = 1] 字体描边宽度
     * @property [backgroundColor = new {@link Color}(0.165, 0.165, 0.165, 0.8)] 背景色
     * @property [showBackground = false] 是否渲染背景
     * @property [backgroundPadding = new {@link Cartesian2}(7, 5)] 背景边距
     * @property [style = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [pixelOffset = {@link Cartesian2.ZERO}] 像素偏移
     * @property [eyeOffset = {@link Cartesian3.ZERO}] 观察者偏移
     * @property [horizontalOrigin = {@link HorizontalOrigin.CENTER}] 横向对齐
     * @property [verticalOrigin = {@link VerticalOrigin.CENTER}] 纵向对齐
     * @property [scale = 1] 缩放
     * @property [scaleByDistance] {@link NearFarScalar} 按距离设置缩放
     * @property [translucencyByDistance] {@link NearFarScalar} 按距离设置半透明度
     * @property [pixelOffsetScaleByDistance] {@link NearFarScalar} 按距离设置像素偏移
     * @property [heightReference = {@link HeightReference.NONE}] 位置高度参考
     * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 按距离设置可见性
     * @property [disableDepthTestDistance] 按距离禁用地形深度检测
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      position: Cartesian3
      text: string
      font?: string
      fillColor?: Color
      outlineColor?: Color
      outlineWidth?: number
      backgroundColor?: Color
      showBackground?: boolean
      backgroundPadding?: Cartesian2
      style?: LabelStyle
      pixelOffset?: Cartesian2
      eyeOffset?: Cartesian3
      horizontalOrigin?: HorizontalOrigin
      verticalOrigin?: VerticalOrigin
      scale?: number
      scaleByDistance?: NearFarScalar
      translucencyByDistance?: NearFarScalar
      pixelOffsetScaleByDistance?: NearFarScalar
      heightReference?: HeightReference
      distanceDisplayCondition?: DistanceDisplayCondition
      disableDepthTestDistance?: number
    }

    export type SetParam<T> = Partial<Omit<AddParam<T>, "id" | "module" | "data">>
  }

  /**
   * @description 标签图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const labelLayer = new LabelLayer(earth)
   * ```
   */
  export class LabelLayer<T = unknown> extends Layer<LabelCollection, Label, Layer.Data<T>> {
    constructor(earth: Earth)
    /**
     * @description 新增标签
     * @param param {@link LabelLayer.AddParam} 标签参数
     * @example
     * ```
     * const earth = useEarth()
     * const labelLayer = new LabelLayer(earth)
     * labelLayer.add({
     *  text: "This is a label.",
     *  position: Cartesian3.fromDegrees(104, 31),
     *  font: "14px sans-serif",
     *  scale: 2,
     *  fillColor: Color.RED,
     *  outlineColor: Color.WHITE,
     *  outlineWidth: 1,
     *  showBackground: true,
     *  backgroundColor: Color.LIGHTGREY,
     *  backgroundPadding: new Cartesian2(1, 1),
     *  style: LabelStyle.FILL_AND_OUTLINE,
     *  pixelOffset: new Cartesian2(0, 0),
     *  eyeOffset: new Cartesian2(0, 0),
     *  horizontalOrigin: HorizontalOrigin.CENTER,
     *  verticalOrigion: VerticalOrigin.CENTER,
     *  heightReference: HeightReference.NONE,
     *  distanceDisplayCondition: new DistanceDisplayCondition(0, 5000),
     *  disableDepthTestDistance: 0,
     * })
     * ```
     */
    add(param: LabelLayer.AddParam<T>): void
    /**
     * @description 修改标签
     * @param id 标签ID
     * @param param {@link LabelLayer.SetParam} 标签参数
     * @example
     * ```
     * const earth = useEarth()
     * const labelLayer = new LabelLayer(earth)
     * labelLayer.set("some_id", {
     *  text: "This is a label.",
     *  position: Cartesian3.fromDegrees(104, 31),
     * })
     * ```
     */
    set(id: string, param: LabelLayer.SetParam<T>): void
  }

  export namespace Layer {
    /**
     * @description 图元类型
     */
    export type Primitives =
      | Billboard
      | CumulusCloud
      | Label
      | Model
      | ParticleSystem
      | PointPrimitive
      | Primitive
      | GroundPrimitive
      | GroundPolylinePrimitive

    /**
     * @description 附加数据
     * @property [module] 模块名称
     * @property [data] 附加数据
     */
    export type Data<T> = {
      module?: string
      data?: T
    }

    /**
     * @description 新增元素的基础参数
     * @extends Data {@link Data}
     * @property [id] 唯一ID
     * @property [show] 是否展示
     */
    export type AddParam<T> = Data<T> & {
      id?: string
      show?: boolean
    }

    /**
     * @description 缓存数据
     * @property primitive 图元
     * @property data 缓存的额外数据
     */
    export type Cache<P, D> = {
      primitive: P
      data: D
    }

    /**
     * @description 从cesium `Collection` 中抽取的公共属性
     * @property show 是否展示
     * @property add 新增方法
     * @property remove 按索引（通常是图元）删除集合
     * @property removeAll 清空所有图元
     */
    export type Collection = {
      show: boolean
      add: (arg: any) => any
      remove: (arg: any) => boolean
      removeAll: () => void
    }
  }

  /**
   * @description 图层基类
   * @param earth {@link Earth} 地球实例
   * @param collection {@link Layer.Collection} 集合
   */
  export abstract class Layer<C extends Layer.Collection, P extends Layer.Primitives, D> {
    /**
     * @description 图元的集合
     */
    collection: C
    protected earth: Earth
    /**
     * @description 对象实体缓存
     */
    protected cache: Map<string, Layer.Cache<P, D>>
    protected scene: Scene
    protected viewer: Viewer
    protected camera: Camera
    constructor(earth: Earth, collection: C)
    /**
     * @description 设置是否可被销毁
     * @param status
     */
    setAllowDestroy(status: boolean): void
    /**
     * @description 获取是否可被销毁的属性
     */
    getAllowDestroy(): boolean
    /**
     * @description 绘制并缓存新增对象
     * @param id ID
     * @param param {@link Layer.Cache} 缓存的数据
     * @returns `primitive`图元实例
     */
    protected save(id: string, param: Layer.Cache<P, D>): P
    /**
     * @description 抽象新增方法
     * @param param 参数
     */
    abstract add(param: any): void
    /**
     * @description 根据ID获取实体
     * @param id ID
     * @returns 实体
     */
    getEntity(id: string): Layer.Cache<P, D> | undefined
    /**
     * @description 根据ID获取实体的数据
     * @param id ID
     * @returns 实体数据
     */
    getData(id: string): D | undefined
    /**
     * @description 根据ID测试实体条目是否存在
     * @param id ID
     * @returns 返回`boolean`值
     */
    has(id: string): boolean
    /**
     * @description 根据ID判断实体图元是否存在
     * @param id ID
     * @returns 返回`boolean`值
     */
    exist(id: string): boolean
    /**
     * @description 显示所有已缓存的实体
     */
    show(): void
    /**
     * @description 根据ID显示实体
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 隐藏所有已缓存的实体
     */
    hide(): void
    /**
     * @description 根据ID隐藏实体
     * @param id ID
     */
    hide(id: string): void
    /**
     * @description 判断所有实体是否显示
     */
    shown(): boolean
    /**
     * @description 根据ID判断实体是否显示
     * @param id ID
     * @returns 返回`boolean`值
     */
    shown(id: string): boolean
    /**
     * @description 移除图层中的所有实体
     */
    remove(): void
    /**
     * @description 根据ID移除实体
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

  export namespace ModelLayer {
    export type StopViewFunc = () => void

    export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

    export type LabelSetParam<T> = Omit<LabelLayer.SetParam<T>, "position">

    export type EnvelopeAddParam<T> = Pick<EllipsoidLayer.AddParam<T>, EllipsoidLayer.Attributes>

    export type EnvelopeSetParam<T> = Pick<EllipsoidLayer.SetParam<T>, "hpr">

    /**
     * @property position {@link Cartesian3} 位置
     * @property hpr {@link HeadingPitchRoll} 欧拉角
     */
    export type Data<T> = Layer.Data<T> & {
      position: Cartesian3
      hpr: HeadingPitchRoll
    }

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property url 模型url
     * @property position {@link Cartesian3} 位置
     * @property [scale = 1] 缩放
     * @property [asynchronous = true] 异步加载
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [minimumPixelSize = 24] 模型近似最小像素
     * @property [color] {@link Color} 颜色
     * @property [colorBlendMode = {@link ColorBlendMode.MIX}] 颜色混合模式
     * @property [colorBlendAmount = 0.5] 混合程度，在`colorBlendMode`值为`MIX`时生效
     * @property [silhouetteColor = {@link Color.LIGHTYELLOW}] 轮廓颜色
     * @property [silhouetteSize = 1] 轮廓大小
     * @property [animationLoop = {@link ModelAnimationLoop.REPEAT}] 动画方式
     * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 按距离设置可见性
     * @property [hightReference = {@link HeightReference.NONE}] 高度位置参考
     * @property [label] {@link LabelAddParam} 对应标签
     * @property [envelope] {@link EnvelopeAddParam} 对应包络
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      url: string
      position: Cartesian3
      scale?: number
      asynchronous?: boolean
      hpr?: HeadingPitchRoll
      minimumPixelSize?: number
      color?: Color
      colorBlendMode?: ColorBlendMode
      colorBlendAmount?: number
      silhouetteColor?: Color
      silhouetteSize?: number
      animationLoop?: ModelAnimationLoop
      distanceDisplayCondition?: DistanceDisplayCondition
      hightReference?: HeightReference
      label?: LabelAddParam<T>
      envelope?: EnvelopeAddParam<T>
    }

    /**
     * @property [position] {@link Cartesian3} 位置
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [minimumPixelSize = 24] 模型近似最小像素
     * @property [color] {@link Color} 颜色
     * @property [silhouetteColor = {@link Color.LIGHTYELLOW}] 轮廓颜色
     * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 按距离设置可见性
     * @property [label] {@link LabelSetParam} 对应标签
     * @property [envelope] {@link EnvelopeSetParam} 对应包络
     */
    export type SetParam<T> = {
      position?: Cartesian3
      hpr?: HeadingPitchRoll
      color?: Color
      silhouetteColor?: Color
      distanceDisplayCondition?: DistanceDisplayCondition
      label?: LabelSetParam<T>
      envelope?: EnvelopeSetParam<T>
    }

    /**
     * @property [view = {@link ViewAngle.THIRD}] 视角
     * @property [offset = new {@link Cartesian3}(50, 0, 20)] 视角偏移
     * @property [sensitivity = 0.1] 鼠标调整视角的灵敏度 `[0,1]`
     *
     */
    export type ViewOptions = {
      view?: ViewAngle
      offset?: Cartesian3
      sensitivity?: number
    }

    /**
     * @property id ID
     * @property path {@link Cartesian3} 移动路径
     * @property [split = 5] 基准间隔距离，插值点间距的数值依据
     * @property [frequency = 40] 位置更新间隔`ms`
     * @property [loop = false] 是否循环动作
     * @property [onActionEnd] 动作结束时的回调，仅自动结束且动作不循环时生效
     */
    export type ActionOptions = {
      id: string
      path: Cartesian3[]
      split?: number
      frequency?: number
      loop?: boolean
      onActionEnd?: (position: Cartesian3) => void
    }
  }

  /**
   * @description 模型图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const modelLayer = new ModelLayer(earth)
   * //or
   * const modelLayer = earth.useDefaultLayers().model
   * ```
   */
  export class ModelLayer<T = unknown> extends Layer<PrimitiveCollection, Model, ModelLayer.Data<T>> {
    labelLayer: LabelLayer<T>
    constructor(earth: Earth)
    /**
     * @description 当前模型包络集合的二维投影计算
     */
    calcEnvProjection(): void
    /**
     * @description 新增模型
     * @param param {@link ModelLayer.AddParam} 模型参数
     * @example
     * ```
     * const earth = useEarth()
     * const modelLayer = new ModelLayer(earth)
     * modelLayer.add({
     *  url: "/Plane.glb",
     *  position: Cartesian3.fromDegrees(104, 31, 5000),
     *  asynchronous: true,
     *  hpr: new HeadingPitchRoll(Math.PI / 3, 0, 0),
     *  minimumPixelSize: 20,
     *  color: Color.WHITE,
     *  colorBlendMode: ColorBlendMode.MIX,
     *  colorBlendAmount: 0.5,
     *  silhouetteColor: Color.RED,
     *  silhouetteSize: 0,
     *  animationLoop: ModelAnimationLoop.REPEAT,
     *  distanceDisplayCondition: new DistanceDisplayCondition(0, 5000),
     *  envelope: {
     *    radii: new Cartesian3(1000, 1500, 2000),
     *  }
     * })
     * ```
     */
    add(param: ModelLayer.AddParam<T>): Promise<void>
    /**
     * @description 根据ID修改模型
     * @param id ID
     * @param param {@link ModelLayer.SetParam} 模型参数
     * ```
     * const earth = useEarth()
     * const modelLayer = new ModelLayer(earth)
     * modelLayer.set("some_id", {
     *  position: Cartesian3.fromDegrees(104, 31, 5000),
     *  hpr: new HeadingPitchRoll(Math.PI / 2, 0, 0),
     * })
     * ```
     */
    set(id: string, param: ModelLayer.SetParam<T>): void
    /**
     * @description 模型移动
     * @param param {@link ModelLayer.ActionOptions} 行动参数
     * @returns 结束行动的函数
     * @example
     * ```
     * const earth = useEarth()
     * const modelLayer = new ModelLayer(earth)
     * const stop: Function = modelLayer.useAction({
     *  id: "some_id",
     *  path: [Cartesian3.fromDegrees(104, 31, 4000), Cartesian3.fromDegrees(105, 32, 6000)]
     *  split: 5,
     *  frequency: 40,
     *  loop: false,
     * })
     *
     * //stop action
     * stop()
     * ```
     */
    useAction(param: ModelLayer.ActionOptions): () => void
    /**
     * @description 开启模型第一 / 三人称视角
     * @param id 模型ID
     * @param option {@link ModelLayer.ViewOptions} 配置参数
     * @returns 关闭视角跟踪的函数
     * @example
     * ```
     * const earth = useEarth()
     * const modelLayer = new ModelLayer(earth)
     *
     * //first person view
     * const stop: Function = modelLayer.usePersonView("some_id", { view: ViewAngle.FIRST })
     *
     * //third person view
     * const stop: Function = modelLayer.usePersonView("some_id", { view: ViewAngle.THIRD })
     *
     * //stop tracking view
     * stop()
     * ```
     */
    usePersonView(id: string, option?: ModelLayer.ViewOptions): () => void
    /**
     * @description 隐藏所有模型
     */
    hide(): void
    /**
     * @description 隐藏所有模型
     * @param id 根据ID隐藏模型
     */
    hide(id: string): void
    /**
     * @description 显示所有模型
     */
    show(): void
    /**
     * @description 根据ID显示模型
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有模型
     */
    remove(): void
    /**
     * @description 根据ID移除模型
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

  export namespace ParticleLayer {
    /**
     * @description 用于在每个时间点强制修改、颜色、尺寸等粒子属性的函数
     * @param particle 当前粒子
     * @param currentTime 当前时间
     */
    export type UpdateCallback = (particle: Particle, currentTime: number) => void

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property position {@link Cartesian3} 位置
     * @property [loop = true] 循环播放
     * @property [startScale] 开始时缩放
     * @property [endScale] 结束时缩放
     * @property [scale = 1] 粒子图像比例，覆盖`startScale`和`endScale`
     * @property [startColor] {@link Color} 开始时颜色
     * @property [endColor] {@link Color} 结束时颜色
     * @property [color = {@link Color.WHITE}] 粒子颜色，覆盖`startColor`和`endColor`
     * @property [image] 粒子图片源
     * @property [minimumImageSize] {@link Cartesian2} 粒子图片最小值
     * @property [maximumImageSize] {@link Cartesian2} 粒子图片最大值
     * @property [imageSize = {@link Cartesian2.ONE}] 粒子图片大小，覆盖`minimumImageSize`和`maximumImageSize`
     * @property [minimumSpeed] 粒子最小速度
     * @property [maximumSpeed] 粒子最大速度
     * @property [speed = 1] 粒子速度，覆盖`minimumSpeed`和`maximumSpeed`
     * @property [minimumParticleLife] 粒子最小持续时间
     * @property [maximumParticleLife] 粒子最大持续时间
     * @property [particleLife = 5] 粒子持续时间`s`，覆盖`minimumParticleLife`和`maximumParticleLife`
     * @property [lifetime = {@link Number.MAX_VALUE}] 生命周期`s`
     * @property [minimumMass] 粒子最小质量，单位`kg`
     * @property [maximumMass] 粒子最大质量，单位`kg`
     * @property [mass = 1] 粒子质量，覆盖`minimumMass`和`maximumMass`
     * @property [sizeInMeters = true] 粒子以`m`为单位，否则`px`
     * @property [bursts] {@link ParticleBurst} 粒子爆发
     * @property [emissionRate = 5] 每秒发射粒子数
     * @property [emitter = new CircleEmitter(0.5)] {@link ParticleEmitter} 粒子发射器
     * @property [modelMatrix] 粒子系统从模型坐标转为世界坐标，优先级高于`position`
     * @property [emitterModelMatrix {@link Matrix4.IDENTITY}] 粒子系统的局部坐标内变换粒子发射器
     * @property [updateCallback] {@link UpdateCallback} 粒子更新函数
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      position: Cartesian3
      loop?: boolean
      startScale?: number
      endScale?: number
      scale?: number
      startColor?: Color
      endColor?: Color
      color?: Color
      image?: string
      minimumImageSize?: Cartesian2
      maximumImageSize?: Cartesian2
      imageSize?: Cartesian2
      minimumSpeed?: number
      maximumSpeed?: number
      speed?: number
      minimumParticleLife?: number
      maximumParticleLife?: number
      particleLife?: number
      lifetime?: number
      minimumMass?: number
      maximumMass?: number
      mass?: number
      sizeInMeters?: boolean
      bursts?: ParticleBurst[]
      emissionRate?: number
      emitter?: ParticleEmitter
      modelMatrix?: Matrix4
      emitterModelMatrix?: Matrix4
      updateCallback?: UpdateCallback
    }

    /**
     * @property [position] {@link Cartesian3} 位置
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [translation] {@link Cartesian3} 偏移
     * @property [emissionRate] 每秒发射粒子数
     * @property [startScale] 开始时缩放
     * @property [endScale] 结束时缩放
     * @property [minimumImageSize] {@link Cartesian2} 粒子图片最小值
     * @property [maximumImageSize] {@link Cartesian2} 粒子图片最大值
     * @property [minimumMass] 粒子最小质量，单位`kg`
     * @property [maximumMass] 粒子最大质量，单位`kg`
     * @property [minimumParticleLife] 粒子最小持续时间
     * @property [maximumParticleLife] 粒子最大持续时间
     * @property [minimumSpeed] 粒子最小速度
     * @property [maximumSpeed] 粒子最大速度
     */
    export type SetParam = {
      position?: Cartesian3
      hpr?: HeadingPitchRoll
      translation?: Cartesian3
      emissionRate?: number
      startScale?: number
      endScale?: number
      minimumImageSize?: number
      maximumImageSize?: number
      maximumMass?: number
      minimumMass?: number
      maximumParticleLife?: number
      minimumParticleLife?: number
      maximumSpeed?: number
      minimumSpeed?: number
    }

    /**
     * @description 自定义粒子系统
     * @property position {@link Cartesian3} 位置
     * @property [id] ID
     * @property [startColor] {@link Color} 开始时颜色
     * @property [endColor] {@link Color} 结束时颜色
     * @property [startScale] 开始时缩放
     * @property [endScale] 结束时缩放
     * @property [minimumSpeed] 粒子最小速度
     * @property [maximumSpeed] 粒子最大速度
     * @property [size = "normal"] 覆盖`startScale`，`endScale`，`minimumSpeed`和`maximumSpeed`，自定义时将该属性置空
     * @property [lifetime = {@link Number.MAX_VALUE}] 生命周期`s`
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [translation] {@link Cartesian3} 偏移
     */
    export type Custom = {
      position: Cartesian3
      id?: string
      startColor?: Color
      endColor?: Color
      startScale?: number
      endScale?: number
      minimumSpeed?: number
      maximumSpeed?: number
      size?: "small" | "normal" | "large"
      lifetime?: number
      hpr?: HeadingPitchRoll
      translation?: Cartesian3
    }

    /**
     * @description 火焰
     * @extends Custom {@link Custom}
     * @property [smoke = true] 是否开启烟雾效果
     */
    export type Fire = Custom & { smoke?: boolean }

    /**
     * @description 烟雾
     * @extends Custom {@link Custom}
     * @property [duration] `lifetime`属性会覆盖该属性
     */
    export type Smoke = Custom & { duration?: "fast" | "normal" | "enduring" }

    /**
     * @description 爆炸
     * @extends Custom {@link Custom}
     * @property [fire = true] 是否开启火焰效果
     */
    export type Blast = Omit<Custom, "lifetime"> & { fire?: boolean }

    /**
     * @description 发动机、导弹、飞机尾焰
     * @extends Custom {@link Custom}
     * @property [speed = 20] 喷焰速度
     */
    export type Flame = Omit<Custom, "minimumSpeed" | "maximumSpeed"> & { speed?: number }
  }

  /**
   * @description 粒子图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const particleLayer = new ParticleLayer(earth)
   * ```
   */
  export class ParticleLayer<T = unknown> extends Layer<PrimitiveCollection, ParticleSystem, Layer.Data<T>> {
    constructor(earth: Earth)
    /**
     * @description 新增粒子效果
     * @param param {@link ParticleLayer.AddParam} 粒子参数
     * @example
     * ```
     * const earth = useEarth()
     * const particleLayer = new ParticleLayer(earth)
     * particleLayer.add({
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  lifeTime: Number.MAX_VALUE,
     *  scale: 1,
     *  startColor: Color.RED,
     *  endColor: Color.YELLOW,
     *  image: "/particle.png",
     *  imageSize: new Cartesian2(48, 48),
     *  speed: 10,
     *  particleLife: 5,
     *  sizeInMeters: true,
     *  emissionRate: 10,
     *  emitter: new CircleEmitter(2),
     *  emitterModelMatrix: Matrix4.fromTranslationRotationScale(
     *    new TranslationRotationScale(
     *      Cartesian3.fromElements(0, 0, 0),
     *      Quaternion.fromHeadingPitchRoll(
     *        new HeadingPitchRoll(),
     *        new Quaternion()
     *      ),
     *    ),
     *    new Matrix4()
     *  )
     * })
     * ```
     */
    add(param: ParticleLayer.AddParam<T>): void
    /**
     * @description 修改粒子效果
     * @param id 粒子ID
     * @param param {@link ParticleLayer.SetParam} 粒子参数
     * @example
     * ```
     * const earth = useEarth()
     * const particleLayer = new ParticleLayer(earth)
     * particleLayer.set("some_id", {
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  imageSize: new Cartesian2(48, 48),
     *  emissionRate: 20,
     *  hpr: new HeadingPitchRoll(0, Math.PI / 4, 0),
     * })
     * ```
     */
    set(id: string, param: ParticleLayer.SetParam): void
    /**
     * @description 添加火焰
     * @param param {@link ParticleLayer.Fire} 火焰参数
     * @example
     * ```
     * const earth = useEarth()
     * const particleLayer = new ParticleLayer(earth)
     * particleLayer.addFire({
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  size: "large",
     *  smoke: true,
     * })
     * ```
     */
    addFire(param: ParticleLayer.Fire): void
    /**
     * @description 添加烟雾
     * @param param {@link ParticleLayer.Smoke} 烟雾参数
     * @example
     * ```
     * const earth = useEarth()
     * const particleLayer = new ParticleLayer(earth)
     * particleLayer.addSmoke({
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  size: "large",
     *  duration: "enduring",
     * })
     * ```
     */
    addSmoke(param: ParticleLayer.Smoke): void
    /**
     * @description 添加爆炸
     * @param param {@link ParticleLayer.Blast} 爆炸参数
     * @example
     * ```
     * const earth = useEarth()
     * const particleLayer = new ParticleLayer(earth)
     * particleLayer.addBlast({
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  size: "large",
     *  fire: true,
     *  smoke: true,
     * })
     * ```
     */
    addBlast(param: ParticleLayer.Blast): void
    /**
     * @description 添加喷焰
     * @param param {@link ParticleLayer.Flame} 喷焰参数
     * @example
     * ```
     * const earth = useEarth()
     * const particleLayer = new ParticleLayer(earth)
     * particleLayer.addFlame({
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  hpr: new HeadingPitchRoll(Math.PI / 3, 0, Math.PI / 2),
     *  size: "large",
     * })
     * ```
     */
    addFlame(param: ParticleLayer.Flame): void
    /**
     * @description 清除所有粒子效果
     */
    remove(): void
    /**
     * @description 根据ID清除粒子效果
     * @param id 效果ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): boolean
  }

  export namespace PointLayer {
    export type LabelAddParam<T> = Omit<LabelLayer.AddParam<T>, LabelLayer.Attributes>

    export type LabelSetParam<T> = Omit<LabelLayer.SetParam<T>, "position">

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property position {@link Cartesian3} 位置
     * @property [color = {@link Color.RED}] 填充色
     * @property [pixelSize = 5] 像素大小
     * @property [outlineColor = {@link Color.RED}] 边框色
     * @property [outlineWidth = 1] 边框宽度
     * @property [scaleByDistance] {@link NearFarScalar} 按距离设置缩放
     * @property [disableDepthTestDistance] 按距离禁用地形深度检测
     * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 按距离设置可见性
     * @property [label] {@link LabelAddParam}
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      position: Cartesian3
      color?: Color
      pixelSize?: number
      outlineColor?: Color
      outlineWidth?: number
      scaleByDistance?: NearFarScalar
      disableDepthTestDistance?: number
      distanceDisplayCondition?: DistanceDisplayCondition
      label?: LabelAddParam<T>
    }

    export type SetParam<T> = Partial<Omit<AddParam<T>, "id" | "module" | "data" | "label">> & {
      label?: LabelSetParam<T>
    }
  }

  /**
   * @description 点图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const pointLayer = new PointLayer(earth)
   * //or
   * const pointLayer = earth.useDefaultLayers().point
   * ```
   */
  export class PointLayer<T = unknown> extends Layer<PointPrimitiveCollection, PointPrimitive, Layer.Data<T>> {
    constructor(earth: Earth)
    /**
     * @description 新增点
     * @param param {@link PointLayer.AddParam} 点参数
     * @example
     * ```
     * const earth = useEarth()
     * const pointLayer = new PointLayer(earth)
     * pointLayer.add({
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  pixelSize: 5,
     *  color: Color.RED,
     *  outlineColor: Color.RED,
     *  outlineWidth: 1,
     * })
     * ```
     */
    add(param: PointLayer.AddParam<T>): void
    /**
     * @description 修改点
     * @param id ID
     * @param param {@link PointLayer.SetParam} 点参数
     * @example
     * ```
     * const earth = useEarth()
     * const pointLayer = new PointLayer(earth)
     * pointLayer.set("some_id", {
     *  position: Cartesian3.fromDegrees(104, 31, 500),
     *  pixelSize: 10,
     *  color: Color.LIGHTBLUE,
     *  outlineColor: Color.LIGHTBLUE,
     *  outlineWidth: 1,
     *  disableDepthTestDistance: 0,
     * })
     * ```
     */
    set(id: string, param: PointLayer.SetParam<T>): void
  }

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
     * @property [outline] {@link OutlineAddParam} 轮廓线
     * @property [label] {@link LabelAddParam} 对应标签
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      positions: Cartesian3[]
      height?: number
      color?: Color
      usePointHeight?: boolean
      ground?: boolean
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
  export class PolygonLayer<T = unknown> extends Layer<
    PrimitiveCollection,
    Primitive | GroundPrimitive,
    Layer.Data<T>
  > {
    labelLayer: LabelLayer<T>
    constructor(earth: Earth)
    /**
     * @description 新增多边形
     * @param param {@link PolygonLayer.AddParam} 多边形参数
     * @example
     * ```
     * const earth = useEarth()
     * const polygonLayer = new PolygonLayer(earth)
     * polygonLayer.add({
     *  points: [
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
    add(param: PolygonLayer.AddParam<T>): void
    /**
     * @description 根据ID获取多边形外边框实体
     * @param id ID
     * @returns 外边框实体
     */
    getOutlineEntity(id: string): GroundPolylinePrimitive | Primitive | undefined
    /**
     * @description 隐藏所有多边形
     */
    hide(): void
    /**
     * @description 隐藏所有多边形
     * @param id 根据ID隐藏多边形
     */
    hide(id: string): void
    /**
     * @description 显示所有多边形
     */
    show(): void
    /**
     * @description 根据ID显示多边形
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有多边形
     */
    remove(): void
    /**
     * @description 根据ID移除多边形
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

  export namespace PolylineLayer {
    /**
     * @description 线条材质类型
     */
    export type MaterialType =
      | "Color"
      | "PolylineArrow"
      | "PolylineDash"
      | "PolylineGlow"
      | "PolylineOutline"
      | "PolylineFlowingDash"
      | "PolylineFlowingWave"
      | "PolylineTrailing"

    /**
     * @description 材质类型对应的 `uniforms` 参数
     */
    export type MaterialUniforms = { [key: string]: any }

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property lines {@link Cartesian3} 位置
     * @property [asynchronous = true] 是否异步渲染
     * @property [width = 2] 线宽
     * @property [arcType = {@link ArcType.RHUMB}] 线段弧度类型
     * @property [materialType = "Color"] {@link MaterialType} 材质类型
     * @property [materialUniforms = { color: {@link Color.RED} }] {@link MaterialUniforms} 材质参数
     * @property [ground = false] 是否贴地
     */
    export type AddParam<T> = Layer.AddParam<T> & {
      lines: Cartesian3[][]
      asynchronous?: boolean
      width?: number
      arcType?: ArcType
      materialType?: MaterialType
      materialUniforms?: MaterialUniforms
      ground?: boolean
    }
  }

  /**
   * @description 线段图层
   * @extends Layer {@link Layer} 图层基类
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const polylineLayer = new PolylineLayer(earth)
   * //or
   * const polylineLayer = earth.useDefaultLayers().polyline
   * ```
   */
  export class PolylineLayer<T = unknown> extends Layer<
    PrimitiveCollection,
    Primitive | GroundPolylinePrimitive,
    Layer.Data<T>
  > {
    constructor(earth: Earth)
    /**
     * @description 新增折线段
     * @param param {@link PolylineLayer.AddParam} 折线段参数
     * @example
     * ```
     * const earth = useEarth()
     * const polylineLayer = new PolylineLayer(earth)
     * polylineLayer.add({
     *  lines: [[
     *    Cartesian3.fromDegrees(104, 31, 200),
     *    Cartesian3.fromDegrees(105, 31, 300),
     *    Cartesian3.fromDegrees(104, 32, 500),
     *  ]],
     *  width: 2,
     *  arcType: ArcType.RHUMB,
     *  materialType: "Color",
     *  materialUniforms: { color: Color.RED },
     *  asynchronous: true,
     *  ground: true,
     * })
     * ```
     */
    add(param: PolylineLayer.AddParam<T>): void
    /**
     * @deprecated 已废弃，请使用`add`
     * @deleted 已删除
     */
    addFlowingDash(param: any): void
    /**
     * @deprecated 已废弃，请使用`add`
     * @deleted 已删除
     */
    addFlowingWave(param: any): void
  }

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
    labelLayer: LabelLayer<T>
    constructor(earth: Earth)
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
    add(param: RectangleLayer.AddParam<T>): void
    /**
     * @description 隐藏所有矩形
     */
    hide(): void
    /**
     * @description 隐藏所有矩形
     * @param id 根据ID隐藏矩形
     */
    hide(id: string): void
    /**
     * @description 显示所有矩形
     */
    show(): void
    /**
     * @description 根据ID显示矩形
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有矩形
     */
    remove(): void
    /**
     * @description 根据ID移除矩形
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁图层
     * @returns 返回`boolean`值
     */
    destroy(): boolean
  }

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
    constructor(earth: Earth)
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
    add(param: WallLayer.AddParam<T>): void
    /**
     * @description 隐藏所有墙体
     */
    hide(): void
    /**
     * @description 隐藏所有墙体
     * @param id 根据ID隐藏墙体
     */
    hide(id: string): void
    /**
     * @description 显示所有墙体
     */
    show(): void
    /**
     * @description 根据ID显示墙体
     * @param id ID
     */
    show(id: string): void
    /**
     * @description 移除所有墙体
     */
    remove(): void
    /**
     * @description 根据ID移除墙体
     * @param id ID
     */
    remove(id: string): void
  }

  /**
   * @description 自定义材质
   */
  export namespace CustomMaterial {
    export type ConstructorOptions = {
      strict?: boolean
      translucent?: boolean | ((...params: any[]) => any)
      minificationFilter?: TextureMinificationFilter
      magnificationFilter?: TextureMagnificationFilter
      fabric: { [key: string]: any }
    }

    const getMaterialByType: (type: string) => Material
  }

  /**
   * @description 流动线条材质
   * @param [options] {@link CustomMaterial.ConstructorOptions} 参数
   */
  export class PolylineFlowingDashMaterial extends Material {
    constructor(options?: CustomMaterial.ConstructorOptions)
  }

  /**
   * @description 波动线条材质
   * @param [options] {@link CustomMaterial.ConstructorOptions} 参数
   */
  export class PolylineFlowingWaveMaterial extends Material {
    constructor(options?: CustomMaterial.ConstructorOptions)
  }

  /**
   * @description 拖尾线条材质
   * @param [options] {@link CustomMaterial.ConstructorOptions} 参数
   */
  export class PolylineTrailingMaterial extends Material {
    constructor(options?: CustomMaterial.ConstructorOptions)
  }

  export namespace Measure {
    /**
     * @property [id] ID
     * @property [module] 模块
     */
    export type Base = {
      id?: string
      module?: string
    }

    /**
     * @property id ID
     * @property startPosition {@link Cartesian3} 起始位置
     * @property endPosition {@link Cartesian3} 结束位置
     * @property spaceDistance 空间距离
     * @property rhumbDistance 大圆距离
     * @property heightDifference 高度差
     */
    export type TriangleReturn = {
      id: string
      startPosition: Cartesian3
      endPosition: Cartesian3
      spaceDistance: number
      rhumbDistance: number
      heightDifference: number
    }

    /**
     * @property id ID
     * @property positions {@link Geographic} 点集
     */
    export type SectionReturn = {
      id: string
      positions: Geographic[]
    }

    /**
     * @extends Base {@link Base}
     * @property [color = {@link Color.ORANGE}] 测量线颜色
     * @property [width = 1] 测量线宽度
     * @property [labelOutlineColor = {@link Color.RED}] 标签轮廓色
     * @property [labelOutlineWidth = 1] 标签轮廓线宽度
     * @property [labelFillColor = {@link Color.RED}] 标签字体色
     * @property [labelStyle = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [labelText] 标签文字自定义函数
     */
    export type Triangle = Base & {
      color?: Color
      width?: number
      labelOutlineColor?: Color
      labelOutlineWidth?: number
      labelFillColor?: Color
      labelStyle?: LabelStyle
      labelText?: (params: { spaceDistance: number; rhumbDistance: number; heightDifference: number }) => string
    }

    /**
     * @extends Base {@link Base}
     * @property [split = true] 是否为分段方位测量，否则为首点方位测量
     * @property [width = 2] 测量线宽度
     * @property [materialType = "PolylineDash"] {@link PolylineLayer.MaterialType} 测量线材质
     * @property [materialUniforms = { color: Color.ORANGE }] {@link PolylineLayer.MaterialUniforms} 测量线材质参数
     * @property [labelOutlineColor = {@link Color.RED}] 标签轮廓色
     * @property [labelOutlineWidth = 1] 标签轮廓线宽度
     * @property [labelFillColor = {@link Color.RED}] 标签字体色
     * @property [labelStyle = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [headLabelText] 起始节点文本
     * @property [nodeLabelText] 过程节点文本
     */
    export type Bearing = Base & {
      split?: boolean
      width?: number
      materialType?: PolylineLayer.MaterialType
      materialUniforms?: PolylineLayer.MaterialUniforms
      labelOutlineColor?: Color
      labelOutlineWidth?: number
      labelFillColor?: Color
      labelStyle?: LabelStyle
      headLabelText?: string | ((position: Geographic) => string)
      nodeLabelText?: (bearing: number) => string
    }

    /**
     * @extends Base {@link Base}
     * @property [pointPixelSize = 10] 坐标点像素大小
     * @property [labelOutlineColor = {@link Color.RED}] 标签轮廓色
     * @property [labelOutlineWidth = 1] 标签轮廓线宽度
     * @property [labelFillColor = {@link Color.RED}] 标签字体色
     * @property [labelStyle = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [labelText] 标签文字自定义函数
     */
    export type Coordinate = Base & {
      color?: Color
      pointPixelSize?: number
      labelOutlineColor?: Color
      labelOutlineWidth?: number
      labelFillColor?: Color
      labelStyle?: LabelStyle
      labelText?: (position: Geographic) => string
    }

    /**
     * @extends Base {@link Base}
     * @property [split = true] 是否为分段方距测量，否则为首点方距测量
     * @property [width = 2] 测量线宽度
     * @property [materialType = "PolylineDash"] {@link PolylineLayer.MaterialType} 测量线材质
     * @property [materialUniforms = { color: Color.ORANGE }] {@link PolylineLayer.MaterialUniforms} 测量线材质参数
     * @property [labelOutlineColor = {@link Color.RED}] 标签轮廓色
     * @property [labelOutlineWidth = 1] 标签轮廓线宽度
     * @property [labelFillColor = {@link Color.RED}] 标签字体色
     * @property [labelStyle = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [headLabelText] 起始节点文本
     * @property [nodeLabelText] 过程节点文本
     */
    export type Distance = Base & {
      split?: boolean
      width?: number
      materialType?: PolylineLayer.MaterialType
      materialUniforms?: PolylineLayer.MaterialUniforms
      labelOutlineColor?: Color
      labelOutlineWidth?: number
      labelFillColor?: Color
      labelStyle?: LabelStyle
      headLabelText?: string | ((total: number) => string)
      nodeLabelText?: (distance: number) => string
    }

    /**
     * @extends Base {@link Base}
     * @property [width = 2] 测量线宽度
     * @property [materialType = "PolylineDash"] {@link PolylineLayer.MaterialType} 测量线材质
     * @property [materialUniforms = { color: Color.ORANGE }] {@link PolylineLayer.MaterialUniforms} 测量线材质参数
     * @property [labelOutlineColor = {@link Color.RED}] 标签轮廓色
     * @property [labelOutlineWidth = 1] 标签轮廓线宽度
     * @property [labelFillColor = {@link Color.RED}] 标签字体色
     * @property [labelStyle = {@link LabelStyle.FILL_AND_OUTLINE}] 标签样式
     * @property [headLabelText] 起始节点文本
     * @property [nodeLabelText] 过程节点文本
     */
    export type HeightDifference = Base & {
      width?: number
      materialType?: PolylineLayer.MaterialType
      materialUniforms?: PolylineLayer.MaterialUniforms
      labelOutlineColor?: Color
      labelOutlineWidth?: number
      labelFillColor?: Color
      labelStyle?: LabelStyle
      headLabelText?: string | ((position: Geographic) => string)
      nodeLabelText?: (bearing: number) => string
    }

    /**
     * @extends Base {@link Base}
     * @property [color = {@link Color.YELLOW}] 填充色
     * @property [outlineColor = {@link Color.RED}] 轮廓颜色
     * @property [outlineWidth = 1] 轮廓线宽度
     * @property [labelText] 标签文字自定义函数
     */
    export type Area = Base & {
      color?: Color
      outlineColor?: Color
      outlineWidth?: number
      labelText?: (total: number) => string
    }

    /**
     * @extends Base {@link Base}
     * @property [splits = 50] 剖面取点个数
     * @property [width = 2] 测量线宽度
     * @property [materialType = "PolylineDash"] {@link PolylineLayer.MaterialType} 测量线材质
     * @property [materialUniforms = { color: Color.ORANGE }] {@link PolylineLayer.MaterialUniforms} 测量线材质参数
     */
    export type Section = Base & {
      splits?: number
      width?: number
      materialType?: PolylineLayer.MaterialType
      materialUniforms?: PolylineLayer.MaterialUniforms
    }
  }

  /**
   * @description 测量工具
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const measure = new Measure(earth)
   * //or
   * const measure = earth.useMeasure()
   * ```
   */
  export class Measure {
    constructor(earth: Earth)
    /**
     * @description 三角测量
     * @param param {@link Measure.Triangle} 参数
     * @returns {ITriangleReturn} 测量结果
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.calcTriangle()
     * ```
     */
    calcTriangle(param?: Measure.Triangle): Promise<Measure.TriangleReturn>
    /**
     * @description 方位测量
     * @param param {@link Measure.Bearing} 参数
     * @returns 测量点
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.calcBearing()
     * ```
     */
    calcBearing(param?: Measure.Bearing): Promise<Draw.PolylineReturn>
    /**
     * @description 坐标测量
     * @param param {@link Measure.Coordinate} 参数
     * @returns 测量结果
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.calcCoordinate()
     * ```
     */
    calcCoordinate(param?: Measure.Coordinate): Promise<Draw.PointReturn[]>
    /**
     * @description 贴地距离测量
     * @param param {@link Measure.Distance} 参数
     * @returns 测量点
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.groundDistance()
     * ```
     */
    groundDistance(param?: Measure.Distance): Promise<Draw.PolylineReturn>
    /**
     * @description 空间距离测量
     * @param param {@link Measure.Distance} 参数
     * @returns 测量点
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.spaceDistance()
     * ```
     */
    spaceDistance(param?: Measure.Distance): Promise<Draw.PolylineReturn>
    /**
     * @description 高度差值测量
     * @param param {@link Measure.HeightDifference} 参数
     * @returns 测量点
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.heightDifference()
     * ```
     */
    heightDifference(param?: Measure.HeightDifference): Promise<Draw.PolylineReturn>
    /**
     * @description 空间面积测量
     * @param param {@link Measure.Area} 参数
     * @returns 测量点
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.spaceArea()
     * ```
     */
    spaceArea(param?: Measure.Area): Promise<Draw.PolygonReturn>
    /**
     * @description 剖面测量
     * @param param {@link Measure.Section} 参数
     * @returns {ISectionReturn} 测量结果
     * @exception Lack of terrian data, or load terrian failed.
     * @exception A certain material type is required.
     * @example
     * ```
     * const earth = useEarth()
     * const measure = new Measure(earth)
     * const result = await measure.sectionAnalyse()
     * ```
     */
    sectionAnalyse(param?: Measure.Section): Promise<Measure.SectionReturn>
    /**
     * @description 清除所有测绘对象
     */
    remove(): void
    /**
     * @description 按ID清除测绘对象
     * @param id ID
     */
    remove(id: string): void
  }

  export namespace ContextMenu {
    /**
     * @property [id] ID
     * @property [module] 模块名
     * @property [key] 菜单键名
     * @property type {@link MenuEventType} 菜单事件类型
     */
    export type CallbackParam = {
      id?: string
      module?: string
      key?: string
      type: MenuEventType
    }

    export type Callback = (param: CallbackParam) => void

    /**
     * @property belong 归属
     * @property [default] 默认是否激活当前项
     */
    export type ToggleOptions = {
      belong: string
      default?: boolean
    }

    /**
     * @property [separator = true] 分隔符
     * @property [icon] 图标
     * @property [iconClass] 图标类名
     * @property [key] 菜单Key
     * @property [label] 菜单显示名称
     * @property [toggle] {@link ToggleOptions} 是否为切换/开关型
     * @property [children] 子菜单
     * @property [callback] 回调
     */
    export type Item = {
      separator?: boolean
      icon?: string | (() => HTMLElement)
      iconClass?: string | string[]
      key?: string | DefaultContextMenuItem
      label: string
      toggle?: ToggleOptions
      children?: Item[]
      callback?: Callback
    }
  }

  /**
   * @description 上下文菜单
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const contextMenu = new ContextMenu(earth)
   * //or
   * const contextMenu = earth.useContextMenu()
   * ```
   */
  export class ContextMenu {
    animationClassName: string
    classList: Set<string>
    constructor(earth: Earth)
    /**
     * @description 设置默认菜单
     * @param menus {@link ContextMenu.Item} 默认菜单项
     * @param [callback] {@link ContextMenu.Callback} 右键回调
     * @example
     * ```
     * const earth = useEarth()
     * const ctxMenu = new ContextMenu(earth)
     * ctxMenu.setDefaultMenu({
     *  menus: [
     *    {
     *      label: "开启地形检测",
     *      key: DefaultContextMenuItem.EnableDepth,
     *      separator: true,
     *      toggle: {
     *        belong: "terrain-depth",
     *        default: true,
     *      },
     *    },
     *    {
     *      label: "关闭地形检测",
     *      key: DefaultContextMenuItem.DisableDepth,
     *      separator: true,
     *      toggle: {
     *        belong: "terrain-depth",
     *        default: false,
     *      },
     *    },
     *  ],
     *  callback: (res) => { console.log(res) },
     * })
     * ```
     */
    setDefaultMenu(menus: ContextMenu.Item[], callback?: ContextMenu.Callback): void
    /**
     * @description 新增模块菜单项
     * @param module 模块名称
     * @param menus {@link ContextMenu.Item} 菜单项
     * @param [callback] {@link ContextMenu.Callback} 右键回调
     * @exception Argument param 'module' cannot be '' or 'default'.
     * @example
     * ```
     * const earth = useEarth()
     * const ctxMenu = new ContextMenu(earth)
     * ctxMenu.add("billboard", [
     *  {
     *    label: "广告牌选项1",
     *    key: "billborad-option-1",
     *    separator: true,
     *    callback: (res) => { console.log(res) },
     *  },
     *  {
     *    label: "广告牌选项2",
     *    key: "billborad-option-2",
     *    separator: true,
     *    callback: (res) => { console.log(res) },
     *  },
     * ], callback: (res) => { console.log(res) })
     * ```
     */
    add(module: string, menus: ContextMenu.Item[], callback?: ContextMenu.Callback): void
    /**
     * @description 手动设置开关型菜单状态
     * @param param 参数
     * @example
     * ```
     * const earth = useEarth()
     * const ctxMenu = new ContextMenu(earth)
     * ctxMenu.toggleMenuStatus({
     *  module: "default",
     *  belong: "terrain-depth",
     *  status: true,
     * })
     * ```
     */
    toggleMenuStatus(param: { module: string; belong: string; key: string; id?: string; status?: boolean }): void
    /**
     * @description 隐藏具名菜单
     * @param keys
     * @example
     * ```
     * const earth = useEarth()
     * const ctxMenu = new ContextMenu(earth)
     * ctxMenu.hide([
     *  DefaultContextMenuItem.EnableDepth,
     *  DefaultContextMenuItem.DisableDepth,
     * ])
     * ```
     */
    hide(keys: string[]): void
    /**
     * @description 显示具名菜单
     * @param keys
     * @example
     * ```
     * const earth = useEarth()
     * const ctxMenu = new ContextMenu(earth)
     * ctxMenu.unhide([
     *  DefaultContextMenuItem.EnableDepth,
     *  DefaultContextMenuItem.DisableDepth,
     * ])
     * ```
     */
    unhide(keys: string[]): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace EChartsOverlay {
    /**
     * @property [id] ID
     * @property [option] {@link EChartsOption} Echarts设置
     */
    export type ConstructorOptions = {
      /**
       * @deprecated
       */
      earth?: Earth
      id?: string
      option?: EChartsOption
    }
  }

  /**
   * @description Echarts插件图层
   * @param earth {@link Earth} 地球实例
   * @param options {@link EChartsOverlay.ConstructorOptions} 参数
   * @example
   * ```
   * const earth = useEarth()
   * const overlay = EchartsOverlay(earth, { id: "echarts-map" })
   * overlay.updateOverlay(echartsOption)
   * ```
   */
  export class EChartsOverlay {
    constructor(earth: Earth, options?: EChartsOverlay.ConstructorOptions)
    /**
     * @description 加载Echarts设置
     * @param option {@link EChartsOption} Echarts设置
     */
    updateOverlay(option: EChartsOption): void
    /**
     * @description 获取视图
     * @returns 视图
     */
    getEarthMap(): Viewer
    /**
     * @description 获取Echarts实例
     * @returns Echarts实例
     */
    getOverlay(): void
    /**
     * @description 显示
     */
    show(): void
    /**
     * @description 隐藏
     */
    hide(): void
    /**
     * @description 销毁
     * @deprecated Please use `destroy`
     */
    dispose(): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace Radar {
    /**
     * @property [id] ID
     * @property center {@link Cartesian3} 扫描的中心/光源坐标
     * @property radius 扫描半径，在锥形扫描中单位为度数
     * @property [duration] 扫描间隔`ms`
     * @property [color = {@link Color.LAWNGREEN}] 颜色
     * @property [data] 附加数据
     */
    type Base<T = unknown> = {
      id?: string
      center: Cartesian3
      radius: number
      duration?: number
      color?: Color
      data?: T
    }

    /**
     * @extends Base {@link Base}
     * @property [border = 0] 范围边框宽度
     * @property [width = 3] 指针的透明部分宽度
     */
    export type Scan<T> = Base<T> & {
      border?: number
      width?: number
    }

    /**
     * @extends Base {@link Base}
     * @property [border = 4] 扩散透明度
     */
    export type Diffuse<T> = Base<T> & { border?: number }

    /**
     * @extends Base {@link Base}
     * @property [shadeColor = {@link Color.LAWNGREEN}] 球形范围遮罩颜色
     */
    export type Fanshaped<T> = Base<T> & { shadeColor?: Color }

    /**
     * @extends Base {@link Base}
     * @property path {@link Cartesian3} 扫描路径
     * @property [split = 30] 光锥斜面分割数，分割数过多会影响渲染性能
     */
    export type Cone<T> = Base<T> & {
      path: Cartesian3[]
      split?: number
    }
  }

  /**
   * @description 雷达效果
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const radar = new Radar(earth)
   * ```
   */
  export class Radar<T = unknown> {
    constructor(earth: Earth)
    /**
     * @description 新增指针扫描
     * @param param {@link Radar.Scan} 雷达参数
     * @example
     * ```
     * const earth = useEarth()
     * const radar = new Radar(earth)
     * radar.addScan({
     *  center: Cartesian3.fromDegrees(104, 31),
     *  radius: 5000,
     *  color: Color.LAWNGREEN,
     *  duration: 1500,
     *  border: 0,
     *  width: 3,
     * })
     * ```
     */
    addScan(param: Radar.Scan<T>): void
    /**
     * @description 新增扩散扫描
     * @param param {@link Radar.Diffuse} 雷达参数
     * @example
     * ```
     * const earth = useEarth()
     * const radar = new Radar(earth)
     * radar.addDiffuse({
     *  center: Cartesian3.fromDegrees(104, 31),
     *  radius: 5000,
     *  color: Color.LAWNGREEN,
     *  duration: 1500,
     *  border: 4,
     * })
     * ```
     */
    addDiffuse(param: Radar.Diffuse<T>): void
    /**
     * @description 新增扇形扫描
     * @param param {@link Radar.Fanshaped} 雷达参数
     * @example
     * ```
     * const earth = useEarth()
     * const radar = new Radar(earth)
     * radar.addFanshaped({
     *  center: Cartesian3.fromDegrees(104, 31),
     *  radius: 5000,
     *  color: Color.LAWNGREEN.withAlpha(0.3),
     *  shadeColor: COlor.LAWNGREEN.withAlpha(0.1),
     * })
     * ```
     */
    addFanshaped(param: Radar.Fanshaped<T>): void
    /**
     * @description 新增锥形扫描
     * @param param {@link Radar.Cone} 雷达参数
     * @beta
     * @example
     * ```
     * const earth = useEarth()
     * const radar = new Radar(earth)
     * radar.addConic({
     *  center: Cartesian3.fromDegrees(104, 31, 5000),
     *  path: [
     *    Cartesian3.fromDegrees(104, 31, 5000),
     *    Cartesian3.fromDegrees(105, 31, 5000),
     *    Cartesian3.fromDegrees(105, 32, 5000),
     *    Cartesian3.fromDegrees(104, 32, 5000),
     *    Cartesian3.fromDegrees(104, 31, 5000),
     *  ],
     *  color: Color.LAWNGREEN.withAlpha(0.3),
     *  radius: 5000,
     *  duration: 1500,
     *  split: 30,
     * })
     * ```
     */
    addConic(param: Radar.Cone<T>): void
    /**
     * @description 根据ID获取雷达数据
     * @param id ID
     * @returns 数据
     */
    getData(id: string): T | undefined
    /**
     * @description 移除所有雷达
     */
    remove(): void
    /**
     * @description 根据ID移除雷达
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace Sensor {
    /**
     * @property hpr {@link HeadingPitchRoll} 欧拉角
     * @property position {@link Cartesian3} 位置
     * @property [data] 附加数据
     * @property [callback] 回调
     */
    export type Data<T> = {
      hpr: HeadingPitchRoll
      position: Cartesian3
      data?: T
      callback?: () => void
    }

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property position {@link Cartesian3} 位置
     * @property radius 切面半径，视觉发射长度`m`
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [xHalfAngle = PI / 3] 横向切面角度 <弧度制>
     * @property [yHalfAngle = PI / 3] 纵向切面角度 <弧度制>
     * @property [color = {@link Color.LAWNGREEN}] 颜色
     * @property [lineColor = {@link Color.LAWNGREEN}] 线条颜色
     * @property [scanPlane = true] 是否启用扫描面
     * @property [scanPlaneColor = {@link Color.LAWNGREEN}] 扫描面颜色
     * @property [scanPlaneRate = 1] 扫描速率
     * @property [scanMode = {@link ScanMode.HORIZONTAL}] 扫描模式
     * @property [gradientScan = true] 扫描面是否启用渐变色
     * @property [gradientScanColors = [{@link Color.WHITESMOKE}, {@link Color.LIGHTYELLOW}, {@link Color.YELLOW}, {@link Color.ORANGE}, {@link Color.RED}]] 扫描有序渐变色组
     * @property [gradientScanSteps = [0.2, 0.45, 0.65]] 扫描渐变占比
     * @property [intersection = true] 是否显示与地球的相交线
     * @property [intersectionColor = {@link Color.LAWNGREEN}.withAlpha(0.5)] 相交线颜色
     * @property [intersectionWidth = 1] 相交线宽度
     * @property [radarWave = true] 是否启用雷达波
     */
    export type Phased<T> = Layer.AddParam<T> & {
      position: Cartesian3
      radius: number
      hpr?: HeadingPitchRoll
      xHalfAngle?: number
      yHalfAngle?: number
      color?: Color
      lineColor?: Color
      scanPlane?: boolean
      scanPlaneColor?: Color
      scanPlaneRate?: number
      scanMode?: ScanMode
      gradientScan?: boolean
      gradientScanColors?: [Color, Color, Color, Color, Color]
      gradientScanSteps?: [number, number, number]
      intersection?: boolean
      intersectionColor?: Color
      intersectionWidth?: number
      radarWave?: boolean
    }

    /**
     * @extends Layer.AddParam {@link Layer.AddParam}
     * @property position {@link Cartesian3} 位置
     * @property radius 切面半径，视觉发射长度`m`
     * @property height 高度`m`
     * @property [hpr] {@link HeadingPitchRoll} 欧拉角
     * @property [color = {@link Color.LAWNGREEN}] 颜色
     * @property [speed = 50] 波纹速度
     * @property [thin = 0.25] 波纹厚度 `[0, 1]`
     * @property [slices = 120] 圆锥侧面切片数
     * @property [mode = {@link ConicMode.MATH}] 计算锥形的模式
     */
    export type Radar<T> = Layer.AddParam<T> & {
      position: Cartesian3
      radius: number
      height: number
      hpr?: HeadingPitchRoll
      color?: Color
      speed?: number
      thin?: number
      slices?: number
      mode?: ConicMode
    }
  }

  /**
   * @description 传感器效果
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const sensor = new Sensor(earth)
   * ```
   */
  export class Sensor<T> {
    constructor(earth: Earth)
    /**
     * @description 新增伞形相控阵传感器
     * @param param {@link Sensor.Phased} 相控阵参数
     * @example
     * ```
     * const earth = useEarth()
     * const sensor = new Sensor(earth)
     * sensor.addPhased({
     *  position: Cartesian3.fromDegrees(104, 31, 45000),
     *  radius: 50000,
     *  hpr: new HeadingPitchRoll(0, 0, -Math.PI),
     *  xHalfAngle: Math.toRadians(30),
     *  yHalfAngle: Math.toRadians(30),
     *  color: Color.LAWNGREEN.withAlpha(0.05),
     *  lineColor: Color.LAWNGREEN.withAlpha(0.1),
     *  scanPlane: true,
     *  scanPlaneColor: Color.LAWNGREEN.withAlpha(0.3),
     *  scanPlaneRate: 1,
     *  scanMode: ScanMode.HORIZONTAL,
     *  gradientScan: true,
     *  gradientScanColors: [
     *    Color.fromAlpha(Color.WHITESMOKE, 0.3),
     *    Color.fromAlpha(Color.LIGHTYELLOW, 0.3),
     *    Color.fromAlpha(Color.YELLOW, 0.3),
     *    Color.fromAlpha(Color.ORANGE, 0.3),
     *    Color.fromAlpha(Color.RED, 0.0),
     *  ],
     *  gradientScanSteps: [0.2, 0.45, 0.65],
     *  intersection: true,
     *  intersectionColor: Color.LAWNGREEN.withAlpha(0.5),
     *  intersectionWidth: 1,
     *  radarWave: true,
     * })
     * ```
     */
    addPhased(param: Sensor.Phased<T>): void
    /**
     * @description 新增锥形雷达波传感器
     * @param param {@link Sensor.Radar} 雷达波参数
     * @example
     * ```
     * const earth = useEarth()
     * const sensor = new Sensor(earth)
     * sensor.addRadar({
     *  position: Cartesian3.fromDegrees(104, 31, 500000),
     *  radius: 200000,
     *  height: 500000,
     *  slices: 120,
     *  speed: 50,
     *  thin: 0.25,
     *  hpr: new HeadingPitchRoll(0, 0, -Math.PI),
     *  color: Color.LAWNGREEN.withAlpha(0.3),
     *  mode: ConicMode.RHUMB,
     * })
     * ```
     */
    addRadar(param: Sensor.Radar<T>): void
    /**
     * @description 根据ID获取传感器实体
     * @param id ID
     * @returns 数据
     */
    getEntity(id: string): Primitive | PhasedSensorPrimitive | undefined
    /**
     * @description 根据ID获取传感器数据
     * @param id ID
     * @returns 数据
     */
    getData(id: string): Sensor.Data<T> | undefined
    /**
     * @description 移除所有传感器
     */
    remove(): void
    /**
     * @description 根据ID移除传感器
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace Weather {
    export type WeatherType = "rain" | "snow" | "fog"

    /**
     * @property [id] ID
     * @property [data] 附加数据
     * @property position {@link Cartesian3} 位置
     * @property type {@link WeatherType} 天气类型
     * @property [effectRadius = 100000] 粒子发射器覆盖半径
     * @property [particleSize] 粒子近似大小
     */
    export type AddParam<T> = {
      id?: string
      data?: T
      position: Cartesian3
      type: WeatherType
      effectRadius?: number
      particleSize?: number
    }
  }

  /**
   * @description 天气特效
   * @param earth {@link Earth} 地球实例
   * @example
   * ```
   * const earth = useEarth()
   * const weather = earth.weather
   *
   * //or
   * const weather = new Weather(earth)
   * ```
   */
  export class Weather<T = unknown> {
    scene: Scene
    /**
     * @description 大气/照明恢复的距离，仅当启用自然光照或大气层效果时生效
     */
    fadeInDistance: number
    /**
     * @description 一切都被点亮的距离，仅当启用自然光照或大气层效果时生效
     */
    fadeOutDistance: number
    constructor(earth: Earth)
    /**
     * @description 启用太阳光源的自然光照
     * @param value 是否启用
     */
    useNaturalLight(value: boolean): void
    /**
     * @description 启用大气层效果
     * @param value 是否启用
     */
    enableAtmosphere(value: boolean): void
    /**
     * @description 新增天气特效
     * @param param {@link Weather.AddParam} 天气参数
     */
    add(param: Weather.AddParam<T>): void
    /**
     * @description 开启黑夜视图效果
     * @returns 关闭黑夜视图的函数
     */
    useDark(): void
    /**
     * @description 关闭黑夜视图/开启正常白天视图
     */
    useLight(): void
    /**
     * @description 根据ID获取天气特效的附加数据
     * @param id ID
     * @returns
     */
    getData(id: string): T | undefined
    /**
     * @description 清除所有天气特效
     */
    remove(): void
    /**
     * @description 按ID清除天气特效
     * @param id ID
     */
    remove(id: string): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace WindField {
    /**
     * @description 维度
     * @property lon 经度
     * @property lat 纬度
     * @property lev 高度
     */
    export type Dimensions = {
      lon: number
      lat: number
      lev: number
    }

    /**
     * @description 范围
     * @property array 数据数组
     * @property min 最小值
     * @property max 最大值
     */
    export type Range = {
      array: Float32Array | number[]
      min: number
      max: number
    }

    /**
     * @description 数据
     * @property dimensions {@link Dimensions} 维度
     * @property lon {@link Range} 经度范围
     * @property lat {@link Range} 纬度范围
     * @property lev {@link Range} 高度范围
     * @property U {@link Range} U范围
     * @property V {@link Range} V范围
     */
    export type Data = {
      dimensions: Dimensions
      lon: Range
      lat: Range
      lev: Range
      U: Range
      V: Range
    }

    /**
     * @property data {@link Data} 数据
     * @property [params] {@link Param} 参数
     */
    export type ConstructorOptions = {
      data: Data
      params?: Param
    }

    /**
     * @description 视图参数
     * @property lonRange {@link Cartesian2} 经度范围
     * @property latRange {@link Cartesian2} 纬度范围
     * @property pixelSize 像素大小
     */
    export type ViewerParam = {
      lonRange: Cartesian2
      latRange: Cartesian2
      pixelSize: number
    }

    /**
     * @property [maxParticles = 4096] 最大粒子数`[0, 65536]`
     * @property [particleHeight = 100] 粒子高度`[0, 10000]`
     * @property [fadeOpacity = 0.9] 粒子拖尾`[0, 1]`
     * @property [dropRate = 0.003] 粒子移动到随机位置频率，避免在重复位置出现`[0, 0.1]`
     * @property [dropRateBump = 0.01] 基于粒子随机移动频率的补充`[0, 0.2]`
     * @property [speedFactor = 0.4] 粒子移动速度`[0, 8]`
     * @property [lineWidth = 2] 粒子宽度`[0, 16]`
     * @property [particlesTextureSize] 粒子格栅大小，该值自动计算，无需手动添加
     */
    export type Param = {
      maxParticles?: number
      particleHeight?: number
      fadeOpacity?: number
      dropRate?: number
      dropRateBump?: number
      speedFactor?: number
      lineWidth?: number
      particlesTextureSize?: number
    }

    /**
     * @description 纹理选项
     * @property context 上下文
     * @property [width] 宽度
     * @property [height] 高度
     * @property pixelFormat {@link PixelFormat} 像素格式
     * @property pixelDatatype {@link PixelDatatype} 信息类型
     * @property [flipY] Y
     * @property [sampler] {@link Sampler} 采样
     * @property [source] 源
     */
    export type TextureOptions = {
      context: any
      width?: number
      height?: number
      pixelFormat: PixelFormat
      pixelDatatype: PixelDatatype
      flipY?: boolean
      sampler?: Sampler
      source?: { arrayBufferView?: Float32Array }
    }

    /**
     * @description 渲染状态
     * @property depthTest 深度测试
     * @property depthMask 开启深度
     * @property blending 混合
     */
    export type RenderState = {
      viewport: undefined
      depthTest: {
        enabled: boolean
        func?: DepthFunction
      }
      depthMask: boolean
      blending?: { enabled: boolean } | any
    }
  }

  /**
   * @description 风场、洋流
   * @param earth {@link Earth} 地球实例
   * @param options {@link WindField.ConstructorOptions} 选项
   * @example
   * ```
   * const earth = useEarth()
   * const windField = new WindField(earth)
   * ```
   */
  export class WindField {
    constructor(earth: Earth, options: WindField.ConstructorOptions)
    /**
     * @description 更新
     * @param params {@link WindField.Param} 参数
     */
    update(params: WindField.Param): void
    /**
     * @description 隐藏
     */
    hide(): void
    /**
     * @description 显示
     */
    show(): void
    /**
     * @description 销毁
     */
    destroy(): void
  }

  export namespace PhasedSensorPrimitive {
    /**
     * @property [id] ID
     * @property [show = true] 是否显示
     * @property [slice = 32] 切分程度
     * @property [modelMatrix = {@link Matrix4.IDENTITY}] 矩阵模型
     * @property [radius = {@link Number.POSITIVE_INFINITY}] 扫描半径
     * @property [xHalfAngle = 0] 左右扫描半角，与行进方向垂直向上
     * @property [yHalfAngle = 0] 前后扫描半角，与行进方向垂直向上
     * @property [lineColor = {@link Color.WHITE}] 线条颜色
     * @property [material] {@link Material} 统一材质
     * @property [showSectorLines = true] 是否显示扇面的线
     * @property [showSectorSegmentLines = true] 是否显示扇面和圆顶面连接的线
     * @property [showLateralSurfaces = true] 是否显示侧面
     * @property [lateralSurfaceMaterial] {@link Material} 侧面材质
     * @property [showDomeSurfaces = true] 是否显示圆顶表面
     * @property [domeSurfaceMaterial] {@link Material} 圆顶表面材质
     * @property [showDomeLines = true] 是否显示圆顶面线
     * @property [showIntersection = true] 是否显示与地球相交的线
     * @property [intersectionColor = {@link Color.WHITE}] 与地球相交的线的颜色
     * @property [intersectionWidth = 5] 与地球相交的线的宽度`px`
     * @property [showThroughEllipsoid = false] 是否穿过地球
     * @property [showWaves = false] 是否显示雷达波
     * @property [showScanPlane = true] 是否显示扫描面
     * @property [scanPlaneColor = {@link Color.WHITE}] 扫描面颜色
     * @property [scanPlaneMode = {@link ScanMode.HORIZONTAL}] 扫描面模式
     * @property [scanPlaneRate = 10] 扫描速率
     * @property [distanceDisplayCondition] {@link DistanceDisplayCondition} 可视范围设置
     * @property [showGradient = false] 是否启用渐变色
     * @property [gradientColors] 有序渐变色组，固定5个
     * @property [gradientSteps] 渐变色占比，取值`[0,1]`，固定3个
     * @property [showGradientScan = false] 是否启用渐变色(扫描面)
     * @property [gradientColorsScan] 有序渐变色组(扫描面)，固定5个
     * @property [gradientStepsScan] 渐变色占比(扫描面)，取值(0,1)，固定3个
     */
    export type ConstructorOptions = {
      id?: Object
      show?: boolean
      slice?: number
      modelMatrix?: Matrix4
      radius?: number
      xHalfAngle?: number
      yHalfAngle?: number
      lineColor?: Color
      material?: Material
      showSectorLines?: boolean
      showSectorSegmentLines?: boolean
      showLateralSurfaces?: boolean
      lateralSurfaceMaterial?: Material
      showDomeSurfaces?: boolean
      domeSurfaceMaterial?: Material
      showDomeLines?: boolean
      showIntersection?: boolean
      intersectionColor?: Color
      intersectionWidth?: number
      showThroughEllipsoid?: boolean
      showWaves?: boolean
      showScanPlane?: boolean
      scanPlaneColor?: Color
      scanPlaneMode?: ScanMode
      scanPlaneRate?: number
      distanceDisplayCondition?: DistanceDisplayCondition
      showGradient?: boolean
      gradientColors?: Color[]
      gradientSteps?: number[]
      showGradientScan?: boolean
      gradientColorsScan?: Color[]
      gradientStepsScan?: number[]
    }
  }

  /**
   * @description 相控阵传感器图元
   * @param [options] {@link PhasedSensorPrimitive.ConstructorOptions} 参数
   */
  export class PhasedSensorPrimitive {
    readonly id: Object | undefined
    readonly show: boolean
    readonly slice: number
    readonly modelMatrix: Matrix4
    readonly radius: number
    readonly xHalfAngle: number
    readonly yHalfAngle: number
    readonly lineColor: Color
    readonly material: Material
    readonly showSectorLines: boolean
    readonly showSectorSegmentLines: boolean
    readonly showLateralSurfaces: boolean
    readonly lateralSurfaceMaterial: Material
    readonly showDomeSurfaces: boolean
    readonly domeSurfaceMaterial: Material
    readonly showDomeLines: boolean
    readonly showIntersection: boolean
    readonly intersectionColor: Color
    readonly intersectionWidth: number
    readonly showThroughEllipsoid: boolean
    readonly showWaves: boolean
    readonly showScanPlane: boolean
    readonly scanPlaneColor: Color
    readonly scanPlaneMode: ScanMode
    readonly scanPlaneRate: number
    readonly distanceDisplayCondition?: DistanceDisplayCondition
    readonly showGradient: boolean
    readonly gradientColors: Color[]
    readonly gradientSteps: number[]
    readonly showGradientScan: boolean
    readonly gradientColorsScan: Color[]
    readonly gradientStepsScan: number[]
    constructor(options?: PhasedSensorPrimitive.ConstructorOptions)
    update(frameState: FrameState): void
    isDestroyed(): boolean
    destroy(): void
  }

  export namespace CameraTool {
    /**
     * @description 根据层级获取对应的最大高度
     * @param level 层级
     * @returns 最大高度
     */
    const getLevelMaxHeight: (level: number) => number
    /**
     * @description 根据高度获取所属层级信息
     * @param height 高度
     * @returns 层级
     */
    const getLevelByHeight: (height: number) => number
    /**
     * @description 锁定相机到矩形区域内
     * @param camera 相机
     * @param rect 锁定矩形区域范围
     * @param [height] 锁定高度
     */
    const LockCameraInRectangle: (camera: Camera, rect: Rectangle, height?: number) => void
    /**
     * @description 根据屏幕坐标选取在地球上的笛卡尔三系坐标点
     * @param point 屏幕坐标
     * @param scene 当前场景
     * @param camera 当前相机
     * @returns 对应的笛卡尔三系坐标点或选取失败返回`undefined`
     */
    const PickPointOnEllipsoid: (point: Cartesian2, scene: Scene, camera: Camera) => Cartesian3 | undefined
    /**
     * @description 生成视图矩形范围
     * @param [viewRectangle] 相机区域
     * @returns 范围
     */
    const viewRectangleToLonLatRange: (viewRectangle?: Rectangle) => {
      lon: {
        min: number
        max: number
      }
      lat: {
        min: number
        max: number
      }
    }
  }

  /**
   * @description 算法
   * 1. 电子围栏
   * 2. 航线交汇
   * 3. 区域告警
   * 4. 路线规划
   * 5. 动态绘制
   * 6. 地形测量
   */
  export namespace Figure {
    export type Coordinate = Cartographic | Geographic
    export type GeoTurple = [number, number]
    export type Units =
      | "meters"
      | "millimeters"
      | "centimeters"
      | "kilometers"
      | "acres"
      | "miles"
      | "nauticalmiles"
      | "inches"
      | "yards"
      | "feet"
      | "radians"
      | "degrees"
      | "hectares"
    /**
     * @description 叉乘
     * 1. 多边形凹凸性
     * 2. 点所处直线的方位
     * 3. 三点构成的向量的顺逆时针方向
     * @param a 夹角点 [经度，纬度]
     * @param b 边缘点 [经度，纬度]
     * @param c 边缘点 [经度，纬度]
     * @returns 返回`number`值
     * 1. 返回值小于`0`则表示向量ac在ab的逆时针方向
     * 2. 返回值大于`0`则表示向量ac在ab的顺时针方向
     * 3. 返回值等于`0`则表示向量ab与ac共线
     */
    const CrossProduct: (a: GeoTurple, b: GeoTurple, c: GeoTurple) => number
    /**
     * @description 计算球体上两点的最近距离
     * @param from 坐标点
     * @param to 坐标点
     * @param [units = "meters"] 单位
     * @returns 距离
     */
    const CalcDistance: <T extends Coordinate>(from: T, to: T, units?: Units) => number
    /**
     * @description 计算球体上两点的大圆距离
     * @param from 坐标点
     * @param to 坐标点
     * @param [units = "meters"] 单位
     * @returns 距离
     */
    const CalcRhumbDistance: <T extends Coordinate>(from: T, to: T, units?: Units) => number
    /**
     * @description 计算球体上两点的贴地距离
     * @param from 坐标点
     * @param to 坐标点
     * @param scene 场景
     * @param terrainProvider 地形图层
     * @returns 距离 `m`
     */
    const CalcGroundDistance: <T extends Coordinate>(
      from: T,
      to: T,
      scene: Scene,
      terrainProvider: TerrainProvider
    ) => Promise<number>
    /**
     * @description 根据经纬度，距离，角度计算另外一个点
     * @param longitude 经度 <角度制>
     * @param latitude 纬度 <角度制>
     * @param distance 距离 `m`
     * @param angle 角度 <角度制>
     * @return 另外的点
     */
    const CalcPointByPointDistanceAngle: (
      longitude: number,
      latitude: number,
      distance: number,
      angle: number
    ) => number[]
    /**
     * @description 计算点是否在矩形中
     * @param point 坐标点
     * @param rectangle 矩形
     * @returns `boolean`值
     */
    const PointInRectangle: (point: Cartographic, rectangle: Rectangle) => boolean
    /**
     * @description 计算点是否在圆内
     * @param point 坐标点
     * @param center 圆心
     * @param radius 半径
     * @param [units = "meters"] 单位
     * @returns `boolean`值
     */
    const PointInCircle: <T extends Coordinate>(point: T, center: T, radius: number, units?: Units) => boolean
    /**
     * @description 计算点是否在多边形内
     * @param point 坐标点
     * @param polygon 多边形点坐标
     * @returns `boolean`值
     */
    const PointInPolygon: <T extends Coordinate>(point: T, polygon: T[]) => boolean
    /**
     * @description 计算两条线段是否相交
     * @param line1 线段1
     * @param line2 线段2
     * @returns `boolean`值
     */
    const PolylineIntersectPolyline: <T extends Coordinate>(line1: [T, T], line2: [T, T]) => boolean
    /**
     * @description 计算折线段是否与矩形相交
     * @param polyline 折线段
     * @param rectangle 矩形
     * @returns `boolean`值
     */
    const PolylineIntersectRectangle: (polyline: Cartographic[], rectangle: Rectangle) => boolean
    /**
     * @description 计算角度，以正北方向为基准
     * @param from 基准原点
     * @param to 参考点
     * @returns `[-180，180]`或`[-PI，PI]` 由输入值决定 <角度制> 或 <弧度制>
     */
    const CalcBearing: <T extends Coordinate>(from: T, to: T) => number
    /**
     * @description 计算大圆角度，以正北方向为基准
     * @param from 基准原点
     * @param to 参考点
     * @returns `[-180，180]`或`[-PI，PI]` 由输入值决定 <角度制> 或 <弧度制>
     */
    const CalcRhumbBearing: <T extends Coordinate>(from: T, to: T) => number
    /**
     * @description 计算三点夹角
     * @param a 夹角点
     * @param b 边缘点
     * @param c 边缘点
     * @returns `[-180，180]`或`[-PI，PI]` 由输入值决定 <角度制> 或 <弧度制>
     */
    const CalcAngle: <T extends Coordinate>(a: T, b: T, c: T) => number
    /**
     * @description 计算两点中心点
     * @param point1
     * @param point2
     * @returns 中心点
     */
    const CalcMidPoint: <T extends Coordinate>(point1: T, point2: T) => Coordinate
    /**
     * @description 计算多边形 / 多点的平面质心
     * @param points 多边形或平面的顶点
     * @param [withHeight = false] 是否计算时考虑高度
     * @returns 质心
     * @exception Polygon needs at least 4 vertexes.
     */
    const CalcMassCenter: (points: Coordinate[], withHeight?: boolean) => Coordinate
    /**
     * @description 计算一个一定位于多边形上的点
     * @param polygon 多边形
     * @returns 任意多边形上的点
     * @exception Polygon needs at least 4 vertexes.
     */
    const CalcPointOnPolygon: (polygon: Coordinate[]) => Coordinate
    /**
     * @descript 计算多边形面积
     * @param polygon 多边形坐标
     * @returns 面积 `㎡`
     */
    const CalcPolygonArea: (polygon: Coordinate[]) => number
    /**
     * @description 根据经纬度、椭圆半径及其旋转，生成对地投影椭圆 / 包络
     * @param x 经度 <角度制>
     * @param y 纬度 <角度制>
     * @param radius1 x 轴半径 米
     * @param radius2 y 轴半径 米
     * @param rotate 旋转 <弧度制>
     * @returns 包络点集合
     */
    const CalcEnvelope: (x: number, y: number, radius1: number, radius2: number, rotate: number) => number[][]
    /**
     * @description 根据高度和大圆弧长计算圆锥的真实高度和半径
     * @param height 对地高度
     * @param arc 大圆弧长
     * @returns 真实高度和半径
     */
    const CalcConic: (height: number, arc: number) => { radius: number; heihgt: number }
    /**
     * @description 计算数学累进距离
     * @param positions 坐标
     * @returns 距离
     */
    const CalcMathDistance: (positions: GeoTurple[]) => number
    /**
     * @description 根基两点构成的直线及夹角、半径计算第三点
     * @param target 基准点
     * @param origin 起始点
     * @param angle 角度
     * @param radius 半径
     * @param [revert = false] 是否逆时针
     * @returns 第三点
     */
    const CalcThirdPoint: (
      target: GeoTurple,
      origin: GeoTurple,
      angle: number,
      radius: number,
      revert?: boolean
    ) => GeoTurple
    /**
     * @description 计算两点构成的数学角度、以正北方向为基准
     * @param target 点1
     * @param origin 点2
     * @returns 角度 <弧度制>
     */
    const CalcAzimuth: (target: GeoTurple, origin: GeoTurple) => number
    /**
     * @description 计算三点的数学夹角
     * @param a 边缘点
     * @param b 夹角点
     * @param c 边缘点
     * @returns 数学角度值 <弧度制>
     */
    const CalcMathAngle: (a: GeoTurple, b: GeoTurple, c: GeoTurple) => number
  }

  export namespace Utils {
    /**
     * @description 获取随机ID
     * @param [symbol = "-"] 连接符
     * @returns 随机ID
     */
    const RandomUUID: (symbol?: UidFormat) => string
    /**
     * @description ID编码
     * @param id ID
     * @param [module] 模块
     * @returns 编码结果
     * @exception Invaid type of id, id must be string.
     * @exception Invaid id string 'Ω'.
     */
    const EncodeId: (id: string, module?: string) => string
    /**
     * @description ID解码
     * @param id 已编码ID
     * @returns ID 模块
     */
    const DecodeId: (id: string) => { id: string; module?: string }
    /**
     * @description 格式化经度
     * @param longitude 经度
     * @param [format = CoorFormat.DMS] {@link CoorFormat} 格式
     * @return 格式化结果
     */
    const formatGeoLongitude: (longitude: number, format?: CoorFormat) => string
    /**
     * @description 格式化纬度
     * @param latitude 纬度
     * @param format [format = CoorFormat.DMS] {@link CoorFormat} 格式
     * @return 格式化结果
     */
    const formatGeoLatitude: (latitude: number, format?: CoorFormat) => string
    /**
     * @description 将SVG图片格式转换为Canvas
     * @param svg SVG图片
     * @param [width = 48] 宽度
     * @param [height = 48] 高度
     * @returns Canvas结果
     */
    const ConvertSvg2Canvas: (svg: string, width?: number, height?: number) => HTMLCanvasElement
  }

  /**
   * @description 动态绘制的状态管理
   */
  export class State {
    static start(): void
    static end(): void
    static isOperate(): boolean
  }

  /**
   * @description 动态笔触
   */
  export class StrokeDynamic<T = unknown> extends Dynamic<PolylineLayer<T>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 笔触不支持编辑，添加对象仅增加图形
     * @param param 笔触参数
     */
    add(param: PolylineLayer.AddParam<T>): void
    /**
     * @description 笔触
     * @param param {@link Draw.Stroke} 笔触参数
     * @returns 笔触沿途点
     */
    draw(param: Draw.Stroke): Promise<Draw.StrokeReturn>
    edit(id: string): Promise<unknown>
  }

  /**
   * @description 动态绘制攻击箭头
   */
  export class AttackArrowDynamic extends Dynamic<PolygonLayer<Dynamic.AttackArrow>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: PolygonLayer.AddParam<Dynamic.AttackArrow>): void
    /**
     * @description 动态画攻击箭头
     * @param param {@link Draw.AttackArrow} 画箭头参数
     * @returns 攻击发起点和沿途选点的坐标
     */
    draw(param: Draw.AttackArrow): Promise<Draw.AttackArrowReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.AttackArrowReturn>
  }

  /**
   * @description 动态绘制广告牌
   */
  export class BillboardDynamic extends Dynamic<BillboardLayer<Dynamic.Billboard>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: BillboardLayer.AddParam<Dynamic.Billboard>): void
    /**
     * @description 动态画广告牌
     * @param param {@link Draw.Billboard} 画广告牌参数
     * @returns 点的坐标
     */
    draw(param: Draw.Billboard): Promise<Draw.BillboardReturn[]>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.BillboardReturn>
  }

  /**
   * @description 动态绘制圆
   */
  export class CircleDynamic extends Dynamic<EllipseLayer<Dynamic.Circle>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: EllipseLayer.AddParam<Dynamic.Circle>): void
    /**
     * @description 动态画圆
     * @param param {@link Draw.Circle} 画圆参数
     * @returns 圆心坐标和半径
     */
    draw(param: Draw.Circle): Promise<Draw.CircleReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<unknown>
  }

  /**
   * @description 动态绘制标签
   */
  export class LabelDynamic extends Dynamic<LabelLayer<Dynamic.Label>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: LabelLayer.AddParam<Dynamic.Label>): void
    /**
     * @description 动态画标签
     * @param param {@link Draw.Label} 画标签参数
     * @returns 标签的坐标
     */
    draw(param: Draw.Label): Promise<Draw.LabelReturn[]>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.LabelReturn>
  }

  /**
   * @description 动态绘制模型
   */
  export class ModelDynamic extends Dynamic<ModelLayer<Dynamic.Model>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: ModelLayer.AddParam<Dynamic.Model>): void
    /**
     * @description 动态画模型
     * @param param {@link Draw.Model} 画模型参数
     * @returns 点的坐标
     */
    draw(param: Draw.Model): Promise<Draw.ModelReturn[]>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.ModelReturn>
  }

  /**
   * @description 动态绘制嵌击箭头
   */
  export class PincerArrowDynamic extends Dynamic<PolygonLayer<Dynamic.PincerArrow>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: PolygonLayer.AddParam<Dynamic.PincerArrow>): void
    /**
     * @description 动态画钳击箭头
     * @param param {@link Draw.PincerArrow} 画箭头参数
     * @returns 沿途选点的坐标
     */
    draw(param: Draw.PincerArrow): Promise<Draw.PincerArrowReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<unknown>
  }

  /**
   * @description 动态绘制点
   */
  export class PointDynamic extends Dynamic<PointLayer<Dynamic.Point>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: PointLayer.AddParam<Dynamic.Point>): void
    /**
     * @description 动态画点
     * @param param {@link Draw.Point} 画点参数
     * @returns 点的坐标
     */
    draw(param: Draw.Point): Promise<Draw.PointReturn[]>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.PointReturn>
  }

  /**
   * @description 动态绘制多边形
   */
  export class PolygonDynamic extends Dynamic<PolygonLayer<Dynamic.Polygon>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: PolygonLayer.AddParam<Dynamic.Polygon>): void
    /**
     * @description 动态画多边形
     * @param param {@link Draw.Polygon} 画多边形参数
     * @returns 多边形点的坐标
     */
    draw(param: Draw.Polygon): Promise<Draw.PolygonReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.PolygonReturn>
  }

  /**
   * @description 动态绘制折线段
   */
  export class PolylineDynamic extends Dynamic<PolylineLayer<Dynamic.Polyline>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: PolylineLayer.AddParam<Dynamic.Polyline>): void
    /**
     * @description 动态画线段
     * @param param {@link Draw.Polyline} 画线段参数
     * @returns 线段点的坐标
     * @exception A certain material type is required.
     */
    draw(param: Draw.Polyline): Promise<Draw.PolylineReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.PolylineReturn>
  }

  /**
   * @description 动态绘制矩形
   */
  export class RectangleDynamic extends Dynamic<RectangleLayer<Dynamic.Rectangle>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: RectangleLayer.AddParam<Dynamic.Rectangle>): void
    /**
     * @description 动态画矩形
     * @param param {@link Draw.Rectangle} 画矩形参数
     * @returns 矩形
     */
    draw(param: Draw.Rectangle): Promise<Draw.RectangleReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.RectangleReturn>
  }

  /**
   * @description 动态绘制直线箭头
   */
  export class StraightArrowDynamic extends Dynamic<PolygonLayer<Dynamic.StraightArrow>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: PolygonLayer.AddParam<Dynamic.StraightArrow>): void
    /**
     * @description 动态画直线箭头
     * @param param {@link Draw.StraightArrow} 画箭头参数
     * @returns 起始和结束点的坐标
     */
    draw(param: Draw.StraightArrow): Promise<Draw.StraightArrowReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<unknown>
  }

  /**
   * @description 动态绘制墙体
   */
  export class WallDynamic extends Dynamic<WallLayer<Dynamic.Wall>> {
    type: string
    constructor(earth: Earth)
    /**
     * @description 添加可编辑对象
     * @param param 新增参数以及可编辑附加数据
     */
    add(param: WallLayer.AddParam<Dynamic.Wall>): void
    /**
     * @description 动态画墙体
     * @param param {@link Draw.Wall} 画墙体参数
     * @returns 墙体点的坐标
     */
    draw(param: Draw.Wall): Promise<Draw.WallReturn>
    /**
     * @description 编辑
     * @param id 目标ID
     * @returns
     */
    edit(id: string): Promise<Draw.WallReturn>
  }

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
    readonly allowDestroy: boolean
    billboard: BillboardLayer
    ellipse: EllipseLayer
    point: PointLayer
    polygon: PolygonLayer
    polyline: PolylineLayer
    rectangle: RectangleLayer
    /**
     * @deprecated 已废弃，请使用 `WallLayer` 手动初始化
     */
    wall: WallLayer
    constructor(earth: Earth)
    /**
     * @description 重置图层
     * @example
     * ```
     * const earth = useEarth()
     * const layers = new GraphicsLayer(earth)
     * layers.reset()
     * ```
     */
    reset(): void
    /**
     * @description 强制销毁
     * @example
     * ```
     * const earth = useEarth()
     * const layers = new GraphicsLayer(earth)
     * layers.forceDestroy()
     * ```
     */
    forceDestroy(): void
  }

  /**
   * @description 初始化地球
   * @param [id = "GisContainer"] 当前地球的ID
   * @param [ref = "GisContainer"] 容器ID / 容器实例 / Viewer实例
   * @param [cesiumOptions] Cesium设置
   * @param [options] {@link Earth.ConstructorOptions} 设置
   * @returns 地球实例
   */
  export const useEarth: (
    id?: string,
    ref?: string | HTMLDivElement | Viewer,
    cesiumOptions?: Viewer.ConstructorOptions,
    options?: Earth.ConstructorOptions
  ) => Earth

  /**
   * @description 销毁指定地球并回收相关资源
   * @param [id = "GisContainer"] 指定ID的地球
   * @returns 成功返回 `true`，未找到指定地球返回 `false`
   */
  export const useEarthRecycle: (id?: string) => void

  /**
   * @description 使用CesiumNavigation初始化控制摇杆
   * @param earth 地球
   * @param [option] 控制摇杆参数
   * @returns 控制遥杆
   */
  export const useNavigation: (earth: Earth, option?: CesiumNavigation.ConstructorOptions) => CesiumNavigation

  /**
   * @description 创建URL模板的地图瓦片图层
   * @param option {@link UrlTemplateImageryProvider.ConstructorOptions} 参数
   * @returns {UrlTemplateImageryProvider} 地图瓦片
   */
  export const useTileImageryProvider: (
    option: UrlTemplateImageryProvider.ConstructorOptions
  ) => UrlTemplateImageryProvider
}
