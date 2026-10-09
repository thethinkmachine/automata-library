// More machines that write, and a two-way acceptor.

export default [
  {
    type: 'Moore',
    title: 'A three-bit linear-feedback shift register',
    blurb: 'Each tick t shifts the register and feeds back the XOR of two of its bits; the output is the bit shifted out. Seeded with 001 it runs through all seven non-zero states before repeating — a maximal-length sequence, the cheapest pseudo-random generator in hardware, and a Moore machine with one input letter.',
    tags: ['hardware', 'pseudo-random', 'lfsr'], level: 'intermediate',
    sigma: 't', start: 's001',
    ...(() => {
      const next = s => { const b = [...s].map(Number); const fb = b[0] ^ b[1]; return `${b[1]}${b[2]}${fb}`; };
      const rules = [], out = {};
      let s = '001';
      for (let i = 0; i < 7; i++) { const n = next(s); rules.push(`s${s} t s${n}`); out[`s${s}`] = s[0]; s = n; }
      return { delta: rules.join('\n'), stateOut: out };
    })(),
    layout: 'circle',
    out: w => { let s = '001', o = s[0]; for (let i = 0; i < w.length; i++) { const b = [...s].map(Number); s = `${b[1]}${b[2]}${b[0] ^ b[1]}`; o += s[0]; } return o; },
    maxLen: 20
  },
  {
    type: 'Moore',
    title: 'A coin-operated turnstile',
    blurb: 'The software-engineering classic: c inserts a coin, p pushes the arm. Locked, a coin unlocks it and a push does nothing; unlocked, a push lets someone through and locks it again, and another coin is wasted. The output is the lock — L or U — after every event.',
    tags: ['state-machines', 'software-engineering', 'control'], level: 'intro',
    sigma: 'cp', start: 'locked', stateOut: { locked: 'L', unlocked: 'U' },
    delta: `locked c unlocked; locked p locked; unlocked p locked; unlocked c unlocked`,
    out: w => { let u = false, o = 'L'; for (const e of w) { u = e === 'c' ? true : false; o += u ? 'U' : 'L'; } return o; }
  },
  {
    type: 'FST',
    title: 'Run-length decoding',
    blurb: 'a2b3 becomes aabbb: each letter is followed by how many times to repeat it, here 1 to 3. The transducer remembers the letter until the count arrives and then writes it that many times — a single edge can print a string, which is what lifts an FST above a Mealy machine.',
    tags: ['compression', 'run-length', 'encoding'], level: 'intro',
    sigma: 'ab123', outAlpha: 'ab', accepting: true, start: 'ready', accept: 'ready',
    delta: `ready a/ heldA; ready b/ heldB
            heldA 1/a ready; heldA 2/aa ready; heldA 3/aaa ready
            heldB 1/b ready; heldB 2/bb ready; heldB 3/bbb ready`,
    out: w => (/^([ab][123])*$/.test(w) ? w.replace(/([ab])([123])/g, (_, c, n) => c.repeat(+n)) : null),
    maxLen: 6
  },
  {
    type: 'FST',
    title: 'Squeeze repeated letters: tr -s',
    blurb: 'Collapse every run of the same letter to one: aaabbba becomes aba, as the Unix command tr -s does. The machine remembers the last letter it printed and prints nothing while the same letter repeats — an edge with an empty output.',
    tags: ['unix', 'text-processing', 'deduplication'], level: 'intro',
    sigma: 'ab', start: 'start',
    delta: `start a/a lastA; start b/b lastB
            lastA a/ lastA; lastA b/b lastB
            lastB b/ lastB; lastB a/a lastA`,
    out: w => w.replace(/(.)\1+/g, '$1')
  },
  {
    type: '2DFT',
    title: 'Rotate: move the first letter to the end',
    blurb: 'abc becomes bca. The head remembers the first letter in its state, prints everything after it, and prints the remembered letter on reaching the end marker. A one-way transducer cannot know where the end is without guessing; a head that sees the end marker simply knows.',
    tags: ['two-way', 'rotation', 'text-processing'], level: 'intro',
    sigma: 'ab', accepting: true, start: 'start', accept: 'done',
    delta: `start </R: first
            first a/R: keepA; first b/R: keepB; first >/S: done
            keepA a/R:a keepA; keepA b/R:b keepA; keepA >/S:a done
            keepB a/R:a keepB; keepB b/R:b keepB; keepB >/S:b done`,
    out: w => (w ? w.slice(1) + w[0] : '')
  },
  {
    type: '2DFA',
    title: 'Déjà vu, without guessing',
    blurb: 'The last letter appeared earlier — the language the two-way NFA decides by guessing which earlier letter matches. A deterministic two-way head does it with a second look instead: run to the end, read the last letter, go back to the start and search for it.',
    tags: ['two-way', 'determinism', 'second-pass'], level: 'intermediate',
    sigma: 'ab', start: 'run', accept: 'yes',
    delta: `run <,a,b/R run; run >/L last
            last a/L rewA; last b/L rewB
            rewA a,b/L rewA; rewA </R findA
            rewB a,b/L rewB; rewB </R findB
            findA a/R gotA; findA b/R findA
            findB b/R gotB; findB a/R findB
            gotA a,b/R past; gotB a,b/R past
            past a,b/R past; past >/S yes`,
    lang: w => w.length >= 2 && w.slice(0, -1).includes(w[w.length - 1])
  }
];
