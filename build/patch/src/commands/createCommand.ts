import fse from 'fs-extra';
import yaml from 'yaml';
import { ArgumentsCamelCase, Argv, CommandModule } from 'yargs';

export interface IPatchOptions {
  cwd: string;
  config: string;
}
export interface IPatchConfig {
  folder: string;
  patches: {
    name: string;
    source?: string;
    issue?: string;
    globs?: string[];
  }[];
}
export interface IPatchCommand<Out extends IPatchOptions>
  extends Omit<CommandModule<IPatchOptions, Out>, 'handler'> {
  command: string | string[];
  handler: (args: ArgumentsCamelCase<Out>, config: IPatchConfig) => Promise<void>;
}

export function createCommand<Out extends IPatchOptions = IPatchOptions>(
  options: IPatchCommand<Out>
): CommandModule<IPatchOptions, Out> {
  return {
    builder: (x: Argv<IPatchOptions>) => x as Argv<Out>,
    describe: typeof options.command === 'string' ? options.command : options.command[0],
    ...options,
    handler: async (args: ArgumentsCamelCase<Out>) => {
      const config = yaml.parse(
        await fse.readFile(args.config, {
          encoding: 'utf-8'
        })
      );
      await options.handler(args, {
        folder: 'patches',
        ...config
      } as IPatchConfig);
    }
  };
}
