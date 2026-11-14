/* Destiny Unbound wheel renderer + spin physics + audio. Browser only. */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const TAU = Math.PI * 2;

  /* ---------------- themes (wheel side; page side lives in css/themes.css) ----------------
     kind picks the wheel art: ember (iron, runes, blade), celestial (silver star ring, star hub, needle), gothic (brass cog, gem, spike), eldritch (silver, eye, claw).
     pal = alternating slice colours [inner, outer]; lad = ladder colours from the lowest to the highest tier; hit = colour of the landed slice. */
  FW.THEMES = {
    ashen: {
      name: 'Ashen Crown',
      kind: 'ember',
      font: '"Cinzel", "Palatino Linotype", serif',
      weight: '700',
      upper: true,
      italic: false,
      pal: [
        ['#24201d', '#3a322b'],
        ['#3b1612', '#5e1f17'],
        ['#2b1f19', '#46322a'],
      ],
      lad: ['#f0d9ad', '#c9893f', '#7a2a10', '#2a0d06'],
      gray: ['#151210', '#100d0c'],
      line: 'rgba(212,175,110,.35)',
      ink: '#f3e2c3',
      inkDark: '#2a1608',
      hit: 'rgba(255,140,40,.55)',
      glow: '#ff7a1a',
      dim: 0.55,
    },
    astral: {
      name: 'Astral Oracle',
      kind: 'celestial',
      font: '"Cormorant SC", "Cormorant Garamond", Georgia, serif',
      weight: '700',
      upper: false,
      italic: false,
      pal: [
        ['#0d1636', '#1d2f6a'],
        ['#151036', '#2c2264'],
        ['#0a1c2e', '#16425e'],
      ],
      lad: ['#eef6ff', '#8fc4ff', '#3a5cc4', '#0a1030'],
      gray: ['#0b0f1e', '#080b16'],
      line: 'rgba(170,200,255,.35)',
      ink: '#e6efff',
      inkDark: '#0a1030',
      hit: 'rgba(120,190,255,.55)',
      glow: '#8fc4ff',
      dim: 0.55,
    },
    iron: {
      name: 'Iron Litany',
      kind: 'gothic',
      font: '"Share Tech Mono", Consolas, monospace',
      weight: '400',
      upper: true,
      italic: false,
      pal: [
        ['#2b2f35', '#40464e'],
        ['#4a0f0f', '#6e1414'],
      ],
      lad: ['#e8d9b0', '#b8862b', '#6e1414', '#1a0505'],
      gray: ['#18191c', '#131417'],
      line: '#b8862b',
      ink: '#efe2bf',
      inkDark: '#1a0d02',
      hit: 'rgba(255,214,110,.6)',
      glow: '#ffd166',
      dim: 0.55,
    },
    bloodmoon: {
      name: 'Blood Moon',
      kind: 'eldritch',
      font: '"Cormorant Garamond", Georgia, serif',
      weight: '700',
      upper: false,
      italic: true,
      pal: [
        ['#1a0f1f', '#3a1d45'],
        ['#0f1a1c', '#173a3d'],
        ['#200d10', '#4a1520'],
      ],
      lad: ['#e6dff0', '#9a8cb6', '#4a2a5a', '#120a16'],
      gray: ['#0d0c12', '#0a090e'],
      line: 'rgba(200,210,225,.3)',
      ink: '#e6e0f0',
      inkDark: '#0d1405',
      hit: 'rgba(182,255,92,.5)',
      glow: '#b6ff5c',
      dim: 0.6,
    },
  };
  FW.THEME_ALIAS = { classic: 'ashen', gilded: 'ashen', neon: 'iron', grimoire: 'astral', tabletop: 'astral' }; // older themes and the ones they became
  const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  function brass(c, R) {
    const g = c.createLinearGradient(-R, -R, R, R);
    g.addColorStop(0, '#f0c96a');
    g.addColorStop(0.5, '#8a5f1f');
    g.addColorStop(1, '#d9a94a');
    return g;
  }

  /* mix two hex colours */
  function mix(a, b, t) {
    const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const x = p(a),
      y = p(b);
    return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',') + ')';
  }
  function ladderColor(lad, r) {
    const seg = Math.min(lad.length - 2, Math.floor(r * (lad.length - 1))),
      t = r * (lad.length - 1) - seg;
    return mix(lad[seg], lad[seg + 1], t);
  }
  const lum = c => {
    const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(c) || /#(..)(..)(..)/.exec(c);
    if (!m) return 0.5;
    const v = m[0][0] === '#' ? [1, 2, 3].map(i => parseInt(m[i], 16)) : [1, 2, 3].map(i => +m[i]);
    return (0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]) / 255;
  };

  /* slice colour: returns {inner, outer, light} (light = needs dark text) */
  FW.sliceColor = function (style, i, n, entry, theme) {
    if (entry && entry.color) return { inner: entry.color, outer: entry.color, light: (entry.colorLight || 40) > 62 };
    if (entry && entry.gray)
      return { inner: theme.gray[0], outer: theme.gray[1], light: lum(theme.gray[0]) > 0.6, gray: true };
    if (entry && entry.dsl && /(^|\s)none(\s|$)/.test(entry.dsl))
      return { inner: '#070606', outer: '#0d0b0a', light: false, none: true };
    if (style.mode === 'ladder' || style.mode === 'gradient') {
      const c = ladderColor(theme.lad, n > 1 ? i / (n - 1) : 0);
      return { inner: c, outer: c, light: lum(c) > 0.55 };
    }
    const pal = FW.prefs && FW.prefs.cbSafe ? FW.CB_PAL : theme.pal,
      p = pal[i % pal.length]; // colour-blind-safe slices when chosen
    return { inner: p[0], outer: p[1], light: lum(p[0]) > 0.55 };
  };

  class Wheel {
    constructor(canvas, themeName) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.theme = FW.THEMES[themeName] || FW.THEMES[FW.THEME_ALIAS[themeName]] || FW.THEMES.ashen;
      this.entries = [];
      this.style = { mode: 'cat', hue: 0 };
      this.rot = 0;
      this.focus = -1;
      this.kick = 0;
      this.spinning = false;
      this.dir = -1; // -1 = counter-clockwise, 1 = clockwise
      this.onTick = null;
      this.onLabel = null;
      this.size = 0;
      this.dpr = 1;
      this.off = document.createElement('canvas');
      this.rim = document.createElement('canvas');
      this.cum = [0, 1];
      this._raf = 0;
      this._skip = false;
      this._lastIdx = -1;
      this._lastTick = 0;
      this.resize();
      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => {
          this.resize();
        });
        this._ro.observe(canvas.parentElement || canvas);
      }
      if (document.fonts && document.fonts.ready)
        document.fonts.ready.then(() => {
          this.buildFace();
          this.draw();
        }); // redraw once the theme font has loaded
    }
    setTheme(name) {
      this.theme = FW.THEMES[name] || FW.THEMES[FW.THEME_ALIAS[name]] || FW.THEMES.ashen;
      this.buildFace();
      this.draw();
    }
    setEntries(entries, style) {
      this.entries = entries;
      this.style = style || this.style;
      // dw = drawn size (greyed-out slices stay visible but can never be landed on: w = 0)
      const sz = e => (e.dw != null ? e.dw : e.w);
      const tot = entries.reduce((a, e) => a + sz(e), 0) || 1;
      this.cum = [0];
      entries.forEach(e => this.cum.push(this.cum[this.cum.length - 1] + sz(e) / tot));
      this.cum[this.cum.length - 1] = 1;
      this.focus = -1;
      this._lastIdx = -1;
      this.buildFace();
      this.draw();
    }
    resize() {
      const w = this.cv.clientWidth || (this.cv.parentElement && this.cv.parentElement.clientWidth) || 320;
      const dpr = Math.min(FW.maxDpr ? FW.maxDpr() : 3, g.devicePixelRatio || 1);
      if (Math.abs(w - this.size) < 1 && dpr === this.dpr && this.cv.width) return;
      this.size = w;
      this.dpr = dpr;
      this.cv.width = Math.round(w * dpr);
      this.cv.height = Math.round(w * dpr);
      this.off.width = this.cv.width;
      this.off.height = this.cv.height;
      this.rim.width = this.cv.width;
      this.rim.height = this.cv.height;
      this.buildFace();
      this.draw();
    }
    geometry() {
      const S = this.size,
        k = this.theme.kind;
      const rimW = S * ({ ember: 0.058, parchment: 0.045, celestial: 0.055, gothic: 0.075, eldritch: 0.05 }[k] || 0.05);
      const R = S / 2 - rimW - S * 0.012; // slices
      const hubR = R * ({ ember: 0.19, parchment: 0.23, celestial: 0.22, gothic: 0.22, eldritch: 0.25 }[k] || 0.2);
      return { S, cx: S / 2, cy: S / 2, R, Rs: R, rimW, hubR };
    }
    /* static parts: the rim behind the slices (rim canvas) and the slices with labels (off canvas, rotated while spinning) */
    buildFace() {
      if (!this.size) return;
      const d = this.dpr,
        G = this.geometry(),
        th = this.theme;
      this.buildRim(G);
      const c = this.off.getContext('2d');
      c.setTransform(d, 0, 0, d, 0, 0);
      c.clearRect(0, 0, G.S, G.S);
      const n = this.entries.length;
      if (!n) return;
      c.save();
      c.translate(G.cx, G.cy);
      for (let i = 0; i < n; i++) {
        const a0 = -Math.PI / 2 + this.cum[i] * TAU,
          a1 = -Math.PI / 2 + this.cum[i + 1] * TAU,
          e = this.entries[i];
        const col = FW.sliceColor(this.style, i, n, e, th);
        e._light = col.light;
        c.beginPath();
        c.moveTo(0, 0);
        c.arc(0, 0, G.R, a0, a1);
        c.closePath();
        if (col.inner === col.outer) c.fillStyle = col.inner;
        else {
          const gr = c.createRadialGradient(0, 0, G.hubR, 0, 0, G.R);
          gr.addColorStop(0, col.inner);
          gr.addColorStop(1, col.outer);
          c.fillStyle = gr;
        }
        c.fill();
        if (
          th.hatch &&
          i % 2 &&
          !col.gray &&
          !e.color &&
          this.style.mode !== 'ladder' &&
          this.style.mode !== 'gradient'
        ) {
          c.save();
          c.clip();
          c.strokeStyle = 'rgba(59,42,26,.13)';
          c.lineWidth = 0.8;
          for (let k = -G.R; k < G.R; k += 6) {
            c.beginPath();
            c.moveTo(k, -G.R);
            c.lineTo(k + G.R, G.R);
            c.stroke();
          }
          c.restore();
        }
        if (n <= 140) {
          c.lineWidth = n > 70 ? 0.5 : th.kind === 'parchment' ? 1.2 : th.kind === 'gothic' ? 1.3 : 1;
          c.strokeStyle = th.line;
          c.stroke();
        }
      }
      // labels
      const sizeBoost = n <= 8 ? 1.7 : n <= 14 ? 1.4 : n <= 28 ? 1.12 : 1;
      for (let i = 0; i < n; i++) {
        const e = this.entries[i],
          ang = (this.cum[i + 1] - this.cum[i]) * TAU,
          mid = -Math.PI / 2 + ((this.cum[i] + this.cum[i + 1]) / 2) * TAU;
        let fs = Math.min(ang * G.R * 0.52 * 0.82, G.R * (th.upper ? 0.075 : 0.088) * sizeBoost);
        if (fs < 3.6) continue;
        const avail = G.R * 0.93 - G.hubR * 1.15;
        c.save();
        c.rotate(mid + Math.PI);
        const font = s => (th.italic ? 'italic ' : '') + th.weight + ' ' + s.toFixed(1) + 'px ' + th.font;
        c.font = font(fs);
        let label = FW.t ? FW.t(e.name) : e.name;
        if (th.upper) label = label.toUpperCase();
        let wd = c.measureText(label).width;
        if (wd > avail) {
          fs = Math.max(3.6, (fs * avail) / wd);
          c.font = font(fs);
          wd = c.measureText(label).width;
          if (wd > avail * 1.04) {
            const cut = Math.floor((label.length * avail) / wd) - 1;
            label = label.slice(0, Math.max(3, cut)) + '…';
          }
        }
        if (fs < 3.6) {
          c.restore();
          continue;
        }
        c.textBaseline = 'middle';
        c.textAlign = 'left';
        c.fillStyle = e.gray
          ? e._light
            ? 'rgba(43,29,16,.4)'
            : 'rgba(230,220,200,.32)'
          : e._light
            ? th.inkDark || th.ink
            : th.inkLight && th.kind === 'parchment'
              ? th.inkLight
              : th.ink;
        if (!e._light && fs > 7) {
          c.shadowColor = 'rgba(0,0,0,.5)';
          c.shadowBlur = 2.5;
        }
        c.fillText(label, -(G.R - G.R * 0.045), 0);
        c.restore();
      }
      c.restore();
    }
    buildRim(G) {
      const c = this.rim.getContext('2d'),
        d = this.dpr,
        th = this.theme,
        R = G.R,
        W = G.rimW;
      c.setTransform(d, 0, 0, d, 0, 0);
      c.clearRect(0, 0, G.S, G.S);
      c.save();
      c.translate(G.cx, G.cy);
      if (th.kind === 'ember') {
        c.beginPath();
        c.arc(0, 0, R + W, 0, TAU);
        const rg = c.createRadialGradient(0, 0, R, 0, 0, R + W);
        rg.addColorStop(0, '#2a2522');
        rg.addColorStop(0.5, '#4a423b');
        rg.addColorStop(1, '#141110');
        c.fillStyle = rg;
        c.fill();
        c.font = Math.max(8, W * 0.55).toFixed(1) + 'px serif';
        c.fillStyle = 'rgba(255,170,90,.8)';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.shadowColor = '#ff7a1a';
        c.shadowBlur = 8;
        for (let i = 0; i < 36; i++) {
          c.save();
          c.rotate((i / 36) * TAU);
          c.fillText(RUNES[i % RUNES.length], 0, -(R + W / 2));
          c.restore();
        }
        c.shadowBlur = 0;
      } else if (th.kind === 'parchment') {
        c.beginPath();
        c.arc(0, 0, R + W, 0, TAU);
        c.fillStyle = '#e9d9b2';
        c.fill();
        c.strokeStyle = '#3b2a1a';
        c.lineWidth = 2;
        c.stroke();
        c.beginPath();
        c.arc(0, 0, R + W * 0.78, 0, TAU);
        c.lineWidth = 0.8;
        c.stroke();
        for (let i = 0; i < 72; i++) {
          const a = (i / 72) * TAU,
            l = (i % 6 ? 0.3 : 0.62) * W;
          c.beginPath();
          c.moveTo(Math.cos(a) * (R + 1), Math.sin(a) * (R + 1));
          c.lineTo(Math.cos(a) * (R + 1 + l), Math.sin(a) * (R + 1 + l));
          c.lineWidth = i % 6 ? 0.7 : 1.4;
          c.stroke();
        }
      } else if (th.kind === 'celestial') {
        // a night-blue band of silver ticks with twelve glowing stars
        c.beginPath();
        c.arc(0, 0, R + W, 0, TAU);
        const rg = c.createRadialGradient(0, 0, R, 0, 0, R + W);
        rg.addColorStop(0, '#0a1030');
        rg.addColorStop(0.55, '#1a2a5a');
        rg.addColorStop(1, '#070b1c');
        c.fillStyle = rg;
        c.fill();
        c.strokeStyle = '#c9d8f5';
        c.lineWidth = 1.5;
        c.stroke();
        c.beginPath();
        c.arc(0, 0, R + W * 0.82, 0, TAU);
        c.lineWidth = 0.6;
        c.strokeStyle = 'rgba(201,216,245,.5)';
        c.stroke();
        for (let i = 0; i < 60; i++) {
          if (i % 5 === 0) continue;
          const a = (i / 60) * TAU;
          c.beginPath();
          c.moveTo(Math.cos(a) * (R + 1), Math.sin(a) * (R + 1));
          c.lineTo(Math.cos(a) * (R + W * 0.28), Math.sin(a) * (R + W * 0.28));
          c.lineWidth = 0.8;
          c.strokeStyle = 'rgba(201,216,245,.55)';
          c.stroke();
        }
        c.shadowColor = '#8fc4ff';
        c.shadowBlur = 8;
        c.fillStyle = '#eef6ff';
        for (let i = 0; i < 12; i++) {
          c.save();
          c.rotate((i / 12) * TAU);
          c.translate(0, -(R + W * 0.52));
          const s = W * 0.3;
          c.beginPath();
          for (let k = 0; k < 8; k++) {
            const r = k % 2 ? s * 0.28 : s,
              a = (k / 8) * TAU;
            c.lineTo(Math.sin(a) * r, -Math.cos(a) * r);
          }
          c.closePath();
          c.fill();
          c.restore();
        }
        c.shadowBlur = 0;
      } else if (th.kind === 'gothic') {
        const teeth = 40;
        c.beginPath();
        for (let i = 0; i < teeth * 2; i++) {
          const a = (i / (teeth * 2)) * TAU,
            r = i % 2 ? R + W * 0.68 : R + W;
          c.lineTo(Math.cos(a - 0.03) * r, Math.sin(a - 0.03) * r);
          c.lineTo(Math.cos(a + 0.03) * r, Math.sin(a + 0.03) * r);
        }
        c.closePath();
        c.fillStyle = brass(c, R);
        c.fill();
        c.beginPath();
        c.arc(0, 0, R + W * 0.6, 0, TAU);
        c.fillStyle = '#1d1e21';
        c.fill();
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * TAU;
          c.beginPath();
          c.arc(Math.cos(a) * (R + W * 0.3), Math.sin(a) * (R + W * 0.3), Math.max(1.4, W * 0.09), 0, TAU);
          c.fillStyle = '#c99a3c';
          c.fill();
        }
      } else {
        c.beginPath();
        c.arc(0, 0, R + W, 0, TAU);
        c.fillStyle = '#0b0a0f';
        c.fill();
        c.strokeStyle = 'rgba(200,205,220,.55)';
        c.lineWidth = 1;
        for (let i = 0; i < 18; i++) {
          c.save();
          c.rotate((i / 18) * TAU);
          c.beginPath();
          const r = R + 2;
          c.moveTo(0, -r);
          c.bezierCurveTo(W * 0.5, -(r + W * 0.25), W * 0.5, -(r + W * 0.7), 0, -(r + W * 0.62));
          c.bezierCurveTo(-W * 0.3, -(r + W * 0.55), -W * 0.1, -(r + W * 0.3), W * 0.15, -(r + W * 0.38));
          c.stroke();
          c.restore();
        }
      }
      c.restore();
    }
    indexAt(rot) {
      const phi = (((-rot % TAU) + TAU) % TAU) / TAU;
      let lo = 0,
        hi = this.entries.length - 1;
      while (lo < hi) {
        const m = (lo + hi + 1) >> 1;
        if (this.cum[m] <= phi) lo = m;
        else hi = m - 1;
      }
      return lo;
    }
    draw() {
      if (!this.size) return;
      const ctx = this.ctx,
        d = this.dpr,
        G = this.geometry(),
        th = this.theme;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.clearRect(0, 0, G.S, G.S);
      ctx.drawImage(this.rim, 0, 0, G.S, G.S);
      // rotated slices
      if (this.entries.length) {
        ctx.save();
        ctx.translate(G.cx, G.cy);
        ctx.rotate(this.rot);
        ctx.drawImage(this.off, -G.cx, -G.cy, G.S, G.S);
        if (this.focus >= 0) {
          const a0 = -Math.PI / 2 + this.cum[this.focus] * TAU,
            a1 = -Math.PI / 2 + this.cum[this.focus + 1] * TAU;
          ctx.beginPath();
          ctx.arc(0, 0, G.R, 0, TAU);
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, G.R, a0, a1);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0,0,0,' + th.dim + ')';
          ctx.fill('evenodd');
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, G.R, a0, a1);
          ctx.closePath();
          if (th.glow && (!FW.glowOn || FW.glowOn())) {
            ctx.shadowColor = th.glow;
            ctx.shadowBlur = G.S * (this.rareWin ? 0.11 : 0.05);
          }
          ctx.globalCompositeOperation = th.kind === 'parchment' ? 'multiply' : 'screen';
          ctx.fillStyle = th.hit;
          ctx.fill();
          // the landing flash: the slice brightens a few times, then holds with a bright outline
          const f = this.flash || 0;
          if (f > 0) {
            ctx.globalAlpha = f;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          ctx.globalCompositeOperation = 'source-over';
          ctx.shadowBlur = 0;
          ctx.lineJoin = 'round';
          ctx.lineWidth = Math.max(2, G.S * 0.007) * (1 + f) * (this.rareWin ? 1.6 : 1);
          ctx.strokeStyle = th.glow || th.ink || '#fff';
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
      // edge, hub and pointer
      ctx.save();
      ctx.translate(G.cx, G.cy);
      ctx.beginPath();
      ctx.arc(0, 0, G.R, 0, TAU);
      ctx.strokeStyle = {
        ember: '#b8975a',
        parchment: '#3b2a1a',
        celestial: '#c9d8f5',
        gothic: '#d9a94a',
        eldritch: '#c9cede',
      }[th.kind];
      ctx.lineWidth = th.kind === 'gothic' ? 2.5 : 2;
      ctx.stroke();
      this.drawHub(ctx, G);
      ctx.restore();
      this.drawPointer(ctx, G);
    }
    drawHub(c, G) {
      const r = G.hubR,
        th = this.theme;
      if (th.kind === 'ember') {
        const hg = c.createRadialGradient(0, -r * 0.2, 1, 0, 0, r);
        hg.addColorStop(0, '#ffb35c');
        hg.addColorStop(0.35, '#7a2a10');
        hg.addColorStop(1, '#1b1715');
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fillStyle = hg;
        c.fill();
        c.strokeStyle = '#b8975a';
        c.lineWidth = 3;
        c.stroke();
      } else if (th.kind === 'parchment') {
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fillStyle = '#f5ead0';
        c.fill();
        c.strokeStyle = '#3b2a1a';
        c.lineWidth = 2;
        c.stroke();
        const h = r * 0.78,
          P = k => [Math.cos(-Math.PI / 2 + (k * Math.PI) / 3) * h, Math.sin(-Math.PI / 2 + (k * Math.PI) / 3) * h];
        c.beginPath();
        for (let k = 0; k < 6; k++) {
          const p = P(k);
          k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
        }
        c.closePath();
        c.fillStyle = '#7a1f1a';
        c.fill();
        c.strokeStyle = '#2b1d10';
        c.lineWidth = 1.5;
        c.stroke();
        const t = h * 0.55;
        c.beginPath();
        c.moveTo(0, -t);
        c.lineTo(t * 0.87, t * 0.5);
        c.lineTo(-t * 0.87, t * 0.5);
        c.closePath();
        c.strokeStyle = 'rgba(255,230,200,.7)';
        c.lineWidth = 1;
        c.stroke();
        [
          [0, 0, -t],
          [2, t * 0.87, t * 0.5],
          [4, -t * 0.87, t * 0.5],
        ].forEach(q => {
          const p = P(q[0]);
          c.beginPath();
          c.moveTo(p[0], p[1]);
          c.lineTo(q[1], q[2]);
          c.stroke();
        });
        c.fillStyle = '#fff4dc';
        c.font = '700 ' + Math.round(r * 0.42) + 'px "IM Fell English", serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('20', 0, t * 0.05);
      } else if (th.kind === 'celestial') {
        // a silver ring around a bright eight-pointed star
        const hg = c.createRadialGradient(0, 0, 1, 0, 0, r);
        hg.addColorStop(0, '#2a4a9a');
        hg.addColorStop(0.7, '#0d1636');
        hg.addColorStop(1, '#070b1c');
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fillStyle = hg;
        c.fill();
        c.strokeStyle = '#c9d8f5';
        c.lineWidth = 2;
        c.stroke();
        c.beginPath();
        c.arc(0, 0, r * 0.84, 0, TAU);
        c.lineWidth = 0.7;
        c.strokeStyle = 'rgba(201,216,245,.5)';
        c.stroke();
        const star = (s, inner, rot) => {
          c.beginPath();
          for (let k = 0; k < 8; k++) {
            const rr = k % 2 ? s * inner : s,
              a = rot + (k / 8) * TAU;
            c.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr);
          }
          c.closePath();
        };
        c.shadowColor = '#8fc4ff';
        c.shadowBlur = 18;
        star(r * 0.5, 0.3, TAU / 16);
        c.fillStyle = 'rgba(160,200,255,.55)';
        c.fill();
        star(r * 0.72, 0.22, 0);
        c.fillStyle = '#eef6ff';
        c.fill();
        c.shadowBlur = 0;
        c.beginPath();
        c.arc(0, 0, r * 0.1, 0, TAU);
        c.fillStyle = '#fff';
        c.fill();
      } else if (th.kind === 'gothic') {
        c.beginPath();
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * TAU,
            rr = i % 2 ? r : r * 1.18;
          c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        c.closePath();
        c.fillStyle = brass(c, r);
        c.fill();
        c.beginPath();
        c.arc(0, 0, r * 0.72, 0, TAU);
        c.fillStyle = '#1d1e21';
        c.fill();
        const gem = c.createRadialGradient(-r * 0.12, -r * 0.12, 1, 0, 0, r * 0.45);
        gem.addColorStop(0, '#ff8a80');
        gem.addColorStop(0.5, '#b3121b');
        gem.addColorStop(1, '#3a0508');
        c.beginPath();
        c.arc(0, 0, r * 0.45, 0, TAU);
        c.fillStyle = gem;
        c.shadowColor = '#ff2a2a';
        c.shadowBlur = 16;
        c.fill();
        c.shadowBlur = 0;
      } else {
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fillStyle = '#0b0a0f';
        c.fill();
        c.strokeStyle = '#c9cede';
        c.lineWidth = 2;
        c.stroke();
        const eye = () => {
          c.beginPath();
          c.moveTo(-r * 0.85, 0);
          c.quadraticCurveTo(0, -r * 0.7, r * 0.85, 0);
          c.quadraticCurveTo(0, r * 0.7, -r * 0.85, 0);
          c.closePath();
        };
        c.save();
        eye();
        c.fillStyle = '#efe6d2';
        c.fill();
        c.clip();
        // the pupil follows the spin a little
        const look = Math.max(-1, Math.min(1, this.spinning ? Math.sin(this.rot * 3) : 0)) * r * 0.18;
        const ir = c.createRadialGradient(look, 0, 1, look, 0, r * 0.4);
        ir.addColorStop(0, '#d8ff9a');
        ir.addColorStop(0.6, '#5e9e2a');
        ir.addColorStop(1, '#1d3a0d');
        c.beginPath();
        c.arc(look, 0, r * 0.4, 0, TAU);
        c.fillStyle = ir;
        c.fill();
        c.beginPath();
        c.ellipse(look, 0, r * 0.07, r * 0.33, 0, 0, TAU);
        c.fillStyle = '#050505';
        c.fill();
        c.restore();
        eye();
        c.strokeStyle = '#7a1f2b';
        c.lineWidth = 1.5;
        c.stroke();
      }
    }
    drawPointer(c, G) {
      const th = this.theme,
        R = G.R,
        top = G.cy - R,
        u = G.S / 400; // u = scale unit (designs were drawn on a 400px wheel)
      c.save();
      c.translate(G.cx, top - 8 * u);
      c.rotate(this.kick * 0.12 * this.dir);
      c.translate(0, -(top - 8 * u));
      if (th.kind === 'ember') {
        c.beginPath();
        c.moveTo(0, top + 24 * u);
        c.lineTo(-9 * u, top - 6 * u);
        c.lineTo(-4 * u, top - 22 * u);
        c.lineTo(4 * u, top - 22 * u);
        c.lineTo(9 * u, top - 6 * u);
        c.closePath();
        const bl = c.createLinearGradient(-9 * u, 0, 9 * u, 0);
        bl.addColorStop(0, '#8d8f94');
        bl.addColorStop(0.5, '#f2f2f2');
        bl.addColorStop(1, '#6b6d72');
        c.fillStyle = bl;
        c.fill();
        c.strokeStyle = '#2a2522';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = '#b8975a';
        c.fillRect(-14 * u, top - 26 * u, 28 * u, 5 * u);
      } else if (th.kind === 'parchment') {
        c.beginPath();
        c.moveTo(0, top + 20 * u);
        c.lineTo(-10 * u, top - 14 * u);
        c.lineTo(0, top - 6 * u);
        c.lineTo(10 * u, top - 14 * u);
        c.closePath();
        c.fillStyle = '#b3261e';
        c.fill();
        c.strokeStyle = '#2b1d10';
        c.lineWidth = 1.5;
        c.stroke();
      } else if (th.kind === 'celestial') {
        // a slender silver needle topped with a star
        c.beginPath();
        c.moveTo(0, top + 26 * u);
        c.lineTo(-6 * u, top - 4 * u);
        c.lineTo(0, top - 20 * u);
        c.lineTo(6 * u, top - 4 * u);
        c.closePath();
        const sv = c.createLinearGradient(-6 * u, 0, 6 * u, 0);
        sv.addColorStop(0, '#8a96b8');
        sv.addColorStop(0.5, '#f4f8ff');
        sv.addColorStop(1, '#7a86a8');
        c.fillStyle = sv;
        c.fill();
        c.strokeStyle = '#0a1030';
        c.lineWidth = 1;
        c.stroke();
        c.save();
        c.translate(0, top - 24 * u);
        c.shadowColor = '#8fc4ff';
        c.shadowBlur = 10 * u;
        c.beginPath();
        for (let k = 0; k < 8; k++) {
          const rr = k % 2 ? 2.4 * u : 8 * u,
            a = (k / 8) * TAU;
          c.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr);
        }
        c.closePath();
        c.fillStyle = '#eef6ff';
        c.fill();
        c.restore();
      } else if (th.kind === 'gothic') {
        c.beginPath();
        c.moveTo(0, top + 28 * u);
        c.lineTo(-11 * u, top - 8 * u);
        c.lineTo(0, top - 30 * u);
        c.lineTo(11 * u, top - 8 * u);
        c.closePath();
        c.fillStyle = brass(c, R);
        c.fill();
        c.strokeStyle = '#3a2a10';
        c.lineWidth = 1.5;
        c.stroke();
        c.beginPath();
        c.arc(0, top - 8 * u, 4 * u, 0, TAU);
        c.fillStyle = '#b3121b';
        c.fill();
      } else {
        c.beginPath();
        c.moveTo(0, top + 24 * u);
        c.quadraticCurveTo(-12 * u, top - 2 * u, -6 * u, top - 22 * u);
        c.quadraticCurveTo(0, top - 8 * u, 6 * u, top - 22 * u);
        c.quadraticCurveTo(12 * u, top - 2 * u, 0, top + 24 * u);
        const sv = c.createLinearGradient(-12 * u, 0, 12 * u, 0);
        sv.addColorStop(0, '#7d8293');
        sv.addColorStop(0.5, '#f2f3f8');
        sv.addColorStop(1, '#6a6f80');
        c.fillStyle = sv;
        c.fill();
      }
      c.restore();
    }
    /* put slice idx centred under the pointer without animating */
    showResult(idx, frac) {
      const f = frac == null ? 0.5 : frac;
      const a = (this.cum[idx] + (this.cum[idx + 1] - this.cum[idx]) * f) * TAU;
      this.rot = ((-a % TAU) + TAU) % TAU;
      this.focus = idx;
      this._lastIdx = idx;
      this.draw();
    }
    clearFocus() {
      this.focus = -1;
      this.flash = 0;
      this.rareWin = false;
      this.draw();
    }
    /* three quick pulses on the winning slice, five brighter ones for a rare result
       (none when motion is off; one soft pulse when reduced) */
    flashWin(rare) {
      const m = FW.motion ? FW.motion() : 'full';
      if (m === 'off' || typeof requestAnimationFrame !== 'function') return;
      const pulses = m === 'reduced' ? 1 : rare ? 5 : 3,
        peak = rare && m !== 'reduced' ? 1 : 0.8,
        dur = pulses * (rare ? 300 : 260),
        t0 = performance.now(),
        focus = this.focus;
      cancelAnimationFrame(this._flashRaf);
      const step = now => {
        const x = (now - t0) / dur;
        if (this.spinning || this.focus !== focus || x >= 1) {
          this.flash = 0;
          if (!this.spinning) this.draw();
          return;
        }
        this.flash = peak * Math.sin(Math.PI * ((x * pulses) % 1)) * (1 - x * 0.5);
        this.draw();
        this._flashRaf = requestAnimationFrame(step);
      };
      this._flashRaf = requestAnimationFrame(step);
    }
    skip() {
      this._skip = true;
    }
    /* animate to slice idx; resolves with idx when stopped */
    spinTo(idx, opts) {
      opts = opts || {};
      cancelAnimationFrame(this._raf);
      const rng = opts.rng || Math.random;
      const dur = Math.max(250, opts.duration || 4600);
      const turns = opts.turns != null ? opts.turns : 5 + Math.floor(rng() * 3);
      const frac = 0.1 + rng() * 0.8;
      const alpha = (this.cum[idx] + (this.cum[idx + 1] - this.cum[idx]) * frac) * TAU;
      const r0 = this.rot,
        dir = this.dir >= 0 ? 1 : -1;
      // land with slice idx under the pointer after whole turns, in the chosen direction
      const delta = dir > 0 ? (((-alpha - r0) % TAU) + TAU) % TAU : (((r0 + alpha) % TAU) + TAU) % TAU;
      const r1 = r0 + dir * (turns * TAU + delta);
      this.focus = -1;
      this.rareWin = false;
      this.spinning = true;
      this._skip = false;
      const t0 = performance.now();
      // a rare result creeps over the last slices before it stops
      const pw = opts.rare ? 5.4 : 3.8;
      const ease = x => 1 - Math.pow(1 - x, pw);
      return new Promise(resolve => {
        const step = now => {
          let x = Math.min(1, (now - t0) / dur);
          if (this._skip) x = 1;
          this.rot = r0 + (r1 - r0) * ease(x);
          const i = this.indexAt(this.rot);
          if (i !== this._lastIdx) {
            this._lastIdx = i;
            if (this.onLabel) this.onLabel(this.entries[i], i, false);
            // a gentle flick at most every 70 ms, softer while the wheel is still fast
            if (now - this._lastTick > 70 && !this._skip) {
              this._lastTick = now;
              this.kick = 0.35 + 0.65 * x;
              if (this.onTick) this.onTick(i, 1 - x);
            }
          }
          this.kick *= 0.7;
          if (x < 1) {
            const gap = FW.frameGap ? FW.frameGap() : 0;
            if (!gap || now - (this._lastDraw || 0) >= gap) {
              this._lastDraw = now;
              this.draw();
            }
            this._raf = requestAnimationFrame(step);
          } // frame limit from Options
          else {
            this.rot = r1 % TAU;
            this.spinning = false;
            this.focus = idx;
            this.kick = 0;
            this._lastIdx = idx;
            this.rareWin = !!opts.rare;
            if (this.onLabel) this.onLabel(this.entries[idx], idx, true);
            this.draw();
            this.flashWin(opts.rare);
            resolve(idx);
          }
        };
        this._raf = requestAnimationFrame(step);
      });
    }
  }
  FW.Wheel = Wheel;
})(typeof window !== 'undefined' ? window : globalThis);
