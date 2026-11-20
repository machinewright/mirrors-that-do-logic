// Search nodes of the essay-1 solver (ghost light on) on compiled random 3-CNFs at the hard ratio m ≈ 4.26 n.
import { compile } from '../src/compile.js';
import { solve } from '../src/solver.js';
let seed = +(process.argv[2] || 99);
const rnd = (k) => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return (((t ^ (t >>> 14)) >>> 0) / 4294967296 * k) | 0; };
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : NaN; };
for (const n of (process.argv[3] || "6,8,10,12,14,16,18,20,22,24,26").split(",").map(Number)) {
  const m = Math.round(4.26 * n), sat = [], unsat = []; let out = 0; const t0 = Date.now();
  for (let k = 0; k < +(process.argv[4] || 9); k++) {
    const cls = Array.from({ length: m }, () => { const vs = new Set(); while (vs.size < 3) vs.add(1 + rnd(n)); return [...vs].map((v) => (rnd(2) ? v : -v)); });
    const r = solve(compile(n, cls, { fixed: true }).g, { maxNodes: 3e7 });
    if (r.exhausted) out++; else (r.moves === null ? unsat : sat).push(r.nodes);
  }
  console.log(`n=${n} m=${m} board ${2 + 4 * m}x${3 * n + 1}: unsat ${unsat.length} median nodes ${med(unsat)} | sat ${sat.length} median ${med(sat)} | over budget ${out} | ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
