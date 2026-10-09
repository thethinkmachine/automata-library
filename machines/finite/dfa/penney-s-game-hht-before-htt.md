Two players each pick a pattern of three coin flips, and a fair coin is flipped until one of the patterns appears. Every pattern of three flips is equally likely to come up at any particular moment, so it seems the game should be fair. It is not. If one player picks HHT and the other HTT, the HHT player wins two games in three.

This machine accepts the flip sequences in which HHT turns up first, at the moment it does.

::: diagram
Each state is the part of the recent flips that could still start one of the patterns.
:::

## Why the odds are lopsided

The machine shows it. Once two heads have been flipped, HHT cannot lose: more heads keep the run at HH, and the first tail completes HHT. HTT, on the other hand, can be interrupted — after HT, a head does not just fail, it makes the run H again, one step from HH, which is where HHT wins. The patterns overlap with themselves and with each other in different ways, and the overlaps decide the race.

Put a probability of ½ on every edge and the diagram becomes a Markov chain. Solving it gives the chance of reaching *win* before *lose*: exactly 2/3.

> [!note] Why fairness fails
> A pattern's *average waiting time* is not what decides the race. HHT and HTT both take 8 flips on average to appear on their own, yet one beats the other two to one. What matters is how each pattern can be ruined after it has started.

## Penney's game

Walter Penney described the game in 1969.[^penney] Its sharpest form is non-transitive: whichever three-flip pattern the first player picks, the second player can pick one that beats it — like rock, paper, scissors — and the best reply to any choice wins with probability at least 2/3. John Conway found a short rule that gives the odds between any two patterns from how they overlap.

[^penney]: W. Penney, “Problem 95: Penney-Ante”, *Journal of Recreational Mathematics* 2 (1969).
