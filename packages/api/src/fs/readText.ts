import { PathLike } from 'fs';
import fs from 'fs/promises';
export interface ReadTextOptions {
  encoding?: BufferEncoding;
}
export function readText(path: PathLike, { encoding = 'utf-8', ...options }: ReadTextOptions = {}) {
  return fs.readFile(path, {
    encoding,
    ...options
  });
}
