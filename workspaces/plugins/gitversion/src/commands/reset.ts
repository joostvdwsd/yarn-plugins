import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, Project } from "@yarnpkg/core";
import { DEFAULT_REPO_VERSION } from "../utils/configuration";
import { updateWorkspacesWithVersion } from "../utils/workspace";

export class GitVersionResetCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `reset`],
  ];

  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);

    const {project} = await Project.find(configuration, this.context.cwd);

    await updateWorkspacesWithVersion(project.workspaces, DEFAULT_REPO_VERSION);
  }
}