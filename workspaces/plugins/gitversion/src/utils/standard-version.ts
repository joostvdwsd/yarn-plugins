import { PortablePath } from "@yarnpkg/fslib";
import { BranchType, GitVersionBranch } from "../types";
import { execCapture } from "./exec";

const DEFAULT_FLAGS = [
  '--no-sign', 
  '--skip.commit', 
  '--skip.tag'
]

export async function bump(versionBranch: GitVersionBranch, tagPrefix: string, cwd: PortablePath, execCwd: PortablePath, explicitVersion?: string) {

  const flags : string [] = [...DEFAULT_FLAGS];
  flags.push(`--path='${cwd}'`), 
  flags.push(`--tag-prefix='${tagPrefix}'`);
  flags.push(`--infile='${cwd}/CHANGELOG.md'`)

  if (explicitVersion) {
    flags.push(`--release-as='${explicitVersion}'`);
    flags.push(`--skip.bump`);
  }

  if (versionBranch.branchType === BranchType.FEATURE) {
    flags.push(
      `--prerelease=${versionBranch.name}`, 
      '--skip.changelog'
    );

    if (!explicitVersion) {
      flags.push('--release-as=patch')
    }

  } else if (versionBranch.branchType === BranchType.PRERELEASE || versionBranch.branchType === BranchType.RELEASE) {
    flags.push(
      `--prerelease=${versionBranch.name}`, 
    );    
  } else if (versionBranch.branchType === BranchType.UNKNOWN) {
    return;
  }

  const result = await execCapture('yarn', ['standard-version', ...flags], execCwd);
  console.log(result.result);
  return;
}
