/* Destiny Unbound system services: the error log, save backups, exporting and importing saves, local play stats,
   feedback reports and muting while the window is in the background. Nothing here is ever sent anywhere by itself.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW, App = window.FWApp, D = window.fatewheelDesktop || null;
  const SYS = FW.System = {};
  FW.BUG_URL = 'https://github.com/ScikuVRC/fatewheel/issues/new';

  /* ---------------- error log (last 200 lines on this device; the desktop app also writes a log file) ---------------- */
  const LOG_KEY = 'du.log';
  SYS.log = function (level, msg) {
    try {
      const lines = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      lines.push(new Date().toISOString() + ' [' + level + '] ' + String(msg).slice(0, 1000));
      localStorage.setItem(LOG_KEY, JSON.stringify(lines.slice(-200)));
    } catch (e) { /* storage full or blocked */ }
    if (D && D.log && level !== 'error') D.log(level, msg);   // errors reach the desktop log through the console already
  };
  SYS.readLog = () => { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch (e) { return []; } };
  window.addEventListener('error', e => SYS.log('error', (e.message || 'error') + (e.filename ? ' at ' + e.filename.replace(location.origin, '') + ':' + e.lineno : '')));
  window.addEventListener('unhandledrejection', e => SYS.log('error', 'unhandled: ' + ((e.reason && (e.reason.stack || e.reason.message)) || e.reason)));

  /* ---------------- saves: everything the game keeps under fw.* (API keys are never included) ---------------- */
  SYS.collect = function () {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || k.indexOf('fw.') !== 0) continue;
      let v = localStorage.getItem(k);
      if (k === 'fw.art') { try { const a = JSON.parse(v); ['img', 'llm'].forEach(s => a[s] && a[s].cfgs && Object.keys(a[s].cfgs).forEach(id => delete a[s].cfgs[id].key)); a.remember = false; v = JSON.stringify(a); } catch (e) { continue; } }
      data[k] = v;
    }
    return { format: 'destiny-unbound-save', version: 1, game: FW.VERSION, date: new Date().toISOString(), data };
  };
  SYS.check = function (text) {
    let s; try { s = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { throw new Error('That file is not a save (it is not JSON).'); }
    if (!s || s.format !== 'destiny-unbound-save' || !s.data || typeof s.data !== 'object') throw new Error('That file is not a Destiny Unbound save.');
    const keys = Object.keys(s.data);
    if (!keys.length) throw new Error('That save is empty.');
    keys.forEach(k => { if (!/^fw\.[\w.-]{1,40}$/.test(k) || typeof s.data[k] !== 'string') throw new Error('That save contains something unexpected (' + String(k).slice(0, 30) + ').'); try { JSON.parse(s.data[k]); } catch (e) { throw new Error('Part of that save is damaged (' + k + ').'); } });
    return s;
  };
  /* replace the current save with another one; the current one is backed up first */
  SYS.restore = async function (text) {
    const s = SYS.check(text);
    await SYS.backup(true);
    const old = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('fw.') === 0) old.push(k); }
    old.forEach(k => { if (k !== 'fw.prefs') localStorage.removeItem(k); });
    Object.keys(s.data).forEach(k => localStorage.setItem(k, s.data[k]));
    SYS.log('info', 'save restored from ' + (s.date || 'unknown date'));
    location.reload();
  };
  const fileDate = () => new Date().toISOString().slice(0, 10);
  SYS.exportSave = async function () {
    const json = JSON.stringify(SYS.collect(), null, 1), name = 'destiny-unbound-save-' + fileDate() + '.json';
    if (D && D.exportSave) { const p = await D.exportSave(json, name); if (p) App.toast('Save exported'); return; }
    download(new Blob([json], { type: 'application/json' }), name); App.toast('Save downloaded');
  };
  SYS.importSave = async function () {
    try {
      let text = null;
      if (D && D.importSave) text = await D.importSave();
      else text = await new Promise(res => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = () => { const f = i.files[0]; if (!f) return res(null); if (f.size > 20 * 1024 * 1024) return res(''); f.text().then(res); }; i.click(); });
      if (text == null) return;
      const s = SYS.check(text);
      const n = (() => { try { return JSON.parse(s.data['fw.hall'] || '[]').length; } catch (e) { return 0; } })();
      App.openModal('<h2>Load this save?</h2><p>From ' + FW.html.esc(String(s.date || '').slice(0, 10) || 'an unknown date') + (s.game ? ' (game version ' + FW.html.esc(s.game) + ')' : '') + ', with ' + n + ' legend' + (n === 1 ? '' : 's') + ' in the Hall.</p><p>Your current save is backed up first, so you can go back to it from Options &gt; Data.</p><div class="cta"><button class="btn primary" id="imYes">Load it</button><button class="btn ghost" id="imNo">Cancel</button></div>');
      document.getElementById('imNo').onclick = App.closeModal;
      document.getElementById('imYes').onclick = () => SYS.restore(s);
    } catch (e) { App.toast(e.message || 'Could not read that save'); }
  };
  function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  SYS.download = download;

  /* ---------------- backups: one a day automatically (desktop: the newest 10 files; browser: the newest 3) ---------------- */
  const BK_KEY = 'du.backups';
  SYS.backup = async function (manual) {
    const snap = SYS.collect(); if (!Object.keys(snap.data).length) return null;
    const json = JSON.stringify(snap);
    if (D && D.writeBackup) return D.writeBackup(json, !!manual);
    try { const list = JSON.parse(localStorage.getItem(BK_KEY) || '[]'); list.unshift({ name: snap.date.slice(0, 19).replace('T', ' ') + (manual ? ' (manual)' : ''), json }); localStorage.setItem(BK_KEY, JSON.stringify(list.slice(0, 3))); return list[0].name; }
    catch (e) { SYS.log('error', 'backup failed: ' + e.message); return null; }
  };
  SYS.listBackups = async function () {
    if (D && D.listBackups) return (await D.listBackups()).map(b => ({ id: b.name, label: b.name.replace(/^save-(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)(\d\d)/, '$1-$2-$3 $4:$5') .replace('-manual.json', ' (manual)').replace('.json', ''), size: b.size }));
    try { return JSON.parse(localStorage.getItem(BK_KEY) || '[]').map((b, i) => ({ id: String(i), label: b.name, size: b.json.length })); } catch (e) { return []; }
  };
  SYS.readBackup = async function (id) {
    if (D && D.readBackup) return D.readBackup(id);
    try { return JSON.parse(localStorage.getItem(BK_KEY) || '[]')[+id].json; } catch (e) { return null; }
  };
  (function daily() {
    const today = fileDate();
    if (App.store.get('fw.lastBackup', '') === today) return;
    setTimeout(() => SYS.backup(false).then(n => { if (n) App.store.set('fw.lastBackup', today); }), 4000);
  })();

  /* ---------------- local play stats (only on this device; attached to feedback only if the player chooses) ---------------- */
  const ST_KEY = 'fw.stats';
  const stats = Object.assign({ sessions: 0, minutes: 0, legendsStarted: 0, legendsFinished: 0, autoLegends: 0, dailies: 0, stories: 0, chapters: 0, deaths: 0, retirements: 0, ascensions: 0, arenaFights: 0, versus: 0, aiArt: 0, quitOn: {}, firstPlayed: fileDate(), lastPlayed: '' }, App.store.get(ST_KEY, {}));
  const saveStats = () => App.store.set(ST_KEY, stats);
  SYS.stats = stats;
  SYS.bump = (k, n) => { stats[k] = (stats[k] || 0) + (n || 1); saveStats(); };
  stats.sessions++; stats.lastPlayed = fileDate(); saveStats();
  setInterval(() => { if (!document.hidden) { stats.minutes++; saveStats(); } }, 60000);
  const on = (id, k) => { const el = document.getElementById(id); if (el) el.addEventListener('click', () => SYS.bump(k)); };
  on('btnStart', 'legendsStarted'); on('btnAuto', 'legendsStarted'); on('btnAuto', 'autoLegends'); on('btnAgain', 'legendsStarted');
  on('btnDaily', 'dailies'); on('btnStory', 'stories'); on('btnHeir', 'stories'); on('btnFight', 'arenaFights'); on('btnVersus', 'versus'); on('btnArt', 'aiArt');
  const seen = {};
  const prevShown = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prevShown) prevShown(L);
    try {
      const id = L.toCode().slice(0, 60), s = seen[id] || (seen[id] = { fin: false, ch: L.saga ? L.saga.ch || 0 : 0, end: !!(L.saga && L.saga.end) });
      if (!s.fin && L.picks && L.picks.mark) { s.fin = true; if (!L.saga) SYS.bump('legendsFinished'); }
      const ch = L.saga ? L.saga.ch || 0 : 0; if (ch > s.ch) { SYS.bump('chapters', ch - s.ch); s.ch = ch; }
      if (L.saga && L.saga.end && !s.end) { s.end = true; SYS.bump({ dead: 'deaths', retired: 'retirements', ascended: 'ascensions' }[L.saga.end] || 'otherEndings'); }
    } catch (e) { /* stats must never break the game */ }
  };
  window.addEventListener('pagehide', () => { const w = App.state.screen; stats.quitOn[w] = (stats.quitOn[w] || 0) + 1; saveStats(); });

  /* ---------------- mute while the window is in the background ---------------- */
  function bg() { const m = !!(FW.prefs.muteBg && (document.hidden || !document.hasFocus())); if (m !== !!FW.Audio.bgMuted) { FW.Audio.bgMuted = m; FW.Audio.applyVolume(); } }
  ['blur', 'focus'].forEach(e => window.addEventListener(e, bg)); document.addEventListener('visibilitychange', bg);
  SYS.syncBackgroundMute = bg;

  /* ---------------- feedback ---------------- */
  SYS.feedbackModal = function () {
    const H = FW.html;
    App.openModal('<button class="btn small ghost close">Close ✕</button><h2>Send feedback</h2><p>Tell us what happened, what you expected, or what you would change. ' + (D ? 'This saves a folder on your PC (your note, a screenshot and the error log) that you can send to the developer.' : 'This downloads a file (your note and the error log) that you can send to the developer.') + '</p>' +
      '<textarea id="fbText" rows="6" maxlength="20000" placeholder="What happened? What were you doing just before?"></textarea>' +
      '<label class="check"><input type="checkbox" id="fbStats" checked> Include my play stats (counts like legends spun and chapters played; nothing personal)</label>' +
      (D ? '<label class="check"><input type="checkbox" id="fbShot" checked> Include a screenshot of the game</label>' : '') +
      '<div class="cta"><button class="btn primary" id="fbGo">Save report</button><a class="btn ghost" id="fbBug" target="_blank" rel="noopener" href="' + H.esc(FW.BUG_URL + '?title=' + encodeURIComponent('[' + FW.VERSION + '] ') + '&body=' + encodeURIComponent('Game version: ' + FW.VERSION + '\n\nWhat happened:\n\nWhat I expected:\n')) + '">Report a bug online</a></div>');
    document.getElementById('fbGo').onclick = async () => {
      const text = document.getElementById('fbText').value.trim(); if (!text) return App.toast('Write a few words first');
      const extra = { screen: App.state.screen, theme: App.state.theme, prefs: FW.prefs, log: SYS.readLog().slice(-60) };
      if (document.getElementById('fbStats').checked) extra.stats = stats;
      if (D && D.saveFeedback) { await D.saveFeedback({ text, extra, screenshot: document.getElementById('fbShot').checked }); App.closeModal(); App.toast('Report saved: the folder is open'); }
      else { download(new Blob([JSON.stringify(Object.assign({ version: FW.VERSION, text, userAgent: navigator.userAgent }, extra), null, 2)], { type: 'application/json' }), 'destiny-unbound-feedback-' + fileDate() + '.json'); App.closeModal(); App.toast('Report downloaded'); }
    };
  };
  SYS.log('info', 'started ' + FW.VERSION + (D ? ' (desktop)' : ' (browser)'));
})();
