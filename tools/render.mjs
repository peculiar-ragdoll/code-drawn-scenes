#!/usr/bin/env node
// render.mjs: render a scene, save frames and zoomed tiles, run its checks, print the results as text.
// No dependencies beyond Node 22+ and a Chrome/Chromium binary. It serves the folder itself on a free port with
// caching off, and uses a fresh browser profile on every run, so a render is never stale.
//
//   node tools/render.mjs <folder> [options]
//     --page scene.html        the page to render (default scene.html)
//     --times 20,24.5          animation times to render, in seconds (default 20)
//     --size 1600x900          the scene's logical size (default 1600x900)
//     --full 0.8               scale of the saved full frame (default 0.8, i.e. 1280 px wide; 0 skips it)
//     --tiles 3x3              grid of zoomed tiles over the frame (default 3x3; 0 skips them)
//     --zoom 3                 zoom of tiles and crops (default 3)
//     --crop x,y,w,h           a zoomed crop in logical pixels; repeat for several
//     --out <dir>              where images go (default <folder>/shots)
//     --chrome <path>          browser binary (default: $CHROME, then common install locations)
//
// The page contract (checks.md): `?t=<seconds>` draws that moment and holds still, `?dprMax=<n>` caps the pixel
// ratio, and `?check=1` runs the scene checks and stores the failures in `window.__sceneChecks` (an array of strings).
// Exit code: 0 when the checks are exposed and all pass and the console has no errors, 1 otherwise, 2 if the runner
// itself failed.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const argv = process.argv.slice(2);
if (!argv[0] || argv[0].startsWith('--')) { console.error('usage: node tools/render.mjs <folder> [--times 20,24] [--tiles 3x3] [--zoom 3] [--crop x,y,w,h] ...'); process.exit(2); }
const root = path.resolve(argv[0]), opt = { page: 'scene.html', times: '20', size: '1600x900', full: '0.8', tiles: '3x3', zoom: '3', crop: [], out: '', chrome: '' };
for (let i = 1; i < argv.length; i += 2) { const k = argv[i].replace(/^--/, ''); if (k === 'crop') opt.crop.push(argv[i + 1]); else opt[k] = argv[i + 1]; }
const [W, H] = opt.size.split('x').map(Number), times = opt.times.split(',').map(Number), zoom = +opt.zoom, fullScale = +opt.full;
const tiles = opt.tiles === '0' ? null : opt.tiles.split('x').map(Number), outDir = path.resolve(opt.out || path.join(root, 'shots'));
fs.mkdirSync(outDir, { recursive: true });

function findChrome() {
  const c = [opt.chrome, process.env.CHROME].filter(Boolean);
  const cache = [path.join(os.homedir(), 'Library/Caches/ms-playwright'), path.join(os.homedir(), '.cache/ms-playwright')];
  for (const dir of cache) if (fs.existsSync(dir)) for (const d of fs.readdirSync(dir).sort().reverse()) {
    if (d.startsWith('chromium_headless_shell')) for (const sub of ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64', 'chrome-headless-shell-linux64', 'chrome-linux'])
      for (const exe of ['chrome-headless-shell', 'headless_shell']) c.push(path.join(dir, d, sub, exe));
  }
  c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable');
  return c.find(p => fs.existsSync(p));
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});

