
import conventionalRecommendedBump from "conventional-recommended-bump";
import { BranchType, GitVersionBranch } from "../types";
import { MessageName, Project, Report, Workspace } from "@yarnpkg/core";
import semver from 'semver';
import { loadConfig } from "./conventionalcommit";

export async function bump(versionBranch: GitVersionBranch, tagPrefix: string, project: Project, workspace: Workspace, report: Report) : Promise<string | undefined> {

  const currentVersion = workspace.manifest.version;
  if (!currentVersion) {
    report.reportWarning(MessageName.UNNAMED, 'No version in manifest. Breaking off')
    return;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const config = await loadConfig(project);
  
      conventionalRecommendedBump({
        config: config,
        tagPrefix: tagPrefix,
        path: workspace.relativeCwd,
      }, {
          headerPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!?: (.*)$/,
          breakingHeaderPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!: (.*)$/,
          revertPattern: /^(?:Merged PR \d+: )?(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
          warn: (msg: string) => report.reportWarning(MessageName.UNNAMED, msg)
      } as any, (error, recommendation) => {
        report.reportJson(recommendation)
        if (recommendation.releaseType) {                    
          if (recommendation.reason) {
            report.reportInfo(MessageName.UNNAMED, `${recommendation.reason} => ${recommendation.releaseType}`);
          }

          if (versionBranch.branchType == BranchType.MAIN) {
            report.reportInfo(MessageName.UNNAMED, 'Bumping official release')
            resolve(semver.inc(currentVersion, recommendation.releaseType) ?? undefined);
          } else {
            report.reportInfo(MessageName.UNNAMED, `Bumping on prerelease ${versionBranch.name}`)
            if (semver.prerelease(currentVersion)) {
              // run simple prerelease increment when already in prerelease
              resolve(semver.inc(currentVersion, `prerelease`) ?? undefined);  
            } else {
              resolve(semver.inc(currentVersion, `pre${recommendation.releaseType}`, versionBranch.name) ?? undefined);  
            }
          }
        } else {
          report.reportInfo(MessageName.UNNAMED, 'No recommendation found')
          if (versionBranch.branchType != BranchType.MAIN) {
            report.reportInfo(MessageName.UNNAMED, `Bumping on prerelease ${versionBranch.name}`)
            if (semver.prerelease(currentVersion)) {
              // run simple prerelease increment when already in prerelease
              resolve(semver.inc(currentVersion, `prerelease`) ?? undefined);  
            } else {
              resolve(semver.inc(currentVersion, `prepatch`, versionBranch.name) ?? undefined);  
            }
          }

        }
      });
    } catch(error) {
      reject(error)
    }  
  })
    

}
