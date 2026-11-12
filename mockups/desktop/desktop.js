/* Desktop client mockups: renders two app windows (Story and Character) with the real game data.
   Each page sets window.DSTYLE = 'glass' | 'minimal' | 'hud' | 'gacha' and its own CSS; markup is shared. */
(function () {
  const FW = window.FW, M = window.MOD, st = window.DSTYLE;
  const L = M.legend(), c = FW.compute(L), e = M.esc, s = L.saga, stats = M.stats(L);
  const NAV = [['🎡', 'Spin a legend'], ['📖', 'Story'], ['⚔️', 'Arena'], ['🤺', 'Versus'], ['📅', 'Daily challenge'], ['🏛️', 'Hall of Legends'], ['🧩', 'Wheel packs'], ['🏅', 'Achievements'], ['⚙️', 'Game options']];
  const label = { hud: 'FATE//WHEEL', gothic: 'FATEWHEEL' }[st] || 'FateWheel';
  const up = t => (st === 'hud' || st === 'gothic' ? String(t).toUpperCase() : t);
  const ROMAN = n => [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((o, r) => { while (n >= r[0]) { o += r[1]; n -= r[0]; } return o; }, '');
  const THEMED = ['ember', 'parchment', 'gothic', 'eldritch'].indexOf(st) >= 0;
  const chap = n => st === 'gothic' ? '+++ CHAPTER ' + ROMAN(n) + ' +++' : THEMED ? 'Chapter ' + ROMAN(n) : 'Chapter ' + n;

  const titlebar = title => `<div class="tb"><span class="tb-ic">◈</span><span class="tb-t">${title}</span><span class="tb-b"><i>—</i><i>▢</i><i>✕</i></span></div>`;
  const side = active => `<aside class="side"><div class="logo">${label}</div>
    <nav>${NAV.map((n, i) => `<a class="${i === active ? 'on' : ''}"><span>${n[0]}</span>${up(n[1])}${i === 1 ? `<em>Ch. ${s.ch}</em>` : i === 7 ? '<em>9/22</em>' : ''}</a>`).join('')}</nav>
    <div class="side-foot"><div class="lk">${up('Luck')}</div><div class="seg">${['Mortal', 'Heroic', 'Mythic', 'Divine'].map(x => `<span class="${x === 'Mythic' ? 'on' : ''}">${up(x)}</span>`).join('')}</div>
    <div class="side-row"><span class="pill">⏺ ${up('Record')}</span><span class="pill">↺ ${up('Spin direction')}</span></div><a class="kofi">☕ ${up('Support on Ko-fi')}</a></div></aside>`;

  /* stats in the style of each direction */
  function statsBlock() {
    if (st === 'gacha') { const n = l => Math.max(1, Math.min(5, Math.round(l / 20))); return stats.map(x => `<div class="sr"><b>${x.short}</b><span class="stars">${'★'.repeat(n(x.lvl))}${'☆'.repeat(5 - n(x.lvl))}</span><em>${e(x.tier)}</em></div>`).join(''); }
    if (st === 'minimal') return `<table class="tbl">${stats.map(x => `<tr><td>${x.label}</td><td>${e(x.tier)}</td><td>${x.lvl}</td></tr>`).join('')}</table>`;
    if (st === 'hud') return '<canvas class="radar" data-radar="1"></canvas>';
    if (st === 'parchment') return `<div class="abil">${stats.map(x => { const m = Math.floor((x.lvl - 50) / 10); return `<div><span>${x.short}</span><b>${x.lvl}</b><i>${m >= 0 ? '+' : ''}${m}</i><small>${e(x.tier)}</small></div>`; }).join('')}</div>`;
    return stats.map(x => `<div class="sb"><span>${x.short}</span><div class="b"><i style="width:${Math.min(100, x.lvl)}%"></i></div><em>${e(x.tier)}</em></div>`).join('');
  }
  const sagaList = n => `<div class="saga">${s.log.slice(-n).map(x => st === 'hud' ? `<div class="ev ${x.tone}"><b>[CH${String(x.ch).padStart(2, '0')}]</b> ${e(x.text)}</div>` : st === 'minimal' ? `<div class="ev"><b>${x.ch}</b><span>${e(x.text)}</span></div>` : `<div class="ev ${x.tone}"><i>${x.emoji}</i><div>${e(x.text)}<small>${chap(x.ch)} · ${e(x.chapter)}</small></div></div>`).join('')}</div>`;
  const wheelStyle = { glass: 'glass', minimal: 'flat', hud: 'ring', gacha: 'gacha' }[st] || st;

  /* window 1: the story wheel */
  const story = `<div class="win">${titlebar('FateWheel — Story')}<div class="body">${side(1)}
   <main class="main">
     <div class="top"><div><small>${up(chap(s.ch + 1))}</small><h1>${up('What happens next?')}</h1></div><div class="prog"><div class="bar"><i style="width:${Math.round(s.ch / 15 * 100)}%"></i></div><span>🪙 ${up('3 Fate Tokens')}</span></div></div>
     <div class="stage">
       <div class="wheelbox"><canvas class="wheel" data-wheel='{"story":1,"pick":"conquerRace","style":"${wheelStyle}"}'></canvas></div>
       <div class="result">
         <small>${up('The wheel decides')}</small><h2>${up('Conquer a race')}</h2>
         <p>${e('Your kingdom of ' + s.kingdom.name + ' marches to war. Next you spin which race you fight, then the war itself at your real odds.')}</p>
         <div class="chips"><span class="chip">Army of ${e(s.kingdom.name)} +6</span><span class="chip">Allies +3</span><span class="chip">Lantern of the Moon +1.5</span><span class="chip bad">Death possible</span></div>
         <div class="odds"><div><b>34</b><span>${up('chapters')}</span></div><div><b>5</b><span>${up('done')}</span></div><div><b>${S_RET()}</b><span>${up('Retire size')}</span></div></div>
         <div class="btns"><button class="btn ghost">↺ ${up('Re-spin')}</button><button class="btn">${up('Continue')} ▸</button></div>
         <div class="hint">${up('Space to spin · Enter to continue · Esc to pause the story')}</div>
       </div>
     </div>
   </main>
   <aside class="aside">
     <div class="mini"><div class="av">SA</div><div><b>${e(L.name)}</b><small>${e(L.pickName('title'))}</small><small>Nine-tailed Kitsune · ${e(L.pickName('cls'))}</small></div></div>
     <div class="rating"><b>${c.rating.toFixed(1)}</b><span>${up(c.rank)}</span></div>
     <div class="panel"><h3>${up('Stats')}</h3>${statsBlock()}</div>
     <div class="panel"><h3>${up('Realm')}</h3><div class="kv"><span>${up('Kingdom')}</span><b>${e(s.kingdom.name)}</b></div><div class="kv"><span>${up('Nemesis')}</span><b>${e(s.nem.name)} · ${s.nem.lv}</b></div><div class="kv"><span>${up('Heir')}</span><b>${e(s.heir.name)}</b></div><div class="kv"><span>${up('House')}</span><b>${e(s.dyn.house)}</b></div></div>
     <div class="panel"><h3>${up('Saga so far')}</h3>${sagaList(3)}</div>
   </aside></div></div>`;

  /* window 2: the character */
  const buffs = c.sources.filter(x => FW.chips(x.p).some(k => k.k !== 'info')).slice(0, 9).map(x => `<div class="buff"><span>${e(x.label)}</span><div>${FW.chips(x.p).filter(k => k.k !== 'info').slice(0, 3).map(k => `<i class="${k.k}">${e(k.t)}</i>`).join('')}</div></div>`).join('');
  const lines = FW.cardLines(L, c).slice(0, 15).map(l => `<div class="kv"><span>${up(l.k)}</span><b>${e(l.v)}</b></div>`).join('');
  const character = `<div class="win">${titlebar('FateWheel — ' + L.name)}<div class="body">${side(5)}
   <main class="main two">
     <section class="cardcol"><div class="portrait"><div class="glow"></div><div class="who"><small>${up(L.pickName('title'))}</small><h2>${e(L.name)}</h2><span>${up('Nine-tailed Kitsune · ' + L.pickName('cls'))}</span></div><div class="badge">${c.rating.toFixed(1)} · ${up(c.rank)}</div></div>
       <div class="actions"><button class="btn">📖 ${up('Continue the story')}</button><button class="btn ghost">🎨 ${up('Generate AI art')}</button><button class="btn ghost">✍️ ${up('Write the tale')}</button><button class="btn ghost">⚔ ${up('Arena')}</button><button class="btn ghost">${up('Save PNG')}</button><button class="btn ghost">${up('Copy Legend Code')}</button></div></section>
     <section class="sheet"><div class="panel"><h3>${up('Legend')}</h3><div class="cols">${lines}</div></div>
       <div class="row2"><div class="panel"><h3>${up('Stats')}</h3>${statsBlock()}</div><div class="panel"><h3>${up('Buffs and debuffs')}</h3><div class="buffs">${buffs}</div></div></div>
       <div class="panel"><h3>${up('Saga · ' + s.ch + ' chapters · ' + s.dyn.house + ', generation ' + s.dyn.gen)}</h3>${sagaList(5)}</div></section>
   </main></div></div>`;
  function S_RET() { return FW.Story.retireWeight(L, FW.Story.opts()).toFixed(1); }

  document.getElementById('windows').innerHTML = '<div class="cap">' + up('Story screen') + '</div>' + story + '<div class="cap">' + up('Character screen') + '</div>' + character;
  M.drawAll();
  // HUD radar
  document.querySelectorAll('canvas[data-radar]').forEach(cv => {
    const W = cv.clientWidth, H = cv.clientHeight, d = 2; cv.width = W * d; cv.height = H * d; const g = cv.getContext('2d'); g.scale(d, d);
    const n = stats.length, cx = W / 2, cy = H / 2 + 4, R = Math.min(W, H) / 2 - 24, pt = (i, r) => [cx + Math.cos(-Math.PI / 2 + i / n * Math.PI * 2) * r, cy + Math.sin(-Math.PI / 2 + i / n * Math.PI * 2) * r];
    for (let k = 1; k <= 4; k++) { g.beginPath(); stats.forEach((x, i) => { const p = pt(i, R * k / 4); i ? g.lineTo(...p) : g.moveTo(...p); }); g.closePath(); g.strokeStyle = 'rgba(0,240,255,.2)'; g.stroke(); }
    g.beginPath(); stats.forEach((x, i) => { const p = pt(i, R * Math.min(1, x.lvl / 100)); i ? g.lineTo(...p) : g.moveTo(...p); }); g.closePath(); g.fillStyle = 'rgba(255,43,214,.25)'; g.fill(); g.strokeStyle = '#ff2bd6'; g.lineWidth = 2; g.shadowColor = '#ff2bd6'; g.shadowBlur = 10; g.stroke(); g.shadowBlur = 0;
    g.font = '10px Consolas, monospace'; g.fillStyle = '#00f0ff'; g.textAlign = 'center'; stats.forEach((x, i) => { const p = pt(i, R + 14); g.fillText(x.short + ' ' + x.lvl, p[0], p[1] + 3); });
  });
})();
