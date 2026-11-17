/* The version and cache bump, done in one go instead of by hand.
     node scripts/bump-version.js --cache                 only the cache numbers: every ?v= in app/index.html and the
                                                          service worker's cache name (after changing app files)
     node scripts/bump-version.js 0.2.0-alpha.5.1 --summary "What changed, one line" --notes notes.md [--date YYYY-MM-DD]
                                                          a release: the cache numbers plus the version in package.json
                                                          and its lock, app/js/version.js, the README badge, the bug
                                                          form, docs/alpha-testing.md, progress.md (current version,
                                                          a row in the release table, "Ready for the next alpha"
                                                          emptied), ROADMAP.md and a CHANGELOG.md section from notes.md
     node scripts/bump-version.js --check                 checks every place agrees (also run by the tests)
   Files keep their own line endings. SPDX-License-Identifier: GPL-3.0-or-later */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VERSION_RE = /^\d+\.\d+\.\d+(-[a-z]+\.\d+(\.\d+)*)?$/;
const badge = v => 'version-' + v.replace(/-/g, '--') + '-';
// every place that names the current version: [file, text before, text after]
const PLACES = v => [
  ['package.json', '"version": "' + v + '"'],
  ['app/js/version.js', "VERSION = '" + v + "'"],
  ['README.md', badge(v)],
  ['.github/ISSUE_TEMPLATE/bug.yml', 'placeholder: ' + v],
  ['docs/alpha-testing.md', 'Current build: **' + v + '**'],
  ['progress.md', 'Current version: **' + v + '**'],
];

function files(root) {
  const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
  const out = {};
  return {
    get: f => (f in out ? out[f] : (out[f] = rd(f))),
    set: (f, s) => (out[f] = s),
    changed: () => out,
  };
}
const nlOf = s => (s.includes('\r\n') ? '\r\n' : '\n');

function cacheNumbers(F) {
  const html = F.get('app/index.html'),
    sw = F.get('app/sw.js');
  const vs = [...html.matchAll(/\?v=(\d+)/g)].map(m => +m[1]);
  const c = /fatewheel-v(\d+)/.exec(sw);
  return { vs, v: vs.length ? Math.max(...vs) : 0, cache: c ? +c[1] : 0 };
}

// what is wrong, as a list of sentences (empty when all agree)
function check(root = ROOT) {
  const F = files(root),
    bad = [];
  const v = JSON.parse(F.get('package.json')).version;
  for (const [f, text] of PLACES(v)) if (!F.get(f).includes(text)) bad.push(f + ' does not say ' + v);
  const lock = JSON.parse(F.get('package-lock.json'));
  if (lock.version !== v || (lock.packages && lock.packages[''] && lock.packages[''].version !== v))
    bad.push('package-lock.json does not say ' + v);
  if (!new RegExp('^## ' + v.replace(/\./g, '\\.') + ' \\(', 'm').test(F.get('CHANGELOG.md')))
    bad.push('CHANGELOG.md has no section for ' + v);
  const n = cacheNumbers(F);
  if (!n.vs.length) bad.push('app/index.html has no ?v= numbers');
  else if (new Set(n.vs).size > 1) bad.push('app/index.html mixes ?v= numbers: ' + [...new Set(n.vs)].join(', '));
  if (!n.cache) bad.push('app/sw.js has no fatewheel-vN cache name');
  return bad;
}

function bumpCache(F) {
  const n = cacheNumbers(F);
  F.set('app/index.html', F.get('app/index.html').replace(/\?v=\d+/g, '?v=' + (n.v + 1)));
  F.set('app/sw.js', F.get('app/sw.js').replace(/fatewheel-v\d+/, 'fatewheel-v' + (n.cache + 1)));
  return { v: n.v + 1, cache: n.cache + 1 };
}

