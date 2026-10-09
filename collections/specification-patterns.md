When engineers write down what a concurrent system must do, they write the same few properties over and over. In the late 1990s Matthew Dwyer, George Avrunin and James Corbett collected hundreds of real specifications and found that most fell into a handful of patterns — absence, existence, universality, precedence and response, each within a scope.[^dwyer] Each pattern is a template in linear temporal logic, and each formula is an ω-automaton.

The machines here read infinite traces of events — r a request, g a grant, n an idle step — and accept the traces that satisfy the property.

## Safety and liveness

A **safety** property says something bad never happens. Its violations are finite: once a trace has gone wrong, nothing after can repair it. [No grant before the first request](lib:omega/dba/no-grant-before-the-first-request) is safety — precedence, in Dwyer's terms — and so is [mutual exclusion](lib:finite/dfa/two-processes-one-critical-section), whose automaton simply has no state in which both processes are inside.

A **liveness** property says something good eventually happens. No finite prefix can violate it, since the good thing might still come. [Every request is eventually granted](lib:omega/dba/every-request-is-eventually-granted) is the response pattern, the most common of all: two states, nothing pending or a request waiting, and acceptance demands “nothing pending” infinitely often.

Every ω-regular property is the intersection of a safety property and a liveness property — Alpern and Schneider's theorem[^alpern] — and [requests and grants alternate](lib:omega/dba/requests-and-grants-alternate) shows both halves in one two-state machine: the missing edges are the safety part, the acceptance condition the liveness part.

## Fairness

A scheduler is **weakly fair** if a process that is continuously enabled eventually runs, and **strongly fair** if one that is enabled infinitely often eventually runs. [Strong fairness](lib:omega/dpa/strong-fairness-gf-a-gf-b), GF a → GF b, is the first property here that no deterministic Büchi automaton can express; it needs a parity condition. [Both a and b infinitely often](lib:omega/dba/both-a-and-b-infinitely-often) is the conjunction of two recurrences, and its machine shows the standard trick for turning several Büchi conditions into one.

## Stability

[Eventually, every a is followed by b](lib:omega/dcoba/eventually-every-a-is-followed-by-b) forgives finitely many mistakes — the shape of a system that may misbehave while starting up but must settle down. That is a persistence property, and co-Büchi acceptance says it directly.

[^dwyer]: M. B. Dwyer, G. S. Avrunin and J. C. Corbett, “Patterns in property specifications for finite-state verification”, *ICSE* (1999).
[^alpern]: B. Alpern and F. B. Schneider, “Defining liveness”, *Information Processing Letters* 21 (1985).
