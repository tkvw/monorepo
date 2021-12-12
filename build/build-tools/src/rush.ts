import { RushConfiguration } from '@microsoft/rush-lib';
import path from 'path';
import { packageJson, PackageJson } from './packageJson.js';

interface RushConfigOptions {
  startingFolder?: string;
  verbose?: boolean;
}
export const rushConfig = (options: RushConfigOptions = {}) => {
  const rushConfigFile = RushConfiguration.tryFindRushJsonLocation(options);
  if (!rushConfigFile)
    throw new Error('Rush configuration not found, is the command executed from a rush repo?');
  return RushConfiguration.loadFromConfigurationFile(rushConfigFile);
};
export const getRushPackages = async (config: RushConfiguration) => {
  return Promise.all(
    config.projects.map(async (project) => {
      const packageJsonPath = path.resolve(project.projectFolder, 'package.json');
      const data = await packageJson.read(packageJsonPath);
      return {
        path: packageJsonPath,
        data
      };
    })
  );
};

export interface RushUpdates {
  [name: string]: {
    current: string;
    latest: string;
    usedIn: string[];
  };
}

export const getRushUpdateableDependencies = async (config: RushConfiguration) => {
  const packages = await getRushPackages(config);
  const packageDependencies = (p: PackageJson) => ({
    ...p.dependencies,
    ...p.devDependencies,
    ...p.peerDependencies
  });
  const dependencies = packages.reduce(
    (acc, { data }) => ({
      ...acc,
      ...packageDependencies(data)
    }),
    {} as Record<string, string>
  );
  const usedIn = (name: string) => {
    return packages
      .filter(({ data }) => Object.keys(packageDependencies(data!)).includes(name))
      .map(({ data }) => data!.name!);
  };
  const updates = await packageJson.checkUpdates(excludeWorkspaceDependencies(dependencies));
  return Object.keys(updates).reduce((acc, name) => {
    acc[name] = {
      current: dependencies[name],
      latest: updates[name],
      usedIn: usedIn(name)
    };
    return acc;
  }, {} as RushUpdates);
};

export const updateRushPackages = async (config: RushConfiguration, dependencies: RushUpdates) => {
  const updateDependencies = (current: Record<string, string>) =>
    Object.keys(dependencies).reduce((acc, item) => {
      if (current[item]) {
        current[item] = dependencies[item].latest;
      }
      return current;
    }, current);
  const packages = await getRushPackages(config);
  await Promise.all(
    packages.map(({ path, data: { dependencies, devDependencies, peerDependencies, ...rest } }) => {
      if (dependencies) dependencies = updateDependencies(dependencies);
      if (devDependencies) devDependencies = updateDependencies(devDependencies);
      if (peerDependencies) peerDependencies = updateDependencies(peerDependencies);

      const next = {
        ...rest,
        ...(dependencies ? { dependencies } : undefined),
        ...(devDependencies ? { devDependencies } : undefined),
        ...(peerDependencies ? { peerDependencies } : undefined)
      };
      packageJson.write(path, packageJson.sort(next));
    })
  );
};

export const excludeWorkspaceDependencies = (dependencies: Record<string, string>) => {
  const excludeVersion = 'workspace:';
  const entries = Object.entries(dependencies);
  const entriesExcludingWorkspaceVersions = entries.filter((kv) => !kv[1].startsWith(excludeVersion));
  return Object.fromEntries(entriesExcludingWorkspaceVersions);
};
