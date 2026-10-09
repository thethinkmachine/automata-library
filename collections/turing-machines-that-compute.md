Most Turing machines in a course decide something: they halt in an accepting state or they do not. The machines here compute — they halt with an answer written on the tape, which is the sense in which Turing defined a computable function. Every one of them was checked twice over: the app decided each input, and a separate simulator confirmed what was left on the tape.

## Arithmetic in unary

In unary, a number n is n marks in a row, and arithmetic becomes editing. [Addition](lib:turing/tm/unary-addition) turns the + into a 1 and erases the last 1 — two edits, whatever the numbers. [Multiplication](lib:turing/tm/unary-multiplication) is repeated addition at walking pace: for each mark of the first number, the machine copies the whole second number to the end of the tape, one mark per trip, marking what it has used and restoring it afterwards. Its running time grows with the *product* of the inputs, times the distance it walks.

## Binary

Binary is exponentially shorter, and the machines are different in kind. [Increment](lib:turing/ittm/binary-increment) is the carry rule done by hand. [Counting to n](lib:turing/ittm/counting-to-n-in-binary) converts unary to binary by erasing one mark at a time and incrementing a counter that grows leftwards. [Binary addition](lib:turing/tm/binary-addition-a-b) on one tape transfers a unit per lap, which is slow; on [three tapes](lib:turing/mtm/3-tape-adder-one-pass) the same job is a single sweep with the carry as the only state.

## Moving things around

A Turing machine's tape is its only memory, so even copying is work. [Copying w to w#w](lib:turing/tm/copy-a-string-w-w-w) carries one symbol per round trip and takes time proportional to n². [Reversing](lib:turing/tm/reverse-a-string) takes the last symbol each time — and needs to know where the left end of a one-way tape is, which a machine can only find by having marked it. [Sorting 0s before 1s](lib:turing/tm/sort-the-0s-before-the-1s) is insertion sort, one swap at a time.

> [!note] Why so slow?
> Every machine on one tape pays for distance. A tape head that must fetch something n cells away spends n steps doing it, and a computation that needs to compare or copy all of its input does that n times. A second tape removes most of the walking, which is why the multi-tape machines here are so much faster — and why a one-tape machine can still simulate them, at most quadratically slower.

::: machines turing/tm/unary-multiplication turing/ittm/counting-to-n-in-binary turing/mtm/4-tape-alu-add-and-or-xor-not
Multiplication in unary, unary to binary, and an arithmetic logic unit on four tapes.
:::
