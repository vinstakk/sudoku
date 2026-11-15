/* Sudoku-Engine: Erzeugen, Lösen, Bewerten, Tipps.
   Läuft im Browser (Worker / Hauptthread) und in Node (Tests). Keine Abhängigkeiten.
   Werte: 0 = leer, 1..N. Kandidaten als Bitmaske (Bit v-1 = Wert v). */
(function (root) {
  'use strict';

  // ---------- Geometrie ----------
  const geoCache = {};
  function geo(N) {
    if (geoCache[N]) return geoCache[N];
    const B = Math.round(Math.sqrt(N));
    if (B * B !== N) throw new Error('Ungültige Größe ' + N);
    const size = N * N;
    const row = new Int8Array(size), col = new Int8Array(size), box = new Int8Array(size);
    const units = [];
    for (let r = 0; r < N; r++) { const u = []; for (let c = 0; c < N; c++) u.push(r * N + c); units.push(u); }
    for (let c = 0; c < N; c++) { const u = []; for (let r = 0; r < N; r++) u.push(r * N + c); units.push(u); }
    for (let b = 0; b < N; b++) {
      const u = [], r0 = Math.floor(b / B) * B, c0 = (b % B) * B;
      for (let r = 0; r < B; r++) for (let c = 0; c < B; c++) u.push((r0 + r) * N + c0 + c);
      units.push(u);
    }
    for (let i = 0; i < size; i++) {
      row[i] = Math.floor(i / N); col[i] = i % N;
      box[i] = Math.floor(row[i] / B) * B + Math.floor(col[i] / B);
    }
    const peers = [];
    for (let i = 0; i < size; i++) {
      const s = new Set();
      for (const u of [units[row[i]], units[N + col[i]], units[2 * N + box[i]]]) for (const j of u) if (j !== i) s.add(j);
      peers.push(Int16Array.from(s));
    }
    return (geoCache[N] = { N, B, size, full: (1 << N) - 1, row, col, box, units, peers });
  }

  function popcount(x) { x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; }
  function bitVal(bit) { return 32 - Math.clz32(bit); } // Bit -> Wert 1..N
  function bitsOf(m) { const r = []; while (m) { const b = m & -m; r.push(b); m ^= b; } return r; }
  function shuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- Backtracking (vollständiges Gitter, Lösungen zählen) ----------
  function backtrack(N, grid, limit, rnd) {
    const g = geo(N), size = g.size;
    const rowM = new Int32Array(N), colM = new Int32Array(N), boxM = new Int32Array(N);
    for (let i = 0; i < size; i++) {
      const v = grid[i]; if (!v) continue;
      const bit = 1 << (v - 1);
      if ((rowM[g.row[i]] | colM[g.col[i]] | boxM[g.box[i]]) & bit) return { count: 0, solution: null };
      rowM[g.row[i]] |= bit; colM[g.col[i]] |= bit; boxM[g.box[i]] |= bit;
    }
    const work = Array.from(grid);
    let count = 0, solution = null;
    function rec() {
      let best = -1, bestMask = 0, bestCnt = 99;
      for (let i = 0; i < size; i++) {
        if (work[i]) continue;
        const m = g.full & ~(rowM[g.row[i]] | colM[g.col[i]] | boxM[g.box[i]]);
        const c = popcount(m);
        if (c === 0) return false;
        if (c < bestCnt) { best = i; bestMask = m; bestCnt = c; if (c === 1) break; }
      }
      if (best < 0) { count++; if (!solution) solution = work.slice(); return count >= limit; }
      const bits = bitsOf(bestMask); if (rnd) shuffle(bits, rnd);
      const r = g.row[best], c = g.col[best], b = g.box[best];
      for (const bit of bits) {
        work[best] = bitVal(bit); rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit;
        if (rec()) return true;
        rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit; work[best] = 0;
      }
      return false;
    }
    rec();
    return { count, solution };
  }

  function randomSolution(N, rnd) { return backtrack(N, new Array(N * N).fill(0), 1, rnd).solution; }
  function countSolutions(N, grid, limit) { return backtrack(N, grid, limit || 2).count; }

  // ---------- Logischer Löser ----------
  // Stufen: 1 Naked Single, 2 Hidden Single, 3 Locked Candidates, 4 Paare, 5 Tripel, 6 X-Wing
  function makeState(N, grid) {
    const g = geo(N);
    const values = Array.from(grid), cand = new Int32Array(g.size);
    for (let i = 0; i < g.size; i++) {
      if (values[i]) continue;
      let used = 0; for (const p of g.peers[i]) if (values[p]) used |= 1 << (values[p] - 1);
      cand[i] = g.full & ~used;
    }
    return { N, g, values, cand };
  }

  function place(st, i, v) {
    const bit = 1 << (v - 1);
    if (st.values[i] || !(st.cand[i] & bit)) return false;
    st.values[i] = v; st.cand[i] = 0;
    for (const p of st.g.peers[i]) st.cand[p] &= ~bit;
    return true;
  }

  function contradiction(st) {
    const { g, values, cand } = st;
    for (let i = 0; i < g.size; i++) if (!values[i] && !cand[i]) return true;
    for (const u of g.units) {
      let have = 0, can = 0;
      for (const i of u) { if (values[i]) { const b = 1 << (values[i] - 1); if (have & b) return true; have |= b; } else can |= cand[i]; }
      if ((have | can) !== g.full) return true;
    }
    return false;
  }

  function findNakedSingle(st) {
    const { g, values, cand } = st;
    for (let i = 0; i < g.size; i++) if (!values[i] && popcount(cand[i]) === 1) return { level: 1, kind: 'naked', cell: i, value: bitVal(cand[i]) };
    return null;
  }

  function findHiddenSingle(st) {
    const { g, values, cand } = st;
    // Reihenfolge: Blöcke, Zeilen, Spalten (Blöcke sind für Menschen am natürlichsten)
    const order = [];
    for (let u = 2 * g.N; u < 3 * g.N; u++) order.push(u);
    for (let u = 0; u < 2 * g.N; u++) order.push(u);
    for (const ui of order) {
      const u = g.units[ui];
      let have = 0; for (const i of u) if (values[i]) have |= 1 << (values[i] - 1);
      for (let bit = 1; bit <= g.full; bit <<= 1) {
        if (have & bit) continue;
        let pos = -1, n = 0;
        for (const i of u) if (cand[i] & bit) { pos = i; if (++n > 1) break; }
        if (n === 1) return { level: 2, kind: 'hidden', cell: pos, value: bitVal(bit), unit: ui };
      }
    }
    return null;
  }

  function elimStep(level, kind, elims) { return elims.length ? { level, kind, elims } : null; }

  function findLocked(st) {
    const { g, cand, N } = st;
    for (let b = 0; b < N; b++) {
      const bu = g.units[2 * N + b];
      for (let bit = 1; bit <= g.full; bit <<= 1) {
        const cells = bu.filter(i => cand[i] & bit);
        if (cells.length < 2) continue;
        for (const [arr, off] of [[g.row, 0], [g.col, N]]) {
          const line = arr[cells[0]];
          if (cells.every(i => arr[i] === line)) {
            const elims = g.units[off + line].filter(i => g.box[i] !== b && (cand[i] & bit)).map(i => [i, bit]);
            const s = elimStep(3, 'locked', elims); if (s) return s;
          }
        }
      }
    }
    for (let ui = 0; ui < 2 * N; ui++) {
      const u = g.units[ui];
      for (let bit = 1; bit <= g.full; bit <<= 1) {
        const cells = u.filter(i => cand[i] & bit);
        if (cells.length < 2) continue;
        const b = g.box[cells[0]];
        if (cells.every(i => g.box[i] === b)) {
          const lineSet = new Set(u);
          const elims = g.units[2 * N + b].filter(i => !lineSet.has(i) && (cand[i] & bit)).map(i => [i, bit]);
          const s = elimStep(3, 'locked', elims); if (s) return s;
        }
      }
    }
    return null;
  }

  function combos(arr, k, start, cur, out) {
    if (cur.length === k) { out.push(cur.slice()); return out; }
    for (let i = start; i < arr.length; i++) { cur.push(arr[i]); combos(arr, k, i + 1, cur, out); cur.pop(); }
    return out;
  }

  function findNakedSubset(st, k) {
    const { g, cand } = st;
    for (const u of g.units) {
      const cells = u.filter(i => cand[i] && popcount(cand[i]) <= k);
      if (cells.length < k) continue;
      for (const c of combos(cells, k, 0, [], [])) {
        let m = 0; for (const i of c) m |= cand[i];
        if (popcount(m) !== k) continue;
        const elims = [];
        for (const i of u) if (cand[i] && !c.includes(i) && (cand[i] & m)) for (const b of bitsOf(cand[i] & m)) elims.push([i, b]);
        const s = elimStep(k === 2 ? 4 : 5, 'nakedSubset', elims); if (s) return s;
      }
    }
    return null;
  }

  function findHiddenSubset(st, k) {
    const { g, cand } = st;
    for (const u of g.units) {
      const vals = [];
      for (let bit = 1; bit <= g.full; bit <<= 1) {
        const n = u.reduce((a, i) => a + ((cand[i] & bit) ? 1 : 0), 0);
        if (n >= 2 && n <= k) vals.push(bit);
      }
      if (vals.length < k) continue;
      for (const c of combos(vals, k, 0, [], [])) {
        const m = c.reduce((a, b) => a | b, 0);
        const cells = u.filter(i => cand[i] & m);
        if (cells.length !== k) continue;
        const elims = [];
        for (const i of cells) for (const b of bitsOf(cand[i] & ~m)) elims.push([i, b]);
        const s = elimStep(k === 2 ? 4 : 5, 'hiddenSubset', elims); if (s) return s;
      }
    }
    return null;
  }

  function findXWing(st) {
    const { g, cand, N } = st;
    for (const [lineArr, crossArr, lineOff, crossOff] of [[g.row, g.col, 0, N], [g.col, g.row, N, 0]]) {
      for (let bit = 1; bit <= g.full; bit <<= 1) {
        const lines = [];
        for (let l = 0; l < N; l++) {
          const pos = g.units[lineOff + l].filter(i => cand[i] & bit);
          if (pos.length === 2) lines.push({ l, a: crossArr[pos[0]], b: crossArr[pos[1]] });
        }
        for (let x = 0; x < lines.length; x++) for (let y = x + 1; y < lines.length; y++) {
          const p = lines[x], q = lines[y];
          if (p.a !== q.a || p.b !== q.b) continue;
          const elims = [];
          for (const cx of [p.a, p.b]) for (const i of g.units[crossOff + cx]) {
            const li = lineArr[i];
            if (li !== p.l && li !== q.l && (cand[i] & bit)) elims.push([i, bit]);
          }
          const s = elimStep(6, 'xwing', elims); if (s) return s;
        }
      }
    }
    return null;
  }

  function findStep(st, maxLevel) {
    let s;
    if ((s = findNakedSingle(st))) return s;
    if (maxLevel >= 2 && (s = findHiddenSingle(st))) return s;
    if (maxLevel >= 3 && (s = findLocked(st))) return s;
    if (maxLevel >= 4 && ((s = findNakedSubset(st, 2)) || (s = findHiddenSubset(st, 2)))) return s;
    if (maxLevel >= 5 && ((s = findNakedSubset(st, 3)) || (s = findHiddenSubset(st, 3)))) return s;
    if (maxLevel >= 6 && (s = findXWing(st))) return s;
    return null;
  }

  function applyStep(st, s) {
    if (s.cell !== undefined) return place(st, s.cell, s.value);
    for (const [i, b] of s.elims) st.cand[i] &= ~b;
    return true;
  }

  // Löst so weit wie möglich mit Techniken bis maxLevel.
  function solveLogic(N, grid, maxLevel) {
    const st = makeState(N, grid);
    let maxUsed = 0;
    if (contradiction(st)) return { solved: false, invalid: true, values: st.values, maxUsed };
    for (;;) {
      // Naked Singles gesammelt anwenden (schnell)
      let progressed = true;
      while (progressed) {
        progressed = false;
        for (let i = 0; i < st.g.size; i++) {
          const c = st.cand[i];
          if (!st.values[i] && c && (c & (c - 1)) === 0) { if (!place(st, i, bitVal(c))) return { solved: false, invalid: true, values: st.values, maxUsed }; progressed = true; if (maxUsed < 1) maxUsed = 1; }
        }
      }
      if (st.values.every(v => v)) break;
      if (contradiction(st)) return { solved: false, invalid: true, values: st.values, maxUsed };
      const s = findStep(st, maxLevel);
      if (!s) return { solved: false, values: st.values, maxUsed };
      if (s.level > maxUsed) maxUsed = s.level;
      if (!applyStep(st, s)) return { solved: false, invalid: true, values: st.values, maxUsed };
    }
    return { solved: true, values: st.values, maxUsed };
  }

  // ---------- Schwierigkeitsgrade ----------
  const LEVELS = {
    9: {
      leicht: { maxLevel: 2, minClues: [36, 40] },
      mittel: { maxLevel: 4, minClues: [29, 32] },
      schwer: { maxLevel: 6, minClues: [0, 0], needAtLeast: 3 }
    },
    16: {
      leicht: { maxLevel: 2, minClues: [140, 150] },
      mittel: { maxLevel: 4, minClues: [115, 125] },
      // 16×16 nicht bis zum Minimum ausdünnen: sonst minutenlange Erzeugung
      schwer: { maxLevel: 4, minClues: [100, 108], needAtLeast: 3 }
    }
  };

  function generate(N, difficulty, rnd) {
    rnd = rnd || Math.random;
    const cfg = LEVELS[N][difficulty];
    if (!cfg) throw new Error('Unbekannte Schwierigkeit ' + difficulty);
    let best = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const solution = randomSolution(N, rnd);
      const puzzle = solution.slice();
      const minClues = cfg.minClues[0] + Math.floor(rnd() * (cfg.minClues[1] - cfg.minClues[0] + 1));
      let clues = N * N;
      for (const i of shuffle([...Array(N * N).keys()], rnd)) {
        if (clues <= minClues) break;
        const v = puzzle[i]; puzzle[i] = 0;
        if (solveLogic(N, puzzle, cfg.maxLevel).solved) clues--; else puzzle[i] = v;
      }
      const res = solveLogic(N, puzzle, cfg.maxLevel);
      // Sicherheitsprüfungen: logisch lösbar, Ergebnis = Lösung, genau eine Lösung
      if (!res.solved || res.values.some((v, i) => v !== solution[i])) continue;
      // Rein logisch gelöst = eindeutig. Die Zusatzprüfung per Backtracking ist bei 9×9 billig;
      // bei 16×16 kann sie Sekunden dauern und wird nur in den Tests (tools/test-engine.js) gemacht.
      if (N <= 9 && countSolutions(N, puzzle, 2) !== 1) continue;
      const out = { N, difficulty, puzzle, solution, clues, technique: res.maxUsed };
      if (!cfg.needAtLeast || res.maxUsed >= cfg.needAtLeast) return out;
      if (!best || clues < best.clues) best = out;
    }
    if (best) return best;
    throw new Error('Konnte kein Rätsel erzeugen');
  }

  // ---------- Tipps ----------
  // entries: aktueller Stand (Vorgaben + Einträge). Liefert einen Tipp oder einen Fehlerhinweis.
  function hint(N, puzzle, solution, entries) {
    const g = geo(N);
    const wrong = [];
    for (let i = 0; i < g.size; i++) if (entries[i] && entries[i] !== solution[i]) wrong.push(i);
    if (wrong.length) return { kind: 'error', count: wrong.length };
    const st = makeState(N, entries);
    let advanced = false;
    for (let guard = 0; guard < 2000; guard++) {
      const s = findStep(st, 6);
      if (!s) break;
      if (s.cell !== undefined) {
        if (s.value !== solution[s.cell]) break; // sollte nie passieren
        return advanced ? { kind: 'advanced', cell: s.cell, value: s.value }
                        : { kind: s.kind, cell: s.cell, value: s.value, unit: s.unit };
      }
      advanced = true;
      applyStep(st, s);
    }
    // Fallback: Feld mit den wenigsten Möglichkeiten aufdecken
    let best = -1, bc = 99;
    for (let i = 0; i < g.size; i++) if (!entries[i]) { const c = popcount(st.cand[i]) || 99; if (c < bc) { bc = c; best = i; } }
    return best < 0 ? { kind: 'none' } : { kind: 'advanced', cell: best, value: solution[best] };
  }

  function unitType(N, ui) { return ui < N ? 'row' : ui < 2 * N ? 'col' : 'box'; }

  const api = { geo, generate, solveLogic, countSolutions, randomSolution, hint, unitType, LEVELS, popcount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Sudoku = api;
})(typeof self !== 'undefined' ? self : this);
