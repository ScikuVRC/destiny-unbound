/* FATEWHEEL HTML render helpers (shared by the app and the mockups) */
(function (g) {
  const FW = g.FW = g.FW || {};
  const H = FW.html = {};
  const esc = H.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  H.chips = function (chips) {
    return chips.length ? '<div class="mods">' + chips.map(c => '<span class="mod ' + c.k + '">' + esc(c.t) + '</span>').join('') + '</div>' : '';
  };
  H.tinyChips = function (chips) {
    return chips.length ? '<div class="tiny-mods">' + chips.map(c => '<span class="mod ' + c.k + '">' + esc(c.t) + '</span>').join('') + '</div>' : '';
  };
  H.resultClass = t => (t.length > 24 ? ' xlong' : t.length > 12 ? ' long' : '');
  H.fxCard = function (title, perk, flaw, chips, extra, big) {
    return '<div class="fx-card"><h3>' + esc(title) + '</h3>' +
      (perk ? '<p class="perk ' + (big ? 'fx-big' : '') + '">' + esc(perk) + '</p>' : '') +
      (flaw ? '<p class="flaw">' + esc(flaw) + '</p>' : '') + H.chips(chips) + (extra || '') + '</div>';
  };

  const LABEL = { race: 'Race', sub: 'Kind', birth: 'Birthplace', age: 'Age', height: 'Height', bg: 'Background', per: 'Personality', str: 'Strength', spd: 'Speed', dur: 'Durability', int: 'Intelligence', wpn: 'Weapon', wpnm: 'Weapon skill', fgt: 'Fighting', enh: 'Enhancement', pow: 'Power', powm: 'Power skill', weak: 'Weakness', title: 'Title', mark: 'Fate', hair: 'Hair', eyes: 'Eyes', garb: 'Outfit', cls: 'Class', elem: 'Element', pet: 'Companion' };
  H.STAGE_LABEL = LABEL;
  function valueFor(legend, comp, id) {
    const def = FW.STAGE_BY_ID[id];
    if (!legend.picks[id]) return null;
    if (def.ladder) { const t = comp.stats[def.ladder]; if (!t || t.na) return null; return { v: t.name + (t.over ? ' +' + t.over : ''), d: t.bonus ? 'rolled ' + FW.LADDERS[def.ladder].names[t.raw] + ' (' + (t.bonus > 0 ? '+' : '−') + Math.abs(t.bonus) + ')' : '' }; }
    if (id === 'height') return { v: FW.fmtHeight(legend.picks.height.inches), d: comp.heightClass ? comp.heightClass.name : '' };
    if (id === 'age') { const a = legend.picks.age; return { v: a.name, d: a.years ? a.years + ' years' : '' }; }
    if (id === 'bg') return { v: legend.pickName('bg').replace(/^You were (a |an |the )?/i, '').replace(/\.$/, '').replace(/^./, c => c.toUpperCase()), d: '' };
    const e = legend.entry(id);
    return { v: legend.pickName(id), d: legend.chosen && legend.chosen.indexOf(id) >= 0 ? 'chosen by you' : '' };
  }
  H.sheetRows = function (legend, comp, curId) {
    return FW.STAGES.filter(s => legend.stageApplies(s.id) || legend.picks[s.id]).map(s => {
      const val = valueFor(legend, comp, s.id);
      const e = (['sub','race','birth','bg','per','cls','wpn','enh','elem','pow','weak','pet','title','mark','hair','eyes','garb'].indexOf(s.id) >= 0) ? legend.entry(s.id) : null;
      const chips = e ? FW.chips(FW.P(e)) : [];
      const cls = 'row' + (s.id === curId ? ' cur' : '') + (val ? '' : ' empty');
      const emoji = s.ladder ? FW.LADDERS[s.ladder].emoji : s.emoji;
      return '<div class="' + cls + '"><span>' + emoji + '</span><span class="k">' + esc(LABEL[s.id]) + '</span><span class="v">' + (val ? esc(val.v) + (val.d ? '<small>' + esc(val.d) + '</small>' : '') + H.tinyChips(chips.slice(0, 4)) : '—') + '</span></div>';
    }).join('');
  };
  H.rating = function (comp) {
    return '<div class="rating"><div class="r-top"><span class="r-num">' + comp.rating.toFixed(1) + '</span><span class="r-rank">' + esc(comp.rank) + '</span></div><div class="bar"><i style="width:' + Math.min(100, comp.rating) + '%"></i></div></div>';
  };
  H.tokens = function (left, total) {
    let s = ''; for (let i = 0; i < Math.max(total, left); i++) s += '<b class="' + (i < left ? '' : 'off') + '"></b>';
    return '<span class="tokens" title="Fate Tokens: re-spin a result">' + s + ' Fate ' + left + '</span>';
  };
  H.partsBars = function (comp) {
    const items = [['Strength', comp.parts.str, FW.WEIGHTS.str], ['Durability', comp.parts.dur, FW.WEIGHTS.dur], ['Speed', comp.parts.spd, FW.WEIGHTS.spd], ['Fighting', comp.parts.fgt, FW.WEIGHTS.fgt], ['Intellect', comp.parts.int, FW.WEIGHTS.int], ['Weapon', comp.parts.wpn, FW.WEIGHTS.wpnE], ['Power', comp.parts.pwr, FW.WEIGHTS.powE]];
    return items.map(i => '<div class="meter"><span>' + i[0] + '</span><div class="bar"><i style="width:' + Math.min(100, i[1] / i[2]) + '%"></i></div><span>' + Math.round(i[1] / i[2]) + '</span></div>').join('');
  };
  /* buff/debuff table of everything affecting the hero */
  H.modTable = function (comp) {
    const rows = [];
    comp.sources.forEach(s => {
      const chips = FW.chips(s.p).filter(c => c.k !== 'info');
      if (!chips.length) return;
      rows.push('<tr><td>' + esc(s.label) + '</td><td>' + chips.map(c => '<span class="mod ' + c.k + '">' + esc(c.t) + '</span>').join(' ') + '</td></tr>');
    });
    return '<table class="table"><thead><tr><th>Source</th><th>Effect</th></tr></thead><tbody>' + (rows.join('') || '<tr><td colspan="2">No modifiers</td></tr>') + '</tbody></table>';
  };
  H.battle = function (hero, opp, arena, rep) {
    const pct = x => Math.round(x * 100);
    const adj = rep.adj.map(a => '<div class="adj"><span>' + esc(a.label) + '</span><b class="' + a.kind + '">' + (a.d >= 0 ? '+' : '−') + Math.abs(a.d).toFixed(1) + '</b></div>').join('') || '<div class="adj"><span>No situational modifiers</span><b>0</b></div>';
    return '<div class="fx-card"><h3>Battle report</h3>' +
      '<div class="vs"><div><b>' + rep.hero.toFixed(1) + '</b><span>' + esc(hero) + '</span></div><div style="opacity:.6">VS</div><div><b>' + rep.opp + '</b><span>' + esc(opp) + '</span></div></div>' +
      '<div class="adj"><span>Arena</span><b>' + esc(arena) + '</b></div>' + adj +
      '<div class="odds" style="margin-top:10px"><div class="oddsbar"><i style="width:' + pct(rep.pWin) + '%;background:#2f9e57">' + (pct(rep.pWin) > 9 ? pct(rep.pWin) + '%' : '') + '</i><i style="width:' + pct(rep.pDraw) + '%;background:#8a8a8a"></i><i style="width:' + Math.max(1, pct(rep.pLose)) + '%;background:#b8383b">' + (pct(rep.pLose) > 9 ? pct(rep.pLose) + '%' : '') + '</i></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:12.5px;opacity:.8"><span>Victory ' + pct(rep.pWin) + '%</span><span>Stalemate ' + pct(rep.pDraw) + '%</span><span>Defeat ' + pct(rep.pLose) + '%</span></div></div></div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
