/* Destiny Unbound achievements: badges for great (and terrible) sagas. Some unlock rare wheel entries.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html,
    App = window.FWApp,
    S = FW.Story;
  const tr = s => (FW.t ? FW.t(s) : s); // names, descriptions and rewards are looked up in the language pack (app/lang/)
  const log = L => (L.saga ? L.saga.log : []);
  const won = (L, chapter) => log(L).some(x => x.chapter === chapter && x.tone === 'good');
  const fights = L => (L.chron || []).filter(c => c.kind === 'win' || c.kind === 'lose' || c.kind === 'draw');
  const wins = L => fights(L).filter(c => c.kind === 'win');
  const dailyDays = () => {
    try {
      return Object.keys((window.FWApp && window.FWApp.store.get('fw.daily', {})) || {}).length;
    } catch (e) {
      return 0;
    }
  };
  FW.ACHIEVEMENTS = [
    { id: 'first', icon: '🎲', name: 'Fate Spun', desc: 'Finish your first legend.', test: L => !!L.picks.mark },
    {
      id: 'story',
      icon: '📖',
      name: 'Once Upon a Time',
      desc: 'Play a story chapter.',
      test: L => !!(L.saga && L.saga.ch),
    },
    {
      id: 'brief',
      icon: '🪦',
      name: 'Brief but Memorable',
      desc: 'Die in the very first chapter.',
      test: L => !!(L.saga && L.saga.end === 'dead' && L.saga.ch === 1),
    },
    { id: 'ch10', icon: '🔟', name: 'Seasoned', desc: 'Reach chapter 10.', test: L => !!(L.saga && L.saga.ch >= 10) },
    {
      id: 'ch25',
      icon: '🛡️',
      name: 'Unkillable',
      desc: 'Reach chapter 25.',
      test: L => !!(L.saga && L.saga.ch >= 25),
      reward: {
        list: 'title',
        entry: {
          name: 'The Unkillable',
          w: 1,
          dsl: 'tt=3 rt+3',
          perk: 'Survived twenty-five chapters of fate',
          flaw: '',
        },
      },
    },
    {
      id: 'retire',
      icon: '🌅',
      name: 'Happily Ever After',
      desc: 'Retire peacefully.',
      test: L => !!(L.saga && L.saga.end === 'retired'),
    },
    {
      id: 'ascend',
      icon: '✨',
      name: 'Apotheosis',
      desc: 'Ascend to godhood.',
      test: L => !!(L.saga && L.saga.end === 'ascended'),
      reward: { list: 'pow', entry: { name: 'Divine Spark', w: 0.3, dsl: 'rar=5 a=holy', perk: '', flaw: '' } },
    },
    {
      id: 'lost',
      icon: '🌀',
      name: 'Gone Walkabout',
      desc: 'Get lost between worlds.',
      test: L => !!(L.saga && L.saga.end === 'lost'),
    },
    {
      id: 'king',
      icon: '🏰',
      name: 'Crowned',
      desc: 'Forge a kingdom.',
      test: L => !!(L.saga && (L.saga.kingdom || L.saga.world)),
    },
    {
      id: 'world',
      icon: '🌍',
      name: 'Ruler of All',
      desc: 'Conquer the world.',
      test: L => !!(L.saga && L.saga.world),
      reward: {
        list: 'mark',
        entry: {
          name: 'Wheel-Crowned',
          w: 1,
          dsl: 'fate+2 rt+2',
          perk: 'The Wheel itself bowed to your line',
          flaw: '',
        },
      },
    },
    {
      id: 'dragon',
      icon: '🐉',
      name: 'Dragonslayer',
      desc: 'Win the Slay a dragon chapter.',
      test: L => won(L, 'Slay a dragon'),
      reward: {
        list: 'wpn',
        entry: { name: 'Wyrmfang', w: 0.5, dsl: 'q=5 a=fire', perk: "Carved from a slain dragon's tooth", flaw: '' },
      },
    },
    {
      id: 'nemesis',
      icon: '😈',
      name: 'Rivalry Settled',
      desc: 'Defeat your nemesis for good.',
      test: L => !!(L.saga && L.saga.nem && !L.saga.nem.alive),
    },
    {
      id: 'turncoat',
      icon: '🤝',
      name: 'Enemies to Friends',
      desc: 'Turn your nemesis into an ally.',
      test: L => !!(L.saga && L.saga.nem && L.saga.nem.ally),
    },
    { id: 'heir', icon: '👶', name: 'The Line Continues', desc: 'Have an heir.', test: L => !!(L.saga && L.saga.heir) },
    {
      id: 'dynasty',
      icon: '👑',
      name: 'Dynasty',
      desc: 'Reach the third generation of a house.',
      test: L => !!(L.saga && L.saga.dyn && L.saga.dyn.gen >= 3),
      reward: {
        list: 'pet',
        entry: { name: 'Ancestral Spirit', w: 0.6, dsl: 'all+1', perk: 'Your ancestors walk beside you', flaw: '' },
      },
    },
    {
      id: 'hoard',
      icon: '💎',
      name: 'Collector',
      desc: 'Own three artifacts at once.',
      test: L => !!(L.saga && L.saga.artifacts.length >= 3),
    },
    {
      id: 'army',
      icon: '⚔️',
      name: 'Never Alone',
      desc: 'Have five companions at once.',
      test: L => L.ally.length >= 5,
    },
    {
      id: 'underdog',
      icon: '🐭',
      name: 'Underdog',
      desc: 'Win a story battle with less than a 20% chance.',
      test: L => !!(L.saga && L.saga.flags && L.saga.flags.underdog),
    },
    {
      id: 'cosmic',
      icon: '🌌',
      name: 'Cosmic Being',
      desc: 'Reach the Cosmic Being rank.',
      test: L => FW.compute(L).rank === 'Cosmic Being',
    },
    { id: 'god', icon: '⚡', name: 'Born Divine', desc: 'Roll the God race.', test: L => L.raceName() === 'God' },
    {
      id: 'old',
      icon: '🧓',
      name: 'Centenarian',
      desc: 'Live to 100 years or more in a story.',
      test: L => !!(L.saga && S.age(L) >= 100),
    },
    {
      id: 'daily',
      icon: '📅',
      name: 'Daily Dose',
      desc: 'Finish a daily challenge story.',
      test: L => !!(L.daily && L.saga && L.saga.end),
    },
    {
      id: 'daily3',
      icon: '📆',
      name: 'Creature of Habit',
      desc: 'Finish daily challenges on three different days.',
      test: () => dailyDays() >= 3,
    },
    { id: 'arena', icon: '🗡️', name: 'First Blood', desc: 'Win a fight in the arena.', test: L => wins(L).length >= 1 },
    {
      id: 'arena5',
      icon: '🏟️',
      name: 'Arena Champion',
      desc: 'Win five arena fights with one hero.',
      test: L => wins(L).length >= 5,
      reward: {
        list: 'title',
        entry: { name: 'The Arena Champion', w: 1, dsl: 'tt=2 rt+2', perk: 'Five fights, five victories', flaw: '' },
      },
    },
    {
      id: 'giant',
      icon: '🗿',
      name: 'Giant Slayer',
      desc: 'Win an arena fight with less than a 15% chance.',
      test: L => wins(L).some(c => typeof c.p === 'number' && c.p < 0.15),
    },
    {
      id: 'mercy',
      icon: '🕊️',
      name: 'Mercy',
      desc: 'Spare an opponent you beat in the arena.',
      test: L => wins(L).some(c => c.key === 'spare'),
    },
    {
      id: 'recruit',
      icon: '🎖️',
      name: 'Strength in Numbers',
      desc: 'Recruit an opponent you beat in the arena.',
      test: L => wins(L).some(c => c.key === 'recruit'),
    },
    {
      id: 'survivor',
      icon: '🩹',
      name: 'Live to Fight Another Day',
      desc: 'Lose an arena fight, then fight again.',
      test: L => {
        const f = fights(L),
          i = f.findIndex(c => c.kind === 'lose');
        return i >= 0 && f.length > i + 1;
      },
    },
    // story arcs and endings (0.2)
    {
      id: 'prophecy',
      icon: '📜',
      name: 'Written in the Stars',
      desc: 'Fulfil a prophecy.',
      test: L => !!(L.saga && L.saga.flags && L.saga.flags.fulfilled),
    },
    {
      id: 'devil',
      icon: '👿',
      name: "The Devil's Due",
      desc: 'Beat or outwit the demon you made a deal with.',
      test: L => !!(L.saga && L.saga.flags && L.saga.flags.cheated),
    },
    {
      id: 'sleeper',
      icon: '🌑',
      name: 'Light in the Dark',
      desc: 'Destroy the ancient evil beneath the world.',
      test: L => !!(L.saga && L.saga.flags && L.saga.flags.evilSlain),
    },
    {
      id: 'legend',
      icon: '🌟',
      name: 'Into Legend',
      desc: 'Pass into legend.',
      test: L => !!(L.saga && L.saga.end === 'legend'),
    },
    {
      id: 'martyr',
      icon: '🕯️',
      name: 'Greater Love',
      desc: 'Die a hero, saving others.',
      test: L => !!(L.saga && L.saga.end === 'martyr'),
    },
    /* hidden achievements (147): the list shows only a riddle until they are unlocked */
    {
      id: 'secret',
      icon: '🗝️',
      name: 'Off the Map',
      desc: 'Find a secret chapter.',
      hidden: true,
      riddle: 'Some chapters only open for the right hero.',
      test: L => !!(L.saga && L.saga.flags && (L.saga.flags.secrets || []).length),
    },
    {
      id: 'lichPupil',
      icon: '💀',
      name: 'Beyond the Grave',
      desc: 'Meet the Lich King.',
      hidden: true,
      riddle: 'Some teachers wait on the far side of death.',
      test: L => !!(L.saga && L.saga.flags && (L.saga.flags.secrets || []).indexOf('lichKing') >= 0),
    },
    {
      id: 'saint',
      icon: '😇',
      name: 'Saintly',
      desc: 'Reach the kindest alignment there is.',
      hidden: true,
      riddle: 'Be kind. Then be kinder.',
      test: L => !!(L.saga && S && S.align(L.saga) >= S.ALIGN_MAX),
    },
    {
      id: 'wicked',
      icon: '😈',
      name: 'Wicked to the Core',
      desc: 'Reach the darkest alignment there is.',
      hidden: true,
      riddle: 'No mercy. Not once.',
      test: L => !!(L.saga && S && S.align(L.saga) <= -S.ALIGN_MAX),
    },
    {
      id: 'guildhead',
      icon: '🏛️',
      name: 'Head of the Table',
      desc: 'Become the head of a guild.',
      hidden: true,
      riddle: 'Start at the bottom of the hall. End at the head of the table.',
      test: L => !!(L.saga && S && S.guildRank(L.saga) >= 5),
    },
    {
      id: 'ancestor',
      icon: '👻',
      name: 'The Blood Remembers',
      desc: 'Be saved from death by an ancestor.',
      hidden: true,
      riddle: 'Your family is never quite gone.',
      test: L => !!(L.saga && L.saga.flags && L.saga.flags.ancestor),
    },
    {
      id: 'barkeep',
      icon: '🍺',
      name: 'Last Orders',
      desc: 'Retire and run the best tavern in the land.',
      hidden: true,
      riddle: 'Every legend ends up behind a bar.',
      test: L => !!(L.saga && L.saga.flags && L.saga.flags.after === 'The best tavern in the land'),
    },
  ];
  /* milestones (146): long achievements in three steps, bronze, silver and gold, with a progress bar to the next one.
     The counts come from the local play statistics, the daily challenge, the Codex and the monthly badges. */
  FW.MILESTONES = [
    {
      id: 'heroes',
      icon: '🎲',
      name: 'Legend Maker',
      what: 'heroes made',
      of: c => c.stats.legendsFinished || 0,
      tiers: [10, 50, 200],
    },
    {
      id: 'chapters',
      icon: '📖',
      name: 'Storyteller',
      what: 'chapters played',
      of: c => c.stats.chapters || 0,
      tiers: [50, 250, 1000],
    },
    {
      id: 'arena',
      icon: '⚔️',
      name: 'Gladiator',
      what: 'arena fights',
      of: c => c.stats.arenaFights || 0,
      tiers: [10, 50, 200],
    },
    {
      id: 'deaths',
      icon: '🪦',
      name: 'Memento Mori',
      what: 'heroes who died in their saga',
      of: c => c.stats.deaths || 0,
      tiers: [10, 40, 150],
    },
    {
      id: 'retired',
      icon: '🌅',
      name: 'Quiet Lives',
      what: 'heroes who retired',
      of: c => c.stats.retirements || 0,
      tiers: [5, 25, 100],
    },
    {
      id: 'dailies',
      icon: '📅',
      name: 'Daily Devotion',
      what: 'daily challenges finished',
      of: c => c.dailyDays,
      tiers: [5, 30, 100],
    },
    {
      id: 'streak',
      icon: '🔥',
      name: 'Unbroken',
      what: 'days in a row (best daily streak)',
      of: c => c.bestStreak,
      tiers: [3, 7, 30],
    },
    {
      id: 'codex',
      icon: '📚',
      name: 'Chronicler',
      what: 'Codex and Bestiary entries found',
      of: c => c.codex,
      tiers: [30, 100, 200],
    },
    {
      id: 'monthly',
      icon: '🗓️',
      name: 'Month by Month',
      what: 'monthly badges earned',
      of: c => c.monthly,
      tiers: [1, 6, 12],
    },
  ];
  FW.MILESTONE_TIERS = ['', 'bronze', 'silver', 'gold'];
  // how far a milestone is: { value, tier 0-3, next (the count for the next step, or null at gold), pct to next }
  FW.milestoneTier = function (m, value) {
    const v = Math.max(0, Math.floor(+value || 0)),
      tier = m.tiers.filter(x => v >= x).length,
      next = tier < 3 ? m.tiers[tier] : null,
      prev = tier ? m.tiers[tier - 1] : 0;
    return { value: v, tier, next, pct: next == null ? 100 : Math.round(((v - prev) / (next - prev)) * 100) };
  };
  // the counts, read from the player's saved data (or given directly in tests)
  FW.milestoneCtx = function (store) {
    const get = (k, d) => (store ? store.get(k, d) : d) || d;
    const daily = get('fw.daily', {}),
      codex = get('fw.codex', {});
    const today = new Date().toISOString().slice(0, 10);
    return {
      stats: get('fw.stats', {}),
      dailyDays: Object.keys(daily).length,
      bestStreak: FW.dailyStreak ? FW.dailyStreak(daily, today).best : 0,
      codex: ['race', 'world', 'end', 'foe', 'secret', 'cls', 'mount', 'chapter'].reduce(
        (n, k) => n + Object.keys(codex[k] || {}).length,
        0
      ),
      monthly: Object.keys(get('fw.monthly', {})).length,
    };
  };
  const BY_ID = {};
  FW.ACHIEVEMENTS.forEach(a => (BY_ID[a.id] = a));
  const enabled = () => !FW.gameOptions || FW.gameOptions().achievements;
  const got = () => (App ? App.store.get('fw.achievements', {}) : {});
  /* reward entries join the wheels once unlocked (and leave when achievements are switched off) */
  function syncRewards() {
    const have = got(),
      on = enabled();
    FW.ACHIEVEMENTS.filter(a => a.reward).forEach(a => {
      const list = FW.LISTS[a.reward.list](),
        i = list.findIndex(x => x.name === a.reward.entry.name && x._ach);
      if (on && have[a.id] && i < 0) list.push(Object.assign({ _ach: a.id }, a.reward.entry));
      if ((!on || !have[a.id]) && i >= 0) list.splice(i, 1);
    });
  }
  window.FWAchieve = {
    check(L) {
      if (!App || !L || !enabled()) return [];
      const have = got(),
        fresh = [];
      FW.ACHIEVEMENTS.forEach(a => {
        if (have[a.id]) return;
        let ok = false;
        try {
          ok = a.test(L);
        } catch (e) {
          ok = false;
        }
        if (ok) {
          have[a.id] = new Date().toISOString().slice(0, 10);
          fresh.push(a);
        }
      });
      if (fresh.length) {
        App.store.set('fw.achievements', have);
        syncRewards();
        fresh.forEach((a, i) => setTimeout(() => pop(a), i * 3200));
      }
      return fresh;
    },
    sync: syncRewards,
  };
  syncRewards();
  if (!App) return;
  const prev = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prev) prev(L);
    window.FWAchieve.check(L);
    setTimeout(milestoneCheck, 4500); // after the play statistics have counted this hero
  };
  function milestoneCheck() {
    if (!enabled()) return;
    const c = FW.milestoneCtx(App.store),
      seen = App.store.get('fw.milestones', null) || {},
      first = !App.store.get('fw.milestones', null);
    let changed = false;
    FW.MILESTONES.forEach(m => {
      const r = FW.milestoneTier(m, m.of(c));
      if (r.tier > (seen[m.id] || 0)) {
        if (!first) pop({ id: m.id, icon: m.icon, name: tr(m.name) + ' (' + tr(FW.MILESTONE_TIERS[r.tier]) + ')' });
        seen[m.id] = r.tier;
        changed = true;
      }
    });
    if (changed || first) App.store.set('fw.milestones', seen); // the first time, what a player already has counts as seen
  }
  /* an unlock banner in the corner, like a game platform's (also read out by screen readers) */
  function pop(a) {
    const el = document.createElement('div');
    el.className = 'ach-pop';
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span>' +
      FW.badge(a.id, a.icon) +
      '</span><div><small>' +
      H.esc(tr('Achievement unlocked')) +
      '</small><b>' +
      H.esc(tr(a.name)) +
      '</b>' +
      (a.reward
        ? '<br><small style="letter-spacing:0;text-transform:none">' +
          H.esc(tr('New on the wheel:')) +
          ' ' +
          H.esc(tr(a.reward.entry.name)) +
          '</small>'
        : '') +
      '</div>';
    document.body.appendChild(el);
    if (FW.Audio && FW.Audio.reveal) FW.Audio.reveal(true);
    setTimeout(() => el.remove(), 4200);
  }
  function milestonesHtml() {
    const c = FW.milestoneCtx(App.store),
      medal = ['🔒', '🥉', '🥈', '🥇'];
    return (
      '<h3 class="opt-h">' +
      H.esc(tr('Milestones')) +
      '</h3><div class="milestones">' +
      FW.MILESTONES.map(m => {
        const r = FW.milestoneTier(m, m.of(c));
        return (
          '<div class="milestone t' +
          r.tier +
          '"><span class="ms-medal" aria-hidden="true">' +
          medal[r.tier] +
          '</span><div><b>' +
          H.esc(m.icon + ' ' + tr(m.name)) +
          (r.tier ? ' · ' + H.esc(tr(FW.MILESTONE_TIERS[r.tier])) : '') +
          '</b><small>' +
          H.esc(r.value + (r.next != null ? ' / ' + r.next : '') + ' ' + tr(m.what)) +
          '</small><div class="ach-bar" role="progressbar" aria-label="' +
          H.esc(tr(m.name)) +
          '" aria-valuenow="' +
          r.pct +
          '" aria-valuemin="0" aria-valuemax="100"><i style="width:' +
          r.pct +
          '%"></i></div></div></div>'
        );
      }).join('') +
      '</div><h3 class="opt-h">' +
      H.esc(tr('Achievements')) +
      '</h3>'
    );
  }
  App.achievementsModal = function () {
    const have = got(),
      secret = a => a.hidden && !have[a.id],
      n = Object.keys(have).filter(k => BY_ID[k]).length,
      pct = Math.round((n / FW.ACHIEVEMENTS.length) * 100);
    const order = FW.ACHIEVEMENTS.slice().sort(
      (a, b) =>
        (have[b.id] ? 1 : 0) - (have[a.id] ? 1 : 0) || String(have[b.id] || '').localeCompare(String(have[a.id] || ''))
    );
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Achievements</h2><div class="ach-head"><b>' +
        n +
        ' / ' +
        FW.ACHIEVEMENTS.length +
        '</b><div class="ach-bar" role="progressbar" aria-label="Achievements unlocked" aria-valuenow="' +
        pct +
        '" aria-valuemin="0" aria-valuemax="100"><i style="width:' +
        pct +
        '%"></i></div><b>' +
        pct +
        '%</b></div>' +
        (enabled() ? '' : '<p class="legend-key">Achievements are switched off in Options &gt; Gameplay.</p>') +
        milestonesHtml() +
        '<div class="ach-grid">' +
        order
          .map(
            a =>
              '<div class="ach' +
              (have[a.id] ? ' got' : '') +
              '" aria-label="' +
              H.esc(
                (secret(a) ? tr('Hidden achievement') : tr(a.name)) + ', ' + tr(have[a.id] ? 'unlocked' : 'locked')
              ) +
              '"><span aria-hidden="true">' +
              (secret(a) ? '<span class="badge-emoji">❔</span>' : FW.badge(a.id, a.icon)) +
              '</span><div><b>' +
              H.esc(secret(a) ? '???' : tr(a.name)) +
              '</b><small>' +
              H.esc(secret(a) ? tr('Hidden.') + ' ' + tr(a.riddle) : tr(a.desc)) +
              (a.reward ? ' ' + H.esc(tr('Reward:')) + ' ' + H.esc(tr(a.reward.entry.name)) + '.' : '') +
              '</small>' +
              (have[a.id]
                ? '<small class="when">' + H.esc(tr('Unlocked')) + ' ' + H.esc(have[a.id]) + '</small>'
                : '<small>' + H.esc(tr('Locked')) + '</small>') +
              '</div></div>'
          )
          .join('') +
        '</div>'
    );
  };
})();
