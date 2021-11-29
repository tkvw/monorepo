import vscode from 'vscode';
import { TFileMatcher,TFilenameMatcher } from './types';



const matchFileType =
  (matchesType: (type: vscode.FileType) => boolean) =>
  (matchesName: TFilenameMatcher): TFileMatcher =>
  async (folder, name, type) =>
    matchesType(type) && (await matchesName(name, folder)) ? vscode.Uri.joinPath(folder, name) : false;

export const matchesDir = matchFileType((x) => x === vscode.FileType.Directory);
export const matchesFile = matchFileType((x) => x === vscode.FileType.File);

export const matchesName = (expression: RegExp) => async (name: string) => expression.test(name);
