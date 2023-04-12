import { Project } from "@yarnpkg/core";
import cc from 'conventional-changelog-conventionalcommits';

import conventionalRecommendedBump from 'conventional-recommended-bump';
import { BranchType, ConventionalCommitConfig, GitVersionBranch } from "../types";
import semver from 'semver';
import conventionalChangelog from "conventional-changelog";

export async function loadConventionalCommitConfig(project: Project) : Promise<ConventionalCommitConfig> {

  // const result = await cc();
  // console.log(result)

  // const initialParserOpts : cc;

  return project.configuration.reduceHook(hooks => {
    return hooks.conventionalCommitOptions;
  }, cc);
}

export interface RecommendedBumpResult {
  version: string;
  reason?: string;
  releaseType?: conventionalRecommendedBump.Callback.Recommendation.ReleaseType;
}

export interface RecommendedBumpParams {
  versionBranch: GitVersionBranch;
  currentVersion: string;
  config: ConventionalCommitConfig;
  path: string;
  tagPrefix: string;
}

export async function recommendedBump(options: RecommendedBumpParams) : Promise<RecommendedBumpResult> {
  return new Promise((resolve, reject) => {
    conventionalRecommendedBump({
        config: options.config,
        path: options.path,
        tagPrefix: options.tagPrefix,
      }, options.config.parserOpts, (error, recommendation) => {
      if (error) {
        return reject(error);
      }

      if (!recommendation.releaseType) {
        return reject(new Error('No release type found for bump'));
      }

      let version: string | null;

      if (options.versionBranch.branchType == BranchType.MAIN) {
        version = semver.inc(options.currentVersion, recommendation.releaseType);
      } else {
        if (semver.prerelease(options.currentVersion)) {
          // run simple prerelease increment when already in prerelease
          version = semver.inc(options.currentVersion, `prerelease`);
        } else {
          version = semver.inc(options.currentVersion, `pre${recommendation.releaseType}`, options.versionBranch.name);
        }
      }

      if (!version) {
        return reject(new Error('No version incremented for bump'));
      }
      resolve({
        version: version,
        reason: recommendation.reason,
        releaseType: recommendation.releaseType
      })

    })
  });
}

export interface GenerateChangelogParams {
  version: string;
  config: ConventionalCommitConfig;
  path: string;
  tagPrefix: string;
}

export async function generateChangeLog(options: GenerateChangelogParams) : Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const changelogStream = conventionalChangelog({
      config: options.config,
      tagPrefix: options.tagPrefix,
      path: options.path,
      skipUnstable: true,
    } as any, {
      version: options.version,
      host: 'unknown'
    }, { 
      merges: null, 
      path: options.path
    }, options.config.parserOpts,
      options.config.writerOpts
    );
    let content: string = '';
    
    changelogStream.on('data', function (buffer) {
      content += buffer.toString()
    })
  
    changelogStream.on('end', function () {

      const lines = content.split('\n');

      if (lines.length == 3) {
        if (lines[1].trim().length === 0 && lines[2].trim().length === 0) {
          return resolve(undefined);
        }
      }
      resolve(content);
    })  
  })
}