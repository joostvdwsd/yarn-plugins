import { BaseCommand } from "@yarnpkg/cli";
import { Project, Manifest } from "@yarnpkg/core";
import { Command, Option } from "clipanion";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../utils/configuration";
import { tag } from "../utils/git";

export class GitVersionTagCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `tag`],
  ];

  push = Option.Boolean('Push the tags to git', true);

  async execute() {
    const configuration = await GitVersionConfiguration.fromContext(this.context);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {

      const topVersion = project.topLevelWorkspace.manifest.version;

      if (topVersion && topVersion !== DEFAULT_REPO_VERSION) {
        await tag(`${configuration.versionTagPrefix}${topVersion}`, this.push)
      }
    }
  }
}