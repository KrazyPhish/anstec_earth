import { Viewer, Scene, Camera, ScreenSpaceEventHandler, Entity, Cartesian2, Cartesian3 } from "cesium"
import {
  BillboardLayer,
  Draw,
  Earth,
  EllipseLayer,
  EventBus,
  LabelLayer,
  ModelLayer,
  PointLayer,
  PolygonLayer,
  PolylineLayer,
  RectangleLayer,
  WallLayer,
} from ".."
import { State, CameraTool } from "utils"
import { DrawType, SubEventType } from "enum"

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

  export type AttackArrow = Data<DrawType.ATTACK_ARROW, Omit<Draw.AttackArrow, "onFinish" | "onEvery" | "keep" | "id">>

  export type Billboard = Data<
    DrawType.BILLBOARD,
    Omit<Draw.Billboard, "onEvery" | "onFinish" | "keep" | "limit" | "id">
  >

  export type Circle = Data<DrawType.CIRCLE, Omit<Draw.Circle, "onFinish" | "keep" | "id"> & { radius: number }>

  export type Label = Data<DrawType.LABEL, Omit<Draw.Label, "id" | "limit" | "keep" | "onEvery" | "onFinish">>

  export type Model = Data<DrawType.MODEL, Omit<Draw.Model, "onEvery" | "onFinish" | "keep" | "color" | "limit" | "id">>

  export type PincerArrow = Data<DrawType.PINCER_ARROW, Omit<Draw.PincerArrow, "onFinish" | "onEvery" | "keep" | "id">>

  export type Point = Data<DrawType.POINT, Pick<Draw.Point, "color" | "pixelSize" | "module">>

  export type Polygon = Data<DrawType.POLYGON, Omit<Draw.Polygon, "onEvery" | "onFinish" | "onMove" | "keep" | "id">>

  export type Polyline = Data<DrawType.POLYLINE, Omit<Draw.Polyline, "id" | "keep" | "onMove" | "onEvery" | "onFinish">>

  export type Rectangle = Data<DrawType.RECTANGLE, Pick<Draw.Rectangle, "color" | "ground" | "module">>

  export type StraightArrow = Data<DrawType.STRAIGHT_ARROW, Omit<Draw.StraightArrow, "onFinish" | "keep" | "id">>

  export type Wall = Data<DrawType.WALL, Omit<Draw.Wall, "id" | "keep" | "onMove" | "onEvery" | "onFinish">>
}

/**
 * @description 动态绘制基类
 */
export abstract class Dynamic<L extends Dynamic.Layer> {
  private destroyed: boolean = false
  public abstract type: string
  protected layer: L

  protected viewer: Viewer
  protected scene: Scene
  protected camera: Camera

  protected editHandler: ScreenSpaceEventHandler
  protected eventBus: EventBus

  protected cacheHandler?: ScreenSpaceEventHandler
  protected cacheEntity?: Entity

  constructor(
    private earth: Earth,
    layer: L
  ) {
    this.viewer = earth.viewer
    this.scene = earth.viewer.scene
    this.camera = earth.camera
    this.layer = layer
    this.editHandler = new ScreenSpaceEventHandler(earth.viewer.canvas)
    this.eventBus = new EventBus()
  }

  /**
   * @description 开始绘制事件
   * @returns 事件管理器
   */
  protected startEvent() {
    State.start()
    this.earth.container.style.cursor = "crosshair"
    return new ScreenSpaceEventHandler(this.viewer.canvas)
  }

  /**
   * @description 结束绘制事件
   * @param handler 要结束的事件管理器
   */
  protected endEvent(handler: ScreenSpaceEventHandler) {
    this.earth.container.style.cursor = "default"
    State.end()
    handler.destroy()
    this.setViewControl(true)
  }

  /**
   * @description 屏幕坐标获取球体上的点
   * @param point {@link Cartesian2} 屏幕坐标
   * @returns
   */
  protected getPointOnEllipsoid(point: Cartesian2) {
    return CameraTool.PickPointOnEllipsoid(point, this.scene, this.camera)
  }

  /**
   * @description 锁定镜头控制权
   * @param value 值
   */
  protected setViewControl(value: boolean) {
    this.scene.screenSpaceCameraController.enableRotate = value
    this.scene.screenSpaceCameraController.enableTilt = value
    this.scene.screenSpaceCameraController.enableTranslate = value
    this.scene.screenSpaceCameraController.enableInputs = value
  }

  /**
   * @description 添加实体的抽象方法
   * @param param 选项
   */
  public abstract add(param: any): void

  /**
   * @description 动态绘制的抽象方法
   * @param param 选项
   */
  public abstract draw(param: any): Promise<unknown>

  /**
   * @description 动态编辑的抽象方法
   * @param id 编辑的实体ID
   */
  public abstract edit(id: string): Promise<unknown>

  /**
   * @description 订阅绘制或编辑时事件
   * @param event 事件
   * @param callback 回调函数
   */
  public abstract subscribe(event: SubEventType, callback: (...args: any) => void): void

  /**
   * @description 取消订阅绘制或编辑时事件
   * @param event 事件
   * @param callback 回调函数
   */
  public abstract unsubscribe(event: SubEventType, callback: (...args: any) => void): void

  /**
   * @description 根据ID获取动态绘制实体
   * @param id ID
   * @returns 实体
   */
  public getEntity(id: string) {
    return this.layer.getEntity(id)
  }

  /**
   * @description 强制终断，仅终断绘制，不终断编辑
   */
  public interrupt() {
    this.cacheHandler?.destroy()
    this.cacheEntity && this.viewer.entities.remove(this.cacheEntity)
    this.cacheHandler = undefined
    this.cacheEntity = undefined
    this.setViewControl(true)
    State.end()
  }

  /**
   * @description 清除所有动态绘制对象
   */
  public remove(): void
  /**
   * @description 按ID清除动态绘制对象
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      this.layer.remove(id)
    } else {
      this.layer.remove()
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
    this.interrupt()
    this.remove()
    this.layer.destroy()
    this.editHandler.destroy()
    this.earth = undefined as any
    this.viewer = undefined as any
    this.scene = undefined as any
    this.camera = undefined as any
    this.editHandler = undefined as any
    this.cacheEntity = undefined
    this.cacheHandler = undefined
  }
}
