import { useValidatorMaker } from "./validate"

/**
 * @description 参数为负验证装饰器
 */
export const negative = (attr?: string | symbol): ParameterDecorator => {
  const check = (value: number) => {
    return value < 0
  }
  const reason = (index: number, key: string | symbol, attr?: string | symbol) => {
    const realKey = typeof key === "string" ? key : key.toString()
    const realAttr = attr ? `the '${typeof attr === "string" ? attr : attr.toString()}'` : "it"
    return `Invalid parameter of '${realKey}' at index ${index}, ${realAttr} should be negative.`
  }
  return useValidatorMaker(check, reason, attr)
}
