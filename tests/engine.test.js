// node tests/engine.test.js
const assert = require('assert');
require('../app/js/data.js');
require('../app/js/engine.js');
const FW = globalThis.FW;
let passed = 0;
const t = (name, fn) => {
  try {
    fn();
    passed++;
    console.log('  ok   ' + name);
  } catch (e) {
    console.log('  FAIL ' + name + '\n       ' + e.stack.split('\n').slice(0, 3).join('\n       '));
    process.exitCode = 1;
  }
};

t('every data row parses (no bad DSL) and has a positive weight', () => {
  const lists = {
    RACES: FW.RACES,
    BIRTH: FW.BIRTH,
    AGES: FW.AGES,
    BACKGROUNDS: FW.BACKGROUNDS,
    PERSONALITIES: FW.PERSONALITIES,
    WEAPONS: FW.WEAPONS,
    ENHANCEMENTS: FW.ENHANCEMENTS,
    POWERS: FW.POWERS,
    WEAKNESSES: FW.WEAKNESSES,
    TITLES: FW.TITLES,
    MARKS: FW.MARKS,
  };
  Object.entries(FW.SUBS).forEach(([k, s]) => (lists['SUB ' + k] = s.rows));
  FW.UNIVERSES.forEach(u => (lists['UNI ' + u.name] = u.opps));
  FW.HEIGHT_CLASSES.forEach(h => FW.parse(h.dsl));
  Object.entries(lists).forEach(([n, rows]) => {
    assert(rows.length > 0, n + ' empty');
    const names = new Set();
    rows.forEach(r => {
      assert(r.name, n + ' unnamed row');
      assert(r.w > 0, n + ' bad weight ' + r.name);
      FW.parse(r.dsl);
      assert(!names.has(r.name), n + ' duplicate ' + r.name);
      names.add(r.name);
    });
  });
  FW.UNIVERSES.forEach(u => u.opps.forEach(o => assert(FW.P(o).lv > 0, 'opp lv ' + o.name)));
  FW.WEAPONS.forEach(w => assert(FW.P(w).none || FW.P(w).q >= 1, 'weapon q ' + w.name));
  FW.POWERS.forEach(p => assert(FW.P(p).none || FW.P(p).rar >= 1, 'power rar ' + p.name));
  FW.TITLES.forEach(p => assert(FW.P(p).tt >= 1, 'title tt ' + p.name));
  Object.keys(FW.SUBS).forEach(r => assert(FW.findByName(FW.RACES, r), 'sub for unknown race ' + r));
  Object.keys(FW.AFFINITY).forEach(r => {
    assert(FW.findByName(FW.RACES, r), 'affinity race ' + r);
    FW.AFFINITY[r].forEach(w => assert(FW.findByName(FW.WEAPONS, w), 'affinity weapon ' + w));
  });
  FW.NATURAL_WEAPONS.forEach(r => assert(FW.findByName(FW.RACES, r), 'natural weapon race ' + r));
});

t('bad DSL throws', () => {
  assert.throws(() => FW.parse('str+x'));
  assert.throws(() => FW.parse('foo:all+1'));
  assert.throws(() => FW.parse('banana'));
});

t('DSL values', () => {
  const p = FW.parse('spd+2 int+1 fgt+1 dark:all+2 sun:all-1 w=holy,fire r=poison a=shadow fate+1 hs=0.78 life=l');
  assert.strictEqual(p.mods.spd, 2);
  assert.strictEqual(p.mods.int, 1);
  assert.strictEqual(p.mods.str, undefined);
  assert.deepStrictEqual(p.conds[0], { env: 'dark', mods: { str: 2, spd: 2, dur: 2, int: 2, fgt: 2 } });
  assert.deepStrictEqual(p.weak, ['holy', 'fire']);
  assert.strictEqual(p.fate, 1);
  assert.strictEqual(p.hs, 0.78);
  assert.strictEqual(p.life, 'l');
});

