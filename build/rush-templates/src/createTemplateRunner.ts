import { NodePlopAPI } from 'node-plop';
import rushLib, { RushConfiguration } from '@microsoft/rush-lib';
import plopApi from './plopApi.js';
import { getCwd } from './getCwd.js';

export interface ITemplateConfigContext {
  data: Record<string, any>;
  rush: RushConfiguration;
}
export interface ITemplateConfig {
  (plop: NodePlopAPI, context: ITemplateConfigContext): Promise<void>;
}
export interface ITemplateConfigMiddleware {
  (next: ITemplateConfig, rushConfig: RushConfiguration): ITemplateConfig;
}

export function createTemplateRunner(...midlewares: ITemplateConfigMiddleware[]) {
  return (cb: ITemplateConfig) => {
    const rushConfig = rushLib.RushConfiguration.loadFromDefaultLocation({
      startingFolder: getCwd()
    });

    cb = midlewares.reverse().reduce((acc, next) => next(acc, rushConfig), cb);

    return async (plop: NodePlopAPI) => {
      plopApi(plop);
      await cb(plop, {
        rush: rushConfig,
        data: {}
      });
    };
  };
}

export default createTemplateRunner();
