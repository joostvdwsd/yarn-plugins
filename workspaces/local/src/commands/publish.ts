import { Configuration, Project } from "@yarnpkg/core";
import { BaseCommand } from "@yarnpkg/cli";
import { request, RequestOptions } from "https";
import { resolve } from "path";
import { readFile } from "fs/promises";

export class ReleasePublishCommand extends BaseCommand {
  static paths = [
    [`local`, `publish`],
  ];

  async execute() {
    const yarnConfig = await Configuration.find(this.context.cwd, this.context.plugins);

    const { project, workspace } = await Project.find(yarnConfig, this.context.cwd);

    if (!workspace) {
      throw new Error('Not a valid workspace!')
    } 
    if (workspace.manifest.private) {
      throw new Error('Can\'t publish a private workspace');
    }
    if (!workspace.manifest.name) {
      throw new Error('Invalid workspace (no name in manifest)')
    }
    const name = workspace.manifest.name.name.replace('yarn-plugin-', '');
    const env = JSON.parse(await readFile(resolve(project.cwd, 'env.json'), 'utf-8'));
    const outFolder = resolve(workspace.cwd, 'bundle');
    const outFile = resolve(outFolder, `${name}.js`);

    const data = await readFile(outFile, 'utf-8');

    const url = new URL(env.apiUrl);

    const options: RequestOptions = {
      host: url.host,
      port: 443,
      path: `${url.pathname}/${name}/${workspace.manifest.version}`,
      method: 'POST',
      headers: {
        'content-type': 'text/javascript',
        'x-api-key': env.apiKey
      }
    };

    const req = request(options, (res) => {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });
    
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    
    // write data to request body
    req.write(data);
    req.end();    
  }
}
