// FateWheel desktop shell (Electron). The game itself is the plain web app in ../app.
// SPDX-License-Identifier: GPL-3.0-or-later
const { app, BrowserWindow, protocol, net, shell, Menu, session, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', 'app');
const ORIGIN = 'app://fatewheel';
const SMOKE = !!process.env.FATEWHEEL_SMOKE;

// A private, secure address for the app: storage (Hall of Legends, settings, portraits) stays in one place
// and browser features that need a secure page (clipboard, IndexedDB) work as they do on https.
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();

/* ---------------- mods folder ---------------- */
let MODS = '';
const MODS_README = `FateWheel mods
==============
Put each mod in its own folder here, for example:

  mods\\my-mod\\mod.json
  mods\\my-mod\\theme.css
  mods\\my-mod\\tick.wav

then restart FateWheel (or press "Restart to apply" in Menu > Mods).
Mods can add themes, sounds, music and wheel entries. They cannot run code.
How to write mod.json: see the "Mods" section of the FateWheel README.
`;
function setupMods() {
  MODS = process.env.FATEWHEEL_MODS_DIR || path.join(app.getPath('userData'), 'mods');
  try { fs.mkdirSync(MODS, { recursive: true }); const r = path.join(MODS, 'README.txt'); if (!fs.existsSync(r)) fs.writeFileSync(r, MODS_README); } catch (e) { /* read-only profile: mods simply stay empty */ }
}
const inside = (base, file) => file === base || file.startsWith(base + path.sep);

function serveApp() {
  protocol.handle('app', req => {
    const url = new URL(req.url);
    if (url.host !== 'fatewheel') return new Response('Not found', { status: 404 });
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    // mod files come from the Mods folder, everything else from the app folder; never anything outside them
    const isMod = /^mods[\\/]/.test(rel) && MODS;
    const base = isMod ? MODS : ROOT, file = path.resolve(base, isMod ? rel.slice(5) : rel);
    if (!inside(base, file) || (isMod && file === base)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString()).catch(() => new Response('Not found', { status: 404 }));
  });
}
ipcMain.handle('mods:list', () => {
  const out = [];
  let dirs = []; try { dirs = fs.readdirSync(MODS, { withFileTypes: true }).filter(d => d.isDirectory()).slice(0, 100); } catch (e) { return out; }
  for (const d of dirs) {
    const f = path.join(MODS, d.name, 'mod.json');
    try { const st = fs.statSync(f); if (st.size < 1024 * 1024) out.push({ folder: d.name, manifest: fs.readFileSync(f, 'utf8') }); } catch (e) { /* not a mod folder */ }
  }
  return out;
});
ipcMain.handle('mods:open', () => shell.openPath(MODS));

/* ---------------- updates (installer builds only) ---------------- */
let updater = null, updaterWhyNot = '';
function sendStatus(s) { BrowserWindow.getAllWindows().forEach(w => w.webContents.send('update:status', s)); }
function getUpdater() {
  if (updater !== null) return updater;
  updater = false;
  if (!app.isPackaged) { updaterWhyNot = 'Updates only work in the installed app.'; return updater; }
  if (process.env.PORTABLE_EXECUTABLE_DIR) { updaterWhyNot = 'The portable version does not update itself: download the new version from the releases page.'; return updater; }
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = true; autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('checking-for-update', () => sendStatus({ state: 'checking' }));
    autoUpdater.on('update-available', i => sendStatus({ state: 'available', version: i.version }));
    autoUpdater.on('update-not-available', () => sendStatus({ state: 'none' }));
    autoUpdater.on('download-progress', p => sendStatus({ state: 'progress', percent: Math.round(p.percent) }));
    autoUpdater.on('update-downloaded', i => sendStatus({ state: 'ready', version: i.version }));
    autoUpdater.on('error', e => sendStatus({ state: 'error', message: /404|Not Found|Unable to find latest/i.test(String(e && e.message)) ? 'no public release found yet' : String(e && e.message || e).slice(0, 120) }));
    updater = autoUpdater;
  } catch (e) { updaterWhyNot = 'The updater could not start.'; }
  return updater;
}
ipcMain.handle('update:check', async () => {
  const u = getUpdater(); if (!u) { sendStatus({ state: 'unsupported', message: updaterWhyNot }); return false; }
  try { await u.checkForUpdates(); } catch (e) { /* reported through the error event */ }
  return true;
});
ipcMain.handle('update:install', () => { const u = getUpdater(); if (u) u.quitAndInstall(); });

/* ---------------- window ---------------- */
function isHttp(u) { try { return /^https?:$/.test(new URL(u).protocol); } catch (e) { return false; } }

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 380, minHeight: 600,
    backgroundColor: '#0b0908', title: 'FateWheel', autoHideMenuBar: true,
    icon: path.join(ROOT, 'icons', 'icon-512.png'),
    show: !SMOKE, ...(SMOKE ? { x: -5000, y: -5000, skipTaskbar: true, focusable: false } : {}),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, backgroundThrottling: !SMOKE,
      preload: path.join(__dirname, 'preload.js'), additionalArguments: ['--fw-version=' + app.getVersion()] }
  });
  // "Open ChatGPT / Grok / Gemini", Ko-fi and other links go to the user's own browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { if (isHttp(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGIN + '/')) { e.preventDefault(); if (isHttp(url)) shell.openExternal(url); } });
  if (!app.isPackaged) win.webContents.on('before-input-event', (e, input) => { if (input.type === 'keyDown' && input.key === 'F12') win.webContents.toggleDevTools(); });
  win.loadURL(ORIGIN + '/index.html');
  if (SMOKE) { win.showInactive(); smokeTest(win); }
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
        const r = { races: FW.RACES.length, strTiers: FW.LADDERS.str.names.length, origin: location.origin, desktop: !!window.fatewheelDesktop, version: (window.fatewheelDesktop || {}).version };
        r.outside = [(await fetch('app://fatewheel/%2e%2e/package.json')).status, (await fetch('app://fatewheel/%252e%252e/package.json')).status, (await fetch('app://fatewheel/..%5cpackage.json')).status, (await fetch('app://fatewheel/mods/..%5c..%5cpackage.json')).status];
        localStorage.setItem('fw.smoke', '1'); r.storage = localStorage.getItem('fw.smoke') === '1'; localStorage.removeItem('fw.smoke');
        for (let i = 0; i < 40 && !(FW.Mods.loaded.length || FW.Mods.errors.length); i++) await new Promise(s => setTimeout(s, 100));
        r.mods = FW.Mods.loaded.map(m => m.name + (m.enabled ? '' : ' (off)')); r.modErrors = FW.Mods.errors; r.themes = Object.keys(FW.THEMES);
        r.fonts = await document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === 'loaded').length);
        document.getElementById('btnAuto').click();
        for (let i = 0; i < 520; i++) { await new Promise(s => setTimeout(s, 500)); const c = document.getElementById('screen-card'); if (c && c.offsetParent) break; }
        r.card = !!(document.getElementById('screen-card') || {}).offsetParent;
        if (!r.card) r.where = document.body.innerText.replace(/\\s+/g, ' ').slice(0, 160);
        if (r.card) r.lines = FW.cardLines(FWApp.state.legend).slice(0, 6).map(l => l.k + ': ' + l.v);
        if (r.card && !${!!process.env.FATEWHEEL_SMOKE_SHORT}) {   // then play the story on auto until it ends (or about two minutes pass)
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
  setupMods();
  serveApp();
  // the app needs no camera, microphone, location or notifications; only writing to the clipboard (Copy buttons)
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'clipboard-sanitized-write'));
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
