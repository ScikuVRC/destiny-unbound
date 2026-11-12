// Writes the four detailed (Astral Oracle replaced Adventurer's Sheet) main menu mockups that use the painted art in mockups/menu/art (made with Grok):
// node mockups/menu/_gen-art.js
const fs = require('fs'), path = require('path');
const { BASE, LOOKS, slider, seg, sel, tg, row } = require('./_gen.js');

const ICON = {
  'Continue': 'M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z M12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z',
  'New Legend': 'M12 22c4 0 7-3 7-7 0-4.5-3.5-6.5-4.5-10-1 3-3 4.2-3 4.2S10.5 6 8.5 3C6.5 7 5 9.5 5 15c0 4 3 7 7 7z M12 22c-1.8 0-3-1.4-3-3.2 0-2 1.6-3 3-5.3 1.4 2.3 3 3.3 3 5.3 0 1.8-1.2 3.2-3 3.2z',
  'Story': 'M2.5 5c3.2-1.2 6.4-1 9.5 1 3.1-2 6.3-2.2 9.5-1v14c-3.2-1.2-6.4-1-9.5 1-3.1-2-6.3-2.2-9.5-1z M12 6v14 M5 9h4 M5 12h4 M15 9h4 M15 12h4',
  'Arena': 'M3 3l11 11 M3 3h4.5 M3 3v4.5 M21 3L10 14 M21 3h-4.5 M21 3v4.5 M6.5 15.5L4 18 M17.5 15.5L20 18 M3 19l2 2 M21 19l-2 2 M8 13l3 3 M16 13l-3 3',
  'Daily Challenge': 'M6 2h12 M6 22h12 M7 2c0 5.5 10 5.5 10 10S7 16.5 7 22 M17 2c0 5.5-10 5.5-10 10s10 4.5 10 10 M9.5 19h5',
  'Hall of Legends': 'M12 3c-2 2-2 5 0 7 2-2 2-5 0-7z M5 7c1 3 3.5 5 7 5.5 M19 7c-1 3-3.5 5-7 5.5 M4.5 11c1.5 3 4 4.8 7.5 5 M19.5 11c-1.5 3-4 4.8-7.5 5 M12 12.5V21 M8 21h8',
  'Mods': 'M12 8.2a3.8 3.8 0 110 7.6 3.8 3.8 0 010-7.6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9L7 7 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
  'Options': 'M12 2l1.8 2.6 3.1-.6.6 3.1L22 9l-1.6 3L22 15l-2.5 1.9-.6 3.1-3.1-.6L12 22l-1.8-2.6-3.1.6-.6-3.1L2 15l1.6-3L2 9l2.5-1.9.6-3.1 3.1.6z M12 9a3 3 0 110 6 3 3 0 010-6z',
  'Quit': 'M14 3H5v18h9 M10 12h11 M17 8l4 4-4 4'
};
const MENU = Object.keys(ICON);
const SUB = { Continue: 'Sera Ashgrove  ◆  Chapter 7' };
const icon = (k, cls) => `<svg class="${cls || 'ic'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[k]}"/></svg>`;
const CREST = `<svg class="crest" viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 40h36 M80 40h36 M10 36c8-6 18-6 26 0 M110 36c-8-6-18-6-26 0"/><circle cx="60" cy="34" r="16"/><circle cx="60" cy="34" r="8"/><path d="M60 8v52 M34 34h52 M49 23l22 22 M71 23L49 45"/><path d="M60 2l3 6h-6z" fill="currentColor"/></svg>`;

