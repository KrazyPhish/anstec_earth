import { Cartesian2, Cartesian3, Color, Math, Matrix4, PostProcessStage, Scene, SphereEmitter } from "cesium"
import { dark } from "shaders"
import { ParticleLayer } from "components/layers"
import { Utils } from "utils"
import { rain, snow } from "images"
import type { Earth } from "components/Earth"

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
  public scene: Scene
  private destroyed: boolean = false
  private darkEffect?: PostProcessStage
  private particleLayer: ParticleLayer<T>

  constructor(earth: Earth) {
    earth.clock.shouldAnimate = true
    this.scene = earth.scene
    this.particleLayer = new ParticleLayer<T>(earth)
  }

  /**
   * @description 大气/照明恢复的距离，仅当启用自然光照或大气层效果时生效
   */
  get fadeInDistance() {
    return this.scene.globe.lightingFadeInDistance
  }
  set fadeInDistance(value: number) {
    this.scene.globe.lightingFadeInDistance = value
  }

  /**
   * @description 一切都被点亮的距离，仅当启用自然光照或大气层效果时生效
   */
  get fadeOutDistance() {
    return this.scene.globe.lightingFadeOutDistance
  }
  set fadeOutDistance(value: number) {
    this.scene.globe.lightingFadeOutDistance = value
  }

  /**
   * @description 启用太阳光源的自然光照
   * @param value 是否启用
   */
  public useNaturalLight(value: boolean) {
    this.scene.globe.enableLighting = value
  }

  /**
   * @description 启用大气层效果
   * @param value 是否启用
   */
  public enableAtmosphere(value: boolean) {
    this.scene.globe.showGroundAtmosphere = value
  }

  /**
   * @description 新增雨天特效
   * @param param {@link Weather.AddParam} 参数
   */
  private addRain({
    id = Utils.RandomUUID(),
    position,
    effectRadius = 100000,
    particleSize = 6,
    data,
  }: Weather.AddParam<T>) {
    const imageSize = new Cartesian2(particleSize * 0.5, particleSize * 4)
    const gravityScratch = new Cartesian3()
    this.particleLayer.add({
      id,
      position,
      data,
      modelMatrix: Matrix4.fromTranslation(position),
      imageSize,
      minimumSpeed: -2,
      maximumSpeed: 0,
      startScale: 0.5,
      endScale: 1,
      startColor: Color.AZURE.withAlpha(0),
      endColor: Color.AZURE.withAlpha(0.95),
      image: rain,
      lifetime: Number.MAX_VALUE,
      emissionRate: 5000,
      emitter: new SphereEmitter(effectRadius),
      updateCallback: (particle) => {
        Cartesian3.normalize(particle.position, gravityScratch)
        Cartesian3.multiplyByScalar(gravityScratch, -1200, gravityScratch)
        Cartesian3.add(particle.position, gravityScratch, particle.position)
        const distance = Cartesian3.distance(this.scene.camera.position, particle.position)
        if (distance > effectRadius) {
          particle.endColor.alpha = 0
        } else {
          particle.endColor.alpha = 1 / (distance / effectRadius + 0.1)
        }
      },
    })
  }

  /**
   * @description 新增雪天特效
   * @param param {@link Weather.AddParam} 参数
   */
  private addSnow({
    id = Utils.RandomUUID(),
    position,
    effectRadius = 100000,
    particleSize = 10,
    data,
  }: Weather.AddParam<T>) {
    const minimumImageSize = new Cartesian2(particleSize, particleSize)
    const maximumImageSize = new Cartesian2(particleSize * 2, particleSize * 2)
    this.particleLayer.add({
      id,
      position,
      data,
      modelMatrix: Matrix4.fromTranslation(position),
      minimumImageSize,
      maximumImageSize,
      minimumSpeed: -1,
      maximumSpeed: 0,
      startScale: 0.5,
      endScale: 1,
      startColor: Color.WHITE.withAlpha(0),
      endColor: Color.WHITE.withAlpha(1),
      image: snow,
      lifetime: Number.MAX_VALUE,
      emissionRate: 2000,
      emitter: new SphereEmitter(effectRadius),
      updateCallback: (particle) => {
        const gravityScratch = new Cartesian3()
        Cartesian3.normalize(particle.position, gravityScratch)
        Cartesian3.multiplyByScalar(gravityScratch, Math.randomBetween(-20, 0), gravityScratch)
        Cartesian3.add(particle.velocity, gravityScratch, particle.velocity)
        const distance = Cartesian3.distance(this.scene.camera.position, particle.position)
        if (distance > effectRadius) {
          particle.endColor.alpha = 0
        } else {
          particle.endColor.alpha = 1 / (distance / effectRadius + 0.1)
        }
      },
    })
  }

  /**
   * @description 新增雾天特效
   * @param param {@link Weather.AddParam} 参数
   */
  private addFog({
    id = Utils.RandomUUID(),
    position,
    effectRadius = 100000,
    particleSize = 80,
    data,
  }: Weather.AddParam<T>) {
    const minimumImageSize = new Cartesian2(particleSize, particleSize)
    const maximumImageSize = new Cartesian2(particleSize * 2, particleSize * 2)
    this.particleLayer.add({
      id,
      position,
      data,
      modelMatrix: Matrix4.fromTranslation(position),
      minimumImageSize,
      maximumImageSize,
      minimumSpeed: -1,
      maximumSpeed: 0,
      startScale: 0.5,
      endScale: 1,
      startColor: Color.LIGHTGRAY.withAlpha(0),
      endColor: Color.LIGHTGRAY.withAlpha(0.000001),
      particleLife: 2,
      image: rain,
      lifetime: Number.MAX_VALUE,
      emissionRate: 5000,
      emitter: new SphereEmitter(effectRadius),
      updateCallback: (particle) => {
        const gravityScratch = new Cartesian3()
        Cartesian3.normalize(particle.position, gravityScratch)
        Cartesian3.multiplyByScalar(gravityScratch, Math.randomBetween(-5, 5), gravityScratch)
        Cartesian3.add(particle.velocity, gravityScratch, particle.velocity)
        const distance = Cartesian3.distance(this.scene.camera.position, particle.position)
        if (distance > effectRadius) {
          particle.endColor.alpha = 0
        } else {
          particle.endColor.alpha = 1 / (distance / effectRadius + 0.1)
        }
      },
    })
  }

  /**
   * @description 新增天气特效
   * @param param {@link Weather.AddParam} 天气参数
   */
  public add(param: Weather.AddParam<T>) {
    switch (param.type) {
      case "fog": {
        this.addFog(param)
        break
      }
      case "rain": {
        this.addRain(param)
        break
      }
      case "snow": {
        this.addSnow(param)
        break
      }
    }
  }

  /**
   * @description 开启黑夜视图效果
   * @returns 关闭黑夜视图的函数
   */
  public useDark() {
    if (this.darkEffect) return
    this.darkEffect = new PostProcessStage({
      name: "dark",
      fragmentShader: dark,
      uniforms: {
        scale: 1.0,
        offset: () => {
          return new Cartesian3(0.1, 0.2, 0.3)
        },
      },
    })
    this.scene.postProcessStages.add(this.darkEffect)
    return this.useLight
  }

  /**
   * @description 关闭黑夜视图/开启正常白天视图
   */
  public useLight() {
    if (this.darkEffect) {
      this.scene.postProcessStages.remove(this.darkEffect)
      this.darkEffect = undefined
    } else return
  }

  /**
   * @description 根据ID获取天气特效的附加数据
   * @param id ID
   * @returns
   */
  public getData(id: string) {
    return this.particleLayer.getData(id)
  }

  /**
   * @description 清除所有天气特效
   */
  public remove(): void
  /**
   * @description 按ID清除天气特效
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      this.particleLayer.remove(id)
    } else {
      this.particleLayer.remove()
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
    this.useLight()
    this.remove()
    this.particleLayer.destroy()
    this.scene = undefined as any
  }
}
