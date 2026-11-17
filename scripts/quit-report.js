/* Where players stop: the counts sent by players who switched on Options > Data > Share where I stop playing.
   Shows the screens, hero-making wheels and story chapters people were on when they closed the game, most first.
   Needs `npx wrangler login` once (worker/README.md).  Usage: node scripts/quit-report.js [how many, default 30]
   SPDX-License-Identifier: GPL-3.0-or-later */
const { execFileSync } = require('child_process');
const path = require('path');
const n = Math.min(400, Math.max(1, parseInt(process.argv[2] || '30', 10) || 30));
// the SQL is fixed text and a number; quoted because Windows runs npx through a shell
const sql = "SELECT k, n FROM counts WHERE k LIKE 'quit:%' ORDER BY n DESC LIMIT " + n;
let out;
try {
  out = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', 'destiny-unbound-counter', '--remote', '--json', '--command', '"' + sql + '"'],
    { cwd: path.join(__dirname, '..', 'worker'), encoding: 'utf8', shell: process.platform === 'win32' }
  );
} catch (e) {
  console.error('wrangler failed. Run `npx wrangler login` in worker/ first.\n' + (e.stderr || e.message));
  process.exit(1);
}
const rows = (JSON.parse(out)[0] || {}).results || [];
if (!rows.length) {
  console.log('No counts yet: nobody who switched on "Share where I stop playing" has closed the game.');
  process.exit(0);
}
const total = rows.reduce((a, r) => a + r.n, 0);
const label = k => {
  const w = k.slice(5);
  return w.startsWith('make:')
    ? 'making a hero, wheel ' + w.slice(5)
    : w.startsWith('story:')
      ? 'story chapter ' + w.slice(6)
      : 'screen ' + w;
};
console.log('Where players stopped (' + total + ' counts in the top ' + rows.length + '):');
for (const r of rows)
  console.log(
    '  ' + String(r.n).padStart(6) + '  ' + ((100 * r.n) / total).toFixed(1).padStart(5) + '%  ' + label(r.k)
  );
