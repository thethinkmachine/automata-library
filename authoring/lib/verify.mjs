// Checking a machine against its spec's reference, and choosing its examples.
//
// The reference is independent of the machine: a predicate (`lang`), an output
// function (`out`), or for an ω-automaton an LTL formula (`ltl`) or a predicate
// on the lasso (`omega(u, v)`). Every word up to a length bound is decided by
// the app's own decider and compared with it, then a few hundred longer random
// words, then whatever `gen` and `extra` add — words a random sample would
// almost never hit, like the members of aⁿbⁿ.

import { analyze } from './engine.mjs';
import { KIND, symbolsOf } from './dsl.mjs';
import { parseLtl, ltlHolds } from './ltl.mjs';

const { targetFromDoc, decideRaw, outputText, analyzeDocument } = analyze;
const OUTPUT_TYPES = new Set(['Moore', 'Mealy', 'FST', 'PDT', '2DFT']);

export function modeOf(type) {
  if (KIND[type] === 'omega') return 'omega';
  if (OUTPUT_TYPES.has(type)) return 'transducer';
  return 'acceptor';
}

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Every word over `syms` of length ≤ L, shortest first. */
export function wordsUpTo(syms, L) {
  const out = [[]];
  let layer = [[]];
  for (let k = 1; k <= L; k++) {
    const next = [];
    for (const w of layer) for (const s of syms) next.push([...w, s]);
    for (const w of next) out.push(w);
    layer = next;
  }
  return out;
}

/** The largest L whose words number at most `budget`. */
export function lengthFor(n, budget) {
  let L = 0, total = 1, layer = 1;
  while (true) { layer *= n; if (total + layer > budget) return L; total += layer; L++; if (L > 40) return L; }
}

export const single = syms => syms.every(s => [...s].length === 1);

export function wordTools(sigma) {
  const syms = symbolsOf(sigma);
  const one = single(syms);
  return {
    syms, one,
    raw: w => one ? w.join('') : w.join(' '),
    toOracle: w => one ? w.join('') : w,
    fromSpec: w => Array.isArray(w) ? w.map(String) : one ? [...String(w)] : String(w).split(/[\s,]+/).filter(Boolean)
  };
}

const lassoRaw = (u, v, one) => one ? `${u.join('')}(${v.join('')})` : `${u.join(' ')} (${v.join(' ')})`;

/**
 * Check the machine in `doc` against `spec`'s reference. Returns the examples
 * to put on the card, a signature of the language for duplicate detection, and
 * any disagreement.
 */
