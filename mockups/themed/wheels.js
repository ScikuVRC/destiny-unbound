/* Themed wheel styles for the themed mockups: ember (dark fantasy), parchment (tabletop), gothic (grimdark sci-fi), eldritch (gothic horror).
   Wraps MOD.wheel so the shared desktop layout can use them. */
(function () {
  const M = window.MOD, TAU = Math.PI * 2, base = M.wheel;
  const FONT = { ember: '"Cinzel", "Palatino Linotype", serif', parchment: '"IM Fell English", "Palatino Linotype", Georgia, serif', gothic: '"Share Tech Mono", Consolas, monospace', eldritch: '"Cormorant Garamond", Georgia, serif' };
  const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';

  function slices(c, entries, idx, R, inner, style) {
    const total = entries.reduce((a, e) => a + (e.dw != null ? e.dw : e.w), 0), sz = e => (e.dw != null ? e.dw : e.w) / total;
    let acc = 0; const cum = entries.map(e => { const a = acc; acc += sz(e); return a; });
    const mid = idx >= 0 ? (cum[idx] + sz(entries[idx]) / 2) * TAU : 0;
    c.save(); c.rotate(-Math.PI / 2 - mid);
    entries.forEach((e, i) => {
      const a0 = cum[i] * TAU, a1 = a0 + sz(e) * TAU, hit = i === idx;
      c.beginPath(); c.arc(0, 0, R, a0, a1); c.arc(0, 0, inner, a1, a0, true); c.closePath();
      let g;
      if (style === 'ember') { g = c.createRadialGradient(0, 0, inner, 0, 0, R); if (hit) { g.addColorStop(0, '#ffb35c'); g.addColorStop(1, '#c2410c'); } else if (e.gray) { g.addColorStop(0, '#1a1716'); g.addColorStop(1, '#100e0d'); } else { const red = i % 2; g.addColorStop(0, red ? '#3b1612' : '#24201d'); g.addColorStop(1, red ? '#5e1f17' : '#38312b'); } }
      else if (style === 'parchment') g = hit ? '#b3261e' : e.gray ? '#d9c9a3' : (i % 2 ? '#efe2c0' : '#e6d4ab');
      else if (style === 'gothic') { g = c.createRadialGradient(0, 0, inner, 0, 0, R); if (hit) { g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#b8862b'); } else if (e.gray) { g.addColorStop(0, '#1b1c1f'); g.addColorStop(1, '#141517'); } else { const red = i % 2; g.addColorStop(0, red ? '#4a0f0f' : '#2b2f35'); g.addColorStop(1, red ? '#6e1414' : '#40464e'); } }
      else { g = c.createRadialGradient(0, 0, inner, 0, 0, R); if (hit) { g.addColorStop(0, '#d8ff9a'); g.addColorStop(1, '#5e9e2a'); } else if (e.gray) { g.addColorStop(0, '#0d0c12'); g.addColorStop(1, '#0a090e'); } else { const p = i % 3; g.addColorStop(0, ['#1a0f1f', '#0f1a1c', '#200d10'][p]); g.addColorStop(1, ['#3a1d45', '#173a3d', '#4a1520'][p]); } }
      c.fillStyle = g; c.fill();
      c.lineWidth = style === 'parchment' ? 1.3 : style === 'gothic' ? 1.6 : 1;
      c.strokeStyle = style === 'ember' ? 'rgba(212,175,110,.35)' : style === 'parchment' ? '#3b2a1a' : style === 'gothic' ? '#b8862b' : 'rgba(200,210,220,.28)';
      c.stroke();
      if (style === 'parchment' && !hit && !e.gray && i % 2) { c.save(); c.clip(); c.strokeStyle = 'rgba(59,42,26,.12)'; c.lineWidth = 0.8; for (let k = -R; k < R; k += 6) { c.beginPath(); c.moveTo(k, -R); c.lineTo(k + R, R); c.stroke(); } c.restore(); }
      if (hit && style !== 'parchment') { c.save(); c.shadowColor = style === 'ember' ? '#ff7a1a' : style === 'gothic' ? '#ffd166' : '#b6ff5c'; c.shadowBlur = 26; c.fill(); c.restore(); }
      const ang = sz(e) * TAU, arc = ang * (R + inner) / 2; let fs = Math.min(arc * 0.74, style === 'gothic' ? 11.5 : 14); if (fs < 5.5) return;
      c.save(); c.rotate(a0 + ang / 2); c.font = (style === 'eldritch' ? 'italic 600 ' : '700 ') + fs + 'px ' + FONT[style]; c.textBaseline = 'middle'; c.textAlign = 'right';
      c.fillStyle = style === 'parchment' ? (hit ? '#fff4dc' : e.gray ? 'rgba(59,42,26,.38)' : '#2b1d10') : hit ? (style === 'eldritch' ? '#0d1405' : '#1a0d02') : e.gray ? 'rgba(220,210,190,.28)' : style === 'gothic' ? '#e8d9b0' : style === 'eldritch' ? '#d9d4e8' : '#ecdcc0';
      let label = style === 'gothic' ? e.name.toUpperCase() : e.name; const maxW = R - inner - 14;
      while (c.measureText(label).width > maxW && label.length > 4) label = label.slice(0, -2) + '…';
      c.fillText(label, R - 9, 0); c.restore();
    });
    c.restore();
  }

  const DRAW = {
    ember(c, S, entries, idx) {
      const cx = S / 2, R = S / 2 - 26, inner = R * 0.2; c.translate(cx, cx);
      c.beginPath(); c.arc(0, 0, R + 22, 0, TAU); const rg = c.createRadialGradient(0, 0, R, 0, 0, R + 22); rg.addColorStop(0, '#2a2522'); rg.addColorStop(.5, '#4a423b'); rg.addColorStop(1, '#141110'); c.fillStyle = rg; c.fill();
      c.font = '13px serif'; c.fillStyle = 'rgba(255,170,90,.75)'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff7a1a'; c.shadowBlur = 8;
      for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; c.save(); c.rotate(a); c.fillText(RUNES[i % RUNES.length], 0, -(R + 11)); c.restore(); }
      c.shadowBlur = 0;
      slices(c, entries, idx, R, inner, 'ember');
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.strokeStyle = '#b8975a'; c.lineWidth = 2; c.stroke();
      const hg = c.createRadialGradient(0, -4, 2, 0, 0, inner); hg.addColorStop(0, '#ffb35c'); hg.addColorStop(.35, '#7a2a10'); hg.addColorStop(1, '#1b1715'); c.beginPath(); c.arc(0, 0, inner, 0, TAU); c.fillStyle = hg; c.fill(); c.strokeStyle = '#b8975a'; c.lineWidth = 3; c.stroke();
      // a blade for a pointer
      c.beginPath(); c.moveTo(0, -R + 26); c.lineTo(-9, -R - 6); c.lineTo(-4, -R - 24); c.lineTo(4, -R - 24); c.lineTo(9, -R - 6); c.closePath(); const bl = c.createLinearGradient(-9, 0, 9, 0); bl.addColorStop(0, '#8d8f94'); bl.addColorStop(.5, '#f2f2f2'); bl.addColorStop(1, '#6b6d72'); c.fillStyle = bl; c.fill(); c.strokeStyle = '#2a2522'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#b8975a'; c.fillRect(-14, -R - 28, 28, 5);
    },
    parchment(c, S, entries, idx) {
      const cx = S / 2, R = S / 2 - 22, inner = R * 0.24; c.translate(cx, cx);
      c.beginPath(); c.arc(0, 0, R + 16, 0, TAU); c.fillStyle = '#e9d9b2'; c.fill(); c.strokeStyle = '#3b2a1a'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.arc(0, 0, R + 12, 0, TAU); c.lineWidth = 0.8; c.stroke();
      for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, l = i % 6 ? 4 : 9; c.beginPath(); c.moveTo(Math.cos(a) * (R + 1), Math.sin(a) * (R + 1)); c.lineTo(Math.cos(a) * (R + 1 + l), Math.sin(a) * (R + 1 + l)); c.strokeStyle = '#3b2a1a'; c.lineWidth = i % 6 ? 0.7 : 1.4; c.stroke(); }
      slices(c, entries, idx, R, inner, 'parchment');
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.strokeStyle = '#3b2a1a'; c.lineWidth = 2.2; c.stroke();
      // d20 hub
      c.beginPath(); c.arc(0, 0, inner, 0, TAU); c.fillStyle = '#f5ead0'; c.fill(); c.strokeStyle = '#3b2a1a'; c.lineWidth = 2; c.stroke();
      const h = inner * 0.78, P = k => [Math.cos(-Math.PI / 2 + k * Math.PI / 3) * h, Math.sin(-Math.PI / 2 + k * Math.PI / 3) * h];
      c.beginPath(); for (let k = 0; k < 6; k++) { const p = P(k); k ? c.lineTo(...p) : c.moveTo(...p); } c.closePath(); c.fillStyle = '#7a1f1a'; c.fill(); c.strokeStyle = '#2b1d10'; c.lineWidth = 1.5; c.stroke();
      const t = h * 0.55; c.beginPath(); c.moveTo(0, -t); c.lineTo(t * 0.87, t * 0.5); c.lineTo(-t * 0.87, t * 0.5); c.closePath(); c.strokeStyle = 'rgba(255,230,200,.7)'; c.lineWidth = 1; c.stroke();
      [0, 2, 4].forEach(k => { const p = P(k); c.beginPath(); c.moveTo(...p); c.lineTo(k === 0 ? 0 : k === 2 ? t * 0.87 : -t * 0.87, k === 0 ? -t : t * 0.5); c.stroke(); });
      c.fillStyle = '#fff4dc'; c.font = '700 ' + Math.round(inner * 0.42) + 'px "IM Fell English", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('20', 0, t * 0.05);
      // inked arrow
      c.beginPath(); c.moveTo(0, -R + 20); c.lineTo(-10, -R - 14); c.lineTo(0, -R - 6); c.lineTo(10, -R - 14); c.closePath(); c.fillStyle = '#b3261e'; c.fill(); c.strokeStyle = '#2b1d10'; c.lineWidth = 1.5; c.stroke();
    },
    gothic(c, S, entries, idx) {
      const cx = S / 2, R = S / 2 - 30, inner = R * 0.24; c.translate(cx, cx);
      // cog rim
      const teeth = 40; c.beginPath(); for (let i = 0; i < teeth * 2; i++) { const a = i / (teeth * 2) * TAU, r = i % 2 ? R + 18 : R + 26; c.lineTo(Math.cos(a - 0.03) * r, Math.sin(a - 0.03) * r); c.lineTo(Math.cos(a + 0.03) * r, Math.sin(a + 0.03) * r); } c.closePath();
      const brass = c.createLinearGradient(-R, -R, R, R); brass.addColorStop(0, '#f0c96a'); brass.addColorStop(.5, '#8a5f1f'); brass.addColorStop(1, '#d9a94a'); c.fillStyle = brass; c.fill();
      c.beginPath(); c.arc(0, 0, R + 16, 0, TAU); c.fillStyle = '#1d1e21'; c.fill();
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; c.beginPath(); c.arc(Math.cos(a) * (R + 9), Math.sin(a) * (R + 9), 2.4, 0, TAU); c.fillStyle = '#c99a3c'; c.fill(); }
      slices(c, entries, idx, R, inner, 'gothic');
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.strokeStyle = '#d9a94a'; c.lineWidth = 2.5; c.stroke();
      // cog hub with a red gem
      c.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? inner : inner + 7; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fillStyle = brass; c.fill();
      c.beginPath(); c.arc(0, 0, inner * 0.72, 0, TAU); c.fillStyle = '#1d1e21'; c.fill();
      const gem = c.createRadialGradient(-4, -4, 1, 0, 0, inner * 0.45); gem.addColorStop(0, '#ff8a80'); gem.addColorStop(.5, '#b3121b'); gem.addColorStop(1, '#3a0508'); c.beginPath(); c.arc(0, 0, inner * 0.45, 0, TAU); c.fillStyle = gem; c.shadowColor = '#ff2a2a'; c.shadowBlur = 16; c.fill(); c.shadowBlur = 0;
      // brass spike
      c.beginPath(); c.moveTo(0, -R + 30); c.lineTo(-11, -R - 8); c.lineTo(0, -R - 30); c.lineTo(11, -R - 8); c.closePath(); c.fillStyle = brass; c.fill(); c.strokeStyle = '#3a2a10'; c.lineWidth = 1.5; c.stroke();
      c.beginPath(); c.arc(0, -R - 8, 4, 0, TAU); c.fillStyle = '#b3121b'; c.fill();
    },
    eldritch(c, S, entries, idx) {
      const cx = S / 2, R = S / 2 - 24, inner = R * 0.26; c.translate(cx, cx);
      c.beginPath(); c.arc(0, 0, R + 20, 0, TAU); c.fillStyle = '#0b0a0f'; c.fill();
      c.strokeStyle = 'rgba(200,205,220,.55)'; c.lineWidth = 1;
      for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; c.save(); c.rotate(a); c.beginPath(); c.moveTo(0, -(R + 6)); c.bezierCurveTo(10, -(R + 10), 10, -(R + 18), 0, -(R + 16)); c.bezierCurveTo(-6, -(R + 14), -2, -(R + 10), 3, -(R + 11)); c.stroke(); c.restore(); }
      slices(c, entries, idx, R, inner, 'eldritch');
      c.beginPath(); c.arc(0, 0, R, 0, TAU); c.strokeStyle = '#c9cede'; c.lineWidth = 1.6; c.stroke(); c.beginPath(); c.arc(0, 0, R + 4, 0, TAU); c.lineWidth = 0.6; c.stroke();
      // the eye
      c.beginPath(); c.arc(0, 0, inner, 0, TAU); c.fillStyle = '#0b0a0f'; c.fill(); c.strokeStyle = '#c9cede'; c.lineWidth = 2; c.stroke();
      c.save(); c.beginPath(); c.moveTo(-inner * 0.85, 0); c.quadraticCurveTo(0, -inner * 0.7, inner * 0.85, 0); c.quadraticCurveTo(0, inner * 0.7, -inner * 0.85, 0); c.closePath(); c.fillStyle = '#efe6d2'; c.fill(); c.clip();
      const ir = c.createRadialGradient(0, 0, 1, 0, 0, inner * 0.4); ir.addColorStop(0, '#d8ff9a'); ir.addColorStop(.6, '#5e9e2a'); ir.addColorStop(1, '#1d3a0d'); c.beginPath(); c.arc(0, 0, inner * 0.4, 0, TAU); c.fillStyle = ir; c.fill();
      c.beginPath(); c.ellipse(0, 0, inner * 0.07, inner * 0.33, 0, 0, TAU); c.fillStyle = '#050505'; c.fill(); c.restore();
      c.beginPath(); c.moveTo(-inner * 0.85, 0); c.quadraticCurveTo(0, -inner * 0.7, inner * 0.85, 0); c.quadraticCurveTo(0, inner * 0.7, -inner * 0.85, 0); c.strokeStyle = '#7a1f2b'; c.lineWidth = 1.5; c.stroke();
      // silver claw
      c.beginPath(); c.moveTo(0, -R + 24); c.quadraticCurveTo(-12, -R - 2, -6, -R - 22); c.quadraticCurveTo(0, -R - 8, 6, -R - 22); c.quadraticCurveTo(12, -R - 2, 0, -R + 24); const sv = c.createLinearGradient(-12, 0, 12, 0); sv.addColorStop(0, '#7d8293'); sv.addColorStop(.5, '#f2f3f8'); sv.addColorStop(1, '#6a6f80'); c.fillStyle = sv; c.fill();
    }
  };
  M.wheel = function (cv, entries, idx, style) {
    if (!DRAW[style]) return base(cv, entries, idx, style);
    const dpr = 2, S = cv.clientWidth || 300; cv.width = S * dpr; cv.height = S * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr); DRAW[style](c, S, entries, idx);
  };
})();
