/* Tests for wheel packs, achievements and translations. Run: node tests/extras.test.js */
const assert = require('assert'),
  fs = require('fs'),
  path = require('path');
globalThis.window = globalThis;
const mem = { 'fw.lang': '"es"' };
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => {
    mem[k] = String(v);
  },
  removeItem: k => {
    delete mem[k];
  },
};
['data.js'].forEach(f => require('../app/js/' + f));
['es', 'fr', 'de', 'ja'].forEach(id => require('../app/lang/' + id + '.js'));
require('../app/js/i18n.js');
[
  'engine.js',
  'story.js',
  'card.js',
  'packs.js',
  'achievements.js',
  'hall.js',
  'codex.js',
  'boss.js',
  'unlocks.js',
  'prefs.js',
].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW;
let pass = 0,
  fail = 0;
function t(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail++;
    console.log(
      '  FAIL ' + name + '\n       ' + ((e && e.stack) || e).toString().split('\n').slice(0, 3).join('\n       ')
    );
  }
}
function legend(seed) {
  const L = new FW.Legend({ luck: 'heroic', seed }),
    rng = FW.makeRng(seed);
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}

t('the example pack is valid and its entries work in real legends and codes', () => {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'packs', 'example-sky-pirates.json'), 'utf8'));
  const p = FW.validatePack(raw);
  assert.strictEqual(p.name, 'Sky Pirates');
  assert(p.entries.race.length === 2 && p.entries.wpn.length === 2);
  assert(
    p.entries.pow.every(e => /rar=\d/.test(e.dsl)),
    'powers get a rarity'
  );
  const before = FW.RACES.length;
  FW.installPackEntries(p, 'test');
  assert.strictEqual(FW.RACES.length, before + 2);
  assert.strictEqual(FW.RACE_ART['Cloudborn'], raw.entries.race[0].art);
  const L = legend('pack');
  L.picks.race = { name: 'Cloudborn' };
  delete L.picks.sub;
  L.picks.wpn = { name: 'Stormglass Cutlass' };
  L.picks.cls = { name: 'Sky Captain' };
  const c = FW.compute(L);
  assert(
    c.stats.spd.parts.some(x => /Cloudborn/.test(x.label)),
    'pack race buff applies'
  );
  const L2 = FW.Legend.fromCode(L.toCode());
  assert.strictEqual(L2.raceName(), 'Cloudborn');
  FW.removePackEntries('test');
  assert.strictEqual(FW.RACES.length, before);
  assert(!FW.RACES.some(r => r.name === 'Cloudborn'));
  // without the pack the code still opens: the missing entries become neutral custom entries
  const L3 = FW.Legend.fromCode(L.toCode());
  assert.strictEqual(L3.raceName(), 'Cloudborn');
  assert(L3.entry('race').custom);
});

t('broken packs are rejected with a readable reason', () => {
  const bad = [
    [{}, /not a Destiny Unbound pack/],
    [{ format: 'fatewheel-pack' }, /needs a name/],
    [{ format: 'fatewheel-pack', name: 'x', entries: { dragons: [] } }, /Unknown wheel/],
    [{ format: 'fatewheel-pack', name: 'x', entries: { race: [{ name: 'Y', dsl: 'str+banana' }] } }, /"Y": bad DSL/],
    [{ format: 'fatewheel-pack', name: 'x', entries: { race: [{ name: 'Y', w: -1 }] } }, /weight/],
    [{ format: 'fatewheel-pack', name: 'x' }, /empty/],
  ];
  bad.forEach(([p, re]) => assert.throws(() => FW.validatePack(p), re));
  // pack entries never replace an existing entry with the same name
  const n = FW.RACES.length;
  FW.installPackEntries(
    FW.validatePack({ format: 'fatewheel-pack', name: 'dup', entries: { race: [{ name: 'Human', dsl: 'all+9' }] } }),
    'dup'
  );
  assert.strictEqual(FW.RACES.length, n);
  assert.strictEqual(FW.RACES.find(r => r.name === 'Human').dsl.indexOf('all+9'), -1);
});

