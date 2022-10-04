import { MessageName, Project, Report, structUtils, Workspace } from "@yarnpkg/core";
import { BranchType, GitVersionBranch } from "../types";
import conventionalChangelog from 'conventional-changelog';
import { loadConfig } from "./conventionalcommit";
import * as fs from 'fs';
import { join } from "path";

const START_OF_LAST_RELEASE_PATTERN = /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+|<a name=)/m;
const CHANGELOG_FILE = 'CHANGELOG.md';
const LAST_RELEASE_PATTERN = /^#+ \[(.*)\]/m;

export async function changelog(versionBranch: GitVersionBranch, newVersion: string, tagPrefix: string, project: Project, workspace: Workspace, report: Report) {

  return new Promise(async (resolve, reject) : Promise<void> => {
    if (versionBranch.branchType === BranchType.FEATURE) {
      report.reportInfo(MessageName.UNNAMED, '[CHANGELOG] Skipping changelog due to feature branch');
      return resolve(null);
    }

    try {
      const config = await loadConfig(project);

      const filename = join(workspace.cwd, CHANGELOG_FILE);

      const header = '# Changelog\n\nAll notable changes to this project will be documented in this file\n';

      let oldContent = fs.readFileSync(filename, 'utf-8');

      const lastReleaseMatch = oldContent.match(LAST_RELEASE_PATTERN);
      
      if (lastReleaseMatch && lastReleaseMatch.length > 1) {
        if (lastReleaseMatch[1] === newVersion) {
          report.reportInfo(MessageName.UNNAMED, 'Release already in CHANGELOG.md. Skipping new update');
          return resolve(null);
        }
      }

      const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN);
      // find the position of the last release and remove header:
      if (oldContentStart !== -1) {
        oldContent = oldContent.substring(oldContentStart)
      }
      let content = ''

      const changelogStream = conventionalChangelog({
        config: config,
        tagPrefix: tagPrefix,
        path: workspace.cwd,
      } as any, {
        version: newVersion,
        host: 'unknown'
      }, { 
        merges: null, 
        path: workspace.relativeCwd 
      }, {
        headerPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!?: (.*)$/,
        breakingHeaderPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!: (.*)$/,
        revertPattern: /^(?:Merged PR \d+: )?(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
      } as any);
      
      changelogStream.on('data', function (buffer) {
        content += buffer.toString()
      })

      changelogStream.on('end', function () {
        report.reportInfo(MessageName.UNNAMED, `[CHANGELOG] Outputting changes to ${structUtils.stringifyLocator(workspace.locator)}/${CHANGELOG_FILE}`)
        fs.writeFileSync(filename, header + '\n' + (content + oldContent).replace(/\n+$/, '\n'), 'utf-8')
      })
    } catch (error) {
      return reject(error)
    }

    resolve(null);
  })
}

function verifyExistence (filename: string) {
  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, '\n', 'utf-8');
  }
}
