import { BaseCommand } from "@yarnpkg/cli";
import { Locator, MessageName, Project, Report, Workspace } from "@yarnpkg/core";
import { BranchType, GitVersionBranch } from "../types";
import { updateWorkspacesVersion, updateWorkspaceVersion } from "../utils/workspace";
import { runStep } from "../utils/report";
import { execUtils } from "@yarnpkg/core";
import { tagPrefix } from "../utils";
const compareVersions = require('compare-versions');

export class GitVersionRestoreCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `restore`],
  ];

  async execute() {
    await runStep('Restore versions from git tags', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }
    
      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        const promises = project.workspaces.map((workspace) => this.updateWorkspaceFromGit(configuration.versionTagPrefix, configuration.versionBranch, workspace, report))
        Promise.all(promises);  
      } else {
        const versionPromises = [
          this.determineCurrentGitVersion(configuration.versionTagPrefix, configuration.versionBranch, project),
          ...project.workspaces.map((workspace) => this.determineCurrentGitVersion(configuration.versionTagPrefix, configuration.versionBranch, project, workspace.locator))
        ];
        const versions = (await Promise.all(versionPromises)).sort(compareVersions).reverse();
        
        await updateWorkspacesVersion(project.workspaces, versions[0], report)
      }
    });
  }

  async updateWorkspaceFromGit(tagPrefix: string, versionBranch: GitVersionBranch, workspace: Workspace, report: Report) {
    const currentGitVersion = await this.determineCurrentGitVersion(tagPrefix, versionBranch, workspace.project, workspace.locator)
    return updateWorkspaceVersion(workspace, currentGitVersion, report);
  }

  /**
   * Determines the latest release tag.
   * @param prerelease (optional) A pre-release suffix.
   * @returns the latest release found in the tag history
   */
  async determineCurrentGitVersion(defaultTagPrefix: string, versionBranch: GitVersionBranch, project: Project, childLocator?: Locator): Promise<string> {

    // filter only tags for this prefix and major version if specified (start with "vNN.").

    const fullTagPrefix =  tagPrefix(defaultTagPrefix, childLocator);

    const prefixFilter = `${fullTagPrefix}*`;

    const listGitTags = [
      '-c', 
      'versionsort.suffix=-', // makes sure pre-release versions are listed after the primary version
      'tag',
      '--sort=-version:refname', // sort as versions and not lexicographically
      '--list',
      prefixFilter,
    ];

    const stdout = (await execUtils.execvp('git', listGitTags, { encoding: 'utf8', cwd: project.cwd })).stdout;

    let tags = stdout.split('\n');
    const officialTags = tags.filter(x => new RegExp(`^${this.escapeRegExp(fullTagPrefix)}[0-9]+\.[0-9]+\.[0-9]+$`).test(x));

    // if "pre" is set, filter versions that end with "-PRE.ddd".
    if (versionBranch.branchType !== BranchType.MAIN) {
      const preReleaseTags = tags.filter(x => new RegExp(`${fullTagPrefix}[0-9]+\.[0-9]+\.[0-9]+-${this.escapeRegExp(versionBranch.name)}\.[0-9]+$`).test(x));
      if (preReleaseTags.length > 0) {
        tags = preReleaseTags;
      } else {
        tags = officialTags;
      }
    } else {
      tags = officialTags;
    }

    tags = tags.filter(x => x);

    // if a pre-release tag is used, then add it to the initial version
    let latestTag;

    if (tags.length > 0) {
      latestTag = tags[0];
    } else {
      latestTag = '0.0.0';
    }

    // remove tag prefix (if exists)
    let latestVersion = latestTag;

    const regexReplace = new RegExp(`^${this.escapeRegExp(fullTagPrefix)}`);
    latestVersion = latestVersion.replace(regexReplace, '');
    return latestVersion;
  }

  escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }  
}