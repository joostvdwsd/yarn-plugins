import { BaseCommand } from "@yarnpkg/cli";
import { Project, Manifest } from "@yarnpkg/core";
import { DEFAULT_REPO_VERSION, GitVersionConfiguration } from "../configuration";
import { addAndCommit, tag } from "../utils/git";

export class GitVersionCommitCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `commit`],
  ];

  async execute() {
    const configuration = await GitVersionConfiguration.fromContext(this.context);

    const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

    if (configuration.independentVersioning) {
      throw new Error('Not implemented')
    } else {

      const topVersion = project.topLevelWorkspace.manifest.version;

      if (topVersion && topVersion !== DEFAULT_REPO_VERSION) {
        await addAndCommit([
          '**/CHANGELOG.md',
        ], `chore(release): ${topVersion}`)
      }
    }
  }
}