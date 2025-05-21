import {
  Billboard,
  Camera,
  CumulusCloud,
  GroundPolylinePrimitive,
  GroundPrimitive,
  Label,
  Model,
  ParticleSystem,
  PointPrimitive,
  Primitive,
  Scene,
  Viewer,
} from "cesium"
import { Earth } from "../Earth"
import { BillboardCollection } from "cesium"
import { CloudCollection } from "cesium"
import { LabelCollection } from "cesium"
import { PrimitiveCollection } from "cesium"
import type { PointPrimitiveCollection } from "cesium"

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
   * @description cesium中合法的集合对象
   */
  export type Collections =
    | BillboardCollection
    | CloudCollection
    | LabelCollection
    | PointPrimitiveCollection
    | PrimitiveCollection
}

/**
 * @description 图层基类
 * @param earth {@link Earth} 地球实例
 * @param collection {@link Layer.Collections} 集合
 */
export abstract class Layer<C extends Layer.Collections, P extends Layer.Primitives, D> {
  /**
   * @description 是否允许销毁
   */
  private allowDestroy: boolean = true
  /**
   * @description 销毁状态
   */
  private destroyed: boolean = false
  /**
   * @description 图元的集合
   */
  public collection: C
  /**
   * @description 对象实体缓存
   */
  protected cache: Map<string, Layer.Cache<P, D>> = new Map()
  protected scene: Scene
  protected viewer: Viewer
  protected camera: Camera

  constructor(
    protected earth: Earth,
    collection: C
  ) {
    this.collection = earth.scene.primitives.add(collection)
    this.viewer = earth.viewer
    this.scene = earth.viewer.scene
    this.camera = earth.viewer.camera
  }

  /**
   * @description 设置是否可被销毁
   * @param status
   */
  public setAllowDestroy(status: boolean) {
    this.allowDestroy = status
  }

  /**
   * @description 获取是否可被销毁的属性
   */
  public getAllowDestroy() {
    return this.allowDestroy
  }

  /**
   * @description 绘制并缓存新增对象
   * @param id ID
   * @param param {@link Layer.Cache} 缓存的数据
   * @returns `primitive`图元实例
   */
  protected save(id: string, param: Layer.Cache<P, D>): P {
    const primitive = this.collection.add(param.primitive)
    this.cache.set(id, { primitive, data: param.data })
    return primitive
  }

  /**
   * @description 抽象新增方法
   * @param option 选项
   */
  public abstract add(option: any): void

  /**
   * @description 根据ID获取实体
   * @param id ID
   * @returns 实体
   */
  public getEntity(id: string): Layer.Cache<P, D> | undefined {
    return this.cache.get(id)
  }

  /**
   * @description 根据ID获取实体的数据
   * @param id ID
   * @returns 实体数据
   */
  public getData(id: string): D | undefined {
    return this.getEntity(id)?.data
  }

  /**
   * @description 根据ID测试实体条目是否存在
   * @param id ID
   * @returns 返回`boolean`值
   */
  public has(id: string): boolean {
    return this.cache.has(id)
  }

  /**
   * @description 根据ID判断实体图元是否存在
   * @param id ID
   * @returns 返回`boolean`值
   */
  public exist(id: string): boolean {
    return this.getEntity(id) !== undefined
  }

  /**
   * @description 显示所有已缓存的实体
   */
  public show(): void
  /**
   * @description 根据ID显示实体
   * @param id ID
   */
  public show(id: string): void
  public show(id?: string): void {
    if (id) {
      const cache = this.getEntity(id)
      if (cache) {
        cache.primitive.show = true
      }
    } else {
      this.collection.show = true
    }
  }

  /**
   * @description 隐藏所有已缓存的实体
   */
  public hide(): void
  /**
   * @description 根据ID隐藏实体
   * @param id ID
   */
  public hide(id: string): void
  public hide(id?: string): void {
    if (id) {
      const cache = this.getEntity(id)
      if (cache) {
        cache.primitive.show = false
      }
    } else {
      this.collection.show = false
    }
  }

  /**
   * @description 判断所有实体是否显示
   */
  public shown(): boolean
  /**
   * @description 根据ID判断实体是否显示
   * @param id ID
   * @returns 返回`boolean`值
   */
  public shown(id: string): boolean
  public shown(id?: string): boolean {
    if (id) {
      const cache = this.getEntity(id)
      if (cache) {
        return cache.primitive.show
      } else {
        console.warn(`The primitive '${id}' is inexistent.`)
        return false
      }
    } else {
      return this.collection.show
    }
  }

  /**
   * @description 移除图层中的所有实体
   */
  public remove(): void
  /**
   * @description 根据ID移除实体
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string): void {
    if (id) {
      const member = this.cache.get(id)
      if (member) {
        this.collection.remove(member.primitive)
        this.cache.delete(id)
      }
    } else {
      this.collection.removeAll()
      this.cache.clear()
    }
  }

  /**
   * @description 获取销毁状态
   */
  public isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * @description 销毁图层
   * @returns 返回`boolean`值
   */
  public destroy(): boolean {
    if (this.destroyed) {
      console.warn("Current entity layer has already been destoryed.")
      return true
    }
    if (this.allowDestroy) {
      this.scene.primitives.remove(this.collection)
      this.cache.clear()
      this.collection = undefined as any
      this.cache = undefined as any
      this.destroyed = true
      return true
    } else {
      console.warn("Current entity layer is not allowed to destory.")
      return false
    }
  }
}
