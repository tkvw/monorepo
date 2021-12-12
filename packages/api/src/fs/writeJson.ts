import { PathLike } from 'fs';
import { writeText, WriteTextOptions } from './writeText.js';

export interface WriteJsonOptions<JsonData> extends WriteTextOptions {
  stringify?: (data: JsonData) => Promise<string>;
}
export const PrettyJson = async <JsonData>(data: JsonData) => JSON.stringify(data, null, 2);

export async function writeJson<JsonData>(
  path: PathLike,
  data: JsonData,
  { stringify = PrettyJson, ...options }: WriteJsonOptions<JsonData> = {}
) {
  const text = await stringify(data);
  return await writeText(path, text, options);
}
