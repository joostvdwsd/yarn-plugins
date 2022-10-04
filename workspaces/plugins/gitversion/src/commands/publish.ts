import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, LightReport, MessageName, Project, structUtils, Workspace } from "@yarnpkg/core";
import { GitVersionConfiguration } from "../utils/configuration";
import { BranchType, PublishedPackage, PublishedVersion } from "../types";

import { join as pjoin } from 'path';
import { GitVersionTagCommand } from "./tag";
import { execCapture } from "../utils/exec";
import { GitVersionCommitCommand } from "./commit";
import { convertLocatorToDescriptor, makeIdent } from "@yarnpkg/core/lib/structUtils";
import { existsSync } from "fs";
import { Option } from "clipanion";
import { runStep } from "../utils/report";
const parseChangelog = require("changelog-parser");

export class GitVersionPublishCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `publish`],
  ];

  dryRun = Option.Boolean('--dryRun', false);
  skipTag = Option.Boolean('--skipTag', false);
  skipCommit = Option.Boolean('--skipCommit', false);

  async execute() {

    // first execute tag

    const doSkipTag = this.dryRun || this.skipTag;
    if (!doSkipTag) {
      const tagCommand = new GitVersionTagCommand();
      tagCommand.context = this.context;
      tagCommand.cli = this.cli;
      await tagCommand.execute();
    } else {
      console.log("Skipping tag")
    }

    const doSkipCommit = this.dryRun || this.skipCommit;
    if (!doSkipCommit) {
      const commitCommand = new GitVersionCommitCommand();
      commitCommand.context = this.context;
      commitCommand.cli = this.cli;
      await commitCommand.execute();
    } else {
      console.log("Skipping commit")
    }
    
    await runStep('Pubishing packages', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }   

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {

        const publicWorkspaces = project.workspaces.filter(this.filterPublicWorkspace);

        for (const workspace of publicWorkspaces) {
          let releaseTagPostfix : string[] = [];
          if (configuration.versionBranch.branchType === BranchType.FEATURE || configuration.versionBranch.branchType === BranchType.PRERELEASE) {
            releaseTagPostfix = ['--tag', configuration.versionBranch.name];
          }
          report.reportInfo(MessageName.UNNAMED, `Publishing ${structUtils.stringifyIdent(workspace.locator)}`)

          if (!this.dryRun) {
            await execCapture('yarn', ['npm', 'publish', ...releaseTagPostfix], workspace.cwd);
          } else {
            report.reportInfo(MessageName.UNNAMED, 'skipping publish due to dryRun. Would run command:')
            report.reportInfo(MessageName.UNNAMED, ['yarn', 'npm', 'publish', ...releaseTagPostfix].join(' '));
            report.reportInfo(MessageName.UNNAMED, `In folder: ${workspace.cwd}`)
          }
        }

        const publishedVersion : PublishedVersion = {
          ... await this.readChangeLog(project.topLevelWorkspace),
          packages: await Promise.all(publicWorkspaces.map(workspace => this.readChangeLog(workspace)))
        }

        await project.configuration.triggerHook(hooks => {
          return hooks.afterPublish;
        }, project, configuration.versionBranch, publishedVersion);
      }
    });
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

      currentReleaseChangelog = changeLog.versions.find((versionEntry : any) => versionEntry.version === releasedVersion)?.body;
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