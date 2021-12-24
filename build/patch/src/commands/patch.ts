import fse from 'fs-extra';
import path from 'path';

import createExec from '../libs/createExec.js';
import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'patch',
  handler: async (args, config) => {
    const patchesFolder = path.resolve(args.cwd, config.folder);
    for (const patch of config.patches) {
      const { name } = patch;
      const patchFolder = path.resolve(patchesFolder, name);

      const git = createExec('git', {
        cwd: patchFolder
      });

      await git('add', '.');
      const patchDiff = await git('diff', '--no-prefix', 'HEAD');
      if (patchDiff === '') return;
      await fse.writeFile(path.join(patchesFolder, `${name}.patch`), patchDiff, {
        encoding: 'utf-8'
      });
    }
  }
});
