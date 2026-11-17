// Achievement report: plays many legends and sagas with honest odds and counts how often each achievement would
// unlock, checking after every chapter. When a saga ends with an heir, it plays on as the heir (up to three
// generations), the way a player who keeps a house going would. An achievement at 0% may be impossible to earn.
// Achievements the simulation cannot reach (daily challenges on different days) are marked "not simulated".
// Run: node scripts/achievement-report.js [sagasPerLuck]
// SPDX-License-Identifier: GPL-3.0-or-later
globalThis.window = globalThis;
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => {
    mem[k] = String(v);
  },
  removeItem: k => {
    delete mem[k];
  },
};
['data.js', 'engine.js', 'story.js', 'achievements.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW,
  S = FW.Story;
const NS = +process.argv[2] || 400;

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
const hits = {},
  total = { n: 0 };
const test = (L, seen) =>
  FW.ACHIEVEMENTS.forEach(a => {
    if (seen.has(a.id)) return;
    let ok = false;
    try {
      ok = a.test(L);
    } catch (e) {
      ok = false;
    }
    if (ok) seen.add(a.id);
  });

(async () => {
  for (const lk of FW.LUCK.map(l => l.id)) {
    for (let i = 0; i < NS; i++) {
      const L = legend('ach-' + lk + i, lk),
        rng = FW.makeRng('ach-' + lk + i + ':story'),
        seen = new Set();
      if (i % 7 === 0) L.daily = '2026-11-13'; // some runs count as daily challenges
      test(L, seen);
      // a few arena fights, the way the game plays them
      const frng = FW.makeRng('ach-' + lk + i + ':arena');
      for (let f = 0; f < 6; f++) {
        const uni = FW.UNIVERSES[Math.floor(frng() * FW.UNIVERSES.length)],
          opps = FW.oppEntries(uni, L),
          opp = uni.opps[FW.weightedIndex(opps, frng)];
        const arena = FW.pickArena(frng),
          rep = FW.matchup(L, opp, arena),
          ctx = { arena: arena.name, uni: uni.name, p: rep.pWin };
        const r = frng(),
          res = r < rep.pWin ? 'win' : r < rep.pWin + rep.pDraw ? 'draw' : 'lose';
        if (res === 'draw') FW.applyConsequence(L, 'draw', 'draw', opp, frng, ctx);
        else if (res === 'win') {
          const oe = FW.outcomeEntries(L);
          FW.applyConsequence(L, 'win', oe[FW.weightedIndex(oe, frng)].key, opp, frng, ctx);
        } else {
          const de = FW.defeatEntries(L);
          FW.applyConsequence(L, 'lose', de[FW.weightedIndex(de, frng)].key, opp, frng, ctx);
        }
        test(L, seen);
      }
      const opts = {};
      S.OPTIONS.forEach(o => (opts[o.id] = o.def !== false));
      S.newSaga(L, opts, rng);
      const io = { rng, spin: async cfg => FW.weightedIndex(cfg.entries, rng) };
      let cur = L;
      for (let gen = 1; gen <= 3; gen++) {
        for (let t = 0; !cur.saga.end && t < 400; t++) {
          await S.playTurn(cur, io, opts);
          test(cur, seen);
        }
        test(cur, seen);
        if (!S.canContinue(cur, opts)) break;
        // the heir: a new hero spun with the same odds, then started with what the parent passes on
        const inh = S.inheritance(cur),
          child = legend('ach-' + lk + i + ':heir' + gen, lk);
        S.startHeir(child, inh, opts, rng);
        cur = child;
        test(cur, seen);
      }
      seen.forEach(id => {
        hits[id] = (hits[id] || 0) + 1;
      });
      total.n++;
    }
  }
  console.log('Achievements over ' + total.n + ' legends with sagas (all luck levels):');
  const NOT_SIMULATED = { daily3: 1 };
  FW.ACHIEVEMENTS.forEach(a =>
    console.log(
      '  ' +
        (NOT_SIMULATED[a.id] ? '-- ' : hits[a.id] ? '' : '!! ') +
        a.name.padEnd(24) +
        (((100 * (hits[a.id] || 0)) / total.n).toFixed(2) + '%').padStart(8) +
        '   ' +
        a.desc +
        (NOT_SIMULATED[a.id] ? '  (not simulated)' : '')
    )
  );
})();
