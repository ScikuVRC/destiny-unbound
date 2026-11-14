/* Tests for mods (validation, CSS safety, theme registration) and the theme tables. Run: node tests/mods.test.js */
const assert = require('assert'),
  fs = require('fs'),
  path = require('path');
globalThis.window = globalThis;
['data.js', 'engine.js', 'story.js', 'wheel.js', 'card.js', 'packs.js', 'mods.js'].forEach(f =>
  require('../app/js/' + f)
);
const FW = globalThis.FW,
  M = FW.Mods;
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
const example = () =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mods', 'example-mod', 'mod.json'), 'utf8'));

t('the four built-in themes exist for the wheel and the card, old names map to new ones', () => {
  ['ashen', 'astral', 'iron', 'bloodmoon'].forEach(k => {
    assert(FW.THEMES[k] && FW.THEMES[k].kind, 'wheel ' + k);
    assert(FW.CARD_THEMES[k], 'card ' + k);
  });
  assert.deepStrictEqual(Object.keys(FW.THEME_ALIAS).sort(), ['classic', 'gilded', 'grimoire', 'neon', 'tabletop']);
  Object.values(FW.THEME_ALIAS).forEach(v => assert(FW.THEMES[v]));
  assert.strictEqual(FW.THEME_ALIAS.tabletop, 'astral');
});

t('an old mod built on the retired tabletop theme now starts from Astral Oracle', () => {
  const m = M.validate({
    format: 'fatewheel-mod',
    id: 'old',
    themes: [{ id: 'x', base: 'tabletop', card: { frame: 'tabletop' } }],
  });
  assert.strictEqual(m.themes[0].base, 'astral');
  assert.strictEqual(m.themes[0].card.frame, 'astral');
});

t('the example mod is valid and lists every file it uses', () => {
  const m = M.validate(example());
  assert.strictEqual(m.id, 'example-mod');
  assert.strictEqual(m.themes.length, 1);
  assert.strictEqual(m.themes[0].id, 'mod-example-mod-verdant');
  assert.strictEqual(m.themes[0].base, 'ashen');
  assert.deepStrictEqual(m.files.sort(), ['chime.wav', 'knock.wav', 'theme.css']);
  m.files.forEach(f => assert(fs.existsSync(path.join(__dirname, '..', 'mods', 'example-mod', f)), 'missing ' + f));
  assert.strictEqual(m.packs.length, 1);
});

t('unsafe or broken mods are refused with a readable reason', () => {
  const base = () => ({ format: 'fatewheel-mod', id: 'x', themes: [{ id: 'a', name: 'A' }] });
  const cases = [
    [{}, /Not a Destiny Unbound mod/],
    [{ format: 'fatewheel-mod', id: 'x' }, /empty/],
    [
      Object.assign(base(), { themes: [{ id: 'a', vars: { '--bg': 'url(http://evil.example/x.png)' } }] }),
      /not allowed/,
    ],
    [Object.assign(base(), { themes: [{ id: 'a', vars: { '--bg': 'red;} body{display:none' } }] }), /not allowed/],
    [Object.assign(base(), { themes: [{ id: 'a', vars: { '--evil': '#000' } }] }), /unknown variable/],
    [Object.assign(base(), { themes: [{ id: 'a', css: '../../secret.css' }] }), /inside the mod folder/],
    [Object.assign(base(), { themes: [{ id: 'a', css: 'https://evil.example/x.css' }] }), /inside the mod folder/],
    [Object.assign(base(), { themes: [{ id: 'a', css: 'script.js' }] }), /wrong file type/],
    [Object.assign(base(), { sounds: { tick: 'run.exe' } }), /wrong file type/],
    [Object.assign(base(), { sounds: { scream: 'a.wav' } }), /unknown sound/],
    [Object.assign(base(), { themes: [{ id: 'a', wheel: { pal: [['red']] } }] }), /colour pairs/],
    [Object.assign(base(), { themes: [{ id: 'a', card: { key: 'javascript:alert(1)' } }] }), /must be a colour/],
  ];
  cases.forEach(([m, re]) => assert.throws(() => M.validate(m), re));
});

