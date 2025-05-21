import * as packageJson from "./package.json"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"
import postcss from "rollup-plugin-postcss"
import { defineConfig } from "rollup"

const sourcemap = false

export default defineConfig({
  input: "src/index.ts",
  external: ["cesium", "@turf/turf", "echarts"],
  output: [
    {
      file: packageJson.main,
      exports: "named",
      format: "cjs",
      sourcemap,
    },
    {
      file: packageJson.module,
      format: "es",
      sourcemap,
    },
  ],
  plugins: [
    commonjs(),
    typescript(),
    nodeResolve(),
    terser({ keep_classnames: true, keep_fnames: true }),
    json(),
    postcss({
      plugins: [autoprefixer(), cssnano()],
      extract: "style/index.css",
    }),
  ],
})
