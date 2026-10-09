A puzzle with finitely many positions is a finite automaton, whether or not anyone draws it that way. Its states are the positions, its alphabet is the moves, an illegal move is a missing edge, and the solved position is an accepting state. Solving the puzzle is finding a word the machine accepts — and the shortest solution is the shortest such word, which a breadth-first search over the diagram finds directly.

Every machine in this collection was built that way: by writing down what a position is and what a move does, and letting a program discover every position that can be reached. None of the diagrams was drawn state by state. What is surprising is how often the picture that falls out explains the puzzle better than any description of it.

::: machines finite/dfa/wolf-goat-and-cabbage finite/dfa/towers-of-hanoi-three-disks finite/dfa/lights-out-on-a-2-2-board
Three puzzles, three shapes: a diamond, a fractal and a four-dimensional cube.
:::

## The shape of a puzzle

[Wolf, goat and cabbage](lib:finite/dfa/wolf-goat-and-cabbage) has only ten safe positions, and they form a diamond: one way in, one way out, and two routes through the middle that are mirror images of each other. That is why the puzzle has exactly two shortest solutions, and why they differ only in whether the wolf or the cabbage crosses first.

[The Towers of Hanoi](lib:finite/dfa/towers-of-hanoi-three-disks) has 27 positions for three disks, and drawn by where the disks sit, they form a Sierpiński triangle: three copies of the two-disk puzzle, joined at the corners where the largest disk can move. The recursion everyone learns for the puzzle — move the smaller tower aside, move the big disk, move the tower back — is that triangle, read from corner to corner.

[Lights Out](lib:finite/dfa/lights-out-on-a-2-2-board) on a 2 × 2 board has 16 positions, and drawn by which buttons have been pressed an odd number of times, they form a four-dimensional cube. That is the whole theory of the game in one picture: presses commute, each undoes itself, and so only the *set* of buttons pressed matters.

## Search, and what it finds

[Missionaries and cannibals](lib:finite/dfa/missionaries-and-cannibals) and [the water jugs](lib:finite/dfa/measuring-4-litres-with-3-and-5-litre-jugs) are the puzzles artificial-intelligence courses use to introduce state-space search. Saul Amarel's 1968 paper on how the choice of representation makes a problem easy or hard used the first of them as its running example.[^amarel] Here the representation is the machine itself, and the search is the one any reader can do with a finger on the diagram.

> [!tip] Try this
> Open any puzzle and run its shortest solution, then change one move. The run stops at the move that was illegal — the missing edge — which is a better explanation of why it was illegal than the rules are.

## Symmetry and groups

When every move can be undone, the machine is the Cayley graph of a group, and the puzzle is a question about that group. [Shuffling three cards](lib:finite/dfa/shuffling-three-cards) with two moves draws the six permutations of three things; [rolling a die](lib:finite/dfa/rolling-a-die-until-6-is-on-top) to get 6 on top would have 24 orientations, but the question only depends on where the 6 is, so the minimal machine has six states. [A knight on a 3 × 3 board](lib:finite/dfa/a-knight-on-a-3-3-board) can never reach the centre, and the other eight squares turn out to form a single ring.

## Games

A two-player game is a puzzle where the moves alternate, so whose turn it is becomes part of the state. [Nim with five sticks](lib:finite/dfa/nim-with-five-sticks) accepts the games the first player wins; [a game of tennis](lib:finite/dfa/a-game-of-tennis-won-by-a) accepts the point sequences in which A wins, and its minimal form discovers that 30–30 is the same position as deuce. [Penney's game](lib:finite/dfa/penney-s-game-hht-before-htt) adds chance: the same diagram, read with a probability on every edge, says who is likely to win.

[^amarel]: S. Amarel, “On representations of problems of reasoning about actions”, in *Machine Intelligence 3* (1968).
