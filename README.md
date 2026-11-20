# mirror-sat (working title)

Second interactive essay in the mirror-puzzle series (after ../proving-par): **why no fast solver is expected**.
The reader builds logic out of mirrors (wire, fan-out with splitters, crossings, OR at a target), then watches any
3-SAT formula compile into a board that can be lit exactly when the formula is satisfiable. So a fast general
solver for the puzzle would be a fast SAT solver (NP-hardness by reduction, taught on a puzzle you play).

Status: feasibility prototype.
- `proto/compile.mjs`: CNF -> board. Only the n variable mirrors matter; every other piece may be flipped, but
  flipping one can only remove light (it sends a beam into a wall or off the board).
- `proto/verify.mjs [seed]`: brute force over all piece orientations on random small CNFs: solvable iff SAT.
  2026-11-20: 2,551 formulas (361 unsatisfiable), no mismatch.
