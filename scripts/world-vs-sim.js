// Real endings against simulated ones: reads the opt-in world counter's totals (what players who switched on
// Options > Data > world counter have finished) and plays the same number of luck-weighted sagas with honest odds,
// then shows both side by side. A big gap means real players steer sagas differently from the odds: by choices,
// re-spins, or switching content off. Too few real sagas and the comparison says so instead.
// Run: node scripts/world-vs-sim.js [simulatedSagas]
// SPDX-License-Identifier: GPL-3.0-or-later
globalThis.window = globalThis;
const fs = require('fs'),
  path = require('path');
['data.js', 'engine.js', 'story.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW,
  S = FW.Story;
const SIM = +process.argv[2] || 2000;
const MIN_REAL = 50; // fewer real sagas than this and the percentages are mostly noise
const sys = fs.readFileSync(path.join(__dirname, '..', 'app', 'js', 'system.js'), 'utf8');
const URL_BASE = (/FW\.WORLD_URL = '([^']+)'/.exec(sys) || [])[1];

async function simulate(n) {
  const ends = {};
  const opts = {};
  S.OPTIONS.forEach(o => (opts[o.id] = o.def !== false));
  for (let i = 0; i < n; i++) {
    // most players stay on the default luck; the rest spread over the others
    const luck = i % 10 < 7 ? 'heroic' : FW.LUCK[i % FW.LUCK.length].id;
    const seed = 'wvs' + i,
      L = new FW.Legend({ luck, seed }),
      rng = FW.makeRng(seed);
    let k = -1;
    while ((k = FW.nextStageIndex(L, k)) < FW.STAGES.length) {
      const st = FW.buildStage(FW.STAGES[k].id, L);
      FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
    }
    S.newSaga(L, opts, rng);
    const io = { rng, spin: async cfg => FW.weightedIndex(cfg.entries, rng) };
    for (let t = 0; !L.saga.end && t < 400; t++) await S.playTurn(L, io, opts);
    if (L.saga.end) ends[L.saga.end] = (ends[L.saga.end] || 0) + 1;
  }
  return ends;
}

(async () => {
  if (!URL_BASE) throw new Error('FW.WORLD_URL not found in app/js/system.js');
  const real = await (await fetch(URL_BASE + '/v1/totals')).json();
  const sim = await simulate(SIM);
  const realN = real.sagas || 0,
    simN = Object.values(sim).reduce((a, b) => a + b, 0);
  const pct = (v, n) => (n ? ((100 * (v || 0)) / n).toFixed(1) + '%' : '-');
  console.log(
    'World counter since ' + (real.since || '?') + ': ' + (real.heroes || 0) + ' heroes, ' + realN + ' sagas'
  );
  console.log('Simulation: ' + simN + ' sagas (70% Heroic, the rest spread over the other luck levels)\n');
  console.log('  ending        real            simulated   gap');
  const ENDINGS = [
    'retired',
    'dead',
    'legend',
    'martyr',
    'lost',
    'sealed',
    'fulfilled',
    'damned',
    'ascended',
    'undying',
  ];
  for (const e of ENDINGS) {
    const r = (real.endings || {})[e] || 0,
      gap = realN ? (100 * r) / realN - (100 * (sim[e] || 0)) / simN : null;
    console.log(
      '  ' +
        e.padEnd(12) +
        (r + ' (' + pct(r, realN) + ')').padEnd(16) +
        pct(sim[e], simN).padEnd(12) +
        (gap == null
          ? ''
          : (gap > 0 ? '+' : '') + gap.toFixed(1) + (Math.abs(gap) >= 5 && realN >= MIN_REAL ? '  <--' : ''))
    );
  }
  if (realN < MIN_REAL)
    console.log(
      '\nOnly ' +
        realN +
        ' real sagas so far: too few to compare (at least ' +
        MIN_REAL +
        ' needed). The counter is opt-in, in Options > Data.'
    );
  else console.log('\nGaps of 5 points or more are marked <--.');
})();
