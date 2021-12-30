import fse from 'fs-extra';
import path from 'path';
import { IRunScriptOptions } from '@rushstack/heft';

const writePackageJson = async (outputDir: string, data: { type: string }) => {
  if (!(await fse.pathExists(outputDir))) return;
  const packageJsonPath = path.join(outputDir, 'package.json');

  return fse.writeFile(packageJsonPath, JSON.stringify(data, null, 2), {
    encoding: 'utf-8'
  });
};

export async function runAsync({ heftConfiguration, scriptOptions = {},scopedLogger }: IRunScriptOptions<unknown>) {
  const buildFolder = heftConfiguration.buildFolder;
  const outputDir = scriptOptions.out ?? 'lib';
  const commonCjsDir = path.join(buildFolder,outputDir, scriptOptions.commonCjsDir ?? 'cjs');
  await writePackageJson(commonCjsDir,{
    type: "commonjs"
  });
  const moduleDir = path.join(outputDir, scriptOptions.moduleDir ?? 'esm');  
  await writePackageJson(moduleDir,{
    type: "module"
  });
}