import { CustomActionFunction } from 'node-plop';
import path from 'path/posix';
import { PackageJson } from 'type-fest';
import fs from 'fs/promises';

import { CustomActionOptionsFactory } from './types';
export interface AddPackageJsonDataApi {
  write: (packagJson: PackageJson) => Promise<void>;
}
export interface AddPackageJsonDataOptions<Result=any> {
  projectFolder?: string;
  packageJsonFile?: string;
  actionResult?: (result: Result) => Promise<string>;
  read: (path: string) => Promise<PackageJson>;
  write: (path: string, data: PackageJson) => Promise<void>;
  (packageJson: PackageJson, api: AddPackageJsonDataApi): Promise<Result>;
}
export const addPackageJsonData =
  (configure: CustomActionOptionsFactory<AddPackageJsonDataOptions>): CustomActionFunction =>
  async (answers, _, plop) => {
      
    const run = await configure(answers, plop);
    
    run.packageJsonFile ??= 'package.json';
    run.projectFolder ??= plop.getDestBasePath();
    run.read ??= async (path: string) => {
      const data = await fs.readFile(path, {
        encoding: 'utf8'
      });
      return JSON.parse(data) as PackageJson;
    };
    run.write ??= (path: string, data: PackageJson) =>
      fs.writeFile(path, JSON.stringify(data, null, 2), {
        encoding: 'utf8'
      });
    run.actionResult??= async (value: any) => ""+value;

    const packageJsonPath = path.resolve(run.projectFolder, run.packageJsonFile);

    // Assert the file exists
    await fs.stat(packageJsonPath);

    const packageJson = await run.read(packageJsonPath);
    const api = {
      write: (data: PackageJson) => run.write(packageJsonPath,data)
    };
    const result = await run(packageJson,api);
    return await run.actionResult(result);
  };
