/* Tests for mods (validation, CSS safety, theme registration) and the theme tables. Run: node tests/mods.test.js */
const assert = require('assert'), fs = require('fs'), path = require('path');
globalThis.window = globalThis;
['data.js', 'data-more.js', 'data-extra.js', 'engine.js', 'story.js', 'wheel.js', 'card.js', 'packs.js', 'mods.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW, M = FW.Mods;
let pass = 0, fail = 0;
function t(name, fn) { try { fn(); pass++; console.log('  ok   ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e).toString().split('\n').slice(0, 3).join('\n       ')); } }
const example = () => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'mods', 'example-mod', 'mod.json'), 'utf8'));

t('the four built-in themes exist for the wheel and the card, old names map to new ones', () => {
  ['ashen', 'tabletop', 'iron', 'bloodmoon'].forEach(k => { assert(FW.THEMES[k] && FW.THEMES[k].kind, 'wheel ' + k); assert(FW.CARD_THEMES[k], 'card ' + k); });
  assert.deepStrictEqual(Object.keys(FW.THEME_ALIAS).sort(), ['classic', 'gilded', 'grimoire', 'neon']);
  Object.values(FW.THEME_ALIAS).forEach(v => assert(FW.THEMES[v]));
});

t('the example mod is valid and lists every file it uses', () => {
  const m = M.validate(example());
  assert.strictEqual(m.id, 'example-mod'); assert.strictEqual(m.themes.length, 1);
  assert.strictEqual(m.themes[0].id, 'mod-example-mod-verdant'); assert.strictEqual(m.themes[0].base, 'ashen');
  assert.deepStrictEqual(m.files.sort(), ['chime.wav', 'knock.wav', 'theme.css']);
  m.files.forEach(f => assert(fs.existsSync(path.join(__dirname, '..', 'mods', 'example-mod', f)), 'missing ' + f));
  assert.strictEqual(m.packs.length, 1);
});

t('unsafe or broken mods are refused with a readable reason', () => {
  const base = () => ({ format: 'fatewheel-mod', id: 'x', themes: [{ id: 'a', name: 'A' }] });
  const cases = [
    [{}, /Not a Destiny Unbound mod/],
    [{ format: 'fatewheel-mod', id: 'x' }, /empty/],
    [Object.assign(base(), { themes: [{ id: 'a', vars: { '--bg': 'url(http://evil.example/x.png)' } }] }), /not allowed/],
    [Object.assign(base(), { themes: [{ id: 'a', vars: { '--bg': 'red;} body{display:none' } }] }), /not allowed/],
    [Object.assign(base(), { themes: [{ id: 'a', vars: { '--evil': '#000' } }] }), /unknown variable/],
    [Object.assign(base(), { themes: [{ id: 'a', css: '../../secret.css' }] }), /inside the mod folder/],
    [Object.assign(base(), { themes: [{ id: 'a', css: 'https://evil.example/x.css' }] }), /inside the mod folder/],
    [Object.assign(base(), { themes: [{ id: 'a', css: 'script.js' }] }), /wrong file type/],
    [Object.assign(base(), { sounds: { tick: 'run.exe' } }), /wrong file type/],
    [Object.assign(base(), { sounds: { scream: 'a.wav' } }), /unknown sound/],
    [Object.assign(base(), { themes: [{ id: 'a', wheel: { pal: [['red']] } }] }), /colour pairs/],
    [Object.assign(base(), { themes: [{ id: 'a', card: { key: 'javascript:alert(1)' } }] }), /must be a colour/]
  ];
  cases.forEach(([m, re]) => assert.throws(() => M.validate(m), re));
});

t('mod CSS is scoped to its theme and cannot import or reach outside the mod', () => {
  const css = M.scopeCss('@import url(http://evil.example/a.css); .x{background:url("https://evil.example/t.png")} .y{background:url(leaf.png)} .z{width:expression(alert(1))}', 'mod-a-b', f => 'mods/a/' + f);
  assert(css.startsWith('body[data-theme="mod-a-b"]{')); assert(!/@import|evil\.example|expression\(/.test(css));
  assert(/url\("mods\/a\/leaf\.png"\)/.test(css)); assert(/background:none/.test(css));
  assert(!/url\(/.test(M.scopeCss('.x{background:url(../../../etc/x.png)}', 't', f => f)), 'parent paths are dropped');
});

t('a registered mod theme gets wheel art, card style and sound from its base theme', () => {
  const m = M.validate(example()), th = m.themes[0];
  const css = M.registerTheme(th, f => 'mods/example-mod/' + f);
  const w = FW.THEMES[th.id];
  assert.strictEqual(w.kind, FW.THEMES.ashen.kind); assert.strictEqual(w.sound, 'ashen'); assert.strictEqual(w.name, 'Verdant Grove');
  assert.deepStrictEqual(w.pal, th.wheel.pal); assert.strictEqual(w.font, FW.THEMES.ashen.font, 'unset values come from the base');
  assert.strictEqual(FW.CARD_THEMES[th.id].key, '#6fc25a'); assert.strictEqual(FW.CARD_THEMES[th.id].frame, 'ashen');
  assert(css.indexOf('[data-theme="mod-example-mod-verdant"]{--bg:#08120b') >= 0);
  // the wheel can colour every kind of slice with the mod palette
  [{ mode: 'cat' }, { mode: 'ladder' }, { mode: 'stripe' }].forEach(st => [0, 1, 5].forEach(i => { const c = FW.sliceColor(st, i, 10, { name: 'x', w: 1, dsl: '' }, w); assert(c.inner && c.outer); }));
});

t('mod wheel entries join the wheels like a pack', () => {
  const m = M.validate(example()); const n = FW.PETS.length;
  FW.installPackEntries(m.packs[0], 'mod:test'); assert.strictEqual(FW.PETS.length, n + 1); assert(FW.RACE_ART['Grove Warden']);
  FW.removePackEntries('mod:test'); assert.strictEqual(FW.PETS.length, n);
});

console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
