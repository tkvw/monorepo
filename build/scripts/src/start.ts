#!/usr/bin/env node

import { yargs } from '@tkvw/cli';

import { syncPackageJson } from './syncPackageJson';
import { upgrade } from './upgrade';

await yargs(process.argv.slice(2))
  .scriptName('scripts')
  .command(upgrade)
  .command(syncPackageJson)
  .help()
  .demandCommand()
  .parseAsync();
