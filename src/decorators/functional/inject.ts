type Attribute = {
  name: string | symbol
  value: any
  configurable?: boolean
  enumerable?: boolean
  readonly?: boolean
}

/**
 * @description 类属性注入装饰器
 */
export const inject = (attr: Attribute | Attribute[]): ClassDecorator => {
  const attrs = Array.isArray(attr) ? attr : [attr]
  const properties = attrs.reduce((prev, curr) => {
    const { name, value, configurable = false, enumerable = true, readonly = false } = curr
    const errorName = typeof name === "string" ? name : name.toString()
    prev[name] = {
      configurable,
      enumerable,
      get() {
        return value
      },
      set(value: any) {
        //@ts-ignore
        if (readonly) throw new Error(`Cannot assign to '${errorName}', because it is a read-only property.`)
        //@ts-ignore
        else this[name] = value
      },
    }
    return prev
  }, {} as PropertyDescriptorMap)
  return (target) => {
    Object.defineProperties(target.prototype, properties)
    return target
  }
}
