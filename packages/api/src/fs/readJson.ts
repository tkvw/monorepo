import { PathLike } from 'fs';
import { readText, ReadTextOptions } from './readText.js';

export interface ReadJsonOptions<JsonData> extends ReadTextOptions {
  parse?: (text: string) => JsonData;
}
export async function readJson<JsonData>(
  path: PathLike,
  { parse = JSON.parse,...options }: ReadJsonOptions<JsonData> = {}
) {
  const text = await readText(path, options);
  return parse(text) as JsonData;
}


