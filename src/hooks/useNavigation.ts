import CesiumNavigation from "cesium-navigation-es6"
import { Earth } from "../components"
import { Rectangle } from "cesium"

/**
 * @description 使用CesiumNavigation初始化控制摇杆
 * @param earth 地球
 * @param option 控制摇杆参数
 * @returns 控制遥杆
 */
export const useNavigation = (earth: Earth, option?: CesiumNavigation.NavigationOptions) => {
  return new CesiumNavigation(earth.viewer, {
    defaultResetView: Rectangle.fromDegrees(72.004, 0.8293, 137.8347, 55.8271),
    enableCompass: true,
    enableZoomControls: true,
    enableDistanceLegend: true,
    enableCompassOuterRing: true,
    ...option,
  })
}
