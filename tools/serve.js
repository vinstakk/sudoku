// Mini-Webserver zum lokalen Testen: node tools/serve.js [port]
// Mit "--lan" auch im Heimnetz erreichbar (zum Testen am Handy).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const port = +process.argv.find(a => /^\d+$/.test(a)) || 5173;
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
// Nur mit "--icons": nimmt im Browser erzeugte PNG-Symbole entgegen (tools/icon-maker.html) und speichert sie in icons/
const allowIcons = process.argv.includes('--icons');
http.createServer((req, res) => {
  if (allowIcons && req.method === 'POST' && req.url.startsWith('/__icon?name=')) {
    const name = decodeURIComponent(req.url.split('=')[1]);
    if (!/^[a-z0-9-]+\.png$/.test(name)) { res.writeHead(400); return res.end(); }
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      fs.mkdirSync(path.join(root, 'icons'), { recursive: true });
      fs.writeFileSync(path.join(root, 'icons', name), Buffer.concat(chunks));
      res.writeHead(200); res.end('ok');
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Nicht gefunden'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, host, () => console.log(`Läuft auf http://localhost:${port}`));
