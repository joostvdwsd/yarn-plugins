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

export async function tag(tagName: string) {
  return execCapture('git', ['tag', tagName]);
}

export async function addAndCommit(files: string[], message: string) {
  const addResponse = await execCapture('git', ['add', ...files]);
  console.log(addResponse.result);
  
  const commitResponse = await execCapture('git', ['commit', ...files, '-m', message]);
  console.log(commitResponse.result);  
}