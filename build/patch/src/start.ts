#!/usr/bin/env node
import { findUp } from 'find-up';
import path from 'path';
import yargs from 'yargs';

import applyCommand from './commands/apply.js';
import cleanCommand from './commands/clean.js';
import commitCommand from './commands/commit.js';

const { cwd } = yargs(process.argv.slice(2))
  .option('cwd', {
    default: process.cwd(),
    type: 'string'
  })
  .help(false)
  .version(false)
  .parseSync();

const defaultFile: string | undefined = await findUp(['patchfile.yml', 'patchfile.yaml'], {
  cwd
});

await yargs(process.argv.slice(2))
  .scriptName('patch')
  .option('cwd', {
    describe: 'current workdirectory',
    type: 'string',
    default: process.cwd()
  })
  .option('config', {
    describe: 'config file to use',
    type: 'string',
    default: defaultFile
  })
  .option('patchDir', {
    describe: 'Directory where to patch',
    type: 'string',
    default: path.join(cwd,"patches")
  })
  .demandOption('config')
  .demandCommand()
  .command(applyCommand)
  .command(cleanCommand)
  .command(commitCommand)
  .parseAsync();
