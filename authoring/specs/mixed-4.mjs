// A mixed batch: a Turing classic, a comparison, nested lists, fairness by
// parity, and three machines that write.

/** The nested-list grammar: list → [ (item (; item)*)? ], item → x | list. */
function isList(w) {
  let i = 0;
  const list = () => {
    if (w[i] !== '[') return false;
    i++;
    if (w[i] === ']') { i++; return true; }
    for (;;) {
      if (w[i] === 'x') i++;
      else if (!list()) return false;
      if (w[i] === ';') { i++; continue; }
      if (w[i] === ']') { i++; return true; }
      return false;
    }
  };
  return list() && i === w.length;
}

export default [
  {
    type: 'ITM', folder: 'turing/ittm', method: 'translated', badges: ['never-halts'],
    chapter: 'Turing, “On computable numbers” (1936), §3',
    title: 'Turing’s first machine: 0 1 0 1 …',
    blurb: 'The first machine in the 1936 paper that defined them: four configurations — Turing named them b, c, e and f — that print 0 and 1 alternately, with a blank square after each, forever. Written in the standard notation, whose 0 is the blank, Turing’s 0 and 1 are the symbols 1 and 2 here.',
    tags: ['turing', 'history', 'non-halting'], level: 'intro',
    standard: '1RB------_0RC------_2RD------_0RA------'
  },
  {
    type: 'TM',
    title: 'Which binary number is smaller? x#y',
    blurb: 'Two binary numbers of the same length; accept when the first is smaller. The machine compares them digit by digit from the most significant end, crossing off as it goes. The first difference decides the answer, but it keeps crossing in pairs after that, because the lengths still have to match.',
    tags: ['comparison', 'binary-numbers', 'zigzag'], level: 'intermediate',
    sigma: '01#', start: 'uc', accept: 'acc',
    delta: `uc X/=,R uc; uc 0/X,R ug0; uc 1/X,R ug1
            ug0 0,1/=,R ug0; ug0 #/=,R uh0
            uh0 X/=,R uh0; uh0 0/X,L bu; uh0 1/X,L bd
            ug1 0,1/=,R ug1; ug1 #/=,R uh1
            uh1 X/=,R uh1; uh1 1/X,L bu
            bu 0,1,X/=,L bu; bu #/=,L bu2; bu2 0,1/=,L bu2; bu2 X/=,R uc
            dc X/=,R dc; dc 0,1/X,R dg; dc #/=,R dend
            dg 0,1/=,R dg; dg #/=,R dh
            dh X/=,R dh; dh 0,1/X,L bd
            bd 0,1,X/=,L bd; bd #/=,L bd2; bd2 0,1/=,L bd2; bd2 X/=,R dc
            dend X/=,R dend; dend _/=,S acc`,
    lang: w => { const p = w.split('#'); return p.length === 2 && p[0].length === p[1].length && p[0] < p[1]; },
    gen: n => { const x = (n * 37 % 64).toString(2).padStart(6, '0'), y = (n * 53 % 64).toString(2).padStart(6, '0'); return `${x}#${y}`; },
    maxLen: 7
  },
  {
    type: 'DPDA',
    title: 'A nested list: [x;[x;x];[]]',
    blurb: 'The bones of JSON’s arrays: a list is brackets around items separated by semicolons, and an item is an atom x or another list. The control knows only whether an item or a separator comes next; the stack knows how deep the brackets go, so the machine can tell when the outermost list has closed.',
    tags: ['parsing', 'json', 'nesting'], level: 'intermediate',
    sigma: '[];x', start: 'start', accept: 'done',
    delta: `start [,Z/LZ open
            open x,ε/ε after; open [,ε/L open; open ],L/ε closed
            after ;,ε/ε need; after ],L/ε closed
            need x,ε/ε after; need [,ε/L open
            closed ε,L/L after; closed ε,Z/Z done`,
    lang: isList,
    tests: ['[]', '[x]', '[x;x]', '[x;[x;x];[]]', '[[[]]]', '[x;]', '[x', 'x', '[];[]', '[[x]x]'],
    maxLen: 6
  },
  {
    type: 'NPA',
    title: 'Exactly one of a and b, infinitely often',
    blurb: 'Infinitely many a’s and finitely many b’s, or the other way round. The machine waits, guesses which letter will win and when the other has stopped, and commits to a branch that has no edge for the loser. In its branch, the winner’s state has the even priority 0, everything else the odd 1.',
    tags: ['ltl', 'parity', 'guessing'], level: 'advanced',
    sigma: 'abc', start: 'wait', priority: { wait: 1, A_a: 0, A_c: 1, B_b: 0, B_c: 1 },
    delta: `wait a,b,c wait
            wait a A_a; wait c A_c; A_a a A_a; A_a c A_c; A_c a A_a; A_c c A_c
            wait b B_b; wait c B_c; B_b b B_b; B_b c B_c; B_c b B_b; B_c c B_c`,
    ltl: '(G F a & F G !b) | (G F b & F G !a)'
  },
  {
    type: 'Moore',
    title: 'A traffic light with a pedestrian button',
    blurb: 'Each t is a tick of the controller’s clock and p a press of the crossing button. The light stays green until someone presses, then goes yellow and red on the next ticks and returns to green. The press is remembered in the state — a green light with a request waiting is a different state from a plain green one, even though both show G.',
    tags: ['control', 'embedded-systems', 'state-machines'], level: 'intro',
    sigma: 'tp', start: 'G', stateOut: { G: 'G', Gp: 'G', Y: 'Y', R: 'R' },
    delta: `G t G; G p Gp; Gp t Y; Gp p Gp; Y t R; Y p Y; R t G; R p R`,
    out: w => { let s = 'G', o = 'G'; const T = { G: { t: 'G', p: 'Gp' }, Gp: { t: 'Y', p: 'Gp' }, Y: { t: 'R', p: 'Y' }, R: { t: 'G', p: 'R' } }; for (const e of w) { s = T[s][e]; o += s[0]; } return o; }
  },
  {
    type: 'Mealy',
    title: 'Gray code back to binary',
    blurb: 'The inverse of the binary-to-Gray transducer, reading most significant bit first: each binary bit is the previous binary bit XOR the current Gray bit. So the state is the last bit printed, and a 1 in the Gray code flips it.',
    tags: ['gray-code', 'encoding', 'binary-numbers'], level: 'intro',
    sigma: '01', start: 'was0',
    delta: `was0 0/0 was0; was0 1/1 was1; was1 0/1 was1; was1 1/0 was0`,
    out: w => { let b = 0, o = ''; for (const g of w) { b ^= +g; o += b; } return o; }
  },
  {
    type: 'FST',
    title: 'Strip # comments',
    blurb: 'Copy text, dropping everything from a # to the end of its line: a is any ordinary character and n a newline, which ends a comment and is kept. A shell, Python or a configuration-file reader does this before anything else. Two states, and the comment state prints nothing.',
    tags: ['text-processing', 'lexing', 'comments'], level: 'intro',
    sigma: 'a#n', start: 'code',
    delta: `code a/a code; code n/n code; code #/ comment
            comment a,#/ comment; comment n/n code`,
    out: w => w.replace(/#[^n]*/g, '')
  }
];
