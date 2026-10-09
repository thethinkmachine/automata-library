A finite automaton cannot count past a fixed number, so it cannot check that a string is aⁿbⁿ. Give it memory that grows with the input and it can. What is interesting is that the *shape* of the memory decides what it can do — a stack, a counter, a queue, two stacks, a tape — and the differences are sharp, provable and visible in small machines.

## A stack

A stack reverses, and matching is reversal: push on the way in, pop on the way out. That is enough for [aⁿbⁿ](lib:memory/pda/anbn), for [balanced brackets of several kinds](lib:memory/pda/bracket-matcher), and for [a palindrome with its middle marked](lib:memory/pda/a-palindrome-with-its-middle-marked-wcwr). Remove the marker and the machine must [guess where the middle is](lib:memory/npda/palindromes-guess-the-middle) — and here nondeterminism, which added nothing to finite automata, adds real power: no deterministic pushdown automaton recognises even-length palindromes. [aⁿbⁿ or aⁿb²ⁿ](lib:memory/npda/anbn-or-anb2n) is the standard example of a language every nondeterministic PDA can handle and no deterministic one can.

A stack cannot compare two things that come in the same order. The words ww — a string repeated — are not context-free. Their complement, oddly, is: [not a word repeated twice](lib:memory/npda/not-a-word-repeated-twice) guesses where two halves first differ.

## A counter

A counter is a stack with one kind of symbol: it can count up, count down and test for zero. It is enough to [validate reverse Polish notation](lib:memory/counter/a-valid-expression-in-reverse-polish-notation), where only the depth of the evaluation stack matters, and too little for nested brackets of two kinds, where *which* bracket is open matters too.

## A queue

A queue keeps things in arrival order, which is exactly what copying needs. [Three copies, w#w#w](lib:memory/queue/three-copies-w-w-w) checks the second copy while putting each symbol straight back for the third, and [aⁿbⁿcⁿ with a queue](lib:memory/queue/anbncn-with-a-queue) counts three times by cycling the queue. A queue automaton is as powerful as a Turing machine.

## Two stacks, a stack of stacks, a tape

[Two stacks make a queue](lib:memory/twopda/two-stacks-make-a-queue-w-w) — pour one into the other and the order comes out right — and so two stacks are also as powerful as a Turing machine. Between one stack and two lies [a stack of stacks](lib:memory/epda/anbncndn-four-counts-one-stack-of-stacks), the embedded pushdown automaton, which recognises exactly the tree-adjoining languages: aⁿbⁿcⁿdⁿ, but not aⁿbⁿcⁿdⁿeⁿ.

Then the tape. A Turing machine restricted to the cells of its input is a [linear bounded automaton](lib:turing/lba/anbncn-in-the-space-of-its-input), and those recognise exactly the context-sensitive languages. A one-tape Turing machine can check [w#w](lib:turing/tm/two-equal-halves-w-w) by walking back and forth, in time proportional to n²; [a second tape](lib:turing/mtm/palindromes-in-linear-time) brings palindromes down to linear time.

::: machines memory/pda/anbn memory/queue/anbncn-with-a-queue turing/lba/anbncn-in-the-space-of-its-input
Three kinds of memory, three levels of the hierarchy: a stack counts to two, a queue and a bounded tape count to three.
:::
