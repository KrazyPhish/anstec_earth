import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Math,
  SceneTransforms,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  type Camera,
  type Ellipsoid,
  type Scene,
} from "cesium"
import { Geographic } from "./Geographic"
import { ScreenCapture } from "enum"
import { deprecate, is, or, singleton, validate } from "decorators"
import type { Earth } from "components/Earth"

/**
 * @description 坐标系统
 * @example
 * ```
 * const earth = createEarth()
 * const coordinate = earth.coordinate
 * //or
 * const coordinate = new Coordinate(earth)
 * ```
 */
@singleton("Not necessay to create 'Coordinate', 'earth.coordinate' is available.")
export class Coordinate {
  #earth: Earth
  #scene: Scene
  #camera: Camera
  #ellipsoid: Ellipsoid
  #handler?: ScreenSpaceEventHandler

  constructor(earth: Earth) {
    this.#earth = earth
    this.#scene = earth.scene
    this.#camera = earth.camera
    this.#ellipsoid = earth.scene.globe.ellipsoid
  }
  //TODO remove the deprecations at v2.6.x

  /**
   * @description 开启鼠标实时获取坐标事件
   * @param callback 回调函数
   * @param [realtime = true] `true`为鼠标移动时实时获取，`false`为鼠标单击时获取
   * @example
   * ```
   * coordinate.registerMouseCoordinate((data) => { console.log(data) }, true)
   * ```
   */
  @deprecate("GlobalEvent.subscribe")
  registerMouseCoordinate(callback: (data: Cartographic) => void, realtime: boolean = true) {
    let eventType: ScreenSpaceEventType
    this.#handler = new ScreenSpaceEventHandler(this.#scene.canvas)
    if (realtime) {
      eventType = ScreenSpaceEventType.MOUSE_MOVE
    } else {
      eventType = ScreenSpaceEventType.LEFT_CLICK
      this.#earth.container.style.cursor = "crosshair"
    }
    this.#handler.setInputAction((e: ScreenSpaceEventHandler.MotionEvent | ScreenSpaceEventHandler.PositionedEvent) => {
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
  @deprecate()
  unregisterMouseCoordinate() {
    this.#handler && this.#handler.destroy()
    this.#handler = undefined
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
  @validate
  screenToCartesian(
    @is(Cartesian2) position: Cartesian2,
    mode: ScreenCapture = ScreenCapture.ELLIPSOID
  ): Cartesian3 | undefined {
    let coor: Cartesian3 | undefined
    const ray = this.#camera.getPickRay(position)
    switch (mode) {
      case ScreenCapture.SCENE: {
        coor = this.#scene.pickPosition(position)
        break
      }
      case ScreenCapture.TERRAIN: {
        if (ray) {
          coor = this.#scene.globe.pick(ray, this.#scene)
        }
        break
      }
      case ScreenCapture.ELLIPSOID: {
        coor = this.#camera.pickEllipsoid(position, this.#ellipsoid)
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
  @validate
  cartesianToScreen(@is(Cartesian3) position: Cartesian3): Cartesian2 | undefined {
    return SceneTransforms.worldToWindowCoordinates(this.#scene, position)
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
  @validate
  cartographicToCartesian(@is(Cartographic) cartographic: Cartographic): Cartesian3 {
    return this.#ellipsoid.cartographicToCartesian(cartographic)
  }

  /**
   * @description 地理坐标数组转空间坐标数组
   * @param cartographics {@link Cartographic} 地理坐标数组
   * @returns `Cartesian3`坐标数组
   * @example
   * ```
   * const positions = Cartographic.fromDegreesArray([104, 31, 0, 105, 32, 1])
   * const cartesian3Array = coordinate.cartographicArrayToCartesianArray(positions)
   * ```
   */
  @validate
  cartographicArrayToCartesianArray(@is(Array) cartographics: Cartographic[]): Cartesian3[] {
    return this.#ellipsoid.cartographicArrayToCartesianArray(cartographics)
  }

  /**
   * @description 空间坐标转地理坐标
   * @param position {@link Cartesian3} 空间坐标
   * @return `Cartographic`坐标
   * @example
   * ```
   * const position = Cartesian3.fromDegrees(104, 31, 0)
   * const carto = coordinate.cartesianToCartographic(position)
   * ```
   */
  @validate
  cartesianToCartographic(@is(Cartesian3) position: Cartesian3): Cartographic {
    return this.#ellipsoid.cartesianToCartographic(position)
  }

  /**
   * @description 空间坐标数组转地理坐标数组
   * @param positions {@link Cartesian3} 空间坐标数组
   * @returns `Cartographic`坐标数组
   * @example
   * ```
   * const positions = Cartesian3.fromDegreesArray([104, 31, 0, 105, 32, 1])
   * const cartos = coordinate.cartesianArrayToCartographicArray(positions)
   * ```
   */
  @validate
  cartesianArrayToCartographicArray(@is(Array) positions: Cartesian3[]): Cartographic[] {
    return this.#ellipsoid.cartesianArrayToCartographicArray(positions)
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
  @validate
  screenToGeographic(@is(Cartesian2) position: Cartesian2): Geographic | undefined {
    const cartesian = this.screenToCartesian(position)
    if (!cartesian) return
    const cartographic = Cartographic.fromCartesian(cartesian)
    const longitude = Math.toDegrees(cartographic.longitude)
    const latitude = Math.toDegrees(cartographic.latitude)
    const altitude = this.#scene.globe.getHeight(cartographic)
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
  @validate
  screenToCartographic(@is(Cartesian2) position: Cartesian2): Cartographic | undefined {
    const cartesian = this.screenToCartesian(position)
    if (!cartesian) return
    return Cartographic.fromCartesian(cartesian)
  }

  /**
   * @description 获取坐标处位置的地面高度
   * @param position {@link Cartographic} | {@link Geographic} 地理或经纬度坐标
   * @returns 高度
   */
  @validate
  positionSurfaceHeight(@or([Cartographic, Geographic]) position: Cartographic | Geographic): number | undefined {
    if (position instanceof Cartographic) {
      return this.#scene.globe.getHeight(position)
    } else if (position instanceof Geographic) {
      const geo = position.toCartographic()
      return this.#scene.globe.getHeight(geo)
    }
  }
}
