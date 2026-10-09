// Machines that write: Moore (output on states), Mealy (output on edges), FST
// (any output string, nondeterministic), 2DFT (a two-way head that writes).
// Mealy and FST labels read `in/out`; a 2DFT's `in/move:out`.

const count = (w, c) => [...w].filter(x => x === c).length;

const MORSE = { e: '.', t: '-', a: '.-', n: '-.', i: '..', m: '--', s: '...', o: '---' };

export default [
  // ── Moore ───────────────────────────────────────────────────────
  {
    type: 'Moore',
    title: 'The running remainder mod 3',
    blurb: 'The divisibility-by-3 DFA with its answer written out at every step: each state prints its remainder, so the output is the value of every prefix of the binary number, mod 3. A Moore machine prints one symbol more than it reads — the start state’s, before anything has been read.',
    tags: ['modular-arithmetic', 'binary-numbers', 'running-output'], level: 'intro',
    sigma: '01', start: 'r0', stateOut: { r0: '0', r1: '1', r2: '2' },
    delta: `r0 0 r0; r0 1 r1; r1 0 r2; r1 1 r0; r2 0 r1; r2 1 r2`,
    out: w => { let r = 0, s = '0'; for (const b of w) { r = (2 * r + +b) % 3; s += r; } return s; }
  },
  {
    type: 'Moore',
    title: 'A switch debouncer',
    blurb: 'A mechanical switch chatters, so its reading flips briefly before it settles. The debouncer changes its output only after the input has held the new value for three samples in a row; shorter glitches are ignored. Each state is the current output and how long the other value has been seen.',
    tags: ['hardware', 'debouncing', 'signal-processing'], level: 'intermediate',
    sigma: '01', start: 'lo0', stateOut: { lo0: '0', lo1: '0', lo2: '0', hi0: '1', hi1: '1', hi2: '1' },
    delta: `lo0 0 lo0; lo0 1 lo1; lo1 0 lo0; lo1 1 lo2; lo2 0 lo0; lo2 1 hi0
            hi0 1 hi0; hi0 0 hi1; hi1 1 hi0; hi1 0 hi2; hi2 1 hi0; hi2 0 lo0`,
    pos: { lo0: [0, 0], lo1: [1, 0], lo2: [2, 0], hi0: [2, 1.2], hi1: [1, 1.2], hi2: [0, 1.2] },
    out: w => { let o = 0, run = 0, s = '0'; for (const b of w) { if (+b === o) run = 0; else if (++run === 3) { o ^= 1; run = 0; } s += o; } return s; }
  },
  {
    type: 'Moore',
    title: 'A thermostat with hysteresis',
    blurb: 'Readings are c (too cold), k (comfortable) and h (too hot); the output is the heater, 1 or 0. It switches on when cold and off when hot, and a comfortable reading leaves it as it was — so the heater does not flicker around a single set point. Memory of one bit is the whole design.',
    tags: ['control', 'hysteresis', 'hardware'], level: 'intro',
    sigma: 'ckh', start: 'off', stateOut: { off: '0', on: '1' },
    delta: `off c on; off k,h off; on h off; on c,k on`,
    out: w => { let o = 0, s = '0'; for (const r of w) { if (r === 'c') o = 1; else if (r === 'h') o = 0; s += o; } return s; }
  },
  {
    type: 'Moore',
    title: 'An elevator’s floor display',
    blurb: 'u and d move the car up and down between floors 0 and 3; a press at the top or bottom does nothing. The display shows the floor after every move. A bounded counter, saturating at both ends — the states are the floors.',
    tags: ['counters', 'saturation', 'control'], level: 'intro',
    sigma: 'ud', start: 'f0', stateOut: { f0: '0', f1: '1', f2: '2', f3: '3' },
    delta: `f0 u f1; f0 d f0; f1 u f2; f1 d f0; f2 u f3; f2 d f1; f3 u f3; f3 d f2`,
    pos: { f0: [0, 3], f1: [0, 2], f2: [0, 1], f3: [0, 0] }, pitch: 120,
    out: w => { let f = 0, s = '0'; for (const c of w) { f = Math.max(0, Math.min(3, f + (c === 'u' ? 1 : -1))); s += f; } return s; }
  },

  // ── Mealy ───────────────────────────────────────────────────────
  {
    type: 'Mealy',
    title: 'Two’s complement, least significant bit first',
    blurb: 'Negate a binary number as it streams in, low bit first: copy the bits up to and including the first 1, then flip every bit after it. Two states — before and after that first 1 — and the output keeps pace with the input.',
    tags: ['binary-numbers', 'twos-complement', 'serial-arithmetic'], level: 'intro',
    sigma: '01', start: 'copy',
    delta: `copy 0/0 copy; copy 1/1 flip; flip 0/1 flip; flip 1/0 flip`,
    out: w => { let seen = false, s = ''; for (const b of w) { s += seen ? (b === '1' ? '0' : '1') : b; if (b === '1') seen = true; } return s; },
    label: w => w ? `${parseInt([...w].reverse().join(''), 2)}` : ''
  },
  {
    type: 'Mealy',
    title: 'Times three, serially',
    blurb: 'Multiply a binary number by 3 as it streams in, least significant bit first. 3n = 2n + n, so each output bit is the input bit plus the previous one plus a carry; the carry can reach 2, so the states are the carries 0, 1 and 2 together with the last bit read. Feed enough trailing zeros to flush the carry.',
    tags: ['binary-numbers', 'serial-arithmetic', 'multiplication'], level: 'intermediate',
    sigma: '01', start: 'c0_0',
    delta: (() => {
      const r = [];
      for (const c of [0, 1, 2]) for (const p of [0, 1]) for (const b of [0, 1]) {
        const s = b + p + c;
        r.push(`c${c}_${p} ${b}/${s % 2} c${s >> 1}_${b}`);
      }
      return r.join('\n');
    })(),
    out: w => { const n = BigInt('0b' + ([...w].reverse().join('') || '0')) * 3n; return [...n.toString(2).padStart(w.length + 2, '0')].reverse().join('').slice(0, w.length); },
    label: w => w ? `3 × ${parseInt([...w].reverse().join(''), 2)}` : ''
  },
  {
    type: 'Mealy',
    title: 'Dividing by 3, most significant bit first',
    blurb: 'Long division in binary, one bit at a time. The state is the remainder so far; reading bit b makes it 2r + b, and the quotient bit printed is whether that reached 3. The same three states as the divisibility DFA — which only kept the remainder and threw the quotient away.',
    tags: ['binary-numbers', 'division', 'serial-arithmetic'], level: 'intermediate',
    sigma: '01', start: 'r0',
    delta: `r0 0/0 r0; r0 1/0 r1; r1 0/0 r2; r1 1/1 r0; r2 0/1 r1; r2 1/1 r2`,
    out: w => (w ? (BigInt('0b' + w) / 3n).toString(2).padStart(w.length, '0') : ''),
    label: w => w ? `${parseInt(w, 2)} ÷ 3` : ''
  },
  {
    type: 'Mealy',
    title: 'A Vigenère cipher with the key “bc”',
    blurb: 'Over the alphabet a–d, shift the 1st, 3rd, 5th … letter by 1 and the others by 2. A Caesar cipher has one state; a Vigenère cipher has one per letter of its key, because the only thing it must remember is where in the key it is.',
    tags: ['cryptography', 'ciphers', 'substitution'], level: 'intro',
    sigma: 'abcd', start: 'k1',
    delta: [...'abcd'].map((c, i) => `k1 ${c}/${'abcd'[(i + 1) % 4]} k2; k2 ${c}/${'abcd'[(i + 2) % 4]} k1`).join('\n'),
    out: w => [...w].map((c, i) => 'abcd'[('abcd'.indexOf(c) + (i % 2 ? 2 : 1)) % 4]).join('')
  },
  {
    type: 'Mealy',
    title: 'Detecting 101, overlaps allowed',
    blurb: 'Print 1 at each position where the last three bits read were 101, and 0 elsewhere. After a match the final 1 can start the next one, so 10101 has two. The textbook sequence detector, in its Mealy form: it answers on the very bit that completes the pattern.',
    tags: ['sequence-detection', 'hardware', 'pattern-matching'], level: 'intro',
    sigma: '01', start: 'none',
    delta: `none 0/0 none; none 1/0 one; one 1/0 one; one 0/0 one0; one0 1/1 one; one0 0/0 none`,
    out: w => [...w].map((_, i) => (i >= 2 && w.slice(i - 2, i + 1) === '101' ? '1' : '0')).join('')
  },

  // ── finite-state transducers ────────────────────────────────────
  {
    type: 'FST',
    title: 'HDLC bit stuffing',
    blurb: 'A frame is marked by 01111110, so the data inside must never contain six 1s in a row. After every five consecutive 1s the sender inserts a 0, and the receiver removes it. The transducer counts the run of 1s and, at five, writes 10 instead of 1.',
    tags: ['networking', 'framing', 'bit-stuffing'], level: 'intermediate',
    sigma: '01', start: 'r0',
    delta: `r0 0/0 r0; r0 1/1 r1; r1 0/0 r0; r1 1/1 r2; r2 0/0 r0; r2 1/1 r3; r3 0/0 r0; r3 1/1 r4; r4 0/0 r0; r4 1/10 r0`,
    out: w => { let run = 0, s = ''; for (const b of w) { if (b === '1') { s += '1'; if (++run === 5) { s += '0'; run = 0; } } else { s += '0'; run = 0; } } return s; },
    maxLen: 12
  },
  {
    type: 'FST',
    title: 'Morse code for e, t, a, n, i, m, s and o',
    blurb: 'Every letter is replaced by its code — e is ., t is -, s is ..., o is --- — with / between letters. A substitution of strings for letters is a homomorphism, and a homomorphism is a transducer with a single state.',
    tags: ['morse-code', 'homomorphism', 'encoding'], level: 'intro',
    sigma: 'etanimso', outAlpha: '.-/', start: 'q',
    delta: Object.entries(MORSE).map(([c, m]) => `q ${c}/${m}/ q`).join('\n'),
    out: w => [...w].map(c => MORSE[c] + '/').join(''),
    maxLen: 4
  },
  {
    type: 'FST',
    title: 'Replace the last letter with x',
    blurb: 'A transducer reading left to right cannot know which letter is the last. This one guesses: on each letter it either copies it or bets that it is the last and writes x instead. Only the branch that bet correctly reaches the accepting state at the end, so exactly one output survives.',
    tags: ['nondeterminism', 'guessing', 'functional-transducer'], level: 'intermediate',
    sigma: 'ab', outAlpha: 'abx', accepting: true, start: 'copy', accept: 'end',
    delta: `copy a/a copy; copy b/b copy; copy a/x end; copy b/x end`,
    out: w => (w ? w.slice(0, -1) + 'x' : null)
  },
  {
    type: 'FST',
    title: 'Thousands separators',
    blurb: 'Write 1234567 as 1_234_567. Where the separators go depends on the length mod 3, counted from the right — which a left-to-right reader does not know yet. So the transducer guesses the phase at the start and only the branch whose guess was right ends in an accepting state.',
    tags: ['formatting', 'nondeterminism', 'guessing'], level: 'advanced',
    sigma: '0123456789', outAlpha: '0123456789_', accepting: true, start: 'start', accept: 'p0',
    delta: (() => {
      const r = [], D = [...'0123456789'];
      // pK: K digits remain before the next separator would be due (mod 3); p0 = at a boundary.
      for (const d of D) {
        r.push(`start ${d}/${d} p2`, `start ${d}/${d} p1`, `start ${d}/${d} p0`);
        r.push(`p2 ${d}/${d} p1`, `p1 ${d}/${d} p0`, `p0 ${d}/_${d} p2`);
      }
      return r.join('\n');
    })(),
    out: w => (w ? w.replace(/\B(?=(\d{3})+(?!\d))/g, '_') : null),
    maxLen: 3,
    tests: ['7', '42', '123', '1234', '12345', '1234567']
  },

  // ── two-way transducers ─────────────────────────────────────────
  {
    type: '2DFT',
    title: 'A word and its mirror: w ↦ wwᴿ',
    blurb: 'Sweep right printing every letter, then sweep back printing them again. The result is always a palindrome of even length. One-way transducers cannot reverse; a head that can turn round does it with no memory at all.',
    tags: ['reversal', 'palindromes', 'two-way'], level: 'intro',
    sigma: 'ab', accepting: true, start: 'start', accept: 'done',
    delta: `start </R: fwd
            fwd a/R:a fwd; fwd b/R:b fwd; fwd >/L: bwd
            bwd a/L:a bwd; bwd b/L:b bwd; bwd </S: done`,
    out: w => w + [...w].reverse().join('')
  },
  {
    type: '2DFT',
    title: 'Sorting by passes: all a’s, then all b’s',
    blurb: 'Two passes over the input: the first prints only the a’s, the second only the b’s. The output is the input sorted — counting sort, where the transducer’s head does the counting by reading the input twice.',
    tags: ['sorting', 'two-way', 'multiple-passes'], level: 'intro',
    sigma: 'ab', accepting: true, start: 'start', accept: 'done',
    delta: `start </R: as
            as a/R:a as; as b/R: as; as >/L: back
            back a,b/L: back; back </R: bs
            bs a/R: bs; bs b/R:b bs; bs >/S: done`,
    out: w => [...w].sort().join('')
  },

  // ── two-way acceptors ───────────────────────────────────────────
  {
    type: '2DFA',
    title: 'The fourth symbol from the end, by walking back',
    blurb: 'A one-way DFA for “the 4th symbol from the end is a 1” needs 16 states, one per possible last-four window. A two-way DFA runs to the right end marker and steps back four cells: six states. Two-way heads add no power, but they can save exponentially many states.',
    tags: ['two-way', 'state-complexity', 'suffix'], level: 'intermediate',
    sigma: '01', start: 'run', accept: 'yes',
    delta: `run <,0,1/R run; run >/L b1
            b1 0,1/L b2; b2 0,1/L b3; b3 0,1/L b4
            b4 1/S yes`,
    lang: w => w.length >= 4 && w[w.length - 4] === '1'
  },

  // ── probabilistic ───────────────────────────────────────────────
  {
    type: 'PFA',
    title: 'Try until it works: amplification',
    blurb: 'Each a is an attempt that succeeds with probability 1/2, and success is permanent. After n attempts the chance of at least one success is 1 − 2⁻ⁿ, which passes the cut-point 0.9 at n = 4. Repetition turns a coin flip into near-certainty — the idea behind every randomised algorithm’s error bound.',
    tags: ['probability', 'amplification', 'randomised-algorithms'], level: 'intro',
    sigma: 'a', cutPoint: 0.9, start: 'trying', accept: 'success',
    delta: `trying a:0.5 trying; trying a:0.5 success; success a:1 success`,
    lang: w => 1 - 2 ** -w.length > 0.9,
    maxLen: 12
  }
];
