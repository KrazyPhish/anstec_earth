import CesiumNavigation from "cesium-navigation-es6"
import { Earth } from "components/Earth"
import { Camera, Rectangle } from "cesium"

//TODO delete hooks at v2.6.x
/**
 * fix bug of Rectangle.validate being private
 */
//@ts-ignore
if (!Rectangle.validate && Rectangle._validate) {
  //@ts-ignore
  Rectangle.validate = Rectangle._validate
}

/**
 * @deprecated use `createNavigation`, this will be deleted at next minor version
 */
export const useNavigation = (earth: Earth, option?: CesiumNavigation.NavigationOptions) => {
  console.warn(
    "'useNavigation' is deprecated and will be removed at next minor version, use 'createNavigation' instead."
  )
  return createNavigation(earth, option)
}

/**
 * @description 使用CesiumNavigation初始化控制摇杆
 * @param earth 地球
 * @param option 控制摇杆参数
 * @returns 控制遥杆
 */
export const createNavigation = (earth: Earth, option?: CesiumNavigation.NavigationOptions) => {
  return new CesiumNavigation(earth.viewer, {
    defaultResetView: Camera.DEFAULT_VIEW_RECTANGLE,
    enableCompass: true,
    enableZoomControls: true,
    enableDistanceLegend: true,
    enableCompassOuterRing: true,
    ...option,
  })
}
