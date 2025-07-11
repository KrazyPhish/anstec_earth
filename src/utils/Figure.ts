import {
  Cartographic,
  Rectangle,
  Math,
  TerrainProvider,
  Cartesian3,
  Scene,
  sampleTerrainMostDetailed,
  PolylinePipeline,
} from "cesium"
import * as turf from "@turf/turf"
import { Geographic } from "components/coordinate"
import { EarthRadius } from "enum"
import { moreThan, is, lessThan, validate, freeze, positive } from "decorators"

const { abs, asin, pow, sqrt, sin, cos, PI } = window.Math

/**
 * @description 算法
 * 1. 电子围栏
 * 2. 航线交汇
 * 3. 区域告警
 * 4. 路线规划
 * 5. 动态绘制
 * 6. 地形测量
 */
@freeze
export class Figure {
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
  @validate
  static CrossProduct(
    @moreThan(2, true, "length") @is(Array) a: number[],
    @moreThan(2, true, "length") @is(Array) b: number[],
    @moreThan(2, true, "length") @is(Array) c: number[]
  ) {
    const [x1, y1] = a
    const [x2, y2] = b
    const [x3, y3] = c
    return x1 * y3 + x2 * y1 + x3 * y2 - x1 * y2 - x2 * y3 - x3 * y1
  }

  /**
   * @description 计算球体上两点的测地线距离
   * @param from 坐标点
   * @param to 坐标点
   * @param [units = "meters"] 单位
   * @returns 距离
   */
  @validate
  static CalcDistance<T extends Geographic>(
    @is(Geographic) from: T,
    @is(Geographic) to: T,
    units: turf.Units = "meters"
  ): number {
    const p1 = turf.point(from.toArray())
    const p2 = turf.point(to.toArray())
    const distance = turf.distance(p1, p2, { units })
    return distance
  }

  /**
   * @description 计算球体上两点的恒向线距离
   * @param from 坐标点
   * @param to 坐标点
   * @param [units = "meters"] 单位
   * @returns 距离
   */
  @validate
  static CalcRhumbDistance<T extends Geographic>(
    @is(Geographic) from: T,
    @is(Geographic) to: T,
    units: turf.Units = "meters"
  ): number {
    const p1 = turf.point(from.toArray())
    const p2 = turf.point(to.toArray())
    const distance = turf.rhumbDistance(p1, p2, { units })
    return distance
  }

  /**
   * @description 计算球体上两点的贴地距离
   * @param from 坐标点
   * @param to 坐标点
   * @param scene 场景
   * @param terrainProvider 地形图层
   * @returns 距离 `m`
   */
  @validate
  static async CalcGroundDistance<T extends Geographic>(
    @is(Geographic) from: T,
    @is(Geographic) to: T,
    @is(Scene) scene: Scene,
    @is(TerrainProvider) terrainProvider: TerrainProvider
  ) {
    let _from: Cartesian3
    let _to: Cartesian3
    let granularity = 0.00001
    const ellipsoid = scene.globe.ellipsoid
    _from = from.toCartesian()
    _to = to.toCartesian()
    const _distance = Cartesian3.distance(_from, _to)
    if (!terrainProvider.availability) {
      console.warn("Lack of terrain data, or load terrain failed. Ground measuring makes no significance.")
      return _distance
    }
    if (_distance > 10000) {
      granularity = granularity * 10
    } else if (_distance > 50000) {
      granularity = granularity * 100
    } else if (_distance > 100000) {
      granularity = granularity * 5000
    } else {
      granularity = granularity * 10000
    }
    const surfacePositions = PolylinePipeline.generateArc({
      positions: [_from, _to],
      granularity: 0.00001,
    })
    if (!surfacePositions) {
      console.warn("Lack of terrain data, or load terrain failed. Ground measuring makes no significance.")
      return _distance
    }
    const cartographicArray = []
    const tempHeight = Cartographic.fromCartesian(_from).height
    for (let i = 0; i < surfacePositions.length; i += 3) {
      const cartesian = Cartesian3.unpack(surfacePositions, i)
      cartographicArray.push(ellipsoid.cartesianToCartographic(cartesian))
    }
    const updateLnglats: Cartographic[] = await sampleTerrainMostDetailed(terrainProvider, cartographicArray)
    let allLength = 0
    let offset = 10.0
    for (let i = 0; i < updateLnglats.length; i++) {
      const item = updateLnglats[i]
      if (!item.height) {
        item.height = tempHeight
      } else {
        item.height += offset
      }
    }
    const raisedPositions = ellipsoid.cartographicArrayToCartesianArray(updateLnglats)
    for (let z = 0; z < raisedPositions.length - 1; z++) {
      allLength += Cartesian3.distance(raisedPositions[z], raisedPositions[z + 1])
    }
    return allLength
  }