t("pack Workshop edits sit under the player's own edits", () => {
  mem['fw.packs'] = JSON.stringify([
    {
      id: 'a',
      enabled: true,
      format: 'fatewheel-pack',
      name: 'A',
      entries: {},
      workshop: { pet: { weights: { Raven: 8, 'Stray Cat': 2 }, removed: ['Pet Rock'] } },
    },
  ]);
  const m = FW.mergeOverrides({ pet: { weights: { Raven: 1 }, removed: ['Griffin'] } });
  assert.strictEqual(m.pet.weights.Raven, 1);
  assert.strictEqual(m.pet.weights['Stray Cat'], 2);
  assert.deepStrictEqual(m.pet.removed.sort(), ['Griffin', 'Pet Rock']);
  delete mem['fw.packs'];
});

t('achievements: every check runs on many legends and sagas without errors', () => {
  assert(FW.ACHIEVEMENTS.length >= 20);
  const ids = new Set(FW.ACHIEVEMENTS.map(a => a.id));
  assert.strictEqual(ids.size, FW.ACHIEVEMENTS.length);
  for (let i = 0; i < 40; i++) {
    const L = legend('ach' + i);
    FW.Story.newSaga(L, {}, FW.makeRng('a' + i));
    L.saga.ch = i;
    if (i % 3 === 0) L.saga.end = 'retired';
    FW.ACHIEVEMENTS.forEach(a => {
      const r = a.test(L);
      assert(typeof r === 'boolean', a.id + ' returned ' + r);
    });
  }
  FW.ACHIEVEMENTS.filter(a => a.reward).forEach(a => FW.parse(a.reward.entry.dsl));
});

t('translations: Spanish lookups, symbols kept, unknown text stays English', () => {
  assert.strictEqual(FW.lang, 'es');
  assert.strictEqual(FW.t('Spin a Legend'), 'Girar una leyenda');
  assert.strictEqual(FW.t('▶ Spin a Legend'), '▶ Girar una leyenda');
  assert.strictEqual(FW.t("What's your Race?"), '¿Cuál es tu raza?');
  assert.strictEqual(FW.t('Some text nobody translated'), 'Some text nobody translated');
  // every stage question and every stat tier has a Spanish entry
  FW.STAGES.forEach(s => assert.notStrictEqual(FW.t(s.title), s.title, 'missing: ' + s.title));
  Object.keys(FW.LADDERS).forEach(k =>
    FW.LADDERS[k].names.forEach(n => assert(FW.LANG_PACKS.es.strings[n] != null, 'missing tier: ' + n))
  );
  FW.Story.CHAPTERS.forEach(c => assert(FW.LANG_PACKS.es.strings[c.name] != null, 'missing chapter: ' + c.name));
  // every achievement name and description, and every reward entry it adds to a wheel, has a Spanish entry
  FW.ACHIEVEMENTS.forEach(x =>
    [x.name, x.desc]
      .concat(x.reward ? [x.reward.entry.name, x.reward.entry.perk].filter(Boolean) : [])
      .forEach(s => assert(FW.LANG_PACKS.es.strings[s] != null, 'missing achievement text: ' + s))
  );
});

t('translations: French, German and Japanese cover the wheels and story, and the picker lists every language', () => {
  const es = FW.LANG_PACKS.es.strings;
  ['fr', 'de', 'ja'].forEach(id => {
    const p = FW.LANG_PACKS[id];
    assert(p && p.name && p.strings, 'pack not loaded: ' + id);
    Object.keys(p.strings).forEach(k => {
      assert(es[k] != null, id + ' has a key the game does not use: ' + k);
      assert(typeof p.strings[k] === 'string' && p.strings[k].trim(), id + ' empty value: ' + k);
    });
    FW.STAGES.forEach(s => assert(p.strings[s.title] != null, id + ' missing: ' + s.title));
    Object.keys(FW.LADDERS).forEach(k =>
      FW.LADDERS[k].names.forEach(n => assert(p.strings[n] != null, id + ' missing tier: ' + n))
    );
    FW.Story.CHAPTERS.forEach(c => assert(p.strings[c.name] != null, id + ' missing chapter: ' + c.name));
  });
  const sel = {};
  FW.fillLangSelect(sel);
  const ids = [...sel.innerHTML.matchAll(/value="([^"]+)"/g)].map(m => m[1]);
  assert.strictEqual(ids[0], 'en');
  ['es', 'fr', 'de', 'ja'].forEach(id => assert(ids.includes(id), 'not in the picker: ' + id));
  assert(/value="es" selected/.test(sel.innerHTML), 'current language not selected');
});

