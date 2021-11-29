/*eslint no-void: ["error", { "allowAsStatement": true }]*/

import * as assert from 'assert';
import * as vscode from 'vscode';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it

// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  test('the commands', async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    assert.ok(workspaceFolders);
    const workspaceFolder = workspaceFolders[0];
    assert.ok(workspaceFolder);
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.joinPath(workspaceFolder.uri, 'src/test.js')
    );
	await vscode.window.showTextDocument(document);

	const expected = {
		packageJson: vscode.Uri.joinPath(workspaceFolder.uri,"./").fsPath,
		tsconfig: vscode.Uri.joinPath(workspaceFolder.uri,"../../../").fsPath,
		git: vscode.Uri.joinPath(workspaceFolder.uri,"../../../../../").fsPath,
		rush: vscode.Uri.joinPath(workspaceFolder.uri,"../../../../../").fsPath,
		eslint: vscode.Uri.joinPath(workspaceFolder.uri,"./").fsPath,
	}

	//await vscode.workspace.openTextDocument()
	const result = {
		packageJson: await vscode.commands.executeCommand('folders.packageJson'),
		tsconfig: await vscode.commands.executeCommand('folders.tsconfig'),
		git: await vscode.commands.executeCommand('folders.git'),
		rush: await vscode.commands.executeCommand('folders.rush'),
		eslint: await vscode.commands.executeCommand('folders.eslint'),
	}

    assert.deepStrictEqual(result, expected);
  });
});
