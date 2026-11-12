// Balance report: plays thousands of legends, arena fights and sagas with honest odds and prints how the numbers
// come out per luck level. Run: node scripts/balance-report.js [legendsPerLuck] [sagasPerLuck]
// SPDX-License-Identifier: GPL-3.0-or-later
['data.js', 'data-more.js', 'data-extra.js', 'engine.js', 'story.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW, S = FW.Story;
const N = +process.argv[2] || 3000, NS = +process.argv[3] || 600;

function legend(seed, luck) {
  const L = new FW.Legend({ luck, seed }), rng = FW.makeRng(seed + ':spin'); let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L); FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng); }
  return L;
}
const pct = (a, n) => (100 * a / n).toFixed(1) + '%';
const quant = (arr, q) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(q * (s.length - 1))]; };
const report = { luck: {} };

for (const lk of FW.LUCK.map(l => l.id)) {
  const ranks = {}, ratings = [], byRace = {}, wins = [];
  for (let i = 0; i < N; i++) {
    const L = legend(lk + i, lk), c = FW.compute(L);
    ranks[c.rank] = (ranks[c.rank] || 0) + 1; ratings.push(c.baseRating);
    const r = L.raceName(); (byRace[r] = byRace[r] || []).push(c.baseRating);
    // one arena fight against the weighted opponent pool of a random universe
    const rng = FW.makeRng(lk + i + ':arena'), uni = FW.UNIVERSES[Math.floor(rng() * FW.UNIVERSES.length)];
    const opps = FW.oppEntries(uni, L), opp = opps[FW.weightedIndex(opps, rng)];
    wins.push(FW.matchup(L, opp, FW.pickArena(rng)).pWin);
  }
  const races = Object.keys(byRace).map(r => ({ r, n: byRace[r].length, avg: byRace[r].reduce((a, b) => a + b, 0) / byRace[r].length })).sort((a, b) => b.avg - a.avg);
  const sagas = { ends: {}, ch: [], firstDeath: 0 };
  for (let i = 0; i < NS; i++) {
    const L = legend('saga-' + lk + i, lk), rng = FW.makeRng('saga-' + lk + i + ':story');
    const opts = {}; S.OPTIONS.forEach(o => opts[o.id] = o.def !== false);
    S.newSaga(L, opts, rng);
    const io = { rng, spin: async cfg => FW.weightedIndex(cfg.entries, rng) };
    // playTurn is async: run synchronously enough by awaiting in a loop below
    sagas.pending = (sagas.pending || []); sagas.pending.push((async () => { let t = 0; while (!L.saga.end && t < 400) { await S.playTurn(L, io, opts); t++; } sagas.ends[L.saga.end] = (sagas.ends[L.saga.end] || 0) + 1; sagas.ch.push(L.saga.ch); if (L.saga.end === 'dead' && L.saga.ch <= 1) sagas.firstDeath++; })());
  }
  report.luck[lk] = { ranks, ratings, races, wins, sagas };
}

(async () => {
  for (const lk of Object.keys(report.luck)) {
    const R = report.luck[lk]; await Promise.all(R.sagas.pending);
    console.log('\n=== Luck: ' + lk + ' (' + N + ' legends, ' + NS + ' sagas) ===');
    console.log('Rating  p10 ' + quant(R.ratings, .1).toFixed(1) + '  median ' + quant(R.ratings, .5).toFixed(1) + '  p90 ' + quant(R.ratings, .9).toFixed(1) + '  max ' + Math.max(...R.ratings).toFixed(1));
    console.log('Ranks   ' + FW.RANKS.map(r => r[1] + ' ' + pct(R.ranks[r[1]] || 0, N)).join(' · '));
    const w = R.wins; console.log('Arena   average win chance ' + pct(w.reduce((a, b) => a + b, 0), w.length) + '  (' + pct(w.filter(x => x >= 0.9).length, w.length) + ' of fights at 90%+, ' + pct(w.filter(x => x <= 0.1).length, w.length) + ' at 10% or less)');
    console.log('Races   strongest: ' + R.races.slice(0, 4).map(x => x.r + ' ' + x.avg.toFixed(0) + ' (n' + x.n + ')').join(', ') + '   weakest: ' + R.races.slice(-4).map(x => x.r + ' ' + x.avg.toFixed(0) + ' (n' + x.n + ')').join(', '));
    const n = R.sagas.ch.length;
    console.log('Sagas   ' + Object.keys(R.sagas.ends).sort().map(k => k + ' ' + pct(R.sagas.ends[k], n)).join(' · ') + '   chapters median ' + quant(R.sagas.ch, .5) + ', p90 ' + quant(R.sagas.ch, .9) + ', max ' + Math.max(...R.sagas.ch) + '   died in chapter 1: ' + pct(R.sagas.firstDeath, n));
  }
})();
