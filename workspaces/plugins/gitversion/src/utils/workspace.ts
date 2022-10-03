import { MessageName, Report, structUtils, Workspace } from "@yarnpkg/core"

export async function updateWorkspacesWithVersion(workspaces: Workspace[], version: string, report: Report) {
  return Promise.all(workspaces.map((workspace) => updateWorkspaceWithVersion(workspace, version, report)));
}

export async function updateWorkspaceWithVersion(workspace: Workspace, version: string, report: Report) {
  if (workspace.manifest.version !== version) {
    report.reportInfo(MessageName.UNNAMED,`${structUtils.stringifyLocator(workspace.locator)} => ${version}`);
    workspace.manifest.version = version
    return workspace.persistManifest()
  }
}