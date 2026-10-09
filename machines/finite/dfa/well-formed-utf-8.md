UTF-8 is how almost all text on the web is stored. It writes each character as one to four bytes, and its design makes those bytes easy to check with a very small automaton. This machine is that check, at the level of byte classes.

## The encoding

Every byte belongs to one of a few classes, told apart by its leading bits:

| Byte | Bits | Meaning | Symbol here |
| --- | --- | --- | :-: |
| ASCII | 0xxxxxxx | a whole character | a |
| continuation | 10xxxxxx | the middle or end of a character | c |
| two-byte lead | 110xxxxx | starts a character of 2 bytes | 2 |
| three-byte lead | 1110xxxx | starts a character of 3 bytes | 3 |
| four-byte lead | 11110xxx | starts a character of 4 bytes | 4 |

A lead byte announces how many continuation bytes follow, and the DFA's state is just the number still owed — 0, 1, 2 or 3. A continuation byte when none is owed, or anything else when one is, has no edge.

::: diagram
The whole decoder: count down the continuation bytes a lead byte promised.
:::

## Why it was designed this way

Ken Thompson designed UTF-8 with Rob Pike in September 1992, famously sketching it on a placemat in a New Jersey diner. Its properties are visible in the machine:

- **ASCII is unchanged.** The ASCII edge is a self-loop on the accepting state, so a plain-ASCII file is valid UTF-8 as it stands.
- **It is self-synchronising.** Continuation bytes can never be mistaken for the start of a character, so a reader dropped into the middle of a text can skip forward to the next non-continuation byte and resume — a property older multi-byte encodings lacked.
- **Errors are local.** A corrupt byte breaks one character, not the rest of the text.

> [!warning] What this machine leaves out
> Real validators also reject *overlong* encodings (writing a character in more bytes than needed), the surrogate range and values above U+10FFFF. Those rules depend on the exact bit values of the first continuation byte, so a full validator splits some of these classes and has a few more states. Björn Höhrmann's well-known decoder is a DFA of that kind, run as a lookup table.
