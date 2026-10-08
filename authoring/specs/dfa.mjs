// Deterministic finite automata. One idea per entry: a machine is here because
// it shows something the others do not.

import { explore, runSteps } from '../lib/explore.mjs';

export const type = 'DFA';

const count = (w, c) => [...w].filter(x => x === c).length;
const occurrences = (w, p) => { let n = 0; for (let i = 0; i + p.length <= w.length; i++) if (w.startsWith(p, i)) n++; return n; };
const DIGITS = '0123456789';
const range = (a, b) => DIGITS.slice(DIGITS.indexOf(a), DIGITS.indexOf(b) + 1).split('').join(',');

// ── machines whose states are configurations ─────────────────────

/** The longest suffix of `s` that is a prefix of `p`. */
const kmp = (p, s) => { for (let k = Math.min(p.length, s.length); k > 0; k--) if (s.endsWith(p.slice(0, k))) return k; return 0; };

const ecori = {
  sigma: 'ACGT', start: 0,
  step: (k, a) => (k === 6 ? 6 : kmp('GAATTC', 'GAATTC'.slice(0, k) + a)),
  accept: k => k === 6,
  name: k => (k === 6 ? 'found' : k === 0 ? 'none' : 'GAATTC'.slice(0, k))
};

const tennis = {
  sigma: 'ab', start: [0, 0],
  step: (q, p) => {
    if (typeof q === 'string') return null;            // the game is over
    let [x, y] = p === 'a' ? [q[0] + 1, q[1]] : [q[0], q[1] + 1];
    if (x >= 4 && x - y >= 2) return 'A';
    if (y >= 4 && y - x >= 2) return 'B';
    if (x >= 3 && y >= 3) { const d = x - y; [x, y] = [3 + Math.max(d, 0), 3 + Math.max(-d, 0)]; }
    return [x, y];
  },
  accept: q => q === 'A',
  name: q => {
    if (typeof q === 'string') return `${q}_wins`;
    const [x, y] = q;
    if (x >= 3 && y >= 3) return x === y ? 'deuce' : x > y ? 'adv_A' : 'adv_B';
    const pts = ['0', '15', '30', '40'];
    return `${pts[x]}–${pts[y]}`;
  }
};

const romanValid = (() => {
  const set = new Set();
  const th = ['', 'M', 'MM', 'MMM'], h = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'],
    t = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'], u = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  for (let n = 1; n < 4000; n++) set.add(th[Math.floor(n / 1000)] + h[Math.floor(n / 100) % 10] + t[Math.floor(n / 10) % 10] + u[n % 10]);
  return set;
})();
const romanPrefixes = new Set([...romanValid].flatMap(r => [...r].map((_, i) => r.slice(0, i + 1))).concat(['']));
const romanValue = r => { const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }; let n = 0; for (let i = 0; i < r.length; i++) { const a = v[r[i]], b = v[r[i + 1]] || 0; n += a < b ? -a : a; } return n; };

// Wolf, goat, cabbage: which of F W G C are on the far bank.
const wgc = {
  sigma: 'fwgc', start: '',
  step: (far, m) => {
    const farmerFar = far.includes('F');
    const cargo = m === 'f' ? '' : m.toUpperCase();
    if (cargo && far.includes(cargo) !== farmerFar) return null;
    const flip = (s, x) => (s.includes(x) ? s.replace(x, '') : s + x);
    let next = flip(far, 'F');
    if (cargo) next = flip(next, cargo);
    next = [...'FWGC'].filter(x => next.includes(x)).join('');
    const unsafe = side => !side.includes('F') && ((side.includes('W') && side.includes('G')) || (side.includes('G') && side.includes('C')));
    const near = [...'FWGC'].filter(x => !next.includes(x)).join('');
    return unsafe(next) || unsafe(near) ? null : next;
  },
  accept: far => far === 'FWGC',
  name: far => `${[...'FWGC'].filter(x => !far.includes(x)).join('') || '·'}|${far || '·'}`
};

// Towers of Hanoi: the peg of the large, middle and small disk.
const HANOI_MOVES = ['AB', 'AC', 'BA', 'BC', 'CA', 'CB'];
const hanoi = {
  sigma: HANOI_MOVES, start: 'AAA',
  step: (q, m) => {
    const [from, to] = m;
    const top = peg => { for (let d = 2; d >= 0; d--) if (q[d] === peg) return d; return -1; }; // the smallest disk on it
    const d = top(from);
    if (d < 0) return null;
    const t = top(to);
    if (t >= 0 && t > d) return null;  // the disk on top of `to` is smaller
    return q.slice(0, d) + to + q.slice(d + 1);
  },
  accept: q => q === 'CCC',
  name: q => q
};
// Drawn as the Sierpiński triangle it is: the largest disk picks the corner,
// and inside each corner the other two pegs trade places, so that the three
// sub-triangles meet where the largest disk can move.
const sierpinski = (() => {
  const corner = { A: [0, 0], B: [-1, 1.732], C: [1, 1.732] };
  const pos = {};
  for (const a of 'ABC') for (const b of 'ABC') for (const c of 'ABC') {
    const q = a + b + c;
    let perm = { A: 'A', B: 'B', C: 'C' }, x = 0, y = 0;
    for (let i = 0; i < 3; i++) {
      const p = perm[q[i]], k = 2 ** (2 - i) * 0.6;
      x += corner[p][0] * k; y += corner[p][1] * k;
      const [u, v] = 'ABC'.split('').filter(z => z !== q[i]);
      perm = { ...perm, [u]: perm[v], [v]: perm[u] };
    }
    pos[q] = [x, y];
  }
  return pos;
})();

