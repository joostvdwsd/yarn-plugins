import { BaseCommand } from "@yarnpkg/cli";
import { Locator, Workspace } from "@yarnpkg/core";
import { GitVersionBranch } from "../types";
export declare class GitVersionRestoreCommand extends BaseCommand {
    static paths: string[][];
    execute(): Promise<void>;
    updateWorkspaceFromGit(tagPrefix: string, versionBranch: GitVersionBranch, workspace: Workspace): Promise<void>;
    /**
     * Determines the latest release tag.
     * @param prerelease (optional) A pre-release suffix.
     * @returns the latest release found in the tag history
     */
    determineCurrentGitVersion(defaultTagPrefix: string, versionBranch: GitVersionBranch, childLocator?: Locator): Promise<string>;
    escapeRegExp(text: string): string;
}
