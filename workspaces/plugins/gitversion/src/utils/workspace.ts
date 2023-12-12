import { MessageName, Report, structUtils, Workspace } from "@yarnpkg/core"
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function updateWorkspacesVersion(workspaces: Workspace[], version: string, report: Report) {
  return Promise.all(workspaces.map((workspace) => updateWorkspaceVersion(workspace, version, report)));
}

export async function updateWorkspaceVersion(workspace: Workspace, version: string, report: Report) {
  if (workspace.manifest.version !== version) {
    report.reportInfo(MessageName.UNNAMED, `${structUtils.prettyLocator(workspace.project.configuration, workspace.anchoredLocator)}: Update version to ${version}`);
    workspace.manifest.version = version
    return workspace.persistManifest()
  }
}

const START_OF_LAST_RELEASE_PATTERN = /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+|<a name=)/m;
const CHANGELOG_FILE = 'CHANGELOG.md';
const LAST_RELEASE_PATTERN = /^#+ \[(.*)\]/m;

export async function updateWorkspacesChangelog(workspaces: Workspace[], version: string, changelog: string, report: Report) {
  return Promise.all(workspaces.map((workspace) => updateWorkspaceChangelog(workspace, version, changelog, report)));
}

export async function updateWorkspaceChangelog(workspace: Workspace, version: string, changelog: string, report: Report) {
  const filename = join(workspace.cwd, CHANGELOG_FILE);

  const header = '# Changelog\n\nAll notable changes to this project will be documented in this file\n';

  let oldContent: string = '';

  try {
    oldContent = await readFile(filename, 'utf-8');
  } catch (_error) {
    // ignore non existing
  }

  const lastReleaseMatch = oldContent.match(LAST_RELEASE_PATTERN);

  if (lastReleaseMatch && lastReleaseMatch.length > 1) {
    if (lastReleaseMatch[1] === version) {
      // report.reportInfo(MessageName.UNNAMED, 'Release already in CHANGELOG.md. Skipping new update');
      return filename;
    }
  }

  report.reportInfo(MessageName.UNNAMED, `${structUtils.prettyLocator(workspace.project.configuration, workspace.anchoredLocator)}: Update changelog`);

  const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN);
  // find the position of the last release and remove header:
  if (oldContentStart !== -1) {
    oldContent = oldContent.substring(oldContentStart)
  }

  report.reportInfo(MessageName.UNNAMED, `[CHANGELOG] Outputting changes to ${structUtils.stringifyLocator(workspace.anchoredLocator)}/${CHANGELOG_FILE}`)
  await writeFile(filename, header + '\n' + (changelog + oldContent).replace(/\n+$/, '\n'), 'utf-8')

  return filename;
}