// Tiny CNF parser/formatter. Input: clauses joined by '&', ',', ';', 'and' or newlines; literals joined by '|', 'or'
// or spaces; negation by '!', '~', '-', '¬' or 'not'. Variable names: letters, digits, underscore (start with a letter).
// Returns { names: ['x','y',...], clauses: [[+1,-2], ...] } (1-based signed indices) or throws Error with a message.
export function parseCNF(text, { maxVars = 8, maxClauses = 10 } = {}) {
  const names = [], idx = new Map(), clauses = [];
  const src = text.replace(/∧/g, '&').replace(/∨/g, '|').replace(/\band\b/gi, '&').replace(/\bor\b/gi, '|').replace(/\bnot\s+/gi, '!');
  for (const part of src.split(/[&,;\n]/)) {
    const body = part.replace(/[()]/g, ' ').trim();
    if (!body) continue;
    const lits = [];
    for (const tok of body.split(/[|\s]+/).filter(Boolean)) {
      const m = /^([!~¬-]*)([A-Za-z][A-Za-z0-9_]*)$/.exec(tok);
      if (!m) throw new Error(`I don't understand "${tok}".`);
      let k = idx.get(m[2]);
      if (k === undefined) { names.push(m[2]); k = names.length; idx.set(m[2], k); }
      const lit = m[1].length % 2 ? -k : k;
      if (!lits.includes(lit)) lits.push(lit);
    }
    if (lits.length > 3) throw new Error(`Each clause can have at most three literals ("${body}" has ${lits.length}).`);
    clauses.push(lits);
  }
  if (!clauses.length) throw new Error('Type at least one clause, like  x | !y.');
  if (names.length > maxVars) throw new Error(`At most ${maxVars} variables, please (the board gets tall).`);
  if (clauses.length > maxClauses) throw new Error(`At most ${maxClauses} clauses, please (the board gets wide).`);
  return { names, clauses };
}
export const litText = (names, l) => (l < 0 ? '¬' : '') + names[Math.abs(l) - 1];
export const clauseText = (names, c) => c.map((l) => litText(names, l)).join(' ∨ ');
export const holds = (c, val) => c.some((l) => val[Math.abs(l) - 1] === l > 0);
export function satisfiable(n, clauses) {
  for (let a = 0; a < 1 << n; a++) {
    const val = Array.from({ length: n }, (_, i) => ((a >> i) & 1) === 1);
    if (clauses.every((c) => holds(c, val))) return val;
  }
  return null;
}
