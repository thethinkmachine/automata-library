// More pushdown machines, and the stack-of-stacks EPDA.

const count = (w, c) => [...w].filter(x => x === c).length;
const shape = (w, letters) => {
  const m = w.match(new RegExp('^' + [...letters].map(l => `(${l}*)`).join('') + '$'));
  return m ? m.slice(1).map(x => x.length) : null;
};

/** Polish (prefix) notation over x + * → reverse Polish, or null if malformed. */
function polishToRpn(w) {
  let i = 0;
  const expr = () => {
    if (i >= w.length) return null;
    const c = w[i++];
    if (c === 'x') return 'x';
    const l = expr(); if (l === null) return null;
    const r = expr(); if (r === null) return null;
    return l + r + c;
  };
  const out = expr();
  return out !== null && i === w.length ? out : null;
}

/** An EPDA rule as the save format writes it. */
const E = (from, symbol, pop, push, to, below = 'ε', above = 'ε') => ({ from, to, symbol, pop, push, below, above });

export default [
  {
    type: 'DPDA',
    title: 'More a’s than b’s: aⁿbᵐ, n > m',
    blurb: 'Push the a’s, pop one per b, and accept while an A is still left. A deterministic machine cannot look at its stack and keep reading in the same breath, so after each pop it steps aside to check the top and moves to “ahead” or “even” — the accepting state is a fact about the stack, carried in the control.',
    tags: ['counting', 'deterministic-cfl', 'comparison'], level: 'intermediate',
    sigma: 'ab', start: 'start', accept: 'as ahead',
    delta: `start a,Z/AZ as
            as a,A/AA as; as b,A/ε check
            check ε,A/A ahead; check ε,Z/Z even
            ahead b,A/ε check`,
    lang: w => { const s = shape(w, 'ab'); return !!s && s[0] > s[1]; },
    gen: n => 'a'.repeat(n) + 'b'.repeat(Math.max(0, n - 1 - (n % 3)))
  },
  {
    type: 'DPDA',
    title: 'Two balanced blocks: 0ⁿ1ⁿ0ᵐ1ᵐ',
    blurb: 'Two counts one after the other, where “nested counts” had one inside the other. The stack empties between the blocks and is reused, so the machine is two copies of the 0ⁿ1ⁿ checker joined at the moment the bottom marker reappears.',
    tags: ['counting', 'concatenation', 'stack-matching'], level: 'intro',
    sigma: '01', start: 's', accept: 's mid done',
    delta: `s 0,Z/XZ p
            p 0,X/XX p; p 1,X/ε q
            q 1,X/ε q; q ε,Z/Z mid
            mid 0,Z/XZ p2
            p2 0,X/XX p2; p2 1,X/ε q2
            q2 1,X/ε q2; q2 ε,Z/Z done`,
    lang: w => { const s = shape(w, '0101'); return !!s && s[0] === s[1] && s[2] === s[3]; },
    gen: n => '0'.repeat(n % 4) + '1'.repeat(n % 4) + '0'.repeat(n >> 2) + '1'.repeat(n >> 2)
  },
  {
    type: 'NPDA',
    title: 'Two different words: x#y with x ≠ y',
    blurb: 'Equal words x#x are beyond a stack, but different ones are not. Either the lengths differ, which a stack measures, or there is a position where they disagree: guess it, push one marker per letter before it, remember the letter, and pop the markers off against y to reach the same position there.',
    tags: ['guessing', 'complement', 'copy-language'], level: 'advanced',
    sigma: 'ab#', start: 'start', accept: 'longer shorter differ',
    delta: `start ε,ε/ε len; start ε,ε/ε pos
            len a,ε/X len; len b,ε/X len; len #,ε/ε ylen
            ylen a,X/ε ylen; ylen b,X/ε ylen; ylen ε,X/X shorter
            ylen a,Z/Z longer; ylen b,Z/Z longer; longer a,ε/ε longer; longer b,ε/ε longer
            pos a,ε/X pos; pos b,ε/X pos; pos a,ε/ε sawA; pos b,ε/ε sawB
            sawA a,ε/ε sawA; sawA b,ε/ε sawA; sawA #,ε/ε yA
            sawB a,ε/ε sawB; sawB b,ε/ε sawB; sawB #,ε/ε yB
            yA a,X/ε yA; yA b,X/ε yA; yA b,Z/Z differ
            yB a,X/ε yB; yB b,X/ε yB; yB a,Z/Z differ
            differ a,ε/ε differ; differ b,ε/ε differ`,
    lang: w => { const p = w.split('#'); return p.length === 2 && p[0] !== p[1]; },
    gen: n => { const u = ['ab', 'aab', 'bab', 'abba'][n % 4]; return `${u}#${n % 2 ? u : u.slice(1) + 'a'}`; },
    maxLen: 7
  },
  {
    type: 'Counter',
    title: 'As many a’s as b’s, with one counter',
    blurb: 'A counter holds a single number, so it cannot store which letter is ahead — but the control can. The states remember the sign of #a − #b and the counter its size; reaching zero sends the machine back to the accepting state. The same language as the stack machine for it, with half the memory.',
    tags: ['one-counter', 'balance', 'sign-in-state'], level: 'intermediate',
    sigma: 'ab', start: 'even', accept: 'even',
    delta: `even a,Z/1Z aAhead; even b,Z/1Z bAhead
            aAhead a,1/11 aAhead; aAhead b,1/ε aCheck; aCheck ε,1/1 aAhead; aCheck ε,Z/Z even
            bAhead b,1/11 bAhead; bAhead a,1/ε bCheck; bCheck ε,1/1 bAhead; bCheck ε,Z/Z even`,
    lang: w => count(w, 'a') === count(w, 'b'),
    gen: n => 'ab ba aabb abba baab bbaa'.split(' ')[n % 6].repeat(1 + (n >> 1))
  },
  {
    type: 'PDT',
    title: 'What is left after cancelling ()',
    blurb: 'Cancel every matched pair of parentheses and print what remains. It always has the form )…)(…( — some closers nothing opened, then some openers nothing closed. Unmatched closers are printed as they arrive; openers wait on the stack and are printed at the end only if nothing cancelled them.',
    tags: ['parentheses', 'normal-form', 'dyck'], level: 'intermediate',
    sigma: '()', accepting: true, outAlpha: '()', start: 'read', accept: 'done',
    delta: `read (,ε/P:ε read; read ),P/ε:ε read; read ),Z/Z:) read
            read ε,ε/ε:ε flush
            flush ε,P/ε:( flush; flush ε,Z/Z:ε done`,
    out: w => { let close = 0, open = 0; for (const c of w) { if (c === '(') open++; else if (open) open--; else close++; } return ')'.repeat(close) + '('.repeat(open); },
    maxLen: 9
  },
  {
    type: 'PDT',
    title: 'Polish notation to reverse Polish',
    blurb: 'Prefix to postfix: +x*xx becomes xxx*+. Each operator waits on the stack, remembering how many of its operands are complete; an x completes one, and an operator whose second operand completes is printed and itself counts as an operand for the one below. Łukasiewicz’s notation, turned round.',
    tags: ['expressions', 'notation', 'compilers'], level: 'intermediate',
    sigma: 'x+*', accepting: true, outAlpha: 'x+*', start: 'read', accept: 'end',
    delta: `read +,ε/P:ε read; read *,ε/M:ε read; read x,ε/ε:x one
            one ε,P/Q:ε read; one ε,M/N:ε read
            one ε,Q/ε:+ one; one ε,N/ε:* one
            one ε,Z/Z:ε end`,
    out: polishToRpn,
    maxLen: 7,
    tests: ['x', '+xx', '+x*xx', '*+xxx', '+*xx*xx', '+x', 'xx']
  },
  {
    type: 'EPDA',
    title: 'Cross-serial dependencies: aⁿbᵐcⁿdᵐ',
    blurb: 'Swiss German lets verbs follow their objects in the same order — “we let the children help Hans paint the house” with the verbs crossed — which no context-free grammar captures. A stack of stacks does: count the a’s on the working stack and park one stack per b beneath it, then let the c’s use up the count and the d’s resume the parked stacks, in order.',
    tags: ['tree-adjoining', 'natural-language', 'cross-serial'], level: 'advanced',
    sigma: 'abcd', start: 'q0', accept: 'done',
    transitions: [
      E('q0', 'ε', 'ε', 'ε', 'as', 'E'),
      E('as', 'a', 'ε', 'A', 'as'),
      E('as', 'b', 'ε', 'ε', 'bs', 'D'),
      E('bs', 'b', 'ε', 'ε', 'bs', 'D'),
      E('as', 'ε', 'ε', 'ε', 'cs'),
      E('bs', 'ε', 'ε', 'ε', 'cs'),
      E('cs', 'c', 'A', 'ε', 'cs'),
      E('cs', 'ε', 'Z', 'ε', 'ds'),
      E('ds', 'd', 'D', 'ε', 'ds'),
      E('ds', 'ε', 'E', 'ε', 'done')
    ],
    lang: w => { const s = shape(w, 'abcd'); return !!s && s[0] === s[2] && s[1] === s[3]; },
    gen: n => 'a'.repeat(n % 4) + 'b'.repeat(n >> 2) + 'c'.repeat(n % 4) + 'd'.repeat(n >> 2),
    maxLen: 6
  },
  {
    type: 'EPDA',
    title: 'A copy, with a stack of stacks: w#w',
    blurb: 'One stack reverses w, which is useless for a copy. But popping it again, and parking each symbol on a stack of its own beneath the working one, reverses it a second time — so when the working stack runs out, the parked stacks come back in reading order, one per symbol of the copy.',
    tags: ['tree-adjoining', 'copy-language', 'reversal'], level: 'intermediate',
    sigma: 'ab#', start: 'q0', accept: 'done',
    transitions: [
      E('q0', 'ε', 'ε', 'ε', 'read', 'E'),
      E('read', 'a', 'ε', 'A', 'read'),
      E('read', 'b', 'ε', 'B', 'read'),
      E('read', '#', 'ε', 'ε', 'park'),
      E('park', 'ε', 'A', 'ε', 'park', 'A'),
      E('park', 'ε', 'B', 'ε', 'park', 'B'),
      E('park', 'ε', 'Z', 'ε', 'match'),
      E('match', 'a', 'A', 'ε', 'match'),
      E('match', 'b', 'B', 'ε', 'match'),
      E('match', 'ε', 'E', 'ε', 'done')
    ],
    lang: w => { const p = w.split('#'); return p.length === 2 && p[0] === p[1]; },
    gen: n => { const u = ['', 'a', 'ab', 'bba', 'abab'][n % 5]; return `${u}#${u}`; },
    maxLen: 6
  }
];
