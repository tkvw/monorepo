# Visual Studio Command Variables

Just some sanity command variables for use when developing inside a monorepo.

- `folder.packageJson`: the folder where `package.json` is located.
- `folder.tsconfig`: the folder where `tsconfig.json` is located.
- `folder.git`: the folder where `.git` is located.
- `folder.rush`: the folder where `rush.json` is located.
- `folder.eslint`: the folder where `eslint.rc` is located.
- `fileTo.packageJson`: the absolute path to the current file from the folder where `package.json` is located.
- `fileTo.tsconfig`: the absolute path to the current file from the folder where `tsconfig.json` is located.
- `fileTo.git`: the absolute path to the current file from the folder where `.git` is located.
- `fileTo.rush`: the absolute path to the current file from the folder where `rush.json` is located.
- `fileTo.eslint`: the absolute path to the current file from the folder where `.eslintrc` is located.

## Usage

An example `launch.json`:
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug current file",
      "type": "node",
      "args": ["${command:fileTo.packageJson}"],
      "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
      "cwd":"${command:folders.packageJson}",
      "request": "launch",
      "protocol": "inspector",
    }
  ]
}
```