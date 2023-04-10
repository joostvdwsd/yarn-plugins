import { Plugin } from '@yarnpkg/core';
import { GitVersionConfiguration } from './utils/configuration';
import { GitVersionRestoreCommand } from './commands/restore';
import { GitVersionResetCommand } from './commands/reset';
import { GitVersionBumpCommand } from './commands/bump';
import { GitVersionPublishCommand } from './commands/publish';
import { GitVersionCheckCommand } from './commands/check';
import { GitVersionTagCommand } from './commands/tag';
import { GitVersionCommitCommand } from './commands/commit';
import { GitVersionPackCommand } from './commands/pack';


export const plugin: Plugin = {
  configuration: GitVersionConfiguration.definition,
  commands: [
    GitVersionCheckCommand,
    GitVersionRestoreCommand,
    GitVersionResetCommand,
    GitVersionBumpCommand,
    GitVersionTagCommand,
    GitVersionCommitCommand,
    GitVersionPublishCommand,
    GitVersionPackCommand,
  ],
};
