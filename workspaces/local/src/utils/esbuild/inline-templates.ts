import { readFile } from "fs/promises";
import { dirname, join } from "path";

export function getInlineTemplatePlugin() {
  return {
    name: 'template',
    setup: (build: any) => {
      let fs = require('fs')

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const originalSource = await readFile(args.path, 'utf-8');

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
      }
    )}
  }
}