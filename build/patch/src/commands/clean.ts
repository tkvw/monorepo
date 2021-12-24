import fse from 'fs-extra';
import path from 'path';

import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'clean',
  handler: async (args, config) => {
    const patchesFolder = path.resolve(args.cwd, config.folder);
    for (const patch of config.patches) {
      const { name } = patch;
      const patchFolder = path.resolve(patchesFolder, name);

      if (await fse.pathExists(patchFolder)) {
        await fse.remove(patchFolder);
      }
    }
  }
});
