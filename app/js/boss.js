/* Destiny Unbound: the world boss. One boss a week (the week starts on Monday, UTC); every hero you own can fight
   it once that week. A fight spins how well the hero does against it, with the real arena odds, and deals damage.
   Players who share counts with the world counter (Options > Data) add their damage to everyone's: the boss falls
   when the world has dealt its health. Without that, it is your own tally.
   FW.Boss is plain logic (tested in node); the screen needs the page. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});

  const B = (FW.Boss = {
    // the bosses take turns, one a week
    LIST: [
      {
        id: 'hunger',
        name: 'Vaelthrax, the Hunger Below',
        emoji: '🐉',
        dsl: 'lv=88 a=fire,void w=ice',
        lair: { name: 'The Burning Deep', tags: ['fire', 'dark'] },
        hp: 60000,
        lore: 'A wyrm older than the mountains it sleeps under. Every hundred years it wakes hungry.',
        art: 'hunger', // set to the id once app/art/bosses/<id>.webp exists (scripts/make-boss-art.js)
      },
      {
        id: 'colossus',
        name: 'The Clockwork Colossus',
        emoji: '⚙️',
        dsl: 'lv=82 a=metal,lightning w=water',
        lair: { name: 'The Brass Wastes', tags: ['urban', 'storm'] },
        hp: 60000,
        lore: 'A walking city built to win a war that ended centuries ago. Nobody told it.',
        art: 'colossus', // set to the id once app/art/bosses/<id>.webp exists (scripts/make-boss-art.js)
      },
      {
        id: 'storms',
        name: 'The Mother of Storms',
        emoji: '🌪️',
        dsl: 'lv=85 a=lightning,water w=metal',
        lair: { name: 'The Eye of the Storm', tags: ['storm', 'water'] },
        hp: 60000,
        lore: 'Where she walks, the sea stands up. Sailors pray to her, and to anything else that listens.',
        art: 'storms', // set to the id once app/art/bosses/<id>.webp exists (scripts/make-boss-art.js)
      },
      {
        id: 'court',
        name: 'The Pale Court',
        emoji: '👑',
        dsl: 'lv=90 a=shadow,mind w=holy',
        lair: { name: 'The Hall of Still Hearts', tags: ['dark', 'void'] },
        hp: 60000,
        lore: 'A lich-queen and the nobles who followed her into undeath, still holding court after a thousand years.',
        art: 'court', // set to the id once app/art/bosses/<id>.webp exists (scripts/make-boss-art.js)
      },
      {
        // designed by the game's creator: "The First and Last Choir"
        id: 'genesis',
        name: 'Genesis, the Valkyr of Time',
        emoji: '⏳',
        dsl: 'lv=85 a=time',
        lair: { name: 'The First and Last Choir', tags: ['void'] },
        hp: 125000,
        rewind: 0.2, // Genesis Pulse: a fifth of every blow is rewound
        lore: 'She does not destroy. She rewinds, pauses, and rewrites the flow of battle until only one outcome remains.',
        abilities: [
          ['Chrono Scythe', 'A sweeping cleave that slows time around you.'],
          ['Frozen Moment', 'Locks a hero in a bubble of stopped time.'],
          ['Genesis Pulse', 'Rewinds a fifth of every blow you land.'],
          ['Hourglass Collapse', 'Below a third of her health, time shatters and her echoes join the fight.'],
          ["Valkyr's Judgment", 'Marks the strongest hero, then strikes from anywhere.'],
        ],
        art: 'genesis',
      },
    ],
    EPOCH: Date.UTC(2026, 0, 5), // a Monday: week 0
    MAX_HIT: 5000, // the server refuses more than this from one fight
    // the week a moment falls in, as YYYY-Www (ISO weeks start on Monday)
    week(now) {
      const d = new Date(now == null ? Date.now() : now);
      const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      const day = t.getUTCDay() || 7;
      t.setUTCDate(t.getUTCDate() + 4 - day);
      const y0 = Date.UTC(t.getUTCFullYear(), 0, 1);
      const wk = Math.ceil(((t - y0) / 864e5 + 1) / 7);
      return t.getUTCFullYear() + '-W' + String(wk).padStart(2, '0');
    },
    // which boss is up: the bosses take turns from the epoch, one a week
    current(now) {
      const n = Math.floor(((now == null ? Date.now() : now) - B.EPOCH) / (7 * 864e5));
      const list = B.LIST;
      return list[((n % list.length) + list.length) % list.length];
    },
    // the moment the week ends (next Monday 00:00 UTC)
    endsAt(now) {
      const t = now == null ? Date.now() : now;
      const n = Math.floor((t - B.EPOCH) / (7 * 864e5));
      return B.EPOCH + (n + 1) * 7 * 864e5;
    },
    foe: boss => ({ name: boss.name, w: 1, dsl: boss.dsl }),
    // the wheel for one fight: how well the hero does, weighted by the real odds against the boss
    outcomes(pWin) {
      const p = Math.max(0.02, Math.min(0.98, pWin));
      return [
        { name: 'A mighty blow', w: 2 * p, mult: 2, tone: 'good' },
        { name: 'Solid hits', w: 1, mult: 1, tone: 'good' },
        { name: 'A glancing blow', w: 1.5 * (1 - p), mult: 0.4, tone: '' },
        { name: 'Thrown back', w: 1 - p, mult: 0.1, tone: 'bad' },
      ];
    },
    damage: (rating, mult) => Math.max(1, Math.min(B.MAX_HIT, Math.round(Math.max(1, rating) * 10 * mult))),
    // one fight: the outcome index comes from the caller's random numbers (rng), so tests and the page agree
    fight(L, boss, rng) {
      const rep = FW.matchup(L, B.foe(boss), boss.lair);
      const ents = B.outcomes(rep.pWin),
        i = FW.weightedIndex(ents, rng || Math.random),
        e = ents[i];
      return {
        pWin: rep.pWin,
        outcome: e,
        index: i,
        entries: ents,
        // some bosses undo part of every hit (Genesis Pulse)
        damage: Math.max(1, Math.round(B.damage(FW.compute(L).baseRating, e.mult) * (1 - (boss.rewind || 0)))),
      };
    },
  });

  if (typeof document === 'undefined' || !g.FWApp) return;
  const App = g.FWApp,
    H = FW.html,
    store = App.store,
    t = s => (FW.t ? FW.t(s) : s);
  const KEY = 'fw.boss';
  const mine = () => {
    const wk = B.week();
    let r = store.get(KEY, null);
    if (!r || r.week !== wk) r = { week: wk, dealt: 0, fought: [] };
    return r;
  };
  const num = n => Math.round(n).toLocaleString(FW.lang || 'en');
  function heroes() {
    const out = [];
    const L = App.state.legend;
    if (L && FW.STAGES.every(s => !L.stageApplies(s.id) || L.has(s.id) || s.optional))
      out.push({ key: String(L.seed), name: L.displayName(), L });
    (App.state.hall || []).forEach(h => {
      try {
        const H2 = FW.Legend.fromCode(h.code);
        if (!out.some(x => x.key === String(H2.seed)))
          out.push({ key: String(H2.seed), name: String(h.title).split(', ')[0], L: H2 });
      } catch (e) {
        /* an old or broken code is left out */
      }
    });
    return out.slice(0, 40);
  }
  async function world() {
    const W = FW.World;
    if (!W || !W.enabled() || !W.boss) return null;
    return W.boss(B.week());
  }
  App.bossModal = async function (last) {
    const boss = B.current(),
      me = mine(),
      list = heroes(),
      shared = !!(FW.World && FW.World.enabled());
    const w = await world();
    const dealt = w ? w.dealt : me.dealt,
      left = Math.max(0, boss.hp - dealt),
      days = Math.max(1, Math.ceil((B.endsAt() - Date.now()) / 864e5));
    const rows = list.length
      ? list
          .map(h => {
            const done = me.fought.indexOf(h.key) >= 0;
            return (
              '<div class="hall-item"><div><b>' +
              H.esc(h.name) +
              '</b><span>' +
              H.esc(t('rating')) +
              ' ' +
              FW.compute(h.L).rating +
              '</span></div><div><button class="btn small' +
              (done ? ' ghost" disabled' : ' primary"') +
              ' data-boss="' +
              H.esc(h.key) +
              '">' +
              H.esc(t(done ? 'Fought this week' : 'Fight')) +
              '</button></div></div>'
            );
          })
          .join('')
      : '<p>' + H.esc(t('Make a hero or save one to the Hall of Legends to fight.')) + '</p>';
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>' +
        H.esc(t('World Boss')) +
        '</h2><div class="boss-card">' +
        // a looping animation when the boss has one (scripts/make-boss-art.js), a still frame with reduced or no
        // motion, and the emoji otherwise
        (boss.art
          ? '<img class="boss-art" src="art/bosses/' +
            boss.art +
            (FW.motion && FW.motion() !== 'full' ? '-still' : '') +
            '.webp" alt="' +
            H.esc(t(boss.name)) +
            '" width="160" height="160">'
          : '<div class="boss-emoji" aria-hidden="true">' + boss.emoji + '</div>') +
        '<div><b>' +
        H.esc(t(boss.name)) +
        '</b><span>' +
        H.esc(FW.fmt(t('Level {n}'), { n: FW.P(B.foe(boss)).lv }) + ' · ' + t(boss.lair.name)) +
        '</span><i>' +
        H.esc(t(boss.lore)) +
        '</i>' +
        (boss.abilities
          ? '<ul class="boss-abilities">' +
            boss.abilities.map(a => '<li><b>' + H.esc(t(a[0])) + '</b> ' + H.esc(t(a[1])) + '</li>').join('') +
            '</ul>'
          : '') +
        '</div></div><div class="level-bar boss-hp" role="progressbar" aria-valuemin="0" aria-valuemax="' +
        boss.hp +
        '" aria-valuenow="' +
        left +
        '" aria-label="' +
        H.esc(t('Health left')) +
        '"><i style="width:' +
        Math.round((left / boss.hp) * 100) +
        '%"></i></div><p class="legend-key">' +
        H.esc(
          (left ? num(left) + ' / ' + num(boss.hp) + ' ' + t('health left') : t('Defeated this week!')) +
            ' · ' +
            FW.fmt(t('{n} {p:day|days} left'), { n: days }) +
            (w ? ' · ' + FW.fmt(t('{n} {p:fight|fights} so far'), { n: w.fighters }) : '')
        ) +
        '</p><p class="legend-key">' +
        H.esc(
          shared
            ? t('Your damage counts toward the world total, because you share counts (Options > Data).')
            : t(
                'This is your own tally. To fight together with everyone, switch on the world counter in Options > Data.'
              )
        ) +
        '</p>' +
        (last
          ? '<div class="fx-card boss-result ' +
            (last.outcome.tone || '') +
            '" role="status"><b>' +
            H.esc(last.name + ': ' + t(last.outcome.name)) +
            '</b><span>' +
            H.esc(FW.fmt(t('{n} damage'), { n: num(last.damage) })) +
            '</span></div>'
          : '') +
        '<h3 class="opt-h">' +
        H.esc(t('Your heroes')) +
        '</h3><p class="legend-key">' +
        H.esc(t('Each hero can fight once a week.')) +
        '</p>' +
        rows
    );
    document.querySelectorAll('#modalRoot [data-boss]').forEach(b =>
      b.addEventListener('click', async () => {
        const h = list.find(x => x.key === b.dataset.boss);
        const r = mine();
        if (!h || r.fought.indexOf(h.key) >= 0) return;
        const res = B.fight(h.L, boss, Math.random);
        r.fought.push(h.key);
        r.dealt += res.damage;
        store.set(KEY, r);
        if (FW.Audio) FW.Audio.reveal(res.outcome.mult >= 2);
        if (FW.World && FW.World.enabled() && FW.World.postBoss) await FW.World.postBoss(r.week, res.damage);
        App.bossModal({ name: h.name, outcome: res.outcome, damage: res.damage });
      })
    );
  };
})(typeof window !== 'undefined' ? window : globalThis);
