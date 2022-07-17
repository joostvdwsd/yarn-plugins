"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitVersionRestoreCommand = void 0;
const cli_1 = require("@yarnpkg/cli");
const core_1 = require("@yarnpkg/core");
const configuration_1 = require("../configuration");
const types_1 = require("../types");
const exec_1 = require("../utils/exec");
const tags_1 = require("../utils/tags");
const workspace_1 = require("../utils/workspace");
const compareVersions = require('compare-versions');
class GitVersionRestoreCommand extends cli_1.BaseCommand {
    async execute() {
        const configuration = await configuration_1.GitVersionConfiguration.fromContext(this.context);
        const { project } = await core_1.Project.find(configuration.yarnConfig, this.context.cwd);
        if (configuration.independentVersioning) {
            const promises = project.workspaces.map((workspace) => this.updateWorkspaceFromGit(configuration.versionTagPrefix, configuration.versionBranch, workspace));
            Promise.all(promises);
        }
        else {
            const versionPromises = [
                this.determineCurrentGitVersion(configuration.versionTagPrefix, configuration.versionBranch),
                ...project.workspaces.map((workspace) => this.determineCurrentGitVersion(configuration.versionTagPrefix, configuration.versionBranch, workspace.locator))
            ];
            const versions = (await Promise.all(versionPromises)).sort(compareVersions).reverse();
            await (0, workspace_1.updateWorkspacesWithVersion)(project.workspaces, versions[0]);
        }
    }
    async updateWorkspaceFromGit(tagPrefix, versionBranch, workspace) {
        const currentGitVersion = await this.determineCurrentGitVersion(tagPrefix, versionBranch, workspace.locator);
        return (0, workspace_1.updateWorkspaceWithVersion)(workspace, currentGitVersion);
    }
    /**
     * Determines the latest release tag.
     * @param prerelease (optional) A pre-release suffix.
     * @returns the latest release found in the tag history
     */
    async determineCurrentGitVersion(defaultTagPrefix, versionBranch, childLocator) {
        // filter only tags for this prefix and major version if specified (start with "vNN.").
        const fullTagPrefix = (0, tags_1.tagPrefix)(defaultTagPrefix, childLocator);
        const prefixFilter = `${fullTagPrefix}*`;
        const listGitTags = [
            '-c',
            'versionsort.suffix=-',
            'tag',
            '--sort=-version:refname',
            '--list',
            prefixFilter,
        ];
        const stdout = (await (0, exec_1.execCapture)('git', listGitTags)).result;
        let tags = stdout.split('\n');
        const officialTags = tags.filter(x => new RegExp(`^${this.escapeRegExp(fullTagPrefix)}[0-9]+\.[0-9]+\.[0-9]+$`).test(x));
        // if "pre" is set, filter versions that end with "-PRE.ddd".
        if (versionBranch.branchType !== types_1.BranchType.MAIN) {
            const preReleaseTags = tags.filter(x => new RegExp(`${fullTagPrefix}[0-9]+\.[0-9]+\.[0-9]+-${this.escapeRegExp(versionBranch.name)}\.[0-9]+$`).test(x));
            if (preReleaseTags.length > 0) {
                tags = preReleaseTags;
            }
            else {
                tags = officialTags;
            }
        }
        else {
            tags = officialTags;
        }
        tags = tags.filter(x => x);
        // if a pre-release tag is used, then add it to the initial version
        let latestTag;
        if (tags.length > 0) {
            latestTag = tags[0];
        }
        else {
            latestTag = '0.0.0';
        }
        // remove tag prefix (if exists)
        let latestVersion = latestTag;
        const regexReplace = new RegExp(`^${this.escapeRegExp(fullTagPrefix)}`);
        latestVersion = latestVersion.replace(regexReplace, '');
        return latestVersion;
    }
    escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}
exports.GitVersionRestoreCommand = GitVersionRestoreCommand;
GitVersionRestoreCommand.paths = [
    [`gitversion`, `restore`],
];
