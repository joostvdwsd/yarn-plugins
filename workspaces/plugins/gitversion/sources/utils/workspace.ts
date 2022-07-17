import { Workspace } from "@yarnpkg/core"

export async function updateWorkspacesWithVersion(workspaces: Workspace[], version: string) {
  return Promise.all(workspaces.map((workspace) => updateWorkspaceWithVersion(workspace, version)));
}

export async function updateWorkspaceWithVersion(workspace: Workspace, version: string) {
  if (workspace.manifest.version !== version) {
    console.log(`@${workspace.locator.scope}/${workspace.locator.name}`, workspace.manifest.version, '=>', version)
    workspace.manifest.version = version
    return workspace.persistManifest()
  }
}