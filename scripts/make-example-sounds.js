// Writes the two small WAV files used by mods/example-mod (a wooden knock and a chime), so the example ships
// sounds that are free to reuse. Run: node scripts/make-example-sounds.js
// SPDX-License-Identifier: GPL-3.0-or-later
const fs = require('fs'), path = require('path');
const RATE = 22050;
function wav(samples) {
  const data = Buffer.alloc(samples.length * 2); samples.forEach((v, i) => data.writeInt16LE(Math.max(-1, Math.min(1, v)) * 32767 | 0, i * 2));
  const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}
const tick = [], n1 = Math.round(RATE * 0.06);
for (let i = 0; i < n1; i++) { const t = i / RATE, e = Math.exp(-t * 90); tick.push(e * (0.6 * Math.sin(2 * Math.PI * 520 * t) + 0.3 * Math.sin(2 * Math.PI * 1310 * t) + 0.25 * (Math.random() * 2 - 1))); }
const chime = [], n2 = Math.round(RATE * 1.4);
for (let i = 0; i < n2; i++) { const t = i / RATE; let v = 0; [[523.3, 0], [659.3, 0.08], [784, 0.16], [1046.5, 0.24]].forEach(([f, d]) => { if (t >= d) v += 0.22 * Math.exp(-(t - d) * 3.2) * Math.sin(2 * Math.PI * f * (t - d)); }); chime.push(v); }
const dir = path.join(__dirname, '..', 'mods', 'example-mod');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'knock.wav'), wav(tick)); fs.writeFileSync(path.join(dir, 'chime.wav'), wav(chime));
console.log('wrote knock.wav and chime.wav');
