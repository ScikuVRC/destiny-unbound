/* Shared code for the modern mockups: a sample hero with a saga, and four wheel drawing styles.
   Uses the real game data and rules from ../../app/js. */
(function () {
  const FW = window.FW, TAU = Math.PI * 2;
  const M = window.MOD = {};

  M.legend = function () {
    const L = new FW.Legend({ luck: 'mythic', seed: 'modern-mockup' });
    const ix = (s, n) => FW.LADDERS[s].names.indexOf(n);
    L.name = 'Sera Ashgrove';
    L.picks = {
      race: { name: 'Kitsune' }, sub: { name: 'Nine tails' }, birth: { name: 'Moonwell Grove' }, age: { name: 'Centuries old', years: 412 }, height: { inches: 67 },
      hair: { name: 'Long silver hair' }, eyes: { name: 'Golden eyes' }, garb: { name: "Ronin's worn kimono" }, bg: { name: 'You were an apprentice of a dying master.' },
      per: { name: 'Trickster' }, cls: { name: 'Spellblade' }, str: { idx: ix('str', 'City level') }, spd: { idx: ix('spd', 'Hypersonic+') }, dur: { idx: ix('dur', 'Town level') },
      int: { idx: ix('int', 'Supergenius') }, wpn: { name: 'Katana' }, wpnm: { idx: ix('wpn', 'Grandmaster') }, fgt: { idx: ix('fgt', 'Elite') }, enh: { name: 'Sage Mode' },
      elem: { name: 'Moon' }, pow: { name: 'Illusion Casting' }, powm: { idx: ix('pwr', 'Legendary') }, weak: { name: 'Silver and Cold Iron' }, pet: { name: 'Fox Spirit' },
      title: { name: 'The Moonlit Wolf' }, mark: { name: 'Eclipse Child' }
    };
    const s = FW.Story.newSaga(L, {}, FW.makeRng('mock'));
    s.ch = 7; s.years = 23; s.kingdom = { name: 'Lunaris', style: 'Mage kingdom', power: 60 }; s.artifacts = [{ name: 'Lantern of the Moon', dsl: 'pwr+1' }];
    s.nem = { name: 'Varg of the Broken Oath', race: 'Werewolf', lv: 71, met: 2, alive: true }; s.heir = { name: 'Wren', kind: 'daughter' }; s.dyn = { house: 'House Ashgrove', gen: 2 };
    s.used = ['kingdom', 'love', 'heir', 'artifact', 'dragon'];
    s.log = [
      { ch: 1, chapter: 'Train', emoji: '🏋️', text: 'Months of training: +1 Speed.', tone: 'good' },
      { ch: 2, chapter: 'Forge an artifact', emoji: '⚒️', text: 'You forge the Lantern of the Moon (masterpiece).', tone: 'good' },
      { ch: 3, chapter: 'Your nemesis strikes', emoji: '😈', text: 'Varg of the Broken Oath flees, swearing revenge.', tone: 'good' },
      { ch: 4, chapter: 'Forge a kingdom', emoji: '🏰', text: 'You found Lunaris, ruled by magic.', tone: 'good' },
      { ch: 5, chapter: 'Find love', emoji: '💞', text: 'You fall in love on the road.', tone: 'good' },
      { ch: 6, chapter: 'Slay a dragon', emoji: '🐉', text: 'Burned by Rimefang. You carry the scars forever.', tone: 'bad' },
      { ch: 7, chapter: 'Have an heir', emoji: '👶', text: 'Your daughter Wren is born.', tone: 'good' }
    ];
    return L;
  };
  M.stats = function (L) {
    const c = FW.compute(L);
    return ['str', 'spd', 'dur', 'int', 'fgt'].map(k => ({ k, label: FW.LADDERS[k].label, short: FW.LADDERS[k].short, tier: c.stats[k].name + (c.stats[k].over ? ' +' + c.stats[k].over : ''), lvl: Math.round(c.stats[k].lvl) }));
  };
  M.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* rarity of an entry from its share of the wheel */
  M.rarity = (e, total) => { const p = e.w / total; return p < 0.012 ? 'legendary' : p < 0.03 ? 'epic' : p < 0.07 ? 'rare' : 'common'; };
  const RAR = { common: ['#5b6475', '#7c879b'], rare: ['#1f6fe5', '#4f9bff'], epic: ['#7b2ff7', '#b067ff'], legendary: ['#f59e0b', '#ffd166'] };
  M.RAR = RAR;

  /* draw a wheel; idx = landed slice, turned to sit under the pointer at the top */
  M.wheel = function (cv, entries, idx, style) {
    const dpr = 2, S = cv.clientWidth || 300; cv.width = S * dpr; cv.height = S * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const total = entries.reduce((a, e) => a + (e.dw != null ? e.dw : e.w), 0);
    const sz = e => (e.dw != null ? e.dw : e.w) / total;
    let acc = 0; const cum = entries.map(e => { const a = acc; acc += sz(e); return a; });
    const mid = idx >= 0 ? (cum[idx] + sz(entries[idx]) / 2) * TAU : 0;
    const cx = S / 2, cy = S / 2, R = S / 2 - (style === 'gacha' ? 14 : 6);
    const inner = style === 'ring' ? R * 0.58 : style === 'glass' ? R * 0.2 : style === 'flat' ? R * 0.16 : R * 0.22;
    c.save(); c.translate(cx, cy); c.rotate(-Math.PI / 2 - mid);
    entries.forEach((e, i) => {
      const a0 = cum[i] * TAU, a1 = a0 + sz(e) * TAU, gap = style === 'ring' ? Math.min(0.012, sz(e) * TAU * 0.2) : 0;
      c.beginPath(); c.arc(0, 0, R, a0 + gap, a1 - gap); c.arc(0, 0, inner, a1 - gap, a0 + gap, true); c.closePath();
      let fill;
      const hit = i === idx;
      if (style === 'glass') { const g = c.createRadialGradient(0, 0, inner, 0, 0, R); const h = (i * 47 + 200) % 360; g.addColorStop(0, `hsla(${h},80%,72%,.55)`); g.addColorStop(1, `hsla(${h},85%,62%,.9)`); fill = e.gray ? 'rgba(255,255,255,.07)' : g; }
      else if (style === 'flat') fill = hit ? '#ff5a36' : e.gray ? '#e9e9ee' : (i % 2 ? '#f4f4f6' : '#ffffff');
      else if (style === 'ring') { const h = (i * 360 / entries.length + 180) % 360; fill = hit ? `hsl(${h},100%,60%)` : `hsla(${h},90%,55%,.28)`; }
      else { const r = RAR[M.rarity(e, total)]; const g = c.createRadialGradient(0, 0, inner, 0, 0, R); g.addColorStop(0, r[1]); g.addColorStop(1, r[0]); fill = /(^|\s)none(\s|$)/.test(e.dsl || '') ? '#2b2f3a' : g; }
      c.fillStyle = fill; c.fill();
      if (style === 'flat') { c.strokeStyle = '#d9d9e0'; c.lineWidth = 0.8; c.stroke(); }
      if (style === 'glass') { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.stroke(); }
      if (style === 'gacha') { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.6; c.stroke(); }
      if (style === 'ring' && hit) { c.shadowColor = fill; c.shadowBlur = 18; c.fill(); c.shadowBlur = 0; }
      // label
      const ang = sz(e) * TAU, arc = ang * (R + inner) / 2;
      let fs = Math.min(arc * 0.75, style === 'ring' ? 11 : 13); if (fs < 5.5) return;
      c.save(); c.rotate(a0 + ang / 2);
      c.font = (style === 'ring' ? '600 ' : '700 ') + fs + 'px ' + (style === 'ring' ? 'Consolas, "Cascadia Mono", monospace' : style === 'gacha' ? 'Bahnschrift, "Segoe UI", sans-serif' : '"Segoe UI Variable Text", "Segoe UI", Inter, sans-serif');
      c.textBaseline = 'middle'; c.textAlign = 'right';
      c.fillStyle = style === 'flat' ? (hit ? '#fff' : e.gray ? '#a9a9b3' : '#1d1d24') : style === 'ring' ? (hit ? '#001014' : 'rgba(200,255,255,.85)') : e.gray ? 'rgba(255,255,255,.35)' : '#fff';
      if (style === 'gacha' || style === 'glass') { c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 3; }
      let label = e.name; const maxW = R - inner - 12;
      while (c.measureText(label).width > maxW && label.length > 4) label = label.slice(0, -2) + '…';
      c.fillText(label, R - 8, 0); c.restore();
    });
    c.restore();
    // rim, hub and pointer per style
    if (style === 'glass') {
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.stroke();
      const hg = c.createRadialGradient(cx, cy - 8, 2, cx, cy, inner); hg.addColorStop(0, 'rgba(255,255,255,.95)'); hg.addColorStop(1, 'rgba(255,255,255,.55)');
      c.beginPath(); c.arc(cx, cy, inner, 0, TAU); c.fillStyle = hg; c.fill();
      c.beginPath(); c.moveTo(cx - 11, 4); c.lineTo(cx + 11, 4); c.lineTo(cx, 26); c.closePath(); c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 8; c.fill(); c.shadowBlur = 0;
    } else if (style === 'flat') {
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.strokeStyle = '#1d1d24'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.arc(cx, cy, inner, 0, TAU); c.fillStyle = '#1d1d24'; c.fill();
      c.fillStyle = '#ff5a36'; c.fillRect(cx - 2, 0, 4, 24);
    } else if (style === 'ring') {
      for (let i = 0; i < 120; i++) { const a = i / 120 * TAU; const r1 = R + 1, r2 = R + (i % 10 ? 3 : 6); c.beginPath(); c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); c.strokeStyle = 'rgba(0,240,255,.45)'; c.lineWidth = 1; c.stroke(); }
      c.beginPath(); c.arc(cx, cy, inner - 6, 0, TAU); c.strokeStyle = 'rgba(0,240,255,.5)'; c.lineWidth = 1; c.stroke();
      c.beginPath(); c.moveTo(cx, 2); c.lineTo(cx - 8, -10 + 22); c.lineTo(cx + 8, 12); c.closePath(); c.fillStyle = '#00f0ff'; c.shadowColor = '#00f0ff'; c.shadowBlur = 12; c.fill(); c.shadowBlur = 0;
    } else {
      c.beginPath(); c.arc(cx, cy, R + 6, 0, TAU); c.lineWidth = 12; const rg = c.createLinearGradient(0, 0, S, S); rg.addColorStop(0, '#ffe08a'); rg.addColorStop(.5, '#f5a623'); rg.addColorStop(1, '#ffe08a'); c.strokeStyle = rg; c.stroke();
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; c.beginPath(); c.arc(cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6), 2.6, 0, TAU); c.fillStyle = i % 2 ? '#fff7d6' : '#fffbe9'; c.shadowColor = '#fff2a8'; c.shadowBlur = 6; c.fill(); }
      c.shadowBlur = 0;
      const hg = c.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, inner); hg.addColorStop(0, '#fff3c4'); hg.addColorStop(1, '#e08e0b');
      c.beginPath(); c.arc(cx, cy, inner, 0, TAU); c.fillStyle = hg; c.fill(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke();
      c.beginPath(); c.moveTo(cx - 16, 0); c.lineTo(cx + 16, 0); c.lineTo(cx, 34); c.closePath(); c.fillStyle = '#ff3b5c'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.fill(); c.stroke();
    }
  };
  M.stage = id => FW.buildStage(id, M.legend(), {});
  M.drawAll = function () { document.querySelectorAll('canvas[data-wheel]').forEach(cv => { const d = JSON.parse(cv.dataset.wheel); const ents = d.story ? FW.Story.wheelEntries(M.legend(), {}) : M.stage(d.stage).entries; const idx = ents.findIndex(e => e.name === d.pick || e.id === d.pick); M.wheel(cv, ents, idx, d.style); }); };
})();
