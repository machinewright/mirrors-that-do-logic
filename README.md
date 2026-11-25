# Mirrors that do logic

Interactive essay, sequel to [How do you know 7 is the best?](https://machinewright.github.io/proving-par/): why no program is expected to solve
every mirror puzzle fast. The reader builds logic out of mirrors (switch, fan-out with splitters, free crossings, OR at
a target), compiles any 3-CNF formula into a playable board, tries to cheat by unbolting the plumbing, and sees ghost
light (essay 1's pruning) slow but not stop the exponential growth on hard formulas.

Live: https://machinewright.github.io/mirrors-that-do-logic/ . Plain HTML/JS modules, no build step. Locally: `python3 -m http.server 8773`, open /.

- `src/compile.js`: CNF -> board (n variables, m clauses -> (4m+2) x (3n+1)). Flipping any non-switch piece only sends
  light off the board or into a wall, so the board can be fully lit iff the formula is satisfiable.
- `proto/verify.mjs [seed]`: brute force over every orientation of every piece on random small CNFs (seed 1: 2,568
  formulas with up to three variables, 955 unsatisfiable, no mismatch; about 5 minutes).
- `proto/scaling-unsat.mjs`: search positions of the essay-1 solver on unsatisfiable random 3-CNFs at 4.26 clauses
  per variable; writes `src/scaling-data.js` for the chart.
- Widgets: `gadget` (ASCII-map boards, `src/maps.js`), `compiler` (data-formula, data-presets, data-solver, data-unbolt,
  data-ghost, data-locked), `scaling` (log chart + table).
- `scripts/og.py` renders og.png; `scripts/publish.sh` publishes to GitHub Pages.
- Engine, ghost tracer, solver and renderer come from proving-par (renderer extended with splitters, bolted pieces, labels).
