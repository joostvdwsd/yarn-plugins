"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bump = void 0;
const types_1 = require("../types");
const exec_1 = require("./exec");
async function bump(versionBranch, tagPrefix, cwd) {
    if (versionBranch.branchType === types_1.BranchType.FEATURE) {
        return (0, exec_1.execCapture)('yarn', ['standard-version', `--prerelease=${versionBranch.name}`, '-release-as=patch', '--path=.', '--skip.changelog', '--no-sign', '--skip.commit', `--tag-prefix='${tagPrefix}'`], cwd);
    }
    else if (versionBranch.branchType === types_1.BranchType.PRERELEASE) {
        return (0, exec_1.execCapture)('yarn', ['standard-version', `--prerelease=${versionBranch.name}`, '--path=.', '--no-sign', '--skip.commit', `--tag-prefix='${tagPrefix}'`], cwd);
    }
    else if (versionBranch.branchType === types_1.BranchType.RELEASE || versionBranch.branchType === types_1.BranchType.MAIN) {
        return (0, exec_1.execCapture)('yarn', ['standard-version', '--path=.', '--no-sign', '--skip.commit', `--tag-prefix='${tagPrefix}'`], cwd);
    }
    else {
        // ignore
    }
}
exports.bump = bump;
// standard-version --prerelease=$FEATURE_NAME --release-as=patch --path=. --skip.changelog --skip.commit --tag-prefix='${tagPrefix}'
// exec: `standard-version --prerelease=$PRERELEASE_NAME --path=. --skip.commit --tag-prefix='${tagPrefix}'`,
