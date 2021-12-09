import { NodePlopAPI, PlopGeneratorConfig } from 'node-plop';

import { RushConfigurationProject } from '@microsoft/rush-lib';
import { rushApi, PackageJsonApi, PackageJson } from '../api/index.js';

export function createRushCommonPackageJsonGenerator(
  cb: (project: RushConfigurationProject, data: PackageJson) => Promise<Partial<PackageJson>>
): Partial<PlopGeneratorConfig> {
  return {
    actions: [
      async (_,__,api) => {
        const rush = await rushApi(api.getDestBasePath());
        await Promise.all(
          rush.projects.map(async (project) => {
            const packageJsonFile = await PackageJsonApi.create(project.projectFolder);
            const data = await packageJsonFile.read();
            const commonPackageJsonData = await cb(project,data);

            const diffEntries = Object.entries(commonPackageJsonData).filter(([key,value]) => data[key as keyof typeof data] !== value);
            if(diffEntries.length>0){

              const nextData = {
                ...data,
                ...commonPackageJsonData
              }

              const sorted = PackageJsonApi.sortPackageJson(nextData);
              packageJsonFile.write(sorted);
            }
          })
        );

        return 'finished';
      }
    ]
  }
}
