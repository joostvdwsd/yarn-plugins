import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, execUtils, MessageName, Project, Report, structUtils, Workspace } from "@yarnpkg/core";
import { BranchType } from "../types";

import { join } from 'path';
import { Option } from "clipanion";
import { runStep } from "../utils/report";
import { mkdir, rm, rmdir } from "fs/promises";

import PQueue from 'p-queue';

// @ts-ignore
import { cpus } from "os";
import * as t from 'typanion';
import { PackManifest } from "../utils/pack-manifest";
import { DEFAULT_REPO_VERSION } from "../utils";

const parseChangelog = require("changelog-parser");

export class GitVersionPackCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `pack`],
  ];

  packFolder = Option.String('--pack-folder', '.yarn/gitversion/package');
  maxConcurrency = Option.String(`-m,--max-concurrency`, {
    description: `is the maximum number of jobs that can run at a time, defaults to the number of logical CPUs on the current machine.`,
    validator: t.isNumber()
  });

  async execute() {
    return await runStep('Packaging packages', this.context, async (report, configuration) => {
      try {
        if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
          report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
          return;
        }   

        const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

        const topVersion = project.topLevelWorkspace.manifest.version ?? DEFAULT_REPO_VERSION;

        if (topVersion === DEFAULT_REPO_VERSION) {
          throw new Error(`No active bump detected. Pack not possible`);
          return;
        }

        const publicWorkspaces = project.workspaces.filter(this.filterPublicWorkspace);
        const packManifest = await PackManifest.fromWorkspaces(project, publicWorkspaces, configuration, report);
        
        const packFolder = join(project.cwd, this.packFolder)
        await rm(packFolder, {
          recursive: true,
          force: true,
        })
        await mkdir(packFolder, {
          recursive: true
        });

        const queue = new PQueue({
          concurrency: this.maxConcurrency ? this.maxConcurrency : cpus().length
        })

        for (const workspace of publicWorkspaces) {
          const workspaceInfo = await PackManifest.workspaceInfo(
            workspace, configuration, report
          );
          queue.add(this.execPackCommand(workspace, configuration.yarnConfig, report, workspaceInfo.name, packFolder));
        }

        await queue.onIdle();

        report.reportInfo(MessageName.UNNAMED, 'Generating config');
        await packManifest.write(packFolder);

      } catch (error) {
        throw error;
      }
    });
  }

  execPackCommand(workspace: Workspace, configuration: Configuration, report: Report, name: string, packFolder: string) {
    return async () => {
      report.reportInfo(MessageName.UNNAMED, `Packing ${structUtils.prettyLocator(configuration, workspace.locator)}`)
      await execUtils.execvp('yarn', ['pack', '-o', `${join(packFolder, name)}.tgz`], {
        cwd: workspace.cwd,
      })
    }
  }
  
  filterPublicWorkspace(workspace: Workspace) : boolean {
    return workspace.manifest.private === false
  }
}