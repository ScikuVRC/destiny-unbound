/* Destiny Unbound extras: AI saga writer, daily challenge, versus mode and the vertical video recorder.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html,
    App = window.FWApp,
    F = App.flow,
    st = App.state,
    S = FW.Story;
  const $ = s => document.querySelector(s);
  const t = s => (FW.t ? FW.t(s) : s);
  const today = () => new Date().toISOString().slice(0, 10);
  const chain = (name, fn) => {
    const prev = App.hooks[name];
    App.hooks[name] = a => {
      if (prev) prev(a);
      return fn(a);
    };
  };
  const download = (blob, file) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000);
  };
  const fileName = L => (L ? L.displayName() : 'legend').replace(/[^\w]+/g, '_');

  /* ================= AI saga writer ================= */
  const TALE_SYSTEM =
    'You are a storyteller for a fantasy character game. You get a character sheet and the list of events in their saga. Write their legend as a short tale of 180 to 260 words, in past tense, like a bard telling it in a tavern. Follow the events in order, keep every name, and do not invent major events that are not listed. Mention how the saga ended. No game terms, numbers, stats or headings. Keep it suitable for all ages: violence is described without gore. Reply with the tale only.';
  async function writeTale() {
    const L = st.legend;
    if (!L || !L.saga || !L.saga.log.length) return App.toast('Play some of the story first');
    const cfg = App.llmCfg && App.llmCfg();
    if (!cfg) {
      App.toast('Choose a language model in the Art Studio first (Generate AI art → Language model)');
      return App.openStudio && App.openStudio();
    }
    const btn = $('#btnTale');
    btn.disabled = true;
    btn.textContent = '✍️ Writing...';
    try {
      const sheet = FW.legendText(L).split('\n\n')[0];
      const tale = await FW.Art.write(cfg, {
        system: TALE_SYSTEM,
        user:
          'Character:\n' +
          sheet +
          '\n\nSaga events in order:\n' +
          L.saga.log.map(x => '- ' + x.chapter + ': ' + x.text).join('\n') +
          '\n\nHow it ended: ' +
          (L.saga.end ? S.endLabel[L.saga.end] + ' - ' + L.saga.endText : 'the story is not over yet'),
      });
      L.saga.tale = tale.slice(0, 6000);
      App.showCard();
      App.toast('The tale was added to the Saga');
    } catch (e) {
      App.toast(e.message || 'The language model could not write the tale');
    } finally {
      btn.disabled = false;
      btn.textContent = '✍️ Write the tale';
    }
  }

  /* ================= daily challenge ================= */
  FW.dailyScore = function (L) {
    const c = FW.compute(L),
      s = L.saga || { ch: 0 };
    return Math.round(
      c.rating +
        3 * s.ch +
        (s.world ? 15 : s.kingdom ? 5 : 0) +
        (s.end === 'ascended' ? 20 : s.end === 'fulfilled' || s.end === 'legend' ? 10 : 0) +
        (s.flags && s.flags.evilSlain ? 10 : 0) +
        2 * (s.conquered ? s.conquered.length : 0)
    );
  };
  const daily = () => App.store.get('fw.daily', {});
  async function startDaily() {
    const d = today();
    const keep = {
      seed: $('#seedInput').value,
      luck: st.luck,
      presets: st.person.presets,
      ov: st.overrides,
      name: st.person.name,
    };
    $('#seedInput').value = 'daily-' + d;
    st.luck = 'heroic';
    st.person.presets = {};
    st.overrides = {};
    $('#btnLuck').textContent = 'Luck: Heroic (daily)';
    try {
      await App.runLegend(false);
    } finally {
      $('#seedInput').value = keep.seed;
      st.person.presets = keep.presets;
      st.overrides = keep.ov;
      App.setLuck(keep.luck);
    }
    if (st.screen === 'card' && st.legend && st.legend.seed === 'daily-' + d) {
      st.legend.daily = d;
      App.showCard();
      App.toast('Daily challenge: now play the story. Your score counts when it ends.');
    }
  }
  function dailyLine(L) {
    let el = $('#dailyLine');
    if (!el) {
      el = document.createElement('div');
      el.id = 'dailyLine';
      el.className = 'daily-line';
      $('#cardRating').after(el);
    }
    if (!L.daily) {
      el.hidden = true;
      return;
    }
    const score = FW.dailyScore(L),
      done = !!(L.saga && L.saga.end);
    if (done) {
      const all = daily();
      if (!all[L.daily] || all[L.daily].score < score) {
        all[L.daily] = { score, title: L.displayName(), race: L.raceName(), summary: S.summary(L) };
        App.store.set('fw.daily', all);
        homeDaily();
        // the leaderboard only hears about it if the player opted in (Options > Data)
        if (FW.World && FW.World.boardEnabled())
          FW.World.postDaily({
            day: L.daily,
            name: L.displayName(),
            race: L.raceName(),
            score,
            end: L.saga.end,
            ch: L.saga.ch,
          }).then(
            r => r && App.toast(FW.t ? FW.t('Posted to the daily leaderboard') : 'Posted to the daily leaderboard')
          );
      }
    }
    const best = daily()[L.daily];
    el.hidden = false;
    el.innerHTML =
      '<b>📅 Daily challenge ' +
      L.daily +
      '</b> · score ' +
      score +
      (done ? '' : ' so far (finish the story to record it)') +
      (best ? ' · your best today: ' + best.score : '') +
      ' <button class="btn small ghost" id="btnDailyShare">Copy result</button>' +
      (FW.World && FW.World.available()
        ? ' <button class="btn small ghost" id="btnDailyBoard">🏆 Leaderboard</button>'
        : '');
    if ($('#btnDailyBoard')) $('#btnDailyBoard').onclick = () => dailyBoard(L.daily);
    $('#btnDailyShare').onclick = () =>
      App.copy(
        'Destiny Unbound daily ' +
          L.daily +
          ': ' +
          L.displayName() +
          ' (' +
          L.raceName() +
          '), score ' +
          score +
          '. ' +
          (L.saga ? S.summary(L) : 'Story not started') +
          '. Same seed for everyone today - can you beat it?',
        'Result copied'
      );
  }
  /* today's leaderboard: the top ten opted-in players. Opening it is the player's own click, so it may ask the server
     even when they don't post their own results. */
  const END_WORD = {
    dead: 'died',
    retired: 'retired',
    ascended: 'ascended',
    lost: 'lost between worlds',
    martyr: 'died a hero',
    sealed: 'sealed away',
    damned: 'taken by the demon',
    fulfilled: 'prophecy fulfilled',
    undying: 'risen undead',
    legend: 'passed into legend',
  };
  async function dailyBoard(day) {
    const tr = s => (FW.t ? FW.t(s) : s);
    const body = rows =>
      App.openModal(
        '<button class="btn small ghost close">Close ✕</button><h2>' +
          H.esc(tr('Daily leaderboard')) +
          '</h2><p class="legend-key">' +
          H.esc(day) +
          '</p>' +
          rows +
          (FW.World.boardEnabled()
            ? '<p class="legend-key">' + H.esc(tr('Your results are posted when a daily saga ends.')) + '</p>'
            : '<p class="legend-key">' +
              H.esc(
                tr(
                  "You're not on the board. To appear, switch on Post my daily challenge results in Options > Data: it sends your hero's name, race, score and ending."
                )
              ) +
              '</p><p><button class="btn small" id="boardOn">' +
              H.esc(tr('Post my results from now on')) +
              '</button></p>')
      );
    body('<p>' + H.esc(tr('Loading…')) + '</p>');
    const j = await FW.World.daily(day);
    let rows;
    if (!j) rows = '<p>' + H.esc(tr("The leaderboard can't be reached right now.")) + '</p>';
    else if (!j.top.length) rows = '<p>' + H.esc(tr('Nobody has posted a result today yet.')) + '</p>';
    else
      rows =
        '<ol class="board">' +
        j.top
          .map(
            (x, i) =>
              '<li><span class="b-n">' +
              (i + 1) +
              '</span><div><b>' +
              H.esc(x.name) +
              '</b><span>' +
              H.esc(
                [x.race, tr(END_WORD[x.ending] || x.ending), x.ch + ' ' + tr('chapters')].filter(Boolean).join(' · ')
              ) +
              '</span></div><span class="b-s">' +
              H.esc(String(x.score)) +
              '</span></li>'
          )
          .join('') +
        '</ol><p class="legend-key">' +
        H.esc(j.players + ' ' + tr(j.players === 1 ? 'player today' : 'players today')) +
        '</p>';
    if (!document.querySelector('#modalRoot .modal')) return; // closed while loading
    body(rows);
    const on = document.getElementById('boardOn');
    if (on)
      on.onclick = () => {
        FW.World.setBoard(true);
        App.toast(tr('Your next daily result will be posted'));
        dailyBoard(day);
      };
  }
  FW.dailyBoard = dailyBoard;
  function homeDaily() {
    const b = daily()[today()];
    $('#btnDaily').textContent = '📅 Daily challenge' + (b ? ' (best ' + b.score + ')' : '');
  }

  /* ================= versus ================= */
  /* Three formats (13, 14): one fight; best of three (a draw does not count, at most five fights); and a team fight,
     three against three, winner stays on: the loser of each bout is out and the next one steps in, a draw knocks
     both out, and the side with a fighter left wins. The rules are FW.vsBestOf and FW.vsTeamStep (engine.js). */
  const VS_FORMATS = [
    ['one', 'One fight'],
    ['bo3', 'Best of three'],
    ['team', 'Team fight (3 vs 3)'],
  ];
  function versusModal(preCode) {
    const opts = [];
    if (st.legend && st.legend.picks.mark) opts.push(['cur', 'Current legend: ' + st.legend.displayName()]);
    st.hall.forEach(h => opts.push([h.id, h.title + ' (' + h.race + ', ' + h.rating + ')']));
    const collected = FW.Collect ? FW.Collect.list() : [];
    collected.forEach(h => opts.push(['col:' + h.id, '🃏 ' + h.title + ' (' + h.race + ', ' + h.rating + ')']));
    const pre =
      preCode && typeof preCode === 'string'
        ? opts.findIndex(o => o[0] === 'col:' + ((collected.find(h => h.code === preCode) || {}).id || ''))
        : -1;
    const sel = (id, def) =>
      '<select id="' +
      id +
      '" aria-label="' +
      H.esc(t('Fighter')) +
      '">' +
      opts
        .map(
          (o, i) =>
            '<option value="' +
            H.esc(o[0]) +
            '"' +
            (i === Math.min(def, opts.length - 1) ? ' selected' : '') +
            '>' +
            H.esc(o[1]) +
            '</option>'
        )
        .join('') +
      '<option value="paste">' +
      H.esc(t('Paste a Legend Code...')) +
      '</option></select><textarea id="' +
      id +
      'Code" rows="2" placeholder="FW1...." hidden></textarea>';
    const side = (k, first) =>
      '<div class="vs-side">' +
      sel('vs' + k + '1', first) +
      '<div class="vs-team" hidden>' +
      sel('vs' + k + '2', first + 2) +
      sel('vs' + k + '3', first + 4) +
      '</div></div>';
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Versus</h2><p>' +
        H.esc(
          t(
            'Pit legends against each other. Their real power, buffs, weaknesses and the arena decide the odds. Nothing on any card changes.'
          )
        ) +
        '</p><div class="o-seg vs-format" role="radiogroup" aria-label="' +
        H.esc(t('Format')) +
        '">' +
        VS_FORMATS.map(
          ([id, n], i) =>
            '<button role="radio" aria-checked="' +
            (i === 0) +
            '" class="' +
            (i === 0 ? 'on' : '') +
            '" data-vsf="' +
            id +
            '">' +
            H.esc(t(n)) +
            '</button>'
        ).join('') +
        '</div><label class="legend-key" style="display:block;margin-top:10px">' +
        H.esc(t('Side one')) +
        '</label>' +
        side('A', 0) +
        '<label class="legend-key" style="display:block;margin-top:10px">' +
        H.esc(t('Side two')) +
        '</label>' +
        side('B', pre >= 0 ? pre : opts.length > 1 ? 1 : 0) +
        '<p id="vsErr" style="color:var(--bad);min-height:1.3em"></p><div class="cta"><button class="btn primary" id="vsGo">⚔ ' +
        H.esc(t('Fight')) +
        '</button>' +
        (st.legend && st.legend.picks.mark
          ? '<button class="btn ghost" id="vsChallenge" title="' +
            H.esc(t('Copies a message with your hero’s Legend Code, for a friend to fight in Versus')) +
            '">' +
            H.esc(t('Copy a challenge')) +
            '</button>'
          : '') +
        '</div>'
    );
    let format = 'one';
    document.querySelectorAll('[data-vsf]').forEach(b =>
      b.addEventListener('click', () => {
        format = b.dataset.vsf;
        document.querySelectorAll('[data-vsf]').forEach(x => {
          x.classList.toggle('on', x === b);
          x.setAttribute('aria-checked', String(x === b));
        });
        document.querySelectorAll('.vs-team').forEach(x => (x.hidden = format !== 'team'));
      })
    );
    ['A', 'B'].forEach(k =>
      [1, 2, 3].forEach(n => {
        const id = 'vs' + k + n;
        $('#' + id).addEventListener('change', () => {
          $('#' + id + 'Code').hidden = $('#' + id).value !== 'paste';
        });
      })
    );
    const get = id => {
      const v = $('#' + id).value;
      if (v === 'cur') return FW.Legend.fromCode(st.legend.toCode());
      // a pasted challenge message works too: the code is the part that starts with FW1.
      if (v === 'paste') return FW.Legend.fromCode(FW.codeIn($('#' + id + 'Code').value));
      if (v.indexOf('col:') === 0) return FW.Legend.fromCode(collected.find(h => 'col:' + h.id === v).code);
      return FW.Legend.fromCode(st.hall.find(h => h.id === v).code);
    };
    if ($('#vsChallenge'))
      $('#vsChallenge').onclick = () =>
        App.copy(
          FW.vsChallenge(st.legend.displayName(), FW.compute(st.legend).rating, st.legend.toCode()),
          t('Challenge copied: send it to a friend')
        );
    $('#vsGo').onclick = () => {
      const n = format === 'team' ? 3 : 1,
        A = [],
        B = [];
      try {
        for (let i = 1; i <= n; i++) {
          A.push(get('vsA' + i));
          B.push(get('vsB' + i));
        }
      } catch (e) {
        $('#vsErr').textContent = t('Could not read a fighter') + ': ' + (e.message || e);
        return;
      }
      runVersus(A, B, format);
    };
  }
  // FW.versusOdds (engine.js): the same odds the Discord bot uses
  async function runVersus(A, B, format) {
    F.abortRun();
    App.closeModal();
    const run = F.newRun();
    format = format || 'one';
    // names: a fighter on both sides gets a (2)
    const nameOf = (L, taken) => {
      let n = L.displayName();
      while (taken.indexOf(n) >= 0) n += ' (2)';
      taken.push(n);
      return n;
    };
    const taken = [],
      an = A.map(L => nameOf(L, taken)),
      bn = B.map(L => nameOf(L, taken));
    const sideName = (names, k) => (names.length > 1 ? t(k === 'a' ? 'Side one' : 'Side two') : names[0]);
    st.auto = false;
    F.syncAutoBtn();
    F.show('spin');
    FW.Audio.setScene('battle');
    $('#sheetTitle').textContent = 'Versus';
    const card = (L, n, out) => {
      const c = FW.compute(L);
      return (
        '<div class="fx-card' +
        (out ? ' vs-out' : '') +
        '"><h3>' +
        H.esc(n) +
        (out ? ' · ' + H.esc(t('out')) : '') +
        '</h3><p class="perk">' +
        H.esc((L.has('sub') ? L.pickName('sub') + ' ' : '') + L.raceName()) +
        ' · ' +
        c.rating.toFixed(1) +
        ' (' +
        H.esc(c.rank) +
        ')</p></div>'
      );
    };
    const log = [];
    const sheet = (score, team) => {
      $('#sheetBody').innerHTML =
        (format === 'one'
          ? ''
          : '<p class="vs-score"><b>' +
            H.esc(sideName(an, 'a')) +
            ' ' +
            score[0] +
            ' : ' +
            score[1] +
            ' ' +
            H.esc(sideName(bn, 'b')) +
            '</b></p>') +
        A.map((L, i) => card(L, an[i], team && i < team.a)).join('') +
        B.map((L, i) => card(L, bn[i], team && i < team.b)).join('') +
        (log.length ? '<ol class="vs-log">' + log.map(x => '<li>' + H.esc(x) + '</li>').join('') + '</ol>' : '');
    };
    // one bout between A[i] and B[j]: an arena, then the fight wheel; returns 'a', 'b' or 'draw'
    async function bout(i, j, label) {
      const ai = await F.playStep({
        emoji: '🏟️',
        title: (label ? label + ': ' : '') + t('Where do they fight?'),
        entries: FW.ARENAS.map(a => ({ name: a.name, w: a.w, dsl: '' })),
        mode: 'cat',
        hue: 200,
      });
      const arena = FW.ARENAS[ai],
        o = FW.versusOdds(A[i], B[j], arena),
        x = an[i],
        y = bn[j];
      const rep = {
        hero: o.ra.hero,
        opp: Math.round(o.rb.hero * 10) / 10,
        adj: o.ra.adj.concat(
          o.rb.adj.map(z => ({ label: y + ': ' + z.label, d: -z.d, kind: z.d >= 0 ? 'debuff' : 'buff' }))
        ),
        pWin: o.pA,
        pDraw: o.pDraw,
        pLose: o.pB,
      };
      const wi = await F.playStep({
        emoji: '⚔️',
        title: (label ? label + ': ' : '') + x + ' vs ' + y,
        entries: [
          { name: x + ' wins', w: o.pA, dsl: '', color: '#2f9e57', colorLight: 38 },
          { name: 'Draw', w: o.pDraw, dsl: '', color: '#777', colorLight: 46 },
          { name: y + ' wins', w: o.pB, dsl: '', color: '#b8383b', colorLight: 40 },
        ],
        mode: 'cat',
        hue: 0,
        hint: 'Slice sizes are the real odds',
        preFx: H.battle(x, y, arena.name, rep),
        onResult: () => ({ fx: H.battle(x, y, arena.name, rep) }),
      });
      const res = ['a', 'draw', 'b'][wi];
      log.push(
        (label ? label + ': ' : '') +
          (res === 'draw'
            ? x + ' ' + t('and') + ' ' + y + ': ' + t('a draw')
            : (res === 'a' ? x : y) + ' ' + t('wins')) +
          ' · ' +
          arena.name
      );
      return { res, arena: arena.name };
    }
    try {
      let winner = null,
        score = [0, 0],
        lastArena = '';
      if (format === 'one') {
        sheet(score);
        F.renderSteps(2, 0);
        const r = await bout(0, 0, '');
        lastArena = r.arena;
        winner = r.res;
      } else if (format === 'bo3') {
        let s = { a: 0, b: 0, fights: 0, done: false };
        while (!s.done) {
          sheet([s.a, s.b]);
          F.renderSteps(Math.min(5, s.fights + 1), s.fights);
          const r = await bout(0, 0, t('Fight') + ' ' + (s.fights + 1));
          lastArena = r.arena;
          s = FW.vsBestOf(s, r.res);
        }
        score = [s.a, s.b];
        winner = s.winner;
      } else {
        let tm = { a: 0, b: 0, n: 3, bouts: 0, done: false };
        while (!tm.done) {
          sheet([3 - tm.a, 3 - tm.b], tm);
          F.renderSteps(Math.min(6, tm.bouts + 1), tm.bouts);
          const r = await bout(tm.a, tm.b, t('Bout') + ' ' + (tm.bouts + 1));
          lastArena = r.arena;
          tm = FW.vsTeamStep(tm, r.res);
        }
        score = [3 - tm.a, 3 - tm.b];
        winner = tm.winner;
        sheet(score, tm);
      }
      if (format !== 'team') sheet(score);
      const wName = winner === 'a' ? sideName(an, 'a') : winner === 'b' ? sideName(bn, 'b') : '';
      FW.Audio.reveal(!!wName);
      if (wName) FW.Audio.sting('victory');
      F.setResult(wName ? '🏆 ' + wName + ' ' + t('wins') : t('A draw'), { pop: true });
      $('#resultSub').textContent =
        format === 'one'
          ? t('At the') + ' ' + lastArena + '.'
          : (format === 'team' ? t('Fighters left') : t('Fights won')) + ': ' + score[0] + ' : ' + score[1];
      // a result card to post (13)
      const result = {
        format,
        a: an,
        b: bn,
        winner,
        score,
        arena: lastArena,
        title: format === 'team' ? t('Team fight') : format === 'bo3' ? t('Best of three') : t('Versus'),
      };
      const fx = document.createElement('div');
      fx.className = 'cta';
      fx.innerHTML = '<button class="btn small" id="vsCard">' + H.esc(t('Save a result card')) + '</button>';
      $('#effects').appendChild(fx);
      $('#vsCard').onclick = () => saveResultCard(result);
      $('#btnSpin').hidden = true;
      F.setControls('result');
      $('#btnRespin').hidden = true;
      await F.finishWait(run);
      if (st.legend) App.showCard();
      else F.show('home');
    } catch (e) {
      if (e !== F.ABORT) throw e;
    }
  }
  // a 1200 × 630 picture of the result, the size social sites use for previews
  function saveResultCard(r) {
    const cv = document.createElement('canvas');
    cv.width = 1200;
    cv.height = 630;
    const c = cv.getContext('2d'),
      cs = getComputedStyle(document.documentElement),
      accent = (cs.getPropertyValue('--accent') || '#e0a040').trim(),
      font = (cs.getPropertyValue('--font-display') || 'serif').trim();
    const g = c.createLinearGradient(0, 0, 0, 630);
    g.addColorStop(0, '#16101a');
    g.addColorStop(1, '#060406');
    c.fillStyle = g;
    c.fillRect(0, 0, 1200, 630);
    c.strokeStyle = accent;
    c.lineWidth = 4;
    c.strokeRect(24, 24, 1152, 582);
    c.textAlign = 'center';
    c.fillStyle = accent;
    c.font = '700 34px ' + font;
    c.fillText(r.title.toUpperCase(), 600, 96);
    const col = (names, x, won) => {
      c.fillStyle = won ? '#ffe9b8' : '#c9c0d0';
      names.forEach((n, i) => {
        c.font = (i === 0 && names.length === 1 ? '800 52px ' : '700 40px ') + font;
        let s = n;
        while (c.measureText(s).width > 470 && s.length > 4) s = s.slice(0, -2);
        c.fillText(s === n ? s : s + '…', x, 250 + i * 64 - (names.length - 1) * 32);
      });
    };
    col(r.a, 320, r.winner === 'a');
    col(r.b, 880, r.winner === 'b');
    c.fillStyle = accent;
    c.font = '800 64px ' + font;
    c.fillText(r.format === 'one' ? 'VS' : r.score[0] + ' : ' + r.score[1], 600, 270);
    c.fillStyle = '#fff';
    c.font = '700 46px ' + font;
    const w = r.winner === 'a' ? r.a : r.winner === 'b' ? r.b : null;
    c.fillText(
      w ? '🏆 ' + (w.length > 1 ? t(r.winner === 'a' ? 'Side one' : 'Side two') : w[0]) + ' ' + t('wins') : t('A draw'),
      600,
      470
    );
    c.fillStyle = '#9a8fa6';
    c.font = '500 28px ' + font;
    c.fillText((r.arena ? r.arena + ' · ' : '') + 'Destiny Unbound', 600, 560);
    cv.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'destiny-unbound_versus.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 8000);
      App.toast(t('Result card saved'));
    }, 'image/png');
  }

  /* ================= vertical video recorder ================= */
  const R = { rec: null, cv: null, raf: 0, t0: 0, chunks: [], timer: 0 };
  const canRecord = () => !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream);
  function pickMime() {
    return (
      [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ].find(m => {
        try {
          return MediaRecorder.isTypeSupported(m);
        } catch (e) {
          return false;
        }
      }) || ''
    );
  }
  function recentPicks(L) {
    if (!L) return [];
    const out = [];
    FW.STAGES.forEach(s => {
      const p = L.picks[s.id];
      if (!p) return;
      let v = p.name;
      if (s.ladder) v = FW.LADDERS[s.ladder].names[p.idx];
      else if (s.id === 'height') v = FW.fmtHeight(p.inches);
      else if (s.id === 'bg')
        v = String(p.name)
          .replace(/^You were (a |an |the )?/i, '')
          .replace(/\.$/, '');
      out.push([(H.STAGE_LABEL[s.id] || s.id).toUpperCase(), v]);
    });
    return out;
  }
  function fitText(c, text, maxW, size, weight) {
    let s = size;
    do {
      c.font = weight + ' ' + s + 'px "Segoe UI", Inter, system-ui, sans-serif';
      s -= 2;
    } while (c.measureText(text).width > maxW && s > 18);
  }
  function drawFrame() {
    const c = R.cv.getContext('2d'),
      W = 1080,
      Hh = 1920;
    const bg = getComputedStyle(document.body).backgroundColor || '#000';
    c.fillStyle = bg;
    c.fillRect(0, 0, W, Hh);
    const fg = getComputedStyle(document.body).color || '#fff';
    c.textAlign = 'center';
    c.fillStyle = fg;
    c.globalAlpha = 0.55;
    fitText(c, 'D E S T I N Y   U N B O U N D', W - 200, 30, '600');
    c.fillText('D E S T I N Y   U N B O U N D', W / 2, 80);
    c.globalAlpha = 1;
    if (st.screen === 'card') {
      const cc = $('#cardCanvas');
      const s = Math.min((W - 60) / cc.width, (Hh - 260) / cc.height);
      c.drawImage(cc, (W - cc.width * s) / 2, 130, cc.width * s, cc.height * s);
      if (st.legend && st.legend.saga) {
        c.fillStyle = fg;
        fitText(c, S.summary(st.legend), W - 120, 40, '600');
        c.fillText(S.summary(st.legend), W / 2, 130 + cc.height * s + 70);
      }
    } else if (st.screen === 'spin') {
      const emoji = $('#chipEmoji').textContent,
        title = $('#chipTitle').textContent,
        res = $('#result').textContent.trim(),
        sub = $('#resultSub').textContent.trim();
      c.font = '90px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      c.fillText(emoji, W / 2, 210);
      c.fillStyle = fg;
      fitText(c, title, W - 120, 56, '700');
      c.fillText(title, W / 2, 300);
      if (res) {
        fitText(c, res, W - 100, 104, '800');
        c.fillText(res, W / 2, 430);
      }
      if (sub) {
        c.globalAlpha = 0.8;
        fitText(c, sub, W - 120, 36, '500');
        c.fillText(sub.slice(0, 90), W / 2, 490);
        c.globalAlpha = 1;
      }
      const wc = $('#wheel');
      if (wc.width) c.drawImage(wc, 60, 540, W - 120, W - 120);
      const picks = recentPicks(st.legend).slice(-5);
      c.textAlign = 'left';
      picks.forEach((p, i) => {
        const y = 1560 + i * 64;
        c.globalAlpha = 0.6;
        c.font = '700 30px "Segoe UI", sans-serif';
        c.fillText(p[0], 90, y);
        c.globalAlpha = 1;
        fitText(c, String(p[1]), 620, 38, '600');
        c.fillText(String(p[1]), 380, y);
      });
      c.textAlign = 'center';
    } else {
      c.fillStyle = fg;
      fitText(c, 'Destiny Unbound', W - 200, 140, '800');
      c.fillText('Destiny Unbound', W / 2, Hh / 2 - 40);
      c.globalAlpha = 0.7;
      fitText(c, 'Spin a legend', W - 200, 54, '500');
      c.fillText('Spin a legend', W / 2, Hh / 2 + 50);
      c.globalAlpha = 1;
    }
    R.raf = requestAnimationFrame(drawFrame);
  }
  function startRec() {
    if (!canRecord()) return App.toast('This browser cannot record video');
    const mime = pickMime();
    if (!mime) return App.toast('No supported video format in this browser');
    R.cv = document.createElement('canvas');
    R.cv.width = 1080;
    R.cv.height = 1920;
    const stream = R.cv.captureStream(30);
    FW.Audio.init();
    const A = FW.Audio;
    if (A.ctx && A.ctx.createMediaStreamDestination) {
      const dest = A.ctx.createMediaStreamDestination();
      A.setRecDest(dest);
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }
    R.chunks = [];
    R.rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6000000 });
    R.rec.ondataavailable = e => {
      if (e.data && e.data.size) R.chunks.push(e.data);
    };
    R.rec.onstop = () => {
      const blob = new Blob(R.chunks, { type: mime.split(';')[0] });
      const ext = /mp4/.test(mime) ? 'mp4' : 'webm';
      if (blob.size) {
        download(blob, 'destiny-unbound_' + fileName(st.legend) + '.' + ext);
        App.toast('Video saved (' + ext.toUpperCase() + ', 1080×1920)');
      }
      FW.Audio.setRecDest(null);
      R.rec = null;
    };
    R.rec.start(500);
    R.t0 = Date.now();
    drawFrame();
    R.timer = setInterval(syncRecBtn, 500);
    syncRecBtn();
    App.toast('Recording: play your spins, then press Stop');
  }
  function stopRec() {
    cancelAnimationFrame(R.raf);
    clearInterval(R.timer);
    if (R.rec && R.rec.state !== 'inactive') R.rec.stop();
    syncRecBtn();
  }
  function syncRecBtn() {
    const on = !!(R.rec && R.rec.state === 'recording'),
      b = $('#btnRec');
    b.hidden = !on; // the top-bar button only shows while recording, as the Stop button; start from the ☰ menu
    if (!on) {
      b.textContent = '⏺ Record';
      b.classList.remove('rec-on');
      return;
    }
    const s = Math.floor((Date.now() - R.t0) / 1000);
    b.textContent = '■ Stop ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    b.classList.add('rec-on');
  }

  /* ================= wiring ================= */
  chain('cardShown', L => {
    dailyLine(L);
    const s = L.saga,
      has = !!(s && s.log.length);
    $('#btnTale').hidden = !has;
    const t = $('#sagaTale');
    t.hidden = !(s && s.tale);
    if (s && s.tale) t.textContent = s.tale;
  });
  $('#btnTale').onclick = writeTale;
  $('#btnDaily').onclick = () => {
    FW.Audio.init();
    startDaily();
  };
  $('#btnRec').onclick = () => (R.rec ? stopRec() : startRec());
  $('#btnRec').hidden = true;
  App.canRecord = canRecord;
  App.startRec = () => !R.rec && startRec();
  homeDaily();
  chain('optionsModal', () => {});
  App.versusModal = versusModal;
  FW.versusModal = versusModal;
  App.startDaily = startDaily;
})();
