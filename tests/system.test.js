/* Tests for the alpha systems: version, preferences, save export/import checks and the title-screen data.
   Run: node tests/system.test.js */
const assert = require('assert'),
  fs = require('fs'),
  path = require('path');
const root = path.join(__dirname, '..');
const mem = {};
globalThis.window = globalThis;
globalThis.localStorage = {
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
['version.js', 'prefs.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
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

t('the game version matches package.json', () => {
  assert.strictEqual(FW.VERSION, require(path.join(root, 'package.json')).version);
});

t('every version and cache number agrees (scripts/bump-version.js --check)', () => {
  const bad = require('../scripts/bump-version.js').check(root);
  assert.deepStrictEqual(bad, []);
});

t('a release bump on a copy changes every place at once and still checks out', () => {
  const B = require('../scripts/bump-version.js');
  const os = require('os'),
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'du-bump-'));
  const list = [
    'package.json',
    'package-lock.json',
    'app/js/version.js',
    'README.md',
    '.github/ISSUE_TEMPLATE/bug.yml',
    'docs/alpha-testing.md',
    'progress.md',
    'ROADMAP.md',
    'CHANGELOG.md',
    'app/index.html',
    'app/sw.js',
  ];
  for (const f of list) {
    fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true });
    fs.copyFileSync(path.join(root, f), path.join(tmp, f));
  }
  const F = B.files(tmp);
  const before = B.files(tmp),
    oldV = +/\?v=(\d+)/.exec(before.get('app/index.html'))[1];
  const done = B.release(F, '9.9.9-alpha.1', {
    summary: 'A test bump',
    notes: '### Fixed\n\n- Something',
    date: '2030-01-02',
  });
  for (const [f, s] of Object.entries(F.changed())) fs.writeFileSync(path.join(tmp, f), s);
  assert.deepStrictEqual(B.check(tmp), []);
  assert.strictEqual(done.v, oldV + 1);
  const html = fs.readFileSync(path.join(tmp, 'app/index.html'), 'utf8');
  assert(!html.includes('?v=' + oldV + '"'), 'an old ?v= was left behind');
  const cl = fs.readFileSync(path.join(tmp, 'CHANGELOG.md'), 'utf8');
  assert(cl.indexOf('## 9.9.9-alpha.1 (2030-01-02)') < cl.indexOf('## ' + done.from + ' ('), 'new section first');
  assert(
    fs
      .readFileSync(path.join(tmp, 'progress.md'), 'utf8')
      .includes('| A test bump | 9.9.9-alpha.1 | ✅ released 2030-01-02 |')
  );
  fs.rmSync(tmp, { recursive: true, force: true });
});

t('preferences have safe defaults and survive a reload', () => {
  assert.strictEqual(FW.prefs.anim, 'full');
  assert.strictEqual(FW.prefs.keys.advance, ' ');
  assert.strictEqual(FW.spinDuration('normal'), 4600);
  assert.strictEqual(FW.spinDuration('fast'), 2300);
  FW.prefs.anim = 'off';
  assert.strictEqual(FW.spinDuration('normal'), 250);
  FW.prefs.anim = 'full';
  FW.prefs.reduceMotion = true;
  assert.strictEqual(FW.spinDuration('normal'), 1200);
  FW.prefs.reduceMotion = false;
  FW.prefs.fps = 60;
  assert(Math.abs(FW.frameGap() - 15.67) < 0.1);
  FW.prefs.quality = 'low';
  assert.strictEqual(FW.maxDpr(), 1);
  FW.savePrefs();
  const back = JSON.parse(mem['fw.prefs']);
  assert.strictEqual(back.quality, 'low');
  assert.strictEqual(back.keys.back, 'Escape');
  FW.resetPrefs();
  assert.strictEqual(FW.prefs.quality, 'high');
  assert.strictEqual(FW.prefs.fps, 0);
});

t('colour-blind-safe palette has seven distinct slice colours', () => {
  assert.strictEqual(FW.CB_PAL.length, 7);
  assert.strictEqual(new Set(FW.CB_PAL.map(p => p[0])).size, 7);
});

t('the save checker accepts a real save and refuses anything else', () => {
  // load system.js's checker in isolation (it needs only FW and FWApp stubs)
  const src = fs.readFileSync(path.join(root, 'app', 'js', 'system.js'), 'utf8');
  const start = src.indexOf('SYS.check = function'),
    end = src.indexOf('/* replace the current save');
  const SYS = {};
  new Function('SYS', src.slice(start, end))(SYS);
  const good = {
    format: 'destiny-unbound-save',
    version: 1,
    data: { 'fw.hall': '[]', 'fw.settings': '{"theme":"astral"}' },
  };
  assert.strictEqual(SYS.check(JSON.stringify(good)).data['fw.hall'], '[]');
  assert.throws(() => SYS.check('not json'), /not a save/);
  assert.throws(() => SYS.check('{"format":"fatewheel-pack"}'), /not a Destiny Unbound save/);
  assert.throws(() => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: {} })), /empty/);
  assert.throws(() => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: { evil: 'x' } })), /unexpected/);
  assert.throws(
    () => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: { 'fw.hall': '{broken' } })),
    /damaged/
  );
  assert.throws(
    () => SYS.check(JSON.stringify({ format: 'destiny-unbound-save', data: { 'fw.hall': 5 } })),
    /unexpected/
  );
});

