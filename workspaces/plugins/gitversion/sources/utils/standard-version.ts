import { PortablePath } from "@yarnpkg/fslib";
import { BranchType, GitVersionBranch } from "../types";
import { execCapture } from "./exec";

const DEFAULT_FLAGS = [
  '--path=.', 
  '--no-sign', 
  '--skip.commit', 
  '--skip.tag'
]

export async function bump(versionBranch: GitVersionBranch, tagPrefix: string, cwd: PortablePath, explicitVersion?: string) {

  const flags : string [] = DEFAULT_FLAGS;
  flags.push(`--tag-prefix='${tagPrefix}'`);

  if (explicitVersion) {
    flags.push(`--release-as=${explicitVersion}`);
  }

  if (versionBranch.branchType === BranchType.FEATURE) {
    flags.push(
      `--prerelease=${versionBranch.name}`, 
      '--skip.changelog'
    );

    if (!explicitVersion) {
      flags.push('--release-as=patch')
    }

  } else if (versionBranch.branchType === BranchType.PRERELEASE) {
    flags.push(
      `--prerelease=${versionBranch.name}`, 
    );    
  } else if (versionBranch.branchType === BranchType.UNKNOWN) {
    return;
  }

  return execCapture('yarn', ['standard-version', ...flags], cwd);
}
