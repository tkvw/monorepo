import { PathLike } from 'fs';
import R from 'rambda';
import { FileApi, BaseFileApi } from './fileApi.js';

export class JsonFileApi<JsonData = any> extends BaseFileApi implements FileApi<JsonData>{
  data?: JsonData;
  spaces = 2;

  async read(){
    return this.readText().then(JSON.parse).then(x => x as JsonData);
  }
  async write(data: JsonData){
    return this.writeText(JSON.stringify(data,null,this.spaces));
  }  
  static sort = R.pipe(
    R.toPairs,
    R.sortBy(R.pipe(R.nth(0), R.defaultTo('zz'))),
    R.fromPairs
  ) as (json: Record<string,any>) => Record<string,any>;
}
