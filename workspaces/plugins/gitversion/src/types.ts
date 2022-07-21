import { Project, Workspace } from "@yarnpkg/core";

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

export interface PublishedPackage {
  readonly version: string;
  readonly packageName: string;
  readonly changelog: string | undefined;
}

export interface PublishedVersion extends PublishedPackage {
  readonly packages: PublishedPackage[];
}

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
    afterPublish(project: Project, branch: GitVersionBranch, publishedVersion: PublishedVersion) : Promise<void>;
  }
}
