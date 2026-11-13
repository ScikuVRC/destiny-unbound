/* Destiny Unbound player preferences: graphics, audio extras, accessibility and key bindings.
   Loaded early so the wheel, audio and pages all read the same settings. The Options screen (options.js) edits them.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW = g.FW || {};
  const KEY = 'fw.prefs';
  const DEFAULTS = {
    display: 'windowed',      // windowed | maximized | fullscreen (desktop app)
    res: '1280x720',          // window size in windowed mode (desktop app)
    uiScale: 100,             // % zoom of the whole interface
    fps: 0,                   // frame limit for the wheel: 0 = match the display
    vsync: true,              // desktop app, applies after a restart
    anim: 'full',             // full | reduced | off
    quality: 'high',          // wheel sharpness: low | medium | high
    glow: true,               // glows, embers, stars and shadows
    uiVol: 0.6,               // interface clicks
    muteBg: true,             // silence the game when its window is not in focus
    captions: false,          // show what each sound means
    textSize: 100,            // % text size
    contrast: false,          // high-contrast colours
    reduceMotion: false,      // no flashing, shaking or sliding
    cbSafe: false,            // colour-blind-safe wheel slices
    discord: true,            // desktop app: show what you're playing in your Discord status (Rich Presence)
    keys: { advance: ' ', next: 'Enter', back: 'Escape', respin: 'r', auto: 'a', options: 'o', menu: 'm' }
  };
  FW.PREF_DEFAULTS = DEFAULTS;
  function load() {
    let p = {}; try { p = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { p = {}; }
    const out = Object.assign({}, DEFAULTS, p); out.keys = Object.assign({}, DEFAULTS.keys, p.keys || {});
    return out;
  }
  const P = FW.prefs = load();
  FW.savePrefs = function () { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* private mode */ } };
  FW.setPref = function (k, v) { P[k] = v; FW.savePrefs(); FW.applyPrefs(); if (FW.onPref) FW.onPref(k, v); };
  FW.resetPrefs = function () { Object.keys(P).forEach(k => delete P[k]); Object.assign(P, JSON.parse(JSON.stringify(DEFAULTS))); FW.savePrefs(); FW.applyPrefs(); };

  /* what the rest of the game asks */
  FW.motion = () => (P.reduceMotion && P.anim === 'full' ? 'reduced' : P.anim);
  FW.spinDuration = speed => ({ off: 250, reduced: 1200 }[FW.motion()] || (speed === 'fast' ? 2300 : 4600));
  FW.frameGap = () => (P.fps > 0 ? 1000 / P.fps - 1 : 0);
  FW.maxDpr = () => ({ low: 1, medium: 1.5 }[P.quality] || 3);
  FW.glowOn = () => P.glow !== false;
  FW.CB_PAL = [['#0072b2', '#005a8c'], ['#e69f00', '#c78800'], ['#009e73', '#007a59'], ['#cc79a7', '#a95f8a'], ['#56b4e9', '#3d9bd0'], ['#d55e00', '#b04d00'], ['#f0e442', '#d4c82e']];

  FW.applyPrefs = function () {
    const b = g.document && g.document.body; if (!b) return;
    const m = FW.motion();
    b.classList.toggle('anim-reduced', m === 'reduced'); b.classList.toggle('anim-off', m === 'off');
    b.classList.toggle('no-glow', !FW.glowOn()); b.classList.toggle('hc', !!P.contrast); b.classList.toggle('calm', !!P.reduceMotion);
    g.document.documentElement.style.setProperty('--text-scale', (P.textSize || 100) / 100);
    // UI scale: the desktop app zooms the whole window; the browser uses CSS zoom
    const z = (P.uiScale || 100) / 100;
    if (g.fatewheelDesktop && g.fatewheelDesktop.setZoom) { g.fatewheelDesktop.setZoom(z); g.document.documentElement.style.zoom = ''; }
    else g.document.documentElement.style.zoom = z === 1 ? '' : z;
  };
  if (g.document) {
    if (g.document.body) FW.applyPrefs(); else g.document.addEventListener('DOMContentLoaded', FW.applyPrefs);
  }
})(typeof window !== 'undefined' ? window : globalThis);