// Three cards, top first: s swaps the top two, c cuts the top card to the bottom.
const cards = {
  sigma: 'sc', start: 'ABC',
  step: (q, m) => (m === 's' ? q[1] + q[0] + q[2] : q.slice(1) + q[0]),
  accept: q => q === 'ABC', name: q => q
};

// A robot in a 3×3 room, starting in the corner (0, 0).
const room = {
  sigma: 'NSEW', start: [0, 0],
  step: ([x, y], m) => { const [dx, dy] = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[m]; const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx > 2 || ny > 2 ? null : [nx, ny]; },
  accept: ([x, y]) => x === 0 && y === 0,
  name: ([x, y]) => `${x},${y}`
};

// Lights Out on a 2×2 board: pressing a light toggles it and its two neighbours.
const lights = {
  sigma: '1234', start: 0b1111,
  step: (q, b) => q ^ [0b0111, 0b1011, 0b1101, 0b1110][+b - 1],
  accept: q => q === 0,
  name: q => q.toString(2).padStart(4, '0')
};

// A die rolled on a grid: its top, north and east faces.
const die = {
  sigma: 'NSEW', start: [1, 2, 3],
  step: ([t, n, e], m) => ({ N: [7 - n, t, e], S: [n, 7 - t, e], E: [7 - e, n, t], W: [e, n, 7 - t] }[m]),
  accept: ([t]) => t === 6,
  name: ([t, n, e]) => `${t}${n}${e}`
};

const accepts = machine => w => { const q = runSteps(machine, typeof w === 'string' ? [...w] : w); return q !== null && machine.accept(q); };

