// Cuts the clips from scripts/record-trailer.js into the trailer, with ffmpeg:
//   node scripts/make-trailer.js     writes dist/trailer/destiny-unbound-trailer.mp4 (1080p), a 720p copy for
//                                    uploads, destiny-unbound.gif and destiny-unbound-itch.gif
// Each shot dips to black, title cards fade, and the HD music (app/music) follows the story: the title theme,
// the battle theme from the boss on, and the legend stinger when the ending lands. Record first:
//   npx electron scripts/record-trailer.js
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'dist', 'trailer');
const CLIPS = path.join(DIR, 'clips');
const MUSIC = path.join(ROOT, 'app', 'music');
const marks = JSON.parse(fs.readFileSync(path.join(CLIPS, 'marks.json'), 'utf8'));
const land = name => (marks[name] && marks[name].land) || 0;
const ffmpeg = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

// [clip, from (s), to (s), speed, zoom]: zoom slowly pushes in on still shots
const CARD = 2.2;
const shots = [
  ['open', 0.3, 4.8, 1, true],
  ['card-spin', 0.2, 0.2 + CARD, 1],
  ['rare', 0.4, land('rare') + 2.0, 1],
  ['forge', 0.6, 16, 2.5],
  ['card', 0.2, 6.8, 1],
  ['card-saga', 0.2, 0.2 + CARD, 1],
  ['choice', 0.6, land('choice') + 1.6, 1],
  ['card-boss', 0.2, 0.2 + CARD, 1],
  ['boss', 0.8, land('boss') + 2.0, 1],
  ['card-house', 0.2, 0.2 + CARD, 1],
  ['house', 0.3, 4.2, 1, true],
  ['card-end', 0.2, 0.2 + CARD, 1],
  ['ending', 0.4, land('ending') + 3.6, 1],
  ['card-worlds', 0.2, 0.2 + CARD, 1],
  ['worlds', 0.1, 6.0, 1],
  ['endcard', 0.2, 5.4, 1, true],
];

// build the video graph: trim, speed, optional push-in, dip to black at both ends, then join
const inputs = [],
  parts = [],
  starts = {};
let t = 0;
shots.forEach(([clip, from, to, speed, zoom], i) => {
  inputs.push('-i', path.join(CLIPS, clip + '.mp4'));
  const len = (to - from) / speed;
  const fade = clip.startsWith('card') || clip === 'open' || clip === 'endcard' ? 0.5 : 0.3;
  const push = zoom
    ? `,scale=2112:1188,zoompan=z='1+0.05*on/(${Math.round(len * 30)})':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30`
    : '';
  parts.push(
    `[${i}:v]trim=${from}:${to},setpts=(PTS-STARTPTS)/${speed},fps=30${push},format=yuv420p,` +
      `fade=t=in:st=0:d=${fade},fade=t=out:st=${(len - fade).toFixed(3)}:d=${fade}[v${i}]`
  );
  starts[clip] = { at: t, speed, from };
  t += len;
});
const total = t;
const at = (clip, s) => starts[clip].at + (s - starts[clip].from) / starts[clip].speed;
parts.push(shots.map((s, i) => `[v${i}]`).join('') + `concat=n=${shots.length}:v=1:a=0[v]`);

// music: title theme until the boss card, battle theme after it, the legend stinger when the ending lands
const n = shots.length,
  tBoss = starts['card-boss'].at,
  tLegend = at('ending', land('ending'));
inputs.push(
  '-i',
  path.join(MUSIC, 'title.ogg'),
  '-i',
  path.join(MUSIC, 'battle.ogg'),
  '-i',
  path.join(MUSIC, 'legend.ogg')
);
parts.push(
  `[${n}:a]atrim=0:${(tBoss + 1.5).toFixed(2)},afade=t=in:d=2,afade=t=out:st=${(tBoss - 0.5).toFixed(2)}:d=2[a]`,
  `[${n + 1}:a]atrim=0:${(total - tBoss + 1).toFixed(2)},adelay=${Math.round(tBoss * 1000)}:all=1,` +
    `afade=t=in:st=${tBoss.toFixed(2)}:d=1.2,volume=0.9[b]`,
  `[${n + 2}:a]adelay=${Math.round(tLegend * 1000)}:all=1,volume=1.1[c]`,
  `[a][b][c]amix=inputs=3:normalize=0:duration=longest,atrim=0:${total.toFixed(2)},` +
    `afade=t=out:st=${(total - 3).toFixed(2)}:d=3,alimiter=limit=0.95[m]`
);

const graph = path.join(DIR, 'trailer-graph.txt');
fs.writeFileSync(graph, parts.join(';\n'));
const mp4 = path.join(DIR, 'destiny-unbound-trailer.mp4');
ffmpeg([
  ...inputs,
  '-filter_complex_script',
  graph,
  '-map',
  '[v]',
  '-map',
  '[m]',
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '18',
  '-pix_fmt',
  'yuv420p',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-movflags',
  '+faststart',
  mp4,
]);

// a 720p copy small enough for browser uploads (under 10 MB)
const small = path.join(DIR, 'destiny-unbound-trailer-720p.mp4');
const kbps = Math.floor((9.3 * 8 * 1024) / total) - 128;
ffmpeg(['-i', mp4, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-b:v', kbps + 'k',
  '-maxrate', kbps * 1.4 + 'k', '-bufsize', kbps * 2 + 'k', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', small]); // prettier-ignore

// GIFs: the rare spin landing, then the card
const gifSrc = path.join(DIR, 'gif-src.mp4');
ffmpeg([
  '-i', path.join(CLIPS, 'rare.mp4'), '-i', path.join(CLIPS, 'card.mp4'), '-filter_complex',
  `[0:v]trim=${Math.max(0, land('rare') - 4.5)}:${land('rare') + 1.5},setpts=PTS-STARTPTS[a];` +
    `[1:v]trim=0.3:4.3,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]`,
  '-map', '[v]', '-c:v', 'libx264', '-crf', '14', gifSrc,
]); // prettier-ignore
const gif = path.join(DIR, 'destiny-unbound.gif');
ffmpeg(['-i', gifSrc, '-vf', 'fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', gif]); // prettier-ignore
const itch = path.join(DIR, 'destiny-unbound-itch.gif');
ffmpeg(['-i', gifSrc, '-vf', 'fps=12,scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle', itch]); // prettier-ignore
fs.rmSync(gifSrc, { force: true });

const mb = f => (fs.statSync(f).size / 1048576).toFixed(1) + ' MB';
console.log(`trailer ${total.toFixed(1)} s, ${mb(mp4)}: ${mp4}`);
console.log(`720p copy ${mb(small)}: ${small}`);
console.log(`gif ${mb(gif)}, itch gif ${mb(itch)}`);
