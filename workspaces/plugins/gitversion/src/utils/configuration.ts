import { CommandContext, Configuration, ConfigurationDefinitionMap, Locator, MessageName, Project, Report, SettingsType, StreamReport, Workspace } from "@yarnpkg/core";
import { UsageError } from "clipanion";
import { BranchType, GitVersionBranch } from "../types";
import { currentBranch } from "./git";

export const DEFAULT_REPO_VERSION = '0.0.0';


export class GitVersionConfiguration {

  static definition : Partial<ConfigurationDefinitionMap> = {
    featureBranchPatterns: {
      description: `Feature branches. This will apply the following rules to bumps:
  - version pattern: 'x.x.x-<<feature>>.<<increment>>'
  - always increment on each commit
  - no checking for conventional commits in git history
  - publish on npm channel '<<feature>>'`,
      isArray: true,
      type: SettingsType.STRING,
      default: [
        '^feature/(.*)$'
      ]
    },
    releaseBranchPatterns: {
      description: `Release branches. This will apply the following rules to bumps:
  - Official release channels
  - Conventional commits enabled
  - publish on npm channel '<<release>>'`,
      isArray: true,
      type: SettingsType.STRING,
      default: [
        '^release/(.*)$'
      ]
    },
    mainBranch: {
      description: `The main branch. This is the official channel and will produce npm packages with the lates npm disttag`,
      type: SettingsType.STRING,
      default: 'main'
    },
    independentVersioning: {
      description: 'When independent versioning is enabled each package will have a different version based on the commits in the package folder',
      type: SettingsType.BOOLEAN,
      default: false
    },
    versionTagPrefix: {
      description: 'The prefix used for git tags. Defaults to "v"',
      type: SettingsType.STRING,
      default: 'v'
    }
  }

  static async fromContext(context: CommandContext)  {
    const yarnConfig = await Configuration.find(context.cwd, context.plugins);
    const branch = await currentBranch();

    const report = await StreamReport.start({
      configuration: yarnConfig,
      includeFooter: false,
      stdout: context.stdout,
    }, async report => {
    });

    return new GitVersionConfiguration(yarnConfig, branch, report);
  }

  public readonly featureBranchPatterns: RegExp[];
  public readonly mainBranch: string;
  public readonly independentVersioning: boolean;
  public readonly versionTagPrefix: string;
  public readonly report : Report;


  public readonly versionBranch: GitVersionBranch;
  public readonly yarnConfig: Configuration;

  constructor(yarnConfig: Configuration, branchName: string, report: Report) {
    this.yarnConfig = yarnConfig;
    const featurePattenStrings = yarnConfig.get('featureBranchPatterns');
    this.report = report;

    this.featureBranchPatterns = featurePattenStrings.map((pattern) => new RegExp(pattern));

    this.mainBranch = yarnConfig.get('mainBranch');
    this.independentVersioning = yarnConfig.get('independentVersioning');
    this.versionTagPrefix = yarnConfig.get('versionTagPrefix');
    this.versionBranch = this.parse(branchName);

    report.reportInfoOnce(MessageName.UNNAMED, `Running on branch: '${branchName}'`);
    report.reportInfoOnce(MessageName.UNNAMED, `Detected branch type: '${this.versionBranch.branchType}'`);
  }

  parse(branchName: string) : GitVersionBranch {
    if (this.mainBranch === branchName) {
      return {
        branchType: BranchType.MAIN,
        name: branchName
      }
    }

    for (let branchPattern of this.featureBranchPatterns) {
      if (branchPattern.test(branchName)) {
        const matches = branchPattern.exec(branchName);

        if (matches && matches.length === 2) {
          return {
            name: matches[1],
            branchType: BranchType.FEATURE
          };
        } else {
          throw new UsageError(`The feature pattern '${branchPattern.source}' matched the current branch but it should result in exact 1 group match`);
        }
      }
    }    

    return {
      name: 'unknown',
      branchType: BranchType.UNKNOWN
    };
  }
}