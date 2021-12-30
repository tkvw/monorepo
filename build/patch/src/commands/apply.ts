import fse from 'fs-extra';
import path from 'path';

import createExec from '../libs/createExec.js';
import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'apply',
  handler: async (args, config) => {
    const patchesFolder = args.patchDir;
    const nodeModulesDir = path.join(args.cwd, 'node_modules');

    for(const {name,packages} of config){
      const patchFolder = path.join(patchesFolder,name);
      if(await fse.pathExists(patchFolder)) continue;

      await fse.ensureDir(patchFolder);

      for(const packageName of packages){
        const patchPackFolder = path.join(patchFolder,packageName);
        if(await fse.pathExists(patchPackFolder)) continue;

        // Copy the node_modules package to the patch package folder
        await fse.copy(
          path.resolve(nodeModulesDir,packageName),
          patchPackFolder,
          {
            dereference: true,
            recursive: true
          }
        );
      }
      const git = createExec('git', {
        cwd: patchFolder
      });

      await git('init');
      await git('config', '--local', 'user.name', 'patch-folder');
      await git('config', '--local', 'user.email', 'patch@pack.folder');

      await git('add', '.');
      await git('commit', '-am', '"initial commit"');


      const patchFile = path.join(patchesFolder,`${name}.patch`);
      if(await fse.pathExists(patchFile)){
        await git('apply', patchFile);
      }
    }
    for(const {name,packages} of config){
      const patchFolder = path.join(patchesFolder,name);
      if(!await fse.pathExists(patchFolder)) continue;

      for(const packageName of packages){
        const source = path.resolve(patchFolder,packageName);
        const destination = path.resolve(nodeModulesDir,packageName);
        await fse.copy(
          source,
          destination,
          {
            overwrite: true,
            recursive: true,
            dereference: true
          }
        );
      }
    }
  }
});
