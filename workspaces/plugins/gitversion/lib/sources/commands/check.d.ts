import { BaseCommand } from "@yarnpkg/cli";
export declare class GitVersionCheckCommand extends BaseCommand {
    static paths: string[][];
    execute(): Promise<void>;
}
