import { packageJson, rushConfig } from '@tkvw/build-tools';
import { yargs } from '@tkvw/cli';
import path from 'path';

export const patchPackages: yargs.CommandModule = {
  command: 'patchPackages',
  describe: 'Patches packages to support this repository',
  handler: async () => {
    const rush = rushConfig();
    console.log("Patching apollo client package json exports, because of https://github.com/apollographql/apollo-client/issues/8218");
    const apolloClientPackageJson = path.resolve(
      rush.rushJsonFolder,
      'build/scripts/node_modules/@apollo/client/package.json'
    );
    const result = await packageJson.read(apolloClientPackageJson);
    result.exports = {
      '.': {
        node: './main.cjs',
        default: './index.js'
      },
      './core': {
        node: './core/core.cjs',
        default: './core/index.js'
      },
      './link/http': {
        node: './link/http/http.cjs',
        default: './link/http/index.js'
      },
      './package.json': './package.json'
    };
    await packageJson.write(apolloClientPackageJson,result);
    
  }
};
