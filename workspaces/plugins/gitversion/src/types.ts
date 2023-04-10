import { Project } from "@yarnpkg/core";
import { Options as ParserOptions } from 'conventional-commits-parser';
import { WriterOptions } from 'conventional-changelog-core';
import { Options as RecommendedBumpOptions} from 'conventional-recommended-bump';
import { IPackManifest } from "./utils/pack-manifest";

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

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {    
    featureBranchPatterns: string[];
    releaseBranchPatterns: string[];
    mainBranch: string;
    independentVersioning: boolean;
    versionTagPrefix: string;
  }
}

export interface ExtendedParserOptions extends ParserOptions {
  breakingHeaderPattern: RegExp;
}

export interface ConventionalCommitConfig {
  writerOpts: WriterOptions;
  parserOpts: ExtendedParserOptions;
  recommendedBumpOpts: RecommendedBumpOptions;
}

declare module '@yarnpkg/core' {
  interface Hooks {
    afterPublish(project: Project, branch: GitVersionBranch, packManifest: IPackManifest, dryRun: boolean) : Promise<void>;
    conventionalCommitOptions(previousOptions: ConventionalCommitConfig) : Promise<ConventionalCommitConfig>;
  }
}
