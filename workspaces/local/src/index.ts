import { Plugin } from '@yarnpkg/core';
import { PluginBuildCommand } from './commands/build';
import { ReleasePublishCommand } from './commands/publish';

const plugin: Plugin = {
  commands: [
    PluginBuildCommand,
    ReleasePublishCommand
  ],
};

export default plugin;
