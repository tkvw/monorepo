import { RushConfiguration, RushConfigurationProject } from '@microsoft/rush-lib';
import { CustomActionFunction, NodePlopAPI } from 'node-plop';
import {CustomActionOptionsFactory} from "./types"

export interface Api{
  plop: (project: RushConfigurationProject) => Promise<NodePlopAPI>;
}

export interface UsingRushConfigOptions<Result> {
  startingFolder?: string;
  actionResult?: (results: Result) => Promise<string>;
  (configuration: RushConfiguration, api: Api):Promise<Result>;
}
export const usingRushConfig =
  <Result = any>(configure: CustomActionOptionsFactory<UsingRushConfigOptions<Result>>): CustomActionFunction =>
  async (answers, _, plop) => {
    const run = await configure(answers, plop);
    run.actionResult ??= async (result) => ""+result,
    run.startingFolder ??= process.cwd()
    const rushConfig = RushConfiguration.loadFromDefaultLocation({
      startingFolder: run.startingFolder
    });
    const api: Api = {
      plop: async (project) => plop.withBasePath(project.projectFolder)
    }
    const result = await run(rushConfig,api);
    return await run.actionResult(result);
  };
