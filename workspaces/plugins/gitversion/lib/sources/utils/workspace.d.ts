import { Workspace } from "@yarnpkg/core";
export declare function updateWorkspacesWithVersion(workspaces: Workspace[], version: string): Promise<void[]>;
export declare function updateWorkspaceWithVersion(workspace: Workspace, version: string): Promise<void>;