/* theme specific title screens */
const T = {
  ashen: { bg: 'ashen-bg', wheel: 'ashen-wheel', tag: 'The wheel turns. Legends are written.',
    css: `.bgart{background:url(art/ashen-bg.jpg) 70% 50%/cover}.bgart:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,4,3,.92) 0,rgba(6,4,3,.6) 34%,rgba(6,4,3,.1) 60%,rgba(6,4,3,.3)),linear-gradient(transparent 70%,rgba(6,4,3,.7))}
.wheelart{right:-40px;top:-44px;width:640px;height:780px;background:url(art/ashen-wheel.jpg) center/contain no-repeat;mix-blend-mode:screen;filter:drop-shadow(0 0 30px rgba(255,140,40,.35)) saturate(1.1);-webkit-mask:radial-gradient(closest-side,#000 88%,transparent 100%);mask:radial-gradient(closest-side,#000 88%,transparent 100%)}
.title{left:46px;top:20px;width:430px;text-align:center;color:#e8c37a}.title .crest{width:110px;color:#d9a94a;filter:drop-shadow(0 0 6px rgba(255,170,60,.5))}
.title h2{font-family:Cinzel,serif;font-weight:900;font-size:74px;letter-spacing:.02em;line-height:.9;margin:-4px 0 6px;background:linear-gradient(180deg,#fff0c8 0%,#e8b85c 38%,#a86a1c 70%,#f2cf7a 100%);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #2a1608) drop-shadow(0 0 22px rgba(255,150,50,.35))}
.title p{font-family:Cinzel,serif;letter-spacing:.18em;font-size:12.5px;color:#d8c08a;text-transform:uppercase;margin:0}.title p:after{content:"◆";display:block;color:#d9a94a;font-size:9px;margin-top:5px}
.panel{left:30px;top:196px;width:450px;height:490px;padding:22px 24px;background:linear-gradient(rgba(16,13,11,.86),rgba(9,7,6,.93)),repeating-linear-gradient(115deg,transparent 0 36px,rgba(255,220,160,.03) 36px 37px,transparent 37px 90px);border:1px solid #5a4630;box-shadow:inset 0 0 0 4px rgba(8,6,5,.9),inset 0 0 0 5px rgba(217,169,74,.25),0 20px 60px #000}
.panel:before,.panel:after{content:"";position:absolute;width:26px;height:26px;border:2px solid #b8975a}.panel:before{left:6px;top:6px;border-right:0;border-bottom:0}.panel:after{right:6px;bottom:6px;border-left:0;border-top:0}
.item{display:flex;align-items:center;gap:16px;padding:9px 18px;color:#c9b99a;font-family:Cinzel,serif;font-size:17px;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid rgba(217,169,74,.12)}.item .ic{width:24px;height:24px;color:#b8975a;flex:none}
.item.on{margin:0 -8px 10px;padding:14px 20px;border:1px solid #e8b85c;color:#ffe2a8;font-size:22px;background:radial-gradient(80% 120% at 30% 50%,rgba(255,170,60,.22),transparent 70%),linear-gradient(rgba(40,26,12,.95),rgba(20,13,7,.95));clip-path:polygon(16px 0,calc(100% - 16px) 0,100% 50%,calc(100% - 16px) 100%,16px 100%,0 50%);box-shadow:0 0 30px rgba(255,160,60,.35);text-shadow:0 0 14px rgba(255,170,60,.7)}
.item.on .ic{width:34px;height:34px;color:#ffd27a;filter:drop-shadow(0 0 6px #ff9a3a)}.item small{display:block;font-family:"EB Garamond",serif;font-size:14px;letter-spacing:.04em;text-transform:none;color:#e8c37a;margin-top:2px}
.embers{position:absolute;inset:0;pointer-events:none;background:radial-gradient(2px 2px at 64% 78%,#ffb35c,transparent),radial-gradient(1.5px 1.5px at 72% 64%,#ff7a1a,transparent),radial-gradient(2px 2px at 86% 84%,#ffd27a,transparent),radial-gradient(1.5px 1.5px at 92% 58%,#ff9a4a,transparent),radial-gradient(2px 2px at 56% 90%,#ff7a1a,transparent),radial-gradient(1px 1px at 80% 40%,#ffb35c,transparent)}
.foot{background:linear-gradient(transparent,rgba(5,4,3,.9));color:#a89a82;font-family:"EB Garamond",serif}.foot b{color:#e8c37a;font-family:Cinzel,serif}`,
    opt: 'ashen-bg' },
  tabletop: { bg: 'tabletop-bg', wheel: 'tabletop-wheel', tag: 'A game of wheels, fate and legends',
    css: `.bgart{background:url(art/tabletop-bg.jpg) 50% 40%/cover}.bgart:after{content:"";position:absolute;inset:0;background:radial-gradient(70% 70% at 50% 45%,transparent 55%,rgba(10,6,3,.55))}
.wheelart{left:384px;top:268px;width:178px;height:220px;background:url(art/tabletop-wheel.jpg) center/cover;mix-blend-mode:multiply;opacity:.9;-webkit-mask:radial-gradient(closest-side,#000 82%,transparent 100%);mask:radial-gradient(closest-side,#000 82%,transparent 100%)}
.title{left:340px;top:112px;width:270px;text-align:center;color:#2b1d10;transform:rotate(-1.2deg)}.title .crest{width:84px;color:#7a1f1a}
.title h2{font-family:"IM Fell English SC",serif;font-weight:400;font-size:52px;line-height:.95;margin:0;color:#2b1d10;text-shadow:0 1px 0 rgba(255,250,230,.5)}.title p{font-family:"IM Fell English",serif;font-style:italic;font-size:15px;color:#8e1b16;margin:4px 0 0}
.panel{left:640px;top:104px;width:292px;height:430px;padding:6px 10px;transform:rotate(1.3deg);color:#2b1d10}
.panel:before{content:"Contents";display:block;text-align:center;font-family:"IM Fell English SC",serif;font-size:25px;color:#8e1b16;margin-bottom:4px}
.item{display:flex;align-items:center;gap:10px;padding:5px 2px;font-family:"IM Fell English",serif;font-size:18px;border-bottom:1px dotted rgba(59,42,26,.45)}.item .ic{width:19px;height:19px;color:#5a3a1e;flex:none}.item:after{content:attr(data-p);margin-left:auto;font-family:"IM Fell English SC",serif;color:#8e1b16;font-size:16px}
.item.on{color:#8e1b16;font-style:italic;font-size:20px}.item.on .ic{color:#8e1b16}.item small{display:block;font-size:12.5px;color:#6b5640;font-style:italic}
.foot{background:linear-gradient(transparent,rgba(10,6,3,.85));color:#e3cfa6;font-family:"IM Fell English",serif}.foot b{color:#f5e0a8}`,
    opt: 'tabletop-bg' },
  iron: { bg: 'iron-bg', wheel: 'iron-wheel', tag: '+++ The wheel decrees +++',
    css: `.bgart{background:url(art/iron-bg.jpg) 50% 50%/cover}.bgart:after{content:"";position:absolute;inset:0;background:radial-gradient(34% 70% at 50% 55%,rgba(0,0,0,.55),transparent 80%),linear-gradient(rgba(10,4,4,.35),transparent 30%,transparent 70%,rgba(5,3,3,.85))}
.wheelart{left:50%;top:-70px;width:380px;height:560px;transform:translateX(-50%);background:url(art/iron-wheel.jpg) center/contain no-repeat;mix-blend-mode:screen;opacity:.45;filter:saturate(1.1);-webkit-mask:radial-gradient(closest-side,#000 85%,transparent 100%);mask:radial-gradient(closest-side,#000 85%,transparent 100%)}
.title{left:0;right:0;top:52px;text-align:center}.title .crest{width:96px;color:#d9a94a}
.title h2{font-family:UnifrakturCook,serif;font-size:92px;line-height:.9;margin:0;background:linear-gradient(180deg,#fff2c0,#e8c46a 45%,#8a5f1f 80%,#f0d080);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #1a0f04) drop-shadow(0 0 26px rgba(232,196,106,.35))}
.title p{display:inline-block;font-family:"Share Tech Mono",monospace;letter-spacing:.38em;font-size:12.5px;text-transform:uppercase;color:#ff5c4d;background:rgba(8,6,6,.85);border:1px solid #6b4a18;padding:6px 16px;margin-top:6px}
.panel{left:50%;top:270px;width:400px;transform:translateX(-50%);display:flex;flex-direction:column;gap:7px}
.item{display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 0;font-family:"Share Tech Mono",monospace;font-size:15px;letter-spacing:.22em;text-transform:uppercase;color:#d8cdb0;background:linear-gradient(#22242a,#15161a);border:1px solid #3a2a10;border-top:2px solid #b8862b;clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,12px 100%,0 50%);position:relative}
.item:before,.item:after{content:"";position:absolute;top:50%;width:5px;height:5px;border-radius:50%;background:#c99a3c;transform:translateY(-50%)}.item:before{left:20px}.item:after{right:20px}
.item .ic{width:18px;height:18px;color:#c99a3c}.item.on{background:linear-gradient(#8a1a18,#3a0808);color:#ffe3a0;border-color:#e8c46a;box-shadow:0 0 26px rgba(179,32,28,.6);font-size:16px}.item.on .ic{color:#ffe08a}.item small{display:none}
.foot{background:repeating-linear-gradient(135deg,rgba(28,29,32,.95) 0 12px,rgba(42,11,11,.95) 12px 24px);border-top:2px solid #8a5f1f;color:#a99e86;font-family:"Share Tech Mono",monospace}.foot b{color:#e8c46a}`,
    opt: 'iron-bg' },
  bloodmoon: { bg: 'bloodmoon-bg', wheel: 'bloodmoon-wheel', tag: 'Every legend is written in blood',
    css: `.bgart{background:url(art/bloodmoon-bg.jpg) 60% 50%/cover}.bgart:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,3,6,.85) 0,rgba(4,3,6,.55) 30%,transparent 55%),linear-gradient(transparent 75%,rgba(4,3,6,.8))}
.wheelart{left:196px;top:22px;width:128px;height:150px;background:url(art/bloodmoon-wheel.jpg) center/cover;mix-blend-mode:screen;filter:drop-shadow(0 0 18px rgba(196,30,58,.6));-webkit-mask:radial-gradient(closest-side,#000 80%,transparent 100%);mask:radial-gradient(closest-side,#000 80%,transparent 100%)}
.title{left:60px;top:168px;width:400px;text-align:center}.title .crest{display:none}
.title h2{font-family:"Cormorant SC",serif;font-weight:700;font-size:64px;letter-spacing:.08em;line-height:1;margin:0;color:#efeaf5;text-shadow:0 0 26px rgba(196,30,58,.55),0 2px 0 #000}
.title p{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:19px;color:#c8bfd6;margin:2px 0 0}.title p:after{content:"— ❦ —";display:block;color:#b3192f;letter-spacing:.3em;font-style:normal;font-size:14px;margin-top:3px}
.panel{left:90px;top:282px;width:340px;height:400px;padding:44px 36px 20px;background:linear-gradient(rgba(10,8,14,.82),rgba(6,5,9,.92));border:1px solid rgba(201,206,222,.45);border-radius:170px 170px 4px 4px;box-shadow:inset 0 0 0 6px rgba(6,5,9,.95),inset 0 0 0 7px rgba(201,206,222,.2),0 0 50px rgba(0,0,0,.85)}
.panel:before{content:"✠";position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#c9cede;opacity:.6;font-size:18px}
.item{display:flex;align-items:center;justify-content:center;gap:10px;padding:4px 0;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:20px;color:#a39cb4;border-bottom:1px solid rgba(201,206,222,.08)}.item .ic{width:17px;height:17px;color:#7d7590}
.item.on{color:#fff;text-shadow:0 0 16px rgba(196,30,58,.95);font-size:22px;background:linear-gradient(90deg,transparent,rgba(122,15,34,.4),transparent)}.item.on .ic{color:#e0405e}.item small{display:none}
.foot{color:#a39cb4;font-family:"Cormorant Garamond",serif}.foot b{color:#ff8fa3}`,
    opt: 'bloodmoon-bg' }
};

