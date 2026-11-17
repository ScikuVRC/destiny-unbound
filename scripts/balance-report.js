// Balance report: plays thousands of legends, arena fights and sagas with honest odds and prints how the numbers
// come out per luck level. Run: node scripts/balance-report.js [legendsPerLuck] [sagasPerLuck] [--check]
// --check (run in CI): also compares the numbers with the target ranges below and fails when one is outside.
// The seeds are fixed, so the same code always gives the same numbers; a failure means a change moved the balance.
// SPDX-License-Identifier: GPL-3.0-or-later
['data.js', 'engine.js', 'story.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW,
  S = FW.Story;
const ARGS = process.argv.slice(2).filter(a => !a.startsWith('--')),
  CHECK = process.argv.includes('--check');
const N = +ARGS[0] || 3000,
  NS = +ARGS[1] || 600;

// Target ranges, in percent unless named otherwise. Rare endings stay rare on purpose (docs/improvement-list.md 89).
const TARGETS = {
  arena: { mortal: [40, 55], heroic: [52, 68], mythic: [65, 82], divine: [78, 92] }, // average arena win chance
  all: {
    retired: [30, 50],
    legend: [8, 25],
    death: [28, 48], // sagas ending in any death
    firstDeath: [0, 5], // died in chapter 1
    chaptersMedian: [8, 20], // chapters, not percent
    good: [52, 72], // share of good events
    raceSpread: [0, 16], // rating points between the strongest and weakest race (races with 15+ legends)
  },
  rare: { ascended: 6, damned: 4, fulfilled: 6, lost: 6, sealed: 5, undying: 3, martyr: 8 }, // at most
};

function legend(seed, luck) {
  const L = new FW.Legend({ luck, seed }),
    rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}
const pct = (a, n) => ((100 * a) / n).toFixed(1) + '%';
const quant = (arr, q) => {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(q * (s.length - 1))];
};
const report = { luck: {} };

for (const lk of FW.LUCK.map(l => l.id)) {
  const ranks = {},
    ratings = [],
    byRace = {},
    wins = [];
  for (let i = 0; i < N; i++) {
    const L = legend(lk + i, lk),
      c = FW.compute(L);
    ranks[c.rank] = (ranks[c.rank] || 0) + 1;
    ratings.push(c.baseRating);
    const r = L.raceName();
    (byRace[r] = byRace[r] || []).push(c.baseRating);
    // one arena fight against the weighted opponent pool of a random universe
    const rng = FW.makeRng(lk + i + ':arena'),
      uni = FW.UNIVERSES[Math.floor(rng() * FW.UNIVERSES.length)];
    const opps = FW.oppEntries(uni, L),
      opp = opps[FW.weightedIndex(opps, rng)];
    wins.push(FW.matchup(L, opp, FW.pickArena(rng)).pWin);
  }
  const races = Object.keys(byRace)
    .map(r => ({ r, n: byRace[r].length, avg: byRace[r].reduce((a, b) => a + b, 0) / byRace[r].length }))
    .sort((a, b) => b.avg - a.avg);
  const sagas = { ends: {}, ch: [], firstDeath: 0, battles: [], good: 0, bad: 0 };
  for (let i = 0; i < NS; i++) {
    const L = legend('saga-' + lk + i, lk),
      rng = FW.makeRng('saga-' + lk + i + ':story');
    const opts = {};
    S.OPTIONS.forEach(o => (opts[o.id] = o.def !== false));
    S.newSaga(L, opts, rng);
    const io = {
      rng,
      spin: async cfg => {
        if (cfg.kind === 'battle') sagas.battles.push(cfg.report.pWin);
        return FW.weightedIndex(cfg.entries, rng);
      },
    };
    // playTurn is async: run synchronously enough by awaiting in a loop below
    sagas.pending = sagas.pending || [];
    sagas.pending.push(
      (async () => {
        let t = 0;
        while (!L.saga.end && t < 400) {
          await S.playTurn(L, io, opts);
          t++;
        }
        sagas.ends[L.saga.end] = (sagas.ends[L.saga.end] || 0) + 1;
        sagas.ch.push(L.saga.ch);
        L.saga.log.forEach(x => {
          if (x.tone === 'good') sagas.good++;
          else if (x.tone === 'bad') sagas.bad++;
        });
        if (L.saga.end === 'dead' && L.saga.ch <= 1) sagas.firstDeath++;
      })()
    );
  }
  report.luck[lk] = { ranks, ratings, races, wins, sagas };
}

