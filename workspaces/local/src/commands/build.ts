import { Configuration, Project } from "@yarnpkg/core";
import { BaseCommand } from "@yarnpkg/cli";
import { resolve } from "path";
import inlineImportPlugin from 'esbuild-plugin-inline-import';
import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';
import { createRequire } from 'module';
import { getDynamicLibResolverPlugin } from "../utils/esbuild/dynamic-lib";
import { getInlineTemplatePlugin } from "../utils/esbuild/inline-templates";
import { mkdir, writeFile } from "fs/promises";

export class PluginBuildCommand extends BaseCommand {
  static paths = [
    [`local`, `build`],
  ];

  async execute() {
    const yarnConfig = await Configuration.find(this.context.cwd, this.context.plugins);

    const { project, workspace } = await Project.find(yarnConfig, this.context.cwd);

    if (!workspace) {
      throw new Error('Invalid workspace!')
    }

    if (!workspace.manifest.name) {
      throw new Error('Invalid workspace (no name in manifest)')
    }
    const name = workspace.manifest.name.name.replace('yarn-plugin-', '');

    const outFolder = resolve(workspace.cwd, 'bundle');
    const outFile = resolve(outFolder, `${name}.js`);

    await mkdir(outFolder, {
      recursive: true,
    })

    const workspaceRequire = createRequire(workspace.cwd);
    const projectRequire = createRequire(project.cwd);
    projectRequire(resolve(project.cwd, `.pnp.cjs`)).setup();

    const { build } = workspaceRequire('esbuild');

    const res = await build({
      banner: {
        js: [
          `/* eslint-disable */`,
          `//prettier-ignore`,
          `module.exports = {`,
          `name: ${JSON.stringify(name)},`,
          `factory: function (require) {`,
        ].join(`\n`),
      },
      globalName: `plugin`,
      footer: {
        js: [
          `return plugin;`,
          `}`,
          `};`,
        ].join(`\n`),
      },
      entryPoints: [
        resolve(workspace.cwd, 'src/index.ts')
      ],
      bundle: true,
      outfile: outFile,
      logLevel: `info`,      
      format: `iife`,
      platform: `node`,
      plugins: [
        // inlineImportPlugin(),
        getInlineTemplatePlugin(),
        getDynamicLibResolverPlugin(name),
        pnpPlugin(),
      ],
      minify: false,
      sourcemap: false,//'inline',
      metafile: true,
      target: `node14`,
    });
    await writeFile(resolve(outFolder, 'meta.json'), JSON.stringify(res.metafile))
  }

}
