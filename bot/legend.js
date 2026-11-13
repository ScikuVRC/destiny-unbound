// Rolls a legend with the game's own wheels and odds (app/js), for the Discord bot.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const path = require('path');
globalThis.window = globalThis;
['data.js', 'data-more.js', 'data-extra.js', 'engine.js'].forEach(f => require(path.join(__dirname, '..', 'app', 'js', f)));
const FW = globalThis.FW;

const LUCKS = FW.LUCK.map(l => ({ id: l.id, name: l.name }));

/* Every wheel spun with honest odds, the way Auto-spin does in the game. */
function roll(luck, seed) {
  const id = LUCKS.some(l => l.id === luck) ? luck : 'heroic';
  seed = seed || 'discord-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const L = new FW.Legend({ luck: id, seed }), rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  const c = FW.compute(L);
  const lines = FW.cardLines(L, c).map(l => ({ k: l.k, v: l.v }));
  let code = '';
  try { code = typeof L.toCode === 'function' ? L.toCode() : (FW.legendCode ? FW.legendCode(L) : ''); } catch (e) { code = ''; }
  return { luck: FW.LUCK.find(l => l.id === id).name, title: L.displayName(), race: L.raceName(), rank: c.rank, rating: Math.round((c.rating || c.baseRating || 0) * 10) / 10, lines, code };
}

module.exports = { roll, LUCKS };