const problems = [];
const within = (what, v, [lo, hi]) => {
  if (!(v >= lo && v <= hi)) problems.push(what + ' is ' + v.toFixed(1) + ', outside ' + lo + '-' + hi);
};
function checkLuck(lk, R) {
  const n = R.sagas.ch.length,
    p = k => (100 * (R.sagas.ends[k] || 0)) / n;
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  within(lk + ' arena win chance', 100 * avg(R.wins), TARGETS.arena[lk]);
  const A = TARGETS.all;
  within(lk + ' retired', p('retired'), A.retired);
  within(lk + ' legend', p('legend'), A.legend);
  const died = Object.keys(R.sagas.ends)
    .filter(k => S.MORTAL[k])
    .reduce((t, k) => t + p(k), 0);
  within(lk + ' sagas ending in a death', died, A.death);
  within(lk + ' died in chapter 1', (100 * R.sagas.firstDeath) / n, A.firstDeath);
  within(lk + ' median chapters', quant(R.sagas.ch, 0.5), A.chaptersMedian);
  within(lk + ' good events', (100 * R.sagas.good) / (R.sagas.good + R.sagas.bad), A.good);
  const big = R.races.filter(x => x.n >= 15);
  if (big.length > 1) within(lk + ' race spread', big[0].avg - big[big.length - 1].avg, A.raceSpread);
  for (const [k, max] of Object.entries(TARGETS.rare)) within(lk + ' ' + k, p(k), [0, max]);
}

(async () => {
  let lastMedian = -1;
  for (const lk of Object.keys(report.luck)) {
    const R = report.luck[lk];
    await Promise.all(R.sagas.pending);
    console.log('\n=== Luck: ' + lk + ' (' + N + ' legends, ' + NS + ' sagas) ===');
    console.log(
      'Rating  p10 ' +
        quant(R.ratings, 0.1).toFixed(1) +
        '  median ' +
        quant(R.ratings, 0.5).toFixed(1) +
        '  p90 ' +
        quant(R.ratings, 0.9).toFixed(1) +
        '  max ' +
        Math.max(...R.ratings).toFixed(1)
    );
    console.log('Ranks   ' + FW.RANKS.map(r => r[1] + ' ' + pct(R.ranks[r[1]] || 0, N)).join(' · '));
    const w = R.wins;
    console.log(
      'Arena   average win chance ' +
        pct(
          w.reduce((a, b) => a + b, 0),
          w.length
        ) +
        '  (' +
        pct(w.filter(x => x >= 0.9).length, w.length) +
        ' of fights at 90%+, ' +
        pct(w.filter(x => x <= 0.1).length, w.length) +
        ' at 10% or less)'
    );
    console.log(
      'Races   strongest: ' +
        R.races
          .slice(0, 4)
          .map(x => x.r + ' ' + x.avg.toFixed(0) + ' (n' + x.n + ')')
          .join(', ') +
        '   weakest: ' +
        R.races
          .slice(-4)
          .map(x => x.r + ' ' + x.avg.toFixed(0) + ' (n' + x.n + ')')
          .join(', ')
    );
    const n = R.sagas.ch.length;
    console.log(
      'Sagas   ' +
        Object.keys(R.sagas.ends)
          .sort()
          .map(k => k + ' ' + pct(R.sagas.ends[k], n))
          .join(' · ') +
        '   chapters median ' +
        quant(R.sagas.ch, 0.5) +
        ', p90 ' +
        quant(R.sagas.ch, 0.9) +
        ', max ' +
        Math.max(...R.sagas.ch) +
        '   died in chapter 1: ' +
        pct(R.sagas.firstDeath, n)
    );
    const b = R.sagas.battles,
      died = Object.keys(R.sagas.ends)
        .filter(k => S.MORTAL[k])
        .reduce((t, k) => t + R.sagas.ends[k], 0);
    console.log(
      'Story   battles: average win chance ' +
        pct(
          b.reduce((a, x) => a + x, 0),
          b.length
        ) +
        ' (' +
        pct(b.filter(x => x <= 0.25).length, b.length) +
        ' at 25% or less)   events good ' +
        pct(R.sagas.good, R.sagas.good + R.sagas.bad) +
        ' / bad ' +
        pct(R.sagas.bad, R.sagas.good + R.sagas.bad) +
        '   sagas ending in a death ' +
        pct(died, n)
    );
    if (CHECK) {
      checkLuck(lk, R);
      const med = quant(R.ratings, 0.5);
      if (med <= lastMedian) problems.push(lk + ' median rating ' + med.toFixed(1) + ' is not above the luck below it');
      lastMedian = med;
    }
  }
  if (!CHECK) return;
  if (problems.length) {
    console.error('\nBalance check failed (' + problems.length + '):\n  ' + problems.join('\n  '));
    console.error('If the change was meant to move the balance, update TARGETS in scripts/balance-report.js.');
    process.exit(1);
  }
  console.log('\nBalance check: every number is inside its target range.');
})();
