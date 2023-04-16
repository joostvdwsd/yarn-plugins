import { Locator, Project } from "@yarnpkg/core";
import { Options as ParserOptions } from 'conventional-commits-parser';
import { AnyPresetConfig } from 'conventional-changelog-presets-loader'

/**
 * Branch matching 
 */
export enum BranchType {
  MAIN = 'main',
  PRERELEASE = 'prerelease',
  RELEASE = 'release',
  FEATURE = 'feature',
  UNKNOWN = 'unknown'
}

export interface GitVersionBranch {
  readonly name: string;
  readonly branchType : BranchType;
}

/**
 * Yarn configuration
 */

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {    
    featureBranchPatterns: string[];
    releaseBranchPatterns: string[];
    mainBranch: string;
    independentVersioning: boolean;
    versionTagPrefix: string;
  }
}

/**
 * Hook config
 */

declare module '@yarnpkg/core' {
  interface Hooks {
    beforeBump(project: Project, branch: GitVersionBranch) : Promise<void>;
    
    afterBump(project: Project, branch: GitVersionBranch, projectBump: GitVersionBump) : Promise<void>;

    afterPublish(project: Project, branch: GitVersionBranch, projectBump: GitVersionBump, dryRun: boolean) : Promise<void>;
    conventionalCommitOptions(previousOptions: AnyPresetConfig) : Promise<AnyPresetConfig>;
  }
}

/**
 * Bump hooks
 */

export interface GitVersionWorkspaceBump {
  locator: Locator;
  version: string;
  private: boolean;
  changelog?: string;
}

export interface GitVersionBump extends GitVersionWorkspaceBump {
  workspaces: GitVersionWorkspaceBump[];
}

/**
 * Conventional commit
 */
export interface ExtendedParserOptions extends ParserOptions {
  breakingHeaderPattern: RegExp;
}

