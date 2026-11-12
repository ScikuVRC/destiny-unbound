/* Story mode tests: plays full sagas with random wheel results. Run: node tests/story.test.js */
const assert = require('assert');
['data.js', 'data-more.js', 'data-extra.js', 'engine.js', 'story.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW, S = FW.Story;
let pass = 0, fail = 0;
async function t(name, fn) { try { await fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e).toString().split('\n').slice(0, 4).join('\n       ')); } }

function makeLegend(seed, luck) {
  const L = new FW.Legend({ luck: luck || 'heroic', seed });
  const rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L); FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng); }
  return L;
}
// a headless player: every wheel lands where the odds say; records what it was shown
function bot(seed) {
  const rng = FW.makeRng(seed + ':story'), seen = [];
  return { rng, seen, spin: async cfg => {
    assert(cfg.entries.length > 0, 'empty wheel: ' + cfg.title);
    cfg.entries.forEach(e => { assert(e.w >= 0 && isFinite(e.w), 'bad weight on ' + e.name); if (e.dsl) FW.parse(e.dsl); });
    assert(cfg.entries.some(e => e.w > 0), 'nothing can win on: ' + cfg.title);
    seen.push(cfg); return FW.weightedIndex(cfg.entries, rng);
  } };
}
async function playSaga(seed, opts, ov) {
  const L = makeLegend(seed); const io = bot(seed);
  S.newSaga(L, opts, io.rng);
  let turns = 0;
  while (!L.saga.end && turns < 400) { await S.playTurn(L, io, opts, ov); turns++; }
  return { L, io, turns };
}

(async () => {
  await t('500 sagas always end, never crash, and their codes round-trip', async () => {
    const ends = {}; let maxCh = 0, totalCh = 0;
    for (let i = 0; i < 500; i++) {
      const opts = {}; S.OPTIONS.forEach(o => opts[o.id] = (i + o.id.length) % 3 !== 0);
      const { L, turns } = await playSaga('saga' + i, opts);
      assert(L.saga.end, 'saga ' + i + ' never ended after ' + turns + ' turns');
      ends[L.saga.end] = (ends[L.saga.end] || 0) + 1; maxCh = Math.max(maxCh, L.saga.ch); totalCh += L.saga.ch;
      const c = FW.compute(L); assert(isFinite(c.rating), 'rating');
      const L2 = FW.Legend.fromCode(L.toCode());
      assert.strictEqual(FW.legendText(L2), FW.legendText(L));
      assert.strictEqual(L2.saga.ch, L.saga.ch);
    }
    console.log('       endings', JSON.stringify(ends), ' avg chapters', (totalCh / 500).toFixed(1), ' longest', maxCh);
  });

  await t('used chapters turn grey and never land again; repeatable ones stay', async () => {
    for (let i = 0; i < 60; i++) {
      const { L, io } = await playSaga('grey' + i, {});
      const landed = {};
      io.seen.filter(c => c.kind === 'story').forEach(c => {
        c.entries.filter(e => e.gray).forEach(e => assert.strictEqual(e.w, 0, e.name + ' grey but can land'));
        c.entries.filter(e => e.used).forEach(e => assert(!S.CHAPTER_BY_ID[e.id].repeat && landed[e.id], e.id + ' marked used wrongly'));
        const pickedNow = L.saga.used; pickedNow.forEach(id => landed[id] = true);
      });
      const once = L.saga.used; assert.strictEqual(new Set(once).size, once.length, 'a one-time chapter happened twice');
    }
  });

  await t('requirements: no world conquest before conquering a race (when on)', async () => {
    for (let i = 0; i < 150; i++) {
      const L = makeLegend('req' + i); const io = bot('req' + i); S.newSaga(L, {}, io.rng);
      while (!L.saga.end) {
        const before = L.saga.conquered.length;
        const ch = await S.playTurn(L, io, {});
        if (ch && ch.id === 'conquerWorld') assert(before >= 1, 'world conquest without a conquered race');
        if (ch && ch.id === 'rebellion') assert(true);
      }
    }
  });

  await t('death off: nobody dies; aging off: no old-age wheel; kingdom events off: none', async () => {
    for (let i = 0; i < 150; i++) {
      const { L, io } = await playSaga('safe' + i, { death: false, aging: false, kingdomEvents: false });
      assert.notStrictEqual(L.saga.end, 'dead', 'died with death off: ' + L.saga.endText);
      assert(!io.seen.some(c => /Does your body hold/.test(c.title)), 'old age wheel shown');
      assert(!io.seen.some(c => /^News from/.test(c.title)), 'kingdom event shown');
    }
  });

  await t('nemesis off: no nemesis chapters; loyalty off: no betrayal; a rival appears instead', async () => {
    for (let i = 0; i < 80; i++) {
      const { L, io } = await playSaga('nonem' + i, { nemesis: false, loyalty: false });
      assert(!L.saga.nem, 'nemesis created');
      io.seen.filter(c => c.kind === 'story').forEach(c => c.entries.forEach(e => assert(['nemesis', 'showdown', 'betrayal'].indexOf(e.id) < 0, e.id + ' on the wheel'))
      );
    }
    const L = makeLegend('withnem'); S.newSaga(L, {}, FW.makeRng('x'));
    const ids = S.wheelEntries(L, {}).map(e => e.id); assert(ids.indexOf('nemesis') >= 0 && ids.indexOf('rival') < 0);
  });

  await t('Workshop can remove chapters, but never Retire', async () => {
    const L = makeLegend('ws'); S.newSaga(L, {}, FW.makeRng('ws'));
    const ents = S.wheelEntries(L, {}, { removed: ['Plague', 'Cursed', 'Retire'] });
    assert(!ents.some(e => e.id === 'plague' || e.id === 'curse')); assert(ents.some(e => e.id === 'retire'));
  });

  await t('Retire grows a little each chapter', async () => {
    const L = makeLegend('ret'); S.newSaga(L, {}, FW.makeRng('ret'));
    const w0 = S.retireWeight(L, S.opts()); L.saga.ch = 10; const w10 = S.retireWeight(L, S.opts());
    assert(w10 > w0 && w10 < 8, w0 + ' -> ' + w10);
  });

  await t('dynasty: an heir inherits house, kingdom and a family talent', async () => {
    let checked = 0;
    for (let i = 0; i < 300 && checked < 15; i++) {
      const { L } = await playSaga('dyn' + i, {});
      if (!S.canContinue(L, {})) continue;
      const inh = S.inheritance(L); const child = makeLegend('child' + i);
      S.startHeir(child, inh, {}, FW.makeRng('c' + i));
      assert.strictEqual(child.saga.dyn.house, L.saga.dyn.house); assert.strictEqual(child.saga.dyn.gen, L.saga.dyn.gen + 1);
      if (L.saga.kingdom) assert.strictEqual(child.saga.kingdom.name, L.saga.kingdom.name);
      assert(child.chron.some(x => /Inheritance/.test(x.label)));
      FW.Legend.fromCode(child.toCode()); checked++;
    }
    assert(checked >= 5, 'too few heirs to test: ' + checked);
    const { L } = await playSaga('dynoff', { dynasty: false }); assert(!S.canContinue(L, { dynasty: false }));
  });

  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
