/* Tests for the alpha systems: version, preferences, save export/import checks and the title-screen data.
   Run: node tests/system.test.js */
const assert = require('assert'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const mem = {};
globalThis.window = globalThis;
globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; }, key: i => Object.keys(mem)[i], get length() { return Object.keys(mem).length; } };
['version.js', 'prefs.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
const FW = globalThis.FW;
let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + String(e && e.stack || e).split('\n').slice(0, 3).join('\n       ')); } }

t('the game version matches package.json', () => {
  assert.strictEqual(FW.VERSION, require(path.join(root, 'package.json')).version);
});

t('preferences have safe defaults and survive a reload', () => {
  assert.strictEqual(FW.prefs.anim, 'full'); assert.strictEqual(FW.prefs.keys.advance, ' ');
  assert.strictEqual(FW.spinDuration('normal'), 4600); assert.strictEqual(FW.spinDuration('fast'), 2300);
  FW.prefs.anim = 'off'; assert.strictEqual(FW.spinDuration('normal'), 250);
  FW.prefs.anim = 'full'; FW.prefs.reduceMotion = true; assert.strictEqual(FW.spinDuration('normal'), 1200);
  FW.prefs.reduceMotion = false; FW.prefs.fps = 60; assert(Math.abs(FW.frameGap() - 15.67) < 0.1);
  FW.prefs.quality = 'low'; assert.strictEqual(FW.maxDpr(), 1);
  FW.savePrefs(); const back = JSON.parse(mem['fw.prefs']); assert.strictEqual(back.quality, 'low'); assert.strictEqual(back.keys.back, 'Escape');
  FW.resetPrefs(); assert.strictEqual(FW.prefs.quality, 'high'); assert.strictEqual(FW.prefs.fps, 0);
});

t('colour-blind-safe palette has seven distinct slice colours', () => {
  assert.strictEqual(FW.CB_PAL.length, 7); assert.strictEqual(new Set(FW.CB_PAL.map(p => p[0])).size, 7);
});

t('the save checker accepts a real save and refuses anything else', () => {
  // load system.js's checker in isolation (it needs only FW and FWApp stubs)
  const src = fs.readFileSync(path.join(root, 'app', 'js', 'system.js'), 'utf8');
  const start = src.indexOf('SYS.check = function'), end = src.indexOf('/* replace the current save');
  const SYS = {}; new Function('SYS', src.slice(start, end))(SYS);
  const good = { format: 'destiny-unbound-save', version: 1, data: { 'fw.hall': '[]', 'fw.settings': '{"theme":"astral"}' } };
  assert.strictEqual(SYS.check(JSON.stringify(good)).data['fw.hall'], '[]');
  assert.throws(() => SYS.check('not json'), /not a save/);
  assert.throws(() => SYS.check('{"format":"fatewheel-pack"}'), /not a Destiny Unbound save/);
  assert.throws(() => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: {} })), /empty/);
  assert.throws(() => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: { 'evil': 'x' } })), /unexpected/);
  assert.throws(() => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: { 'fw.hall': '{broken' } })), /damaged/);
  assert.throws(() => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: { 'fw.hall': 5 } })), /unexpected/);
});

t('exported saves never contain API keys', () => {
  const src = fs.readFileSync(path.join(root, 'app', 'js', 'system.js'), 'utf8');
  const start = src.indexOf('SYS.collect = function'), end = src.indexOf('SYS.check = function');
  Object.keys(mem).forEach(k => delete mem[k]);
  mem['fw.art'] = JSON.stringify({ remember: true, img: { cfgs: { openai: { key: 'sk-secret', model: 'x' } } }, llm: { cfgs: { claude: { key: 'sk-2' } } } });
  mem['fw.hall'] = '[]'; mem['du.log'] = '[]';
  const SYS = {}; new Function('SYS', 'FW', 'localStorage', src.slice(start, end))(SYS, { VERSION: 'test' }, globalThis.localStorage);
  const out = JSON.stringify(SYS.collect());
  assert(!/sk-secret|sk-2/.test(out), 'keys leaked'); assert(/openai/.test(out)); assert(!/du\.log/.test(out));
});

t('the title screens have art, a logo and a tagline for every built-in theme', () => {
  const css = fs.readFileSync(path.join(root, 'app', 'css', 'menu.css'), 'utf8');
  const data = fs.readFileSync(path.join(root, 'app', 'js', 'menu-data.js'), 'utf8');
  ['ashen', 'astral', 'iron', 'bloodmoon'].forEach(k => {
    ['bg', 'wheel', 'logo'].forEach(p => assert(fs.existsSync(path.join(root, 'app', 'art', k + '-' + p + '.jpg')), k + '-' + p));
    assert(css.indexOf('[data-look="' + k + '"]') >= 0, 'css ' + k); assert(data.indexOf('"' + k + '"') >= 0, 'tag ' + k);
  });
});

t('every script the page loads exists and is cached for offline play', () => {
  const html = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'app', 'sw.js'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="((?:js|css|lang|icons)\/[^"?]+)/g)].map(m => m[1]);
  assert(refs.length > 20);
  refs.forEach(r => { assert(fs.existsSync(path.join(root, 'app', r)), 'missing ' + r); if (!/^icons\//.test(r) || /favicon|192/.test(r)) assert(sw.indexOf("'" + r + "'") >= 0, 'not cached offline: ' + r); });
});

t('the arena gives weak heroes fewer hopeless fights but never hides a foe', () => {
  ['data.js', 'data-more.js', 'data-extra.js', 'engine.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
  const L = new FW.Legend({ luck: 'mortal', seed: 'mm' }), rng = FW.makeRng('mm'); let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) { const st = FW.buildStage(FW.STAGES[i].id, L); FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng); }
  const r = FW.compute(L).baseRating;
  FW.UNIVERSES.forEach(u => {
    const plain = FW.oppEntries(u), fair = FW.oppEntries(u, L);
    assert.strictEqual(fair.length, u.opps.length);
    fair.forEach((o, k) => {
      assert(o.w > 0 && o.w >= plain[k].w * 0.1 - 1e-9, 'a foe vanished or shrank too far: ' + o.name);
      if (FW.P(o).lv <= r + 4) assert(Math.abs(o.w - plain[k].w) < 1e-9, 'a fair foe changed: ' + o.name);
    });
  });
});

console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
