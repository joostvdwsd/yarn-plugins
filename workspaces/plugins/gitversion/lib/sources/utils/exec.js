"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execCapture = void 0;
const child_process_1 = require("child_process");
async function execCapture(command, args, cwd) {
    return new Promise((resolve, reject) => {
        console.log('>>>', command, ...args);
        const child = (0, child_process_1.spawn)(command, args, {
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
                resolve({ code, result: stdOut });
            }
            else {
                reject(new Error(stdOut + stdErr));
            }
        });
    });
}
exports.execCapture = execCapture;