t('tier shift moves whole tiers (Sub-relativistic +2 = Relativistic, +5 = FTL)', () => {
  const i = FW.LADDERS.spd.names.indexOf('Sub-relativistic');
  assert.strictEqual(FW.applyTier('spd', i, 2).name, 'Relativistic');
  assert.strictEqual(FW.applyTier('spd', i, 5).name, 'FTL');
  assert.strictEqual(FW.applyTier('spd', i, 2).over, 0);
});

t('overflow shows as +N like "omniscient +1"', () => {
  const n = FW.LADDERS.int.names;
  const r = FW.applyTier('int', n.length - 2, 3);
  assert.strictEqual(r.name, 'Beyond knowing');
  assert.strictEqual(r.over, 2);
  const lo = FW.applyTier('str', 0, -3);
  assert.strictEqual(lo.idx, 0);
  assert.strictEqual(lo.under, 3);
});

t('ladder tier lists match research (spot checks)', () => {
  assert.strictEqual(FW.LADDERS.str.names[FW.LADDERS.str.pk], 'Peak human');
  assert(FW.LADDERS.str.names.includes('Godly') && FW.LADDERS.int.names.includes('Omniscient'));
  // longer ladders: every old tier is still there, in the same order, and each ladder grew
  Object.keys(FW.LADDER_V1).forEach(k => {
    const now = FW.LADDERS[k].names;
    let last = -1;
    assert(now.length >= FW.LADDER_V1[k].length + 8, k + ' only has ' + now.length);
    assert.strictEqual(new Set(now).size, now.length, k + ' has duplicate tiers');
    FW.LADDER_V1[k].forEach(n => {
      const i = now.indexOf(n);
      assert(i > last, k + ': ' + n);
      last = i;
    });
  });
  assert(FW.LADDERS.spd.names.includes('Massively hypersonic+'));
  assert(FW.LADDERS.int.names.includes('Battle genius'));
  assert(FW.LADDERS.wpn.names.includes('Eternal') && FW.LADDERS.fgt.names.includes('Well-trained'));
  assert(FW.RACES.length >= 36);
  assert(FW.POWERS.length >= 85);
  assert(FW.BIRTH.length >= 26);
});

function fullLegend(seed, luck, ctx) {
  const rng = FW.makeRng(seed);
  const L = new FW.Legend({ luck, seed });
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const id = FW.STAGES[i].id;
    const st = FW.buildStage(id, L, ctx);
    assert(st.entries.length > 0, 'no entries ' + id);
    st.entries.forEach(e => assert(e.w > 0 && isFinite(e.w), 'bad weight ' + id + ' ' + e.name));
    const idx = FW.weightedIndex(st.entries, rng);
    FW.commitPick(L, st, idx, rng);
  }
  return L;
}

t('a full run completes for every luck level and produces a valid card', () => {
  FW.LUCK.forEach(l => {
    for (let s = 0; s < 300; s++) {
      const L = fullLegend('t' + s, l.id);
      FW.validateLegend(L);
      const c = FW.compute(L);
      assert(isFinite(c.rating), 'rating');
      assert(c.rating >= 0);
      FW.cardLines(L, c).forEach(x =>
        assert(x.v !== undefined && x.v !== 'undefined' && x.v !== '', 'blank card value ' + x.k)
      );
      FW.legendText(L);
    }
  });
});

t('luck levels raise ratings monotonically (balance check)', () => {
  const avg = {};
  FW.LUCK.forEach(l => {
    let s = 0,
      n = 3000;
    for (let i = 0; i < n; i++) s += FW.compute(fullLegend('b' + i, l.id)).rating;
    avg[l.id] = s / n;
  });
  console.log('       avg rating  ' + FW.LUCK.map(l => l.name + ' ' + avg[l.id].toFixed(1)).join('  |  '));
  assert(avg.mortal < avg.heroic && avg.heroic < avg.mythic && avg.mythic < avg.divine, 'not monotonic');
  assert(avg.mortal > 20 && avg.mortal < 50, 'mortal avg out of range ' + avg.mortal);
  assert(avg.divine < 100, 'divine too high');
});

