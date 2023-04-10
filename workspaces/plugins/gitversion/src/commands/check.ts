import { BaseCommand } from "@yarnpkg/cli";
import { MessageName, Project, structUtils } from "@yarnpkg/core";
import { runStep } from "../utils/report";

export class GitVersionCheckCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `check`],
  ];

  async execute() {
    await runStep('Check gitversion plugin', this.context, async (report, configuration) => {

      report.reportInfo(MessageName.UNNAMED, `Branch type: ${configuration.versionBranch.branchType}`);
      report.reportInfo(MessageName.UNNAMED, `Branch name: ${configuration.versionBranch.name}`);

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      project.workspaces.forEach((child) => {
        report.reportInfo(MessageName.UNNAMED, `${structUtils.stringifyLocator(child.locator)} Private: ${child.manifest.private}`)
      })
    });
  }
}