  /**
   * @description 根据经纬度，距离，角度计算另外一个点
   * @param longitude 经度 <角度制>
   * @param latitude 纬度 <角度制>
   * @param distance 距离 `m`
   * @param angle 角度 <角度制>
   * @return 另外的点
   */
  @validate
  static CalcPointByPointDistanceAngle(
    @moreThan(-180) @lessThan(180) @is(Number) longitude: number,
    @moreThan(-90) @lessThan(90) @is(Number) latitude: number,
    @is(Number) distance: number,
    @is(Number) angle: number
  ) {
    const ea = EarthRadius.EQUATOR
    const eb = EarthRadius.POLE
    const dx = distance * sin((angle * PI) / 180)
    const dy = distance * cos((angle * PI) / 180)
    const ec = eb + ((ea - eb) * (90 - latitude)) / 90
    const ed = ec * cos((latitude * PI) / 180)
    const lon = ((dx / ed + (longitude * PI) / 180) * 180) / PI
    const lat = ((dy / ec + (latitude * PI) / 180) * 180) / PI
    return [lon, lat]
  }

  /**
   * @description 计算点是否在矩形中
   * @param point 坐标点
   * @param rectangle 矩形
   * @returns `boolean`值
   */
  @validate
  static PointInRectangle(@is(Geographic) point: Geographic, @is(Rectangle) rectangle: Rectangle) {
    return Rectangle.contains(rectangle, point.toCartographic())
  }

  /**
   * @description 计算点是否在圆内
   * @param point 坐标点
   * @param center 圆心
   * @param radius 半径
   * @param [units = "meters"] 单位
   * @returns `boolean`值
   */
  @validate
  static PointInCircle<T extends Geographic>(
    @is(Geographic) point: T,
    @is(Geographic) center: T,
    @positive() @is(Number) radius: number,
    units: turf.Units = "meters"
  ) {
    const dis = this.CalcDistance(point, center, units)
    return radius > dis
  }

  /**
   * @description 计算点是否在多边形内
   * @param point 坐标点
   * @param polygon 多边形点坐标
   * @returns `boolean`值
   */
  @validate
  static PointInPolygon<T extends Geographic>(
    @is(Geographic) point: T,
    @moreThan(4, true, "length") @is(Array) polygon: T[]
  ) {
    const p = turf.point([point.longitude, point.latitude])
    const pl = polygon.reduce((prev, curr) => {
      prev.push(curr.toArray())
      return prev
    }, [] as number[][])
    const pg = turf.polygon([pl])
    return turf.booleanPointInPolygon(p, pg)
  }

  /**
   * @description 计算两条线段是否相交
   * @param line1 线段1
   * @param line2 线段2
   * @returns `boolean`值
   */
  @validate
  static PolylineIntersectPolyline(
    @moreThan(2, true, "length") @is(Array) line1: Geographic[],
    @moreThan(2, true, "length") @is(Array) line2: Geographic[]
  ) {
    const point1 = line1[0].toArray()
    const point2 = line1[1].toArray()
    const point3 = line2[0].toArray()
    const point4 = line2[1].toArray()
    if (this.CrossProduct(point1, point2, point3) * this.CrossProduct(point1, point2, point4) > 0) {
      return false
    } else if (this.CrossProduct(point3, point4, point1) * this.CrossProduct(point3, point4, point2) > 0) {
      return false
    } else {
      return true
    }
  }

  /**
   * @description 计算折线段是否与矩形相交
   * @param polyline 折线段
   * @param rectangle 矩形
   * @returns `boolean`值
   */
  @validate
  static PolylineIntersectRectangle(
    @moreThan(2, true, "length") @is(Array) polyline: Geographic[],
    @is(Rectangle) rectangle: Rectangle
  ) {
    let crossed: boolean = false
    const { east, north, south, west } = rectangle
    const points = [
      new Geographic(west, north),
      new Geographic(east, north),
      new Geographic(east, south),
      new Geographic(west, south),
    ]
    const edges: Geographic[][] = [
      [points[0], points[1]],
      [points[1], points[2]],
      [points[2], points[3]],
      [points[3], points[4]],
    ]

    for (let i = 0; i < polyline.length - 1; i++) {
      if (crossed) break
      crossed = edges.some((edge) => this.PolylineIntersectPolyline([polyline[i], polyline[i + 1]], edge))
    }
    return crossed
  }

