import {
  Cartesian2,
  Cartesian3,
  Color,
  HorizontalOrigin,
  LabelStyle,
  Rectangle as Rect,
  Scene,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
} from "cesium"
import { Earth } from "components/Earth"
import {
  BillboardLayer,
  EllipseLayer,
  LabelLayer,
  ModelLayer,
  PointLayer,
  PolygonLayer,
  PolylineLayer,
  RectangleLayer,
  WallLayer,
} from "components/layers"
import { DrawType, DefaultModuleName, EditableType, SubEventType } from "enum"
import { State, Utils } from "utils"
import { AttackArrowDynamic } from "./AttackArrowDynamic"
import { BillboardDynamic } from "./BillboardDynamic"
import { CircleDynamic } from "./CircleDynamic"
import { ModelDynamic } from "./ModelDynamic"
import { PincerArrowDynamic } from "./PincerArrowDynamic"
import { PointDynamic } from "./PointDynamic"
import { PolygonDynamic } from "./PolygonDynamic"
import { PolylineDynamic } from "./PolylineDynamic"
import { RectangleDynamic } from "./RectangleDynamic"
import { StraightArrowDynamic } from "./StraightArrowDynamic"
import { StrokeDynamic } from "./StrokeDynamic"
import { WallDynamic } from "./WallDynamic"
import { LabelDynamic } from "./LabelDynamic"
import { Dynamic } from "./Dynamic"

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
   * @property [loop = false] 图形是否首尾相连
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
    loop?: boolean
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
  private scene: Scene
  private destroyed: boolean = false
  private point: PointDynamic
  private billboard: BillboardDynamic
  private circle: CircleDynamic
  private model: ModelDynamic
  private rectangle: RectangleDynamic
  private polygon: PolygonDynamic
  private polyline: PolylineDynamic
  private straightArrow: StraightArrowDynamic
  private attackArrow: AttackArrowDynamic
  private pincerArrow: PincerArrowDynamic
  private wall: WallDynamic
  private stroke: StrokeDynamic
  private label: LabelDynamic
  private editHandler: ScreenSpaceEventHandler

  constructor(earth: Earth) {
    this.scene = earth.scene

    this.point = new PointDynamic(earth)
    this.billboard = new BillboardDynamic(earth)
    this.circle = new CircleDynamic(earth)
    this.model = new ModelDynamic(earth)
    this.rectangle = new RectangleDynamic(earth)
    this.polygon = new PolygonDynamic(earth)
    this.polyline = new PolylineDynamic(earth)
    this.straightArrow = new StraightArrowDynamic(earth)
    this.attackArrow = new AttackArrowDynamic(earth)
    this.pincerArrow = new PincerArrowDynamic(earth)
    this.wall = new WallDynamic(earth)
    this.stroke = new StrokeDynamic(earth)
    this.label = new LabelDynamic(earth)

    this.editHandler = new ScreenSpaceEventHandler(earth.viewer.canvas)
  }

  /**
   * @description 根据ID获取动态绘制实体
   * @param id ID
   * @returns 实体
   */
  public getEntity(id: string) {
    const b = this.billboard.getEntity(id)
    const p = this.point.getEntity(id)
    const pg = this.polygon.getEntity(id)
    const pl = this.polyline.getEntity(id)
    const r = this.rectangle.getEntity(id)
    const c = this.circle.getEntity(id)
    const m = this.model.getEntity(id)
    const aa = this.attackArrow.getEntity(id)
    const sa = this.straightArrow.getEntity(id)
    const pa = this.pincerArrow.getEntity(id)
    const w = this.wall.getEntity(id)
    const st = this.stroke.getEntity(id)
    const l = this.label.getEntity(id)
    return b || p || pg || pl || r || c || m || aa || sa || pa || w || st || l
  }

  /**
   * @description 动态绘制或编辑事件订阅
   * @param target {@link DrawType} 绘制类型
   * @param event {@link SubEventType} 事件类型
   * @param callback {@link Draw.EventCallback} 回调
   */
  public subscribe(target: DrawType, event: SubEventType, callback: Draw.EventCallback) {
    switch (target) {
      case DrawType.POINT: {
        this.point.subscribe(event, callback)
        break
      }
      case DrawType.BILLBOARD: {
        this.billboard.subscribe(event, callback)
        break
      }
      case DrawType.CIRCLE: {
        this.circle.subscribe(event, callback)
        break
      }
      case DrawType.MODEL: {
        this.model.subscribe(event, callback)
        break
      }
      case DrawType.POLYGON: {
        this.polygon.subscribe(event, callback)
        break
      }
      case DrawType.POLYLINE: {
        this.polyline.subscribe(event, callback)
        break
      }
      case DrawType.RECTANGLE: {
        this.rectangle.subscribe(event, callback)
        break
      }
      case DrawType.STRAIGHT_ARROW: {
        this.straightArrow.subscribe(event, callback)
        break
      }
      case DrawType.ATTACK_ARROW: {
        this.attackArrow.subscribe(event, callback)
        break
      }
      case DrawType.PINCER_ARROW: {
        this.pincerArrow.subscribe(event, callback)
        break
      }
      case DrawType.WALL: {
        this.wall.subscribe(event, callback)
        break
      }
      case DrawType.STROKE: {
        this.stroke.subscribe(event, callback)
        break
      }
      case DrawType.LABEL: {
        this.label.subscribe(event, callback)
        break
      }
    }
  }

  /**
   * @description 取消动态绘制或编辑事件订阅
   * @param target {@link DrawType} 绘制类型
   * @param event {@link SubEventType} 事件类型
   * @param callback {@link Draw.EventCallback} 回调
   */
  public unsubscribe(target: DrawType, event: SubEventType, callback: Draw.EventCallback) {
    switch (target) {
      case DrawType.POINT: {
        this.point.unsubscribe(event, callback)
        break
      }
      case DrawType.BILLBOARD: {
        this.billboard.unsubscribe(event, callback)
        break
      }
      case DrawType.CIRCLE: {
        this.circle.unsubscribe(event, callback)
        break
      }
      case DrawType.MODEL: {
        this.model.unsubscribe(event, callback)
        break
      }
      case DrawType.POLYGON: {
        this.polygon.unsubscribe(event, callback)
        break
      }
      case DrawType.POLYLINE: {
        this.polyline.unsubscribe(event, callback)
        break
      }
      case DrawType.RECTANGLE: {
        this.rectangle.unsubscribe(event, callback)
        break
      }
      case DrawType.STRAIGHT_ARROW: {
        this.straightArrow.unsubscribe(event, callback)
        break
      }
      case DrawType.ATTACK_ARROW: {
        this.attackArrow.unsubscribe(event, callback)
        break
      }
      case DrawType.PINCER_ARROW: {
        this.pincerArrow.unsubscribe(event, callback)
        break
      }
      case DrawType.WALL: {
        this.wall.unsubscribe(event, callback)
        break
      }
      case DrawType.STROKE: {
        this.stroke.unsubscribe(event, callback)
        break
      }
      case DrawType.LABEL: {
        this.label.unsubscribe(event, callback)
        break
      }
    }
  }

  /**
   * @description 设置动态绘制对象是否可编辑
   * @param value 是否可编辑
   */
  public setEditable(value: boolean) {
    if (!value) {
      this.editHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK)
      return
    }

    this.editHandler.setInputAction(async (evt: ScreenSpaceEventHandler.PositionedEvent) => {
      if (State.isOperate()) return
      const pick = this.scene.pick(evt.position)
      if (pick) {
        const _id = Utils.DecodeId(pick.id).id
        const ent = this.getEntity(_id)!
        if (!ent.data.data) return
        switch ((ent.data.data as { type: DrawType }).type) {
          case DrawType.POINT: {
            const res = await this.point.edit(_id)
            break
          }
          case DrawType.BILLBOARD: {
            const res = await this.billboard.edit(_id)
            break
          }
          case DrawType.MODEL: {
            const res = await this.model.edit(_id)
            break
          }
          case DrawType.POLYLINE: {
            const res = await this.polyline.edit(_id)
            break
          }
          case DrawType.POLYGON: {
            const res = await this.polygon.edit(_id)
            break
          }
          case DrawType.RECTANGLE: {
            const res = await this.rectangle.edit(_id)
            break
          }
          case DrawType.ATTACK_ARROW: {
            const res = await this.attackArrow.edit(_id)
            break
          }
          case DrawType.PINCER_ARROW: {
            const res = await this.pincerArrow.edit(_id)
            break
          }
          case DrawType.STRAIGHT_ARROW: {
            const res = await this.straightArrow.edit(_id)
            break
          }
          case DrawType.WALL: {
            const res = await this.wall.edit(_id)
            break
          }
          case DrawType.LABEL: {
            const res = await this.label.edit(_id)
            break
          }
          default: {
            break
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK)
  }

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
  public addFeature(type: EditableType.ATTACK_ARROW, option: PolygonLayer.AddParam<Dynamic.AttackArrow>): void
  public addFeature(type: EditableType.BILLBOARD, option: BillboardLayer.AddParam<Dynamic.Billboard>): void
  public addFeature(type: EditableType.CIRCLE, option: EllipseLayer.AddParam<Dynamic.Circle>): void
  public addFeature(type: EditableType.LABEL, option: LabelLayer.AddParam<Dynamic.Label>): void
  public addFeature(type: EditableType.MODEL, option: ModelLayer.AddParam<Dynamic.Model>): void
  public addFeature(type: EditableType.PINCER_ARROW, option: PolygonLayer.AddParam<Dynamic.PincerArrow>): void
  public addFeature(type: EditableType.POINT, option: PointLayer.AddParam<Dynamic.Point>): void
  public addFeature(type: EditableType.POLYGON, option: PolygonLayer.AddParam<Dynamic.Polygon>): void
  public addFeature(type: EditableType.POLYLINE, option: PolylineLayer.AddParam<Dynamic.Polyline>): void
  public addFeature(type: EditableType.RECTANGLE, option: RectangleLayer.AddParam<Dynamic.Rectangle>): void
  public addFeature(type: EditableType.STRAIGHT_ARROW, option: PolygonLayer.AddParam<Dynamic.StraightArrow>): void
  public addFeature(type: EditableType.WALL, option: WallLayer.AddParam<Dynamic.Wall>): void
  public addFeature(type: EditableType, option: Draw.Features) {
    switch (type) {
      case EditableType.ATTACK_ARROW: {
        this.attackArrow.add(option as PolygonLayer.AddParam<Dynamic.AttackArrow>)
        break
      }
      case EditableType.BILLBOARD: {
        this.billboard.add(option as BillboardLayer.AddParam<Dynamic.Billboard>)
        break
      }
      case EditableType.CIRCLE: {
        this.circle.add(option as EllipseLayer.AddParam<Dynamic.Circle>)
        break
      }
      case EditableType.LABEL: {
        this.label.add(option as LabelLayer.AddParam<Dynamic.Label>)
        break
      }
      case EditableType.MODEL: {
        this.model.add(option as ModelLayer.AddParam<Dynamic.Model>)
        break
      }
      case EditableType.PINCER_ARROW: {
        this.pincerArrow.add(option as PolygonLayer.AddParam<Dynamic.PincerArrow>)
        break
      }
      case EditableType.POINT: {
        this.point.add(option as PointLayer.AddParam<Dynamic.Point>)
        break
      }
      case EditableType.POLYGON: {
        this.polygon.add(option as PolygonLayer.AddParam<Dynamic.Polygon>)
        break
      }
      case EditableType.POLYLINE: {
        this.polyline.add(option as PolylineLayer.AddParam<Dynamic.Polyline>)
        break
      }
      case EditableType.RECTANGLE: {
        this.rectangle.add(option as RectangleLayer.AddParam<Dynamic.Rectangle>)
        break
      }
      case EditableType.STRAIGHT_ARROW: {
        this.straightArrow.add(option as PolygonLayer.AddParam<Dynamic.StraightArrow>)
        break
      }
      case EditableType.WALL: {
        this.wall.add(option as WallLayer.AddParam<Dynamic.Wall>)
        break
      }
    }
  }

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
  public draw(type: DrawType.ATTACK_ARROW, option: Draw.AttackArrow): Promise<Draw.AttackArrowReturn>
  public draw(type: DrawType.BILLBOARD, option: Draw.Billboard): Promise<Draw.BillboardReturn[]>
  public draw(type: DrawType.CIRCLE, option: Draw.Circle): Promise<Draw.CircleReturn>
  public draw(type: DrawType.MODEL, option: Draw.Model): Promise<Draw.ModelReturn[]>
  public draw(type: DrawType.WALL, option: Draw.Wall): Promise<Draw.WallReturn>
  public draw(type: DrawType.PINCER_ARROW, option: Draw.PincerArrow): Promise<Draw.PincerArrowReturn>
  public draw(type: DrawType.POINT, option: Draw.Point): Promise<Draw.PointReturn[]>
  public draw(type: DrawType.POLYGON, option: Draw.Polygon): Promise<Draw.PolygonReturn>
  public draw(type: DrawType.POLYLINE, option: Draw.Polyline): Promise<Draw.PolylineReturn>
  public draw(type: DrawType.RECTANGLE, option: Draw.Rectangle): Promise<Draw.RectangleReturn>
  public draw(type: DrawType.STRAIGHT_ARROW, option: Draw.StraightArrow): Promise<Draw.StraightArrowReturn>
  public draw(type: DrawType.STROKE, option: Draw.Stroke): Promise<Draw.StrokeReturn>
  public draw(type: DrawType.LABEL, option: Draw.Label): Promise<Draw.LabelReturn[]>
  public draw(type: DrawType, option: Draw.Options) {
    switch (type) {
      case DrawType.ATTACK_ARROW: {
        return this.attackArrow.draw(option as Draw.AttackArrow)
      }
      case DrawType.BILLBOARD: {
        return this.billboard.draw(option as Draw.Billboard)
      }
      case DrawType.CIRCLE: {
        return this.circle.draw(option as Draw.Circle)
      }
      case DrawType.MODEL: {
        return this.model.draw(option as Draw.Model)
      }
      case DrawType.WALL: {
        return this.wall.draw(option as Draw.Wall)
      }
      case DrawType.PINCER_ARROW: {
        return this.pincerArrow.draw(option as Draw.PincerArrow)
      }
      case DrawType.POINT: {
        return this.point.draw(option as Draw.Point)
      }
      case DrawType.POLYGON: {
        return this.polygon.draw(option as Draw.Polygon)
      }
      case DrawType.POLYLINE: {
        return this.polyline.draw(option as Draw.Polyline)
      }
      case DrawType.RECTANGLE: {
        return this.rectangle.draw(option as Draw.Rectangle)
      }
      case DrawType.STRAIGHT_ARROW: {
        return this.straightArrow.draw(option as Draw.StraightArrow)
      }
      case DrawType.STROKE: {
        return this.stroke.draw(option as Draw.Stroke)
      }
      case DrawType.LABEL: {
        return this.label.draw(option as Draw.Label)
      }
    }
  }

  /**
   * @description 清除所有动态绘制对象
   * @example
   * ```
   * const earth = useEarth()
   * const draw = new Draw()
   * draw.remove()
   * ```
   */
  public remove(): void
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
  public remove(id: string): void
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
  public remove(option: Draw.RemoveOptions): void
  public remove(option?: string | Draw.RemoveOptions) {
    if (!option) {
      this.billboard.remove()
      this.circle.remove()
      this.model.remove()
      this.wall.remove()
      this.point.remove()
      this.polygon.remove()
      this.polyline.remove()
      this.rectangle.remove()
      this.straightArrow.remove()
      this.attackArrow.remove()
      this.pincerArrow.remove()
      this.stroke.remove()
      this.label.remove()
    } else if (typeof option === "string") {
      this.billboard.remove(option)
      this.circle.remove(option)
      this.model.remove(option)
      this.wall.remove(option)
      this.point.remove(option)
      this.polygon.remove(option)
      this.polyline.remove(option)
      this.rectangle.remove(option)
      this.straightArrow.remove(option)
      this.attackArrow.remove(option)
      this.pincerArrow.remove(option)
      this.stroke.remove(option)
      this.label.remove(option)
    } else {
      if (option.billboard) this.billboard.remove()
      if (option.circle) this.circle.remove()
      if (option.model) this.model.remove()
      if (option.wall) this.wall.remove()
      if (option.point) this.point.remove()
      if (option.polygon) this.polygon.remove()
      if (option.polyline) this.polyline.remove()
      if (option.rectangle) this.rectangle.remove()
      if (option.straightArrow) this.straightArrow.remove()
      if (option.attackArrow) this.attackArrow.remove()
      if (option.pincerArrow) this.pincerArrow.remove()
      if (option.stroke) this.stroke.remove()
      if (option.label) this.label.remove()
    }
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
    this.editHandler.destroy()
    this.attackArrow.destroy()
    this.billboard.destroy()
    this.circle.destroy()
    this.pincerArrow.destroy()
    this.point.destroy()
    this.polygon.destroy()
    this.polyline.destroy()
    this.rectangle.destroy()
    this.straightArrow.destroy()
    this.label.destroy()
    this.model.destroy()
    this.wall.destroy()
    this.stroke.destroy()
    this.scene = undefined as any
    this.editHandler = undefined as any
    this.attackArrow = undefined as any
    this.billboard = undefined as any
    this.circle = undefined as any
    this.pincerArrow = undefined as any
    this.point = undefined as any
    this.polygon = undefined as any
    this.polyline = undefined as any
    this.rectangle = undefined as any
    this.straightArrow = undefined as any
    this.label = undefined as any
    this.model = undefined as any
    this.wall = undefined as any
    this.stroke = undefined as any
  }
}