t('weighted pick follows slice sizes', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  const st = FW.buildStage('race', L);
  const rng = FW.makeRng('dist');
  const cnt = {};
  const N = 40000;
  for (let i = 0; i < N; i++) {
    const e = st.entries[FW.weightedIndex(st.entries, rng)];
    cnt[e.name] = (cnt[e.name] || 0) + 1;
  }
  const tot = st.entries.reduce((a, e) => a + e.w, 0);
  const human = st.entries.find(e => e.name === 'Human'),
    god = st.entries.find(e => e.name === 'God');
  assert(Math.abs(cnt.Human / N - human.w / tot) < 0.01, 'human freq');
  assert((cnt.God || 0) / N < 0.005, 'God must be rare');
  assert(human.w > god.w * 20, 'Human must stay far more common than God');
});

t('race bonus is applied to the rolled tier (Shadowborn +2 speed)', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  L.picks.race = { name: 'Shadowborn' };
  assert.strictEqual(L.bonusFor('spd'), 2);
  assert.strictEqual(L.bonusFor('int'), 1);
  assert.strictEqual(L.bonusFor('fgt'), 1);
  assert.strictEqual(L.bonusFor('str'), 0);
});

t('sub-wheel perks (Archangel +1 all)', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  L.picks.race = { name: 'Angel' };
  L.picks.sub = { name: 'Archangel' };
  assert(L.stageApplies('sub'));
  assert.strictEqual(L.bonusFor('str'), 1); // archangel all+1
  assert.strictEqual(L.bonusFor('pwr'), 2); // angel pwr+1 + archangel pwr+1
  assert.strictEqual(L.bonusFor('int'), 2); // angel int+1 + archangel all+1
});

t('conditional stages: mastery only with weapon / power', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  L.picks.wpn = { name: 'No weapon' };
  L.picks.pow = { name: 'No powers' };
  assert(!L.stageApplies('wpnm'));
  assert(!L.stageApplies('powm'));
  L.picks.wpn = { name: 'Claymore' };
  L.picks.pow = { name: 'Plant Manipulation' };
  assert(L.stageApplies('wpnm'));
  assert(L.stageApplies('powm'));
  L.picks.race = { name: 'Goblin' };
  assert(!L.stageApplies('sub'));
});

t('height scales with race and classes follow size', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  L.picks.race = { name: 'Fairy' };
  const small = FW.buildStage('height', L);
  assert(
    small.entries.every(e => e.inches < 40),
    'fairy heights'
  );
  L.picks.race = { name: 'Leviathan' };
  const big = FW.buildStage('height', L);
  assert(big.entries.every(e => e.inches >= 900));
  assert.strictEqual(FW.heightClass(70).name, 'Average');
  assert.strictEqual(FW.heightClass(20).name, 'Tiny');
  assert.strictEqual(FW.heightClass(100000).name, 'Titanic');
  assert.strictEqual(FW.fmtHeight(79), '6\'7"');
  assert.strictEqual(FW.fmtHeight(28), '2\'4"');
  assert.strictEqual(FW.fmtHeight(105), '8\'9"');
  assert.strictEqual(FW.fmtHeight(6), '6 in');
  assert.strictEqual(FW.fmtHeight(71.6), '6\'0"');
});

