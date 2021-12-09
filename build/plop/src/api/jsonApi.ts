import { PathLike } from 'fs';
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
  static sort = (data: Record<string,string>) => {
    const entries = Object.entries(data);
    return Object.fromEntries(entries.sort(([ak],[bk]) => ak < bk ? 1: -1));
  }
}
