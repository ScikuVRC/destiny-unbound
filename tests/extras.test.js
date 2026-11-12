/* Tests for wheel packs, achievements and translations. Run: node tests/extras.test.js */
const assert = require('assert'), fs = require('fs'), path = require('path');
globalThis.window = globalThis;
const mem = { 'fw.lang': '"es"' };
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
['data.js', 'data-more.js', 'data-extra.js'].forEach(f => require('../app/js/' + f));
require('../app/lang/es.js'); require('../app/js/i18n.js');
['engine.js', 'story.js', 'packs.js', 'achievements.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW;
let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e).toString().split('\n').slice(0, 3).join('\n       ')); } }
function legend(seed) { const L = new FW.Legend({ luck: 'heroic', seed }), rng = FW.makeRng(seed); let i = -1; while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L); FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng); } return L; }

t('the example pack is valid and its entries work in real legends and codes', () => {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'packs', 'example-sky-pirates.json'), 'utf8'));
  const p = FW.validatePack(raw);
  assert.strictEqual(p.name, 'Sky Pirates'); assert(p.entries.race.length === 2 && p.entries.wpn.length === 2);
  assert(p.entries.pow.every(e => /rar=\d/.test(e.dsl)), 'powers get a rarity');
  const before = FW.RACES.length; FW.installPackEntries(p, 'test'); assert.strictEqual(FW.RACES.length, before + 2);
  assert.strictEqual(FW.RACE_ART['Cloudborn'], raw.entries.race[0].art);
  const L = legend('pack'); L.picks.race = { name: 'Cloudborn' }; delete L.picks.sub; L.picks.wpn = { name: 'Stormglass Cutlass' }; L.picks.cls = { name: 'Sky Captain' };
  const c = FW.compute(L); assert(c.stats.spd.parts.some(x => /Cloudborn/.test(x.label)), 'pack race buff applies');
  const L2 = FW.Legend.fromCode(L.toCode()); assert.strictEqual(L2.raceName(), 'Cloudborn');
  FW.removePackEntries('test'); assert.strictEqual(FW.RACES.length, before); assert(!FW.RACES.some(r => r.name === 'Cloudborn'));
  // without the pack the code still opens: the missing entries become neutral custom entries
  const L3 = FW.Legend.fromCode(L.toCode()); assert.strictEqual(L3.raceName(), 'Cloudborn'); assert(L3.entry('race').custom);
});

t('broken packs are rejected with a readable reason', () => {
  const bad = [[{}, /not a FateWheel pack/], [{ format: 'fatewheel-pack' }, /needs a name/], [{ format: 'fatewheel-pack', name: 'x', entries: { dragons: [] } }, /Unknown wheel/],
    [{ format: 'fatewheel-pack', name: 'x', entries: { race: [{ name: 'Y', dsl: 'str+banana' }] } }, /"Y": bad DSL/], [{ format: 'fatewheel-pack', name: 'x', entries: { race: [{ name: 'Y', w: -1 }] } }, /weight/],
    [{ format: 'fatewheel-pack', name: 'x' }, /empty/]];
  bad.forEach(([p, re]) => assert.throws(() => FW.validatePack(p), re));
  // pack entries never replace an existing entry with the same name
  const n = FW.RACES.length; FW.installPackEntries(FW.validatePack({ format: 'fatewheel-pack', name: 'dup', entries: { race: [{ name: 'Human', dsl: 'all+9' }] } }), 'dup');
  assert.strictEqual(FW.RACES.length, n); assert.strictEqual(FW.RACES.find(r => r.name === 'Human').dsl.indexOf('all+9'), -1);
});

t('pack Workshop edits sit under the player\'s own edits', () => {
  mem['fw.packs'] = JSON.stringify([{ id: 'a', enabled: true, format: 'fatewheel-pack', name: 'A', entries: {}, workshop: { pet: { weights: { Raven: 8, 'Stray Cat': 2 }, removed: ['Pet Rock'] } } }]);
  const m = FW.mergeOverrides({ pet: { weights: { Raven: 1 }, removed: ['Griffin'] } });
  assert.strictEqual(m.pet.weights.Raven, 1); assert.strictEqual(m.pet.weights['Stray Cat'], 2); assert.deepStrictEqual(m.pet.removed.sort(), ['Griffin', 'Pet Rock']);
  delete mem['fw.packs'];
});

t('achievements: every check runs on many legends and sagas without errors', () => {
  assert(FW.ACHIEVEMENTS.length >= 20);
  const ids = new Set(FW.ACHIEVEMENTS.map(a => a.id)); assert.strictEqual(ids.size, FW.ACHIEVEMENTS.length);
  for (let i = 0; i < 40; i++) {
    const L = legend('ach' + i); FW.Story.newSaga(L, {}, FW.makeRng('a' + i)); L.saga.ch = i; if (i % 3 === 0) L.saga.end = 'retired';
    FW.ACHIEVEMENTS.forEach(a => { const r = a.test(L); assert(typeof r === 'boolean', a.id + ' returned ' + r); });
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
  Object.keys(FW.LADDERS).forEach(k => FW.LADDERS[k].names.forEach(n => assert(FW.LANG_PACKS.es.strings[n] != null, 'missing tier: ' + n)));
  FW.Story.CHAPTERS.forEach(c => assert(FW.LANG_PACKS.es.strings[c.name] != null, 'missing chapter: ' + c.name));
});

console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
