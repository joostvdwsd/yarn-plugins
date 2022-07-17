import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, Project } from "@yarnpkg/core";
import { updateWorkspacesWithVersion } from "../utils/workspace";

const DEFAULT_REPO_VERSION = '0.0.0';

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