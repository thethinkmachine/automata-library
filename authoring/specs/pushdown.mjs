// Machines with a stack, a counter, a queue or two stacks. Rules read
// `from input,pop/push to`; the push string's first symbol ends on top, and Z
// is the bottom marker the stack starts with (accept-by-final-state machines).

const count = (w, c) => [...w].filter(x => x === c).length;
const runs = w => (w.match(/(.)\1*/g) || []).map(r => [r[0], r.length]);
/** a^i b^j c^k … as [i, j, k, …] if w has exactly that shape, else null. */
const shape = (w, letters) => {
  const m = w.match(new RegExp('^' + [...letters].map(l => `(${l}*)`).join('') + '$'));
  return m ? m.slice(1).map(x => x.length) : null;
};

/** Shunting-yard: infix over x + * ( ) to postfix, or null if it is not an expression. */
function toPostfix(w) {
  const out = [], ops = [];
  let expectOperand = true;
  const prec = { '+': 1, '*': 2 };
  for (const c of w) {
    if (expectOperand) {
      if (c === 'x') { out.push('x'); expectOperand = false; }
      else if (c === '(') ops.push('(');
      else return null;
    } else if (c === '+' || c === '*') {
      while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[c]) out.push(ops.pop());
      ops.push(c); expectOperand = true;
    } else if (c === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop());
      if (!ops.length) return null;
      ops.pop();
    } else return null;
  }
  if (expectOperand) return null;
  while (ops.length) { const o = ops.pop(); if (o === '(') return null; out.push(o); }
  return out.join('');
}

