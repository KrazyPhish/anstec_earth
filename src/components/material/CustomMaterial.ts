import { PolylineFlowingDashMaterial } from "./PolylineFlowingDashMaterial"
import { PolylineFlowingWaveMaterial } from "./PolylineFlowingWaveMaterial"
import { PolylineTrailingMaterial } from "./PolylineTrailingMaterial"
import type { Material, TextureMagnificationFilter, TextureMinificationFilter } from "cesium"

/**
 * @description 自定义材质
 */
export namespace CustomMaterial {
  const materialMap = new Map<string, typeof Material>([
    ["PolylineFlowingDash", PolylineFlowingDashMaterial],
    ["PolylineFlowingWave", PolylineFlowingWaveMaterial],
    ["PolylineTrailing", PolylineTrailingMaterial],
  ])

  export type ConstructorOptions = {
    strict?: boolean
    translucent?: boolean | ((...params: any[]) => any)
    minificationFilter?: TextureMinificationFilter
    magnificationFilter?: TextureMagnificationFilter
    fabric: { [key: string]: any }
  }

  export const getMaterialByType = (type: string) => {
    const customMaterial = materialMap.get(type)
    return customMaterial
  }
}