export function verify(spec, doc) {
  const target = targetFromDoc(doc);
  const mode = modeOf(spec.type);
  const T = wordTools(spec.sigma);
  const errors = [];
  const results = [];   // { w (tokens), raw, verdict, output, want }

  const decide = raw => decideRaw(target, raw);

  if (mode === 'omega') {
    const f = spec.ltl ? parseLtl(spec.ltl) : null;
    const oracle = (u, v) => f ? ltlHolds(f, u, v) : !!spec.omega(T.toOracle(u), T.toOracle(v));
    const Lu = spec.maxPrefix ?? lengthFor(T.syms.length, 40), Lv = spec.maxPeriod ?? Math.max(1, lengthFor(T.syms.length, 60));
    const us = wordsUpTo(T.syms, Lu), vs = wordsUpTo(T.syms, Lv).filter(v => v.length);
    for (const u of us) for (const v of vs) {
      const raw = lassoRaw(u, v, T.one);
      const want = oracle(u, v);
      const got = decide(raw);
      results.push({ u, v, raw, want, verdict: got.verdict });
      if (got.verdict !== (want ? 'acc' : 'rej') && errors.length < 6) errors.push(`${raw}: expected ${want ? 'accept' : 'reject'}, the machine says ${got.verdict === 'err' ? got.error : got.verdict}`);
    }
    const inputs = pickOmega(spec, results, T);
    return { mode, errors, inputs, results };
  }

  // ── finite words ──
  const L = spec.maxLen ?? lengthFor(T.syms.length, spec.budget ?? (KIND[spec.type] === 'tm' || KIND[spec.type] === 'mtm' ? 1200 : 4000));
  const pool = new Map();
  const origin = new Map();
  const add = (w, from = 'domain') => { const raw = T.raw(w); if (!pool.has(raw)) { pool.set(raw, w); origin.set(raw, from); } };
  wordsUpTo(T.syms, L).forEach(add);
  const r = rng(0xA11CE);
  const longest = spec.randomMax ?? Math.max(L + 2, Math.min(3 * L, 30));
  for (let i = 0; i < (spec.randomCount ?? 300); i++) {
    const n = L + 1 + Math.floor(r() * (longest - L));
    add(Array.from({ length: n }, () => T.syms[Math.floor(r() * T.syms.length)]));
  }
  for (const w of spec.extra || []) add(T.fromSpec(w), 'extra');
  if (spec.gen) for (let n = 0; n <= (spec.genMax ?? 24); n++) {
    // a word, or a list of words; a word is a string (space-separated when the
    // symbols are longer than a character) or an array of symbols
    const g = spec.gen(n);
    for (const w of g == null ? [] : Array.isArray(g) ? g : [g]) if (w != null) add(T.fromSpec(w), 'gen');
  }

  for (const [raw, w] of pool) {
    const got = decide(raw);
    const ow = T.toOracle(w);
    if (mode === 'acceptor') {
      const want = !!spec.lang(ow);
      results.push({ w, raw, want, verdict: got.verdict, from: origin.get(raw) });
      if (got.verdict !== (want ? 'acc' : 'rej') && errors.length < 6) errors.push(`"${raw}": expected ${want ? 'accept' : 'reject'}, the machine says ${got.verdict === 'err' ? got.error : got.verdict === 'unk' ? 'no verdict' : got.verdict === 'acc' ? 'accept' : 'reject'}`);
    } else {
      // A transducer's reference gives its output, or null for a word it rejects.
      const want = spec.out(ow);
      const out = outputText(got.output);
      const accepting = !!spec.accepting;
      results.push({ w, raw, want, verdict: got.verdict, output: out, from: origin.get(raw) });
      const ok = want === null
        ? (accepting && got.verdict === 'rej')
        : (got.verdict !== 'err' && got.verdict !== 'unk' && (!accepting || got.verdict === 'acc') && out === outputText(want));
      if (!ok && errors.length < 6) errors.push(`"${raw}": expected ${want === null ? 'reject' : `→ ${want || '(nothing)'}`}, the machine gives ${got.verdict === 'err' ? got.error : `${got.verdict} → ${out || '(nothing)'}`}`);
    }
  }
  const inputs = mode === 'acceptor' ? pickWords(spec, results, T, decide) : pickOutputs(spec, results, T);
  return { mode, errors, inputs, results };
}

// ── choosing the card's examples ──────────────────────────────────

const byLen = (a, b) => a.w.length - b.w.length || (a.raw < b.raw ? -1 : a.raw > b.raw ? 1 : 0);
const labelOf = (spec, T, w) => (spec.label ? String(spec.label(T.toOracle(w)) ?? '') : '');

/**
 * Accepted words of spread-out lengths, then for each a rejected word one edit
 * away from it — the near miss a reader learns most from. `tests` overrides.
 */
