import { NodePlopAPI } from "node-plop";



export const createPlopConfig = (cb : (api: NodePlopAPI) => Promise<void>) => (api: NodePlopAPI) => cb(api);