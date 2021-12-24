import { applyPatch, parsePatch } from 'diff';
import fse from 'fs-extra';
import path from 'path';

import { createCommand } from './createCommand.js';

export default createCommand({
  command: 'apply',
  handler: async (args, config) => {
    const patchesFolder = path.resolve(args.cwd, config.folder);
    const defaultSource = path.join(args.cwd, 'node_modules');

    for (const patch of config.patches) {
      const { name, source = defaultSource } = patch;
      const patchFile = path.resolve(patchesFolder, `${name}.patch`);
      const patchFolder = path.resolve(patchesFolder, name);

      if (!(await fse.pathExists(patchFile))) continue;

      const patchContent = await fse.readFile(patchFile, {
        encoding: 'utf-8'
      });
      const patches = parsePatch(patchContent, {
        strict: false
      });

      for (const diff of patches) {
        if (!diff.newFileName) continue;

        const sourceFile = path.join(patchFolder, diff.newFileName);
        const targetFile = path.join(source, diff.newFileName);

        if (await fse.pathExists(sourceFile)) {
          await fse.copyFile(sourceFile, targetFile);
        } else {
          const targetContent = (await fse.pathExists(targetFile))
            ? await fse.readFile(targetFile, {
                encoding: 'utf-8'
              })
            : '';
          const result = applyPatch(targetContent, diff);
          if (!result) {
            console.log(`failed to apply patch to ${targetFile}, maybe patched already?`);
            continue;
          }
          await fse.writeFile(targetFile, result, {
            encoding: 'utf-8'
          });
        }
      }
    }
  }
});
