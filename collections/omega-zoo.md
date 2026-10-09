An ω-automaton reads an infinite word and never stops, so “accept at the end” means nothing. Instead it is judged by what happens *infinitely often*: on an ultimately periodic word u·v·v·v…, the states the run visits forever are the states on the cycle it settles into. An acceptance condition is a rule about that set. There are four in common use, and each comes deterministic and nondeterministic — the eight types of this zoo.

| Condition | Accept when the states visited infinitely often… | Deterministic = nondeterministic? |
| --- | --- | :-: |
| Büchi | include an accepting state | no |
| co-Büchi | include no rejecting state | yes |
| parity | have an even smallest priority | yes |
| weak | lie in the accepting set (no cycle straddles it) | yes |

## Büchi, and the one place determinism costs

[Infinitely often a](lib:omega/dba/infinitely-often-a) is the canonical Büchi condition, and it is deterministic. Its mirror, [eventually always b](lib:omega/buchi/classic-eventually-always-b), is not: a machine must guess the moment after which no more a's will come, and a deterministic machine cannot know when that is. This is the only cell of the table where determinism loses languages, and it is why nondeterministic Büchi automata are what model checkers build from temporal-logic formulas.

## co-Büchi: finitely many mistakes

A co-Büchi automaton marks the bad states and accepts if they are visited only finitely often — persistence rather than recurrence. [Eventually always b](lib:omega/dcoba/eventually-always-b) is exactly the language the Büchi automaton needed a guess for, and here it is deterministic. Nondeterminism adds nothing: [the same language with a needless guess](lib:omega/ncoba/eventually-always-b-with-a-needless-guess) is there to make the point. But co-Büchi automata are weaker overall — infinitely often a is beyond them.

## Parity: the full class

Give each state a number, its priority, and accept when the smallest priority seen infinitely often is even. Deterministic parity automata recognise every ω-regular language, which is why they are the target of determinisation. [Strong fairness](lib:omega/dpa/strong-fairness-gf-a-gf-b) — infinitely many requests imply infinitely many grants — needs three priorities and is beyond any deterministic Büchi automaton.

## Weak: safety and guarantee

A weak automaton is one in which every cycle lies wholly inside or wholly outside the accepting set, so the Büchi and co-Büchi readings agree. Weak automata recognise exactly the languages that are both deterministic-Büchi and deterministic-co-Büchi: the safety properties, the guarantee properties and their combinations. [F a](lib:omega/dwa/a-happens-eventually) is the smallest guarantee; [an a, and no b after it](lib:omega/dwa/an-a-and-no-b-ever-after-it) combines one with a safety property.

::: machines omega/dba/infinitely-often-a omega/buchi/classic-eventually-always-b omega/dcoba/eventually-always-b omega/dpa/eventually-always-b-by-priority
GF a, deterministic Büchi; FG b three ways — by guessing, by co-Büchi, by parity.
:::

Every machine in the zoo was checked against an LTL formula on every lasso u(v) up to a size, with the formula decided exactly on the lasso rather than by unrolling it. For the properties engineers write in practice, see [specification patterns](lib:specification-patterns).
