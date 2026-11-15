/* Offline-Speicher für Alex' Sudoku.
   Alle App-Dateien werden beim Installieren gespeichert. Danach startet die App sofort aus dem Speicher
   und holt im Hintergrund neue Versionen (sichtbar ab dem nächsten Öffnen).
   Bei Änderungen an der Dateiliste VERSION erhöhen. */
const VERSION = 'v2';
const CACHE = 'alex-sudoku-' + VERSION;
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'css/figures.css',
  'js/sudoku.js', 'js/symbols.js', 'js/figures.js', 'js/app.js', 'js/worker.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-192.png', 'icons/maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-64.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('alex-sudoku-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
