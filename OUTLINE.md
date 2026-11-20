# Outline: "Mirrors that do logic" (working title; alt: "Why no one can solve every mirror puzzle fast")

Sequel to "How do you know 7 is the best?" (proving-par). That essay showed how a solver proves par fast on real
boards. This one answers the reader's obvious next question: could a cleverer program be fast on *every* board?
Probably not, and the reader sees why with their own hands: the puzzle can encode logic (an NP-hardness reduction
from 3-SAT, taught as gadgets you play with).

Originality check (2026-11-20): searched for interactive/playable NP-hardness reductions. Found papers (LaserTank is
NP-complete, Reflexion, Kaye's Minesweeper, Demaine's surveys and MIT course videos), the OpenDSA NP-completeness
tutorial (abstract problems, no puzzle), and trainyard.isnphard.com (a research companion that compiles small formulas
into Trainyard levels). No essay teaches a reduction by letting the reader build the gadgets and play the compiled
board of a puzzle they already know. The construction itself is textbook-simple and not new research; say so.

1. Hook. The essay-1 solver is fast here, but its worst case is exponential. Is that a flaw in the solver?
2. A switch: one lamp, one mirror. '/' sends light up (call it TRUE), '\' down (FALSE). [widget: switch]
3. Copy: a splitter passes light AND reflects it, so one signal feeds many places. [widget: fan-out]
4. Crossings are free: beams pass through each other. (Many hardness proofs need a crossover gadget; we don't.)
5. OR: a target can be lit from several sides. Three wires into one target = a clause. [widget: clause]
6. The compiler: type any formula, get a board; play it; ask whether it can be solved. Presets incl. unsatisfiable. [compiler]
7. Can you cheat? Unbolt every piece. Flipping plumbing only sends light into a wall or off the board, never toward a
   target. Checked by brute force on 2,551 random formulas (361 unsatisfiable). [compiler data-unbolt]
8. So what: a fast solver for all mirror boards would be a fast SAT solver (board size (2+4m) x (3n+1), polynomial).
   That's P vs NP. Caveats: worst case only; generated puzzles are easy; "fewest flips" is at least as hard.
9. Back to ghost light: on compiled boards ghost light proves nothing (every clause can see light both ways), so the
   solver falls back to search: node counts double per variable on unsatisfiable formulas. [chart, measured]
10. Related work + credits.
