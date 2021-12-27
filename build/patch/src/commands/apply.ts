import { applyPatch, parsePatch } from 'diff';
import fse from 'fs-extra';
import parseDiff from "parse-diff"
import path from 'path';

import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'apply',
  handler: async (args, config) => {
    const patchesFolder = path.resolve(args.cwd, config.folder);
    const defaultSource = path.join(args.cwd, 'node_modules');

    for (const patch of config.patches) {
      const { name, source = defaultSource } = patch;
      const patchFolder = path.resolve(patchesFolder, name);

      if (!(await fse.pathExists(patchFolder))) continue;

      const patchedFolders = await fse.readdir(patchFolder);
      for(const patchedFolder of patchedFolders){
        if(await fse.pathExists(path.resolve(source,patchedFolder))){
          await fse.copy(
            path.resolve(patchFolder,patchedFolder),
            path.resolve(source,patchedFolder),
            {
              overwrite: true,
              recursive: true,
              dereference: true
            }
          );
        }
      }      
    }
  }
});
