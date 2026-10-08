// Turing machines. Rules read `from reads/write,move to`: `a,b/=,R` writes back
// whatever it read, `_` is the blank. A machine that computes something says
// what it leaves on the tape (`tape`), and the generator checks that too.

const shape = (w, letters) => {
  const m = w.match(new RegExp('^' + [...letters].map(l => `(${l}*)`).join('') + '$'));
  return m ? m.slice(1).map(x => x.length) : null;
};
const balanced = w => { let d = 0; for (const c of w) { d += c === '(' ? 1 : -1; if (d < 0) return false; } return d === 0; };

export default [
  // ── one-way tape: computing ─────────────────────────────────────
  {
    type: 'TM',
    title: 'Unary addition',
    blurb: 'm ones, a plus sign, n ones: turn the + into a 1 and erase the last 1. The tape then holds m + n ones — addition in unary is a two-symbol edit, which is why the first machines in every course use it.',
    tags: ['arithmetic', 'unary', 'computing-a-function'], level: 'intro',
    sigma: '1+', accept: 'done',
    delta: `scan 1/=,R scan; scan +/1,R right
            right 1/=,R right; right _/_,L erase
            erase 1/_,S done`,
    lang: w => /^1*\+1*$/.test(w),
    tape: w => '1'.repeat(w.length - 1),
    gen: n => '1'.repeat(n % 5) + '+' + '1'.repeat(n >> 2)
  },
  {
    type: 'TM',
    title: 'Unary multiplication',
    blurb: 'Input 1ᵐ*1ⁿ; output 1ᵐ*1ⁿ#1ᵐⁿ. For each 1 of the first number the machine copies the whole second number to the end of the tape, one 1 per trip, marking what it has used with X and Y and restoring them afterwards. Multiplication as repeated addition, at walking pace.',
    tags: ['arithmetic', 'unary', 'computing-a-function', 'markers'], level: 'intermediate',
    sigma: '1*', accept: 'done',
    delta: `start 1/X,R toStar; start */=,R zero
            zero 1/=,R zero; zero _/#,S done
            toStar 1/=,R toStar; toStar */=,R pick
            pick Y/=,R pick; pick 1/Y,R toEnd; pick #/=,L restore; pick _/#,L restore
            toEnd 1/=,R toEnd; toEnd #/=,R toOut; toEnd _/#,R toOut
            toOut 1/=,R toOut; toOut _/1,L back
            back 1,#/=,L back; back Y/=,R pick
            restore Y/1,L restore; restore */=,L nextX
            nextX 1/=,L nextX; nextX X/=,R startNext
            startNext 1/X,R toStar; startNext */=,L unmark
            unmark X/1,L unmark; unmark 1/=,S done`,
    lang: w => /^1*\*1*$/.test(w),
    tape: w => { const [m, n] = w.split('*').map(x => x.length); return w + '#' + '1'.repeat(m * n); },
    gen: n => '1'.repeat(n % 4) + '*' + '1'.repeat(n >> 2),
    maxLen: 7
  },
  {
    type: 'TM',
    title: 'Copy a string: w ↦ w#w',
    blurb: 'Each symbol of w is marked as copied (a becomes X, b becomes Y), carried to the end of the tape and written there; the separator is laid down by the first trip. At the end the marks are turned back into letters. Every copy costs a round trip, so the whole job takes time proportional to n².',
    tags: ['copying', 'computing-a-function', 'markers'], level: 'intermediate',
    sigma: 'ab', accept: 'done',
    delta: `next a/X,R carryA; next b/Y,R carryB; next #/=,L unmark; next _/#,S done
            carryA a,b/=,R carryA; carryA #/=,R pastA; carryA _/#,R putA
            pastA a,b/=,R pastA; pastA _/a,L home; putA _/a,L home
            carryB a,b/=,R carryB; carryB #/=,R pastB; carryB _/#,R putB
            pastB a,b/=,R pastB; pastB _/b,L home; putB _/b,L home
            home a,b,#/=,L home; home X,Y/=,R next
            unmark X/a,L unmark; unmark Y/b,L unmark; unmark a,b/=,S done`,
    lang: w => /^[ab]*$/.test(w),
    tape: w => `${w}#${w}`
  },
  {
    type: 'TM',
    title: 'Reverse a string',
    blurb: 'Take the last symbol of w, erase it, and write it after a # at the far end; repeat until w is gone, then remove the #. The first symbol is marked at the start (A or B) so the machine can tell when it is copying the last one — a one-way tape has no other way to know where its left end is.',
    tags: ['reversal', 'computing-a-function', 'left-end-marker'], level: 'intermediate',
    sigma: 'ab', accept: 'done',
    delta: `start a/A,R toEnd; start b/B,R toEnd; start _/=,S done
            toEnd a,b/=,R toEnd; toEnd _/#,L take
            take a/_,R goA; take b/_,R goB; take A/_,R lastA; take B/_,R lastB; take _/=,L take
            goA _/=,R goA; goA #/=,R outA; outA a,b/=,R outA; outA _/a,L ret
            goB _/=,R goB; goB #/=,R outB; outB a,b/=,R outB; outB _/b,L ret
            ret a,b/=,L ret; ret #/=,L take
            lastA _/=,R lastA; lastA #/=,R endA; endA a,b/=,R endA; endA _/a,L fin
            lastB _/=,R lastB; lastB #/=,R endB; endB a,b/=,R endB; endB _/b,L fin
            fin a,b/=,L fin; fin #/_,S done`,
    lang: w => /^[ab]*$/.test(w),
    tape: w => [...w].reverse().join('')
  },
  {
    type: 'TM',
    title: 'Sort the 0s before the 1s',
    blurb: 'Whenever a 0 follows a 1, the two swap, and the 0 keeps moving left while there is a 1 in front of it — insertion sort, one cell at a time. Each 0 walks past every 1 to its left, so the machine takes about as many steps as there are out-of-order pairs.',
    tags: ['sorting', 'computing-a-function', 'insertion-sort'], level: 'intermediate',
    sigma: '01', accept: 'done',
    delta: `scan 0/=,R scan; scan 1/=,R seen1; scan _/=,S done
            seen1 1/=,R seen1; seen1 0/1,L put0; seen1 _/=,S done
            put0 1/0,L check
            check 1/0,R fix; check 0/=,R scan
            fix 0/1,L stepL
            stepL 0/=,L check`,
    lang: w => /^[01]*$/.test(w),
    tape: w => [...w].sort().join('')
  },

  // ── one-way tape: deciding ──────────────────────────────────────
  {
    type: 'TM',
    title: 'Two equal halves: w#w', chapter: 'Sipser, Introduction to the Theory of Computation, §3.1 (M1)',
    blurb: 'The first machine in Sipser’s chapter on Turing machines. Cross off the first symbol, remember it in the state, cross off its partner after the #, and come back; repeat until the left half is gone. Everything is checked with nothing but a pencil and a lot of walking.',
    tags: ['copy-language', 'zigzag', 'sipser'], level: 'intro',
    sigma: '01#', accept: 'acc',
    delta: `q1 0/x,R q2; q1 1/x,R q3; q1 #/=,R q8
            q2 0,1/=,R q2; q2 #/=,R q4
            q3 0,1/=,R q3; q3 #/=,R q5
            q4 x/=,R q4; q4 0/x,L q6
            q5 x/=,R q5; q5 1/x,L q6
            q6 0,1,x/=,L q6; q6 #/=,L q7
            q7 0,1/=,L q7; q7 x/=,R q1
            q8 x/=,R q8; q8 _/=,R acc`,
    lang: w => { const p = w.split('#'); return p.length === 2 && p[0] === p[1]; },
    gen: n => { const u = ['', '0', '01', '110', '0101', '10011'][n % 6]; return `${u}#${u}`; }
  },
  {
    type: 'TM',
    title: 'Palindromes on one tape',
    blurb: 'Erase the first symbol, remember it, run to the far end and erase the last symbol if it matches; repeat from the new first symbol. About n²/2 steps for a word of length n — and no one-tape machine can do fundamentally better, which is what the two-tape palindrome machine is for.',
    tags: ['palindromes', 'zigzag', 'time-complexity'], level: 'intro',
    sigma: 'ab', accept: 'acc',
    delta: `first a/_,R runA; first b/_,R runB; first _/=,S acc
            runA a,b/=,R runA; runA _/=,L lastA
            runB a,b/=,R runB; runB _/=,L lastB
            lastA a/_,L back; lastA _/=,S acc
            lastB b/_,L back; lastB _/=,S acc
            back a,b/=,L back; back _/=,R first`,
    lang: w => w === [...w].reverse().join(''),
    gen: n => { const u = ['ab', 'abb', 'b', 'aab'][n % 4].repeat(1 + (n >> 2)); return u + (n % 2 ? 'a' : '') + [...u].reverse().join(''); }
  },
  {
    type: 'TM',
    title: 'Balanced parentheses without a stack',
    blurb: 'Find the first ), cross it off, walk left to the nearest ( that is still open and cross that off too. When no ) is left, there must be no ( either. The leftmost ( is marked A at the start so the machine can tell when its walk left has run out of room.',
    tags: ['parentheses', 'crossing-off', 'left-end-marker'], level: 'intermediate',
    sigma: '()', accept: 'acc',
    delta: `start (/A,R scan; start _/=,S acc
            scan (,X/=,R scan; scan )/X,L open; scan _/=,L check
            open X/=,L open; open (/X,R scan; open A/B,R scan
            check X/=,L check; check B/=,S acc`,
    lang: balanced,
    gen: n => ['()', '(())', '()()', '(()())'][n % 4].repeat(1 + (n >> 2))
  },
  {
    type: 'TM',
    title: 'Multiplication checked: aⁱbʲcᵏ with k = i·j', chapter: 'Sipser, Introduction to the Theory of Computation, §3.1 (M3)',
    blurb: 'Sipser’s third example. After checking the shape a⁺b⁺c⁺, the machine takes the a’s one at a time; for each, it crosses off one c per b, marking the b’s and then restoring them. The c’s run out exactly when k = i·j.',
    tags: ['multiplication', 'crossing-off', 'sipser'], level: 'advanced',
    sigma: 'abc', accept: 'acc',
    delta: `f0 a/A,R f1
            f1 a/=,R f1; f1 b/=,R f2
            f2 b/=,R f2; f2 c/=,R f3
            f3 c/=,R f3; f3 _/=,L rw
            rw a,b,c/=,L rw; rw A/=,S pa
            pa a,A/x,R gb
            gb a/=,R gb; gb b/y,R gc
            gc b,z/=,R gc; gc c/z,L bk
            bk z,b/=,L bk; bk y/=,R nb
            nb b/y,R gc; nb z/=,L restore
            restore y/b,L restore; restore a/=,L na; restore x/=,R fin
            na a/=,L na; na x/=,R pa
            fin b,z/=,R fin; fin _/=,S acc`,
    lang: w => { const s = shape(w, 'abc'); return !!s && s[0] > 0 && s[1] > 0 && s[2] === s[0] * s[1]; },
    gen: n => { const i = 1 + (n % 3), j = 1 + (n >> 3) % 3; return 'a'.repeat(i) + 'b'.repeat(j) + 'c'.repeat(i * j + (n % 2 ? 0 : (n % 4 ? 1 : -1))); },
    maxLen: 8
  },

  // ── two-way infinite tape ───────────────────────────────────────
  {
    type: 'ITM',
    title: 'Binary increment',
    blurb: 'Run to the right end of the number, then add 1 the way it is done by hand: 1s turn to 0s while the carry moves left, and the first 0 — or the blank beyond the number — becomes a 1. On a two-way tape the number can grow to the left, so 111 becomes 1000 without moving anything.',
    tags: ['binary-numbers', 'arithmetic', 'carry'], level: 'intro',
    sigma: '01', accept: 'done',
    delta: `right 0,1/=,R right; right _/=,L carry
            carry 1/0,L carry; carry 0/1,S done; carry _/1,S done`,
    lang: w => /^[01]*$/.test(w),
    tape: w => (BigInt('0b' + (w || '0')) + 1n).toString(2).padStart(w.length, '0'),
    label: w => (w ? `${parseInt(w, 2)} + 1` : '0 + 1')
  },
  {
    type: 'ITM',
    title: 'Counting to n in binary',
    blurb: 'Input aⁿ; output n in binary. Erase the last a, walk left past the rest to a binary counter growing leftwards from the input, add 1 to it, and walk back. When the a’s are gone, the counter is the answer: unary to binary in O(n²) steps, and the tape ends up exponentially shorter.',
    tags: ['binary-numbers', 'counting', 'unary', 'number-bases'], level: 'intermediate',
    sigma: 'a', accept: 'done',
    delta: `toEnd 0,1,a/=,R toEnd; toEnd _/=,L take
            take a/_,L back; take 0,1/=,S done; take _/0,S done
            back a/=,L back; back 0/1,R toEnd; back 1/0,L inc; back _/1,R toEnd
            inc 1/0,L inc; inc 0/1,R toEnd; inc _/1,R toEnd`,
    lang: w => /^a*$/.test(w),
    tape: w => w.length.toString(2),
    maxLen: 20
  },

  // ── linear bounded automata ─────────────────────────────────────
  {
    type: 'LBA',
    title: 'aⁿbⁿcⁿ in the space of its input',
    blurb: 'The standard context-sensitive language, decided without a single extra cell: check the shape a*b*c*, then cross off one a, one b and one c per pass. A linear bounded automaton is exactly this — a Turing machine that may not leave its input.',
    tags: ['context-sensitive', 'crossing-off', 'canonical'], level: 'intro',
    sigma: 'abc', accept: 'acc',
    delta: `f0 </=,R f1
            f1 a/=,R f1; f1 b/=,R f2; f1 c/=,R f3; f1 >/=,L rw
            f2 b/=,R f2; f2 c/=,R f3; f2 >/=,L rw
            f3 c/=,R f3; f3 >/=,L rw
            rw a,b,c/=,L rw; rw </=,R round
            round x/=,R round; round a/x,R findB; round y/=,R tail; round >/=,S acc
            findB a,y/=,R findB; findB b/y,R findC
            findC b,z/=,R findC; findC c/z,L ret
            ret a,b,c,x,y,z/=,L ret; ret </=,R round
            tail y,z/=,R tail; tail >/=,S acc`,
    lang: w => { const s = shape(w, 'abc'); return !!s && s[0] === s[1] && s[1] === s[2]; },
    gen: n => 'a'.repeat(n) + 'b'.repeat(n) + 'c'.repeat(n)
  },
  {
    type: 'LBA',
    title: 'A word repeated twice: ww',
    blurb: 'Without a separator the machine must find the middle itself: it capitalises letters alternately from the left and from the right until the two ends meet. Then it compares the halves letter by letter. An odd-length word is caught when the ends cross.',
    tags: ['copy-language', 'context-sensitive', 'finding-the-middle'], level: 'advanced',
    sigma: 'ab', accept: 'acc',
    delta: `m0 </=,R mL
            mL A,B/=,R mL; mL a/A,R toR; mL b/B,R toR; mL P,Q/=,L rew; mL >/=,S acc
            toR a,b/=,R toR; toR P,Q,>/=,L atR
            atR a/P,L back; atR b/Q,L back
            back a,b/=,L back; back A,B/=,R mL
            rew P,Q,A,B,x,y/=,L rew; rew </=,R c0
            c0 x/=,R c0; c0 A/x,R ga; c0 B/x,R gb; c0 y/=,S acc
            ga A,B,y/=,R ga; ga P/y,L rew
            gb A,B,y/=,R gb; gb Q/y,L rew`,
    lang: w => w.length % 2 === 0 && w.slice(0, w.length / 2) === w.slice(w.length / 2),
    gen: n => { const u = ['a', 'ab', 'bba', 'abab', 'babb'][n % 5]; return u + u; }
  },

  // ── nondeterministic ────────────────────────────────────────────
  {
    type: 'NDTM',
    title: 'Subset sum, by guessing',
    blurb: 'Input: a target t and some items, all in unary, separated by # — 111#1#11 asks whether some of 1 and 2 add up to 3. At each item the machine guesses: skip it (marking its 1s n) or take it, crossing one 1 off the target for each of its 1s. Some branch empties the target exactly when a subset fits.',
    tags: ['np', 'guessing', 'subset-sum'], level: 'advanced',
    sigma: '1#', accept: 'acc',
    delta: `init 1/T,R conv; init #/H,R item; init _/=,S acc
            conv 1/t,R conv; conv #/=,R item; conv _/=,L final
            item 1/n,R skip; item 1/C,L take; item #/=,R item; item _/=,L final
            skip 1/n,R skip; skip #/=,R item; skip _/=,L final
            take C,#,Y,n,x/=,L take; take t/x,R ret; take T/X,R ret
            ret x,t,X,T,H,#,Y,n/=,R ret; ret C/=,R inC
            inC C/=,R inC; inC 1/C,L take; inC #,_/=,L done
            done C/Y,L done; done #/=,R next
            next Y/=,R next; next #/=,R item; next _/=,L final
            final Y,n,#,x/=,L final; final X,H/=,S acc`,
    lang: w => {
      if (!/^1*(#1*)*$/.test(w)) return false;
      const [t, ...items] = w.split('#').map(x => x.length);
      const sums = new Set([0]);
      for (const a of items) for (const s of [...sums]) sums.add(s + a);
      return sums.has(t);
    },
    tests: ['111#1#11', '11#111#1#1', '111#11#11', '1#11', '#1', '1111#11#1#11', '11111#11#11'],
    maxLen: 7
  },

  // ── several tapes ───────────────────────────────────────────────
  {
    type: 'MTM',
    title: 'Searching for a pattern: p#t',
    blurb: 'Does p occur in t? Tape 2 gets a copy of p. Then, for each starting point in t, the two heads compare side by side; on a mismatch both walk back together and the text head moves on by one. The naive string-search algorithm, with a second tape as the pattern buffer.',
    tags: ['string-search', 'multi-tape', 'pattern-matching'], level: 'intermediate',
    sigma: 'ab#', accept: 'acc',
    delta: `c0 a,_/=,>/S,R copy; c0 b,_/=,>/S,R copy; c0 #,_/=,>/S,R copy
            copy a,_/=,a/R,R copy; copy b,_/=,b/R,R copy; copy #,_/=,_/R,L rew
            rew Σ,a/=,=/S,L rew; rew Σ,b/=,=/S,L rew; rew Σ,>/=,=/S,R cmp
            cmp a,a/=,=/R,R cmp; cmp b,b/=,=/R,R cmp; cmp Σ,_/=,=/S,S acc
            cmp a,b/=,=/S,S back; cmp b,a/=,=/S,S back; cmp #,a/=,=/S,S back; cmp #,b/=,=/S,S back
            back Σ,a/=,=/L,L back; back Σ,b/=,=/L,L back; back Σ,>/=,=/R,R step
            step Σ,Σ/=,=/R,S cmp`,
    lang: w => { const i = w.indexOf('#'); return i >= 0 && w.slice(i + 1).includes(w.slice(0, i)); },
    tests: ['ab#aab', 'b#aaab', '#ab', 'aba#babab', 'ab#bba', 'bb#abab', 'ab'],
    maxLen: 7
  }
];
