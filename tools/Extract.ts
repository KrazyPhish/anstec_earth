const fs = require("fs") as typeof import("node:fs")

type FileObj = { path?: string; name?: string }

const deepExtractNames = (path: string, list: FileObj[]) => {
  const files = fs.readdirSync(path)
  files.forEach((name: string) => {
    const stat = fs.statSync(`${path + name}`)
    if (stat.isDirectory()) {
      deepExtractNames(`${path + name}/`, list)
    } else {
      const fileObj: FileObj = {}
      fileObj.path = path
      fileObj.name = name
      list.push(fileObj)
    }
  })
  return list
}

const iconRepositoryNamesapce = `export namespace IconRepository {
  export const getIconSerialNumber = (type: string): number | undefined => {
    return iconMap.get(type)
  }

  export const fuzzySearchTypes = (str: string) => {
    const legalStr = str.replace(/[.*+?\${}()|[\\]\\\\]/g, "\\\\$&")
    const regExp = new RegExp(legalStr, "g")
    const res = iconTypes.filter((icon) => regExp.test(icon))
    return res
  }

  export const getIconUrl = (
    type: string,
    serialNumber: number,
    prefix: string = "",
    belong: string = "001",
    size: "32" | "64" | "128" = "32"
  ) => {
    const url = \`\${belong}-\${size}-\${serialNumber}-\${type}.png\`
    const search = IconRepository.fuzzySearchIcons(url)
    if (!search.length || search.length > 1) {
      throw new Error("Invaid result, check if the 'belong', 'type' and 'size' are correct.")
    }
    return \`\${prefix}/\${url}\`
  }

  export const fuzzySearchIcons = (str: string) => {
    const legalStr = str.replace(/[.*+?\${}()|[\\]\\\\]/g, "\\\\$&")
    const regExp = new RegExp(legalStr, "g")
    const res = iconNames.filter((icon) => regExp.test(icon))
    return res
  }
}`

const createImageLibrary = (path: string, list: FileObj[]) => {
  let names = `const iconTypes = [`
  let fullNames = `const iconNames = [`
  let map = `const iconMap = new Map<string, number>([`
  list.forEach(({ name }: FileObj, index: number) => {
    const [headNumber, size, serialNumber, pathName] = name!.split("-")
    const fullType = pathName.split(".")[0]
    const types = fullType.split("、")
    const fullName = `${headNumber}-${size}-${serialNumber}-${fullType}`
    types.forEach((type) => {
      fullNames += `"${fullName}",`
      names += `"${type}",`
      map += `["${type}", ${serialNumber}],`
    })
    if (index === list.length - 1) {
      fullNames += "]"
      names += "]"
      map += "])"
    }
  })
  const fileName = "IconRepository.ts"
  fs.writeFileSync(`${path}/${fileName}`, fullNames, "utf-8")
  fs.appendFileSync(`${path}/${fileName}`, `\n${names}`, "utf-8")
  fs.appendFileSync(`${path}/${fileName}`, `\n${map}`, "utf-8")
  fs.appendFileSync(`${path}/${fileName}`, `\n${iconRepositoryNamesapce}`, "utf-8")
}

const res = deepExtractNames("D:/Work Data/Sources/Icons/Blue-64/", [])

createImageLibrary(".", res)
