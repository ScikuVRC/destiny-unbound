// Records gameplay footage for the trailer and the GIF: the four title themes, a rare spin, an auto-spun legend,
// its card, a boss fight, a little of its story, a dynasty's family tree and an ending, with short captions. Frames are saved as JPEGs with their times, then scripts/make-trailer.js turns them into video.
//   npx electron scripts/record-trailer.js [outDir]       (default: dist/trailer/frames)
// It plays in its own window with a fresh, throwaway profile, so it never touches your saves.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(
  process.argv.find((a, i) => i > 1 && !a.startsWith('-') && !a.endsWith('.js')) ||
    path.join(ROOT, 'dist', 'trailer', 'frames')
);
const W = 1280,
  H = 720;
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-trailer-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const sleep = ms => new Promise(r => setTimeout(r, ms));
process.on('unhandledRejection', e => {
  console.error('Recording failed: ' + ((e && e.stack) || e));
  app.exit(1);
});
setTimeout(
  () => {
    console.error('Recording took too long; giving up.');
    app.exit(1);
  },
  8 * 60 * 1000
).unref();
const marks = []; // [time ms, label]: where each scene starts, for the editing script

app.whenReady().then(async () => {
  if (!process.argv.includes('--endcard')) {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });
  }
  const win = new BrowserWindow({
    width: W,
    height: H,
    useContentSize: true,
    show: true,
    x: -4000,
    y: 0,
    skipTaskbar: true,
    frame: false,
    backgroundColor: '#0b0908',
    webPreferences: { backgroundThrottling: false, contextIsolation: true },
  });
  const js = code => win.webContents.executeJavaScript(code);
  await win.loadFile(path.join(ROOT, 'app', 'index.html'));
  await js(
    `localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); localStorage.setItem('fw.prefs', JSON.stringify({ muteBg: false, hdMusic: false }));`
  );
  await win.loadFile(path.join(ROOT, 'app', 'index.html'));
  await js('document.fonts.ready.then(() => 1)');
  await sleep(1500);

  if (process.argv.includes('--endcard')) {
    // one still: the title art with the call to action, for the video's last seconds
    await js(`FWApp.setTheme('ashen'); document.querySelectorAll('.tscr .panel, .tscr .foot').forEach(e => e.style.visibility = 'hidden');
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;inset:0;z-index:99;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:70px;background:linear-gradient(transparent 35%, rgba(5,4,3,.92) 78%);font-family:Cinzel,serif;color:#e8c37a;text-align:center;text-shadow:0 2px 12px #000';
      d.innerHTML = '<div style="font-size:34px;letter-spacing:.08em">Free · Open source</div><div style="font-family:\\'EB Garamond\\',serif;font-size:26px;color:#d9ccb4;margin:10px 0 18px">Play in your browser, or download for Windows, Mac and Linux</div><div style="font-size:30px;letter-spacing:.04em;color:#fff">bzrkherja.itch.io/destiny-unbound</div>';
      document.body.appendChild(d); 1`);
    await sleep(1500);
    let img = null;
    for (let i = 0; i < 20 && !img; i++) {
      try {
        img = await win.webContents.capturePage();
      } catch (e) {
        await sleep(250);
      }
    } // the first captures can fail while the window settles
    if (!img) throw new Error('could not capture the end card');
    const file = path.join(path.dirname(OUT), 'endcard.png');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, img.resize({ width: W, height: H }).toPNG());
    console.log('wrote ' + file);
    app.exit(0);
    return;
  }

  let n = 0,
    t0 = Date.now(),
    recording = true;
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
      } catch (e) {
        /* window busy: skip a frame */
      }
      await sleep(Math.max(0, 40 - (Date.now() - started)));
    }
  })();
  const mark = label => marks.push([Date.now() - t0, label]);
  // a caption over the footage: big serif line, fades in and out
  const cap = text =>
    js(`(() => { let c = document.getElementById('trCap');
      if (!c) { c = document.createElement('div'); c.id = 'trCap';
        c.style.cssText = 'position:fixed;left:0;right:0;bottom:46px;z-index:999;text-align:center;pointer-events:none;font-family:Cinzel,serif;font-size:40px;letter-spacing:.06em;color:#f3d79a;text-shadow:0 2px 6px #000,0 0 26px #000,0 0 50px rgba(0,0,0,.9);opacity:0;transition:opacity .45s';
        document.body.appendChild(c); }
      c.textContent = ${JSON.stringify(text)}; c.style.opacity = ${text ? 1 : 0}; return 1; })()`);
  const clean = () =>
    js(`document.querySelectorAll('#coach, .ach-pop, .achv, .toast, [class*=unlock]').forEach(e => e.remove()); 1`);
  // keep pressing Spin / Next while a scene plays on its own
  const autoPlay = on =>
    js(
      on
        ? `window.__ap = setInterval(() => { const m = FWApp.state.mode; if (m === 'ready') FWApp.fire('spin'); else if (m === 'result') FWApp.fire('next'); }, 700); 1`
        : `clearInterval(window.__ap); 1`
    );

  mark('title');
  await cap('Spin the wheel. Forge a legend.');
  for (const th of ['ashen', 'astral', 'iron', 'bloodmoon']) {
    mark('theme-' + th);
    await js(`FWApp.setTheme('${th}')`);
    await sleep(2400);
    if (th === 'astral') await cap('Four painted worlds');
  }
  await cap('');
  await js(`FWApp.setTheme('ashen')`);
  await sleep(500);

  // a rigged race wheel that lands on its one tiny slice: the rare-result moment
  mark('rare');
  await js(`(() => { const F = FWApp.flow; F.newRun(); F.show('spin');
    FWApp.state.legend = new FW.Legend({ luck: 'common', seed: 'trailer' }); FWApp.state.rng = () => 0.9995; FWApp.state.speed = 'normal';
    const entries = ['Human','Elf','Dwarf','Orc','Goblin','Gnome','Halfling','Beastkin','Lizardfolk'].map(n => ({ name: n, w: 10 }));
    entries.push({ name: 'Dragonborn', w: 1 });
    F.playStep({ emoji: '🧬', title: 'Your race', entries }).catch(() => {});
    setTimeout(() => FWApp.fire('spin'), 400); return 1; })()`);
  await sleep(1200);
  await cap('Every spin could be legendary');
  await sleep(7600);
  await cap('');

  mark('spin');
  await js(`FWApp.flow.abortRun(); FWApp.state.speed = 'fast'; FWApp.syncSpeedBtn(); FWApp.flow.show('home'); 1`);
  await sleep(1000);
  await js(`document.getElementById('btnAuto').click()`);
  await sleep(1500);
  await cap('26 wheels decide who you are');
  for (let i = 0; i < 400; i++) {
    await sleep(500);
    if (i === 12) await cap('');
    if (await js(`!!(document.getElementById('screen-card')||{}).offsetParent`)) break;
  }
  mark('card');
  await clean();
  await sleep(1200);
  await cap('Your hero, on a card');
  await sleep(2800);
  await js(`document.getElementById('btnFlip').click()`);
  await sleep(2400);
  await js(`document.getElementById('btnFlip').click()`);
  await sleep(1000);
  await cap('');

  mark('fight');
  await js(`document.getElementById('btnFight').click()`);
  await sleep(600);
  await autoPlay(true);
  await cap('Arenas, rivals and boss tricks');
  await sleep(4000);
  await cap('');
  await sleep(14000);
  await autoPlay(false);

  mark('story');
  await js(`FWApp.flow.abortRun(); FWApp.showCard(); 1`);
  await sleep(800);
  await clean();
  await js(`document.getElementById('btnStory').click()`);
  await sleep(500);
  await js(`if (!FWApp.state.auto) document.getElementById('btnAutoToggle').click(); 1`);
  await sleep(1000);
  await cap('Then live the saga');
  await sleep(4000);
  await cap('');
  await sleep(16000);

  // a finished hero with a three-generation house: the family tree and an ending
  mark('dynasty');
  await js(`(async () => { FWApp.flow.abortRun();
    const L = new FW.Legend({ luck: 'mythic', seed: 'showcase' }); L.pres = 'fem'; L.name = 'Maren Ravencrest';
    const rng = FW.makeRng('showcase'); let i = -1;
    while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L);
      const ix = st.id === 'race' ? st.entries.findIndex(e => e.name === 'Human') : FW.weightedIndex(st.entries, rng); FW.commitPick(L, st, ix, rng); }
    FW.Story.newSaga(L, {}, rng);
    L.saga.dyn = { house: 'House Ravencrest', gen: 3, parent: 'Aldric Ravencrest', trait: FW.Story.TRAITS[0],
      history: [ { gen: 1, name: 'Tamsin Ravencrest', race: 'Human', rating: 48.2, rank: 'Champion', end: 'martyr', ch: 14, kingdom: '' },
                 { gen: 2, name: 'Aldric Ravencrest', race: 'Human', rating: 61.0, rank: 'Warlord', end: 'retired', ch: 22, kingdom: 'Caelvorn' } ] };
    L.saga.ch = 17; L.saga.end = 'legend'; L.saga.endText = 'Maren Ravencrest passes into legend. Statues rise in every city.';
    L.saga.kingdom = { name: 'Caelvorn', style: 'Inherited', power: 60 };
    L.saga.log.push({ ch: 17, chapter: 'Passed into legend', emoji: '🌟', text: 'Songs of Maren outlive every king.', tone: 'good', end: true });
    FWApp.state.legend = L; FWApp.showCard(); return 1; })()`);
  await sleep(1500);
  await clean();
  await js(`document.getElementById('btnHouse').click()`);
  await sleep(600);
  await clean();
  await cap('Found a dynasty');
  await sleep(4000);
  await cap('');

  mark('ending');
  await js(`(() => { FWApp.closeModal(); FWApp.flow.show('spin');
    const L = FWApp.state.legend, s = L.saga;
    FWApp.flow.setChip('🌟', 'The end of ' + L.displayName(), 0);
    FWApp.flow.setResult(FW.Story.endLabel[s.end], { pop: true, rare: true });
    document.getElementById('resultSub').textContent = s.endText;
    document.getElementById('effects').innerHTML = '<div class="fx-card"><img class="end-art" src="art/endings/legend.webp" alt=""><h3>' + FW.Story.summary(L) + '</h3></div>';
    FWApp.flow.setControls('result'); return 1; })()`);
  await sleep(500);
  await js(`document.querySelector('.end-art').scrollIntoView({ block: 'center' }); 1`); // 720p: bring the painting into view
  await sleep(300);
  await clean();
  await cap('Ten endings. Which one is yours?');
  await sleep(4500);
  mark('end');

  recording = false;
  await sleep(800);
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ frames: index, marks }, null, 1));
  console.log(
    `${index.length} frames, ${(marks[marks.length - 1][0] / 1000).toFixed(1)} s, scenes: ${marks.map(m => m[1] + '@' + (m[0] / 1000).toFixed(1)).join(' ')}`
  );
  app.exit(0);
});
