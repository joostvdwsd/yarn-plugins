import { BaseCommand } from "@yarnpkg/cli";
import { MessageName, Project, structUtils, Workspace } from "@yarnpkg/core";
import { BranchType, PublishedPackage, PublishedVersion } from "../types";

import { join, join as pjoin } from 'path';
import { execCapture } from "../utils/exec";
import { existsSync } from "fs";
import { Option } from "clipanion";
import { runStep } from "../utils/report";
import { mkdir, writeFile } from "fs/promises";
const parseChangelog = require("changelog-parser");

export class GitVersionPackCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `pack`],
  ];

  outputFolder = Option.String('Output folder', 'gitversion-package');

  async execute() {

    
    await runStep('Packaging packages', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }   

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {

        const publicWorkspaces = project.workspaces.filter(this.filterPublicWorkspace);
        
        const packFolder = join(project.cwd, this.outputFolder)
        await mkdir(packFolder, {
          recursive: true
        })

        for (const workspace of publicWorkspaces) {
          let releaseTagPostfix : string[] = [];
          if (configuration.versionBranch.branchType === BranchType.FEATURE || configuration.versionBranch.branchType === BranchType.PRERELEASE) {
            releaseTagPostfix = ['--tag', configuration.versionBranch.name];
          }
          report.reportInfo(MessageName.UNNAMED, `Packing ${structUtils.stringifyIdent(workspace.locator)}`)

          await execCapture('yarn', ['pack', '-o', join(packFolder, `${workspace.locator.scope ? workspace.locator.scope + '-' : ''}${workspace.locator.name}-${workspace.manifest.version}.tgz`)], workspace.cwd);
        }

        const diff = await execCapture('git', ['diff', '--', '*CHANGELOG.md'], project.cwd);

        await writeFile(join(packFolder, 'changelog.diff.patch'), diff.result);

        const configContent = JSON.stringify({
          versionTag: configuration.versionBranch.name,
          version: project.topLevelWorkspace.manifest.version
        })
        await writeFile(join(packFolder, 'gitversion.config.json'), configContent, 'utf-8');
      }
    });
  }

  async readChangeLog(workspace: Workspace) : Promise<PublishedPackage> {
    const filePath = pjoin(workspace.cwd, 'CHANGELOG.md');

    const releasedVersion = workspace.manifest.version;

    let currentReleaseChangelog : string | undefined;
    
    if (existsSync(filePath)) {
      const changeLog = await parseChangelog({
        filePath: pjoin(workspace.cwd, 'CHANGELOG.md'),
        removeMarkdown: false
      })

      currentReleaseChangelog = changeLog.versions.find((versionEntry : any) => versionEntry.version === releasedVersion)?.body;
    }
    return {
      version: releasedVersion || '0.0.0',
      changelog: currentReleaseChangelog,
      packageName: structUtils.stringifyIdent(workspace.locator)
    }
}
  
  filterPublicWorkspace(workspace: Workspace) : boolean {
    return workspace.manifest.private === false
  }
}