import fcg, { Options } from 'fast-glob';
export interface GlobOptions extends Options {
  source: string | string[];
}

export const globApi = ({ source, ...options }: GlobOptions) => fcg(source, options);
