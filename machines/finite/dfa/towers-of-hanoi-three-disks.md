The puzzle has three pegs and three disks of different sizes, all starting on the first peg, largest at the bottom. A move takes the top disk from one peg and puts it on another, never on a smaller disk. The goal is to move the whole tower to the third peg. This machine contains every legal position of the puzzle — {{states}} of them — and every legal move between them, {{transitions}} edges in all.

::: diagram
Every position of three-disk Hanoi. The start, AAA, is at the top; the goal, CCC, at the bottom right. Each name lists the pegs of the large, middle and small disk.
:::

## Why a triangle

Look at where the largest disk is. In the top third of the diagram it is on peg A, in the left third on B, in the right third on C — and it cannot move unless the two smaller disks are both out of its way, stacked on the third peg. So within each third, the large disk sits still and the two small disks play a complete two-disk game on their own, and that game is itself a smaller triangle of nine positions. The three thirds touch only at the corners where the large disk can move.

That is the recursion everyone learns — to move n disks, move n − 1 out of the way, move the largest, and move the n − 1 back — drawn as a picture. Applied again inside each third, it gives a triangle of triangles of triangles: the Sierpiński pattern, which is what the graph of n-disk Hanoi approaches as n grows.

## The shortest solution

The shortest path from AAA to CCC runs straight down the right-hand side of the triangle, and it has 2³ − 1 = 7 moves:

| Move | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Disk moved | small | middle | small | large | small | middle | small |
| From → to | A → C | A → B | C → B | A → C | B → A | B → C | A → C |

The small disk moves every other turn, always in the same direction round the pegs. In general n disks take 2ⁿ − 1 moves, and the graph has 3ⁿ positions — every assignment of disks to pegs is legal, because each peg's disks can only be stacked one way.

> [!tip] Try it
> Run `AC AB CB AC BA BC AC` and watch the run walk down the side of the triangle. Then try a longer solution — any word that ends at CCC is accepted — and see it wander into the interior and back.

## Where it comes from

Édouard Lucas published the puzzle in 1883, under the pseudonym N. Claus de Siam, with a story about a temple whose priests move 64 golden disks; when they finish, the world ends. At one move a second, 2⁶⁴ − 1 moves take about 585 billion years.
