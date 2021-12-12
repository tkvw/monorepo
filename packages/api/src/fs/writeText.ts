import { PathLike } from 'fs';
import fs from 'fs/promises';
export interface WriteTextOptions {
  encoding?: BufferEncoding;
}
export async function writeText(
  path: PathLike,
  text: string,
  { encoding = 'utf-8', ...options }: WriteTextOptions = {}
) {
  return await fs.writeFile(path, text, {
    encoding,
    ...options
  });
}
