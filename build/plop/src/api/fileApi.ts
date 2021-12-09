import { PathLike } from 'fs';
import fs from 'fs/promises';
import { readFileAsync } from '../utils/readFileAsync.js';

export interface FileApiConstructor {
  encoding?: BufferEncoding;
  path: PathLike;
}
export interface FileApi<TData>{
  data?: TData;
  read(): Promise<TData>;
  write(data: TData): Promise<void>;
}

export abstract class BaseFileApi {
  public readonly path: PathLike;
  public readonly encoding: BufferEncoding;
  constructor({ encoding = 'utf-8', path }: FileApiConstructor) {
    this.encoding = encoding;
    this.path = path;
  }
  protected readText(){
    return readFileAsync(this.path, this)
  }
  protected writeText(data: string){
    return fs.writeFile(this.path, data, {
      encoding: this.encoding
    });
  }  
}

export class TextFileApi extends BaseFileApi implements FileApi<string>{
  data?: string;
  read(): Promise<string> {
    return this.readText().then(x => {
      this.data=x;
      return x;
    })
  }
  write(data: string): Promise<void> {
    return this.writeText(data)
      .then(() => {
        this.data=data;
      });
  }

}
