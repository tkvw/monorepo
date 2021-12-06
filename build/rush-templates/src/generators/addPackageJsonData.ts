import { RushConfigurationProject } from '@microsoft/rush-lib';
import { ITemplateConfigContext, ITemplateConfigMiddleware } from '../createTemplateRunner.js';
import { PackageJson } from 'type-fest';
import fs from 'fs/promises';
import path from 'path';
import { isEqual, merge as _merge } from 'lodash-es';

export interface IMutationConfig {
  data:
    | Partial<PackageJson>
    | ((project: RushConfigurationProject, context: ITemplateConfigContext) => Promise<Partial<PackageJson>>);
  generator?: string;
  merge?: (original: PackageJson, partial: Partial<PackageJson>) => PackageJson;
}
export const addPackageJsonData =
  ({
    data,
    generator = 'updatePackageJsonData',
    merge = (original, partial) => _merge({},original, partial)
  }: IMutationConfig): ITemplateConfigMiddleware =>
  (next, rushConfig) =>
  async (plop, context) => {
    plop.setGenerator(generator, {
      actions: [
        async () => {
          const getPackageJsonPath = (project: RushConfigurationProject) =>
            path.resolve(project.projectFolder, 'package.json');
          const readPackageJson = async (project: RushConfigurationProject) => {
            const packageJsonPath = getPackageJsonPath(project);

            const data = await fs.readFile(packageJsonPath, {
              encoding: 'utf8'
            });
            return JSON.parse(data) as PackageJson;
          };

          for (const project of rushConfig.projects) {
            const packageJsonData = await readPackageJson(project);

            const nextPackageJsonData = merge(
              packageJsonData,
              typeof data === 'function' ? await data(project, context) : data
            );

            if (!isEqual(packageJsonData, nextPackageJsonData)) {                
              console.log(`Updating ${getPackageJsonPath(project)}`);
              await fs.writeFile(getPackageJsonPath(project), JSON.stringify(nextPackageJsonData, null, 2), {
                encoding: 'utf8'
              });
            }
          }
          return '';
        }
      ]
    });
    await next(plop, context);
  };
