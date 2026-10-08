// A spec → a library document.
//
// A spec is a plain object (see authoring/README.md). Its `delta` is one rule per
// line (or per `;`), each `from label to`, and the label's shape is the
// machine's:
//
//   finite / ω      a          a,b          ε          Σ          else
//   PFA             a:0.9
//   Mealy, FST      a/out      a,b/         (no output)
//   DPDA NPDA QA    a,X/YX     ε,Z/Z        a,b,ε/ε    (pop ε = pop nothing)
//   Counter         as a PDA, over the stack symbols 1 and Z
//   PDT             a,X/YX:out
//   2PDA            a,X/Y,U/V  (stack 1, then stack 2)
//   TM LBA ITM NDTM a/b,R      a,b/=,R    (= writes back what was read)
//   MTM             a,_/a,a/R,R  (one read, write and move per tape)
//   2DFA 2NFA       a/R        <  is ⊢, > is ⊣
//   2DFT            a/R:out
//
// `else` stands for every input symbol (tape symbol, for a TM) the state has no
// other rule for; `_` is the blank. Symbols are single characters unless the
// spec's `sigma` is an array, and a stack or tape string is read one character
// per symbol.

import { App, MachineTypes, SCHEMA_VERSION, WORKSPACE_FORMAT, APP_VERSION, sugiyamaLayout, circularLayout } from './engine.mjs';

const SYM = App.config.sym;
const BLANK = SYM.blank, EPS = SYM.eps;

export const KIND = {
  DFA: 'fa', NFA: 'fa', 'ε-NFA': 'fa', PFA: 'pfa',
  DBA: 'omega', DcoBA: 'omega', DPA: 'omega', DWA: 'omega', NBA: 'omega', NcoBA: 'omega', NPA: 'omega', NWA: 'omega',
  DPDA: 'pda', NPDA: 'pda', QA: 'pda', Counter: 'pda', PDT: 'pdt', '2PDA': 'twopda', EPDA: 'raw',
  TM: 'tm', LBA: 'tm', ITM: 'tm', NDTM: 'tm', MTM: 'mtm',
  Moore: 'fa', Mealy: 'mealy', FST: 'mealy',
  '2DFA': 'twoway', '2NFA': 'twoway', '2DFT': 'twodft'
};

export const symbolsOf = sigma => Array.isArray(sigma) ? sigma.map(String) : [...String(sigma)];

// _ is the blank only on a tape, < and > the end markers only for a two-way head.
let TAPE = false, MARKERS = false;
const fixSym = s => (TAPE && s === '_') ? BLANK : (MARKERS && s === '<') ? SYM.leftMarker : (MARKERS && s === '>') ? SYM.rightMarker : s;
const str = s => (s === '' || s === 'ε' || s === undefined) ? EPS : [...s].map(fixSym).join('');
const outStr = s => (s === undefined || s === 'ε') ? '' : s;
const list = s => s === '' ? [] : s.split(',').map(fixSym);

function rulesOf(delta) {
  return String(delta).split(/[\n;]/).map(l => l.replace(/\/\/.*$/, '').trim()).filter(Boolean).map(line => {
    const parts = line.split(/\s+/);
    if (parts.length !== 3) throw new Error(`A rule is "from label to": ${line}`);
    return { from: parts[0], label: parts[1], to: parts[2], line };
  });
}

