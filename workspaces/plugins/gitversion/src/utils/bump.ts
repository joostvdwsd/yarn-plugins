
import conventionalRecommendedBump from "conventional-recommended-bump";
import { BranchType, GitVersionBranch } from "../types";
import { MessageName, Project, Report, Workspace } from "@yarnpkg/core";
import semver from 'semver';
import { loadConfig } from "./conventionalcommit";

export async function bump(versionBranch: GitVersionBranch, tagPrefix: string, project: Project, workspace: Workspace, report: Report) : Promise<string | undefined> {

  const currentVersion = workspace.manifest.version;
  if (!currentVersion) {
    return;
  }

  return new Promise(async (resolve, reject) => {
    try {
      const config = await loadConfig(project);
  
      conventionalRecommendedBump({
        config: config,
        tagPrefix: tagPrefix
      }, {
          headerPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!?: (.*)$/,
          breakingHeaderPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!: (.*)$/,
          revertPattern: /^(?:Merged PR \d+: )?(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
      } as any, (error, recommendation) => {
        
        if (recommendation.releaseType) {          
          if (recommendation.reason) {
            report.reportInfo(MessageName.UNNAMED, recommendation.reason);
          }

          if (versionBranch.branchType == BranchType.MAIN) {
            report.reportInfo(MessageName.UNNAMED, 'Bumping official release')
            resolve(semver.inc(currentVersion, recommendation.releaseType) ?? undefined);
          } else {
            report.reportInfo(MessageName.UNNAMED, `Bumping on prerelease ${versionBranch.name}`)
            resolve(semver.inc(currentVersion, `pre${recommendation.releaseType}`, versionBranch.name) ?? undefined);
          }
        }
      });
    } catch(error) {
      reject(error)
    }  
  })
    

}
