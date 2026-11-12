This machine has 198 states and only two symbols, 0 and 1. Start it on a blank tape and it begins a search that, as far as anyone can tell, never ends. If it ever stopped, that would show a whole system of mathematics contradicts itself. Its author published it on 12 November 2026, as a step toward a question people have asked for decades: **how small can a machine be before mathematics can no longer tell us what it does?**

## The idea in one paragraph

You can build a Turing machine that checks every possible proof in a set of axioms, one after another, and stops if it finds a proof of something false, like "0 = 1". That machine stops **only if the axioms contradict themselves**. Now apply a famous result of Kurt Gödel: a system of axioms that does not contradict itself can never prove that about itself.[^godel] So that system can never prove the machine runs forever, even though (if the system is sound) it does. This machine is that idea, squeezed into 198 states.

## Which axioms?

The axioms here are a set theory the author calls **C₀**. It is related to **New Foundations (NF)**, a set theory W. V. O. Quine proposed in 1937.

NF is unusual. Most mathematicians use a set theory called ZF (or ZFC), where the "set of all sets" cannot exist. In NF it can, and NF avoids paradoxes in a different way. Whether NF was free of contradictions was an open question for almost 90 years. Randall Holmes claimed a proof in 2010, and Sky Wilshaw checked the hard part of it in the Lean proof assistant in 2024.[^connf]

What the author says the machine does:[^repo]

- It **halts if and only if C₀ is inconsistent**: it stops exactly when C₀ contradicts itself.
- **If NF is consistent, it never halts.**
- **If it never halts, then NFU + Infinity is consistent.** NFU is a gentler version of NF that allows "urelements", objects that are not sets.

So C₀ sits somewhere between NFU + Infinity and NF in strength. Exactly where is still open.

## Why people care: the busy beaver numbers

BB(n) is the longest any n-state machine can run on a blank tape and still halt. BB(5) was found in 2024 and checked by computer: it is 47,176,870. BB(6) is already far too large to compute.

A machine like this one sets a limit on how far proofs can go. Any system that cannot settle whether this machine halts also cannot find the exact value of BB for this size. If it could, it would run the machine for that many steps and see.

For ZF, the record for the smallest such machine has dropped from 7,910 states in 2016 to 215 states in October 2026.[^wiki] This machine is smaller, but it is aimed at a different, weaker target. NF is now known to be consistent if a part of ordinary set theory is. So, if the author's proof is right, ordinary set theory can in principle prove that this machine runs forever. That means it does not beat the ZF record. It does improve on the author's own earlier 210-state machine tied to NF.

> [!warning] A brand-new claim
> The author published this result on the day this entry was written, and nobody has reviewed it independently yet. The author's own notes say:
>
> - The proofs are ordinary mathematical arguments, written in ZF, with finite certificates anyone can re-run. They are **not** a full computer-checked proof in Lean or in Peano arithmetic.
> - C₀ is **not** shown to be the same as NF.
> - The author does not claim 198 is the smallest possible.
>
> An online post announcing the machine went further, saying it is independent of NF and that BB(200) cannot be found in Peano arithmetic. Those stronger statements depend on steps that are not yet proved or formalized, so treat them as open for now.

## What you see when you run it

Nothing happens quickly. The machine moves back and forth over a small stretch of tape, slowly writing more 1s. Here is what an independent simulator recorded:

| Steps | 1s on the tape | Cells visited |
|--:|--:|--:|
| 1,000 | 16 | 38 |
| 10,000 | 37 | 81 |
| 100,000 | 120 | 259 |
| 1,000,000 | 737 | 994 |
| 10,000,000 | 2,714 | 3,644 |
| 50,000,000 | 4,201 | 7,996 |

It did not halt in the first 50 million steps. That proves nothing, though. The whole point is that no amount of running can show it never halts. The library gives it no "never halts" badge either, because none of the library's methods can prove it. If the author is right, that is exactly what you would expect.

## Reading the machine

The state names, such as `k:64`, `d:147` and `a:CD:6`, come from the author's compiler, which turns a higher-level program into Turing machine states. The machine starts in `k:64`. The only way out is the state `halt`. In the original file, `halt` is a separate outcome and is not counted as one of the 198 states, so this entry draws it as an accepting state. Reaching it would mean C₀ has a contradiction.

## Credits

The machine is by **wlad-svennik**. It is the primary table, `C0_198.tm`, from the *C₀: two 198-state Turing machines* release, which also includes a second, independently built table, a proof report and re-runnable checks.[^repo] It has been converted to this app's format without changing any transitions. The library entry and write-up are by Shreyan Chaubey.

[^godel]: This is Gödel's second incompleteness theorem (1931). It applies to any consistent system strong enough to do basic arithmetic.

[^connf]: M. R. Holmes and S. Wilshaw, "NF is Consistent", https://arxiv.org/abs/1503.01406, and the Lean project at https://leanprover-community.github.io/con-nf/.

[^repo]: wlad-svennik, *C₀: two 198-state Turing machines*, research checkpoint of 11 November 2026, https://github.com/wlad-svennik/notes/tree/main/c0-198.

[^wiki]: BusyBeaverWiki, "Logical independence", https://wiki.bbchallenge.org/wiki/Logical_independence. The 7,910-state machine is from A. Yedidia and S. Aaronson, "A Relatively Small Turing Machine Whose Behavior Is Independent of Set Theory", *Complex Systems* 25:4 (2016).
