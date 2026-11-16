/* Shows the error reports players chose to send (worker/src/errors.js). Needs `npx wrangler login` once (worker/README.md).
   Usage: node scripts/error-reports.js [how many, default 20] [--full]    (--full prints each report's log lines)
   SPDX-License-Identifier: GPL-3.0-or-later */
const { execFileSync } = require('child_process');
const path = require('path');
const args = process.argv.slice(2);
const full = args.includes('--full');
const n = Math.min(500, Math.max(1, parseInt(args.find(a => /^\d+$/.test(a)) || '20', 10)));
const sql =
  'SELECT id, day, version, platform, kind, screen, message, note' +
  (full ? ', detail' : '') +
  ' FROM errors ORDER BY id DESC LIMIT ' +
  n;
let out;
try {
  out = execFileSync(
    'npx',
    // the SQL is built above from fixed text and a number; quoted because Windows runs npx through a shell
    ['wrangler', 'd1', 'execute', 'destiny-unbound-counter', '--remote', '--json', '--command', '"' + sql + '"'],
    { cwd: path.join(__dirname, '..', 'worker'), encoding: 'utf8', shell: process.platform === 'win32' }
  );
} catch (e) {
  console.error('wrangler failed. Run `npx wrangler login` in worker/ first.\n' + (e.stderr || e.message));
  process.exit(1);
}
const rows = (JSON.parse(out)[0] || {}).results || [];
if (!rows.length) console.log('No error reports.');
for (const r of rows.reverse()) {
  console.log(
    '#' +
      r.id +
      '  ' +
      r.day +
      '  ' +
      r.version +
      '  ' +
      r.platform +
      '  ' +
      r.kind +
      (r.screen ? '  on ' + r.screen : '')
  );
  if (r.message) console.log('   ' + r.message);
  if (r.note) console.log('   Note: ' + r.note.replace(/\n/g, '\n         '));
  if (full && r.detail) console.log('   ' + r.detail.replace(/\n/g, '\n   '));
  console.log('');
}