/* Astral Oracle replaces the Adventurer's Sheet (tabletop) look in this set. */
T.astral = { bg: 'astral-bg', wheel: 'astral-wheel', tag: 'Read the stars. Then defy them.',
  css: `.bgart{background:url(art/astral-bg.jpg) 65% 40%/cover}.bgart:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,5,16,.9) 0,rgba(3,5,16,.62) 32%,rgba(3,5,16,.08) 58%,transparent),linear-gradient(transparent 72%,rgba(3,5,16,.75))}
.wheelart{left:-70px;top:170px;width:620px;height:620px;background:url(art/astral-wheel.jpg) center/contain no-repeat;mix-blend-mode:screen;opacity:.2;filter:saturate(1.2);-webkit-mask:radial-gradient(closest-side,#000 80%,transparent 100%);mask:radial-gradient(closest-side,#000 80%,transparent 100%)}
.stars{position:absolute;inset:0;pointer-events:none;background:radial-gradient(1.5px 1.5px at 8% 12%,#fff,transparent),radial-gradient(1px 1px at 22% 30%,#cfe3ff,transparent),radial-gradient(1.5px 1.5px at 35% 8%,#fff,transparent),radial-gradient(1px 1px at 14% 52%,#a9c8ff,transparent),radial-gradient(1px 1px at 41% 44%,#fff,transparent),radial-gradient(1.5px 1.5px at 4% 78%,#cfe3ff,transparent)}
.title{left:40px;top:6px;width:460px;text-align:center}
.title p{font-family:"Cormorant Garamond",serif;font-style:italic;font-size:19px;letter-spacing:.06em;color:#b9c9ec;margin:0}.title p:after{content:"✦  ·  ✧  ·  ✦";display:block;font-style:normal;font-size:10px;letter-spacing:.3em;color:#8fb8ff;margin-top:4px}
.panel{left:80px;top:250px;width:380px;display:flex;flex-direction:column;gap:2px}
.panel:before{content:"";position:absolute;left:-18px;top:6px;bottom:6px;width:1px;background:linear-gradient(transparent,rgba(170,200,255,.55) 15%,rgba(170,200,255,.55) 85%,transparent)}
.item{display:flex;align-items:center;gap:14px;padding:8px 16px;font-family:Cinzel,serif;font-size:16px;letter-spacing:.16em;text-transform:uppercase;color:#aebbd9;position:relative}
.item:before{content:"";position:absolute;left:-21px;top:50%;width:7px;height:7px;transform:translateY(-50%) rotate(45deg);border:1px solid rgba(170,200,255,.6);background:#060a1c}
.item .ic{width:20px;height:20px;color:#7f9cd6;flex:none}
.item.on{margin:2px 0 10px;padding:13px 18px;font-size:21px;color:#fff;text-shadow:0 0 16px rgba(130,190,255,.9);background:linear-gradient(90deg,rgba(80,130,255,.28),rgba(80,130,255,.06) 70%,transparent);border-left:2px solid #9fd0ff;box-shadow:inset 0 1px 0 rgba(170,210,255,.25),inset 0 -1px 0 rgba(170,210,255,.12)}
.item.on:before{width:11px;height:11px;left:-23px;background:#cfe8ff;border-color:#fff;box-shadow:0 0 12px #8fc4ff,0 0 26px #5a8cff}
.item.on .ic{width:30px;height:30px;color:#d6ecff;filter:drop-shadow(0 0 6px #6fb0ff)}
.item small{display:block;font-family:"Cormorant Garamond",serif;font-style:italic;font-size:15px;letter-spacing:.03em;text-transform:none;color:#9fc0f0;margin-top:1px;text-shadow:none}
.foot{background:linear-gradient(transparent,rgba(3,5,16,.9));color:#8f9cbc;font-family:"Cormorant Garamond",serif}.foot b{color:#cfe3ff;font-family:Cinzel,serif}`,
  opt: 'astral-bg' };
