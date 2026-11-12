This machine has 215 states and only two symbols, 0 and 1. Start it on a blank tape and it begins checking, one after another, every proof that can be written in ZFC, the axioms almost all of modern mathematics is built on. It stops only if one of those proofs ends in a contradiction. Two proof assistants, Lean and Rocq, have checked that this is exactly what the machine does. As of October 2026 it is the smallest machine known to have that property.

## The idea in one paragraph

You can build a Turing machine that checks every possible proof in a set of axioms, one after another, and stops if it finds a proof of something false, like "0 = 1". That machine stops **only if the axioms contradict themselves**. Now apply a famous result of Kurt Gödel: a system of axioms that does not contradict itself can never prove that about itself.[^godel] So that system can never prove the machine runs forever, even though (if the system is sound) it does. This machine is that idea for ZFC, squeezed into 215 states.

## Which axioms?

**ZFC** is Zermelo–Fraenkel set theory with the axiom of choice. When mathematicians say something "has been proved" without saying from what, they nearly always mean it follows from ZFC. Nobody expects ZFC to contradict itself, but by Gödel's theorem ZFC cannot prove that it does not.

A machine that searched through ZFC proofs written the ordinary way would need thousands of states. This one does not read ZFC directly. It runs a much smaller system of rules, called **K**, designed by Elliot Glazer so that K reaches a contradiction exactly when ZFC does. The machine's own program is tiny: a few counters, and a loop that builds every K-proof in turn. Most of the work of making the machine small was making K small.

## What has been proved

The theorem, checked for this exact table of 430 rows:[^formal]

> The machine halts from a blank tape **if and only if** ZFC has a proof of a contradiction.

- In **Lean** it is `KEndpoint215.blank_halts_iff_zfc_refutation`. It uses only Lean's three standard axioms.
- In **Rocq** it is `tm215_halts_iff_ZFC_inconsistent`. An independent checker, `coqchk`, re-checked it.

Both proofs are about the same table, and both go through the same steps: the machine's setup, the match between the machine and its program, the match between the program and K, and the match between K and ZFC.

So, if ZFC is consistent, this machine never halts, and ZFC cannot prove that it never halts.

> [!note] What is not claimed
> The authors are careful about the edges of the result:
>
> - Nobody has proved the machine **never halts**. That would be a proof that ZFC is consistent, which needs axioms stronger than ZFC.
> - Nobody claims 215 is the **smallest possible**. The same project is already working toward 214.
> - The Lean and Rocq theorems are stated from the outside, in the proof assistants' own logic. The statement "ZFC itself proves that the machine runs forever exactly when ZFC is consistent" rests on the project's written proof, which has been reviewed but not checked by a proof assistant. A version of the argument carried out inside Peano arithmetic is still open.
> - The machine and its proofs were built by AI research agents working for Vladimir Reshetnikov's ProveIt project. The reviews recorded in the project are by other agents in the same collaboration. What makes the result trustworthy is the two proof assistants, not those reviews, and an independent rebuild by other people is still welcome.

## Why people care: the busy beaver numbers

BB(n) is the longest any n-state machine can run on a blank tape and still halt. BB(5) was found in 2024 and checked by computer: it is 47,176,870. BB(6) is already far too large to compute.

A machine like this one sets a limit on how far proofs can go. If ZFC could prove "BB(215) is at most k" for some number k, it could run this machine for k steps, see that it has not halted, and conclude that it never will. That would be ZFC proving its own consistency, which Gödel's theorem rules out. So ZFC can never pin down BB(215), and the same goes for every larger number of states.

The size of the smallest such machine has dropped a long way: from 7,910 states in 2016 to 215 states in October 2026.[^wiki] This machine is the end of a run of ever smaller relatives of Glazer's 230-state machine K230: among them 225, 224, 221, 219, 217 and 216, and then 215 on 21 October 2026.[^repo] Each step found a shorter way to write the same program, or a way to make two states do the work of three.

The same idea has been aimed at other axioms. A 210-state machine and a 198-state machine by wlad-svennik do this for New Foundations and a related set theory, which are weaker targets than ZFC.[^nf]

## What you see when you run it

The run has two parts. First the machine sets up. After exactly **95,714 steps** it reaches state `84`, the top of its main loop, with 95 ones on the tape: its counters, and 40 spare blocks to grow into. The formal proofs check this setup step by step. From then on it goes round the loop, building one K-proof after another, and the tape grows slowly.

Here is what a separate simulator, written for this entry, recorded:

| Steps | 1s on the tape | Cells visited |
|--:|--:|--:|
| 1,000 | 13 | 35 |
| 10,000 | 30 | 57 |
| 95,714 | 95 | 218 |
| 1,000,000 | 702 | 998 |
| 10,000,000 | 2,463 | 3,814 |
| 50,000,000 | 5,200 | 9,302 |

It did not halt in the first 50 million steps. That proves nothing, though. The whole point is that no amount of running can show it never halts. The library gives it no "never halts" badge either, because none of the library's methods can prove it. For this machine that is what the theorem predicts: a method that could prove it would be proving that ZFC is consistent.

## Reading the machine

The states are numbered, and the numbers are the labels of the 230-state machine this one descends from. That is why there are gaps: fifteen of the old labels, such as 79 and 140, belong to states that were removed along the way. The machine starts in state `0`. State `84` is the top of the main loop. The only way out is the state `halt`, reached from state `68` on reading a 1. In the original files the halt is a separate outcome and is not counted as one of the 215 states, so this entry draws it as an accepting state. Reaching it would mean ZFC has a contradiction.

## Credits

The machine is **K215**, from Vladimir Reshetnikov's **ProveIt** project, where it was built and proved correct by a collaboration of AI research agents.[^repo] It builds on Elliot Glazer's theory K and his 230-state machine with its Rocq proof, and on earlier compilers and proof libraries that the project's notice credits in full, among them work by Andrew James Wade, BusyCoq and the Coq Library of Undecidability.[^notice] This entry uses the table written in K230's labels, `k215_k230labels.tm`, which is the published 215-state table with its states renamed. It has been converted to this app's format without changing any transitions. The library entry and write-up are by Shreyan Chaubey.

[^godel]: This is Gödel's second incompleteness theorem (1931). It applies to any consistent system strong enough to do basic arithmetic.

[^formal]: ProveIt, "Formal correctness of the exact 215-state machine", https://github.com/VladimirReshetnikov/ProveIt/tree/c9dc79323429112c698100f3226a6e4d56c8b782/Computability/BusyBeaver/Research/ZFC/k225-formal/verification/k215. Lean 4.32.0; Rocq 9.1.0.

[^repo]: ProveIt, "K215: 215 working states for ZFC consistency", https://github.com/VladimirReshetnikov/ProveIt/tree/c9dc79323429112c698100f3226a6e4d56c8b782/Computability/BusyBeaver/Research/ZFC/candidate-k215, and "Formal endpoints for the K-family candidates" in the folder `k225-formal` beside it.

[^notice]: The notice is `NOTICE.md` in the `candidate-k215` folder. Elliot Glazer's Rocq development is at https://github.com/elliotglazer/k230-rocq.

[^nf]: wlad-svennik, https://github.com/wlad-svennik/notes/tree/main/nf-bb210 and https://github.com/wlad-svennik/notes/tree/main/c0-198.

[^wiki]: BusyBeaverWiki, "Logical independence", https://wiki.bbchallenge.org/wiki/Logical_independence. The 7,910-state machine is from A. Yedidia and S. Aaronson, "A Relatively Small Turing Machine Whose Behavior Is Independent of Set Theory", *Complex Systems* 25:4 (2016).
