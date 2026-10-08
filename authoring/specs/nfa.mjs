// Nondeterministic finite automata: each one guesses something a DFA would
// have to remember instead.

export const type = 'NFA';

const count = (w, c) => [...w].filter(x => x === c).length;

export default [
  {
    title: 'The third symbol from the end is a 1, by guessing',
    blurb: 'Four states: wait, then guess that this 1 is the third from the end and check that exactly two symbols follow. The DFA for the same language needs eight — the guess replaces remembering the last three symbols.',
    tags: ['guessing', 'suffix', 'state-blowup'], level: 'intro',
    sigma: '01', accept: 'q3',
    delta: `q0 0,1 q0; q0 1 q1; q1 0,1 q2; q2 0,1 q3`,
    pos: { q0: [0, 0], q1: [1, 0], q2: [2, 0], q3: [3, 0] },
    lang: w => w.length >= 3 && w[w.length - 3] === '1'
  },
  {
    title: 'Some letter is missing',
    blurb: 'Over a, b and c, accept the words that do not use all three letters. The NFA guesses which letter will be missing and never reads it; a DFA has to track which letters it has seen — eight subsets instead of four states.',
    tags: ['guessing', 'subset-construction', 'union'], level: 'intermediate',
    sigma: 'abc', accept: 'start noA noB noC',
    delta: `start b,c noA; start a,c noB; start a,b noC
            noA b,c noA; noB a,c noB; noC a,b noC`,
    lang: w => !(w.includes('a') && w.includes('b') && w.includes('c'))
  },
  {
    title: 'Some letter occurs twice',
    blurb: 'Guess the letter and the moment of its first occurrence, then wait for the second. Every word of length four or more over a, b, c is accepted — the pigeonhole principle, visible as a machine.',
    tags: ['guessing', 'pigeonhole', 'subset-construction'], level: 'intermediate',
    sigma: 'abc', accept: 'twice',
    delta: `start a,b,c start; start a seenA; start b seenB; start c seenC
            seenA a,b,c seenA; seenA a twice
            seenB a,b,c seenB; seenB b twice
            seenC a,b,c seenC; seenC c twice
            twice a,b,c twice`,
    lang: w => [...'abc'].some(c => count(w, c) >= 2)
  },
  {
    title: 'The last letter has appeared before',
    blurb: 'Guess which earlier letter will turn out to match the last one, remember only that letter, and accept if the word ends on it. The one-way version of the two-way “déjà vu” machine: here the guess does the work the head’s second look does there.',
    tags: ['guessing', 'suffix', 'memory'], level: 'intermediate',
    sigma: 'abc', accept: 'match',
    delta: `start a,b,c start; start a gotA; start b gotB; start c gotC
            gotA a,b,c gotA; gotA a match
            gotB a,b,c gotB; gotB b match
            gotC a,b,c gotC; gotC c match`,
    lang: w => w.length >= 2 && w.slice(0, -1).includes(w[w.length - 1])
  },
  {
    title: '(ab ∪ aba)*',
    blurb: 'Three states, and one choice: after ab, is that the end of a block, or will an a finish an aba? The NFA keeps both possibilities alive. The textbook example where an NFA is easier to draw than to determinise.',
    tags: ['kleene-star', 'textbook', 'regular-expressions'], level: 'intro',
    sigma: 'ab', accept: 'q0',
    delta: `q0 a q1; q1 b q0; q1 b q2; q2 a q0`,
    lang: w => /^(ab|aba)*$/.test(w)
  },
  {
    title: 'Contains a square of length 4',
    blurb: 'Accept any word containing xx where x is two letters — abab, aaaa, baba, bbbb. The machine guesses where the square starts, remembers the two letters of x, and checks that they come again.',
    tags: ['guessing', 'squares', 'combinatorics-on-words'], level: 'advanced',
    sigma: 'ab', accept: 'found',
    delta: `start a,b start; start a a; start b b
            a a aa; a b ab; b a ba; b b bb
            aa a aa_a; ab a ab_a; ba b ba_b; bb b bb_b
            aa_a a found; ab_a b found; ba_b a found; bb_b b found
            found a,b found`,
    lang: w => /(..)\1/.test(w)
  },
  {
    title: 'Lengths that are multiples of 3 or of 5',
    blurb: 'Two cycles, three and five long, and a first step that chooses between them: nine states. A DFA cannot choose, so it runs both at once on a single cycle of lcm(3, 5) = 15. For unary languages that gap can be made exponential.',
    tags: ['unary', 'union', 'state-blowup'], level: 'intermediate',
    sigma: 'a', accept: 'start t0 f0',
    delta: `start a t1; start a f1
            t1 a t2; t2 a t0; t0 a t1
            f1 a f2; f2 a f3; f3 a f4; f4 a f0; f0 a f1`,
    pos: { start: [0, 1], t1: [1, 0], t2: [2, -0.4], t0: [2, 0.4], f1: [1, 2], f2: [2, 1.6], f3: [3, 2], f4: [2.6, 2.8], f0: [1.6, 2.8] },
    lang: w => w.length % 3 === 0 || w.length % 5 === 0,
    maxLen: 40
  },
  {
    title: 'Two a’s exactly three apart',
    blurb: 'Somewhere in the word, an a followed by any two symbols and then another a. The NFA waits, guesses the first a, and counts three; a DFA would have to remember the positions of the a’s among the last three symbols.',
    tags: ['guessing', 'distance', 'pattern-matching'], level: 'intro',
    sigma: 'ab', accept: 'found',
    delta: `wait a,b wait; wait a d0; d0 a,b d1; d1 a,b d2; d2 a found; found a,b found`,
    pos: { wait: [0, 0], d0: [1, 0], d1: [2, 0], d2: [3, 0], found: [4, 0] },
    lang: w => /a..a/.test(w)
  }
];