  /**
   * @description 计算测地线角度，以正北方向为基准
   * @param from 基准原点
   * @param to 参考点
   * @returns 角度 <角度制>
   */
  @validate
  static CalcBearing<T extends Geographic>(@is(Geographic) from: T, @is(Geographic) to: T): number {
    const point1 = turf.point(from.toArray())
    const point2 = turf.point(to.toArray())
    const bearing = turf.bearing(point1, point2)
    return bearing
  }

  /**
   * @description 计算恒向线角度，以正北方向为基准
   * @param from 基准原点
   * @param to 参考点
   * @returns 角度 <角度制>
   */
  @validate
  static CalcRhumbBearing<T extends Geographic>(@is(Geographic) from: T, @is(Geographic) to: T): number {
    const point1 = turf.point(from.toArray())
    const point2 = turf.point(to.toArray())
    const bearing = turf.rhumbBearing(point1, point2)
    return bearing
  }

  /**
   * @description 计算三点夹角
   * @param a 夹角点
   * @param b 边缘点
   * @param c 边缘点
   * @returns 角度 <角度制>
   */
  @validate
  static CalcAngle<T extends Geographic>(@is(Geographic) a: T, @is(Geographic) b: T, @is(Geographic) c: T) {
    const bearingAB = this.CalcBearing(a, b)
    const bearingAC = this.CalcBearing(a, c)
    const angle = bearingAB - bearingAC
    return angle < 0 ? angle + 180 * 2 : angle
  }

  /**
   * @description 计算两点中心点
   * @param point1
   * @param point2
   * @returns 中心点
   */
  @validate
  static CalcMidPoint<T extends Geographic>(@is(Geographic) point1: T, @is(Geographic) point2: T): Geographic {
    const p1 = turf.point(point1.toArray())
    const p2 = turf.point(point2.toArray())
    const [longitude, latitude] = turf.midpoint(p1, p2).geometry.coordinates
    const height = (point1.height + point2.height) / 2.0
    return new Geographic(longitude, latitude, height)
  }

  /**
   * @description 计算多边形 / 多点的平面质心
   * @param points 多边形或平面的顶点
   * @param [withHeight = false] 是否计算时考虑高度
   * @returns 质心
   */
  @validate
  static CalcMassCenter(
    @moreThan(4, true, "length") @is(Array) points: Geographic[],
    @is(Boolean) withHeight = false
  ): Geographic {
    const feature = turf.polygon([points.map((p) => p.toArray())])
    const [longitude, latitude] = turf.centroid(feature).geometry.coordinates
    const height = withHeight
      ? parseFloat(
          (
            points.reduce((prev, curr) => {
              prev += curr.height
              return prev
            }, 0) / points.length
          ).toFixed(2)
        )
      : 0
    return new Geographic(longitude, latitude, height)
  }

  /**
   * @description 计算一个一定位于多边形上的点
   * @param polygon 多边形
   * @returns 任意多边形上的点
   */
  @validate
  static CalcPointOnPolygon(@moreThan(4, true, "length") @is(Array) polygon: Geographic[]): Geographic {
    const pl = polygon.reduce((prev, curr) => {
      prev.push(curr.toArray())
      return prev
    }, [] as number[][])
    const pg = turf.polygon([pl])
    const [longitude, latitude] = turf.pointOnFeature(pg).geometry.coordinates
    return new Geographic(longitude, latitude)
  }

  /**
   * @descript 计算多边形面积
   * @param polygon 多边形
   * @returns 面积 `㎡`
   */
  @validate
  static CalcPolygonArea(@moreThan(4, true, "length") @is(Array) polygon: Geographic[]): number {
    const pl = polygon.reduce((prev, curr) => {
      prev.push(curr.toArray())
      return prev
    }, [] as number[][])
    const pg = turf.polygon([pl])
    return turf.area(pg)
  }

