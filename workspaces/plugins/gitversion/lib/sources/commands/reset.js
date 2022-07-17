"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitVersionResetCommand = void 0;
const cli_1 = require("@yarnpkg/cli");
const core_1 = require("@yarnpkg/core");
const workspace_1 = require("../utils/workspace");
const DEFAULT_REPO_VERSION = '0.0.0';
class GitVersionResetCommand extends cli_1.BaseCommand {
    async execute() {
        const configuration = await core_1.Configuration.find(this.context.cwd, this.context.plugins);
        const { project } = await core_1.Project.find(configuration, this.context.cwd);
        await (0, workspace_1.updateWorkspacesWithVersion)(project.workspaces, DEFAULT_REPO_VERSION);
    }
}
exports.GitVersionResetCommand = GitVersionResetCommand;
GitVersionResetCommand.paths = [
    [`gitversion`, `reset`],
];
