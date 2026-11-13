// Destiny Unbound desktop shell (Electron). The game itself is the plain web app in ../app.
// SPDX-License-Identifier: GPL-3.0-or-later
const { app, BrowserWindow, protocol, net, shell, Menu, session, ipcMain, screen, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', 'app');
const ORIGIN = 'app://fatewheel';
const SMOKE = !!process.env.FATEWHEEL_SMOKE;

// Keep saves, settings and mods in the folder used before the rename to Destiny Unbound.
// FATEWHEEL_USERDATA points it somewhere else (used to test a clean first launch).
app.setPath('userData', process.env.FATEWHEEL_USERDATA || path.join(app.getPath('appData'), 'FateWheel'));

/* ---------------- logs: errors and crashes go to a file testers can send ---------------- */
const LOG_DIR = path.join(app.getPath('userData'), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'destiny-unbound.log');
function log(level, msg) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    try { if (fs.statSync(LOG_FILE).size > 1024 * 1024) fs.renameSync(LOG_FILE, path.join(LOG_DIR, 'destiny-unbound.old.log')); } catch (e) { /* no log yet */ }
    fs.appendFileSync(LOG_FILE, new Date().toISOString() + ' [' + level + '] ' + String(msg).slice(0, 4000).replace(/\r?\n/g, '\n    ') + '\n');
  } catch (e) { /* the disk is not writable: nothing else to do */ }
}
process.on('uncaughtException', e => log('crash', (e && e.stack) || e));
process.on('unhandledRejection', e => log('error', (e && e.stack) || e));
app.on('render-process-gone', (e, wc, d) => log('crash', 'game page stopped: ' + d.reason + ' (exit ' + d.exitCode + ')'));
app.on('child-process-gone', (e, d) => { if (d.reason !== 'clean-exit') log('crash', d.type + ' process stopped: ' + d.reason); });

/* ---------------- window settings (read before the window opens) ---------------- */
const WIN_FILE = path.join(app.getPath('userData'), 'window.json');
let winCfg = {}; try { winCfg = JSON.parse(fs.readFileSync(WIN_FILE, 'utf8')) || {}; } catch (e) { winCfg = {}; }
const saveWinCfg = () => { try { fs.writeFileSync(WIN_FILE, JSON.stringify(winCfg)); } catch (e) { log('error', 'could not save window settings: ' + e.message); } };
if (winCfg.vsync === false) { app.commandLine.appendSwitch('disable-gpu-vsync'); app.commandLine.appendSwitch('disable-frame-rate-limit'); }

// A private, secure address for the app: storage (Hall of Legends, settings, portraits) stays in one place
// and browser features that need a secure page (clipboard, IndexedDB) work as they do on https.
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

if (!app.requestSingleInstanceLock()) app.quit();

