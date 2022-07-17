import { PortablePath } from "@yarnpkg/fslib";
import { GitVersionBranch } from "../types";
export declare function bump(versionBranch: GitVersionBranch, tagPrefix: string, cwd: PortablePath): Promise<{
    code: number | null;
    result: string;
} | undefined>;
