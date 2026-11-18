/* Destiny Unbound player preferences: graphics, audio extras, accessibility and key bindings.
   Loaded early so the wheel, audio and pages all read the same settings. The Options screen (options.js) edits them.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const KEY = 'fw.prefs';
  const DEFAULTS = {
    display: 'windowed', // windowed | maximized | fullscreen (desktop app)
    res: '1280x720', // window size in windowed mode (desktop app)
    uiScale: 100, // % zoom of the whole interface
    fps: 0, // frame limit for the wheel: 0 = match the display
    vsync: true, // desktop app, applies after a restart
    anim: 'full', // full | reduced | off
    autoPause: 3, // seconds Auto waits on each result before moving on
    quality: 'high', // wheel sharpness: low | medium | high
    glow: true, // glows, embers, stars and shadows
    wheelSkin: true, // painted rim and hub on the wheel (art/skins)
    emojiIcons: false, // show emoji instead of the game's drawn icons
    uiVol: 0.6, // interface clicks
    muteBg: true, // silence the game when its window is not in focus
    captions: false, // show what each sound means
    hdMusic: null, // recorded music tracks (data/music.js) instead of synthesized music; null = not asked yet
    textSize: 100, // % text size
    contrast: false, // high-contrast colours
    easyRead: false, // a plain, evenly spaced font for all text, with more space between letters, words and lines
    reduceMotion: false, // no flashing, shaking or sliding
    cbSafe: false, // colour-blind-safe wheel slices
    discord: true, // desktop app: show what you're playing in your Discord status (Rich Presence)
    errorAsk: true, // offer to send an error report when something goes wrong (nothing is sent without a click)
    keys: { advance: ' ', next: 'Enter', back: 'Escape', respin: 'r', auto: 'a', options: 'o', menu: 'm' },
  };
  FW.PREF_DEFAULTS = DEFAULTS;
  function load() {
    let p = {};
    try {
      p = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch (e) {
      p = {};
    }
    const out = Object.assign({}, DEFAULTS, p);
    out.keys = Object.assign({}, DEFAULTS.keys, p.keys || {});
    return out;
  }
  const P = (FW.prefs = load());
  FW.savePrefs = function () {
    if (FW.Save) return FW.Save.write(KEY, JSON.stringify(P));
    try {
      localStorage.setItem(KEY, JSON.stringify(P));
    } catch (e) {
      /* storage blocked */
    }
  };
  FW.setPref = function (k, v) {
    P[k] = v;
    FW.savePrefs();
    FW.applyPrefs();
    if (FW.onPref) FW.onPref(k, v);
  };
  FW.resetPrefs = function () {
    Object.keys(P).forEach(k => delete P[k]);
    Object.assign(P, JSON.parse(JSON.stringify(DEFAULTS)));
    FW.savePrefs();
    FW.applyPrefs();
  };

  /* what the rest of the game asks */
  FW.motion = () => (P.reduceMotion && P.anim === 'full' ? 'reduced' : P.anim);
  FW.spinDuration = speed => ({ off: 250, reduced: 1200 })[FW.motion()] || (speed === 'fast' ? 2300 : 4600);
  FW.frameGap = () => (P.fps > 0 ? 1000 / P.fps - 1 : 0);
  FW.maxDpr = () => ({ low: 1, medium: 1.5 })[P.quality] || 3;
  FW.glowOn = () => P.glow !== false;
  FW.CB_PAL = [
    ['#0072b2', '#005a8c'],
    ['#e69f00', '#c78800'],
    ['#009e73', '#007a59'],
    ['#cc79a7', '#a95f8a'],
    ['#56b4e9', '#3d9bd0'],
    ['#d55e00', '#b04d00'],
    ['#f0e442', '#d4c82e'],
  ];

  FW.applyPrefs = function () {
    const b = g.document && g.document.body;
    if (!b) return;
    const m = FW.motion();
    b.classList.toggle('anim-reduced', m === 'reduced');
    b.classList.toggle('anim-off', m === 'off');
    b.classList.toggle('no-glow', !FW.glowOn());
    b.classList.toggle('hc', !!P.contrast);
    b.classList.toggle('easy-read', !!P.easyRead);
    b.classList.toggle('calm', !!P.reduceMotion);
    g.document.documentElement.style.setProperty('--text-scale', (P.textSize || 100) / 100);
    // UI scale: the desktop app zooms the whole window; the browser uses CSS zoom
    const z = (P.uiScale || 100) / 100;
    if (g.fatewheelDesktop && g.fatewheelDesktop.setZoom) {
      // the window's zoom lands a moment later and doesn't always send a resize, so measure again once it has
      const p = g.fatewheelDesktop.setZoom(z);
      if (p && p.then)
        p.then(
          () => setTimeout(applyZoom, 30),
          () => 0
        );
    }
    applyZoom();
  };
  // The interface is laid out for about 1440x810. On bigger windows (1920x1080, 1440p, 4K) everything grows with the
  // window, so text keeps the same share of the screen; the player's UI scale multiplies on top. CSS zoom on <html>
  // doesn't change innerWidth, so this never feeds back into itself.
  const BASE_W = 1440,
    BASE_H = 810;
  FW.autoScale = function () {
    const z = (P.uiScale || 100) / 100,
      desktop = !!(g.fatewheelDesktop && g.fatewheelDesktop.setZoom);
    // measured on the real window, so the player's UI scale still makes everything bigger or smaller on top
    // (the desktop app's zoom shrinks innerWidth; CSS zoom in the browser doesn't)
    const W = desktop ? g.innerWidth * z : g.innerWidth,
      H = desktop ? g.innerHeight * z : g.innerHeight;
    if (!W || !H || W < 900) return 1; // phones and small windows keep their own layouts
    return Math.max(1, Math.min(3, W / BASE_W, H / BASE_H));
  };
  // the zoom on <html> right now (the wheel draws its canvas this much sharper)
  FW.pageZoom = () => parseFloat(g.document && g.document.documentElement.style.zoom) || 1;
  function applyZoom() {
    const d = g.document && g.document.documentElement;
    if (!d) return;
    const desktop = !!(g.fatewheelDesktop && g.fatewheelDesktop.setZoom),
      z = desktop ? 1 : (P.uiScale || 100) / 100,
      total = Math.round(z * FW.autoScale() * 1000) / 1000;
    const next = total === 1 ? '' : String(total);
    // CSS zoom doesn't shrink vw/vh, so the stylesheets read these instead (base.css); unzoomed, the real units apply
    if (total === 1) ['--vw', '--vh', '--dvh'].forEach(k => d.style.removeProperty(k));
    else {
      const vw = g.innerWidth / total / 100 + 'px',
        vh = g.innerHeight / total / 100 + 'px';
      d.style.setProperty('--vw', vw);
      d.style.setProperty('--vh', vh);
      d.style.setProperty('--dvh', vh);
    }
    if (d.style.zoom === next) return;
    d.style.zoom = next;
    // let the wheel, the title menu and the panels re-measure at the new size
    if (g.dispatchEvent && g.Event) g.dispatchEvent(new g.Event('resize'));
  }
  if (g.document) {
    if (g.document.body) FW.applyPrefs();
    else g.document.addEventListener('DOMContentLoaded', FW.applyPrefs);
    let t = 0;
    g.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(applyZoom, 60);
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
