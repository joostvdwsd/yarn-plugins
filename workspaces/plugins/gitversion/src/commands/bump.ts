import { BaseCommand } from "@yarnpkg/cli";
import { MessageName, Project } from "@yarnpkg/core";
import { BranchType } from "../types";
import { tagPrefix, updateWorkspaceChangelog, updateWorkspacesVersion } from "../utils";
import { bumpChangelog, bumpVersion } from "../utils/bump";
import { runStep } from "../utils/report";
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
        const version = await bumpVersion(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), project.topLevelWorkspace, report);
        
        if (version) {
          await updateWorkspacesVersion(project.workspaces, version, report);

          for (let workspace of project.workspaces) {
            const changelog = await bumpChangelog(configuration.versionBranch, version, tagPrefix(configuration.versionTagPrefix), workspace, report);
            if (changelog) {
              updateWorkspaceChangelog(workspace, version, changelog, report);
            }
          }          
        }
      }
    });
  }
}