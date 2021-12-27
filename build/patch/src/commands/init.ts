import fg from 'fast-glob';
import fse from 'fs-extra';
import path from 'path';

import createExec from '../libs/createExec.js';
import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'init',
  handler: async (args, config) => {
    const patchesFolder = path.resolve(args.cwd, config.folder);
    await fse.ensureDir(patchesFolder);
    const defaultSource = path.join(args.cwd, 'node_modules');
    for (const patch of config.patches) {
      const { name, globs = ['**/*'], source = defaultSource } = patch;
      const patchFolder = path.resolve(patchesFolder, name);

      if (await fse.pathExists(patchFolder)) {
        continue;
      }

      await fse.ensureDir(patchFolder);
      const files = await fg(globs, {
        cwd: source,
        dot: true,
        onlyFiles: true
      });
      for (const file of files) {
        const targetFile = path.join(patchFolder, file);
        if (await fse.pathExists(targetFile)) {
          continue; // Don't overwrite files, because this could be the patched variant already
        }
        await fse.ensureDir(path.dirname(targetFile));

        await fse.copyFile(path.resolve(source, file), targetFile);
      }
      const git = createExec('git', {
        cwd: patchFolder
      });

      await git('init');
      await git('config', '--local', 'user.name', 'patch-folder');
      await git('config', '--local', 'user.email', 'patch@pack.folder');

      await git('add', '.');
      await git('commit', '-am', '"initial commit"');

      const patchFile = path.join(patchesFolder, `${name}.patch`);
      if (await fse.pathExists(patchFile)) {
        await git('apply', patchFile);
      }
    }
  }
});
