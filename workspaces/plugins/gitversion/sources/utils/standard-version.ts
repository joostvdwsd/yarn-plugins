import { PortablePath } from "@yarnpkg/fslib";
import { BranchType, GitVersionBranch } from "../types";
import { execCapture } from "./exec";

export async function bump(versionBranch: GitVersionBranch, tagPrefix: string, cwd: PortablePath) {
  if (versionBranch.branchType === BranchType.FEATURE) {

    return execCapture('yarn', ['standard-version', `--prerelease=${versionBranch.name}`, '-release-as=patch', '--path=.', '--skip.changelog', '--no-sign', '--skip.commit', '--skip.tag', `--tag-prefix='${tagPrefix}'`], cwd);
  } else if (versionBranch.branchType === BranchType.PRERELEASE) {
    return execCapture('yarn', ['standard-version', `--prerelease=${versionBranch.name}`, '--path=.', '--no-sign', '--skip.commit', '--skip.tag', `--tag-prefix='${tagPrefix}'`], cwd);
  } else if (versionBranch.branchType === BranchType.RELEASE || versionBranch.branchType === BranchType.MAIN) {
    return execCapture('yarn', ['standard-version', '--path=.', '--no-sign', '--skip.commit', '--skip.tag', `--tag-prefix='${tagPrefix}'`], cwd);
  } else {
    // ignore
  }
}

// standard-version --prerelease=$FEATURE_NAME --release-as=patch --path=. --skip.changelog --skip.commit --tag-prefix='${tagPrefix}'

// exec: `standard-version --prerelease=$PRERELEASE_NAME --path=. --skip.commit --tag-prefix='${tagPrefix}'`,
