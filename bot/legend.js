// Heroes for the Discord bot, made with the game's own code (app/js): /spin rolls one with the game's wheels and odds,
// /legend reads one from a Legend Code, /versus lets two fight with the game's Versus odds.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const path = require('path');
globalThis.window = globalThis;
['data.js', 'engine.js', 'names.js', 'story.js'].forEach(f => require(path.join(__dirname, '..', 'app', 'js', f)));
const FW = globalThis.FW;

const LUCKS = FW.LUCK.map(l => ({ id: l.id, name: l.name }));
const randomSeed = prefix => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

/* Every wheel spun with honest odds, the way Auto-spin does in the game. */
function spinLegend(luck, seed) {
  const id = LUCKS.some(l => l.id === luck) ? luck : 'heroic';
  seed = seed || randomSeed('discord');
  const L = new FW.Legend({ luck: id, seed }),
    rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}

/* What a card shows, as plain data (embeds.js turns it into a Discord card). */
function describe(L) {
  const c = FW.compute(L),
    S = FW.Story;
  const lines = FW.cardLines(L, c).map(l => ({ k: l.k, v: l.v }));
  const s = L.saga;
  return {
    luck: (FW.LUCK.find(l => l.id === L.luck) || FW.LUCK[0]).name,
    title: L.displayName(),
    race: L.raceName(),
    rank: c.rank,
    rating: Math.round((c.rating || c.baseRating || 0) * 10) / 10,
    lines,
    saga: s && s.ch ? S.summary(L) : '',
    epilogue: s && s.end && S.epilogue ? S.epilogue(L).join(' ') : '',
  };
}

function roll(luck, seed) {
  return describe(spinLegend(luck, seed));
}

/* A Legend Code (FW1....) or the short card code it was saved under (DU-XXXXXX), as the game shares them. */
const SHORT = /^DU-?[A-Z0-9]{4,12}$/i;
function isShortCode(text) {
  return SHORT.test(String(text || '').trim());
}
// fetchCode(id) gets the full code for a short one from the world counter (worker/src/cards.js)
async function readLegend(text, fetchCode) {
  let code = String(text || '').trim();
  if (isShortCode(code)) {
    if (!fetchCode) throw new Error('Short card codes need the world counter, which is not set up for this bot.');
    code = await fetchCode(code.toUpperCase().replace(/^DU-?/, 'DU-'));
  }
  return FW.Legend.fromCode(code); // throws 'Not a Legend Code' or 'Corrupt Legend Code'
}

/* Versus: the arena is spun with the game's weights, then the fight with the game's odds. */
function versus(A, B, seed) {
  const rng = FW.makeRng(seed || randomSeed('versus'));
  const arena = FW.ARENAS[FW.weightedIndex(FW.ARENAS, rng)];
  const o = FW.versusOdds(A, B, arena);
  const r = rng(),
    winner = r < o.pA ? 'a' : r < o.pA + o.pDraw ? 'draw' : 'b';
  return { arena: arena.name, pA: o.pA, pDraw: o.pDraw, pB: o.pB, winner };
}

module.exports = { roll, LUCKS, spinLegend, describe, readLegend, isShortCode, versus, FW };
