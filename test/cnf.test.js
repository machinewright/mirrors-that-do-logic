import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCNF, clauseText, satisfiable } from '../src/cnf.js';
import { compile } from '../src/compile.js';
import { trace, targets } from '../src/engine.js';

test('parses the usual notations', () => {
  const f = parseCNF('(x ∨ ¬y) ∧ (y | !z), not x or z');
  assert.deepEqual(f.names, ['x', 'y', 'z']);
  assert.deepEqual(f.clauses, [[1, -2], [2, -3], [-1, 3]]);
  assert.equal(clauseText(f.names, f.clauses[0]), 'x ∨ ¬y');
  assert.throws(() => parseCNF('a | b | c | d'), /at most three/);
  assert.throws(() => parseCNF(' '), /at least one/);
  assert.throws(() => parseCNF('x | 3y'), /understand/);
});

test('board with variable mirrors set from an assignment lights exactly the satisfied clauses', () => {
  const f = parseCNF('x|y|!z, !x|z, !y|!z, x|!z, !x|!y|z');
  const { g, vars } = compile(f.names.length, f.clauses);
  for (let a = 0; a < 8; a++) {
    const val = [0, 1, 2].map((i) => ((a >> i) & 1) === 1);
    vars.forEach((cell, i) => { g.cells[cell].rot = val[i] ? 0 : 1; });
    const lit = trace(g).lit, ts = targets(g);
    f.clauses.forEach((c, j) => assert.equal(lit.has(ts[j]), c.some((l) => val[Math.abs(l) - 1] === l > 0)));
  }
});

test('satisfiable() finds a model or null', () => {
  assert.ok(satisfiable(2, [[1, 2], [-1]]));
  assert.equal(satisfiable(2, [[1, 2], [1, -2], [-1, 2], [-1, -2]]), null);
});

test('parser: not(x), empty clauses, negated groups', () => {
  assert.deepEqual(parseCNF('not(x) | y').clauses, [[-1, 2]]);
  assert.deepEqual(parseCNF('!(x) & ~ y').clauses, [[-1], [-2]]);
  assert.deepEqual(parseCNF('x | nothing').names, ['x', 'nothing']);
  assert.throws(() => parseCNF('not(x | y)'), /one variable at a time/);
  assert.throws(() => parseCNF('x & |'), /no variables/);
});
