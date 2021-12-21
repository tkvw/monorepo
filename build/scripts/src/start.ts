#!/usr/bin/env node

import { yargs } from '@tkvw/cli';

import { patchPackages } from './patchPackages.js';
import { syncPackageJson } from './syncPackageJson.js';
import { upgrade } from './upgrade.js';

await yargs(process.argv.slice(2))
  .scriptName('scripts')
  .command(patchPackages)
  .command(upgrade)
  .command(syncPackageJson)
  .help()
  .demandCommand()
  .parseAsync();