t('age wheel respects lifespan', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  const names = r => {
    L.picks.race = { name: r };
    return FW.buildStage('age', L).entries.map(e => e.name);
  };
  const human = names('Human'),
    dwarf = names('Dwarf'),
    elf = names('Elf'),
    god = names('God');
  assert.strictEqual(human.length, 9);
  assert.ok(human.indexOf('Centuries old') < 0 && human.indexOf('Teen (13-17)') >= 0);
  assert.ok(dwarf.length > human.length && dwarf.indexOf('Centuries old') >= 0 && dwarf.indexOf('Millennia old') < 0);
  assert.ok(elf.length > dwarf.length && elf.indexOf('Millennia old') >= 0 && elf.indexOf('Older than Earth') < 0);
  assert.strictEqual(god.length, FW.AGES.length);
  assert.ok(god.length >= 20);
  // every numbered age range sits inside its name's numbers and runs youngest to oldest
  let last = 0;
  FW.AGES.forEach((a, i) => {
    const r = FW.AGE_RANGES[i];
    if (!r) return;
    assert.ok(r[0] <= r[1] && r[0] >= last, a.name);
    last = r[1];
  });
});

t('content pack 2: every wheel grew, names are unique, old age names still load', () => {
  const min = {
    RACES: 95,
    BIRTH: 60,
    AGES: 20,
    HEIGHTS: 35,
    BACKGROUNDS: 55,
    PERSONALITIES: 50,
    WEAPONS: 80,
    ENHANCEMENTS: 50,
    POWERS: 170,
    WEAKNESSES: 60,
    TITLES: 90,
    MARKS: 30,
    ARENAS: 30,
    UNIVERSES: 13,
    OUTCOMES: 12,
    DEFEATS: 10,
    CLASSES: 40,
    ELEMENTS: 24,
    PETS: 35,
    HAIR: 35,
    EYES: 25,
    GARB: 35,
  };
  Object.keys(min).forEach(k => assert.ok(FW[k].length >= min[k], k + ' has ' + FW[k].length));
  Object.keys(min)
    .filter(k => k !== 'HEIGHTS')
    .forEach(k => {
      const seen = {};
      FW[k].forEach(e => {
        assert.ok(!seen[e.name || e.key], k + ' duplicate: ' + (e.name || e.key));
        seen[e.name || e.key] = 1;
        if (e.dsl != null) FW.parse(e.dsl);
      });
    });
  Object.keys(FW.SUBS).forEach(r => {
    assert.ok(
      FW.RACES.some(x => x.name === r),
      'sub-wheel for unknown race ' + r
    );
    FW.SUBS[r].rows.forEach(e => FW.parse(e.dsl));
  });
  FW.RACES.forEach(r => assert.ok(FW.RACE_ART[r.name], 'no art description for ' + r.name));
  FW.UNIVERSES.forEach(u => u.opps.forEach(o => assert.ok(FW.P(o).lv, o.name)));
  FW.ARENAS.forEach(a => a.tags.forEach(t => assert.ok(FW.ENVS.indexOf(t) >= 0, a.name + ' tag ' + t)));
  Object.keys(FW.AFFINITY).forEach(r =>
    FW.AFFINITY[r].forEach(w =>
      assert.ok(
        FW.WEAPONS.some(x => x.name === w),
        r + ' affinity ' + w
      )
    )
  );
  // a Legend saved with the old age names still loads
  const L = new FW.Legend({ luck: 'mortal' });
  L.picks.age = { name: 'Senior (61-100)', years: 70 };
  assert.strictEqual(L.entry('age').name, 'Elder (61-75)');
});

t('new fight outcomes and defeats apply their rewards', () => {
  const leg = new FW.Legend({ luck: 'mortal' });
  const opp = FW.UNIVERSES[0].opps[0];
  FW.applyConsequence(leg, 'win', 'trophy', opp, Math.random, {});
  FW.applyConsequence(leg, 'lose', 'vow', opp, Math.random, {});
  assert.strictEqual(leg.chron.length, 2);
  assert.strictEqual(leg.chron[0].dsl, 'rt+1 wpn+1');
  assert.strictEqual(leg.chron[1].dsl, 'fgt+1');
  assert.strictEqual(leg.ally.length, 0);
});

