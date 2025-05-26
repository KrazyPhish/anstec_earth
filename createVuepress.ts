//@ts-ignore
const path = require("path") as typeof import("node:path")
//@ts-ignore
const fs = require("fs") as typeof import("node:fs")

const createVuepressConfig = () => {
  fs.mkdir(path.join("docs", ".vuepress"), (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error(err)
      return
    }
    fs.readFile("vuepress.config.ts", "utf-8", (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        console.error(err)
        return
      }
      fs.writeFile(path.join("docs", ".vuepress", "config.ts"), data, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          console.error(err)
          return
        }
      })
    })
  })
}

createVuepressConfig()
