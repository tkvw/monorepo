import { PathLike } from 'fs';
import fs from 'fs/promises';

export const readFileAsync = async (
  path: PathLike,
  options?: {
    encoding?: BufferEncoding;
  }
) =>
  fs.readFile(path, {
    encoding: 'utf8',
    ...options
  });
