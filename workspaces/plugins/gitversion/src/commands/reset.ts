import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, MessageName, Project } from "@yarnpkg/core";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../utils/configuration";
import { updateWorkspacesWithVersion } from "../utils/workspace";

export class GitVersionResetCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `reset`],
  ];

  async execute() {
    const configuration = await GitVersionConfiguration.fromContext(this.context);
    configuration.report.reportInfo(MessageName.UNNAMED, '[RESET] Reset source versions to 0.0.0')

    const {project} = await Project.find(configuration.yarnConfig, this.context.cwd);

    await updateWorkspacesWithVersion(project.workspaces, DEFAULT_REPO_VERSION, configuration.report);
  }
}