// Downloads the theme fonts (Latin subset, woff2) from Google Fonts into app/fonts and writes app/css/fonts.css,
// so the game works offline and in the desktop app. Fonts are under the SIL Open Font License (see app/fonts/*.OFL.txt).
// Run once: node scripts/fetch-fonts.js
// SPDX-License-Identifier: GPL-3.0-or-later
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', 'app');
const FAMILIES = [
  ['Cinzel', 'family=Cinzel:wght@500;700;900', 'cinzel'],
  ['EB Garamond', 'family=EB+Garamond:ital,wght@0,400;0,600;1,400', 'ebgaramond'],
  ['IM Fell English', 'family=IM+Fell+English:ital@0;1', 'imfellenglish'],
  ['IM Fell English SC', 'family=IM+Fell+English+SC', 'imfellenglishsc'],
  ['UnifrakturCook', 'family=UnifrakturCook:wght@700', 'unifrakturcook'],
  ['Share Tech Mono', 'family=Share+Tech+Mono', 'sharetechmono'],
  ['Cormorant Garamond', 'family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700', 'cormorantgaramond'],
  ['Cormorant SC', 'family=Cormorant+SC:wght@600;700', 'cormorantsc']
];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
(async () => {
  fs.mkdirSync(path.join(ROOT, 'fonts'), { recursive: true });
  let css = '/* Theme fonts, bundled for offline use. SIL Open Font License 1.1 - see app/fonts/*.OFL.txt */\n';
  for (const [name, q, dir] of FAMILIES) {
    const sheet = await (await fetch('https://fonts.googleapis.com/css2?' + q + '&display=swap', { headers: { 'User-Agent': UA } })).text();
    // keep only the latin subset of each face
    const blocks = sheet.split('/* ').filter(b => b.startsWith('latin */'));
    for (const b of blocks) {
      const style = /font-style:\s*(\w+)/.exec(b)[1], weight = /font-weight:\s*(\d+)/.exec(b)[1], url = /url\((https:[^)]+\.woff2)\)/.exec(b)[1];
      const file = name.replace(/\s+/g, '') + '-' + weight + (style === 'italic' ? 'i' : '') + '.woff2';
      fs.writeFileSync(path.join(ROOT, 'fonts', file), Buffer.from(await (await fetch(url)).arrayBuffer()));
      css += `@font-face{font-family:"${name}";font-style:${style};font-weight:${weight};font-display:swap;src:url(../fonts/${file}) format("woff2")}\n`;
      console.log('font', file);
    }
    const lic = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/' + dir + '/OFL.txt');
    if (lic.ok) fs.writeFileSync(path.join(ROOT, 'fonts', name.replace(/\s+/g, '') + '.OFL.txt'), await lic.text()); else console.log('no license file found for', name);
  }
  fs.writeFileSync(path.join(ROOT, 'css', 'fonts.css'), css);
  console.log('wrote app/css/fonts.css');
})();
