import { PackageJson } from 'type-fest';
import { FileApiConstructor } from './fileApi.js';
import { JsonFileApi } from './jsonApi.js';
import { run as ncu } from 'npm-check-updates';
import path from 'path';
import fs from 'fs/promises';
import R from 'rambda';

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
  static excludeWorkspaceDependencies = R.pipe(
    R.toPairs,
    R.filter(
      R.pipe(
        R.nth(1),
        R.defaultTo('workspace:'),
        R.both(R.pipe(R.isNil, R.not), R.pipe(R.startsWith('workspace:'), R.not))
      ) as (value: [string, string]) => boolean
    ),
    R.fromPairs
  ) as (dependencies: Dependencies) => Dependencies;

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
}

