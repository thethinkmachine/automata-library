An acceptor answers yes or no. A transducer answers with a string: it reads its input and writes an output as it goes, so it computes a function — or, when it is nondeterministic, a relation. The kinds of transducer differ in where the output is attached and in what the machine may remember, and those two choices decide what it can compute.

## Moore and Mealy

A **Moore machine** prints on its states: every state has an output symbol, printed on arrival, so the output is one symbol longer than the input — the start state speaks before anything is read. [A thermostat](lib:transducers/moore/a-thermostat-with-hysteresis) is the clearest example: its output is the heater, and its single bit of memory is the whole reason it does not flicker. [A debouncer](lib:transducers/moore/a-switch-debouncer) is the same idea with a longer memory.

A **Mealy machine** prints on its edges, so its output keeps exact pace with its input and can depend on the symbol just read. That makes it the natural model of a serial circuit: [a serial adder](lib:transducers/mealy/serial-binary-adder) carries one bit, [two's complement](lib:transducers/mealy/two-s-complement-least-significant-bit-first) remembers whether it has passed the first 1, and [division by 3](lib:transducers/mealy/dividing-by-3-most-significant-bit-first) keeps a remainder and prints the quotient. Any Moore machine can be turned into a Mealy machine and back; they differ by a delay of one symbol.

## Finite-state transducers

A finite-state transducer may print any string on an edge, including none, and may be nondeterministic. That lets it insert — [bit stuffing](lib:transducers/fst/hdlc-bit-stuffing) adds a 0 after five 1s — and substitute strings for letters, as [Morse code](lib:transducers/fst/morse-code-for-e-t-a-n-i-m-s-and-o) does with a single state. Nondeterminism lets it look ahead by guessing: [replace the last letter](lib:transducers/fst/replace-the-last-letter-with-x) bets on where the end is, and [thousands separators](lib:transducers/fst/thousands-separators) bets on the length mod 3. Only the branch that guessed right reaches an accepting state, so exactly one output survives.

What a one-way finite transducer cannot do is reverse: it has no way to hold an unbounded amount of input.

## Reversal: a stack, or a head that turns

[A pushdown transducer](lib:transducers/pdt/reverse-the-input) reverses by pushing everything and popping it back out, and the same machinery runs [the shunting-yard algorithm](lib:transducers/pdt/infix-to-postfix-the-shunting-yard-algorithm), which turns infix arithmetic into postfix. [A two-way transducer](lib:transducers/twodft/a-word-and-its-mirror-w-wwr) reverses with no memory at all, by reading the input backwards, and can [copy its input twice](lib:transducers/twodft/copy-twice-w-ww) — a function no one-way transducer, with or without a stack, computes.

::: machines transducers/moore/a-thermostat-with-hysteresis transducers/mealy/serial-binary-adder transducers/fst/thousands-separators transducers/pdt/infix-to-postfix-the-shunting-yard-algorithm
Output on states, output on edges, output by guessing, output from a stack.
:::