t('Legend Code round-trips', () => {
  const L = fullLegend('code', 'mythic');
  L.chron.push({ label: 'x', dsl: 'rt+1', text: 'y' });
  const code = L.toCode();
  const L2 = FW.Legend.fromCode(code);
  assert.strictEqual(FW.legendText(L2), FW.legendText(L));
  assert.strictEqual(JSON.stringify(FW.compute(L2).stats), JSON.stringify(FW.compute(L).stats));
  assert.throws(() => FW.Legend.fromCode('nonsense'));
  assert.throws(() => FW.Legend.fromCode('FW1.' + Buffer.from('{"v":1,"p":{}}').toString('base64')));
});

t('Legend Codes from before the longer ladders keep the same tier names', () => {
  const L = fullLegend('oldcode', 'heroic');
  // write the code the old way: tier numbers from the old lists, no ladder version
  const ids = { str: 'str', spd: 'spd', dur: 'dur', int: 'int', fgt: 'fgt', wpn: 'wpnm', pwr: 'powm' },
    want = {};
  const picks = JSON.parse(JSON.stringify(L.picks));
  Object.keys(ids).forEach(k => {
    const p = picks[ids[k]];
    if (!p) return;
    const i = Math.min(p.idx, FW.LADDER_V1[k].length - 1);
    p.idx = i;
    want[k] = FW.LADDER_V1[k][i];
  });
  const old =
    'FW1.' +
    Buffer.from(JSON.stringify({ v: 1, l: L.luck, p: picks, c: [], a: [], s: L.seed }))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  const L2 = FW.Legend.fromCode(old);
  Object.keys(want).forEach(k => assert.strictEqual(FW.LADDERS[k].names[L2.picks[ids[k]].idx], want[k], k));
  // and a new code is not remapped a second time
  const L3 = FW.Legend.fromCode(L2.toCode());
  Object.keys(want).forEach(k => assert.strictEqual(L3.picks[ids[k]].idx, L2.picks[ids[k]].idx, k));
});

t('seeded runs are reproducible', () => {
  assert.strictEqual(FW.legendText(fullLegend('same', 'heroic')), FW.legendText(fullLegend('same', 'heroic')));
  assert.notStrictEqual(FW.legendText(fullLegend('a', 'heroic')), FW.legendText(fullLegend('b', 'heroic')));
});

t('weapon synergies: affinity, natural weapons, resonance', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  L.picks.race = { name: 'Dwarf' };
  L.picks.wpn = { name: 'Axe' };
  assert(L.sources().some(s => /affinity/.test(s.label)));
  L.picks.race = { name: 'Orc' };
  L.picks.wpn = { name: 'No weapon' };
  assert(L.sources().some(s => /Natural weapons/.test(s.label)));
  L.picks.race = { name: 'Human' };
  L.picks.wpn = { name: 'Holy Lance' };
  L.picks.pow = { name: 'Light Manipulation' };
  assert(L.sources().some(s => /Resonance/.test(s.label)));
});

