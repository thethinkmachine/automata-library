// More deterministic finite automata: real formats, classic puzzles, systems.

import { explore, runSteps } from '../lib/explore.mjs';

export const type = 'DFA';

const DIGITS = '0123456789';
const range = (a, b) => DIGITS.slice(DIGITS.indexOf(a), DIGITS.indexOf(b) + 1).split('').join(',');
const accepts = machine => w => { const q = runSteps(machine, typeof w === 'string' ? [...w] : w); return q !== null && machine.accept(q); };

// ── puzzles ───────────────────────────────────────────────────────

// Missionaries and cannibals: how many of each are on the starting bank, and where the boat is.
const BOAT = { M: [1, 0], MM: [2, 0], C: [0, 1], CC: [0, 2], MC: [1, 1] };
const missionaries = {
  sigma: Object.keys(BOAT), start: [3, 3, 'L'],
  step: ([m, c, b], load) => {
    const [dm, dc] = BOAT[load], s = b === 'L' ? -1 : 1;
    const nm = m + s * dm, nc = c + s * dc;
    if (nm < 0 || nc < 0 || nm > 3 || nc > 3) return null;
    const safe = (x, y) => x === 0 || x >= y;
    return safe(nm, nc) && safe(3 - nm, 3 - nc) ? [nm, nc, b === 'L' ? 'R' : 'L'] : null;
  },
  accept: ([m, c, b]) => m === 0 && c === 0 && b === 'R',
  name: ([m, c, b]) => `${m}${c}${b}`
};

// The water jugs: a 3-litre and a 5-litre jug, and the goal of measuring 4.
const jugs = {
  sigma: ['fillA', 'fillB', 'emptyA', 'emptyB', 'AtoB', 'BtoA'], start: [0, 0],
  step: ([a, b], m) => {
    switch (m) {
      case 'fillA': return [3, b];
      case 'fillB': return [a, 5];
      case 'emptyA': return [0, b];
      case 'emptyB': return [a, 0];
      case 'AtoB': { const t = Math.min(a, 5 - b); return [a - t, b + t]; }
      case 'BtoA': { const t = Math.min(b, 3 - a); return [a + t, b - t]; }
    }
  },
  accept: ([, b]) => b === 4,
  name: ([a, b]) => `${a},${b}`
};

// Nim with five sticks: players alternately take 1 or 2; the player who takes the last stick wins.
const nim = {
  sigma: '12', start: [5, 1],
  step: ([n, p], t) => (+t > n ? null : [n - +t, 3 - p]),
  accept: ([n, p]) => n === 0 && p === 2,
  name: ([n, p]) => (n === 0 ? `P${3 - p}_wins` : `${n}·P${p}`),
  minimize: true
};

// A knight on a 3 × 3 board, starting in a corner. The moves are named by direction.
const KNIGHT = { A: [1, -2], B: [2, -1], C: [2, 1], D: [1, 2], E: [-1, 2], F: [-2, 1], G: [-2, -1], H: [-1, -2] };
const knight = {
  sigma: 'ABCDEFGH', start: [0, 0],
  step: ([x, y], m) => { const [dx, dy] = KNIGHT[m]; const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx > 2 || ny > 2 ? null : [nx, ny]; },
  accept: ([x, y]) => x === 0 && y === 0,
  name: ([x, y]) => `${'abc'[x]}${3 - y}`
};

// Penney's game: does HHT turn up before HTT?
const penney = {
  sigma: 'HT', start: '',
  step: (q, c) => {
    if (q === 'win' || q === 'lose') return null;
    const s = (q + c).slice(-3);
    if (s === 'HHT') return 'win';
    if (s === 'HTT') return 'lose';
    return s.slice(-2);
  },
  accept: q => q === 'win',
  name: q => q || 'start',
  minimize: true
};
const penneyRef = w => { const i = w.indexOf('HHT'), j = w.indexOf('HTT'); return i >= 0 && (j < 0 || i < j) && i + 3 === w.length; };

