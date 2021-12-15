import { IReadJsonOptions, IWriteJsonOptions,readJson, writeJson } from '@tkvw/api/fs';
import { PathLike } from 'fs';
import { run as ncu } from 'npm-check-updates';
import { sortPackageJson } from 'sort-package-json';
import { PackageJson } from 'type-fest';

export interface IPackageJsonArgs {}
export interface IPackageJsonApi {
  read: (path: PathLike, options?: IReadJsonOptions<PackageJson>) => Promise<PackageJson>;
  write: (path: PathLike, data: PackageJson, options?: IWriteJsonOptions<PackageJson>) => Promise<void>;
  sort: (data: PackageJson, options?: { sortOrder?: string[] }) => PackageJson;
  checkUpdates: (data: Record<string, string>) => Promise<Record<string, string>>;
}

export const packageJson: IPackageJsonApi = {
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

export { PackageJson };

export default packageJson;
