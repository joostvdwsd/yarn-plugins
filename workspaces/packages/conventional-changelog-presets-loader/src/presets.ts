const ccConventionalCommits = require('conventional-changelog-conventionalcommits');
const ccAngular = require('conventional-changelog-angular');
const ccAtom = require('conventional-changelog-atom');
const ccCodemirror = require('conventional-changelog-codemirror');

import { promisify } from 'util';
import { ConventionalCommitsConfig, PresetConfig, PresetConfigAngular, PresetConfigAtom, PresetConfigCodeMirror } from './types';

export async function presetConventionalCommits(config?: ConventionalCommitsConfig) : Promise<PresetConfig> {
  return ccConventionalCommits(config)
}

export async function presetAngular() : Promise<PresetConfigAngular> {
  return await ccAngular;
}

export async function presetAtom() : Promise<PresetConfigAtom> {
  return promisify<PresetConfigAtom>(ccAtom)();
}

export async function presetCodeMirror() : Promise<PresetConfigCodeMirror> {
  return promisify<PresetConfigAtom>(ccCodemirror)();
}
