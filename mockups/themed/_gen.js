// Writes the four themed desktop mockups: node mockups/themed/_gen.js
// Uses the shared desktop layout (mockups/desktop) with themed wheels (wheels.js) and themed styling.
const fs = require('fs'), path = require('path');
const { BASE } = require('../desktop/_gen.js');

const LOOKS = [
  { file: 't1-dark-fantasy.html', style: 'ember', n: 1, name: 'Ashen Crown', genre: 'Dark fantasy',
    fonts: 'family=Cinzel:wght@500;700;900&family=EB+Garamond:ital,wght@0,400;0,600;1,400',
    desc: 'Ash, embers and old iron. A grim, souls-like kingdom: the wheel is forged iron ringed with glowing runes, the pointer is a blade, and the chosen slice burns like a coal.',
    pts: ['Iron wheel with a rune ring, ember-lit slices and a sword pointer', 'Cinzel capitals over a warm book serif; gold-wire frames with diamond ornaments', 'Embers drifting up from the bottom of the window; the result glows like forge-light'],
    css: `body{font-family:"EB Garamond",Georgia,serif;color:#e9dcc4;background:#0b0908}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(80% 50% at 50% 115%,#7a2a0d88,transparent 70%),radial-gradient(2px 2px at 20% 80%,#ff9a4a,transparent),radial-gradient(2px 2px at 70% 65%,#ffb35c,transparent),radial-gradient(1.5px 1.5px at 45% 90%,#ff7a1a,transparent),radial-gradient(1.5px 1.5px at 85% 85%,#ffb35c,transparent)}
.head small{color:#e0662d;font-family:Cinzel,serif}.head h1{font-family:Cinzel,serif;font-weight:900;letter-spacing:.06em;color:#f3e2c3;text-shadow:0 0 30px #c2410c66}.head p,.head ul{color:#b9aa91;font-size:17px}.back a{color:#e0b46a}
.win{background:radial-gradient(70% 55% at 50% 120%,#5a1a08,transparent 70%),radial-gradient(90% 70% at 50% 0%,#1d1816,#0d0b0a 70%);border:1px solid #6b5636;box-shadow:0 0 0 4px #0b0908,0 0 0 5px #3b3022,0 40px 100px rgba(0,0,0,.7),0 0 80px #c2410c22}
.tb{background:linear-gradient(#1a1513,#100d0c);border-bottom:1px solid #3b3022;color:#b9aa91;font-family:Cinzel,serif}
.side{background:linear-gradient(90deg,#0f0c0b,#14100e);border-right:1px solid #3b3022}.logo{font-family:Cinzel,serif;font-weight:900;color:#e0b46a;letter-spacing:.06em;text-shadow:0 0 18px #c2410c88}
.side nav a{color:#b9aa91;font-family:Cinzel,serif;font-size:12.5px;letter-spacing:.04em;border-radius:2px}.side nav a.on{color:#ffd7a8;background:linear-gradient(90deg,#5a1a0866,transparent);box-shadow:inset 3px 0 0 #e0662d;text-shadow:0 0 10px #ff7a1a}
.seg{border:1px solid #5a4a33;background:#120f0e}.seg span{font-family:Cinzel,serif;color:#9a8b73}.seg .on{background:linear-gradient(#7a2a0d,#3b1208);color:#ffd7a8}
.pill,.kofi{border:1px solid #5a4a33;background:#120f0e;color:#d8c7a8;font-family:Cinzel,serif}.kofi{color:#e0b46a}
.panel,.odds div,.rating{background:linear-gradient(#18130f,#110e0c);border:1px solid #4d3f2c;position:relative}.panel:before{content:"❖";position:absolute;top:-9px;left:50%;transform:translateX(-50%);font-size:12px;color:#b8975a;background:#120f0d;padding:0 6px}
.panel h3,.main .top small,.result small,.lk{font-family:Cinzel,serif;color:#e0662d;letter-spacing:.18em}.main .top h1{font-family:Cinzel,serif;font-weight:700;color:#f3e2c3}
.prog .bar{background:#1d1714;border:1px solid #4d3f2c}.prog .bar i{background:linear-gradient(90deg,#7a2a0d,#ff7a1a)}
.result h2{font-family:Cinzel,serif;font-weight:900;color:#ffd7a8;text-shadow:0 0 26px #ff7a1aaa}.result p{color:#c8b89c;font-size:16px}
.chip{border:1px solid #6b5636;background:#14100d;color:#e0b46a;font-family:Cinzel,serif;font-size:11px}.chip.bad{border-color:#7a2a20;color:#ff8a6a}
.odds b{font-family:Cinzel,serif;color:#ffb35c}.btn{font-family:Cinzel,serif;letter-spacing:.06em;color:#ffe3c2;background:linear-gradient(#a8380e,#5a1a08);border:1px solid #e0a35c;box-shadow:0 0 22px #c2410c55,inset 0 1px 0 #ffb35c66}.btn.ghost{background:#14100d;border-color:#5a4a33;box-shadow:none;color:#d8c7a8}
.aside{background:linear-gradient(270deg,#0f0c0b,#14100e);border-left:1px solid #3b3022}.av{background:radial-gradient(#7a2a0d,#1d1714);border:1px solid #b8975a;color:#ffd7a8;font-family:Cinzel,serif;border-radius:2px}.mini b{font-family:Cinzel,serif;color:#f3e2c3}
.rating b{font-family:Cinzel,serif;color:#ffb35c}.rating span{color:#e0b46a;font-family:Cinzel,serif}.kv b{color:#e9dcc4}
.sb .b{background:#1d1714;border:1px solid #3b3022}.sb .b i{background:linear-gradient(90deg,#5a1a08,#e0662d,#ffd7a8)}
.portrait{background:radial-gradient(50% 45% at 50% 45%,#ff7a1a55,transparent 70%),radial-gradient(90% 80% at 50% 120%,#7a2a0d,#0d0b0a 70%);border:1px solid #6b5636;box-shadow:inset 0 0 0 6px #0d0b0a,inset 0 0 0 7px #4d3f2c}
.portrait .glow{background:linear-gradient(#000,#0b0908);top:70px;width:200px;height:300px;border-radius:100px 100px 20px 20px;box-shadow:0 0 60px #ff7a1a88}
.portrait h2{font-family:Cinzel,serif;font-weight:900;color:#ffd7a8;text-shadow:0 0 20px #c2410c}.portrait .who small{color:#e0662d;font-family:Cinzel,serif}.portrait .badge{border:1px solid #b8975a;color:#ffd7a8;background:#14100dcc;font-family:Cinzel,serif}
.buff i{border:1px solid #4d3f2c;background:#14100d;color:#e0b46a}.buff i.debuff,.buff i.cond-debuff{color:#ff8a6a;border-color:#7a2a20}.ev small{color:#9a8b73}` },

  { file: 't2-tabletop.html', style: 'parchment', n: 2, name: "Adventurer's Sheet", genre: 'Tabletop RPG',
    fonts: 'family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC',
    desc: 'A character sheet on a game table. Parchment, ink and red wax inside a leather-bound book; the wheel is hand-inked with a d20 in its hub, and your stats are ability-score boxes.',
    pts: ['Leather-bound sidebar with page tabs, parchment pages with ink rules', 'Hand-inked wheel with hatching, compass ticks and a d20 hub', 'Ability-score boxes with modifiers, red wax buttons and margin notes'],
    css: `body{font-family:"IM Fell English",Georgia,serif;color:#2b1d10;background:#2a1a0e}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:repeating-linear-gradient(90deg,#3a2414 0 38px,#33200f 38px 80px,#3d2716 80px 120px),radial-gradient(80% 70% at 50% 40%,transparent,#0d0805 100%);background-blend-mode:multiply}
.head{color:#f1e2c0}.head small{color:#e8b25c;font-family:"IM Fell English SC",serif}.head h1{font-family:"IM Fell English SC",serif;font-weight:400;color:#f5e6c4}.head p,.head ul{color:#e3cfa6;font-size:17px}.cap{color:#e3cfa6}.back a{color:#f5e6c4}
.win{background:#efe2c0;border:2px solid #3b2a1a;box-shadow:0 40px 100px rgba(0,0,0,.7)}
.tb{background:linear-gradient(#6a4429,#4a2c18);color:#f1e2c0;border-bottom:2px dashed #c9a46a55}
.main,.aside{background:radial-gradient(40% 30% at 85% 15%,#d9c08a55,transparent),radial-gradient(30% 25% at 15% 85%,#c9ab7244,transparent),radial-gradient(60% 50% at 50% 50%,#f3e8cc,#e6d4ab)}
.aside{border-left:2px solid #3b2a1a55}
.side{background:linear-gradient(90deg,#4a2c18,#5e3a21);color:#f1e2c0;box-shadow:inset -8px 0 14px #00000055}.logo{font-family:"IM Fell English SC",serif;font-size:24px;color:#f5e0a8}
.side nav a{color:#f1e2c0;font-size:14px;border-radius:0 8px 8px 0;margin-left:-14px;padding-left:24px}.side nav a.on{background:#efe2c0;color:#2b1d10;box-shadow:3px 3px 0 #2a1a0e;border-left:6px solid #b3261e}
.seg{background:#3a2414;border:1px solid #c9a46a;border-radius:4px}.seg span{color:#e3cfa6}.seg .on{background:#efe2c0;color:#2b1d10}.lk{color:#e8b25c}
.pill,.kofi{border:1px solid #c9a46a;color:#f1e2c0;border-radius:4px}.kofi{background:#b3261e;border-color:#6e1410}
.panel,.odds div,.rating{background:#f5ead0aa;border:1.5px solid #3b2a1a;border-radius:3px;box-shadow:2px 2px 0 #3b2a1a22}
.panel h3,.main .top small,.result small{font-family:"IM Fell English SC",serif;color:#8e1b16;letter-spacing:.08em;font-size:14px;opacity:1}
.main .top h1{font-family:"IM Fell English SC",serif;font-weight:400;font-size:34px}.prog .bar{border:1.5px solid #3b2a1a;background:#f5ead0}.prog .bar i{background:repeating-linear-gradient(45deg,#8e1b16 0 4px,#b3261e 4px 8px)}
.result h2{font-family:"IM Fell English",serif;font-weight:400;font-size:46px}.result p{font-style:italic;font-size:16.5px;color:#4a3420}
.chip{border:1.2px solid #3b2a1a;border-radius:3px;background:#f5ead0}.chip.bad{color:#8e1b16;border-color:#8e1b16}
.odds b{font-family:"IM Fell English",serif;font-size:26px;color:#8e1b16}
.btn{font-family:"IM Fell English SC",serif;font-size:16px;font-weight:400;color:#fbe9d0;background:radial-gradient(circle at 35% 30%,#d2483d,#8e1b16 60%,#5a0f0b);border-radius:6px;box-shadow:0 3px 0 #3b0a07}.btn.ghost{background:#f5ead0;color:#2b1d10;border:1.5px solid #3b2a1a;box-shadow:2px 2px 0 #3b2a1a33}
.av{border-radius:50%;background:radial-gradient(circle at 35% 30%,#d2483d,#8e1b16 60%,#5a0f0b);color:#fbe9d0;font-family:"IM Fell English SC",serif;border:2px solid #3b2a1a}.mini b{font-family:"IM Fell English SC",serif;font-size:19px}
.rating b{font-family:"IM Fell English",serif;font-size:34px}.rating span{color:#8e1b16;font-family:"IM Fell English SC",serif}
.abil{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.abil div{border:1.5px solid #3b2a1a;border-radius:6px;text-align:center;padding:4px 2px 6px;background:#f5ead0;position:relative}
.abil span{display:block;font-family:"IM Fell English SC",serif;font-size:11px;color:#8e1b16}.abil b{display:block;font-size:24px;font-weight:400;line-height:1.1}.abil i{display:inline-block;font-style:normal;border:1.2px solid #3b2a1a;border-radius:10px;padding:0 7px;font-size:12px;background:#efe2c0}
.abil small{display:block;font-size:9px;line-height:1.15;margin-top:3px;color:#5a4330;min-height:20px}
.portrait{background:radial-gradient(60% 50% at 50% 40%,#f6ecd2,#d9c08a 75%),#e6d4ab;border:2px solid #3b2a1a;box-shadow:inset 0 0 0 6px #efe2c0,inset 0 0 0 7.5px #3b2a1a;border-radius:4px}
.portrait .glow{background:repeating-linear-gradient(-45deg,#3b2a1a 0 1px,transparent 1px 6px);opacity:.55;border-radius:100px 100px 20px 20px;width:180px;height:270px;top:60px}
.portrait h2{font-family:"IM Fell English SC",serif;font-weight:400;font-size:34px}.portrait .who small{color:#8e1b16;font-family:"IM Fell English SC",serif}.portrait .badge{background:#8e1b16;color:#fbe9d0;border-radius:50%;width:84px;height:84px;display:grid;place-items:center;text-align:center;font-family:"IM Fell English SC",serif;font-size:12px;line-height:1.2;box-shadow:0 3px 0 #3b0a07}
.buff i{border:1px solid #3b2a1a;border-radius:3px;background:#f5ead0}.buff i.debuff,.buff i.cond-debuff{color:#8e1b16;border-color:#8e1b16}.ev small{color:#6b5640;font-style:italic}.kv span{font-family:"IM Fell English SC",serif}` },

  { file: 't3-grimdark.html', style: 'gothic', n: 3, name: 'Iron Litany', genre: 'Grimdark gothic sci-fi',
    fonts: 'family=UnifrakturCook:wght@700&family=Share+Tech+Mono&family=Cinzel:wght@700;900',
    desc: 'Cathedral-tech in an endless war: gunmetal, oxblood and brass, blackletter titles and machine readouts. The wheel is a brass cog with a red gem, and every record carries a wax seal.',
    pts: ['Brass cog wheel with rivets, oxblood and gunmetal slices, a spike pointer', 'Blackletter headings over terminal text, hazard stripes and +++ markers', 'Gothic arch portrait frame, a wax-sealed decree for each result'],
    css: `body{font-family:"Share Tech Mono",Consolas,monospace;color:#d8cdb0;background:#0a0a0b}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:repeating-linear-gradient(0deg,rgba(255,40,40,.035) 0 1px,transparent 1px 3px),radial-gradient(70% 60% at 50% 0%,#2a0b0b,#0a0a0b 70%)}
.head small{color:#c9302c}.head h1{font-family:UnifrakturCook,serif;font-size:58px;color:#e8c46a;text-shadow:0 2px 0 #3a2a10}.head p,.head ul{color:#a99e86;font-family:"Share Tech Mono",monospace}.back a{color:#e8c46a}
.win{background:linear-gradient(#17181b,#101114);border:3px solid #8a5f1f;box-shadow:0 0 0 1px #000,0 40px 100px rgba(0,0,0,.75),inset 0 0 0 1px #d9a94a55}
.tb{background:repeating-linear-gradient(135deg,#1c1d20 0 10px,#2a0b0b 10px 20px);color:#e8c46a;border-bottom:2px solid #8a5f1f;letter-spacing:.1em}
.side{background:#121316;border-right:2px solid #3a2a10}.logo{font-family:UnifrakturCook,serif;font-size:26px;color:#e8c46a;text-shadow:0 0 12px #b8862b55;letter-spacing:.02em}
.side nav a{color:#a99e86;font-size:11.5px;letter-spacing:.08em;border-radius:0}.side nav a.on{background:linear-gradient(90deg,#6e1414,#2a0b0b);color:#ffe3a0;box-shadow:inset 3px 0 0 #e8c46a}
.side nav a em{color:#e8c46a}
.seg{border:1px solid #8a5f1f;background:#0d0e10}.seg span{color:#a99e86;font-size:9.5px}.seg .on{background:#6e1414;color:#ffe3a0}.lk{color:#c9302c}
.pill,.kofi{border:1px solid #3a2a10;background:#0d0e10;color:#d8cdb0;font-size:10px}.kofi{color:#e8c46a;border-color:#8a5f1f}
.panel,.odds div,.rating{background:linear-gradient(#1b1c20,#141518);border:1px solid #3a2a10;border-top:2px solid #b8862b;clip-path:polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)}
.panel h3,.main .top small,.result small{color:#c9302c;letter-spacing:.2em;font-family:"Share Tech Mono",monospace;opacity:1}.panel h3:before{content:"▶ ";color:#b8862b}
.main .top h1{font-family:Cinzel,serif;font-weight:900;letter-spacing:.08em;color:#e8c46a;font-size:28px}.prog .bar{background:repeating-linear-gradient(90deg,#1c1d20 0 6px,#121316 6px 8px);border:1px solid #3a2a10}.prog .bar i{background:repeating-linear-gradient(90deg,#c9302c 0 6px,#7a1414 6px 8px)}
.result{position:relative;padding:18px 18px 18px;background:linear-gradient(#e6d6ae,#cbb684);color:#2a1e0e;border:1px solid #8a5f1f;box-shadow:0 10px 30px #000a}
.result:after{content:"";position:absolute;right:-14px;top:-16px;width:54px;height:54px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e04a3f,#8e1b16 60%,#4a0806);box-shadow:0 3px 8px #000a}
.result:before{content:"";position:absolute;right:8px;top:30px;width:14px;height:44px;background:linear-gradient(#e6d6ae,#b9a272);clip-path:polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)}
.result small{color:#8e1b16}.result h2{font-family:Cinzel,serif;font-weight:900;font-size:34px;letter-spacing:.04em;color:#2a1e0e}.result p{color:#3a2c18;font-family:Georgia,serif;font-size:14.5px}
.chip{border:1px solid #6b4a18;background:#f1e4c2;color:#2a1e0e;font-size:10.5px}.chip.bad{color:#8e1b16;border-color:#8e1b16}.odds div{clip-path:none;background:#f1e4c2;border:1px solid #8a5f1f}.odds b{color:#8e1b16}.odds span{color:#3a2c18}
.btn{color:#ffe3a0;background:linear-gradient(#7a1414,#3a0808);border:1px solid #d9a94a;letter-spacing:.14em;font-family:"Share Tech Mono",monospace}.btn.ghost{background:linear-gradient(#2b2f35,#1b1c20);color:#e8d9b0}
.hint{color:#3a2c18;opacity:.8}
.aside{background:#121316;border-left:2px solid #3a2a10}.av{background:radial-gradient(circle at 40% 35%,#e04a3f,#6e1414);border:2px solid #d9a94a;color:#ffe3a0;border-radius:4px;font-family:Cinzel,serif}.mini b{font-family:Cinzel,serif;color:#e8c46a;letter-spacing:.06em}
.rating b{color:#e8c46a;font-family:Cinzel,serif}.rating span{color:#c9302c}.kv b{color:#e8d9b0}
.sb .b{background:repeating-linear-gradient(90deg,#1c1d20 0 5px,#121316 5px 7px);height:9px}.sb .b i{background:repeating-linear-gradient(90deg,#d9a94a 0 5px,#8a5f1f 5px 7px)}
.portrait{border:3px solid #8a5f1f;clip-path:polygon(0 18%,10% 8%,25% 2%,50% 0,75% 2%,90% 8%,100% 18%,100% 100%,0 100%);background:radial-gradient(40% 30% at 50% 22%,#ffd16655,transparent),conic-gradient(from 180deg at 50% 30%,#6e1414,#b8862b,#2a0b0b,#8a5f1f,#6e1414,#b8862b,#2a0b0b,#6e1414)}
.portrait:after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 40%,#0a0a0b 92%)}
.portrait .glow{background:linear-gradient(#1b1c20,#0a0a0b);width:170px;height:240px;top:90px;border-radius:70px 70px 10px 10px;box-shadow:0 0 0 3px #8a5f1f;z-index:1}.portrait .who{z-index:2}.portrait .badge{z-index:2;top:88px;right:18px;background:#6e1414;color:#ffe3a0;border:1px solid #d9a94a}
.portrait h2{font-family:UnifrakturCook,serif;font-size:38px;color:#e8c46a}.portrait .who small{color:#c9302c}
.buff i{border:1px solid #3a2a10;color:#e8c46a}.buff i.debuff,.buff i.cond-debuff{color:#ff6b5c;border-color:#6e1414}.ev small{color:#8a7d64}` },

  { file: 't4-gothic-horror.html', style: 'eldritch', n: 4, name: 'Blood Moon', genre: 'Gothic horror',
    fonts: 'family=Cormorant+Garamond:ital,wght@0,500;0,700;1,500;1,700&family=Cormorant+SC:wght@600;700',
    desc: 'A hunter\'s night under a red moon: black lace, cold silver and old blood. The wheel watches you with a single green eye, and every frame is drawn in thin silver filigree.',
    pts: ['Eldritch wheel with a watching eye, silver curls and a claw pointer', 'Elegant italic serif, silver hairline frames and fleurons', 'A blood moon rising behind the window, fog along the floor'],
    css: `body{font-family:"Cormorant Garamond",Georgia,serif;color:#dcd6e6;background:#050407}
body:before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(14% 14% at 82% 14%,#c41e3a,#7a0f22 55%,transparent 72%),radial-gradient(40% 35% at 82% 14%,#7a0f2244,transparent 70%),linear-gradient(transparent 70%,#1a1622aa)}
.head small{color:#c41e3a;font-family:"Cormorant SC",serif;font-size:14px}.head h1{font-family:"Cormorant SC",serif;font-size:64px;font-weight:700;color:#f1ecf7;letter-spacing:.04em}.head p,.head ul{color:#a9a2b8;font-size:19px}.back a{color:#c9cede}
.win{background:radial-gradient(60% 50% at 80% 0%,#2a0a12,transparent 70%),linear-gradient(#0e0c13,#08070b);border:1px solid #c9cede55;box-shadow:0 0 0 6px #08070b,0 0 0 7px #c9cede33,0 40px 100px #000}
.tb{border-bottom:1px solid #c9cede22;color:#a9a2b8;font-family:"Cormorant SC",serif;font-size:14px}
.side{border-right:1px solid #c9cede22;background:linear-gradient(90deg,#0b0a10,#0e0c13)}.logo{font-family:"Cormorant SC",serif;font-size:26px;color:#f1ecf7;letter-spacing:.06em}.logo:after{content:" ❦";color:#c41e3a;font-size:18px}
.side nav a{color:#a9a2b8;font-size:16px;font-style:italic;border-radius:0}.side nav a.on{color:#fff;background:linear-gradient(90deg,#7a0f2255,transparent);box-shadow:inset 2px 0 0 #c41e3a}
.seg{border:1px solid #c9cede33}.seg span{color:#a9a2b8;font-size:12px;font-style:italic}.seg .on{background:#7a0f22;color:#fff}.lk{color:#c41e3a;font-family:"Cormorant SC",serif}
.pill,.kofi{border:1px solid #c9cede33;color:#dcd6e6;font-style:italic;font-size:13px}.kofi{color:#ff8fa3}
.panel,.odds div,.rating{background:linear-gradient(#100e16,#0b0a10);border:1px solid #c9cede30;position:relative}.panel:after{content:"❧";position:absolute;right:10px;top:6px;color:#c41e3a;font-size:14px;opacity:.8}
.panel h3,.main .top small,.result small{font-family:"Cormorant SC",serif;color:#c41e3a;font-size:14px;letter-spacing:.14em;opacity:1}
.main .top h1{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:700;font-size:38px;color:#f1ecf7}.prog .bar{background:#1a1622;height:3px}.prog .bar i{background:linear-gradient(90deg,#7a0f22,#c41e3a)}
.result h2{font-family:"Cormorant SC",serif;font-weight:700;font-size:50px;color:#f1ecf7;text-shadow:0 0 30px #c41e3a88}.result p{font-style:italic;font-size:18px;color:#bdb5cc}
.chip{border:1px solid #c9cede44;font-style:italic;font-size:13px}.chip.bad{border-color:#c41e3a;color:#ff8fa3}
.odds b{font-family:"Cormorant SC",serif;font-size:28px;color:#b6ff5c}
.btn{font-family:"Cormorant SC",serif;font-size:17px;color:#fff;background:linear-gradient(#a3122e,#4a0614);border:1px solid #c9cede77;box-shadow:0 0 24px #c41e3a44}.btn.ghost{background:transparent;color:#dcd6e6;border:1px solid #c9cede44;box-shadow:none}
.aside{border-left:1px solid #c9cede22;background:linear-gradient(270deg,#0b0a10,#0e0c13)}.av{border-radius:50%;background:radial-gradient(#7a0f22,#1a0a10);border:1px solid #c9cede77;font-family:"Cormorant SC",serif}.mini b{font-family:"Cormorant SC",serif;font-size:20px}
.rating b{font-family:"Cormorant SC",serif;font-size:36px}.rating span{color:#c41e3a;font-family:"Cormorant SC",serif}.kv{font-size:15px}.kv span{font-style:italic}
.sb{font-size:13px}.sb .b{background:#1a1622;height:4px}.sb .b i{background:linear-gradient(90deg,#4a0614,#c41e3a,#ffd1da)}
.portrait{background:radial-gradient(28% 22% at 50% 22%,#c41e3a,#7a0f22 60%,transparent 75%),linear-gradient(#120c14,#050407);border:1px solid #c9cede55;box-shadow:inset 0 0 0 8px #08070b,inset 0 0 0 9px #c9cede33}
.portrait .glow{background:#050407;width:150px;height:280px;top:95px;border-radius:75px 75px 4px 4px;clip-path:polygon(30% 0,70% 0,78% 18%,100% 100%,0 100%,22% 18%)}
.portrait h2{font-family:"Cormorant SC",serif;font-size:40px;font-weight:700}.portrait .who small{color:#ff8fa3;font-family:"Cormorant SC",serif}.portrait .who span{font-style:italic;font-size:16px}.portrait .badge{border:1px solid #c9cede66;background:#08070bcc;font-family:"Cormorant SC",serif;font-size:14px}
.buff{font-size:14px}.buff i{border:1px solid #c9cede33;font-size:12px}.buff i.debuff,.buff i.cond-debuff{border-color:#c41e3a;color:#ff8fa3}.ev{font-size:15px}.ev small{font-style:italic;color:#8d86a0;font-size:13px}` }
];

