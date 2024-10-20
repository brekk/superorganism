import path from "node:path"
import { Chalk } from "chalk"
import { closest, distance } from "fastest-levenshtein"
import {
  __,
  split,
  filter,
  propOr,
  chain,
  last,
  pipe,
  curry,
  map,
  keys,
  pathOr,
  uniq,
} from "ramda"
import { configurate } from "altercation"
import { interpretWithCancel, demandWithCancel } from "destined"
import { execWithConfig, signal } from "kiddo"
// import { $ as script } from "execa"
import { bimap, resolve } from "fluture"

import PKG from "../package.json"
import { recurse } from "./recursive"
import { log } from "./log"
import { YARGS_CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from "./config"

const getScriptFromTask = (t) => {
  if (t.script) t = t.script
  if (t.default) t = t.default
  return t
}

const SCRIPT_JOINER_DELIMITER = `:`

const makeScriptGetter = curry(function _makeScriptGetter(scripts, task) {
  return pipe(
    split(SCRIPT_JOINER_DELIMITER),
    pathOr(false, __, scripts),
    getScriptFromTask,
  )(task)
})
export const getNestedTasks = (scripts) => {
  const getScript = makeScriptGetter(scripts)
  let tasks = keys(scripts)
  recurse(
    {
      pair: curry((crumbs, [k, v]) => {
        if (k !== `description` && k !== `script`) {
          tasks = uniq(tasks.concat([crumbs.join(SCRIPT_JOINER_DELIMITER)]))
        }
        return [k, v]
      }),
      literal: curry((crumbs = [], x) => {
        const crumb = last(crumbs)
        tasks = uniq(tasks.concat(crumb))
        return x
      }),
    },
    scripts,
  )
  return pipe(
    filter((taskName) => {
      const task = getScript(taskName)
      if (typeof task === `object`) return false
      return true
    }),
    (y) => y.sort(),
  )(tasks)
}

export const EXECA_FORCE_COLOR = {
  env: { FORCE_COLOR: `true` },
}
const getStdOut = propOr(``, `stdout`)

export const executeWithCancel = curry(function _executeWithCancel(
  cancel,
  { tasks, scripts, config },
) {
  const chalk = new Chalk({ level: config.color ? 2 : 0 })
  if (config.help) return config.HELP
  const getScript = makeScriptGetter(scripts)
  let showHelp = true
  const messages = []
  if (config._.length > 0) {
    const [task] = config._
    if (tasks.includes(task)) {
      const get = getScript(task)
      const scriptLookup = typeof get === `string` ? get : get.scriptLookup
      const [cmd, ...args] = scriptLookup.split(` `)
      if (scriptLookup) {
        return pipe(
          bimap(getStdOut)(getStdOut),
          signal(cancel, {
            text: `${chalk.inverse(` ` + task + ` `)}: \`${chalk.green(
              scriptLookup,
            )}\``,
          }),
        )(
          execWithConfig(
            cancel,
            cmd,
            {
              cwd: process.cwd(),
              ...(config.color ? EXECA_FORCE_COLOR : {}),
            },
            args,
          ),
        )
      }
    } else {
      messages.push(`I cannot understand the "${chalk.red(task)}" command.`)
      const lookup = closest(task, tasks)
      showHelp = false
      if (distance(task, lookup) < 4) {
        messages.push(`Did you mean to run "${chalk.yellow(lookup)}" instead?`)
      }
    }
  }
  const commands = pipe(
    map((task) => `${chalk.green(task)} - ${getScript(task)}`),
  )(tasks)
  return resolve(
    (showHelp ? config.HELP : messages.join(` `)) +
      `\n\n${chalk.inverse(` Available commands: `)}\n\n${commands.join(`\n`)}`,
  )
})
const { name: $NAME, description: $DESC } = PKG

const $BANNER = `.--,       .--,
{{  \\.^^^./  }}
'\\__/ ✖︎ ✖︎ \\__/'
   }=  ❤︎  ={
    >  ▼  <
.mmb-------dmm.`

export const runnerWithCancel = curry(function _runnerWithCancel(cancel, argv) {
  return pipe(
    configurate(
      YARGS_CONFIG,
      { ...CONFIG_DEFAULTS, basePath: process.cwd() },
      HELP_CONFIG,
      { name: $NAME, description: $DESC, banner: $BANNER },
    ),
    chain(({ basePath, config, commonjs: cjs = false, ...parsedConfig }) => {
      const source =
        config || `${basePath}/package-scripts.${cjs ? `cjs` : `js`}`

      return pipe(
        // require seems(?) to need more specificity, this needs testing
        (x) => path.resolve(basePath, x),
        // cjs ? relativePathJoin(basePath) : I,
        log.config(`reading...`),
        // backwards-compat for `nps` here, if `--cjs` we can load the legacy format
        (cjs ? demandWithCancel : interpretWithCancel)(cancel),
        log.config(`read...`),
        map(
          pipe(pathOr({}, [`scripts`]), (loadedScripts) => ({
            config: { ...parsedConfig, source, commonjs: cjs },
            scripts: loadedScripts,
            tasks: getNestedTasks(loadedScripts),
            source,
          })),
        ),
        chain(executeWithCancel(cancel)),
      )(source)
    }),
  )(argv)
})

export const runner = runnerWithCancel(() => {})
