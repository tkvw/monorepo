import * as vscode from 'vscode';

export interface TFileMatcher {
  (folder: vscode.Uri, name: string, type: vscode.FileType): Promise<vscode.Uri | false>;
}

export interface TFilenameMatcher{
    (name: string,folder: vscode.Uri ): Promise<boolean>;
}

export interface TTransform<T = vscode.Uri>{
    (input: T):T
}