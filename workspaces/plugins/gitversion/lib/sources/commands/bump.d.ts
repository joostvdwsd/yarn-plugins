import { BaseCommand } from "@yarnpkg/cli";
export declare class GitVersionBumpCommand extends BaseCommand {
    static paths: string[][];
    execute(): Promise<void>;
}
