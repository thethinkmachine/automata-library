No program can decide, for every Turing machine, whether it halts. That is Turing's theorem, and it is not an obstacle to deciding it for *particular* machines — it only says that no single method works for all of them. In practice a handful of methods, each cheap and each limited, settle almost every small machine. The proof that BB(5) = 47,176,870 consisted of exactly that: a pipeline of deciders, run on every five-state machine, with individual proofs for a few stubborn machines, and all of it checked in the Coq proof assistant.

This collection has one machine for each method the library uses, in the order the library tries them — cheapest first. Every machine here earns its *never halts* badge the same way at every build.

## Running it and watching

**A cycler** returns to a configuration it has been in before — the same state, the same head position, the same tape — and from then on repeats forever. [Two cells, forever](lib:turing/non-halting/two-cell-cycler) does it every two steps. Detecting it is cheap: hash the configurations and wait for a repeat.

**A translated cycler** repeats too, but shifted: the same state and the same tape *behind the head*, a few cells further along. [Marching right forever](lib:turing/non-halting/translated-cycler) never repeats a configuration exactly, but every four steps it is in the same situation two cells to the right, and since what lies ahead is blank, it always will be.

## Reasoning backwards

**Backward reasoning** never runs the machine at all. It starts from every configuration in which the machine would halt and asks what could have led there; if every such chain of predecessors dies out within a few steps, then a machine that has run longer than that can never halt. [A halt nothing leads to](lib:turing/non-halting/unreachable-halt) has a halting transition that no earlier step can set up.

**The halting segment** method does the same over a short stretch of tape around the head. [The checkerboard pyramid](lib:turing/non-halting/a-checkerboard-pyramid) grows forever without repeating, but no three-cell window around its head can be traced back from the halt to the start.

::: spacetime id=turing/non-halting/a-checkerboard-pyramid steps=400 h=260
The checkerboard pyramid's first 400 steps. Nothing repeats, and the cycle detectors give up; a window of three cells is enough for the halting segment.
:::

## Describing the tape

**The finite automata reduction** looks for a *regular language* — a finite automaton — that contains every configuration from which the machine could reach a halt, and that stays closed when the machine is stepped backwards. If the blank starting tape is not in that language, the machine never halts. It is the method that settles counters: [a binary counter](lib:turing/non-halting/a-binary-counter-that-never-stops) increments a number forever, and while the number itself is unbounded, the *shape* of its tape — blocks of 1s doubling in width — is regular.

::: spacetime id=turing/non-halting/a-binary-counter-that-never-stops steps=600 h=300
A binary counter: each block is twice as wide as the one before, the signature of counting.
:::

**N-gram closed position sets** come from the Coq proof of BB(5). Rather than describing whole tapes, the method keeps the set of short windows of tape (n-grams) that can appear on either side of the head, closes the set under every move the machine can make, and checks that no window allows the halting transition. [Irregular growth](lib:turing/non-halting/irregular-growth-closed-under-n-grams) is one of only 53 four-state machines that need it.

## How far the cheap methods go

Enumerate every three-state, two-symbol machine and these methods settle all of them: backward reasoning, translated cyclers and cyclers take nearly everything, the halting segment 24 more and finite automata reduction the last 13. At four states the n-gram method is needed for 53 machines. At five states the same pipeline, with further deciders and some individual proofs, finished BB(5). At six states, machines appear whose halting depends on open questions in number theory — the [Busy Beaver collection](lib:busy-beavers) tells that part.
