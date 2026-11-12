// FateWheel desktop shell (Electron). The game itself is the plain web app in ../app.
// SPDX-License-Identifier: GPL-3.0-or-later
const { app, BrowserWindow, protocol, net, shell, Menu, session } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', 'app');
const ORIGIN = 'app://fatewheel';

// A private, secure address for the app: storage (Hall of Legends, settings, portraits) stays in one place
// and browser features that need a secure page (clipboard, IndexedDB) work as they do on https.
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();

function serveApp() {
  protocol.handle('app', req => {
    const url = new URL(req.url);
    if (url.host !== 'fatewheel') return new Response('Not found', { status: 404 });
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(ROOT, rel);
    // never serve anything outside the app folder
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString()).catch(() => new Response('Not found', { status: 404 }));
  });
}

function isHttp(u) { try { return /^https?:$/.test(new URL(u).protocol); } catch (e) { return false; } }

function createWindow() {
  const win = new BrowserWindow({
    width: 540, height: 940, minWidth: 360, minHeight: 600,
    backgroundColor: '#0b0b10', title: 'FateWheel', autoHideMenuBar: true,
    icon: path.join(ROOT, 'icons', 'icon-512.png'),
    show: !process.env.FATEWHEEL_SMOKE, ...(process.env.FATEWHEEL_SMOKE ? { x: -5000, y: -5000, skipTaskbar: true, focusable: false } : {}),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, backgroundThrottling: !process.env.FATEWHEEL_SMOKE }
  });
  // "Open ChatGPT / Grok / Gemini" and other links go to the user's own browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { if (isHttp(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGIN + '/')) { e.preventDefault(); if (isHttp(url)) shell.openExternal(url); } });
  if (!app.isPackaged) win.webContents.on('before-input-event', (e, input) => { if (input.type === 'keyDown' && input.key === 'F12') win.webContents.toggleDevTools(); });
  win.loadURL(ORIGIN + '/index.html');
  if (process.env.FATEWHEEL_SMOKE) { win.showInactive(); smokeTest(win); }
  return win;
}

// FATEWHEEL_SMOKE=1: run one auto-spin in a hidden window, print the result as JSON and quit (used to test builds)
function smokeTest(win) {
  const errors = [];
  win.webContents.on('console-message', e => { if (e.level === 'error') errors.push(e.message); });
  win.webContents.once('did-finish-load', async () => {
    let out;
    try {
      out = await win.webContents.executeJavaScript(`(async () => {
        const r = { races: FW.RACES.length, strTiers: FW.LADDERS.str.names.length, origin: location.origin };
        r.outside = [(await fetch('app://fatewheel/%2e%2e/package.json')).status, (await fetch('app://fatewheel/%252e%252e/package.json')).status, (await fetch('app://fatewheel/..%5cpackage.json')).status];
        localStorage.setItem('fw.smoke', '1'); r.storage = localStorage.getItem('fw.smoke') === '1'; localStorage.removeItem('fw.smoke');
        document.getElementById('btnAuto').click();
        for (let i = 0; i < 520; i++) { await new Promise(s => setTimeout(s, 500)); const c = document.getElementById('screen-card'); if (c && c.offsetParent) break; }
        r.card = !!(document.getElementById('screen-card') || {}).offsetParent;
        if (!r.card) r.where = document.body.innerText.replace(/\\s+/g, ' ').slice(0, 160);
        if (r.card) r.lines = FW.cardLines(FWApp.state.legend).slice(0, 6).map(l => l.k + ': ' + l.v);
        if (r.card) {   // then play the story on auto until it ends (or about two minutes pass)
          document.getElementById('btnStory').click(); await new Promise(s => setTimeout(s, 400));
          if (!FWApp.state.auto) document.getElementById('btnAutoToggle').click();
          const L = FWApp.state.legend;
          for (let i = 0; i < 240; i++) { await new Promise(s => setTimeout(s, 500)); if (L.saga && L.saga.end) break; }
          r.saga = L.saga ? FW.Story.summary(L) : 'not started'; r.chapters = L.saga ? L.saga.log.slice(-3).map(x => x.chapter + ': ' + x.text) : [];
        }
        return r; })()`);
    } catch (e) { out = { error: String(e) }; }
    out.consoleErrors = errors;
    process.stdout.write('SMOKE ' + JSON.stringify(out) + '\n');
    app.exit(out.card && !errors.length ? 0 : 1);
  });
}

app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });

app.whenReady().then(() => {
  serveApp();
  // the app needs no camera, microphone, location or notifications; only writing to the clipboard (Copy buttons)
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'clipboard-sanitized-write'));
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