t('grammar: plural forms follow each language, gender follows the hero, and translations keep the markers', () => {
  const f = FW.fmt;
  assert.strictEqual(f('{n} {p:year|years}', { n: 1 }), '1 year');
  assert.strictEqual(f('{n} {p:year|years}', { n: 0 }), '0 years');
  assert.strictEqual(f('{g:his|her|their} sword', { g: 'masc' }), 'his sword');
  assert.strictEqual(f('{g:his|her|their} sword', { g: 'fem' }), 'her sword');
  assert.strictEqual(f('{g:his|her|their} sword', { g: '' }), 'their sword');
  assert.strictEqual(f('{g:his|her|their} sword', { g: 'andro' }), 'their sword');
  // the language's own rules: French counts 0 as singular, Japanese has one form
  assert.strictEqual(FW.pluralIndex(0, 'fr'), 0);
  assert.strictEqual(FW.pluralIndex(2, 'fr'), 2);
  assert.strictEqual(FW.pluralIndex(1000000, 'fr'), 1);
  assert.strictEqual(FW.pluralIndex(7, 'ja'), 0);
  assert.strictEqual(FW.pluralIndex(1, 'de'), 0);
  // in Spanish (the language these tests run in) a translated label picks its form too
  assert.strictEqual(FW.tf('{p:year|years}', { n: 1 }), 'año');
  assert.strictEqual(FW.tf('{p:year|years}', { n: 4 }), 'años');
  // a translation of a line with markers keeps the same kinds of markers
  ['es', 'fr', 'de', 'ja'].forEach(id =>
    Object.entries(FW.LANG_PACKS[id].strings).forEach(([en, tr]) => {
      const kinds = s => ['{p:', '{g:', '{n}'].filter(k => s.indexOf(k) >= 0).join();
      if (id !== 'ja') assert.strictEqual(kinds(tr), kinds(en), id + ' lost a marker: ' + en);
      assert(!/\{[pg]:[^}]*$/.test(tr), id + ' unclosed marker: ' + tr);
    })
  );
  // story text: a hero's pronouns follow their presentation
  const S = FW.Story,
    L = new FW.Legend({ seed: 'pron', pres: 'fem' });
  L.name = 'Ayla';
  S.newSaga(L, {}, FW.makeRng('p'));
  S.apply(L, { name: 'x', text: '{hero} lays down {g:his|her|their} weapons.' }, { o: S.opts({}), chName: 'Test' });
  assert.strictEqual(L.saga.log[L.saga.log.length - 1].text, 'Ayla lays down her weapons.');
});

t('player level: experience from heroes, chapters, endings and achievements, each counted once', () => {
  const Lv = FW.Level;
  assert.deepStrictEqual(Lv.of(0), { level: 1, into: 0, need: 100, xp: 0 });
  assert.strictEqual(Lv.of(100).level, 2);
  assert.strictEqual(Lv.of(99).level, 1);
  const rec = Lv.fresh(0, 0);
  const L = new FW.Legend({ seed: 'lvl' });
  assert.strictEqual(Lv.gain(L, rec), Lv.XP.hero, 'a new hero');
  assert.strictEqual(Lv.gain(L, rec), 0, 'the same hero again pays nothing');
  FW.Story.newSaga(L, {}, FW.makeRng('lvl'));
  L.saga.ch = 3;
  assert.strictEqual(Lv.gain(L, rec), 3 * Lv.XP.chapter, 'three chapters');
  L.saga.ch = 5;
  L.saga.end = 'legend';
  assert.strictEqual(Lv.gain(L, rec), 2 * Lv.XP.chapter + Lv.XP.end.legend, 'two more chapters and the ending');
  assert.strictEqual(Lv.gain(L, rec), 0);
  assert.strictEqual(Lv.achievements(3, rec), 3 * Lv.XP.achievement);
  assert.strictEqual(Lv.achievements(3, rec), 0);
  // only the newest heroes are remembered
  for (let i = 0; i < Lv.KEEP + 20; i++) Lv.gain(new FW.Legend({ seed: 'k' + i }), rec);
  assert.strictEqual(Object.keys(rec.seen).length, Lv.KEEP);
  assert.strictEqual(rec.order.length, Lv.KEEP);
  // card backs unlock with levels, and the first one is always there
  assert.deepStrictEqual(
    Lv.backs(1).map(b => b.id),
    ['classic']
  );
  // (backs earned with achievements need their unlock as well: see the unlocks test)
  const byLevel = FW.CARD_BACKS.filter(b => !b.unlock);
  assert.strictEqual(Lv.backs(99).length, byLevel.length);
  assert(
    byLevel.every((b, i, a) => !i || b.level > a[i - 1].level),
    'backs in level order'
  );
});

