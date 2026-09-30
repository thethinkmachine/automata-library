Take every Turing machine with $n$ states and two symbols. Start each one on a blank tape. Some halt, some run for ever. Among the ones that halt, which runs longest? That is the whole of the busy beaver game, and it is one of the few questions in mathematics where a child can follow the rules and the answer is still out of reach of every computer that will ever be built.

## The game

Tibor Radó posed it in 1962, in a paper called “On non-computable functions”.[^rado] A machine plays by being started on a blank tape; it scores only if it halts. Radó kept two scores, and they are not the same:

- $S(n)$, the most **steps** any halting $n$-state machine takes;
- $\Sigma(n)$, the most **1s** any halting $n$-state machine leaves behind.

For small $n$ one machine can win both. At three states it cannot, which is why this collection lists two three-state champions. The [longest runner](lib:turing/busy-beaver/bb3-steps) takes {{steps turing/busy-beaver/bb3-steps}} steps but leaves only {{ones turing/busy-beaver/bb3-steps}} ones; the [most productive](lib:turing/busy-beaver/bb3-ones) leaves {{ones turing/busy-beaver/bb3-ones}} ones but stops after {{steps turing/busy-beaver/bb3-ones}} steps. The game rewards two different kinds of cleverness.

## Why nobody can compute it

Radó's point was not the game but what it proves. Suppose some program could compute $S(n)$. Then it could decide whether any $n$-state machine halts: run the machine for $S(n)$ steps, and if it has not stopped by then it never will. But no program can decide that — it is Turing's halting problem. So $S$ is not computable, and neither is $\Sigma$. Radó showed more: each of them eventually grows faster than *every* computable function, however fast.

This is why every value of the function has had to be won by hand, one size at a time, and why each has taken longer than the last.

## The frontier

| States | Longest run, $S(n)$ | Most 1s, $\Sigma(n)$ | Settled |
| ---: | ---: | ---: | --- |
| 1 | 1 | 1 | by hand |
| 2 | {{steps turing/busy-beaver/bb2}} | {{ones turing/busy-beaver/bb2}} | by hand |
| 3 | {{steps turing/busy-beaver/bb3-steps}} | {{ones turing/busy-beaver/bb3-ones}} | Lin and Radó, 1965 |
| 4 | {{steps turing/busy-beaver/bb4}} | {{ones turing/busy-beaver/bb4}} | Brady, 1983 |
| 5 | {{steps turing/busy-beaver/bb5}} | {{ones turing/busy-beaver/bb5}} | bbchallenge, 2024 |
| 6 | more than $2 \uparrow\uparrow\uparrow 5$ | — | open |

Every number in rows two to five of that table is counted by this library: it runs each champion from a blank tape to its halt whenever it builds, and the figures above are the ones it got. The step from four states to five is a factor of about 440,000. The step from five to six is not a factor of anything you could write down: the [current six-state champion](lib:turing/ittm/bb-6-champion-runs-longer-than-2-5-steps) is known to halt only because its behaviour was analysed by hand and with accelerated simulators. No computer will ever run it to its halt step by step.

::: machines turing/busy-beaver/bb2 turing/busy-beaver/bb3-steps turing/busy-beaver/bb3-ones turing/busy-beaver/bb4 turing/busy-beaver/bb5
The two-symbol champions, from two states to five.
:::

## Five states, and the proof

The five-state champion was found in 1989 by Heiner Marxen and Jürgen Buntrock, and for the next thirty-five years it was only the best known. The trouble with proving it best was never the champion, which halts: it was the millions of other five-state machines, each of which had to be shown either to halt sooner or to run for ever. In 2024 the bbchallenge collaboration finished that proof and had it checked by computer in the Coq proof assistant.[^bbc]

The champion itself turns out to be doing arithmetic — iterating a small Collatz-like function until it lands on a number that stops it. [Its own page](lib:turing/busy-beaver/bb5) follows that orbit stage by stage.

## More symbols

Radó's game is played with two symbols, but nothing stops you giving a machine more. With two states and three symbols the champion runs for {{steps turing/busy-beaver/bb2x3}} steps; with two states and four, {{steps turing/busy-beaver/bb2x4}}. Set those beside the table above, machine for machine with the same number of rules: two states and three symbols beat three states and two ({{steps turing/busy-beaver/bb3-steps}} steps), and two states and four symbols beat four states and two ({{steps turing/busy-beaver/bb4}}) by a factor of more than thirty thousand. At these sizes an extra symbol is worth more than an extra state.

## Reading further

Scott Aaronson's survey “The Busy Beaver Frontier” (2020) is the best single place to start, and the bbchallenge website keeps the current state of the problem, including every machine of six states whose fate is still unknown.

[^rado]: T. Radó, “On non-computable functions”, *Bell System Technical Journal* 41 (1962).
[^bbc]: The bbchallenge collaboration, [bbchallenge.org](https://bbchallenge.org).
