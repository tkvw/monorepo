import vscode from "vscode";

export function getParent(uri: vscode.Uri){
    return vscode.Uri.joinPath(uri,"../");
}

export async function lookupParentAsync(
    uri: vscode.Uri,
    matcher: (path:string,type: vscode.FileType,folder: vscode.Uri) => Promise<string|false>
): Promise<string|false>{
    const parent = getParent(uri);
    if(uri.fsPath === parent.fsPath) return false; // root matched

    const files = await vscode.workspace.fs.readDirectory(parent);
    for(const [path,type] of files){
        const match = await matcher(path,type,parent);
        if(match){
            return match;
        }
    }
    return lookupParentAsync(parent,matcher);
}