import { BaseCommand } from "@yarnpkg/cli";
import { Project, Manifest, Configuration, MessageName } from "@yarnpkg/core";
import { Command, Option } from "clipanion";
import { BranchType } from "../types";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../utils/configuration";
import { tag } from "../utils/git";
import { runStep } from "../utils/report";

export class GitVersionTagCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `tag`],
  ];

  push = Option.Boolean('Push the tags to git', true);

  async execute() {
    await runStep('Resetting file versions', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }    

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {

        const topVersion = project.topLevelWorkspace.manifest.version;

        if (!topVersion || topVersion === DEFAULT_REPO_VERSION) {
          report.reportInfo(MessageName.UNNAMED, `No active bump detected. Skipping tag step`);
          return;
        }
        
        await tag(`${configuration.versionTagPrefix}${topVersion}`, this.push, project.cwd)        
      }
    });
  }
}