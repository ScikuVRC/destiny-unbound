// regenerates the four mockup pages: node mockups/_gen.js
const fs = require('fs'), path = require('path');
const M = [
  { file: 'mockup-1-classic.html', theme: 'classic', variant: 'race', n: 1, name: 'Classic Night', tag: 'The faithful one',
    desc: 'Closest to the original videos: pure black, blue-on-dark chip, big white live result, dark-rimmed wheel with the teardrop pointer. Hero screen: the Race wheel and its bonus card.',
    pts: ['Black background, rounded blue chip, white result text (1:1 with the video)', 'Pastel categorical slices, tiny slivers for rare races', 'Buff / debuff chips under the result: solid = always, dashed = situational'] },
  { file: 'mockup-2-gilded.html', theme: 'gilded', variant: 'angel', n: 2, name: 'Gilded Arcana', tag: 'Ornate fantasy',
    desc: 'Inspired by the gold-framed Season 2 character card. Serif small-caps, gold studs on the rim, double-line panels. Hero screen: the Angel sub-wheel and its perks card.',
    pts: ['Gold double borders and corner flourishes on the final card', 'Sub-wheels (type of angel, vampire bloodline, demon rank...) with perk cards', 'Warm dark browns instead of pure black'] },
  { file: 'mockup-3-neon.html', theme: 'neon', variant: 'speed', n: 3, name: 'Neon Arcade', tag: 'Game-show energy',
    desc: 'Glowing rim, cyan and magenta accents, pill chip. Built for sharing short clips. Hero screen: a ladder wheel (Speed) showing the race bonus lifting the tier.',
    pts: ['Glow on the wheel rim and primary button', 'Tier bonus shown as "rolled -> final" with the +2 pill', 'High-contrast text for mobile screens in daylight'] },
  { file: 'mockup-4-grimoire.html', theme: 'grimoire', variant: 'enh', n: 4, name: 'Old Grimoire', tag: 'Leather and parchment',
    desc: 'A spell-book look: leather desk, parchment panels, burgundy accent, italic serif result. Hero screen: the Enhancement wheel (half "No enhancement") with its cost.',
    pts: ['Parchment cards with dark ink text', 'Wax-red accent for buttons and the pointer', 'Final card has a leather frame and parchment stat panel'] }
];
const page = m => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mockup ${m.n} - ${m.name}</title>
<link rel="stylesheet" href="../app/css/base.css"><link rel="stylesheet" href="../app/css/themes.css">
<style>
 .mock-head{max-width:1180px;margin:0 auto;padding:26px 16px 6px}
 .mock-head .n{font-family:var(--font-display);letter-spacing:.2em;color:var(--accent);font-size:13px;text-transform:uppercase}
 .mock-head h1{font-family:var(--font-display);font-size:clamp(30px,6vw,52px);margin:4px 0}
 .mock-head p{color:var(--muted);max-width:760px;font-size:16px}
 .mock-head ul{color:var(--fg);opacity:.85;font-size:14.5px;padding-left:18px}
 .nav{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
 .nav a{color:var(--fg);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:13px}
 .nav a.on{background:var(--accent);color:var(--accent-fg);border-color:transparent}
 #mock{display:flex;flex-wrap:wrap;gap:34px;justify-content:center;padding:20px 16px 70px;max-width:1300px;margin:0 auto}
 .frame h4{text-align:center;margin:0 0 10px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-family:var(--font-display)}
 *{animation:none!important}.frame{width:min(100%,390px)}.phone{margin:0 auto}
</style></head>
<body data-theme="${m.theme}" data-variant="${m.variant}">
<div class="mock-head"><div class="n">Mockup ${m.n} of 4 &middot; ${m.tag}</div><h1>${m.name}</h1><p>${m.desc}</p>
<ul>${m.pts.map(p => '<li>' + p + '</li>').join('')}</ul>
<div class="nav"><a href="index.html">All mockups</a>${M.map(x => '<a class="' + (x.n === m.n ? 'on' : '') + '" href="' + x.file + '">' + x.n + ' ' + x.name + '</a>').join('')}</div></div>
<div id="mock"></div>
<script src="../app/js/data.js"></script><script src="../app/js/engine.js"></script><script src="../app/js/wheel.js"></script><script src="../app/js/render.js"></script><script src="../app/js/card.js"></script><script src="mock.js"></script>
</body></html>`;
M.forEach(m => fs.writeFileSync(path.join(__dirname, m.file), page(m)));
const idx = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FateWheel mockups</title>
<link rel="stylesheet" href="../app/css/base.css"><link rel="stylesheet" href="../app/css/themes.css">
<style>body{padding:30px 16px}.wrap{max-width:1100px;margin:0 auto}h1{font-size:clamp(30px,6vw,52px);margin-bottom:6px}.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));margin-top:20px}
.t{display:block;text-decoration:none;color:inherit;border-radius:16px;padding:18px;border:1px solid var(--line);min-height:170px}.t b{font-size:20px;display:block}.t small{opacity:.8}.t p{font-size:14px;margin-top:10px;opacity:.9}</style></head>
<body data-theme="classic"><div class="wrap"><div class="hero" style="text-align:left;padding-top:0"><h1>FateWheel &middot; 4 mockups</h1><p style="margin-left:0">Four visual directions for the character wheel app. Each page shows the spin screen, the final card and the arena with buffs and debuffs, built from the real app components. The app ships all four as switchable themes.</p></div>
<div class="grid">
${[['classic','#000','#4d8dff'],['gilded','#16100a','#e3bd62'],['neon','#0b0b1f','#ff2bd6'],['grimoire','#e9dbbb','#9c2a22']].map((t, i) => `<a class="t" href="${M[i].file}" style="background:${t[1]};color:${i === 3 ? '#2b1d0f' : '#fff'};border-color:${t[2]}"><small>Mockup ${M[i].n} &middot; ${M[i].tag}</small><b style="color:${t[2]}">${M[i].name}</b><p>${M[i].desc}</p></a>`).join('\n')}
</div></div></body></html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), idx);
console.log('generated', M.length, 'mockups');
