// A machine from a step function: every state reachable from `start`, found by
// breadth-first search, named by `name`. For the machines whose states are
// configurations of something — a puzzle, a checksum, a protocol — where
// writing δ out by hand would be a transcription, not a design.
//
//   explore({ sigma, start, step(q, a) → q' | null, accept(q), name(q) })
//     → { delta, accept, states }   (spread into a spec)
//
// A step that returns null has no move: the DFA is partial there, which the
// app draws as a missing edge rather than a trap state. Pass `trap: 'name'` to
// draw the trap instead.

import { symbolsOf } from './dsl.mjs';

export function explore({ sigma, start, step, accept, name = q => String(q), trap = null, key = q => JSON.stringify(q), minimize = false }) {
  if (minimize) return exploreMinimal({ sigma, start, step, accept, name, key });
  const syms = symbolsOf(sigma);
  const seen = new Map([[key(start), start]]);
  const queue = [start];
  const rules = [];
  let trapUsed = false;
  while (queue.length) {
    const q = queue.shift();
    for (const a of syms) {
      const r = step(q, a);
      if (r === null || r === undefined) {
        if (trap) { rules.push(`${name(q)} ${a} ${trap}`); trapUsed = true; }
        continue;
      }
      const k = key(r);
      if (!seen.has(k)) { seen.set(k, r); queue.push(r); }
      rules.push(`${name(q)} ${a} ${name(r)}`);
    }
  }
  if (trapUsed) for (const a of syms) rules.push(`${trap} ${a} ${trap}`);
  const states = [...seen.values()];
  const names = states.map(name);
  if (new Set(names).size !== names.length) throw new Error('explore: two states share a name');
  return {
    sigma,
    states: [...names, ...(trapUsed ? [trap] : [])],
    start: name(start),
    accept: states.filter(accept).map(name),
    delta: rules.join('\n')
  };
}

/** The run of a step function on a word: the final state, or null if it got stuck. */
export function runSteps({ start, step }, word) {
  let q = start;
  for (const a of word) { q = step(q, a); if (q === null || q === undefined) return null; }
  return q;
}

/**
 * The same, with equivalent states merged (Moore's refinement; a missing move
 * is a dead end, and two states that differ only in where they die are one).
 * Each merged state takes the name of its first-found member — the one reached
 * by the shortest word.
 */
function exploreMinimal({ sigma, start, step, accept, name, key }) {
  const syms = symbolsOf(sigma);
  const states = [start], index = new Map([[key(start), 0]]), next = [];
  for (let i = 0; i < states.length; i++) {
    next[i] = syms.map(a => {
      const r = step(states[i], a);
      if (r === null || r === undefined) return -1;
      const k = key(r);
      if (!index.has(k)) { index.set(k, states.length); states.push(r); }
      return index.get(k);
    });
  }
  // dead states (no way to accept) are dropped first, so they do not keep two live states apart
  const live = new Set(states.map((q, i) => (accept(q) ? i : -1)).filter(i => i >= 0));
  for (let grew = true; grew;) { grew = false; next.forEach((row, i) => { if (!live.has(i) && row.some(j => live.has(j))) { live.add(i); grew = true; } }); }
  const to = (i, k) => (live.has(next[i][k]) ? next[i][k] : -1);
  let cls = states.map((q, i) => (live.has(i) ? (accept(q) ? 1 : 0) : -1));
  for (;;) {
    const sigs = new Map();
    const nc = states.map((_, i) => {
      if (!live.has(i)) return -1;
      const sig = cls[i] + ':' + syms.map((_, k) => { const j = to(i, k); return j < 0 ? -1 : cls[j]; }).join(',');
      if (!sigs.has(sig)) sigs.set(sig, sigs.size);
      return sigs.get(sig);
    });
    if (new Set(nc).size === new Set(cls).size) { cls = nc; break; }
    cls = nc;
  }
  const rep = new Map();
  states.forEach((q, i) => { if (cls[i] >= 0 && !rep.has(cls[i])) rep.set(cls[i], i); });
  if (cls[0] < 0) throw new Error('explore: the language is empty');
  const nm = c => name(states[rep.get(c)]);
  const rules = [];
  for (const [c, i] of rep) syms.forEach((a, k) => { const j = to(i, k); if (j >= 0) rules.push(`${nm(c)} ${a} ${nm(cls[j])}`); });
  const names = [...rep.keys()].map(nm);
  if (new Set(names).size !== names.length) throw new Error('explore: two states share a name');
  return { sigma, states: names, start: nm(cls[0]), accept: [...rep.entries()].filter(([, i]) => accept(states[i])).map(([c]) => nm(c)), delta: rules.join('\n') };
}
