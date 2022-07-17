"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitVersionConfiguration = void 0;
const core_1 = require("@yarnpkg/core");
const clipanion_1 = require("clipanion");
const types_1 = require("./types");
const git_1 = require("./utils/git");
class GitVersionConfiguration {
    constructor(yarnConfig, branchName) {
        this.yarnConfig = yarnConfig;
        const featurePattenStrings = yarnConfig.get('featureBranchPatterns');
        this.featureBranchPatterns = featurePattenStrings.map((pattern) => new RegExp(pattern));
        this.mainBranch = yarnConfig.get('mainBranch');
        this.independentVersioning = yarnConfig.get('independentVersioning');
        this.versionTagPrefix = yarnConfig.get('versionTagPrefix');
        this.versionBranch = this.parse(branchName);
    }
    static async fromContext(context) {
        const yarnConfig = await core_1.Configuration.find(context.cwd, context.plugins);
        const branch = await (0, git_1.currentBranch)();
        return new GitVersionConfiguration(yarnConfig, branch);
    }
    parse(branchName) {
        if (this.mainBranch === branchName) {
            return {
                branchType: types_1.BranchType.MAIN,
                name: branchName
            };
        }
        for (let branchPattern of this.featureBranchPatterns) {
            if (branchPattern.test(branchName)) {
                const matches = branchPattern.exec(branchName);
                if (matches.length === 2) {
                    return {
                        name: matches[1],
                        branchType: types_1.BranchType.FEATURE
                    };
                }
                else {
                    throw new clipanion_1.UsageError(`The feature pattern '${branchPattern.source}' matched the current branch but it should result in exact 1 group match`);
                }
            }
        }
    }
}
exports.GitVersionConfiguration = GitVersionConfiguration;
GitVersionConfiguration.definition = {
    featureBranchPatterns: {
        description: `Feature branches. This will apply the following rules to bumps:
  - version pattern: 'x.x.x-<<feature>>.<<increment>>'
  - always increment on each commit
  - no checking for conventional commits in git history
  - publish on npm channel '<<feature>>'`,
        isArray: true,
        type: core_1.SettingsType.STRING,
        default: [
            '$feature/(.*)^'
        ]
    },
    releaseBranchPatterns: {
        description: `Release branches. This will apply the following rules to bumps:
  - Official release channels
  - Conventional commits enabled
  - publish on npm channel '<<release>>'`,
        isArray: true,
        type: core_1.SettingsType.STRING,
        default: [
            '$release/(.*)^'
        ]
    },
    mainBranch: {
        description: `The main branch. This is the official channel and will produce npm packages with the lates npm disttag`,
        type: core_1.SettingsType.STRING,
        default: 'main'
    },
    independentVersioning: {
        description: 'When independent versioning is enabled each package will have a different version based on the commits in the package folder',
        type: core_1.SettingsType.BOOLEAN,
        default: false
    },
    versionTagPrefix: {
        description: 'The prefix used for git tags. Defaults to "v"',
        type: core_1.SettingsType.STRING,
        default: 'v'
    }
};