t('mod CSS is scoped to its theme and cannot import or reach outside the mod', () => {
  const css = M.scopeCss(
    '@import url(http://evil.example/a.css); .x{background:url("https://evil.example/t.png")} .y{background:url(leaf.png)} .z{width:expression(alert(1))}',
    'mod-a-b',
    f => 'mods/a/' + f
  );
  assert(css.startsWith('body[data-theme="mod-a-b"]{'));
  assert(!/@import|evil\.example|expression\(/.test(css));
  assert(/url\("mods\/a\/leaf\.png"\)/.test(css));
  assert(/background:none/.test(css));
  assert(!/url\(/.test(M.scopeCss('.x{background:url(../../../etc/x.png)}', 't', f => f)), 'parent paths are dropped');
});

t('mod CSS cannot break out of its theme or load pictures from the internet in disguise', () => {
  const out = M.scopeCss('.a{color:red} } body{display:none} .b{color:blue}', 'mod-x', f => f);
  assert(!/display:none/.test(out), 'a stray } let rules escape the theme');
  assert.strictEqual((out.match(/\{/g) || []).length, (out.match(/\}/g) || []).length, 'braces stay balanced');
  const sneaky = M.scopeCss(
    '.a{background:image-set("https://evil.example/a.png" 1x)} .b{background:-webkit-image-set(url(https://evil.example/b.png) 1x)} .c{background:\\75 rl(https://evil.example/c.png)} .d{background:cross-fade(url(x.png),url(y.png))}',
    'mod-x',
    f => 'mods/m/' + f
  );
  assert(!/evil\.example/.test(sneaky), 'an outside address survived: ' + sneaky);
  assert(/\}$/.test(M.scopeCss('.a{color:red', 't', f => f)), 'unclosed rules are closed');
  assert.throws(
    () =>
      M.validate({
        format: 'fatewheel-mod',
        id: 'v',
        themes: [{ id: 't', vars: { '--bg': 'image-set("https://evil.example/x.png" 1x)' } }],
      }),
    /not allowed/
  );
});

t('a registered mod theme gets wheel art, card style and sound from its base theme', () => {
  const m = M.validate(example()),
    th = m.themes[0];
  const css = M.registerTheme(th, f => 'mods/example-mod/' + f);
  const w = FW.THEMES[th.id];
  assert.strictEqual(w.kind, FW.THEMES.ashen.kind);
  assert.strictEqual(w.sound, 'ashen');
  assert.strictEqual(w.name, 'Verdant Grove');
  assert.deepStrictEqual(w.pal, th.wheel.pal);
  assert.strictEqual(w.font, FW.THEMES.ashen.font, 'unset values come from the base');
  assert.strictEqual(FW.CARD_THEMES[th.id].key, '#6fc25a');
  assert.strictEqual(FW.CARD_THEMES[th.id].frame, 'ashen');
  assert(css.indexOf('[data-theme="mod-example-mod-verdant"]{--bg:#08120b') >= 0);
  // the wheel can colour every kind of slice with the mod palette
  [{ mode: 'cat' }, { mode: 'ladder' }, { mode: 'stripe' }].forEach(st =>
    [0, 1, 5].forEach(i => {
      const c = FW.sliceColor(st, i, 10, { name: 'x', w: 1, dsl: '' }, w);
      assert(c.inner && c.outer);
    })
  );
});

t('mod wheel entries join the wheels like a pack', () => {
  const m = M.validate(example());
  const n = FW.PETS.length;
  FW.installPackEntries(m.packs[0], 'mod:test');
  assert.strictEqual(FW.PETS.length, n + 1);
  assert(FW.RACE_ART['Grove Warden']);
  FW.removePackEntries('mod:test');
  assert.strictEqual(FW.PETS.length, n);
});

/* ---------------- the mod kit (modkit/) ---------------- */
const KIT = path.join(__dirname, '..', 'modkit');
t('every mod kit template loads in the game: valid mod.json, its files exist, its entries are new and parse', () => {
  const dir = path.join(KIT, 'templates'),
    names = new Set();
  const builtIn = new Set(Object.keys(FW.LISTS).flatMap(k => FW.LISTS[k]().map(e => k + ':' + e.name)));
  const mods = fs.readdirSync(dir).filter(d => fs.existsSync(path.join(dir, d, 'mod.json')));
  assert(mods.length >= 6, 'templates found: ' + mods.join(', '));
  mods.forEach(d => {
    const m = M.validate(JSON.parse(fs.readFileSync(path.join(dir, d, 'mod.json'), 'utf8')));
    assert(!names.has(m.id), d + ': id ' + m.id + ' is used by two templates');
    names.add(m.id);
    m.files.forEach(f => assert(fs.existsSync(path.join(dir, d, f)), d + ': missing ' + f));
    m.packs.forEach(p =>
      Object.keys(p.entries).forEach(k =>
        p.entries[k].forEach(e =>
          assert(!builtIn.has(k + ':' + e.name), d + ': "' + e.name + '" is already a built-in ' + k)
        )
      )
    );
    m.themes.forEach(th => {
      if (th.css) M.scopeCss(fs.readFileSync(path.join(dir, d, th.css), 'utf8'), th.id, f => f);
    });
  });
  const tpl = JSON.parse(fs.readFileSync(path.join(KIT, 'templates', '04-new-entries', 'mod.json'), 'utf8'));
  const wheels = Object.keys(tpl.packs[0].entries).sort();
  assert.deepStrictEqual(
    wheels,
    [
      'bg',
      'birth',
      'cls',
      'elem',
      'enh',
      'eyes',
      'garb',
      'hair',
      'mark',
      'per',
      'pet',
      'pow',
      'race',
      'title',
      'weak',
      'wpn',
    ],
    'template 04 covers every wheel'
  );
  Object.keys(tpl.packs[0].workshop).forEach(k =>
    Object.keys(tpl.packs[0].workshop[k].weights).forEach(n =>
      assert(builtIn.has(k + ':' + n), 'workshop names a real entry: ' + k + ' ' + n)
    )
  );
});

t('the mod kit wheel pack template is a valid pack, and the generated reference matches the game', () => {
  const p = FW.validatePack(
    JSON.parse(fs.readFileSync(path.join(KIT, 'templates', '05-wheel-pack', 'sky-pirates.json'), 'utf8'))
  );
  assert.strictEqual(p.name, 'Sky Pirates');
  const gen = require('../scripts/make-modkit.js').generated();
  Object.keys(gen).forEach(f =>
    assert.strictEqual(
      fs.readFileSync(path.join(KIT, f), 'utf8').replace(/\r\n/g, '\n'),
      gen[f],
      f + ' is out of date: run node scripts/make-modkit.js'
    )
  );
  const zip = require('../scripts/make-modkit.js').zip,
    crc = require('../scripts/make-modkit.js').crc32;
  assert.strictEqual(crc(Buffer.from('123456789')), 0xcbf43926, 'crc32');
  const z = zip([{ name: 'a.txt', data: Buffer.from('hello hello hello hello') }]);
  assert.strictEqual(z.readUInt32LE(0), 0x04034b50);
  assert.strictEqual(z.readUInt32LE(z.length - 22), 0x06054b50);
});

console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
