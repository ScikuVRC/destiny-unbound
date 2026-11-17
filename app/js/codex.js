/* Destiny Unbound: the Codex (races, worlds and endings you have come across) and the Bestiary (every arena foe
   and dragon, with your record against them). Entries fill in as you meet them; the gaps show what is left.
   FW.Codex is plain logic (tested in node); the book itself needs the page.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});

  const C = (FW.Codex = {
    empty: () => ({ race: {}, world: {}, end: {}, foe: {} }),
    clean(c) {
      const o = c && typeof c === 'object' ? c : {},
        obj = x => (x && typeof x === 'object' ? x : {});
      return { race: obj(o.race), world: obj(o.world), end: obj(o.end), foe: obj(o.foe) };
    },
    // a hero was made (or a saga ended): their race, and their ending once there is one
    noteHero(c, L) {
      let n = 0;
      const race = L && L.has && L.has('race') ? L.pickName('race') : '';
      if (race && !c.race[race]) n += c.race[race] = 1;
      const end = L && L.saga && L.saga.end;
      if (end && !c.end[end]) n += c.end[end] = 1;
      return n; // how many entries are new
    },
    // a fight against a named foe: met, and won / drawn / lost
    noteFight(c, name, res, world) {
      if (!name) return;
      const f = (c.foe[name] = c.foe[name] || { met: 0, win: 0, draw: 0, lose: 0 });
      f.met++;
      if (f[res] != null) f[res]++;
      if (world) c.world[world] = 1;
    },
    // what an existing player already met, from the Hall (heroes saved before the Codex existed)
    fromHall(c, hall) {
      const names = (FW.RACES || []).map(r => r.name).sort((a, b) => b.length - a.length);
      (hall || []).forEach(h => {
        const r = names.find(n => String(h.race || '').endsWith(n));
        if (r) c.race[r] = 1;
        if (h.saga && h.saga.end) c.end[h.saga.end] = 1;
      });
      return c;
    },
    worldOf(name) {
      const u = (FW.UNIVERSES || []).find(x => x.opps.some(o => o.name === name));
      return u ? u.name : '';
    },
    // the book's chapters, with what is known and what is still a gap
    sections(c) {
      const S = FW.Story || {};
      const races = (FW.RACES || []).map(r => ({ name: r.name, known: !!c.race[r.name], e: r }));
      const worlds = (FW.UNIVERSES || []).map(u => ({ name: u.name, known: !!c.world[u.name], e: u }));
      const ends = Object.keys(S.endLabel || {}).map(id => ({ name: S.endLabel[id], id, known: !!c.end[id] }));
      const foes = (FW.UNIVERSES || [])
        .map(u => ({
          group: u.emoji + ' ' + u.name,
          items: u.opps.map(o => ({ name: o.name, known: !!c.foe[o.name], rec: c.foe[o.name], e: o })),
        }))
        .concat(
          S.DRAGONS
            ? [
                {
                  group: '🐉 Dragons',
                  items: S.DRAGONS.map(o => ({ name: o.name, known: !!c.foe[o.name], rec: c.foe[o.name], e: o })),
                },
              ]
            : []
        );
      const count = list => ({ known: list.filter(x => x.known).length, total: list.length });
      const allFoes = foes.reduce((a, gp) => a.concat(gp.items), []);
      return {
        races: Object.assign({ items: races }, count(races)),
        worlds: Object.assign({ items: worlds }, count(worlds)),
        endings: Object.assign({ items: ends }, count(ends)),
        foes: Object.assign({ groups: foes }, count(allFoes)),
      };
    },
  });

  if (typeof document === 'undefined' || !g.FWApp) return;
  const App = g.FWApp,
    H = FW.html,
    store = App.store,
    t = s => (FW.t ? FW.t(s) : s);
  let book = store.get('fw.codex', null);
  if (!book) {
    book = C.fromHall(C.empty(), App.state.hall);
    store.set('fw.codex', book);
  }
  book = C.clean(book);
  const save = () => store.set('fw.codex', book);

  const prev = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prev) prev(L);
    if (C.noteHero(book, L)) save();
  };
  const prevArena = App.hooks.arenaResult;
  App.hooks.arenaResult = r => {
    if (prevArena) prevArena(r);
    C.noteFight(book, r.opp, r.result, r.world);
    save();
  };
  if (FW.Story)
    FW.Story.onFight = (name, res) => {
      C.noteFight(book, name, res, C.worldOf(name));
      save();
    };

  /* ---------------- the book ---------------- */
  const chips = dsl => {
    try {
      return FW.chips(FW.parse(dsl || ''))
        .map(c => '<span class="mod ' + (c.k || '') + '">' + H.esc(t(c.t)) + '</span>')
        .join('');
    } catch (e) {
      return '';
    }
  };
  const ELEM = { atk: 'Attacks with', weak: 'Weak to', res: 'Resists' };
  function foeCard(x) {
    if (!x.known)
      return '<div class="codex-item unknown" aria-label="' + H.esc(t('Not met yet')) + '"><b>???</b></div>';
    const p = FW.parse(x.e.dsl || ''),
      face = FW.FOE_ART && FW.FOE_ART[x.name],
      mech = FW.BOSS_MECH && FW.BOSS_MECH[x.name],
      r = x.rec || { met: 0, win: 0, draw: 0, lose: 0 };
    const el = Object.keys(ELEM)
      .filter(k => p[k] && p[k].length)
      .map(k => t(ELEM[k]) + ' ' + p[k].map(t).join(', '))
      .join(' · ');
    return (
      '<div class="codex-item">' +
      (face ? '<img src="art/foes/' + face + '.webp" alt="" loading="lazy">' : '') +
      '<b>' +
      H.esc(x.name) +
      '</b><span>' +
      H.esc(FW.fmt(t('Level {n}'), { n: p.lv || '?' })) +
      (el ? ' · ' + H.esc(el) : '') +
      '</span>' +
      (x.e.perk ? '<i>' + H.esc(t(x.e.perk)) + '</i>' : '') +
      (mech && FW.mechText ? '<span class="codex-mech">' + H.esc(t(FW.mechText(mech))) + '</span>' : '') +
      '<span class="codex-rec">' +
      H.esc(
        FW.fmt(t('Met {n} {p:time|times}'), { n: r.met }) +
          ' · ' +
          t('won') +
          ' ' +
          r.win +
          ' · ' +
          t('lost') +
          ' ' +
          r.lose +
          (r.draw ? ' · ' + t('drawn') + ' ' + r.draw : '')
      ) +
      '</span></div>'
    );
  }
  function raceCard(x) {
    if (!x.known) return '<div class="codex-item unknown"><b>???</b></div>';
    return (
      '<div class="codex-item"><b>' +
      H.esc(t(x.name)) +
      '</b>' +
      (x.e.perk ? '<i>' + H.esc(t(x.e.perk)) + '</i>' : '') +
      (x.e.flaw ? '<span class="codex-flaw">' + H.esc(t(x.e.flaw)) + '</span>' : '') +
      '<div class="mods">' +
      chips(x.e.dsl) +
      '</div></div>'
    );
  }
  function worldCard(x) {
    if (!x.known) return '<div class="codex-item unknown"><b>???</b></div>';
    return (
      '<div class="codex-item"><b>' +
      H.esc(x.e.emoji + ' ' + t(x.name)) +
      '</b><i>' +
      H.esc(t(x.e.blurb || '')) +
      '</i><span>' +
      H.esc(FW.fmt(t('{n} {p:foe|foes}'), { n: x.e.opps.length })) +
      '</span></div>'
    );
  }
  function endCard(x) {
    if (!x.known) return '<div class="codex-item unknown"><b>???</b></div>';
    const art = FW.ENDING_ART && FW.ENDING_ART.indexOf(x.id) >= 0;
    return (
      '<div class="codex-item">' +
      (art ? '<img src="art/endings/' + x.id + '.webp" alt="" loading="lazy">' : '') +
      '<b>' +
      H.esc(t(x.name)) +
      '</b></div>'
    );
  }
  const head = (title, s) =>
    '<h3 class="opt-h">' +
    H.esc(t(title)) +
    ' <small>' +
    s.known +
    ' / ' +
    s.total +
    '</small></h3><div class="codex-bar" aria-hidden="true"><i style="width:' +
    Math.round((s.known / Math.max(1, s.total)) * 100) +
    '%"></i></div>';
  App.codexModal = function (tab) {
    const s = C.sections(book),
      which = tab === 'bestiary' ? 'bestiary' : 'codex';
    const tabs =
      '<div class="codex-tabs" role="tablist">' +
      [
        ['codex', 'Codex'],
        ['bestiary', 'Bestiary'],
      ]
        .map(
          ([id, name]) =>
            '<button class="btn small' +
            (id === which ? ' primary' : ' ghost') +
            '" role="tab" aria-selected="' +
            (id === which) +
            '" data-codex="' +
            id +
            '">' +
            H.esc(t(name)) +
            '</button>'
        )
        .join('') +
      '</div>';
    const body =
      which === 'codex'
        ? head('Races', s.races) +
          '<div class="codex-grid">' +
          s.races.items.map(raceCard).join('') +
          '</div>' +
          head('Worlds', s.worlds) +
          '<div class="codex-grid">' +
          s.worlds.items.map(worldCard).join('') +
          '</div>' +
          head('Endings', s.endings) +
          '<div class="codex-grid">' +
          s.endings.items.map(endCard).join('') +
          '</div>'
        : head('Bestiary', s.foes) +
          s.foes.groups
            .map(
              gp =>
                '<h4 class="codex-group">' +
                H.esc(t(gp.group)) +
                ' <small>' +
                gp.items.filter(x => x.known).length +
                ' / ' +
                gp.items.length +
                '</small></h4><div class="codex-grid">' +
                gp.items.map(foeCard).join('') +
                '</div>'
            )
            .join('');
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>' +
        H.esc(t(which === 'codex' ? 'Codex' : 'Bestiary')) +
        '</h2>' +
        tabs +
        '<p class="legend-key">' +
        H.esc(
          t(
            which === 'codex'
              ? 'Races fill in when you make a hero of that race, worlds when you fight there, endings when a saga ends that way.'
              : 'Foes fill in when you fight them, in the arena or in a saga, with your record against each.'
          )
        ) +
        '</p>' +
        body
    );
  };
  // the tabs, and the Codex buttons in the Hall of Legends
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-codex]');
    if (b) App.codexModal(b.dataset.codex);
  });
})(typeof window !== 'undefined' ? window : globalThis);
