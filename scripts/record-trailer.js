// Records gameplay footage for the trailer and the GIF: the four title themes, an auto-spun legend, its card and a
// little of its story. Frames are saved as JPEGs with their times, then scripts/make-trailer.js turns them into video.
//   npx electron scripts/record-trailer.js [outDir]       (default: dist/trailer/frames)
// It plays in its own window with a fresh, throwaway profile, so it never touches your saves.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(process.argv.find((a, i) => i > 1 && !a.startsWith('-') && !a.endsWith('.js')) || path.join(ROOT, 'dist', 'trailer', 'frames'));
const W = 1280, H = 720;
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-trailer-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const sleep = ms => new Promise(r => setTimeout(r, ms));
process.on('unhandledRejection', e => { console.error('Recording failed: ' + (e && e.stack || e)); app.exit(1); });
setTimeout(() => { console.error('Recording took too long; giving up.'); app.exit(1); }, 8 * 60 * 1000).unref();
const marks = [];   // [time ms, label]: where each scene starts, for the editing script

app.whenReady().then(async () => {
  if (!process.argv.includes('--endcard')) { fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true }); }
  const win = new BrowserWindow({ width: W, height: H, useContentSize: true, show: true, x: -4000, y: 0, skipTaskbar: true, frame: false,
    backgroundColor: '#0b0908', webPreferences: { backgroundThrottling: false, contextIsolation: true } });
  const js = code => win.webContents.executeJavaScript(code);
  await win.loadFile(path.join(ROOT, 'app', 'index.html'));
  await js(`localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); localStorage.setItem('fw.prefs', JSON.stringify({ muteBg: false }));`);
  await win.loadFile(path.join(ROOT, 'app', 'index.html'));
  await js('document.fonts.ready.then(() => 1)'); await sleep(1500);

  if (process.argv.includes('--endcard')) {   // one still: the title art with the call to action, for the video's last seconds
    await js(`FWApp.setTheme('ashen'); document.querySelectorAll('.tscr .panel, .tscr .foot').forEach(e => e.style.visibility = 'hidden');
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:99;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:70px;background:linear-gradient(transparent 35%, rgba(5,4,3,.92) 78%);font-family:Cinzel,serif;color:#e8c37a;text-align:center;text-shadow:0 2px 12px #000';
      d.innerHTML = '<div style="font-size:34px;letter-spacing:.08em">Free · Open source</div><div style="font-family:\\'EB Garamond\\',serif;font-size:26px;color:#d9ccb4;margin:10px 0 18px">Play in your browser, or download for Windows, Mac and Linux</div><div style="font-size:30px;letter-spacing:.04em;color:#fff">bzrkherja.itch.io/destiny-unbound</div>';
      document.body.appendChild(d); 1`);
    await sleep(1500);
    let img = null;
    for (let i = 0; i < 20 && !img; i++) { try { img = await win.webContents.capturePage(); } catch (e) { await sleep(250); } }   // the first captures can fail while the window settles
    if (!img) throw new Error('could not capture the end card');
    const file = path.join(path.dirname(OUT), 'endcard.png');
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, img.resize({ width: W, height: H }).toPNG());
    console.log('wrote ' + file); app.exit(0); return;
  }

  let n = 0, t0 = Date.now(), recording = true;
  const index = [];
  // grab the page about 25 times a second; each frame keeps its real time so the video plays at true speed
  (async function grab() {
    while (recording) {
      const started = Date.now();
      try {
        const img = await win.webContents.capturePage();
        const file = String(n++).padStart(6, '0') + '.jpg';
        index.push([file, started - t0]);
        fs.writeFile(path.join(OUT, file), img.resize({ width: W, height: H }).toJPEG(90), () => {});
      } catch (e) { /* window busy: skip a frame */ }
      await sleep(Math.max(0, 40 - (Date.now() - started)));
    }
  })();
  const mark = label => marks.push([Date.now() - t0, label]);
  mark('title');
  for (const th of ['ashen', 'astral', 'iron', 'bloodmoon']) { mark('theme-' + th); await js(`FWApp.setTheme('${th}')`); await sleep(2600); }
  await js(`FWApp.setTheme('ashen')`); await sleep(600);

  mark('spin');
  await js(`FWApp.state.speed = 'fast'; FWApp.syncSpeedBtn(); FWApp.flow.show('home'); 1`); await sleep(1200);
  await js(`document.getElementById('btnAuto').click()`);
  for (let i = 0; i < 400; i++) { await sleep(500); if (await js(`!!(document.getElementById('screen-card')||{}).offsetParent`)) break; }
  mark('card'); await sleep(5000);

  mark('story');
  await js(`document.getElementById('btnStory').click()`); await sleep(500);
  await js(`if (!FWApp.state.auto) document.getElementById('btnAutoToggle').click(); 1`);
  await sleep(30000);
  mark('end');

  recording = false; await sleep(800);
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ frames: index, marks }, null, 1));
  console.log(`${index.length} frames, ${(marks[marks.length - 1][0] / 1000).toFixed(1)} s, scenes: ${marks.map(m => m[1] + '@' + (m[0] / 1000).toFixed(1)).join(' ')}`);
  app.exit(0);
});
