import vscode from 'vscode';
import { lookupParentAsync } from '../internal/lookupParent.js';
import { IMatcher } from '../internal/matchers.js';

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
