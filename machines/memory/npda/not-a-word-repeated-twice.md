The words of the form ww — some string written twice, like abab or baabaa — are the standard example of a language that is **not** context-free: a stack reverses what it stores, so it can check w followed by its mirror image, but not w followed by itself. It comes as a surprise, then, that the *complement* is context-free. This machine recognises every word over a and b that is not a repetition.

## Two ways to fail

A word fails to be ww either because its length is odd — that is easy, and one branch of the machine just counts the length mod 2 — or because it has even length 2n and differs from itself somewhere: there is a position i with the i-th letter of the first half different from the i-th letter of the second.

The second case is the clever one. A word of even length is not ww exactly when it can be cut into **two pieces of odd length whose middle letters differ**. Cut the word after position 2i − 1. The first piece has odd length 2i − 1, and its middle letter is the one at position i. The second piece has length 2n − 2i + 1, also odd, and its middle letter sits n − i + 1 places into it — at position n + i of the whole word. So the two middle letters are exactly the two letters that should have been equal.

That is something a stack can check, because each piece only needs to be measured against itself:

1. Push one marker for each letter before the first middle, and **guess** where the middle is; remember its letter.
2. Pop one marker for each letter after it, until the stack is back to the bottom — that ends the first odd piece.
3. Do the same for the second piece, and accept if its middle letter is the other one.

::: diagram
One branch checks for odd length; the other guesses two odd pieces with different middle letters.
:::

## What it shows

Context-free languages are not closed under complement — if they were, the complement of this language, the words ww, would be context-free. This machine is the concrete proof that the closure fails in one direction: a language that is not context-free, whose complement is. The same idea, with a guessed position and two measurements against the stack, also shows that the words x#y with x ≠ y form a context-free language, while x#x does not.

> [!tip] Try it
> abba is accepted — cut it as a | bba, and the middles a and b differ. abab is rejected: every way of cutting it into two odd pieces gives equal middles. Any word of odd length is accepted, since it cannot be a repetition.