export default [
  // ── reading numbers ─────────────────────────────────────────────
  {
    title: 'Ends in 01',
    blurb: 'Three states remember how much of the suffix 01 has just been read. A 0 always means "maybe starting it", so no state ever has to back up further than one symbol.',
    tags: ['suffix', 'pattern-matching'], level: 'intro',
    sigma: '01', accept: 'got01',
    delta: `start 0 got0;  start 1 start
            got0 0 got0;   got0 1 got01
            got01 0 got0;  got01 1 start`,
    lang: w => w.endsWith('01'),
    badges: ['minimal']
  },
  {
    title: 'Decimal multiples of 3: the digit-sum rule',
    blurb: 'A number is divisible by 3 exactly when its digit sum is, so three states — the digit sum mod 3 — are enough for numbers of any length. Every digit is one of three edges: 0, 3, 6, 9 change nothing.',
    tags: ['divisibility', 'decimal', 'modular-arithmetic'], level: 'intro',
    sigma: DIGITS, accept: 'r0', layout: 'circle',
    delta: [0, 1, 2].flatMap(r => [0, 1, 2].map(k => `r${r} ${[...DIGITS].filter(d => +d % 3 === k).join(',')} r${(r + k) % 3}`)).join('\n'),
    lang: w => w === '' || BigInt(w) % 3n === 0n,
    prefer: w => /^[1-9]/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Even numbers in base 3',
    blurb: 'In base 10 the last digit says whether a number is even. In base 3 it does not: 3 is odd, so every power of 3 is odd, and a number is even exactly when its digit sum is. Two states count the 1s.',
    tags: ['parity', 'base-3', 'number-bases'], level: 'intro',
    sigma: '012', accept: 'even',
    delta: `even 0,2 even; even 1 odd
            odd 0,2 odd;   odd 1 even`,
    lang: w => w === '' || parseInt(w, 3) % 2 === 0,
    label: w => String(parseInt(w || '0', 3)),
    prefer: w => /^[12]/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Binary numbers greater than 5',
    blurb: 'Once the value read so far is at least 3, any further bit pushes it past 5 for good, so 3, 4 and 5 are one state. A threshold needs a state for each value below it that can still behave differently — here 0, 1, 2 and "at least 3".',
    tags: ['threshold', 'binary-numbers', 'comparison'], level: 'intro',
    ...explore({
      sigma: '01', start: 0,
      step: (v, b) => Math.min(2 * v + +b, 6),
      accept: v => v === 6, name: v => (v === 6 ? 'big' : `v${v}`), minimize: true
    }),
    lang: w => w !== '' && parseInt(w, 2) > 5,
    label: w => String(parseInt(w || '0', 2)),
    prefer: w => /^1/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Powers of two in binary',
    blurb: 'A power of two is a single 1 with zeros around it — leading zeros allowed, any number of zeros after. The third possible state, a second 1, is left out: there is nowhere to go from it.',
    tags: ['powers-of-two', 'binary-numbers', 'partial-dfa'], level: 'intro',
    sigma: '01', accept: 'one',
    delta: `zeros 0 zeros; zeros 1 one; one 0 one`,
    lang: w => count(w, '1') === 1,
    label: w => String(parseInt(w, 2)),
    prefer: w => /^1/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Comparing two binary numbers, column by column',
    blurb: 'Each symbol is a column: the top number’s bit, then the bottom one’s. Reading from the most significant end, the first column that differs decides — after that nothing can change the answer.',
    tags: ['comparison', 'binary-numbers', 'column-alphabet'], level: 'intermediate',
    sigma: ['00', '01', '10', '11'], accept: 'bigger',
    delta: `same 00,11 same;  same 10 bigger;  same 01 smaller
            bigger 00,01,10,11 bigger
            smaller 00,01,10,11 smaller`,
    lang: w => { const top = w.map(c => c[0]).join(''), bot = w.map(c => c[1]).join(''); return top > bot; },
    badges: ['minimal']
  },
  {
    title: 'Checking a sum, column by column',
    blurb: 'Each symbol is a column a+b=c of a binary addition, least significant column first. The carry is the only thing to remember, so two states check additions of any length.',
    tags: ['addition', 'binary-numbers', 'column-alphabet'], level: 'intermediate',
    sigma: ['0+0=0', '0+0=1', '0+1=0', '0+1=1', '1+0=0', '1+0=1', '1+1=0', '1+1=1'], accept: 'carry0',
    delta: `carry0 0+0=0,0+1=1,1+0=1 carry0;  carry0 1+1=0 carry1
            carry1 0+0=1 carry0;  carry1 0+1=0,1+0=0,1+1=1 carry1`,
    lang: w => { let c = 0; for (const col of w) { const s = +col[0] + +col[2] + c; if (s % 2 !== +col[4]) return false; c = s >> 1; } return c === 0; },
    badges: ['minimal']
  },
  {
    title: 'A byte with even parity',
    blurb: 'Eight data bits and a parity bit, nine in all, with an even number of 1s. The states are a grid: how many bits have been read, and the parity so far. Fixed length and counting, in one picture.',
    tags: ['parity', 'error-detection', 'fixed-length'], level: 'intro',
    ...explore({
      sigma: '01', start: [0, 0],
      step: ([n, p], b) => (n === 9 ? null : [n + 1, p ^ +b]),
      accept: ([n, p]) => n === 9 && p === 0, name: ([n, p]) => `${n}${p ? 'odd' : 'even'}`, minimize: true
    }),
    pos: Object.fromEntries([...Array(10).keys()].flatMap(n => [[`${n}even`, [n * 0.7, 0]], [`${n}odd`, [n * 0.7, 1]]])),
    lang: w => w.length === 9 && count(w, '1') % 2 === 0,
    maxLen: 11,
    badges: ['minimal']
  },

  // ── patterns in text ────────────────────────────────────────────
  {
    title: 'Finding the EcoRI site GAATTC in DNA',
    blurb: 'The restriction enzyme EcoRI cuts DNA at GAATTC. A DFA finds it in one pass: each state is how much of the site has just been matched, and a mismatch falls back to the longest part that still fits — the Knuth–Morris–Pratt idea.',
    tags: ['dna', 'pattern-matching', 'kmp', 'biology'], level: 'intermediate',
    ...explore(ecori),
    lang: w => w.includes('GAATTC'),
    gen: n => 'ACGT'.repeat(n % 4) + 'GAATTC' + 'TA'.repeat(n % 3),
    badges: ['minimal']
  },
  {
    title: 'No two 0s in a row',
    blurb: 'Two states: the last symbol was a 1 (or nothing yet), or it was a 0. The number of such words of length n is a Fibonacci number — the states are the two terms of the recurrence.',
    tags: ['forbidden-pattern', 'fibonacci', 'partial-dfa'], level: 'intro',
    sigma: '01', accept: 'last1 last0',
    delta: `last1 1 last1; last1 0 last0; last0 1 last1`,
    lang: w => !w.includes('00'),
    badges: ['minimal']
  },
  {
    title: 'The third symbol from the end is a 1',
    blurb: 'An NFA guesses where the end is and needs four states. A DFA cannot guess: it must remember the last three symbols, all eight combinations of them. This is the language family where determinising costs 2ⁿ.',
    tags: ['subset-construction', 'state-blowup', 'suffix'], level: 'intermediate',
    ...explore({ sigma: '01', start: '000', step: (q, b) => q.slice(1) + b, accept: q => q[0] === '1', name: q => q }),
    pos: { '000': [0, 0], '001': [1, 0], '010': [2, 0], '011': [3, 0], '100': [0, 1.2], '101': [1, 1.2], '110': [2, 1.2], '111': [3, 1.2] },
    lang: w => w.length >= 3 && w[w.length - 3] === '1',
    badges: ['minimal']
  },
  {
    title: 'As many ab’s as ba’s',
    blurb: 'Counting two kinds of substring sounds like it needs a counter. It does not: every switch from a to b is followed by a switch back or by the end, so the counts are equal exactly when the word starts and ends with the same letter.',
    tags: ['counting', 'surprise', 'substrings'], level: 'intermediate',
    sigma: 'ab', accept: 'start a..a b..b',
    delta: `start a a..a; start b b..b
            a..a a a..a; a..a b a..b; a..b b a..b; a..b a a..a
            b..b b b..b; b..b a b..a; b..a a b..a; b..a b b..b`,
    lang: w => occurrences(w, 'ab') === occurrences(w, 'ba'),
    badges: ['minimal']
  },
  {
    title: 'Every block of a’s has even length',
    blurb: 'Words built from b and aa. The machine is in the middle of a pair of a’s or not; a b in the middle of a pair has nowhere to go.',
    tags: ['runs', 'partial-dfa'], level: 'intro',
    sigma: 'ab', accept: 'even',
    delta: `even b even; even a odd; odd a even`,
    lang: w => /^(b|aa)*$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Contains both aa and bb',
    blurb: 'Two searches at once: the state records the last letter and which of the two pairs has been seen. A product construction drawn out — and smaller than the full product, because seeing a pair also says what the last letter was.',
    tags: ['product-construction', 'substrings', 'intersection'], level: 'intermediate',
    ...explore({
      sigma: 'ab', start: ['', 0, 0],
      step: ([l, A, B], c) => [c, A || (l === 'a' && c === 'a') ? 1 : 0, B || (l === 'b' && c === 'b') ? 1 : 0],
      accept: ([, A, B]) => A && B,
      name: ([l, A, B]) => (A && B ? 'both' : `${A ? 'aa' : B ? 'bb' : 'none'}·${l || '-'}`),
      key: ([l, A, B]) => (A && B ? 'both' : `${l}${A}${B}`),
      minimize: true
    }),
    lang: w => w.includes('aa') && w.includes('bb'),
    badges: ['minimal']
  },
  {
    title: 'Never contains aba',
    blurb: 'The complement of a search: the same states as a matcher for aba, with the final one removed. Every state that remains accepts.',
    tags: ['complement', 'forbidden-pattern', 'partial-dfa'], level: 'intro',
    sigma: 'ab', accept: 'none a ab',
    delta: `none b none; none a a
            a a a; a b ab
            ab b none`,
    lang: w => !w.includes('aba'),
    badges: ['minimal']
  },
  {
    title: 'Letters alternate',
    blurb: 'No aa and no bb: each letter must differ from the one before. Three states — nothing read yet, last was a, last was b.',
    tags: ['alternation', 'partial-dfa'], level: 'intro',
    sigma: 'ab', accept: 'start lastA lastB',
    delta: `start a lastA; start b lastB; lastA b lastB; lastB a lastA`,
    lang: w => !w.includes('aa') && !w.includes('bb'),
    badges: ['minimal']
  },
  {
    title: 'Every a is followed by a b',
    blurb: 'Each a must be immediately answered by a b: the words of (b | ab)*. A request that is still waiting when the input ends is a rejection.',
    tags: ['request-response', 'partial-dfa'], level: 'intro',
    sigma: 'ab', accept: 'ok',
    delta: `ok b ok; ok a waiting; waiting b ok`,
    lang: w => /^(b|ab)*$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'An even number of inversions',
    blurb: 'An inversion is a 1 somewhere before a 0. Counting them all looks quadratic, but only the parity is asked for: each 0 adds the number of 1s before it, so the parity of the 1s is all the machine needs alongside its answer.',
    tags: ['parity', 'inversions', 'surprise'], level: 'advanced',
    ...explore({
      sigma: '01', start: [0, 0],
      step: ([ones, inv], b) => (b === '1' ? [ones ^ 1, inv] : [ones, inv ^ ones]),
      accept: ([, inv]) => inv === 0, name: ([ones, inv]) => `${ones ? 'odd1s' : 'even1s'}·${inv ? 'oddInv' : 'evenInv'}`
    }),
    lang: w => { let ones = 0, inv = 0; for (const c of w) { if (c === '1') ones++; else inv += ones; } return inv % 2 === 0; },
    badges: ['minimal']
  },

  // ── counting ────────────────────────────────────────────────────
  {
    title: 'a’s a multiple of 3, b’s even',
    blurb: 'Two independent counters — a’s mod 3 and b’s mod 2 — run side by side. The machine is their product: six states laid out as a 3 × 2 grid, where a moves along a row and b moves between them.',
    tags: ['product-construction', 'counting', 'modular-arithmetic'], level: 'intro',
    ...explore({
      sigma: 'ab', start: [0, 0],
      step: ([x, y], c) => (c === 'a' ? [(x + 1) % 3, y] : [x, y ^ 1]),
      accept: ([x, y]) => x === 0 && y === 0, name: ([x, y]) => `a${x}b${y}`
    }),
    pos: { a0b0: [0, 0], a1b0: [1, 0], a2b0: [2, 0], a0b1: [0, 1], a1b1: [1, 1], a2b1: [2, 1] },
    lang: w => count(w, 'a') % 3 === 0 && count(w, 'b') % 2 === 0,
    badges: ['minimal']
  },
  {
    title: 'At least two 0s and at most one 1',
    blurb: 'Two thresholds checked together. Past two 0s the zero count no longer matters, and a second 1 is fatal, so the machine is a 3 × 2 product with no state for "two 1s".',
    tags: ['product-construction', 'counting', 'thresholds'], level: 'intro',
    ...explore({
      sigma: '01', start: [0, 0],
      step: ([z, o], c) => (c === '0' ? [Math.min(z + 1, 2), o] : o ? null : [z, 1]),
      accept: ([z]) => z === 2, name: ([z, o]) => `z${z}o${o}`
    }),
    pos: { z0o0: [0, 0], z1o0: [1, 0], z2o0: [2, 0], z0o1: [0, 1], z1o1: [1, 1], z2o1: [2, 1] },
    lang: w => count(w, '0') >= 2 && count(w, '1') <= 1,
    badges: ['minimal']
  },
  {
    title: 'Exactly two b’s',
    blurb: 'Count the b’s and stop counting at two: any a leaves the count alone, and a third b has nowhere to go.',
    tags: ['counting', 'partial-dfa'], level: 'intro',
    sigma: 'ab', accept: 'two',
    delta: `none a none; none b one; one a one; one b two; two a two`,
    lang: w => count(w, 'b') === 2,
    badges: ['minimal']
  },
  {
    title: 'Sums of 3s and 5s',
    blurb: 'Which lengths can be made from steps of 3 and 5? Every one from 8 on, and 0, 3, 5 and 6 below it: 7 is the largest that cannot (the Frobenius number, 3·5 − 3 − 5). A unary machine is a path into a loop, and this one’s loop is a single state.',
    tags: ['unary', 'frobenius', 'number-theory'], level: 'intermediate',
    sigma: 'a', accept: 'n0 n3 n5 n6 n8+',
    delta: `n0 a n1; n1 a n2; n2 a n3; n3 a n4; n4 a n5; n5 a n6; n6 a n7; n7 a n8+; n8+ a n8+`,
    lang: w => ![1, 2, 4, 7].includes(w.length),
    maxLen: 20,
    badges: ['minimal']
  },
  {
    title: 'Lengths divisible by 2 or by 3',
    blurb: 'A unary language is ultimately periodic. Here the period is lcm(2, 3) = 6: a ring of six states, four of them accepting — 0, 2, 3 and 4.',
    tags: ['unary', 'periodicity', 'union'], level: 'intro',
    sigma: 'a', accept: 'n0 n2 n3 n4', layout: 'circle',
    delta: [0, 1, 2, 3, 4, 5].map(i => `n${i} a n${(i + 1) % 6}`).join(';'),
    lang: w => w.length % 2 === 0 || w.length % 3 === 0,
    maxLen: 20,
    badges: ['minimal']
  },
  {
    title: 'An a in every odd position',
    blurb: 'Positions 1, 3, 5, … must hold a; the others may hold anything. The machine only needs to know whether the next position is odd or even.',
    tags: ['positions', 'partial-dfa'], level: 'intro',
    sigma: 'ab', accept: 'odd even',
    delta: `odd a even; even a,b odd`,
    lang: w => [...w].every((c, i) => i % 2 === 1 || c === 'a'),
    badges: ['minimal']
  },
  {
    title: 'Parentheses nested at most three deep',
    blurb: 'Balanced parentheses need a stack in general. With the depth capped at three, the depth itself is the state: a bounded counter is a finite automaton.',
    tags: ['parentheses', 'bounded-depth', 'partial-dfa'], level: 'intro',
    sigma: '()', accept: 'd0',
    delta: `d0 ( d1; d1 ( d2; d2 ( d3; d3 ) d2; d2 ) d1; d1 ) d0`,
    pos: { d0: [0, 0], d1: [1, 0], d2: [2, 0], d3: [3, 0] },
    lang: w => { let d = 0; for (const c of w) { d += c === '(' ? 1 : -1; if (d < 0 || d > 3) return false; } return d === 0; },
    badges: ['minimal']
  },

  // ── formats ─────────────────────────────────────────────────────
  {
    title: 'A 24-hour clock time, HH:MM',
    blurb: 'Valid times from 00:00 to 23:59. The only subtle state is the first digit: after a 2 the next may only be 0–3, so 0/1 and 2 lead to different places.',
    tags: ['validation', 'time', 'format'], level: 'intro',
    sigma: DIGITS + ':', accept: 'done',
    delta: `start 0,1 h01; start 2 h2
            h01 ${range('0', '9')} hh;  h2 ${range('0', '3')} hh
            hh : colon;  colon ${range('0', '5')} m1;  m1 ${range('0', '9')} done`,
    lang: w => /^([01]\d|2[0-3]):[0-5]\d$/.test(w),
    gen: n => `${String(n % 24).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`,
    maxLen: 3,
    tests: ['00:00', '09:45', '19:59', '23:07', '24:00', '19:60', '9:45', '2359'],
    badges: ['minimal']
  },
  {
    title: 'A byte in decimal: 0 to 255',
    blurb: 'One part of an IPv4 address, with no leading zeros. The states are the few prefixes that constrain what follows: a 1 allows two more digits, a 2 depends on the next digit, and 25 allows only 0–5.',
    tags: ['validation', 'networking', 'format'], level: 'intermediate',
    sigma: DIGITS, accept: 'one two any lim done',
    delta: `start 0 done; start 1 one; start 2 two; start ${range('3', '9')} any
            one ${range('0', '9')} any
            two ${range('0', '4')} any; two 5 lim; two ${range('6', '9')} done
            any ${range('0', '9')} done
            lim ${range('0', '5')} done`,
    lang: w => /^(0|[1-9]\d?|1\d\d|2[0-4]\d|25[0-5])$/.test(w),
    maxLen: 4,
    tests: ['0', '7', '42', '199', '249', '255', '256', '300', '01', '1000'],
    badges: ['minimal']
  },
  {
    title: 'A number in scientific notation',
    blurb: 'An optional sign, digits, an optional fraction, an optional exponent with its own sign: d stands for any digit. Every optional part is a fork in the DFA that rejoins the main path.',
    tags: ['validation', 'lexing', 'format'], level: 'intermediate',
    sigma: 'd.e+-', accept: 'int frac exp',
    delta: `start +,- sign; start d int; sign d int
            int d int; int . dot; int e e
            dot d frac; frac d frac; frac e e
            e +,- esign; e d exp; esign d exp; exp d exp`,
    lang: w => /^[+-]?d+(\.d+)?(e[+-]?d+)?$/.test(w),
    tests: ['d', '-dd.d', 'd.de-dd', '+de+d', 'd.', '.d', 'de', 'd.d.d'],
    badges: ['minimal']
  },
  {
    title: 'An identifier',
    blurb: 'A letter or underscore, then letters, digits and underscores: a stands for any letter, 0 for any digit. The first symbol is the only one with a restriction.',
    tags: ['lexing', 'validation'], level: 'intro',
    sigma: 'a0_', accept: 'ident',
    delta: `start a,_ ident; ident a,0,_ ident`,
    lang: w => /^[a_][a0_]*$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'A C comment, /* … */',
    blurb: 'Exactly one block comment: x stands for any other character. The trap is */ inside the body — after a *, a / ends the comment, another * keeps the possibility open, anything else falls back to the body.',
    tags: ['lexing', 'comments'], level: 'intermediate',
    sigma: '/*x', accept: 'done',
    delta: `start / slash; slash * body
            body x,/ body; body * star
            star * star; star x body; star / done`,
    lang: w => /^\/\*([^*]|\*+[^*/])*\*+\/$/.test(w),
    tests: ['/**/', '/*x*/', '/*x**/', '/*/x*/', '/***x*/', '/*x*/x', '/*/', '/*x*x'],
    badges: ['minimal']
  },
  {
    title: 'A string literal with escapes',
    blurb: 'Between two quotes, a backslash escapes whatever comes next — including a quote or another backslash. a stands for any ordinary character.',
    tags: ['lexing', 'escaping'], level: 'intro',
    sigma: '"\\a', accept: 'done',
    delta: `start " in; in a in; in \\ esc; esc ",\\,a in; in " done`,
    lang: w => /^"([^"\\]|\\.)*"$/.test(w),
    tests: ['""', '"a"', '"a\\"a"', '"\\\\"', '"a\\"', '"a"a', '"\\a\\\\"'],
    badges: ['minimal']
  },
  {
    title: 'Roman numerals from I to MMMCMXCIX',
    blurb: 'Every well-formed Roman numeral from 1 to 3999. Hundreds, tens and units each follow one pattern — I, II, III, IV, V … IX — so the minimal DFA is the same five-state gadget three times, after a short run of M’s. Each gadget has a “done” state: IV, IX and III all leave nothing more to say in that place.',
    tags: ['roman-numerals', 'validation', 'format'], level: 'advanced',
    ...explore({ sigma: 'IVXLCDM', start: '', step: (p, c) => (romanPrefixes.has(p + c) ? p + c : null), accept: p => romanValid.has(p), name: p => p || 'start', minimize: true }),
    rename: { IV: 'I✓', XL: 'X✓', CD: 'C✓' },
    pos: {
      start: [0, 1.5], M: [1, 0.5], MM: [1, 1.5], MMM: [1, 2.5],
      C: [2, 0], CC: [3, 0], 'C✓': [4, 1.5], D: [2, 3], DC: [3, 3],
      X: [5, 0], XX: [6, 0], 'X✓': [7, 1.5], L: [5, 3], LX: [6, 3],
      I: [8, 0], II: [9, 0], 'I✓': [10, 1.5], V: [8, 3], VI: [9, 3]
    },
    pitch: 120,
    lang: w => romanValid.has(w),
    label: w => (romanValid.has(w) ? String(romanValue(w)) : ''),
    extra: [...romanValid],
    maxLen: 4,
    tests: ['IV', 'XIX', 'XLII', 'MCMXCIV', 'MMMCMXCIX', 'IIII', 'IC', 'VX', 'MMMM'],
    badges: ['minimal']
  },
  {
    title: 'A password with a letter, a digit and a symbol',
    blurb: 'Three yes-or-no facts, eight states — a cube, one axis per requirement. a, 0 and # stand for any letter, digit and symbol.',
    tags: ['validation', 'product-construction', 'security'], level: 'intro',
    ...explore({
      sigma: 'a0#', start: [0, 0, 0],
      step: ([l, d, s], c) => [l || +(c === 'a'), d || +(c === '0'), s || +(c === '#')],
      accept: ([l, d, s]) => l && d && s, name: ([l, d, s]) => (l || d || s ? `${l ? 'a' : ''}${d ? '0' : ''}${s ? '#' : ''}` : 'none')
    }),
    pos: { none: [0, 1], a: [1, 0], 0: [1, 1], '#': [1, 2], a0: [2, 0], 'a#': [2, 1], '0#': [2, 2], 'a0#': [3, 1] },
    lang: w => w.includes('a') && w.includes('0') && w.includes('#'),
    badges: ['minimal']
  },
  {
    title: 'A keyword: if, in, int or for',
    blurb: 'A finite set of words is a trie, and a trie is a DFA. Minimising it merges every word’s ending into one state, since nothing can follow any of them — but in keeps its own, because int continues it.',
    tags: ['keywords', 'finite-language', 'trie', 'lexing'], level: 'intro',
    ...explore({ sigma: 'ifnotr', start: '', step: (p, c) => (['if', 'in', 'int', 'for'].some(k => k.startsWith(p + c)) ? p + c : null), accept: p => ['if', 'in', 'int', 'for'].includes(p), name: p => p || 'start', minimize: true }),
    lang: w => ['if', 'in', 'int', 'for'].includes(w),
    tests: ['if', 'in', 'int', 'for', 'i', 'fo', 'inf', 'into'],
    badges: ['minimal']
  },

  // ── things in the world ────────────────────────────────────────
  {
    title: 'Exact change: 30¢ in nickels, dimes and quarters',
    blurb: 'n is 5¢, d is 10¢, q is 25¢. The machine accepts the coin sequences that add up to exactly 30¢ — the states are the running total, and overpaying has nowhere to go.',
    tags: ['vending-machine', 'counting', 'partial-dfa'], level: 'intro',
    ...explore({
      sigma: 'ndq', start: 0,
      step: (t, c) => { const v = t + { n: 5, d: 10, q: 25 }[c]; return v > 30 ? null : v; },
      accept: t => t === 30, name: t => `${t}¢`
    }),
    lang: w => [...w].reduce((s, c) => s + { n: 5, d: 10, q: 25 }[c], 0) === 30,
    badges: ['minimal']
  },
  {
    title: 'A game of tennis, won by A',
    blurb: 'Each symbol is a point, a or b. The states are the scores as an umpire calls them, and the run stops when someone wins. It is not minimal — 30–30 behaves exactly like deuce, and 40–30 like advantage A — which the minimal DFA notices and an umpire never would.',
    tags: ['games', 'sports', 'minimisation'], level: 'intermediate',
    ...explore(tennis),
    lang: accepts(tennis),
    tests: ['aaaa', 'ababaa', 'bbbaaaaa', 'abababaa', 'aaab', 'bbbb', 'aaaab'],
    maxLen: 12
  },
  {
    title: 'Wolf, goat and cabbage',
    blurb: 'A farmer must ferry a wolf, a goat and a cabbage across a river, one at a time, never leaving the wolf with the goat or the goat with the cabbage. f crosses alone; w, g, c take that passenger. The accepted words are the solutions; the two shortest take seven crossings.',
    tags: ['puzzles', 'state-space-search', 'partial-dfa'], level: 'intermediate',
    ...explore(wgc),
    lang: accepts(wgc),
    tests: ['gfwgcfg', 'gfcgwfg', 'gfwgcfgfg', 'gfwfg', 'fgwgcfg', 'wfgcfwg'],
    maxLen: 7
  },
  {
    title: 'Towers of Hanoi, three disks',
    blurb: 'Each symbol moves the top disk from one peg to another; an illegal move has no edge. The 27 states are every legal arrangement, and drawn by where the disks sit they form a Sierpiński triangle. The shortest solution is 2³ − 1 = 7 moves.',
    tags: ['puzzles', 'hanoi', 'state-space-search', 'fractals'], level: 'advanced',
    ...explore(hanoi),
    pos: sierpinski, pitch: 110,
    lang: accepts(hanoi),
    tests: ['AC AB CB AC BA BC AC', 'AC AB CB AC BA BC AB CA', 'AC AB CB AC BA BC', 'AC AC', 'AB AC CB AC BA BC AC'],
    maxLen: 4
  },
  {
    title: 'Shuffling three cards',
    blurb: 's swaps the top two cards; c moves the top card to the bottom. Accepted: the shuffles that put the deck back in order. The six states are the six orders, and the machine is the Cayley graph of the permutation group S₃.',
    tags: ['group-theory', 'permutations', 'cards'], level: 'intermediate',
    ...explore(cards), layout: 'circle',
    lang: accepts(cards),
    badges: ['minimal']
  },
  {
    title: 'A robot that comes home',
    blurb: 'A robot in a 3 × 3 room starts in a corner and moves N, S, E or W; walking into a wall is not allowed. Accepted: the walks that end where they began. Every closed walk on this grid has even length, and the machine shows why — the squares are coloured like a chessboard.',
    tags: ['grids', 'walks', 'partial-dfa'], level: 'intro',
    ...explore(room),
    pos: Object.fromEntries([0, 1, 2].flatMap(x => [0, 1, 2].map(y => [`${x},${y}`, [x, y]]))),
    lang: accepts(room),
    badges: ['minimal']
  },
  {
    title: 'Lights Out on a 2 × 2 board',
    blurb: 'All four lights start on. Pressing one toggles it and its two neighbours. Accepted: the press sequences that turn everything off. The moves commute and each is its own inverse, so what matters is only which buttons were pressed an odd number of times.',
    tags: ['puzzles', 'group-theory', 'lights-out'], level: 'intermediate',
    ...explore(lights),
    // placed by which buttons have been pressed an odd number of times, so
    // every press is one step along one axis of a four-dimensional cube
    pos: Object.fromEntries([...Array(16).keys()].map(p => {
      const s = [0, 1, 2, 3].reduce((q, b) => (p >> b & 1 ? lights.step(q, String(b + 1)) : q), lights.start);
      const bit = b => p >> b & 1;
      return [lights.name(s), [bit(0) + 2.4 * bit(2) + 0.45 * bit(1), bit(1) + 2.4 * bit(3) + 0.3 * bit(0)]];
    })),
    pitch: 150,
    lang: accepts(lights),
    badges: ['minimal']
  },
  {
    title: 'Rolling a die until 6 is on top',
    blurb: 'A die rolls N, S, E or W, and the machine accepts when 6 faces up. The die has 24 orientations, but only one fact matters for this question — which way the 6 is facing — so the minimal DFA has six states, not 24.',
    tags: ['geometry', 'dice', 'minimisation'], level: 'intermediate',
    sigma: 'NSEW', start: 'down',
    // where the 6 faces after a roll: rolling north tips the top face to the north side, and so on
    delta: `down N S; down S N; down E W; down W E
            up N N; up S S; up E E; up W W
            N N down; N S up; N E N; N W N
            S N up; S S down; S E S; S W S
            E E down; E W up; E N E; E S E
            W W down; W E up; W N W; W S W`,
    accept: 'up',
    pos: { up: [1.5, 0], N: [1.5, 1.1], E: [2.9, 1.6], S: [1.5, 2.1], W: [0.1, 1.6], down: [1.5, 3.2] },
    lang: accepts(die),
    badges: ['minimal']
  },
  {
    title: 'A gene, start codon to stop codon',
    blurb: 'Is this read one open reading frame? It must begin with ATG, continue in whole codons none of which is a stop, and end on TAA, TAG or TGA. Inside the frame the machine counts bases mod 3, and only watches for T, TA and TG — the beginnings of a stop codon.',
    tags: ['dna', 'biology', 'reading-frames'], level: 'intermediate',
    sigma: 'ACGT', accept: 'stop',
    delta: `start A A; A T AT; AT G frame
            frame T T; frame A,C,G x
            T A TA; T G TG; T C,T xx
            x A,C,G,T xx
            xx A,C,G,T frame
            TA A,G stop; TA C,T frame
            TG A stop; TG C,G,T frame`,
    pos: { start: [0, 0], A: [0.8, 0], AT: [1.6, 0], frame: [2.6, 0], x: [3.6, -1], xx: [4.8, -1], T: [3.6, 1], TA: [4.8, 0.4], TG: [4.8, 1.6], stop: [6, 1] },
    pitch: 150,
    lang: w => /^ATG(?:(?!TAA|TAG|TGA)[ACGT]{3})*(?:TAA|TAG|TGA)$/.test(w),
    gen: n => 'ATG' + ['GCA', 'TTC', 'TCA', 'AAA'].slice(0, n % 5).join('') + ['TAA', 'TAG', 'TGA'][n % 3],
    tests: ['ATGTAA', 'ATGGCATTCTGA', 'ATGTCATAG', 'ATGTAAGCATAA', 'ATGGCTAA', 'ATCTAA', 'ATGGCA'],
    badges: ['minimal']
  },
  {
    title: 'Two processes, one critical section',
    blurb: 'A+ and A− are process A entering and leaving its critical section, B+ and B− the same for B. Accepted: traces that keep mutual exclusion and end with both outside. The state where both are inside does not exist — that is the property.',
    tags: ['concurrency', 'mutual-exclusion', 'protocols'], level: 'intro',
    sigma: ['A+', 'A-', 'B+', 'B-'], accept: 'idle',
    delta: `idle A+ inA; idle B+ inB; inA A- idle; inB B- idle`,
    lang: w => { let a = 0, b = 0; for (const e of w) { if (e === 'A+') { if (a || b) return false; a = 1; } else if (e === 'A-') { if (!a) return false; a = 0; } else if (e === 'B+') { if (a || b) return false; b = 1; } else { if (!b) return false; b = 0; } } return !a && !b; },
    badges: ['minimal']
  }
];
