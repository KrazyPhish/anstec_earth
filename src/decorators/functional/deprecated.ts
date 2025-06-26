/**
 * @description 类、方法、属性废弃装饰器
 * @param [replace] 替带方案名
 * @param [version] 预计废弃版本
 */
export const deprecated = (
  replace?: string,
  version?: string
): {
  <T extends Function>(target: T): T
  (target: object, prop: string | symbol): void
  <T>(target: object, prop: string | symbol, descriptor: TypedPropertyDescriptor<T>): void
} => {
  return (...args: Parameters<ClassDecorator> | Parameters<MethodDecorator> | Parameters<PropertyDecorator>) => {
    const replacement = replace ? `, use '${replace}' instead` : ""
    const exactVersion = version ?? "next minor version"
    const [target, prop, descriptor] = args
    if (prop && descriptor) {
      //@ts-ignore
      const owner = target.name ?? target.constructor.name
      const key = typeof prop === "string" ? prop : prop.toString()
      const origin = descriptor.value as Function
      descriptor.value = function (...args: any[]) {
        console.warn(`'${owner}.${key}' is deprecated and will be removed at ${exactVersion}${replacement}.`)
        return origin.apply(this, args)
      }
    } else if (prop) {
      //@ts-ignore
      const owner = target.name ?? target.constructor.name
      const key = typeof prop === "string" ? prop : prop.toString()
      const reader = replace ?? prop
      Object.defineProperty(target, prop, {
        configurable: false,
        enumerable: true,
        get() {
          console.warn(`'${owner}.${key}' is deprecated and will be removed at ${exactVersion}${replacement}.`)
          return this[reader]
        },
        set(value: any) {
          console.warn(`'${owner}.${key}' is deprecated and will be removed at ${exactVersion}${replacement}.`)
          this[reader] = value
        },
      })
    } else {
      return new Proxy(target, {
        construct(target: Function, args) {
          console.warn(`class '${target.name}' is deprecated and will be removed at ${exactVersion}${replacement}.`)
          return Reflect.construct(target, args)
        },
      })
    }
  }
}
