The first phase of every compiler, and every form that checks what was typed into it, is a finite automaton. A lexer reads characters and groups them into tokens — identifiers, numbers, strings, comments — and each kind of token is a regular language. Tools like lex and its descendants take the regular expressions, build an NFA by Thompson's construction, determinise it, and emit the DFA as a table. The machines in this collection are those DFAs, one token or one format at a time.

## Character classes

A real lexer reads bytes, but its DFA's edges are almost always labelled with *classes* of bytes: any letter, any digit, anything but a quote. The machines here use one symbol per class — a for a letter, 0 or d for a digit — which keeps the diagrams readable without changing their shape. [An identifier](lib:finite/dfa/an-identifier) is the simplest: a letter or underscore, then letters, digits and underscores.

## Numbers

[A number in scientific notation](lib:finite/dfa/a-number-in-scientific-notation) is a chain of optional parts, each a fork in the DFA that rejoins the main path. [A C integer literal](lib:finite/dfa/a-c-integer-literal-decimal-octal-or-hex) shows a lexer committing on its first character: a leading 0 means octal, 0x hexadecimal, anything else decimal — which is why 08 is an error in C.

## Escapes and nesting that is not nesting

[A string literal](lib:finite/dfa/a-string-literal-with-escapes) needs one extra state: after a backslash, any character is ordinary. [A C comment](lib:finite/dfa/a-c-comment) is the classic trap — after a `*`, a `/` ends the comment, but another `*` keeps the possibility open. Comments in C do not nest, so a finite automaton suffices; languages whose comments do nest need a counter, and their lexers are no longer finite automata.

## Validating what people type

[A 24-hour time](lib:finite/dfa/a-24-hour-clock-time-hh-mm), [an ISO date](lib:finite/dfa/an-iso-date-yyyy-mm-dd), [an IPv4 octet](lib:finite/dfa/a-byte-in-decimal-0-to-255) and [a whole IPv4 address](lib:finite/dfa/a-full-ipv4-address), [Roman numerals](lib:finite/dfa/roman-numerals-from-i-to-mmmcmxcix) — each is a small machine whose subtle states are the prefixes that constrain what may follow. A 2 at the start of an hour allows only 0–3 next; 25 at the start of an octet allows only 0–5. A date validator stops short of February 29th: knowing whether the 29th exists would mean tracking the month *and* the year mod 4 at once, which is still finite but no longer small.

> [!tip] Try this
> In each machine, find the states with fewer outgoing edges than the others. Those are the places where the format constrains the next character — the whole specification, read off the diagram.

## One step past regular

[The syntax of an arithmetic expression](lib:memory/pda/the-syntax-of-an-arithmetic-expression) is where lexing ends and parsing begins: parentheses nest to any depth, so the machine needs a stack. Lexers are finite automata because tokens do not nest; parsers are pushdown automata because programs do.
