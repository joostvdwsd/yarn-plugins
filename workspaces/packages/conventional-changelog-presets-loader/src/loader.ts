import { presetConventionalCommits, presetAngular, presetAtom, presetCodeMirror } from './presets';

export type Preset = 'conventional-commits' | 'angular' | 'atom' | 'codemirror';

type PresetLoaderArgs<T extends Preset> = 
  T extends 'conventional-commits' ? Parameters<typeof presetConventionalCommits> : 
  [];

type PresetLoaderResults<T extends Preset> =
T extends 'angular' ? Awaited<ReturnType<typeof presetAngular>> : 
T extends 'atom' ? Awaited<ReturnType<typeof presetAtom>> : 
T extends 'codemirror' ? Awaited<ReturnType<typeof presetCodeMirror>> : 
T extends 'conventional-commits' ? Awaited<ReturnType<typeof presetConventionalCommits>> : 
  never;

export async function loadPreset<P extends Preset>(preset: P, ...args: PresetLoaderArgs<P> ): Promise<PresetLoaderResults<P>> {
  switch (preset) {
    case 'conventional-commits': return presetConventionalCommits(...args) as any;
    case 'angular': return presetAngular() as any;
    case 'atom': return presetAtom() as any;
    case 'codemirror': return presetCodeMirror() as any;
    default: 
      throw new Error('Not possible')
  }
}
