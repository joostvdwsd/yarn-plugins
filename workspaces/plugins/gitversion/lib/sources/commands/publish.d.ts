import { BaseCommand } from "@yarnpkg/cli";
export declare class GitVersionPublishCommand extends BaseCommand {
    static paths: string[][];
    execute(): Promise<void>;
}
