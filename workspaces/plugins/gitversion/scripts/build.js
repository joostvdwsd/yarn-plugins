const {build} = require('esbuild');
const { pnpPlugin } = require('@yarnpkg/esbuild-plugin-pnp');
const { join, dirname } = require('path');
const { getDynamicLibs } = require('@yarnpkg/cli');

const pathRegExp = /^(?![a-zA-Z]:[\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^/]+\/)?[^/]+)\/*(.*|)$/;
const name = '@yarnpkg/plugin-gitversion';

const isDynamicLib = (request) => {
  if (getDynamicLibs().has(request))
    return true;

  if (request.match(/^@yarnpkg\/plugin-/))
    return true;

  return false;
};

const dynamicLibResolver = {
  name: `dynamic-lib-resolver`,
  setup(build) {
    build.onResolve({filter: /()/}, async args => {
      const dependencyNameMatch = args.path.match(pathRegExp);
      if (dependencyNameMatch === null)
        return undefined;

      const [, dependencyName] = dependencyNameMatch;
      if (dependencyName === name || !isDynamicLib(args.path))
        return undefined;

      return {
        path: args.path,
        external: true,
      };
    });
  },
};

let templatePlugin = {
  name: 'template',
  setup(build) {
    let path = require('path')
    let fs = require('fs')

  build.onLoad({ filter: /.*/ }, async (args) => {
    const originalSource = await fs.promises.readFile(args.path, 'utf-8');

    if (originalSource.includes('template.hbs')) {

      const fileFolder = dirname(args.path);
      const source1 = originalSource.replace(/readFile\(resolve\(__dirname, '([\w\.\/]+)'\), 'utf-8'\)/g, (content, file) => {
        return '`' + fs.readFileSync(join(fileFolder, file), 'utf-8').replace('`', '\\`') + '`'
      })

      const source2 = source1.replace(/readFileSync\(join\(__dirname, .([\w\/\.]+).\), .utf\-8.\)/g, (content, file) => {
        return '`' + fs.readFileSync(join(fileFolder, file), 'utf-8').replace('`', '\\`') + '`'
      })

      return {
        contents: source2
      };
    }
  })}
}

let testPlugin = {
  name: 'testPlugin',
  setup(build) {
    let path = require('path')
    let fs = require('fs')

  build.onLoad({ filter: /()/ }, async (args) => {
    const originalSource = await fs.promises.readFile(args.path, 'utf-8');

    if (originalSource.includes('template.hbs')) {
      console.log(args.path)
    }
  })}
}
async function main() {
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
    join(__dirname, '..', 'src/index')
  ],
  bundle: true,
  outfile: join(__dirname, '..', 'bundles', '@yarnpkg', 'plugin-gitversion.js'),
  logLevel: `info`,
  format: `iife`,
  platform: `node`,
  plugins: [
    templatePlugin,
    testPlugin,
    dynamicLibResolver,
    pnpPlugin(),
    
  ],
  minify: true,
  sourcemap: false,//'inline',
  target: `node14`,
});
}
main().catch((error) => {
  console.log(error);
  process.exit(1)
})