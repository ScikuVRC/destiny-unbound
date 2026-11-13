// Uploads the Windows builds (and optionally the browser build) to itch.io with butler.
//   node scripts/itch-push.js          installer + portable from dist/
//   node scripts/itch-push.js --web    also the browser build (a zip of app/)
//   node scripts/itch-push.js --dry    show what would be pushed
// Run `npm run dist` first. butler is itch.io's upload tool (https://itch.io/docs/butler/); it is looked for in
// the BUTLER variable, then %USERPROFILE%\.butler\butler.exe, then on the PATH. Log it in once with `butler login`.
// Each build goes to its own channel; butler only uploads what changed since the last push.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const TARGET = 'bzrkherja/destiny-unbound';
const root = path.join(__dirname, '..');
const version = require(path.join(root, 'package.json')).version;
const dist = path.join(root, 'dist');
const stage = path.join(dist, 'itch');
const args = new Set(process.argv.slice(2));

function butlerPath() {
  if (process.env.BUTLER) return process.env.BUTLER;
  const home = path.join(os.homedir(), '.butler', process.platform === 'win32' ? 'butler.exe' : 'butler');
  return fs.existsSync(home) ? home : 'butler';
}

function stageFile(channel, file) {
  const src = path.join(dist, file);
  if (!fs.existsSync(src)) throw new Error(`Missing ${src}. Run npm run dist first.`);
  const dir = path.join(stage, channel);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, path.join(dir, file));
  return dir;
}

const pushes = [
  ['windows-installer', stageFile('windows-installer', `DestinyUnbound-Setup-${version}.exe`)],
  ['windows-portable', stageFile('windows-portable', `DestinyUnbound-${version}-portable.exe`)],
];
if (args.has('--web')) pushes.push(['html5', path.join(root, 'app')]);

const butler = butlerPath();
for (const [channel, dir] of pushes) {
  const cmd = ['push', dir, `${TARGET}:${channel}`, '--userversion', version];
  console.log(`> butler ${cmd.join(' ')}`);
  if (args.has('--dry')) continue;
  const r = spawnSync(butler, cmd, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
if (!args.has('--dry')) for (const [channel] of pushes) console.log(execFileSync(butler, ['status', `${TARGET}:${channel}`], { encoding: 'utf8' }));
