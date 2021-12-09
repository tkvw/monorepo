import { createPlopConfig } from '@tkvw/plop';
import { createUpdateRushPackagesGenerator } from '@tkvw/plop/generators';
import { rushApi, PackageJsonApi } from '@tkvw/plop/api';

export default createPlopConfig(async (api) => {
  api.setGenerator('test', createUpdateRushPackagesGenerator(api));
  api.setGenerator('updatePackageJsons', {
    actions: [
      async () => {
        const rush = await rushApi(api.getDestBasePath());
        Promise.all(
          rush.projects.map(async (project) => {
            const packageJsonFile = await PackageJsonApi.create(project.projectFolder);
            await packageJsonFile.read();

            
          })
        );

        return '';
      }
    ]
  });
});
