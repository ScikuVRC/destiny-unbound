/* FATEWHEEL character card renderer (1080x1620 canvas, exportable as PNG) */
(function (g) {
  const FW = g.FW = g.FW || {};
  const W = 1080, H = 1620, TAU = Math.PI * 2;

  const HUE = { Shadowborn: 268, Angel: 48, Demon: 355, Vampire: 346, Dragonborn: 18, Elf: 135, 'Dark Elf': 275, Fairy: 300, Mermaid: 192, Skeleton: 200, Reaper: 262, God: 50, 'Cosmic Entity': 248, Spirit: 178, Leviathan: 212, Phoenixkin: 24, Celestial: 56, Eternal: 40, Titan: 30, Human: 215, Orc: 100, Goblin: 85, Werewolf: 28, Succubus: 322, Kitsune: 12, Slime: 150, Golem: 35, 'Eldritch Horror': 285, 'Frost Giant': 195, Halfling: 95, Gnome: 170, Kobold: 20, Ogre: 80, Troll: 110, Centaur: 32, Minotaur: 8, Harpy: 205, Satyr: 120, Naga: 160, Dryad: 128, Hellblood: 350, Gargoyle: 220, Tengu: 265, Arachne: 290, Yeti: 198, Automaton: 38, Mothfolk: 44, Mycelid: 305, Changeling: 185, Revenant: 150, Elemental: 190, Djinn: 205, Valkyrie: 52, Lich: 140, Nephilim: 46, Sphinx: 42, Starchild: 232, Voidling: 278, Primordial: 14 };
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  const CT = {
    classic:  { font: '"Segoe UI", Inter, sans-serif', head: '"Segoe UI", Inter, sans-serif', panel: 'rgba(6,6,8,.72)', stroke: 'rgba(255,255,255,.12)', key: '#7fb0ff', val: '#ffffff', sub: '#9aa', accent: '#4d8dff', bgTop: 12, caps: false, radius: 34 },
    gilded:   { font: '"Palatino Linotype", "Book Antiqua", Georgia, serif', head: '"Palatino Linotype", Georgia, serif', panel: 'rgba(20,13,5,.78)', stroke: '#c9a24d', key: '#e3bd62', val: '#fbf1d6', sub: '#bda56a', accent: '#e3bd62', bgTop: 10, caps: true, radius: 14 },
    neon:     { font: 'Bahnschrift, "Segoe UI", sans-serif', head: 'Bahnschrift, "Segoe UI", sans-serif', panel: 'rgba(5,5,28,.78)', stroke: '#00e5ff', key: '#ff2bd6', val: '#f4f4ff', sub: '#8d8db8', accent: '#00e5ff', bgTop: 10, caps: true, radius: 26 },
    grimoire: { font: 'Georgia, "Times New Roman", serif', head: 'Georgia, "Times New Roman", serif', panel: 'rgba(233,219,187,.93)', stroke: '#8a6a3c', key: '#8c231c', val: '#2b1d0f', sub: '#6d5532', accent: '#9c2a22', bgTop: 14, caps: false, radius: 10 }
  };

  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function fit(c, text, maxW, size, weight, font) {
    let s = size; c.font = weight + ' ' + s + 'px ' + font;
    while (c.measureText(text).width > maxW && s > 16) { s -= 1; c.font = weight + ' ' + s + 'px ' + font; }
    return s;
  }

  function art(c, legend, th, hue, rng) {
    const race = legend.raceName();
    // base gradient
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'hsl(' + hue + ',55%,' + th.bgTop + '%)'); bg.addColorStop(0.55, 'hsl(' + hue + ',50%,6%)'); bg.addColorStop(1, '#030303');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    // glow
    const rg = c.createRadialGradient(W / 2, 470, 20, W / 2, 470, 520);
    rg.addColorStop(0, 'hsla(' + hue + ',90%,52%,.55)'); rg.addColorStop(0.5, 'hsla(' + hue + ',80%,30%,.22)'); rg.addColorStop(1, 'hsla(' + hue + ',80%,20%,0)');
    c.fillStyle = rg; c.fillRect(0, 0, W, 980);
    // rays
    c.save(); c.translate(W / 2, 470);
    const rays = 14 + Math.floor(rng() * 10);
    for (let i = 0; i < rays; i++) { const a = i / rays * TAU + rng() * 0.2, w = 0.04 + rng() * 0.07; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 900, a, a + w); c.closePath(); c.fillStyle = 'hsla(' + hue + ',90%,60%,' + (0.035 + rng() * 0.05) + ')'; c.fill(); }
    // sigil
    c.strokeStyle = 'hsla(' + (hue + 20) + ',90%,70%,.42)';
    [380, 345, 270].forEach((r, i) => { c.lineWidth = i === 1 ? 1.5 : 3; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); });
    const pts = 5 + Math.floor(rng() * 5), step = 2 + Math.floor(rng() * 2);
    c.lineWidth = 2.5; c.beginPath();
    for (let i = 0; i <= pts; i++) { const a = (i * step / pts) * TAU - Math.PI / 2; const x = Math.cos(a) * 345, y = Math.sin(a) * 345; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }
    c.stroke();
    for (let i = 0; i < 72; i++) { const a = i / 72 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 380, Math.sin(a) * 380); c.lineTo(Math.cos(a) * (i % 6 === 0 ? 410 : 396), Math.sin(a) * (i % 6 === 0 ? 410 : 396)); c.stroke(); }
    c.restore();
    // dust
    for (let i = 0; i < 90; i++) { c.beginPath(); c.arc(rng() * W, rng() * 900, 0.8 + rng() * 2.4, 0, TAU); c.fillStyle = 'hsla(' + (hue + rng() * 40) + ',90%,75%,' + (0.15 + rng() * 0.4) + ')'; c.fill(); }
  }
  function figure(c, legend, hue) {
    const race = legend.raceName();
    const cx = W / 2, top = 250, base = 790;
    const extra = FW.RACE_LOOK || {}; let tagKey = ''; const tags = (n) => n.indexOf(race) >= 0 || (extra[tagKey] || []).indexOf(race) >= 0;
    tagKey = 'winged'; const winged = tags(['Angel', 'Celestial', 'Phoenixkin', 'Fairy', 'Vampire', 'Demon', 'Dragonborn', 'God', 'Reaper', 'Harpy', 'Gargoyle', 'Tengu', 'Mothfolk', 'Valkyrie', 'Nephilim', 'Sphinx']);
    tagKey = 'horned'; const horned = tags(['Demon', 'Oni', 'Succubus', 'Dragonborn', 'Chimera', 'Reaper', 'Minotaur', 'Satyr', 'Hellblood', 'Kobold', 'Gargoyle']);
    tagKey = 'halo'; const halo = tags(['Angel', 'Celestial', 'God', 'Eternal', 'Valkyrie', 'Starchild', 'Lich']);
    tagKey = 'eared'; const eared = tags(['Elf', 'Dark Elf', 'Fairy', 'Goblin', 'Kitsune', 'Gnome', 'Changeling', 'Beastkin', 'Dryad']);
    c.save();
    // wings
    if (winged) {
      [-1, 1].forEach(s => {
        c.beginPath(); c.moveTo(cx + s * 40, top + 150);
        c.bezierCurveTo(cx + s * 300, top - 60, cx + s * 470, top + 40, cx + s * 430, top + 260);
        c.bezierCurveTo(cx + s * 380, top + 200, cx + s * 330, top + 260, cx + s * 290, top + 330);
        c.bezierCurveTo(cx + s * 250, top + 280, cx + s * 160, top + 330, cx + s * 70, top + 330);
        c.closePath();
        const gr = c.createLinearGradient(cx, top, cx + s * 450, top + 300); gr.addColorStop(0, 'hsla(' + hue + ',60%,18%,.95)'); gr.addColorStop(1, 'hsla(' + hue + ',70%,45%,.55)');
        c.fillStyle = gr; c.fill(); c.strokeStyle = 'hsla(' + hue + ',90%,75%,.5)'; c.lineWidth = 3; c.stroke();
      });
    }
    // cloak
    c.beginPath(); c.moveTo(cx - 55, top + 90);
    c.bezierCurveTo(cx - 130, top + 130, cx - 210, top + 330, cx - 250, base);
    c.lineTo(cx + 250, base);
    c.bezierCurveTo(cx + 210, top + 330, cx + 130, top + 130, cx + 55, top + 90);
    c.closePath();
    const cg = c.createLinearGradient(0, top, 0, base); cg.addColorStop(0, '#0a0a0e'); cg.addColorStop(1, 'hsl(' + hue + ',40%,6%)');
    c.fillStyle = cg; c.fill(); c.strokeStyle = 'hsla(' + hue + ',90%,70%,.55)'; c.lineWidth = 4; c.stroke();
    // shoulders / chest
    c.beginPath(); c.ellipse(cx, top + 120, 120, 44, 0, 0, TAU); c.fillStyle = '#101016'; c.fill(); c.stroke();
    // belt detail
    c.beginPath(); c.moveTo(cx - 95, top + 330); c.lineTo(cx + 95, top + 330); c.lineWidth = 8; c.strokeStyle = 'hsla(' + hue + ',70%,45%,.6)'; c.stroke();
    // head + hood
    c.beginPath(); c.moveTo(cx - 62, top + 100); c.bezierCurveTo(cx - 80, top - 10, cx - 50, top - 52, cx, top - 52); c.bezierCurveTo(cx + 50, top - 52, cx + 80, top - 10, cx + 62, top + 100); c.closePath();
    c.fillStyle = '#07070a'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'hsla(' + hue + ',90%,72%,.7)'; c.stroke();
    // eyes
    c.shadowColor = 'hsl(' + hue + ',100%,70%)'; c.shadowBlur = 24; c.fillStyle = 'hsl(' + hue + ',100%,82%)';
    [-24, 24].forEach(x => { c.beginPath(); c.ellipse(cx + x, top + 24, 12, 5, x < 0 ? 0.25 : -0.25, 0, TAU); c.fill(); });
    c.shadowBlur = 0;
    if (horned) [-1, 1].forEach(s => { c.beginPath(); c.moveTo(cx + s * 36, top - 38); c.bezierCurveTo(cx + s * 90, top - 70, cx + s * 120, top - 130, cx + s * 96, top - 190); c.bezierCurveTo(cx + s * 78, top - 130, cx + s * 52, top - 90, cx + s * 18, top - 56); c.closePath(); c.fillStyle = '#16101a'; c.fill(); c.stroke(); });
    if (eared) [-1, 1].forEach(s => { c.beginPath(); c.moveTo(cx + s * 60, top + 10); c.lineTo(cx + s * 135, top - 28); c.lineTo(cx + s * 64, top + 50); c.closePath(); c.fillStyle = '#07070a'; c.fill(); c.stroke(); });
    if (halo) { c.beginPath(); c.ellipse(cx, top - 110, 90, 22, 0, 0, TAU); c.lineWidth = 8; c.strokeStyle = 'hsl(' + hue + ',95%,72%)'; c.shadowColor = 'hsl(' + hue + ',100%,70%)'; c.shadowBlur = 30; c.stroke(); c.shadowBlur = 0; }
    // weapon
    if (!legend.isNone('wpn')) {
      const name = legend.pickName('wpn');
      c.save(); c.translate(cx + 210, top + 380); c.rotate(0.22);
      c.lineWidth = 9; c.strokeStyle = '#d9dde6'; c.shadowColor = 'hsl(' + hue + ',100%,70%)'; c.shadowBlur = 22;
      if (/Bow|Crossbow/.test(name)) { c.beginPath(); c.arc(0, 0, 150, -1.1, 1.1); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(Math.cos(-1.1) * 150, Math.sin(-1.1) * 150); c.lineTo(Math.cos(1.1) * 150, Math.sin(1.1) * 150); c.stroke(); }
      else if (/Staff|Spear|Lance|Trident|Scythe|Halberd|Tome/.test(name)) { c.beginPath(); c.moveTo(0, -330); c.lineTo(0, 260); c.stroke(); c.beginPath(); c.moveTo(0, -330); c.lineTo(-26, -270); c.lineTo(26, -270); c.closePath(); c.fillStyle = '#d9dde6'; c.fill(); }
      else { c.beginPath(); c.moveTo(0, -330); c.lineTo(0, 120); c.stroke(); c.lineWidth = 12; c.beginPath(); c.moveTo(-46, 120); c.lineTo(46, 120); c.stroke(); c.lineWidth = 14; c.beginPath(); c.moveTo(0, 120); c.lineTo(0, 200); c.strokeStyle = '#5a3a20'; c.stroke(); }
      c.restore();
    }
    c.restore();
  }

  function frame(c, name, hue) {
    if (name === 'gilded') {
      c.lineWidth = 10; c.strokeStyle = '#c9a24d'; c.strokeRect(14, 14, W - 28, H - 28);
      c.lineWidth = 3; c.strokeRect(34, 34, W - 68, H - 68);
      [[34, 34, 1, 1], [W - 34, 34, -1, 1], [34, H - 34, 1, -1], [W - 34, H - 34, -1, -1]].forEach(p => { c.beginPath(); c.moveTo(p[0], p[1] + p[3] * 80); c.quadraticCurveTo(p[0], p[1], p[0] + p[2] * 80, p[1]); c.lineWidth = 6; c.stroke(); c.beginPath(); c.arc(p[0] + p[2] * 22, p[1] + p[3] * 22, 8, 0, TAU); c.fillStyle = '#e3bd62'; c.fill(); });
    } else if (name === 'neon') {
      c.shadowColor = '#00e5ff'; c.shadowBlur = 30; c.lineWidth = 6; c.strokeStyle = '#00e5ff'; rr(c, 16, 16, W - 32, H - 32, 40); c.stroke();
      c.shadowColor = '#ff2bd6'; c.strokeStyle = '#ff2bd6'; c.lineWidth = 3; rr(c, 32, 32, W - 64, H - 64, 30); c.stroke(); c.shadowBlur = 0;
    } else if (name === 'grimoire') {
      c.lineWidth = 26; c.strokeStyle = '#3a2716'; c.strokeRect(13, 13, W - 26, H - 26);
      c.lineWidth = 4; c.strokeStyle = '#a98a5b'; c.strokeRect(30, 30, W - 60, H - 60);
    } else {
      c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.1)'; rr(c, 1, 1, W - 2, H - 2, 6); c.stroke();
    }
  }

  FW.drawCard = function (canvas, legend, opts) {
    opts = opts || {};
    const name = opts.theme && CT[opts.theme] ? opts.theme : 'classic';
    const th = CT[name];
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    const comp = FW.compute(legend);
    const race = legend.raceName();
    const hue = HUE[race] != null ? HUE[race] : (FW.RACE_HUE && FW.RACE_HUE[race] != null) ? FW.RACE_HUE[race] : hash(race) % 360;
    const rng = FW.makeRng('card' + legend.seed);
    if (opts.image) {
      art(c, legend, th, hue, rng);
      const im = opts.image, s = Math.max(W / im.width, 860 / im.height), dw = im.width * s, dh = im.height * s;
      c.save(); c.beginPath(); c.rect(0, 0, W, 860); c.clip(); c.drawImage(im, (W - dw) / 2, (860 - dh) * 0.3, dw, dh); c.restore();   // keep the upper part: faces sit near the top
      const fade = c.createLinearGradient(0, 560, 0, 880); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,.92)'); c.fillStyle = fade; c.fillRect(0, 560, W, 320);
      const topFade = c.createLinearGradient(0, 0, 0, 270); topFade.addColorStop(0, 'rgba(0,0,0,.78)'); topFade.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = topFade; c.fillRect(0, 0, W, 270);   // keeps the name readable over any picture
    } else { art(c, legend, th, hue, rng); figure(c, legend, hue); }
    const bottomFade = c.createLinearGradient(0, 640, 0, 900); bottomFade.addColorStop(0, 'rgba(0,0,0,0)'); bottomFade.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = bottomFade; c.fillRect(0, 640, W, 260);

    // title block
    const title = legend.name || legend.pickName('title') || '';
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '600 22px ' + th.font; c.fillText('F A T E W H E E L   L E G E N D', W / 2, 78);
    const tt = th.caps ? title.toUpperCase() : title;
    const ts = fit(c, tt, W - 160, 78, '800', th.head);
    c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 18; c.fillStyle = '#fff'; c.fillText(tt, W / 2, 160); c.shadowBlur = 0;
    const subName = (legend.name && legend.pickName('title') ? legend.pickName('title') + '  ·  ' : '') + (legend.has('sub') ? legend.pickName('sub') + ' ' + race : race);
    c.fillStyle = name === 'grimoire' ? '#f4e6c4' : th.accent; fit(c, th.caps ? subName.toUpperCase() : subName, W - 140, 36, '600', th.font); c.fillText((th.caps ? subName.toUpperCase() : subName), W / 2, 210);

    // panel
    const px = 54, py = 800, pw = W - 108, ph = 690;
    c.save(); rr(c, px, py, pw, ph, th.radius); c.fillStyle = th.panel; c.fill();
    c.lineWidth = name === 'gilded' ? 4 : 2.5; c.strokeStyle = th.stroke; if (name === 'neon') { c.shadowColor = th.stroke; c.shadowBlur = 20; } c.stroke(); c.restore();
    const lines = FW.cardLines(legend, comp);
    const lh = Math.min(48, Math.floor((ph - 56) / lines.length));
    let y = py + 52;
    c.textAlign = 'left';
    lines.forEach(L => {
      const key = (FW.t ? FW.t(L.k) : L.k) + ' : ';
      const ks = Math.min(30, lh - 7);
      c.font = '700 ' + ks + 'px ' + th.font; c.fillStyle = th.key; c.fillText(key, px + 34, y);
      const kw = c.measureText(key).width;
      const val = FW.t ? FW.t(L.v) : L.v;
      const maxW = pw - 68 - kw;
      const vs = fit(c, val, maxW, Math.min(34, lh - 4), '600', th.font);
      c.fillStyle = th.val; c.fillText(val, px + 34 + kw, y);
      y += lh;
    });
    // footer: rating + extras
    const fy = py + ph + 36;
    c.font = '700 30px ' + th.font; c.fillStyle = name === 'grimoire' ? '#efe0bd' : '#fff';
    c.textAlign = 'left'; c.fillText('POWER RATING  ' + comp.rating, px + 6, fy);
    c.textAlign = 'right'; c.fillStyle = name === 'grimoire' ? '#efe0bd' : th.accent; c.fillText(comp.rank.toUpperCase(), W - px - 6, fy);
    const bw = pw - 12; rr(c, px + 6, fy + 16, bw, 12, 6); c.fillStyle = 'rgba(255,255,255,.16)'; c.fill();
    rr(c, px + 6, fy + 16, Math.max(12, bw * Math.min(1, comp.rating / 100)), 12, 6); c.fillStyle = th.accent; c.fill();
    c.textAlign = 'center'; c.font = '500 22px ' + th.font; c.fillStyle = name === 'grimoire' ? '#d9c79c' : 'rgba(255,255,255,.55)';
    const ex = [legend.pickName('birth'), legend.pickName('per'), FW.P(legend.entry('mark')).none ? null : legend.pickName('mark')].filter(Boolean).join('  •  ');
    const exs = fit(c, ex, W - 140, 22, '500', th.font); c.fillText(ex, W / 2, fy + 62);
    frame(c, name, hue);
  };

  FW.canvasToBlob = function (canvas) { return new Promise(res => canvas.toBlob(res, 'image/png')); };
})(typeof window !== 'undefined' ? window : globalThis);
