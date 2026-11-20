// Log-scale chart: median search positions the essay-1 solver (ghost light on) needs to show that a compiled random
// 3-SAT board (about 4.26 clauses per variable) has no solution, vs. 2^n (trying every switch setting).
// Data from proto/scaling.mjs (see src/scaling-data.js). Hover/focus a point for its numbers; a table follows.
import { SCALING } from '../src/scaling-data.js';
const NS = 'http://www.w3.org/2000/svg';
export function mount(el) {
  const W = 620, H = 300, L = 56, R = 110, T = 16, B = 44;
  const ns = SCALING.rows.map((r) => r.n), n0 = Math.min(...ns), n1 = Math.max(...ns);
  const yMax = Math.ceil(Math.log10(2 ** n1)), x = (n) => L + (n - n0) / (n1 - n0) * (W - L - R);
  const y = (v) => T + (1 - Math.log10(v) / yMax) * (H - T - B);
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.classList.add('chart');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Line chart on a log scale. Search positions needed grow steadily with the number of variables, but stay far below 2 to the n.');
  const add = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; svg.append(e); return e; };
  for (let p = 0; p <= yMax; p++) {
    add('line', { x1: L, x2: W - R, y1: y(10 ** p), y2: y(10 ** p), class: 'grid' });
    add('text', { x: L - 8, y: y(10 ** p) + 4, class: 'tick', 'text-anchor': 'end' }, p >= 6 ? `${10 ** (p - 6)}M` : p >= 3 ? `${10 ** (p - 3)}k` : String(10 ** p));
  }
  for (const n of ns) add('text', { x: x(n), y: H - B + 18, class: 'tick', 'text-anchor': 'middle' }, n);
  add('text', { x: (L + W - R) / 2, y: H - 6, class: 'axis', 'text-anchor': 'middle' }, 'variables in the formula');
  const path = (pts) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(1)},${b.toFixed(1)}`).join('');
  add('path', { d: path(ns.map((n) => [x(n), y(2 ** n)])), class: 'ref' });
  add('text', { x: W - R + 8, y: y(2 ** n1) + 4, class: 'label' }, '2ⁿ');
  const rows = SCALING.rows;
  add('path', { d: path(rows.map((r) => [x(r.n), y(r.unsat)])), class: 'series' });
  add('text', { x: W - R + 8, y: y(rows.at(-1).unsat) + 4, class: 'label strong' }, 'ghost light');
  const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; tip.setAttribute('aria-hidden', 'true');
  rows.forEach((r) => {
    const show = () => {
      tip.hidden = false;
      tip.innerHTML = `<b>${r.n} variables</b>, ${r.m} clauses<br>${r.unsat.toLocaleString('en-US')} positions (median of ${r.k} unsatisfiable formulas)<br>2<sup>${r.n}</sup> = ${(2 ** r.n).toLocaleString('en-US')}`;
      const bb = svg.getBoundingClientRect(), s = bb.width / W;
      tip.style.left = `${Math.min(x(r.n) * s, bb.width - 230)}px`; tip.style.top = `${y(r.unsat) * s + 12}px`;
    };
    add('circle', { cx: x(r.n), cy: y(r.unsat), r: 4.5, class: 'dot' });
    const hit = add('circle', { cx: x(r.n), cy: y(r.unsat), r: 14, class: 'hit', tabindex: 0, role: 'img',
      'aria-label': `${r.n} variables, ${r.m} clauses: ${r.unsat.toLocaleString('en-US')} positions (median of ${r.k}); 2 to the ${r.n} is ${(2 ** r.n).toLocaleString('en-US')}` });
    hit.addEventListener('mouseenter', show); hit.addEventListener('focus', show);
    hit.addEventListener('mouseleave', () => { tip.hidden = true; }); hit.addEventListener('blur', () => { tip.hidden = true; });
  });
  const wrap = document.createElement('div'); wrap.className = 'chart-wrap'; wrap.append(svg, tip);
  const table = document.createElement('details');
  table.innerHTML = `<summary>Table</summary><table class="data"><thead><tr><th>variables</th><th>clauses</th><th>median positions</th><th>2<sup>n</sup></th><th>formulas</th></tr></thead><tbody>${
    rows.map((r) => `<tr><td>${r.n}</td><td>${r.m}</td><td>${r.unsat.toLocaleString('en-US')}</td><td>${(2 ** r.n).toLocaleString('en-US')}</td><td>${r.k}</td></tr>`).join('')}</tbody></table>`;
  const cap = document.createElement('p'); cap.className = 'note';
  cap.textContent = `${SCALING.caption} Dashed line: 2ⁿ, the number of ways to set the switches.`;
  el.append(wrap, cap, table);
}