  /**
   * @description 根据经纬度、椭圆半径及其旋转，生成对地投影椭圆 / 包络
   * @param x 经度 <角度制>
   * @param y 纬度 <角度制>
   * @param radius1 x 轴半径 米
   * @param radius2 y 轴半径 米
   * @param rotate 旋转 <弧度制>
   * @returns 包络点集合
   */
  @validate
  static CalcEnvelope(
    @moreThan(-180) @lessThan(180) @is(Number) x: number,
    @moreThan(-90) @lessThan(90) @is(Number) y: number,
    @positive() @is(Number) radius1: number,
    @positive() @is(Number) radius2: number,
    @is(Number) rotate: number
  ) {
    const positions = []
    const dx = PI * 2 * EarthRadius.AVERAGE
    const r1 = (radius1 * 360) / dx
    const r2 = (radius2 * 360) / dx
    for (let i = 0; i < 360; i++) {
      const radians = Math.toRadians(i)
      const x1 = x + r1 * cos(radians)
      const y1 = y + r2 * sin(radians)
      const x2 = (x1 - x) * cos(-rotate) - (y1 - y) * sin(-rotate) + x
      const y2 = (x1 - x) * sin(-rotate) + (y1 - y) * cos(-rotate) + y
      positions.push([x2, y2])
    }
    positions.push([...positions[0]])
    return positions
  }

  /**
   * @description 根据高度和测地线长度计算圆锥的真实高度和半径
   * @param height 对地高度
   * @param arc 测地线弧长
   * @returns 真实高度和半径
   */
  @validate
  static CalcConic(@is(Number) height: number, @is(Number) arc: number) {
    const r = EarthRadius.AVERAGE * sin(arc / EarthRadius.AVERAGE)
    const h = height + EarthRadius.AVERAGE * (1 - cos(arc / EarthRadius.AVERAGE))
    return { radius: r, heihgt: h }
  }

  /**
   * @description 计算数学累进距离
   * @param positions 坐标
   * @returns 距离
   */
  @validate
  static CalcMathDistance(@moreThan(2, true, "length") @is(Array) positions: number[][]) {
    const distance = positions.reduce((prev, curr, index, arr) => {
      if (index === 0) return prev
      prev += sqrt(pow(curr[0] - arr[index - 1][0], 2) + pow(curr[1] - arr[index - 1][1], 2))
      return prev
    }, 0)
    return distance
  }

  /**
   * @description 根基两点构成的直线及夹角、半径计算第三点
   * @param target 基准点
   * @param origin 起始点
   * @param angle 角度
   * @param radius 半径
   * @param [revert = false] 是否逆时针
   * @returns 第三点
   */
  @validate
  static CalcThirdPoint(
    @moreThan(2, true, "length") @is(Array) target: number[],
    @moreThan(2, true, "length") @is(Array) origin: number[],
    @is(Number) angle: number,
    @is(Number) radius: number,
    @is(Boolean) revert: boolean = false
  ): number[] {
    const g = this.CalcAzimuth(target, origin)
    const i = revert ? g + angle : g - angle
    const s = radius * cos(i)
    const a = radius * sin(i)
    return [origin[0] + s, origin[1] + a]
  }

  /**
   * @description 计算两点构成的数学角度、以正北方向为基准
   * @param target 点1
   * @param origin 点2
   * @returns 角度 <弧度制>
   */
  @validate
  static CalcAzimuth(
    @moreThan(2, true, "length") @is(Array) target: number[],
    @moreThan(2, true, "length") @is(Array) origin: number[]
  ): number {
    const l = this.CalcMathDistance([target, origin])
    const d = l === 0 ? 0 : asin(abs(origin[1] - target[1]) / l)
    const res =
      origin[1] >= target[1] && origin[0] >= target[0]
        ? d + PI
        : origin[1] >= target[1] && origin[0] < target[0]
          ? 2 * PI - d
          : origin[1] < target[1] && origin[0] < target[0]
            ? d
            : origin[1] < target[1] && origin[0] >= target[0]
              ? PI - d
              : 0
    return res
  }

  /**
   * @description 计算三点的数学夹角
   * @param a 边缘点
   * @param b 夹角点
   * @param c 边缘点
   * @returns 角度 <弧度制>
   */
  @validate
  static CalcMathAngle(
    @moreThan(2, true, "length") @is(Array) a: number[],
    @moreThan(2, true, "length") @is(Array) b: number[],
    @moreThan(2, true, "length") @is(Array) c: number[]
  ) {
    const angle = this.CalcAzimuth(b, a) - this.CalcAzimuth(b, c)
    return angle < 0 ? angle + PI * 2 : angle
  }
}
