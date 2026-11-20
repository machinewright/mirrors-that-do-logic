// A small gadget board from an ASCII map (src/maps.js). data-map: rows separated by spaces.
// data-labels: "x,y=text;x,y=text" (targets labelled this way are named in the readout).
import { parseMap } from '../src/maps.js';
import { targets } from '../src/engine.js';
import { drawBoard, makeCanvas, isMirror, startState } from '../src/view.js';

export function mount(el, opts) {
  const g = parseMap(opts.map.trim().split(/\s+/)), goal = targets(g);
  const labels = new Map((opts.labels || '').split(';').filter(Boolean).map((s) => {
    const [xy, text] = s.split('='); const [x, y] = xy.split(',').map(Number); return [y * g.w + x, text];
  }));
  // "short|long": the board shows the short label, the readout the long name
  const names = new Map([...labels].map(([k, v]) => [k, v.split('|').pop()]));
  for (const [k, v] of labels) labels.set(k, v.split('|')[0]);
  let state = startState(g);
  const view = makeCanvas(g, { label: opts.alt || 'A small gadget board. Click the mirror to flip it.', onActivate: (i) => { if (isMirror(g.cells[i])) { state[i] ^= 1; view.redraw(); } } });
  view.canvas.classList.add('small'); view.canvas.style.maxWidth = `${Math.min(340, g.w * 50)}px`;
  const readout = document.createElement('p'); readout.className = 'readout'; readout.setAttribute('role', 'status'); readout.setAttribute('aria-live', 'polite');
  el.append(view.canvas, readout);
  view.setDraw(() => {
    const t = drawBoard(view.canvas, g, state, { focus: view.cursor, fadeUnreached: false, labels });
    const named = goal.filter((k) => labels.has(k));
    const on = named.filter((k) => t.litReal.has(k)).map((k) => `<b>${names.get(k)}</b>`);
    readout.innerHTML = (opts.say ? opts.say + ' ' : '') + (named.length
      ? `Lit: ${on.length ? on.join(', ') : 'nothing'}.`
      : `Targets lit: <span class="num">${goal.filter((k) => t.litReal.has(k)).length}</span> of ${goal.length}.`);
  });
}
