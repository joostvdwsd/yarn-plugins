import { BaseCommand } from "@yarnpkg/cli";
import { LightReport, MessageName, Project, structUtils, Workspace } from "@yarnpkg/core";
import { GitVersionConfiguration } from "../utils/configuration";
import { BranchType, PublishedPackage, PublishedVersion } from "../types";

import { join as pjoin } from 'path';
import { GitVersionTagCommand } from "./tag";
import { execCapture } from "../utils/exec";
import { GitVersionCommitCommand } from "./commit";
import { convertLocatorToDescriptor, makeIdent } from "@yarnpkg/core/lib/structUtils";
import { existsSync } from "fs";
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

    // // also execute commit
    // const commitCommand = new GitVersionCommitCommand();
    // commitCommand.context = this.context;
    // commitCommand.cli = this.cli;
    // await commitCommand.execute();
    
    const configuration = await GitVersionConfiguration.fromContext(this.context);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    const report = new LightReport({
      configuration: configuration.yarnConfig,
      stdout: this.context.stdout,      
    })

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {

      const publicWorkspaces = project.workspaces.filter(this.filterPublicWorkspace);

      for (const workspace of publicWorkspaces) {
        let releaseTagPostfix : string[] = [];
        if (configuration.versionBranch.branchType === BranchType.FEATURE || configuration.versionBranch.branchType === BranchType.PRERELEASE) {
          releaseTagPostfix = ['--tag', configuration.versionBranch.name];
        }
        report.reportInfo(MessageName.UNNAMED, `Publishing ${structUtils.stringifyIdent(workspace.locator)}`)
        await execCapture('yarn', ['npm', 'publish', ...releaseTagPostfix], workspace.cwd);
      }

      const publishedVersion : PublishedVersion = {
        ... await this.readChangeLog(project.topLevelWorkspace),
        packages: await Promise.all(publicWorkspaces.map(workspace => this.readChangeLog(workspace)))
      }

      await project.configuration.triggerHook(hooks => {
        return hooks.afterPublish;
      }, project, configuration.versionBranch, publishedVersion);
    }
  }

  async readChangeLog(workspace: Workspace) : Promise<PublishedPackage> {
    const filePath = pjoin(workspace.cwd, 'CHANGELOG.md');

    const releasedVersion = workspace.manifest.version;

    let currentReleaseChangelog : string | undefined;
    
    if (existsSync(filePath)) {
      const changeLog = await parseChangelog({
        filePath: pjoin(workspace.cwd, 'CHANGELOG.md'),
        removeMarkdown: false
      })
      const currentReleaseChangelog = changeLog.versions.find((versionEntry : any) => versionEntry.version === releasedVersion);
    }

    return {
      version: releasedVersion || '0.0.0',
      changelog: currentReleaseChangelog,
      packageName: structUtils.stringifyIdent(workspace.locator)
    }
  }
  
  filterPublicWorkspace(workspace: Workspace) : boolean {
    return workspace.manifest.private === false
  }
}