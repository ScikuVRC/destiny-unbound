// Records the trailer as separate 1920x1080, 30 fps scene clips, each one a scripted moment of the real game:
// a logo opening, a rare spin, a hero being forged, a card with its portrait, a story choice, a boss fight, a
// family tree, a rare ending, the four themes, title cards and an end card. scripts/make-trailer.js cuts them
// together with the HD music.
//   npx electron scripts/record-trailer.js [outDir]       (default: dist/trailer/clips)
// It renders offscreen with a fresh, throwaway profile, so it never touches your saves. Needs ffmpeg on PATH.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(
  process.argv.find((a, i) => i > 1 && !a.startsWith('-') && !a.endsWith('.js')) ||
    path.join(ROOT, 'dist', 'trailer', 'clips')
);
const W = 1920,
  H = 1080,
  FPS = 30;
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-trailer-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.disableHardwareAcceleration(); // offscreen rendering is steadier in software

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ff = null; // the ffmpeg encoding the current clip
function fail(why) {
  console.error('Recording failed: ' + why);
  if (ff) ff.kill('SIGKILL'); // never leave an encoder running
  app.exit(1);
}
process.on('unhandledRejection', e => fail((e && e.stack) || e));
setTimeout(() => fail('it took too long'), 10 * 60 * 1000).unref();
app.on('window-all-closed', () => {});

