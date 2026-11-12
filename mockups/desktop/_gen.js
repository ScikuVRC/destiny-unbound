// Writes the four desktop mockup pages: node mockups/desktop/_gen.js
const fs = require('fs'), path = require('path');

/* layout shared by every direction (sizes only; colours come from each look) */
const BASE = `
*{box-sizing:border-box} body{margin:0;min-height:100vh}
.head{max-width:1340px;margin:0 auto;padding:30px 24px 0}.head small{letter-spacing:.2em;text-transform:uppercase;font-weight:700;font-size:12px}
.head h1{font-size:clamp(30px,4vw,48px);margin:6px 0}.head p{max-width:900px;line-height:1.6;margin:0 0 8px}.head ul{line-height:1.75;padding-left:18px;max-width:980px;margin:0}
#windows{max-width:1340px;margin:0 auto;padding:10px 24px 60px}.cap{font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin:26px 0 10px;opacity:.75}
.win{width:1280px;height:780px;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.tb{height:36px;display:flex;align-items:center;gap:10px;padding:0 0 0 14px;font-size:12.5px;flex:none}.tb-t{flex:1;opacity:.8}.tb-b{display:flex}.tb-b i{font-style:normal;width:46px;text-align:center;line-height:36px;opacity:.7}
.body{flex:1;display:grid;grid-template-columns:220px 1fr 300px;min-height:0}
.side{padding:18px 14px;display:flex;flex-direction:column;gap:14px;min-height:0}.logo{font-size:20px;font-weight:800;padding:0 8px}
.side nav{display:flex;flex-direction:column;gap:2px}.side nav a{display:flex;align-items:center;gap:10px;padding:9px 10px;font-size:13.5px;border-radius:10px}.side nav a span{width:20px;text-align:center}.side nav a em{margin-left:auto;font-style:normal;font-size:11px;opacity:.75}
.side-foot{margin-top:auto;display:flex;flex-direction:column;gap:8px}.lk{font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.7;padding:0 4px}
.seg{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:3px}.seg span{text-align:center;font-size:10.5px;padding:7px 0}
.side-row{display:flex;gap:6px;flex-wrap:wrap}.pill{font-size:11px;padding:6px 9px}.kofi{font-size:12px;text-align:center;padding:8px}
.main{padding:22px 26px;display:flex;flex-direction:column;min-height:0}.main .top{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}.main .top small{font-size:12px;letter-spacing:.14em;text-transform:uppercase}.main .top h1{margin:2px 0 0;font-size:30px}
.prog{width:260px}.prog .bar{height:6px;overflow:hidden;margin-bottom:6px}.prog .bar i{display:block;height:100%}.prog span{font-size:12px}
.stage{flex:1;display:grid;grid-template-columns:400px 1fr;gap:24px;align-items:center;min-height:0}
.wheel{width:390px;height:390px;display:block;margin:0 auto}
.result small{font-size:12px;letter-spacing:.16em;text-transform:uppercase}.result h2{font-size:40px;margin:4px 0 8px;line-height:1.02}.result p{font-size:14.5px;line-height:1.55;margin:0 0 14px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}.chip{font-size:12px;padding:5px 11px}
.odds{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}.odds div{padding:10px 12px}.odds b{display:block;font-size:20px}.odds span{font-size:11px;opacity:.75}
.btns{display:grid;grid-template-columns:1fr 1.4fr;gap:10px}.btn{white-space:nowrap;font:inherit;font-weight:700;font-size:14px;padding:13px 16px;border:0;cursor:default}.hint{font-size:11.5px;opacity:.6;margin-top:10px}
.aside{padding:18px 16px;display:flex;flex-direction:column;gap:10px;min-height:0;overflow:hidden}
.mini{display:flex;gap:12px;align-items:center}.av{width:52px;height:52px;display:grid;place-items:center;font-weight:800;flex:none}.mini b{font-size:16px}.mini small{display:block;font-size:12px;opacity:.75}
.rating{display:flex;align-items:baseline;gap:10px;padding:10px 12px}.rating b{font-size:30px}.rating span{font-size:12px;letter-spacing:.14em;text-transform:uppercase}
.panel{padding:12px 14px}.panel h3{margin:0 0 8px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;opacity:.75;font-weight:700}
.kv{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0}.kv span{opacity:.7}.kv b{font-weight:600;text-align:right}
.sb{display:grid;grid-template-columns:34px 1fr 96px;gap:8px;align-items:center;font-size:11.5px;margin:6px 0}.sb .b{height:7px;overflow:hidden}.sb .b i{display:block;height:100%}.sb em{font-style:normal;text-align:right;font-size:11px;opacity:.85}
.sr{display:grid;grid-template-columns:34px auto 1fr;gap:8px;align-items:center;font-size:12px;margin:5px 0}.sr em{font-style:normal;text-align:right;font-size:11px;opacity:.8}
.tbl{width:100%;border-collapse:collapse;font-size:12.5px}.tbl td{padding:5px 0}.tbl td:last-child{text-align:right;width:30px;opacity:.6}
.radar{width:100%;height:190px;display:block}
.saga{display:flex;flex-direction:column;gap:6px}.ev{display:grid;grid-template-columns:22px 1fr;gap:8px;font-size:12.5px;line-height:1.4}.ev i{font-style:normal}.ev small{display:block;font-size:11px;opacity:.6}
.main.two{display:grid;grid-template-columns:340px 1fr;gap:24px;padding:22px 26px;grid-column:2 / 4}
.cardcol{display:flex;flex-direction:column;gap:12px}.portrait{height:470px;position:relative;overflow:hidden;display:flex;align-items:flex-end;padding:18px}
.portrait .glow{position:absolute;left:50%;top:60px;width:190px;height:250px;transform:translateX(-50%);border-radius:95px 95px 40px 40px}
.portrait .who{position:relative}.portrait .who small{font-size:12px;letter-spacing:.14em;text-transform:uppercase}.portrait h2{margin:2px 0;font-size:32px}.portrait .who span{font-size:13px}
.portrait .badge{position:absolute;top:14px;right:14px;font-size:12.5px;font-weight:800;padding:6px 12px}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.actions .btn:first-child{grid-column:1 / 3}.actions .btn{font-size:12.5px;padding:10px}
.sheet{display:flex;flex-direction:column;gap:12px;min-height:0;overflow:hidden}.cols{display:grid;grid-template-columns:1fr 1fr;column-gap:28px}
.row2{display:grid;grid-template-columns:1fr 1.3fr;gap:12px}.buffs{display:flex;flex-direction:column;gap:5px}.buff{display:flex;justify-content:space-between;gap:10px;font-size:12px;align-items:center}.buff span{opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}.buff div{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.buff i{font-style:normal;font-size:10.5px;padding:2px 7px}
.back{text-align:center;margin:0 0 50px}`;

