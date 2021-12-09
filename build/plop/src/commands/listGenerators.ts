import type { CommandArgs } from '../createRunCommand';
import { loadPlop } from '../loadPlop.js';

export const listGenerators = async (args: CommandArgs) => {
  const { api } = await loadPlop(args);
  const generators = api.getGeneratorList();
  console.log(`Found ${generators.length} generators: `);
  const message = api
    .getGeneratorList()
    .map((x) => `- ${x.name}${x.description ? ': ' + x.description : ''}`)
    .sort()
    .join('\n');
  console.log(message);
};
