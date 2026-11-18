/* Destiny Unbound: the player's level (experience from every hero, chapter, ending and achievement), favourite
   heroes, Hall of Legends statistics, card backs and the print sheet.
   FW.Level and FW.hallStats are plain logic (tested in node); the rest needs the page.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});

  /* ---------------- player level ---------------- */
  const Lv = (FW.Level = {
    XP: {
      hero: 10,
      chapter: 4,
      achievement: 25,
      end: {
        legend: 60,
        ascended: 100,
        fulfilled: 60,
        undying: 50,
        lost: 30,
        retired: 25,
        martyr: 30,
        sealed: 20,
        damned: 20,
        dead: 10,
      },
    },
    KEEP: 400, // heroes remembered, so the same hero never pays twice
    need: lv => 60 + 40 * lv, // experience from level lv to the next
    of(xp) {
      let lv = 1,
        left = Math.max(0, Math.floor(+xp || 0));
      while (left >= Lv.need(lv)) {
        left -= Lv.need(lv);
        lv++;
      }
      return { level: lv, into: left, need: Lv.need(lv), xp: Math.max(0, Math.floor(+xp || 0)) };
    },
    fresh: (achievements, heroes) => ({
      xp: (achievements || 0) * Lv.XP.achievement + (heroes || 0) * 15, // what a player had before levels existed
      seen: {},
      order: [],
      ach: achievements || 0,
    }),
    // experience for what is new on this hero since last time; changes rec
    gain(L, rec) {
      if (!L || !rec) return 0;
      const key = String(L.seed);
      let e = rec.seen[key],
        xp = 0;
      if (!e) {
        e = rec.seen[key] = { ch: 0, end: 0 };
        rec.order.push(key);
        xp += Lv.XP.hero;
        while (rec.order.length > Lv.KEEP) delete rec.seen[rec.order.shift()];
      }
      const s = L.saga;
      if (s) {
        const ch = +s.ch || 0;
        if (ch > e.ch) {
          xp += (ch - e.ch) * Lv.XP.chapter;
          e.ch = ch;
        }
        if (s.end && !e.end) {
          xp += Lv.XP.end[s.end] || 10;
          e.end = 1;
        }
      }
      rec.xp += xp;
      return xp;
    },
    achievements(count, rec) {
      const n = Math.max(0, (count || 0) - (rec.ach || 0));
      rec.ach = Math.max(rec.ach || 0, count || 0);
      rec.xp += n * Lv.XP.achievement;
      return n * Lv.XP.achievement;
    },
    backs: level => (FW.CARD_BACKS || []).filter(b => b.level <= level),
  });

  /* ---------------- Hall statistics ---------------- */
  FW.FAV_MAX = 5;
  FW.hallStats = function (hall) {
    const list = Array.isArray(hall) ? hall : [];
    const count = (arr, f) => {
      const m = {};
      arr.forEach(x => {
        const k = f(x);
        if (k) m[k] = (m[k] || 0) + 1;
      });
      return Object.entries(m).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    };
    const ratings = list.map(h => +h.rating).filter(x => isFinite(x));
    const best = list.reduce((b, h) => (!b || +h.rating > +b.rating ? h : b), null);
    const sagas = list.filter(h => h.saga);
    return {
      count: list.length,
      sagas: sagas.length,
      best,
      avg: ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0,
      races: count(list, h => h.race),
      ranks: count(list, h => h.rank),
      endings: count(sagas, h => h.saga.end),
      favourites: list.filter(h => h.fav).length,
    };
  };

  /* the Hall and statistics as a spreadsheet file (CSV) */
  FW.hallCsv = function (hall, extra) {
    const cell = v => {
      const s = String(v == null ? '' : v);
      // quote everything that needs it, and stop a cell from being read as a formula
      const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
      return /[",\n\r]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
    };
    const row = a => a.map(cell).join(',');
    const lines = [
      row(['Name', 'Race', 'Rating', 'Rank', 'Saved', 'Saga', 'Ending', 'House', 'Generation', 'Favourite']),
    ];
    (hall || []).forEach(h =>
      lines.push(
        row([
          h.title,
          h.race,
          h.rating,
          h.rank,
          h.date,
          h.saga ? h.saga.summary : '',
          h.saga ? h.saga.end || '' : '',
          h.saga ? h.saga.house || '' : '',
          h.saga ? h.saga.gen || '' : '',
          h.fav ? 'yes' : '',
        ])
      )
    );
    if (extra && extra.length) {
      lines.push('', row(['Statistic', 'Value']));
      extra.forEach(([k, v]) => lines.push(row([k, v])));
    }
    return lines.join('\r\n') + '\r\n';
  };
  if (typeof document === 'undefined' || !g.FWApp) return;
  const App = g.FWApp,
    H = FW.html,
    st = App.state,
    store = App.store,
    t = s => (FW.t ? FW.t(s) : s),
    $ = s => document.querySelector(s);

  /* ---------------- level: kept up to date whenever a card is shown ---------------- */
  const achCount = () => Object.keys(store.get('fw.achievements', {}) || {}).length;
  let rec = store.get('fw.level', null);
  if (!rec || typeof rec !== 'object' || !rec.seen) {
    rec = Lv.fresh(achCount(), st.hall.length);
    store.set('fw.level', rec);
  }
  if (!Array.isArray(rec.order)) rec.order = Object.keys(rec.seen);
  App.levelInfo = () => Lv.of(rec.xp);
  const prev = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prev) prev(L);
    const before = Lv.of(rec.xp).level;
    const got = Lv.gain(L, rec) + Lv.achievements(achCount(), rec);
    if (!got) return;
    store.set('fw.level', rec);
    const now = Lv.of(rec.xp).level;
    if (now > before) {
      const unlocked = (FW.CARD_BACKS || []).filter(b => b.level > before && b.level <= now);
      setTimeout(
        () =>
          App.toast(
            FW.fmt(t('Level {n}!'), { n: now }) +
              (unlocked.length ? ' ' + t('New card back') + ': ' + unlocked.map(b => t(b.name)).join(', ') : ''),
            'good'
          ),
        900
      );
    }
  };

  /* ---------------- favourites ---------------- */
  App.toggleFav = id => {
    const h = st.hall.find(x => x.id === id);
    if (!h) return;
    if (!h.fav && st.hall.filter(x => x.fav).length >= FW.FAV_MAX)
      return App.toast(FW.fmt(t('You can pin up to {n} favourites'), { n: FW.FAV_MAX }));
    h.fav = !h.fav;
    store.set('fw.hall', st.hall);
  };
  const champion = () => st.hall.find(h => h.fav);
  // the Hall's line on the title screen: your level and your first favourite
  App.hallSub = () => {
    const c = champion();
    return FW.fmt(t('Level {n}'), { n: Lv.of(rec.xp).level }) + (c ? ' · ★ ' + String(c.title).split(', ')[0] : '');
  };

  /* ---------------- the top of the Hall: level bar and statistics ---------------- */
  const END_NAME = e => (FW.Story && FW.Story.endLabel[e]) || e;
  App.hallHead = function () {
    const lv = Lv.of(rec.xp),
      s = FW.hallStats(st.hall),
      next = (FW.CARD_BACKS || []).find(b => b.level > lv.level);
    const bars = (rows, max, name) =>
      rows
        .slice(0, 5)
        .map(
          ([k, n]) =>
            '<li><span>' +
            H.esc(t(name ? name(k) : k)) +
            '</span><i style="width:' +
            Math.max(4, Math.round((n / max) * 100)) +
            '%"></i><b>' +
            n +
            '</b></li>'
        )
        .join('');
    return (
      '<div class="codex-open"><button class="btn small" data-codex="codex">📖 ' +
      H.esc(t('Codex')) +
      '</button><button class="btn small" data-codex="bestiary">🐾 ' +
      H.esc(t('Bestiary')) +
      '</button><button class="btn small ghost" data-export-hall title="' +
      H.esc(t('Your Hall and statistics as a file for any spreadsheet program')) +
      '">⬇ ' +
      H.esc(t('Export as spreadsheet')) +
      '</button></div>' +
      '<div class="level-box"><div class="level-top"><b>' +
      H.esc(FW.fmt(t('Level {n}'), { n: lv.level })) +
      '</b><span>' +
      lv.into +
      ' / ' +
      lv.need +
      ' XP</span></div><div class="level-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' +
      lv.need +
      '" aria-valuenow="' +
      lv.into +
      '" aria-label="' +
      H.esc(t('Experience to the next level')) +
      '"><i style="width:' +
      Math.round((lv.into / lv.need) * 100) +
      '%"></i></div><p class="legend-key">' +
      H.esc(t('Every hero, chapter, ending and achievement gives experience.')) +
      (next ? ' ' + H.esc(FW.fmt(t('Level {n} unlocks a new card back.'), { n: next.level })) : '') +
      '</p></div>' +
      (s.count
        ? '<h3 class="opt-h">' +
          H.esc(t('Your legends in numbers')) +
          '</h3><div class="recap-stats hall-stats">' +
          '<div><b>' +
          s.count +
          '</b><span>' +
          H.esc(FW.fmt(t('{p:legend|legends}'), { n: s.count })) +
          '</span></div><div><b>' +
          s.sagas +
          '</b><span>' +
          H.esc(FW.fmt(t('{p:saga|sagas}'), { n: s.sagas })) +
          '</span></div><div><b>' +
          s.avg +
          '</b><span>' +
          H.esc(t('average rating')) +
          '</span></div><div><b>' +
          (s.best ? s.best.rating : '-') +
          '</b><span>' +
          H.esc(t('best rating')) +
          '</span></div></div><div class="hall-charts"><div><h4>' +
          H.esc(t('Races')) +
          '</h4><ul class="hall-bars">' +
          bars(s.races, s.races.length ? s.races[0][1] : 1) +
          '</ul></div>' +
          (s.endings.length
            ? '<div><h4>' +
              H.esc(t('Endings')) +
              '</h4><ul class="hall-bars">' +
              bars(s.endings, s.endings[0][1], END_NAME) +
              '</ul></div>'
            : '') +
          '<div><h4>' +
          H.esc(t('Ranks')) +
          '</h4><ul class="hall-bars">' +
          bars(s.ranks, s.ranks.length ? s.ranks[0][1] : 1) +
          '</ul></div></div>'
        : '')
    );
  };

  /* ---------------- export: the Hall and your statistics as a spreadsheet (CSV) ---------------- */
  App.exportHall = function () {
    const lv = Lv.of(rec.xp),
      s = FW.hallStats(st.hall),
      play = (FW.System && FW.System.stats) || {};
    const extra = [
      ['Player level', lv.level],
      ['Experience', lv.xp],
      ['Legends in the Hall', s.count],
      ['Average rating', s.avg],
      ['Best rating', s.best ? s.best.rating : ''],
    ].concat(
      Object.keys(play)
        .filter(k => typeof play[k] === 'number')
        .map(k => [k, play[k]])
    );
    // a byte order mark so spreadsheet programs read the accents right
    const blob = new Blob(['\ufeff' + FW.hallCsv(st.hall, extra)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'destiny-unbound-hall.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    App.toast(t('Saved destiny-unbound-hall.csv'));
  };
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('[data-export-hall]')) App.exportHall();
  });

  /* ---------------- card backs and the print sheet ---------------- */
  const backId = () => {
    const want = store.get('fw.cardBack', 'classic'),
      ok = Lv.backs(Lv.of(rec.xp).level);
    return ok.some(b => b.id === want) ? want : 'classic';
  };
  App.cardBack = backId;
  const syncBackBtn = () => {
    const b = $('#btnCardBack');
    if (!b) return;
    const cur = (FW.CARD_BACKS || []).find(x => x.id === backId()) || { name: 'Classic' },
      lv = Lv.of(rec.xp).level,
      next = (FW.CARD_BACKS || []).find(x => x.level > lv);
    b.textContent = t('Card back') + ': ' + t(cur.name);
    b.title =
      t('Choose the back of the card') +
      (next ? ' · ' + FW.fmt(t('Level {n} unlocks a new card back.'), { n: next.level }) : '');
  };
  const btnBack = $('#btnCardBack');
  if (btnBack)
    btnBack.addEventListener('click', () => {
      const ok = Lv.backs(Lv.of(rec.xp).level),
        i = ok.findIndex(b => b.id === backId());
      store.set('fw.cardBack', ok[(i + 1) % ok.length].id);
      App.drawCardNow();
      syncBackBtn();
      const f = $('#cardFlip');
      if (f && !f.classList.contains('flipped') && App.flipCard) App.flipCard(true);
    });
  const prevCard = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prevCard) prevCard(L);
    syncBackBtn();
  };
  const btnPrint = $('#btnPrint');
  if (btnPrint)
    btnPrint.addEventListener('click', () => {
      const L = st.legend;
      if (!L) return;
      const sheet = FW.printSheet($('#cardCanvas'), $('#cardBack'), L.displayName() + ' · Destiny Unbound');
      sheet.toBlob(b => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'destiny-unbound_' + L.displayName().replace(/[^\w]+/g, '_') + '_print.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 8000);
        App.toast(t('Print sheet saved: print it on A4 at actual size'));
      }, 'image/png');
    });
})(typeof window !== 'undefined' ? window : globalThis);
