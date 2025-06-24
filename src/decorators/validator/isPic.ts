import { useValidatorMaker } from "./validate"

/**
 * @description 图片格式验证装饰器
 * @param [format] 格式
 * @param [attr] 属性名
 * @returns
 */
export const isPic = (format?: "jpg" | "jpeg" | "png", attr?: string | symbol): ParameterDecorator => {
  const check = (url: string): boolean => {
    if (url.includes("base64")) return true
    const names = url.split(".")
    return names.some((name) => {
      return name === "jpg" || name === "jpeg" || name === "png"
    })
  }
  const reason = (index: number, key: string | symbol, attr?: string | symbol) => {
    const realKey = typeof key === "string" ? key : key.toString()
    const realAttr = attr ? `the '${typeof attr === "string" ? attr : attr.toString()}'` : "it"
    const tip = format ? `'${format}'` : "'jpg', 'jpeg' or 'png'"
    return `Invalid picture format of '${realKey}' at index ${index}, ${realAttr} must be ${tip}.`
  }
  return useValidatorMaker(check, reason, attr)
}
