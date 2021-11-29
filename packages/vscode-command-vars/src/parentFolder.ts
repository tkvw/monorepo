import vscode from 'vscode';

export function parentFolder(folder: vscode.Uri) {
  return vscode.Uri.joinPath(folder, '../');
}
