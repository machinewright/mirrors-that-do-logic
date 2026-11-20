// Compile a CNF formula into a mirror board: lit-all-targets <=> formula satisfiable.
// Literals: +v / -v (1-based). Layout: variable i owns rows 3i (TRUE bus), 3i+1 (emitter row), 3i+2 (FALSE bus).
// Clause j owns columns base..base+2 (one per literal) plus a wall column after it; targets in the bottom row.
import { makeGrid, EMITTER, MIRROR, SPLITTER, TARGET, WALL } from './engine.js';
export function compile(n, clauses, { fixed = false } = {}) {
  const m = clauses.length, w = 2 + 4 * m, h = 3 * n + 1, Y = h - 1;
  const g = makeGrid(w, h);
  const set = (x, y, c) => { g.cells[y * w + x] = c; };
  const piece = (type, rot) => ({ type, rot, ...(fixed ? { fixed: true } : {}) });
  const vars = [];
  for (let i = 0; i < n; i++) {
    const r = 3 * i + 1;
    set(0, r, { type: EMITTER, dir: 1 });
    set(1, r, { type: MIRROR, rot: 0 }); vars.push(r * w + 1);            // '/' = TRUE (light goes up)
    set(1, r - 1, piece(MIRROR, 0));                                      // up -> right onto TRUE bus
    set(1, r + 1, piece(MIRROR, 1));                                      // down -> right onto FALSE bus
  }
  clauses.forEach((cl, j) => {
    const base = 2 + 4 * j;
    cl.forEach((lit, k) => {
      const v = Math.abs(lit) - 1, row = lit > 0 ? 3 * v : 3 * v + 2;
      set(base + k, row, piece(SPLITTER, 1));                             // right -> down (and passes on)
    });
    const c = base + 1;
    set(c, Y, { type: TARGET });
    set(c - 1, Y, piece(MIRROR, 1));                                      // down -> right into target
    if (cl.length > 2) set(c + 1, Y, piece(MIRROR, 0));                   // down -> left into target
    set(base + 3, Y, { type: WALL });
  });
  return { g, vars };
}