// An operating-system process, from creation to exit.
const LIFECYCLE = {
  new: { admit: 'ready' },
  ready: { dispatch: 'running' },
  running: { timeout: 'ready', wait: 'waiting', exit: 'terminated' },
  waiting: { io_done: 'ready' },
  terminated: {}
};
const process_ = {
  sigma: ['admit', 'dispatch', 'timeout', 'wait', 'io_done', 'exit'], start: 'new',
  step: (q, e) => LIFECYCLE[q][e] ?? null,
  accept: q => q === 'terminated', name: q => q
};

// One octet of an IPv4 address, as a little DFA of its own; the address chains four.
const OCTET = {
  start: { 0: 'done', 1: 'one', 2: 'two', ...Object.fromEntries([...'3456789'].map(d => [d, 'any'])) },
  one: Object.fromEntries([...DIGITS].map(d => [d, 'any'])),
  two: { ...Object.fromEntries([...'01234'].map(d => [d, 'any'])), 5: 'lim', ...Object.fromEntries([...'6789'].map(d => [d, 'done'])) },
  any: Object.fromEntries([...DIGITS].map(d => [d, 'done'])),
  lim: Object.fromEntries([...'012345'].map(d => [d, 'done'])),
  done: {}
};
const ipv4 = {
  sigma: DIGITS + '.', start: [0, 'start'],
  step: ([k, s], c) => {
    if (c === '.') return s !== 'start' && k < 3 ? [k + 1, 'start'] : null;
    const t = OCTET[s][c];
    return t ? [k, t] : null;
  },
  accept: ([k, s]) => k === 3 && s !== 'start',
  name: ([k, s]) => `${k + 1}${s === 'start' ? '' : '·' + s}`,
  minimize: true
};
const OCT = '(0|[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-5])';
const ipv4Re = new RegExp(`^${OCT}\\.${OCT}\\.${OCT}\\.${OCT}$`);

