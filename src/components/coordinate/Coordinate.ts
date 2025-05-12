import {
  Camera,
  Cartesian2,
  Cartesian3,
  Cartographic,
  DeveloperError,
  Ellipsoid,
  Math,
  Scene,
  SceneTransforms,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "cesium"
import { Earth } from "../Earth"
import { Geographic } from "."
import { ScreenCapture } from "../../enum"

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
  private scene: Scene
  private camera: Camera
  private ellipsoid: Ellipsoid
  private handler?: ScreenSpaceEventHandler

  constructor(private earth: Earth) {
    this.scene = earth.scene
    this.camera = earth.camera
    this.ellipsoid = earth.scene.globe.ellipsoid
  }

  /**
   * @description 开启鼠标实时获取坐标事件
   * @param callback 回调函数
   * @param [realtime = true] `true`为鼠标移动时实时获取，`false`为鼠标单击时获取
   * @example
   * ```
   * coordinate.registerMouseCoordinate((data) => { console.log(data) }, true)
   * ```
   */
  public registerMouseCoordinate(callback: (data: Cartographic) => void, realtime: boolean = true) {
    let eventType: ScreenSpaceEventType
    this.handler = new ScreenSpaceEventHandler(this.scene.canvas)
    if (realtime) {
      eventType = ScreenSpaceEventType.MOUSE_MOVE
    } else {
      eventType = ScreenSpaceEventType.LEFT_CLICK
      this.earth.container.style.cursor = "crosshair"
    }
    this.handler.setInputAction((e: ScreenSpaceEventHandler.MotionEvent | ScreenSpaceEventHandler.PositionedEvent) => {
      const screen =
        (e as ScreenSpaceEventHandler.MotionEvent).endPosition ||
        (e as ScreenSpaceEventHandler.PositionedEvent).position
      const coor = this.screenToCartesian(screen, ScreenCapture.TERRAIN)

      if (coor) {
        callback(this.cartesianToCartographic(coor))
      }
    }, eventType)
  }

  /**
   * @description 销毁实时鼠标获取坐标事件
   * @example
   * ```
   * coordinate.unregisterMouseCoordinate()
   * ```
   */
  public unregisterMouseCoordinate() {
    this.handler && this.handler.destroy()
    this.handler = undefined
  }

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
  public screenToCartesian(
    position: Cartesian2,
    mode: ScreenCapture = ScreenCapture.ELLIPSOID
  ): Cartesian3 | undefined {
    let coor: Cartesian3 | undefined
    const ray = this.camera.getPickRay(position)
    switch (mode) {
      case ScreenCapture.SCENE: {
        coor = this.scene.pickPosition(position)
        break
      }
      case ScreenCapture.TERRAIN: {
        if (ray) {
          coor = this.scene.globe.pick(ray, this.scene)
        }
        break
      }
      case ScreenCapture.ELLIPSOID: {
        coor = this.camera.pickEllipsoid(position, this.ellipsoid)
        break
      }
    }
    return coor
  }

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
  public cartesianToScreen(position: Cartesian3): Cartesian2 {
    return SceneTransforms.wgs84ToWindowCoordinates(this.scene, position)
  }

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
  public cartographicToCartesian(cartographic: Cartographic): Cartesian3 {
    return this.ellipsoid.cartographicToCartesian(cartographic)
  }

  /**
   * @description 空间坐标转地理坐标
   * @param position {@link Cartesian3} 空间坐标
   * @return `Cartographic`坐标
   * ```
   * const position = Cartesian3.fromDegrees(104, 31, 0)
   * const carto = coordinate.cartesianToCartographic(position)
   * ```
   */
  public cartesianToCartographic(position: Cartesian3): Cartographic {
    return this.ellipsoid.cartesianToCartographic(position)
  }

  /**
   * @description 屏幕坐标转经纬度坐标
   * @param position {@link Cartesian2} 屏幕坐标
   * @returns `Geographic`坐标
   * @example
   * ```
   * const position = new Cartesian2(50, 50)
   * const geo = coordinate.screenToGeographic(position)
   * ```
   */
  public screenToGeographic(position: Cartesian2): Geographic | undefined {
    const cartesian = this.screenToCartesian(position)
    if (!cartesian) return
    const cartographic = Cartographic.fromCartesian(cartesian)
    const longitude = Math.toDegrees(cartographic.longitude)
    const latitude = Math.toDegrees(cartographic.latitude)
    const altitude = this.scene.globe.getHeight(cartographic)
    return new Geographic(longitude, latitude, altitude)
  }

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
  public screenToCartographic(position: Cartesian2): Cartographic | undefined {
    const cartesian = this.screenToCartesian(position)
    if (!cartesian) return
    return Cartographic.fromCartesian(cartesian)
  }

  /**
   * @description 获取坐标处位置的地面高度
   * @param position {@link Cartographic} | {@link Geographic} 地理或经纬度坐标
   * @returns 高度
   * @exception Invaid position type, use cartographic or geographic.
   */
  public positionSurfaceHeight(position: Cartographic | Geographic): number | undefined {
    if (position instanceof Cartographic) {
      return this.scene.globe.getHeight(position)
    } else if (position instanceof Geographic) {
      const geo = position.toCartographic()
      return this.scene.globe.getHeight(geo)
    } else {
      throw new DeveloperError("Invaid position type, use cartographic or geographic.")
    }
  }
}
