import { PathLike } from 'fs';
import fs from 'fs/promises';
export interface IWriteTextOptions {
  encoding?: BufferEncoding;
}
export async function writeText(
  path: PathLike,
  text: string,
  { encoding = 'utf-8', ...options }: IWriteTextOptions = {}
) {
  return await fs.writeFile(path, text, {
    encoding,
    ...options
  });
}
