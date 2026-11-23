/* Destiny Unbound: particles for legendary results (159). A short burst over the wheel when a rare slice lands, and
   over the card when a Mythic (or higher) hero is revealed, matched to the theme: embers for the Ashen Crown, stars for
   the Astral Oracle, sparks for the Iron Litany, ash and blood drops under the Blood Moon, petals in the Verdant Wild.
   Only with animations fully on and glow allowed (Options > Accessibility); it never blocks a click.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW;
  if (typeof document === 'undefined') return;
  const LOOKS = ['ashen', 'astral', 'iron', 'bloodmoon', 'wild'];
  const KIND = {
    ashen: { colors: ['#ffb35c', '#ff7a1a', '#ffd28a', '#fff0c8'], shape: 'dot', grav: -0.05, speed: 4.2 },
    astral: { colors: ['#ffffff', '#cfe3ff', '#a9c7ff', '#ffe9a8'], shape: 'star', grav: 0, speed: 3.6 },
    iron: { colors: ['#ffcf6a', '#ff9a3c', '#fff2c4'], shape: 'spark', grav: 0.16, speed: 6 },
    bloodmoon: { colors: ['#b0303a', '#7a121c', '#c9b8b8', '#9a8a8a'], shape: 'dot', grav: 0.07, speed: 3.8 },
    wild: { colors: ['#f6b8d0', '#ffe3ef', '#c6f26a', '#e8f78a'], shape: 'petal', grav: 0.035, speed: 3.4 },
  };
  FW.BURST_KINDS = KIND;
  const on = () => (!FW.motion || FW.motion() === 'full') && (!FW.glowOn || FW.glowOn());
  /* the look for a theme: one of the five, or the base a custom theme is built on */
  function lookOf(theme) {
    const th = (FW.THEMES && FW.THEMES[theme]) || {};
    const k = LOOKS.indexOf(theme) >= 0 ? theme : th.base;
    return LOOKS.indexOf(k) >= 0 ? k : 'ashen';
  }
  FW.burstLook = lookOf;
  /* a burst centred on el. opts: theme, n (particles), spread (how far, in element widths) */
  FW.burst = function (el, opts) {
    opts = opts || {};
    if (!el || !on() || typeof requestAnimationFrame !== 'function') return false;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const k = KIND[lookOf(opts.theme || (window.FWApp && window.FWApp.state.theme))];
    const d = Math.min(2, window.devicePixelRatio || 1),
      pad = Math.max(r.width, r.height) * 0.6,
      W = r.width + pad * 2,
      Hh = r.height + pad * 2;
    const cv = document.createElement('canvas');
    cv.className = 'burst-fx';
    cv.setAttribute('aria-hidden', 'true');
    cv.width = Math.round(W * d);
    cv.height = Math.round(Hh * d);
    Object.assign(cv.style, {
      position: 'fixed',
      left: r.left - pad + 'px',
      top: r.top - pad + 'px',
      width: W + 'px',
      height: Hh + 'px',
      pointerEvents: 'none',
      zIndex: 40,
    });
    document.body.appendChild(cv);
    const c = cv.getContext('2d'),
      s = (Math.min(r.width, r.height) / 360) * d,
      cx = cv.width / 2,
      cy = cv.height / 2,
      n = opts.n || 70,
      parts = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2,
        v = k.speed * (0.35 + Math.random() * 0.9) * (opts.spread || 1);
      parts.push({
        x: cx + Math.cos(a) * 20 * s,
        y: cy + Math.sin(a) * 20 * s,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - (k.grav < 0 ? 0.6 : 0),
        r: (1.4 + Math.random() * 2.4) * s,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        color: k.colors[Math.floor(Math.random() * k.colors.length)],
        life: 0.75 + Math.random() * 0.5,
      });
    }
    const t0 = performance.now(),
      DUR = 1700;
    let prev = t0;
    const draw = p => {
      c.fillStyle = p.color;
      c.strokeStyle = p.color;
      if (k.shape === 'spark') {
        c.lineWidth = Math.max(1, p.r * 0.5);
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(p.x - p.vx * 3 * s, p.y - p.vy * 3 * s);
        c.stroke();
      } else if (k.shape === 'petal') {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.beginPath();
        c.ellipse(0, 0, p.r * 1.8, p.r * 0.8, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      } else if (k.shape === 'star') {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.beginPath();
        for (let j = 0; j < 8; j++) {
          const rr = j % 2 ? p.r * 0.4 : p.r * 1.6,
            a = (j / 8) * Math.PI * 2;
          c.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr);
        }
        c.closePath();
        c.fill();
        c.restore();
      } else {
        c.beginPath();
        c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        c.fill();
      }
    };
    const step = now => {
      const x = (now - t0) / DUR,
        dt = Math.min(50, now - prev) / 16.7;
      prev = now;
      if (x >= 1 || !cv.isConnected) return cv.remove();
      c.clearRect(0, 0, cv.width, cv.height);
      c.shadowBlur = 8 * s;
      parts.forEach(p => {
        p.vx *= Math.pow(0.97, dt);
        p.vy = p.vy * Math.pow(0.97, dt) + k.grav * dt;
        if (k.shape === 'petal') p.vx += Math.sin(now / 260 + p.rot) * 0.03 * dt;
        p.x += p.vx * dt * s;
        p.y += p.vy * dt * s;
        p.rot += p.spin * dt;
        c.globalAlpha = Math.max(0, Math.min(1, (p.life - x) / 0.35));
        c.shadowColor = p.color;
        draw(p);
      });
      c.globalAlpha = 1;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return true;
  };
})();
