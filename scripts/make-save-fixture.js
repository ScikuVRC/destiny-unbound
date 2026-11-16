/* Makes a sample save with an older release's own code, for tests/save.test.js.
   Usage: node scripts/make-save-fixture.js <git tag>     e.g.  node scripts/make-save-fixture.js v0.2.0-alpha.4.5
   Writes tests/saves/<version>.json: three heroes (one with a finished saga, one mid-saga, one without), the last
   legend, settings, achievements and a daily score, in that release's save format.
   SPDX-License-Identifier: GPL-3.0-or-later */
const { execSync } = require('child_process');
const fs = require('fs'),
  os = require('os'),
  path = require('path');
const root = path.join(__dirname, '..');
const tag = process.argv[2];
if (!tag || !/^v\d/.test(tag)) {
  console.log('Usage: node scripts/make-save-fixture.js <tag, e.g. v0.2.0-alpha.4.5>');
  process.exit(1);
}
const version = tag.slice(1);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'du-save-'));
const tarFile = path.join(tmp, 'app.tar');
execSync('git archive -o "' + tarFile + '" ' + tag + ' app/js' + (has('app/data') ? ' app/data' : ''), { cwd: root });
execSync('tar -xf app.tar', { cwd: tmp });
function has(p) {
  try {
    execSync('git cat-file -e ' + tag + ':' + p, { cwd: root, stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}
const dir = path.join(tmp, 'app', 'js');
// releases before 0.2.0-alpha.2 kept the wheels in three data files
const files = ['data.js', 'data-more.js', 'data-extra.js', 'engine.js', 'story.js'].filter(f =>
  fs.existsSync(path.join(dir, f))
);
globalThis.window = globalThis;
files.forEach(f => require(path.join(dir, f)));
const FW = globalThis.FW,
  S = FW.Story;
const today = '2026-11-12';
function makeLegend(seed, luck) {
  const L = new FW.Legend({ luck, seed });
  const rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}
(async () => {
  const hall = [];
  let last = null;
  const plan = [
    ['old-a', 'heroic', 99],
    ['old-b', 'mortal', 4],
    ['old-c', 'mythic', 0],
  ];
  for (const [seed, luck, chapters] of plan) {
    const L = makeLegend(version + ':' + seed, luck);
    if (chapters) {
      const rng = FW.makeRng(seed + ':story');
      const io = { rng, spin: async cfg => FW.weightedIndex(cfg.entries, rng) };
      S.newSaga(L, {}, rng);
      for (let n = 0; !L.saga.end && n < chapters; n++) await S.playTurn(L, io, {});
    }
    const c = FW.compute(L);
    const item = {
      id: seed,
      code: L.toCode(),
      title: (L.name ? L.name + ', ' : '') + L.pickName('title'),
      race: (L.has('sub') ? L.pickName('sub') + ' ' : '') + L.raceName(),
      rating: c.rating,
      rank: c.rank,
      date: today,
    };
    if (L.saga)
      item.saga = {
        summary: S.summary(L),
        end: L.saga.end,
        house: L.saga.dyn && L.saga.dyn.house,
        gen: L.saga.dyn && L.saga.dyn.gen,
      };
    hall.push(item);
    if (seed === 'old-b')
      last = {
        code: L.toCode(),
        name: L.displayName(),
        race: L.raceName(),
        ch: L.saga ? L.saga.ch || 0 : 0,
        end: L.saga ? L.saga.end || '' : '',
        date: today,
      };
  }
  const data = {
    'fw.settings': {
      theme: version.startsWith('0.1') ? 'tabletop' : 'bloodmoon',
      luck: 'heroic',
      sound: true,
      speed: 'normal',
      spinDir: 'cw',
    },
    'fw.hall': hall,
    'fw.last': last,
    'fw.achievements': { first: today, story: today, brief: today },
    'fw.daily': { [today]: { score: 42, title: hall[0].title, race: hall[0].race, summary: hall[0].saga.summary } },
    'fw.options': { arcs: true },
    'fw.person': { name: 'Tester', pres: '', spinLooks: true, presets: {} },
    'fw.lang': 'es',
    'fw.prefs': { uiScale: 1, reduceMotion: false },
    'fw.guide': true,
  };
  const saved = {};
  for (const k in data) saved[k] = JSON.stringify(data[k]);
  const out = path.join(root, 'tests', 'saves', version + '.json');
  fs.writeFileSync(
    out,
    JSON.stringify(
      { format: 'destiny-unbound-save', version: 1, game: version, date: today + 'T12:00:00.000Z', data: saved },
      null,
      1
    ) + '\n'
  );
  console.log('wrote ' + path.relative(root, out));
})();
