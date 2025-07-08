import { UrlTemplateImageryProvider } from "cesium"

//TODO delete hooks at v2.6.x
/**
 * @deprecated new `UrlTemplateImageryProvider` directly, this will be deleted at next minor version
 */
export const useTileImageryProvider = (option: UrlTemplateImageryProvider.ConstructorOptions) => {
  console.warn(
    "'useTileImageryProvider' is deprecated and will be deleted at next minor version, new the 'UrlTemplateImageryProvider' instance directly instead."
  )
  return new UrlTemplateImageryProvider(option)
}
