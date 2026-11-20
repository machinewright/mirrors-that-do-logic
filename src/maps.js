// ASCII maps for small gadget boards.
//   .  empty   #  wall   T  target   > v < ^  lamp facing that way
//   / \  mirror (flippable)          F B  mirror '/' '\' bolted down
//   s z  splitter '/' '\' (flippable) S Z  splitter '/' '\' bolted down
import { makeGrid, EMITTER, MIRROR, SPLITTER, TARGET, WALL } from './engine.js';
export function parseMap(rows) {
  const h = rows.length, w = rows[0].length, g = makeGrid(w, h);
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const c = {
      '#': { type: WALL }, T: { type: TARGET },
      '/': { type: MIRROR, rot: 0 }, '\\': { type: MIRROR, rot: 1 },
      F: { type: MIRROR, rot: 0, fixed: true }, B: { type: MIRROR, rot: 1, fixed: true },
      s: { type: SPLITTER, rot: 0 }, z: { type: SPLITTER, rot: 1 },
      S: { type: SPLITTER, rot: 0, fixed: true }, Z: { type: SPLITTER, rot: 1, fixed: true },
    }[ch] ?? ('^>v<'.includes(ch) ? { type: EMITTER, dir: '^>v<'.indexOf(ch) } : null);
    if (c) g.cells[y * w + x] = c;
  }));
  return g;
}
