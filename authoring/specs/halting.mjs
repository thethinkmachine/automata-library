// Turing machines that never halt, one for each way the library can prove it.
// Found by enumerating every 3- and 4-state machine in tree normal form and
// keeping, for each proof method, a machine the cheaper methods cannot settle.

export const type = 'ITM';

export default [
  {
    folder: 'turing/non-halting', method: 'segment', badges: ['never-halts'],
    title: 'A checkerboard pyramid',
    blurb: 'It builds a widening triangle of alternating cells and never repeats a configuration, so no cycle detector can catch it. The halting segment method can: it looks at only a few cells around the head and shows, by searching backwards through every way they could have looked, that no such window can ever lead to the missing transition.',
    tags: ['non-halting', 'proof', 'halting-segment', 'bbchallenge'], level: 'advanced',
    standard: '0RB0LC_0LC1RA_1LA---'
  },
  {
    folder: 'turing/non-halting', method: 'far', badges: ['never-halts'],
    title: 'A binary counter that never stops',
    blurb: 'It counts in binary on its tape, so its blocks double in width and its run never repeats — the classic shape no cycle detector can settle. The finite automata reduction proves it: it finds a regular language that contains every configuration from which the machine could halt and is closed under stepping backwards, and the blank tape is not in it.',
    tags: ['non-halting', 'proof', 'finite-automata-reduction', 'counters', 'bbchallenge'], level: 'advanced',
    standard: '0RB0LA_1RC---_1LA1RB'
  },
  {
    folder: 'turing/non-halting', method: 'ngram', badges: ['never-halts'],
    title: 'Irregular growth, closed under n-grams',
    blurb: 'Four states that grow their tape in an uneven, almost fractal pattern. The n-gram method from the Coq proof of BB(5) collects every short window of tape that can appear on either side of the head, closes that set under the machine’s moves, and finds no window in which the halting transition can fire.',
    tags: ['non-halting', 'proof', 'n-gram-cps', 'coq-bb5'], level: 'advanced',
    standard: '0RB---_0RC1LC_1RD1RA_1LB0LD'
  }
];
