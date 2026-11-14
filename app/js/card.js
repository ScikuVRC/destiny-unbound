/* Destiny Unbound character card renderer (1080x1620 canvas, exportable as PNG) */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const W = 1080,
    H = 1620,
    TAU = Math.PI * 2;

  const HUE = {
    Shadowborn: 268,
    Angel: 48,
    Demon: 355,
    Vampire: 346,
    Dragonborn: 18,
    Elf: 135,
    'Dark Elf': 275,
    Fairy: 300,
    Mermaid: 192,
    Skeleton: 200,
    Reaper: 262,
    God: 50,
    'Cosmic Entity': 248,
    Spirit: 178,
    Leviathan: 212,
    Phoenixkin: 24,
    Celestial: 56,
    Eternal: 40,
    Titan: 30,
    Human: 215,
    Orc: 100,
    Goblin: 85,
    Werewolf: 28,
    Succubus: 322,
    Kitsune: 12,
    Slime: 150,
    Golem: 35,
    'Eldritch Horror': 285,
    'Frost Giant': 195,
    Halfling: 95,
    Gnome: 170,
    Kobold: 20,
    Ogre: 80,
    Troll: 110,
    Centaur: 32,
    Minotaur: 8,
    Harpy: 205,
    Satyr: 120,
    Naga: 160,
    Dryad: 128,
    Hellblood: 350,
    Gargoyle: 220,
    Tengu: 265,
    Arachne: 290,
    Yeti: 198,
    Automaton: 38,
    Mothfolk: 44,
    Mycelid: 305,
    Changeling: 185,
    Revenant: 150,
    Elemental: 190,
    Djinn: 205,
    Valkyrie: 52,
    Lich: 140,
    Nephilim: 46,
    Sphinx: 42,
    Starchild: 232,
    Voidling: 278,
    Primordial: 14,
  };
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  const CT = (FW.CARD_THEMES = {
    ashen: {
      font: '"EB Garamond", Georgia, serif',
      head: '"Cinzel", "Palatino Linotype", serif',
      panel: 'rgba(16,12,10,.86)',
      stroke: '#6b5636',
      key: '#e0662d',
      val: '#f3e2c3',
      sub: '#a89a82',
      accent: '#e0b46a',
      bgTop: 10,
      caps: true,
      radius: 4,
    },
    astral: {
      font: '"EB Garamond", Georgia, serif',
      head: '"Cinzel", "Palatino Linotype", serif',
      panel: 'rgba(8,12,32,.88)',
      stroke: 'rgba(170,200,255,.55)',
      key: '#8fc4ff',
      val: '#eef3ff',
      sub: '#9aa8c8',
      accent: '#cfe3ff',
      bgTop: 12,
      caps: true,
      radius: 6,
    },
    iron: {
      font: '"Share Tech Mono", Consolas, monospace',
      head: '"UnifrakturCook", "Cinzel", serif',
      panel: 'rgba(18,19,22,.9)',
      stroke: '#b8862b',
      key: '#c9302c',
      val: '#efe2bf',
      sub: '#a99e86',
      accent: '#e8c46a',
      bgTop: 10,
      caps: false,
      radius: 0,
    },
    bloodmoon: {
      font: '"Cormorant Garamond", Georgia, serif',
      head: '"Cormorant SC", "Cormorant Garamond", serif',
      panel: 'rgba(11,10,16,.88)',
      stroke: 'rgba(201,206,222,.55)',
      key: '#ec4d6a',
      val: '#f1ecf7',
      sub: '#a39cb4',
      accent: '#c9cede',
      bgTop: 8,
      caps: true,
      radius: 2,
    },
  });

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function fit(c, text, maxW, size, weight, font) {
    let s = size;
    c.font = weight + ' ' + s + 'px ' + font;
    while (c.measureText(text).width > maxW && s > 16) {
      s -= 1;
      c.font = weight + ' ' + s + 'px ' + font;
    }
    return s;
  }

  function art(c, legend, th, hue, rng) {
    const race = legend.raceName();
    // base gradient
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, 'hsl(' + hue + ',55%,' + th.bgTop + '%)');
    bg.addColorStop(0.55, 'hsl(' + hue + ',50%,6%)');
    bg.addColorStop(1, '#030303');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    // glow
    const rg = c.createRadialGradient(W / 2, 470, 20, W / 2, 470, 520);
    rg.addColorStop(0, 'hsla(' + hue + ',90%,52%,.55)');
    rg.addColorStop(0.5, 'hsla(' + hue + ',80%,30%,.22)');
    rg.addColorStop(1, 'hsla(' + hue + ',80%,20%,0)');
    c.fillStyle = rg;
    c.fillRect(0, 0, W, 980);
    // rays
    c.save();
    c.translate(W / 2, 470);
    const rays = 14 + Math.floor(rng() * 10);
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * TAU + rng() * 0.2,
        w = 0.04 + rng() * 0.07;
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, 900, a, a + w);
      c.closePath();
      c.fillStyle = 'hsla(' + hue + ',90%,60%,' + (0.035 + rng() * 0.05) + ')';
      c.fill();
    }
    // sigil
    c.strokeStyle = 'hsla(' + (hue + 20) + ',90%,70%,.42)';
    [380, 345, 270].forEach((r, i) => {
      c.lineWidth = i === 1 ? 1.5 : 3;
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.stroke();
    });
    const pts = 5 + Math.floor(rng() * 5),
      step = 2 + Math.floor(rng() * 2);
    c.lineWidth = 2.5;
    c.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = ((i * step) / pts) * TAU - Math.PI / 2;
      const x = Math.cos(a) * 345,
        y = Math.sin(a) * 345;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU;
      c.beginPath();
      c.moveTo(Math.cos(a) * 380, Math.sin(a) * 380);
      c.lineTo(Math.cos(a) * (i % 6 === 0 ? 410 : 396), Math.sin(a) * (i % 6 === 0 ? 410 : 396));
      c.stroke();
    }
    c.restore();
    // dust
    for (let i = 0; i < 90; i++) {
      c.beginPath();
      c.arc(rng() * W, rng() * 900, 0.8 + rng() * 2.4, 0, TAU);
      c.fillStyle = 'hsla(' + (hue + rng() * 40) + ',90%,75%,' + (0.15 + rng() * 0.4) + ')';
      c.fill();
    }
  }
  function figure(c, legend, hue) {
    const race = legend.raceName();
    const cx = W / 2,
      top = 250,
      base = 790;
    const extra = FW.RACE_LOOK || {};
    let tagKey = '';
    const tags = n => n.indexOf(race) >= 0 || (extra[tagKey] || []).indexOf(race) >= 0;
    tagKey = 'winged';
    const winged = tags([
      'Angel',
      'Celestial',
      'Phoenixkin',
      'Fairy',
      'Vampire',
      'Demon',
      'Dragonborn',
      'God',
      'Reaper',
      'Harpy',
      'Gargoyle',
      'Tengu',
      'Mothfolk',
      'Valkyrie',
      'Nephilim',
      'Sphinx',
    ]);
    tagKey = 'horned';
    const horned = tags([
      'Demon',
      'Oni',
      'Succubus',
      'Dragonborn',
      'Chimera',
      'Reaper',
      'Minotaur',
      'Satyr',
      'Hellblood',
      'Kobold',
      'Gargoyle',
    ]);
    tagKey = 'halo';
    const halo = tags(['Angel', 'Celestial', 'God', 'Eternal', 'Valkyrie', 'Starchild', 'Lich']);
    tagKey = 'eared';
    const eared = tags(['Elf', 'Dark Elf', 'Fairy', 'Goblin', 'Kitsune', 'Gnome', 'Changeling', 'Beastkin', 'Dryad']);
    c.save();
    // wings
    if (winged) {
      [-1, 1].forEach(s => {
        c.beginPath();
        c.moveTo(cx + s * 40, top + 150);
        c.bezierCurveTo(cx + s * 300, top - 60, cx + s * 470, top + 40, cx + s * 430, top + 260);
        c.bezierCurveTo(cx + s * 380, top + 200, cx + s * 330, top + 260, cx + s * 290, top + 330);
        c.bezierCurveTo(cx + s * 250, top + 280, cx + s * 160, top + 330, cx + s * 70, top + 330);
        c.closePath();
        const gr = c.createLinearGradient(cx, top, cx + s * 450, top + 300);
        gr.addColorStop(0, 'hsla(' + hue + ',60%,18%,.95)');
        gr.addColorStop(1, 'hsla(' + hue + ',70%,45%,.55)');
        c.fillStyle = gr;
        c.fill();
        c.strokeStyle = 'hsla(' + hue + ',90%,75%,.5)';
        c.lineWidth = 3;
        c.stroke();
      });
    }
    // cloak
    c.beginPath();
    c.moveTo(cx - 55, top + 90);
    c.bezierCurveTo(cx - 130, top + 130, cx - 210, top + 330, cx - 250, base);
    c.lineTo(cx + 250, base);
    c.bezierCurveTo(cx + 210, top + 330, cx + 130, top + 130, cx + 55, top + 90);
    c.closePath();
    const cg = c.createLinearGradient(0, top, 0, base);
    cg.addColorStop(0, '#0a0a0e');
    cg.addColorStop(1, 'hsl(' + hue + ',40%,6%)');
    c.fillStyle = cg;
    c.fill();
    c.strokeStyle = 'hsla(' + hue + ',90%,70%,.55)';
    c.lineWidth = 4;
    c.stroke();
    // shoulders / chest
    c.beginPath();
    c.ellipse(cx, top + 120, 120, 44, 0, 0, TAU);
    c.fillStyle = '#101016';
    c.fill();
    c.stroke();
    // belt detail
    c.beginPath();
    c.moveTo(cx - 95, top + 330);
    c.lineTo(cx + 95, top + 330);
    c.lineWidth = 8;
    c.strokeStyle = 'hsla(' + hue + ',70%,45%,.6)';
    c.stroke();
    // head + hood
    c.beginPath();
    c.moveTo(cx - 62, top + 100);
    c.bezierCurveTo(cx - 80, top - 10, cx - 50, top - 52, cx, top - 52);
    c.bezierCurveTo(cx + 50, top - 52, cx + 80, top - 10, cx + 62, top + 100);
    c.closePath();
    c.fillStyle = '#07070a';
    c.fill();
    c.lineWidth = 4;
    c.strokeStyle = 'hsla(' + hue + ',90%,72%,.7)';
    c.stroke();
    // eyes
    c.shadowColor = 'hsl(' + hue + ',100%,70%)';
    c.shadowBlur = 24;
    c.fillStyle = 'hsl(' + hue + ',100%,82%)';
    [-24, 24].forEach(x => {
      c.beginPath();
      c.ellipse(cx + x, top + 24, 12, 5, x < 0 ? 0.25 : -0.25, 0, TAU);
      c.fill();
    });
    c.shadowBlur = 0;
    if (horned)
      [-1, 1].forEach(s => {
        c.beginPath();
        c.moveTo(cx + s * 36, top - 38);
        c.bezierCurveTo(cx + s * 90, top - 70, cx + s * 120, top - 130, cx + s * 96, top - 190);
        c.bezierCurveTo(cx + s * 78, top - 130, cx + s * 52, top - 90, cx + s * 18, top - 56);
        c.closePath();
        c.fillStyle = '#16101a';
        c.fill();
        c.stroke();
      });
    if (eared)
      [-1, 1].forEach(s => {
        c.beginPath();
        c.moveTo(cx + s * 60, top + 10);
        c.lineTo(cx + s * 135, top - 28);
        c.lineTo(cx + s * 64, top + 50);
        c.closePath();
        c.fillStyle = '#07070a';
        c.fill();
        c.stroke();
      });
    if (halo) {
      c.beginPath();
      c.ellipse(cx, top - 110, 90, 22, 0, 0, TAU);
      c.lineWidth = 8;
      c.strokeStyle = 'hsl(' + hue + ',95%,72%)';
      c.shadowColor = 'hsl(' + hue + ',100%,70%)';
      c.shadowBlur = 30;
      c.stroke();
      c.shadowBlur = 0;
    }
    // weapon
    if (!legend.isNone('wpn')) {
      const name = legend.pickName('wpn');
      c.save();
      c.translate(cx + 210, top + 380);
      c.rotate(0.22);
      c.lineWidth = 9;
      c.strokeStyle = '#d9dde6';
      c.shadowColor = 'hsl(' + hue + ',100%,70%)';
      c.shadowBlur = 22;
      if (/Bow|Crossbow/.test(name)) {
        c.beginPath();
        c.arc(0, 0, 150, -1.1, 1.1);
        c.stroke();
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(Math.cos(-1.1) * 150, Math.sin(-1.1) * 150);
        c.lineTo(Math.cos(1.1) * 150, Math.sin(1.1) * 150);
        c.stroke();
      } else if (/Staff|Spear|Lance|Trident|Scythe|Halberd|Tome/.test(name)) {
        c.beginPath();
        c.moveTo(0, -330);
        c.lineTo(0, 260);
        c.stroke();
        c.beginPath();
        c.moveTo(0, -330);
        c.lineTo(-26, -270);
        c.lineTo(26, -270);
        c.closePath();
        c.fillStyle = '#d9dde6';
        c.fill();
      } else {
        c.beginPath();
        c.moveTo(0, -330);
        c.lineTo(0, 120);
        c.stroke();
        c.lineWidth = 12;
        c.beginPath();
        c.moveTo(-46, 120);
        c.lineTo(46, 120);
        c.stroke();
        c.lineWidth = 14;
        c.beginPath();
        c.moveTo(0, 120);
        c.lineTo(0, 200);
        c.strokeStyle = '#5a3a20';
        c.stroke();
      }
      c.restore();
    }
    c.restore();
  }

  function frame(c, name, hue) {
    const corners = (inset, fn) =>
      [
        [inset, inset],
        [W - inset, inset],
        [inset, H - inset],
        [W - inset, H - inset],
      ].forEach(fn);
    if (name === 'astral') {
      // a thin silver double frame, a glowing star in each corner and a crescent moon at the top
      c.lineWidth = 2;
      c.strokeStyle = 'rgba(201,216,245,.75)';
      c.strokeRect(20, 20, W - 40, H - 40);
      c.lineWidth = 1;
      c.strokeStyle = 'rgba(201,216,245,.35)';
      c.strokeRect(32, 32, W - 64, H - 64);
      const star = (x, y, s) => {
        c.beginPath();
        for (let k = 0; k < 8; k++) {
          const r = k % 2 ? s * 0.26 : s,
            a = (k / 8) * TAU;
          c.lineTo(x + Math.sin(a) * r, y - Math.cos(a) * r);
        }
        c.closePath();
        c.fill();
      };
      c.save();
      c.fillStyle = '#eef6ff';
      c.shadowColor = '#8fc4ff';
      c.shadowBlur = 18;
      corners(26, p => star(p[0], p[1], 20));
      c.shadowBlur = 0;
      c.fillStyle = '#050816';
      c.fillRect(W / 2 - 34, 4, 68, 34);
      const moon = document.createElement('canvas');
      moon.width = 40;
      moon.height = 40;
      const mc = moon.getContext('2d');
      mc.fillStyle = '#eef6ff';
      mc.beginPath();
      mc.arc(20, 20, 14, 0, TAU);
      mc.fill();
      mc.globalCompositeOperation = 'destination-out';
      mc.beginPath();
      mc.arc(27, 16, 12, 0, TAU);
      mc.fill();
      c.shadowColor = '#8fc4ff';
      c.shadowBlur = 14;
      c.drawImage(moon, W / 2 - 20, 1);
      c.restore();
    } else if (name === 'iron') {
      c.lineWidth = 12;
      c.strokeStyle = '#8a5f1f';
      c.strokeRect(10, 10, W - 20, H - 20);
      c.lineWidth = 2;
      c.strokeStyle = '#d9a94a';
      c.strokeRect(22, 22, W - 44, H - 44);
      c.save();
      c.beginPath();
      c.rect(22, 22, W - 44, 18);
      c.clip();
      for (let x = 0; x < W; x += 28) {
        c.beginPath();
        c.moveTo(x, 40);
        c.lineTo(x + 14, 22);
        c.lineTo(x + 28, 22);
        c.lineTo(x + 14, 40);
        c.closePath();
        c.fillStyle = 'rgba(179,18,27,.85)';
        c.fill();
      }
      c.restore();
      corners(16, p => {
        c.beginPath();
        c.arc(p[0], p[1], 7, 0, TAU);
        c.fillStyle = '#e8c46a';
        c.fill();
        c.strokeStyle = '#3a2a10';
        c.lineWidth = 2;
        c.stroke();
      });
    } else if (name === 'bloodmoon') {
      c.lineWidth = 2;
      c.strokeStyle = 'rgba(201,206,222,.6)';
      c.strokeRect(20, 20, W - 40, H - 40);
      c.lineWidth = 1;
      c.strokeRect(30, 30, W - 60, H - 60);
      c.fillStyle = '#c41e3a';
      c.font = '44px "Cormorant Garamond", serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      corners(48, p => c.fillText('\u2767', p[0], p[1]));
    } else {
      c.lineWidth = 3;
      c.strokeStyle = '#b8975a';
      c.strokeRect(16, 16, W - 32, H - 32);
      c.lineWidth = 1.5;
      c.strokeStyle = '#6b5636';
      c.strokeRect(28, 28, W - 56, H - 56);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = '30px "Cinzel", serif';
      [
        [W / 2, 17],
        [W / 2, H - 17],
        [17, H / 2],
        [W - 17, H / 2],
      ].forEach(p => {
        c.fillStyle = '#0b0908';
        c.fillRect(p[0] - 20, p[1] - 16, 40, 32);
        c.fillStyle = '#e0b46a';
        c.fillText('\u2756', p[0], p[1]);
      });
      const glow = c.createLinearGradient(0, H - 160, 0, H);
      glow.addColorStop(0, 'rgba(194,65,12,0)');
      glow.addColorStop(1, 'rgba(194,65,12,.22)');
      c.fillStyle = glow;
      c.fillRect(28, H - 160, W - 56, 132);
    }
  }

  /* ================= trading-card faces =================
     The front shows the picture and the name; the back shows the numbers. Two front styles: 'arch' (the default, a
     tarot-like arched window and a rank seal) and 'full' (the picture fills the card, name over a dark fade).
     FW.drawCard(canvas, legend, { theme, image, side: 'front' | 'back', style: 'arch' | 'full' }) */
  FW.CARD_STYLES = ['arch', 'full'];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  function themeOf(t) {
    return t && CT[t] ? t : FW.THEME_ALIAS && CT[FW.THEME_ALIAS[t]] ? FW.THEME_ALIAS[t] : 'ashen';
  }
  function hueOf(legend) {
    const race = legend.raceName();
    return HUE[race] != null
      ? HUE[race]
      : FW.RACE_HUE && FW.RACE_HUE[race] != null
        ? FW.RACE_HUE[race]
        : hash(race) % 360;
  }
  // the picture for the card: the player's portrait if there is one, else the painted scene and silhouette
  function scene(legend, th, hue, image) {
    const o = document.createElement('canvas');
    o.width = W;
    o.height = H;
    const oc = o.getContext('2d');
    if (image) {
      const s = Math.max(W / image.width, H / image.height);
      oc.drawImage(image, (W - image.width * s) / 2, (H - image.height * s) * 0.2, image.width * s, image.height * s);
    } else {
      art(oc, legend, th, hue, FW.makeRng('card' + legend.seed));
      figure(oc, legend, hue);
    }
    return o;
  }
  const rankIndex = r => {
    let i = 0;
    FW.RANKS.forEach((x, k) => {
      if (r >= x[0]) i = k;
    });
    return i;
  };
  function flavour(legend) {
    const per = legend.entry('per'),
      ttl = legend.entry('title');
    const line = (per && per.perk) || (ttl && ttl.perk) || '';
    return line ? '“' + line.replace(/\.$/, '') + '.”' : '';
  }
  function typeLine(legend) {
    const race = legend.raceName();
    const parts = [legend.has('sub') ? legend.pickName('sub') + ' ' + race : race];
    if (legend.has('cls')) parts.push(legend.pickName('cls'));
    return parts.join('  ·  ');
  }
  function heroName(legend) {
    return legend.name || legend.pickName('title') || legend.raceName();
  }
  function wrap(c, text, maxW) {
    const out = [];
    let line = '';
    String(text)
      .split(/\s+/)
      .forEach(w => {
        const t = line ? line + ' ' + w : w;
        if (c.measureText(t).width > maxW && line) {
          out.push(line);
          line = w;
        } else line = t;
      });
    if (line) out.push(line);
    return out;
  }
  const tr = s => (FW.t ? FW.t(s) : s);

  function frontArch(c, legend, th, name, hue, pic) {
    const comp = FW.compute(legend);
    // the window and the seal take the rank's metal (see rankFrame), from Veteran up
    const tier = FW.rankFrameTier(rankIndex(comp.rating));
    const metal = tier === 7 ? '#e6dcff' : tier >= 2 ? RANK_METAL[tier] : th.accent;
    const bg = c.createRadialGradient(W / 2, 0, 40, W / 2, 200, H);
    bg.addColorStop(0, th.panel.replace(/[\d.]+\)$/, '1)'));
    bg.addColorStop(1, '#070506');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    // a soft, dark copy of the picture behind everything so the card never looks empty
    c.save();
    c.filter = 'blur(30px) brightness(.32)';
    c.drawImage(pic, 0, 0, W, H);
    c.restore();
    // the arched window
    const ax = 92,
      ay = 92,
      aw = W - 184,
      ah = 960,
      r = aw / 2;
    const archPath = () => {
      c.beginPath();
      c.moveTo(ax, ay + ah);
      c.lineTo(ax, ay + r);
      c.arc(ax + r, ay + r, r, Math.PI, 0);
      c.lineTo(ax + aw, ay + ah);
      c.closePath();
    };
    c.save();
    archPath();
    c.clip();
    // crop the picture to the window, keeping the upper body (the silhouette sits between y 250 and 790)
    const sh = 900,
      sw = sh * (aw / ah);
    c.drawImage(pic, (W - sw) / 2, 90, sw, sh, ax, ay, aw, ah);
    const fade = c.createLinearGradient(0, ay + ah - 220, 0, ay + ah);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,.6)');
    c.fillStyle = fade;
    c.fillRect(ax, ay + ah - 220, aw, 220);
    c.restore();
    archPath();
    c.lineWidth = 6;
    c.strokeStyle = metal;
    c.stroke();
    c.lineWidth = 2;
    c.strokeStyle = th.stroke;
    c.save();
    c.translate(0, 0);
    c.beginPath();
    c.moveTo(ax - 14, ay + ah + 10);
    c.lineTo(ax - 14, ay + r);
    c.arc(ax + r, ay + r, r + 14, Math.PI, 0);
    c.lineTo(ax + aw + 14, ay + ah + 10);
    c.stroke();
    c.restore();
    // the rank seal
    const ri = rankIndex(comp.rating),
      sx = W / 2,
      sy = ay + ah;
    c.beginPath();
    c.arc(sx, sy, 62, 0, TAU);
    const seal = c.createRadialGradient(sx, sy - 20, 6, sx, sy, 62);
    seal.addColorStop(0, th.key);
    seal.addColorStop(1, '#14080a');
    c.fillStyle = seal;
    c.fill();
    c.lineWidth = 5;
    c.strokeStyle = metal;
    c.stroke();
    c.fillStyle = '#fff4e0';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = '800 46px ' + th.head;
    c.fillText(ROMAN[ri] || '', sx, sy + 3);
    c.textBaseline = 'alphabetic';
    // name, type and flavour
    const nm = th.caps ? heroName(legend).toUpperCase() : heroName(legend);
    fit(c, nm, W - 140, 76, '800', th.head);
    c.shadowColor = 'rgba(0,0,0,.9)';
    c.shadowBlur = 14;
    c.fillStyle = th.val;
    c.fillText(nm, W / 2, sy + 150);
    c.shadowBlur = 0;
    const ty = typeLine(legend);
    fit(c, ty, W - 160, 36, '600', th.font);
    c.fillStyle = th.sub;
    c.fillText(ty, W / 2, sy + 202);
    const fl = flavour(legend);
    if (fl) {
      c.font = 'italic 500 34px ' + th.font;
      c.fillStyle = th.val;
      c.globalAlpha = 0.85;
      wrap(c, fl, W - 220)
        .slice(0, 2)
        .forEach((l, i) => c.fillText(l, W / 2, sy + 262 + i * 42));
      c.globalAlpha = 1;
    }
    // the rating at the foot
    c.font = '800 54px ' + th.head;
    const rt = String(comp.rating),
      rk = '  ' + tr(comp.rank).toUpperCase();
    const w1 = c.measureText(rt).width;
    c.font = '700 30px ' + th.font;
    const w2 = c.measureText(rk).width;
    const x0 = W / 2 - (w1 + w2) / 2;
    c.textAlign = 'left';
    c.font = '800 54px ' + th.head;
    c.fillStyle = th.val;
    c.fillText(rt, x0, H - 74);
    c.font = '700 30px ' + th.font;
    c.fillStyle = th.accent;
    c.fillText(rk, x0 + w1, H - 76);
    c.textAlign = 'center';
  }

  function frontFull(c, legend, th, name, hue, pic) {
    const comp = FW.compute(legend);
    // the picture fills the card (scaled up so the silhouette is bigger)
    c.drawImage(pic, 108, 80, 864, 1296, 0, 0, W, H);
    const top = c.createLinearGradient(0, 0, 0, 260);
    top.addColorStop(0, 'rgba(0,0,0,.6)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = top;
    c.fillRect(0, 0, W, 260);
    const low = c.createLinearGradient(0, H * 0.55, 0, H * 0.82);
    low.addColorStop(0, 'rgba(0,0,0,0)');
    low.addColorStop(1, 'rgba(6,4,4,.94)');
    c.fillStyle = low;
    c.fillRect(0, H * 0.55, W, H * 0.45);
    // header and rating badge
    c.textAlign = 'left';
    c.font = '600 24px ' + th.font;
    c.fillStyle = 'rgba(255,255,255,.75)';
    c.fillText('D E S T I N Y   U N B O U N D', 70, 96);
    const rt = String(comp.rating);
    c.font = '800 48px ' + th.head;
    const bw = c.measureText(rt).width + 56;
    rr(c, W - 66 - bw, 48, bw, 74, 37);
    c.fillStyle = 'rgba(10,7,6,.78)';
    c.fill();
    c.lineWidth = 3;
    c.strokeStyle = th.accent;
    c.stroke();
    c.textAlign = 'center';
    c.fillStyle = th.val;
    c.fillText(rt, W - 66 - bw / 2, 102);
    // name block
    const nm = th.caps ? heroName(legend).toUpperCase() : heroName(legend);
    fit(c, nm, W - 140, 86, '800', th.head);
    c.shadowColor = 'rgba(0,0,0,.95)';
    c.shadowBlur = 20;
    c.fillStyle = '#fff';
    c.fillText(nm, W / 2, H - 330);
    c.shadowBlur = 0;
    const ty = typeLine(legend);
    fit(c, ty, W - 160, 38, '600', th.font);
    c.fillStyle = th.accent;
    c.fillText(ty, W / 2, H - 272);
    const g = c.createLinearGradient(160, 0, W - 160, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, th.accent);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(160, H - 240, W - 320, 2);
    const fl = flavour(legend);
    if (fl) {
      c.font = 'italic 500 34px ' + th.font;
      c.fillStyle = th.val;
      c.globalAlpha = 0.88;
      wrap(c, fl, W - 220)
        .slice(0, 2)
        .forEach((l, i) => c.fillText(l, W / 2, H - 186 + i * 42));
      c.globalAlpha = 1;
    }
    // stars for the rank (1 to 5)
    const stars = 1 + Math.round((rankIndex(comp.rating) / (FW.RANKS.length - 1)) * 4);
    c.font = '700 38px ' + th.font;
    c.fillStyle = th.accent;
    c.fillText('★'.repeat(stars) + '☆'.repeat(5 - stars), W / 2, H - 78);
  }

  function back(c, legend, th, name, hue, pic) {
    const comp = FW.compute(legend);
    const bg = c.createRadialGradient(W / 2, 0, 40, W / 2, 300, H);
    bg.addColorStop(0, th.panel.replace(/[\d.]+\)$/, '1)'));
    bg.addColorStop(1, '#060406');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);
    c.save();
    c.globalAlpha = 0.16;
    c.filter = 'blur(26px)';
    c.drawImage(pic, 0, 0, W, H);
    c.restore();
    const L = 96,
      R = W - 96;
    c.textAlign = 'center';
    const nm = th.caps ? heroName(legend).toUpperCase() : heroName(legend);
    fit(c, nm, W - 200, 58, '800', th.head);
    c.fillStyle = th.accent;
    c.fillText(nm, W / 2, 150);
    c.font = '500 30px ' + th.font;
    c.fillStyle = th.sub;
    fit(c, typeLine(legend), W - 200, 30, '500', th.font);
    c.fillText(typeLine(legend), W / 2, 196);
    // rating and rank
    c.textAlign = 'left';
    c.font = '800 96px ' + th.head;
    c.fillStyle = th.val;
    c.fillText(String(comp.rating), L, 320);
    c.textAlign = 'right';
    c.font = '700 34px ' + th.font;
    c.fillStyle = th.key;
    c.fillText(tr(comp.rank).toUpperCase(), R, 312);
    c.fillStyle = th.stroke;
    c.fillRect(L, 352, R - L, 2);
    // the seven stat bars
    const Wt = FW.WEIGHTS;
    const stats = [
      ['str', 'Strength', Wt.str],
      ['dur', 'Durability', Wt.dur],
      ['spd', 'Speed', Wt.spd],
      ['fgt', 'Fighting', Wt.fgt],
      ['int', 'Intellect', Wt.int],
      ['wpn', 'Weapon', Wt.wpnE],
      ['pwr', 'Power', Wt.powE],
    ];
    let y = 430;
    stats.forEach(([k, label, wt]) => {
      const pct = Math.max(0, Math.min(100, Math.round((comp.parts[k] || 0) / wt)));
      c.textAlign = 'left';
      c.font = '600 32px ' + th.font;
      c.fillStyle = th.val;
      c.fillText(tr(label), L, y);
      rr(c, L + 250, y - 20, R - L - 340, 16, 8);
      c.fillStyle = 'rgba(255,255,255,.12)';
      c.fill();
      rr(c, L + 250, y - 20, Math.max(16, ((R - L - 340) * Math.min(100, pct)) / 100), 16, 8);
      const bar = c.createLinearGradient(L + 250, 0, R - 90, 0);
      bar.addColorStop(0, th.accent);
      bar.addColorStop(1, th.key);
      c.fillStyle = bar;
      c.fill();
      c.textAlign = 'right';
      c.font = '600 30px ' + th.font;
      c.fillStyle = th.sub;
      c.fillText(String(pct), R, y);
      y += 70;
    });
    y += 6;
    c.fillStyle = th.stroke;
    c.fillRect(L, y - 30, R - L, 2);
    // facts
    const facts = FW.extraLines(legend).filter(
      x => ['BIRTHPLACE', 'BACKGROUND', 'PERSONALITY', "FATE'S MARK"].indexOf(x.k) >= 0
    );
    if (legend.has('wpn')) facts.push({ k: 'WEAPON', v: legend.pickName('wpn') });
    if (legend.has('pow') && !legend.isNone('pow')) facts.push({ k: 'POWER', v: legend.pickName('pow') });
    if (legend.has('weak') && !legend.isNone('weak')) facts.push({ k: 'WEAKNESS', v: legend.pickName('weak') });
    if (legend.has('pet') && !legend.isNone('pet')) facts.push({ k: 'COMPANION', v: legend.pickName('pet') });
    y += 26;
    facts.slice(0, 8).forEach(f => {
      c.textAlign = 'left';
      c.font = '700 24px ' + th.font;
      c.fillStyle = th.key;
      const k = tr(f.k.charAt(0) + f.k.slice(1).toLowerCase()).toUpperCase();
      c.fillText(k, L, y);
      fit(c, String(f.v), R - L - 280, 32, '500', th.font);
      c.fillStyle = th.val;
      c.fillText(String(f.v), L + 280, y);
      y += 60;
    });
    // weaknesses and resistances in one line
    const wr = [];
    if (comp.weak.length) wr.push(tr('Weak to') + ' ' + comp.weak.map(FW.cap).join(', '));
    if (comp.res.length) wr.push(tr('Resists') + ' ' + comp.res.map(FW.cap).join(', '));
    if (wr.length) {
      c.textAlign = 'center';
      fit(c, wr.join('   ·   '), R - L, 28, '600', th.font);
      c.fillStyle = th.sub;
      c.fillText(wr.join('   ·   '), W / 2, y + 10);
      y += 56;
    }
    // the saga, if one was played
    if (legend.saga && legend.saga.ch && FW.Story) {
      c.textAlign = 'center';
      c.font = 'italic 500 30px ' + th.font;
      c.fillStyle = th.val;
      wrap(c, FW.Story.summary(legend), R - L)
        .slice(0, 2)
        .forEach((l, i) => c.fillText(l, W / 2, Math.min(H - 170, y + 20) + i * 38));
    }
    c.textAlign = 'center';
    c.font = '600 22px ' + th.font;
    c.fillStyle = 'rgba(255,255,255,.45)';
    c.fillText('D E S T I N Y   U N B O U N D', W / 2, H - 76);
  }

  /* the rank frame: an inner border inside the theme's frame that grows richer with the hero's rank.
     Commoner and Fighter: a thin iron line. Veteran: bronze with corner studs. Champion: silver, doubled.
     Warlord and Mythic: gold, doubled, with corner brackets and diamonds on the edges. Demigod: gold with glowing
     gems. Cosmic Being: a prismatic, glowing border scattered with stars. */
  const RANK_METAL = ['#6f6252', '#857462', '#b07a48', '#c9cdd6', '#e0b46a', '#f0c674', '#f6d27a', '#ffffff'];
  FW.rankFrameTier = ri => Math.max(0, Math.min(7, ri | 0));
  function rankFrame(c, th, ri) {
    const t = FW.rankFrameTier(ri),
      m = RANK_METAL[t],
      i = 34,
      w = W - 2 * i,
      h = H - 2 * i;
    c.save();
    c.lineJoin = 'round';
    if (t === 7) {
      const g = c.createLinearGradient(0, 0, W, H);
      ['#ff8ad8', '#8fd3ff', '#b6ff9c', '#ffe58a', '#ff9f7a', '#c79bff'].forEach((col, k, a) =>
        g.addColorStop(k / (a.length - 1), col)
      );
      c.shadowColor = 'rgba(200,180,255,.9)';
      c.shadowBlur = 26;
      c.strokeStyle = g;
      c.lineWidth = 6;
      rr(c, i, i, w, h, 18);
      c.stroke();
      c.shadowBlur = 0;
      c.lineWidth = 1.5;
      rr(c, i + 12, i + 12, w - 24, h - 24, 12);
      c.stroke();
      const rng = FW.makeRng('stars');
      for (let k = 0; k < 46; k++) {
        const side = k % 4,
          p = rng();
        const x = side === 0 ? i + p * w : side === 1 ? i + w : side === 2 ? i + p * w : i;
        const y = side === 0 ? i : side === 1 ? i + p * h : side === 2 ? i + h : i + p * h;
        const r = 2 + rng() * 5;
        c.fillStyle = 'rgba(255,255,255,' + (0.5 + rng() * 0.5) + ')';
        c.beginPath();
        for (let q = 0; q < 8; q++) {
          const a = (q / 8) * TAU,
            rad = q % 2 ? r * 0.35 : r;
          c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
        }
        c.fill();
      }
      c.restore();
      return;
    }
    c.strokeStyle = m;
    c.lineWidth = t >= 4 ? 4 : t >= 2 ? 3 : 1.5;
    if (t >= 5) {
      c.shadowColor = m;
      c.shadowBlur = 12;
    }
    rr(c, i, i, w, h, 10);
    c.stroke();
    c.shadowBlur = 0;
    if (t >= 3) {
      c.lineWidth = 1.5;
      rr(c, i + 10, i + 10, w - 20, h - 20, 6);
      c.stroke();
    }
    const corners = [
      [i, i, 1, 1],
      [i + w, i, -1, 1],
      [i, i + h, 1, -1],
      [i + w, i + h, -1, -1],
    ];
    if (t >= 2)
      corners.forEach(([x, y, sx, sy]) => {
        c.fillStyle = m;
        c.beginPath();
        c.arc(x + sx * 4, y + sy * 4, t >= 4 ? 9 : 6, 0, TAU);
        c.fill();
      });
    if (t >= 4) {
      // corner brackets and a diamond in the middle of each edge
      c.lineWidth = 3;
      corners.forEach(([x, y, sx, sy]) => {
        c.beginPath();
        c.moveTo(x + sx * 70, y + sy * 18);
        c.lineTo(x + sx * 18, y + sy * 18);
        c.lineTo(x + sx * 18, y + sy * 70);
        c.stroke();
      });
      [
        [W / 2, i],
        [W / 2, i + h],
        [i, H / 2],
        [i + w, H / 2],
      ].forEach(([x, y]) => {
        c.fillStyle = m;
        c.beginPath();
        c.moveTo(x, y - 11);
        c.lineTo(x + 11, y);
        c.lineTo(x, y + 11);
        c.lineTo(x - 11, y);
        c.closePath();
        c.fill();
      });
    }
    if (t >= 6) {
      // glowing gems in the theme's colour at the corners
      corners.forEach(([x, y, sx, sy]) => {
        const gx = x + sx * 4,
          gy = y + sy * 4;
        const gg = c.createRadialGradient(gx - 3, gy - 3, 1, gx, gy, 12);
        gg.addColorStop(0, '#fff');
        gg.addColorStop(0.4, th.key);
        gg.addColorStop(1, '#2a0a12');
        c.shadowColor = th.key;
        c.shadowBlur = 18;
        c.fillStyle = gg;
        c.beginPath();
        c.arc(gx, gy, 12, 0, TAU);
        c.fill();
      });
    }
    c.restore();
  }

  /* a default painted portrait for heroes without their own picture: chosen by race, presentation and seed.
     Returns the image once it has loaded; until then null, and onReady is called when it arrives. */
  const portraitCache = {};
  FW.portraitFile = function (legend) {
    const list = (FW.PORTRAITS || {})[legend.raceName()];
    if (!list || !list.length) return '';
    const want = legend.pres === 'fem' ? /f\d*$/ : legend.pres === 'masc' ? /m\d*$/ : null;
    // a portrait that matches the chosen presentation, or one that suits anyone, before any other
    const neutral = list.filter(f => !/[fm]\d*$/.test(f));
    const pool = want ? list.filter(f => want.test(f)).concat(neutral) : list;
    const use = pool.length ? pool : list;
    return use[hash(String(legend.seed)) % use.length];
  };
  FW.defaultPortrait = function (legend, onReady) {
    if (typeof Image === 'undefined') return null;
    const f = FW.portraitFile(legend);
    if (!f) return null;
    let im = portraitCache[f];
    if (!im) {
      im = portraitCache[f] = new Image();
      im.decoding = 'async';
      im.src = 'art/portraits/' + f + '.webp';
    }
    if (im.complete && im.naturalWidth) return im;
    if (onReady) im.addEventListener('load', () => onReady(), { once: true });
    return null;
  };

  FW.drawCard = function (canvas, legend, opts) {
    opts = opts || {};
    const name = themeOf(opts.theme),
      th = CT[name];
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext('2d');
    const hue = hueOf(legend);
    const pic = scene(legend, th, hue, opts.image);
    c.save();
    if (opts.side === 'back') back(c, legend, th, name, hue, pic);
    else if (opts.style === 'full') frontFull(c, legend, th, name, hue, pic);
    else frontArch(c, legend, th, name, hue, pic);
    c.restore();
    frame(c, th.frame || name, hue);
    rankFrame(c, th, rankIndex(FW.compute(legend).rating));
  };

  FW.canvasToBlob = function (canvas) {
    return new Promise(res => canvas.toBlob(res, 'image/png'));
  };
})(typeof window !== 'undefined' ? window : globalThis);
