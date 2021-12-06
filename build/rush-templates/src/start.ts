import { executeCommand,PlopCommandLineOptions } from "./executeCommand.js";

export default function main(options: PlopCommandLineOptions = {}){
    return executeCommand(options).catch(console.error);
}