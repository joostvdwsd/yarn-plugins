import { BranchType, GitVersionBranch } from "../types";
import { MessageName, Report, Workspace } from "@yarnpkg/core";
import { generateChangeLog, loadConventionalCommitConfig, recommendedBump } from "./conventionalcommit";

export async function bumpVersion(versionBranch: GitVersionBranch, tagPrefix: string, workspace: Workspace, report: Report) : Promise<string | undefined> {

  const currentVersion = workspace.manifest.version;

  if (!currentVersion) {
    report.reportWarning(MessageName.UNNAMED, 'No version in manifest. Breaking off')
    return;
  }  

  const config = await loadConventionalCommitConfig(workspace.project);

  const bump = await recommendedBump({
    currentVersion: currentVersion,
    versionBranch: versionBranch,
    config: config,
    path: workspace.relativeCwd,
    tagPrefix: tagPrefix,
  });

  return bump.version;
}

export async function bumpChangelog(versionBranch: GitVersionBranch, version: string, tagPrefix: string, workspace: Workspace, report: Report) {

  const currentCwd = process.cwd();
  process.chdir(workspace.project.cwd);

  if (versionBranch.branchType === BranchType.FEATURE) {
    report.reportInfo(MessageName.UNNAMED, '[CHANGELOG] Skipping changelog due to feature branch');
    return;
  }

  const config = await loadConventionalCommitConfig(workspace.project);

  const result = await generateChangeLog({
    config: config,
    version: version,
    path: workspace.relativeCwd,
    tagPrefix: tagPrefix,
  });
  process.chdir(currentCwd);
  return result;
}