export default [
  // ── deterministic pushdown automata ─────────────────────────────
  {
    type: 'DPDA',
    title: 'aⁿbⁿ', chapter: 'Sipser, Introduction to the Theory of Computation, §2.2 (as 0ⁿ1ⁿ)',
    blurb: 'The language that is not regular: no finite memory can count the a’s, and a stack can. Push one X per a, pop one per b, and accept when the bottom marker comes back into view exactly as the input runs out.',
    tags: ['canonical', 'counting', 'non-regular'], level: 'intro',
    sigma: 'ab', accept: 'start done',
    delta: `start a,Z/XZ as
            as a,X/XX as; as b,X/ε bs
            bs b,X/ε bs; bs ε,Z/Z done`,
    lang: w => { const s = shape(w, 'ab'); return !!s && s[0] === s[1]; },
    gen: n => 'a'.repeat(n) + 'b'.repeat(n)
  },
  {
    type: 'DPDA',
    title: 'A palindrome with its middle marked: wcwᴿ',
    blurb: 'When the centre is marked, a palindrome is easy for a deterministic machine: push until the c, then match each symbol against the top of the stack. Remove the c and the machine has to guess — see the NPDA that does.',
    tags: ['palindromes', 'stack-matching', 'deterministic-cfl'], level: 'intro',
    sigma: 'abc', accept: 'done',
    delta: `push a,ε/A push; push b,ε/B push; push c,ε/ε match
            match a,A/ε match; match b,B/ε match; match ε,Z/Z done`,
    lang: w => { const i = w.indexOf('c'); return i >= 0 && count(w, 'c') === 1 && w.slice(i + 1) === [...w.slice(0, i)].reverse().join(''); },
    gen: n => { const u = 'abba ab baa b'.split(' ')[n % 4].repeat(1 + (n >> 2)); return u + 'c' + [...u].reverse().join(''); }
  },
  {
    type: 'DPDA',
    title: 'As many a’s as b’s, in any order',
    blurb: 'The stack holds the surplus: A’s while a is ahead, B’s while b is. A letter either adds to the surplus or cancels one. After a cancellation the machine looks at the top to see whether it is back to even, which is the only accepting state.',
    tags: ['counting', 'balance', 'deterministic-cfl'], level: 'intermediate',
    sigma: 'ab', accept: 'even',
    delta: `even a,Z/AZ ahead; even b,Z/BZ ahead
            ahead a,A/AA ahead; ahead b,B/BB ahead
            ahead a,B/ε check; ahead b,A/ε check
            check ε,Z/Z even; check ε,A/A ahead; check ε,B/B ahead`,
    lang: w => count(w, 'a') === count(w, 'b'),
    gen: n => 'ab ba aabb abba baab bbaa'.split(' ')[n % 6].repeat(1 + (n >> 1))
  },
  {
    type: 'DPDA',
    title: 'Unary addition: aⁱbʲcⁱ⁺ʲ',
    blurb: 'Every a and every b pushes an X; every c pops one. The c’s balance exactly when there are as many of them as a’s and b’s together — addition, done by stacking.',
    tags: ['arithmetic', 'unary', 'counting'], level: 'intro',
    sigma: 'abc', accept: 'start done',
    delta: `start a,Z/XZ as; start b,Z/XZ bs
            as a,X/XX as; as b,X/XX bs; as c,X/ε cs
            bs b,X/XX bs; bs c,X/ε cs
            cs c,X/ε cs; cs ε,Z/Z done`,
    lang: w => { const s = shape(w, 'abc'); return !!s && s[2] === s[0] + s[1]; },
    gen: n => 'a'.repeat(n % 4) + 'b'.repeat(n >> 2) + 'c'.repeat((n % 4) + (n >> 2))
  },
  {
    type: 'DPDA',
    title: 'Twice as many b’s: aⁿb²ⁿ',
    blurb: 'Push two X’s for every a and pop one for every b. A change of exchange rate is all it takes — the same machine as aⁿbⁿ with a different push.',
    tags: ['counting', 'ratio', 'non-regular'], level: 'intro',
    sigma: 'ab', accept: 'start done',
    delta: `start a,Z/XXZ as
            as a,X/XXX as; as b,X/ε bs
            bs b,X/ε bs; bs ε,Z/Z done`,
    lang: w => { const s = shape(w, 'ab'); return !!s && s[1] === 2 * s[0]; },
    gen: n => 'a'.repeat(n) + 'b'.repeat(2 * n)
  },
  {
    type: 'DPDA',
    title: 'Nested counts: aⁿbᵐcᵐdⁿ',
    blurb: 'Two pairs of counts, one inside the other, like a function call inside a function call. The b’s are matched by the c’s on top of the stack while the a’s wait underneath for the d’s. Swap c and d and no stack can do it.',
    tags: ['nesting', 'counting', 'stack-matching'], level: 'intermediate',
    sigma: 'abcd', accept: 'start done',
    delta: `start a,Z/AZ as; start b,Z/BZ bs
            as a,A/AA as; as b,A/BA bs; as d,A/ε ds
            bs b,B/BB bs; bs c,B/ε cs
            cs c,B/ε cs; cs d,A/ε ds; cs ε,Z/Z done
            ds d,A/ε ds; ds ε,Z/Z done`,
    lang: w => { const s = shape(w, 'abcd'); return !!s && s[0] === s[3] && s[1] === s[2]; },
    gen: n => 'a'.repeat(n % 3) + 'b'.repeat(n >> 1) + 'c'.repeat(n >> 1) + 'd'.repeat(n % 3)
  },
  {
    type: 'DPDA',
    title: 'The syntax of an arithmetic expression',
    blurb: 'Tokens n, +, *, ( and ): is this a well-formed expression? The machine alternates between expecting an operand and expecting an operator, and the stack holds one P per open parenthesis. A parser’s first job, without the parse tree.',
    tags: ['parsing', 'expressions', 'compilers'], level: 'intermediate',
    sigma: 'n+*()', accept: 'top',
    delta: `operand n,ε/ε check; operand (,ε/P operand
            check ε,Z/Z top; check ε,P/P inner
            top +,ε/ε operand; top *,ε/ε operand
            inner +,ε/ε operand; inner *,ε/ε operand; inner ),P/ε check`,
    lang: w => /^[n+*()]*$/.test(w) && (() => { let t = w; for (let i = 0; i < 20; i++) { const u = t.replace(/\(n\)/g, 'n').replace(/n[+*]n/g, 'n'); if (u === t) break; t = u; } return t === 'n'; })(),
    tests: ['n', 'n+n*n', '(n+n)*n', '((n))', 'n*(n+(n*n))', 'n+', '(n', 'n)(n', '()', 'nn']
  },

  // ── nondeterministic pushdown automata ──────────────────────────
  {
    type: 'NPDA',
    title: 'Not a word repeated twice',
    blurb: 'The words ww form no context-free language, yet the words that are not of that form do. Odd length is easy; an even-length word fails to be ww exactly when it splits into two odd-length halves with different middle letters, and that is what the machine guesses and checks.',
    tags: ['copy-language', 'complement', 'guessing'], level: 'advanced',
    sigma: 'ab', start: 'start', accept: 'odd done',
    delta: `start ε,ε/ε even; start ε,ε/ε p
            even a,ε/ε odd; even b,ε/ε odd; odd a,ε/ε even; odd b,ε/ε even
            p a,ε/X p; p b,ε/X p
            p a,ε/ε midA; p b,ε/ε midB
            midA a,X/ε midA; midA b,X/ε midA; midA ε,Z/Z q_a
            midB a,X/ε midB; midB b,X/ε midB; midB ε,Z/Z q_b
            q_a a,ε/X q_a; q_a b,ε/X q_a; q_a b,ε/ε r
            q_b a,ε/X q_b; q_b b,ε/X q_b; q_b a,ε/ε r
            r a,X/ε r; r b,X/ε r; r ε,Z/Z done`,
    lang: w => w.length % 2 === 1 || w.slice(0, w.length / 2) !== w.slice(w.length / 2),
    maxLen: 8
  },
  {
    type: 'NPDA',
    title: 'aⁱbʲcᵏ with i = j or j = k',
    blurb: 'Either the a’s match the b’s, or the b’s match the c’s. A pushdown machine guesses which, at the start. No grammar for this language is unambiguous: aⁿbⁿcⁿ satisfies both conditions and always has two derivations.',
    tags: ['inherent-ambiguity', 'union', 'guessing'], level: 'advanced',
    sigma: 'abc', start: 'start', accept: 'done1 done2',
    delta: `start ε,ε/ε a1; start ε,ε/ε a2
            a1 a,ε/X a1; a1 ε,ε/ε b1; b1 b,X/ε b1; b1 ε,Z/Z c1; c1 c,ε/ε c1; c1 ε,ε/ε done1
            a2 a,ε/ε a2; a2 ε,ε/ε b2; b2 b,ε/X b2; b2 ε,ε/ε c2; c2 c,X/ε c2; c2 ε,Z/Z done2`,
    lang: w => { const s = shape(w, 'abc'); return !!s && (s[0] === s[1] || s[1] === s[2]); },
    gen: n => 'a'.repeat(n % 4) + 'b'.repeat(n % 4) + 'c'.repeat(n >> 2)
  },
  {
    type: 'NPDA',
    title: 'Between n and 2n b’s: aⁿbᵐ, n ≤ m ≤ 2n',
    blurb: 'For each a the machine pushes one X or two — its guess about how many b’s that a will pay for. Some sequence of guesses balances exactly when m lies between n and 2n.',
    tags: ['guessing', 'counting', 'ranges'], level: 'intermediate',
    sigma: 'ab', accept: 'done',
    delta: `as a,ε/X as; as a,ε/XX as; as ε,Z/Z done
            as b,X/ε bs; bs b,X/ε bs; bs ε,Z/Z done`,
    lang: w => { const s = shape(w, 'ab'); return !!s && s[0] <= s[1] && s[1] <= 2 * s[0]; },
    gen: n => 'a'.repeat(n >> 1) + 'b'.repeat((n >> 1) + (n % ((n >> 1) + 1)))
  },
  {
    type: 'NPDA',
    title: 'aⁿbⁿ or aⁿb²ⁿ',
    blurb: 'Each half is deterministic, but their union is not: having read aⁿbⁿ, a deterministic machine cannot both accept and keep counting for the other n b’s. Nondeterminism postpones the choice — the standard proof that DPDAs are weaker than NPDAs.',
    tags: ['union', 'deterministic-vs-nondeterministic', 'guessing'], level: 'advanced',
    sigma: 'ab', start: 'start', accept: 'done',
    delta: `start ε,ε/ε one; start ε,ε/ε two
            one a,ε/X one; one b,X/ε ob; ob b,X/ε ob; ob ε,Z/Z done
            two a,ε/XX two; two b,X/ε tb; tb b,X/ε tb; tb ε,Z/Z done
            start ε,Z/Z done`,
    lang: w => { const s = shape(w, 'ab'); return !!s && (s[1] === s[0] || s[1] === 2 * s[0]); },
    gen: n => 'a'.repeat(n >> 1) + 'b'.repeat((n >> 1) * (1 + (n % 2)))
  },

  // ── counter automata ────────────────────────────────────────────
  {
    type: 'Counter',
    title: 'A valid expression in reverse Polish notation',
    blurb: 'n pushes an operand; o, a binary operator, takes two and leaves one. The counter is the depth of the evaluation stack: an operator needs at least two, and a valid expression ends with exactly one. A calculator’s stack, reduced to its height.',
    tags: ['rpn', 'expressions', 'stack-depth'], level: 'intermediate',
    sigma: 'no', accept: 'done',
    delta: `s n,ε/1 s
            s o,1/ε need; need ε,1/1 s
            s ε,1/ε last; last ε,Z/Z done`,
    lang: w => { let d = 0; for (const c of w) { if (c === 'n') d++; else { if (d < 2) return false; d--; } } return d === 1; },
    tests: ['n', 'nno', 'nnono', 'nnnoo', 'nonn', 'nn', 'o', 'nnooo']
  },
  {
    type: 'Counter',
    title: 'aⁿbᵐ with n ≠ m',
    blurb: 'Count the a’s up, the b’s down, and accept if the count does not end at zero — either b’s are left over, which the machine notices when it runs out, or a’s are, which it notices at the end. The complement of aⁿbⁿ within a*b*, with the same single counter.',
    tags: ['counting', 'complement', 'one-counter'], level: 'intro',
    sigma: 'ab', accept: 'more_a more_b',
    delta: `as a,ε/1 as; as b,1/ε bs; as ε,1/1 more_a
            bs b,1/ε bs; bs ε,1/1 more_a
            bs b,Z/Z more_b; as b,Z/Z more_b; more_b b,Z/Z more_b`,
    lang: w => { const s = shape(w, 'ab'); return !!s && s[0] !== s[1]; },
    gen: n => 'a'.repeat(n % 5) + 'b'.repeat(n >> 1)
  },

  // ── queue automata ──────────────────────────────────────────────
  {
    type: 'QA',
    title: 'aⁿbⁿcⁿ with a queue',
    blurb: 'Each a joins the queue as A. Each b takes an A from the front and sends a B to the back; each c takes a B. The queue processes the counts in the order they arrive, which is exactly what aⁿbⁿcⁿ needs and what a stack gets backwards.',
    tags: ['queues', 'counting', 'beyond-context-free'], level: 'intermediate',
    sigma: 'abc', byEmptyStack: true,
    delta: `as a,ε/A as; as b,A/B bs
            bs b,A/B bs; bs c,B/ε cs
            cs c,B/ε cs`,
    lang: w => { const s = shape(w, 'abc'); return !!s && s[0] === s[1] && s[1] === s[2]; },
    gen: n => 'a'.repeat(n) + 'b'.repeat(n) + 'c'.repeat(n)
  },
  {
    type: 'QA',
    title: 'Is v a rotation of w? w#v',
    blurb: 'Enqueue w, then rotate: take the front symbol and put it at the back, as many times as the machine likes. Then check that v is what the queue holds. abc has rotations abc, bca and cab — a stack cannot rotate, a queue does it in one move.',
    tags: ['queues', 'rotation', 'guessing'], level: 'advanced',
    // Z starts in the queue; sent to the back at the #, it marks where w ends.
    sigma: 'ab#', accept: 'done',
    delta: `load a,ε/A load; load b,ε/B load; load #,Z/Z spin
            spin ε,A/A spin; spin ε,B/B spin; spin ε,ε/ε check
            check a,A/ε check; check b,B/ε check; check ε,Z/Z wrap
            wrap a,A/ε wrap; wrap b,B/ε wrap; wrap ε,Z/Z done`,
    lang: w => { const p = w.split('#'); if (p.length !== 2 || p[0].length !== p[1].length) return false; return p[0] === '' ? p[1] === '' : (p[0] + p[0]).includes(p[1]); },
    gen: n => { const u = 'ab aab abb abab'.split(' ')[n % 4]; const k = n % u.length; return u + '#' + u.slice(k) + u.slice(0, k); },
    maxLen: 9,
    extra: ['#']
  },
  {
    type: 'QA',
    title: 'Three copies: w#w#w',
    blurb: 'A queue can check a copy without losing it: while matching the second w, each symbol taken from the front is sent straight to the back again, ready for the third. A stack would have to give up what it compares.',
    tags: ['queues', 'copy-language', 'beyond-context-free'], level: 'intermediate',
    // Z starts in the queue and always sits just behind the copy of w.
    sigma: 'ab#', accept: 'done',
    delta: `load a,ε/A load; load b,ε/B load; load #,Z/Z copy
            copy a,A/A copy; copy b,B/B copy; copy #,Z/Z last
            last a,A/ε last; last b,B/ε last; last ε,Z/Z done`,
    lang: w => { const p = w.split('#'); return p.length === 3 && p[0] === p[1] && p[1] === p[2]; },
    gen: n => { const u = ['', 'a', 'ab', 'bba', 'abab'][n % 5]; return `${u}#${u}#${u}`; },
    maxLen: 8
  },

  // ── two stacks ──────────────────────────────────────────────────
  {
    type: '2PDA',
    title: 'Two stacks make a queue: w#w',
    blurb: 'One stack reverses, so two stacks reverse twice: push w on the first, pour it onto the second, and the second now holds w in reading order, ready to match the copy. The trick behind “two stacks are as strong as a Turing machine”.',
    tags: ['two-stacks', 'copy-language', 'simulation'], level: 'intermediate',
    sigma: 'ab#', accept: 'done',
    delta: `load a,ε/A,ε/ε load; load b,ε/B,ε/ε load; load #,ε/ε,ε/ε pour
            pour ε,A/ε,ε/A pour; pour ε,B/ε,ε/B pour; pour ε,Z/Z,ε/ε match
            match a,ε/ε,A/ε match; match b,ε/ε,B/ε match; match ε,ε/ε,Z/Z done`,
    lang: w => { const p = w.split('#'); return p.length === 2 && p[0] === p[1]; },
    gen: n => { const u = ['', 'a', 'ab', 'bba', 'abab', 'babba'][n % 6]; return `${u}#${u}`; }
  },

  // ── pushdown transducers ────────────────────────────────────────
  {
    type: 'PDT',
    title: 'Infix to postfix: the shunting-yard algorithm',
    blurb: 'Dijkstra’s shunting-yard algorithm as a pushdown transducer. Operands go straight to the output; operators wait on the stack until one of lower precedence, a closing parenthesis or the end of input sends them out. x+x*x becomes xxx*+, (x+x)*x becomes xx+x*.',
    tags: ['compilers', 'shunting-yard', 'expressions'], level: 'advanced',
    sigma: 'x+*()', accepting: true, outAlpha: 'x+*', accept: 'done',
    delta: `operand x,ε/ε:x after; operand (,ε/P:ε operand
            after +,ε/ε:ε plus; after *,ε/ε:ε times; after ),ε/ε:ε close; after ε,ε/ε:ε flush
            plus ε,+/ε:+ plus; plus ε,*/ε:* plus; plus ε,P/+P:ε operand; plus ε,Z/+Z:ε operand
            times ε,*/ε:* times; times ε,+/*+:ε operand; times ε,P/*P:ε operand; times ε,Z/*Z:ε operand
            close ε,+/ε:+ close; close ε,*/ε:* close; close ε,P/ε:ε after
            flush ε,+/ε:+ flush; flush ε,*/ε:* flush; flush ε,Z/Z:ε done`,
    out: toPostfix,
    tests: ['x', 'x+x', 'x+x*x', 'x*x+x', '(x+x)*x', 'x*(x+x*x)', 'x+', '(x'],
    maxLen: 6
  },
  {
    type: 'PDT',
    title: 'Reverse every word',
    blurb: 'Letters are pushed as they arrive; a space, written _, pops the word back out reversed and then prints the space. “ab_cde” becomes “ba_edc”: a stack reverses, and a separator says when.',
    tags: ['reversal', 'text-processing', 'stack'], level: 'intro',
    sigma: 'ab_', accepting: true, outAlpha: 'ab_', accept: 'done',
    delta: `read a,ε/A:ε read; read b,ε/B:ε read
            read _,ε/ε:ε space; read ε,ε/ε:ε end
            space ε,A/ε:a space; space ε,B/ε:b space; space ε,Z/Z:_ read
            end ε,A/ε:a end; end ε,B/ε:b end; end ε,Z/Z:ε done`,
    out: w => w.split('_').map(x => [...x].reverse().join('')).join('_'),
    maxLen: 7
  }
];
