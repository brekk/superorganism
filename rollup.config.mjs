import { nodeResolve } from "@rollup/plugin-node-resolve"
import cjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"
import json from "@rollup/plugin-json"
import pkg from "./package.json" with { type: "json" }

export default [
  {
    input: `src/cli.js`,
    output: [{ file: pkg.bin, format: `cjs`, banner: "#!/usr/bin/env node" }],
    plugins: [
      json(),
      nodeResolve(),
      cjs({ extensions: [".js"], include: "node_modules/**" }),
      babel({ babelHelpers: "bundled" }),
    ],
  },
]
