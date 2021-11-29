/*eslint no-void: ["error", { "allowAsStatement": true }]*/
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from 'vscode';
import { matchesDir, matchesFile, matchesName } from './matchers';
import { parentFolder } from './parentFolder';
import { resolveFile } from './resolveFile';
import {TFileMatcher,TTransform} from "./types"

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const commands: [string,TFileMatcher,TTransform][]= [
    ['folders.packageJson', matchesFile(matchesName(/package.json/i)),parentFolder],
    ['folders.tsconfig', matchesFile(matchesName(/tsconfig.json/i)),parentFolder],
	['folders.git', matchesDir(matchesName(/.git/i)),parentFolder],
	['folders.rush', matchesFile(matchesName(/rush.json/i)),parentFolder],
	['folders.eslint', matchesFile(matchesName(/(.eslintrc|.eslintrc.json|.eslintrc.js|.eslintrc.cjs)/i)),parentFolder]
  ];

  commands.forEach((command) => {
    const [name, matcher, transformer] = command;
	const resolver = resolveFile(matcher)(transformer);

	const disposable = vscode.commands.registerCommand(name, async () => {
		const result = await resolver(vscode.window.activeTextEditor?.document.uri);
		if(!result) return undefined;
		return result.fsPath;
    });
	context.subscriptions.push(disposable);
  });
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
