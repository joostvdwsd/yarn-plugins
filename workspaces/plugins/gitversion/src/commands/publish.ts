import { BaseCommand } from "@yarnpkg/cli";
import { MessageName, miscUtils, Project, Report, scriptUtils, structUtils, Workspace } from "@yarnpkg/core";
import { BranchType, GitVersionBump } from "../types";

import { join } from 'path';
import { createReadStream, existsSync } from "fs";
import { Option, UsageError } from "clipanion";
import { runStep } from "../utils/report";
import { PackManifest } from "../utils/pack-manifest";
import { packUtils } from '@yarnpkg/plugin-pack';
import { npmConfigUtils, npmHttpUtils, npmPublishUtils } from '@yarnpkg/plugin-npm';
import { addCommitAndPush, DEFAULT_REPO_VERSION, GitVersionConfiguration, tag, updateWorkspaceChangelog } from "../utils";
import { Readable } from "stream";

export class GitVersionPublishCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `publish`],
  ];

  dryRun = Option.Boolean('-n,--dry-run', false);
  skipTag = Option.Boolean('--skipTag', false);
  skipChangelog = Option.Boolean('--skipChangelog', false);
  usePrepacked = Option.Boolean('-p,--prepacked', false, {
    description: 'Use a previously packed folder'
  });

  packFolder = Option.String('--pack-folder', '.yarn/gitversion/package');

  otp = Option.String(`--otp`, {
    description: `The OTP token to use with the command`,
  });

  async execute() {
    return await runStep('Publishing packages', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {
        const publicWorkspaces = project.topLevelWorkspace.getRecursiveWorkspaceChildren().filter(this.filterPublicWorkspace);

        const packManifest = (await PackManifest.fromPackageFolder(this.packFolder)) ?? (await PackManifest.fromWorkspaces(project, publicWorkspaces, configuration, report));

        const bumpInfo: GitVersionBump = {
          locator: project.topLevelWorkspace.anchoredLocator,
          private: true,
          version: packManifest.project.version ?? '0.0.0',
          changelog: packManifest.project.changelog,
          workspaces: []
        }

        report.reportSeparator();

        if (this.usePrepacked) {
          // verify pack folder
          for (const workspace of publicWorkspaces) {
            const ident = structUtils.stringifyIdent(workspace.anchoredLocator);

            if (!packManifest.packages[ident]) {
              throw new Error(`Package ${structUtils.prettyIdent(configuration.yarnConfig, workspace.anchoredLocator)} not in package manifest!`);
            }

            const packFilename = join(this.packFolder, packManifest.packages[ident].name) + '.tgz';

            if (!existsSync(packFilename)) {
              throw new Error(`Packge ${packFilename} does not exist!`)
            }
          }
        }

        for (const workspace of publicWorkspaces) {

          await scriptUtils.maybeExecuteWorkspaceLifecycleScript(workspace, `prepublish`, { report });
          const ident = structUtils.stringifyIdent(workspace.anchoredLocator);
          const packFilename = join(this.packFolder, packManifest.packages[ident].name) + '.tgz';
          const version = packManifest.packages[ident]?.version ?? workspace.manifest.version ?? '0.0.0';

          bumpInfo.workspaces.push({
            locator: workspace.anchoredLocator,
            private: false,
            version: version,
            changelog: packManifest.packages[ident].changelog,
          })

          if (this.usePrepacked) {
            workspace.manifest.version = version;
            report.reportInfo(MessageName.UNNAMED, `Pre packed archive found in ${packFilename}. Publishing archive`);
            const packStream = createReadStream(packFilename);
            await this.publish({ configuration, packStream, workspace, report })
          } else {

            workspace.manifest.version = version;
            report.reportInfo(MessageName.UNNAMED, `Packing workspace for publishing ${structUtils.prettyIdent(configuration.yarnConfig, workspace.anchoredLocator)}`);

            if (await packUtils.hasPackScripts(workspace)) {
              await project.restoreInstallState();
            }

            await packUtils.prepareForPack(workspace, { report }, async () => {
              const files = await packUtils.genPackList(workspace);

              for (const file of files) {
                report.reportInfo(null, ` - ${file}`);
              }

              const packStream = await packUtils.genPackStream(workspace, files);
              await this.publish({ configuration, packStream, workspace, report })

            });
          }

          report.reportInfo(MessageName.UNNAMED, `Package archive published`);
          report.reportSeparator();
        }

        await this.tagRelease(configuration, project, packManifest, report);
        await this.updateChangeLogs(configuration, project, packManifest, report);

        await project.configuration.triggerHook(hooks => {
          return hooks.afterPublish;
        }, project, configuration.versionBranch, bumpInfo, this.dryRun);
      }
    });
  }

  async publish({ configuration, workspace, packStream, report }: { configuration: GitVersionConfiguration, workspace: Workspace, packStream: Readable, report: Report }) {
    if (workspace.manifest.name === null || workspace.manifest.version === null) {
      throw new UsageError(`Workspaces must have valid names and versions to be published on an external registry`);
    }

    const buffer = await miscUtils.bufferStream(packStream);
    const registry = npmConfigUtils.getPublishRegistry(workspace.manifest, { configuration: configuration.yarnConfig });

    let releaseTag: string = 'latest';
    if (configuration.versionBranch.branchType === BranchType.FEATURE || configuration.versionBranch.branchType === BranchType.PRERELEASE) {
      releaseTag = configuration.versionBranch.name;
    }

    const gitHead = await npmPublishUtils.getGitHead(workspace.cwd);
    const body = await npmPublishUtils.makePublishBody(workspace, buffer, {
      tag: releaseTag,
      access: undefined,
      registry,
      gitHead,
    });

    if (this.dryRun) {
      report.reportInfo(MessageName.UNNAMED, `[DRY-RUN] Would execute put request to '${registry}' for '${structUtils.prettyLocator(configuration.yarnConfig, workspace.anchoredLocator)}' with tag '${releaseTag}'`);
    } else {
      await npmHttpUtils.put(npmHttpUtils.getIdentUrl(workspace.manifest.name), body, {
        configuration: configuration.yarnConfig,
        registry,
        ident: workspace.manifest.name,
        otp: this.otp,
        jsonResponse: true,
      });
    }
  }

  async tagRelease(configuration: GitVersionConfiguration, project: Project, manifest: PackManifest, report: Report) {
    if (this.dryRun || this.skipTag) {
      report.reportInfo(MessageName.UNNAMED, 'Skipping tag');
      return
    }

    if (configuration.independentVersioning) {
      throw new Error('IndependentVersioning not implemented');
    } else {
      const tagName = `${configuration.versionTagPrefix}${manifest.project.version}`;
      report.reportInfo(MessageName.UNNAMED, `Tagging release to ${tagName}`);
      if (!manifest.project.version) {
        throw new Error('Invalid project version in manifest')
      }
      await tag(`${tagName}`, true, project.cwd);
    }
  }

  async updateChangeLogs(configuration: GitVersionConfiguration, project: Project, manifest: PackManifest, report: Report) {
    if (this.dryRun || this.skipChangelog) {
      report.reportInfo(MessageName.UNNAMED, 'Skipping changelog');
      return
    }

    const topVersion = manifest.project.version ?? DEFAULT_REPO_VERSION;

    if (topVersion === DEFAULT_REPO_VERSION) {
      report.reportInfo(MessageName.UNNAMED, `No active bump detected. Skipping commit step`);
      return;
    }

    if (manifest.project.changelog) {
      const changelogFiles: string[] = [];

      changelogFiles.push(await updateWorkspaceChangelog(project.topLevelWorkspace, topVersion, manifest.project.changelog, report));

      for (const workspace of project.workspaces) {
        const ident = structUtils.stringifyIdent(workspace.anchoredLocator);
        if (manifest.packages[ident]) {
          const changelog = manifest.packages[ident].changelog;
          if (changelog) {
            changelogFiles.push(await updateWorkspaceChangelog(workspace, manifest.packages[ident].version ?? topVersion, changelog, report));
          }
        }
      }

      if (changelogFiles.length === 0) {
        report.reportInfo(MessageName.UNNAMED, 'No changelog files to commit. Skipping commit step');
        return;
      }

      if (configuration.versionBranch.branchType === BranchType.FEATURE) {
        report.reportInfo(MessageName.UNNAMED, 'Skipping changelog commit and push due to feature branch');
        return;
      }

      await addCommitAndPush(changelogFiles, `chore(changelogs): ${topVersion} [skip ci]`, project.cwd)
    }
  }

  filterPublicWorkspace(workspace: Workspace): boolean {
    return workspace.manifest.private === false
  }
}