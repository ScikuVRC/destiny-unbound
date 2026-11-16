/* Save format tests: saves made by older releases still load, the startup migration keeps a copy and runs once,
   saves from a newer game are left alone, and a failed write is reported.
   The files in tests/saves/ were made by each release's own code (heroes, sagas, Hall, achievements, settings).
   When a release changes how something is saved, add a file for it here.
   Run: node tests/save.test.js */
const assert = require('assert'),
  fs = require('fs'),
  path = require('path');
const root = path.join(__dirname, '..');
globalThis.window = globalThis;
globalThis.__noSaveRun = true; // the tests run the startup step themselves
['version.js', 'save.js', 'data.js', 'engine.js', 'story.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
const FW = globalThis.FW,
  SAVE = FW.Save,
  S = FW.Story;

function memStore(init) {
  const mem = Object.assign({}, init);
  return {
    mem,
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = String(v);
    },
    removeItem: k => {
      delete mem[k];
    },
    key: i => Object.keys(mem)[i],
    get length() {
      return Object.keys(mem).length;
    },
  };
}
const dir = path.join(__dirname, 'saves');
const saves = fs
  .readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const get = (ls, k) => JSON.parse(ls.getItem(k));

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
      '  FAIL ' +
        name +
        '\n       ' +
        String((e && e.stack) || e)
          .split('\n')
          .slice(0, 3)
          .join('\n       ')
    );
  }
}

