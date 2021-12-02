import assert from 'assert';
import { after } from 'mocha';
import path from "path";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests done!');
  });

  test('src folder', async () => {
    const srcFolder = await vscode.commands.executeCommand("extension.tkvw.srcFolder");
    assert.equal(srcFolder,path.join(__dirname,"../../src"));

  });
});