// Makes every icon the game needs from app/icons/icon-source.png (the painted rune-wheel emblem, 1024x1024):
// build/icon.png for the installers, and the window, web app and favicon sizes in app/icons.
// SPDX-License-Identifier: GPL-3.0-or-later
const fs = require('fs'), path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'app', 'icons', 'icon-source.png'));
// resvg resizes raster images when they sit inside an SVG, so wrap the PNG in one
const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024" viewBox="0 0 1024 1024"><image width="1024" height="1024" xlink:href="data:image/png;base64,' + src.toString('base64') + '"/></svg>');
const out = [[path.join(root, 'build', 'icon.png'), 1024], [path.join(root, 'app', 'icons', 'icon-512.png'), 512], [path.join(root, 'app', 'icons', 'icon-192.png'), 192], [path.join(root, 'app', 'icons', 'favicon-32.png'), 32]];
for (const [file, size] of out) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng());
  console.log('wrote', path.relative(root, file), size + 'px');
}
