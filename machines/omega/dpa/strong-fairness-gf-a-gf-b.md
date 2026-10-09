A scheduler is **strongly fair** if every process that is enabled infinitely often is eventually run infinitely often. Read a as “the process is enabled” and b as “the process runs”, and the property is GF a → GF b: if a happens infinitely often, so does b. It is one of the most common assumptions in reasoning about concurrent systems, and it is the first property in this library that no deterministic Büchi automaton can recognise.

::: diagram
Three states, each remembering the last event. Their priorities: 0 after b, 1 after a, 2 after c.
:::

## How parity acceptance decides it

Every state has a number, its priority, and the machine accepts when the **smallest priority visited infinitely often is even**. Here the states simply remember the last letter, so the priorities seen infinitely often are those of the letters seen infinitely often:

| Letters seen infinitely often | smallest priority | verdict |
| --- | :-: | --- |
| include b | 0 | accept — b is infinitely often |
| include a, but not b | 1 | reject — a without b |
| only c | 2 | accept — a is not infinitely often |

That is the whole property, read off one column. Priorities give a ranking of “how important” each kind of event is, and the least one that keeps coming back decides.

## Why Büchi is not enough

A deterministic Büchi automaton accepts when its run passes through an accepting state infinitely often. Suppose one recognised strong fairness. Delete its b-edges: what is left is a deterministic Büchi automaton for the words with no b that satisfy the property — and on words with no b, GF a → GF b says exactly “eventually no more a's”, FG ¬a. That is the classic language no deterministic Büchi automaton recognises: a machine that has not yet seen the a's stop cannot know whether they will, and it can be fed a word that keeps it in suspense forever while passing an accepting state infinitely often. So no such automaton exists.

Parity acceptance avoids the guess, and deterministic parity automata recognise every ω-regular language. That is why they are what determinisation produces, and what reactive-synthesis tools solve games on.

> [!tip] Try it
> `(a)` — a forever — is rejected; `(ab)` is accepted; `aaa(c)` is accepted, because the a's stop.
