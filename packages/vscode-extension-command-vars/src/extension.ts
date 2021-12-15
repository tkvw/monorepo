/*eslint no-void: ["error", { "allowAsStatement": true }]*/
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from 'vscode';

import registerPathCommand from "./commands/path";
import registerRelativeFile from "./commands/relativeFile";
import { checkRegexPath,folderUp,ifFound, IMatcher,isDirectory,isFile } from './internal/matchers';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const commandName = (name: string) => `extension.tkvw.${name}`;
  const pc = (name: string, matcher: IMatcher) => registerPathCommand(commandName(name),matcher,context);
  const rf = (name: string, matcher: IMatcher) => registerRelativeFile(commandName(name),matcher,context);

  const packageJsonFolder = isFile(checkRegexPath(/package.json/i,folderUp));
  pc("packageJsonFolder", packageJsonFolder);
  rf("packageJsonFolderRelativeFile",packageJsonFolder);

  const tsconfigFolder = isFile(checkRegexPath(/tsconfig.json/i,folderUp));
  pc("tsconfigFolder",tsconfigFolder);
  rf("tsconfigFolderRelativeFile",tsconfigFolder);
  
  const gitFolder = isDirectory(checkRegexPath(/.git/i,folderUp))
  pc("gitFolder",gitFolder);
  rf("gitFolderRelativeFile",gitFolder);
  
  const rushFolder = isFile(checkRegexPath(/rush.json/i,folderUp));
  pc("rushFolder", rushFolder);
  rf("rushFolderRelativeFile",rushFolder);

  const eslintFolder = isFile(checkRegexPath(/(.eslintrc|.eslintrc.json|.eslintrc.js|.eslintrc.cjs)/i,folderUp));
  pc("eslintFolder", eslintFolder);
  rf("eslintFolderRelativeFile",eslintFolder);

  const srcFolder = isDirectory(checkRegexPath(/(src|source|sources)/i));
  pc("srcFolder", srcFolder);
  rf("srcFolderRelativeFile",srcFolder);
  rf("srcFolderRelativeFileNoExtension",ifFound(srcFolder,path => path.indexOf('.')===-1? path: path.substring(0,path.lastIndexOf('.'))));


  const disposable = vscode.commands.registerCommand(commandName('commandVars'), async () => {
    const uri = vscode.window.activeTextEditor?.document.uri;
    if (!uri) {
      return await vscode.window.showInformationMessage('No file is opened, this is required');
    }
    const commands = ["packageJson","tsconfig","git","rush","eslint"].reduce<string[]>(
      (acc,item) => [...acc,`${item}Folder`,`${item}FolderRelativeFile`],[]
    ).map(commandName);

    let detail = '';
    for (const command of commands) {
      const result = await vscode.commands.executeCommand(command);
      detail += `command:${command}: ${result ? result : '-'}\n`;
    }
    return await vscode.window.showInformationMessage('Values for command variables\n\n' + detail);
  });
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