/** One rule's label → its transitions' fields (several, when it names several symbols). */
function parseLabel(kind, label, line) {
  const bad = () => new Error(`Cannot read the label in "${line}"`);
  switch (kind) {
    case 'fa': case 'omega': return list(label).map(symbol => ({ symbol }));
    case 'pfa': {
      const [syms, w] = label.split(':');
      if (w === undefined || !Number.isFinite(+w)) throw bad();
      return list(syms).map(symbol => ({ symbol, weight: +w }));
    }
    case 'mealy': {
      const i = label.indexOf('/'); if (i < 0) throw bad();
      return list(label.slice(0, i)).map(symbol => ({ symbol, output: outStr(label.slice(i + 1)) }));
    }
    case 'pda': case 'pdt': {
      let body = label, output;
      if (kind === 'pdt') { const k = label.lastIndexOf(':'); if (k < 0) throw bad(); body = label.slice(0, k); output = outStr(label.slice(k + 1)); }
      const [left, push] = body.split('/'); if (push === undefined) throw bad();
      const items = left.split(','); const pop = str(items.pop());
      return items.map(fixSym).map(symbol => ({ symbol, pop, push: str(push), ...(kind === 'pdt' ? { output } : {}) }));
    }
    case 'twopda': {
      const [a, b, c] = label.split('/'); if (c === undefined) throw bad();
      const items = a.split(','); const pop = str(items.pop());
      const mid = b.split(','); if (mid.length !== 2) throw bad();
      return items.map(fixSym).map(symbol => ({ symbol, pop, push: str(mid[0]), pop2: str(mid[1]), push2: str(c) }));
    }
    case 'tm': {
      const [reads, rest] = label.split('/'); if (rest === undefined) throw bad();
      const [write, dir] = rest.split(','); if (!/^[LRS]$/.test(dir || '')) throw bad();
      return list(reads).map(symbol => ({ symbol, write: write === '=' ? symbol : fixSym(write), dir }));
    }
    case 'mtm': {
      const [r, w, d] = label.split('/'); if (d === undefined) throw bad();
      const tapeSyms = list(r), ws = list(w), tapeDirs = d.split(',');
      if (ws.length !== tapeSyms.length || tapeDirs.length !== tapeSyms.length || tapeDirs.some(x => !/^[LRS]$/.test(x))) throw bad();
      const tapeWrites = ws.map((x, i) => x === '=' ? tapeSyms[i] : x);
      return [{ symbol: tapeSyms[0], tapeSyms, tapeWrites, tapeDirs }];
    }
    case 'twoway': case 'twodft': {
      let body = label, output;
      if (kind === 'twodft') { const k = label.lastIndexOf(':'); if (k < 0) throw bad(); body = label.slice(0, k); output = outStr(label.slice(k + 1)); }
      const [syms, dir] = body.split('/'); if (!/^[LRS]$/.test(dir || '')) throw bad();
      return list(syms).map(symbol => ({ symbol, dir, ...(kind === 'twodft' ? { output } : {}) }));
    }
  }
  throw bad();
}

const names = v => Array.isArray(v) ? v : String(v ?? '').split(/[\s,]+/).filter(Boolean);

