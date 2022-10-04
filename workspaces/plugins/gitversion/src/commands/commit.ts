import { BaseCommand } from "@yarnpkg/cli";
import { Project, Manifest, Configuration, MessageName } from "@yarnpkg/core";
import { existsSync } from "fs";
import { BranchType } from "../types";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../utils/configuration";
import { addAndCommit, tag } from "../utils/git";
import { runStep } from "../utils/report";

export class GitVersionCommitCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `commit`],
  ];

  async execute() {
    await runStep('Commit changelogs', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }
    
      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {

        const topVersion = project.topLevelWorkspace.manifest.version;

        const changelogFiles = project.workspaces
          .map((workspace) => `${workspace.cwd}/CHANGELOG.md`)
          .filter((file) => existsSync(file))

        if (changelogFiles.length === 0) {
          report.reportInfo(MessageName.UNNAMED, 'No changelog files to commit. Skipping commit step');
          return;
        }

        if (!topVersion || topVersion === DEFAULT_REPO_VERSION) {
          report.reportInfo(MessageName.UNNAMED, `No active bump detected. Skipping commit step`);
          return;
        }

        await addAndCommit(changelogFiles , `chore(release): ${topVersion}`)
      }
    });
  }
}