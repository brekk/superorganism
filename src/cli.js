import { fork } from "fluture"
import { runner } from "./runner"

fork(console.warn)(console.log)(runner(process.argv.slice(2)))