export default [
  // ── numbers ─────────────────────────────────────────────────────
  {
    title: 'Decimal multiples of 5: only the last digit counts',
    blurb: 'A remainder machine for 5 would need five states, but this one needs two. 10 is a multiple of 5, so every digit before the last contributes nothing to the remainder, and the machine only has to ask whether the last digit was 0 or 5.',
    tags: ['divisibility', 'decimal', 'minimisation'], level: 'intro',
    sigma: DIGITS, start: 'no', accept: 'yes',
    delta: `no 0,5 yes; no 1,2,3,4,6,7,8,9 no; yes 0,5 yes; yes 1,2,3,4,6,7,8,9 no`,
    lang: w => /[05]$/.test(w),
    prefer: w => /^[1-9]/.test(w),
    badges: ['minimal']
  },

  // ── formats ─────────────────────────────────────────────────────
  {
    title: 'Well-formed UTF-8',
    blurb: 'Each symbol is a byte class: a for an ASCII byte (0xxxxxxx), c for a continuation byte (10xxxxxx), and 2, 3, 4 for the lead byte of a two-, three- or four-byte character. The DFA counts how many continuation bytes are still owed — the core of every UTF-8 decoder, before the finer rules on overlong forms.',
    tags: ['unicode', 'encoding', 'validation'], level: 'intermediate',
    sigma: 'ac234', start: 'ok', accept: 'ok',
    delta: `ok a ok; ok 2 owe1; ok 3 owe2; ok 4 owe3; owe1 c ok; owe2 c owe1; owe3 c owe2`,
    pos: { ok: [0, 0], owe1: [1, 0], owe2: [2, 0], owe3: [3, 0] },
    lang: w => /^(a|2c|3cc|4ccc)*$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Base64 length and padding',
    blurb: 'Base64 text comes in blocks of four characters, and only the last block may end in padding: one = or two. a stands for any of the 64 characters. The states count the position within the current block and whether padding has begun, after which only = may follow.',
    tags: ['encoding', 'base64', 'validation'], level: 'intro',
    sigma: 'a=', start: 'p0', accept: 'p0 done',
    delta: `p0 a p1; p1 a p2; p2 a p3; p3 a p0
            p2 = pad1; pad1 = done; p3 = done`,
    pos: { p0: [0, 0], p1: [1, 0], p2: [2, 0], p3: [3, 0], pad1: [2.5, 1], done: [3.5, 1] },
    lang: w => /^(aaaa)*(aa==|aaa=)?$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'A full IPv4 address',
    blurb: 'Four octets from 0 to 255, no leading zeros, separated by dots. The machine is the one-octet DFA four times over, chained by the dots — concatenation drawn literally. Minimised, each copy shares its end states with the dot that follows.',
    tags: ['networking', 'validation', 'concatenation'], level: 'intermediate',
    ...explore(ipv4),
    lang: w => ipv4Re.test(w),
    maxLen: 3,
    tests: ['0.0.0.0', '192.168.1.1', '255.255.255.255', '10.0.0.256', '1.2.3', '01.2.3.4', '1..2.3', '1.2.3.4.5'],
    badges: ['minimal']
  },
  {
    title: 'An ISO date, YYYY-MM-DD',
    blurb: 'Any four-digit year, a month from 01 to 12 and a day from 01 to 31. The first digit of the month and of the day each decide what the second may be. Whether February has a 30th is beyond it — that would need the year’s remainder mod 4, and the month, together.',
    tags: ['validation', 'dates', 'format'], level: 'intro',
    sigma: DIGITS + '-', start: 's', accept: 'done',
    delta: `s ${range('0', '9')} y1; y1 ${range('0', '9')} y2; y2 ${range('0', '9')} y3; y3 ${range('0', '9')} y4
            y4 - dash1; dash1 0 m0; dash1 1 m1; m0 ${range('1', '9')} mm; m1 ${range('0', '2')} mm
            mm - dash2; dash2 0 d0; dash2 1,2 d12; dash2 3 d3
            d0 ${range('1', '9')} done; d12 ${range('0', '9')} done; d3 0,1 done`,
    lang: w => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(w),
    maxLen: 3,
    tests: ['2024-02-29', '1999-12-31', '2000-01-01', '2024-13-01', '2024-00-10', '2024-12-32', '24-12-01', '2024-1-01'],
    badges: ['minimal']
  },
  {
    title: 'An email address, roughly',
    blurb: 'A local part, an @, and a domain with at least one dot; each part is runs of characters joined by single dots. a stands for any letter or digit. Real address syntax is far more permissive — and is still regular.',
    tags: ['validation', 'format', 'email'], level: 'intro',
    sigma: 'a@.', start: 's', accept: 'tld',
    delta: `s a local; local a local; local . s; local @ at
            at a dom; dom a dom; dom . ddot; ddot a tld; tld a tld; tld . ddot`,
    lang: w => /^a+(\.a+)*@a+(\.a+)+$/.test(w),
    tests: ['a@a.a', 'aa.a@aa.aa', 'a@a.a.a', 'a@a', '@a.a', 'a..a@a.a', 'a@a.', 'a@@a.a'],
    badges: ['minimal']
  },
  {
    title: 'A C integer literal: decimal, octal or hex',
    blurb: 'A leading 0 means octal, 0x means hexadecimal, any other digit means decimal. The symbols are classes: 0, 7 for the digits 1–7, 9 for 8 and 9, x, and f for the letters a–f. A lone 0 is a valid octal literal, which is why “zero” is accepting.',
    tags: ['lexing', 'number-bases', 'c-language'], level: 'intermediate',
    sigma: '079xf', start: 's', accept: 'zero dec oct hex',
    delta: `s 0 zero; s 7,9 dec; dec 0,7,9 dec
            zero 0,7 oct; oct 0,7 oct; zero x hx; hx 0,7,9,f hex; hex 0,7,9,f hex`,
    lang: w => /^(0[07]*|[79][079]*|0x[079f]+)$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'A CSV record with quoted fields',
    blurb: 'Fields separated by ; — a field is either plain characters (a) or a quoted string in which ; is allowed and a quote is written twice. After a closing quote only a separator or the end may follow, which is where hand-written parsers usually go wrong.',
    tags: ['lexing', 'csv', 'escaping'], level: 'intermediate',
    sigma: 'a;"', start: 'field', accept: 'field plain closed',
    delta: `field a plain; field ; field; field " quoted
            plain a plain; plain ; field
            quoted ;,a quoted; quoted " closed
            closed " quoted; closed ; field`,
    lang: w => /^(a*|"([a;]|"")*")(;(a*|"([a;]|"")*"))*$/.test(w),
    tests: ['a;a', '"a;a";a', '"a""a"', ';;', '"a"a', 'a"a', '"a', '"";a'],
    badges: ['minimal']
  },
  {
    title: 'A hex colour: #rgb or #rrggbb',
    blurb: 'A # and exactly three or six hex digits (h). After three digits the machine is in an accepting state that can still be extended — but only by exactly three more.',
    tags: ['validation', 'css', 'format'], level: 'intro',
    sigma: '#h', start: 's', accept: 'h3 h6',
    delta: `s # h0; h0 h h1; h1 h h2; h2 h h3; h3 h h4; h4 h h5; h5 h h6`,
    pos: { s: [0, 0], h0: [1, 0], h1: [2, 0], h2: [3, 0], h3: [4, 0], h4: [5, 0], h5: [6, 0], h6: [7, 0] }, pitch: 120,
    lang: w => /^#(hhh|hhhhhh)$/.test(w),
    badges: ['minimal']
  },
  {
    title: 'Decoding a prefix code',
    blurb: 'The codewords are 0, 10, 110 and 111 — no one a prefix of another, as a Huffman code guarantees. The DFA is the code tree with every leaf glued back to the root: it accepts a bit string exactly when it splits into whole codewords, and each return to the root is one decoded letter.',
    tags: ['coding-theory', 'huffman', 'prefix-codes'], level: 'intermediate',
    sigma: '01', start: 'root', accept: 'root',
    delta: `root 0 root; root 1 n1; n1 0 root; n1 1 n11; n11 0,1 root`,
    lang: w => /^(0|10|110|111)*$/.test(w),
    badges: ['minimal']
  },
  {
    title: '(ab)* with noise',
    blurb: 'Delete every c and what remains must be ab repeated. c is a self-loop on every state, so the machine for (ab)* needs nothing else to ignore it — inserting a letter anywhere is a regular operation, and this is what it looks like.',
    tags: ['shuffle', 'closure-properties', 'noise'], level: 'intro',
    sigma: 'abc', start: 'even', accept: 'even',
    delta: `even a odd; odd b even; even c even; odd c odd`,
    lang: w => /^(ab)*$/.test(w.replace(/c/g, '')),
    badges: ['minimal']
  },

  // ── systems ─────────────────────────────────────────────────────
  {
    title: 'The life of a process',
    blurb: 'The five-state process model from operating-systems courses: new, ready, running, waiting, terminated. Each event is a scheduler or device action, and the accepted words are the complete histories of a process — admitted, dispatched, perhaps preempted or blocked, and finally exited.',
    tags: ['operating-systems', 'scheduling', 'protocols'], level: 'intro',
    ...explore(process_),
    pos: { new: [0, 1], ready: [1, 1], running: [2.2, 1], waiting: [1.6, 2], terminated: [3.4, 1] },
    lang: accepts(process_),
    tests: ['admit dispatch exit', 'admit dispatch timeout dispatch exit', 'admit dispatch wait io_done dispatch exit', 'admit exit', 'dispatch exit', 'admit dispatch wait dispatch exit', 'admit dispatch'],
    badges: ['minimal']
  },
  {
    title: 'Three wrong passwords and you are out',
    blurb: 'y is a correct password, n a wrong one, l logging out. Two wrong attempts in a row are tolerated; a third locks the account, which here simply has no edge out. Accepted: histories that end logged in.',
    tags: ['security', 'protocols', 'counting'], level: 'intro',
    sigma: 'ynl', start: 'f0', accept: 'in',
    delta: `f0 y in; f0 n f1; f1 y in; f1 n f2; f2 y in; in l f0`,
    lang: w => { let f = 0, inside = false; for (const c of w) { if (inside) { if (c !== 'l') return false; inside = false; f = 0; } else if (c === 'y') inside = true; else if (c === 'n') { if (++f === 3) return false; } else return false; } return inside; },
    badges: ['minimal']
  },
  {
    title: 'A microwave oven’s door interlock',
    blurb: 'o and c open and close the door, s starts the oven, x is the timer running out. Starting is only possible with the door closed, and opening the door stops the oven. There is no state for “running with the door open” — the safety property is the missing state.',
    tags: ['safety', 'embedded-systems', 'interlocks'], level: 'intro',
    sigma: 'ocsx', start: 'closed', accept: 'closed open',
    delta: `closed o open; open c closed; closed s running; running x closed; running o open`,
    lang: w => { let door = 'closed', run = false; for (const e of w) { if (e === 'o') { if (door === 'open') return false; door = 'open'; run = false; } else if (e === 'c') { if (door === 'closed') return false; door = 'closed'; } else if (e === 's') { if (door === 'open' || run) return false; run = true; } else { if (!run) return false; run = false; } } return !run; },
    badges: ['minimal']
  },

  // ── puzzles and games ───────────────────────────────────────────
  {
    title: 'Missionaries and cannibals',
    blurb: 'Three missionaries and three cannibals must cross a river in a boat that holds two, and the cannibals may never outnumber the missionaries on either bank. A state is how many of each are still on the starting side and where the boat is; the shortest accepted word is the classic eleven-crossing solution.',
    tags: ['puzzles', 'state-space-search', 'ai'], level: 'intermediate',
    ...explore(missionaries),
    // drawn on the grid of (missionaries, cannibals) still on the starting bank, the boat's side offsetting it
    pos: Object.fromEntries(explore(missionaries).states.map(n => { const [m, c, b] = [+n[0], +n[1], n[2]]; return [n, [(3 - m) * 1.3 + (b === 'R' ? 0.55 : 0), (3 - c) * 1.1 + (b === 'R' ? 0.45 : 0)]]; })),
    pitch: 140,
    lang: accepts(missionaries),
    tests: ['CC C CC C MM MC MM C CC C CC', 'MC M CC C MM MC MM C CC M MC', 'CC C CC C MM MC MM C CC C', 'MM M', 'CC CC'],
    maxLen: 3
  },
  {
    title: 'Measuring 4 litres with 3- and 5-litre jugs',
    blurb: 'Fill, empty or pour one jug into the other until it is empty or the other is full. A state is how much each jug holds, and the machine accepts when the large jug holds exactly 4. The shortest solution takes six moves.',
    tags: ['puzzles', 'state-space-search', 'number-theory'], level: 'intermediate',
    ...explore(jugs),
    lang: accepts(jugs),
    tests: ['fillB BtoA emptyA BtoA fillB BtoA', 'fillA AtoB fillA AtoB emptyB AtoB fillA AtoB', 'fillB BtoA emptyA BtoA fillB', 'fillA fillB', 'fillB emptyB'],
    maxLen: 3,
    badges: ['minimal']
  },
  {
    title: 'Nim with five sticks',
    blurb: 'Two players take 1 or 2 sticks in turn, and whoever takes the last one wins. The accepted words are the games the first player wins. Every losing position for the player to move has a multiple of 3 sticks — the first player wins by taking 2, then always making the total taken in a round 3.',
    tags: ['games', 'combinatorial-game-theory', 'nim'], level: 'intermediate',
    ...explore(nim),
    lang: accepts(nim),
    badges: ['minimal']
  },
  {
    title: 'A knight on a 3 × 3 board',
    blurb: 'Starting in a corner, the knight moves in any of its eight directions (A–H) without leaving the board. The centre is unreachable, and the other eight squares form a single ring, each joined to the two squares a knight’s move away. So a closed tour has even length, and going once round the ring takes eight moves.',
    tags: ['chess', 'graphs', 'walks'], level: 'intermediate',
    ...explore(knight),
    layout: 'circle',
    lang: accepts(knight),
    badges: ['minimal']
  },
  {
    title: 'Penney’s game: HHT before HTT',
    blurb: 'Flip a coin until HHT or HTT appears; accept the sequences where HHT comes first, at the moment it does. The DFA’s states are the useful suffixes of what has been flipped. Read as a Markov chain the same graph gives the odds: HHT wins two times in three.',
    tags: ['probability', 'games', 'pattern-matching'], level: 'intermediate',
    ...explore(penney),
    lang: penneyRef,
    badges: ['minimal']
  }
];
