// Uploads the Windows builds (and optionally the browser build) to itch.io with butler.
//   node scripts/itch-push.js          installer + portable from dist/
//   node scripts/itch-push.js --web    also the browser build (a zip of app/)
//   node scripts/itch-push.js --modkit also the mod kit (run npm run modkit first)
//   node scripts/itch-push.js --no-windows --modkit   only the mod kit
//   node scripts/itch-push.js --dry    show what would be pushed
// Run `npm run dist` first. butler is itch.io's upload tool (https://itch.io/docs/butler/); it is looked for in
// the BUTLER variable, then %USERPROFILE%\.butler\butler.exe, then on the PATH. Log it in once with `butler login`,
// or set BUTLER_API_KEY (the release workflow does this from a repository secret, so tagged releases upload by
// themselves).
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

const pushes = args.has('--no-windows')
  ? []
  : [
      ['windows-installer', stageFile('windows-installer', `DestinyUnbound-Setup-${version}.exe`)],
      ['windows-portable', stageFile('windows-portable', `DestinyUnbound-${version}-portable.exe`)],
    ];
if (args.has('--web')) pushes.push(['html5', path.join(root, 'app')]);
if (args.has('--modkit')) pushes.push(['modkit', stageFile('modkit', `DestinyUnbound-ModKit-${version}.zip`)]);

const butler = butlerPath();
for (const [channel, dir] of pushes) {
  const cmd = ['push', dir, `${TARGET}:${channel}`, '--userversion', version];
  console.log(`> butler ${cmd.join(' ')}`);
  if (args.has('--dry')) continue;
  const r = spawnSync(butler, cmd, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
// the status check is only a report: if itch.io's API is slow, say so instead of failing after a good upload
if (!args.has('--dry'))
  for (const [channel] of pushes) {
    try {
      console.log(execFileSync(butler, ['status', `${TARGET}:${channel}`], { encoding: 'utf8' }));
    } catch (e) {
      console.log(
        `Could not read the status of ${channel} (${String(e.stdout || e.message).trim()}). Check later with: butler status ${TARGET}:${channel}`
      );
    }
  }
