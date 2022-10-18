import { Plugin, WrapNetworkRequestInfo } from '@yarnpkg/core';
import { GitVersionConfiguration } from './utils/configuration';
import { GitVersionRestoreCommand } from './commands/restore';
import { GitVersionResetCommand } from './commands/reset';
import { GitVersionBumpCommand } from './commands/bump';
import { GitVersionPublishCommand } from './commands/publish';
import { GitVersionCheckCommand } from './commands/check';
import { GitVersionTagCommand } from './commands/tag';
import { GitVersionCommitCommand } from './commands/commit';
import { GitVersionPackCommand } from './commands/pack';
import { GitVersionPublishPackedCommand } from './commands/publish-packed';


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
    GitVersionPublishPackedCommand,
  ],
  hooks: {
    async wrapNetworkRequest(_executor: () => Promise<any>, extra: WrapNetworkRequestInfo) {

      /**
       * TODO:Replace tag on publish when in prerelease!
       */

      // console.log(extra);
      return _executor;
      // if (typeof extra.body === 'object') {
      //   (extra.body as any)['name'] = 'joostvdwsd';
      // }
      // console.log(extra.body);
      // const newExecutor = httpUtils.request(extra.target, extra.body, { ...extra });

      // return newExecutor;
    }
  }
};
