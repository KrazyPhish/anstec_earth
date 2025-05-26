import {
  CallbackProperty,
  Cartesian3,
  Cartesian4,
  Color,
  CustomDataSource,
  Entity,
  EntityCollection,
  Math,
  Matrix3,
  Matrix4,
  PolygonHierarchy,
  PostProcessStage,
  Quaternion,
  Scene,
  Transforms,
} from "cesium"
import { Geographic } from "components/coordinate"
import { Earth } from "components/Earth"
import { scan, diffuse } from "shaders"
import { Utils } from "utils"

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

type GeographicLike = {
  latitude: number
  longitude: number
  height?: number
}

const { abs, cos, round, sin, PI } = window.Math

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
  private destroyed: boolean = false
  private cache: Map<
    string,
    {
      effect?: PostProcessStage
      ellipsoid?: Entity
      fan?: Entity
      cone?: Entity[]
      data?: T
    }
  > = new Map()
  private scene: Scene
  private dataSource = new CustomDataSource("_radar_")
  private collection: EntityCollection = this.dataSource.entities

  constructor(private earth: Earth) {
    earth.viewer.dataSources.add(this.dataSource)
    this.scene = earth.scene
  }

  private calcSector(x1: number, y1: number, x2: number, y2: number, radius: number) {
    const arr = [x1, y1, 0]
    for (let i = 0; i <= 90; i++) {
      const h = radius * sin((i * PI) / 180.0)
      const r = cos((i * PI) / 180.0)
      const x = (x2 - x1) * r + x1
      const y = (y2 - y1) * r + y1
      arr.push(x, y, h)
    }
    return arr
  }

  private calcPane(x: number, y: number, radius: number, heading: number) {
    const m = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(x, y))
    const rx = radius * cos((heading * PI) / 180.0)
    const ry = radius * sin((heading * PI) / 180.0)
    const trans = Cartesian3.fromElements(rx, ry, 0)
    const d = Matrix4.multiplyByPoint(m, trans, new Cartesian3())
    const { longitude, latitude } = Geographic.fromCartesian(d)
    return this.calcSector(x, y, longitude, latitude, radius)
  }

  private splitCircle(center: GeographicLike, radius: number, split: number) {
    const points: GeographicLike[] = []
    const { longitude, latitude } = center
    const radians = (PI / 180) * round(360 / split)
    for (let i = 0; i < split; i++) {
      const x = longitude + radius * sin(radians * i)
      const y = latitude + radius * cos(radians * i)
      points.push({ longitude: x, latitude: y })
    }
    return points
  }

  private createCone(points: GeographicLike[], center: GeographicLike, color: Color) {
    const { longitude, latitude, height } = center
    const covers: Entity[] = []
    for (let i = 0; i < points.length; i++) {
      const next = i === points.length - 1 ? 0 : i + 1
      const hierarchy = new PolygonHierarchy(
        Cartesian3.fromDegreesArrayHeights([
          longitude,
          latitude,
          height!,
          points[i].longitude,
          points[i].latitude,
          0,
          points[next].longitude,
          points[next].latitude,
          0,
        ])
      )
      const entity = this.collection.add({
        polygon: {
          hierarchy,
          outline: false,
          perPositionHeight: true,
          material: color,
        },
      })
      covers.push(entity)
    }
    return covers
  }

  private setCover({
    center,
    path,
    duration,
    cover,
    vertex,
  }: {
    center: GeographicLike
    path: Cartesian3[]
    duration: number
    cover: Entity
    vertex: [GeographicLike, GeographicLike]
  }) {
    //x代表差值，x0代表差值等分后的值，X0表示每次回调改变的值，loop表示回调的循环次数，count表示扫描的坐标个数
    let x: number,
      y: number,
      x0: number,
      y0: number,
      X0: number,
      Y0: number,
      count: number = 0,
      loop: number = 0
    const assignment = (sort: number) => {
      const { longitude: lon, latitude: lat } = Geographic.fromCartesian(path[sort])
      const { longitude: lon1, latitude: lat1 } = Geographic.fromCartesian(path[sort + 1])
      x = lon1 - lon
      y = lat1 - lat
      x0 = x / duration
      y0 = y / duration
      loop = 0
    }
    assignment(count)
    cover.polygon!.hierarchy = new CallbackProperty(() => {
      //当等分差值大于等于差值的时候，重新计算差值和等分差值
      if (abs(X0) >= abs(x) && abs(Y0) >= abs(y)) {
        count++
        if (count === path.length - 1) count = 0
        //TODO 锥形扫描视觉效果闪烁
        vertex[0].longitude += X0 / 2
        vertex[0].latitude += Y0 / 2
        vertex[1].longitude += X0 / 2
        vertex[1].latitude += Y0 / 2
        assignment(count)
      }
      X0 = loop * x0
      Y0 = loop * y0
      loop++
      const { longitude, latitude, height } = center
      return new PolygonHierarchy(
        Cartesian3.fromDegreesArrayHeights([
          longitude,
          latitude,
          height ?? 0,
          vertex[0].longitude + X0,
          vertex[0].latitude + Y0,
          0,
          vertex[1].longitude + X0,
          vertex[1].latitude + Y0,
          0,
        ])
      )
    }, false)
  }

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
  public addScan({
    id = Utils.RandomUUID(),
    center,
    radius,
    duration = 1500,
    color = Color.LAWNGREEN,
    border = 0,
    width = 3,
    data,
  }: Radar.Scan<T>) {
    const { longitude, latitude, height } = Geographic.fromCartesian(center)
    const cartesian3Center = center
    const cartesian4Center = new Cartesian4(cartesian3Center.x, cartesian3Center.y, cartesian3Center.z, 1)
    const cartesian3Center1 = Cartesian3.fromDegrees(longitude, latitude, height ? height + 500 : 500)
    const cartesian4Center1 = new Cartesian4(cartesian3Center1.x, cartesian3Center1.y, cartesian3Center1.z, 1)
    const cartesian3Center2 = Cartesian3.fromDegrees(longitude + 0.001, latitude, height)
    const cartesian4Center2 = new Cartesian4(cartesian3Center2.x, cartesian3Center2.y, cartesian3Center2.z, 1)

    const viewMatrix = this.earth.viewer.camera.viewMatrix
    const _time = new Date().getTime()
    const _RotateQ = new Quaternion()
    const _RotateM = new Matrix3()
    const _scratchCartesian4Center = new Cartesian4()
    const _scratchCartesian4Center1 = new Cartesian4()
    const _scratchCartesian4Center2 = new Cartesian4()
    const _scratchCartesian3Normal = new Cartesian3()
    const _scratchCartesian3Normal1 = new Cartesian3()

    const effect = new PostProcessStage({
      name: id,
      fragmentShader: scan,
      uniforms: {
        u_border: border,
        u_width: width,
        u_radius: radius,
        u_scanColor: color,
        u_scanCenterEC: () => {
          return Matrix4.multiplyByVector(viewMatrix, cartesian4Center, _scratchCartesian4Center)
        },
        u_scanPlaneNormalEC: () => {
          const temp = Matrix4.multiplyByVector(viewMatrix, cartesian4Center, _scratchCartesian4Center)
          const temp1 = Matrix4.multiplyByVector(viewMatrix, cartesian4Center1, _scratchCartesian4Center1)
          _scratchCartesian3Normal.x = temp1.x - temp.x
          _scratchCartesian3Normal.y = temp1.y - temp.y
          _scratchCartesian3Normal.z = temp1.z - temp.z
          Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal)
          return _scratchCartesian3Normal
        },
        u_scanLineNormalEC: () => {
          const temp = Matrix4.multiplyByVector(viewMatrix, cartesian4Center, _scratchCartesian4Center)
          const temp1 = Matrix4.multiplyByVector(viewMatrix, cartesian4Center1, _scratchCartesian4Center1)
          const temp2 = Matrix4.multiplyByVector(viewMatrix, cartesian4Center2, _scratchCartesian4Center2)
          _scratchCartesian3Normal.x = temp1.x - temp.x
          _scratchCartesian3Normal.y = temp1.y - temp.y
          _scratchCartesian3Normal.z = temp1.z - temp.z
          Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal)
          _scratchCartesian3Normal1.x = temp2.x - temp.x
          _scratchCartesian3Normal1.y = temp2.y - temp.y
          _scratchCartesian3Normal1.z = temp2.z - temp.z
          const tempTime = ((new Date().getTime() - _time) % duration) / duration
          Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * PI * 2, _RotateQ)
          Matrix3.fromQuaternion(_RotateQ, _RotateM)
          Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1)
          Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1)
          return _scratchCartesian3Normal1
        },
      },
    })

    this.scene.postProcessStages.add(effect)
    this.cache.set(id, { effect, data })
  }

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
  public addDiffuse({
    id = Utils.RandomUUID(),
    center,
    radius,
    duration = 1500,
    color = Color.LAWNGREEN,
    border = 4,
    data,
  }: Radar.Diffuse<T>) {
    const { longitude, latitude, height } = Geographic.fromCartesian(center)
    const cartesian3Center = center
    const cartesian4Center = new Cartesian4(cartesian3Center.x, cartesian3Center.y, cartesian3Center.z, 1)
    const cartesian3Center1 = Cartesian3.fromDegrees(longitude, latitude, height ? height + 500 : 500)
    const cartesian4Center1 = new Cartesian4(cartesian3Center1.x, cartesian3Center1.y, cartesian3Center1.z, 1)
    const viewMatrix = this.earth.viewer.camera.viewMatrix
    const _time = new Date().getTime()
    const effect = new PostProcessStage({
      name: id,
      fragmentShader: diffuse,
      uniforms: {
        u_border: border,
        u_scanColor: color,
        u_radius: () => {
          return (((new Date().getTime() - _time) % duration) * radius) / duration
        },
        u_scanCenterEC: () => {
          return Matrix4.multiplyByVector(viewMatrix, cartesian4Center, new Cartesian4())
        },
        u_scanPlaneNormalEC: () => {
          const temp = Matrix4.multiplyByVector(viewMatrix, cartesian4Center, new Cartesian4())
          const temp1 = Matrix4.multiplyByVector(viewMatrix, cartesian4Center1, new Cartesian4())
          const _scratchCartesian3Normal = new Cartesian3()
          _scratchCartesian3Normal.x = temp1.x - temp.x
          _scratchCartesian3Normal.y = temp1.y - temp.y
          _scratchCartesian3Normal.z = temp1.z - temp.z
          Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal)
          return _scratchCartesian3Normal
        },
      },
    })

    this.scene.postProcessStages.add(effect)
    this.cache.set(id, { effect, data })
  }

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
  public addFanshaped({
    id = Utils.RandomUUID(),
    center,
    radius,
    duration = 1500,
    color = Color.LAWNGREEN.withAlpha(0.3),
    shadeColor = Color.LAWNGREEN.withAlpha(0.1),
    data,
  }: Radar.Fanshaped<T>) {
    const ellipsoid = this.collection.add({
      position: center,
      ellipsoid: {
        radii: new Cartesian3(radius, radius, radius),
        material: shadeColor,
        outline: true,
        outlineColor: new Color(1, 1, 0, 1),
        outlineWidth: 1,
      },
    })

    const { longitude, latitude } = Geographic.fromCartesian(center)
    let pointsArr: number[] = [longitude, latitude, 0],
      heading = 0

    this.earth.clock.onTick.addEventListener(() => {
      heading += (2 * Math.PI * radius) / ((duration / 1000.0) * 60) / 90.0
      pointsArr = this.calcPane(longitude, latitude, radius, heading)
    })

    const fan = this.collection.add({
      wall: {
        positions: new CallbackProperty(() => {
          return Cartesian3.fromDegreesArrayHeights(pointsArr)
        }, false),
        material: color,
      },
    })

    this.cache.set(id, { ellipsoid, fan, data })
  }

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
  public addConic({
    id = Utils.RandomUUID(),
    radius,
    center,
    path,
    color = Color.LAWNGREEN.withAlpha(0.3),
    duration = 100,
    split = 30,
    data,
  }: Radar.Cone<T>) {
    const { longitude, latitude, height = 500 } = Geographic.fromCartesian(center)
    const geoCenter = { longitude, latitude, height }
    const points = this.splitCircle(geoCenter, radius, split)
    const covers = this.createCone(points, geoCenter, color)
    for (let i = 0; i < covers.length; i++) {
      const next = i === covers.length - 1 ? 0 : i + 1
      this.setCover({
        path,
        duration,
        cover: covers[i],
        center: geoCenter,
        vertex: [points[i], points[next]],
      })
    }
    this.cache.set(id, { cone: covers, data })
  }

  /**
   * @description 根据ID获取雷达数据
   * @param id ID
   * @returns 数据
   */
  public getData(id: string): T | undefined {
    return this.cache.get(id)?.data
  }

  /**
   * @description 移除所有雷达
   */
  public remove(): void
  /**
   * @description 根据ID移除雷达
   * @param id ID
   */
  public remove(id: string): void
  public remove(id?: string) {
    if (id) {
      const cache = this.cache.get(id)
      if (cache) {
        if (cache.effect) this.scene.postProcessStages.remove(cache.effect)
        if (cache.ellipsoid) this.collection.remove(cache.ellipsoid)
        if (cache.fan) this.collection.remove(cache.fan)
        if (cache.cone) {
          cache.cone.forEach((cone) => this.collection.remove(cone))
        }
        this.cache.delete(id)
      }
    } else {
      this.scene.postProcessStages.removeAll()
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
   * @description 销毁
   */
  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.collection.removeAll()
    this.earth.viewer.dataSources.remove(this.dataSource)
    this.cache.clear()
    this.collection = undefined as any
    this.dataSource = undefined as any
    this.scene = undefined as any
    this.cache = undefined as any
  }
}
