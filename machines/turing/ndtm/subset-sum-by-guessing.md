Given some numbers and a target, is there a selection of the numbers that adds up to the target exactly? That is the subset-sum problem, one of the classic NP-complete problems. This machine decides it the way a nondeterministic machine decides anything: it guesses the answer and checks it.

## The input

Everything is in unary, separated by #: first the target, then the items. `111#1#11` asks whether some of 1 and 2 make 3 — they do, both together. `111#11#11` asks the same of 2 and 2, and no selection works.

## Guess, then check

The machine walks along the items. At each one it makes a choice — the two transitions on reading the item's first 1:

- **skip** it, marking its 1s `n`, or
- **take** it: for each of its 1s, walk back to the target, cross off one of the target's 1s, and walk forward again.

At the end, it checks that every 1 of the target has been crossed off. If a taken item needs more 1s than the target has left, that branch gets stuck and dies. The machine accepts if *some* sequence of choices empties the target exactly — and a nondeterministic machine accepts if any branch does.

> [!note] Certificates
> Each accepting branch corresponds to one subset. That subset is a *certificate*: given it, anyone can check the answer quickly, by adding up the chosen numbers. NP is exactly the class of problems with short, quickly checkable certificates, and a nondeterministic machine is a machine that is handed the certificate for free.

## Is the guessing really needed?

To simulate this machine deterministically, try every branch: with k items there are 2ᵏ subsets, and the obvious simulation takes exponential time. Whether *every* NP problem can be solved without that blow-up is the P versus NP question.

But this particular machine has a catch, and it is worth knowing. In **unary**, subset sum is easy: dynamic programming over the possible partial sums takes time polynomial in the target, and in unary the target's size *is* its length on the tape. Subset sum is NP-complete when the numbers are written in **binary**, where the target can be exponentially larger than the input that writes it down. Unary hides the difficulty by making the input as long as the numbers are large.

::: machines turing/ndtm/is-n-composite-guess-a-factor
The same pattern on another problem: guess a factor, then check that it divides.
:::
