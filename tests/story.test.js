/* Story mode tests: plays full sagas with random wheel results. Run: node tests/story.test.js */
const assert = require('assert');
['data.js', 'engine.js', 'story.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW,
  S = FW.Story;
let pass = 0,
  fail = 0;
async function t(name, fn) {
  try {
    await fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail++;
    console.log(
      '  FAIL ' + name + '\n       ' + ((e && e.stack) || e).toString().split('\n').slice(0, 4).join('\n       ')
    );
  }
}

function makeLegend(seed, luck) {
  const L = new FW.Legend({ luck: luck || 'heroic', seed });
  const rng = FW.makeRng(seed + ':spin');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}
// a headless player: every wheel lands where the odds say; records what it was shown
function bot(seed) {
  const rng = FW.makeRng(seed + ':story'),
    seen = [];
  return {
    rng,
    seen,
    spin: async cfg => {
      assert(cfg.entries.length > 0, 'empty wheel: ' + cfg.title);
      cfg.entries.forEach(e => {
        assert(e.w >= 0 && isFinite(e.w), 'bad weight on ' + e.name);
        if (e.dsl) FW.parse(e.dsl);
      });
      assert(
        cfg.entries.some(e => e.w > 0),
        'nothing can win on: ' + cfg.title
      );
      seen.push(cfg);
      return FW.weightedIndex(cfg.entries, rng);
    },
  };
}
async function playSaga(seed, opts, ov) {
  const L = makeLegend(seed);
  const io = bot(seed);
  S.newSaga(L, opts, io.rng);
  let turns = 0;
  while (!L.saga.end && turns < 400) {
    await S.playTurn(L, io, opts, ov);
    turns++;
  }
  return { L, io, turns };
}

(async () => {
  await t('500 sagas always end, never crash, and their codes round-trip', async () => {
    const ends = {};
    let maxCh = 0,
      totalCh = 0,
      trimmed = 0;
    for (let i = 0; i < 500; i++) {
      const opts = {};
      S.OPTIONS.forEach(o => (opts[o.id] = (i + o.id.length) % 3 !== 0));
      const { L, turns } = await playSaga('saga' + i, opts);
      assert(L.saga.end, 'saga ' + i + ' never ended after ' + turns + ' turns');
      ends[L.saga.end] = (ends[L.saga.end] || 0) + 1;
      maxCh = Math.max(maxCh, L.saga.ch);
      totalCh += L.saga.ch;
      const c = FW.compute(L);
      assert(isFinite(c.rating), 'rating');
      const code = L.toCode(),
        L2 = FW.Legend.fromCode(code);
      assert(code.length <= S.CODE_MAX, 'code too long: ' + code.length);
      // a very long saga leaves its oldest ordinary lines out of the code (and says so); the rest is identical
      if (!L2.saga.cut) assert.strictEqual(FW.legendText(L2), FW.legendText(L));
      else trimmed++;
      assert.strictEqual(L2.saga.ch, L.saga.ch);
      assert.strictEqual(L2.saga.end, L.saga.end);
    }
    console.log(
      '       endings',
      JSON.stringify(ends),
      ' avg chapters',
      (totalCh / 500).toFixed(1),
      ' longest',
      maxCh,
      ' codes trimmed',
      trimmed
    );
    assert(trimmed <= 10, 'too many trimmed codes: ' + trimmed);
  });

  await t(
    'saga recap: counts every fight, names the notable ones, keeps the ending, survives a Legend Code',
    async () => {
      const opts = {};
      S.OPTIONS.forEach(o => (opts[o.id] = o.def !== false));
      let withFights = 0,
        withUpset = 0;
      for (let i = 0; i < 120; i++) {
        // count the battles the player is shown, to compare with the recap
        const { L, io } = await playSaga('recap' + i, opts);
        const r = S.recap(L);
        const battles = io.seen.filter(c => c.kind === 'battle').length;
        assert.strictEqual(r.fights.total, battles, 'every fight counted');
        assert.strictEqual(r.fights.won + r.fights.lost + r.fights.draw, r.fights.total);
        if (r.fights.total) {
          withFights++;
          assert(r.closest && r.closest.foe && r.closest.p >= 0 && r.closest.p <= 1, 'a closest fight');
        }
        if (r.upset) {
          withUpset++;
          assert(r.upset.p < 0.5, 'an upset is a win at bad odds');
        }
        if (r.heartbreak) assert(r.heartbreak.p > 0.5, 'a cruel loss is a loss at good odds');
        assert(r.timeline.length >= 1 && r.timeline.length <= S.RECAP_MAX, 'timeline size ' + r.timeline.length);
        assert(r.timeline[r.timeline.length - 1].end, 'the ending closes the timeline');
        for (let k = 1; k < r.timeline.length; k++) assert(r.timeline[k - 1].ch <= r.timeline[k].ch, 'in order');
        assert.strictEqual(r.chapters, L.saga.ch);
        if (r.ageEnd != null) assert.strictEqual(r.ageEnd - r.ageStart, L.saga.years);
        // through a Legend Code and back: the same recap
        const back = S.recap(FW.Legend.fromCode(L.toCode()));
        assert.deepStrictEqual(back.fights, r.fights);
        assert.deepStrictEqual(back.closest, r.closest);
        assert.deepStrictEqual(back.timeline, r.timeline);
      }
      assert(withFights > 60 && withUpset > 3, 'fights ' + withFights + ', upsets ' + withUpset);
      // a saga from before the recap (no fight record) still gets one, and junk is cleaned away
      const { L } = await playSaga('recap-old', opts);
      delete L.saga.fights;
      const r = S.recap(L);
      assert.deepStrictEqual(r.fights, { total: 0, won: 0, lost: 0, draw: 0 });
      assert(r.timeline.length && r.closest === null);
      assert.strictEqual(S.cleanFights('junk'), null);
      const c = S.cleanFights({ w: '2', l: 1, up: [3, 'x', -1], closest: { ch: 3, foe: 'X'.repeat(500), p: 7 } });
      assert(c.w === 2 && c.up.length === 1 && c.closest.foe.length === 80 && c.closest.p === 1);
    }
  );

  await t('Legend Codes stay short enough for card codes, even for a very long saga', async () => {
    const opts = {};
    S.OPTIONS.forEach(o => (opts[o.id] = o.def !== false));
    const { L } = await playSaga('long-code', opts);
    // an old save's log lines still carry empty fields and a leftover foe: the code leaves them out
    L.saga.log.forEach(x => Object.assign(x, { foe: 'the ambushers', arena: 'Swamp of Whispers', end: x.end || null }));
    const lean = L.toCode();
    assert(!/ambushers|Swamp of Whispers/.test(Buffer.from(lean.slice(4), 'base64').toString()), 'no leftover foe');
    // stuff it with ordinary chapters until the code would be far too long
    const keep = L.saga.log.slice();
    for (let i = 0; i < 400; i++)
      L.saga.log.splice(1, 0, { ch: 1, chapter: 'Train', emoji: '⚔️', text: 'Hours of practice. ' + 'x'.repeat(60) });
    const code = L.toCode();
    assert(code.length <= S.CODE_MAX, 'code is ' + code.length);
    const back = FW.Legend.fromCode(code);
    assert(back.saga.cut > 0, 'says lines were left out');
    assert.strictEqual(back.saga.end, L.saga.end);
    // every original line that is a turning point or the ending survives
    const byName = {};
    S.CHAPTERS.forEach(c => (byName[c.name] = c.id));
    keep
      .filter(x => x.end || S.TURNING[byName[x.chapter]])
      .forEach(x =>
        assert(
          back.saga.log.some(y => y.text === x.text),
          'kept: ' + x.text
        )
      );
    assert.strictEqual(L.saga.log.length, keep.length + 400, 'the saga itself is untouched');
  });

  await t('epilogues: a few sentences about what happened next, always the same for the same hero', async () => {
    const opts = {};
    S.OPTIONS.forEach(o => (opts[o.id] = o.def !== false));
    const seen = new Set();
    let withKingdom = 0,
      longOnes = 0;
    for (let i = 0; i < 150; i++) {
      const { L } = await playSaga('epi' + i, opts);
      const e = S.epilogue(L);
      assert(e.length >= 1 && e.length <= S.EPILOGUE_MAX, 'size ' + e.length);
      e.forEach(x => {
        assert(/^[A-Z"'].*[.!?]$/.test(x), 'a whole sentence: ' + x);
        assert(!/undefined|null|NaN|\{|\}|\bThe The\b|\s{2}/.test(x), 'clean text: ' + x);
        assert(!/[a-z] The [A-Z]/.test(x), 'a title inside a sentence starts with a small "the": ' + x);
        seen.add(x);
      });
      if (L.saga.kingdom && !L.saga.world) {
        withKingdom++;
        assert(
          e.some(x => x.indexOf(L.saga.kingdom.name) >= 0),
          'the kingdom is named'
        );
      }
      if (e.length >= 3) longOnes++;
      // the same hero, the same epilogue, also from a Legend Code
      assert.deepStrictEqual(S.epilogue(L), e);
      const back = FW.Legend.fromCode(L.toCode());
      if (!back.saga.cut) assert.deepStrictEqual(S.epilogue(back), e);
      assert(FW.legendText(L).indexOf('EPILOGUE') >= 0, 'in the shared text');
    }
    assert(withKingdom > 10 && longOnes > 30 && seen.size > 40, [withKingdom, longOnes, seen.size].join(' '));
    // no epilogue before the end
    const L = makeLegend('epi-open');
    S.newSaga(L, opts, FW.makeRng('x'));
    assert.deepStrictEqual(S.epilogue(L), []);
  });

  await t('used chapters turn grey and never land again; repeatable ones stay', async () => {
    for (let i = 0; i < 60; i++) {
      const { L, io } = await playSaga('grey' + i, {});
      const landed = {};
      io.seen
        .filter(c => c.kind === 'story')
        .forEach(c => {
          c.entries.filter(e => e.gray).forEach(e => assert.strictEqual(e.w, 0, e.name + ' grey but can land'));
          c.entries
            .filter(e => e.used)
            .forEach(e => assert(!S.CHAPTER_BY_ID[e.id].repeat && landed[e.id], e.id + ' marked used wrongly'));
          const pickedNow = L.saga.used;
          pickedNow.forEach(id => (landed[id] = true));
        });
      const once = L.saga.used;
      assert.strictEqual(new Set(once).size, once.length, 'a one-time chapter happened twice');
    }
  });

  await t('requirements: no world conquest before conquering a race (when on)', async () => {
    for (let i = 0; i < 150; i++) {
      const L = makeLegend('req' + i);
      const io = bot('req' + i);
      S.newSaga(L, {}, io.rng);
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
      assert(!S.MORTAL[L.saga.end], 'died with death off (' + L.saga.end + '): ' + L.saga.endText);
      assert(!io.seen.some(c => /Does your body hold/.test(c.title)), 'old age wheel shown');
      assert(!io.seen.some(c => /^News from/.test(c.title)), 'kingdom event shown');
    }
  });

  await t('nemesis off: no nemesis chapters; loyalty off: no betrayal; a rival appears instead', async () => {
    for (let i = 0; i < 80; i++) {
      const { L, io } = await playSaga('nonem' + i, { nemesis: false, loyalty: false });
      assert(!L.saga.nem, 'nemesis created');
      io.seen
        .filter(c => c.kind === 'story')
        .forEach(c =>
          c.entries.forEach(e => assert(['nemesis', 'showdown', 'betrayal'].indexOf(e.id) < 0, e.id + ' on the wheel'))
        );
    }
    const L = makeLegend('withnem');
    S.newSaga(L, {}, FW.makeRng('x'));
    const ids = S.wheelEntries(L, {}).map(e => e.id);
    assert(ids.indexOf('nemesis') >= 0 && ids.indexOf('rival') < 0);
  });

  await t('Workshop can remove chapters, but never Retire', async () => {
    const L = makeLegend('ws');
    S.newSaga(L, {}, FW.makeRng('ws'));
    const ents = S.wheelEntries(L, {}, { removed: ['Plague', 'Cursed', 'Retire'] });
    assert(!ents.some(e => e.id === 'plague' || e.id === 'curse'));
    assert(ents.some(e => e.id === 'retire'));
  });

  await t('Retire grows a little each chapter', async () => {
    const L = makeLegend('ret');
    S.newSaga(L, {}, FW.makeRng('ret'));
    const w0 = S.retireWeight(L, S.opts());
    L.saga.ch = 10;
    const w10 = S.retireWeight(L, S.opts());
    assert(w10 > w0 && w10 < 8, w0 + ' -> ' + w10);
  });

  await t('dynasty: an heir inherits house, kingdom and a family talent', async () => {
    let checked = 0;
    for (let i = 0; i < 300 && checked < 15; i++) {
      const { L } = await playSaga('dyn' + i, {});
      if (!S.canContinue(L, {})) continue;
      const inh = S.inheritance(L);
      const child = makeLegend('child' + i);
      S.startHeir(child, inh, {}, FW.makeRng('c' + i));
      assert.strictEqual(child.saga.dyn.house, L.saga.dyn.house);
      assert.strictEqual(child.saga.dyn.gen, L.saga.dyn.gen + 1);
      if (L.saga.kingdom) assert.strictEqual(child.saga.kingdom.name, L.saga.kingdom.name);
      assert(child.chron.some(x => /Inheritance/.test(x.label)));
      // the family trait and the house history pass down
      assert(child.saga.dyn.trait && child.saga.dyn.trait.name === L.saga.dyn.trait.name, 'trait kept');
      assert(child.chron.some(x => x.label === 'Family trait: ' + child.saga.dyn.trait.name));
      const tree = S.familyTree(child);
      assert.strictEqual(tree.length, child.saga.dyn.gen, 'one line per generation');
      assert.strictEqual(tree[tree.length - 2].name, L.displayName());
      assert(tree[tree.length - 1].current);
      FW.Legend.fromCode(child.toCode());
      // a third generation: renown grows with the house (up to +3)
      if (checked === 0) {
        child.saga.end = 'retired';
        child.saga.heir = { name: 'Third', kind: 'daughter' };
        const inh3 = S.inheritance(child);
        assert(/rt\+2$/.test(inh3.dsl), inh3.dsl);
        const g3 = makeLegend('grandchild' + i);
        S.startHeir(g3, inh3, {}, FW.makeRng('g' + i));
        assert.strictEqual(g3.saga.dyn.gen, L.saga.dyn.gen + 2);
        assert.strictEqual(S.familyTree(g3).length, g3.saga.dyn.gen);
      }
      checked++;
    }
    assert(checked >= 5, 'too few heirs to test: ' + checked);
    const { L } = await playSaga('dynoff', { dynasty: false });
    assert(!S.canContinue(L, { dynasty: false }));
  });

  await t('story arcs happen in order, reach their finale, and every ending can happen', async () => {
    const after = { omen: 'oracle', fate: 'omen', debt: 'pact', awaken: 'seal', lastStand: 'awaken' };
    const reached = {},
      ends = {};
    for (let i = 0; i < 1500; i++) {
      const L = makeLegend('arc' + i);
      const io = bot('arc' + i);
      S.newSaga(L, {}, io.rng);
      const done = [];
      while (!L.saga.end && done.length < 400) {
        const ch = await S.playTurn(L, io, {});
        done.push(ch.id);
        reached[ch.id] = true;
        if (after[ch.id]) {
          const k = done.indexOf(after[ch.id]);
          assert(k >= 0 && k < done.length - 1, ch.id + ' before ' + after[ch.id]);
        }
        if (ch.id === 'heirGrown' || ch.id === 'succession')
          assert(done.indexOf('heir') >= 0, ch.id + ' without an heir');
      }
      ends[L.saga.end] = (ends[L.saga.end] || 0) + 1;
      if (S.NO_HEIR[L.saga.end]) assert(!S.canContinue(L, {}), L.saga.end + ' still lets an heir continue');
    }
    [
      'fate',
      'debt',
      'lastStand',
      'heirGrown',
      'siege',
      'voyage',
      'heist',
      'haunted',
      'mentor',
      'duel',
      'succession',
      'found',
    ].forEach(id => assert(reached[id], 'never reached: ' + id));
    Object.keys(S.endLabel).forEach(e => {
      assert(S.endIcon[e], 'no icon for ' + e);
      assert(ends[e] || e === 'ascended', 'ending never happened: ' + e);
    });
    console.log('       endings', JSON.stringify(ends));
  });

  await t(
    'choices: the player picks at key moments, every option leads somewhere, and a bot without choose still plays',
    async () => {
      const titles = {};
      for (let i = 0; i < 300; i++) {
        const L = makeLegend('choice' + i);
        const io = bot('choice' + i);
        let k = 0;
        io.choose = async cfg => {
          assert(cfg.options.length >= 2, 'a choice needs two options: ' + cfg.title);
          cfg.options.forEach(o => assert(o.label, 'option without a label'));
          titles[cfg.title.replace(/^.*? (wakes|is beaten)/, '... $1')] = 1;
          return k++ % cfg.options.length; // walk through every option
        };
        S.newSaga(L, {}, io.rng);
        for (let n = 0; !L.saga.end && n < 400; n++) await S.playTurn(L, io, {});
        assert(L.saga.end, 'saga with choices never ended');
      }
      const seen = Object.keys(titles).join(' | ');
      ['... wakes. What do you do?', '... is beaten. What do you do?', '... is beaten. Mercy?'].forEach(x =>
        assert(seen.indexOf(x) >= 0, 'never asked: ' + x + ' (saw ' + seen + ')')
      );
    }
  );

  await t(
    'chapters react to the hero: a fitting class or nature helps, an unfitting one hurts, and says why',
    async () => {
      const L = makeLegend('fit');
      const pickName = L.pickName.bind(L),
        has = L.has.bind(L);
      // pretend the hero is a Rogue Trickster, then a Paladin Lawful Good, then a Commoner Shy
      const as = (cls, per) => {
        L.pickName = id => (id === 'cls' ? cls : id === 'per' ? per : pickName(id));
        L.has = id => (id === 'cls' || id === 'per' ? true : has(id));
      };
      as('Rogue', 'Trickster');
      let f = S.fit(L, 'heist');
      assert(f.m > 1 && /Rogue class/.test(f.why) && /help/.test(f.why), JSON.stringify(f));
      as('Paladin', 'Lawful Good');
      f = S.fit(L, 'heist');
      assert(f.m < 1 && /against you/.test(f.why), JSON.stringify(f));
      as('Commoner', 'Cheerful');
      f = S.fit(L, 'heist');
      assert.strictEqual(f.m, 1);
      Object.keys(S.FIT).forEach(k => assert(S.FIT[k].what, 'fit ' + k + ' needs a description'));
    }
  );

  await t(
    'generated names: the same seed gives the same names, rivals get an epithet, nothing unpronounceable',
    async () => {
      const N = FW.Names;
      assert.strictEqual(N.person(FW.makeRng('names'), 'Elf'), N.person(FW.makeRng('names'), 'Elf'));
      const rng = FW.makeRng('many');
      for (let i = 0; i < 400; i++) {
        const p = N.person(rng, N.STYLES[i % N.STYLES.length]);
        assert(/^[A-Z][a-z]{3,9}$/.test(p), 'odd name: ' + p);
        assert(!/[aeiou]{3}|([aeiou])\1/i.test(p), 'hard to say: ' + p);
      }
      assert(/^\S+ (the |[A-Z])/.test(N.nemesis(rng, 'Orc')));
      assert(/^House [A-Z][a-z]+$/.test(N.house(rng)));
      assert(/^The [A-Z]/.test(N.ship(rng)));
      assert.strictEqual(N.styleFor('Dark Elf'), 'elven');
      assert.strictEqual(N.styleFor('Orc'), 'orcish');
      assert.strictEqual(N.styleFor('Human'), 'human');
    }
  );

  await t(
    'old legends: only Hall heroes who lived or cheated death return, and they can appear in a saga',
    async () => {
      const hall = [
        { title: 'Ayla, The Pale One', rating: 40, saga: { end: 'retired', who: 'Ayla', cheated: 2 } },
        { title: 'Borin, The Iron One', rating: 55, saga: { end: 'dead', who: 'Borin' } },
        { title: 'Cael, The Void One', rating: 70, saga: { end: 'undying', who: 'Cael' } },
        { title: 'Dara, The Bold One', rating: 30, saga: { end: 'martyr', who: 'Dara' } },
        { title: 'Eryn, The Quiet One', rating: 35 }, // a card without a saga: still alive
      ];
      S.hallSource = () => hall;
      try {
        const L = makeLegend('legends');
        S.newSaga(L, {}, FW.makeRng('x'));
        assert.deepStrictEqual(S.oldLegends(L).map(S.heroName), ['Ayla', 'Cael', 'Eryn']);
        assert.strictEqual(S.returnPhrase(hall[0]), 'who has cheated death 2 times');
        assert.strictEqual(S.returnPhrase(hall[2]), 'who cheated death itself');
        const ch = S.wheelEntries(L, {}).find(e => e.id === 'oldLegend');
        assert(ch && ch.w > 0, 'the chapter is on the story wheel');
        assert(!S.wheelEntries(L, { returning: false }).some(e => e.id === 'oldLegend'), 'the option turns it off');
        let met = 0;
        for (let i = 0; i < 300 && met < 5; i++) {
          const { L: M } = await playSaga('legend' + i, {});
          if (M.saga.flags.oldLegend) {
            met++;
            assert(['Ayla', 'Cael', 'Eryn'].includes(M.saga.flags.oldLegend), 'a dead hero came back');
            assert(M.saga.log.some(x => x.chapter === 'An old legend returns'));
          }
        }
        assert(met >= 5, 'old legends almost never appear (' + met + ' in 300 sagas)');
      } finally {
        S.hallSource = null;
      }
      const L = makeLegend('nohall');
      S.newSaga(L, {}, FW.makeRng('x'));
      assert(!S.wheelEntries(L, {}).some(e => e.id === 'oldLegend'), 'no Hall, no chapter');
    }
  );

  await t('death lines and close calls come in variants, fixed by the seed, and close calls are counted', async () => {
    const deaths = new Set(),
      saves = new Set();
    let cheated = 0;
    for (let i = 0; i < 400; i++) {
      const { L } = await playSaga('die' + i, {});
      L.saga.log.forEach(x => {
        assert(typeof x.text === 'string' && x.text.indexOf(',{') < 0 && x.text.indexOf('{') < 0, 'bad line ' + x.text);
        if (x.end === 'dead') deaths.add(x.text.replace(/\d+/g, 'N'));
        const cc = S.CLOSE_CALLS.find(c => x.text.indexOf(c) === 0);
        if (cc) saves.add(cc);
      });
      cheated += L.saga.flags.cheated || 0;
    }
    assert(saves.size >= 4, 'close calls barely vary: ' + saves.size);
    assert(cheated > 50, 'close calls are not counted');
    assert(deaths.size >= 25, 'only ' + deaths.size + ' different death lines');
    const a = await playSaga('die7', {}),
      b = await playSaga('die7', {});
    assert.deepStrictEqual(a.L.saga.log, b.L.saga.log, 'the same seed tells the same story');
  });

  const ctxFor = (L, io, id) => {
    const ch = S.CHAPTER_BY_ID[id];
    return { o: S.opts(), ch: id, chName: ch ? ch.name : id, emoji: '', rng: io.rng };
  };

  await t('ancestor spirits: an heir is saved from death once by the nearest ancestor', async () => {
    const L = makeLegend('anc');
    S.newSaga(L, {}, FW.makeRng('a'), {
      dyn: { house: 'House Test', gen: 1, history: [] },
      parent: 'Old Brann',
      record: { gen: 1, name: 'Old Brann, The Iron One', end: 'dead' },
    });
    L.saga.flags.petSaved = 'x'; // the companion has used its save already
    const ctx = { o: S.opts(), ch: 'boss', chName: 'Boss', rng: () => 0.99 };
    const e = S.apply(L, { name: 'Killed', w: 1, text: 'dies', tone: 'bad', end: 'dead' }, ctx);
    assert(!e.end, 'the ancestor saved the heir');
    assert.strictEqual(L.saga.flags.ancestor, 'Old Brann');
    assert(/Old Brann/.test(L.saga.log[L.saga.log.length - 1].text), 'the log names the ancestor');
    const e2 = S.apply(L, { name: 'Killed', w: 1, text: 'dies', tone: 'bad', end: 'dead' }, ctx);
    assert.strictEqual(e2.end, 'dead', 'only once per saga');
    const M = makeLegend('anc2');
    S.newSaga(M, {}, FW.makeRng('a'));
    M.saga.flags.petSaved = 'x';
    assert.strictEqual(S.apply(M, { name: 'Killed', w: 1, text: 'x', end: 'dead' }, ctx).end, 'dead', 'no ancestors');
  });

  await t('alignment: nature sets the start, choices and deeds move it, and it tilts the story wheel', async () => {
    const L = makeLegend('align');
    S.newSaga(L, {}, FW.makeRng('a'));
    L.saga.flags.align = 0;
    S.drift(L.saga, 9);
    assert.strictEqual(S.align(L.saga), S.ALIGN_MAX, 'clamped');
    assert.strictEqual(S.alignName(5), 'Saintly');
    assert.strictEqual(S.alignName(-2), 'Dark');
    const w = id => S.wheelEntries(L, {}).find(e => e.id === id).w;
    const good5 = w('quest'),
      evil5 = w('heist');
    L.saga.flags.align = 0;
    assert(good5 > w('quest') && evil5 < w('heist'), 'a good hero sees more good chapters, fewer dark ones');
    const io = bot('align');
    await S.choose(L, io, ctxFor(L, io, 'boss'), {
      title: 'x',
      options: [
        { label: 'a', align: -1 },
        { label: 'b', align: -1 },
      ],
    });
    assert.strictEqual(S.align(L.saga), -1, 'a cruel choice pulls towards evil');
    let moved = 0;
    for (let i = 0; i < 60; i++) if (S.align((await playSaga('al' + i, {})).L.saga)) moved++;
    assert(moved > 30, 'alignment rarely moves (' + moved + ' of 60)');
  });

  await t(
    'world events: one at a time, a few chapters long, boosting their chapters; the option turns them off',
    async () => {
      const seen = {};
      let n = 0;
      for (let i = 0; i < 150; i++) {
        const { L } = await playSaga('ev' + i, {});
        (L.saga.flags.events || []).forEach(id => (seen[id] = (seen[id] || 0) + 1));
        n += (L.saga.flags.events || []).length;
        L.saga.log.forEach(x => assert(x.text.indexOf('{') < 0));
      }
      assert(n > 20, 'world events are too rare: ' + n);
      assert(Object.keys(seen).length >= 5, 'only some events happen: ' + Object.keys(seen));
      const L = makeLegend('ev');
      S.newSaga(L, {}, FW.makeRng('a'));
      const before = S.wheelEntries(L, {}).find(e => e.id === 'dragon').w;
      L.saga.flags.event = { id: 'dragons', left: 3 };
      assert(S.wheelEntries(L, {}).find(e => e.id === 'dragon').w > before * 2, 'the dragon migration brings dragons');
      assert.strictEqual(S.wheelEntries(L, { worldEvents: false }).find(e => e.id === 'dragon').w, before);
      S.tickEvent(L.saga);
      S.tickEvent(L.saga);
      S.tickEvent(L.saga);
      assert(!L.saga.flags.event, 'it runs out');
      for (let i = 0; i < 40; i++) {
        const { L: M } = await playSaga('ev' + i, { worldEvents: false });
        assert(!(M.saga.flags.events || []).length, 'events with the option off');
      }
    }
  );

  await t(
    'secret chapters: hidden unless the hero fits, every one plays through, and finding one is reported',
    async () => {
      assert(S.SECRETS.length >= 5);
      for (const ch of S.SECRETS) {
        assert(ch.secret && ch.hideLocked && ch.hard && ch.w <= 0.5, ch.id + ' is not a secret');
        for (let i = 0; i < 25; i++) {
          const L = makeLegend('sec' + ch.id + i),
            io = bot('sec' + ch.id + i);
          S.newSaga(L, {}, io.rng);
          const on = S.wheelEntries(L, {}).some(e => e.id === ch.id);
          assert.strictEqual(on, !!ch.req(L.saga, L, S.opts()), ch.id + ' shows for a hero who does not fit');
          await ch.run(L, io, ctxFor(L, io, ch.id));
          L.saga.log.forEach(x => assert(x.text.indexOf('{') < 0, 'unfilled: ' + x.text));
        }
      }
      const found = [];
      S.onSecret = id => found.push(id);
      try {
        const L = makeLegend('secfind'),
          io = bot('secfind');
        S.newSaga(L, {}, io.rng);
        const ch = S.SECRETS[0];
        const req = ch.req;
        ch.req = () => true;
        try {
          io.spin = async cfg => (cfg.kind === 'story' ? cfg.entries.findIndex(e => e.id === ch.id) : 0);
          await S.playTurn(L, io, {});
        } finally {
          ch.req = req;
        }
        assert.deepStrictEqual(found, [ch.id]);
        assert.deepStrictEqual(L.saga.flags.secrets, [ch.id]);
        assert.deepStrictEqual(S.recap(L).secrets, [ch.name]);
      } finally {
        S.onSecret = null;
      }
    }
  );

  await t('retirement is playable: a retired hero picks how to spend the quiet years', async () => {
    const names = S.AFTER.retired.entries.map(e => e.name);
    let n = 0;
    for (let i = 0; i < 200; i++) {
      const { L } = await playSaga('ret' + i, {});
      if (L.saga.end !== 'retired') continue;
      n++;
      assert(names.indexOf(L.saga.flags.after) >= 0, 'no retirement chapter: ' + L.saga.flags.after);
    }
    assert(n > 30, 'too few retirements to check: ' + n);
    for (let i = 0; i < 40; i++) {
      const { L } = await playSaga('ret' + i, { beyond: false });
      if (L.saga.end === 'retired') assert(!L.saga.flags.after, 'the option turns it off');
    }
    S.AFTER.retired.choice.options.forEach(o =>
      o.keep.forEach(k => assert(names.indexOf(k) >= 0, 'option keeps a missing result: ' + k))
    );
  });

  await t('guild ranks: work your way up, then fight for the top', async () => {
    const L = makeLegend('guild'),
      io = bot('guild');
    S.newSaga(L, {}, io.rng);
    const ids = () => S.wheelEntries(L, {}).map(e => e.id);
    assert(ids().indexOf('guildWork') < 0, 'guild work without a guild');
    L.saga.guild = "Mages' Circle";
    L.saga.flags.guildRank = 1;
    assert.strictEqual(S.rankName(L.saga), 'Initiate');
    assert(ids().indexOf('guildWork') >= 0 && ids().indexOf('guildMaster') < 0);
    L.saga.flags.guildRank = 4;
    assert(ids().indexOf('guildMaster') >= 0 && ids().indexOf('guildWork') < 0, 'officers fight for the top');
    L.saga.flags.guildRank = 5;
    assert.strictEqual(S.rankName(L.saga), 'Archmage');
    assert(ids().indexOf('guildMaster') < 0);
    let top = 0,
      ranked = 0;
    for (let i = 0; i < 300; i++) {
      const { L: M } = await playSaga('gr' + i, {});
      if (S.guildRank(M.saga) >= 2) ranked++;
      if (S.guildRank(M.saga) >= 4) top++;
    }
    assert(ranked > 20, 'nobody rises in a guild: ' + ranked);
    assert(top > 0, 'nobody ever gets near the top of a guild');
    // the fight for the top: a win makes the hero head of the guild
    let won = false;
    for (let i = 0; i < 40 && !won; i++) {
      const M = makeLegend('gm' + i),
        io2 = bot('gm' + i);
      S.newSaga(M, {}, io2.rng);
      M.saga.guild = "Thieves' Guild";
      M.saga.flags.guildRank = 4;
      await S.CHAPTER_BY_ID.guildMaster.run(M, io2, ctxFor(M, io2, 'guildMaster'));
      if (S.guildRank(M.saga) === 5) won = S.rankName(M.saga) === 'Master of Shadows';
    }
    assert(won, 'nobody wins the fight for the top');
  });

  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