const ASTRAL = { file: 'm2-astral-oracle.html', theme: 'astral', wheel: 'celestial', n: 2, name: 'Astral Oracle', genre: 'Celestial high fantasy',
  css: `body{background:#03050f;color:#dfe6f7;font-family:"Cormorant Garamond",Georgia,serif}.head small{color:#8fb8ff;font-family:Cinzel,serif;font-size:13px;letter-spacing:.2em;text-transform:uppercase}.head h1{font-family:Cinzel,serif;font-size:56px;color:#eef3ff}.head p{color:#9aa8c8;font-size:19px}.back a{color:#b9c9ec}
.scr{border:1px solid rgba(170,200,255,.25);background:#03050f}
.opt{padding:30px 60px}.opt:before{content:"";position:absolute;inset:14px;border:1px solid rgba(170,200,255,.22);border-radius:6px;pointer-events:none}
.opt h2{font-family:Cinzel,serif;font-weight:700;font-size:38px;color:#eef3ff;letter-spacing:.12em;text-align:center;text-shadow:0 0 22px rgba(120,170,255,.45)}.opt h2:after{content:"✦  ·  ✧  ·  ✦";display:block;font-size:11px;color:#8fb8ff;letter-spacing:.3em;margin-top:4px}
.tabs{justify-content:center}.tabs span{font-family:Cinzel,serif;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#8e9bbd}.tabs .on{color:#fff;text-shadow:0 0 12px rgba(130,190,255,.9);border-bottom:1px solid #9fd0ff}
.grp{border:1px solid rgba(170,200,255,.22);border-radius:8px;background:linear-gradient(rgba(10,16,40,.82),rgba(5,8,22,.9));padding:18px 26px 10px;box-shadow:inset 0 1px 0 rgba(170,210,255,.15),0 20px 50px rgba(0,0,0,.5)}
.grp h3{font-family:Cinzel,serif;color:#9fc8ff;font-size:15px;letter-spacing:.24em;text-transform:uppercase}
.r{font-size:17px;min-height:36px}.r>span{color:#c9d4ee}
.seg i{border:1px solid rgba(170,200,255,.25);font-family:Cinzel,serif;font-size:12px;letter-spacing:.08em;font-style:normal;color:#8e9bbd}.seg i+i{border-left:0}.seg i.on{background:linear-gradient(#3a5cc4,#1a2a6a);color:#fff;box-shadow:0 0 14px rgba(90,140,255,.45)}
.sel{border:1px solid rgba(170,200,255,.28);background:#060a1c;font-size:16px;color:#dfe6f7}
.sl .t{background:#18213f;height:3px;border-radius:2px}.sl .t i{background:linear-gradient(90deg,#2a4aa8,#8fc4ff)}.sl .t b{background:#eef6ff;border-radius:50%;width:12px;height:12px;box-shadow:0 0 12px #6fb0ff}
.tg{border:1px solid rgba(170,200,255,.3);border-radius:12px}.tg:after{border-radius:50%;background:#4a5677}.tg.on{background:#1a2a6a}.tg.on:after{background:#cfe8ff;box-shadow:0 0 10px #8fc4ff}
.btn{font-family:Cinzel,serif;font-size:15px;letter-spacing:.1em;border:1px solid rgba(170,200,255,.3);background:rgba(6,10,28,.8);color:#dfe6f7;border-radius:4px}.btn.p{background:linear-gradient(#3a5cc4,#1a2a6a);color:#fff;border-color:#9fd0ff;box-shadow:0 0 20px rgba(90,140,255,.45)}` };
const SET = LOOKS.map(m => m.theme === 'tabletop' ? ASTRAL : m);

