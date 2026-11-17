// Store art: capsule and cover images for itch.io and Steam, composed from the painted title backgrounds and the
// transparent logos in brand/ (all Created with Grok; see docs/art-credits.md). Writes docs/store/capsules/*.png.
// Run: npx electron scripts/make-store-art.js
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs'),
  os = require('os'),
  path = require('path');
const { pathToFileURL } = require('url');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'store', 'capsules');
app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'du-store-')));
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.on('window-all-closed', () => {});
const url = p => pathToFileURL(path.join(ROOT, p)).href;

// name, width, height, theme, where the painting's focus sits (background-position), logo box (% of width, % of
// height, left/centre), and the tagline (or none). Steam capsules must show the game's name and nothing else.
const JOBS = [
  ['itch-cover-ashen', 630, 500, 'ashen', '68% 50%', { w: 86, h: 52, x: 'center', y: 8 }, 'A legend in 26 spins'],
  ['itch-cover-wild', 630, 500, 'wild', '72% 50%', { w: 86, h: 52, x: 'center', y: 8 }, 'A legend in 26 spins'],
  ['steam-header', 920, 430, 'ashen', '70% 45%', { w: 52, h: 76, x: 'left', y: 12 }, ''],
  ['steam-small', 462, 174, 'ashen', '70% 45%', { w: 58, h: 88, x: 'left', y: 6 }, ''],
  ['steam-main', 1232, 706, 'ashen', '70% 45%', { w: 50, h: 62, x: 'left', y: 14 }, ''],
  ['steam-vertical', 748, 896, 'wild', '74% 50%', { w: 90, h: 40, x: 'center', y: 6 }, ''],
  ['steam-library', 600, 900, 'bloodmoon', '62% 50%', { w: 92, h: 36, x: 'center', y: 6 }, ''],
  [
    'banner-wide',
    1920,
    480,
    'wild',
    '70% 52%',
    { w: 32, h: 68, x: 'left', y: 7 },
    'Spin the wheels of fate. Forge a legend.',
  ],
];

function html(w, h, theme, focus, L, tag) {
  const left = L.x === 'left';
  return `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${url('app/css/fonts.css')}">
<style>
html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden;background:#000}
.bg{position:absolute;inset:0;background:url("${url('mockups/menu/art/' + theme + '-bg.jpg')}") ${focus}/cover}
.shade{position:absolute;inset:0;background:${
    left
      ? 'linear-gradient(90deg,rgba(0,0,0,.82) 0,rgba(0,0,0,.55) 38%,rgba(0,0,0,.05) 70%)'
      : 'linear-gradient(rgba(0,0,0,.86) 0,rgba(0,0,0,.5) 40%,rgba(0,0,0,.08) 70%,rgba(0,0,0,.6))'
  }}
.logo{position:absolute;${left ? 'left:4%' : 'left:50%;transform:translateX(-50%)'};top:${L.y}%;width:${L.w}%;height:${L.h}%;
  background:url("${url('brand/logo-' + theme + '.png')}") ${left ? 'left' : 'center'} center/contain no-repeat;filter:drop-shadow(0 4px 18px rgba(0,0,0,.8))}
.tag{position:absolute;${left ? 'left:4%' : 'left:0;right:0;text-align:center'};bottom:${left ? 9 : 7}%;
  font-family:"Cinzel",serif;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:${Math.round(h * (left ? 0.05 : 0.042))}px;color:#f3e2c3;text-shadow:0 2px 10px #000}
</style><div class="bg"></div><div class="shade"></div><div class="logo"></div>${tag ? '<div class="tag">' + tag + '</div>' : ''}`;
}

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, w, h, theme, focus, L, tag] of JOBS) {
    const win = new BrowserWindow({
      width: w,
      height: h,
      useContentSize: true,
      show: false,
      webPreferences: { offscreen: true },
    });
    const file = path.join(os.tmpdir(), 'du-store-' + name + '.html');
    fs.writeFileSync(file, html(w, h, theme, focus, L, tag));
    await win.loadFile(file);
    await win.webContents.executeJavaScript('document.fonts.ready.then(() => new Promise(r => setTimeout(r, 400)))');
    const img = await win.webContents.capturePage({ x: 0, y: 0, width: w, height: h });
    fs.writeFileSync(path.join(OUT, name + '.png'), img.toPNG());
    console.log('wrote docs/store/capsules/' + name + '.png (' + w + 'x' + h + ')');
    win.destroy();
  }
  fs.copyFileSync(path.join(ROOT, 'brand', 'logo-ashen.png'), path.join(OUT, 'steam-library-logo.png'));
  console.log('copied brand/logo-ashen.png as the Steam library logo');
  app.exit(0);
});
