"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentBranch = exports.checkGit = void 0;
const exec_1 = require("./exec");
async function checkGit() {
    return (0, exec_1.execCapture)('git', ['--version']);
}
exports.checkGit = checkGit;
async function currentBranch() {
    // azure devops lookup
    if (process.env.BUILD_SOURCEBRANCHNAME) {
        return process.env.BUILD_SOURCEBRANCHNAME;
    }
    // get from git
    return (await (0, exec_1.execCapture)('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).result.replace(/\n*$/, '');
}
exports.currentBranch = currentBranch;
