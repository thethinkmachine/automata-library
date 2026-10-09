// Another mixed batch.

const balanced = w => { let d = 0; for (const c of w) { d += c === '(' ? 1 : -1; if (d < 0) return false; } return d === 0; };

export default [
  {
    type: 'NPDA',
    title: 'Every palindrome, odd or even',
    blurb: 'A palindrome reads the same backwards. Push the first half, guess where the middle is — either between two letters or on a letter that has no partner — and pop the second half against the first. One guess too many letters early or late and the stack does not empty at the end.',
    tags: ['palindromes', 'guessing', 'canonical'], level: 'intro',
    sigma: 'ab', start: 'push', accept: 'done',
    delta: `push a,ε/A push; push b,ε/B push
            push ε,ε/ε pop; push a,ε/ε pop; push b,ε/ε pop
            pop a,A/ε pop; pop b,B/ε pop; pop ε,Z/Z done`,
    lang: w => w === [...w].reverse().join(''),
    gen: n => { const u = ['ab', 'abb', 'b', 'aab'][n % 4].repeat(1 + (n >> 2)); return u + ['', 'a', 'b'][n % 3] + [...u].reverse().join(''); }
  },
  {
    type: 'DPDA',
    title: 'Unbalanced parentheses',
    blurb: 'Deterministic context-free languages are closed under complement — unlike context-free languages in general — and this is what that looks like. Run the bracket checker; if a ) ever finds nothing to match, or the input ends with a ( still open, accept instead of reject.',
    tags: ['complement', 'parentheses', 'closure-properties'], level: 'intermediate',
    sigma: '()', start: 'even', accept: 'open broken',
    delta: `even (,Z/PZ open; even ),Z/Z broken
            open (,P/PP open; open ),P/ε check
            check ε,P/P open; check ε,Z/Z even
            broken (,ε/ε broken; broken ),ε/ε broken`,
    lang: w => !balanced(w),
    gen: n => ['(()', '())', ')(', '(()))'][n % 4].repeat(1 + (n >> 2))
  },
  {
    type: 'Counter',
    title: 'The account goes overdrawn',
    blurb: 'Deposits + and withdrawals −: accept if the balance is negative at some moment, whatever happens afterwards. The counter holds the balance; the first withdrawal it cannot cover moves the machine to a state that accepts everything. It is not the complement of “never overdrawn”: a history that stays in credit without ending at zero belongs to neither.',
    tags: ['one-counter', 'safety', 'banking'], level: 'intro',
    sigma: '+-', start: 'ok', accept: 'over',
    delta: `ok +,ε/1 ok; ok -,1/ε ok; ok -,Z/Z over
            over +,ε/ε over; over -,ε/ε over`,
    lang: w => { let b = 0; for (const c of w) { b += c === '+' ? 1 : -1; if (b < 0) return true; } return false; }
  },
  {
    type: 'Moore',
    title: 'A garage door with a safety sensor',
    blurb: 'One button b and two sensors: t when the door reaches the top or bottom, o when something blocks it. Pressing the button starts the door moving or stops it; reaching an end stops it; and an obstacle while closing sends it back up — the rule that keeps the door from closing on anyone. The output is what the door is doing.',
    tags: ['control', 'safety', 'embedded-systems'], level: 'intermediate',
    sigma: 'bto', start: 'closed', stateOut: { closed: 'C', opening: 'O', open: 'C', closing: 'D', stopped: 'S' },
    delta: `closed b opening; closed t,o closed
            opening b stopped; opening t open; opening o opening
            open b closing; open t,o open
            closing b stopped; closing t closed; closing o opening
            stopped b closing; stopped t,o stopped`,
    out: w => { const T = { closed: { b: 'opening', t: 'closed', o: 'closed' }, opening: { b: 'stopped', t: 'open', o: 'opening' }, open: { b: 'closing', t: 'open', o: 'open' }, closing: { b: 'stopped', t: 'closed', o: 'opening' }, stopped: { b: 'closing', t: 'stopped', o: 'stopped' } }; const O = { closed: 'C', opening: 'O', open: 'C', closing: 'D', stopped: 'S' }; let s = 'closed', r = 'C'; for (const e of w) { s = T[s][e]; r += O[s]; } return r; }
  },
  {
    type: 'FST',
    title: 'A vending machine that gives change',
    blurb: 'A drink costs 15¢. Nickels n and dimes d go in; when the total reaches 15 the machine prints V for the drink and, if it was paid 20, an n of change, and starts again. A Mealy machine could only answer one symbol per coin — here one coin can produce a drink and a coin together.',
    tags: ['vending-machine', 'control', 'change-making'], level: 'intro',
    sigma: 'nd', outAlpha: 'Vn', start: 'c0',
    delta: `c0 n/ c5; c0 d/ c10
            c5 n/ c10; c5 d/V c0
            c10 n/V c0; c10 d/Vn c0`,
    out: w => { let t = 0, o = ''; for (const c of w) { t += c === 'n' ? 5 : 10; if (t >= 15) { o += 'V' + (t === 20 ? 'n' : ''); t = 0; } } return o; }
  },
  {
    type: 'ITM',
    title: 'Is n a perfect square? 1 + 3 + 5 + …',
    blurb: 'A square is a sum of consecutive odd numbers: 16 = 1 + 3 + 5 + 7. A ruler after a # starts with one mark; each round crosses off as many of the input’s 1s as the ruler has marks, then lengthens the ruler by two. The input is a square exactly when it runs out at the end of a round. The machine finds its left end by walking to a blank, so its tape extends both ways.',
    tags: ['number-theory', 'unary', 'squares'], level: 'advanced',
    sigma: '1', start: 'init', accept: 'yes',
    delta: `init _/=,S yes; init 1/=,R toEnd
            toEnd 1/=,R toEnd; toEnd _/#,R ruler1
            ruler1 _/m,L home
            home 1,x,#,m,y/=,L home; home _/=,R nextM
            nextM x/=,R nextM; nextM 1/=,R scanM; nextM #/=,S yes
            scanM 1/=,R scanM; scanM #/=,R findM
            findM y/=,R findM; findM m/y,L back1; findM _/=,L grow
            back1 y,m/=,L back1; back1 #/=,L back2
            back2 1/=,L back2; back2 x/=,R cross; back2 _/=,R cross
            cross 1/x,R scanX
            scanX 1/=,R scanX; scanX #/=,R findM
            grow y/m,L grow; grow #/=,R ext
            ext m/=,R ext; ext _/m,R ext2; ext2 _/m,L home`,
    lang: w => /^1*$/.test(w) && Number.isInteger(Math.sqrt(w.length)),
    maxLen: 30, randomCount: 0,
    tests: ['', '1', '1111', '111111111', '11', '111', '11111', '11111111']
  }
];
