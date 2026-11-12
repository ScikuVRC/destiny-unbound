// Renders app/icons/icon.svg to the PNG icons the desktop build needs.
// SPDX-License-Identifier: GPL-3.0-or-later
const fs = require('fs'), path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const root = path.join(__dirname, '..');
const svg = fs.readFileSync(path.join(root, 'app', 'icons', 'icon.svg'));
const out = [[path.join(root, 'build', 'icon.png'), 1024], [path.join(root, 'app', 'icons', 'icon-512.png'), 512]];
for (const [file, size] of out) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng());
  console.log('wrote', path.relative(root, file), size + 'px');
}
