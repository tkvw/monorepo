import yargs from 'yargs';
import { listGenerators } from './commands/listGenerators.js';

import { runGenerator } from './commands/runGenerator.js';

export interface CommandArgs {
  config: string;
  cwd: string;
  force: boolean;
  _: string[];
  [key: string]: any;
}

export const createRunCommand = ({
  config = "plopfile.ts",
  force = false,
  cwd = process.cwd()
}: Partial<CommandArgs> = {}) => async (...args:string[]) => {
  await yargs(args)
  .scriptName('template')
  .command('$0 <generator>', 'Run the plop generator', () => {}, runGenerator)
  .command('run', 'Run the plop generator', yargs => {
      yargs.option("generator",{
          type: "string"
      }).demandOption(["generator"]);
  }, runGenerator)
  .command('list',"List all generators",() => {},listGenerators)
  .option('cwd', {
    type: 'string',
    default: cwd
  })
  .option('config', {
    type: 'string',
    default: config
  })
  .option('force', {
    type: 'boolean',
    default: force
  })
  .help()
  .parseAsync();
}
