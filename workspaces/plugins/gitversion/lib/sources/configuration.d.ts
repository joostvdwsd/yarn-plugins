import { CommandContext, Configuration, ConfigurationDefinitionMap, Project, Workspace } from "@yarnpkg/core";
import { ChangelogEntry, GitVersionBranch } from "./types";
declare module '@yarnpkg/core' {
    interface ConfigurationValueMap {
        featureBranchPatterns: string[];
        releaseBranchPatterns: string[];
        preReleaseBranchPatterns: string[];
        mainBranch: string;
        independentVersioning: boolean;
        versionTagPrefix: string;
    }
}
declare module '@yarnpkg/core' {
    interface Hooks {
        afterPublish(project: Project, workspace: Workspace, changeLog: ChangelogEntry): Promise<void>;
    }
}
export declare class GitVersionConfiguration {
    static definition: Partial<ConfigurationDefinitionMap>;
    static fromContext(context: CommandContext): Promise<GitVersionConfiguration>;
    readonly featureBranchPatterns: RegExp[];
    readonly mainBranch: string;
    readonly independentVersioning: boolean;
    readonly versionTagPrefix: string;
    readonly versionBranch: GitVersionBranch;
    readonly yarnConfig: Configuration;
    constructor(yarnConfig: Configuration, branchName: string);
    parse(branchName: string): GitVersionBranch;
}
