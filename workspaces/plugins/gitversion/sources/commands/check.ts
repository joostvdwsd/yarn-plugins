import { BaseCommand } from "@yarnpkg/cli";
import { Project, miscUtils } from "@yarnpkg/core";
import { CachingStrategy } from "@yarnpkg/core/lib/miscUtils";
import conventionalRecommendedBump from "conventional-recommended-bump";
import { GitVersionConfiguration } from "../configuration";

export class GitVersionCheckCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `check`],
  ];

  async execute() {
    const configuration = await GitVersionConfiguration.fromContext(this.context);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    project.workspaces.forEach((child) => {
      console.log(child.locator.scope, child.locator.name, child.manifest.private, child.manifest.version)
    })


    const parserOpts = require('conventional-changelog-angular');
    console.log(parserOpts)

    // conventionalRecommendedBump({
      
    // }, parserOpts, (error, recommendation) => {
    //   console.log(error, recommendation); // 'major'
    // })

  }
}
