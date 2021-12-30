import fse from 'fs-extra';
import path from 'path';

import createExec from '../libs/createExec.js';
import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'commit',
  handler: async (args, config) => {
    const patchesFolder = args.patchDir;

    for (const { name } of config) {
      const patchFolder = path.resolve(patchesFolder, name);

      const git = createExec('git', {
        cwd: patchFolder
      });

      await git('add', '.');
      const patchDiff = await git('diff', 'HEAD');
      if (patchDiff === '') return;
      await fse.writeFile(path.join(patchesFolder, `${name}.patch`), patchDiff, {
        encoding: 'utf-8'
      });
    }
  }
});
