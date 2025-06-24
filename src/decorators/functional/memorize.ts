/**
 * @description 访问器缓存值装饰器，计算一次以节省性能
 */
export const memorize: MethodDecorator = (_, __, descriptor) => {
  let cachedValue: any
  const originGet = descriptor.get
  descriptor.get = function () {
    if (cachedValue) return cachedValue
    else {
      cachedValue = originGet?.apply(this)
      return cachedValue
    }
  }
  return descriptor
}
