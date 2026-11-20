// How many search nodes does the essay-1 solver need on compiled boards of unsatisfiable random 3-CNFs?
import { compile } from '../src/compile.js';
import { solve } from '../src/solver.js';
import { satisfiable } from '../src/cnf.js';
let seed = 12345;
const rnd = (k) => { // mulberry32
  seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 4294967296 * k) | 0;
};
const fixed = process.argv[2] !== 'unbolt';
for (let n = 3; n <= 14; n++) {
  const m = Math.round(5 * n), rows = [];
  for (let t = 0, got = 0; t < 400 && got < 5; t++) {
    const cls = Array.from({ length: m }, () => { const vs = new Set(); while (vs.size < 3) vs.add(1 + rnd(n)); return [...vs].map((v) => (rnd(2) ? v : -v)); });
    if (satisfiable(n, cls)) continue;
    got++;
    const { g } = compile(n, cls, { fixed });
    const a = solve(g, { maxNodes: 5e6 }), b = solve(g, { maxNodes: 5e6, ghost: false });
    rows.push([a.nodes, b.nodes, a.moves, a.exhausted]);
  }
  const avg = (k) => Math.round(rows.reduce((s, r) => s + r[k], 0) / rows.length);
  console.log(`n=${n} m=${m} unsat=${rows.length} ghost-on nodes avg ${avg(0)}  ghost-off ${avg(1)}  2^n=${2 ** n}`, rows.some((r) => r[2] !== null || r[3]) ? 'CHECK' : '');
}
