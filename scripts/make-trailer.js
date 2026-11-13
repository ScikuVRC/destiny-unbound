// Turns the frames from scripts/record-trailer.js into a trailer video and a short GIF, with ffmpeg.
//   node scripts/make-trailer.js            writes dist/trailer/destiny-unbound-trailer.mp4 and destiny-unbound.gif
// The trailer plays the themes, the first spins and the card at real speed and speeds through the rest; the GIF is
// a few seconds of spinning plus the finished card. Record first:
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
  try { const b = fs.readFileSync(path.join(FRAMES, f)); return b.length > 1000 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9; } catch (e) { return false; }
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
  if (tail) out.push(`file '${fwd(tail[0])}'`, `duration ${tail[1]}`, `file '${fwd(tail[0])}'`);   // the last file is listed twice so its duration counts
  return out.join('\n') + '\n';
}

function ffmpeg(args) { execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' }); }

const spin = at('spin'), card = at('card'), story = at('story'), end = at('end');
// the concat list needs one image format throughout, so the end card becomes a JPEG like the frames
const endcard = path.join(DIR, 'endcard.jpg');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(DIR, 'endcard.png'), '-q:v', '2', endcard]);
const firstSpins = spin + 9000;

// trailer: themes (1x), first spins (1x), the rest of the forging (6x), the card (1x), the story's start (1.5x), end card
const trailerList = path.join(DIR, 'trailer.txt');
fs.writeFileSync(trailerList, list([
  [0, spin - 400, 1], [spin, firstSpins, 1], [firstSpins, card, 6], [card, story, 1], [story, Math.min(end, story + 12000), 1.5]
], [endcard, 4]));
const total = Number(fs.readFileSync(trailerList, 'utf8').match(/duration [\d.]+/g).reduce((s, d) => s + Number(d.slice(9)), 0).toFixed(2));
const mp4 = path.join(DIR, 'destiny-unbound-trailer.mp4');
ffmpeg(['-f', 'concat', '-safe', '0', '-i', trailerList,
  '-vf', `fps=30,scale=1280:720:flags=lanczos,format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-movflags', '+faststart', mp4]);

// GIF: about 7 seconds of spinning at real speed, then 2.5 seconds of the card; small enough for itch.io and Discord
const gifList = path.join(DIR, 'gif.txt');
fs.writeFileSync(gifList, list([[spin + 1500, spin + 8500, 1], [card + 300, card + 2800, 1]]));
const gif = path.join(DIR, 'destiny-unbound.gif');
ffmpeg(['-f', 'concat', '-safe', '0', '-i', gifList, '-vf',
  'fps=15,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle', gif]);

const mb = f => (fs.statSync(f).size / 1048576).toFixed(1) + ' MB';
console.log(`trailer ${total.toFixed(1)} s, ${mb(mp4)}: ${mp4}`);
console.log(`gif ${mb(gif)}: ${gif}`);
