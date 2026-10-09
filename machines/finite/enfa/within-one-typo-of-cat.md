A spell-checker that suggests “cat” when you type “cst” is answering a question about edit distance: how many single-letter insertions, deletions and substitutions turn one word into another. Computing that distance for one pair of words is a textbook dynamic-programming exercise. But a spell-checker must compare what you typed against a whole dictionary, and that is where this machine comes in: it accepts *exactly* the words within one edit of “cat”, so testing a word costs one run over its letters.

::: diagram
Top row: how much of “cat” has been matched with no edit spent. Bottom row: the same, after the one edit. x stands for any other letter.
:::

## Reading the diagram

Each state answers two questions: how much of the target has been matched, and how many edits have been used. Moving right along a row reads the next letter of “cat”. Dropping from the top row to the bottom spends the edit, in one of three ways:

- **straight down** on any letter: an *insertion* — the letter is extra, and the position in “cat” stays put;
- **diagonally** on any letter: a *substitution* — the letter stands in for the one “cat” expected;
- **diagonally on ε**: a *deletion* — a letter of “cat” is skipped without reading anything.

The bottom row has no way down, because there is no second edit to spend. A word is accepted if some path through these choices ends at the end of “cat”, so the nondeterminism does the minimising that the dynamic-programming table does by hand.

## From one word to a dictionary

For a target word of length n and up to k edits, the same construction gives (n + 1)(k + 1) states. Klaus Schulz and Stoyan Mihov showed in 2002 that the deterministic version can be built directly, in time linear in the length of the word, and that intersecting it with a dictionary stored as an automaton finds every candidate correction in one pass.[^schulz] Apache Lucene's fuzzy queries have worked this way since 2012.

> [!tip] Try it
> “caxt” is accepted by an insertion, “cxt” by a substitution, “ct” by a deletion and “act” by none of them alone — it needs two edits — so it is rejected. A swap of two letters costs two edits here; counting it as one gives the Damerau–Levenshtein distance, and a slightly different machine.

[^schulz]: K. U. Schulz and S. Mihov, “Fast string correction with Levenshtein automata”, *International Journal on Document Analysis and Recognition* 5 (2002).