t('matchup: stronger hero wins more, weakness and arena change odds', () => {
  const mk = (race, str) => {
    const L = fullLegend('m1', 'heroic');
    return L;
  };
  const L = fullLegend('m2', 'heroic');
  const weak = FW.UNIVERSES[0].opps[0],
    strong = FW.UNIVERSES[0].opps[7];
  const a = FW.matchup(L, weak, null),
    b = FW.matchup(L, strong, null);
  assert(a.pWin > b.pWin, 'weaker opp should be easier');
  assert(Math.abs(a.pWin + a.pLose + a.pDraw - 1) < 1e-9);
  assert(a.pWin <= 0.97 && a.pWin >= 0.02 && a.pLose > 0);
  // shadowborn gets stronger in the dark
  const S = new FW.Legend({ luck: 'mortal', seed: 's' });
  S.picks = Object.assign({}, L.picks, { race: { name: 'Shadowborn' } });
  delete S.picks.sub;
  const dark = FW.ARENAS.find(x => x.name === 'Moonless Night'),
    sun = FW.ARENAS.find(x => x.name === 'Blazing Noon');
  const md = FW.matchup(S, weak, dark),
    ms = FW.matchup(S, weak, sun);
  assert(md.hero > ms.hero + 3, 'dark must beat sun for Shadowborn: ' + md.hero + ' vs ' + ms.hero);
  assert(md.adj.some(x => x.kind === 'buff') && ms.adj.some(x => x.kind === 'debuff'));
  // exploited weakness
  const W = new FW.Legend({ luck: 'mortal' });
  W.picks = Object.assign({}, S.picks, { weak: { name: 'Fire' }, race: { name: 'Human' } });
  const fireOpp = FW.UNIVERSES[0].opps[0]; // a=fire
  const mw = FW.matchup(W, fireOpp, null);
  assert(mw.adj.some(x => /Exploited weakness: Fire/.test(x.label) && x.d === -8));
});

t('behind / ahead conditions only trigger when appropriate', () => {
  const L = fullLegend('bh', 'mortal');
  L.picks.bg = { name: 'You were just a nobody.' }; // behind:all+2
  const hero = FW.compute(L).baseRating;
  const strongOpp = { name: 'X', dsl: 'lv=' + Math.round(hero + 25), w: 1 },
    weakOpp = { name: 'Y', dsl: 'lv=' + Math.max(1, Math.round(hero - 25)), w: 1 };
  assert(FW.matchup(L, strongOpp, null).adj.some(x => /when losing/.test(x.label)));
  assert(!FW.matchup(L, weakOpp, null).adj.some(x => /when losing/.test(x.label)));
});

t('personality shifts outcome wheel odds', () => {
  const L = fullLegend('o', 'mortal');
  L.picks.per = { name: 'Pacifist' };
  const a = FW.outcomeEntries(L);
  L.picks.per = { name: 'Ruthless' };
  const b = FW.outcomeEntries(L);
  const f = (x, k) => x.find(e => e.key === k).w;
  assert(f(a, 'spare') > f(b, 'spare'));
  assert(f(b, 'kill') > f(a, 'kill'));
});

t('consequences apply and are reflected in the card', () => {
  const L = fullLegend('c', 'mortal');
  const before = FW.compute(L).stats.dur.bonus;
  FW.applyConsequence(L, 'lose', 'scar', { name: 'Z', dsl: 'lv=50' }, FW.makeRng('z'));
  assert.strictEqual(FW.compute(L).stats.dur.bonus, before - 1);
  FW.applyConsequence(L, 'win', 'recruit', { name: 'Ally Guy', dsl: 'lv=50' }, FW.makeRng('z'));
  assert.strictEqual(L.ally.length, 1);
  FW.applyConsequence(L, 'win', 'absorb', { name: 'Q', dsl: 'lv=50' }, FW.makeRng('q'));
  assert(L.chron.length === 3);
});

t('custom wheel overrides (Workshop)', () => {
  const L = new FW.Legend({ luck: 'mortal' });
  const st = FW.buildStage('race', L, {
    overrides: { race: { removed: ['Human'], weights: { Elf: 50 }, added: [{ name: 'Moth Person', w: 5 }] } },
  });
  assert(!st.entries.find(e => e.name === 'Human'));
  const k = L.luckInfo().k; // luck flattens list wheels: weight^(1/(1+0.35k))
  assert(
    Math.abs(st.entries.find(e => e.name === 'Elf').w - Math.pow(50, 1 / (1 + 0.35 * k))) < 1e-9,
    'the Workshop weight replaces the base slice (luck still applies on top)'
  );
  assert(st.entries.find(e => e.name === 'Moth Person'));
  const mini = FW.buildStage('race', L, { overrides: { race: { removed: FW.RACES.map(r => r.name) } } });
  assert(mini.entries.length > 0, 'removing everything must fall back');
});