app.whenReady().then(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const win = new BrowserWindow({
    width: W,
    height: H,
    useContentSize: true,
    show: false,
    backgroundColor: '#0b0908',
    webPreferences: { offscreen: true, backgroundThrottling: false, contextIsolation: true },
  });
  win.webContents.setFrameRate(FPS);
  win.webContents.on('render-process-gone', (e, d) => fail('the game page crashed (' + d.reason + ')'));
  // every page call gets 20 seconds; a stuck page ends the run instead of hanging it
  const js = code =>
    Promise.race([
      win.webContents.executeJavaScript(code),
      new Promise((_, no) => setTimeout(() => no(new Error('the page stopped responding')), 20000)),
    ]);
  await win.loadFile(path.join(ROOT, 'app', 'index.html'));
  await js(
    `localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); localStorage.setItem('fw.prefs', JSON.stringify({ muteBg: false, hdMusic: false })); 1`
  );
  await win.loadFile(path.join(ROOT, 'app', 'index.html'));
  await js('document.fonts.ready.then(() => 1)');
  // no pop-ups, guides or scrollbars in the footage
  await js(`(() => { const s = document.createElement('style'); s.textContent =
    '.ach-pop, #coach, .toast, [class*=unlock] { display: none !important } ::-webkit-scrollbar { display: none }';
    document.head.appendChild(s); if (window.FWAchieve) window.FWAchieve.check = () => {}; return 1; })()`);
  await sleep(1500);

  /* ---------- recording: every painted frame goes to ffmpeg with its wall-clock time ---------- */
  let t0 = 0,
    keepAlive = null;
  const marks = {};
  win.webContents.on('paint', (e, dirty, image) => {
    // if the encoder falls behind, drop this frame instead of piling frames up in memory (the fps filter fills gaps)
    if (ff && ff.stdin.writable && ff.stdin.writableLength < 4 * 1024 * 1024) ff.stdin.write(image.toJPEG(90));
  });
  async function record(name, scene) {
    const file = path.join(OUT, name + '.mp4');
    ff = spawn('ffmpeg', [
      '-loglevel', 'error', '-y',
      '-use_wallclock_as_timestamps', '1', '-f', 'image2pipe', '-c:v', 'mjpeg', '-i', '-',
      '-vf', `fps=${FPS},scale=${W}:${H},format=yuv420p`, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '12',
      file,
    ]); // prettier-ignore
    const done = new Promise(r => ff.on('close', r));
    t0 = Date.now();
    keepAlive = setInterval(() => win.webContents.invalidate(), 1000 / FPS); // still scenes still produce frames
    marks[name] = {};
    await scene(label => (marks[name][label] = (Date.now() - t0) / 1000));
    clearInterval(keepAlive);
    await sleep(100);
    ff.stdin.end();
    await done;
    ff = null;
    console.log('recorded ' + name);
  }

  /* ---------- helpers ---------- */
  const resultShown = async (max = 15000) => {
    for (let t = 0; t < max; t += 100) {
      if (await js(`FWApp.state.mode === 'result'`)) return;
      await sleep(100);
    }
  };
  // a full-screen title card in the game's own fonts
  const card = (line, sub) =>
    js(`(() => { document.getElementById('trCard')?.remove(); const d = document.createElement('div'); d.id = 'trCard';
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:radial-gradient(ellipse at center,#1a120c 0%,#050403 70%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center';
      d.innerHTML = '<div style="font-family:Cinzel,serif;font-weight:700;font-size:76px;letter-spacing:.08em;color:#e8c37a;text-shadow:0 0 40px rgba(232,140,60,.35)">' + ${JSON.stringify(line)} + '</div>'
        + (${JSON.stringify(sub || '')} ? '<div style="margin-top:22px;font-family:\\'EB Garamond\\',serif;font-style:italic;font-size:38px;color:#cdbb9c">' + ${JSON.stringify(sub || '')} + '</div>' : '')
        + '<div style="margin-top:34px;width:260px;height:1px;background:linear-gradient(90deg,transparent,#a7783f,transparent)"></div>';
      document.body.appendChild(d); return 1; })()`);
  const noCard = () => js(`document.getElementById('trCard')?.remove(); 1`);
  const titleOnly = on =>
    js(
      `document.querySelectorAll('.tscr .panel, .tscr .foot').forEach(e => e.style.visibility = '${on ? 'hidden' : ''}'); 1`
    );
  const showcaseHero = () =>
    js(`(() => {
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
      FWApp.state.legend = L; return 1; })()`);

  /* ---------- scenes ---------- */
  await js(`FWApp.setTheme('ashen'); 1`);
  await titleOnly(true);
  await record('open', async () => sleep(5500)); // the painted title and logo, no menu

  await titleOnly(false);
  for (const [name, line, sub] of [
    ['card-spin', 'Every hero begins with a spin', ''],
    ['card-saga', 'Then live the saga', 'Choose. Spin. Survive.'],
    ['card-boss', 'Face what waits in the dark', ''],
    ['card-house', 'Found a dynasty', ''],
    ['card-end', 'Ten endings', 'Which one is yours?'],
    ['card-worlds', 'Four painted worlds', ''],
  ]) {
    await card(line, sub);
    await record(name, async () => sleep(2600));
  }
  await noCard();

  // a race wheel that lands on its one tiny slice: the rare-result moment
  await record('rare', async m => {
    await js(`(() => { const F = FWApp.flow; F.newRun(); F.show('spin');
      FWApp.state.legend = new FW.Legend({ luck: 'common', seed: 'trailer' }); FWApp.state.rng = () => 0.9995; FWApp.state.speed = 'normal';
      const entries = ['Human','Elf','Dwarf','Orc','Goblin','Gnome','Halfling','Beastkin','Lizardfolk'].map(n => ({ name: n, w: 10 }));
      entries.push({ name: 'Dragonborn', w: 1 });
      F.playStep({ emoji: '🧬', title: 'Your race', entries }).catch(() => {}); return 1; })()`);
    await sleep(700);
    await js(`FWApp.fire('spin'); 1`);
    await resultShown();
    m('land');
    await sleep(2200);
  });

  // a hero forged on fast speed (played back faster still)
  await record('forge', async () => {
    await js(`FWApp.flow.abortRun(); FWApp.state.speed = 'fast'; FWApp.syncSpeedBtn(); FWApp.flow.show('home'); 1`);
    await sleep(400);
    await js(`document.getElementById('btnAuto').click(); 1`);
    await sleep(16000);
  });

  // the card of a finished hero, with her portrait, revealed and turned over
  await js(`FWApp.flow.abortRun(); 1`);
  await showcaseHero();
  await record('card', async () => {
    await js(`FWApp.showCard(); 1`);
    await sleep(4200);
    await js(`document.getElementById('btnFlip').click(); 1`);
    await sleep(2600);
  });

  // a story choice, then the wheel decides how it goes
  await js(`FWApp.setTheme('bloodmoon'); 1`);
  await record('choice', async m => {
    await js(`(() => { const F = FWApp.flow; F.newRun(); F.show('spin');
      FWApp.state.wheel.setEntries([['Slay it',3,'#8e2f2f'],['Barely escape',4,'#5a3b6b'],['Burned',3,'#6b4a2a'],['Steal a treasure',2,'#7a6a2a'],['Befriend it',2,'#2f6e5a']].map(([name,w,color]) => ({ name, w, dsl: '', color })), { mode: 'cat', hue: 0 });
      window.__choice = F.chooseStep({ emoji: '🐉', title: 'Ashwing the Young wakes. What do you do?', options: [ { label: 'Fight it', hint: 'Win, and the realm never forgets you.' }, { label: 'Talk to it', hint: 'Dragons are proud and clever. So must you be.' }, { label: 'Sneak into its hoard', hint: 'Quiet feet and quick hands.' } ] }).catch(() => {}); return 1; })()`);
    await sleep(2600);
    await js(
      `(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && /talk to it/i.test(b.textContent)); if (b) b.click(); return !!b; })()`
    );
    await sleep(500);
    await js(`(() => { FWApp.state.rng = () => 0.9995; FWApp.state.speed = 'normal';
      FWApp.flow.playStep({ emoji: '🐉', title: 'You speak to Ashwing. How does it go?',
        entries: [['It burns you',3,'#8e2f2f'],['It laughs you off',4,'#5a3b6b'],['It demands a gift',3,'#7a6a2a'],['It becomes your ally',2,'#2f6e5a']].map(([name,w,color]) => ({ name, w, dsl: '', color })),
        mode: 'cat', hue: 0 }).catch(() => {}); return 1; })()`);
    await sleep(600);
    await js(`FWApp.fire('spin'); 1`);
    await resultShown();
    m('land');
    await sleep(1800);
  });

  // a boss fight, won
  await js(`FWApp.setTheme('iron'); 1`);
  await record('boss', async m => {
    await js(`(() => { const L = FWApp.state.legend, F = FWApp.flow;
      const opp = { name: 'Dread Sovereign Kaelun', w: 1, dsl: 'lv=70 a=fire w=ice' };
      const arena = FW.ARENAS.find(a => a.name === 'Volcanic Forge');
      const rep = FW.matchup(L, opp, arena);
      F.newRun(); F.show('spin'); FWApp.state.rng = () => 0.001; FWApp.state.speed = 'normal';
      F.playStep({ emoji: '⚔️', title: 'Do you win?', entries: [
          { name: 'Victory', w: Math.max(rep.pWin, 0.3), dsl: '', color: '#2f9e57', colorLight: 38 },
          { name: 'Stalemate', w: rep.pDraw, dsl: '', color: '#777', colorLight: 46 },
          { name: 'Defeat', w: rep.pLose, dsl: '', color: '#b8383b', colorLight: 40 } ],
        mode: 'cat', hue: 0, hint: FW.mechText(FW.BOSS_MECH[opp.name]),
        preFx: FW.html.battle(L.displayName(), opp.name, arena.name, rep),
        onResult: () => ({ fx: FW.html.battle(L.displayName(), opp.name, arena.name, rep) }) }).catch(() => {}); return 1; })()`);
    await sleep(1500);
    await js(`FWApp.fire('spin'); 1`);
    await resultShown();
    m('land');
    await sleep(2200);
  });

  // the family tree
  await js(`FWApp.flow.abortRun(); FWApp.setTheme('ashen'); FWApp.showCard(); 1`);
  await sleep(2500);
  await record('house', async () => {
    await js(`document.getElementById('btnHouse').click(); 1`);
    await sleep(4200);
  });
  await js(`FWApp.closeModal(); 1`);

  // the ending wheel lands on its rarest slice: passed into legend
  await record('ending', async m => {
    await js(`(() => { const F = FWApp.flow, L = FWApp.state.legend; F.newRun(); F.show('spin');
      const ends = Object.keys(FW.Story.endLabel).filter(k => k !== 'legend').map(k => ({ name: FW.Story.endLabel[k], w: 3, dsl: '' }));
      ends.push({ name: FW.Story.endLabel.legend, w: 0.6, dsl: '' });
      FWApp.state.rng = () => 0.9995; FWApp.state.speed = 'normal';
      F.playStep({ emoji: '🌟', title: 'The end of ' + L.displayName(), entries: ends, mode: 'cat', hue: 30,
        onResult: () => ({ sub: L.saga.endText, fx: '<div class="fx-card"><img class="end-art" src="art/endings/legend.webp" alt=""><h3>' + FW.Story.summary(L) + '</h3></div>' }) }).catch(() => {}); return 1; })()`);
    await sleep(700);
    await js(`FWApp.fire('spin'); 1`);
    await resultShown(20000);
    m('land');
    await sleep(3800);
  });

  // the four themes, title screen with menu
  await js(`FWApp.flow.abortRun(); FWApp.flow.show('title'); 1`);
  await sleep(800);
  await record('worlds', async m => {
    for (const th of ['ashen', 'astral', 'iron', 'bloodmoon']) {
      await js(`FWApp.setTheme('${th}'); 1`);
      m(th);
      await sleep(1500);
    }
  });

  // the end card: logo, call to action, platforms
  await js(`FWApp.setTheme('ashen'); 1`);
  await titleOnly(true);
  await js(`(() => { const d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;z-index:99;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding-bottom:110px;background:linear-gradient(transparent 30%, rgba(5,4,3,.94) 76%);font-family:Cinzel,serif;color:#e8c37a;text-align:center;text-shadow:0 2px 14px #000';
    d.innerHTML = '<div style="font-size:52px;font-weight:700;letter-spacing:.1em">Play free now</div><div style="font-family:\\'EB Garamond\\',serif;font-size:36px;color:#d9ccb4;margin:16px 0 26px">In your browser, or on Windows, Mac and Linux · Free and open source</div><div style="font-size:42px;letter-spacing:.05em;color:#fff">bzrkherja.itch.io/destiny-unbound</div>';
    document.body.appendChild(d); return 1; })()`);
  await sleep(600);
  await record('endcard', async () => sleep(5500));

  fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(marks, null, 1));
  console.log('clips in ' + OUT);
  app.exit(0);
});
