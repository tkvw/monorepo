import nodePlop from "node-plop";
import path from "path";
import type { CommandArgs } from "./createRunCommand";
import type { PlopRunArgs } from "./runPlopGenerator";

declare module "node-plop"{
    export interface NodePlopAPI{
        withBasePath: (path:string) => Promise<NodePlopAPI>;
    }
}

export async function loadPlop({
    $0,
    config,
    cwd,
    force,
    _,
    ...args
}: CommandArgs) : Promise<PlopRunArgs>{
    const loadApi = (destBasePath: string) => nodePlop(config,{
        destBasePath: path.resolve(destBasePath),
        force
    });
    
    const api = await loadApi(cwd);
    api.withBasePath = (path: string) => loadApi(path);
    
    return {
        api,        
        namedArgs: args,
        args: _
    }

}