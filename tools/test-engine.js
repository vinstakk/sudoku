// Prüft die Sudoku-Engine: node tools/test-engine.js [anzahl] [16]
const S = require('../js/sudoku.js');
const count = +process.argv[2] || 30;
const with16 = process.argv.includes('16');
let fail = 0;
function check(cond, msg) { if (!cond) { fail++; console.error('FEHLER:', msg); } }

function validSolution(N, sol) {
  const g = S.geo(N);
  for (const u of g.units) { const s = new Set(u.map(i => sol[i])); if (s.size !== N || s.has(0)) return false; }
  return true;
}

function run(N, diff, n) {
  const times = [], clues = [], tech = {};
  for (let k = 0; k < n; k++) {
    const t = Date.now();
    const p = S.generate(N, diff);
    times.push(Date.now() - t);
    clues.push(p.clues); tech[p.technique] = (tech[p.technique] || 0) + 1;
    check(validSolution(N, p.solution), `${N} ${diff}: Lösung ungültig`);
    check(p.puzzle.every((v, i) => !v || v === p.solution[i]), `${N} ${diff}: Vorgabe passt nicht zur Lösung`);
    check(S.countSolutions(N, p.puzzle, 2) === 1, `${N} ${diff}: nicht eindeutig`);
    // Tipp-Kette: nur mit Tipps bis zum Ende lösen
    const e = p.puzzle.slice(); let steps = 0;
    while (e.some(v => !v) && steps < N * N) {
      const h = S.hint(N, p.puzzle, p.solution, e);
      check(h.cell !== undefined && h.value === p.solution[h.cell], `${N} ${diff}: Tipp falsch ${JSON.stringify(h)}`);
      if (h.cell === undefined) break; e[h.cell] = h.value; steps++;
    }
    // Fehler-Erkennung im Tipp
    const e2 = p.puzzle.slice(); const empty = e2.findIndex(v => !v);
    e2[empty] = (p.solution[empty] % N) + 1;
    check(S.hint(N, p.puzzle, p.solution, e2).kind === 'error', `${N} ${diff}: Fehler nicht erkannt`);
  }
  const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(0);
  console.log(`${N}x${N} ${diff.padEnd(6)} n=${n}  Zeit Ø ${avg(times)}ms max ${Math.max(...times)}ms  Vorgaben ${Math.min(...clues)}–${Math.max(...clues)}  Techniken ${JSON.stringify(tech)}`);
}

for (const d of ['leicht', 'mittel', 'schwer']) run(9, d, count);
if (with16) for (const d of ['leicht', 'mittel', 'schwer']) run(16, d, Math.max(2, Math.floor(count / 10)));
console.log(fail ? `${fail} Fehler` : 'Alle Prüfungen bestanden');
process.exit(fail ? 1 : 0);