const LOOKS = [
  { file: 'd1-glass.html', style: 'glass', n: 1, name: 'Glass', fonts: '"Segoe UI Variable Text","Segoe UI",Inter,system-ui,sans-serif',
    desc: 'The Glass direction as a desktop app: a frosted sidebar, the wheel lit like an object in the middle, and the character always visible on the right. Results float in glass cards.',
    pts: ['Three columns: navigation, the wheel, your character and saga', 'Keyboard first: Space spins, Enter continues, Esc pauses the story', 'Character screen: big portrait card with every action next to it'],
    css: `body{font-family:FONTS;color:#f4f6ff;background:#0b0a1f}body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(50% 50% at 10% 0%,#5b3df599,transparent 70%),radial-gradient(45% 45% at 95% 15%,#ff4f9a77,transparent 70%),radial-gradient(60% 50% at 50% 100%,#17d4c755,transparent 70%)}
.head small{color:#2ee6d6}.head p,.head ul{color:rgba(235,240,255,.7)}.back a{color:#fff}
.win{background:linear-gradient(150deg,#1b1543,#100e29 55%,#0c1b2b);border:1px solid rgba(255,255,255,.16);box-shadow:0 40px 100px rgba(0,0,0,.55)}
.tb{background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.08)}
.side{background:rgba(255,255,255,.04);border-right:1px solid rgba(255,255,255,.08)}.logo{background:linear-gradient(90deg,#fff,#c9b8ff);-webkit-background-clip:text;color:transparent}
.side nav a{color:rgba(235,240,255,.75)}.side nav a.on{background:linear-gradient(90deg,rgba(124,92,255,.45),rgba(255,95,162,.25));color:#fff}
.seg,.panel,.odds div,.rating,.pill,.kofi,.chip{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:14px}.seg span{border-radius:10px;color:rgba(235,240,255,.7)}.seg .on{background:rgba(255,255,255,.2);color:#fff}
.pill{border-radius:999px}.kofi{color:#fff}.chip{border-radius:999px;background:rgba(46,230,214,.14);border-color:rgba(46,230,214,.4)}.chip.bad{background:rgba(255,95,162,.14);border-color:rgba(255,95,162,.45)}
.main .top small,.result small{color:#2ee6d6}.prog .bar{background:rgba(255,255,255,.12);border-radius:9px}.prog .bar i{background:linear-gradient(90deg,#2ee6d6,#7c5cff)}
.wheel{filter:drop-shadow(0 26px 60px rgba(124,92,255,.5))}.result h2{background:linear-gradient(90deg,#fff,#c9b8ff);-webkit-background-clip:text;color:transparent}.result p{color:rgba(235,240,255,.75)}
.btn{border-radius:14px;color:#fff;background:linear-gradient(90deg,#7c5cff,#ff5fa2);box-shadow:0 10px 30px #7c5cff55}.btn.ghost{background:rgba(255,255,255,.08);box-shadow:none;border:1px solid rgba(255,255,255,.16)}
.aside{background:rgba(255,255,255,.03);border-left:1px solid rgba(255,255,255,.08)}.av{border-radius:16px;background:linear-gradient(135deg,#7c5cff,#ff5fa2)}
.sb .b{background:rgba(255,255,255,.12);border-radius:9px}.sb .b i{background:linear-gradient(90deg,#2ee6d6,#7c5cff,#ff5fa2)}
.portrait{border-radius:24px;background:radial-gradient(70% 55% at 50% 32%,#d6c9ff,#5b3df5 52%,#1a1440)}.portrait .glow{background:linear-gradient(#ffffff40,#ffffff08);box-shadow:0 0 70px #fff6}.portrait .badge{background:rgba(0,0,0,.35);border-radius:999px}
.buff i{border-radius:999px;background:rgba(46,230,214,.14)}.buff i.debuff,.buff i.cond-debuff{background:rgba(255,95,162,.18)}.ev.bad i{filter:none}` },
  { file: 'd2-minimal.html', style: 'minimal', n: 2, name: 'Minimal', fonts: '"Segoe UI Variable Text","Segoe UI",Inter,system-ui,sans-serif',
    desc: 'The Minimal direction as a desktop app: white space, one orange accent and big type. Every number is shown, so you can always see why a result happened.',
    pts: ['A quiet sidebar; the active page is marked with a single orange bar', 'Results read like a page: heading, explanation, the numbers behind it', 'Character screen laid out like a profile page, with a clean data table'],
    css: `body{font-family:FONTS;color:#16161d;background:#efeee9}.head small{color:#ff5a36}.head h1{letter-spacing:-.03em;font-weight:800}.head p,.head ul{color:#6d6d78}.back a{color:#16161d}
.win{background:#fff;border:1px solid #dcdce3;box-shadow:0 30px 80px rgba(20,20,40,.14)}.tb{background:#fafafa;border-bottom:1px solid #ececf1}
.side{border-right:1px solid #ececf1}.logo{letter-spacing:-.02em}.side nav a{color:#4a4a55;border-radius:0;border-left:3px solid transparent}.side nav a.on{border-left-color:#ff5a36;color:#16161d;font-weight:700;background:#faf8f6}
.seg{border:1px solid #16161d;border-radius:10px;padding:0;gap:0}.seg span{font-weight:600}.seg span+span{border-left:1px solid #16161d}.seg .on{background:#16161d;color:#fff}
.pill,.kofi{border:1px solid #dcdce3;border-radius:999px;color:#16161d}.kofi{border-color:#ff5a36;color:#ff5a36}
.main .top small,.result small{color:#ff5a36;font-weight:700}.main .top h1{letter-spacing:-.03em;font-weight:800}.prog .bar{background:#ececf1;height:3px}.prog .bar i{background:#ff5a36}
.result h2{font-size:52px;letter-spacing:-.04em;font-weight:800}.result p{color:#5d5d68}.chip{border:1px solid #dcdce3;border-radius:999px}.chip.bad{border-color:#ffc9bd;color:#c2391a}
.odds div{border-top:2px solid #16161d;padding:10px 0}.odds b{letter-spacing:-.03em}
.btn{background:#16161d;color:#fff;border-radius:12px}.btn.ghost{background:#fff;color:#16161d;border:1px solid #16161d}
.aside{border-left:1px solid #ececf1;background:#fbfbfc}.av{border-radius:50%;background:#16161d;color:#fff}.rating{border-top:2px solid #16161d;border-bottom:1px solid #ececf1;padding:10px 0}.rating b{letter-spacing:-.04em;font-weight:800}.rating span{color:#ff5a36;font-weight:700}
.panel{padding:10px 0;border-bottom:1px solid #ececf1}.tbl td{border-bottom:1px solid #f0f0f4}.tbl td:first-child{color:#6d6d78}
.ev{grid-template-columns:22px 1fr}.ev b{color:#ff5a36}
.portrait{background:#f3f1ed;border-radius:6px}.portrait .glow{background:#e3ded6}.portrait h2{letter-spacing:-.03em;font-weight:800}.portrait .who small{color:#ff5a36;font-weight:700}.portrait .badge{background:#16161d;color:#fff;border-radius:999px}
.buff i{border:1px solid #dcdce3;border-radius:999px}.buff i.buff,.buff i.cond-buff{border-color:#bfe3cc;color:#1f7a45}.buff i.debuff,.buff i.cond-debuff{border-color:#ffc9bd;color:#c2391a}` },
  { file: 'd3-hud.html', style: 'hud', n: 3, name: 'HUD', fonts: '"Cascadia Mono",Consolas,monospace',
    desc: 'The HUD direction as a desktop app: a command console. A glowing ring wheel, live readouts, angled panels, a stat radar and the saga as a mission log.',
    pts: ['Console layout with angled panels and a grid background', 'Readouts for odds, chapters left and the Retire slice next to the result', 'Character screen as a dossier with radar, effects and a mission log'],
    css: `body{font-family:FONTS;color:#d9fbff;background:#03060c}body:before{content:"";position:fixed;inset:0;z-index:-1;background:linear-gradient(rgba(0,240,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,.05) 1px,transparent 1px);background-size:32px 32px}
.head small{color:#ff2bd6;letter-spacing:.3em}.head h1{color:#00f0ff;letter-spacing:.08em;text-shadow:0 0 18px rgba(0,240,255,.6)}.head p,.head ul{color:rgba(160,230,240,.65);font-family:"Segoe UI",sans-serif}.back a{color:#00f0ff}
.win{background:radial-gradient(70% 60% at 50% 0%,#06243a,#03070f 70%);border:1px solid rgba(0,240,255,.35);box-shadow:0 0 60px rgba(0,240,255,.15)}.tb{border-bottom:1px solid rgba(0,240,255,.25);color:#00f0ff}
.side{border-right:1px solid rgba(0,240,255,.2)}.logo{color:#00f0ff;letter-spacing:.12em;text-shadow:0 0 14px #00f0ff;font-size:18px}.side nav a{color:rgba(160,230,240,.7);font-size:12px;border-radius:0}.side nav a.on{color:#001014;background:#00f0ff;box-shadow:0 0 18px rgba(0,240,255,.5)}
.panel,.odds div,.rating,.pill,.kofi,.seg,.chip{border:1px solid rgba(0,240,255,.3);background:rgba(0,30,45,.55);clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
.seg span{color:rgba(160,230,240,.7)}.seg .on{background:#00f0ff;color:#001014}.kofi{color:#ff2bd6}
.panel h3,.main .top small,.result small{color:#ff2bd6;letter-spacing:.24em}.main .top h1{letter-spacing:.12em;font-size:24px;color:#fff}.prog .bar{background:rgba(0,240,255,.15)}.prog .bar i{background:#00f0ff;box-shadow:0 0 10px #00f0ff}
.result h2{color:#fff;letter-spacing:.14em;font-size:38px;text-shadow:0 0 18px #ff2bd6,0 0 4px #ff2bd6}.result p{color:rgba(160,230,240,.75);font-family:"Segoe UI",sans-serif}.chip{color:#00f0ff;font-size:11px}.chip.bad{color:#ff2bd6;border-color:rgba(255,43,214,.5)}
.odds b{color:#ffe600}.btn{color:#fff;background:linear-gradient(90deg,rgba(0,240,255,.3),rgba(255,43,214,.3));border:1px solid #00f0ff;letter-spacing:.2em;clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}.btn.ghost{background:transparent}
.aside{border-left:1px solid rgba(0,240,255,.2)}.av{clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:linear-gradient(160deg,#ff2bd6,#00f0ff);color:#001014}.rating b{color:#ffe600}.rating span{color:#00f0ff}
.ev{display:block;font-size:11.5px;color:rgba(160,230,240,.8)}.ev b{color:#00f0ff}.ev.bad b{color:#ff2bd6}.kv b{color:#00f0ff}
.portrait{background:radial-gradient(60% 50% at 50% 35%,#ff2bd655,#06243a 60%,#03070f);border:1px solid rgba(0,240,255,.35);clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px))}.portrait .glow{background:linear-gradient(160deg,#ff2bd666,#00f0ff44);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);border-radius:0}.portrait h2{color:#fff;letter-spacing:.06em}.portrait .who small{color:#ff2bd6}.portrait .badge{color:#ffe600;border:1px solid #ffe600}
.buff i{border:1px solid rgba(0,240,255,.4);color:#00f0ff}.buff i.debuff,.buff i.cond-debuff{border-color:rgba(255,43,214,.5);color:#ff2bd6}` },
  { file: 'd4-gacha.html', style: 'gacha', n: 4, name: 'Gacha', fonts: 'Bahnschrift,"Segoe UI",system-ui,sans-serif',
    desc: 'The Gacha direction as a desktop app: bold, colourful and rewarding. Rarity colours on every wheel, chunky 3D buttons, a big reveal and the character as a collectible card.',
    pts: ['Rarity colours (common, rare, epic, legendary) from each entry\'s real odds', 'A gold rim with light bulbs and a big red pointer; 3D buttons', 'Character screen as a collectible card with stars and a level bar'],
    css: `body{font-family:FONTS;color:#fff;background:linear-gradient(160deg,#2a0f5c,#120a2e 60%,#06051a)}.head small{color:#ffc83d}.head h1{text-shadow:0 4px 0 #6b2bd9}.head p,.head ul{color:rgba(255,255,255,.72);font-family:"Segoe UI",sans-serif}.back a{color:#ffc83d}
.win{background:radial-gradient(80% 60% at 50% 0%,#6c2bd9,#2a0f5c 55%,#150a33);border:3px solid #7d4cf0;box-shadow:0 30px 80px rgba(0,0,0,.5)}.tb{background:rgba(0,0,0,.25)}
.side{background:rgba(0,0,0,.2)}.logo{color:#ffc83d;text-shadow:0 3px 0 #b06d00}.side nav a{color:rgba(255,255,255,.8);font-weight:600;border-radius:14px}.side nav a.on{background:linear-gradient(#a77bff,#7b2ff7);box-shadow:0 4px 0 #4a14a8;color:#fff}.side nav a em{background:#ff3b5c;border-radius:999px;padding:1px 7px;opacity:1}
.seg{background:rgba(0,0,0,.3);border-radius:12px}.seg span{border-radius:9px;font-weight:700}.seg .on{background:linear-gradient(#ffe27a,#ffb020);color:#5a3500}
.pill{background:rgba(0,0,0,.3);border-radius:999px;font-weight:700}.kofi{background:linear-gradient(#ff7a90,#ff3b5c);border-radius:14px;box-shadow:0 4px 0 #a3183a;font-weight:800}
.panel,.odds div,.rating{background:rgba(0,0,0,.28);border-radius:18px;border:2px solid rgba(255,255,255,.12)}.chip{background:rgba(0,0,0,.3);border-radius:999px;font-weight:700}.chip.bad{background:rgba(255,59,92,.3)}
.main .top small,.result small{color:#ffc83d;font-weight:800}.prog .bar{background:rgba(0,0,0,.4);border-radius:9px;height:10px;border:2px solid rgba(255,255,255,.15)}.prog .bar i{background:linear-gradient(90deg,#3dffa0,#2ee6d6)}
.wheel{filter:drop-shadow(0 14px 30px rgba(0,0,0,.5))}.result{padding:22px;border-radius:26px;background:linear-gradient(160deg,#7b2ff7,#3a0ea0);border:3px solid #d2a8ff;box-shadow:0 0 50px rgba(176,103,255,.55)}.result h2{text-shadow:0 4px 0 #4a14a8}.result p{font-family:"Segoe UI",sans-serif}.odds b{color:#ffc83d}
.btn{border-radius:18px;color:#5a3500;background:linear-gradient(#ffe27a,#ffb020);box-shadow:0 6px 0 #b06d00;font-weight:800;letter-spacing:.04em}.btn.ghost{color:#fff;background:linear-gradient(#a77bff,#7b2ff7);box-shadow:0 6px 0 #4a14a8}
.aside{background:rgba(0,0,0,.15)}.av{border-radius:18px;background:linear-gradient(135deg,#ffe27a,#ff9a3d);color:#5a3500;border:3px solid #fff}.rating b{color:#ffc83d}.stars{color:#ffc83d;letter-spacing:1px}
.portrait{border-radius:26px;border:6px solid #ffc83d;box-shadow:0 0 40px rgba(255,176,32,.5);background:radial-gradient(60% 50% at 50% 35%,#ffe7f5,#b067ff 45%,#2a0f5c)}.portrait .glow{display:none}.portrait:after{content:"🦊";position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-size:150px;filter:drop-shadow(0 10px 24px rgba(0,0,0,.4))}.portrait .who{z-index:1}.portrait .badge{background:linear-gradient(#ffe27a,#ffb020);color:#5a3500;border-radius:999px;z-index:1}
.buff i{border-radius:999px;background:rgba(61,255,160,.2)}.buff i.debuff,.buff i.cond-debuff{background:rgba(255,59,92,.3)}` }
];

