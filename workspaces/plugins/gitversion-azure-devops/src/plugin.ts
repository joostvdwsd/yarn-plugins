import { Hooks, Plugin, Project, structUtils } from '@yarnpkg/core';
import { AnyPresetConfig, loadPreset } from 'conventional-changelog-presets-loader';
import { GitVersionBranch, GitVersionBump } from 'yarn-plugin-gitversion';

const plugin: Plugin = {
  configuration: {
  },
  hooks: {
    /**
     * This hook will add "Merged PR 12345: " detection to all main detections. This will make sure you can have your PR's in conventional commit style
     * @param previousOptions 
     * @returns 
     */
    async conventionalCommitOptions(_previousOptions: AnyPresetConfig) : Promise<AnyPresetConfig> {
      const result = await loadPreset('conventional-commits', {
        commitUrlFormat: 'https://dev.azure.com/aegon-nl/{{repository}}/commit/{{hash}}',
        compareUrlFormat: 'https://dev.azure.com/aegon-nl/{{repository}}/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}&_a=files',
      });

      const headerPattern = result.parserOpts.headerPattern?.toString() ?? '/^(\w*)(?:\((.*)\))?!?: (.*)$/'
      const breakingHeaderPattern = result.parserOpts.breakingHeaderPattern?.toString() ?? '/^(\w*)(?:\((.*)\))?!: (.*)$/'
      const revertPattern = result.parserOpts.revertPattern?.toString() ?? '/^(\w*)(?:\((.*)\))?!?: (.*)$/'

      return {
        ...result,
        parserOpts: {
          ...result.parserOpts,
          headerPattern: new RegExp(headerPattern.replace('/^', '^(?:Merged PR \d+: )?').replace(/\/$/, '')),
          breakingHeaderPattern: new RegExp(breakingHeaderPattern.replace('/^', '^(?:Merged PR \d+: )?').replace(/\/$/, '')),
          revertPattern: new RegExp(revertPattern.replace('/^', '^(?:Merged PR \d+: )?').replace(/\/$/, '')),
        },
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
