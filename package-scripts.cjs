const sd = (script, description = "") =>
  description ? { script, description } : { script }

const SELF = `nps -c ./package-scripts.cjs`
const CLI_INPUT = "./src/cli.js"
const CLI_OUTPUT = "./dist/cli.cjs"

const build =
  ({ script = false, format }) =>
  ([infile, outfile]) =>
    [
      `esbuild`,
      `${infile}`,
      `--outfile=${outfile}`,
      `--bundle`,
      `--format=${format}`,
      `--platform=node`,
      script ? `--banner:js='#!/usr/bin/env node'` : ``,
    ]
      .filter((z) => z)
      .join(" ")

module.exports = {
  scripts: {
    clean: sd("rm -r dist", "unbuild!"),
    build: {
      ...sd(`${SELF} build.cli build.perms`, "build everything!"),
      //cli: sd("rollup -c rollup.config.mjs", "build cli!"),
      cli: sd(
        build({ script: true, format: "cjs" })([CLI_INPUT, CLI_OUTPUT]),
        "build cli!",
      ),
      perms: sd(`chmod +x ${CLI_OUTPUT}`, "make the CLI file runnable"),
    },
    meta: {
      graph: `madge ${CLI_INPUT} --image graph.svg`,
    },
    lint: sd("eslint --fix .", "lint!"),
    test: {
      ...sd(`vitest --run --disable-console-intercept`, `test!`),
      ci: sd(`vitest --run`, `test for CI!`),
      watch: sd(`vitest --disable-console-intercept`, `test with watch-mode!`),
      snapshot: sd(
        `vitest -u --run --disable-console-intercept`,
        `update snapshots`,
      ),
    },
    legacy: 'echo "THIS IS A LEGACY CONFIG FILE!"',
  },
}
