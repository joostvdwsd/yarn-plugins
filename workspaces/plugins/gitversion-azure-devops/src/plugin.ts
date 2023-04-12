import { Hooks, Plugin, Project, structUtils } from '@yarnpkg/core';
import { ConventionalCommitConfig, GitVersionBranch, GitVersionBump } from 'yarn-plugin-gitversion';

const plugin: Plugin = {
  configuration: {
  },
  hooks: {
    /**
     * This hook will add "Merged PR 12345: " detection to all main detections. This will make sure you can have your PR's in conventional commit style
     * @param previousOptions 
     * @returns 
     */
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
        },

        writerOpts: {
          ...previousOptions.writerOpts,
          compareUrlFormat: 'https://dev.azure.com/aegon-nl/{{repository}}/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}&_a=files',
        }
      }
    },

    async afterBump(project: Project, branch: GitVersionBranch, projectBump: GitVersionBump) {
      const buildNumber = `${structUtils.prettyIdent(project.configuration, projectBump.locator)} - ${projectBump.version} - ${branch.name} (${branch.branchType})`;
      console.log('\n============== Gitversion Azure devops =======================\n');
      console.log(`  Output variable   : version=${projectBump.version}`);
      console.log(`  Change buildnumber: ${buildNumber}`);
      
      console.log(`##vso[task.setvariable variable=version;isOutput=true]${projectBump.version}}`)
      console.log(`##vso[build.updatebuildnumber]${buildNumber}`);
      console.log('\n==============================================================\n');
    }
  } as Partial<Hooks>,
};


export default plugin;
