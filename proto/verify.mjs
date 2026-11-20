// Brute force: for random small CNFs, the board (every mirror/splitter flippable) is solvable iff the formula is SAT.
import { compile } from '../src/compile.js';
import { trace, targets } from '../src/engine.js';
let seed = +(process.argv[2] || 1);
const rnd = (k) => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >>> 8) % k; };
const sat = (n, cls) => { for (let a = 0; a < 1 << n; a++) if (cls.every((c) => c.some((l) => ((a >> (Math.abs(l) - 1)) & 1) === (l > 0 ? 1 : 0)))) return true; return false; };
let cases = 0, sats = 0;
for (let t = 0; t < 3000; t++) {
  const n = 1 + rnd(3), m = 1 + rnd(5);
  const cls = Array.from({ length: m }, () => { const vs = new Set(); const wd = 1 + rnd(Math.min(3, n)); while (vs.size < wd) vs.add(1 + rnd(n)); return [...vs].map((v) => (rnd(2) ? v : -v)); });
  const { g } = compile(n, cls);
  const flip = g.cells.map((c, i) => (c.type === 'mirror' || c.type === 'splitter' ? i : -1)).filter((i) => i >= 0);
  if (flip.length > 20) continue;
  const goal = targets(g); let solvable = false;
  for (let s = 0; s < 1 << flip.length && !solvable; s++) {
    flip.forEach((i, b) => { g.cells[i].rot = ((s >> b) & 1); });
    const lit = trace(g).lit; if (goal.every((k) => lit.has(k))) solvable = true;
  }
  const want = sat(n, cls); cases++; sats += want;
  if (solvable !== want) { console.log('MISMATCH', n, JSON.stringify(cls), { solvable, want }); process.exit(1); }
}
console.log(`ok: ${cases} formulas (${sats} satisfiable), solvable iff SAT with every piece flippable`);
