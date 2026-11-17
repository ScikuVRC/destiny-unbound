/* Destiny Unbound "Content & mods": one place for everything that changes what can roll.
   Three tabs: What can happen (presets, saga rules, chapter groups), the Wheel Workshop (switch entries off, make them
   rarer or more common, add your own) and Packs and mods. Everything saves as it changes.
   Content switches are a layer over the Workshop: switching a group off removes its entries in the Workshop, so Legend
   Codes, packs and saved edits keep working. The saga rules are the same story options the game always had.
   Built from the remodel that 50 test players tried (mockups/remodel/test-results.md).
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html,
    App = window.FWApp,
    S = FW.Story;
  const $ = s => document.querySelector(s);
  const t = s => (FW.t ? FW.t(s) : s);
  const esc = s => H.esc(String(s));
  const state = () => App.state;
  let tab = 'happen',
    wheel = 'race',
    query = '',
    editing = -1; // the own entry open in the editor (index in this wheel's added list)

  /* ---------- the wheels the Workshop can edit (same list and order as before) ---------- */
  const MAIN = [
    ['race', 'Races'],
    ['story', 'Story chapters'],
    ['cls', 'Classes'],
    ['wpn', 'Weapons'],
    ['pow', 'Powers'],
    ['weak', 'Weaknesses'],
    ['pet', 'Companions'],
    ['birth', 'Birthplaces'],
  ];
  function wheels() {
    const more = [
      ['bg', 'Backgrounds'],
      ['per', 'Personalities'],
      ['enh', 'Enhancements'],
      ['elem', 'Elements'],
      ['title', 'Titles'],
      ['mark', 'Marks of Fate'],
      ['hair', 'Hair'],
      ['eyes', 'Eyes'],
      ['garb', 'Outfits'],
    ]
      .concat(Object.keys(FW.SUBS || {}).map(k => ['sub:' + k, k + ' kinds']))
      .concat((FW.STATS || []).map(s => ['ladder:' + s, FW.LADDERS[s].label + ' tiers']));
    return MAIN.filter(m => m[0] !== 'story' || S).concat(more);
  }
  const nameOf = k => (wheels().find(w => w[0] === k) || [k, k])[1];
  const isLadder = k => k.indexOf('ladder:') === 0;
  function base(k) {
    if (k.indexOf('sub:') === 0) return FW.SUBS[k.slice(4)].rows.map(r => ({ name: r.name, w: r.w }));
    if (k === 'story') return S.CHAPTERS.filter(c => !c.retire).map(c => ({ name: c.name, w: c.w }));
    if (isLadder(k)) {
      const L = FW.LADDERS[k.slice(7)];
      const w = FW.ladderBase(L.names.length, L.pk, L.decay);
      return L.names.map((n, i) => ({ name: n, w: Math.round(w[i] * 100) / 100 }));
    }
    return FW.LISTS[k]().map(r => ({ name: r.name, w: r.w }));
  }

  /* ---------- saved edits ---------- */
  function ovOf(k) {
    const o = JSON.parse(JSON.stringify(state().overrides[k] || {}));
    o.weights = o.weights || {};
    o.removed = o.removed || [];
    o.added = o.added || [];
    return o;
  }
  function saveOv(k, o) {
    const empty = !Object.keys(o.weights).length && !o.removed.length && !o.added.length;
    if (empty) delete state().overrides[k];
    else state().overrides[k] = o;
    App.store.set('fw.overrides', state().overrides);
    if (App.hooks.workshopChanged) App.hooks.workshopChanged(k); // e.g. the hand-pick lists drop removed entries
    const s = $('#hubStatus');
    if (s) {
      s.textContent = t('Saved. Applies to your next spins.');
      clearTimeout(s._t);
      s._t = setTimeout(() => (s.textContent = t('Changes save as you go.')), 2500);
    }
  }
  function setRemoved(k, names, off) {
    const o = ovOf(k);
    names.forEach(n => {
      const i = o.removed.indexOf(n);
      if (off && i < 0) o.removed.push(n);
      if (!off && i >= 0) o.removed.splice(i, 1);
    });
    saveOv(k, o);
  }

  /* ---------- What can happen ---------- */
  // chapter groups in plain words; each switch removes or restores its chapters in the Workshop
  const GROUPS = [
    ['romance', 'Romance and heirs', ['Find love', 'Have an heir', 'Your heir comes of age']],
    [
      'rivals',
      'Rivals and betrayal',
      ['Your nemesis strikes', 'Betrayed by an ally', 'A rival appears', 'Final showdown'],
    ],
    [
      'war',
      'Kingdoms and war',
      ['Forge a kingdom', 'Conquer a race', 'Conquer the world', 'Rebellion in your kingdom', 'War of succession'],
    ],
    [
      'dark',
      'Demons and prophecy',
      ['Bargain with a demon', 'The demon comes to collect', 'The ancient seal weakens', 'The evil awakens'],
    ],
    ['grim', 'Curses and plague', ['Cursed', 'Plague', 'Lose everything', 'Exiled']],
  ];
  // races that break a classic fantasy feel
  const NOT_CLASSIC = [
    'Cyborg',
    'Android',
    'Automaton',
    'Mutant',
    'Eldritch Horror',
    'Cosmic Entity',
    'Voidling',
    'Starchild',
    'Chronoborn',
  ];
  const GENTLE_CH = ['Cursed', 'Plague'];
  const chapters = () => (S ? S.CHAPTERS.map(c => c.name) : []);
  const groupNames = g => g[2].filter(n => chapters().indexOf(n) >= 0);
  const raceNames = () => FW.LISTS.race().map(r => r.name);
  const opts = () => (FW.gameOptions ? FW.gameOptions() : {});
  function setOpt(id, on) {
    const cur = App.store.get('fw.options', {});
    cur[id] = on;
    App.store.set('fw.options', cur);
    if (window.FWAchieve) window.FWAchieve.sync();
  }
  function groupState(g) {
    const removed = ovOf('story').removed,
      n = groupNames(g),
      off = n.filter(x => removed.indexOf(x) >= 0).length;
    return off === 0 ? 'on' : off === n.length ? 'off' : 'some';
  }
  function preset() {
    const o = opts(),
      story = ovOf('story').removed,
      races = ovOf('race').removed;
    const allOn = (S ? S.OPTIONS : []).every(x => o[x.id] !== false);
    const anyGroupOff = GROUPS.some(g => groupState(g) !== 'on');
    const classicOff = NOT_CLASSIC.filter(n => raceNames().indexOf(n) >= 0).every(n => races.indexOf(n) >= 0);
    const anyClassicOff = NOT_CLASSIC.some(n => races.indexOf(n) >= 0);
    if (allOn && !anyGroupOff && !anyClassicOff && !story.length) return 'everything';
    const othersOn = (S ? S.OPTIONS : []).every(x => x.id === 'death' || o[x.id] !== false);
    const gentle =
      o.death === false &&
      othersOn &&
      GENTLE_CH.every(n => story.indexOf(n) >= 0) &&
      story.every(n => GENTLE_CH.indexOf(n) >= 0);
    if (gentle && !anyClassicOff) return 'gentle';
    if (classicOff && allOn && !anyGroupOff && !story.length) return 'classic';
    return 'custom';
  }
  function applyPreset(p) {
    const allGroup = GROUPS.reduce((a, g) => a.concat(groupNames(g)), []);
    const classic = NOT_CLASSIC.filter(n => raceNames().indexOf(n) >= 0);
    // presets replace each other: start from the full game, then apply this preset's changes
    (S ? S.OPTIONS : []).forEach(x => setOpt(x.id, true));
    setRemoved('story', allGroup.concat(GENTLE_CH), false);
    setRemoved('race', classic, false);
    if (p === 'gentle') {
      setOpt('death', false);
      setRemoved('story', GENTLE_CH, true);
    } else if (p === 'classic') setRemoved('race', classic, true);
    App.toast(t('Preset applied. Changes save as you go.'));
  }
  const tog = (attr, id, on, label, some) =>
    '<button class="o-tog' +
    (on ? ' on' : '') +
    '" role="switch" aria-checked="' +
    (some ? 'mixed' : !!on) +
    '" ' +
    attr +
    '="' +
    esc(id) +
    '" aria-label="' +
    esc(t(label)) +
    '"><i></i><span>' +
    esc(t(some ? 'Some off' : on ? 'On' : 'Off')) +
    '</span></button>';
  const row = (label, note, control) =>
    '<div class="o-row"><span class="o-lab">' +
    esc(t(label)) +
    (note ? '<small>' + esc(t(note)) + '</small>' : '') +
    '</span><div class="o-ctl">' +
    control +
    '</div></div>';
  const NOTES = { death: 'Lost battles and curses can end a saga. Old age is the separate Aging switch.' };
  function happen() {
    const p = preset(),
      o = opts();
    const cards = [
      ['everything', 'Everything', 'The full game, as designed'],
      ['gentle', 'Gentle', 'No death, no curses, no plague'],
      ['classic', 'Classic fantasy', 'No sci-fi or cosmic races'],
      ['custom', 'Custom', 'Your own mix (set below)'],
    ];
    return (
      '<p class="legend-key">' +
      esc(t('Quick start: pick a preset, or switch single things off below. Changes save as you go.')) +
      '</p><div class="hub-presets">' +
      cards
        .map(
          c =>
            '<button class="hub-card' +
            (c[0] === p ? ' on' : '') +
            '" aria-pressed="' +
            (c[0] === p) +
            '" data-preset="' +
            c[0] +
            '"><b>' +
            esc(t(c[1])) +
            '</b><small>' +
            esc(t(c[2])) +
            '</small></button>'
        )
        .join('') +
      '</div><div class="hub-cols"><div class="o-grp"><h3>' +
      esc(t('How sagas work')) +
      '</h3>' +
      (S ? S.OPTIONS : [])
        .map(x => row(x.name, NOTES[x.id] || x.blurb, tog('data-opt', x.id, o[x.id] !== false, x.name)))
        .join('') +
      '</div><div class="o-grp"><h3>' +
      esc(t('Story chapters')) +
      '</h3>' +
      GROUPS.filter(g => groupNames(g).length)
        .map(g => {
          const s = groupState(g);
          return row(g[1], groupNames(g).join(', '), tog('data-grp', g[0], s !== 'off', g[1], s === 'some'));
        })
        .join('') +
      '</div></div><p class="hub-more"><b>' +
      esc(t('Want to pick single chapters, races or weapons?')) +
      '</b> ' +
      esc(t('Every entry on every wheel can be switched off or made rarer.')) +
      ' <button class="btn small" data-tab-go="workshop">' +
      esc(t('Open the Wheel Workshop')) +
      ' ›</button></p>'
    );
  }

  /* ---------- Wheel Workshop ---------- */
  const LEVEL = share =>
    share < 0.005
      ? 'Legendary'
      : share < 0.02
        ? 'Very rare'
        : share < 0.04
          ? 'Rare'
          : share < 0.08
            ? 'Uncommon'
            : share < 0.15
              ? 'Common'
              : 'Very common';
  function matches(k, q) {
    if (!q) return true;
    if (
      nameOf(k).toLowerCase().indexOf(q) >= 0 ||
      String(t(nameOf(k)))
        .toLowerCase()
        .indexOf(q) >= 0
    )
      return true;
    const o = ovOf(k);
    return (
      base(k).some(r => r.name.toLowerCase().indexOf(q) >= 0) || o.added.some(a => a.name.toLowerCase().indexOf(q) >= 0)
    );
  }
  function workshop() {
    const q = query.trim().toLowerCase();
    // searching jumps to the first wheel that has a match
    if (q && !matches(wheel, q)) {
      const hit = wheels().find(w => matches(w[0], q));
      if (hit) wheel = hit[0];
    }
    const o = ovOf(wheel),
      lad = isLadder(wheel);
    const rows = base(wheel).map(r => ({
      name: r.name,
      w: o.weights[r.name] != null ? o.weights[r.name] : r.w,
      off: o.removed.indexOf(r.name) >= 0,
    }));
    const added = o.added.map((a, i) => ({ name: a.name, w: a.w, custom: i }));
    const all = rows.concat(added);
    const total = all.filter(r => !r.off).reduce((s, r) => s + r.w, 0) || 1;
    const shown = all.filter(
      r => !q || nameOf(wheel).toLowerCase().indexOf(q) >= 0 || r.name.toLowerCase().indexOf(q) >= 0
    );
    const main = MAIN.filter(m => m[0] !== 'story' || S);
    const more = wheels().filter(w => !main.some(m => m[0] === w[0]));
    const changed = k => {
      const x = ovOf(k);
      return Object.keys(x.weights).length + x.removed.length + x.added.length;
    };
    const side =
      '<input class="hub-search" id="hubSearch" placeholder="' +
      esc(t('Find a wheel or entry…')) +
      '" aria-label="' +
      esc(t('Find a wheel or entry')) +
      '" value="' +
      esc(query) +
      '"><div class="hub-list">' +
      main
        .filter(m => !q || matches(m[0], q))
        .map(
          m =>
            '<button data-wheel="' +
            m[0] +
            '" class="' +
            (m[0] === wheel ? 'on' : '') +
            '">' +
            esc(t(m[1])) +
            (changed(m[0]) ? '<em>' + changed(m[0]) + ' ' + esc(t('changed')) + '</em>' : '') +
            '</button>'
        )
        .join('') +
      '</div><select class="o-sel" id="hubMore" aria-label="' +
      esc(t('More wheels')) +
      '"><option value="">' +
      esc(t('More wheels')) +
      ' (' +
      more.length +
      ')</option>' +
      more
        .map(
          w =>
            '<option value="' + esc(w[0]) + '"' + (w[0] === wheel ? ' selected' : '') + '>' + esc(t(w[1])) + '</option>'
        )
        .join('') +
      '</select>';
    const list = shown
      .map(r => {
        const share = r.off ? 0 : r.w / total;
        const id = r.custom != null ? 'c' + r.custom : 'b' + r.name;
        return (
          '<div class="ws-e' +
          (r.off ? ' off' : '') +
          '">' +
          (lad || r.custom != null
            ? '<span></span>'
            : '<input type="checkbox" data-onoff="' +
              esc(r.name) +
              '"' +
              (r.off ? '' : ' checked') +
              ' aria-label="' +
              esc(r.name) +
              '">') +
          '<span class="ws-n">' +
          esc(r.name) +
          (r.custom != null ? ' <small>(' + esc(t('your own')) + ')</small>' : '') +
          '</span><button class="btn small ghost" data-rarer="' +
          esc(id) +
          '" aria-label="' +
          esc(t('Rarer')) +
          ': ' +
          esc(r.name) +
          '"' +
          (r.off ? ' disabled' : '') +
          '>− ' +
          esc(t('Rarer')) +
          '</button><button class="btn small ghost" data-common="' +
          esc(id) +
          '" aria-label="' +
          esc(t('More common')) +
          ': ' +
          esc(r.name) +
          '"' +
          (r.off ? ' disabled' : '') +
          '>+ ' +
          esc(t('More common')) +
          '</button><span class="ws-lv">' +
          (r.off ? esc(t('Off')) : esc(t(LEVEL(share))) + ' · ' + (share * 100).toFixed(share < 0.1 ? 1 : 0) + '%') +
          '</span>' +
          (r.custom != null
            ? '<button class="btn small ghost" data-edit="' +
              r.custom +
              '" aria-label="' +
              esc(t('Edit')) +
              ': ' +
              esc(r.name) +
              '">✎</button><button class="btn small ghost" data-unadd="' +
              r.custom +
              '" aria-label="' +
              esc(t('Delete')) +
              ': ' +
              esc(r.name) +
              '">✕</button>'
            : '<span></span>') +
          '</div>'
        );
      })
      .join('');
    const on = rows.filter(r => !r.off).length;
    return (
      '<div class="hub-ws"><div class="hub-side">' +
      side +
      '</div><div><p class="legend-key">' +
      esc(t(nameOf(wheel))) +
      ': ' +
      all.length +
      ' ' +
      esc(t('entries')) +
      (lad ? '' : ', ' + on + ' ' + esc(t('on'))) +
      '. ' +
      esc(t('Each + doubles the chance; each − halves it.')) +
      '</p><div class="ws-list">' +
      (list || '<p>' + esc(t('Nothing matches.')) + '</p>') +
      '</div>' +
      editor(wheel, o) +
      (lad
        ? ''
        : '<div class="field ws-add"><input id="hubAddName" placeholder="' +
          esc(t('Add your own entry')) +
          '" maxlength="40" aria-label="' +
          esc(t('Add your own entry')) +
          '"><button class="btn small" id="hubAdd">' +
          esc(t('Add')) +
          '</button></div><p class="legend-key">' +
          esc(t('Press ✎ on your own entry to give it a description and effects.')) +
          '</p>') +
      '<div class="cta" style="justify-content:flex-start;margin:6px 0 0"><button class="btn small ghost" id="hubAllOn">' +
      esc(t('All on')) +
      '</button><button class="btn small ghost" id="hubReset">' +
      esc(t('Reset this wheel')) +
      '</button></div></div></div>'
    );
  }

  /* ---------- the editor for an own entry: name, good and bad side, and checked effects (engine.js, FW.OWN) ---------- */
  const STAT_NAMES = {
    str: 'Strength',
    spd: 'Speed',
    dur: 'Durability',
    int: 'Intelligence',
    fgt: 'Fighting',
    wpn: 'Weapon mastery',
    pwr: 'Power mastery',
  };
  const LIFE = [
    ['s', 'Short-lived'],
    ['m', 'Medium'],
    ['l', 'Long-lived'],
    ['a', 'Ageless'],
  ];
  const canFx = k => !!FW.LISTS[k] && k !== 'story' && !isLadder(k);
  function editor(k, o) {
    const a = editing >= 0 ? o.added[editing] : null;
    if (!a) return '';
    const fx = a.fx || {},
      res = FW.ownDsl(k, fx);
    const num = (id, lo, hi) =>
      '<select class="o-sel" data-fx="' +
      id +
      '" aria-label="' +
      esc(t(STAT_NAMES[id] || 'Fate Tokens')) +
      '">' +
      Array.from({ length: hi - lo + 1 }, (x, i) => lo + i)
        .map(
          v =>
            '<option value="' +
            v +
            '"' +
            ((+fx[id] || 0) === v ? ' selected' : '') +
            '>' +
            (v > 0 ? '+' : '') +
            v +
            '</option>'
        )
        .join('') +
      '</select>';
    const elem = (id, label) =>
      '<label><span>' +
      esc(t(label)) +
      '</span><select class="o-sel" data-fx="' +
      id +
      '"><option value="">' +
      esc(t('None')) +
      '</option>' +
      FW.OWN.elems
        .map(
          e =>
            '<option value="' +
            e +
            '"' +
            (fx[id] === e ? ' selected' : '') +
            '>' +
            esc(t(e[0].toUpperCase() + e.slice(1))) +
            '</option>'
        )
        .join('') +
      '</select></label>';
    let chips = '';
    try {
      chips = FW.chips(FW.parse(res.dsl))
        .map(c => '<span class="mod ' + c.k + '">' + esc(t(c.t)) + '</span>')
        .join('');
    } catch (e) {
      chips = '';
    }
    return (
      '<div class="ws-edit"><h4>' +
      esc(t('Edit your entry')) +
      '</h4><div class="ws-edit-grid"><label><span>' +
      esc(t('Name')) +
      '</span><input id="weName" maxlength="40" value="' +
      esc(a.name) +
      '"></label><label><span>' +
      esc(t('Good side')) +
      '</span><input id="wePerk" maxlength="120" value="' +
      esc(a.perk || '') +
      '" placeholder="' +
      esc(t('What makes it special')) +
      '"></label><label><span>' +
      esc(t('Bad side')) +
      '</span><input id="weFlaw" maxlength="120" value="' +
      esc(a.flaw || '') +
      '" placeholder="' +
      esc(t('Its drawback (optional)')) +
      '"></label></div>' +
      (canFx(k)
        ? '<div class="ws-fx">' +
          FW.OWN.stats
            .map(s => '<label><span>' + esc(t(STAT_NAMES[s])) + '</span>' + num(s, -2, 2) + '</label>')
            .join('') +
          '<label><span>' +
          esc(t('Fate Tokens')) +
          '</span>' +
          num('fate', -1, 1) +
          '</label>' +
          elem('weak', 'Weak to') +
          elem('res', 'Resists') +
          (k === 'race'
            ? '<label><span>' +
              esc(t('Lifespan')) +
              '</span><select class="o-sel" data-fx="life">' +
              LIFE.map(
                l =>
                  '<option value="' +
                  l[0] +
                  '"' +
                  ((fx.life || 'm') === l[0] ? ' selected' : '') +
                  '>' +
                  esc(t(l[1])) +
                  '</option>'
              ).join('') +
              '</select></label>'
            : '') +
          '</div><p class="legend-key" id="weNet">' +
          esc(FW.fmt(t('Strength of this entry: {n} steps up (at most 3).'), { n: res.net })) +
          '</p><div class="mods">' +
          (chips || '<span class="legend-key">' + esc(t('No effects yet')) + '</span>') +
          '</div>'
        : '') +
      '<div class="cta" style="justify-content:flex-start;margin:8px 0 0"><button class="btn small primary" id="weDone">' +
      esc(t('Done')) +
      '</button></div></div>'
    );
  }

  /* ---------- Packs and mods ---------- */
  function addons() {
    return '<div id="hubMods"></div><hr class="hub-hr"><div id="hubPacks"></div>';
  }

  /* ---------- the window ---------- */
  const TABS = [
    ['happen', 'What can happen'],
    ['workshop', 'Wheel Workshop'],
    ['addons', 'Packs and mods'],
  ];
  function open(which) {
    if (which) tab = which;
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>' +
        esc(t('Content & mods')) +
        '</h2><div class="o-tabs" role="tablist" id="hubTabs"></div><div id="hubBody"></div><p id="hubStatus" class="legend-key" role="status" aria-live="polite">' +
        esc(t('Changes save as you go.')) +
        '</p>'
    );
    const m = $('#modalRoot .modal');
    if (m) m.classList.add('wide');
    draw();
  }
  function draw(focusSel) {
    const tabs = $('#hubTabs'),
      body = $('#hubBody');
    if (!tabs || !body) return;
    tabs.innerHTML = TABS.map(
      x =>
        '<button role="tab" aria-selected="' +
        (x[0] === tab) +
        '" class="' +
        (x[0] === tab ? 'on' : '') +
        '" data-hubtab="' +
        x[0] +
        '">' +
        esc(t(x[1])) +
        '</button>'
    ).join('');
    body.innerHTML = tab === 'happen' ? happen() : tab === 'workshop' ? workshop() : addons();
    if (tab === 'addons') {
      if (App.modsModal) App.modsModal($('#hubMods'));
      if (App.packsModal) App.packsModal($('#hubPacks'));
    }
    wire(body);
    if (focusSel) {
      const f = body.querySelector(focusSel) || tabs.querySelector(focusSel);
      if (f) {
        f.focus();
        if (f.setSelectionRange && f.value) f.setSelectionRange(f.value.length, f.value.length);
      }
    }
  }
  function wire(body) {
    $('#hubTabs')
      .querySelectorAll('[data-hubtab]')
      .forEach(b =>
        b.addEventListener('click', () => {
          tab = b.dataset.hubtab;
          draw('[data-hubtab="' + tab + '"]');
        })
      );
    const on = (sel, fn) => body.querySelectorAll(sel).forEach(el => el.addEventListener('click', () => fn(el)));
    on('[data-tab-go]', el => {
      tab = el.dataset.tabGo;
      draw();
    });
    on('[data-preset]', el => {
      if (el.dataset.preset !== 'custom') applyPreset(el.dataset.preset);
      draw('[data-preset="' + el.dataset.preset + '"]');
    });
    on('[data-opt]', el => {
      setOpt(el.dataset.opt, !el.classList.contains('on'));
      const s = $('#hubStatus');
      if (s) s.textContent = t('Saved. Applies from the next chapter.');
      draw('[data-opt="' + el.dataset.opt + '"]');
    });
    on('[data-grp]', el => {
      const g = GROUPS.find(x => x[0] === el.dataset.grp);
      setRemoved('story', groupNames(g), groupState(g) !== 'off');
      draw('[data-grp="' + g[0] + '"]');
    });
    on('[data-wheel]', el => {
      wheel = el.dataset.wheel;
      editing = -1;
      draw('[data-wheel="' + wheel + '"]');
    });
    const more = body.querySelector('#hubMore');
    if (more)
      more.addEventListener('change', () => {
        if (!more.value) return;
        wheel = more.value;
        editing = -1;
        draw('#hubMore');
      });
    const search = body.querySelector('#hubSearch');
    if (search)
      search.addEventListener('input', () => {
        query = search.value;
        draw('#hubSearch');
      });
    body.querySelectorAll('[data-onoff]').forEach(cb =>
      cb.addEventListener('change', () => {
        setRemoved(wheel, [cb.dataset.onoff], !cb.checked);
        draw('[data-onoff="' + cb.dataset.onoff.replace(/"/g, '\\"') + '"]');
      })
    );
    const step = (id, f) => {
      const o = ovOf(wheel);
      if (id[0] === 'c') {
        const a = o.added[+id.slice(1)];
        a.w = Math.max(0.01, Math.round(a.w * f * 100) / 100);
      } else {
        const n = id.slice(1),
          b = base(wheel).find(r => r.name === n);
        const w = o.weights[n] != null ? o.weights[n] : b.w;
        o.weights[n] = Math.max(0.01, Math.round(w * f * 100) / 100);
        if (Math.abs(o.weights[n] - b.w) < 0.005) delete o.weights[n];
      }
      saveOv(wheel, o);
    };
    on('[data-rarer]', el => {
      step(el.dataset.rarer, 0.5);
      draw('[data-rarer="' + el.dataset.rarer.replace(/"/g, '\\"') + '"]');
    });
    on('[data-common]', el => {
      step(el.dataset.common, 2);
      draw('[data-common="' + el.dataset.common.replace(/"/g, '\\"') + '"]');
    });
    on('[data-edit]', el => {
      editing = editing === +el.dataset.edit ? -1 : +el.dataset.edit;
      draw(editing >= 0 ? '#weName' : null);
    });
    body.querySelectorAll('[data-fx]').forEach(sel =>
      sel.addEventListener('change', () => {
        const o = ovOf(wheel),
          a = o.added[editing];
        if (!a) return;
        const fx = Object.assign({}, a.fx || {});
        const k = sel.dataset.fx;
        fx[k] = k === 'weak' || k === 'res' || k === 'life' ? sel.value : +sel.value;
        if (FW.ownDsl(wheel, fx).over) {
          App.toast(
            FW.fmt(t('Too strong: an entry can add at most {n} steps up. Add a drawback first.'), { n: FW.OWN.max })
          );
          return draw('[data-fx="' + k + '"]');
        }
        a.fx = fx;
        saveOv(wheel, o);
        draw('[data-fx="' + k + '"]');
      })
    );
    [
      ['#weName', 'name', 40],
      ['#wePerk', 'perk', 120],
      ['#weFlaw', 'flaw', 120],
    ].forEach(([id, key, max]) => {
      const el = body.querySelector(id);
      if (el)
        el.addEventListener('change', () => {
          const o = ovOf(wheel),
            a = o.added[editing];
          if (!a) return;
          const v = el.value.trim().slice(0, max);
          if (key === 'name' && !v) return App.toast(t('Give the entry a name'));
          a[key] = v;
          saveOv(wheel, o);
          draw(id);
        });
    });
    const done = body.querySelector('#weDone');
    if (done)
      done.addEventListener('click', () => {
        editing = -1;
        draw();
      });
    on('[data-unadd]', el => {
      editing = -1;
      const o = ovOf(wheel);
      o.added.splice(+el.dataset.unadd, 1);
      saveOv(wheel, o);
      draw();
    });
    const add = body.querySelector('#hubAdd');
    if (add)
      add.addEventListener('click', () => {
        const n = $('#hubAddName').value.trim();
        if (!n) return App.toast(t('Give the entry a name'));
        const o = ovOf(wheel);
        o.added.push({ name: n.slice(0, 40), w: 5 });
        saveOv(wheel, o);
        editing = o.added.length - 1; // open the editor for the new entry
        draw('#wePerk');
      });
    const allOn = body.querySelector('#hubAllOn');
    if (allOn)
      allOn.addEventListener('click', () => {
        const o = ovOf(wheel);
        o.removed = [];
        saveOv(wheel, o);
        draw('#hubAllOn');
      });
    const reset = body.querySelector('#hubReset');
    if (reset)
      reset.addEventListener('click', () => {
        saveOv(wheel, { weights: {}, removed: [], added: [] });
        App.toast(t('Reset to defaults'));
        draw('#hubReset');
      });
  }

  /* ---------- "Never roll this again", offered under a result ---------- */
  function neverRoll(k, name) {
    if (!base(k).some(r => r.name === name)) return false;
    setRemoved(k, [name], true);
    App.toast('"' + name + '" ' + t('will never come up again. Undo it in Content & mods.'));
    return true;
  }
  const canHide = (k, name) =>
    !!k && !isLadder(k) && (k === 'story' ? !!S : !!FW.LISTS[k]) && base(k).some(r => r.name === name);

  /* ---------- a one-time tip after the first finished saga ---------- */
  function tip() {
    if (App.store.get('fw.tipContent', false) || $('.tip-card')) return;
    App.store.set('fw.tipContent', true);
    setTimeout(() => {
      const d = document.createElement('div');
      d.className = 'tip-card';
      d.setAttribute('role', 'status');
      d.innerHTML =
        '<b>' +
        esc(t('Tip')) +
        '</b>' +
        esc(
          t(
            "Don't like something on the wheels? Switch off death, romance, whole chapters or single races in Content & mods, on the main menu."
          )
        ) +
        '<div class="cta"><button class="btn small primary" data-tip="show">' +
        esc(t('Show me')) +
        '</button><button class="btn small ghost" data-tip="ok">' +
        esc(t('Got it')) +
        '</button></div>';
      document.body.appendChild(d);
      d.querySelector('[data-tip="show"]').onclick = () => {
        d.remove();
        open('happen');
      };
      d.querySelector('[data-tip="ok"]').onclick = () => d.remove();
      setTimeout(() => d.remove(), 20000);
    }, 2500);
  }

  App.contentModal = open;
  App.contentTip = tip;
  App.neverRoll = neverRoll;
  App.canNeverRoll = canHide;
})();
