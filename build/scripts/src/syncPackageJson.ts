import { rushConfig, packageJson } from '@tkvw/build-tools';
import { yargs } from '@tkvw/cli';
import path from 'path';

export const syncPackageJson: yargs.CommandModule = {
  command: 'syncPackageJson',
  describe: 'Synchronize all package jsons to include same values',
  handler: async () => {
    const rush = rushConfig();
    await Promise.all(
      rush.projects.map(async (project) => {
        const packageJsonPath = path.resolve(project.projectFolder, 'package.json');
        const packageJsonData = await packageJson.read(packageJsonPath);
        const nextPackageJsonData = packageJson.sort({
          ...packageJsonData,
          author: 'Dennie de Lange'
        });
        await packageJson.write(packageJsonPath, nextPackageJsonData);
      })
    );
  }
};
