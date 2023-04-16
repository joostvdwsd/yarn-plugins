export declare interface ParserOpts {
  headerPattern: RegExp;
  breakingHeaderPattern: RegExp;
  headerCorrespondence: string[];
  noteKeywords: string[];
  revertPattern: RegExp;
  revertCorrespondence: string[];
  issuePrefixes?: string[];  
}

export declare interface WriterOpts {
  groupBy: string;
  commitsSort: string[];
  commitGroupsSort: string;
  noteGroupsSort: string;
  mainTemplate: string;
  headerPartial: string;
  commitPartial: string;
  footerPartial: string;
  notesSort?: any;
  transform?: any;
}

export declare interface ConventionalChangelogOpts<P = ParserOpts, W = WriterOpts> {
  parserOpts: P;
  writerOpts: W;
}

export declare interface RecommendedBumpOpts<P = ParserOpts> {
  parserOpts: P;
  whatBump?: any;
}

export declare interface ConventionalCommitsConfigType {
  type: string;
  section: string;
  hidden?: boolean;
}

export declare interface ConventionalCommitsConfig {
  types?: ConventionalCommitsConfigType[];
  issueUrlFormat?: string;
  commitUrlFormat?: string;
  compareUrlFormat?: string;
  userUrlFormat?: string;
  issuePrefixes?: string[];
}

export declare interface PresetConfig<P = ParserOpts, W = WriterOpts> {
  conventionalChangelog: ConventionalChangelogOpts;
  recommendedBumpOpts: RecommendedBumpOpts;
  parserOpts: P;
  writerOpts: W;
}

export declare type PresetConfigAngular = PresetConfig<Omit<ParserOpts, 'breakingHeaderPattern' | 'issuePrefixes'>>
export declare type PresetConfigAtom = PresetConfig<Pick<ParserOpts, 'headerPattern' | 'headerCorrespondence'>>
export declare type PresetConfigCodeMirror = PresetConfig<
  Pick<ParserOpts, 'headerPattern' | 'headerCorrespondence'>, 
  Pick<WriterOpts, 'groupBy' | 'commitsSort' | 'commitGroupsSort'>
>

export type AnyParserOpts = Partial<ParserOpts> & Pick<ParserOpts, 'headerPattern' | 'headerCorrespondence'>; 
export type AnyWriterOpts = Partial<WriterOpts> & Pick<WriterOpts, 'groupBy' | 'commitsSort' | 'commitGroupsSort'>; 

export type AnyPresetConfig = PresetConfig<AnyParserOpts, AnyWriterOpts>