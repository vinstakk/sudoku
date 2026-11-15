/* Alex' Sudoku – Oberfläche und Spielablauf */
(function () {
  'use strict';

  // ---------- Einstellungen ----------
  const DEV = new URLSearchParams(location.search).has('dev');
  const MIN = 60000;
  const TIPS = DEV
    ? { 9: { first: 15000, next: 10000 }, 16: { first: 30000, next: 15000 } }
    : { 9: { first: 15 * MIN, next: 10 * MIN }, 16: { first: 30 * MIN, next: 15 * MIN } };
  const IDLE = DEV ? 20000 : 5 * MIN; // ohne Berührung stoppt der Tipp-Zähler
  const LOADING_MS = 1500;
  const DIFFS = ['leicht', 'mittel', 'schwer'];
  const DIFF_LABEL = { leicht: 'Leicht', mittel: 'Mittel', schwer: 'Schwer' };

  // ---------- Speicher (nur lokal) ----------
  const KEY = 'alexSudoku.';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(KEY + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* voll / gesperrt */ } },
    del(k) { try { localStorage.removeItem(KEY + k); } catch (e) { } }
  };
  function askPersistent() { try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { } }

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const now = () => Date.now();
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function fmt(ms) {
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
  }
  function fmtWait(ms) {
    if (ms < MIN) return DEV ? `${Math.ceil(ms / 1000)} Sekunden` : 'ein paar Sekunden';
    const m = Math.ceil(ms / MIN); return m === 1 ? '1 Minute' : `${m} Minuten`;
  }

  // ---------- Texte von Vincent (siehe TEXTE.md) ----------
  const T = {
    start: ['Hallo Mausi, viel Spaß!', 'Ich wünsch dir ganz viel Spaß beim Spielen!', 'Frisch gebacken, nur für dich. Viel Spaß, Mausi!',
      'Na, Mausi? Zeig dem Rätsel mal, wer hier die Chefin ist.', 'Auf geht\'s! Ich bin hier, falls du mich brauchst.'],
    back: ['Na endlich, das hat aber lang gedauert!', 'Hello, da bist du ja wieder!', 'Ich hab die ganze Zeit das Schild gehalten. Meine Arme!',
      'Willkommen zurück. Ich hab nicht gespickt, versprochen.'],
    pause: ['Einfach auf Pause gedrückt. Frech.', 'Hast wohl keine Geduld mehr, hä?', 'Okay, okay … dann halt ich mal das Schild.'],
    reopen: ['Da ist ja dein Rätsel! Tipp aufs Schild, dann geht\'s weiter.'],
    tipWait: ['Als ob ich dir jetzt schon einen Tipp gebe. Warte mal noch {zeit}.', 'Nein, nein, nein, du bekommst noch keinen Tipp. Noch {zeit}.',
      'Netter Versuch, Mausi. Noch {zeit} knobeln.'],
    tipError: ['Na, schau nochmal genauer hin. Da stimmt schon was nicht.', 'Bevor ich helfe: Irgendwo hat sich ein Fehler versteckt. „Prüfen“ hilft dir.'],
    checkOk: ['Bis hierhin alles richtig. Streberin!', 'Alles korrekt – ich bin beeindruckt.'],
    checkErr: ['Also hier hast du noch {n} Fehler. Nochmal tippen, dann zeig ich sie dir.'],
    checkShow: ['Da siehst du sie, rot markiert. Kein Grund zur Panik.'],
    fullWrong: ['Fast! Aber irgendwo hat sich ein Fehler eingeschlichen.', 'So knapp! Irgendwas stimmt noch nicht ganz.', 'Alles voll, aber noch nicht alles richtig. Du schaffst das!'],
    win: ['Geschafft! Du bist einfach die Beste.', 'Gelöst! War ja klar.'],
    winHelp: ['Geschafft! Ein bisschen Hilfe von mir war dabei – aber das bleibt unter uns.'],
    record: ['NEUER REKORD! Ich bin so stolz auf dich, Mausi!', 'Rekord! Wie machst du das bloß?'],
    sleep: ['Oh Mann, einfach alleine gelassen. Na, dann schlaf ich jetzt wohl … Zzz', 'Ich mach nur kurz die Augen zu … Zzz'],
    wake: ['Hä? Ich hab nicht geschlafen!', 'Bin wach, bin wach!'],
    nothingUndo: ['Da gibt es nichts mehr zum Zurücknehmen.'],
    autoPause: ['Ich halte das Schild, bis du wieder da bist.', 'Kurz weg? Ich pass so lange auf dein Rätsel auf.'],
    intro: ['Hallo Mausi! Diese App gehört ganz allein dir.',
      'Ich wünsche dir damit ganz viel und ganz lange Spaß – und hoffe, sie gefällt dir genauso gut wie deine Sudokus mit Stift und Papier.',
      'Ich bin übrigens dein Spielleiter: Ich gebe dir Tipps, halte das Pause-Schild und freu mich mit dir über jeden Rekord.'],
    valentin: ['Hallo Mausi, heute ist Valentinstag! Ich liebe dich – und wünsche dir auch heute ganz viel Spaß mit deinem Sudoku.'],
    jahrestag: ['Hallo Mausi, heute ist unser Jahrestag! Ich liebe dich und hoffe wie jedes Jahr, dass noch ganz viele weitere vor uns liegen. Und dass du noch viele Jahre Spaß mit dieser App hast.'],
    geburtstag: ['Happy Birthday, Mausi!'],
    vincentTag: ['Geburtstag? Wer? Ich? Nee, nee. Ganz normaler Tag heute.', 'Das? Das ist … äh … ein Sudoku-Kuchen. Ganz normal.',
      'Ich weiß nicht, wovon du redest. Spiel lieber dein Rätsel.']
  };

  // ---------- Besondere Tage ----------
  const DAYS = { '2-14': 'valentin', '8-19': 'jahrestag', '8-21': 'geburtstag', '10-11': 'vincent' };
  const DAY_INFO = {
    valentin: { banner: 'Happy Valentinstag, Mausi!', v: 'balloon', a: '' },
    jahrestag: { banner: 'Heute ist unser Jahrestag', v: 'balloon', a: '' },
    geburtstag: { banner: 'Happy Birthday, Mausi!', v: 'party', a: 'party', confetti: true },
    vincent: { banner: '', v: '', a: '' }
  };
  function specialDay() {
    const q = new URLSearchParams(location.search).get('day');
    if (DEV && q && DAY_INFO[q]) return q;
    const d = new Date(); return DAYS[`${d.getMonth() + 1}-${d.getDate()}`] || null;
  }
  const DAY = specialDay();
  const t = (key, vars) => pick(T[key]).replace(/\{(\w+)\}/g, (_, k) => vars && vars[k] !== undefined ? vars[k] : '');

  // ---------- Einstellungen (Design, Notizen) ----------
  const prefs = Object.assign({ theme: 'system', autoNotes: false }, store.get('prefs', {}));
  const darkMQ = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    const root = document.documentElement;
    if (prefs.theme === 'system') root.removeAttribute('data-theme'); else root.dataset.theme = prefs.theme;
    const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && darkMQ && darkMQ.matches);
    document.getElementById('theme-color').setAttribute('content', dark ? '#2a1219' : '#fff0f1');
  }
  applyTheme();
  if (darkMQ && darkMQ.addEventListener) darkMQ.addEventListener('change', applyTheme);
  function renderOptions() {
    $$('#seg-theme button').forEach(b => b.classList.toggle('on', b.dataset.theme === prefs.theme));
    $('#sw-autonotes').setAttribute('aria-checked', String(prefs.autoNotes));
  }

  // ---------- Rätsel-Erzeugung im Hintergrund ----------
  let worker = null, reqId = 0;
  const pending = new Map();
  try {
    worker = new Worker('js/worker.js');
    worker.onmessage = e => {
      const { id, puzzle, error } = e.data, p = pending.get(id);
      if (!p) return; pending.delete(id);
      error ? p.reject(new Error(error)) : p.resolve(puzzle);
    };
    worker.onerror = () => { worker = null; for (const p of pending.values()) p.reject(new Error('worker')); pending.clear(); };
  } catch (e) { worker = null; }

  function generateAsync(N, d) {
    const local = () => new Promise(r => setTimeout(() => r(Sudoku.generate(N, d)), 20));
    if (!worker) return local();
    return new Promise((resolve, reject) => { const id = ++reqId; pending.set(id, { resolve, reject }); worker.postMessage({ id, N, difficulty: d }); })
      .catch(local);
  }

  let pregen = store.get('pregen', {}), filling = false;
  async function fillPregen() {
    if (filling) return; filling = true;
    try {
      for (const N of [9, 16]) for (const d of DIFFS) {
        const k = N + '-' + d;
        if (!pregen[k]) { const p = await generateAsync(N, d); if (!pregen[k]) { pregen[k] = p; store.set('pregen', pregen); } }
      }
    } catch (e) { } finally { filling = false; }
  }
  async function takePuzzle(N, d) {
    const k = N + '-' + d; let p = pregen[k];
    if (p) { delete pregen[k]; store.set('pregen', pregen); } else p = await generateAsync(N, d);
    setTimeout(fillPregen, 800);
    return p;
  }

  // ---------- Bildschirme ----------
  function show(name) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
    if (name === 'home') renderHome();
    if (name === 'stats') renderStats();
    window.scrollTo(0, 0);
  }

  // ---------- Startseite ----------
  function renderHome() {
    const h = new Date().getHours();
    $('#hello').textContent = h < 5 ? 'Na, noch wach?' : h < 11 ? 'Guten Morgen' : h < 17 ? 'Hallo' : h < 22 ? 'Guten Abend' : 'Na, noch wach?';
    const recs = store.get('records', {});
    $('#records').innerHTML = [9, 16].map(N => DIFFS.map(d => {
      const r = recs[N + '-' + d];
      return `<div class="rec"><b>${r ? fmt(r) : '–'}</b><span>${N}×${N} ${DIFF_LABEL[d]}</span></div>`;
    }).join('')).join('');
    const g = store.get('game', null);
    const btn = $('#btn-continue');
    if (g && !g.finished) {
      btn.hidden = false;
      $('#continue-info').textContent = `${DIFF_LABEL[g.difficulty]} · ${g.N}×${g.N}` + (g.timed ? ` · ${fmt(g.elapsedMs)}` : '');
    } else btn.hidden = true;
  }

  // ---------- Einstellungen ----------
  const setup = Object.assign({ N: 9, difficulty: 'mittel', timed: true, set: 'zahlen' }, store.get('setup', {}));
  if (!Symbols.SETS[setup.set]) setup.set = 'zahlen';
  function renderSetup() {
    $('#sets').innerHTML = Symbols.ORDER.map(key => {
      const prev = [1, 2, 3].map(v => Symbols.html(key, v, 'p')).join('');
      return `<button data-set="${key}" class="${key === setup.set ? 'on' : ''}"><span class="prev">${prev}</span>${Symbols.SETS[key].label}</button>`;
    }).join('');
    $$('#seg-size button').forEach(b => b.classList.toggle('on', +b.dataset.size === setup.N));
    $$('#diffs button').forEach(b => b.classList.toggle('on', b.dataset.diff === setup.difficulty));
    $('#sw-timed').setAttribute('aria-checked', String(setup.timed));
  }

  // ---------- Spielzustand ----------
  let game = null, sel = -1, pencil = false, segStart = 0, lastTick = 0, lastTouch = 0, saveCount = 0, sleeping = false;
  let cells = [];

  function newGame(p) {
    return {
      v: 1, N: p.N, difficulty: p.difficulty, timed: setup.timed, set: setup.set,
      puzzle: p.puzzle, solution: p.solution, values: p.puzzle.slice(), notes: new Array(p.N * p.N).fill(0),
      history: [], elapsedMs: 0, activeMs: 0, running: false,
      tipsUsed: 0, lastTipActive: 0, assisted: false, checkStage: 0, marked: [], hint: null,
      finished: false, started: now()
    };
  }

  const isRunning = () => !!(game && game.running && !game.finished);
  const elapsed = () => game.elapsedMs + (isRunning() ? now() - segStart : 0);

  function saveGame() {
    if (!game || game.finished) return;
    if (isRunning()) { const t = now(); game.elapsedMs += t - segStart; segStart = t; }
    store.set('game', game);
  }

  function resume() {
    if (!game || game.finished) return;
    game.running = true; segStart = lastTick = lastTouch = now();
    setSleeping(false);
    renderPause();
  }
  function pause() {
    if (!isRunning()) return;
    game.elapsedMs += now() - segStart; game.running = false;
    store.set('game', game);
    renderPause();
  }
  function setSleeping(on) { sleeping = on; if (!on) dirAwake(); }
  // Jede Berührung zählt als Aktivität; weckt Vincent auf, falls er eingeschlafen ist
  function touch() {
    lastTouch = now();
    if (sleeping) { sleeping = false; dirWake(t('wake')); }
  }

  function tick() {
    if (!isRunning()) return;
    const tm = now(), d = Math.min(tm - lastTick, 2000);
    if (tm - lastTouch < IDLE) game.activeMs += d;
    else if (!sleeping) { sleeping = true; dirSleep(t('sleep')); }
    lastTick = tm;
    updateTimer(); updateTipRing();
    if (++saveCount % 10 === 0) saveGame();
  }

  // ---------- Tipps ----------
  const tipCfg = () => TIPS[game.N];
  const prevTipAt = () => game.tipsUsed ? game.lastTipActive : 0;
  const nextTipAt = () => game.tipsUsed ? game.lastTipActive + tipCfg().next : tipCfg().first;
  const tipProgress = () => Math.max(0, Math.min(1, (game.activeMs - prevTipAt()) / (nextTipAt() - prevTipAt())));

  function updateTipRing() {
    const c = 2 * Math.PI * 17, p = tipProgress();
    const ring = $('#tip-ring');
    ring.style.strokeDasharray = c; ring.style.strokeDashoffset = c * (1 - p);
    $('#t-tip').classList.toggle('ready', p >= 1);
  }

  function confirmAssist(what, fn) {
    if (!game.timed || game.assisted) return fn();
    modal(`<h2>Sicher?</h2><p>Wenn du ${what} nutzt, zählt diese Runde nicht mehr als Rekord.</p>`, [
      { label: `${what === 'einen Tipp' ? 'Tipp' : 'Prüfen'} nutzen`, primary: true, action: fn },
      { label: 'Lieber weiter knobeln' }
    ]);
  }

  function onTip() {
    if (!isRunning()) return;
    touch();
    if (tipProgress() < 1) {
      dirSay(t('tipWait', { zeit: fmtWait(nextTipAt() - game.activeMs) }), { pose: 'no', poseMs: 900 });
      return;
    }
    confirmAssist('einen Tipp', () => {
      const h = Sudoku.hint(game.N, game.puzzle, game.solution, game.values);
      game.assisted = true;
      if (h.kind === 'error') { dirSay(t('tipError'), { pose: 'think', poseMs: 1200 }); saveGame(); return; }
      if (h.kind === 'none') return;
      game.tipsUsed++; game.lastTipActive = game.activeMs;
      game.hint = { cell: h.cell, unit: h.unit };
      sel = h.cell;
      const v = Symbols.name(game.set, h.value);
      let txt;
      if (h.kind === 'naked') txt = `Ins leuchtende Feld passt nur noch ${v} – alles andere steht schon in Zeile, Spalte oder Block.`;
      else if (h.kind === 'hidden') {
        const ut = Sudoku.unitType(game.N, h.unit);
        const where = ut === 'row' ? 'dieser Zeile' : ut === 'col' ? 'dieser Spalte' : 'diesem Block';
        txt = `In ${where} kann ${v} nur noch an eine einzige Stelle: das leuchtende Feld.`;
      } else txt = `Knifflige Stelle! Ins leuchtende Feld gehört ${v}. Schau dir Zeile, Spalte und Block genau an.`;
      dirTip(txt);
      renderBoard(); updateTipRing(); saveGame();
      scrollToCell(h.cell);
    });
  }

  // ---------- Prüfen ----------
  const wrongCells = () => game.values.map((v, i) => (!game.puzzle[i] && v && v !== game.solution[i]) ? i : -1).filter(i => i >= 0);

  function onCheck() {
    if (!isRunning()) return;
    touch();
    if (game.checkStage === 1) {
      const w = wrongCells();
      game.marked = w; game.checkStage = 0;
      dirSay(t(w.length ? 'checkShow' : 'checkOk'), { pose: w.length ? 'point' : 'hop', poseMs: 1000 });
      renderBoard(); renderTools(); saveGame();
      return;
    }
    confirmAssist('„Prüfen“', () => {
      game.assisted = true;
      const n = wrongCells().length;
      if (n === 0) dirCheck(t('checkOk'), 'hop');
      else { dirCheck(t('checkErr', { n })); game.checkStage = 1; }
      renderTools(); saveGame();
    });
  }

  // ---------- Eingabe ----------
  function editable(i) { return i >= 0 && !game.puzzle[i]; }

  function input(v) {
    if (!isRunning()) return;
    touch();
    if (!editable(sel)) { if (sel >= 0) flash(sel); return; }
    const i = sel, prev = { i, v: game.values[i], n: game.notes[i] };
    if (pencil) {
      if (game.values[i]) { flash(i); return; }
      game.notes[i] ^= 1 << (v - 1);
    } else if (game.values[i] === v) game.values[i] = 0;
    else {
      game.values[i] = v; game.notes[i] = 0;
      if (prefs.autoNotes) {
        // dieselbe Notiz in Zeile, Spalte und Block entfernen – „Zurück“ stellt sie wieder her
        const bit = 1 << (v - 1), extra = [];
        for (const p of Sudoku.geo(game.N).peers[i]) if (game.notes[p] & bit) { extra.push([p, game.notes[p]]); game.notes[p] &= ~bit; }
        if (extra.length) prev.extra = extra;
      }
    }
    commit(prev);
  }

  function erase() {
    if (!isRunning()) return;
    touch();
    if (!editable(sel) || (!game.values[sel] && !game.notes[sel])) return;
    const prev = { i: sel, v: game.values[sel], n: game.notes[sel] };
    game.values[sel] = 0; game.notes[sel] = 0;
    commit(prev);
  }

  function undo() {
    if (!isRunning()) return;
    touch();
    const h = game.history.pop();
    if (!h) { dirSay(t('nothingUndo')); return; }
    const changed = game.values[h.i] !== h.v;
    game.values[h.i] = h.v; game.notes[h.i] = h.n; sel = h.i;
    if (h.extra) for (const [p, n] of h.extra) game.notes[p] = n;
    afterEdit(h.i, changed);
  }

  function commit(prev) {
    const i = prev.i, changed = prev.v !== game.values[i];
    if (!changed && prev.n === game.notes[i]) return;
    game.history.push(prev);
    if (game.history.length > 600) game.history.shift();
    afterEdit(i, changed);
  }

  function afterEdit(i, valueChanged) {
    if (valueChanged) {
      game.marked = game.marked.filter(x => x !== i);
      if (game.checkStage) { game.checkStage = 0; }
      if (game.hint && game.hint.cell === i && game.values[i]) game.hint = null;
      dirClearSticky();
    }
    renderBoard(); renderTools(); saveGame();
    if (valueChanged && game.values.every(v => v)) {
      if (game.values.every((v, k) => v === game.solution[k])) win();
      else dirCheck(t('fullWrong'));
    }
  }

  function moveSel(dr, dc) {
    const N = game.N;
    if (sel < 0) { sel = 0; } else {
      const r = (Math.floor(sel / N) + dr + N) % N, c = (sel % N + dc + N) % N;
      sel = r * N + c;
    }
    renderBoard(); scrollToCell(sel);
  }

  // ---------- Gewonnen ----------
  function win() {
    game.elapsedMs += now() - segStart; game.running = false; game.finished = true;
    const ms = game.elapsedMs, key = `${game.N}-${game.difficulty}`;
    const recs = store.get('records', {}), prevBest = recs[key];
    let record = false;
    if (game.timed && !game.assisted && (!prevBest || ms < prevBest)) { recs[key] = ms; store.set('records', recs); record = true; }
    const results = store.get('results', []);
    results.push({ N: game.N, d: game.difficulty, timed: game.timed, ms, assisted: game.assisted, tips: game.tipsUsed, set: game.set, date: now() });
    store.set('results', results);
    store.del('game');
    sel = -1; game.hint = null;
    renderBoard(); renderPause();
    confetti(record ? 260 : 140);
    sleeping = false;
    dirWin(t(record ? 'record' : game.assisted ? 'winHelp' : 'win'));

    let body = `<div class="win-emoji"><svg><use href="#i-heart"/></svg></div><h2>Geschafft, Alex!</h2>`;
    if (game.timed) {
      body += `<div class="big-time">${fmt(ms)}</div>`;
      if (record) body += `<span class="badge">Neuer Rekord!</span>` + (prevBest ? `<p>Vorher: ${fmt(prevBest)}</p>` : '');
      else if (game.assisted) body += `<p>Mit Hilfe gelöst – zählt diesmal nicht als Rekord.</p>`;
      else body += `<p>Deine Bestzeit: ${fmt(prevBest)}</p>`;
    } else body += `<p>${DIFF_LABEL[game.difficulty]} · ${game.N}×${game.N} – wunderbar gelöst.</p>`;
    setTimeout(() => modal(body, [
      { label: 'Noch eins!', primary: true, action: startNew },
      { label: 'Zum Start', action: () => show('home') }
    ]), 700);
  }

  // ---------- Darstellung Spielfeld ----------
  function buildBoard() {
    const N = game.N, B = Math.sqrt(N), board = $('#board');
    board.style.gridTemplateColumns = `repeat(${N}, minmax(0, 1fr))`;
    board.style.gridTemplateRows = `repeat(${N}, minmax(0, 1fr))`;
    board.classList.toggle('n16', N === 16);
    board.classList.toggle('symbols', game.set !== 'zahlen');
    board.innerHTML = '';
    cells = [];
    for (let i = 0; i < N * N; i++) {
      const r = Math.floor(i / N), c = i % N, el = document.createElement('button');
      el.className = 'cell' + (c % B === B - 1 && c < N - 1 ? ' br' : '') + (r % B === B - 1 && r < N - 1 ? ' bb' : '') + (c === N - 1 ? ' lastc' : '') + (r === N - 1 ? ' lastr' : '');
      el.dataset.i = i;
      el.setAttribute('aria-label', `Zeile ${r + 1}, Spalte ${c + 1}`);
      board.appendChild(el); cells.push(el);
    }
    const pad = $('#numpad');
    pad.classList.toggle('n16', N === 16);
    pad.innerHTML = Array.from({ length: N }, (_, k) => `<button class="num" data-v="${k + 1}" aria-label="${Symbols.name(game.set, k + 1)}">${Symbols.html(game.set, k + 1, 'pad')}</button>`).join('');
    // Zoom nur bei 16×16
    zoomed = false;
    $('#board-wrap').classList.remove('zoom');
    $('#t-zoom').hidden = N !== 16;
    $('#t-zoom').setAttribute('aria-pressed', 'false');
    $('.tools').classList.toggle('six', N === 16);
    $('#notes-strip').hidden = N !== 16;
  }

  let zoomed = false;
  function toggleZoom() {
    touch();
    zoomed = !zoomed;
    $('#board-wrap').classList.toggle('zoom', zoomed);
    $('#t-zoom').setAttribute('aria-pressed', String(zoomed));
    if (sel >= 0) scrollToCell(sel); else $('#board-scroll').scrollTo(0, 0);
  }
  function scrollToCell(i) {
    if (!zoomed || !cells[i]) return;
    const box = $('#board-scroll'), el = cells[i];
    const x = el.offsetLeft - box.clientWidth / 2 + el.offsetWidth / 2, y = el.offsetTop - box.clientHeight / 2 + el.offsetHeight / 2;
    box.scrollTo({ left: x, top: y, behavior: 'smooth' });
  }

  // Notizen des gewählten Feldes groß anzeigen (16×16)
  function renderNotesStrip() {
    const strip = $('#notes-strip');
    if (game.N !== 16) return;
    const n = sel >= 0 && !game.values[sel] ? game.notes[sel] : 0;
    if (!n) { strip.innerHTML = sel >= 0 && !game.values[sel] ? 'Keine Notizen in diesem Feld' : 'Notizen des gewählten Feldes erscheinen hier'; return; }
    let s = 'Notizen:';
    for (let k = 1; k <= game.N; k++) if (n & (1 << (k - 1))) s += game.set === 'zahlen' ? `<span class="nnum">${k}</span>` : Symbols.html(game.set, k, 'strip');
    strip.innerHTML = s;
  }

  const lastRender = [];
  function renderBoard() {
    const N = game.N, g = Sudoku.geo(N);
    const peer = new Set(), hintU = new Set();
    if (sel >= 0) for (const p of g.peers[sel]) peer.add(p);
    if (game.hint && game.hint.unit !== undefined) for (const p of g.units[game.hint.unit]) hintU.add(p);
    const marked = new Set(game.marked);
    for (let i = 0; i < N * N; i++) {
      const el = cells[i], v = game.values[i], n = game.notes[i];
      el.classList.toggle('given', !!game.puzzle[i]);
      el.classList.toggle('sel', i === sel);
      el.classList.toggle('peer', i !== sel && peer.has(i));
      el.classList.toggle('hintu', hintU.has(i));
      el.classList.toggle('hintc', !!game.hint && game.hint.cell === i);
      el.classList.toggle('wrong', marked.has(i));
      el.classList.toggle('filled', !!v);
      const sig = v ? 'v' + v : 'n' + n;
      if (lastRender[i] === sig) continue;
      lastRender[i] = sig;
      if (v) el.innerHTML = Symbols.html(game.set, v, 'big');
      else if (n) {
        let s = '<span class="notes">';
        for (let k = 1; k <= N; k++) s += n & (1 << (k - 1)) ? (game.set === 'zahlen' ? `<span>${k}</span>` : Symbols.html(game.set, k, 'note')) : '<span></span>';
        el.innerHTML = s + '</span>';
      } else el.innerHTML = '';
    }
    renderNotesStrip();
  }

  function renderTools() {
    $('#t-pencil').setAttribute('aria-pressed', String(pencil));
    $('#numpad').classList.toggle('pencil', pencil);
    $('#t-check-label').textContent = game.checkStage === 1 ? 'Zeigen' : 'Prüfen';
    $('#t-check').classList.toggle('stage2', game.checkStage === 1);
    updateTipRing();
  }

  function renderPause() {
    const paused = !!game && !game.finished && !game.running;
    $('#board').classList.toggle('paused', paused);
    $('#cover').hidden = !paused;
    $('#screen-game').classList.toggle('paused-ui', paused);
    if (gs.el) gs.el.classList.toggle('away', paused);
    updateTimer();
  }

  function updateTimer() {
    if (!game) return;
    const t = $('#timer');
    t.hidden = !game.timed;
    if (game.timed) t.textContent = fmt(elapsed());
  }

  function flash(i) { const el = cells[i]; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }

  // ---------- Sprechblasen ----------
  function makeBubble(stageEl) {
    const el = document.createElement('div');
    el.className = 'speech'; stageEl.appendChild(el);
    const b = { el, sticky: false, hideT: 0, talkT: 0 };
    b.show = (actor, text, o = {}) => {
      clearTimeout(b.hideT);
      el.textContent = text;
      el.classList.toggle('sticky', !!o.sticky); b.sticky = !!o.sticky;
      el.style.left = '0px';
      const W = stageEl.clientWidth, bw = el.offsetWidth, cx = actor.x + actor.w / 2;
      const left = Math.max(0, Math.min(W - bw, cx - bw / 2));
      el.style.left = left + 'px';
      el.style.bottom = (actor.h * (actor.el.dataset.pose === 'sleep' ? .78 : .95)) + 'px';
      el.style.setProperty('--tail', Math.max(16, Math.min(bw - 16, cx - left)) + 'px');
      el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
      if (!actor.el.dataset.face && actor.el.dataset.pose !== 'sleep') actor.face('talk');
      clearTimeout(b.talkT);
      b.talkT = setTimeout(() => { if (actor.el.dataset.face === 'talk') actor.face(null); }, Math.min(3200, 700 + text.length * 38));
      if (!o.sticky) b.hideT = setTimeout(() => b.hide(), o.ms || Math.min(11000, 2800 + text.length * 60));
    };
    b.hide = (force) => { if (b.sticky && !force) return; b.sticky = false; el.classList.remove('show', 'sticky'); };
    b.visible = () => el.classList.contains('show');
    el.onclick = () => b.hide(true);
    return b;
  }

  // ---------- Bühne im Spiel: Vincent & Alex leben in der App ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const IDLE_GAP = DEV ? [5000, 9000] : [15000, 32000];
  const MOMENT_GAP = DEV ? [14000, 20000] : [80000, 150000];
  const gs = { tok: 0, nextIdle: 0, nextMoment: 0, W: 0, H: 0 };

  function stageInit() {
    gs.el = $('#game-stage');
    gs.a = new Figures.Actor(gs.el, 'alex'); gs.a.rest = 'sit-think'; gs.a.pose('sit-think');
    gs.v = new Figures.Actor(gs.el, 'vincent');
    gs.b = makeBubble(gs.el);
    gs.zzz = document.createElement('div'); gs.zzz.className = 'zzz-float'; gs.zzz.textContent = 'Zzz'; gs.zzz.hidden = true; gs.el.appendChild(gs.zzz);
    new ResizeObserver(stageLayout).observe(gs.el);
    // Pause: Vincent hält das Schild vor das Spielfeld
    new Figures.Actor($('#pause-holder'), 'vincent').pose('hold');
    // Laden: Alex rührt den Teig
    const baker = new Figures.Actor($('#bake'), 'alex'); baker.pose('stir');
    $('#bake').prepend(baker.el);
    setInterval(stageTick, 1000);
  }
  function stageLayout() {
    gs.W = gs.el.clientWidth; gs.H = gs.el.clientHeight;
    if (!gs.W) return;
    gs.el.style.setProperty('--fig-h', Math.max(72, Math.min(150, gs.H - 8)) + 'px');
    gs.a.place(alexX());
    if (gs.v.x > vMaxX()) gs.v.place(vMaxX());
  }
  const alexX = () => gs.W - gs.a.w - 2;
  const vMaxX = () => Math.max(2, alexX() - gs.v.w * .9);
  const vHomeX = () => Math.max(2, Math.min(vMaxX(), gs.W * .3 - gs.v.w / 2));
  const vSay = (text, o) => gs.b.show(gs.v, text, o);
  function scheduleIdle() { gs.nextIdle = now() + rand(...IDLE_GAP); if (!gs.nextMoment) gs.nextMoment = now() + rand(...MOMENT_GAP); }

  async function dirEnter(text) {
    const my = ++gs.tok; gs.busy = my; scheduleIdle();
    stageLayout();
    gs.b.hide(true); gs.el.classList.remove('away'); gs.zzz.hidden = true;
    gs.a.rest = 'sit-think'; gs.a.pose('sit-think').face(null);
    gs.v.rest = 'idle'; gs.v.face(null);
    gs.v.place(-gs.v.w - 10);
    await gs.v.walkTo(vHomeX(), 130); if (my !== gs.tok) return;
    gs.v.pose('wave'); vSay(text);
    await delay(1600); if (my !== gs.tok) return;
    gs.v.pose('idle'); scheduleIdle(); if (gs.busy === my) gs.busy = 0;
  }
  function dirSay(text, o = {}) {
    const my = ++gs.tok;
    gs.v.stop(); gs.zzz.hidden = true; gs.v.rest = 'idle';
    gs.v.pose(o.pose || 'idle'); vSay(text, o);
    if (o.pose && o.poseMs) setTimeout(() => { if (my === gs.tok) gs.v.pose('idle'); }, o.poseMs);
    scheduleIdle();
  }
  async function dirCheck(text, after) {
    const my = ++gs.tok; gs.busy = my; scheduleIdle();
    gs.v.stop(); gs.b.hide(true); gs.v.pose('think');
    await delay(800); if (my !== gs.tok) return;
    gs.v.pose(after || 'idle'); vSay(text);
    if (after) setTimeout(() => { if (my === gs.tok) gs.v.pose('idle'); }, 1100);
    scheduleIdle(); if (gs.busy === my) gs.busy = 0;
  }
  async function dirTip(text) {
    const my = ++gs.tok; gs.busy = my; scheduleIdle();
    gs.v.stop(); gs.b.hide(true); gs.zzz.hidden = true; gs.v.rest = 'idle';
    const target = Math.max(2, alexX() - gs.v.w * .6);
    await gs.v.walkTo(target, 160); if (my !== gs.tok) return;
    gs.a.pose('kiss'); gs.v.face('blush');
    Figures.heartPop(gs.el, target + gs.v.w * .7, Math.max(0, gs.H - gs.v.h * 1.02), 26);
    await delay(1100); if (my !== gs.tok) return;
    gs.a.pose(gs.a.rest); gs.v.face(null); gs.v.pose('point');
    vSay(text, { sticky: true });
    scheduleIdle(); if (gs.busy === my) gs.busy = 0;
  }
  function dirClearSticky() { if (gs.b && gs.b.sticky) { gs.b.hide(true); if (gs.v.el.dataset.pose === 'point') gs.v.pose('idle'); } }
  function dirSleep(text) {
    ++gs.tok; gs.v.stop(); gs.v.rest = 'sleep'; gs.v.pose('sleep').face(null);
    vSay(text);
    gs.zzz.style.left = (gs.v.x + gs.v.w * .68) + 'px'; gs.zzz.style.bottom = (gs.v.h * .6) + 'px'; gs.zzz.hidden = false;
  }
  function dirWake(text) {
    ++gs.tok; gs.zzz.hidden = true; gs.v.rest = 'idle';
    gs.v.pose('hop').face('o'); vSay(text);
    setTimeout(() => { if (gs.v.el.dataset.face === 'o') gs.v.face(null); if (gs.v.el.dataset.pose === 'hop') gs.v.pose('idle'); }, 1000);
    scheduleIdle();
  }
  function dirAwake() { if (!gs.v) return; gs.zzz.hidden = true; if (gs.v.rest === 'sleep') { gs.v.rest = 'idle'; gs.v.pose('idle'); } }
  function dirWin(text) {
    const my = ++gs.tok;
    gs.v.stop(); gs.zzz.hidden = true; gs.el.classList.remove('away'); gs.v.rest = 'idle';
    gs.v.pose('cheer').face('happy'); gs.a.pose('cheer').face('happy'); vSay(text, { ms: 6000 });
    for (let k = 0; k < 6; k++) setTimeout(() => Figures.heartPop(gs.el, rand(gs.W * .15, gs.W * .85), gs.H * rand(.05, .45), rand(18, 30)), k * 320);
    setTimeout(() => { if (my === gs.tok) { gs.v.pose('idle').face(null); gs.a.pose('idle').face(null); } }, 4200);
  }
  function dirPause(text) { ++gs.tok; gs.v.stop(); gs.b.hide(true); $('#cover-say').textContent = text || ''; $('#cover-say').hidden = !text; }
  function dirResume(text) {
    ++gs.tok; gs.zzz.hidden = true; gs.v.rest = 'idle';
    gs.v.place(Math.min(Math.max(2, gs.v.x), vMaxX()));
    gs.v.pose('hop'); vSay(text);
    setTimeout(() => { if (gs.v.el.dataset.pose === 'hop') gs.v.pose('idle'); }, 1000);
    scheduleIdle();
  }

  // Kleine Zufallsmomente, wenn gerade nichts passiert
  function stageTick() {
    if (!game || !isRunning() || sleeping || !$('#screen-game').classList.contains('active')) return;
    if ((gs.busy && gs.busy === gs.tok) || gs.b.sticky || gs.b.visible() || gs.v.el.dataset.pose === 'walk') return;
    const tm = now();
    if (gs.nextMoment && tm > gs.nextMoment) { gs.nextMoment = tm + rand(...MOMENT_GAP); catMoment(); return; }
    if (gs.nextIdle && tm > gs.nextIdle) { scheduleIdle(); idleAction(); }
  }
  async function idleAction() {
    const my = ++gs.tok, r = Math.random();
    const back = (actor, ms) => delay(ms).then(() => { if (my === gs.tok) actor.pose(actor.rest).face(null); });
    if (r < .36) await gs.v.walkTo(rand(2, vMaxX()));
    else if (r < .5) { gs.v.pose('wave'); await back(gs.v, 1500); }
    else if (r < .6) { gs.v.pose('hop'); await back(gs.v, 1000); }
    else if (r < .7) { gs.v.face('yawn'); await back(gs.v, 1700); }
    else if (r < .82) { gs.a.pose('stretch').face('happy'); await delay(1500); gs.a.pose(gs.a.rest).face(null); }
    else if (r < .92) {
      gs.v.face('happy'); gs.a.face('happy');
      Figures.heartPop(gs.el, (gs.v.x + gs.v.w + alexX()) / 2 - 10, gs.H * .2, 24);
      await delay(1400); gs.a.face(null); if (my === gs.tok) gs.v.face(null);
    } else { gs.v.pose('think'); await back(gs.v, 1800); }
  }
  // Eine Katze schlendert vorbei, bleibt kurz stehen, miaut und läuft weiter
  let catBusy = false;
  async function catMoment() {
    if (catBusy) return; catBusy = true;
    const c = document.createElement('div'), fromLeft = Math.random() < .5;
    c.className = 'cat-run walk' + (fromLeft ? '' : ' left'); c.innerHTML = Figures.catSVG();
    gs.el.appendChild(c);
    const cw = c.offsetWidth, speed = 58;
    const start = fromLeft ? -cw - 10 : gs.W + 10, end = fromLeft ? gs.W + 10 : -cw - 10;
    // Haltepunkt in einer freien Lücke (zwischen Vincent und Alex oder links von Vincent)
    const vL = gs.v.x, vR = gs.v.x + gs.v.w, aL = alexX();
    const gaps = [[vR, aL], [0, vL]].filter(([s, e]) => e - s >= cw + 6);
    const mid = gaps.length ? gaps[0][0] + (gaps[0][1] - gaps[0][0] - cw) / 2 : null;
    const go = (to) => new Promise(res => {
      const from = new DOMMatrix(getComputedStyle(c).transform).m41, dur = Math.abs(to - from) / speed * 1000;
      c.classList.add('walk'); c.classList.remove('stand');
      c.style.transition = `transform ${dur}ms linear`; c.style.transform = `translateX(${to}px)`;
      setTimeout(res, dur);
    });
    c.style.transform = `translateX(${start}px)`; void c.offsetWidth;
    if (mid !== null) {
      await go(mid);
      // Stehenbleiben: Alex hat Respekt vor Katzen, Vincent freut sich
      c.classList.remove('walk'); c.classList.add('stand');
      gs.a.face('o');
      if (!sleeping && ['idle', 'think'].includes(gs.v.el.dataset.pose)) gs.v.pose('wave').face('happy');
      const m = document.createElement('div'); m.className = 'cat-meow'; m.textContent = 'Miau!';
      gs.el.appendChild(m);
      m.style.left = Math.max(0, Math.min(gs.W - m.offsetWidth, mid + cw * (fromLeft ? .78 : .22) - m.offsetWidth / 2)) + 'px';
      m.style.bottom = (c.offsetHeight * .98) + 'px';
      setTimeout(() => m.remove(), 1700);
      await delay(1900);
      gs.a.face(null);
      if (gs.v.el.dataset.pose === 'wave') gs.v.pose('idle').face(null);
    }
    await go(end);
    c.remove(); catBusy = false;
    scheduleIdle();
  }

  // ---------- Startseite: beide stehen zusammen ----------
  const hs = { shown: false };
  function homeInit() {
    hs.el = $('#home-stage');
    hs.v = new Figures.Actor(hs.el, 'vincent'); hs.a = new Figures.Actor(hs.el, 'alex');
    hs.b = makeBubble(hs.el);
    hs.el.style.setProperty('--fig-h', '138px');
    new ResizeObserver(homeLayout).observe(hs.el);
    setInterval(homeTick, 1000); hs.next = now() + 4000;
  }
  function homeLayout() { const W = hs.el.clientWidth; if (!W) return; hs.v.place(W / 2 - hs.v.w + 4); hs.a.place(W / 2 - 2); }
  function homeTick() {
    if (!$('#screen-home').classList.contains('active') || hs.b.visible() || hs.busy || now() < hs.next) return;
    hs.next = now() + rand(5000, 9000);
    const r = Math.random(), reset = (a, ms) => setTimeout(() => a.pose('idle').face(null), ms);
    if (r < .35) { hs.v.pose('wave'); reset(hs.v, 1500); }
    else if (r < .6) { hs.a.pose('wave'); reset(hs.a, 1500); }
    else if (r < .8) { hs.v.face('happy'); hs.a.face('happy'); Figures.heartPop(hs.el, hs.el.clientWidth / 2 - 11, 0, 24); setTimeout(() => { hs.v.face(null); hs.a.face(null); }, 1400); }
    else { hs.v.pose('hop'); hs.a.pose('hop'); reset(hs.v, 1000); reset(hs.a, 1000); }
  }

  // ---------- Besondere Tage ----------
  function applyDayProps() {
    if (!DAY) return;
    const info = DAY_INFO[DAY];
    for (const a of [gs.v, hs.v]) a && a.props(info.v);
    for (const a of [gs.a, hs.a]) a && a.props(info.a);
    if (info.banner) { $('#day-banner').textContent = info.banner; $('#day-banner').hidden = false; }
    document.body.classList.add('has-day');
    if (DAY === 'valentin' || DAY === 'jahrestag') document.body.classList.add('day-love');
  }
  async function daySceneHome() {
    if (!DAY || hs.shown) return;
    hs.shown = true; hs.busy = true;
    await delay(700);
    if (DAY === 'vincent') {
      // Vincent will nicht im Mittelpunkt stehen …
      hs.v.props('hat-drop').face('o');
      await delay(1100);
      hs.v.props(null).face(null).pose('no');
      hs.b.show(hs.v, T.vincentTag[0], { ms: 4200 });
      await delay(4400);
      hs.v.pose('idle');
      const cake = document.createElement('div'); cake.className = 'cake-prop';
      cake.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-cake"/></svg>';
      cake.style.left = (hs.a.x + hs.a.w * .55) + 'px'; hs.el.appendChild(cake);
      hs.a.face('happy'); hs.v.face('blush');
      hs.b.show(hs.v, T.vincentTag[1], { ms: 4200 });
      await delay(4400);
      hs.v.face(null); hs.a.face(null);
      hs.b.show(hs.v, T.vincentTag[2], { ms: 4200 });
    } else {
      if (DAY_INFO[DAY].confetti) confetti(180);
      hs.v.pose('cheer'); hs.a.pose('cheer');
      for (let k = 0; k < 5; k++) setTimeout(() => Figures.heartPop(hs.el, rand(20, hs.el.clientWidth - 40), rand(0, 50), rand(18, 28)), k * 300);
      hs.b.show(hs.v, T[DAY][0], { ms: 9000 });
      await delay(2500);
      hs.v.pose('idle'); hs.a.pose('idle');
    }
    hs.busy = false;
  }
  // Text beim Rätselstart: an besonderen Tagen beim ersten Rätsel der Tagesgruß
  let dayGameShown = false;
  function startText() {
    if (DAY && !dayGameShown) { dayGameShown = true; return DAY === 'vincent' ? T.vincentTag[2] : T[DAY][0]; }
    return t('start');
  }

  // ---------- Begrüßungsszene beim allerersten Öffnen ----------
  function maybeIntro() {
    const force = DEV && new URLSearchParams(location.search).has('intro');
    if (!force && store.get('introDone', false)) return false;
    const ov = $('#intro'), st = $('#intro-stage');
    ov.hidden = false;
    const v = new Figures.Actor(st, 'vincent'), a = new Figures.Actor(st, 'alex'), b = makeBubble(st);
    const place = () => { const W = st.clientWidth; v.place(W / 2 - v.w + 6); a.place(W / 2 - 4); };
    place(); new ResizeObserver(place).observe(st);
    let step = 0;
    const btn = $('#intro-next');
    const showStep = () => {
      v.pose(step === 0 ? 'wave' : step === 2 ? 'point' : 'idle');
      a.pose(step === 0 ? 'wave' : 'idle').face(step === 1 ? 'happy' : null);
      if (step === 1) Figures.heartPop(st, st.clientWidth / 2 - 13, st.clientHeight * .25, 28);
      b.show(v, T.intro[step], { sticky: true });
      btn.textContent = step === T.intro.length - 1 ? 'Los geht\'s!' : 'Weiter';
    };
    btn.onclick = () => {
      step++;
      if (step < T.intro.length) return showStep();
      b.hide(true); v.pose('cheer').face('happy'); a.pose('cheer').face('happy');
      for (let k = 0; k < 6; k++) setTimeout(() => Figures.heartPop(st, rand(st.clientWidth * .25, st.clientWidth * .75), st.clientHeight * rand(.1, .4), rand(20, 32)), k * 220);
      store.set('introDone', true);
      setTimeout(() => { ov.hidden = true; st.querySelectorAll('.actor,.speech').forEach(e => e.remove()); daySceneHome(); }, 1500);
    };
    setTimeout(showStep, 500);
    return true;
  }

  // ---------- Spiel starten ----------
  function enterGame(fresh) {
    sel = -1; pencil = false; lastRender.length = 0;
    buildBoard();
    $('#game-level').textContent = `${DIFF_LABEL[game.difficulty]} · ${game.N}×${game.N}`;
    show('game');
    renderBoard(); renderTools();
    sleeping = false;
    if (fresh) {
      resume();
      dirEnter(startText());
    } else {
      dirAwake();
      stageLayout();
      gs.v.place(vHomeX()); gs.a.pose(gs.a.rest);
      dirPause(t('reopen'));
      renderPause();
    }
  }

  async function startNew() {
    askPersistent();
    store.set('setup', setup);
    show('loading');
    const bar = $('.loading-bar span'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    const [p] = await Promise.all([takePuzzle(setup.N, setup.difficulty), delay(LOADING_MS)]);
    game = newGame(p);
    store.set('game', game);
    enterGame(true);
  }

  function continueGame() {
    const g = store.get('game', null);
    if (!g || g.finished) return show('home');
    game = g; game.running = false;
    if (!Symbols.SETS[game.set]) game.set = 'zahlen';
    enterGame(false);
  }

  // ---------- Statistik ----------
  function dayKey(ts) { const d = new Date(ts); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
  function renderStats() {
    const res = store.get('results', []);
    const clean = res.filter(r => !r.assisted).length;
    // Serien: Tage, an denen mindestens ein Rätsel gelöst wurde
    const days = new Set(res.map(r => dayKey(r.date)));
    const DAY = 864e5, today = new Date(); today.setHours(12, 0, 0, 0);
    let cur = 0, start = days.has(dayKey(today)) ? 0 : 1;
    while (days.has(dayKey(today - (start + cur) * DAY))) cur++;
    let best = 0;
    for (const k of days) {
      const [y, m, d] = k.split('-').map(Number), t0 = new Date(y, m - 1, d, 12).getTime();
      if (days.has(dayKey(t0 - DAY))) continue; // nur Serienanfänge
      let n = 0; while (days.has(dayKey(t0 + n * DAY))) n++;
      best = Math.max(best, n);
    }
    const counts = {}; for (const r of res) { const s = r.set || 'zahlen'; counts[s] = (counts[s] || 0) + 1; }
    const fav = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    $('#stat-tiles').innerHTML = [
      [res.length, 'Rätsel gelöst'], [clean, 'davon ohne Hilfe'],
      [cur + (cur === 1 ? ' Tag' : ' Tage'), 'in Folge gespielt'], [best + (best === 1 ? ' Tag' : ' Tage'), 'längste Serie'],
    ].map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('') +
      `<div class="stat" style="grid-column:1/-1"><b class="small">${fav ? Symbols.SETS[fav].label + ' ' + [1, 2, 3].map(v => Symbols.html(fav, v, 'p')).join('') : '–'}</b><span>Lieblings-Symbole</span></div>`;
    let h = '<tr><th></th><th>Gelöst</th><th>Bestzeit</th><th>Ø Zeit</th></tr>';
    for (const N of [9, 16]) for (const d of DIFFS) {
      const rs = res.filter(r => r.N === N && r.d === d), timed = rs.filter(r => r.timed && !r.assisted).map(r => r.ms);
      const bestT = timed.length ? fmt(Math.min(...timed)) : '–', avg = timed.length ? fmt(timed.reduce((a, b) => a + b, 0) / timed.length) : '–';
      h += `<tr><td>${N}×${N} ${DIFF_LABEL[d]}</td><td>${rs.length}</td><td>${bestT}</td><td>${avg}</td></tr>`;
    }
    $('#stat-table').innerHTML = h;
  }

  // ---------- Dialog ----------
  function modal(html, buttons) {
    $('#modal-body').innerHTML = html;
    const acts = $('#modal-actions'); acts.innerHTML = '';
    for (const b of buttons) {
      const el = document.createElement('button');
      el.className = 'btn ' + (b.primary ? 'primary' : 'secondary');
      el.textContent = b.label;
      el.onclick = () => { $('#modal').hidden = true; if (b.action) b.action(); };
      acts.appendChild(el);
    }
    $('#modal').hidden = false;
  }

  // ---------- Konfetti ----------
  function confetti(n) {
    const cv = $('#confetti'), ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const colors = ['#d6455d', '#f08a8f', '#9c3d6b', '#e3b043', '#ffb3c1', '#fff1f3'];
    const ps = Array.from({ length: n }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 80, y: innerHeight * .45,
      vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 5, r: Math.random() * 6 + 4,
      c: pick(colors), a: Math.random() * 6, va: (Math.random() - .5) * .4, heart: Math.random() < .25
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of ps) {
        p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c;
        if (p.heart) { ctx.font = `${p.r * 3}px sans-serif`; ctx.fillText('♥', -p.r, p.r); }
        else ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      if (t - t0 < 3500) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  // ---------- Hintergrund ----------
  function decorate() {
    const love = DAY === 'valentin' || DAY === 'jahrestag';
    const bg = $('#bg'), icons = love ? ['i-heart'] : ['i-heart', 'i-heart', 'i-paw', 'i-star', 'i-cake'], colors = ['#d6455d', '#9c3d6b', '#f08a8f', '#e3b043'];
    for (let k = 0; k < (love ? 24 : 12); k++) {
      const s = 18 + Math.random() * 26;
      bg.insertAdjacentHTML('beforeend', `<svg style="left:${Math.random() * 100}%;width:${s}px;height:${s}px;color:${pick(colors)};animation-duration:${22 + Math.random() * 26}s;animation-delay:-${Math.random() * 40}s"><use href="#${pick(icons)}"/></svg>`);
    }
  }

  // ---------- Ereignisse ----------
  function bind() {
    $('#btn-new').onclick = () => {
      const g = store.get('game', null);
      if (g && !g.finished) modal('<h2>Neues Rätsel?</h2><p>Dein angefangenes Rätsel geht dabei verloren.</p>', [
        { label: 'Ja, neues Rätsel', primary: true, action: () => { store.del('game'); renderSetup(); show('setup'); } },
        { label: 'Lieber weiterspielen', action: continueGame }
      ]);
      else { renderSetup(); show('setup'); }
    };
    $('#btn-continue').onclick = continueGame;
    $$('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    $('#seg-size').onclick = e => { const b = e.target.closest('button'); if (b && !b.disabled) { setup.N = +b.dataset.size; renderSetup(); } };
    $('#diffs').onclick = e => { const b = e.target.closest('button'); if (b) { setup.difficulty = b.dataset.diff; renderSetup(); } };
    $('#sw-timed').onclick = () => { setup.timed = !setup.timed; renderSetup(); };
    $('#btn-start').onclick = startNew;

    $('#btn-options').onclick = () => { renderOptions(); show('options'); };
    $('#btn-stats').onclick = () => show('stats');
    $('#sets').onclick = e => { const b = e.target.closest('button'); if (b) { setup.set = b.dataset.set; renderSetup(); } };
    $('#t-zoom').onclick = toggleZoom;
    $('#seg-theme').onclick = e => { const b = e.target.closest('button'); if (b) { prefs.theme = b.dataset.theme; store.set('prefs', prefs); applyTheme(); renderOptions(); } };
    $('#sw-autonotes').onclick = () => { prefs.autoNotes = !prefs.autoNotes; store.set('prefs', prefs); renderOptions(); };

    $('#btn-home').onclick = () => { if (game && !game.finished) { pause(); saveGame(); } show('home'); };
    $('#btn-pause').onclick = () => { if (isRunning()) { dirPause(t('pause')); pause(); } else if (game && !game.finished) { resume(); dirResume(t('back')); } };
    $('#cover').onclick = () => { resume(); dirResume(t('back')); };
    if (DEV) $('#dev-moment').onclick = () => { if (isRunning()) catMoment(); };

    $('#board').addEventListener('click', e => {
      const el = e.target.closest('.cell'); if (!el || !isRunning()) return;
      touch(); sel = +el.dataset.i; renderBoard();
    });
    $('#numpad').addEventListener('click', e => { const b = e.target.closest('.num'); if (b) input(+b.dataset.v); });
    $('#t-undo').onclick = undo;
    $('#t-erase').onclick = erase;
    $('#t-pencil').onclick = () => { touch(); pencil = !pencil; renderTools(); };
    $('#t-check').onclick = onCheck;
    $('#t-tip').onclick = onTip;

    document.addEventListener('keydown', e => {
      if (!game || !$('#screen-game').classList.contains('active') || !$('#modal').hidden) return;
      const k = e.key;
      if (/^[1-9]$/.test(k)) input(+k);
      else if (k === 'Backspace' || k === 'Delete' || k === '0') erase();
      else if (k === 'ArrowUp') moveSel(-1, 0); else if (k === 'ArrowDown') moveSel(1, 0);
      else if (k === 'ArrowLeft') moveSel(0, -1); else if (k === 'ArrowRight') moveSel(0, 1);
      else if (k === 'n' || k === 'b') { pencil = !pencil; renderTools(); }
      else if ((e.ctrlKey || e.metaKey) && k === 'z') undo();
      else return;
      e.preventDefault();
    });

    // Auto-Pause beim Verlassen der App
    const autoPause = () => { if (isRunning()) { dirPause(t('autoPause')); pause(); } saveGame(); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
    window.addEventListener('pagehide', autoPause);

    if (DEV) {
      $('#dev').hidden = false;
      $('#dev-almost').onclick = () => {
        if (!isRunning()) return;
        const empty = game.values.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        for (const i of empty.slice(1)) { game.values[i] = game.solution[i]; game.notes[i] = 0; }
        renderBoard(); saveGame();
      };
    }
  }

  // ---------- Start ----------
  Symbols.inject();
  decorate();
  bind();
  stageInit();
  homeInit();
  applyDayProps();
  show('home');
  if (!maybeIntro()) daySceneHome();

  // Offline-Speicher: online immer, lokal beim Entwickeln nur mit ?sw (sonst sieht man Änderungen erst verzögert)
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  if ('serviceWorker' in navigator && (!local || new URLSearchParams(location.search).has('sw'))) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  setInterval(tick, 500);
  setTimeout(fillPregen, 300);
})();
