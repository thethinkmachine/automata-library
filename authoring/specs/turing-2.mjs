// More Turing machines: computing on one tape, Sipser's element distinctness,
// and what a second tape buys.

const shape = (w, letters) => {
  const m = w.match(new RegExp('^' + [...letters].map(l => `(${l}*)`).join('') + '$'));
  return m ? m.slice(1).map(x => x.length) : null;
};
const balanced = w => { let d = 0; for (const c of w) { d += c === '(' ? 1 : -1; if (d < 0) return false; } return d === 0; };

export default [
  {
    type: 'TM',
    title: 'Say every letter twice',
    blurb: 'ab becomes aabb. There is no room to insert a letter in place, so the machine builds the answer beyond a # at the right: for each letter, mark it, carry it to the end and write it twice. Then it wipes out the original and the # — what is left is the doubled word.',
    tags: ['computing-a-function', 'copying', 'markers'], level: 'intermediate',
    sigma: 'ab', accept: 'done',
    delta: `next a/X,R carryA; next b/Y,R carryB; next #/_,L wipe; next _/=,S done
            carryA a,b/=,R carryA; carryA #/=,R pastA; carryA _/#,R firstA; firstA _/a,R putA
            pastA a,b/=,R pastA; pastA _/a,R putA; putA _/a,L home
            carryB a,b/=,R carryB; carryB #/=,R pastB; carryB _/#,R firstB; firstB _/b,R putB
            pastB a,b/=,R pastB; pastB _/b,R putB; putB _/b,L home
            home a,b,#/=,L home; home X,Y/=,R next
            wipe X,Y/_,L wipe; wipe _/=,S done`,
    lang: w => /^[ab]*$/.test(w),
    tape: w => [...w].map(c => c + c).join('')
  },
  {
    type: 'ITM',
    title: 'Binary to unary: counting down',
    blurb: 'Input n in binary; output n ones. Subtract 1 from the binary number, add a mark at the far left, and repeat until the number is all zeros; then erase it and turn the marks into 1s. The output is exponentially longer than the input, and so is the running time — there is no faster way to write it.',
    tags: ['binary-numbers', 'unary', 'number-bases', 'exponential'], level: 'intermediate',
    sigma: '01', start: 'scan0', accept: 'done',
    delta: `scan0 0/=,R scan0; scan0 1/=,R scan1; scan0 _/=,L zero
            scan1 0,1/=,R scan1; scan1 _/=,L dec
            dec 0/1,L dec; dec 1/0,L mark
            mark 0,1,x/=,L mark; mark _/x,R back
            back x/=,R back; back 0,1/=,S scan0
            zero 0/_,L zero; zero x/1,L conv; zero _/=,S done
            conv x/1,L conv; conv _/=,S done`,
    lang: w => /^[01]*$/.test(w),
    tape: w => '1'.repeat(parseInt(w || '0', 2)),
    label: w => (w ? `${parseInt(w, 2)}` : '0'),
    maxLen: 7, randomCount: 40, randomMax: 8
  },
  {
    type: 'ITM',
    title: 'Unary remainder: a mod b',
    blurb: 'Input 1ᵃ#1ᵇ; output 1^(a mod b). Each round crosses off b ones of a, pairing them one at a time with the ones of b; a completed round is subtraction, and b is restored for the next. When a runs out in the middle of a round, the ones crossed in that round are the remainder.',
    tags: ['arithmetic', 'unary', 'division', 'computing-a-function'], level: 'advanced',
    sigma: '1#', start: 's0', accept: 'done',
    delta: `s0 1/=,R s0; s0 #/=,R s1
            s1 1/=,R sb; sb 1/=,R sb; sb _/=,L s2
            s2 1,#/=,L s2; s2 _/=,R findb
            findb 1,x,z/=,R findb; findb #/=,R inb
            inb y/=,R inb; inb 1/y,L finda; inb _/=,L round
            finda y/=,L finda; finda #/=,L ina
            ina z,x/=,L ina; ina 1/z,R findb; ina _/=,R rem
            round y/1,L round; round #/=,L conv
            conv x/=,L conv; conv z/x,L conv; conv 1,_/=,R findb
            rem z/1,R rem; rem x,#,y,1/_,R rem; rem _/=,S done`,
    pos: { s0: [0, 0], s1: [1.2, 0], sb: [2.4, 0], s2: [3.6, 0], findb: [1, 1.5], inb: [3, 1.5], finda: [3, 2.8], ina: [1, 2.8], round: [4.6, 1.8], conv: [4.6, 3.2], rem: [0, 4], done: [1.6, 4] },
    pitch: 160,
    lang: w => /^1*#1+$/.test(w),
    tape: w => { const [a, b] = w.split('#').map(x => x.length); return '1'.repeat(a % b); },
    label: w => { const p = w.split('#'); return p.length === 2 ? `${p[0].length} mod ${p[1].length}` : ''; },
    maxLen: 9
  },
  {
    type: 'TM', chapter: 'Sipser, Introduction to the Theory of Computation, §3.1 (M4)',
    title: 'Sipser’s M4: are the strings all different?',
    blurb: 'Input #x₁#x₂…#xₗ, each xᵢ a binary string; accept if no two are equal. Two of the #s carry marks (x and y) naming the pair being compared; the machine compares the strings after them by zigzagging, then moves the marks on to the next pair, until every pair has been checked.',
    tags: ['textbook', 'sipser', 'element-distinctness', 'zigzag'], level: 'advanced',
    sigma: '01#', start: 's', accept: 'acc',
    delta: `s #/x,R m2; s _/=,S acc
            m2 0,1/=,R m2; m2 #/y,L c0; m2 _/=,S acc
            c0 0,1,o,i,#,y/=,L c0; c0 x/=,R c1
            c1 o,i/=,R c1; c1 0/o,R g0; c1 1/i,R g1; c1 #/=,R ld; c1 y/=,R lr
            g0 0,1,o,i,#/=,R g0; g0 y/=,R h0
            h0 o,i/=,R h0; h0 0/o,L c0; h0 1,#,_/=,L rs
            g1 0,1,o,i,#/=,R g1; g1 y/=,R h1
            h1 o,i/=,R h1; h1 1/i,L c0; h1 0,#,_/=,L rs
            ld 0,1,o,i,#/=,R ld; ld y/=,R lr
            lr o,i/=,R lr; lr 0,1/=,L rs
            rs o/0,L rs; rs i/1,L rs; rs 0,1,#,y,_/=,L rs; rs x/=,R adv
            adv 0,1,#/=,R adv; adv y/#,R adv2
            adv2 0,1/=,R adv2; adv2 #/y,L c0; adv2 _/=,L adv3
            adv3 0,1,#/=,L adv3; adv3 x/#,R adv4
            adv4 0,1/=,R adv4; adv4 #/x,R adv5
            adv5 0,1/=,R adv5; adv5 #/y,L c0; adv5 _/=,S acc`,
    pos: { s: [0, 0], m2: [1, 0], acc: [6, 0], c0: [1, 1.3], c1: [2, 1.3], g0: [3, 0.7], h0: [4, 0.7], g1: [3, 1.9], h1: [4, 1.9], ld: [2, 2.7], lr: [3, 2.7], rs: [5, 1.8], adv: [5.5, 3], adv2: [4.5, 3.6], adv3: [3.4, 3.9], adv4: [2.3, 3.9], adv5: [1.2, 3.5] },
    pitch: 160,
    lang: w => { if (w === '') return true; if (w[0] !== '#') return false; const p = w.slice(1).split('#'); return new Set(p).size === p.length; },
    tests: ['#0#1', '#01#10#11', '#0#01#1', '#1#1', '#0#1#0', '##', '#', '#10#10#0'],
    maxLen: 7
  },
  {
    type: 'MTM',
    title: 'aⁿbⁿcⁿ in one pass, with two tapes',
    blurb: 'The second tape is a ruler. Each a draws a mark on it; each b steps the ruler’s head back over one mark; each c steps it forward again. One left-to-right sweep, so linear time — where a single tape must zigzag and takes time proportional to n².',
    tags: ['multi-tape', 'linear-time', 'counting'], level: 'intermediate',
    sigma: 'abc', start: 'q0', accept: 'acc',
    delta: `q0 a,_/=,>/S,R as; q0 _,_/=,=/S,S acc
            as a,_/=,X/R,R as; as b,_/=,=/S,L bs
            bs b,X/=,=/R,L bs; bs c,>/=,=/S,R cs
            cs c,X/=,=/R,R cs; cs _,_/=,=/S,S acc`,
    lang: w => { const s = shape(w, 'abc'); return !!s && s[0] === s[1] && s[1] === s[2]; },
    gen: n => 'a'.repeat(n) + 'b'.repeat(n) + 'c'.repeat(n)
  },
  {
    type: 'MTM',
    title: 'Balanced parentheses, with a second tape for a stack',
    blurb: 'A Turing machine has no stack, but a second tape is one: write a mark and step right for each (, step left and erase for each ). One pass, against the one-tape machine’s walking back and forth to find each partner.',
    tags: ['multi-tape', 'parentheses', 'stack'], level: 'intro',
    sigma: '()', start: 'q0', accept: 'acc',
    delta: `q0 Σ,_/=,>/S,R run
            run (,_/=,X/R,R run; run ),_/=,=/S,L pop
            pop Σ,X/=,_/S,S popped
            popped ),_/=,=/R,S run
            run _,_/=,=/S,L end; end _,>/=,=/S,S acc`,
    lang: balanced,
    gen: n => ['()', '(())', '()()', '(()())'][n % 4].repeat(1 + (n >> 2))
  }
];
