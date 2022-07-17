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


export interface ChangelogEntry {        
  version: string | null;
  title: string;
  date: string | null;
  body: string;
}