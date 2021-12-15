import vscode from 'vscode';

import { lookupParentAsync } from '../internal/lookupParent';
import { IMatcher } from '../internal/matchers';

export default function registerRelativeFile(
  commandName: string,
  matcher: IMatcher,
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(commandName, async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return '';
    const uri = editor.document.uri;

    const folder = await lookupParentAsync(uri, matcher);
    if (folder) {
      return uri.fsPath.substring(folder.length);
    }
    return folder;
  });
  context.subscriptions.push(disposable);
}
