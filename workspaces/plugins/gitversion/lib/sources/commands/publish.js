"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitVersionPublishCommand = void 0;
const cli_1 = require("@yarnpkg/cli");
const core_1 = require("@yarnpkg/core");
const configuration_1 = require("../configuration");
const types_1 = require("../types");
const path_1 = require("path");
const parseChangelog = require("changelog-parser");
class GitVersionPublishCommand extends cli_1.BaseCommand {
    async execute() {
        const configuration = await configuration_1.GitVersionConfiguration.fromContext(this.context);
        const { project } = await core_1.Project.find(configuration.yarnConfig, this.context.cwd);
        if (configuration.independentVersioning) {
            throw new Error('Not implemented');
        }
        else {
            const publicWorkspaces = project.workspaces.filter((workspace) => workspace.manifest.private === false);
            const publishCommands = publicWorkspaces.map((workspace) => {
                let releaseTagPostfix = [];
                if (configuration.versionBranch.branchType === types_1.BranchType.FEATURE || configuration.versionBranch.branchType === types_1.BranchType.PRERELEASE) {
                    releaseTagPostfix = ['--tag', configuration.versionBranch.name];
                }
                // execCapture('yarn', ['npm', 'publish', ...releaseTagPostfix], workspace.cwd);
            });
            await Promise.all(publishCommands);
            const changeLog = await parseChangelog({
                filePath: (0, path_1.join)(project.topLevelWorkspace.cwd, 'CHANGELOG.md'),
                removeMarkdown: false
            });
            const releasedVersion = project.topLevelWorkspace.manifest.version;
            const currentRelease = changeLog.versions.find((versionEntry) => versionEntry.version === releasedVersion);
            if (currentRelease) {
                await project.configuration.triggerHook(hooks => {
                    return hooks.afterPublish;
                }, project, project.topLevelWorkspace, currentRelease);
            }
        }
    }
}
exports.GitVersionPublishCommand = GitVersionPublishCommand;
GitVersionPublishCommand.paths = [
    [`gitversion`, `publish`],
];
