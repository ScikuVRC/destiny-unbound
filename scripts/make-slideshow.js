// Builds docs/store/trailer.mp4 (1920x1080, ~30 s) from the store screenshots and the painted logo:
// a slow zoom on each picture with crossfades between them. Needs ffmpeg on the PATH.
// Run: node scripts/make-slideshow.js (the gameplay trailer is npm run trailer)
// SPDX-License-Identifier: GPL-3.0-or-later
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), shots = path.join(root, 'docs', 'store', 'screenshots');
const logo = path.join(root, 'app', 'art', 'ashen-logo.jpg');
const clips = [logo].concat(fs.readdirSync(shots).filter(f => /\.png$/.test(f)).sort().map(f => path.join(shots, f))).concat([path.join(root, 'app', 'art', 'astral-logo.jpg')]);
const SEC = 3.6, FADE = 0.6, FPS = 30, N = Math.round(SEC * FPS);
const args = ['-y'];
clips.forEach(c => args.push('-loop', '1', '-t', String(SEC), '-i', c));
let f = clips.map((c, i) => {
  const zoomIn = i % 2 === 0;   // alternate a gentle push in and pull out
  const z = zoomIn ? `min(1+0.06*on/${N},1.06)` : `max(1.06-0.06*on/${N},1)`;
  return `[${i}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,scale=3840:-2,zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${N}:s=1920x1080:fps=${FPS},setsar=1,format=yuv420p[v${i}]`;
}).join(';');
let prev = 'v0', t = SEC - FADE;
for (let i = 1; i < clips.length; i++) { const o = i === clips.length - 1 ? 'out' : 'x' + i; f += `;[${prev}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${t.toFixed(2)}[${o}]`; prev = o; t += SEC - FADE; }
f += `;[out]fade=t=in:st=0:d=0.8,fade=t=out:st=${(t + FADE - 1).toFixed(2)}:d=1[final]`;
args.push('-filter_complex', f, '-map', '[final]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(root, 'docs', 'store', 'trailer.mp4'));
execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'inherit'] });
console.log('wrote docs/store/trailer.mp4 (' + clips.length + ' pictures, ' + (t + FADE).toFixed(1) + ' s)');
