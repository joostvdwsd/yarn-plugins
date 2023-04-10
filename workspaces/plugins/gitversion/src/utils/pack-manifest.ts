import { Project, Report, structUtils, Workspace } from "@yarnpkg/core";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { bumpChangelog } from "./bump";
import { GitVersionConfiguration } from "./configuration";
import { getGitHead, getGitStatusHash, tagPrefix } from "./git";

const PACK_MANIFEST_NAME = 'pack.manifest.json'

export interface WorkspaceInfo {
  version?: string;
  changelog?: string;
  name: string;
  cwd?: string;
}

export interface IPackManifest {
  project: WorkspaceInfo;
  packages: Record<string, WorkspaceInfo>;
}

export interface PackManifestGitStatus {
  head: string;
  statusHash: string;
}

export class PackManifest implements IPackManifest {
  project: WorkspaceInfo;
  packages: Record<string, WorkspaceInfo> = {};
  gitStatus?: PackManifestGitStatus;

  constructor(project: WorkspaceInfo, gitStatus: PackManifestGitStatus) {
    this.project = project;
    this.gitStatus = gitStatus;
  }  

  async write(packFolder: string) {
    const fileName = join(packFolder, PACK_MANIFEST_NAME);
    const content = JSON.stringify({
      project: this.project,
      packages: this.packages,
      gitStatus: this.gitStatus,
    }, null, 2);
    return writeFile(fileName, content, 'utf-8')
  }

  static async workspaceInfo(workspace: Workspace, configuration: GitVersionConfiguration, report: Report) {
    const version = workspace.manifest.version ?? '0.0.0';
    return {
      name: structUtils.slugifyLocator(workspace.locator),
      cwd: workspace.cwd,
      version: version,
      changelog: await bumpChangelog(configuration.versionBranch, version, tagPrefix(configuration.versionTagPrefix), workspace, report)
    }
  }

  static async gitStatus(project: Project) {
    return {
      head: await getGitHead(project.cwd),
      statusHash: await getGitStatusHash(project.cwd)
    }
  }

  static async fromWorkspaces(project: Project, workspaces: Workspace[], configuration: GitVersionConfiguration, report: Report) {
    const manifest = new PackManifest(await this.workspaceInfo(project.topLevelWorkspace, configuration, report), await this.gitStatus(project));

    for (const workspace of workspaces) {
      const info = await this.workspaceInfo(workspace, configuration, report)
      manifest.packages[info.name] = info;
    }

    return manifest;
  }

  static async fromPackageFolder(project: Project, packFolder: string) {
    const fileName = join(packFolder, PACK_MANIFEST_NAME);
    if (existsSync(fileName)) {
      const content = JSON.parse(await readFile(fileName, 'utf-8'));

      const result = new PackManifest(content.project, content.gitStatus);

      result.packages = content.packages;  
      return result;
    }
    return;
  }
}