t('Codex and Bestiary: entries fill in once met, fights keep a record, and old Hall heroes count', () => {
  const C = FW.Codex,
    book = C.empty();
  let s = C.sections(book);
  assert.strictEqual(s.races.total, FW.RACES.length);
  assert.strictEqual(s.worlds.total, FW.UNIVERSES.length);
  assert.strictEqual(s.foes.total, FW.UNIVERSES.reduce((a, u) => a + u.opps.length, 0) + FW.Story.DRAGONS.length);
  assert.strictEqual(s.races.known + s.foes.known + s.worlds.known + s.endings.known, 0);
  const L = new FW.Legend({ seed: 'codex' });
  L.picks.race = { name: 'Dwarf' };
  assert.strictEqual(C.noteHero(book, L), 1);
  assert.strictEqual(C.noteHero(book, L), 0, 'the same race twice is not new');
  const foe = FW.UNIVERSES[0].opps[0];
  C.noteFight(book, foe.name, 'win', FW.UNIVERSES[0].name);
  C.noteFight(book, foe.name, 'lose', FW.UNIVERSES[0].name);
  C.noteFight(book, 'Rimefang', 'draw', C.worldOf('Rimefang'));
  s = C.sections(book);
  assert.strictEqual(s.races.known, 1);
  assert.strictEqual(s.worlds.known, 1);
  assert.strictEqual(s.foes.known, 2);
  assert.deepStrictEqual(book.foe[foe.name], { met: 2, win: 1, draw: 0, lose: 1 });
  assert.strictEqual(C.worldOf(foe.name), FW.UNIVERSES[0].name);
  const old = C.fromHall(C.empty(), [{ race: 'Frost Dwarf', saga: { end: 'legend' } }, { race: 'Elf' }]);
  assert(old.race.Dwarf && old.race.Elf && old.end.legend, 'Hall heroes fill the Codex');
  assert.deepStrictEqual(C.clean(null), C.empty());
  // secret chapters: listed as gaps, filled once found
  assert.strictEqual(s.secrets.total, FW.Story.SECRETS.length);
  assert.strictEqual(s.secrets.known, 0);
  assert.strictEqual(C.noteSecret(book, 'lichKing'), 1);
  assert.strictEqual(C.noteSecret(book, 'lichKing'), 0, 'found twice is not new');
  assert.strictEqual(C.sections(book).secrets.known, 1);
});

t('world boss: one boss a week in turn, real odds decide the hit, damage stays in bounds', () => {
  const B = FW.Boss;
  const mon = Date.UTC(2026, 10, 16, 12);
  assert.strictEqual(B.current(mon), B.current(mon + 6 * 864e5), 'the same boss all week');
  assert.notStrictEqual(B.current(mon), B.current(mon + 7 * 864e5), 'the next week brings the next boss');
  assert.strictEqual(B.endsAt(mon), Date.UTC(2026, 10, 23));
  B.LIST.forEach(b => {
    FW.parse(b.dsl);
    assert(FW.P(B.foe(b)).lv >= 60 && b.hp > 0 && b.lair.tags.length, b.id);
  });
  const L = new FW.Legend({ seed: 'boss' }),
    rng = FW.makeRng('boss');
  for (let k = -1; (k = FW.nextStageIndex(L, k)) < FW.STAGES.length;) {
    const s = FW.buildStage(FW.STAGES[k].id, L);
    FW.commitPick(L, s, FW.weightedIndex(s.entries, rng), rng);
  }
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const r = B.fight(L, B.LIST[i % B.LIST.length], rng);
    assert(r.damage >= 1 && r.damage <= B.MAX_HIT && Number.isInteger(r.damage));
    seen.add(r.outcome.name);
  }
  assert(seen.size >= 3, 'fights vary');
  // better odds mean more mighty blows
  const strong = B.outcomes(0.9),
    weak = B.outcomes(0.1);
  assert(strong[0].w > weak[0].w && strong[3].w < weak[3].w);
});

