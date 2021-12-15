import vscode from 'vscode';

import { lookupParentAsync } from '../internal/lookupParent';
import { IMatcher } from '../internal/matchers';

export default function registerPathCommand(
  commandName: string,
  matcher: IMatcher,
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(commandName, async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return '';

    return await lookupParentAsync(editor.document.uri, matcher);
  });
  context.subscriptions.push(disposable);
}