const PAGES = { Continue: 'vii', 'New Legend': '1', Story: '12', Arena: '27', 'Daily Challenge': '33', 'Hall of Legends': '41', Mods: '58', Options: '63', Quit: '—' };
const TITLE_BASE = `.bgart,.wheelart{position:absolute}.bgart{inset:0}.title,.panel{position:absolute}.title .crest{display:block;margin:0 auto}.panel{list-style:none}`;

// Grok-painted "Destiny Unbound" logos: box height, zoom into the lettering, and per-theme placement tweaks.
const LOGO = {
  ashen: { h: 178, zoom: 100, css: '.title{top:2px}' },
  tabletop: { h: 150, zoom: 100, css: '.title{top:92px;width:290px;left:332px;mix-blend-mode:multiply}' },
  astral: { h: 190, zoom: 100, css: '.title{width:480px;left:30px}' },
  iron: { h: 214, zoom: 100, css: '.title{top:6px;left:50%;right:auto;width:480px;margin-left:-240px}' },
  bloodmoon: { h: 230, zoom: 100, css: '.title{top:14px}.wheelart{display:none}' }
};

// The game's real title screen is built from these same designs (scripts/make-menu-css.js).
module.exports = { T, LOGO, ICON, MENU, SUB, TITLE_BASE };
if (require.main === module) SET.forEach((m, i) => {
  const t = T[m.theme];
  const title = `<div class="scr titlescr"><div class="bgart"></div><div class="wheelart"></div>${m.theme === 'ashen' ? '<div class="embers"></div>' : m.theme === 'astral' ? '<div class="stars"></div>' : ''}
    <div class="title">${CREST}<h2 class="logoart" role="img" aria-label="Destiny Unbound">Destiny Unbound</h2><p>${t.tag}</p></div>
    <nav class="panel">${MENU.map((k, j) => `<div class="item${j === 0 ? ' on' : ''}" data-p="${PAGES[k]}">${icon(k)}<div>${k}${SUB[k] && m.theme !== 'iron' && m.theme !== 'bloodmoon' ? `<small>${SUB[k]}</small>` : ''}</div></div>`).join('')}</nav>
    <div class="foot"><span>v1.0.0 · Mods: Verdant Grove</span><span>↑↓ Select · Enter Confirm · Esc Back</span><b>☕ Support on Ko-fi</b></div></div>`;
  const options = `<div class="scr"><div class="optart" style="position:absolute;inset:-20px;background:url(art/${t.opt}.jpg) center/cover;filter:blur(14px) brightness(.32) saturate(.9)"></div><div class="opt" style="background:rgba(0,0,0,.25)"><h2>Options</h2>
    <div class="tabs"><span class="on">Graphics</span><span>Audio</span><span>Gameplay</span><span>Controls</span><span>Language</span></div>
    <div class="cols"><div class="grp"><h3>Graphics</h3>${row('Display mode', seg(['Windowed', 'Borderless', 'Fullscreen'], 'Borderless'))}${row('Resolution', sel('1920 × 1080 (16:9)'), 'Also 1280×720, 1600×900, 2560×1440, 3840×2160, or your monitor\'s own')}${row('UI scale', slider(100))}${row('Frame limit', seg(['30', '60', '120', '144', 'Off'], '60'))}${row('VSync', tg(true))}${row('Animations', seg(['Full', 'Reduced', 'Off'], 'Full'))}${row('Wheel quality', seg(['Low', 'Medium', 'High'], 'High'))}${row('Particles and glow', tg(true))}${row('Theme', sel(m.name))}</div>
    <div class="grp"><h3>Audio</h3>${row('Master volume', slider(80))}${row('Music', slider(35))}${row('Sound effects', slider(90))}${row('Interface', slider(60))}${row('Ambience', slider(50))}${row('Mute in background', tg(true), 'Silence the game when its window is not in focus')}${row('Output device', sel('System default'))}${row('Subtitles for sounds', tg(false))}</div></div>
    <div class="btns"><button class="btn">Reset to defaults</button><div><button class="btn">Back</button><button class="btn p">Apply</button></div></div></div></div>`;
  const file = 'a' + (i + 1) + '-' + m.file.replace(/^m\d-/, '');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1340"><title>Menu art ${i + 1} - ${m.name}</title>
<link rel="stylesheet" href="../../app/css/fonts.css"><style>${BASE}
${m.css}
${TITLE_BASE}
.titlescr .logo,.titlescr .menu,.titlescr .emblem{display:none}
${t.css}
.title .crest{display:none}.title h2.logoart{display:block;margin:0 auto;width:100%;height:${LOGO[m.theme].h}px;background:url(art/${m.theme}-logo.jpg) center/${LOGO[m.theme].zoom}% auto no-repeat;-webkit-background-clip:border-box;background-clip:border-box;color:transparent;filter:none;text-shadow:none;mix-blend-mode:${m.theme === 'tabletop' ? 'multiply' : 'screen'};-webkit-mask:radial-gradient(closest-side,#000 86%,transparent);mask:radial-gradient(closest-side,#000 86%,transparent)}
${LOGO[m.theme].css}
.opt,.opt *{position:relative}.opt{position:absolute}</style></head><body>
<div class="head"><small>Detailed main menu ${i + 1} of 4 · ${m.genre}</small><h1>${m.name}</h1><p>Painted background and wheel made with Grok; the menu, title, icons and options are built in code, so they stay sharp at any resolution and work with keyboard and mouse.</p></div>
<div id="screens"><div class="cap">Title screen</div>${title}<div class="cap">Options</div>${options}</div>
<p class="back"><a href="index.html">All main menu mockups</a></p></body></html>
`;
  fs.writeFileSync(path.join(__dirname, file), html);
  console.log('wrote', file);
});

// the gallery page: the detailed set (what the game uses) first, the earlier simple drafts below
if (require.main === module) {
  const card = (href, img, n, name, genre) => `<a href="${href}"><img src="${img}" alt=""><div><b>${n} · ${name}</b><span>${genre}</span></div></a>`;
  const detailed = SET.map((m, i) => { const f = 'a' + (i + 1) + '-' + m.file.replace(/^m\d-/, '').replace('.html', ''); return card(f + '.html', 'previews/' + f + '-title.jpg', i + 1, m.name, m.genre); }).join('');
  const drafts = LOOKS.map((m, i) => card(m.file, 'previews/' + m.file.replace('.html', '') + '-title.jpg', i + 1, m.name, m.genre)).join('');
  fs.writeFileSync(path.join(__dirname, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Destiny Unbound - Main menu mockups</title><link rel="stylesheet" href="../../app/css/fonts.css">
<style>body{margin:0;background:#0b0908;color:#e9dcc4;font-family:"EB Garamond",Georgia,serif}main{max-width:1240px;margin:0 auto;padding:36px 18px 60px}h1{font-family:Cinzel,serif;font-size:44px;margin:0 0 8px}h2{font-family:Cinzel,serif;margin:40px 0 0}p{color:#b9aa91;max-width:780px;line-height:1.6;font-size:17px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:20px;margin-top:20px}.g.small{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));opacity:.8}a{display:block;color:inherit;text-decoration:none;border:1px solid #3b3022;background:#14100e}a img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}a div{padding:12px 16px}a b{font-family:Cinzel,serif;font-size:19px}a span{display:block;color:#b9aa91;margin-top:4px}</style></head>
<body><main><h1>Main menu mockups</h1><p>The painted title screens and Options screens, one per theme. These are the designs the game's real main menu is built from (scripts/make-menu-css.js).</p><div class="g">${detailed}</div>
<h2>Earlier drafts</h2><p>The first, code-only versions. Adventurer's Sheet was later replaced by Astral Oracle.</p><div class="g small">${drafts}</div></main></body></html>
`);
  console.log('wrote index.html');
}
