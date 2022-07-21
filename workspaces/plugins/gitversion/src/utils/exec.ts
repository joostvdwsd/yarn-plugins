import { spawn } from 'child_process';
import { PortablePath } from "@yarnpkg/fslib";

export async function execCapture(command: string, args: string[], cwd?: PortablePath) : Promise<{code: number | null, result: string}> {

  return new Promise((resolve, reject) => {
    console.log('>>>', command, ...args);
    const child = spawn(command, args, {
      cwd: cwd,
    });
  
    let stdOut = '';
    let stdErr = '';
  
    child.stdout.on('data', (data) => {
      stdOut += data.toString();
    });
  
    child.stderr.on('data', (data) => {
      stdErr += data.toString();
    });
  
    child.on('close', (code) => {
      if (code === 0) {
        resolve({code, result: stdOut});
      } else {
        reject(new Error(stdOut + stdErr));
      }
    });  
  })
}
