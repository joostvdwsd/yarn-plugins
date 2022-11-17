import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, execUtils, LightReport, MessageName, Project, Report, structUtils, Workspace } from "@yarnpkg/core";
import { GitVersionConfiguration } from "../utils/configuration";
import { BranchType, PublishedPackage, PublishedVersion } from "../types";
import {} from '@yarnpkg/plugin-npm';
import * as t from 'typanion';

import { join, join as pjoin } from 'path';
import { GitVersionTagCommand } from "./tag";
import { GitVersionCommitCommand } from "./commit";
import { existsSync } from "fs";
import { Option } from "clipanion";
import { runStep } from "../utils/report";
import { CONFIG_FILE, PrepublishedPackageConfig, prepublishedPackageName } from "../utils/prepublished-packages";
import { readFile } from "fs/promises";
import { updateWorkspacesWithVersion } from "../utils";
import PQueue from "p-queue";
import { cpus } from "os";

const parseChangelog = require("changelog-parser");

export class GitVersionPublishPackedCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `publish-packed`],
  ];

  packageFolder = Option.String('Output folder', 'gitversion-package');
  maxConcurrency = Option.String(`-m,--max-concurrency`, {
    description: `is the maximum number of jobs that can run at a time, defaults to the number of logical CPUs on the current machine.`,
    validator: t.cascade(t.isNumber(), [
      t.isInteger(),
      t.isInInclusiveRange(1, 100),
    ])
  });

  dryRun = Option.Boolean('--dryRun', false);
  skipTag = Option.Boolean('--skipTag', false);
  skipCommit = Option.Boolean('--skipCommit', false);

  async execute() {

    // Making sure the repository is in a state where we can execute the different publish scripts
    await runStep('Preparing workspace for prepublished packages', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }

      const configFileLocation = join(this.packageFolder, CONFIG_FILE);

      const config: PrepublishedPackageConfig = JSON.parse(await readFile(configFileLocation, 'utf-8'));

      if (configuration.versionBranch.name !== config.versionBranch) {
        report.reportError(MessageName.UNNAMED, 'Running on different branch then the package. Breaking off');
        return;
      }

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);
      updateWorkspacesWithVersion(project.workspaces, config.version, report);
    });

    // first execute tag

    const doSkipTag = this.dryRun || this.skipTag;
    if (!doSkipTag) {
      const tagCommand = new GitVersionTagCommand();
      tagCommand.context = this.context;
      tagCommand.cli = this.cli;
      await tagCommand.execute();
    } else {
      console.log("Skipping tag")
    }

    const doSkipCommit = this.dryRun || this.skipCommit;
    if (!doSkipCommit) {
      const commitCommand = new GitVersionCommitCommand();
      commitCommand.context = this.context;
      commitCommand.cli = this.cli;
      await commitCommand.execute();
    } else {
      console.log("Skipping commit")
    }
    
    await runStep('Pubishing prepacked packages', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }   

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {

        const publicWorkspaces = project.workspaces.filter(this.filterPublicWorkspace);

        const queue = new PQueue({
          concurrency: this.maxConcurrency ? this.maxConcurrency : cpus().length
        })

        queue.addAll(publicWorkspaces.map((workspace) => this.execPublish(configuration, report, workspace, project)));
        await queue.onIdle();

        for (const workspace of publicWorkspaces) {
          await this.execPublish(configuration, report, workspace, project);
        }

        const publishedVersion : PublishedVersion = {
          ... await this.readChangeLog(project.topLevelWorkspace),
          packages: await Promise.all(publicWorkspaces.map(workspace => this.readChangeLog(workspace)))
        }

        await project.configuration.triggerHook(hooks => {
          return hooks.afterPublish;
        }, project, configuration.versionBranch, publishedVersion);
      }
    });
  }

  private execPublish(configuration: GitVersionConfiguration, report: Report, workspace: Workspace, project: Project) {
    return async () => {
      let releaseTagPostfix: string[] = [];
      if (configuration.versionBranch.branchType === BranchType.FEATURE || configuration.versionBranch.branchType === BranchType.PRERELEASE) {
        releaseTagPostfix = ['--tag', configuration.versionBranch.name];
      }
      report.reportInfo(MessageName.UNNAMED, `Publishing ${structUtils.stringifyIdent(workspace.locator)}`);

      const packageName = prepublishedPackageName(workspace);
      const packageLocation = join(project.cwd, this.packageFolder, packageName);

      if (!existsSync(packageLocation)) {
        report.reportError(MessageName.EXCEPTION, `Package not found in the package folder: '${packageName}'`);
      } else {
        const npmRegistryServer = configuration.yarnConfig.get('npmRegistryServer');

        if (!this.dryRun) {
          report.reportInfo(MessageName.UNNAMED, 'Running: ' + ['npm', 'publish', packageLocation, ...releaseTagPostfix].join(' '));
          const result = await execUtils.execvp('npm', ['publish', packageLocation, ...releaseTagPostfix], {
            cwd: workspace.cwd,
          });
          if (result.code !== 0) {
            report.reportError(MessageName.EXCEPTION, result.stdout);
            report.reportError(MessageName.EXCEPTION, result.stderr);
            throw new Error('Error publishing packages');
          }

          report.reportInfo(MessageName.UNNAMED, result.stdout);
        } else {
          report.reportInfo(MessageName.UNNAMED, 'skipping publish due to dryRun. Would run command:');
          report.reportInfo(MessageName.UNNAMED, ['npm', 'publish', packageLocation, '--registry', npmRegistryServer, ...releaseTagPostfix].join(' '));
          report.reportInfo(MessageName.UNNAMED, `In folder: ${workspace.cwd}`);
        }
      }
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