import { PathLike } from 'fs';
import { PackageJson } from 'type-fest';
import { sortPackageJson } from 'sort-package-json';
import { run as ncu } from 'npm-check-updates';
import { readJson, ReadJsonOptions,writeJson, WriteJsonOptions } from '@tkvw/api/fs';


export interface PackageJsonArgs {}
export interface PackageJsonApi {
  read: (path: PathLike, options?: ReadJsonOptions<PackageJson>) => Promise<PackageJson>;
  write: (path: PathLike, data: PackageJson, options?: WriteJsonOptions<PackageJson>) => Promise<void>;
  sort: (data: PackageJson, options?: { sortOrder?: string[] }) => PackageJson;
  checkUpdates: (data: Record<string, string>) => Promise<Record<string, string>>;  
}

export const packageJson: PackageJsonApi = {
  read: (path, options) => readJson<PackageJson>(path, options),
  write: (path, data, options) => writeJson(path, data, options),
  sort: (data: PackageJson, options: { sortOrder?: string[] } = {}) => sortPackageJson(data, options),
  checkUpdates: async (dependencies: Record<string, string>) => {
    const updates = await ncu({
      packageData: {
        dependencies
      }
    });
    return updates as Record<string, string>;
  } 
};

export {PackageJson} ;

export default packageJson;
