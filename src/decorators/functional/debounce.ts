/**
 * @description 函数防抖装饰器
 * @param [delay] 延迟`ms`
 */
export const debounce = (delay: number = 300): MethodDecorator => {
  return (_, __, descriptor) => {
    let timer: NodeJS.Timeout
    const origin = descriptor.value
    ;(descriptor.value as Function) = function (...args: any[]) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        //@ts-ignore
        origin.apply(this, args)
      }, delay)
    }
    return descriptor
  }
}