function pickWords(spec, results, T, decide) {
  const row = (w, acc) => ({ w: T.raw(w), expect: acc ? 'accept' : 'reject', ...(spec.label ? { label: labelOf(spec, T, w) } : {}) });
  if (spec.tests) return spec.tests.map(x => { const w = T.fromSpec(x); return row(w, !!spec.lang(T.toOracle(w))); });
  const nAcc = spec.nAccept ?? 4, nRej = spec.nReject ?? 4;
  const acc = results.filter(r => r.want).sort(byLen), rej = results.filter(r => !r.want).sort(byLen);
  const prefer = r => !spec.prefer || spec.prefer(T.toOracle(r.w));
  const longMax = spec.longMax ?? 14;
  const chosen = diverse(acc.filter(r => prefer(r) && r.w.length <= longMax), nAcc - 1);
  // and one longer one — what gen or extra supplied, when they did
  const longPool = acc.filter(r => prefer(r) && r.w.length <= longMax && !chosen.includes(r));
  const variety = r => new Set(r.w.map((c, i) => i ? r.w[i - 1] + ' ' + c : '')).size + new Set(r.w).size;
  const longest = (rs) => rs.filter(r => r.w.length >= Math.min(8, longMax)).sort((a, b) => variety(b) - variety(a) || b.w.length - a.w.length)[0];
  const long = longest(longPool.filter(r => r.from !== 'domain')) || longest(longPool) || longPool.pop();
  if (long && chosen.length < nAcc) chosen.push(long);
  for (const r of acc) { if (chosen.length >= nAcc) break; if (!chosen.includes(r) && prefer(r)) chosen.push(r); }

  const known = new Map(results.map(r => [r.raw, r]));
  const verdictOf = w => {
    const raw = T.raw(w);
    if (known.has(raw)) return known.get(raw).want;
    const want = !!spec.lang(T.toOracle(w));
    const got = decide(raw);
    if (got.verdict !== (want ? 'acc' : 'rej')) throw new Error(`"${raw}" (an example) disagrees with the reference`);
    return want;
  };
  const misses = [];
  const seen = new Set();
  for (const a of chosen) {
    if (misses.length >= nRej) break;
    const cands = [];
    const w = a.w;
    for (let i = 0; i < w.length; i++) for (const s of T.syms) if (s !== w[i]) cands.push([...w.slice(0, i), s, ...w.slice(i + 1)]);
    for (let i = 0; i < w.length; i++) cands.push([...w.slice(0, i), ...w.slice(i + 1)]);
    for (let i = 0; i <= w.length; i++) for (const s of T.syms) cands.push([...w.slice(0, i), s, ...w.slice(i)]);
    const hit = cands.find(c => !seen.has(T.raw(c)) && (!spec.prefer || spec.prefer(T.toOracle(c))) && !verdictOf(c));
    if (hit) { seen.add(T.raw(hit)); misses.push(hit); }
  }
  for (const r of diverse(rej.filter(prefer), nRej)) { if (misses.length >= nRej) break; if (!seen.has(r.raw)) { seen.add(r.raw); misses.push(r.w); } }
  const rows = [...chosen.map(r => row(r.w, true)), ...misses.map(w => row(w, false))];
  return rows.slice(0, 12);
}

/**
 * Up to k words that each show something the earlier ones did not: the
 * shortest first, then whichever adds the most new pairs of adjacent symbols
 * (and new symbols, and a length not yet shown) for its size.
 */
function diverse(cands, k) {
  const out = [];
  if (!cands.length || k <= 0) return out;
  const pairs = new Set(), syms = new Set(), lens = new Set();
  const gain = r => {
    const ns = new Set(), np = new Set();
    r.w.forEach((c, i) => { if (!syms.has(c)) ns.add(c); if (i && !pairs.has(r.w[i - 1] + ' ' + c)) np.add(r.w[i - 1] + ' ' + c); });
    const g = 2 * ns.size + np.size + (lens.has(r.w.length) ? 0 : 1);
    return g / (1 + r.w.length / 6);
  };
  const take = r => { out.push(r); lens.add(r.w.length); r.w.forEach((c, i) => { syms.add(c); if (i) pairs.add(r.w[i - 1] + ' ' + c); }); };
  take(cands[0]);
  while (out.length < k) {
    let best = null, bg = 0;
    for (const r of cands) { if (out.includes(r)) continue; const g = gain(r); if (g > bg + 1e-9) { bg = g; best = r; } }
    if (!best) break;
    take(best);
  }
  return out;
}

