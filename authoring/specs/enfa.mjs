// ε-NFAs: machines where a move that reads nothing is the clearest way to say
// "either", "optionally" or "and then".

export const type = 'ε-NFA';

const count = (w, c) => [...w].filter(x => x === c).length;

const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

// The Levenshtein automaton for "cat": (how much of cat is matched, edits used).
const levName = (i, e) => `${'cat'.slice(0, i) || '∅'}${e ? '′' : ''}`;
const levDelta = (() => {
  const rules = [];
  for (let i = 0; i <= 3; i++) {
    if (i < 3) rules.push(`${levName(i, 0)} ${'cat'[i]} ${levName(i + 1, 0)}`, `${levName(i, 1)} ${'cat'[i]} ${levName(i + 1, 1)}`);
    rules.push(`${levName(i, 0)} c,a,t,x ${levName(i, 1)}`);                         // insert a letter
    if (i < 3) rules.push(`${levName(i, 0)} c,a,t,x ${levName(i + 1, 1)}`, `${levName(i, 0)} ε ${levName(i + 1, 1)}`); // substitute, delete
  }
  return rules.join('\n');
})();

export default [
  {
    title: 'Thompson’s construction of (a|b)*abb', chapter: 'Aho, Lam, Sethi & Ullman, Compilers (the dragon book), §3.7',
    blurb: 'The ε-NFA that Thompson’s construction builds from the regular expression (a|b)*abb, state for state as in the dragon book: each operator contributes a small gadget, and ε-moves glue the gadgets together.',
    tags: ['thompson-construction', 'regular-expressions', 'compilers'], level: 'intermediate',
    sigma: 'ab', start: '0', accept: '10',
    delta: `0 ε 1; 0 ε 7; 1 ε 2; 1 ε 4; 2 a 3; 4 b 5; 3 ε 6; 5 ε 6; 6 ε 1; 6 ε 7
            7 a 8; 8 b 9; 9 b 10`,
    pos: { 0: [0, 1], 1: [1, 1], 2: [2, 0.3], 3: [3, 0.3], 4: [2, 1.7], 5: [3, 1.7], 6: [4, 1], 7: [5, 1], 8: [6, 1], 9: [7, 1], 10: [8, 1] },
    pitch: 120,
    lang: w => /^[ab]*abb$/.test(w)
  },
  {
    title: 'An even number of a’s, or an odd number of b’s',
    blurb: 'Union by ε: the start state jumps silently into two separate machines, one counting a’s and one counting b’s, and the word is accepted if either ends in an accepting state. Each half ignores the other’s letter.',
    tags: ['union', 'parity', 'closure-properties'], level: 'intro',
    sigma: 'ab', start: 'start', accept: 'evenA oddB',
    delta: `start ε evenA; start ε evenB
            evenA a oddA; oddA a evenA; evenA b evenA; oddA b oddA
            evenB b oddB; oddB b evenB; evenB a evenB; oddB a oddB`,
    pos: { start: [0, 1], evenA: [1, 0], oddA: [2, 0], evenB: [1, 2], oddB: [2, 2] },
    lang: w => count(w, 'a') % 2 === 0 || count(w, 'b') % 2 === 1
  },
  {
    title: 'a’s, then b’s, then c’s',
    blurb: 'a*b*c* as three loops chained by ε-moves. The ε-closure of the start state is all three states, so the empty word, a lone b and a lone c are all accepted without the machine ever reading an a.',
    tags: ['concatenation', 'kleene-star', 'epsilon-closure'], level: 'intro',
    sigma: 'abc', start: 'As', accept: 'Cs',
    delta: `As a As; As ε Bs; Bs b Bs; Bs ε Cs; Cs c Cs`,
    pos: { As: [0, 0], Bs: [1, 0], Cs: [2, 0] },
    lang: w => /^a*b*c*$/.test(w)
  },
  {
    title: 'Within one typo of “cat”',
    blurb: 'A Levenshtein automaton: accept every word one edit or fewer from cat. Each state is how much of cat has been matched and whether the edit is spent. A letter read sideways is an insertion, diagonally a substitution, and an ε-move diagonally is a deletion. x stands for any other letter.',
    tags: ['edit-distance', 'spell-checking', 'approximate-matching'], level: 'advanced',
    sigma: 'catx', start: '∅', accept: 'cat cat′',
    delta: levDelta,
    pos: { '∅': [0, 0], c: [1, 0], ca: [2, 0], cat: [3, 0], '∅′': [0, 1.2], 'c′': [1, 1.2], 'ca′': [2, 1.2], 'cat′': [3, 1.2] },
    pitch: 180,
    lang: w => lev(w, 'cat') <= 1,
    tests: ['cat', 'at', 'caxt', 'cxt', 'xcat', 'catx', 'ct', 'act', 'xxx', 'tac']
  },
  {
    title: 'A phone number, area code optional',
    blurb: 'ddd-dddd, optionally preceded by an area code in parentheses: d stands for any digit. The ε-move is the word “optionally” — it lets the machine skip the area-code branch without reading anything.',
    tags: ['validation', 'format', 'optional'], level: 'intro',
    sigma: 'd()-', start: 'start', accept: 'done',
    delta: `start ( p0; p0 d p1; p1 d p2; p2 d p3; p3 ) local
            start ε local
            local d l1; l1 d l2; l2 d l3; l3 - dash
            dash d m1; m1 d m2; m2 d m3; m3 d done`,
    lang: w => /^(\(ddd\))?ddd-dddd$/.test(w),
    maxLen: 3,
    tests: ['ddd-dddd', '(ddd)ddd-dddd', 'ddddddd', '(dd)ddd-dddd', 'ddd-ddd', '(ddd)-ddd-dddd']
  }
];
