"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitVersionBumpCommand = void 0;
const cli_1 = require("@yarnpkg/cli");
const core_1 = require("@yarnpkg/core");
const configuration_1 = require("../configuration");
const standard_version_1 = require("../utils/standard-version");
const tags_1 = require("../utils/tags");
const workspace_1 = require("../utils/workspace");
const restore_1 = require("./restore");
class GitVersionBumpCommand extends cli_1.BaseCommand {
    async execute() {
        // first execute restore
        const restoreCommand = new restore_1.GitVersionRestoreCommand();
        restoreCommand.context = this.context;
        restoreCommand.cli = this.cli;
        await restoreCommand.execute();
        const configuration = await configuration_1.GitVersionConfiguration.fromContext(this.context);
        const { project } = await core_1.Project.find(configuration.yarnConfig, this.context.cwd);
        if (configuration.independentVersioning) {
            throw new Error('Not implemented');
        }
        else {
            await (0, standard_version_1.bump)(configuration.versionBranch, (0, tags_1.tagPrefix)(configuration.versionTagPrefix), project.topLevelWorkspace.cwd);
            const newManifest = await core_1.Manifest.find(project.topLevelWorkspace.cwd);
            if (newManifest.version) {
                await (0, workspace_1.updateWorkspacesWithVersion)(project.workspaces, newManifest.version);
            }
        }
    }
}
exports.GitVersionBumpCommand = GitVersionBumpCommand;
GitVersionBumpCommand.paths = [
    [`gitversion`, `bump`],
];
