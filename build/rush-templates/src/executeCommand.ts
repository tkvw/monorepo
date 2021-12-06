import {
  CommandLineParser,
  CommandLineRemainder,
  CommandLineStringParameter,
  DynamicCommandLineParser
} from '@rushstack/ts-command-line';
import { getCwd } from './getCwd.js';
import nodePlop from 'node-plop';

export interface PlopCommandLineOptions {
  configFile?: string;
}

export async function executeCommand(options: PlopCommandLineOptions) {
  const commandLineParser = new DynamicCommandLineParser({
    toolFilename: 'plop',
    toolDescription: 'Generated templates using plop'
  });
  commandLineParser.defineStringParameter({
    parameterLongName: '--cwd',
    argumentName: 'FOLDER',
    description: 'Current working directory',
    defaultValue: getCwd()
  });
  commandLineParser.defineStringParameter({
    parameterLongName: '--config',
    parameterShortName: '-c',
    argumentName: 'CONFIG',
    description: 'The plop config file to use',
    defaultValue: options.configFile ?? 'plopfile.js'
  });

  commandLineParser.defineStringParameter({
    parameterLongName: '--generator',
    parameterShortName: '-g',
    argumentName: 'GENERATOR',
    description: 'The plop generator to invoke',
    required: true
  });
  commandLineParser.defineCommandLineRemainder({
    description: 'all remainders parameters'
  });
  await commandLineParser.execute();
  const plop = await nodePlop(commandLineParser.getStringParameter('--config').value, {
    destBasePath: commandLineParser.getStringParameter('--cwd').value,
    force: false
  });
  const generatorParam = commandLineParser.getStringParameter("--generator");  
  const generator = plop.getGenerator(generatorParam.value!);
  
  const data = generator.prompts? await generator.runPrompts(commandLineParser.remainder?.values as string[]): undefined;
  const result = await generator.runActions(data);
  
  return typeof result === "string"? result : "";  
}
