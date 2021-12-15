import vscode from 'vscode';

import { getParent } from '../internal/lookupParent';
export interface IMatcher {
  (path: string, type: vscode.FileType, folder: vscode.Uri): Promise<string | false>;
}
export interface IPathMatcher {
  (path: string, folder: vscode.Uri): Promise<string | false>;
}
export const isDirectory =
  (matcher: IPathMatcher): IMatcher =>
  async (path, type, folder) =>
    type === vscode.FileType.Directory ? matcher(path, folder) : false;

export const isFile =
  (matcher: IPathMatcher): IMatcher =>
  async (path, type, folder) =>
    type === vscode.FileType.Directory ? matcher(path, folder) : false;

export const checkRegexPath = (
  expression: RegExp,
  transform: (uri: vscode.Uri) => string = (x) => x.fsPath
): IPathMatcher => {
  return async (path, folder) => {
    if (expression.test(path)) {
      const file = vscode.Uri.joinPath(folder, path);
      return transform(file);
    }
    return false;
  };
};
export const folderUp = (uri: vscode.Uri) => getParent(uri).fsPath;

export const ifFound =
  (matcher: IMatcher, cb: (value: string) => string): IMatcher =>
  async (path, type, folder) => {
    const result = await matcher(path, type, folder);
    if (result) {
      return cb(result);
    }
    return result;
  };
