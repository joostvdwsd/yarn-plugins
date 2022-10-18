import { Workspace } from "@yarnpkg/core";

export const DEFAULT_FODLER = 'gitversion-package';
export const CONFIG_FILE = 'gitversion.config.json';
export const CHANGELOG_DIFF_FILE = 'gitversion.changelog.patch';

export function prepublishedPackageName(workspace: Workspace) {
  return `${workspace.locator.scope ? workspace.locator.scope + '-' : ''}${workspace.locator.name}-${workspace.manifest.version}.tgz`
}
export interface PrepublishedPackageConfig {
  version: string;
  versionBranch: string;
}