let proc, profile;
async function main() {
  const bin = findChrome(); if (!bin) throw new Error('no Chrome/Chromium found; pass --chrome <path> or set $CHROME');
  await new Promise(r => server.listen(0, '127.0.0.1', r)); const port = server.address().port;
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
  proc = spawn(bin, ['--headless', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
  const portFile = path.join(profile, 'DevToolsActivePort'); let tries = 0;
  while (!fs.existsSync(portFile) || fs.readFileSync(portFile, 'utf8').split('\n').length < 2) { if (++tries > 200) throw new Error('browser did not start'); await new Promise(r => setTimeout(r, 50)); }
  const [dport, dpath] = fs.readFileSync(portFile, 'utf8').trim().split('\n');
  const ws = new WebSocket(`ws://127.0.0.1:${dport}${dpath}`); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const { r, j } = pending.get(m.id); pending.delete(m.id); m.error ? j(new Error(m.error.message)) : r(m.result); } else listeners.forEach(f => f(m)); };
  const send = (method, params = {}, sessionId) => new Promise((r, j) => { const i = ++id; pending.set(i, { r, j }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId: s } = await send('Target.attachToTarget', { targetId, flatten: true });
  const errors = [];
  listeners.push(m => {
    if (m.method === 'Runtime.exceptionThrown') errors.push((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  });
  for (const d of ['Page.enable', 'Runtime.enable', 'Network.enable']) await send(d, {}, s);
  await send('Network.setCacheDisabled', { cacheDisabled: true }, s);
  const loaded = () => new Promise(r => { const f = m => { if (m.method === 'Page.loadEventFired' && m.sessionId === s) { listeners.splice(listeners.indexOf(f), 1); r(); } }; listeners.push(f); });
  async function open(t, dpr) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: dpr, mobile: false }, s);
    const l = loaded(); await send('Page.navigate', { url: `http://127.0.0.1:${port}/${opt.page}?t=${t}&check=1&dprMax=${dpr}&cb=${Date.now()}${Math.random()}` }, s); await l;
    await send('Runtime.evaluate', { expression: 'new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150))))', awaitPromise: true }, s);
  }
  const shot = async (file, clip) => { const { data } = await send('Page.captureScreenshot', { format: 'png', clip: Object.assign({ scale: 1 }, clip) }, s); fs.writeFileSync(file, Buffer.from(data, 'base64')); return file; };
  const tag = t => `t${String(t).replace('.', '_')}`;

  const lines = [], summary = { page: opt.page, times: [], errors };
  let failed = 0;
  for (const t of times) {
    await open(t, 1);
    const checks = JSON.parse((await send('Runtime.evaluate', { expression: 'JSON.stringify(window.__sceneChecks ?? null)', returnByValue: true }, s)).result.value);
    const rec = { t, checks, files: [] }; summary.times.push(rec);
    if (fullScale > 0) rec.files.push(await shot(path.join(outDir, `${tag(t)}_full.png`), { x: 0, y: 0, width: W, height: H, scale: fullScale }));
    if (tiles || opt.crop.length) {
      await open(t, zoom);
      if (tiles) { const [cols, rows] = tiles, tw = W / cols, th = H / rows, pad = 0.08;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const x = Math.max(0, c * tw - tw * pad), y = Math.max(0, r * th - th * pad), w = Math.min(W - x, tw * (1 + 2 * pad)), h = Math.min(H - y, th * (1 + 2 * pad));
          rec.files.push(await shot(path.join(outDir, `${tag(t)}_r${r}c${c}.png`), { x, y, width: w, height: h }));
        } }
      for (const cr of opt.crop) { const [x, y, w, h] = cr.split(',').map(Number); rec.files.push(await shot(path.join(outDir, `${tag(t)}_crop_${x}_${y}_${w}x${h}.png`), { x, y, width: w, height: h })); }
    }
    if (checks === null) { lines.push(`t=${t}: no checks exposed (window.__sceneChecks is not set with ?check=1)`); failed++; }
    else { lines.push(`t=${t}: ${checks.length} check failure${checks.length === 1 ? '' : 's'}`); checks.forEach(c => lines.push(`  - ${c}`)); failed += checks.length; }
  }
  const errs = [...new Set(errors)];
  lines.push(errs.length ? `console errors: ${errs.length}` : 'console errors: none'); errs.forEach(e => lines.push(`  - ${e}`));
  lines.push(`images: ${summary.times.reduce((n, r) => n + r.files.length, 0)} in ${outDir}`);
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(lines.join('\n'));
  await send('Browser.close').catch(() => {});
  return failed || errs.length ? 1 : 0;
}

const cleanup = () => { try { proc && proc.kill(); } catch {} server.close(); try { profile && fs.rmSync(profile, { recursive: true, force: true }); } catch {} };
main().then(code => { cleanup(); process.exit(code); }, e => { console.error('render.mjs:', e.message); cleanup(); process.exit(2); });
