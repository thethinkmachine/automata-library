// The textbook examples: machines as Sipser and Hopcroft, Motwani & Ullman
// draw them, with their state names. `chapter` says where; the blurbs are ours.
// Each is checked like everything else, against a reference written from the
// language the book describes rather than from its diagram.

const count = (w, c) => [...w].filter(x => x === c).length;
const shape = (w, letters) => {
  const m = w.match(new RegExp('^' + [...letters].map(l => `(${l}*)`).join('') + '$'));
  return m ? m.slice(1).map(x => x.length) : null;
};
const SIPSER = 'Sipser, Introduction to the Theory of Computation';
const HMU = 'Hopcroft, Motwani & Ullman';

export default [
  // ── Sipser, chapter 1 ───────────────────────────────────────────
  {
    type: 'DFA', chapter: `${SIPSER}, §1.1 (M1)`,
    title: 'Sipser’s M1: a 1, then an even number of 0s',
    blurb: 'The first finite automaton in Sipser’s book. It accepts a string when it contains at least one 1 and an even number of 0s follow the last 1. Three states: no 1 yet, an even run of 0s since the last 1, and an odd one.',
    tags: ['textbook', 'sipser', 'first-example'], level: 'intro',
    sigma: '01', start: 'q1', accept: 'q2',
    delta: `q1 0 q1; q1 1 q2; q2 1 q2; q2 0 q3; q3 0,1 q2`,
    lang: w => w.includes('1') && (w.length - 1 - w.lastIndexOf('1')) % 2 === 0,
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, §1.1 (M2)`,
    title: 'Sipser’s M2: ends in 1',
    blurb: 'Two states that record only the last symbol read; the accepting one is “the last symbol was a 1”. The smallest machine whose state means something.',
    tags: ['textbook', 'sipser', 'suffix'], level: 'intro',
    sigma: '01', start: 'q1', accept: 'q2',
    delta: `q1 0 q1; q1 1 q2; q2 1 q2; q2 0 q1`,
    lang: w => w.endsWith('1'),
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, §1.1 (M3)`,
    title: 'Sipser’s M3: empty, or ends in 0',
    blurb: 'M2 with the accepting state swapped. Swapping accepting and rejecting states complements the language — and since the start state now accepts, the empty string is in it.',
    tags: ['textbook', 'sipser', 'complement'], level: 'intro',
    sigma: '01', start: 'q1', accept: 'q1',
    delta: `q1 0 q1; q1 1 q2; q2 1 q2; q2 0 q1`,
    lang: w => !w.endsWith('1'),
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, §1.1 (M4)`,
    title: 'Sipser’s M4: starts and ends with the same symbol',
    blurb: 'The first symbol picks one of two separate halves of the machine, and each half then remembers only whether the last symbol matched the first. Nothing is ever shared between the halves. Compare “As many ab’s as ba’s”, which is the same language plus the empty string.',
    tags: ['textbook', 'sipser', 'branching'], level: 'intro',
    sigma: 'ab', start: 's', accept: 'q1 r1',
    delta: `s a q1; s b r1
            q1 a q1; q1 b q2; q2 b q2; q2 a q1
            r1 b r1; r1 a r2; r2 a r2; r2 b r1`,
    pos: { s: [0, 1], q1: [1, 0], q2: [2, 0], r1: [1, 2], r2: [2, 2] },
    lang: w => w.length > 0 && w[0] === w[w.length - 1],
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, §1.1 (M5)`,
    title: 'Sipser’s M5: a running sum mod 3, with reset',
    blurb: 'The symbols are 0, 1, 2 and R (Sipser’s ⟨RESET⟩). The machine keeps the sum of the numbers since the last reset, mod 3, and accepts when it is 0. A reset is one more edge out of every state, all landing at the start.',
    tags: ['textbook', 'sipser', 'modular-arithmetic'], level: 'intro',
    sigma: '012R', start: 'q0', accept: 'q0', layout: 'circle',
    delta: `q0 0,R q0; q0 1 q1; q0 2 q2
            q1 0 q1; q1 1 q2; q1 2,R q0
            q2 0 q2; q2 1,R q0; q2 2 q1`,
    lang: w => [...w.slice(w.lastIndexOf('R') + 1)].reduce((s, c) => s + +c, 0) % 3 === 0,
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, §1.1 (designing a DFA)`,
    title: 'Contains 001',
    blurb: 'Sipser’s worked example of designing a DFA by asking what to remember: nothing useful yet, a 0, 00, or the whole pattern. After 00 a further 0 changes nothing — the last two symbols are still 00.',
    tags: ['textbook', 'sipser', 'substrings'], level: 'intro',
    sigma: '01', start: 'q', accept: 'q001',
    delta: `q 1 q; q 0 q0; q0 1 q; q0 0 q00; q00 0 q00; q00 1 q001; q001 0,1 q001`,
    lang: w => w.includes('001'),
    badges: ['minimal']
  },
  {
    type: 'ε-NFA', chapter: `${SIPSER}, §1.2 (N1)`,
    title: 'Sipser’s N1: contains 101 or 11',
    blurb: 'The NFA Sipser uses to introduce nondeterminism. In q1 it may stay or guess that this 1 starts the pattern; from q2 the ε-move lets the middle 0 be skipped, so the same three edges match both 101 and 11.',
    tags: ['textbook', 'sipser', 'nondeterminism', 'substrings'], level: 'intro',
    sigma: '01', start: 'q1', accept: 'q4',
    delta: `q1 0,1 q1; q1 1 q2; q2 0,ε q3; q3 1 q4; q4 0,1 q4`,
    pos: { q1: [0, 0], q2: [1, 0], q3: [2, 0], q4: [3, 0] },
    lang: w => w.includes('11') || w.includes('101')
  },
  {
    type: 'ε-NFA', chapter: `${SIPSER}, §1.2 (N3)`,
    title: 'Sipser’s N3: unary lengths divisible by 2 or 3',
    blurb: 'An ε-move from the start chooses between a cycle of two and a cycle of three, each accepting at its own beginning. The DFA for the same language is one cycle of six — the product of the two.',
    tags: ['textbook', 'sipser', 'unary', 'union'], level: 'intro',
    sigma: '0', start: 'start', accept: 'two0 three0',
    delta: `start ε two0; start ε three0
            two0 0 two1; two1 0 two0
            three0 0 three1; three1 0 three2; three2 0 three0`,
    pos: { start: [0, 1], two0: [1, 0], two1: [2, 0], three0: [1, 2], three1: [2, 1.6], three2: [2, 2.4] },
    lang: w => w.length % 2 === 0 || w.length % 3 === 0,
    maxLen: 30
  },
  {
    type: 'ε-NFA', chapter: `${SIPSER}, §1.2 (N4)`,
    title: 'Sipser’s N4: the NFA converted in the text',
    blurb: 'The three-state machine Sipser turns into a DFA to show the subset construction, ε-closures included. It accepts ε, a, baa and baba and rejects b, bb and babba. As a regular expression its language is (a ∪ ba*(a ∪ b)a)*.',
    tags: ['textbook', 'sipser', 'subset-construction', 'epsilon-closure'], level: 'intermediate',
    sigma: 'ab', start: '1', accept: '1',
    delta: `1 b 2; 1 ε 3; 2 a 2; 2 a,b 3; 3 a 1`,
    pos: { 1: [0.5, 0], 2: [0, 1], 3: [1, 1] },
    lang: w => /^(a|ba*(a|b)a)*$/.test(w),
    tests: ['', 'a', 'baa', 'baba', 'b', 'bb', 'babba']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, exercises to chapter 1`,
    title: 'Starts with 1 and ends with 0',
    blurb: 'A first symbol that decides everything: a leading 0 sends the machine to a state it never leaves. After a leading 1, only the last symbol matters.',
    tags: ['textbook', 'sipser', 'prefix', 'suffix'], level: 'intro',
    sigma: '01', start: 's', accept: 'end0',
    delta: `s 1 end1; s 0 dead; end1 1 end1; end1 0 end0; end0 0 end0; end0 1 end1; dead 0,1 dead`,
    lang: w => w.startsWith('1') && w.endsWith('0'),
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, exercises to chapter 1`,
    title: 'Starts with 0 and has odd length, or starts with 1 and even length',
    blurb: 'Two conditions that look like two branches, each with its own parity counter. Minimise it and the branches collapse into one: after the first symbol, all that matters is whether the length so far has the parity that symbol asked for. Three states.',
    tags: ['textbook', 'sipser', 'parity', 'branching'], level: 'intro',
    sigma: '01', start: 's', accept: 'yes',
    delta: `s 0 yes; s 1 no; yes 0,1 no; no 0,1 yes`,
    lang: w => (w[0] === '0' && w.length % 2 === 1) || (w[0] === '1' && w.length % 2 === 0),
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, exercises to chapter 1`,
    title: 'Never contains 110',
    blurb: 'Once 11 has been read, a 0 would complete the forbidden pattern and every further 1 keeps the danger alive — so the state after 11 has a self-loop on 1 and no way out on 0.',
    tags: ['textbook', 'sipser', 'forbidden-pattern', 'partial-dfa'], level: 'intro',
    sigma: '01', start: 'none', accept: 'none one oneone',
    delta: `none 0 none; none 1 one; one 0 none; one 1 oneone; oneone 1 oneone`,
    lang: w => !w.includes('110'),
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${SIPSER}, exercises to chapter 1`,
    title: 'An even number of 0s, or exactly two 1s',
    blurb: 'A union, built as a product: one component counts 0s mod 2, the other counts 1s up to three. Accept when either component is happy — eight states, laid out as the 2 × 4 grid they are.',
    tags: ['textbook', 'sipser', 'union', 'product-construction'], level: 'intermediate',
    sigma: '01', start: 'e0', accept: 'e0 e1 e2 e3 o2',
    delta: `e0 0 o0; e0 1 e1; o0 0 e0; o0 1 o1
            e1 0 o1; e1 1 e2; o1 0 e1; o1 1 o2
            e2 0 o2; e2 1 e3; o2 0 e2; o2 1 o3
            e3 0 o3; e3 1 e3; o3 0 e3; o3 1 o3`,
    pos: { e0: [0, 0], e1: [1, 0], e2: [2, 0], e3: [3, 0], o0: [0, 1], o1: [1, 1], o2: [2, 1], o3: [3, 1] },
    lang: w => count(w, '0') % 2 === 0 || count(w, '1') === 2,
    badges: ['minimal']
  },

  // ── Sipser, chapters 2 and 3 ────────────────────────────────────
  {
    type: 'NPDA', chapter: `${SIPSER}, §2.2`,
    title: 'aⁱbʲcᵏ with i = j or i = k',
    blurb: 'Sipser’s example of a language that needs nondeterminism. Push the a’s; then guess whether they will be matched by the b’s or by the c’s, and skip the other block. Not to be confused with i = j or j = k, which has its own entry.',
    tags: ['textbook', 'sipser', 'guessing', 'union'], level: 'intermediate',
    sigma: 'abc', start: 's', accept: 'c1 f2',
    delta: `s a,ε/X s; s ε,ε/ε p1; s ε,ε/ε p2
            p1 b,X/ε p1; p1 ε,Z/Z c1; c1 c,ε/ε c1
            p2 b,ε/ε p2; p2 ε,ε/ε r2; r2 c,X/ε r2; r2 ε,Z/Z f2`,
    lang: w => { const s = shape(w, 'abc'); return !!s && (s[0] === s[1] || s[0] === s[2]); },
    gen: n => 'a'.repeat(n % 4) + 'b'.repeat(n % 3) + 'c'.repeat(n % 4)
  },
  {
    type: 'TM', chapter: `${SIPSER}, §3.1 (M2)`,
    title: 'Sipser’s M2: 0s whose number is a power of 2',
    blurb: 'Each pass crosses off every other 0, halving the count; an odd count above one means the number was not a power of 2. The first 0 is replaced by a blank so the machine can find the left end of its tape again.',
    tags: ['textbook', 'sipser', 'powers-of-two', 'halving'], level: 'intermediate',
    sigma: '0', start: 'q1', accept: 'acc',
    delta: `q1 0/_,R q2
            q2 x/=,R q2; q2 _/=,R acc; q2 0/x,R q3
            q3 x/=,R q3; q3 0/=,R q4; q3 _/=,L q5
            q4 x/=,R q4; q4 0/x,R q3
            q5 0,x/=,L q5; q5 _/=,R q2`,
    lang: w => w.length > 0 && (w.length & (w.length - 1)) === 0,
    maxLen: 20
  },

  // ── Hopcroft, Motwani & Ullman ──────────────────────────────────
  {
    type: 'DFA', chapter: `${HMU}, §2.2`,
    title: 'Contains 01',
    blurb: 'The first DFA in Hopcroft, Motwani and Ullman. q0 has seen no 0 yet (or only 1s since), q2 has just seen a 0 and is waiting for a 1, and q1 has found 01 and will never leave.',
    tags: ['textbook', 'hopcroft', 'substrings'], level: 'intro',
    sigma: '01', start: 'q0', accept: 'q1',
    delta: `q0 1 q0; q0 0 q2; q2 0 q2; q2 1 q1; q1 0,1 q1`,
    lang: w => w.includes('01'),
    badges: ['minimal']
  },
  {
    type: 'DFA', chapter: `${HMU}, §2.2`,
    title: 'An even number of 0s and an even number of 1s',
    blurb: 'Four states, one for each pair of parities, drawn as a square: a 0 moves across it, a 1 moves up or down. The accepting corner is where both parities are even.',
    tags: ['textbook', 'hopcroft', 'parity', 'product-construction'], level: 'intro',
    sigma: '01', start: 'q0', accept: 'q0',
    delta: `q0 1 q1; q1 1 q0; q2 1 q3; q3 1 q2
            q0 0 q2; q2 0 q0; q1 0 q3; q3 0 q1`,
    pos: { q0: [0, 0], q1: [1, 0], q2: [0, 1], q3: [1, 1] },
    lang: w => count(w, '0') % 2 === 0 && count(w, '1') % 2 === 0,
    badges: ['minimal']
  },
  {
    type: 'NFA', chapter: `${HMU}, §2.3`,
    title: 'Ends in 01, by guessing',
    blurb: 'The NFA Hopcroft, Motwani and Ullman use to introduce nondeterminism: stay in q0, or guess that this 0 is the second-to-last symbol and check that a 1 and then the end follow. Its DFA has three states too — the guess saves nothing here, which is part of the lesson.',
    tags: ['textbook', 'hopcroft', 'nondeterminism', 'suffix'], level: 'intro',
    sigma: '01', start: 'q0', accept: 'q2',
    delta: `q0 0,1 q0; q0 0 q1; q1 1 q2`,
    pos: { q0: [0, 0], q1: [1, 0], q2: [2, 0] },
    lang: w => w.endsWith('01')
  },
  {
    type: 'NFA', chapter: `${HMU}, §2.4 (text search)`,
    title: 'Finding “web” or “ebay”',
    blurb: 'Keyword search as an NFA: the start state loops on everything and, at each position, may guess that a keyword starts here. It accepts the texts that end in a keyword, so a search tool running it reports a hit each time it passes through an accepting state. x stands for any other letter.',
    tags: ['textbook', 'hopcroft', 'text-search', 'keywords'], level: 'intro',
    sigma: 'webayx', start: '1', accept: '4 8',
    delta: `1 w,e,b,a,y,x 1
            1 w 2; 2 e 3; 3 b 4
            1 e 5; 5 b 6; 6 a 7; 7 y 8`,
    pos: { 1: [0, 1], 2: [1, 0.3], 3: [2, 0.3], 4: [3, 0.3], 5: [1, 1.7], 6: [2, 1.7], 7: [3, 1.7], 8: [4, 1.7] },
    lang: w => w.endsWith('web') || w.endsWith('ebay'),
    maxLen: 5,
    tests: ['web', 'ebay', 'xxweb', 'webebay', 'webx', 'ebxay', 'wbe', 'eba']
  },
  {
    type: 'ε-NFA', chapter: `${HMU}, §2.5`,
    title: 'A decimal number, with ε-moves',
    blurb: 'An optional sign, digits, a decimal point and more digits — either run of digits may be empty, but not both. The ε-move at the start makes the sign optional and the one at the end lets two routes share an accepting state. d stands for any digit.',
    tags: ['textbook', 'hopcroft', 'epsilon-moves', 'numbers'], level: 'intro',
    sigma: 'd.+-', start: 'q0', accept: 'q5',
    delta: `q0 ε,+,- q1
            q1 d q1; q1 . q2; q1 d q4
            q4 . q3; q2 d q3; q3 d q3
            q3 ε q5`,
    pos: { q0: [0, 1], q1: [1, 1], q2: [2, 0], q3: [3, 1], q4: [2, 2], q5: [4, 1] },
    lang: w => /^[+-]?(d+\.d*|\.d+)$/.test(w),
    tests: ['d.d', '-dd.', '+.d', '.dd', 'd', '.', '+-d.d', 'd.d.']
  },
  {
    type: 'DPDA', chapter: `${HMU}, §6.2 (if and else)`,
    title: 'One else too many',
    blurb: 'Hopcroft, Motwani and Ullman’s if/else example: i is an if, e an else, and the machine stops at the first else that has no if to match. It accepts exactly the strings where that happens at the last symbol — in the book by emptying its stack, here by moving to a final state when it would have.',
    tags: ['textbook', 'hopcroft', 'empty-stack', 'parsing'], level: 'intermediate',
    sigma: 'ie', start: 'q', accept: 'f',
    delta: `q i,ε/X q; q e,X/ε q; q e,Z/Z f`,
    lang: w => { let d = 0; for (let k = 0; k < w.length; k++) { d += w[k] === 'i' ? 1 : -1; if (d < 0) return k === w.length - 1; } return false; },
    gen: n => 'i'.repeat(n % 4) + 'e'.repeat(n % 4) + 'e'
  },
  {
    type: 'TM', chapter: `${HMU}, §8.2`,
    title: '0ⁿ1ⁿ by crossing off',
    blurb: 'The Turing machine Hopcroft, Motwani and Ullman build first: change the leftmost 0 to X, walk right to the leftmost 1 and change it to Y, walk back, repeat. When the 0s run out, only Y’s may remain before the blank.',
    tags: ['textbook', 'hopcroft', 'crossing-off'], level: 'intro',
    sigma: '01', start: 'q0', accept: 'q4',
    delta: `q0 0/X,R q1; q0 Y/=,R q3
            q1 0,Y/=,R q1; q1 1/Y,L q2
            q2 0,Y/=,L q2; q2 X/=,R q0
            q3 Y/=,R q3; q3 _/=,R q4`,
    lang: w => { const s = shape(w, '01'); return !!s && s[0] > 0 && s[0] === s[1]; },
    gen: n => '0'.repeat(n) + '1'.repeat(n)
  },
  {
    type: 'TM', chapter: `${HMU}, ch. 8 (proper subtraction)`,
    title: 'Proper subtraction: m ∸ n',
    blurb: 'Input 0ᵐ10ⁿ; output 0^max(m−n, 0). Each round erases a 0 from the front of m and cancels one 0 of n, marking it X. When n runs out, the last erased 0 is put back and the marks and the 1 are cleared; when m runs out first, the answer is 0 and everything goes.',
    tags: ['textbook', 'hopcroft', 'arithmetic', 'computing-a-function'], level: 'intermediate',
    sigma: '01', start: 'q0', accept: 'done',
    delta: `q0 0/_,R q1; q0 1/_,R wipe
            q1 0/=,R q1; q1 1/=,R q2
            q2 X/=,R q2; q2 0/X,L q3; q2 _/=,L q4
            q3 0,1,X/=,L q3; q3 _/=,R q0
            q4 X/_,L q4; q4 1/_,L q5
            q5 0/=,L q5; q5 _/0,S done
            wipe 0,X/_,R wipe; wipe _/=,S done`,
    lang: w => /^0*10*$/.test(w),
    tape: w => { const [m, n] = w.split('1').map(x => x.length); return '0'.repeat(Math.max(m - n, 0)); },
    label: w => { const p = w.split('1'); return p.length === 2 ? `${p[0].length} ∸ ${p[1].length}` : ''; }
  }
];
