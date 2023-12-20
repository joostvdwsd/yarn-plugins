import { BaseCommand } from '@yarnpkg/cli';
import { Configuration, Project, Workspace } from '@yarnpkg/core';
import { Hooks } from '@yarnpkg/plugin-pack';
import { Command, Option, Usage } from 'clipanion';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export class PrepareManifestCommand extends BaseCommand {
  static paths = [
    ['prepare-manifest'],
  ];

  static usage: Usage = Command.Usage({
    description: `run a command with the generated package manifest`,
    details: ``
  });

  commandName = Option.String();
  args = Option.Proxy();

  async execute(): Promise<number | void> {
    const yarnConfig = await Configuration.find(this.context.cwd, this.context.plugins);
    const { workspace } = await Project.find(yarnConfig, this.context.cwd);
    if (workspace) {
      try {
        const publishManifest = await this.genPackageManifest(workspace);

        const manifestLocation = join(workspace.cwd, 'package.json');

        await writeFile(manifestLocation, JSON.stringify(publishManifest, null, 2), 'utf-8');

        const result = await this.cli.run([this.commandName, ...this.args], {
          cwd: workspace.cwd,
          stdout: process.stdout,
          stderr: process.stderr,
        });

        if (result !== 0) {
          throw new Error(`Error during execution.Error code: ${result}`);
        }
        return result;
      } finally {
        await workspace.persistManifest();
      }
    }
  }

  async genPackageManifest(workspace: Workspace): Promise<object> {
    const data = JSON.parse(JSON.stringify(workspace.manifest.raw));

    await workspace.project.configuration.triggerHook(
      (hooks: Hooks) => hooks.beforeWorkspacePacking,
      workspace,
      data,
    );

    return data;
  }
}
