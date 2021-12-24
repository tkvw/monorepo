import { exec, ProcessEnvOptions } from 'child_process';

export default function createExec(cmd: string, options?: ProcessEnvOptions) {
  return (...args: string[]) =>
    new Promise((resolve, reject) => {
      exec([cmd, ...args].join(' '), options, (err, stdout, stderr) => {
        if (err) {
          return reject(err);
        }
        resolve(stdout);
      });
    });
}
