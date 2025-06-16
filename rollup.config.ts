import * as packageJson from "./package.json"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"
import autoprefixer from "autoprefixer"
import cssnano from "cssnano"
import postcss from "rollup-plugin-postcss"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import { defineConfig } from "rollup"

const sourcemap = false

export default defineConfig({
  input: "src/index.ts",
  treeshake: true,
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
    peerDepsExternal(),
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
  onwarn(warning, next) {
    if (warning.code !== "UNUSED_EXTERNAL_IMPORT") {
      next(warning)
    }
  },
})