function pickOutputs(spec, results, T) {
  const row = r => r.want === null ? { w: r.raw, expect: 'reject' } : { w: r.raw, out: outputText(r.want), ...(spec.accepting ? { expect: 'accept' } : {}) };
  if (spec.tests) {
    const byRaw = new Map(results.map(r => [r.raw, r]));
    return spec.tests.map(x => { const w = T.fromSpec(x); const r = byRaw.get(T.raw(w)); if (!r) throw new Error(`test word "${x}" was not checked: add it to extra`); return row(r); });
  }
  const sorted = [...results].sort(byLen);
  const pick = [];
  const usedLen = new Map();
  for (const r of sorted) {
    if (pick.length >= (spec.nTests ?? 6) - 1) break;
    if (!r.w.length) continue;
    const k = usedLen.get(r.w.length) || 0;
    if (k >= 2) continue;
    if (r.want === null && pick.filter(p => p.want === null).length >= 2) continue;
    usedLen.set(r.w.length, k + 1);
    pick.push(r);
  }
  const long = sorted.filter(r => r.want !== null && r.w.length <= (spec.longMax ?? 16)).pop();
  if (long && !pick.includes(long)) pick.push(long);
  return pick.map(row);
}

function pickOmega(spec, results, T) {
  const row = r => ({ w: r.raw, expect: r.want ? 'accept' : 'reject' });
  if (spec.tests) {
    const byRaw = new Map(results.map(r => [r.raw.replace(/\s+/g, ''), r]));
    return spec.tests.map(x => { const r = byRaw.get(String(x).replace(/\s+/g, '')); if (!r) throw new Error(`test lasso "${x}" was not checked`); return row(r); });
  }
  const size = r => r.u.length + r.v.length * 1.1;
  const sorted = [...results].sort((a, b) => size(a) - size(b) || (a.raw < b.raw ? -1 : 1));
  const pick = [];
  const per = { true: 0, false: 0 };
  const vs = new Set();
  for (const r of sorted) {
    if (per[r.want] >= 4) continue;
    const key = r.want + '|' + r.v.join('');
    if (vs.has(key) && per[r.want] < 3 && sorted.length > 20) continue;
    vs.add(key); per[r.want]++; pick.push(r);
  }
  return pick.sort((a, b) => (b.want - a.want) || size(a) - size(b)).map(row);
}

// ── the language, for duplicate detection ─────────────────────────

/**
 * What a machine does on every short input, over its sorted alphabet, as one
 * string. Two entries with the same signature very probably have the same
 * language (exactly so for finite automata within their length bound).
 */
export function signatureOf(doc) {
  const target = targetFromDoc(doc);
  const mode = modeOf(target.machine);
  const syms = [...target.sigma].sort();
  if (!syms.length) return null;
  const T = wordTools(syms);
  const parts = [mode, syms.join('\u0001')];
  if (mode === 'omega') {
    const Lu = lengthFor(syms.length, 15), Lv = Math.max(1, lengthFor(syms.length, 30));
    for (const u of wordsUpTo(syms, Lu)) for (const v of wordsUpTo(syms, Lv)) if (v.length) parts.push(decideRaw(target, lassoRaw(u, v, T.one)).verdict[0]);
  } else {
    const kind = KIND[target.machine];
    const L = lengthFor(syms.length, kind === 'tm' || kind === 'mtm' ? 400 : 3000);
    const r = rng(0x5161);
    const words = wordsUpTo(syms, L);
    for (let i = 0; i < 200; i++) words.push(Array.from({ length: L + 1 + Math.floor(r() * 2 * L) }, () => syms[Math.floor(r() * syms.length)]));
    for (const w of words) {
      const g = decideRaw(target, T.raw(w));
      parts.push(mode === 'transducer' ? `${g.verdict[0]}:${outputText(g.output)}` : g.verdict[0]);
    }
  }
  return parts.join('|');
}

export { analyzeDocument };