t('custom Workshop entries never crash cards, rating or codes', () => {
  const rng = FW.makeRng('custom');
  const L = new FW.Legend({ luck: 'mortal', seed: 'cu' });
  const add = n => ({ added: [{ name: n, w: 5000 }] });
  const ctx = {
    overrides: {
      race: add('Moth Person'),
      enh: add('Moth Dance'),
      weak: add('Lamps'),
      wpn: add('Lantern'),
      pow: add('Dust Wings'),
      mark: add('Mothlight'),
    },
  };
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L, ctx);
    let idx = FW.weightedIndex(st.entries, rng);
    const c = st.entries.findIndex(e => e.custom);
    if (c >= 0) idx = c;
    FW.commitPick(L, st, idx, rng);
  }
  assert.strictEqual(L.raceName(), 'Moth Person');
  const c = FW.compute(L);
  assert(isFinite(c.rating));
  FW.cardLines(L, c);
  FW.legendText(L);
  const L2 = FW.Legend.fromCode(L.toCode());
  assert.strictEqual(FW.legendText(L2), FW.legendText(L));
  assert.throws(() => FW.Legend.fromCode('FW1.%%%%'), /Corrupt/);
});

t('boss tricks: wards, immunities, punished elements, rage and a second phase', () => {
  const arena = { name: 'Plain', tags: [], w: 1 };
  const L = new FW.Legend({ luck: 'heroic', seed: 'boss' });
  const rng = FW.makeRng('boss:spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  const atk = FW.compute(L).atk;
  if (atk.length) {
    // a ward cancels exactly what your attacks would gain from the foe's weakness
    const w = FW.matchup(L, { name: 'The Nameless Throne', w: 1, dsl: 'lv=60 w=' + atk[0] }, arena);
    const hit = w.adj.filter(a => / hits their weakness$/.test(a.label)).reduce((t, a) => t + a.d, 0);
    const ward = w.adj.find(a => a.boss);
    assert(ward && ward.d === -hit, JSON.stringify(w.adj));
  }
  // an immunity only matters when you attack with that element
  const imm = FW.matchup(L, { name: 'Forge-God Ulm', w: 1, dsl: 'lv=60' }, arena);
  assert.strictEqual(!!imm.adj.find(a => a.boss), atk.indexOf('fire') >= 0);
  // rage only against a weaker hero
  assert(!FW.matchup(L, { name: 'Shogun Prime', w: 1, dsl: 'lv=12' }, arena).adj.find(a => a.boss));
  assert(
    FW.matchup(L, { name: 'Shogun Prime', w: 1, dsl: 'lv=99' }, arena).adj.find(a => a.boss && /enraged/.test(a.label))
  );
  // two phases: the second fight is 8 levels stronger and does not rise again
  assert(FW.matchup(L, { name: 'Dread Sovereign Kaelun', w: 1, dsl: 'lv=60' }, arena).phases);
  const k2 = FW.phaseTwo({ name: 'Dread Sovereign Kaelun', w: 1, dsl: 'lv=60 a=fire' });
  assert.strictEqual(FW.P(k2).lv, 68);
  assert(!FW.matchup(L, k2, arena).phases);
  // every trick belongs to a real foe and has a description
  const foes = new Set();
  FW.UNIVERSES.forEach(u => u.opps.forEach(o => foes.add(o.name)));
  const story = require('fs').readFileSync(require('path').join(__dirname, '..', 'app', 'js', 'story.js'), 'utf8');
  Object.keys(FW.BOSS_MECH).forEach(n => {
    assert(foes.has(n) || story.indexOf("'" + n + "'") >= 0, 'trick for an unknown foe: ' + n);
    assert(FW.mechText(FW.BOSS_MECH[n]), 'no text for ' + n);
  });
});

console.log('\n' + passed + ' checks passed' + (process.exitCode ? ' - WITH FAILURES' : ''));
