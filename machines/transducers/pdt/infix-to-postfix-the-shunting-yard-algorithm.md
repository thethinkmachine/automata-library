People write x + x * x and mean x + (x * x). A machine that evaluates expressions would rather have them in **postfix**, where each operator comes after its operands — x x x * + — because postfix needs no parentheses and no precedence rules: read left to right, push operands, and let each operator take the top two. Converting from one to the other is the job of the shunting-yard algorithm, and this pushdown transducer is that algorithm.

## How it works

Operands go straight to the output. Operators do not: each waits on the stack, the way a railway wagon waits in a siding, until something forces it out. Edsger Dijkstra described it in 1961 and named it for exactly that picture.[^dijkstra]

- When an operator arrives, every operator already waiting with **equal or higher precedence** goes to the output first, then the new one takes its place on the stack. A `*` arriving finds a waiting `+` lower than itself and waits on top of it; a `+` arriving sends a waiting `*` out.
- An opening parenthesis waits on the stack as a wall: operators above it cannot see past it.
- A closing parenthesis sends everything above the matching wall to the output, and removes the wall.
- At the end of the input, everything still waiting goes out.

Sending out equal precedence as well as higher is what makes the operators left-associative: x + x + x becomes x x + x +, adding left to right.

| Infix | Postfix |
| --- | --- |
| x+x*x | xxx*+ |
| x*x+x | xx*x+ |
| (x+x)*x | xx+x* |
| x*(x+x*x) | xxxx*+* |

## Reading the machine

The states *operand* and *after* are the two halves of a parser's view of the input: expecting an operand, or having just finished one. *plus* and *times* are where an arriving operator pops what must go before it, *close* empties a parenthesised group, and *flush* empties the stack at the end. The stack holds P for a parenthesis and the operators themselves.

> [!tip] Watch the stack
> Run `x+x*x` and step through it. The `+` waits; the `*` arrives and waits on top of it, since it binds tighter; the end of the input sends out the `*` and then the `+`.

The same machine is also an acceptor: it reaches its final state only on well-formed expressions, so `x+` and `(x` are rejected. A pushdown machine is needed because parentheses nest without limit — this is the step from lexing to parsing.

[^dijkstra]: E. W. Dijkstra, “Algol 60 translation”, a report of the Mathematisch Centrum, Amsterdam (1961), describing the translator he and Jaap Zonneveld wrote for the Electrologica X1.
