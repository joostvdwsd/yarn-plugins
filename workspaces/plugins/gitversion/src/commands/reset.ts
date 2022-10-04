import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, MessageName, Project, StreamReport } from "@yarnpkg/core";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../utils/configuration";
import { runStep } from "../utils/report";
import { updateWorkspacesWithVersion } from "../utils/workspace";

export class GitVersionResetCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `reset`],
  ];

  async execute() {
    await runStep('Resetting file versions', this.context, async (report, configuration) => {
      const {project} = await Project.find(configuration.yarnConfig, this.context.cwd);

      await updateWorkspacesWithVersion(project.workspaces, DEFAULT_REPO_VERSION, report);
    });
  }
}