t('Hall export: a spreadsheet file with every hero and the statistics, safe to open', () => {
  const csv = FW.hallCsv(
    [
      { title: 'Ayla, The "Pale" One', race: 'Elf', rating: 44.2, rank: 'Hero', date: '2026-11-10', fav: true },
      { title: '=HYPERLINK("x")', race: 'Orc', rating: 30, rank: 'Hero', saga: { summary: 'Died', end: 'dead' } },
    ],
    [['Player level', 4]]
  );
  const lines = csv.trim().split('\r\n');
  assert.strictEqual(lines[0].split(',')[0], 'Name');
  assert(lines[1].startsWith('"Ayla, The ""Pale"" One",Elf,44.2'), lines[1]);
  assert(lines[2].startsWith('"\'=HYPERLINK(""x"")"'), 'a formula is not run: ' + lines[2]);
  assert(lines.includes('Player level,4'));
});

t('Hall statistics: counts, averages and the most common races, ranks and endings', () => {
  const s = FW.hallStats([
    { title: 'A', race: 'Elf', rating: 40, rank: 'Hero', saga: { end: 'legend' }, fav: true },
    { title: 'B', race: 'Elf', rating: 60, rank: 'Champion', saga: { end: 'dead' } },
    { title: 'C', race: 'Human', rating: 20, rank: 'Hero' },
  ]);
  assert.strictEqual(s.count, 3);
  assert.strictEqual(s.sagas, 2);
  assert.strictEqual(s.avg, 40);
  assert.strictEqual(s.best.title, 'B');
  assert.deepStrictEqual(s.races[0], ['Elf', 2]);
  assert.deepStrictEqual(s.ranks[0], ['Hero', 2]);
  assert.strictEqual(s.endings.length, 2);
  assert.strictEqual(s.favourites, 1);
  assert.strictEqual(FW.hallStats(null).count, 0);
});

t('versus formats: best of three, team fights (winner stays on) and challenge codes', () => {
  let s = { a: 0, b: 0, fights: 0 };
  s = FW.vsBestOf(s, 'a');
  assert(!s.done);
  s = FW.vsBestOf(s, 'draw');
  assert(!s.done && s.fights === 2, 'a draw does not count');
  s = FW.vsBestOf(s, 'a');
  assert(s.done && s.winner === 'a');
  let d = { a: 0, b: 0, fights: 0 };
  for (let i = 0; i < 5; i++) d = FW.vsBestOf(d, 'draw');
  assert(d.done && d.winner === 'draw', 'five draws end it');
  let tm = { a: 0, b: 0, n: 3, bouts: 0 };
  tm = FW.vsTeamStep(tm, 'a'); // B's first fighter is out
  assert.deepStrictEqual([tm.a, tm.b, tm.done], [0, 1, false]);
  tm = FW.vsTeamStep(tm, 'draw'); // both out
  assert.deepStrictEqual([tm.a, tm.b], [1, 2]);
  tm = FW.vsTeamStep(tm, 'a');
  assert(tm.done && tm.winner === 'a', 'side one has fighters left');
  let tied = { a: 2, b: 2, n: 3, bouts: 4 };
  tied = FW.vsTeamStep(tied, 'draw');
  assert(tied.done && tied.winner === 'draw');
  const L = legend('challenge');
  const msg = FW.vsChallenge(L.displayName(), FW.compute(L).rating, L.toCode());
  assert(msg.indexOf(L.displayName()) >= 0);
  assert.strictEqual(FW.Legend.fromCode(FW.codeIn(msg)).displayName(), L.displayName(), 'the code reads back');
  assert.strictEqual(FW.codeIn('  FW1.abc  '), 'FW1.abc');
});

