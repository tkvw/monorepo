import {yargs} from "@tkvw/cli"
import { upgrade } from "./upgrade.js"
import { syncPackageJson } from "./syncPackageJson.js"

await yargs(process.argv.slice(2))
    .scriptName("scripts")
    .command(upgrade)
    .command(syncPackageJson)
    .help()
    .demandCommand()
    .parseAsync();