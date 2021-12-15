import { PathLike } from 'fs';
import fs from 'fs/promises';
export interface IReadTextOptions {
  encoding?: BufferEncoding;
}
export function readText(path: PathLike, { encoding = 'utf-8', ...options }: IReadTextOptions = {}) {
  return fs.readFile(path, {
    encoding,
    ...options
  });
}
