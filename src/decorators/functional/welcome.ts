import { pkg } from "config"
import { earth } from "images"

/**
 * @description 欢迎信息装饰器
 */
export const welcome: ClassDecorator = (target) => {
  console.groupCollapsed(
    "%c %c " + "Welcome to use.",
    `
    padding: 5px 5px;
    background: url(${earth}) no-repeat;
    background-size: contain;
    width: 20px;
    height: 20px;
  `,
    `
    font-size: 14px;
    padding-left: 5px;
    align-items: center;
  `
  )
  const tooltip = `
    Name: ${pkg.name}
    Author: ${pkg.author}
    Version: ${pkg.version}
  `
  console.log(tooltip)
  console.groupEnd()
  const map: string[][] = [
    ["author", pkg.author],
    ["version", pkg.version],
    ["createdTime", new Date().toLocaleString()],
  ]
  const properties = map.reduce((prev, curr) => {
    const [key, value] = curr
    prev[key] = { configurable: false, get: () => value }
    return prev
  }, {} as PropertyDescriptorMap)
  Object.defineProperties(target.prototype, properties)
  return target
}
