A nondeterministic machine may have several moves available and accepts if *some* sequence of choices leads to acceptance. It is easiest to think of it as guessing — and always guessing right, when there is a right guess. Whether that ability adds anything depends on the machine, and the answer is different at every level.

| Machine | Does guessing add power? | What it can cost to remove |
| --- | :-: | --- |
| finite automaton | no | exponentially many states |
| pushdown automaton | **yes** | — |
| Büchi automaton | **yes** | — |
| co-Büchi, parity, weak | no | many states |
| Turing machine | no | possibly exponential time — the P versus NP question |

## Finite automata: smaller, not stronger

[The third symbol from the end](lib:finite/nfa/the-third-symbol-from-the-end-is-a-1-by-guessing) guesses where the end is. [Some letter occurs twice](lib:finite/nfa/some-letter-occurs-twice) guesses which letter and where it first appears. [A square of length 4](lib:finite/nfa/contains-a-square-of-length-4) guesses where it starts. Every NFA can be determinised by the subset construction — a state of the DFA is the set of states the NFA could be in — and sometimes all 2ⁿ subsets are needed. [Lengths divisible by 3 or 5](lib:finite/nfa/lengths-that-are-multiples-of-3-or-of-5) guesses which cycle to run, at a cost of 3 + 5 states where the DFA needs 15.

## Pushdown automata: genuinely stronger

[An even palindrome](lib:memory/npda/palindromes-guess-the-middle) needs the machine to guess the middle; no deterministic pushdown automaton recognises the even palindromes. [aⁱbʲcᵏ with i = j or j = k](lib:memory/npda/aibjck-with-i-j-or-j-k) needs it to guess which pair to match, and the language is inherently ambiguous: every grammar for it has strings with two parse trees.

## Transducers: looking ahead

A finite transducer that guesses can act on information it has not read yet, as long as the wrong guesses die. [Replacing the last letter](lib:transducers/fst/replace-the-last-letter-with-x) bets on every letter being the last; [thousands separators](lib:transducers/fst/thousands-separators) bets on the length mod 3. One branch survives, and its output is the answer.

## ω-automata: the one surprise

For infinite words, guessing adds power to Büchi automata and to nothing else. [Eventually always b](lib:omega/buchi/classic-eventually-always-b) must guess when the a's have stopped, and no deterministic Büchi automaton can do without the guess.

## Turing machines: certificates

A nondeterministic Turing machine decides nothing that a deterministic one cannot — it can be simulated by trying every branch. The question is how long that takes. [Subset sum](lib:turing/ndtm/subset-sum-by-guessing) and [compositeness](lib:turing/ndtm/is-n-composite-guess-a-factor) are decided in a few passes once the right items or the right factor are guessed; trying every guess is exponential. Whether that is ever necessary is the P versus NP problem.

::: machines finite/nfa/the-third-symbol-from-the-end-is-a-1-by-guessing memory/npda/palindromes-guess-the-middle turing/ndtm/subset-sum-by-guessing
Guess the end, guess the middle, guess the subset.
:::
