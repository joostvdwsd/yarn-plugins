import { PortablePath } from "@yarnpkg/fslib";
export declare function execCapture(command: string, args: string[], cwd?: PortablePath): Promise<{
    code: number | null;
    result: string;
}>;
