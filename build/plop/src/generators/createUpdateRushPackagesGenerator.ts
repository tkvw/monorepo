import { NodePlopAPI, PlopGeneratorConfig } from 'node-plop';

import { rushApi, PackageJsonApi, PackageJson } from '../api/index.js';
import R from 'rambda';

export function createUpdateRushPackagesGenerator(api: NodePlopAPI): Partial<PlopGeneratorConfig> {
  return {
    prompts: [
      {
        name: 'selectedPackages',
        type: 'checkbox',
        choices: () =>
          rushApi(api.getDestBasePath()).then((rushConfig) =>
            Promise.all(
              rushConfig.projects.map((project) =>
              PackageJsonApi.create(project.projectFolder).then((packageJsonFile) =>
                  packageJsonFile.read().then((data) => ({
                    path: packageJsonFile.path,
                    data
                  }))
                )
              )
            ).then((choices) =>
              choices.map(({ path, data }) => ({
                checked: true,
                name: `${data.name}@${data.version}`,
                value: {
                  path,
                  data
                }
              }))
            )
          )
      },
      {
        name: 'packagesToUpdate',
        type: 'checkbox',
        choices: async (answers) => {
          const selectedPackages = answers.selectedPackages as { path: string; data: PackageJson }[];
          const packageDependencies = (p: PackageJson) => ({
            ...p.dependencies,
            ...p.devDependencies,
            ...p.peerDependencies
          });
          const usedIn = (name: string) => {
            const hasName = R.has(name);

            return selectedPackages
              .filter(({ data }) => hasName(packageDependencies(data)))
              .map(({ data }) => data.name);
          };
          const allDependencies = selectedPackages.reduce(
            (acc, { data }) => ({
              ...acc,
              ...packageDependencies(data)
            }),
            {} as Record<string, string>
          );

          const checkForUpdates = R.pipe(
            PackageJsonApi.excludeWorkspaceDependencies,
            PackageJsonApi.sort,
            PackageJsonApi.checkUpdates()
          );
          const updatedPackages = await checkForUpdates(allDependencies);

          return Object.keys(updatedPackages).map((packageName) => {
            const currentVersion = allDependencies[packageName];
            const nextVersion = updatedPackages[packageName];
            return {
              checked: true,
              name: `${packageName} from ${currentVersion} to ${nextVersion}, used in ${usedIn(
                packageName
              ).join(',')}`,
              value: [packageName, nextVersion]
            };
          });
        }
      }
    ],
    actions: [
      async ({ packagesToUpdate }) => {
        console.log(packagesToUpdate);
        return '';
      }
    ]
  };
}