/** The spec's machine, as the save format's fields. */
export function buildDoc(spec, { author = 'thethinkmachine' } = {}) {
  if (spec.rename) spec = renamed(spec);
  const type = spec.type;
  const kind = KIND[type];
  if (!kind || !MachineTypes[type]) throw new Error(`Unknown machine type ${type}`);
  TAPE = kind === 'tm' || kind === 'mtm' || type === 'LBA';
  MARKERS = kind === 'twoway' || kind === 'twodft' || type === 'LBA';
  const sigma = symbolsOf(spec.sigma);

  // ── states, in the order they are first named ──
  const order = [];
  const see = n => { if (!order.includes(n)) order.push(n); };
  if (spec.start) see(spec.start);
  names(spec.states).forEach(see);
  let transitions;
  if (kind === 'raw') {
    transitions = spec.transitions.map(t => { see(t.from); see(t.to); return { ...t }; });
  } else {
    const rules = rulesOf(spec.delta);
    rules.forEach(r => { see(r.from); see(r.to); });
    const tapeExtra = symbolsOf(spec.tape || '').map(fixSym);
    const tapeAll = [...new Set([...sigma, ...tapeExtra, BLANK])];
    const elseSyms = (from, readSet) => {
      const used = new Set(rules.filter(r => r.from === from && r.label.split('/')[0].split(/[,:]/)[0] !== 'else')
        .flatMap(r => parseLabel(kind, r.label, r.line).map(f => f.symbol)));
      return readSet.filter(s => !used.has(s));
    };
    transitions = [];
    for (const r of rules) {
      let label = r.label;
      if (/^else\b/.test(label)) {
        const pool = kind === 'tm' ? tapeAll : kind === 'twoway' || kind === 'twodft' ? [...sigma, SYM.leftMarker, SYM.rightMarker] : sigma;
        const syms = elseSyms(r.from, pool);
        if (!syms.length) continue;
        label = syms.join(',') + label.slice(4);
      }
      for (const f of parseLabel(kind, label, r.line)) transitions.push({ from: r.from, to: r.to, ...f });
    }
  }
  names(spec.accept).forEach(see);
  const idOf = new Map(order.map((n, i) => [n, `s${i + 1}`]));
  const states = order.map(n => ({ id: idOf.get(n), x: 0, y: 0, name: n }));
  if (spec.out) for (const s of states) if (spec.out[s.name] !== undefined) s.output = spec.out[s.name];
  if (spec.priority) for (const s of states) s.priority = spec.priority[s.name] ?? 0;
  transitions = transitions.map((t, i) => ({ id: `t${i + 1}`, ...t, from: idOf.get(t.from), to: idOf.get(t.to) }));
  const startId = idOf.get(spec.start || order[0]);
  const accepts = names(spec.accept).map(n => idOf.get(n));

  // ── alphabets ──
  let stackAlpha = [], outputAlpha = [], tapeCount = 1;
  const chars = s => (s && s !== EPS) ? [...s] : [];
  if (kind === 'pda' || kind === 'pdt' || kind === 'twopda' || kind === 'raw') {
    const set = new Set(spec.byEmptyStack ? [] : [SYM.stackBottom]);
    for (const t of transitions) for (const k of ['pop', 'push', 'pop2', 'push2', 'below', 'above']) {
      if (typeof t[k] === 'string') for (const c of chars(t[k].replace(/[|]/g, ''))) set.add(c);
    }
    stackAlpha = [...set];
  }
  if (kind === 'tm') {
    const set = new Set([...sigma, ...symbolsOf(spec.tape || '').map(fixSym)]);
    for (const t of transitions) { set.add(t.symbol); set.add(t.write); }
    set.add(BLANK);
    stackAlpha = [...set].filter(s => s !== SYM.any);
  }
  if (kind === 'mtm') {
    const set = new Set([...sigma, ...symbolsOf(spec.tape || '').map(fixSym)]);
    for (const t of transitions) { t.tapeSyms.forEach(s => set.add(s)); t.tapeWrites.forEach(s => set.add(s)); }
    set.add(BLANK);
    stackAlpha = [...set].filter(s => s !== SYM.any);
    tapeCount = transitions[0]?.tapeSyms.length || 2;
  }
  if (type === 'Moore' || kind === 'mealy' || kind === 'pdt' || kind === 'twodft') {
    if (spec.outAlpha) outputAlpha = symbolsOf(spec.outAlpha);
    else {
      const set = new Set();
      if (type === 'Moore') states.forEach(s => s.output !== undefined && set.add(String(s.output)));
      else transitions.forEach(t => chars(t.output).forEach(c => set.add(c)));
      outputAlpha = [...set];
    }
  }

  // ── config ──
  const config = { sym: { ...SYM } };
  if (kind === 'pda' || kind === 'pdt' || kind === 'twopda' || kind === 'raw') config.pdaParadigm = spec.byEmptyStack ? 'empty' : 'explicit';
  if (type === 'Moore' || kind === 'mealy' || kind === 'pdt' || kind === 'twodft') config.transducerAccepts = !!spec.accepting;
  if (type === 'PFA') config.pfaCutPoint = spec.cutPoint ?? 0.5;
  if (spec.twoWayTape) config.twoWayTape = true;

  layout(states, transitions, startId, spec);

  return {
    format: WORKSPACE_FORMAT, schema: SCHEMA_VERSION, app: APP_VERSION,
    machine: type, config, sigma, stackAlpha, outputAlpha, tapeCount,
    states, transitions, startId, accepts, notes: [], dividers: [], blocks: [],
    meta: {
      title: spec.title,
      blurb: spec.blurb,
      inputs: [],
      library: {
        author: { login: author }, license: 'CC-BY-4.0',
        tags: spec.tags || [],
        difficulty: spec.level || 'intro',
        ...(spec.chapter ? { chapter: spec.chapter } : {})
      }
    }
  };
}

/** The spec with states renamed: `rename: { old: 'new' }` (for names a construction chose). */
function renamed(spec) {
  const r = n => spec.rename[n] ?? n;
  const out = { ...spec, rename: null };
  if (spec.start) out.start = r(spec.start);
  out.states = names(spec.states).map(r);
  out.accept = names(spec.accept).map(r);
  if (spec.delta) out.delta = rulesOf(spec.delta).map(x => `${r(x.from)} ${x.label} ${r(x.to)}`).join('\n');
  for (const k of ['pos', 'out', 'priority']) if (spec[k]) out[k] = Object.fromEntries(Object.entries(spec[k]).map(([n, v]) => [r(n), v]));
  return out;
}

/**
 * Positions: `pos` places states on a grid ({q0: [0, 0], q1: [1, 0]}), `layout:
 * 'circle'` puts them on a ring, and anything else is the app's layered layout.
 * Then the drawing is moved to sit where a canvas would open on it.
 */
function layout(states, transitions, startId, spec) {
  if (spec.pos) {
    const P = spec.pitch || 170;
    for (const s of states) {
      const p = spec.pos[s.name];
      if (!p) throw new Error(`pos has no place for ${s.name}`);
      s.x = p[0] * P; s.y = p[1] * P;
    }
  } else if (spec.layout === 'circle' && states.length > 2) {
    circularLayout(states);
  } else {
    sugiyamaLayout(states, transitions, startId);
  }
  const minX = Math.min(...states.map(s => s.x)), minY = Math.min(...states.map(s => s.y));
  for (const s of states) { s.x = Math.round(s.x - minX + 140); s.y = Math.round(s.y - minY + 160); }
}
