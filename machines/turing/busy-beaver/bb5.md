Five states, two symbols, ten rules — and a run of {{steps}} steps before it stops. For thirty-five years this machine was only the best anyone had found; since 2024 it is known to be the best there is. No halting Turing machine of its size runs longer from a blank tape. What makes it worth reading, and not only running, is that its huge number is not noise. Underneath the tape there is a small piece of arithmetic, and the machine is carrying it out.

## The machine

In the standard text format the whole machine is {{standard}}: one group per state, A to E, and in each group what to do on reading a 0 and on reading a 1 — the symbol to write, the direction to move, the state to go to. Z is the halt.

| State | Reads 0 | Reads 1 |
| --- | --- | --- |
| A | write 1, right, B | write 1, left, C |
| B | write 1, right, C | write 1, right, B |
| C | write 1, right, D | write 0, left, E |
| D | write 1, left, A | write 1, left, D |
| E | write 1, right, *halt* | write 0, left, A |

Nothing here looks special. B and D each have a rule that keeps them in place while they run across a block of 1s; C and E are the only states that ever erase. Everything else the machine does comes from how these ten rules feed one another.

## Watching it start

::: spacetime steps=4029 h=440
The first 4,029 steps from a blank tape, time running down, one row for every tenth step, inked where the tape holds a 1. The tape grows to the left in bursts; between bursts the machine works back and forth across what it has written.
:::

Run it for a few thousand steps and a rhythm appears. The head sweeps over the block it has built, and every so often it breaks out to the left and extends the tape by a whole run of new cells at once: 3, then 7, then 15, 27, 47, 79. Each burst is longer than the last, and the time between bursts grows faster still. The machine is working through stages, and each stage ends with a burst.

## A hidden arithmetic

Count the 1s on the tape at the end of each burst and a sequence falls out: 6, 16, 34, 64, 114, 196, … It is the orbit of a small function, the kind people call *Collatz-like*:

$$ g(3k) = 5k + 6, \qquad g(3k+1) = 5k + 9, \qquad g(3k+2) = \text{halt}. $$

Start at 0. Each value is divided by three, and the remainder decides what happens next: a remainder of 0 or 1 gives a new number about five-thirds the size, and a remainder of 2 stops everything. The machine's stages are exactly the steps of this orbit.[^michel]

| Stage | Ones on the tape | Remainder mod 3 | Reached at step |
| ---: | ---: | ---: | ---: |
| 1 | 6 | 0 | 15 |
| 2 | 16 | 1 | 88 |
| 3 | 34 | 1 | 365 |
| 4 | 64 | 1 | 1,272 |
| 5 | 114 | 0 | 4,029 |
| 6 | 196 | 1 | 11,986 |
| 7 | 334 | 1 | 34,763 |
| 8 | 564 | 0 | 99,170 |
| 9 | 946 | 1 | 279,477 |
| 10 | 1,584 | 0 | 783,504 |
| 11 | 2,646 | 0 | 2,187,471 |
| 12 | 4,416 | 0 | 6,093,864 |
| 13 | 7,366 | 1 | 16,955,767 |
| 14 | 12,284 | 2 | 47,152,294 |

Each count is the tape's content at the moment it reaches its widest point so far — and at every one of those moments the tape is exactly one cell wider than the number of 1s on it. Fourteen stages in, the orbit reaches 12,284, which leaves a remainder of 2. That is the halting case. Nothing about the machine announces it in advance: the question “does this machine halt?” has turned into “does this orbit ever land on $3k+2$?”, and the only way to find out was to follow it.

## Where the time goes

::: growth y=log
Ones on the tape against steps, both on log scales. Each tooth is a stage: a sudden fall as two-thirds of the 1s are erased, then a long climb to the next value of $g$. On these scales the teeth are nearly the same size and evenly spaced — a fixed ratio in both the count and the time, stage after stage. The dot is the halt.
:::

A stage does not simply add to the tape. It opens with one quick sweep that erases about two-thirds of the 1s — 7,366 falls to 2,458 within fifteen thousand steps — and spends the rest of its time building them back up, and more, to the next value of $g$. From one stage's end to the next the count grows by about 5/3, and the stage takes about $(5/3)^2 \approx 2.78$ times as long as the one before it — what you would expect if the head has to cross the block about as many times as the block is long. Growth like that compounds quickly. The last full stage — from 7,366 ones to 12,284 — takes 30,196,527 steps on its own, 64% of the entire run. Almost all of BB(5)'s famous number is spent in its last few stages.

## The last sweep

Reaching 12,284 does not end the run at once. The machine spends another 24,576 steps on a final pass, briefly reaching its peak of 12,288 ones, and then erases most of what it wrote. It halts having visited {{cells}} cells, with {{ones}} of them holding a 1 — the other number in the record, the one Radó called Σ(5).

## Why it took thirty-five years

Heiner Marxen and Jürgen Buntrock found this machine by computer search in 1989.[^marxen] Showing that it halts was never the hard part: you run it and watch it stop, and this library does exactly that each time it builds. The hard part was the other direction — showing that every other five-state machine either halts sooner or never halts at all. Some of those machines run for ever in ways that took years of new techniques to prove.

That proof was finished in 2024 by the bbchallenge collaboration, and checked by computer in the Coq proof assistant.[^bbc] So the {{steps}} steps on this page are no longer a record that might one day be beaten. They are BB(5).

To see the rest of the family, and why the numbers get out of hand so quickly after this, read the [Busy Beaver Hall of Fame](lib:busy-beavers).

[^michel]: The same description appears in analyses of the champion collected by Pascal Michel in his historical survey of the busy beaver competition. The stage table here is the library's own: it comes from running the machine and recording the tape each time the tape reaches a new width.
[^marxen]: H. Marxen and J. Buntrock, “Attacking the Busy Beaver 5”, *Bulletin of the EATCS* 40 (1990).
[^bbc]: The bbchallenge collaboration, [bbchallenge.org](https://bbchallenge.org). Its proof covers every five-state, two-symbol machine.
