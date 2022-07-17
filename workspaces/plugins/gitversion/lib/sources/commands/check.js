"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitVersionCheckCommand = void 0;
const cli_1 = require("@yarnpkg/cli");
const core_1 = require("@yarnpkg/core");
const configuration_1 = require("../configuration");
class GitVersionCheckCommand extends cli_1.BaseCommand {
    async execute() {
        const configuration = await configuration_1.GitVersionConfiguration.fromContext(this.context);
        const { project } = await core_1.Project.find(configuration.yarnConfig, this.context.cwd);
        project.workspaces.forEach((child) => {
            console.log(child.locator.scope, child.locator.name, child.manifest.private, child.manifest.version);
        });
    }
}
exports.GitVersionCheckCommand = GitVersionCheckCommand;
GitVersionCheckCommand.paths = [
    [`gitversion`, `check`],
];
