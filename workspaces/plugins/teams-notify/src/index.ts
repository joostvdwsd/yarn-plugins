import {Configuration, Hooks, Plugin, Project, SettingsType, structUtils } from '@yarnpkg/core';
import { BranchType, GitVersionBranch, IPackManifest, PackManifest, WorkspaceInfo } from 'yarn-plugin-gitversion';
import { IFactSet } from 'adaptivecards/lib/schema';
import axios from 'axios';
import { BaseCommand } from '@yarnpkg/cli';

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    
    teamsWebhookUrl: string;
  }
}

export interface IMessageCardSection {
  activityTitle?: string;
  activitySubtitle?: string;
  activityImage?: string;
  facts?: IFactSet;
  text?: string;
}

export interface IMessageCard {
  "@type": "MessageCard";
  "@context": "https://schema.org/extensions";
  summary?: string;
	themeColor?: string;
	title?: string;
	sections?: IMessageCardSection[];
}

export class GitVersionCheckCommand extends BaseCommand {
  static paths = [
    [`teams-notify`, `test`],
  ];

  async execute() {
    const yarnConfig = await Configuration.find(this.context.cwd, this.context.plugins);

    const { project } = await Project.find(yarnConfig, this.context.cwd);

    project.workspaces.forEach((child) => {
      console.log(child.locator.scope, child.locator.name, child.manifest.private, child.manifest.version)
    })

    afterPublish(project, {
      name: 'rc',
      branchType: BranchType.PRERELEASE
    }, {
      project: {
        name: 'test-plugins',
        version: '1.2.3',
        changelog: 'Changelog entry',
      },
      packages: {}
    }, true)
    // conventionalRecommendedBump({
      
    // }, parserOpts, (error, recommendation) => {
    //   console.log(error, recommendation); // 'major'
    // })

  }
}


const plugin: Plugin = {
  configuration: {
    teamsWebhookUrl: {
      description: 'The webhook to push the changes',
      type: SettingsType.STRING,
      isNullable: false,
      default: null
    }
  },
  commands: [
    GitVersionCheckCommand
  ],
  hooks: {  
    afterPublish: afterPublish
  } as Partial<Hooks>,
};

async function afterPublish(project: Project, branch: GitVersionBranch, packManifest: IPackManifest, dryRun: boolean) {
  const url = project.configuration.get('teamsWebhookUrl');     
  
  const titlePostFix = branch.branchType === BranchType.MAIN ? '' : ` on ${branch.name} (${branch.branchType})`;
  let title = `${packManifest.project.name} - new release : ${packManifest.project.version}${titlePostFix}`;

  const body : IMessageCard = {
    "@context": 'https://schema.org/extensions',
    "@type": 'MessageCard',
    summary: title,
    title: title,
    themeColor: '0072C6',
    sections: [{
      text: packManifest.project.changelog,
    }, {
      activityTitle: 'Packages:',
    }
    ],
  };

  axios.interceptors.request.use(request => {
    // console.log('Starting Request', JSON.stringify(request, null, 2))
    return request
  })

  if (url) {
    const response = await axios.post( url, body);
  } else {
    console.log('teamsWebhookUrl not set. Printing card content:\n', body)
  }
}

function packageSections(packages: WorkspaceInfo[], branch: GitVersionBranch) : IMessageCardSection[] {
  const CODE_BLOCK_START = '```\n';
  const CODE_BLOCK_END = '\n```';

  return packages.map((publishedPackage) => {
    const installPostfix = branch.branchType === BranchType.MAIN ? '' : `@${branch.name}`
    return {
      activityTitle: publishedPackage.name,
      text: `${CODE_BLOCK_START}yarn add ${publishedPackage.name}${installPostfix}${CODE_BLOCK_END}`
    }
  })
}

export default plugin;
