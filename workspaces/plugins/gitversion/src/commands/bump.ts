import { BaseCommand } from "@yarnpkg/cli";
import { MessageName, Project } from "@yarnpkg/core";
import { updateWorkspacesWithVersion, updateWorkspaceWithVersion } from "../utils";
import { bump } from "../utils/bump";
import { changelog } from "../utils/changelog";
import { GitVersionConfiguration } from "../utils/configuration";
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

    const configuration = await GitVersionConfiguration.fromContext(this.context);
    configuration.report.reportInfo(MessageName.UNNAMED, '[BUMP] Bump new version based on conventional commit messages')

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {
      const version = await bump(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), project, project.topLevelWorkspace, configuration.report);
      
      if (version) {
        await updateWorkspaceWithVersion(project.topLevelWorkspace, version, configuration.report);
        await updateWorkspacesWithVersion(project.topLevelWorkspace.getRecursiveWorkspaceChildren(), version, configuration.report);

        await changelog(configuration.versionBranch, version, tagPrefix(configuration.versionTagPrefix), project, project.topLevelWorkspace, configuration.report)

        // const childUpdates = project.topLevelWorkspace.getRecursiveWorkspaceChildren().map((workspace) => {
        //   return changelog(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), project,workspace, configuration.report)
        // })

        // Promise.all(childUpdates);
      }
    }
  }
}