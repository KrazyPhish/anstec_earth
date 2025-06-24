import { useValidatorMaker } from "./validate"

/**
 * @description 数组长度验证装饰器
 * @param mutiple 要验证的长度倍数
 * @param [attr] 属性名
 */
export const mutipleOf = (mutiple: number, attr?: string | symbol): ParameterDecorator => {
  const check = (value: any[]) => {
    return !(value.length % mutiple)
  }
  const reason = (index: number, key: string | symbol, attr?: string | symbol) => {
    const realKey = typeof key === "string" ? key : key.toString()
    const realAttr = attr ? `the '${typeof attr === "string" ? attr : attr.toString()}′s'` : "its"
    return `Invalid array length of '${realKey}' at index ${index}, ${realAttr} length must be mutiple of ${mutiple}.`
  }
  return useValidatorMaker(check, reason, attr)
}
