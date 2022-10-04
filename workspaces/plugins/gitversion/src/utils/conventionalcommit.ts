import { Project } from "@yarnpkg/core";
import conventionalCommits from 'conventional-changelog-conventionalcommits';

export async function loadConfig(project: Project) : Promise<any> {
  return await conventionalCommits;
}