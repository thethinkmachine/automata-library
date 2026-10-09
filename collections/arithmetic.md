How much arithmetic fits in finite memory? More than one might expect, as long as the machine reads its numbers in the right order and is asked the right question.

## Remainders

Reading a binary number from its most significant bit, each new bit b turns the value v into 2v + b. So the remainder mod k turns into 2r + b mod k, and a DFA with k states — one per remainder — tracks it for numbers of any length. [Divisibility by 3](lib:finite/dfa/binary-divisibility-by-3) is that machine for k = 3. In decimal the same rule is 10r + d, and for 3 it collapses into the digit-sum test: [decimal multiples of 3](lib:finite/dfa/decimal-multiples-of-3-the-digit-sum-rule).

The remainder machine is not always minimal. For 5 in decimal, every earlier digit contributes a multiple of 10 and so nothing at all, and [two states](lib:finite/dfa/decimal-multiples-of-5-only-the-last-digit-counts) suffice. In base 3, whether a number is even depends on every digit, because every power of 3 is odd — [the digit sum again](lib:finite/dfa/even-numbers-in-base-3).

## Column alphabets

To check a relation between two numbers, let each symbol be a *column*: one digit from each. [Comparing two numbers](lib:finite/dfa/comparing-two-binary-numbers-column-by-column) from the top needs three states; [checking a sum](lib:finite/dfa/checking-a-sum-column-by-column) from the bottom needs two, because the only thing carried from one column to the next is the carry. This trick is the heart of automatic structures and of Büchi's decision procedure for arithmetic with addition: relations that finite automata can check on columns of base-k digits are exactly the ones definable from addition together with one extra function, the largest power of k that divides a number.[^buchi]

## Transducers that calculate

When the machine may write, the same memories compute. [A serial adder](lib:transducers/mealy/serial-binary-adder) is a carry and nothing else; [times three](lib:transducers/mealy/times-three-serially) needs a carry of up to 2; [division by 3](lib:transducers/mealy/dividing-by-3-most-significant-bit-first) keeps the remainder the divisibility DFA kept and prints the quotient it threw away; [two's complement](lib:transducers/mealy/two-s-complement-least-significant-bit-first) needs one bit, whether the first 1 has passed.

## Where finite memory ends

Multiplying two arbitrary numbers is beyond any finite transducer: the carry can grow without bound. Comparing a count of a's with a count of b's is beyond any finite automaton for the same reason. A stack handles the second — [unary addition checked](lib:memory/pda/unary-addition-aibjci-j) — and a Turing machine handles both, at walking pace: [multiplication checked](lib:turing/tm/multiplication-checked-aibjck-with-k-i-j), and [binary increment](lib:turing/ittm/binary-increment) for the carry done on a tape.

[^buchi]: The theorem goes back to J. R. Büchi, “Weak second-order arithmetic and finite automata”, *Zeitschrift für mathematische Logik und Grundlagen der Mathematik* 6 (1960); the form for base-k addition is the Büchi–Bruyère theorem.
