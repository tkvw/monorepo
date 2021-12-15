import { PathLike } from 'fs';

import { IWriteTextOptions,writeText } from './writeText';

export interface IWriteJsonOptions<JsonData> extends IWriteTextOptions {
  stringify?: (data: JsonData) => Promise<string>;
}
export const PrettyJson = async <JsonData>(data: JsonData) => JSON.stringify(data, null, 2);

export async function writeJson<JsonData>(
  path: PathLike,
  data: JsonData,
  { stringify = PrettyJson, ...options }: IWriteJsonOptions<JsonData> = {}
) {
  const text = await stringify(data);
  return await writeText(path, text, options);
}
