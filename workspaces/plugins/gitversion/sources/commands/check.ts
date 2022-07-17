import { BaseCommand } from "@yarnpkg/cli";
import { Project } from "@yarnpkg/core";
import { GitVersionConfiguration } from "../configuration";

export class GitVersionCheckCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `check`],
  ];

  async execute() {
    const configuration = await GitVersionConfiguration.fromContext(this.context);
    console.log(configuration.versionBranch);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    project.workspaces.forEach((child) => {
      console.log(child.locator.scope, child.locator.name, child.manifest.private, child.manifest.version)
    })


    // conventionalRecommendedBump({
      
    // }, parserOpts, (error, recommendation) => {
    //   console.log(error, recommendation); // 'major'
    // })

  }
}
