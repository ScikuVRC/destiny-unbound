// Win rates per race and per class: rolls thousands of heroes at one luck level and fights each one against every
// arena opponent (all thirteen worlds, a neutral arena), then lists every race and class with its average rating
// and average chance to win. Use it to find races and classes that are far stronger or weaker than the rest.
//   node scripts/win-rates.js [heroes=20000] [luck=heroic] [--json]
// SPDX-License-Identifier: GPL-3.0-or-later
['data.js', 'engine.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW;
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const N = +args[0] || 20000,
  LUCK = args[1] || 'heroic',
  JSON_OUT = process.argv.includes('--json');

function legend(seed) {
  const L = new FW.Legend({ luck: LUCK, seed }),
    rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}
const ALL_OPPS = [];
FW.UNIVERSES.forEach(u => u.opps.forEach(o => ALL_OPPS.push(o)));
const NEUTRAL = { name: 'Neutral ground', tags: [], w: 1 };

const groups = { race: {}, cls: {} };
const add = (g, k, rating, win) => {
  const x = (groups[g][k] = groups[g][k] || { n: 0, rating: 0, win: 0 });
  x.n++;
  x.rating += rating;
  x.win += win;
};
let all = { n: 0, win: 0, rating: 0 };
for (let i = 0; i < N; i++) {
  const L = legend('wr-' + LUCK + i),
    c = FW.compute(L);
  let w = 0;
  ALL_OPPS.forEach(o => (w += FW.matchup(L, o, NEUTRAL).pWin));
  w /= ALL_OPPS.length;
  all.n++;
  all.win += w;
  all.rating += c.baseRating;
  add('race', L.raceName(), c.baseRating, w);
  if (L.has('cls')) add('cls', L.pickName('cls'), c.baseRating, w);
}
const table = g =>
  Object.keys(groups[g])
    .map(k => {
      const x = groups[g][k];
      return { name: k, n: x.n, rating: x.rating / x.n, win: (100 * x.win) / x.n };
    })
    .sort((a, b) => b.win - a.win);
const out = { luck: LUCK, heroes: N, avgWin: (100 * all.win) / all.n, race: table('race'), cls: table('cls') };
if (JSON_OUT) {
  console.log(JSON.stringify(out, null, 2));
} else {
  const row = x =>
    '  ' +
    x.name.padEnd(22) +
    String(x.n).padStart(6) +
    x.rating.toFixed(1).padStart(8) +
    (x.win.toFixed(1) + '%').padStart(9);
  console.log('Luck ' + LUCK + ', ' + N + ' heroes, each against all ' + ALL_OPPS.length + ' arena opponents');
  console.log('Average win chance ' + out.avgWin.toFixed(1) + '%\n');
  ['race', 'cls'].forEach(g => {
    const t = out[g].filter(x => x.n >= 30);
    console.log((g === 'race' ? 'Races' : 'Classes') + ' (with 30+ heroes)        n  rating     win');
    t.forEach(x => console.log(row(x)));
    console.log(
      '  spread ' +
        (t[0].win - t[t.length - 1].win).toFixed(1) +
        ' points (' +
        t[0].name +
        ' to ' +
        t[t.length - 1].name +
        ')\n'
    );
  });
}
