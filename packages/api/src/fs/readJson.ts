import { PathLike } from 'fs';

import { IReadTextOptions,readText } from './readText';

export interface IReadJsonOptions<JsonData> extends IReadTextOptions {
  parse?: (text: string) => JsonData;
}
export async function readJson<JsonData>(
  path: PathLike,
  { parse = JSON.parse,...options }: IReadJsonOptions<JsonData> = {}
) {
  const text = await readText(path, options);
  return parse(text) as JsonData;
}


