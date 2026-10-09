Suppose you have a machine whose state you do not know — a device that lost power, a robot whose sensors failed, a part tumbling on a conveyor belt. Is there a sequence of inputs that puts it into a known state, whatever state it started in? Such a sequence is a **synchronising word**, or reset word, and this machine is the most famous example of how long one may have to be.

::: diagram
Černý's automaton on four states: a turns the ring, and b moves q3 to q0 while leaving the other states alone.
:::

## Watching the uncertainty shrink

Track not one state but the *set* of states the machine might be in. At the start that is all four. The letter a only rotates the set, so it never helps. The letter b helps only when q3 is in the set: it merges q3 into q0, and the set loses one member.

| After | possible states |
| --- | --- |
| (start) | q0 q1 q2 q3 |
| b | q0 q1 q2 |
| baaa | q3 q0 q1 |
| baaab | q0 q1 |
| baaabaaa | q3 q0 |
| baaabaaab | q0 |

Each b removes one state, and between two b's the set has to be rotated until it contains q3 again — three a's each time. The shortest reset word is baaabaaab, of length 9, and a search over all subsets confirms that nothing shorter works.

> [!example] Check it
> This machine accepts the words that take q0 back to q0. baaabaaab is one of them — and it would take *every* state to q0, which no shorter word does.

## The conjecture

With n states, the same construction needs (n − 1)² letters. In 1964 Ján Černý asked whether that is the worst case: does every n-state automaton that has a synchronising word have one of length at most (n − 1)²?[^cerny]

Sixty years later nobody knows. Computer searches have checked small automata exhaustively and found nothing worse than Černý's own examples; the best general upper bound proved is cubic in n, around n³/6. A related question — whether the edges of every suitable graph can be coloured so that the result is synchronising, the road colouring problem — was open for nearly forty years before Avraham Trahtman proved it in 2007.

Synchronising words have uses well beyond puzzles: orienting parts in robotic assembly without sensors, resynchronising decoders after errors in a variable-length code, and testing hardware whose initial state is unknown.

[^cerny]: J. Černý, “Poznámka k homogénnym experimentom s konečnými automatmi”, *Matematicko-fyzikálny časopis* 14 (1964).
