import { BaseCommand } from "@yarnpkg/cli";
import { Project, Manifest } from "@yarnpkg/core";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../configuration";
import { tag } from "../utils/git";

export class GitVersionTagCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `tag`],
  ];

  async execute() {
    const configuration = await GitVersionConfiguration.fromContext(this.context);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {

      const topVersion = project.topLevelWorkspace.manifest.version;

      if (topVersion && topVersion !== DEFAULT_REPO_VERSION) {
        await tag(`${configuration.versionTagPrefix}${topVersion}`)
      }
    }
  }
}