// LTL, decided exactly on an ultimately periodic word u·vᵂ.
//
// The reference an ω-automaton spec is checked against: a formula, evaluated
// on the lasso's n = |u| + |v| positions, where the successor of the last is
// the start of the loop. Until is a least fixpoint over that finite graph, so
// the answer is exact, not a bounded unrolling.
//
//   atoms     a letter of Σ (true where the word has that letter), true, false
//   unary     !  X  F  G
//   binary    &  |  ->  <->  U  R  W   (weakest first: <->, ->, |, &, then U R W)

const TOKEN = /\s*(<->|->|[()!&|]|[A-Za-z0-9_]+|\S)/y;

export function parseLtl(src) {
  const toks = [];
  TOKEN.lastIndex = 0;
  let m;
  while (TOKEN.lastIndex < src.length && (m = TOKEN.exec(src))) toks.push(m[1]);
  let i = 0;
  const peek = () => toks[i], eat = t => { if (toks[i] !== t) throw new Error(`LTL: expected ${t} at ${toks.slice(i).join(' ')} in ${src}`); i++; };
  const bin = (next, ops) => () => {
    let l = next();
    while (ops.includes(peek())) { const op = toks[i++]; l = { op, l, r: next() }; }
    return l;
  };
  const unary = () => {
    const t = peek();
    if (t === '!' || t === 'X' || t === 'F' || t === 'G') { i++; return { op: t, l: unary() }; }
    if (t === '(') { i++; const e = iff(); eat(')'); return e; }
    if (t === undefined) throw new Error(`LTL: unexpected end of ${src}`);
    i++;
    return t === 'true' ? { op: 'T' } : t === 'false' ? { op: 'F0' } : { op: 'ap', name: t };
  };
  const temporal = bin(unary, ['U', 'R', 'W']);
  const and = bin(temporal, ['&']);
  const or = bin(and, ['|']);
  const imp = () => { const l = or(); if (peek() === '->') { i++; return { op: '->', l, r: imp() }; } return l; };
  const iff = bin(imp, ['<->']);
  const e = iff();
  if (i !== toks.length) throw new Error(`LTL: trailing ${toks.slice(i).join(' ')} in ${src}`);
  return e;
}

/** Does u·vᵂ satisfy the formula? u and v are arrays of letters, v non-empty. */
export function ltlHolds(f, u, v) {
  const word = [...u, ...v], n = word.length, loop = u.length;
  const succ = k => (k + 1 < n ? k + 1 : loop);
  const ev = g => {
    switch (g.op) {
      case 'T': return word.map(() => true);
      case 'F0': return word.map(() => false);
      case 'ap': return word.map(c => c === g.name);
      case '!': return ev(g.l).map(x => !x);
      case '&': { const a = ev(g.l), b = ev(g.r); return a.map((x, k) => x && b[k]); }
      case '|': { const a = ev(g.l), b = ev(g.r); return a.map((x, k) => x || b[k]); }
      case '->': { const a = ev(g.l), b = ev(g.r); return a.map((x, k) => !x || b[k]); }
      case '<->': { const a = ev(g.l), b = ev(g.r); return a.map((x, k) => x === b[k]); }
      case 'X': { const a = ev(g.l); return word.map((_, k) => a[succ(k)]); }
      case 'U': return until(ev(g.l), ev(g.r));
      case 'F': return until(word.map(() => true), ev(g.l));
      case 'G': return until(word.map(() => true), ev(g.l).map(x => !x)).map(x => !x);
      case 'R': return until(ev(g.l).map(x => !x), ev(g.r).map(x => !x)).map(x => !x);
      case 'W': { const a = ev(g.l), b = ev(g.r); const un = until(a, b); const ga = until(word.map(() => true), a.map(x => !x)).map(x => !x); return un.map((x, k) => x || ga[k]); }
    }
    throw new Error(`LTL: unknown operator ${g.op}`);
  };
  // Least fixpoint of val = b ∨ (a ∧ X val), iterated to stability.
  const until = (a, b) => {
    const val = word.map(() => false);
    for (let changed = true; changed;) {
      changed = false;
      for (let k = n - 1; k >= 0; k--) {
        const nv = b[k] || (a[k] && val[succ(k)]);
        if (nv && !val[k]) { val[k] = true; changed = true; }
      }
    }
    return val;
  };
  return ev(f)[0];
}
