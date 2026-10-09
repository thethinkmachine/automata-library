// More DFAs.

import { explore, runSteps } from '../lib/explore.mjs';

export const type = 'DFA';

const accepts = machine => w => { const q = runSteps(machine, typeof w === 'string' ? [...w] : w); return q !== null && machine.accept(q); };

// A 2 × 2 sliding puzzle: three tiles and a gap; a move slides the gap.
const slide = {
  sigma: 'UDLR', start: '123_',
  step: (s, m) => {
    const b = s.indexOf('_'), x = b % 2, y = b >> 1;
    const [nx, ny] = { U: [x, y - 1], D: [x, y + 1], L: [x - 1, y], R: [x + 1, y] }[m];
    if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return null;
    const t = ny * 2 + nx, a = [...s];
    [a[b], a[t]] = [a[t], a[b]];
    return a.join('');
  },
  accept: s => s === '123_', name: s => s
};

// Černý's automaton on four states: a turns the ring, b moves only state 3, to 0.
const cerny = {
  sigma: 'ab', start: 0,
  step: (i, c) => (c === 'a' ? (i + 1) % 4 : i === 3 ? 0 : i),
  accept: i => i === 0, name: i => `q${i}`
};

export default [
  {
    title: 'Binary multiples of 6, in four states',
    blurb: 'A remainder machine for 6 would have six states, but two pairs of them can be merged: from remainder 1 and from remainder 4 the same continuations reach 0, because 2·1 and 2·4 are both 2 mod 6. Divisibility by 6 is divisibility by 2 and by 3, and the last bit already says the first.',
    tags: ['divisibility', 'binary-numbers', 'minimisation'], level: 'intermediate',
    ...explore({ sigma: '01', start: 0, step: (r, b) => (2 * r + +b) % 6, accept: r => r === 0, name: r => `r${r}`, minimize: true }),
    lang: w => w === '' || parseInt(w, 2) % 6 === 0,
    label: w => String(parseInt(w || '0', 2)),
    prefer: w => /^1/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Once bb, never aa',
    blurb: 'Two patterns in sequence: aa is allowed until the first bb, and forbidden from then on. The machine runs a search for bb, and when it finds it switches into a second machine that forbids aa — the order of events, remembered by which half of the diagram the run is in.',
    tags: ['patterns', 'sequencing', 'safety'], level: 'intermediate',
    sigma: 'ab', start: 'pre', accept: 'pre preB post postA',
    delta: `pre a pre; pre b preB; preB a pre; preB b post
            post b post; post a postA; postA b post`,
    lang: w => { const i = w.indexOf('bb'); return i < 0 || !w.slice(i + 2).includes('aa') && !(w.slice(i + 1).startsWith('baa')); },
    badges: ['minimal']
  },
  {
    title: 'a, then later b, then later c',
    blurb: 'abc as a subsequence: the letters must appear in that order, but anything may come between them. A substring search falls back on a mismatch; a subsequence search never has to, since a wrong letter is just skipped. Four states, each a self-loop on everything it is not waiting for.',
    tags: ['subsequences', 'patterns'], level: 'intro',
    sigma: 'abc', start: 'none', accept: 'abc',
    delta: `none b,c none; none a a; a a,c a; a b ab; ab a,b ab; ab c abc; abc a,b,c abc`,
    lang: w => /a.*b.*c/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Černý’s automaton: one word that resets everything',
    blurb: 'a turns the ring of four states; b moves only q3, to q0. Some word sends every state to the same place — baaabaaab, nine letters, ending in q0 from wherever it started — and none is shorter. Černý conjectured in 1964 that an n-state automaton that can be reset at all can be reset in (n − 1)² letters; this machine is why that bound would be exact. The conjecture is still open.',
    tags: ['synchronising-words', 'cerny-conjecture', 'open-problems'], level: 'advanced',
    ...explore(cerny),
    layout: 'circle',
    lang: accepts(cerny),
    tests: ['baaabaaab', 'aaaa', 'aaab', 'b', 'a', 'baaabaaa'],
    badges: ['minimal']
  },
  {
    title: 'MFM encoding: between two 1s, one to three 0s',
    blurb: 'Floppy disks recorded data in MFM, whose bit stream obeys a (1,3) run-length limit: two 1s are separated by at least one 0, so pulses never crowd, and at most three, so the clock never drifts. The DFA counts the 0s since the last 1.',
    tags: ['coding', 'storage', 'run-length-limited'], level: 'intermediate',
    sigma: '01', start: 'start', accept: 'start one z1 z2 z3',
    delta: `start 0 start; start 1 one
            one 0 z1; z1 0 z2; z2 0 z3
            z1 1 one; z2 1 one; z3 1 one`,
    lang: w => { const i = w.indexOf('1'); if (i < 0) return true; return [...w.slice(i).matchAll(/1(0*)(?=1)/g)].every(m => m[1].length >= 1 && m[1].length <= 3) && /0{0,3}$/.test(w.slice(w.lastIndexOf('1') + 1)) && (w.length - w.lastIndexOf('1') - 1) <= 3; },
    badges: ['minimal']
  },
  {
    title: 'Every window of five has two 0s',
    blurb: 'Every block of five consecutive symbols contains at least two 0s. A sliding-window property: the machine need only remember the last four symbols, and in fact fewer distinctions than that — minimised, it has fifteen states rather than the sixteen windows, because two windows behave alike.',
    chapter: 'Hopcroft, Motwani & Ullman, exercises to §2.2',
    tags: ['textbook', 'hopcroft', 'sliding-window'], level: 'intermediate',
    ...explore({ sigma: '01', start: '', step: (q, c) => { const s = q + c; if (s.length >= 5 && [...s.slice(-5)].filter(x => x === '0').length < 2) return null; return s.slice(-4); }, accept: () => true, name: q => q || 'start', minimize: true }),
    lang: w => { for (let i = 0; i + 5 <= w.length; i++) if ([...w.slice(i, i + 5)].filter(x => x === '0').length < 2) return false; return true; },
    badges: ['minimal']
  },
  {
    title: 'A 2 × 2 sliding puzzle',
    blurb: 'Three tiles and a gap; a move slides the gap up, down, left or right. Of the 24 ways to place three tiles and a gap, only 12 can be reached — and that is the 15-puzzle’s famous parity argument in miniature: every move is a swap, and the gap returns to its corner only after an even number of them.',
    tags: ['puzzles', 'parity', 'permutations'], level: 'intermediate',
    ...explore(slide),
    pos: (() => { const st = explore(slide).states; return Object.fromEntries(st.map((s, i) => [s, [Math.cos(2 * Math.PI * i / st.length) * 2 + 2, Math.sin(2 * Math.PI * i / st.length) * 2 + 2]])); })(),
    lang: accepts(slide),
    badges: ['minimal']
  }
];
