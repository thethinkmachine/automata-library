// More ω-automata, each checked against its LTL formula on every lasso up to a size.

export default [
  {
    type: 'DBA',
    title: 'At most two requests, ever',
    blurb: 'Bounded existence, in Dwyer’s catalogue of specification patterns: r may happen, but no more than twice in the whole infinite run. A safety property, so every state accepts and a third r is simply a missing edge.',
    tags: ['ltl', 'bounded-existence', 'safety', 'specification-patterns'], level: 'intro',
    sigma: 'rn', start: 'none', accept: 'none one two',
    delta: `none n none; none r one; one n one; one r two; two n two`,
    ltl: 'G(r -> X G(r -> X G !r))'
  },
  {
    type: 'DBA',
    title: 'Between q and r, p must happen',
    blurb: 'Existence between q and r: whenever q opens an interval, p must occur before the r that closes it. An interval left open forever imposes nothing — the pattern’s usual scope. The state remembers whether an interval is open and whether p has been seen in it.',
    tags: ['ltl', 'existence', 'scopes', 'specification-patterns'], level: 'intermediate',
    sigma: 'pqrn', start: 'out', accept: 'out open done',
    delta: `out p,r,n out; out q open
            open q,n open; open p done
            done p,q,n done; done r out`,
    ltl: 'G((q & !r & F r) -> (!r U (p & !r)))'
  },
  {
    type: 'DcoBA',
    title: 'Eventually it stops changing',
    blurb: 'The run settles: from some point on it is all a’s or all b’s. Co-Büchi acceptance marks the moments of change and accepts the words with only finitely many. The same language could be recognised by guessing which letter wins; with co-Büchi acceptance there is no need.',
    tags: ['ltl', 'persistence', 'stabilisation'], level: 'intermediate',
    sigma: 'ab', start: 'a', accept: 'toA toB',
    delta: `a a a; a b toB; b b b; b a toA
            toA a a; toA b toB; toB b b; toB a toA`,
    pos: { a: [0, 0], b: [2, 0], toA: [1, -0.8], toB: [1, 0.8] },
    ltl: 'F G a | F G b'
  },
  {
    type: 'DPA',
    title: 'The parity condition itself',
    blurb: 'Letters 0, 1, 2 and 3 are priorities, and each state remembers the last one read. So the machine accepts exactly when the smallest priority that keeps coming back is even — the parity condition, turned into a language. Every parity game is played over words like these.',
    tags: ['parity', 'acceptance-conditions', 'games'], level: 'intermediate',
    sigma: '0123', start: 'p3', priority: { p0: 0, p1: 1, p2: 2, p3: 3 },
    delta: `p0 0 p0; p0 1 p1; p0 2 p2; p0 3 p3
            p1 0 p0; p1 1 p1; p1 2 p2; p1 3 p3
            p2 0 p0; p2 1 p1; p2 2 p2; p2 3 p3
            p3 0 p0; p3 1 p1; p3 2 p2; p3 3 p3`,
    layout: 'circle',
    omega: (u, v) => { const m = Math.min(...[...v].map(Number)); return m % 2 === 0; }
  },
  {
    type: 'NBA',
    title: 'Infinitely many a’s, and eventually no b',
    blurb: 'GF a ∧ FG ¬b. The second half needs a guess — no deterministic Büchi automaton knows when the b’s have stopped — so the machine waits, guesses the moment, and from then on loops between two states that see a’s and c’s, accepting each time an a goes by.',
    tags: ['ltl', 'guessing', 'conjunction'], level: 'intermediate',
    sigma: 'abc', start: 'wait', accept: 'sawA',
    delta: `wait a,b,c wait; wait a sawA; wait c quiet
            quiet a sawA; quiet c quiet; sawA a sawA; sawA c quiet`,
    ltl: 'G F a & F G !b'
  },
  {
    type: 'DWA',
    title: 'a happens at least twice',
    blurb: 'A guarantee that counts: two a’s, at any distance. The states are how many a’s have been seen, capped at two, and the last one is a sink that accepts. Each state is its own component, so the automaton is weak, as every guarantee property’s can be.',
    tags: ['ltl', 'guarantee', 'counting', 'weak'], level: 'intro',
    sigma: 'ab', start: 'zero', accept: 'two',
    delta: `zero b zero; zero a one; one b one; one a two; two a,b two`,
    ltl: 'F(a & X F a)'
  }
];
