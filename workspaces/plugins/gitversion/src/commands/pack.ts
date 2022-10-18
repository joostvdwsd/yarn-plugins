import { BaseCommand } from "@yarnpkg/cli";
import { execUtils, MessageName, Project, Report, structUtils, Workspace } from "@yarnpkg/core";
import { BranchType, PublishedPackage, PublishedVersion } from "../types";

import { join, join as pjoin } from 'path';
import { existsSync } from "fs";
import { Option } from "clipanion";
import { runStep } from "../utils/report";
import { mkdir, writeFile } from "fs/promises";

import PQueue from 'p-queue';

// @ts-ignore
import { cpus } from "os";
import { CONFIG_FILE, PrepublishedPackageConfig, prepublishedPackageName } from "../utils/prepublished-packages";
import * as t from 'typanion';

const parseChangelog = require("changelog-parser");

export class GitVersionPackCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `pack`],
  ];

  outputFolder = Option.String('Output folder', 'gitversion-package');
  maxConcurrency = Option.String(`-m,--max-concurrency`, {
    description: `is the maximum number of jobs that can run at a time, defaults to the number of logical CPUs on the current machine.`,
    validator: t.isNumber()
  });

  async execute() {

    
    await runStep('Packaging packages', this.context, async (report, configuration) => {
      try {
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
          });

          const queue = new PQueue({
            concurrency: this.maxConcurrency ? this.maxConcurrency : cpus().length
          })

          queue.addAll(publicWorkspaces.map((workspace) => this.execPackCommand(workspace, report, packFolder)));
          await queue.onIdle();

          try {
            report.reportInfo(MessageName.UNNAMED, 'Generating changelog');
            const diff = await execUtils.execvp('git', ['diff', '--', '*CHANGELOG.md'], {
              cwd: project.cwd
            });

            await writeFile(join(packFolder, 'gitversion.changelog.patch'), diff.stdout);
          } catch (error) {
            report.reportWarning(MessageName.UNNAMED, `Error generating changelog diff: '${error}'`);
          }

          report.reportInfo(MessageName.UNNAMED, 'Generating config');
          const configContent = JSON.stringify({
            versionBranch: configuration.versionBranch.name,
            version: project.topLevelWorkspace.manifest.version,
          } as PrepublishedPackageConfig)
          await writeFile(join(packFolder, CONFIG_FILE), configContent, 'utf-8');
        }
      } catch (error) {
        throw error;
      }
    });
  }

  execPackCommand(workspace: Workspace, report: Report, packFolder: string) {
    return async () => {
      report.reportInfo(MessageName.UNNAMED, `Packing ${structUtils.stringifyIdent(workspace.locator)}`)
      await execUtils.execvp('yarn', ['pack', '-o', join(packFolder, prepublishedPackageName(workspace))], {
        cwd: workspace.cwd,
      })
    }
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