t('hidden achievements: a riddle each, and their tests run', () => {
  const hidden = FW.ACHIEVEMENTS.filter(a => a.hidden);
  assert(hidden.length >= 5);
  hidden.forEach(a => {
    assert(a.riddle && a.riddle !== a.desc, a.id + ' has no riddle');
    assert(FW.LANG_PACKS.es.strings[a.riddle] != null, 'riddle not translated: ' + a.riddle);
  });
  const L = legend('hid');
  FW.Story.newSaga(L, {}, FW.makeRng('h'));
  L.saga.flags.align = 5;
  L.saga.flags.secrets = ['lichKing'];
  const ok = id => FW.ACHIEVEMENTS.find(a => a.id === id).test(L);
  assert(ok('saint') && ok('secret') && ok('lichPupil') && !ok('wicked'));
});

t('unlocks: titles from achievements and world championships, and card backs earned with them', () => {
  const U = FW.Unlocks,
    all = U.titles();
  assert.strictEqual(all.filter(x => x.kind === 'champion').length, FW.UNIVERSES.length, 'one per world');
  const ids = new Set(all.map(x => x.id));
  assert.strictEqual(ids.size, all.length);
  assert.strictEqual(U.earned({ ach: {}, codex: {} }).length, 0);
  const u = FW.UNIVERSES[0],
    book = FW.Codex.empty();
  u.opps.slice(1).forEach(o => FW.Codex.noteFight(book, o.name, 'win', u.name));
  FW.Codex.noteFight(book, u.opps[0].name, 'lose', u.name);
  assert(!U.worldProgress(book, u).done, 'one foe never beaten');
  assert.strictEqual(U.worldProgress(book, u).beaten, u.opps.length - 1);
  FW.Codex.noteFight(book, u.opps[0].name, 'win', u.name);
  const got = U.earned({ ach: { dragon: '2026-11-21' }, codex: book }).map(x => x.name);
  assert(got.indexOf('Champion of ' + u.name) >= 0 && got.indexOf('Dragonslayer') >= 0);
  assert(U.has({ codex: book }, 'champ:any'));
  // backs: level backs always, earned backs only with their unlock
  const lvOnly = FW.Level.backs(99).map(b => b.id),
    withAll = FW.Level.backs(99, () => true).map(b => b.id);
  assert(lvOnly.indexOf('laurel') < 0 && withAll.indexOf('laurel') >= 0);
  FW.CARD_BACKS.filter(b => b.unlock).forEach(b =>
    assert(
      b.unlock === 'champ:any' || FW.ACHIEVEMENTS.some(a => 'ach:' + a.id === b.unlock),
      'unknown unlock ' + b.unlock
    )
  );
  all.forEach(x =>
    assert(FW.LANG_PACKS.es.strings[x.name] != null || x.kind === 'champion', 'title not translated: ' + x.name)
  );
});

t('collection book: classes, mounts and chapters fill in the Codex', () => {
  const C = FW.Codex,
    book = C.empty();
  const L = legend('collect');
  FW.Story.newSaga(L, {}, FW.makeRng('c'));
  L.saga.used = ['quest', 'dragon'];
  L.saga.flags.reps = { train: 2 };
  assert(C.noteHero(book, L) >= 3);
  const s = C.sections(book);
  assert(s.classes.total > 30 && s.mounts.total > 10 && s.chapters.total > 40);
  assert.strictEqual(s.chapters.known, 3);
  assert(s.classes.known === (L.has('cls') ? 1 : 0));
  assert(!s.chapters.items.some(x => x.e.secret), 'secret chapters have their own page');
  assert.strictEqual(C.noteHero(book, L), 0, 'nothing new the second time');
});

t('spin speed: slow is slower than normal, fast is faster', () => {
  const m = FW.motion;
  FW.motion = () => 'full';
  try {
    assert(FW.spinDuration('slow') > FW.spinDuration('normal') && FW.spinDuration('normal') > FW.spinDuration('fast'));
  } finally {
    FW.motion = m;
  }
});

console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
