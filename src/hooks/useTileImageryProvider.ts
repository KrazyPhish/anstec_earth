import { UrlTemplateImageryProvider } from "cesium"

export const useTileImageryProvider = (option: UrlTemplateImageryProvider.ConstructorOptions) => {
  return new UrlTemplateImageryProvider(option)
}
