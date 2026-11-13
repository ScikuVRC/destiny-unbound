// Layout check for desktop windows and the itch.io frame: opens every main screen at common window sizes, saves a
// screenshot of each, and reports what doesn't fit: sideways scrolling, SPIN below the bottom edge, text that
// overflows its box, things past the right edge, and very small text.
//   npx electron scripts/layout-check.js [outDir] [--only=960x540,1280x800] [--screens=title,spin]
// It runs in its own hidden window with a fresh, throwaway profile, so it never touches your saves.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1].split(',') : null; };
const OUT = path.resolve(process.argv.find((a, i) => i > 1 && !a.startsWith('-') && !a.endsWith('.js')) || path.join(ROOT, 'dist', 'layout'));
const SIZES = (arg('only') || ['960x540', '1024x600', '1280x720', '1280x800', '1366x768', '1600x900', '1920x1080', '2560x1440']).map(s => s.split('x').map(Number));
const THEME = (arg('theme') || [''])[0];   // ashen, astral, iron or bloodmoon (default: the game's default)
const SCREENS = arg('screens') || ['title', 'home', 'spin', 'card', 'story', 'options', 'hall', 'achievements', 'ending'];
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-layout-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
const sleep = ms => new Promise(r => setTimeout(r, ms));
process.on('unhandledRejection', e => { console.error('Layout check failed: ' + (e && e.stack || e)); app.exit(1); });
setTimeout(() => { console.error('Layout check took too long; giving up.'); app.exit(1); }, 15 * 60 * 1000).unref();

// a finished legend, built with the game's own wheels (same as the tests)
const LEGEND = `(() => { const L = new FW.Legend({ luck: 'heroic', seed: 'layout' }), rng = FW.makeRng('layout:spin'); let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L); FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng); }
  FWApp.state.legend = L; return L; })()`;
const OPEN = {
  title: `FWApp.flow.show('title')`,
  home: `FWApp.flow.show('home')`,
  spin: `FWApp.runLegend(false)`,
  card: `${LEGEND}; FWApp.showCard()`,
  story: `${LEGEND}; FWApp.showCard(); FWApp.runStory()`,
  options: `FW.Options.open()`,
  hall: `FWApp.hallModal()`,
  achievements: `FWApp.achievementsModal()`,
  ending: `(() => { const L = ${LEGEND}; FW.Story.newSaga(L, {}, FW.makeRng('end')); L.saga.ch = 14; L.saga.end = 'fulfilled'; L.saga.endText = L.displayName() + ' takes the crown, rules for a day and rides away into legend.'; FWApp.showCard(); FWApp.runStory(); })()`
};
// what doesn't fit, measured inside the page
const CHECK = `(() => {
  const W = innerWidth, H = innerHeight, out = [];
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
  const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/).slice(0, 2).join('.') : '')) + ' "' + (e.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30) + '"';
  const doc = document.scrollingElement;
  if (doc.scrollWidth > W + 1) out.push('sideways scroll: page is ' + doc.scrollWidth + 'px wide');
  const spin = document.getElementById('btnSpin');
  if (spin && vis(spin) && document.querySelector('#screen-spin.active') && !document.querySelector('#modalRoot .modal')) { const r = spin.getBoundingClientRect(); if (r.bottom > H + 1) out.push('SPIN below the bottom edge (bottom ' + Math.round(r.bottom) + ' of ' + H + ')'); }
  const root = document.querySelector('#modalRoot .modal') || document.querySelector('.screen.active') || document.body;
  let over = 0, right = 0, tiny = 0; const ex = { over: [], right: [], tiny: [] };
  root.querySelectorAll('*').forEach(e => {
    if (!vis(e)) return; const s = getComputedStyle(e), r = e.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2 || parseFloat(s.fontSize) === 0 || e.closest('[aria-hidden=true], .optbg, .sr-only, .visually-hidden')) return;   // screen-reader-only text and decoration
    if (r.right > W + 2 && s.position !== 'fixed') { right++; if (ex.right.length < 4) ex.right.push(name(e) + ' right=' + Math.round(r.right)); }
    const clip = /(hidden|clip)/.test(s.overflowX) || /(hidden|clip)/.test(s.overflow);
    if (!/(auto|scroll)/.test(s.overflowX) && e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && s.textOverflow !== 'ellipsis' && !(e.closest('svg,canvas'))) { over++; if (ex.over.length < 6) ex.over.push(name(e) + (clip ? ' (clipped)' : '') + ' ' + e.scrollWidth + '>' + e.clientWidth); }
    if (e.children.length === 0 && e.textContent.trim() && parseFloat(s.fontSize) < 10.5) { tiny++; if (ex.tiny.length < 4) ex.tiny.push(name(e) + ' ' + s.fontSize); }
  });
  if (right) out.push(right + ' element(s) past the right edge: ' + ex.right.join('; '));
  if (over) out.push(over + ' text box(es) overflowing: ' + ex.over.join('; '));
  if (tiny) out.push(tiny + ' text(s) under 10.5px: ' + ex.tiny.join('; '));
  return { problems: out, pageHeight: doc.scrollHeight, viewport: W + 'x' + H };
})()`;

app.on('window-all-closed', () => {});   // keep running between window sizes
app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = {};
  for (const [w, h] of SIZES) {
    const win = new BrowserWindow({ width: w, height: h, useContentSize: true, show: true, x: -6000, y: 0, skipTaskbar: true, frame: false, backgroundColor: '#0b0908', webPreferences: { backgroundThrottling: false, contextIsolation: true } });
    const js = code => win.webContents.executeJavaScript(code);
    const load = async () => { for (let i = 0; i < 5; i++) { try { return await win.loadFile(path.join(ROOT, 'app', 'index.html')); } catch (e) { await sleep(400); } } throw new Error('page would not load'); };
    await load();
    await js(`localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); localStorage.setItem('fw.prefs', JSON.stringify({ muteBg: false, sound: false })); 1`);
    for (const sc of SCREENS) {
      await load();
      await js('document.fonts.ready.then(() => 1)'); await sleep(500);
      if (THEME) await js(`FWApp.setTheme('${THEME}'); 1`);
      try { await js(`try { ${OPEN[sc]}; 1 } catch (e) { 'error: ' + e.message }`); } catch (e) { /* async flows keep running; that's fine */ }
      await sleep(sc === 'spin' || sc === 'story' || sc === 'ending' ? 1800 : 900);
      const res = await js(CHECK);
      const key = w + 'x' + h; (report[key] = report[key] || {})[sc] = res;
      let img = null; for (let i = 0; i < 10 && !img; i++) { try { img = await win.webContents.capturePage(); } catch (e) { await sleep(200); } }
      if (img) fs.writeFileSync(path.join(OUT, key + '-' + (THEME ? THEME + '-' : '') + sc + '.jpg'), img.toJPEG(70));
      console.log(key.padEnd(10) + sc.padEnd(13) + (res.problems.length ? res.problems.join('\n' + ' '.repeat(23)) : 'ok') + (res.pageHeight > h + 1 ? '   [page scrolls: ' + res.pageHeight + 'px]' : ''));
    }
    win.destroy();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log('\nScreenshots and report.json in ' + OUT);
  app.exit(0);
});
