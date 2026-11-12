/* FATEWHEEL wheel renderer + spin physics + audio. Browser only. */
(function (g) {
  const FW = g.FW = g.FW || {};
  const TAU = Math.PI * 2;

  /* ---------------- themes (wheel side; page side lives in css/themes.css) ---------------- */
  FW.THEMES = {
    classic:  { name: 'Classic Night',  ring: '#0e0e0e', ringHi: '#2b2b2b', ringW: 0.05, hub: '#171717', hubRing: '#555', pointer: '#0a0a0a', pointerEdge: '#2a2a2a', sat: 74, lMul: 1.1, font: '"Segoe UI", Inter, system-ui, sans-serif', weight: '600', glow: null, stroke: 'rgba(0,0,0,.28)', dim: 0.5, studs: false },
    gilded:   { name: 'Gilded Arcana',  ring: '#2b1d07', ringHi: '#e3bd62', ringW: 0.065, hub: '#1c1408', hubRing: '#e3bd62', pointer: '#e3bd62', pointerEdge: '#7a5b17', sat: 58, lMul: 1.0, font: '"Palatino Linotype", "Book Antiqua", Georgia, serif', weight: '600', glow: 'rgba(227,189,98,.35)', stroke: 'rgba(40,25,5,.55)', dim: 0.55, studs: true },
    neon:     { name: 'Neon Arcade',    ring: '#06060f', ringHi: '#00e5ff', ringW: 0.045, hub: '#0a0a1c', hubRing: '#ff2bd6', pointer: '#ff2bd6', pointerEdge: '#ffffff', sat: 96, lMul: 1.05, font: 'Bahnschrift, "Segoe UI", system-ui, sans-serif', weight: '700', glow: 'rgba(0,229,255,.55)', stroke: 'rgba(0,0,20,.7)', dim: 0.6, studs: true },
    grimoire: { name: 'Old Grimoire',   ring: '#3a2716', ringHi: '#a98a5b', ringW: 0.055, hub: '#2a1c10', hubRing: '#c9a86b', pointer: '#7b1e1e', pointerEdge: '#2a1010', sat: 42, lMul: 1.12, font: 'Georgia, "Times New Roman", serif', weight: '700', glow: null, stroke: 'rgba(50,30,10,.45)', dim: 0.45, studs: false }
  };

  const hsl = (h, s, l) => 'hsl(' + ((h % 360 + 360) % 360).toFixed(1) + ',' + s.toFixed(1) + '%,' + l.toFixed(1) + '%)';

  /* slice colour: returns {fill, light} */
  FW.sliceColor = function (style, i, n, entry, theme) {
    if (entry && entry.color) return { fill: entry.color, light: entry.colorLight != null ? entry.colorLight : 40 };
    if (entry && entry.gray) return { fill: i % 2 ? '#2a2a2e' : '#323236', light: 20, gray: true };
    const none = entry && entry.dsl && /(^|\s)none(\s|$)/.test(entry.dsl);
    if (none) return { fill: '#070707', light: 4 };
    const S = theme.sat, lm = theme.lMul;
    if (style.mode === 'ladder' || style.mode === 'gradient') {
      const r = n > 1 ? i / (n - 1) : 0;
      if (i === n - 1) return { fill: hsl(style.hue, S * 0.7, 5), light: 5 };
      const L = (80 - r * 62) * lm;
      return { fill: hsl(style.hue, S, L), light: L };
    }
    if (style.mode === 'stripe' || style.mode === 'ladderish') {
      const L = (i % 2 ? 31 : 40) * lm + (i % 5 === 0 ? 4 : 0);
      return { fill: hsl(style.hue + (i % 3) * 2, S * 0.85, L), light: L };
    }
    const hue = (style.hue + i * 137.508) % 360;
    const L = (44 + (i % 3) * 4) * lm;
    return { fill: hsl(hue, S, L), light: L };
  };

  class Wheel {
    constructor(canvas, themeName) {
      this.cv = canvas; this.ctx = canvas.getContext('2d');
      this.theme = FW.THEMES[themeName || 'classic'];
      this.entries = []; this.style = { mode: 'cat', hue: 0 };
      this.rot = 0; this.focus = -1; this.kick = 0; this.spinning = false;
      this.onTick = null; this.onLabel = null; this.size = 0; this.dpr = 1;
      this.off = document.createElement('canvas');
      this.cum = [0, 1];
      this._raf = 0; this._skip = false; this._lastIdx = -1; this._lastTick = 0;
      this.resize();
      if (typeof ResizeObserver !== 'undefined') { this._ro = new ResizeObserver(() => { this.resize(); }); this._ro.observe(canvas.parentElement || canvas); }
    }
    setTheme(name) { this.theme = FW.THEMES[name] || FW.THEMES.classic; this.buildFace(); this.draw(); }
    setEntries(entries, style) {
      this.entries = entries; this.style = style || this.style;
      // dw = drawn size (greyed-out slices stay visible but can never be landed on: w = 0)
      const sz = e => (e.dw != null ? e.dw : e.w);
      const tot = entries.reduce((a, e) => a + sz(e), 0) || 1;
      this.cum = [0]; entries.forEach(e => this.cum.push(this.cum[this.cum.length - 1] + sz(e) / tot));
      this.cum[this.cum.length - 1] = 1;
      this.focus = -1; this._lastIdx = -1;
      this.buildFace(); this.draw();
    }
    resize() {
      const w = this.cv.clientWidth || (this.cv.parentElement && this.cv.parentElement.clientWidth) || 320;
      const dpr = Math.min(3, g.devicePixelRatio || 1);
      if (Math.abs(w - this.size) < 1 && dpr === this.dpr && this.cv.width) return;
      this.size = w; this.dpr = dpr;
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(w * dpr);
      this.off.width = this.cv.width; this.off.height = this.cv.height;
      this.buildFace(); this.draw();
    }
    geometry() {
      const S = this.size, pad = this.theme.glow ? S * 0.025 : S * 0.008;
      const R = S / 2 - pad, ringW = this.theme.ringW * R;
      return { S, cx: S / 2, cy: S / 2, R, Rs: R - ringW * 0.92, ringW, hubR: R * 0.17 };
    }
    /* static face: slices + labels, slice 0 starts at 12 o'clock going clockwise */
    buildFace() {
      if (!this.size) return;
      const c = this.off.getContext('2d'); const d = this.dpr; const G = this.geometry(); const th = this.theme;
      c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, G.S, G.S);
      const n = this.entries.length; if (!n) return;
      const dense = n > 70;
      for (let i = 0; i < n; i++) {
        const a0 = -Math.PI / 2 + this.cum[i] * TAU, a1 = -Math.PI / 2 + this.cum[i + 1] * TAU;
        const col = FW.sliceColor(this.style, i, n, this.entries[i], th);
        this.entries[i]._light = col.light;
        c.beginPath(); c.moveTo(G.cx, G.cy); c.arc(G.cx, G.cy, G.Rs, a0, a1); c.closePath();
        c.fillStyle = col.fill; c.fill();
        if (n <= 120) { c.lineWidth = dense ? 0.5 : 1.1; c.strokeStyle = th.stroke; c.stroke(); }
      }
      // labels
      const sizeBoost = n <= 8 ? 1.7 : n <= 14 ? 1.4 : n <= 28 ? 1.12 : 1;
      for (let i = 0; i < n; i++) {
        const e = this.entries[i]; const ang = (this.cum[i + 1] - this.cum[i]) * TAU;
        const mid = -Math.PI / 2 + (this.cum[i] + this.cum[i + 1]) / 2 * TAU;
        const arcPx = ang * G.Rs * 0.52;
        let fs = Math.min(arcPx * 0.82, G.Rs * 0.088 * sizeBoost);
        if (fs < 3.6) continue;
        const avail = G.Rs * 0.93 - G.hubR * 1.25;
        c.save(); c.translate(G.cx, G.cy); c.rotate(mid + Math.PI);
        c.font = th.weight + ' ' + fs.toFixed(1) + 'px ' + th.font;
        let label = FW.t ? FW.t(e.name) : e.name;
        let wd = c.measureText(label).width;
        if (wd > avail) { fs = Math.max(3.6, fs * avail / wd); c.font = th.weight + ' ' + fs.toFixed(1) + 'px ' + th.font; wd = c.measureText(label).width; if (wd > avail * 1.04) { const cut = Math.floor(label.length * avail / wd) - 1; label = label.slice(0, Math.max(3, cut)) + '…'; } }
        if (fs < 3.6) { c.restore(); continue; }
        c.textBaseline = 'middle'; c.textAlign = 'left';
        const light = e._light > 62;
        c.fillStyle = e.gray ? 'rgba(255,255,255,.38)' : light ? 'rgba(20,16,10,.92)' : 'rgba(255,255,255,.96)';
        if (!light && fs > 7) { c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 2; }
        c.fillText(label, -(G.Rs - G.Rs * 0.045), 0);
        c.restore();
      }
    }
    indexAt(rot) {
      const phi = (((-rot) % TAU) + TAU) % TAU / TAU;
      let lo = 0, hi = this.entries.length - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.cum[m] <= phi) lo = m; else hi = m - 1; }
      return lo;
    }
    draw() {
      if (!this.size) return;
      const ctx = this.ctx, d = this.dpr, G = this.geometry(), th = this.theme;
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, G.S, G.S);
      // glow + ring
      ctx.save();
      if (th.glow) { ctx.shadowColor = th.glow; ctx.shadowBlur = G.S * 0.05; }
      ctx.beginPath(); ctx.arc(G.cx, G.cy, G.R, 0, TAU); ctx.fillStyle = th.ring; ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(G.cx, G.cy, G.R - 0.5, 0, TAU); ctx.lineWidth = Math.max(1, G.S * 0.004); ctx.strokeStyle = th.ringHi; ctx.stroke();
      // rotated face
      if (this.entries.length) {
        ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(this.rot); ctx.drawImage(this.off, -G.cx, -G.cy, G.S, G.S);
        if (this.focus >= 0) {
          const a0 = -Math.PI / 2 + this.cum[this.focus] * TAU, a1 = -Math.PI / 2 + this.cum[this.focus + 1] * TAU;
          // dim everything except the winner
          ctx.beginPath(); ctx.arc(0, 0, G.Rs, 0, TAU); ctx.moveTo(0, 0); ctx.arc(0, 0, G.Rs, a0, a1); ctx.closePath();
          ctx.fillStyle = 'rgba(0,0,0,' + th.dim + ')'; ctx.fill('evenodd');
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, G.Rs, a0, a1); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill();
        }
        ctx.restore();
      }
      // studs on ring
      if (th.studs) { const k = 24; for (let i = 0; i < k; i++) { const a = i / k * TAU + this.rot * 0.0; ctx.beginPath(); ctx.arc(G.cx + Math.cos(a) * (G.R - G.ringW / 2), G.cy + Math.sin(a) * (G.R - G.ringW / 2), Math.max(1.2, G.ringW * 0.16), 0, TAU); ctx.fillStyle = th.ringHi; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; } }
      // hub
      ctx.beginPath(); ctx.arc(G.cx, G.cy, G.hubR, 0, TAU); ctx.fillStyle = th.hub; ctx.fill();
      ctx.lineWidth = Math.max(1.5, G.hubR * 0.08); ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(G.cx, G.cy, G.hubR * 0.52, 0, TAU); ctx.lineWidth = G.hubR * 0.16; ctx.strokeStyle = th.hubRing; ctx.stroke();
      // pointer (teardrop on the hub, tip pointing up into the wheel)
      ctx.save(); ctx.translate(G.cx, G.cy); ctx.rotate(this.kick * 0.28);
      const tipY = -(G.hubR + G.R * 0.14), baseW = G.hubR * 0.62;
      ctx.beginPath(); ctx.moveTo(0, tipY); ctx.bezierCurveTo(baseW * 0.25, tipY + G.R * 0.07, baseW, -G.hubR * 0.7, baseW, -G.hubR * 0.35); ctx.lineTo(-baseW, -G.hubR * 0.35); ctx.bezierCurveTo(-baseW, -G.hubR * 0.7, -baseW * 0.25, tipY + G.R * 0.07, 0, tipY); ctx.closePath();
      ctx.fillStyle = th.pointer; ctx.fill(); ctx.lineWidth = Math.max(1, G.S * 0.004); ctx.strokeStyle = th.pointerEdge; ctx.stroke();
      ctx.restore();
    }
    /* put slice idx centred under the pointer without animating */
    showResult(idx, frac) {
      const f = frac == null ? 0.5 : frac;
      const a = (this.cum[idx] + (this.cum[idx + 1] - this.cum[idx]) * f) * TAU;
      this.rot = ((-a) % TAU + TAU) % TAU; this.focus = idx; this._lastIdx = idx; this.draw();
    }
    clearFocus() { this.focus = -1; this.draw(); }
    skip() { this._skip = true; }
    /* animate to slice idx; resolves with idx when stopped */
    spinTo(idx, opts) {
      opts = opts || {};
      cancelAnimationFrame(this._raf);
      const rng = opts.rng || Math.random;
      const dur = Math.max(250, (opts.duration || 4600));
      const turns = opts.turns != null ? opts.turns : (5 + Math.floor(rng() * 3));
      const frac = 0.1 + rng() * 0.8;
      const alpha = (this.cum[idx] + (this.cum[idx + 1] - this.cum[idx]) * frac) * TAU;
      const r0 = this.rot;
      const delta = ((((-alpha - r0) % TAU) + TAU) % TAU);
      const r1 = r0 + turns * TAU + delta;
      this.focus = -1; this.spinning = true; this._skip = false;
      const t0 = performance.now();
      const ease = x => 1 - Math.pow(1 - x, 3.8);
      return new Promise(resolve => {
        const step = now => {
          let x = Math.min(1, (now - t0) / dur);
          if (this._skip) x = 1;
          this.rot = r0 + (r1 - r0) * ease(x);
          const i = this.indexAt(this.rot);
          if (i !== this._lastIdx) {
            this._lastIdx = i;
            if (this.onLabel) this.onLabel(this.entries[i], i, false);
            if (now - this._lastTick > 26 && !this._skip) { this._lastTick = now; this.kick = 1; if (this.onTick) this.onTick(i, 1 - x); }
          }
          this.kick *= 0.82;
          if (x < 1) { this.draw(); this._raf = requestAnimationFrame(step); }
          else {
            this.rot = r1 % TAU; this.spinning = false; this.focus = idx; this.kick = 0; this._lastIdx = idx;
            if (this.onLabel) this.onLabel(this.entries[idx], idx, true);
            this.draw(); resolve(idx);
          }
        };
        this._raf = requestAnimationFrame(step);
      });
    }
  }
  FW.Wheel = Wheel;

  /* ---------------- audio (WebAudio, no files) ---------------- */
  const A = FW.Audio = { on: true, ctx: null };
  A.init = function () { if (!A.ctx) { try { A.ctx = new (g.AudioContext || g.webkitAudioContext)(); } catch (e) { A.ctx = null; } } if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); };
  A.tone = function (f, d, type, vol, when) {
    if (!A.on || !A.ctx) return; const c = A.ctx; const t = c.currentTime + (when || 0);
    const o = c.createOscillator(), gn = c.createGain(); o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.005); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(gn); gn.connect(c.destination); if (A.recDest) gn.connect(A.recDest); o.start(t); o.stop(t + d + 0.02);
  };
  A.tick = function (speed) { A.tone(900 + 700 * (speed == null ? 1 : speed), 0.035, 'square', 0.025); };
  A.reveal = function (rare) { const base = rare ? 523 : 392; [0, 0.09, 0.18].forEach((w, i) => A.tone(base * Math.pow(1.26, i), 0.28, 'triangle', 0.06, w)); if (rare) A.tone(1568, 0.6, 'sine', 0.05, 0.28); };
  A.bad = function () { A.tone(180, 0.35, 'sawtooth', 0.05); A.tone(130, 0.5, 'sawtooth', 0.05, 0.12); };
  A.click = function () { A.tone(660, 0.05, 'triangle', 0.04); };
})(typeof window !== 'undefined' ? window : globalThis);
