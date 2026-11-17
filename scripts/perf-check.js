// Performance budget: how fast the game starts and how much work each wheel frame takes, checked against limits.
//   npx electron scripts/perf-check.js [--json=out.json] [--cpu=4]
// It opens the game in a hidden window with a throwaway profile and measures:
// - start: the time until the title screen is ready to use (the median of 3 loads), and the bytes it loaded
//   (counted from the files on disk, so this number never varies between machines);
// - spin: while Auto-spin makes a hero for 15 seconds, the time between frames when a wheel is turning (median,
//   95th percentile, longest) and the frames over 50 ms the browser reports (each is a visible hitch).
// Exits with 1 when a number is over its limit, so CI fails. Byte limits are strict; time limits are loose on
// purpose, because shared CI machines are slower and noisier than a player's PC.
// --cpu=4 slows the page's CPU four times (like a cheap phone) to see where the time goes; limits are not applied.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { fileURLToPath } = require('url');

const ROOT = path.join(__dirname, '..');
const arg = k => {
  const a = process.argv.find(x => x.startsWith('--' + k + '='));
  return a ? a.slice(k.length + 3) : null;
};
const CPU = +(arg('cpu') || 1);
// the limits; raise one only on purpose, and say why in the commit
const BUDGET = {
  startMs: 2500, // until the title screen is ready (a player's PC does it in well under a second)
  startKB: 2500, // everything the title screen loads: page, scripts, styles, fonts, art (1712 KB on 2026-11-17)
  scriptKB: 1300, // the JavaScript alone (1021 KB on 2026-11-17)
  frameP95Ms: 25, // 95% of frames while spinning arrive within this (60 fps is 16.7 ms between frames)
  longFrames: 10, // frames over 50 ms in 15 seconds of Auto-spin, mostly between wheels (4 on 2026-11-17)
};

app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-perf-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = msg => {
  console.error('Performance check failed: ' + msg);
  app.exit(1);
};
process.on('unhandledRejection', e => fail((e && e.stack) || e));
setTimeout(() => fail('took too long'), 5 * 60 * 1000).unref();
const median = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const quant = (a, q) => a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(q * a.length))];

// resolves once the title screen has its buttons and every font it asked for has loaded
const READY = `new Promise(res => { const go = () => {
  const t = document.querySelector('#screen-title.active');
  if (window.FWApp && t && t.querySelector('button')) document.fonts.ready.then(() => res(performance.now()));
  else requestAnimationFrame(go); }; go(); })`;

app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    useContentSize: true,
    show: false,
    // off-screen rendering keeps animation frames coming at 60 a second; a hidden or off-screen window gets none
    webPreferences: { backgroundThrottling: false, offscreen: true },
  });
  win.webContents.setFrameRate(60);
  const js = c => win.webContents.executeJavaScript(c);
  const file = path.join(ROOT, 'app', 'index.html');
  await win.loadFile(file);
  await js(
    `localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); localStorage.setItem('fw.prefs', JSON.stringify({ sound: false, hdMusic: false })); 1`
  );
  // the browser's own network events: they see local files too, so every file the page loads is counted
  const dbg = win.webContents.debugger;
  dbg.attach('1.3');
  let urls = new Set();
  dbg.on('message', (e, method, params) => {
    if (method === 'Network.requestWillBeSent') urls.add(params.request.url);
  });
  await dbg.sendCommand('Network.enable');
  if (CPU > 1) await dbg.sendCommand('Emulation.setCPUThrottlingRate', { rate: CPU });

  // start: three loads, the median
  const starts = [];
  for (let n = 0; n < 3; n++) {
    urls = new Set();
    await win.loadFile(file);
    starts.push(await js(READY));
    await sleep(300);
  }
  let bytes = 0,
    scriptBytes = 0;
  const seen = new Set();
  for (const u of urls) {
    if (!u.startsWith('file:')) continue;
    const p = fileURLToPath(u.split(/[?#]/)[0]);
    if (seen.has(p) || !fs.existsSync(p)) continue;
    seen.add(p);
    const b = fs.statSync(p).size;
    bytes += b;
    if (p.endsWith('.js')) scriptBytes += b;
  }

  // spin: the time between frames while Auto-spin makes a hero, and the browser's own count of long frames
  await js(`(() => {
    window.__gaps = []; window.__long = [];
    try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__long.push({ ms: Math.round(e.duration), by: (e.scripts || []).slice().sort((a, b) => b.duration - a.duration).slice(0, 1).map(x => (x.sourceFunctionName || x.invoker || '?') + ' (' + String(x.sourceURL || '').split('/').pop().split('?')[0] + ')').join('') })))
      .observe({ type: 'long-animation-frame' }); } catch (e) {}
    let last = 0, spins = 0;
    const W = FW.Wheel.prototype, draw = W.draw;
    W.draw = function () { if (this.spinning) spins++; return draw.apply(this, arguments); };
    const tick = now => { if (last && spins) window.__gaps.push(now - last); last = now; spins = 0; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    FWApp.runLegend(true); return 1; })()`);
  await sleep(15000);
  const gaps = await js('window.__gaps'),
    longs = await js('window.__long');
  if (gaps.length < 300) return fail('only ' + gaps.length + ' spinning frames were seen; the spins did not run');

  const r = {
    startMs: Math.round(median(starts)),
    startKB: Math.round(bytes / 1024),
    scriptKB: Math.round(scriptBytes / 1024),
    files: seen.size,
    frames: gaps.length,
    frameMedianMs: +median(gaps).toFixed(1),
    frameP95Ms: +quant(gaps, 0.95).toFixed(1),
    frameMaxMs: +Math.max(...gaps).toFixed(1),
    longFrames: longs.length,
    cpuSlowdown: CPU,
  };
  console.log(
    'Start   ' + r.startMs + ' ms until the title screen is ready (loads: ' + starts.map(Math.round).join(', ') + ')'
  );
  console.log('        ' + r.startKB + ' KB in ' + r.files + ' files, of which ' + r.scriptKB + ' KB JavaScript');
  console.log(
    'Spin    ' +
      r.frames +
      ' frames while a wheel spun: median ' +
      r.frameMedianMs +
      ' ms apart, 95% within ' +
      r.frameP95Ms +
      ' ms, longest gap ' +
      r.frameMaxMs +
      ' ms; frames over 50 ms: ' +
      r.longFrames +
      (longs.length
        ? ' (' +
          longs
            .slice(0, 8)
            .map(l => l.ms)
            .join(', ') +
          ' ms)'
        : '')
  );
  const worst = longs.slice().sort((a, b) => b.ms - a.ms)[0];
  if (worst && worst.by) console.log('        the longest (' + worst.ms + ' ms) was mostly ' + worst.by);
  if (arg('json')) fs.writeFileSync(arg('json'), JSON.stringify(r, null, 2) + '\n');
  if (CPU > 1) {
    console.log('\nCPU slowed ' + CPU + 'x: limits not applied.');
    return app.exit(0);
  }
  const over = Object.keys(BUDGET).filter(k => r[k] > BUDGET[k]);
  if (over.length) {
    console.error('\nOver budget: ' + over.map(k => k + ' ' + r[k] + ' > ' + BUDGET[k]).join(', '));
    console.error('If the change is worth it, raise the limit in BUDGET in scripts/perf-check.js and say why.');
    return app.exit(1);
  }
  console.log('\nEvery number is within its budget.');
  app.exit(0);
});
