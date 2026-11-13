// UI mockups on the real game: plays a legend part of the way with Auto, stops on a result, then shows that moment
// in each layout variant and measures it (does SPIN/Next fit, how far the eye travels from the wheel to the button,
// how much of the legend panel is useful). Screenshots go to the output folder.
//   npx electron scripts/ui-mockups.js [outDir] [--only=1366x768,960x540] [--variants=A,E]
// It runs in its own hidden window with a fresh, throwaway profile, so it never touches your saves.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const opt = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3).split(',') : null; };
const OUT = path.resolve(process.argv.find((a, i) => i > 1 && !a.startsWith('-') && !a.endsWith('.js')) || path.join(ROOT, 'dist', 'mockups'));
const SIZES = (opt('only') || ['1366x768', '1920x1080', '960x540']).map(s => s.split('x').map(Number));
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-mock-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.on('window-all-closed', () => {});
const sleep = ms => new Promise(r => setTimeout(r, ms));

// D: tidy - the legend shows only what's rolled (plus the wheel being spun), the token count sits on Re-spin,
// and speed / direction move behind one settings button
const TIDY = `
#sheetBody .row.empty:not(.cur){display:none}
#btnSpeed,#btnDir{display:none!important}
#tokenBox{display:none}
#mockGear{display:inline-flex!important}
`;
// E: D plus an alignment pass - one centre column of equal width, equal-size buttons, a legend that reads like a sheet
const POLISH = `
#screen-spin .stage>.chip,#screen-spin .stage>.result,#screen-spin .stage>.result-sub,#screen-spin .stage>.controls,#screen-spin .stage>.effects{width:min(100%,440px);justify-self:center;margin-left:auto;margin-right:auto;box-sizing:border-box}
#screen-spin .stage>.chip-emoji{font-size:28px;margin:0 0 6px;line-height:1}
#screen-spin .stage>.chip{display:flex;justify-content:center;padding:12px 18px;text-align:center}
#screen-spin .stage>.result{margin:22px auto 4px}
#screen-spin .stage>.result-sub{min-height:1.4em;margin-bottom:14px}
#screen-spin .stage>#controls{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
#screen-spin .stage>#controls>.btn{width:100%;min-height:50px;margin:0;justify-content:center}
#screen-spin .stage>#controls>#btnSpin{grid-column:1/-1}
#screen-spin .stage>.controls:not(#controls){display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
#screen-spin .stage>.controls:not(#controls)>.btn{width:100%;margin:0;justify-content:center}
#screen-spin .stage>.effects{margin-top:18px}
#sheet .rows{gap:0}
body #sheet .rows .row{grid-template-columns:24px 1fr auto;justify-items:stretch;align-items:center;text-align:left;padding:9px 8px;column-gap:10px}
body #sheet .row .k{text-align:left;font-size:12px;letter-spacing:.08em}
body #sheet .row .v{text-align:right;justify-self:end}
#sheet .row:last-child{border-bottom:0}
`;
const ALL = { A: '', D: TIDY, E: TIDY + POLISH };
const NAMES = { A: 'now', D: 'tidy', E: 'tidy + aligned' };
const VARIANTS = (opt('variants') || Object.keys(ALL));

const MEASURE = `(() => {
  const vis = e => e && !e.hidden && e.getBoundingClientRect().height > 0 && getComputedStyle(e).display !== 'none';
  const btn = [document.getElementById('btnNext'), document.getElementById('btnSpin')].find(vis);
  const w = document.getElementById('wheelWrap').getBoundingClientRect(), b = btn.getBoundingClientRect();
  const rows = [...document.querySelectorAll('#sheetBody .row')].filter(vis);
  const filled = rows.filter(r => !r.classList.contains('empty')).length;
  return { wheel: Math.round(w.width), button: btn.id.replace('btn', ''), buttonFits: b.bottom <= innerHeight,
    eyeTravel: Math.round(Math.hypot(b.left + b.width / 2 - (w.left + w.width / 2), b.top + b.height / 2 - (w.top + w.height / 2))),
    panelRowsShown: rows.length, panelRowsFilled: filled, pageScrolls: document.scrollingElement.scrollHeight > innerHeight + 1 };
})()`;

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [w, h] of SIZES) {
    const win = new BrowserWindow({ width: w, height: h, useContentSize: true, show: true, x: -6000, y: 0, skipTaskbar: true, frame: false, backgroundColor: '#0b0908', webPreferences: { backgroundThrottling: false, offscreen: true } });
    win.webContents.setFrameRate(30);
    const js = c => win.webContents.executeJavaScript(c);
    await win.loadFile(path.join(ROOT, 'app', 'index.html'));
    await js(`localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); localStorage.setItem('fw.prefs', JSON.stringify({ sound: false })); 1`);
    await win.loadFile(path.join(ROOT, 'app', 'index.html'));
    await js('document.fonts.ready.then(() => 1)'); await sleep(400);
    // let Auto play a few wheels at fast speed, then stop on a result
    await js(`FWApp.state.speed = 'fast'; FWApp.runLegend(true); 1`); await sleep(+((opt('wait') || ['9'])[0]) * 1000);
    await js(`FWApp.state.auto = false; FWApp.flow.syncAutoBtn(); 1`);
    const shown = id => js(`(() => { const e = document.getElementById('${id}'); return !!e && !e.hidden && e.offsetParent !== null; })()`);
    for (let t = 0; t < 200; t++) { if (await shown('btnNext')) break; if (await shown('btnSpin') && t > 20) { await js(`document.getElementById('btnSpin').click(); 1`); } await sleep(200); }
    console.log('  ' + w + 'x' + h + ' wheels rolled: ' + await js(`document.querySelectorAll('#sheetBody .row:not(.empty)').length`));
    await js(`(() => { const g = document.createElement('button'); g.id = 'mockGear'; g.className = 'btn small ghost'; g.style.display = 'none'; g.textContent = '⚙ Spin settings';
      document.getElementById('btnAutoToggle').after(g); const r = document.getElementById('btnRespin'); r.dataset.t = r.textContent;
      const st = document.createElement('style'); st.id = 'mockCss'; document.head.appendChild(st); 1 })()`);
    for (const v of VARIANTS) {
      await js(`(() => { document.getElementById('mockCss').textContent = ${JSON.stringify(ALL[v])};
        const r = document.getElementById('btnRespin'), n = document.querySelectorAll('#tokenBox b:not(.off)').length;
        if (${v !== 'A'}) r.textContent = '↻ Re-spin (' + n + ' left)'; 1 })()`);
      await sleep(500);
      const m = await js(MEASURE);
      let img = null; for (let i = 0; i < 12 && !img; i++) { try { img = await win.webContents.capturePage(); } catch (e) { await sleep(300); } }
      if (img) fs.writeFileSync(path.join(OUT, w + 'x' + h + '-' + v + '.jpg'), img.toJPEG(80));
      console.log((w + 'x' + h).padEnd(10) + (v + ' ' + NAMES[v]).padEnd(20) + `wheel ${m.wheel}px · ${m.button} ${m.buttonFits ? 'fits' : 'BELOW EDGE'} · eye travel ${m.eyeTravel}px · panel ${m.panelRowsFilled}/${m.panelRowsShown} rows filled${m.pageScrolls ? ' · page scrolls' : ''}`);
    }
    win.destroy();
  }
  app.exit(0);
});
