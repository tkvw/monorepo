import { rushConfig, getRushUpdateableDependencies, updateRushPackages } from '@tkvw/build-tools';
import { inquirer, table, yargs } from '@tkvw/cli';

export const upgrade: yargs.CommandModule<
  {},
  { ci: boolean; force: boolean; startingFolder?: string; verbose: boolean }
> = {
  command: 'upgrade',
  describe: 'Upgrade all packages in this rush repository',
  builder: {
    startingFolder: {
      type: 'string'
    },
    ci: {
      type: 'boolean',
      description: 'Implies --force'
    },
    force: {
      type: 'boolean'
    },
    verbose: {
      type: 'boolean'
    }
  },
  handler: async ({ ci, force, startingFolder, verbose }) => {
    const rush = rushConfig({ startingFolder, verbose });
    const updateableDependencies = await getRushUpdateableDependencies(rush);

    if (!ci || force) {
      const tableHeaders = ['package', 'current', 'latest', 'usedIn'];
      const tableData = Object.entries(updateableDependencies).reduce((acc, [key, value]) => {
        acc.push([key, value.current, value.latest, value.usedIn.join(', ')]);
        return acc;
      }, [] as string[][]);

      console.log(
        table([tableHeaders, ...tableData], {
          header: {
            content: `Found ${Object.keys(updateableDependencies).length} packages to update`
          },
          columns: {
            3: {
              width: 50
            }
          }
        })
      );
      const { confirmed } = await inquirer.prompt({
        name: 'confirmed',
        message: `Continue updating packages?`,
        type: 'confirm'
      });
      if (!confirmed) {
        return;
      }
    }

    await updateRushPackages(rush, updateableDependencies);

    console.log('Finished updating packages');
  }
};
