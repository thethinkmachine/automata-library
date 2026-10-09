For about thirty years after Chomsky's hierarchy, linguists argued over whether human languages are context-free. English kept turning out to be, as far as anyone could prove. The argument was settled in 1985 by Stuart Shieber, with a construction from Swiss German.[^shieber]

## The sentence

In Swiss German, as in Dutch, a subordinate clause can stack up its objects and then its verbs:

> … mer d'chind em Hans es huus lönd hälfe aastriiche
> … we the children-ACC Hans-DAT the house-ACC let help paint
> “… we let the children help Hans paint the house”

The verbs come in the *same* order as the objects they take — the first object belongs to the first verb, the second to the second — so the dependencies cross. And Swiss German marks case: *hälfe*, “help”, takes a dative object, *aastriiche*, “paint”, an accusative. Shieber showed that sentences of the shape

  dative objects, then accusative objects, then dative-taking verbs, then accusative-taking verbs

are grammatical exactly when the number of dative objects equals the number of dative verbs and the same for the accusatives. Intersect the language with a regular pattern that picks out that shape, map the four kinds of word to a, b, c and d, and what remains is aⁿbᵐcⁿdᵐ — which is not context-free. Since context-free languages are closed under both of those operations, Swiss German is not context-free either.

## Why a stack fails

A stack can check *nested* dependencies: aⁿbᵐcᵐdⁿ, where the b's and c's match inside the a's and d's, is a pushdown language. Crossed dependencies need the first thing stored to come out first, which a stack cannot do while also counting a second thing.

## Why a stack of stacks is enough

This machine's store is a stack whose elements are stacks, and only the top one is used. It counts the a's on the working stack. For each b it parks a new stack, holding one D, *beneath* the working stack. Then the c's use up the count of a's; when the working stack is empty it is discarded, and the parked stacks come back into view in the order they were parked — one d for each.

::: diagram
Count the a's on top; park a D below for each b; the c's empty the top, and the d's resume the parked stacks.
:::

Embedded pushdown automata recognise exactly the **tree-adjoining languages**, the class Aravind Joshi's tree-adjoining grammars generate. They form the best-known *mildly context-sensitive* class: enough for crossed dependencies like these, still parsable in polynomial time, and far short of the full power of context-sensitive languages. aⁿbⁿcⁿdⁿ is inside the class; aⁿbⁿcⁿdⁿeⁿ is not.

::: machines memory/pda/nested-counts-anbmcmdn memory/epda/anbncndn-four-counts-one-stack-of-stacks memory/epda/a-copy-with-a-stack-of-stacks-w-w
Nested counts need only a stack; four equal counts and the copy language need the stack of stacks.
:::

[^shieber]: S. M. Shieber, “Evidence against the context-freeness of natural language”, *Linguistics and Philosophy* 8 (1985).
