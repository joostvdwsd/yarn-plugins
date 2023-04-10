import {Configuration, Hooks, Plugin, Project } from '@yarnpkg/core';
import { BaseCommand } from '@yarnpkg/cli';
import { ConventionalCommitConfig } from '@joostvdwsd/yarn-plugin-gitversion';

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    
    teamsWebhookUrl: string;
  }
}

export class GitVersionCheckCommand extends BaseCommand {
  static paths = [
    [`cc`, `test`],
  ];

  async execute() {
    const yarnConfig = await Configuration.find(this.context.cwd, this.context.plugins);

    const { project } = await Project.find(yarnConfig, this.context.cwd);

    project.workspaces.forEach((child) => {
      console.log(child.locator.scope, child.locator.name, child.manifest.private, child.manifest.version)
    })
    console.log('HELLO FROM PLUGIN')


  }
}


const plugin: Plugin = {
  configuration: {
  },
  commands: [
    GitVersionCheckCommand
  ],
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