const page = m => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1340">
<title>Desktop ${m.n} - ${m.name}</title>
<style>${BASE}
${m.css.replace(/FONTS/g, m.fonts)}</style></head>
<body>
<div class="head"><small>Desktop mockup ${m.n} of 4</small><h1>${m.name}</h1><p>${m.desc}</p><ul>${m.pts.map(p => '<li>' + p + '</li>').join('')}</ul></div>
<div id="windows"></div>
<p class="back"><a href="index.html">All desktop mockups</a></p>
<script src="../../app/js/data.js"></script><script src="../../app/js/data-more.js"></script><script src="../../app/js/data-extra.js"></script><script src="../../app/js/engine.js"></script><script src="../../app/js/story.js"></script><script src="../modern/modern.js"></script>
<script>window.DSTYLE = '${m.style}';</script><script src="desktop.js"></script>
</body></html>
`;
module.exports = { BASE };
if (require.main !== module) return;
LOOKS.forEach(m => fs.writeFileSync(path.join(__dirname, m.file), page(m)));
fs.writeFileSync(path.join(__dirname, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FateWheel - Desktop mockups</title>
<style>*{box-sizing:border-box}body{margin:0;font-family:"Segoe UI Variable Text","Segoe UI",Inter,system-ui,sans-serif;background:#0d0d14;color:#f2f2f7}main{max-width:1240px;margin:0 auto;padding:36px 18px 60px}h1{font-size:clamp(30px,5vw,46px);margin:0 0 6px}p.lead{color:#a9a9b8;max-width:780px;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:20px;margin-top:24px}a.card{display:block;text-decoration:none;color:inherit;border:1px solid #2a2a38;border-radius:20px;overflow:hidden;background:#15151f}a.card img{width:100%;aspect-ratio:1280/780;object-fit:cover;object-position:top;display:block;background:#222}a.card div{padding:14px 16px}a.card b{font-size:18px}a.card span{display:block;color:#a9a9b8;font-size:13.5px;margin-top:4px;line-height:1.45}.note{color:#a9a9b8;font-size:13.5px;margin-top:26px}.note a{color:#fff}</style></head>
<body><main><h1>Desktop client mockups</h1><p class="lead">The four modern directions laid out for the desktop app (1280×780 window). Each page shows the Story screen (navigation, wheel, character and saga side by side) and the Character screen. Phone layouts are in <a href="../modern/index.html" style="color:#fff">mockups/modern</a>.</p>
<div class="grid">${LOOKS.map(m => `<a class="card" href="${m.file}"><img src="previews/${m.file.replace('.html', '')}-story.jpg" alt="${m.name} desktop mockup"><div><b>${m.n} · ${m.name}</b><span>${m.desc}</span></div></a>`).join('')}</div>
<p class="note">Open these pages through a local server (for example <code>python -m http.server</code> in the project folder) so they can load the game data. Regenerate them with <code>node mockups/desktop/_gen.js</code>.</p></main></body></html>
`);
console.log('wrote', LOOKS.length, 'pages and index.html');
