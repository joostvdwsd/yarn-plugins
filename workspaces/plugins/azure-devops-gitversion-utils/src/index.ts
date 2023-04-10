import { Hooks, Plugin } from '@yarnpkg/core';
import { ConventionalCommitConfig } from 'yarn-plugin-gitversion';

const plugin: Plugin = {
  configuration: {
  },
  hooks: {  
    async conventionalCommitOptions(previousOptions: ConventionalCommitConfig) {
      const headerPattern = previousOptions.parserOpts.headerPattern?.toString() ?? '/^(\w*)(?:\((.*)\))?!?: (.*)$/'
      const breakingHeaderPattern = previousOptions.parserOpts.breakingHeaderPattern?.toString() ?? '/^(\w*)(?:\((.*)\))?!: (.*)$/'
      const revertPattern = previousOptions.parserOpts.revertPattern?.toString() ?? '/^(\w*)(?:\((.*)\))?!?: (.*)$/'

      return {
        ...previousOptions,
        parserOpts: {
          ...previousOptions.parserOpts,
          headerPattern: new RegExp(headerPattern.replace('/^', '^(?:Merged PR \d+: )?').replace(/\/$/, '')),
          breakingHeaderPattern: new RegExp(breakingHeaderPattern.replace('/^', '^(?:Merged PR \d+: )?').replace(/\/$/, '')),
          revertPattern: new RegExp(revertPattern.replace('/^', '^(?:Merged PR \d+: )?').replace(/\/$/, '')),
        }
      }
    },
  } as Partial<Hooks>,
};


export default plugin;
