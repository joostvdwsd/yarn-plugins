import { execCapture } from "./exec";

export async function checkGit() {
  return execCapture('git', ['--version']);
}

export async function currentBranch() {
  // azure devops lookup
  if (process.env.BUILD_SOURCEBRANCHNAME) {
    return process.env.BUILD_SOURCEBRANCHNAME
  }
  // get from git
  return (await execCapture('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).result.replace(/\n*$/, '');
}
