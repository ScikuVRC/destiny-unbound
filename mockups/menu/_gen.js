// Writes the four main menu mockups (title screen + options screen): node mockups/menu/_gen.js
const fs = require('fs'), path = require('path');

const MENU = ['Continue', 'New Legend', 'Story', 'Arena', 'Daily Challenge', 'Hall of Legends', 'Mods', 'Options', 'Quit'];
const SUB = { Continue: 'Sera Ashgrove · Chapter 7', 'New Legend': 'Spin a new hero', 'Daily Challenge': 'Today\'s seed · best 74', 'Hall of Legends': '12 legends', Mods: '2 installed' };

const BASE = `*{box-sizing:border-box}body{margin:0;min-height:100vh}
.head{max-width:1320px;margin:0 auto;padding:28px 24px 0}.head small{letter-spacing:.2em;text-transform:uppercase;font-weight:700;font-size:12px}.head h1{margin:6px 0;font-size:44px}.head p{max-width:900px;line-height:1.6;margin:0 0 8px}.head ul{line-height:1.7;padding-left:18px;max-width:980px;margin:0}
#screens{max-width:1320px;margin:0 auto;padding:6px 24px 60px}.cap{font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin:24px 0 10px;opacity:.75}
.scr{width:1280px;height:720px;position:relative;overflow:hidden;border-radius:10px;box-shadow:0 30px 90px rgba(0,0,0,.6)}
.scene{position:absolute;inset:0}.emblem{position:absolute;opacity:.32}
.logo{position:absolute;text-align:center}.logo h2{margin:0;line-height:.95}.logo p{margin:8px 0 0}
.menu{position:absolute;display:flex;flex-direction:column}.menu a{display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit}.menu a small{display:block;opacity:.7}
.foot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;padding:12px 22px;font-size:13px}.foot span{opacity:.75}.foot b{font-weight:600}
.opt{position:absolute;inset:0;display:flex;flex-direction:column;padding:34px 48px}.opt h2{margin:0 0 4px}.tabs{display:flex;gap:6px;margin:12px 0 18px}.tabs span{padding:9px 18px;font-size:15px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:26px;flex:1;min-height:0}.grp h3{margin:0 0 10px;font-size:13px;letter-spacing:.18em;text-transform:uppercase}
.r{display:grid;grid-template-columns:170px 1fr;align-items:center;gap:14px;min-height:42px;font-size:15px}.r>span{opacity:.85}
.seg{display:flex}.seg i{flex:1;text-align:center;font-style:normal;padding:7px 4px;font-size:13px}
.sel{display:flex;justify-content:space-between;align-items:center;padding:7px 12px;font-size:14px}.sel:after{content:"▾";opacity:.7}
.sl{display:grid;grid-template-columns:1fr 44px;align-items:center;gap:12px}.sl .t{height:6px;position:relative}.sl .t i{position:absolute;left:0;top:0;bottom:0}.sl .t b{position:absolute;top:50%;width:16px;height:16px;transform:translate(-50%,-50%)}.sl em{font-style:normal;text-align:right;font-size:14px}
.tg{width:46px;height:24px;position:relative}.tg:after{content:"";position:absolute;top:3px;width:18px;height:18px}.tg.on:after{right:3px}.tg:not(.on):after{left:3px}
.hint{font-size:12.5px;opacity:.65;margin-top:2px}
.btns{display:flex;justify-content:space-between;align-items:center;margin-top:14px}.btns div{display:flex;gap:10px}.btn{padding:11px 22px;font-size:15px}
.back{text-align:center;margin:0 0 50px}`;

