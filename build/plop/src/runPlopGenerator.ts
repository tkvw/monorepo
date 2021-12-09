import { NodePlopAPI, PlopGenerator } from 'node-plop';
import debugFactory from 'debug';

const debug = debugFactory('tkvw:rush-templates:runPlopGenerator');
export interface PlopRunArgs {
  api: NodePlopAPI;
  args: string[];
  namedArgs: Record<string, any>;
}
export async function runPlopGenerator(generator: string, { api, args, namedArgs }: PlopRunArgs) {
  const plopGenerator = api.getGenerator(generator);
  if (!plopGenerator) throw new Error(`Generator ${generator} is not found, please use another`);
  plopGenerator.prompts ??= [];

  const { byPassArray, restArgs, restNamedArgs } = createPromptByPassArray(plopGenerator, args, namedArgs);

  if (debug.enabled) debug('byPassArray configured %O', { args,namedArgs,byPassArray, restArgs, restNamedArgs });

  const answers = await plopGenerator.runPrompts(byPassArray);

  await plopGenerator.runActions({
    ...(restArgs.length > 0 ? { _: restArgs } : undefined),
    ...restNamedArgs,
    ...answers
  });
}
export function createPromptByPassArray(
  generator: PlopGenerator,
  args: string[],
  namedArgs: Record<string, any>
) {
  let restArgs = [...args];
  const restNamedArgs: Record<string, any> = { ...namedArgs };

  // It's not possible to create a bypass for a function
  if (typeof generator.prompts === 'function' || !generator.prompts || generator.prompts.length === 0) {
    return {
      byPassArray: [],
      restArgs,
      restNamedArgs
    };
  }

  const byPassArray = generator.prompts
    .reduce<string[]>((acc, prompt) => {
      if (prompt.name && restNamedArgs[prompt.name]) {
        acc.push(restNamedArgs[prompt.name]);
      } else if (prompt.name && restArgs.length > 0) {
        const [head, ...remainder] = restArgs;
        acc.push(head);
        restArgs = remainder;
        restNamedArgs[prompt.name] = head;
      } else {
        acc.push("_");
      }
      return acc;
    }, []);
    
  return {
    byPassArray,
    restArgs,
    restNamedArgs
  };
}
