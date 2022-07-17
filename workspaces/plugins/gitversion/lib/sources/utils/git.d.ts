export declare function checkGit(): Promise<{
    code: number | null;
    result: string;
}>;
export declare function currentBranch(): Promise<string>;
