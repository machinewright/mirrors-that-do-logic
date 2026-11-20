// The centrepiece: type a formula, get a board. Flip the variable mirrors; a clause's target lights up exactly
// when the clause is true. Options (data-*): formula, unbolt ("1": every piece flippable), solver ("1": show the button).
import { parseCNF, clauseText, satisfiable } from '../src/cnf.js';
import { compile } from '../src/compile.js';
import { targets } from '../src/engine.js';
import { drawBoard, makeCanvas, isMirror, startState } from '../src/view.js';
import { UNDECIDED } from '../src/ghost.js';

export function mount(el, opts = {}) {
  const form = document.createElement('form'); form.className = 'controls';
  const input = document.createElement('input'); input.type = 'text'; input.value = opts.formula || '(x ∨ y) ∧ (¬x ∨ z) ∧ (¬y ∨ ¬z) ∧ (x ∨ ¬z)';
  input.className = 'formula'; input.setAttribute('aria-label', 'Formula'); input.spellcheck = false;
  const go = button('Build the board', null); go.type = 'submit'; go.className = 'primary';
  form.append(input, go);
  const err = document.createElement('p'); err.className = 'note bad'; err.setAttribute('role', 'alert');
  const chips = document.createElement('p'); chips.className = 'chips';
  const holder = document.createElement('div');
  const controls = document.createElement('div'); controls.className = 'controls';
  const readout = document.createElement('p'); readout.className = 'readout'; readout.setAttribute('role', 'status'); readout.setAttribute('aria-live', 'polite');
  if (opts.presets) { // "label=formula;label=formula"
    const row = document.createElement('div'); row.className = 'controls presets';
    for (const p of opts.presets.split(';')) {
      const [name, formula] = p.split('=');
      row.append(button(name, () => { input.value = formula; build(); }));
    }
    form.after(row);
    el.append(form, row, err, chips, holder, controls, readout);
  } else el.append(form, err, chips, holder, controls, readout);
  if (opts.locked === '1') form.style.display = 'none';
  let f, g, vars, goal, state, view;
  const ghostMode = opts.ghost === '1'; // switches start undecided; clicks cycle undecided -> true -> false

  form.onsubmit = (e) => { e.preventDefault(); build(); };
  function build() {
    try { f = parseCNF(input.value); } catch (e) { err.textContent = e.message; return; }
    err.textContent = '';
    ({ g, vars } = compile(f.names.length, f.clauses, { fixed: opts.unbolt !== '1' }));
    goal = targets(g); state = startState(g);
    if (ghostMode) vars.forEach((c) => { state[c] = UNDECIDED; });
    view = makeCanvas(g, { label: `Board for the formula ${input.value}. Arrow keys move between the switch mirrors; Enter flips one.`, onActivate });
    view.canvas.classList.add('wide-board'); view.canvas.style.maxWidth = `${g.w * 46}px`;
    holder.replaceChildren(view.canvas);
    controls.replaceChildren(button('All true', () => setAll(0)), button('All false', () => setAll(1)));
    if (ghostMode) controls.append(button('All undecided', () => setAll(UNDECIDED)));
    if (opts.solver === '1') controls.append(button('Ask: can it be solved?', ask));
    view.setDraw(redraw);
  }
  function setAll(rot) { vars.forEach((c) => { state[c] = rot; }); view.redraw(); }
  const valText = (i) => (state[vars[i]] === UNDECIDED ? 'undecided' : state[vars[i]] === 0 ? 'true' : 'false');
  function onActivate(i) {
    if (!isMirror(g.cells[i])) return;
    state[i] = ghostMode && vars.includes(i) ? (state[i] === UNDECIDED ? 0 : state[i] === 0 ? 1 : UNDECIDED) : state[i] ^ 1;
    view.redraw();
  }
  function redraw() {
    const t = drawBoard(view.canvas, g, state, { focus: view.cursor, fadeUnreached: false, labels: labelsOf(), ghosts: ghostMode });
    const lit = goal.map((k) => t.litReal.has(k)), lost = goal.map((k) => ghostMode && !t.lit.has(k));
    chips.innerHTML = f.clauses.map((c, j) => `<span class="chip ${lit[j] ? 'on' : lost[j] ? 'dead' : ''}">${j + 1}: ${clauseText(f.names, c)}</span>`).join(' ∧ ');
    const n = lit.filter(Boolean).length, assign = f.names.map((v, i) => `${v} = ${valText(i)}`).join(', ');
    const dead = goal.map((k, j) => (t.lit.has(k) ? 0 : j + 1)).filter(Boolean);
    if (ghostMode && dead.length) {
      readout.innerHTML = `${assign}. <span class="bad">Clause ${dead.join(', ')} can't be lit</span>, whatever the undecided switches do. A solver backs up here.`;
    } else if (ghostMode && vars.some((c) => state[c] === UNDECIDED)) {
      readout.innerHTML = `${assign}. Every target can still get light (solid or dashed), so a solver would keep going.`;
    } else {
      readout.innerHTML = `${assign}. Targets lit: <span class="num">${n}</span> of ${goal.length}.`
        + (n === goal.length ? ' <span class="good">Every target is lit, so this assignment makes the whole formula true.</span>' : '');
    }
  }
  let labelCache; function labelsOf() {
    if (labelCache?.g === g) return labelCache.m;
    const m = new Map(); // the TRUE line of x is labelled x, its FALSE line ¬x (in the empty left column)
    goal.forEach((t, j) => m.set(t, String(j + 1)));
    vars.forEach((c, i) => { m.set(c - g.w - 1, f.names[i]); m.set(c + g.w - 1, '¬' + f.names[i]); });
    labelCache = { g, m }; return m;
  }
  function ask() {
    const model = satisfiable(f.names.length, f.clauses);
    readout.innerHTML = model
      ? `<span class="good">Yes.</span> For example ${f.names.map((v, i) => `${v} = ${model[i]}`).join(', ')}.`
      : `<span class="bad">No.</span> No setting of the mirrors lights every target, because no assignment makes the formula true.`;
  }
  build();
}
function button(text, fn) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; if (fn) b.onclick = fn; return b; }
