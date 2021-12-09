import type { CommandArgs } from "../createRunCommand";
import {loadPlop} from "../loadPlop.js"
import { runPlopGenerator } from "../runPlopGenerator.js";


export interface IRunGeneratorArgs extends CommandArgs{
    generator: string;
}

export const runGenerator = async ({generator,...commandArgs}: IRunGeneratorArgs) => {
    const plopArgs = await loadPlop(commandArgs);
    await runPlopGenerator(generator,plopArgs);    
}