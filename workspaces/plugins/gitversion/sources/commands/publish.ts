import { BaseCommand } from "@yarnpkg/cli";
import { Project } from "@yarnpkg/core";
import { GitVersionConfiguration } from "../configuration";
import { BranchType, ChangelogEntry } from "../types";

import { join as pjoin } from 'path';
import { GitVersionTagCommand } from "./tag";
import { execCapture } from "../utils/exec";
const parseChangelog = require("changelog-parser");

export class GitVersionPublishCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `publish`],
  ];

  async execute() {

    // first execute tag
    const tagCommand = new GitVersionTagCommand();
    tagCommand.context = this.context;
    tagCommand.cli = this.cli;
    await tagCommand.execute();
    
    const configuration = await GitVersionConfiguration.fromContext(this.context);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {

      const publicWorkspaces = project.workspaces.filter((workspace) => workspace.manifest.private === false);

      const publishCommands = publicWorkspaces.map((workspace) => {
        let releaseTagPostfix : string[] = [];
        if (configuration.versionBranch.branchType === BranchType.FEATURE || configuration.versionBranch.branchType === BranchType.PRERELEASE) {
          releaseTagPostfix = ['--tag', configuration.versionBranch.name];
        }
        execCapture('yarn', ['npm', 'publish', ...releaseTagPostfix], workspace.cwd);
      })
      await Promise.all(publishCommands);

      const changeLog = await parseChangelog({
        filePath: pjoin(project.topLevelWorkspace.cwd, 'CHANGELOG.md'),
        removeMarkdown: false
      })

      const releasedVersion = project.topLevelWorkspace.manifest.version;
      const currentRelease = changeLog.versions.find((versionEntry: ChangelogEntry) => versionEntry.version === releasedVersion);

      if (currentRelease) {
        await project.configuration.triggerHook(hooks => {
          return hooks.afterPublish;
        }, project, project.topLevelWorkspace, currentRelease);
      }
    }
  }
}