function release(F, NEW, { summary, notes, date }) {
  const OLD = JSON.parse(F.get('package.json')).version;
  if (!VERSION_RE.test(NEW)) throw new Error('not a version: ' + NEW);
  if (NEW === OLD) throw new Error('already at ' + NEW);
  const swap = (f, a, b, times = 1) => {
    let s = F.get(f);
    for (let i = 0; i < times; i++) {
      if (!s.includes(a)) throw new Error(f + ' does not contain ' + a);
      s = s.replace(a, b);
    }
    F.set(f, s);
  };
  for (const [[f, a], [, b]] of PLACES(OLD).map((p, i) => [p, PLACES(NEW)[i]])) swap(f, a, b);
  swap('package-lock.json', '"version": "' + OLD + '"', '"version": "' + NEW + '"', 2);
  swap('progress.md', /Last updated: \d{4}-\d{2}-\d{2}/.exec(F.get('progress.md'))[0], 'Last updated: ' + date);

  // CHANGELOG.md: the new section goes above the newest one
  let c = F.get('CHANGELOG.md');
  const nl = nlOf(c),
    first = c.search(/^## \d/m);
  if (first < 0) throw new Error('CHANGELOG.md has no version sections');
  const body = notes.replace(/\r?\n/g, nl).trim();
  F.set(
    'CHANGELOG.md',
    c.slice(0, first) + '## ' + NEW + ' (' + date + ')' + nl + nl + body + nl + nl + c.slice(first)
  );

  // ROADMAP.md: one line under "Recently done"
  const r = F.get('ROADMAP.md');
  swap('ROADMAP.md', '- ' + OLD + ':', '- ' + NEW + ': ' + summary.replace(/\.?$/, '.') + nlOf(r) + '- ' + OLD + ':');

  // progress.md: a row after the old version's row, and "Ready for the next alpha" emptied
  let p = F.get('progress.md');
  const pn = nlOf(p),
    L = p.split(pn);
  const i = L.findIndex(l => l.includes('| ' + OLD + ' |'));
  if (i < 0) throw new Error('progress.md has no row for ' + OLD);
  L.splice(i + 1, 0, '| ' + summary + ' | ' + NEW + ' | ✅ released ' + date + ' |');
  p = L.join(pn);
  const ready = '## Ready for the next alpha (not released yet)' + pn + pn;
  const a = p.indexOf(ready),
    b = a < 0 ? -1 : p.indexOf(pn + pn + '## ', a + ready.length);
  if (a >= 0 && b >= 0) p = p.slice(0, a + ready.length) + '- Nothing yet' + p.slice(b);
  F.set('progress.md', p);
  return { from: OLD, to: NEW, ...bumpCache(F) };
}

function main(argv) {
  const flag = k => {
    const i = argv.indexOf('--' + k);
    return i >= 0 ? argv[i + 1] : null;
  };
  if (argv.includes('--check')) {
    const bad = check();
    if (bad.length) {
      console.error('Versions disagree:\n  ' + bad.join('\n  '));
      process.exit(1);
    }
    console.log('Every version and cache number agrees.');
    return;
  }
  const F = files(ROOT);
  let done;
  if (argv.includes('--cache')) done = bumpCache(F);
  else {
    const NEW = argv.find(a => VERSION_RE.test(a)),
      summary = flag('summary'),
      notesFile = flag('notes');
    if (!NEW || !summary || !notesFile) {
      console.error(
        'Usage: node scripts/bump-version.js --cache | --check | <version> --summary "..." --notes file.md'
      );
      process.exit(1);
    }
    const date = flag('date') || new Date().toISOString().slice(0, 10);
    done = release(F, NEW, { summary, notes: fs.readFileSync(notesFile, 'utf8'), date });
  }
  const changed = F.changed();
  for (const f of Object.keys(changed))
    if (changed[f] !== fs.readFileSync(path.join(ROOT, f), 'utf8')) fs.writeFileSync(path.join(ROOT, f), changed[f]);
  console.log(
    (done.to ? done.from + ' -> ' + done.to + ', ' : '') +
      '?v=' +
      done.v +
      ', fatewheel-v' +
      done.cache +
      '. Changed: ' +
      Object.keys(changed).join(', ')
  );
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { check, bumpCache, release, files };
