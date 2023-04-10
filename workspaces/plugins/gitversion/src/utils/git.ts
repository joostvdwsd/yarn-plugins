import { PortablePath } from "@yarnpkg/fslib";
import { Locator } from "@yarnpkg/core";
import { execUtils } from "@yarnpkg/core";
import { createHash } from 'crypto';

export async function checkGit(cwd: PortablePath) {
  return execUtils.execvp('git', ['--version'], { cwd });
}

export async function currentBranch(cwd: PortablePath) {
  // azure devops lookup
  if (process.env.BUILD_SOURCEBRANCHNAME) {
    return process.env.BUILD_SOURCEBRANCHNAME
  }
  // get from git
  return (await execUtils.execvp('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd, encoding: 'utf-8'})).stdout.replace(/\n*$/, '');
}

export async function tag(tagName: string, push: boolean, cwd: PortablePath) {
  await execUtils.execvp('git', ['tag', tagName], { cwd, encoding: 'utf-8'});

  if (push) {
    return execUtils.execvp('git', ['push', '--no-verify', 'origin', tagName], { cwd, encoding: 'utf-8'});
  }
}

export async function addAndCommit(files: string[], message: string, cwd: PortablePath) {
  const addResponse = await execUtils.execvp('git', ['add', ...files], { cwd, encoding: 'utf-8'});
  console.log(addResponse.stdout);
  
  const commitResponse = await execUtils.execvp('git', ['commit', ...files, '-m', message], { cwd, encoding: 'utf-8'});
  console.log(commitResponse.stdout);  
}

export function tagPrefix(globalTagPrefix: string, locator?: Locator) {
  let result = globalTagPrefix;
  if (locator) {
    if (locator.scope) {
      result += `@${locator.scope}/`
    }
    result += locator.name
    result += '-';
  }
  return result;
}

export async function getGitHead(workingDir: PortablePath) {
  try {
    const {stdout} = await execUtils.execvp(`git`, [`rev-parse`, `--revs-only`, `HEAD`], {cwd: workingDir});
    if (stdout.trim() === ``)
      return '';
    return stdout.trim();
  } catch {
    return '';
  }
}

export async function getGitStatusHash(workingDir: PortablePath) {
  try {
    const {stdout} = await execUtils.execvp(`git`, [`status`], {cwd: workingDir, encoding: 'utf-8'});
    const hash = createHash('sha1');
    hash.update(stdout);
    return hash.digest().toString('base64');
  } catch {
    return '';
  }
}