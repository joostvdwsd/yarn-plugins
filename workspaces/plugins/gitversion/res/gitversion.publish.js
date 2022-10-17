const { readFile } = require('fs/promises');
const { existsSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

async function main() {
  const configFileLocation = join(__dirname, 'gitversion.config.json');
  const config = JSON.parse(await readFile(configFileLocation, 'utf-8'));

  const publishPromises = config.packages.map((packageName) => {
    const packageLocation = join(__dirname, packageName);
    if (!existsSync) {
      throw new Error(`Package file '${packageLocation}' not found!`);
    }
    return exec('npm', ['publish', packageLocation, '--tag', config.versionTag ?? 'latest'])
  })

  await Promise.all(publishPromises);

  await exec('git', ['push', '--no-verify', 'origin', config.gitTagName]);

  const changelogPatchLocation = join(__dirname, 'gitversion.changelog.patch');
  if (existsSync(join)) {
    await exec('git', ['apply', changelogPatchLocation]);
  }
  await exec('git', ['add', '*CHANGELOG.md']);
  await exec('git', ['commit', '*CHANGELOG.md', '-m', `'chore(release): Published version ${config.version}'`]);

}

async function exec(command, args) {

  console.log('EXEC => ', command, ...args)

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: cwd,
    });
  
    let stdOut = '';
    let stdErr = '';
  
    child.stdout.on('data', (data) => {
      stdOut += data.toString();
    });
  
    child.stderr.on('data', (data) => {
      stdErr += data.toString();
    });
  
    child.on('close', (code) => {
      if (code === 0) {
        resolve({code, result: stdOut});
      } else {
        reject(new Error(stdOut + stdErr));
      }
    });  
  })
}

main().catch((error) => {
  console.log(error);
  process.exit(1);
})