const LOOKS = [
  { file: 'm1-ashen-crown.html', theme: 'ashen', wheel: 'ember', n: 1, name: 'Ashen Crown', genre: 'Dark fantasy',
    desc: 'A souls-like title screen: a burning valley under a dead sky, the iron wheel turning slowly behind the title, and the menu down the left side like an old game\'s. The selected item burns.',
    layout: 'left',
    css: `body{background:#0b0908;color:#e9dcc4;font-family:"EB Garamond",Georgia,serif}.head small{color:#e0662d;font-family:Cinzel,serif}.head h1{font-family:Cinzel,serif;color:#f3e2c3}.head p,.head ul{color:#b9aa91;font-size:17px}.back a{color:#e0b46a}
.scr{background:#0b0908;border:1px solid #3b3022}
.scene{background:radial-gradient(45% 30% at 72% 100%,#c2410c88,transparent 70%),radial-gradient(70% 40% at 70% 85%,#5a1a0866,transparent 70%),linear-gradient(transparent 55%,#120c09 75%),linear-gradient(#1a1412,#0b0908 60%)}
.scene:before{content:"";position:absolute;left:0;right:0;bottom:120px;height:230px;background:linear-gradient(135deg,transparent 48%,#0d0a09 49%) 0 0/180px 230px repeat-x,linear-gradient(225deg,transparent 48%,#0d0a09 49%) 90px 40px/220px 190px repeat-x;opacity:.95}
.scene:after{content:"";position:absolute;inset:0;background:radial-gradient(1.5px 1.5px at 62% 70%,#ffb35c,transparent),radial-gradient(2px 2px at 80% 62%,#ff7a1a,transparent),radial-gradient(1.5px 1.5px at 70% 52%,#ffd7a8,transparent),radial-gradient(2px 2px at 88% 76%,#ff9a4a,transparent),radial-gradient(1px 1px at 76% 44%,#ffb35c,transparent)}
.emblem{right:70px;top:90px;width:520px;height:520px;opacity:.55;filter:drop-shadow(0 0 40px #c2410c66)}
.logo{left:72px;top:70px;text-align:left}.logo h2{font-family:Cinzel,serif;font-weight:900;font-size:76px;letter-spacing:.04em;background:linear-gradient(180deg,#ffe3b8,#e0a35c 55%,#a8380e);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 0 24px rgba(224,102,45,.35))}.logo p{font-family:Cinzel,serif;letter-spacing:.32em;font-size:13px;color:#e0662d}
.menu{left:72px;top:225px;gap:2px}.menu a{font-family:Cinzel,serif;font-size:21px;letter-spacing:.06em;padding:7px 0;color:#b9aa91}.menu a:before{content:"";width:14px}
.menu a.on{color:#ffd7a8;text-shadow:0 0 18px #ff7a1a}.menu a.on:before{content:"❖";color:#e0662d;width:14px}.menu a small{font-family:"EB Garamond",serif;font-size:14px;letter-spacing:0;color:#e0b46a;margin-left:8px}
.foot{border-top:1px solid #3b3022;background:linear-gradient(transparent,#0b0908)}.foot b{color:#e0b46a;font-family:Cinzel,serif}
.opt{background:radial-gradient(60% 40% at 50% 110%,#5a1a0855,transparent),#0f0c0b}.opt h2{font-family:Cinzel,serif;font-size:34px;color:#f3e2c3}
.tabs span{font-family:Cinzel,serif;color:#a89a82;border-bottom:2px solid transparent}.tabs .on{color:#ffd7a8;border-bottom-color:#e0662d;text-shadow:0 0 12px #ff7a1a}
.grp{border:1px solid #4d3f2c;background:linear-gradient(#18130f,#110e0c);padding:16px 20px;position:relative}.grp:before{content:"❖";position:absolute;top:-10px;left:50%;transform:translateX(-50%);color:#b8975a;background:#0f0c0b;padding:0 8px}.grp h3{font-family:Cinzel,serif;color:#e0662d}
.seg i{border:1px solid #5a4a33;color:#a89a82;font-family:Cinzel,serif}.seg i+i{border-left:0}.seg i.on{background:linear-gradient(#7a2a0d,#3b1208);color:#ffd7a8}
.sel{border:1px solid #5a4a33;background:#120f0d}.sl .t{background:#1d1714;border:1px solid #3b3022}.sl .t i{background:linear-gradient(90deg,#5a1a08,#e0662d)}.sl .t b{background:#ffd7a8;border:2px solid #e0662d;transform:translate(-50%,-50%) rotate(45deg)}
.tg{background:#1d1714;border:1px solid #5a4a33}.tg:after{background:#6b5636}.tg.on{background:#5a1a08}.tg.on:after{background:#ffb35c;box-shadow:0 0 10px #ff7a1a}
.btn{font-family:Cinzel,serif;border:1px solid #5a4a33;background:#14100d;color:#e9dcc4}.btn.p{background:linear-gradient(#a8380e,#5a1a08);border-color:#e0a35c;color:#ffe3c2;box-shadow:0 0 22px #c2410c55}` },

  { file: 'm2-adventurers-sheet.html', theme: 'tabletop', wheel: 'parchment', n: 2, name: "Adventurer's Sheet", genre: 'Tabletop RPG',
    desc: 'The game opens like a book on a game table: the title page on the left, the menu as a table of contents on the right with dotted leaders, dice and a candle on the table. Options are a stat sheet with ink boxes.',
    layout: 'book',
    css: `body{background:#2a1a0e;color:#2b1d10;font-family:"IM Fell English",Georgia,serif}.head{color:#f1e2c0}.head small{color:#e8b25c;font-family:"IM Fell English SC",serif}.head h1{font-family:"IM Fell English SC",serif;font-weight:400;color:#f5e6c4}.head p,.head ul{color:#e3cfa6;font-size:17px}.cap{color:#e3cfa6}.back a{color:#f5e6c4}
.scr{border:2px solid #1a0f07}
.scene{background:radial-gradient(70% 60% at 50% 45%,transparent,#0d0805 100%),repeating-linear-gradient(90deg,#3a2414 0 38px,#33200f 38px 80px,#3d2716 80px 120px)}
.scene:before{content:"";position:absolute;left:110px;right:110px;top:46px;bottom:70px;background:linear-gradient(90deg,#e6d4ab,#f3e8cc 46%,#d9c49a 50%,#f3e8cc 54%,#e6d4ab);border-radius:6px;box-shadow:0 18px 50px rgba(0,0,0,.7),inset 0 0 0 10px rgba(255,255,255,.06),0 0 0 8px #4a2c18,0 0 0 10px #2a1a0e}
.scene:after{content:"🎲 🎲";position:absolute;right:36px;bottom:24px;font-size:34px;filter:drop-shadow(0 6px 8px #000)}
.emblem{left:210px;top:300px;width:300px;height:300px;opacity:.85}
.logo{left:150px;top:95px;width:440px}.logo h2{font-family:"IM Fell English SC",serif;font-weight:400;font-size:70px;color:#2b1d10}.logo p{font-style:italic;font-size:19px;color:#8e1b16}
.menu{left:690px;top:100px;width:440px;gap:0}.menu:before{content:"Contents";font-family:"IM Fell English SC",serif;font-size:26px;color:#8e1b16;margin-bottom:10px;text-align:center}
.menu a{font-size:21px;padding:6px 0;border-bottom:1px dotted rgba(59,42,26,.5)}.menu a:after{content:attr(data-p);margin-left:auto;font-family:"IM Fell English SC",serif;color:#8e1b16}
.menu a.on{color:#8e1b16;font-style:italic}.menu a.on:before{content:"☞";margin-right:-4px}.menu a small{font-size:14px;font-style:italic;color:#6b5640;margin-left:8px}
.foot{color:#e3cfa6}.foot b{color:#f5e0a8}
.opt{background:radial-gradient(40% 30% at 85% 15%,rgba(217,192,138,.4),transparent),radial-gradient(70% 60% at 50% 50%,#f3e8cc,#e3cf9f);box-shadow:inset 0 0 0 14px #4a2c18,inset 0 0 0 16px #2a1a0e}
.opt h2{font-family:"IM Fell English SC",serif;font-weight:400;font-size:38px;color:#8e1b16;text-align:center}.tabs{justify-content:center}.tabs span{font-family:"IM Fell English SC",serif;border:1.5px solid #3b2a1a;border-radius:6px 6px 0 0;background:#e6d4ab}.tabs .on{background:#8e1b16;color:#fbe9d0}
.grp{border:1.5px solid #3b2a1a;border-radius:4px;background:rgba(245,234,208,.7);padding:14px 20px;box-shadow:3px 3px 0 rgba(59,42,26,.25)}.grp h3{font-family:"IM Fell English SC",serif;font-weight:400;font-size:18px;letter-spacing:.06em;color:#8e1b16;text-transform:none}
.seg i{border:1.5px solid #3b2a1a;background:#f5ead0}.seg i+i{border-left:0}.seg i.on{background:#8e1b16;color:#fbe9d0}
.sel{border:1.5px solid #3b2a1a;background:#f8efd9;border-radius:3px}.sl .t{border:1.5px solid #3b2a1a;background:#f5ead0;height:8px}.sl .t i{background:repeating-linear-gradient(45deg,#8e1b16 0 4px,#b3261e 4px 8px)}.sl .t b{border-radius:50%;background:radial-gradient(circle at 35% 30%,#d2483d,#8e1b16 60%,#5a0f0b);width:20px;height:20px}
.tg{border:1.5px solid #3b2a1a;border-radius:12px;background:#f5ead0}.tg:after{border-radius:50%;background:#6b5640}.tg.on{background:#e3cf9f}.tg.on:after{background:radial-gradient(circle at 35% 30%,#d2483d,#8e1b16)}
.btn{font-family:"IM Fell English SC",serif;border:1.5px solid #3b2a1a;background:#f5ead0;border-radius:5px;box-shadow:2px 2px 0 rgba(26,15,7,.4)}.btn.p{background:radial-gradient(circle at 35% 30%,#d2483d,#8e1b16 60%,#5a0f0b);color:#fbe9d0;border-color:#3b0a07}` },

  { file: 'm3-iron-litany.html', theme: 'iron', wheel: 'gothic', n: 3, name: 'Iron Litany', genre: 'Grimdark gothic sci-fi',
    desc: 'A cathedral-forge at war: the brass cog-wheel rises like a rose window behind a blackletter title, and the menu is a column of riveted brass plates with +++ markers. Options read like a machine\'s maintenance panel.',
    layout: 'center',
    css: `body{background:#0a0a0b;color:#e3d8bd;font-family:"Share Tech Mono",Consolas,monospace}.head small{color:#c9302c}.head h1{font-family:UnifrakturCook,serif;font-size:56px;color:#e8c46a}.head p,.head ul{color:#a99e86}.back a{color:#e8c46a}
.scr{border:3px solid #8a5f1f}
.scene{background:radial-gradient(40% 50% at 50% 34%,#6e141455,transparent 70%),linear-gradient(#2a0b0b,#0a0a0b 70%)}
.scene:before{content:"";position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(90deg,#0d0d0f 0 6%,transparent 6% 9%,#0d0d0f 9% 14%,transparent 14% 86%,#0d0d0f 86% 91%,transparent 91% 94%,#0d0d0f 94%);clip-path:polygon(0 30%,4% 0,8% 30%,12% 10%,16% 40%,84% 40%,88% 10%,92% 30%,96% 0,100% 30%,100% 100%,0 100%)}
.scene:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,40,40,.035) 0 1px,transparent 1px 3px)}
.emblem{left:50%;top:14px;width:400px;height:400px;transform:translateX(-50%);opacity:.32;filter:drop-shadow(0 0 30px #b8862b55)}
.logo{left:0;right:0;top:120px}.logo h2{font-family:UnifrakturCook,serif;font-size:96px;color:#e8c46a;text-shadow:0 4px 0 #3a2a10,0 0 30px rgba(232,196,106,.35)}.logo p{display:inline-block;letter-spacing:.4em;font-size:13px;color:#ff5c4d;background:rgba(10,10,11,.85);padding:6px 14px;border:1px solid #3a2a10}
.menu{left:50%;top:300px;transform:translateX(-50%);width:420px;gap:6px}.menu a{justify-content:center;font-size:15px;letter-spacing:.2em;text-transform:uppercase;padding:7px 0;background:linear-gradient(#1b1c20,#141518);border:1px solid #3a2a10;border-top:2px solid #8a5f1f;clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,10px 100%,0 50%)}
.menu a.on{background:linear-gradient(#7a1414,#3a0808);color:#ffe3a0;border-color:#d9a94a}.menu a.on:before{content:"+++";color:#e8c46a}.menu a.on:after{content:"+++";color:#e8c46a}.menu a small{display:none}
.foot{background:repeating-linear-gradient(135deg,#1c1d20 0 12px,#2a0b0b 12px 24px);border-top:2px solid #8a5f1f}.foot b{color:#e8c46a}
.opt{background:linear-gradient(#17181b,#0e0f11)}.opt h2{font-family:UnifrakturCook,serif;font-size:44px;color:#e8c46a}
.tabs span{text-transform:uppercase;letter-spacing:.16em;font-size:13px;border:1px solid #3a2a10;background:#121316;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}.tabs .on{background:#6e1414;color:#ffe3a0;border-color:#d9a94a}
.grp{background:linear-gradient(#1b1c20,#141518);border:1px solid #3a2a10;border-top:2px solid #b8862b;padding:16px 20px;clip-path:polygon(0 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%)}.grp h3{color:#c9302c;letter-spacing:.24em}.grp h3:before{content:"▶ ";color:#b8862b}
.r>span{text-transform:uppercase;font-size:12.5px;letter-spacing:.1em}
.seg i{border:1px solid #8a5f1f;background:#0d0e10;text-transform:uppercase;font-size:11px}.seg i+i{border-left:0}.seg i.on{background:#6e1414;color:#ffe3a0}
.sel{border:1px solid #8a5f1f;background:#0d0e10}.sl .t{background:repeating-linear-gradient(90deg,#1c1d20 0 6px,#121316 6px 8px);height:12px}.sl .t i{background:repeating-linear-gradient(90deg,#d9a94a 0 6px,#8a5f1f 6px 8px)}.sl .t b{background:#b3121b;border:2px solid #e8c46a;width:14px;height:22px}
.tg{border:1px solid #8a5f1f;background:#0d0e10}.tg:after{background:#3a2a10}.tg.on:after{background:#e8c46a;box-shadow:0 0 8px #e8c46a}
.btn{border:1px solid #8a5f1f;background:linear-gradient(#2b2f35,#1b1c20);color:#e8d9b0;text-transform:uppercase;letter-spacing:.16em;font-size:13px}.btn.p{background:linear-gradient(#7a1414,#3a0808);border-color:#d9a94a;color:#ffe3a0}` },

  { file: 'm4-blood-moon.html', theme: 'bloodmoon', wheel: 'eldritch', n: 4, name: 'Blood Moon', genre: 'Gothic horror',
    desc: 'A hunter\'s night in a cursed city. The wheel is the moon: a dark iron clock-face hanging over the cathedral spires, its green eye open. The menu waits inside a tall gothic window of black lace and silver, lit by candles.',
    layout: 'left',
    css: `body{background:#040306;color:#d9d3e3;font-family:"Cormorant Garamond",Georgia,serif}.head small{color:#b3192f;font-family:"Cormorant SC",serif;font-size:14px}.head h1{font-family:"Cormorant SC",serif;font-size:60px;color:#efeaf5}.head p,.head ul{color:#a29bb2;font-size:19px}.back a{color:#c9cede}
.scr{border:1px solid rgba(201,206,222,.25);background:#040306}
.scene{background:radial-gradient(circle at 69.6% 39.5%,#9a1430 0,#6e0c22 170px,#4a0818 262px,#2a0510 282px,transparent 284px),radial-gradient(circle at 69.6% 39.5%,rgba(196,30,58,.4) 280px,rgba(120,12,30,.18) 360px,transparent 470px),linear-gradient(#07060c 0%,#0c0811 45%,#3a0a16 76%,#14050a 88%,#050407 100%)}
.scene:before{content:"";position:absolute;left:0;right:0;bottom:0;height:300px;background:#020103;clip-path:polygon(0 72%,3% 72%,3% 52%,4.5% 34%,6% 52%,6% 70%,11% 70%,11% 58%,13% 58%,14% 22%,15% 58%,17% 58%,17% 74%,24% 74%,24% 48%,25% 48%,26% 28%,27% 48%,28% 48%,28% 66%,36% 66%,36% 56%,39% 56%,41% 6%,43% 56%,46% 56%,46% 70%,52% 70%,52% 50%,54% 40%,56% 50%,56% 68%,63% 68%,63% 44%,64% 44%,65% 14%,66% 44%,67% 44%,67% 60%,72% 60%,72% 36%,74% 18%,76% 36%,76% 64%,82% 64%,82% 52%,84% 52%,85% 30%,86% 52%,88% 52%,88% 70%,94% 70%,94% 56%,96% 42%,98% 56%,98% 72%,100% 72%,100% 100%,0 100%)}
.scene:after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 70%,rgba(120,110,140,.12) 80%,rgba(30,26,40,.5) 90%,rgba(8,6,10,.9) 100%)}
.emblem{left:640px;top:36px;width:500px;height:500px;opacity:.92;filter:drop-shadow(0 0 60px rgba(196,30,58,.55)) saturate(.8) brightness(.8)}
.logo{left:110px;top:66px;width:400px;text-align:center}.logo h2{font-family:"Cormorant SC",serif;font-weight:700;font-size:68px;letter-spacing:.08em;color:#efeaf5;text-shadow:0 0 24px rgba(179,25,47,.45)}.logo p{font-style:italic;font-size:20px;color:#b9b1c8}
.logo:after{content:"— ❦ —";display:block;color:#b3192f;margin-top:6px;letter-spacing:.3em}
.menu{left:110px;top:205px;width:400px;height:470px;padding:62px 46px 30px;align-items:center;gap:0;background:linear-gradient(rgba(10,8,14,.88),rgba(6,5,9,.94));border:1px solid rgba(201,206,222,.45);border-radius:200px 200px 4px 4px;box-shadow:inset 0 0 0 6px rgba(6,5,9,.95),inset 0 0 0 7px rgba(201,206,222,.22),0 0 60px rgba(0,0,0,.8)}
.menu:before{content:"✠";position:absolute;top:16px;left:50%;transform:translateX(-50%);color:#c9cede;opacity:.6;font-size:22px}
.menu:after{content:"";position:absolute;left:24px;right:24px;bottom:-14px;height:24px;background:radial-gradient(4px 9px at 12% 40%,#ffd27a,transparent 70%),radial-gradient(4px 9px at 88% 40%,#ffd27a,transparent 70%),radial-gradient(24px 18px at 12% 50%,rgba(255,170,60,.35),transparent 70%),radial-gradient(24px 18px at 88% 50%,rgba(255,170,60,.35),transparent 70%)}
.menu a{justify-content:center;width:100%;font-size:21px;font-style:italic;padding:5px 0;color:#9d96ad;border-bottom:1px solid rgba(201,206,222,.09)}.menu a:last-child{border-bottom:0}
.menu a.on{color:#fff;text-shadow:0 0 18px rgba(196,30,58,.9);background:linear-gradient(90deg,transparent,rgba(122,15,34,.35),transparent)}.menu a.on:before{content:"❧";color:#b3192f;transform:scaleX(-1);display:inline-block}.menu a.on:after{content:"❧";color:#b3192f}
.menu a small{display:none}
.foot{color:#a29bb2}.foot b{color:#ff8fa3}
.opt{background:radial-gradient(30% 40% at 90% 0%,rgba(122,15,34,.45),transparent 70%),linear-gradient(#0c0a11,#050407);padding:30px 60px 34px}.opt:before{content:"";position:absolute;inset:14px;border:1px solid rgba(201,206,222,.28);box-shadow:inset 0 0 0 5px #070609,inset 0 0 0 6px rgba(201,206,222,.12);pointer-events:none}
.opt h2{font-family:"Cormorant SC",serif;font-size:38px;color:#efeaf5;text-align:center;letter-spacing:.1em}.opt h2:after{content:"— ❦ —";display:block;font-size:16px;color:#b3192f;letter-spacing:.3em;margin-top:2px}
.tabs{justify-content:center}.tabs span{font-style:italic;font-size:19px;color:#9d96ad}.tabs .on{color:#fff;text-shadow:0 0 12px rgba(196,30,58,.8);border-bottom:1px solid #b3192f}
.grp{border:1px solid rgba(201,206,222,.22);border-radius:120px 120px 4px 4px;background:linear-gradient(rgba(16,13,22,.9),rgba(9,8,13,.95));padding:22px 26px 10px;position:relative;box-shadow:inset 0 0 0 5px #08070b,inset 0 0 0 6px rgba(201,206,222,.1)}
.grp h3{font-family:"Cormorant SC",serif;color:#b3192f;font-size:17px;text-align:center;letter-spacing:.2em}
.r{font-size:17px;min-height:34px}.tabs{margin:6px 0 12px}.r>span{font-style:italic;color:#c8c1d6}
.seg i{border:1px solid rgba(201,206,222,.25);font-size:14px;font-style:italic;color:#9d96ad}.seg i+i{border-left:0}.seg i.on{background:linear-gradient(#7a0f22,#3a0712);color:#fff}
.sel{border:1px solid rgba(201,206,222,.25);background:#08070b;font-size:15px;font-style:italic}.sl .t{background:#1a1622;height:2px}.sl .t i{background:linear-gradient(90deg,#4a0614,#b3192f)}.sl .t b{background:#efeaf5;border-radius:50%;width:11px;height:11px;box-shadow:0 0 12px #b3192f}
.tg{border:1px solid rgba(201,206,222,.3);border-radius:12px}.tg:after{border-radius:50%;background:#4a4458}.tg.on{background:#2a0a12}.tg.on:after{background:#b3192f;box-shadow:0 0 10px #b3192f}
.btn{font-family:"Cormorant SC",serif;font-size:17px;border:1px solid rgba(201,206,222,.3);background:transparent;color:#d9d3e3;letter-spacing:.06em}.btn.p{background:linear-gradient(#8e1028,#3a0712);color:#fff;border-color:rgba(201,206,222,.5);box-shadow:0 0 22px rgba(179,25,47,.4)}` }
];

