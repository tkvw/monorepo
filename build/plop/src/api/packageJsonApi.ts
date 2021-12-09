import { PackageJson } from 'type-fest';
import { FileApiConstructor } from './fileApi.js';
import { JsonFileApi } from './jsonApi.js';
import { run as ncu } from 'npm-check-updates';
import path from 'path';
import fs from 'fs/promises';
import { sortPackageJson } from 'sort-package-json';

export { PackageJson };

export type Dependencies = Record<string, string>;

export class PackageJsonApi extends JsonFileApi<PackageJson> {
  static checkUpdates = () => (dependencies: Dependencies) => {
    return ncu({
      packageData: {
        dependencies
      }
    }).then((x) => x as Record<string, string>);
  };
  static excludeWorkspaceDependencies = (dependencies: Dependencies) => {
    const excludeVersion = "workspace:";
    const entries = Object.entries(dependencies);
    const entriesExcludingWorkspaceVersions = entries.filter(kv => !kv[1].startsWith(excludeVersion));
    return Object.fromEntries(entriesExcludingWorkspaceVersions);
  }  

  static create = async (
    file: string,
    {
      packageJsonFile = 'package.json',
      ...options
    }: Omit<FileApiConstructor, 'path'> & {
      packageJsonFile?: string;
    } = {}
  ) => {
    const fileStat = await fs.stat(file);
    return new PackageJsonApi({
      ...options,
      path: fileStat.isFile() ? file : path.resolve(file, packageJsonFile)
    });
  };
  static sortPackageJson = (data: PackageJson) => sortPackageJson(data);
}

