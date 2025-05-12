import { Cartesian3, Cartographic, Ellipsoid, Math } from "cesium"
import { Utils } from "../../utils"
import { CoorFormat } from "../../enum"

/**
 * @description 地理坐标，经纬度 <角度制>
 * @example
 * ```
 * const geo = new Geographic(104, 31, 500)
 * ```
 */
export class Geographic {
  /**
   * @param longitude 经度 <角度制>
   * @param latitude 纬度 <角度制>
   * @param [height = 0] 海拔高度 `m`
   */
  constructor(
    public longitude: number,
    public latitude: number,
    public height: number = 0
  ) {}

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
  public toCartesian(ellipsoid: Ellipsoid = Ellipsoid.WGS84, result?: Cartesian3) {
    return Cartesian3.fromDegrees(this.longitude, this.latitude, this.height, ellipsoid, result)
  }

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
  public toCartographic(result?: Cartographic) {
    return Cartographic.fromDegrees(this.longitude, this.latitude, this.height, result)
  }

  /**
   * @description 转为数组
   * @returns 数组格式
   * @example
   * ```
   * const geo = new Geographic(104, 31, 500)
   * const [longitude, latitude] = geo.toArray()
   * ```
   */
  public toArray() {
    return [this.longitude, this.latitude]
  }

  /**
   * @description 转为带高程的数组
   * @returns 数组格式
   * @example
   * ```
   * const geo = new Geographic(104, 31, 500)
   * const [longitude, latitude, height] = geo.toArrayHeight()
   * ```
   */
  public toArrayHeight() {
    return [this.longitude, this.latitude, this.height]
  }

  /**
   * @description 克隆当前坐标
   * @returns 新的`Geographic`坐标
   * @example
   * ```
   * const geo = new Geographic(104, 31, 500)
   * const clone = geo.clone()
   * ```
   */
  public clone() {
    return new Geographic(this.longitude, this.latitude, this.height)
  }

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
  public format(format: CoorFormat = CoorFormat.DMS) {
    return {
      longitude: Utils.formatGeoLongitude(this.longitude, format),
      latitude: Utils.formatGeoLatitude(this.latitude, format),
    }
  }

  /**
   * @description 从弧度制的数据转换
   * @param longitude 经度 <弧度制>
   * @param latitude 纬度 <弧度制>
   * @param [height = 0] 海拔高度 `m`
   * @param [result] {@link Geographic} 存储结果对象
   * @returns 地理坐标
   */
  public static fromRadians(longitude: number, latitude: number, height: number = 0, result?: Geographic) {
    const lon = Math.toDegrees(longitude)
    const lat = Math.toDegrees(latitude)
    if (result) {
      result.longitude = lon
      result.latitude = lat
      result.height = height
    }
    return result ?? new Geographic(lon, lat, height)
  }

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
  public static fromCartesian(cartesian: Cartesian3, ellipsoid: Ellipsoid = Ellipsoid.WGS84, result?: Geographic) {
    const geo = Cartographic.fromCartesian(cartesian, ellipsoid)
    const lon = Math.toDegrees(geo.longitude)
    const lat = Math.toDegrees(geo.latitude)
    if (result) {
      result.longitude = lon
      result.latitude = lat
      result.height = geo.height
    }
    return result ?? new Geographic(lon, lat, geo.height)
  }

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
  public static fromCartographic(cartographic: Cartographic, result?: Geographic) {
    const lon = Math.toDegrees(cartographic.longitude)
    const lat = Math.toDegrees(cartographic.latitude)
    if (result) {
      result.longitude = lon
      result.latitude = lat
      result.height = cartographic.height
    }
    return result ?? new Geographic(lon, lat, cartographic.height)
  }

  /**
   * @description 数组批量转坐标
   * @param coordinates 数组坐标
   * @example
   * ```
   * const arr = [104, 31]
   * const geoArr = Geographic.fromDegreesArray(arr)
   * ```
   */
  public static fromDegreesArray(coordinates: number[]) {
    if (coordinates.length % 2) {
      throw new Error("Invaid array length of degrees.")
    }
    const geographics: Geographic[] = []
    for (let i = 0; i < coordinates.length; i += 2) {
      const lon = coordinates[i]
      const lat = coordinates[i + 1]
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
        throw new Error("Invaid longitude or latitude value.")
      }
      geographics.push(new Geographic(lon, lat))
    }
    return geographics
  }

  /**
   * @description 带高程的数组批量转坐标
   * @param coordinates 带高程的数组坐标
   * @example
   * ```
   * const arr = [104, 31, 500]
   * const geoArr = Geographic.fromDegreesArrayHeights(arr)
   * ```
   */
  public static fromDegreesArrayHeights(coordinates: number[]) {
    if (coordinates.length % 3) {
      throw new Error("Invaid array length of degrees.")
    }
    const geographics: Geographic[] = []
    for (let i = 0; i < coordinates.length; i += 3) {
      const lon = coordinates[i]
      const lat = coordinates[i + 1]
      if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
        throw new Error("Invaid longitude or latitude value.")
      }
      geographics.push(new Geographic(lon, lat, coordinates[i + 2]))
    }
    return geographics
  }
}
