import {
  Cartographic,
  Rectangle,
  Math,
  TerrainProvider,
  Cartesian3,
  Scene,
  sampleTerrainMostDetailed,
  PolylinePipeline,
  DeveloperError,
} from "cesium"
import * as turf from "@turf/turf"
import { Geographic } from "components/coordinate"
import { EarthRadius } from "enum"

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
export namespace Figure {
  type Coordinate = Cartographic | Geographic

  type GeoTurple = [number, number]

  const getDivisor = (target: Coordinate) => {
    let divisor: number
    if (target instanceof Cartographic) {
      divisor = (1 / PI) * 180.0
    } else {
      divisor = 1
    }
    return divisor
  }
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
  export const CrossProduct = (a: GeoTurple, b: GeoTurple, c: GeoTurple) => {
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
  export const CalcDistance = <T extends Coordinate>(from: T, to: T, units: turf.Units = "meters"): number => {
    const divisor = getDivisor(from)
    const p1 = turf.point([from.longitude * divisor, from.latitude * divisor])
    const p2 = turf.point([to.longitude * divisor, to.latitude * divisor])
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
  export const CalcRhumbDistance = <T extends Coordinate>(from: T, to: T, units: turf.Units = "meters"): number => {
    const divisor = getDivisor(from)
    const p1 = turf.point([from.longitude * divisor, from.latitude * divisor])
    const p2 = turf.point([to.longitude * divisor, to.latitude * divisor])
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
  export const CalcGroundDistance = async <T extends Coordinate>(
    from: T,
    to: T,
    scene: Scene,
    terrainProvider: TerrainProvider
  ) => {
    let _from: Cartesian3
    let _to: Cartesian3
    let granularity = 0.00001
    const ellipsoid = scene.globe.ellipsoid
    if (from instanceof Cartographic) {
      _from = Cartographic.toCartesian(from, ellipsoid)
      _to = Cartographic.toCartesian(to as Cartographic, ellipsoid)
    } else {
      _from = from.toCartesian()
      _to = (to as Geographic).toCartesian()
    }

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
  export const CalcPointByPointDistanceAngle = (
    longitude: number,
    latitude: number,
    distance: number,
    angle: number
  ) => {
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
  export const PointInRectangle = (point: Cartographic, rectangle: Rectangle) => {
    return Rectangle.contains(rectangle, point)
  }

  /**
   * @description 计算点是否在圆内
   * @param point 坐标点
   * @param center 圆心
   * @param radius 半径
   * @param [units = "meters"] 单位
   * @returns `boolean`值
   */
  export const PointInCircle = <T extends Coordinate>(
    point: T,
    center: T,
    radius: number,
    units: turf.Units = "meters"
  ) => {
    const dis = CalcDistance(point, center, units)
    return radius > dis
  }

  /**
   * @description 计算点是否在多边形内
   * @param point 坐标点
   * @param polygon 多边形点坐标
   * @returns `boolean`值
   */
  export const PointInPolygon = <T extends Coordinate>(point: T, polygon: T[]) => {
    if (polygon.length < 4) {
      return false
    }
    const divisor = getDivisor(point)
    const p = turf.point([point.longitude * divisor, point.latitude * divisor])
    const pl = polygon.reduce((prev, curr) => {
      prev.push([curr.longitude * divisor, curr.latitude * divisor])
      return prev
    }, [] as GeoTurple[])
    const pg = turf.polygon([pl])
    return turf.booleanPointInPolygon(p, pg)
  }

  /**
   * @description 计算两条线段是否相交
   * @param line1 线段1
   * @param line2 线段2
   * @returns `boolean`值
   */
  export const PolylineIntersectPolyline = <T extends Coordinate>(line1: [T, T], line2: [T, T]) => {
    const x1 = line1[0].longitude
    const y1 = line1[0].latitude
    const x2 = line1[1].longitude
    const y2 = line1[1].latitude
    const x3 = line2[0].longitude
    const y3 = line2[0].latitude
    const x4 = line2[1].longitude
    const y4 = line2[1].latitude
    if (CrossProduct([x1, y1], [x2, y2], [x3, y3]) * CrossProduct([x1, y1], [x2, y2], [x4, y4]) > 0) {
      return false
    } else if (CrossProduct([x3, y3], [x4, y4], [x1, y1]) * CrossProduct([x3, y3], [x4, y4], [x2, y2]) > 0) {
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
  export const PolylineIntersectRectangle = (polyline: Cartographic[], rectangle: Rectangle) => {
    let crossed: boolean = false
    const { east, north, south, west } = rectangle
    const points = [
      new Cartographic(west, north),
      new Cartographic(east, north),
      new Cartographic(east, south),
      new Cartographic(west, south),
    ]
    const edges: [Cartographic, Cartographic][] = [
      [points[0], points[1]],
      [points[1], points[2]],
      [points[2], points[3]],
      [points[3], points[4]],
    ]

    for (let i = 0; i < polyline.length - 1; i++) {
      if (crossed) break
      crossed = edges.some((edge) => PolylineIntersectPolyline([polyline[i], polyline[i + 1]], edge))
    }
    return crossed
  }

  /**
   * @description 计算测地线角度，以正北方向为基准
   * @param from 基准原点
   * @param to 参考点
   * @returns `[-180，180]`或`[-PI，PI]` 由输入值决定 <角度制> 或 <弧度制>
   */
  export const CalcBearing = <T extends Coordinate>(from: T, to: T): number => {
    const divisor = getDivisor(from)
    const point1 = turf.point([from.longitude * divisor, from.latitude * divisor])
    const point2 = turf.point([to.longitude * divisor, to.latitude * divisor])
    const bearing = turf.bearing(point1, point2) / divisor
    return bearing
  }

  /**
   * @description 计算恒向线角度，以正北方向为基准
   * @param from 基准原点
   * @param to 参考点
   * @returns `[-180，180]`或`[-PI，PI]` 由输入值决定 <角度制> 或 <弧度制>
   */
  export const CalcRhumbBearing = <T extends Coordinate>(from: T, to: T): number => {
    const divisor = getDivisor(from)
    const point1 = turf.point([from.longitude * divisor, from.latitude * divisor])
    const point2 = turf.point([to.longitude * divisor, to.latitude * divisor])
    const bearing = turf.rhumbBearing(point1, point2) / divisor
    return bearing
  }

  /**
   * @description 计算三点夹角
   * @param a 夹角点
   * @param b 边缘点
   * @param c 边缘点
   * @returns `[-180，180]`或`[-PI，PI]` 由输入值决定 <角度制> 或 <弧度制>
   */
  export const CalcAngle = <T extends Coordinate>(a: T, b: T, c: T) => {
    const divisor = a instanceof Cartographic ? 1 : (1 / PI) * 180
    const bearingAB = CalcBearing(a, b)
    const bearingAC = CalcBearing(a, c)
    const angle = bearingAB - bearingAC
    return angle < 0 ? angle + PI * 2 * divisor : angle
  }

  /**
   * @description 计算两点中心点
   * @param point1
   * @param point2
   * @returns 中心点
   */
  export const CalcMidPoint = <T extends Coordinate>(point1: T, point2: T): Coordinate => {
    const divisor = getDivisor(point1)
    const p1 = turf.point([point1.longitude * divisor, point1.latitude * divisor])
    const p2 = turf.point([point2.longitude * divisor, point2.latitude * divisor])
    const [longitude, latitude] = turf.midpoint(p1, p2).geometry.coordinates
    let height: number | undefined = undefined
    height = ((point1.height ?? 0) + (point2.height ?? 0)) / 2.0

    if (point1 instanceof Cartographic) {
      return new Cartographic(longitude, latitude, height)
    } else {
      return new Geographic(longitude, latitude, height)
    }
  }

  /**
   * @description 计算多边形 / 多点的平面质心
   * @param points 多边形或平面的顶点
   * @param [withHeight = false] 是否计算时考虑高度
   * @returns 质心
   * @exception Polygon needs at least 4 vertexes.
   */
  export const CalcMassCenter = (points: Coordinate[], withHeight = false): Coordinate => {
    if (points.length < 4) {
      throw new DeveloperError(`Polygon needs at least 4 vertexes.`)
    }
    const divisor = getDivisor(points[0])
    const feature = turf.polygon([points.map((p) => [p.longitude * divisor, p.latitude * divisor])])
    const [longitude, latitude] = turf.centroid(feature).geometry.coordinates
    const height = withHeight
      ? parseFloat(
          (
            points.reduce((prev, curr) => {
              prev += curr.height ?? 0
              return prev
            }, 0) / points.length
          ).toFixed(2)
        )
      : undefined
    if (points[0] instanceof Cartographic) {
      return new Cartographic(longitude, latitude, height)
    } else {
      return new Geographic(longitude, latitude, height)
    }
  }

  /**
   * @description 计算一个一定位于多边形上的点
   * @param polygon 多边形
   * @returns 任意多边形上的点
   * @exception Polygon needs at least 4 vertexes.
   */
  export const CalcPointOnPolygon = (polygon: Coordinate[]): Coordinate => {
    if (polygon.length < 4) {
      throw new DeveloperError(`Polygon needs at least 4 vertexes.`)
    }
    const divisor = getDivisor(polygon[0])
    const pl = polygon.reduce((prev, curr) => {
      prev.push([curr.longitude * divisor, curr.latitude * divisor])
      return prev
    }, [] as GeoTurple[])
    const pg = turf.polygon([pl])
    const [longitude, latitude] = turf.pointOnFeature(pg).geometry.coordinates
    if (polygon[0] instanceof Cartographic) {
      return new Cartographic(longitude, latitude)
    } else {
      return new Geographic(longitude, latitude)
    }
  }

  /**
   * @descript 计算多边形面积
   * @param polygon 多边形
   * @returns 面积 `㎡`
   */
  export const CalcPolygonArea = (polygon: Coordinate[]): number => {
    if (polygon.length < 4) return 0
    const divisor = getDivisor(polygon[0])
    const pl = polygon.reduce((prev, curr) => {
      prev.push([curr.longitude * divisor, curr.latitude * divisor])
      return prev
    }, [] as GeoTurple[])
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
  export const CalcEnvelope = (x: number, y: number, radius1: number, radius2: number, rotate: number) => {
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
  export const CalcConic = (height: number, arc: number) => {
    const r = EarthRadius.AVERAGE * sin(arc / EarthRadius.AVERAGE)
    const h = height + EarthRadius.AVERAGE * (1 - cos(arc / EarthRadius.AVERAGE))
    return { radius: r, heihgt: h }
  }

  /**
   * @description 计算数学累进距离
   * @param positions 坐标
   * @returns 距离
   */
  export const CalcMathDistance = (positions: GeoTurple[]) => {
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
  export const CalcThirdPoint = (
    target: GeoTurple,
    origin: GeoTurple,
    angle: number,
    radius: number,
    revert: boolean = false
  ): GeoTurple => {
    const g = CalcAzimuth(target, origin)
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
  export const CalcAzimuth = (target: GeoTurple, origin: GeoTurple): number => {
    const l = CalcMathDistance([target, origin])
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
   * @returns 数学角度值 <弧度制>
   */
  export const CalcMathAngle = (a: GeoTurple, b: GeoTurple, c: GeoTurple) => {
    const angle = CalcAzimuth(b, a) - CalcAzimuth(b, c)
    return angle < 0 ? angle + PI * 2 : angle
  }
}
