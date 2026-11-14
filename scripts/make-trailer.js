// Turns the frames from scripts/record-trailer.js into a trailer video and a short GIF, with ffmpeg.
//   node scripts/make-trailer.js            writes dist/trailer/destiny-unbound-trailer.mp4 and destiny-unbound.gif
// The trailer plays the themes, a rare spin, the first spins, the card, a boss fight, the story, a dynasty and an
// ending, speeding through the long parts, with the HD music (app/music) as its soundtrack. The GIF is a few
// seconds of spinning plus the finished card. Record first:
//   npx electron scripts/record-trailer.js
//   npx electron scripts/record-trailer.js --endcard
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'dist', 'trailer');
const FRAMES = path.join(DIR, 'frames');
const rec = JSON.parse(fs.readFileSync(path.join(FRAMES, 'index.json'), 'utf8'));
const marks = rec.marks;
// keep only complete JPEGs (the last few can be cut short when recording stops); a JPEG ends with FF D9
const frames = rec.frames.filter(([f]) => {
  try {
    const b = fs.readFileSync(path.join(FRAMES, f));
    return b.length > 1000 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9;
  } catch (e) {
    return false;
  }
});
const at = label => (marks.find(m => m[1] === label) || [0])[0];
const fwd = p => p.replace(/\\/g, '/');

/* One concat list: each segment [from, to, speed] in recorded milliseconds. */
function list(segments, tail) {
  const out = [];
  for (const [from, to, speed] of segments) {
    const fr = frames.filter(f => f[1] >= from && f[1] < to);
    fr.forEach((f, i) => {
      const next = i + 1 < fr.length ? fr[i + 1][1] : to;
      out.push(`file '${fwd(path.join(FRAMES, f[0]))}'`, `duration ${((next - f[1]) / 1000 / speed).toFixed(4)}`);
    });
  }
  if (tail) out.push(`file '${fwd(tail[0])}'`, `duration ${tail[1]}`, `file '${fwd(tail[0])}'`); // the last file is listed twice so its duration counts
  return out.join('\n') + '\n';
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
}

const rare = at('rare'),
  spin = at('spin'),
  card = at('card'),
  fight = at('fight'),
  story = at('story'),
  dynasty = at('dynasty'),
  ending = at('ending'),
  end = at('end');
// the concat list needs one image format throughout, so the end card becomes a JPEG like the frames
const endcard = path.join(DIR, 'endcard.jpg');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(DIR, 'endcard.png'), '-q:v', '2', endcard]);

// [from, to, speed] in recorded milliseconds
const segments = [
  [0, rare - 300, 1], // the four themes
  [rare, spin - 200, 1], // the rare spin
  [spin, spin + 8000, 1], // the first spins
  [spin + 8000, card, 10], // the rest of the forging
  [card, fight, 1], // the card and its back
  [fight, fight + 6000, 1], // the fight starts
  [fight + 6000, story, 2.5],
  [story, story + 6000, 1], // the saga starts
  [story + 6000, dynasty, 2.5],
  [dynasty, end, 1], // family tree and ending
];
// where a recorded moment lands in the finished video, in seconds
const outAt = ms =>
  segments.reduce((s, [from, to, speed]) => s + Math.max(0, Math.min(ms, to) - from) / speed, 0) / 1000;

const trailerList = path.join(DIR, 'trailer.txt');
fs.writeFileSync(trailerList, list(segments, [endcard, 4]));
const total = Number(
  fs
    .readFileSync(trailerList, 'utf8')
    .match(/duration [\d.]+/g)
    .reduce((s, d) => s + Number(d.slice(9)), 0)
    .toFixed(2)
);
const silent = path.join(DIR, 'trailer-silent.mp4');
ffmpeg([
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  trailerList,
  '-vf',
  `fps=30,scale=1280:720:flags=lanczos,format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8`,
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '20',
  silent,
]);

// soundtrack: the title theme, the battle theme from the fight on, and the legend stinger at the ending
const MUSIC = path.join(ROOT, 'app', 'music');
const tF = outAt(fight),
  tE = outAt(ending);
const mp4 = path.join(DIR, 'destiny-unbound-trailer.mp4');
ffmpeg([
  '-i',
  silent,
  '-i',
  path.join(MUSIC, 'title.ogg'),
  '-i',
  path.join(MUSIC, 'battle.ogg'),
  '-i',
  path.join(MUSIC, 'legend.ogg'),
  '-filter_complex',
  [
    `[1:a]atrim=0:${(tF + 1.5).toFixed(2)},afade=t=in:d=1.5,afade=t=out:st=${tF.toFixed(2)}:d=1.5[a]`,
    `[2:a]atrim=0:${(tE - tF + 1).toFixed(2)},adelay=${Math.round(tF * 1000)}:all=1,afade=t=in:st=${tF.toFixed(2)}:d=1.5,afade=t=out:st=${(tE - 0.5).toFixed(2)}:d=1.5[b]`,
    `[3:a]adelay=${Math.round(tE * 1000)}:all=1[c]`,
    `[a][b][c]amix=inputs=3:normalize=0:duration=longest,atrim=0:${total.toFixed(2)},afade=t=out:st=${(total - 2).toFixed(2)}:d=2[m]`,
  ].join(';'),
  '-map',
  '0:v',
  '-map',
  '[m]',
  '-c:v',
  'copy',
  '-c:a',
  'aac',
  '-b:a',
  '192k',
  '-shortest',
  '-movflags',
  '+faststart',
  mp4,
]);
fs.rmSync(silent, { force: true });

// GIF: about 7 seconds of spinning at real speed, then 2.5 seconds of the card; small enough for itch.io and Discord
const gifList = path.join(DIR, 'gif.txt');
fs.writeFileSync(
  gifList,
  list([
    [spin + 1500, spin + 8500, 1],
    [card + 300, card + 2800, 1],
  ])
);
const gif = path.join(DIR, 'destiny-unbound.gif');
ffmpeg([
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  gifList,
  '-vf',
  'fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
  gif,
]);

// a smaller copy for itch.io, whose screenshots must be under 3 MB
const small = path.join(DIR, 'destiny-unbound-itch.gif');
ffmpeg([
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  gifList,
  '-vf',
  'fps=12,scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
  small,
]);

const mb = f => (fs.statSync(f).size / 1048576).toFixed(1) + ' MB';
console.log(`itch.io gif ${mb(small)}: ${small}`);
console.log(`trailer ${total.toFixed(1)} s, ${mb(mp4)}: ${mp4}`);
console.log(`gif ${mb(gif)}: ${gif}`);
