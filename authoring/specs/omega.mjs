// ω-automata. Each is checked against an LTL formula on every ultimately
// periodic word u(v) up to a size bound — exactly, since LTL is decided on the
// lasso itself (lib/ltl.mjs). Letters are events, one per instant.

export default [
  // ── deterministic Büchi ─────────────────────────────────────────
  {
    type: 'DBA',
    title: 'Every request is eventually granted',
    blurb: 'G(r → F g) over requests r, grants g and idle steps n. Two states: nothing pending, or a request waiting. Büchi acceptance asks for “nothing pending” infinitely often — a request left waiting forever means the run eventually stays in the other state.',
    tags: ['ltl', 'response', 'liveness'], level: 'intro',
    sigma: 'rgn', accept: 'idle',
    delta: `idle r pending; idle g,n idle; pending g idle; pending r,n pending`,
    ltl: 'G(r -> F g)'
  },
  {
    type: 'DBA',
    title: 'Both a and b, infinitely often',
    blurb: 'GF a ∧ GF b. Büchi acceptance names one set to visit infinitely often, so two conditions are chained: wait for an a, then for a b, and pass through the accepting state each time both have happened. The same trick turns any generalised Büchi condition into an ordinary one.',
    tags: ['ltl', 'generalised-buchi', 'fairness'], level: 'intermediate',
    sigma: 'abc', accept: 'both',
    delta: `wantA a wantB; wantA b,c wantA
            wantB b both; wantB a,c wantB
            both a wantB; both b,c wantA`,
    ltl: 'G F a & G F b'
  },
  {
    type: 'DBA',
    title: 'Infinitely often, two a’s in a row',
    blurb: 'GF(a ∧ X a). The machine watches for aa and passes through its accepting state each time one completes. An infinite word with infinitely many a’s may still never have two together — (ab)^ω is rejected.',
    tags: ['ltl', 'recurrence', 'patterns'], level: 'intro',
    sigma: 'ab', accept: 'pair',
    delta: `none a one; none b none; one a pair; one b none; pair a pair; pair b none`,
    ltl: 'G F (a & X a)'
  },
  {
    type: 'DBA',
    title: 'No grant before the first request',
    blurb: '¬g W r: g may not happen until r has, and r need never happen. A precedence property — one of the specification patterns of Dwyer, Avrunin and Corbett — and pure safety: once r is seen, anything goes.',
    tags: ['ltl', 'precedence', 'safety', 'specification-patterns'], level: 'intro',
    sigma: 'rgn', accept: 'before after',
    delta: `before n before; before r after; after r,g,n after`,
    ltl: '!g W r'
  },
  {
    type: 'DBA',
    title: 'Requests and grants alternate',
    blurb: 'A request, then its grant, then the next request: never two of either in a row, no grant first, and no request left hanging. A safety part (the order) and a liveness part (the hanging request), checked by one two-state machine.',
    tags: ['ltl', 'protocols', 'alternation', 'liveness'], level: 'intermediate',
    sigma: 'rgn', accept: 'idle',
    delta: `idle n idle; idle r busy; busy n busy; busy g idle`,
    ltl: '(!g W r) & G(r -> X(!r U g)) & G(g -> X(!g W r))'
  },

  // ── deterministic co-Büchi ──────────────────────────────────────
  {
    type: 'DcoBA',
    title: 'Eventually, every a is followed by b',
    blurb: 'FG(a → X b): a finite number of mistakes is forgiven. Co-Büchi acceptance marks the mistakes — the state reached when an a is followed by another a — and accepts the runs that visit it only finitely often.',
    tags: ['ltl', 'persistence', 'co-buchi'], level: 'intermediate',
    sigma: 'ab', accept: 'slip',
    delta: `free a owe; free b free; owe b free; owe a slip; slip a slip; slip b free`,
    ltl: 'F G (a -> X b)'
  },

  // ── deterministic parity ────────────────────────────────────────
  {
    type: 'DPA',
    title: 'Strong fairness: GF a → GF b',
    blurb: 'If a is requested infinitely often, b must happen infinitely often. No deterministic Büchi automaton recognises this; three states with priorities do. The state after b has priority 0, after a 1, after c 2 — and the smallest priority seen infinitely often must be even.',
    tags: ['ltl', 'fairness', 'parity', 'streett'], level: 'advanced',
    sigma: 'abc', start: 'sawC', priority: { sawB: 0, sawA: 1, sawC: 2 },
    delta: `sawA a sawA; sawA b sawB; sawA c sawC
            sawB a sawA; sawB b sawB; sawB c sawC
            sawC a sawA; sawC b sawB; sawC c sawC`,
    layout: 'circle',
    ltl: '(G F a) -> (G F b)'
  },

  // ── deterministic weak ──────────────────────────────────────────
  {
    type: 'DWA',
    title: 'a happens, eventually',
    blurb: 'F a, the simplest guarantee property. Two strongly connected components — waiting and done — and each lies wholly inside or wholly outside the accepting set. That is what makes an automaton weak, and why its Büchi and co-Büchi readings agree.',
    tags: ['ltl', 'guarantee', 'weak'], level: 'intro',
    sigma: 'ab', accept: 'done',
    delta: `wait b wait; wait a done; done a,b done`,
    ltl: 'F a'
  },
  {
    type: 'DWA',
    title: 'An a, and no b ever after it',
    blurb: 'F a ∧ G(a → G ¬b): an obligation, part guarantee and part safety. Waiting is rejecting, the state after the first a is accepting, and a b after that has no edge. Three components, none straddling the accepting set.',
    tags: ['ltl', 'obligation', 'weak'], level: 'intermediate',
    sigma: 'abc', accept: 'after',
    delta: `wait b,c wait; wait a after; after a,c after`,
    ltl: 'F a & G(a -> G !b)'
  },

  // ── nondeterministic Büchi ──────────────────────────────────────
  {
    type: 'NBA',
    title: 'Infinitely many a’s, or finitely many b’s',
    blurb: 'GF a ∨ FG ¬b. Nondeterminism makes a union easy: one branch is the deterministic machine for GF a, the other guesses the moment after which no b will come. The second half on its own already needs a guess.',
    tags: ['ltl', 'union', 'guessing'], level: 'intermediate',
    sigma: 'abc', start: 'start', accept: 'sawA quiet',
    delta: `start a sawA; start b,c other
            sawA a sawA; sawA b,c other; other a sawA; other b,c other
            start a,b,c start; start a,c quiet; quiet a,c quiet`,
    ltl: 'G F a | F G !b'
  },
  {
    type: 'NBA',
    title: 'Eventually, a and b alternate forever',
    blurb: 'From some point on the word is ababab…: the machine skips any prefix, then guesses where the alternation begins and checks it for ever. Like FG b, this needs the guess — no deterministic Büchi automaton can tell when to start looking.',
    tags: ['ltl', 'persistence', 'guessing'], level: 'intermediate',
    sigma: 'ab', start: 'skip', accept: 'gotB',
    delta: `skip a,b skip; skip a gotA; gotA b gotB; gotB a gotA`,
    ltl: 'F G ((a -> X b) & (b -> X a))'
  }
];
