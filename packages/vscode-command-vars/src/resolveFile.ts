import vscode from 'vscode';
import { TFileMatcher, TTransform } from './types';
import { parentFolder } from './parentFolder';

export const resolveFile = (matcher: TFileMatcher) => (transform: TTransform) => 
  async (file?: vscode.Uri): Promise<vscode.Uri | false> => {
    if (!file) return false;

    let previous = undefined;
    while (file.path !== '') {
      file = parentFolder(file);
      if (file.path === previous) return false;

      const fileOptions = await vscode.workspace.fs.readDirectory(file);
      for (const [path, type] of fileOptions) {
        const result = await matcher(file, path, type);
        if (false !== result) {
          return transform(result);
        }
      }
      previous = file.path;
    }
    return false;
  };
