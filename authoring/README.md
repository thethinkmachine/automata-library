# Authoring

Most machines in this library are written as specs here and turned into
`.automaton` files by `make.mjs`, using a checkout of the AutomataStudio engine
(set `ENGINE`, or keep it beside this repository as `../AutomataPlayground`).

```bash
node --conditions=browser --conditions=development authoring/make.mjs            # check every spec
node --conditions=browser --conditions=development authoring/make.mjs --write    # … and write the files
node --conditions=browser --conditions=development authoring/make.mjs --only DFA # one type, file or slug
```

The written files are the library: an entry can be edited in the app and sent
back like any other, and nothing in the build reads this folder. A full
`--write` removes the files of specs that were renamed or deleted
(`manifest.json` lists what it wrote).

## What a spec promises, and how it is held to it

Every spec carries a **reference that is independent of the machine** — a
predicate on words (`lang`), the output it should print (`out`), what a Turing
machine should leave on its tape (`tape`), or for an ω-automaton an LTL formula
(`ltl`). `make.mjs` refuses to write a machine unless:

- the app's own decider agrees with the reference on **every word up to a
  length bound** (about 4,000 words; ω-automata: every lasso u(v) up to a size),
  on a few hundred longer random words, and on whatever `gen` and `extra` add —
  words a random sample would miss, like the members of aⁿbⁿ;
- a computing Turing machine leaves the right tape, by a second simulator
  written independently of the app's (`lib/verify.mjs`, `runTape`);
- the library's analysis passes it and awards it the **tested** badge, plus any
  badge the spec says it must earn (`badges: ['minimal']`);
- **no other entry of the same type has its language** — exactly, by the
  minimal DFA, for finite automata; by behaviour on every short word for the
  rest; by the tape they leave for machines that compute. An NFA that never
  branches is refused too: it is a DFA, and belongs with them.

The card's examples are chosen by the generator: short accepted words that each
show something new, a longer one, and for each a rejected word one edit away
from it. `tests` overrides the choice.

## Writing one

```js
{
  type: 'DFA',                       // or `export const type` for the whole file
  title: 'Ends in 01',               // ≤ 70 characters; the path is its slug
  blurb: '…',                        // ≤ 400; what it shows, not what it is
  tags: ['suffix', 'pattern-matching'],
  level: 'intro',                    // intro | intermediate | advanced
  sigma: '01', accept: 'got01',      // the first state named is the start, or `start`
  delta: `start 0 got0; start 1 start
          got0 0 got0;  got0 1 got01
          got01 0 got0; got01 1 start`,
  lang: w => w.endsWith('01')
}
```

A rule is `from label to`; the label's shape depends on the machine
(`lib/dsl.mjs` lists them all): `a,b` for a finite automaton, `a,X/YX` for a
PDA, `a/b,R` for a Turing machine, `a/out` for a Mealy machine. A machine whose
states are configurations of something — a puzzle, a checksum — is better
described by a step function: `explore()` in `lib/explore.mjs` builds δ by
search, and `minimize: true` merges equivalent states.

Positions come from the app's layered layout unless the spec gives `pos`
(grid units; `pitch` scales them) or `layout: 'circle'`.

The bar for a new entry is that it shows something no other entry does. A
second divisibility DFA for another modulus is not that; a divisibility DFA
that reads its number backwards might be.