t('exported saves never contain API keys', () => {
  const src = fs.readFileSync(path.join(root, 'app', 'js', 'system.js'), 'utf8');
  const start = src.indexOf('SYS.collect = function'),
    end = src.indexOf('SYS.check = function');
  Object.keys(mem).forEach(k => delete mem[k]);
  mem['fw.art'] = JSON.stringify({
    remember: true,
    img: { cfgs: { openai: { key: 'sk-secret', model: 'x' } } },
    llm: { cfgs: { claude: { key: 'sk-2' } } },
  });
  mem['fw.hall'] = '[]';
  mem['du.log'] = '[]';
  const SYS = {};
  new Function('SYS', 'FW', 'localStorage', src.slice(start, end))(SYS, { VERSION: 'test' }, globalThis.localStorage);
  const out = JSON.stringify(SYS.collect());
  assert(!/sk-secret|sk-2/.test(out), 'keys leaked');
  assert(/openai/.test(out));
  assert(!/du\.log/.test(out));
});

t('the title screens have art, a logo and a tagline for every built-in theme', () => {
  const css = fs.readFileSync(path.join(root, 'app', 'css', 'menu.css'), 'utf8');
  const data = fs.readFileSync(path.join(root, 'app', 'js', 'menu-data.js'), 'utf8');
  ['ashen', 'astral', 'iron', 'bloodmoon', 'wild'].forEach(k => {
    ['bg', 'wheel', 'logo'].forEach(p =>
      assert(fs.existsSync(path.join(root, 'app', 'art', k + '-' + p + '.webp')), k + '-' + p)
    );
    assert(css.indexOf('[data-look="' + k + '"]') >= 0, 'css ' + k);
    assert(data.indexOf('"' + k + '"') >= 0, 'tag ' + k);
  });
});

t('every ending illustration and hero portrait the game lists exists, for a real ending and race', () => {
  ['data.js', 'engine.js', 'story.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
  const FW = globalThis.FW;
  FW.ENDING_ART.forEach(e => {
    assert(FW.Story.endLabel[e], 'not an ending: ' + e);
    assert(fs.existsSync(path.join(root, 'app', 'art', 'endings', e + '.webp')), 'missing ending art ' + e);
  });
  const races = new Set(FW.RACES.map(r => r.name));
  Object.keys(FW.PORTRAITS).forEach(r => {
    assert(races.has(r), 'portraits for an unknown race: ' + r);
    FW.PORTRAITS[r].forEach(f =>
      assert(fs.existsSync(path.join(root, 'app', 'art', 'portraits', f + '.webp')), 'missing portrait ' + f)
    );
  });
});

t('every painted arena backdrop and foe portrait exists and belongs to a real arena or foe', () => {
  ['data.js', 'engine.js', 'story.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
  const FW = globalThis.FW;
  const tags = new Set(['none']);
  FW.ARENAS.forEach(a => a.tags.forEach(t => tags.add(t)));
  tags.forEach(t => assert(FW.ARENA_ART[t], 'no backdrop for arenas with ' + t));
  Object.values(FW.ARENA_ART).forEach(f =>
    assert(fs.existsSync(path.join(root, 'app', 'art', 'arena', f + '.webp')), 'missing arena art ' + f)
  );
  const story = ['story.js']
    .concat(FW.Story.CHAPTER_FILES.map(f => 'chapters/' + f + '.js'))
    .map(f => fs.readFileSync(path.join(root, 'app', 'js', f), 'utf8'))
    .join(' ');
  const foes = new Set();
  FW.UNIVERSES.forEach(u => u.opps.forEach(o => foes.add(o.name)));
  Object.keys(FW.FOE_ART).forEach(n => {
    assert(foes.has(n) || story.indexOf("'" + n + "'") >= 0, 'portrait for an unknown foe: ' + n);
    assert(fs.existsSync(path.join(root, 'app', 'art', 'foes', FW.FOE_ART[n] + '.webp')), 'missing portrait ' + n);
  });
  // the strongest foe of every world has a portrait
  FW.UNIVERSES.forEach(u => {
    const top = u.opps.slice().sort((a, b) => FW.P(b).lv - FW.P(a).lv)[0];
    assert(FW.FOE_ART[top.name], 'no portrait for ' + top.name + ' (' + u.name + ')');
  });
});

t('every script the page loads exists and is cached for offline play', () => {
  const html = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8'),
    sw = fs.readFileSync(path.join(root, 'app', 'sw.js'), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="((?:js|css|lang|icons|data)\/[^"?]+)/g)].map(m => m[1]);
  assert(refs.length > 20);
  refs.forEach(r => {
    assert(fs.existsSync(path.join(root, 'app', r)), 'missing ' + r);
    if (!/^icons\//.test(r) || /favicon|192/.test(r))
      assert(sw.indexOf("'" + r + "'") >= 0, 'not cached offline: ' + r);
  });
});

t('the arena gives weak heroes fewer hopeless fights but never hides a foe', () => {
  ['data.js', 'engine.js'].forEach(f => require(path.join(root, 'app', 'js', f)));
  const L = new FW.Legend({ luck: 'mortal', seed: 'mm' }),
    rng = FW.makeRng('mm');
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L);
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  const r = FW.compute(L).baseRating;
  FW.UNIVERSES.forEach(u => {
    const plain = FW.oppEntries(u),
      fair = FW.oppEntries(u, L);
    assert.strictEqual(fair.length, u.opps.length);
    fair.forEach((o, k) => {
      assert(o.w > 0 && o.w >= plain[k].w * 0.1 - 1e-9, 'a foe vanished or shrank too far: ' + o.name);
      if (FW.P(o).lv <= r + 4) assert(Math.abs(o.w - plain[k].w) < 1e-9, 'a fair foe changed: ' + o.name);
    });
  });
});

console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
