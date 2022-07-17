import { BaseCommand } from "@yarnpkg/cli";
export declare class GitVersionResetCommand extends BaseCommand {
    static paths: string[][];
    execute(): Promise<void>;
}
