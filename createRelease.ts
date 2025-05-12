//@ts-ignore
const path = require("path") as typeof import("node:path")
//@ts-ignore
const fs = require("fs") as typeof import("node:fs")

const createRelease = () => {
  const declareOriginPath = path.join("src", "index.d.ts")
  const declareTragetPath = path.join("dist", "index.d.ts")
  const cesiumOriginPath = path.join("src", "cesium.extend.d.ts")
  const cesiumTargetPath = path.join("dist", "cesium.extend.d.ts")
  fs.copyFile(declareOriginPath, declareTragetPath, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error(err)
      return
    }
  })
  fs.copyFile(cesiumOriginPath, cesiumTargetPath, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error(err)
      return
    }
  })
}

createRelease()