(async () => {
  await t('there are saves from at least four releases, the oldest from the first alpha', () => {
    assert(saves.length >= 4, saves.length);
    assert(saves.some(s => s.game === '0.1.0-alpha.1'));
  });

  await t('every step up to the current layout exists', () => {
    for (let n = 1; n <= SAVE.SCHEMA; n++) assert.strictEqual(typeof SAVE.STEPS[n], 'function', 'step ' + n);
  });

  for (const s of saves) {
    await t(s.game + ': loads, keeps a copy, and every hero and saga still works', async () => {
      const ls = memStore(s.data);
      const r = SAVE.run(ls);
      assert(!r.error, r.error);
      assert.strictEqual(r.from, SAVE.schemaOf(s.data));
      assert.strictEqual(ls.getItem('fw.schema'), String(SAVE.SCHEMA));
      if (r.from < SAVE.SCHEMA) {
        assert(r.migrated);
        assert.deepStrictEqual(SAVE.premigrate(ls).data, s.data, 'untouched copy kept');
      }
      // no key was lost, and every key is still valid JSON
      Object.keys(s.data).forEach(k => {
        assert(ls.getItem(k) != null, 'lost ' + k);
        JSON.parse(ls.getItem(k));
      });
      // settings: a theme the game has
      const set = get(ls, 'fw.settings');
      assert(['ashen', 'astral', 'iron', 'bloodmoon'].includes(set.theme), set.theme);
      // Hall of Legends: every hero opens, with the same rank it was saved with
      const hall = get(ls, 'fw.hall');
      assert(hall.length >= 3);
      for (const h of hall) {
        const L = FW.Legend.fromCode(h.code);
        const c = FW.compute(L);
        assert.strictEqual(c.rank, h.rank, h.title);
        assert(L.raceName());
        if (h.saga) assert(L.saga && L.saga.ch > 0, 'saga kept for ' + h.title);
      }
      // the last legend: an unfinished saga carries on with today's story code
      const last = get(ls, 'fw.last');
      const L = FW.Legend.fromCode(last.code);
      assert(L.saga && !L.saga.end && L.saga.ch === last.ch);
      const rng = FW.makeRng('carry-on');
      const io = { rng, spin: async cfg => FW.weightedIndex(cfg.entries, rng) };
      for (let n = 0; n < 6 && !L.saga.end; n++) await S.playTurn(L, io, {});
      assert(L.saga.ch > last.ch, 'saga moved on');
      FW.Legend.fromCode(L.toCode());
      // achievements: the ids still exist in the game
      const ach = fs.readFileSync(path.join(root, 'app', 'js', 'achievements.js'), 'utf8');
      Object.keys(get(ls, 'fw.achievements')).forEach(id => assert(ach.includes("id: '" + id + "'"), id));
    });
  }

  await t('theme names from before the first alpha become today’s themes', () => {
    const ls = memStore({ 'fw.settings': JSON.stringify({ theme: 'neon', luck: 'mythic' }) });
    SAVE.run(ls);
    assert.deepStrictEqual(get(ls, 'fw.settings'), { theme: 'iron', luck: 'mythic' });
    assert.strictEqual(JSON.parse(SAVE.premigrate(ls).data['fw.settings']).theme, 'neon');
  });

  await t('a mod theme name is left alone', () => {
    const ls = memStore({ 'fw.settings': JSON.stringify({ theme: 'ember-dominion' }) });
    SAVE.run(ls);
    assert.strictEqual(get(ls, 'fw.settings').theme, 'ember-dominion');
  });

  await t('runs once: an up-to-date save is not touched again', () => {
    const ls = memStore(saves[0].data);
    SAVE.run(ls);
    const after = Object.assign({}, ls.mem);
    const r = SAVE.run(ls);
    assert(!r.migrated);
    assert.deepStrictEqual(ls.mem, after);
  });

  await t('a new player gets the current layout and no copy', () => {
    const ls = memStore({});
    const r = SAVE.run(ls);
    assert(!r.migrated);
    assert.strictEqual(ls.getItem('fw.schema'), String(SAVE.SCHEMA));
    assert.strictEqual(SAVE.premigrate(ls), null);
  });

  await t('a save from a newer game is left exactly as it is', () => {
    const data = Object.assign({}, saves[0].data, { 'fw.schema': String(SAVE.SCHEMA + 5) });
    const ls = memStore(data);
    const r = SAVE.run(ls);
    assert(r.newer && !r.migrated);
    assert.deepStrictEqual(ls.mem, data);
  });

  await t('a damaged key is kept as it is and does not stop the rest', () => {
    const ls = memStore({ 'fw.hall': '{broken', 'fw.settings': JSON.stringify({ theme: 'gilded' }) });
    const r = SAVE.run(ls);
    assert(!r.error, r.error);
    assert.strictEqual(ls.getItem('fw.hall'), '{broken');
    assert.strictEqual(get(ls, 'fw.settings').theme, 'ashen');
  });

  await t('if a step fails, nothing is written and the layout number stays', () => {
    const ls = memStore({ 'fw.settings': JSON.stringify({ theme: 'neon' }) });
    const real = SAVE.STEPS[1];
    SAVE.STEPS[1] = () => {
      throw new Error('boom');
    };
    try {
      const r = SAVE.run(ls);
      assert(r.error && /boom/.test(r.error));
    } finally {
      SAVE.STEPS[1] = real;
    }
    assert.deepStrictEqual(ls.mem, { 'fw.settings': JSON.stringify({ theme: 'neon' }) });
  });

  await t('migrate() never changes what it is given', () => {
    const raw = { 'fw.settings': JSON.stringify({ theme: 'classic' }) };
    const copy = JSON.parse(JSON.stringify(raw));
    const m = SAVE.migrate(raw, 0);
    assert.deepStrictEqual(raw, copy);
    assert.deepStrictEqual(m.changed, ['fw.settings']);
  });

  await t('a full or blocked storage is reported once, even before the game can show messages', () => {
    const full = Object.assign(new Error('quota'), { name: 'QuotaExceededError' });
    globalThis.localStorage = {
      setItem: () => {
        throw full;
      },
    };
    assert.strictEqual(SAVE.write('fw.hall', '[]'), false);
    assert.strictEqual(SAVE.write('fw.daily', '{}'), false);
    const seen = [];
    SAVE.setWarn(why => seen.push(why));
    assert.deepStrictEqual(seen, ['full']);
    SAVE.write('fw.hall', '[]');
    assert.strictEqual(seen.length, 1);
    delete globalThis.localStorage;
  });

  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  if (fail) process.exit(1);
})();
