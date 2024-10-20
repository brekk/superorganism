export const YARGS_CONFIG = {
  alias: {
    // these come from `nps`
    silent: ["s"],
    scripts: [],
    config: ["c"],
    logLevel: ["l"],
    require: ["r"],
    helpStyle: ["y"],
    // these are things we've added
    color: ["k"],
    commonjs: ["cjs", "p"],
    sequence: ["seq", "S"],
  },
  array: ["require", "sequence"],
  boolean: ["silent", "scripts", "future", "color", "commonjs"],
  configuration: {
    "strip-aliased": true,
  },
}

export const HELP_CONFIG = {
  help: "This text!",
  silent: "Silence superorganism output",
  scripts: "Log command text for script",
  config: `Config file to use (defaults to nearest package-scripts.js)`,
  logLevel: `The log level to use (error | warn | info | debug)`,
  require: `Module to preload`,
  helpStyle: `Choose the level of detail displayed by the help command`,
  color: `Render things with color`,
  commonjs: `For backwards compatibility with \`nps\`, use this with commonjs-based config files`,
  sequence: `Express multiple commands in sequence!`,
}

export const CONFIG_DEFAULTS = {
  scripts: true,
  future: false,
  helpStyle: "all",
  color: true,
  commonjs: false,
}
