// Accessibility check: opens the main screens and dialogs in a hidden window and runs the axe audit (WCAG 2.1 A and
// AA rules) on each. Exits with 1 when axe finds a problem, so CI fails. Uses a throwaway profile.
//   npx electron scripts/a11y-check.js [--screens=title,options] [--theme=wild] [--lang=de]
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const arg = k => {
  const a = process.argv.find(x => x.startsWith('--' + k + '='));
  return a ? a.split('=')[1].split(',') : null;
};
const THEME = (arg('theme') || [''])[0];
const LANG = (arg('lang') || [''])[0];
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const LEGEND = `(() => { const L = new FW.Legend({ luck: 'heroic', seed: 'a11y' }), rng = FW.makeRng('a11y:spin'); let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L); FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng); }
  FWApp.state.legend = L; return L; })()`;
const OPEN = {
  title: `FWApp.flow.show('title')`,
  home: `FWApp.flow.show('home')`,
  spin: `FWApp.runLegend(false)`,
  card: `${LEGEND}; FWApp.showCard()`,
  story: `${LEGEND}; FWApp.showCard(); FWApp.runStory()`,
  options: `FW.Options.open()`,
  'options-audio': `FW.Options.open('audio')`,
  'options-access': `FW.Options.open('access')`,
  'options-data': `FW.Options.open('data')`,
  content: `FWApp.contentModal('happen')`,
  workshop: `FWApp.contentModal('workshop')`,
  hall: `FWApp.hallModal()`,
  achievements: `FWApp.achievementsModal()`,
  // a real saga played to its end, then the Saga recap opened from the ending screen
  recap: `(async () => { const L = ${LEGEND}, S = FW.Story, rng = FW.makeRng('a11y:story'), o = {}; S.OPTIONS.forEach(x => (o[x.id] = x.def !== false)); S.newSaga(L, o, rng); const io = { rng, spin: async c => FW.weightedIndex(c.entries, rng) }; while (!L.saga.end) await S.playTurn(L, io, o); FWApp.showCard(); FWApp.runStory(); setTimeout(() => document.getElementById('btnRecap').click(), 1200); })()`,
};
const SCREENS = arg('screens') || Object.keys(OPEN);
// rules left out, with the reason (none at the moment; axe can't see inside the wheel's canvas, which has its own
// live text for screen readers)
const SKIP = {};

app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-a11y-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fail = msg => {
  console.error('Accessibility check failed: ' + msg);
  app.exit(1);
};
process.on('unhandledRejection', e => fail((e && e.stack) || e));
setTimeout(() => fail('took too long'), 5 * 60 * 1000).unref();

app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: { backgroundThrottling: false, offscreen: true },
  });
  const js = code => win.webContents.executeJavaScript(code);
  const file = path.join(ROOT, 'app', 'index.html');
  await win.loadFile(file);
  await js(
    `localStorage.setItem('fw.guide','true'); localStorage.setItem('fw.thanks','true'); ${LANG ? "localStorage.setItem('fw.lang', '\"" + LANG + '"\');' : ''} localStorage.setItem('fw.prefs', JSON.stringify({ sound: false, hdMusic: false })); 1`
  );
  let total = 0;
  for (const sc of SCREENS) {
    if (!OPEN[sc]) fail('unknown screen ' + sc);
    await win.loadFile(file);
    await js('document.fonts.ready.then(() => 1)');
    await sleep(400);
    if (THEME) await js(`FWApp.setTheme('${THEME}'); 1`);
    const err = await js(`try { ${OPEN[sc]}; 1 } catch (e) { 'error: ' + e.message }`);
    if (err !== 1) fail(sc + ': ' + err);
    await sleep(sc === 'recap' ? 3000 : 900);
    await js(AXE + '; 1');
    const res = await js(`axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        rules: ${JSON.stringify(Object.fromEntries(Object.keys(SKIP).map(k => [k, { enabled: false }])))}
      }).then(r => r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help,
        nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ')), count: v.nodes.length })))`);
    total += res.length;
    console.log((res.length ? '  FAIL ' : '  ok   ') + sc + (res.length ? ' (' + res.length + ')' : ''));
    for (const v of res)
      console.log('       ' + v.impact + ' ' + v.id + ': ' + v.help + ' x' + v.count + '  ' + v.nodes.join(' | '));
  }
  console.log(
    total
      ? '\n' + total + ' accessibility problem(s) found.'
      : '\nNo accessibility problems on ' + SCREENS.length + ' screens.'
  );
  app.exit(total ? 1 : 0);
});