const page = m => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1340">
<title>Themed ${m.n} - ${m.name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${m.fonts}&display=swap">
<style>${BASE}
${m.css}</style></head>
<body>
<div class="head"><small>Themed mockup ${m.n} of 4 · ${m.genre}</small><h1>${m.name}</h1><p>${m.desc}</p><ul>${m.pts.map(p => '<li>' + p + '</li>').join('')}</ul></div>
<div id="windows"></div>
<p class="back"><a href="index.html">All themed mockups</a></p>
<script src="../../app/js/data.js"></script><script src="../../app/js/data-more.js"></script><script src="../../app/js/data-extra.js"></script><script src="../../app/js/engine.js"></script><script src="../../app/js/story.js"></script><script src="../modern/modern.js"></script><script src="wheels.js"></script>
<script>window.DSTYLE = '${m.style}';</script>
<script>document.fonts.ready.then(() => { const s = document.createElement('script'); s.src = '../desktop/desktop.js'; document.body.appendChild(s); });</script>
</body></html>
`;
LOOKS.forEach(m => fs.writeFileSync(path.join(__dirname, m.file), page(m)));
fs.writeFileSync(path.join(__dirname, 'index.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FateWheel - Themed mockups</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap">
<style>*{box-sizing:border-box}body{margin:0;font-family:Georgia,serif;background:#0b0908;color:#e9dcc4}main{max-width:1240px;margin:0 auto;padding:36px 18px 60px}h1{font-family:Cinzel,serif;font-size:clamp(30px,5vw,48px);margin:0 0 6px;color:#f3e2c3}p.lead{color:#b9aa91;max-width:780px;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(520px,1fr));gap:20px;margin-top:24px}a.card{display:block;text-decoration:none;color:inherit;border:1px solid #3b3022;overflow:hidden;background:#14100e}a.card img{width:100%;aspect-ratio:1280/780;object-fit:cover;display:block;background:#222}a.card div{padding:14px 16px}a.card b{font-family:Cinzel,serif;font-size:19px}a.card em{display:block;color:#e0662d;font-style:normal;font-size:13px;margin-top:2px}a.card span{display:block;color:#b9aa91;font-size:14.5px;margin-top:6px;line-height:1.45}.note{color:#b9aa91;font-size:14px;margin-top:26px}.note a{color:#e0b46a}</style></head>
<body><main><h1>Themed mockups</h1><p class="lead">Four genre directions for the desktop client: dark fantasy, a tabletop RPG character sheet, grimdark gothic sci-fi and gothic horror. Same layout and real game data as the modern set, with themed wheels, fonts and ornaments.</p>
<div class="grid">${LOOKS.map(m => `<a class="card" href="${m.file}"><img src="previews/${m.file.replace('.html', '')}-story.jpg" alt="${m.name} mockup"><div><b>${m.n} · ${m.name}</b><em>${m.genre}</em><span>${m.desc}</span></div></a>`).join('')}</div>
<p class="note">Open through a local server (for example <code>python -m http.server</code> in the project folder) so the pages can load the game data; fonts load from Google Fonts. Regenerate with <code>node mockups/themed/_gen.js</code>. Other sets: <a href="../desktop/index.html">modern desktop</a>, <a href="../modern/index.html">modern phone</a>.</p></main></body></html>
`);
console.log('wrote', LOOKS.length, 'themed pages and index.html');
