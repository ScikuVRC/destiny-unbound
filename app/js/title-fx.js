/* Destiny Unbound: moving title screens (167). A slow drift over the painted title art and a few particles that suit
   each look: embers rising from the Ashen Crown, stars twinkling over the Astral Oracle, sparks falling in the Iron
   Litany, ash drifting under the Blood Moon, fireflies wandering in the Verdant Wild. Only with animations fully on
   (Options > Accessibility), only while the title screen is showing, and never while the window is hidden.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    App = window.FWApp;
  if (!App || typeof document === 'undefined') return;
  const KINDS = {
    ashen: { n: 34, colors: ['#ffb35c', '#ff7a1a', '#ffd28a'], rise: 1, size: [1.2, 2.8], drift: 0.25, twinkle: 0 },
    astral: { n: 46, colors: ['#ffffff', '#cfe3ff', '#a9c7ff'], rise: 0, size: [0.8, 2], drift: 0.03, twinkle: 1 },
    iron: { n: 26, colors: ['#ffcf6a', '#ff9a3c', '#fff2c4'], rise: -1.6, size: [0.8, 1.8], drift: 0.5, twinkle: 0 },
    bloodmoon: {
      n: 30,
      colors: ['#9a8a8a', '#c9b8b8', '#b0303a'],
      rise: -0.45,
      size: [1, 2.6],
      drift: 0.35,
      twinkle: 0,
    },
    wild: { n: 24, colors: ['#e8f78a', '#c6f26a', '#fff6a8'], rise: 0.1, size: [1.4, 2.6], drift: 0.6, twinkle: 1 },
  };
  FW.TITLE_FX = KINDS;
  const on = () => (!FW.motion || FW.motion() === 'full') && (!FW.glowOn || FW.glowOn());
  let cv = null,
    ctx = null,
    look = '',
    parts = [],
    raf = 0,
    last = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function spawn(k, w, h, anywhere) {
    const c = KINDS[k];
    return {
      x: Math.random() * w,
      y: anywhere || c.rise === 0 ? Math.random() * h : c.rise > 0 ? h + 10 : -10,
      r: rnd(c.size[0], c.size[1]),
      vx: rnd(-c.drift, c.drift),
      vy: -c.rise * rnd(0.25, 0.7),
      color: c.colors[Math.floor(Math.random() * c.colors.length)],
      ph: Math.random() * Math.PI * 2,
      life: rnd(0.6, 1),
    };
  }
  function attach() {
    const scr = document.querySelector('#screen-title .tscr'),
      layer = scr && scr.querySelector('.fxlayer');
    if (!layer) return false;
    const k = scr.dataset.look;
    scr.classList.toggle('moving', on());
    if (!KINDS[k]) return false;
    if (cv && cv.isConnected && look === k) return true;
    cv = document.createElement('canvas');
    cv.className = 'title-fx';
    cv.setAttribute('aria-hidden', 'true');
    layer.appendChild(cv);
    ctx = cv.getContext('2d');
    look = k;
    size();
    parts = [];
    for (let i = 0; i < KINDS[k].n; i++) parts.push(spawn(k, cv.width, cv.height, true));
    return true;
  }
  function size() {
    if (!cv) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(window.innerWidth * d);
    cv.height = Math.round(window.innerHeight * d);
  }
  function frame(now) {
    raf = 0;
    if (App.state.screen !== 'title' || document.hidden || !on()) {
      if (cv) ctx.clearRect(0, 0, cv.width, cv.height);
      const scr = document.querySelector('#screen-title .tscr');
      if (scr) scr.classList.toggle('moving', on());
      return; // started again by start() when the title shows or the window comes back
    }
    if (!attach()) return;
    const dt = Math.min(50, now - (last || now)) / 16.7;
    last = now;
    const w = cv.width,
      h = cv.height,
      c = KINDS[look],
      s = w / 1280;
    ctx.clearRect(0, 0, w, h);
    parts.forEach((p, i) => {
      p.ph += 0.03 * dt;
      p.x += (p.vx + Math.sin(p.ph) * c.drift * 0.4) * dt * s;
      p.y += p.vy * dt * s;
      const a = c.twinkle ? 0.35 + 0.65 * Math.abs(Math.sin(p.ph * (c.rise === 0 ? 0.6 : 1.4))) : p.life;
      if (p.y < -20 || p.y > h + 20 || p.x < -20 || p.x > w + 20) parts[i] = spawn(look, w, h, false);
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6 * s;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * s * 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  const prev = App.hooks.screenShown;
  App.hooks.screenShown = name => {
    if (prev) prev(name);
    if (name === 'title') setTimeout(start, 50);
  };
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => !document.hidden && start());
  // the title is often the first screen, and the theme or Options can rebuild it: look again now and then
  setInterval(() => App.state.screen === 'title' && start(), 1500);
  start();
})();
