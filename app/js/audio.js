/* FATEWHEEL sound: themed effects and ambient music, all synthesized with WebAudio (no audio files needed).
   Mods can replace any sound with their own file (tick, reveal, rare, bad, click, music) - see mods.js.
   Same API as before: FW.Audio.init(), .tick(speed), .reveal(rare), .bad(), .click(), .on, .recDest
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW = g.FW || {};
  const A = FW.Audio = { on: true, ctx: null, recDest: null, theme: 'ashen', vol: { master: 0.8, sfx: 0.9, music: 0.35 }, custom: {}, _music: null };
  let master = null, sfx = null, mus = null, noiseBuf = null;

  A.init = function () {
    if (!A.ctx) {
      try { A.ctx = new (g.AudioContext || g.webkitAudioContext)(); } catch (e) { A.ctx = null; return; }
      const c = A.ctx;
      master = c.createGain(); sfx = c.createGain(); mus = c.createGain();
      sfx.connect(master); mus.connect(master); master.connect(c.destination);
      noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      A.applyVolume(); A.startMusic();
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
  };
  A.applyVolume = function () {
    if (!A.ctx) return; const t = A.ctx.currentTime;
    master.gain.setTargetAtTime(A.on ? A.vol.master : 0, t, 0.05); sfx.gain.setTargetAtTime(A.vol.sfx, t, 0.05); mus.gain.setTargetAtTime(A.vol.music, t, 0.3);
    if (A.recDest) { try { master.disconnect(A.recDest); } catch (e) { /* not connected */ } master.connect(A.recDest); }
  };
  A.setVolume = function (v) { Object.assign(A.vol, v); A.applyVolume(); if (A.vol.music > 0 && !A._music) A.startMusic(); };
  A.setTheme = function (id) { if (id === A.theme) return; A.theme = id; if (A.ctx) { A.stopMusic(); A.startMusic(); } };
  A.setRecDest = function (d) { if (A.recDest && master) { try { master.disconnect(A.recDest); } catch (e) { /* not connected */ } } A.recDest = d; A.applyVolume(); };

  /* ---------- building blocks ---------- */
  const T = () => A.ctx.currentTime;
  function env(node, t, a, peak, d, end) { node.gain.setValueAtTime(0.0001, t); node.gain.exponentialRampToValueAtTime(peak, t + a); node.gain.exponentialRampToValueAtTime(end || 0.0001, t + a + d); }
  function osc(type, f, t, dur, vol, out, opts) {
    const c = A.ctx, o = c.createOscillator(), gn = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (opts && opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    if (opts && opts.detune) o.detune.value = opts.detune;
    env(gn, t, (opts && opts.a) || 0.005, vol, dur); let last = gn;
    if (opts && opts.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = opts.lp; gn.connect(f2); last = f2; }
    o.connect(gn); last.connect(out || sfx); o.start(t); o.stop(t + (opts && opts.a || 0.005) + dur + 0.05);
  }
  function noise(t, dur, vol, type, freq, q, out) {
    const c = A.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), gn = c.createGain();
    s.buffer = noiseBuf; f.type = type || 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
    env(gn, t, 0.002, vol, dur); s.connect(f); f.connect(gn); gn.connect(out || sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function custom(name) {
    const set = A.custom[A.theme] || {}, all = A.custom['*'] || {}, buf = set[name] || all[name];
    if (!buf) return false;
    const s = A.ctx.createBufferSource(); s.buffer = buf; s.connect(sfx); s.start(); return true;
  }
  const ready = () => A.on && A.ctx && A.ctx.state === 'running';

  /* ---------- themed effects ---------- */
  const FX = {
    ashen: {
      tick(sp) { const t = T(); noise(t, 0.03, 0.09 + 0.05 * sp, 'bandpass', 3200, 4); osc('sine', 1700 + 500 * sp, t, 0.035, 0.025); },
      reveal(rare) { const t = T(); [146.8, 174.6, 220].forEach((f, i) => osc('sawtooth', f, t + i * 0.04, rare ? 1.4 : 0.8, 0.05, null, { lp: 900, a: 0.03 })); osc('sine', 90, t, 0.6, 0.18, null, { to: 45 }); noise(t, 0.25, 0.12, 'lowpass', 300); if (rare) { [587, 880, 1175].forEach((f, i) => osc('triangle', f, t + 0.25 + i * 0.09, 1.2, 0.04)); } },
      bad() { const t = T(); osc('sawtooth', 110, t, 0.9, 0.08, null, { to: 55, lp: 500 }); noise(t, 0.4, 0.08, 'lowpass', 220); }
    },
    tabletop: {
      tick(sp) { const t = T(); noise(t, 0.02, 0.12, 'lowpass', 1400, 1); osc('triangle', 320, t, 0.03, 0.04, null, { to: 220 }); },
      reveal(rare) { const t = T(); [293.7, 370, 440, 587.3].forEach((f, i) => osc('triangle', f, t + i * 0.07, 0.5, 0.07, null, { lp: 2600 })); if (rare) { for (let i = 0; i < 7; i++) noise(t + 0.35 + i * 0.045, 0.03, 0.12, 'bandpass', 2500 + i * 200, 3); [880, 1108.7].forEach((f, i) => osc('triangle', f, t + 0.7 + i * 0.1, 0.8, 0.05)); } },
      bad() { const t = T(); [220, 207.7, 196].forEach((f, i) => osc('triangle', f, t + i * 0.16, 0.5, 0.07, null, { lp: 1500 })); }
    },
    iron: {
      tick(sp) { const t = T(); osc('square', 180 + 60 * sp, t, 0.035, 0.03, null, { lp: 1800 }); noise(t, 0.025, 0.08, 'highpass', 4000, 1); },
      reveal(rare) { const t = T(); [65.4, 130.8, 196, 261.6, 392].forEach(f => osc('sine', f, t, rare ? 2 : 1.2, 0.05, null, { a: 0.06 })); osc('square', 98, t, 0.25, 0.04, null, { lp: 800 }); noise(t, 0.18, 0.14, 'bandpass', 900, 2); if (rare) [523.3, 659.3, 784].forEach((f, i) => osc('sine', f, t + 0.3, 1.8, 0.035, null, { a: 0.4, detune: i * 4 })); },
      bad() { const t = T(); osc('square', 65, t, 1, 0.06, null, { lp: 400 }); [0, 0.2, 0.4].forEach(d => noise(t + d, 0.08, 0.12, 'bandpass', 600, 3)); }
    },
    bloodmoon: {
      tick(sp) { const t = T(); osc('sine', 1320, t, 0.1, 0.02); osc('sine', 1980, t, 0.07, 0.008); },
      reveal(rare) { const t = T(); [220, 261.6, 329.6].forEach((f, i) => osc('sine', f, t, rare ? 2.2 : 1.4, 0.05, null, { a: 0.25, detune: (i - 1) * 6 })); if (rare) [1760, 2093, 2637].forEach((f, i) => osc('sine', f, t + 0.4 + i * 0.18, 1.6, 0.025)); else osc('sine', 880, t + 0.2, 1, 0.02); },
      bad() { const t = T(); [0, 0.22].forEach(d => osc('sine', 55, t + d, 0.25, 0.25, null, { to: 40 })); osc('sine', 233, t + 0.5, 1.5, 0.04, null, { a: 0.3, to: 220 }); }
    }
  };
  const fx = () => FX[A.theme] || FX[(FW.THEMES && FW.THEMES[A.theme] && FW.THEMES[A.theme].sound) || ''] || FX.ashen;
  let lastTick = 0;
  A.tick = function (speed) { if (!ready()) return; const now = A.ctx.currentTime; if (now - lastTick < 0.03) return; lastTick = now; if (!custom('tick')) fx().tick(speed == null ? 1 : speed); };
  A.reveal = function (rare) { if (!ready()) return; if (!custom(rare ? 'rare' : 'reveal') && !(rare && custom('reveal'))) fx().reveal(!!rare); };
  A.bad = function () { if (!ready()) return; if (!custom('bad')) fx().bad(); };
  A.click = function () { if (!ready()) return; if (!custom('click')) osc('triangle', 660, T(), 0.05, 0.04); };
  A.tone = function (f, d, type, vol) { if (ready()) osc(type || 'square', f, T(), d, vol || 0.05); };   // kept for compatibility

  /* ---------- ambient music (generative, per theme) ---------- */
  const MUSIC = {
    ashen(ctx, out, every) {   // low drone, crackling fire, a far bell
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; lp.connect(out);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 140; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
      const drones = [73.4, 110, 73.6].map((f, i) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = i * 5; gn.gain.value = 0.05; o.connect(gn); gn.connect(lp); o.start(); return o; });
      every(0.09, t => { if (Math.random() < 0.35) noise(t, 0.02 + Math.random() * 0.03, 0.03 + Math.random() * 0.05, 'bandpass', 1500 + Math.random() * 3000, 2, out); });
      every(11, t => { [293.7, 440].forEach(f => osc('sine', f, t, 4, 0.03, out, { a: 0.02 })); });
      return () => { drones.forEach(o => o.stop()); lfo.stop(); };
    },
    tabletop(ctx, out, every) {   // a lute plays in a tavern
      const scale = [146.8, 164.8, 174.6, 196, 220, 246.9, 261.6, 293.7], prog = [[0, 2, 4, 7], [3, 5, 7, 2], [4, 6, 1, 4], [0, 4, 7, 2]]; let step = 0;
      every(0.32, t => { const ch = prog[Math.floor(step / 8) % prog.length], n = ch[step % 4]; if (step % 8 !== 7) osc('triangle', scale[n] * (step % 2 ? 2 : 1), t, 0.45, 0.035, out, { lp: 2200 }); if (step % 4 === 0) osc('sine', scale[ch[0]] / 2, t, 1.2, 0.05, out, { a: 0.02 }); if (step % 8 === 4) noise(t, 0.06, 0.05, 'lowpass', 300, 1, out); step++; });
      return () => {};
    },
    iron(ctx, out, every) {   // organ drone, machinery, a distant choir
      const voices = [65.4, 98, 130.8, 196].map((f, i) => { const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; gn.gain.value = [0.06, 0.04, 0.03, 0.015][i]; o.connect(gn); gn.connect(out); o.start(); return o; });
      every(2, t => { noise(t, 0.1, 0.06, 'bandpass', 700, 4, out); noise(t + 0.5, 0.05, 0.035, 'bandpass', 1400, 6, out); });
      every(16, t => { [261.6, 311.1, 392].forEach((f, i) => osc('sine', f, t, 6, 0.018, out, { a: 2.5, detune: i * 7 })); });
      return () => voices.forEach(o => o.stop());
    },
    bloodmoon(ctx, out, every) {   // wind, a heartbeat, an eerie pad
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), gn = ctx.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 0.7; gn.gain.value = 0.025;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 300; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
      s.connect(f); f.connect(gn); gn.connect(out); s.start();
      every(1.7, t => { osc('sine', 55, t, 0.18, 0.12, out, { to: 42 }); osc('sine', 52, t + 0.24, 0.18, 0.08, out, { to: 40 }); });
      every(9, t => { [220, 233.1].forEach(fq => osc('sine', fq, t, 5, 0.02, out, { a: 2 })); });
      return () => { s.stop(); lfo.stop(); };
    }
  };
  A.startMusic = function () {
    if (!A.ctx || A._music || A.vol.music <= 0) return;
    const ctx = A.ctx, out = ctx.createGain(); out.gain.setValueAtTime(0.0001, ctx.currentTime); out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2.5); out.connect(mus);
    const timers = [];
    const cm = (A.custom[A.theme] || {}).music || (A.custom['*'] || {}).music;
    let stop;
    if (cm) { const src = ctx.createBufferSource(); src.buffer = cm; src.loop = true; src.connect(out); src.start(); stop = () => src.stop(); }
    else {
      // schedule repeating events a little ahead of time
      const every = (sec, fn) => { let next = ctx.currentTime + 0.2; const id = setInterval(() => { while (next < ctx.currentTime + 0.4) { if (A.vol.music > 0) fn(next); next += sec; } }, 100); timers.push(id); };
      const gen = MUSIC[A.theme] || MUSIC[(FW.THEMES && FW.THEMES[A.theme] && FW.THEMES[A.theme].sound) || ''] || MUSIC.ashen;
      stop = gen(ctx, out, every);
    }
    A._music = { out, timers, stop };
  };
  A.stopMusic = function () {
    const m = A._music; if (!m) return; A._music = null;
    m.timers.forEach(clearInterval);
    try { m.out.gain.setTargetAtTime(0.0001, A.ctx.currentTime, 0.4); } catch (e) { /* closed */ }
    setTimeout(() => { try { m.stop && m.stop(); m.out.disconnect(); } catch (e) { /* already stopped */ } }, 1500);
  };
  /* mods: give a theme (or '*' for every theme) its own sound files; values are ArrayBuffers */
  A.loadCustom = async function (themeId, files) {
    A.init(); if (!A.ctx) return;
    const set = A.custom[themeId] = A.custom[themeId] || {};
    for (const k of Object.keys(files)) { try { set[k] = await A.ctx.decodeAudioData(files[k].slice(0)); } catch (e) { console.warn('FateWheel: could not decode sound', k, e); } }
    if (set.music && (themeId === A.theme || themeId === '*')) { A.stopMusic(); A.startMusic(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
