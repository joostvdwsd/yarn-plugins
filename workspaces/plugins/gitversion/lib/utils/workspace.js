"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkspaceWithVersion = exports.updateWorkspacesWithVersion = void 0;
async function updateWorkspacesWithVersion(workspaces, version) {
    return Promise.all(workspaces.map((workspace) => updateWorkspaceWithVersion(workspace, version)));
}
exports.updateWorkspacesWithVersion = updateWorkspacesWithVersion;
async function updateWorkspaceWithVersion(workspace, version) {
    if (workspace.manifest.version !== version) {
        console.log(`@${workspace.locator.scope}/${workspace.locator.name}`, workspace.manifest.version, '=>', version);
        workspace.manifest.version = version;
        return workspace.persistManifest();
    }
}
exports.updateWorkspaceWithVersion = updateWorkspaceWithVersion;
