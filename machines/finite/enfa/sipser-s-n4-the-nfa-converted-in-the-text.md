This is the machine Sipser converts into a DFA to show the subset construction at work, ε-moves and all. It is small enough to do by hand, and doing it once is the best way to understand why every NFA has an equivalent DFA.

::: diagram
N4: start and accept at 1, an ε-move from 1 to 3.
:::

## The idea

A DFA cannot guess, so it keeps track of *every* state the NFA could be in. Its states are sets of N4's states, and the set after reading a word is exactly the set of places N4 could have reached. It accepts when that set contains an accepting state of N4.

The ε-moves are handled by always taking the **ε-closure**: whenever N4 can be in state 1, it can also be in state 3 without reading anything. So the DFA's start state is not {1} but {1, 3}.

## Doing it

Start from {1, 3} and, for each symbol, collect every state reachable on that symbol from any state in the set, then close under ε. Repeat for each new set until none appears.

| DFA state | on a | on b | accepts? |
| --- | --- | --- | :-: |
| {1, 3} | {1, 3} | {2} | yes |
| {2} | {2, 3} | {3} | |
| {2, 3} | {1, 2, 3} | {3} | |
| {3} | {1, 3} | ∅ | |
| {1, 2, 3} | {1, 2, 3} | {2, 3} | yes |

On a from {1, 3}: state 1 has no a-move, state 3 goes to 1, and the closure of {1} is {1, 3}. On a from {2, 3}: 2 goes to 2 and 3, 3 goes to 1, and closing {1, 2, 3} adds nothing. The accepting states are the sets containing 1.

Eight subsets of {1, 2, 3} exist; only five are reachable, plus the empty set where {3} goes on b. Sipser draws all eight and then removes {1} and {1, 2}, which no input reaches. The app's *Subset construction* builds the same five sets directly, and leaves the empty set out as a missing edge.

> [!example] Check it
> Open this machine and run the subset construction from the Algorithms view. The DFA it produces has these five states, with these names — and accepts ε, a, baa and baba, and rejects b, bb and babba, exactly as this NFA does.

## What the language is

The table makes the language easy to read off, which the NFA did not. From the accepting states, a returns home, and b leads into a detour that must end in a: written as a regular expression, the language is `(a ∪ ba*(a ∪ b)a)*`.
