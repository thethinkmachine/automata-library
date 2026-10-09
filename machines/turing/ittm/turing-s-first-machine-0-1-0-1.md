In 1936 Alan Turing, aged 24, published “On computable numbers, with an application to the Entscheidungsproblem”.[^turing] It introduced the machines now named after him, defined what it means for a number to be computable, built a universal machine, and proved that no machine can decide whether an arbitrary machine will ever print a given symbol. Before any of that, it gave a first example, so simple it is easy to miss: a machine that prints 0 1 0 1 0 1 … forever.

::: spacetime steps=40 h=200
The first forty steps: the head moves right every step, printing a digit on every other square.
:::

## Turing's description

Turing's machines were meant to compute the digits of real numbers, so a machine that *never stops* was the normal, good case — a machine that halted had simply stopped producing digits. This one has four “m-configurations”, which he named b, c, e and f:

| Configuration | Does | Then becomes |
| --- | --- | --- |
| b | print 0, move right | c |
| c | move right | e |
| e | print 1, move right | f |
| f | move right | b |

It leaves every second square blank. Turing's convention reserved those blank squares for rough work, so the real output — the “figures” — sat on alternate squares and could never be erased. This machine needs no rough work, but it keeps the convention.

## Here

In the standard text format used for small machines, blank is written 0, so Turing's printed 0 and 1 appear as the symbols 1 and 2, and his b, c, e, f are the states A, B, C, D. The library proves it never halts by recognising it as a translated cycler: every four steps it is in the same state, with the same tape behind it, four squares further right.

Turing's paper goes on, in the very next example, to a machine that prints 0 1 0 1 1 0 1 1 1 0 … with ever longer runs of 1s — a sequence that no finite pattern repeats, and the first sign that these machines could do more than loop.

[^turing]: A. M. Turing, “On computable numbers, with an application to the Entscheidungsproblem”, *Proceedings of the London Mathematical Society* s2-42 (1936).
