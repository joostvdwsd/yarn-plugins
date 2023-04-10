import { BaseCommand } from "@yarnpkg/cli";
import { Project } from "@yarnpkg/core";
import { DEFAULT_REPO_VERSION } from "../utils/configuration";
import { runStep } from "../utils/report";
import { updateWorkspacesVersion } from "../utils/workspace";

export class GitVersionResetCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `reset`],
  ];

  async execute() {
    await runStep('Resetting file versions', this.context, async (report, configuration) => {
      const {project} = await Project.find(configuration.yarnConfig, this.context.cwd);

      await updateWorkspacesVersion(project.workspaces, DEFAULT_REPO_VERSION, report);
    });
  }
}