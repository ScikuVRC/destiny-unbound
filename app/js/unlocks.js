/* Destiny Unbound unlockables (22): honour titles and card backs earned by playing, not bought, and only for looks.
   A title shows on the front of every card under the hero's name; a card back joins the Style menu.
   - Titles come from achievements and from the Bestiary: beat every foe of an arena world to become its Champion (129).
   - Card backs come from player levels (hall.js) and from achievements (FW.CARD_BACKS entries with `unlock`).
   FW.Unlocks is plain logic (tested in node); the Style menu buttons and the unlock list need the page.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  // a title from an achievement: [achievement id, title]
  const FROM_ACH = [
    ['dragon', 'Dragonslayer'],
    ['nemesis', 'Bane of Rivals'],
    ['giant', 'Giant-Killer'],
    ['underdog', 'Against All Odds'],
    ['dynasty', 'Founder of a Dynasty'],
    ['world', 'Ruler of the World'],
    ['legend', 'Living Legend'],
    ['martyr', 'The Selfless'],
    ['devil', 'Devil-Bound'],
    ['secret', 'Keeper of Secrets'],
    ['lichPupil', 'Lich-Taught'],
    ['saint', 'The Saint'],
    ['wicked', 'The Wicked'],
    ['guildhead', 'Head of the Guild'],
    ['ancestor', 'Blood-Remembered'],
    ['barkeep', 'Keeper of the Best Tavern'],
  ];
  const U = (FW.Unlocks = {
    // every title there is: { id, name, how, test(ctx) }; ctx = { ach: {id: date}, codex: the Codex book }
    titles() {
      const achs = FW.ACHIEVEMENTS || [],
        byId = {};
      achs.forEach(a => (byId[a.id] = a));
      const out = FROM_ACH.filter(x => !FW.ACHIEVEMENTS || byId[x[0]]).map(([id, name]) => ({
        id: 'ach:' + id,
        name,
        kind: 'achievement',
        ach: id,
        // a hidden achievement keeps its secret: the hint is its riddle
        how: byId[id] ? (byId[id].hidden ? byId[id].riddle : byId[id].desc) : '',
        desc: byId[id] ? byId[id].desc : '',
        test: ctx => !!(ctx.ach && ctx.ach[id]),
      }));
      // the Hall tournament (121)
      out.push({
        id: 'cup',
        name: 'Champion of the Hall',
        kind: 'cup',
        how: 'Win a Hall tournament (Versus).',
        test: ctx => (ctx.cups || 0) > 0,
      });
      // the arena gauntlet (11): all five rounds won
      out.push({
        id: 'gauntlet',
        name: 'Gauntlet Champion',
        kind: 'gauntlet',
        how: 'Win all five rounds of the Gauntlet.',
        test: ctx => (ctx.gauntlet || 0) > 0,
      });
      // world champions (129): every foe of a world beaten at least once, in the arena or in a saga
      (FW.UNIVERSES || []).forEach(u =>
        out.push({
          id: 'champ:' + u.name,
          name: 'Champion of ' + u.name,
          kind: 'champion',
          world: u.name,
          how: 'Beat every foe of ' + u.name + '.',
          test: ctx => U.worldProgress(ctx.codex, u).done,
        })
      );
      return out;
    },
    // how far along a world's championship is: foes beaten out of all of them
    worldProgress(codex, u) {
      const foe = (codex && codex.foe) || {},
        n = u.opps.filter(o => foe[o.name] && foe[o.name].win > 0).length;
      return { beaten: n, total: u.opps.length, done: n === u.opps.length && n > 0 };
    },
    earned(ctx) {
      return U.titles().filter(x => x.test(ctx || {}));
    },
    // the "has" check card backs use: 'ach:<id>' or 'champ:any'
    has(ctx, key) {
      if (!key) return true;
      if (key === 'champ:any') return (FW.UNIVERSES || []).some(u => U.worldProgress(ctx.codex, u).done);
      if (key.indexOf('ach:') === 0) return !!(ctx.ach && ctx.ach[key.slice(4)]);
      return false;
    },
    // what was earned since last time (for the "New title" note)
    fresh(ctx, seen) {
      const s = seen || {};
      return U.earned(ctx).filter(x => !s[x.id]);
    },
  });

  if (typeof document === 'undefined' || !g.FWApp) return;
  const App = g.FWApp,
    H = FW.html,
    store = App.store,
    $ = s => document.querySelector(s),
    t = s => (FW.t ? FW.t(s) : s);
  const ctx = () => ({
    ach: store.get('fw.achievements', {}) || {},
    codex: store.get('fw.codex', null) || {},
    cups: (store.get('fw.cups', []) || []).length,
    gauntlet: ((store.get('fw.gauntlet', null) || {}).champs || []).length,
  });
  U.ctx = ctx;
  // the title on the card: one the player picked, if they still have it
  App.honour = () => {
    const id = store.get('fw.honour', '');
    if (!id) return '';
    const x = U.earned(ctx()).find(e => e.id === id);
    return x ? t(x.name) : '';
  };
  const syncBtn = () => {
    const b = $('#btnHonour');
    if (!b) return;
    const h = App.honour();
    b.textContent = t('Title') + ': ' + (h || t('none'));
    b.title = t('An honour title under the hero’s name, earned by playing');
  };
  const btn = $('#btnHonour');
  if (btn)
    btn.addEventListener('click', () => {
      const list = [''].concat(U.earned(ctx()).map(x => x.id));
      if (list.length < 2) return App.toast(t('No titles yet. See how to earn them under All unlocks.'));
      const i = list.indexOf(store.get('fw.honour', ''));
      store.set('fw.honour', list[(i + 1) % list.length]);
      App.drawCardNow();
      syncBtn();
    });
  // everything there is to unlock, and how
  App.unlocksModal = function () {
    const c = ctx(),
      titles = U.titles(),
      got = titles.filter(x => x.test(c)).length,
      lv = App.levelInfo ? App.levelInfo().level : null;
    const titleRow = x => {
      const on = x.test(c);
      // a hidden achievement's riddle until it is earned, then what it was
      let how = t(on && x.desc ? x.desc : x.how);
      if (x.kind === 'champion' && !on) {
        const p = U.worldProgress(
          c.codex,
          (FW.UNIVERSES || []).find(u => u.name === x.world)
        );
        how += ' ' + t('Beaten so far') + ': ' + p.beaten + ' / ' + p.total + '.';
      }
      return (
        '<li class="' +
        (on ? 'got' : '') +
        '"><b>' +
        (on ? '✅ ' : '🔒 ') +
        H.esc(t(x.name)) +
        '</b><span>' +
        H.esc(how) +
        '</span></li>'
      );
    };
    const backs = (FW.CARD_BACKS || []).map(b => {
      const on = (lv == null || b.level <= lv) && U.has(c, b.unlock);
      const how = b.unlock
        ? b.unlock === 'champ:any'
          ? t('Become the champion of any arena world.')
          : t('Achievement') +
            ': ' +
            t(((FW.ACHIEVEMENTS || []).find(a => 'ach:' + a.id === b.unlock) || {}).name || '')
        : FW.fmt(t('Level {n}'), { n: b.level });
      return (
        '<li class="' +
        (on ? 'got' : '') +
        '"><b>' +
        (on ? '✅ ' : '🔒 ') +
        H.esc(t(b.name)) +
        '</b><span>' +
        H.esc(how) +
        '</span></li>'
      );
    });
    App.openModal(
      '<button class="btn small ghost close">' +
        H.esc(t('Close')) +
        ' ✕</button><h2>' +
        H.esc(t('Unlocks')) +
        '</h2><p class="legend-key">' +
        H.esc(t('Titles and card backs change only how your cards look. Pick them in the card’s Style menu.')) +
        '</p><h3 class="opt-h">' +
        H.esc(t('Titles')) +
        ' <small>' +
        got +
        ' / ' +
        titles.length +
        '</small></h3><ul class="unlock-list">' +
        titles
          .slice()
          .sort((a, b) => b.test(c) - a.test(c))
          .map(titleRow)
          .join('') +
        '</ul><h3 class="opt-h">' +
        H.esc(t('Card backs')) +
        '</h3><ul class="unlock-list">' +
        backs.join('') +
        '</ul>'
    );
  };
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('#btnUnlocks')) App.unlocksModal();
  });
  // a note when something new is earned (checked whenever a card is shown)
  const prev = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prev) prev(L);
    syncBtn();
    setTimeout(() => {
      const seen = store.get('fw.unlockSeen', null);
      const c = ctx(),
        now = U.earned(c);
      if (!seen) {
        // the first time: what an existing player already has counts as seen
        const all = {};
        now.forEach(x => (all[x.id] = 1));
        return store.set('fw.unlockSeen', all);
      }
      const fresh = U.fresh(c, seen);
      if (!fresh.length) return;
      fresh.forEach(x => (seen[x.id] = 1));
      store.set('fw.unlockSeen', seen);
      App.toast('🏅 ' + t('New title') + ': ' + t(fresh[0].name));
      syncBtn();
    }, 3500); // after any achievement banners
  };
})(typeof window !== 'undefined' ? window : globalThis);
