A finite automaton has a fixed, finite memory and reads its input once, left to right. That sounds too weak to be interesting, and it is the opposite: the languages these machines recognise — the regular languages — are exactly the ones regular expressions describe, they are closed under every operation anyone cares about, and nearly every question about them can be answered by an algorithm. This collection follows the order a course meets them in.

## One bit of memory, then a few

[An even number of 1s](lib:finite/dfa/an-even-number-of-1s) is the smallest machine whose state means something: it remembers one bit, the parity so far, and the two states *are* the two possible answers. [Ends in 01](lib:finite/dfa/ends-in-01) remembers how much of a pattern it has just seen, and [no two 0s in a row](lib:finite/dfa/no-two-0s-in-a-row) remembers only the last symbol. Two counters side by side give [a product](lib:finite/dfa/a-s-a-multiple-of-3-b-s-even): six states in a 3 × 2 grid, each coordinate one of the conditions.

The question to ask of any DFA is *what does each state know?* If two states know the same thing about the future — if every continuation is accepted from both or from neither — they can be merged. Doing that until nothing more merges gives the **minimal** DFA, which is unique. [A game of tennis](lib:finite/dfa/a-game-of-tennis-won-by-a) is drawn the way an umpire scores and is *not* minimal: 30–30 and deuce turn out to be the same state, and so do 40–30 and advantage A.

## Guessing

A nondeterministic automaton may have several moves on the same symbol, and accepts if any choice leads to acceptance. It adds no power — the subset construction turns any NFA into a DFA — but it can be exponentially smaller.

::: machines finite/nfa/the-third-symbol-from-the-end-is-a-1-by-guessing finite/dfa/the-third-symbol-from-the-end-is-a-1
The same language twice: {{states finite/nfa/the-third-symbol-from-the-end-is-a-1-by-guessing}} states that guess where the end is, and {{states finite/dfa/the-third-symbol-from-the-end-is-a-1}} that remember instead.
:::

For “the *n*th symbol from the end is a 1” the NFA needs n + 1 states and the DFA 2ⁿ, and no DFA can do better: two different strings of length n must lead to different states, since some continuation tells them apart. [Some letter is missing](lib:finite/nfa/some-letter-is-missing) is the same trade in another form — guess the letter, or remember every letter seen.

## ε-moves and regular expressions

A move that reads nothing is the natural way to say *or*, *optionally* and *and then*. [`a*b*c*`](lib:finite/enfa/a-s-then-b-s-then-c-s) is three loops joined by ε-moves; [Thompson's construction](lib:finite/enfa/thompson-s-construction-of-a-b-abb) builds an ε-NFA from any regular expression by gluing one small gadget per operator, which is how regular-expression engines begin. Going back, from automaton to expression, is state elimination — the app's *To regex* does it.

## Surprises

Some languages look like they need counting and do not. [As many ab's as ba's](lib:finite/dfa/as-many-ab-s-as-ba-s) needs no counter at all, because the two counts can never differ by more than one, and they are equal exactly when the word starts and ends with the same letter. [An even number of inversions](lib:finite/dfa/an-even-number-of-inversions) counts something quadratic, but only its parity, and parity is cheap.

## Two-way heads

A finite automaton whose head can move both ways recognises no more languages than a one-way one — that is a theorem of Rabin and Scott, and of Shepherdson[^two-way] — but it can be far smaller. [The fourth symbol from the end](lib:finite/twdfa/the-fourth-symbol-from-the-end-by-walking-back) needs sixteen states one way and six two ways: run to the end and walk back. [Two passes, one head](lib:finite/twdfa/two-passes-one-head) checks two conditions by reading the input twice instead of remembering both at once.

[^two-way]: M. O. Rabin and D. Scott, “Finite automata and their decision problems”, *IBM Journal* 3 (1959); J. C. Shepherdson, “The reduction of two-way automata to one-way automata”, *IBM Journal* 3 (1959).