const slider = (v) => `<div class="sl"><div class="t"><i style="width:${v}%"></i><b style="left:${v}%"></b></div><em>${v}%</em></div>`;
const seg = (opts, on) => `<div class="seg">${opts.map(o => `<i class="${o === on ? 'on' : ''}">${o}</i>`).join('')}</div>`;
const sel = v => `<div class="sel">${v}</div>`, tg = on => `<div class="tg ${on ? 'on' : ''}"></div>`;
const row = (k, v, hint) => `<div class="r"><span>${k}</span><div>${v}${hint ? `<div class="hint">${hint}</div>` : ''}</div></div>`;

const page = m => {
  const pages = { Continue: 'vii', 'New Legend': '1', Story: '12', Arena: '27', 'Daily Challenge': '33', 'Hall of Legends': '41', Mods: '58', Options: '63', Quit: '—' };
  const title = `<div class="scr"><div class="scene"></div><canvas class="emblem" data-wheel='{"story":1,"pick":"conquerRace","style":"${m.wheel}"}'></canvas>
    <div class="logo"><h2>Destiny Unbound</h2><p>${m.theme === 'tabletop' ? 'A game of wheels, fate and legends' : m.theme === 'bloodmoon' ? 'Every legend is written in blood' : m.theme === 'iron' ? '+++ THE WHEEL DECREES +++' : 'SPIN · FORGE · ENDURE'}</p></div>
    <nav class="menu">${MENU.map((x, i) => `<a class="${i === 0 ? 'on' : ''}" data-p="${pages[x]}">${x}${SUB[x] ? `<small>${SUB[x]}</small>` : ''}</a>`).join('')}</nav>
    <div class="foot"><span>v1.0.0 · Mods: Verdant Grove</span><span>↑↓ Select · Enter Confirm · Esc Back</span><b>☕ Support on Ko-fi</b></div></div>`;
  const options = `<div class="scr"><div class="opt"><h2>Options</h2>
    <div class="tabs"><span class="on">Graphics</span><span>Audio</span><span>Gameplay</span><span>Controls</span><span>Language</span></div>
    <div class="cols">
      <div class="grp"><h3>Graphics</h3>
        ${row('Display mode', seg(['Windowed', 'Borderless', 'Fullscreen'], 'Borderless'))}
        ${row('Resolution', sel('1920 × 1080 (16:9)'), 'Also 1280×720, 1600×900, 2560×1440, 3840×2160, or your monitor\'s own')}
        ${row('UI scale', slider(100))}
        ${row('Frame limit', seg(['30', '60', '120', '144', 'Off'], '60'))}
        ${row('VSync', tg(true))}
        ${row('Animations', seg(['Full', 'Reduced', 'Off'], 'Full'))}
        ${row('Wheel quality', seg(['Low', 'Medium', 'High'], 'High'))}
        ${row('Particles and glow', tg(true))}
        ${row('Theme', sel(m.name))}
      </div>
      <div class="grp"><h3>Audio</h3>
        ${row('Master volume', slider(80))}
        ${row('Music', slider(35))}
        ${row('Sound effects', slider(90))}
        ${row('Interface', slider(60))}
        ${row('Ambience', slider(50))}
        ${row('Mute in background', tg(true), 'Silence the game when its window is not in focus')}
        ${row('Output device', sel('System default'))}
        ${row('Subtitles for sounds', tg(false))}
      </div>
    </div>
    <div class="btns"><button class="btn">Reset to defaults</button><div><button class="btn">Back</button><button class="btn p">Apply</button></div></div></div></div>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1340"><title>Menu ${m.n} - ${m.name}</title>
<link rel="stylesheet" href="../../app/css/fonts.css"><style>${BASE}
${m.css}</style></head><body>
<div class="head"><small>Main menu mockup ${m.n} of 4 · ${m.genre}</small><h1>${m.name}</h1><p>${m.desc}</p><ul><li>Title screen: full-screen scene, the themed wheel as an emblem, a game-style menu with keyboard hints</li><li>Options: Graphics (display mode, resolution, UI scale, frame limit, VSync, animations, wheel quality, effects) and Audio (master, music, effects, interface, ambience, background mute, output device)</li></ul></div>
<div id="screens"><div class="cap">Title screen</div>${title}<div class="cap">Options</div>${options}</div>
<p class="back"><a href="index.html">All main menu mockups</a></p>
<script src="../../app/js/data.js"></script><script src="../../app/js/data-more.js"></script><script src="../../app/js/data-extra.js"></script><script src="../../app/js/engine.js"></script><script src="../../app/js/story.js"></script><script src="../modern/modern.js"></script><script src="../themed/wheels.js"></script>
<script>document.fonts.ready.then(() => MOD.drawAll());</script>
</body></html>
`;
};
module.exports = { BASE, LOOKS, slider, seg, sel, tg, row };
if (require.main !== module) return;
LOOKS.forEach(m => fs.writeFileSync(path.join(__dirname, m.file), page(m)));
fs.writeFileSync(path.join(__dirname, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Destiny Unbound - Main menu mockups</title><link rel="stylesheet" href="../../app/css/fonts.css">
<style>body{margin:0;background:#0b0908;color:#e9dcc4;font-family:"EB Garamond",Georgia,serif}main{max-width:1240px;margin:0 auto;padding:36px 18px 60px}h1{font-family:Cinzel,serif;font-size:44px;margin:0 0 8px}p{color:#b9aa91;max-width:780px;line-height:1.6;font-size:17px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:20px;margin-top:20px}a{display:block;color:inherit;text-decoration:none;border:1px solid #3b3022;background:#14100e}a img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}a div{padding:12px 16px}a b{font-family:Cinzel,serif;font-size:19px}a span{display:block;color:#b9aa91;margin-top:4px}</style></head>
<body><main><h1>Main menu mockups</h1><p>A proper title screen and an Options screen with Graphics and Audio settings, in each of the four themes.</p><div class="g">${LOOKS.map(m => `<a href="${m.file}"><img src="previews/${m.file.replace('.html', '')}-title.jpg" alt=""><div><b>${m.n} · ${m.name}</b><span>${m.genre}</span></div></a>`).join('')}</div></main></body></html>
`);
console.log('wrote 4 menu mockups');
