/* World boss art: turns a GIF or a short video (for example one made with Grok Imagine) into the small looping
   animation the World Boss screen shows, plus a still frame for players with reduced motion.
   Usage: node scripts/make-boss-art.js <boss id> <gif or video file> [--start=0] [--seconds=6] [--size=320] [--fade=1] [--top=0.5]
   Writes app/art/bosses/<id>.webp (animated, loops) and app/art/bosses/<id>-still.webp. Needs ffmpeg on the PATH.
   SPDX-License-Identifier: GPL-3.0-or-later */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [id, src] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = k => {
  const a = process.argv.find(x => x.startsWith('--' + k + '='));
  return a ? Number(a.split('=')[1]) : null;
};
if (!id || !src || !/^[a-z0-9-]{1,32}$/.test(id) || !fs.existsSync(src)) {
  console.error(
    'Usage: node scripts/make-boss-art.js <boss id> <gif or video file> [--start=0] [--seconds=6] [--size=320] [--fade=1] [--top=0.5]'
  );
  process.exit(1);
}
const size = opt('size') || 320,
  start = opt('start') || 0,
  secs = opt('seconds') || 6;
const out = path.join(__dirname, '..', 'app', 'art', 'bosses');
fs.mkdirSync(out, { recursive: true });
// square crop from the middle, 12 frames a second: small enough for the itch.io download, smooth enough to read
// --top=0.2 moves the square up a tall picture (0 = the top, 0.5 = the middle) to keep a face in view
const top = opt('top') == null ? 0.5 : opt('top');
const vf =
  `crop='min(iw,ih)':'min(iw,ih)':'(iw-min(iw,ih))/2':'(ih-min(iw,ih))*${top}',` +
  `scale=${size}:${size}:flags=lanczos,fps=12`;
const run = args =>
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y'].concat(args), { stdio: 'inherit' });
// a seamless loop: the clip's last second fades into its first, and playback starts one second in, so the last
// frame leads straight back to the first (generated clips rarely end where they began). --fade=0 turns it off.
const fade = opt('fade') == null ? 1 : opt('fade');
const loop =
  fade > 0
    ? `[0:v]fps=24,split[a][b];[a]trim=start=${fade}:end=${secs},setpts=PTS-STARTPTS[a1];` +
      `[b]trim=start=0:end=${fade},setpts=PTS-STARTPTS[b1];` +
      `[a1][b1]xfade=transition=fade:duration=${fade}:offset=${secs - 2 * fade},${vf}[v]`
    : `[0:v]${vf}[v]`;
run([
  '-ss',
  String(start),
  '-t',
  String(secs),
  '-i',
  src,
  '-filter_complex',
  loop,
  '-map',
  '[v]',
  '-an',
  '-c:v',
  'libwebp_anim',
  '-loop',
  '0',
  '-quality',
  '62',
  '-compression_level',
  '6',
  path.join(out, id + '.webp'),
]);
run([
  '-ss',
  String(start),
  '-i',
  src,
  '-frames:v',
  '1',
  '-vf',
  vf,
  '-c:v',
  'libwebp',
  '-quality',
  '80',
  path.join(out, id + '-still.webp'),
]);
// switch the art on for that boss in app/js/boss.js (its `art: ''` slot after `id: '<id>'`)
const bossJs = path.join(__dirname, '..', 'app', 'js', 'boss.js');
const js = fs.readFileSync(bossJs, 'utf8');
const at = js.indexOf("id: '" + id + "'");
if (at >= 0) {
  const slot = js.indexOf("art: ''", at),
    next = js.indexOf('id: ', at + 4);
  if (slot >= 0 && (next < 0 || slot < next)) {
    fs.writeFileSync(bossJs, js.slice(0, slot) + "art: '" + id + "'" + js.slice(slot + 7));
    console.log('The ' + id + ' boss now shows it (app/js/boss.js).');
  }
} else console.log('No boss with the id "' + id + '" in app/js/boss.js yet: set its art to "' + id + '" by hand.');
const kb = f => Math.round(fs.statSync(path.join(out, f)).size / 1024) + ' KB';
console.log(
  'app/art/bosses/' + id + '.webp (' + kb(id + '.webp') + ') and ' + id + '-still.webp (' + kb(id + '-still.webp') + ')'
);
