import {
  Cartesian3,
  DeveloperError,
  JulianDate,
  SampledPositionProperty,
  VelocityOrientationProperty,
  type BillboardGraphics,
  type Entity,
  type ModelGraphics,
  type PathGraphics,
  type TimeIntervalCollection,
  type Viewer,
} from "cesium"
import { Utils } from "utils"
import type { Earth } from "components/Earth"

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
  private static recordCache: Map<string, boolean> = new Map()
  private id: string
  private cache: Map<string, Entity> = new Map()
  private viewer: Viewer
  private destroyed: boolean = false

  constructor(earth: Earth) {
    if (AnimationManager.recordCache.has(earth.id)) {
      throw new DeveloperError("The instance of 'AnimationManager' can only be constructed once for each earth.")
    }
    this.id = earth.id
    this.viewer = earth.viewer
    AnimationManager.recordCache.set(this.id, true)
  }

  /**
   * @description 新增动画对象
   * @param param {@link AnimationManager.AddParam} 参数
   */
  public add({
    id = Utils.RandomUUID(),
    module,
    availability,
    billboard,
    model,
    path,
    positions,
  }: AnimationManager.AddParam) {
    const _id = Utils.EncodeId(id, module)
    const property = new SampledPositionProperty()
    positions.forEach((position) => {
      const { longitude, latitude, height, time } = position
      property.addSample(JulianDate.fromDate(new Date(time)), Cartesian3.fromDegrees(longitude, latitude, height))
    })
    const ent = this.viewer.entities.add({
      id: _id,
      availability,
      billboard,
      model,
      path,
      position: property,
      orientation: new VelocityOrientationProperty(property),
    })
    this.cache.set(id, ent)
  }

  /**
   * @description 显示所有动画
   */
  public show(): void
  /**
   * @description 按ID控制动画显示
   * @param id ID
   */
  public show(id: string): void
  public show(id?: string) {
    if (id) {
      const ent = this.cache.get(id)
      if (ent) {
        ent.show = true
      }
    } else {
      this.cache.forEach((ent) => {
        ent.show = true
      })
    }
  }

  /**
   * @description 隐藏所有动画
   */
  public hide(): void
  /**
   * @description 按ID控制动画隐藏
   * @param id ID
   */
  public hide(id: string): void
  public hide(id?: string) {
    if (id) {
      const ent = this.cache.get(id)
      if (ent) {
        ent.show = false
      }
    } else {
      this.cache.forEach((ent) => {
        ent.show = false
      })
    }
  }

  /**
   * @description 根据ID移除动画对象
   * @param id ID
   */
  public remove(id: string): void
  /**
   * @description 移除所有动画对象
   * @param id ID
   */
  public remove(): void
  public remove(id?: string) {
    if (id) {
      const entity = this.cache.get(id)
      if (entity) {
        this.viewer.entities.remove(entity)
      }
    } else {
      this.viewer.entities.removeAll()
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
    this.cache.forEach((entity) => {
      this.viewer.entities.remove(entity)
    })
    this.cache.clear()
    this.cache = undefined as any
    this.viewer = undefined as any
    AnimationManager.recordCache.delete(this.id)
    this.id = undefined as any
  }
}
