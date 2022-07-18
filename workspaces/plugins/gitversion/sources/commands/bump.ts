import { BaseCommand } from "@yarnpkg/cli";
import { Project, Manifest } from "@yarnpkg/core";
import { GitVersionConfiguration } from "../configuration";
import { bump } from "../utils/standard-version";
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

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {
      await bump(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), project.topLevelWorkspace.cwd, project.topLevelWorkspace.cwd);
      const newManifest = await Manifest.find(project.topLevelWorkspace.cwd);

      const newVersion = newManifest.version;
      if (newVersion) {
        const workspaceBumps = project.topLevelWorkspace.getRecursiveWorkspaceChildren().map((workspace) => {
          return bump(configuration.versionBranch, tagPrefix(configuration.versionTagPrefix), workspace.cwd, project.topLevelWorkspace.cwd, newVersion);
        });
        await Promise.all(workspaceBumps);
      }
    }
  }
}