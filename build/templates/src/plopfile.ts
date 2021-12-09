import { createPlopConfig } from '@tkvw/plop';
import {
  createRushCommonPackageJsonGenerator,
  createUpdateRushPackagesGenerator
} from '@tkvw/plop/generators';

export default createPlopConfig(async (api) => {
  api.setGenerator('upgradePackages', createUpdateRushPackagesGenerator(api));
  api.setGenerator(
    'setCommonPackgeJson',
    createRushCommonPackageJsonGenerator(async (project) => ({
      author: 'Dennie de Lange',
      repository: {
        type: 'git',
        url: 'https://github.com/tkvw/monorepo.git',
        directory: `${project.projectRelativeFolder}`
      }
    }))
  );
});
