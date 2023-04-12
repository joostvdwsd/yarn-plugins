import { BaseCommand } from "@yarnpkg/cli";
import { MessageName, miscUtils, Project, Report, scriptUtils, structUtils, Workspace } from "@yarnpkg/core";
import { BranchType, GitVersionBump } from "../types";

import { join } from 'path';
import { GitVersionTagCommand } from "./tag";
import { GitVersionCommitCommand } from "./commit";
import { createReadStream, existsSync } from "fs";
import { Option, UsageError } from "clipanion";
import { runStep } from "../utils/report";
import { PackManifest } from "../utils/pack-manifest";
import { packUtils } from '@yarnpkg/plugin-pack';
import { npmConfigUtils, npmHttpUtils, npmPublishUtils } from '@yarnpkg/plugin-npm';
import { GitVersionConfiguration } from "../utils";
import { Readable } from "stream";


const parseChangelog = require("changelog-parser");

export class GitVersionPublishCommand extends BaseCommand {
  static paths = [
    [`gitversion`, `publish`],
  ];

  dryRun = Option.Boolean('-n,--dry-run', true);
  skipTag = Option.Boolean('--skipTag', false);
  skipCommit = Option.Boolean('--skipCommit', false);

  packFolder = Option.String('Git version package folder', '.yarn/gitversion/package');

  otp = Option.String(`--otp`, {
    description: `The OTP token to use with the command`,
  });  

  async execute() {

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
    
    await runStep('Publishing packages', this.context, async (report, configuration) => {
      if (configuration.versionBranch.branchType === BranchType.UNKNOWN) {
        report.reportError(MessageName.UNNAMED, 'Running on unknown branch type. Breaking off');
        return;
      }   

      const { project } = await Project.find(configuration.yarnConfig, this.context.cwd);

      if (configuration.independentVersioning) {
        report.reportError(MessageName.UNNAMED, 'IndependentVersioning is not implemented')
      } else {
        const publicWorkspaces = project.topLevelWorkspace.getRecursiveWorkspaceChildren().filter(this.filterPublicWorkspace);

        const packManifest = await PackManifest.fromPackageFolder(project, this.packFolder) ?? await PackManifest.fromWorkspaces(project, publicWorkspaces, configuration, report);

        const bumpInfo : GitVersionBump = {
          locator: project.topLevelWorkspace.locator,
          private: true,
          version: packManifest.project.version ?? '0.0.0',
          changelog: packManifest.project.changelog,
          workspaces: []
        }

        report.reportSeparator();

        for (const workspace of publicWorkspaces) {

          await scriptUtils.maybeExecuteWorkspaceLifecycleScript(workspace, `prepublish`, {report});
          const ident = structUtils.slugifyLocator(workspace.locator);
          const packFilename = join(this.packFolder, ident) + '.tgz';

          bumpInfo.workspaces.push({
            locator: workspace.locator,
            private: false,
            version: workspace.manifest.version ?? '0.0.0',
            changelog: packManifest.packages[ident].changelog,            
          })

          if (packManifest.packages[ident] && existsSync(packFilename)) {
            report.reportInfo(MessageName.UNNAMED, `Pre packed archive found in ${packFilename}. Publishing archive`);
            const packStream = createReadStream(packFilename);
            await this.publish({ configuration, packStream, workspace, report })
          } else {

            report.reportInfo(MessageName.UNNAMED, `Packing workspace for publishing ${structUtils.prettyIdent(configuration.yarnConfig, workspace.locator)}`);
            await packUtils.prepareForPack(workspace, {report}, async () => {
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

        await project.configuration.triggerHook(hooks => {
          return hooks.afterPublish;
        }, project, configuration.versionBranch, bumpInfo, this.dryRun);
      }
    });
  }

  async publish( { configuration, workspace, packStream, report } : {configuration: GitVersionConfiguration, workspace: Workspace, packStream: Readable, report: Report }) {
    if (workspace.manifest.name === null || workspace.manifest.version === null) {
      throw new UsageError(`Workspaces must have valid names and versions to be published on an external registry`);
    }

    const buffer = await miscUtils.bufferStream(packStream);
    const registry = npmConfigUtils.getPublishRegistry(workspace.manifest, {configuration: configuration.yarnConfig});

    let releaseTag : string = 'latest';
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
      report.reportInfo(MessageName.UNNAMED, `[DRY-RUN] Would execute put request to '${registry}' for '${structUtils.prettyLocator(configuration.yarnConfig, workspace.locator)}' with tag '${releaseTag}'`);      
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
  
  filterPublicWorkspace(workspace: Workspace) : boolean {
    return workspace.manifest.private === false
  }
}