/**
 * @description 函数节流装饰器
 * @param [limit = 300] 区间`ms`
 */
export const throttle = (limit: number = 300): MethodDecorator => {
  return (_, __, descriptor) => {
    let inThrottle: boolean
    const origin = descriptor.value
    //@ts-ignore
    descriptor.value = function (...args: any[]) {
      if (!inThrottle) {
        //@ts-ignore
        origin.apply(this, args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
    return descriptor
  }
}
