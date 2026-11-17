// Dependency and licence check, for what ships: the desktop app's runtime packages (and Electron itself, which is in
// every build), the Discord bot's packages, and the bundled fonts.
// - licences: every shipped package must have a licence that can go out with a GPL-3.0-or-later game (ALLOWED);
// - security: `npm audit` on the same packages; high or critical advisories fail, moderate ones are listed;
// - fonts: every font in app/fonts has its licence file next to it.
// Run: node scripts/deps-check.js [--no-audit]   (the audit needs the network)
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// licences that may be shipped with a GPL-3.0-or-later program
const ALLOWED = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'Unlicense',
  'CC0-1.0',
  'CC-BY-4.0',
  'Python-2.0',
  'MPL-2.0',
  'LGPL-2.1-or-later',
  'LGPL-3.0-or-later',
  'GPL-3.0-or-later',
  'GPL-3.0-only',
  'Zlib',
  'WTFPL',
]);
// what ships, per folder: its runtime packages, plus dev packages that end up in the build anyway
const PARTS = [
  { name: 'desktop app', dir: ROOT, alsoShipped: ['electron'] },
  { name: 'Discord bot', dir: path.join(ROOT, 'bot'), alsoShipped: [] },
];

// npm through a shell (Windows needs one for npm.cmd); the commands are fixed text, nothing from outside
const run = (cmd, args, cwd) => {
  try {
    return execSync([cmd, ...args].join(' '), {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 << 20,
    });
  } catch (e) {
    return e.stdout || ''; // npm ls and npm audit exit non-zero when they find something, with the JSON on stdout
  }
};

// an SPDX expression is allowed when every AND part is, and at least one OR choice is
function licenceOk(expr) {
  const s = String(expr || '')
    .replace(/[()]/g, ' ')
    .trim();
  if (!s) return false;
  return s.split(/\s+OR\s+/i).some(alt => alt.split(/\s+AND\s+/i).every(p => ALLOWED.has(p.trim())));
}
const licenceOf = j =>
  j.license
    ? typeof j.license === 'string'
      ? j.license
      : j.license.type
    : Array.isArray(j.licenses)
      ? j.licenses.map(l => l.type || l).join(' OR ')
      : '';

// every installed package under a dependency tree (from `npm ls --json --all`)
function walk(node, out, seen = new Set()) {
  for (const [name, d] of Object.entries((node && node.dependencies) || {})) {
    const key = name + '@' + d.version;
    if (!d.version || d.missing || seen.has(key)) continue; // optional extras that aren't installed don't ship
    seen.add(key);
    out.push({ name, version: d.version });
    walk(d, out, seen);
  }
  return out;
}

function packageJson(dir, name) {
  let p = dir;
  // the nearest node_modules copy, as Node would find it from the folder
  for (;;) {
    const f = path.join(p, 'node_modules', name, 'package.json');
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
    const up = path.dirname(p);
    if (up === p) return null;
    p = up;
  }
}

const problems = [],
  notes = [];
const noAudit = process.argv.includes('--no-audit');

for (const part of PARTS) {
  if (!fs.existsSync(path.join(part.dir, 'node_modules'))) {
    problems.push(
      part.name + ': packages are not installed (npm ci' + (part.dir === ROOT ? '' : ' --prefix bot') + ')'
    );
    continue;
  }
  const tree = JSON.parse(run('npm', ['ls', '--json', '--all', '--omit=dev'], part.dir) || '{}');
  const list = walk(tree, []);
  for (const extra of part.alsoShipped) {
    const j = packageJson(part.dir, extra);
    if (j) list.push({ name: extra, version: j.version });
  }
  const byLicence = {};
  for (const p of list) {
    const j = packageJson(part.dir, p.name);
    const lic = j ? licenceOf(j) : '';
    byLicence[lic || '(none)'] = (byLicence[lic || '(none)'] || 0) + 1;
    if (!licenceOk(lic))
      problems.push(part.name + ': ' + p.name + '@' + p.version + ' has licence "' + (lic || 'none') + '"');
  }
  console.log(
    part.name +
      ': ' +
      list.length +
      ' shipped packages. Licences: ' +
      Object.entries(byLicence)
        .sort((a, b) => b[1] - a[1])
        .map(([k, n]) => k + ' ' + n)
        .join(', ')
  );

  if (noAudit) continue;
  const names = new Set(list.map(p => p.name));
  const audit = JSON.parse(run('npm', ['audit', '--json'], part.dir) || '{}');
  if (audit.error) {
    problems.push(part.name + ': npm audit failed (' + (audit.error.summary || 'no network?') + ')');
    continue;
  }
  const vulns = Object.values(audit.vulnerabilities || {}).filter(v => names.has(v.name));
  for (const v of vulns) {
    const line = part.name + ': ' + v.name + ' (' + v.severity + ', ' + v.range + ')';
    if (v.severity === 'high' || v.severity === 'critical') problems.push(line);
    else notes.push(line);
  }
  console.log('  audit: ' + (vulns.length ? vulns.length + ' advisories in shipped packages' : 'no advisories'));
}

// fonts: each family's licence file sits next to it
const fontDir = path.join(ROOT, 'app', 'fonts');
const fonts = fs.readdirSync(fontDir).filter(f => /\.(woff2?|ttf|otf)$/.test(f));
for (const f of fonts) {
  const family = f.replace(/-[^-]+\.\w+$/, '');
  if (!fs.existsSync(path.join(fontDir, family + '.OFL.txt')))
    problems.push('font ' + f + ' has no licence file (' + family + '.OFL.txt)');
}
console.log(
  'fonts: ' +
    fonts.length +
    ' files, every family with its licence file' +
    (problems.some(p => p.startsWith('font')) ? ' except the ones below' : '')
);

if (notes.length) console.log('\nModerate or low advisories (not failing):\n  ' + notes.join('\n  '));
if (problems.length) {
  console.error('\nDependency check failed:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log(
  '\nEvery shipped package and font has an allowed licence' + (noAudit ? '.' : ', and no high or critical advisories.')
);
