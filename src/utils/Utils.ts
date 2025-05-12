import {
  Appearance,
  ComponentDatatype,
  defined,
  Framebuffer,
  Geometry,
  GeometryAttribute,
  GeometryAttributes,
  Math,
  Texture,
} from "cesium"
import { CoorFormat } from "enum"
import { WindField } from "components"

const { abs, floor, random } = window.Math

export namespace Utils {
  const separator = "Ω"

  /**
   * @description 获取随机ID
   * @param [symbol = "-"] 连接符
   * @returns 随机ID
   */
  export const RandomUUID = (symbol: string = "-") => {
    if (symbol === separator) {
      console.warn(`Avoid using symbol '${separator}' when creating a uuid.`)
    } else if (symbol.length > 1) {
      console.warn(`Avoid using mutiple strings as symbol.`)
    }
    const encode = (count: number) => {
      let output = ""
      for (let i = 0; i < count; i++) {
        output += (((1 + random()) * 0x10000) | 0).toString(16).substring(1)
      }
      return output
    }
    const seed = [encode(4), encode(2), encode(1), encode(3), encode(5)]
    const uuid = seed.join(symbol === separator || symbol.length > 1 ? "-" : symbol)
    return uuid
  }

  /**
   * @description ID编码
   * @param id ID
   * @param [module] 模块
   * @returns 编码结果
   */
  export const EncodeId = (id: string, module?: string) => {
    if (typeof id !== "string") {
      throw new Error("Invaid type of id, id must be string.")
    }
    if (id.includes(separator)) {
      throw new Error(`Invaid id string '${separator}'.`)
    }
    return module ? `${encodeURIComponent(id)}${separator}${encodeURIComponent(module)}` : id
  }

  /**
   * @description ID解码
   * @param id 已编码ID
   * @returns ID 模块
   */
  export const DecodeId = (id: string) => {
    const res: { id: string; module?: string } = { id: "" }
    const parts = id.split(separator)
    if (parts.length > 1) {
      res.id = decodeURIComponent(parts[0])
      res.module = decodeURIComponent(parts[1])
    } else res.id = id
    return res
  }

  /**
   * @description 格式化经度
   * @param longitude 经度
   * @param format [format = CoorFormat.DMS] {@link CoorFormat} 格式
   * @return 格式化结果
   */
  export const formatGeoLongitude = (longitude: number, format: CoorFormat = CoorFormat.DMS) => {
    if (!/^-?\d{1,3}(.\d+)?$/g.test(longitude.toString())) return longitude.toString()
    const absLongitude = abs(longitude)
    const d = floor(absLongitude)
    const f = floor((absLongitude - d) * 60)
    const m = floor((absLongitude - d) * 3600 - f * 60)
    let result = ""
    if (format === CoorFormat.DMS) {
      result = `${abs(d)}°${f}′${m}″${longitude >= 0 ? "E" : "W"}`
    } else if (format === CoorFormat.DMSS) {
      result = `${abs(d)}${(f < 10 ? "0" : "") + f}${(m < 10 ? "0" : "") + m}${longitude >= 0 ? "E" : "W"}`
    }
    return result
  }

  /**
   * @description 格式化纬度
   * @param latitude 纬度
   * @param [format = CoorFormat.DMS] {@link CoorFormat} 格式
   * @return 格式化结果
   */
  export const formatGeoLatitude = (latitude: number, format: CoorFormat = CoorFormat.DMS) => {
    if (!/^-?\d{1,2}(.\d+)?$/g.test(latitude.toString())) return latitude.toString()
    const absLatitude = abs(latitude)
    const d = floor(absLatitude)
    const f = floor((absLatitude - d) * 60)
    const m = floor((absLatitude - d) * 3600 - f * 60)
    let result = ""
    if (format === CoorFormat.DMS) {
      result = `${abs(d)}°${f}′${m}″${latitude >= 0 ? "N" : "S"}`
    } else if (format === CoorFormat.DMSS) {
      result = `${abs(d)}${(f < 10 ? "0" : "") + f}${(m < 10 ? "0" : "") + m}${latitude >= 0 ? "N" : "S"}`
    }
    return result
  }

  /**
   * @description 创建材质
   * @param options
   * @param typedArray
   */
  export const createTexture = (options: WindField.TextureOptions, typedArray?: Float32Array) => {
    if (defined(typedArray)) {
      const source: { arrayBufferView: Float32Array | undefined } = {
        arrayBufferView: undefined,
      }
      source.arrayBufferView = typedArray
      options.source = source
    }
    const texture = new Texture(options)
    return texture
  }

  export const randomizeParticles = (
    maxParticles: number,
    viewerParameters: WindField.ViewerParam,
    min: number,
    max: number
  ) => {
    const array = new Float32Array(4 * maxParticles)
    for (let i = 0; i < maxParticles; i++) {
      array[4 * i] = Math.randomBetween(viewerParameters.lonRange.x, viewerParameters.lonRange.y)
      array[4 * i + 1] = Math.randomBetween(viewerParameters.latRange.x, viewerParameters.latRange.y)
      array[4 * i + 2] = Math.randomBetween(min, max)
      array[4 * i + 3] = 0.0
    }
    return array
  }

  export const createFramebuffer = (context: any, colorTexture?: Texture, depthTexture?: Texture) => {
    const framebuffer = new Framebuffer({
      context: context,
      colorTextures: [colorTexture],
      depthTexture: depthTexture,
    })
    return framebuffer
  }
  export const createRawRenderState = (options: WindField.RenderState) => {
    const translucent = true
    const closed = false
    const existing = {
      viewport: options.viewport,
      depthTest: options.depthTest,
      depthMask: options.depthMask,
      blending: options.blending,
    }
    const rawRenderState = (Appearance as any).getDefaultRenderState(translucent, closed, existing)
    return rawRenderState
  }

  export const getFullscreenQuad = () => {
    const attributes = new GeometryAttributes()
    attributes.position = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 3,
      values: new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]),
    })
    attributes.st = new GeometryAttribute({
      componentDatatype: ComponentDatatype.FLOAT,
      componentsPerAttribute: 2,
      values: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    })
    const fullscreenQuad = new Geometry({
      attributes: attributes,
      indices: new Uint32Array([3, 2, 0, 0, 2, 1]),
    })
    return fullscreenQuad
  }

  /**
   * @description 将SVG图片格式转换为Canvas
   * @param svg SVG图片
   * @param [width = 48] 宽度
   * @param [height = 48] 高度
   * @returns Canvas结果
   */
  export const ConvertSvg2Canvas = async (svg: string, width: number = 48, height: number = 48) => {
    const loadImage = (url: string) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.src = url
      })
    }

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset-utf-8" })
    const url = URL.createObjectURL(svgBlob)
    const image = await loadImage(url)
    ctx.drawImage(image, 0, 0)
    return canvas
  }
}
