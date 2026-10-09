A game of tennis is a finite automaton that umpires run in their heads. Each point goes to A or to B; the score moves through 15, 30 and 40; at 40–40 it becomes deuce, and from deuce a player needs two points in a row. This machine has a state for every score an umpire might call, and accepts the sequences of points that end with A winning.

::: diagram
The scores as an umpire calls them, from 0–0 on the left to the end of the game on the right.
:::

## What minimisation finds

Two scores are *equivalent* if every continuation of the game ends the same way from both — if no sequence of points can tell them apart. Merging equivalent states until none are left gives the minimal DFA, and for tennis it merges three pairs:

| Score | behaves exactly like |
| --- | --- |
| 30–30 | deuce |
| 40–30 | advantage A |
| 30–40 | advantage B |

From 30–30, A needs two points in a row to win, and if the points split, the game is back where it started, at deuce. That is precisely the situation at deuce. The umpire's vocabulary distinguishes them for history's sake; the game does not.

So this drawing is not minimal — the library notes that a DFA for the language needs only 16 states that can still lead to a win. The point of keeping it this way is that the reader can see which states minimisation would merge.

> [!tip] Try this
> Run *Minimise* from the Algorithms view and look at which states it merged. Then run `aabb`, which stops at 30–30, and `aaabbb`, which stops at deuce: here they end in different states, and in the minimal machine in the same one.

## Odds, from the same graph

Put a probability p on every a-edge and 1 − p on every b-edge, and the diagram becomes a Markov chain. The chance of winning from deuce is then p² / (p² + (1 − p)²), because from deuce the game is a race to two points in a row. A player who wins 55% of points wins about 62% of games: the scoring system amplifies a small edge, and sets and matches amplify it again.
