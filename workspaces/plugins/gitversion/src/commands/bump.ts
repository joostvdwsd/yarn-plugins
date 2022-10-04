import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, MessageName, Project, StreamReport } from "@yarnpkg/core";
import { BranchType } from "../types";
import { updateWorkspacesWithVersion, updateWorkspaceWithVersion } from "../utils";
import { bump } from "../utils/bump";
import { changelog } from "../utils/changelog";
import { GitVersionConfiguration } from "../utils/configuration";
import { runStep } from "../utils/report";
import { tagPrefix } from "../utils/tags";
import { GitVersionRestoreCommand } from "./restore";

export class GitVersionBumpCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `bump`],
  ];

  async execute() {

    // first execute restore
    const restoreCommand = new GitVersionRestoreCommand();
    restoreCommand.context = this.context;
    restoreCommand.cli = this.cli;
    await restoreCommand.execute();

    await runStep('Bump versions', this.context, async (report, configuration) => {

      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }
    
      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {
        const version = await bump(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), project, project.topLevelWorkspace, report);
        
        if (version) {
          await updateWorkspaceWithVersion(project.topLevelWorkspace, version, report);
          await updateWorkspacesWithVersion(project.topLevelWorkspace.getRecursiveWorkspaceChildren(), version, report);

          await changelog(configuration.versionBranch, version, tagPrefix(configuration.versionTagPrefix), project, project.topLevelWorkspace, report)

          // const childUpdates = project.topLevelWorkspace.getRecursiveWorkspaceChildren().map((workspace) => {
          //   return changelog(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), project,workspace, configuration.report)
          // })

          // Promise.all(childUpdates);
        }
      }
    });
  }
}