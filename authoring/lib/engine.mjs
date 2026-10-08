// The AutomataStudio engine, loaded from a checkout of the app.
//
// The machines in this library are written as specs (authoring/specs/) and
// turned into .automaton files by the app's own code: its layout, its save
// format, its deciders. Point ENGINE at a checkout of thethinkmachine/AutomataStudio;
// by default it is looked for beside this repository, then in .engine (where CI
// puts it). Run with `node --conditions=browser --conditions=development`, as the
// library's build is run — Solid resolves to an inert stub without them.

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const LIBRARY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function findEngine() {
  const tries = [process.env.ENGINE, join(LIBRARY_ROOT, '.engine'), join(LIBRARY_ROOT, '../AutomataPlayground'), join(LIBRARY_ROOT, '../AutomataStudio')]
    .filter(Boolean).map(p => resolve(p));
  const hit = tries.find(p => existsSync(join(p, 'scripts/library/env.mjs')));
  if (!hit) throw new Error(`No AutomataStudio checkout found. Set ENGINE to one; looked in:\n  ${tries.join('\n  ')}`);
  return hit;
}

export const ENGINE = findEngine();
const load = rel => import(pathToFileURL(join(ENGINE, rel)).href);

const env = await load('scripts/library/env.mjs');
export const App = env.App;
export const { MachineTypes, getMachineConfig, APP_VERSION } = await load('js/state.js');
export const { sugiyamaLayout, circularLayout } = await load('js/canvas.js');
export const { SCHEMA_VERSION, WORKSPACE_FORMAT } = await load('js/persistence.js');
export const analyze = await load('js/library/analyze.js');
export const { machineIdOf } = await load('js/library/hash.js');
export const { folderFor, slugify } = await load('scripts/library/seed.mjs');
export const { withMachine } = await load('js/exercise/grade.js');