/* ---------------- mods folder ---------------- */
let MODS = '';
const MODS_README = `Destiny Unbound mods
==============
Put each mod in its own folder here, for example:

  mods\\my-mod\\mod.json
  mods\\my-mod\\theme.css
  mods\\my-mod\\tick.wav

then restart Destiny Unbound (or press "Restart to apply" in Menu > Mods).
Mods can add themes, sounds, music and wheel entries. They cannot run code.
To make your own, get the free mod kit (guide, templates and full reference) from
https://bzrkherja.itch.io/destiny-unbound or the game's GitHub releases.
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
    // a shortcut (symlink or junction) inside the Mods folder must not lead outside it
    if (isMod) { try { if (!inside(fs.realpathSync(MODS), fs.realpathSync(file))) return new Response('Forbidden', { status: 403 }); } catch (e) { return new Response('Not found', { status: 404 }); } }
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
    autoUpdater.allowPrerelease = /-/.test(app.getVersion());   // alpha and beta builds follow pre-releases
    autoUpdater.logger = { info: m => log('info', 'updater: ' + m), warn: m => log('info', 'updater: ' + m), error: m => log('error', 'updater: ' + m), debug: () => {} };
    // FATEWHEEL_UPDATE_URL: read updates from a plain web folder instead of GitHub (used to test the update path)
    if (process.env.FATEWHEEL_UPDATE_URL) autoUpdater.setFeedURL({ provider: 'generic', url: process.env.FATEWHEEL_UPDATE_URL });
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

/* ---------------- window, display and app controls for the Options screen ---------------- */
const winOf = e => BrowserWindow.fromWebContents(e.sender);
const modeOf = w => (w.isFullScreen() ? 'fullscreen' : w.isMaximized() ? 'maximized' : 'windowed');
ipcMain.handle('win:info', e => {
  const w = winOf(e); if (!w) return null;
  const d = screen.getDisplayMatching(w.getBounds());
  return { mode: modeOf(w), size: w.getContentSize(), work: [d.workAreaSize.width, d.workAreaSize.height], screen: [d.size.width, d.size.height], scale: d.scaleFactor, vsync: winCfg.vsync !== false };
});
ipcMain.handle('win:set', (e, o) => {
  const w = winOf(e); if (!w || !o) return false;
  const mode = ['windowed', 'maximized', 'fullscreen'].indexOf(o.mode) >= 0 ? o.mode : modeOf(w);
  if (mode !== 'fullscreen' && w.isFullScreen()) w.setFullScreen(false);
  if (mode === 'fullscreen') w.setFullScreen(true);
  else if (mode === 'maximized') w.maximize();
  else {
    if (w.isMaximized()) w.unmaximize();
    const width = Math.round(+o.w), height = Math.round(+o.h);
    if (width >= 640 && height >= 480) {
      const d = screen.getDisplayMatching(w.getBounds()).workAreaSize;
      w.setContentSize(Math.min(width, d.width), Math.min(height, d.height)); w.center();
    }
  }
  return true;
});
ipcMain.handle('win:zoom', (e, z) => { const f = Math.max(0.5, Math.min(2, +z || 1)); e.sender.setZoomFactor(f); return f; });
ipcMain.handle('app:vsync', (e, on) => { winCfg.vsync = !!on; saveWinCfg(); return true; });
ipcMain.handle('app:relaunch', () => { app.relaunch(); app.exit(0); });
ipcMain.handle('app:quit', () => app.quit());
ipcMain.handle('log:write', (e, level, msg) => log(level === 'error' ? 'error' : 'info', 'game: ' + msg));
ipcMain.handle('log:open', () => { fs.mkdirSync(LOG_DIR, { recursive: true }); return shell.openPath(LOG_DIR); });
ipcMain.handle('feedback:save', async (e, o) => {
  // a folder with the player's note, a screenshot, their play stats and the current log; shown in Explorer
  const dir = path.join(LOG_DIR, 'feedback-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'feedback.txt'), String((o && o.text) || '').slice(0, 20000));
  fs.writeFileSync(path.join(dir, 'details.json'), JSON.stringify(Object.assign({ version: app.getVersion(), os: process.platform + ' ' + require('os').release(), electron: process.versions.electron }, (o && o.extra) || {}), null, 2).slice(0, 200000));
  try { const w = winOf(e); if (w && o && o.screenshot !== false) fs.writeFileSync(path.join(dir, 'screenshot.png'), (await w.webContents.capturePage()).toPNG()); } catch (err) { log('error', 'feedback screenshot failed: ' + err.message); }
  try { fs.copyFileSync(LOG_FILE, path.join(dir, 'destiny-unbound.log')); } catch (err) { /* no log yet */ }
  if (!SMOKE) shell.showItemInFolder(path.join(dir, 'feedback.txt'));
  return dir;
});

/* ---------------- save backups and moving saves between PCs ---------------- */
const BACKUP_DIR = path.join(app.getPath('userData'), 'backups');
const BACKUP_NAME = /^save-\d{8}-\d{6}(-manual)?\.json$/;
ipcMain.handle('backup:write', (e, json, manual) => {
  if (typeof json !== 'string' || json.length > 20 * 1024 * 1024) return null;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const name = 'save-' + new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15) + (manual ? '-manual' : '') + '.json';
  fs.writeFileSync(path.join(BACKUP_DIR, name), json);
  const all = fs.readdirSync(BACKUP_DIR).filter(f => BACKUP_NAME.test(f)).sort().reverse();
  all.slice(10).forEach(f => { try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch (err) { /* in use */ } });   // keep the newest 10
  return name;
});
ipcMain.handle('backup:list', () => { try { return fs.readdirSync(BACKUP_DIR).filter(f => BACKUP_NAME.test(f)).sort().reverse().map(f => ({ name: f, size: fs.statSync(path.join(BACKUP_DIR, f)).size })); } catch (e) { return []; } });
ipcMain.handle('backup:read', (e, name) => (BACKUP_NAME.test(String(name)) ? fs.readFileSync(path.join(BACKUP_DIR, name), 'utf8') : null));
ipcMain.handle('backup:open', () => { fs.mkdirSync(BACKUP_DIR, { recursive: true }); return shell.openPath(BACKUP_DIR); });
ipcMain.handle('save:export', async (e, json, fileName) => {
  const r = await dialog.showSaveDialog(winOf(e), { title: 'Export your save', defaultPath: path.join(app.getPath('documents'), String(fileName || 'destiny-unbound-save.json').replace(/[^\w.-]+/g, '_')), filters: [{ name: 'Destiny Unbound save', extensions: ['json'] }] });
  if (r.canceled || !r.filePath) return null;
  fs.writeFileSync(r.filePath, String(json)); return r.filePath;
});
ipcMain.handle('save:import', async e => {
  const r = await dialog.showOpenDialog(winOf(e), { title: 'Import a save', properties: ['openFile'], filters: [{ name: 'Destiny Unbound save', extensions: ['json'] }] });
  if (r.canceled || !r.filePaths[0]) return null;
  if (fs.statSync(r.filePaths[0]).size > 20 * 1024 * 1024) throw new Error('That file is too big to be a save.');
  return fs.readFileSync(r.filePaths[0], 'utf8');
});

/* ---------------- Discord Rich Presence (local only, see electron/discord.js) ---------------- */
// The Application ID comes from Discord's Developer Portal ("discordAppId" in package.json); FATEWHEEL_DISCORD_ID
// overrides it for testing. Without one, the feature stays off.
const DISCORD_ID = process.env.FATEWHEEL_DISCORD_ID || require('../package.json').discordAppId || '';
let presence = null;
function getPresence() {
  if (!presence && (!SMOKE || process.env.FATEWHEEL_DISCORD_PIPE)) {   // the smoke test only uses a stand-in Discord
    const { Presence } = require('./discord');
    // FATEWHEEL_DISCORD_PIPE=name points at a stand-in Discord for testing (a pipe name on Windows, a socket path elsewhere)
    const fake = process.env.FATEWHEEL_DISCORD_PIPE, prefix = !fake ? null : process.platform === 'win32' && !/^[\\/]/.test(fake) ? '\\\\?\\pipe\\' + fake : fake;
    presence = new Presence({ clientId: DISCORD_ID, pipePrefix: prefix, log: m => log('info', m) });
  }
  return presence;
}
ipcMain.handle('discord:info', () => ({ available: !!(getPresence() && getPresence().usable) }));
ipcMain.handle('discord:enable', (e, on) => { const p = getPresence(); if (p) p.setEnabled(on); return !!(p && p.enabled); });
ipcMain.handle('discord:set', (e, activity) => { const p = getPresence(); if (p && p.enabled) p.set(activity); });
app.on('before-quit', () => { if (presence) presence.close(); });

/* ---------------- window ---------------- */
function isHttp(u) { try { return /^https?:$/.test(new URL(u).protocol); } catch (e) { return false; } }

function createWindow() {
  // reopen where the player left it, if that spot is still on a connected screen
  const b = winCfg.bounds, onScreen = !SMOKE && b && screen.getAllDisplays().some(d => b.x < d.bounds.x + d.bounds.width - 80 && b.x + b.width > d.bounds.x + 80 && b.y >= d.bounds.y - 20 && b.y < d.bounds.y + d.bounds.height - 80);
  const win = new BrowserWindow({
    width: onScreen ? b.width : 1280, height: onScreen ? b.height : 800, ...(onScreen ? { x: b.x, y: b.y } : {}), minWidth: 380, minHeight: 600,
    backgroundColor: '#0b0908', title: 'Destiny Unbound', autoHideMenuBar: true,
    icon: path.join(ROOT, 'icons', 'icon-512.png'),
    show: !SMOKE, ...(SMOKE ? { x: -5000, y: -5000, skipTaskbar: true, focusable: false } : {}),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, backgroundThrottling: !SMOKE,
      preload: path.join(__dirname, 'preload.js'), additionalArguments: ['--fw-version=' + app.getVersion()] }
  });
  // "Open ChatGPT / Grok / Gemini", Ko-fi and other links go to the user's own browser, never inside the app
  win.webContents.setWindowOpenHandler(({ url }) => { if (isHttp(url)) shell.openExternal(url); return { action: 'deny' }; });
  if (!SMOKE) { if (winCfg.mode === 'fullscreen') win.setFullScreen(true); else if (winCfg.mode === 'maximized') win.maximize(); }
  win.on('close', () => { if (SMOKE) return; winCfg.bounds = win.getNormalBounds(); winCfg.mode = modeOf(win); saveWinCfg(); });
  win.webContents.on('console-message', ev => { if (ev.level === 'error') log('error', 'page: ' + ev.message + (ev.sourceId ? ' (' + String(ev.sourceId).replace(ORIGIN, '') + ':' + ev.lineNumber + ')' : '')); });
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
        const saved = Object.keys(localStorage).filter(k => k.indexOf('fw.') === 0).sort(), hall = (() => { try { return JSON.parse(localStorage.getItem('fw.hall') || '[]').length; } catch (e) { return -1; } })();
        const r = { saved, hall, races: FW.RACES.length, strTiers: FW.LADDERS.str.names.length, origin: location.origin, desktop: !!window.fatewheelDesktop, version: (window.fatewheelDesktop || {}).version };
        r.outside = [(await fetch('app://fatewheel/%2e%2e/package.json')).status, (await fetch('app://fatewheel/%252e%252e/package.json')).status, (await fetch('app://fatewheel/..%5cpackage.json')).status, (await fetch('app://fatewheel/mods/..%5c..%5cpackage.json')).status, (await fetch('app://fatewheel/mods/link/package.json')).status];
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

// FATEWHEEL_UPDATE_TEST=1 (installed app only): check for an update, print each step, install it and restart
function updateTest() {
  const u = getUpdater(); const say = s => process.stdout.write('UPDATE ' + JSON.stringify(s) + '\n');
  if (!u) { say({ state: 'unsupported', message: updaterWhyNot }); return app.exit(2); }
  say({ state: 'start', version: app.getVersion() });
  ['checking-for-update', 'update-available', 'update-not-available', 'update-downloaded', 'error'].forEach(ev => u.on(ev, i => say({ state: ev, version: i && i.version, message: i && i.message })));
  u.on('update-not-available', () => app.exit(3)); u.on('error', () => app.exit(4));
  u.on('update-downloaded', () => setTimeout(() => u.quitAndInstall(true, false), 500));
  u.checkForUpdates().catch(e => { say({ state: 'error', message: e.message }); app.exit(4); });
}

app.whenReady().then(() => {
  if (process.env.FATEWHEEL_UPDATE_TEST) return updateTest();
  setupMods();
  serveApp();
  // the app needs no camera, microphone, location or notifications; only writing to the clipboard (Copy buttons)
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === 'clipboard-sanitized-write'));
  if (process.env.FATEWHEEL_OFFLINE) session.defaultSession.enableNetworkEmulation({ offline: true });   // test: no internet at all
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
