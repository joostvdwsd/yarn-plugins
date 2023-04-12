import { Configuration, Hooks, Plugin, Project, SettingsType } from '@yarnpkg/core';
import { BranchType, GitVersionBranch, GitVersionBump } from 'yarn-plugin-gitversion';
import { payload } from './payload';
import { BaseCommand } from '@yarnpkg/cli';
import { request, RequestOptions } from 'https';

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    
    teamsWebhookUrl: string;
  }
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
      name: 'master',
      branchType: BranchType.MAIN
    }, {
      locator: project.topLevelWorkspace.locator,
      version: project.topLevelWorkspace.manifest.version ?? '1.2.3',
      changelog: `## [1.1.0](unknown/joostvdwsd/yarn-plugins-test/compare/v1.0.0...v1.1.0) (2023-04-06)


### Features

* test for feature ([dafadcb](unknown/joostvdwsd/yarn-plugins-test/commit/dafadcb08a911fcc206f24011782dd85e0138638))
      `,
      private: true,
      workspaces: []
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

async function afterPublish(project: Project, branch: GitVersionBranch, bumpInfo: GitVersionBump, dryRun: boolean) {
  const url = project.configuration.get('teamsWebhookUrl');     

  const body = payload({
    bumpInfo,
    branch,
  });

  if (url) {
    await notifyTeams(new URL(url), body);
  } else {
    console.log('teamsWebhookUrl not set. Printing card content:\n', JSON.stringify(body, null, 2))
  }
}

async function notifyTeams(url: URL, body: any) {

  return new Promise((resolve, reject) => {

    const content = JSON.stringify(body);
    const options: RequestOptions = {
      host: url.host,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': content.length
      }
    };
  
    console.log(options)
    
    const req = request(options, (res) => {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
      resolve(res)
    });
    
    req.on('error', (e) => {
      console.log('problem with request: ' + e.message);
      reject(e)
    });
    
    // write data to request body
    console.log(content)
    req.write(content);
    req.end();  
  })
}



export default plugin;
