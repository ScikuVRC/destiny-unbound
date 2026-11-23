/* Destiny Unbound story mode screens: the Story wheel, chapter wheels, saga panel, dynasty and Game options.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    S = FW.Story,
    H = FW.html,
    App = window.FWApp,
    F = App.flow,
    st = App.state;
  const $ = s => document.querySelector(s);
  const opts = () => S.opts(App.store.get('fw.options', {}));
  FW.gameOptions = opts;

  /* ---------------- side sheet while the story plays ---------------- */
  function sheet() {
    const L = st.legend,
      s = L.saga;
    if (!s) return;
    const c = FW.compute(L),
      age = S.age(L);
    const row = (k, v) => (v ? '<div class="adj"><span>' + k + '</span><b>' + H.esc(v) + '</b></div>' : '');
    let h = H.rating(c);
    h +=
      row('Chapter', String(s.ch)) +
      row(
        'Age',
        age
          ? age + (opts().aging && S.lifeStage(L) ? ' (' + tt(S.LIFE_STAGES[S.lifeStage(L)]).toLowerCase() + ')' : '')
          : s.years
            ? '+' + s.years + ' years'
            : ''
      ) +
      row('House', s.dyn ? s.dyn.house + (s.dyn.gen > 1 ? ', gen ' + s.dyn.gen : '') : '') +
      row('Gold', S.gold(s) ? '🪙 ' + S.gold(s) : '');
    h += row(
      'Kingdom',
      s.world
        ? s.kingdom
          ? s.kingdom.name + ' (the world)'
          : 'The world'
        : s.kingdom
          ? s.kingdom.name + ' (' + s.kingdom.style + ')'
          : ''
    );
    h +=
      row('Artifacts', s.artifacts.map(a => a.name).join(', ')) +
      row('Conquered', s.conquered.join(', ')) +
      row('Guild', s.guild ? S.rankName(s) + ', ' + s.guild : '') +
      row(
        'Alignment',
        S.align(s) ? S.alignName(S.align(s)) + ' (' + (S.align(s) > 0 ? '+' : '') + S.align(s) + ')' : ''
      ) +
      row('World event', S.event(s) ? S.event(s).emoji + ' ' + S.event(s).name : '') +
      row('Beloved', s.love) +
      row('Heir', s.heir ? s.heir.name + ' (' + s.heir.kind + ')' : '');
    // a face for the nemesis and each companion (165, 166)
    const face = (src, name, label, sub) =>
      '<div class="face-row"><img src="' +
      H.esc(src) +
      '" alt="" loading="lazy"><div><small>' +
      H.esc(label) +
      '</small><b>' +
      H.esc(name) +
      '</b>' +
      (sub ? '<span>' + H.esc(sub) + '</span>' : '') +
      '</div></div>';
    if (s.nem)
      h += face(
        S.nemArt(s.nem),
        s.nem.name,
        tt('Nemesis'),
        s.nem.ally ? 'now your ally' : s.nem.alive ? 'power ' + s.nem.lv : 'defeated'
      );
    if (L.ally.length)
      h +=
        '<h2 style="margin-top:12px">Companions</h2>' +
        L.ally
          .map(a =>
            face(
              S.allyArt(a),
              a.name,
              '',
              (a.lv ? 'power ' + a.lv : '') + (opts().loyalty && a.loyalty != null ? ' · loyalty ' + a.loyalty : '')
            )
          )
          .join('');
    h += '<h2 style="margin-top:12px">' + H.esc(tt('Journal')) + '</h2>' + journalHtml(s.log) + cutNote(s);
    $('#sheetTitle').textContent = 'Your Saga';
    $('#sheetBody').innerHTML = h;
  }
  const tt = x => (FW.t ? FW.t(x) : x);
  // the saga as a journal: one entry per chapter, newest first, with what happened in it
  function journalHtml(log) {
    if (!log.length) return '<p class="legend-key">' + H.esc(tt('Nothing has happened yet.')) + '</p>';
    const groups = [];
    log.forEach(x => {
      const g = groups[groups.length - 1];
      if (g && g.ch === (x.ch || 0) && g.chapter === x.chapter) g.items.push(x);
      else groups.push({ ch: x.ch || 0, chapter: x.chapter, emoji: x.emoji, items: [x] });
    });
    return (
      // it scrolls on its own, so it takes keyboard focus (arrow keys scroll it)
      '<div class="journal" tabindex="0" role="region" aria-label="' +
      H.esc(tt('Journal')) +
      '">' +
      groups
        .reverse()
        .map(
          (g, i) =>
            '<section class="jr-ch' +
            (i === 0 ? ' latest' : '') +
            (g.items.some(x => x.end) ? ' end' : '') +
            '"><h4>' +
            (g.emoji ? FW.icon(g.emoji) : '') +
            '<span>' +
            (g.ch ? H.esc(tt('Chapter')) + ' ' + g.ch + ' · ' : '') +
            H.esc(g.chapter ? tt(g.chapter) : '') +
            '</span></h4>' +
            g.items.map(x => '<p class="' + (x.tone || '') + '">' + H.esc(x.text) + '</p>').join('') +
            '</section>'
        )
        .join('') +
      '</div>'
    );
  }

  /* ---------------- the chapter banner above the question: who, which chapter, what kind ---------------- */
  let inStory = false,
    curCh = null,
    storyRun = null; // which runStory call owns the banner
  function portraitSrc(L) {
    if (st.image && st.image.src) return st.image.src; // the player's own picture
    const f = FW.portraitFile ? FW.portraitFile(L) : '';
    return f ? 'art/portraits/' + f + '.webp' : '';
  }
  function banner(kind) {
    const b = $('#storyBanner'),
      L = st.legend,
      s = L && L.saga;
    document.body.classList.toggle('story-on', inStory && !!s);
    if (!b) return;
    if (!inStory || !s) {
      b.hidden = true;
      return;
    }
    const age = S.age(L),
      n = kind === 'story' || kind === 'picked' ? s.ch + 1 : s.ch,
      src = portraitSrc(L);
    let icon = '📖',
      title = tt('A new chapter');
    if (kind === 'end') {
      icon = S.endIcon[s.end] || '📖';
      title = tt(S.endLabel[s.end] || 'The End');
    } else if (kind !== 'story' && curCh) {
      icon = curCh.emoji || icon;
      title = curCh.name;
    }
    // a painted illustration behind the banner for the most common chapters (art/chapters, made with Grok)
    const art = kind !== 'story' && kind !== 'end' && curCh && (FW.CHAPTER_ART || []).indexOf(curCh.id) >= 0;
    b.classList.toggle('has-art', !!art);
    // set here, not through a CSS variable: a url() in a variable would resolve against the stylesheet's folder
    b.style.backgroundImage = art
      ? 'linear-gradient(90deg,var(--panel) 0,color-mix(in srgb,var(--panel) 88%,transparent) 38%,color-mix(in srgb,var(--panel) 25%,transparent) 72%,transparent),url("art/chapters/' +
        curCh.id +
        '.webp")'
      : '';
    b.innerHTML =
      '<div class="sb-por">' +
      (src
        ? '<img src="' + H.esc(src) + '" alt="">'
        : '<span>' + H.esc((L.displayName() || '?').charAt(0)) + '</span>') +
      '</div><div class="sb-txt"><span class="sb-kicker">' +
      H.esc(kind === 'end' ? tt('The end') : tt('Chapter') + ' ' + n) +
      (age ? ' · ' + H.esc(tt('Age')) + ' ' + age : '') +
      '</span><b class="sb-title">' +
      FW.icon(icon) +
      '<span>' +
      H.esc(title) +
      '</span></b><span class="sb-sub">' +
      H.esc(L.displayName()) +
      (s.dyn ? ' · ' + H.esc(s.dyn.house) : '') +
      '</span></div>';
    b.hidden = false;
  }
  // a saga opened from a very long Legend Code: its oldest ordinary lines were left out of the code
  const cutNote = s =>
    s && s.cut
      ? '<p class="legend-key">' + H.esc(tt('Some early lines were left out to keep this Legend Code short.')) + '</p>'
      : '';
  /* search the saga log and bookmark lines (157). Long logs (eight lines or more) get a search box and a
     "Bookmarks" filter; every line has a star. Bookmarks are kept per legend (by its seed) on this device. */
  const MARKS = 'fw.marks';
  const marksOf = L => ((App.store.get(MARKS, {}) || {})[String(L.seed)] || []).slice();
  function setMarks(L, list) {
    const all = App.store.get(MARKS, {}) || {},
      k = String(L.seed);
    delete all[k];
    if (list.length) all[k] = list;
    const keys = Object.keys(all);
    keys.slice(0, Math.max(0, keys.length - 40)).forEach(x => delete all[x]); // the newest forty legends
    App.store.set(MARKS, all);
  }
  function logTools(root, L) {
    const ol = root && root.querySelector('ol.saga-log:not(.recap-line)');
    if (!ol || !L || ol.dataset.tools) return;
    ol.dataset.tools = '1';
    const marks = marksOf(L),
      items = [...ol.children];
    items.forEach((li, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mark';
      const on = marks.indexOf(i) >= 0;
      li.classList.toggle('marked', on);
      b.textContent = on ? '★' : '☆';
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', tt('Bookmark this line'));
      b.onclick = () => {
        const m = marksOf(L),
          k = m.indexOf(i);
        if (k >= 0) m.splice(k, 1);
        else m.push(i);
        setMarks(L, m);
        const now = k < 0;
        li.classList.toggle('marked', now);
        b.textContent = now ? '★' : '☆';
        b.setAttribute('aria-pressed', String(now));
        apply();
      };
      li.appendChild(b);
    });
    if (items.length < 8) return;
    const bar = document.createElement('div');
    bar.className = 'log-tools';
    bar.innerHTML =
      '<input type="search" class="log-find" placeholder="' +
      H.esc(tt('Find a name or event')) +
      '" aria-label="' +
      H.esc(tt('Search the saga')) +
      '"><button type="button" class="btn small ghost log-marks" aria-pressed="false">★ ' +
      H.esc(tt('Bookmarks')) +
      '</button><span class="log-count" aria-live="polite"></span>';
    ol.parentNode.insertBefore(bar, ol);
    const inp = bar.querySelector('.log-find'),
      mb = bar.querySelector('.log-marks'),
      cnt = bar.querySelector('.log-count');
    let only = false;
    function apply() {
      const q = inp.value.trim().toLowerCase();
      let n = 0;
      items.forEach(li => {
        const hit = (!q || li.textContent.toLowerCase().indexOf(q) >= 0) && (!only || li.classList.contains('marked'));
        li.hidden = !hit;
        if (hit) n++;
      });
      cnt.textContent = q || only ? n + ' / ' + items.length : '';
    }
    inp.addEventListener('input', apply);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Escape' && inp.value) {
        e.preventDefault();
        e.stopPropagation();
        inp.value = '';
        apply();
      }
    });
    mb.onclick = () => {
      only = !only;
      mb.setAttribute('aria-pressed', String(only));
      mb.classList.toggle('on', only);
      apply();
    };
  }
  App.logTools = logTools;
  function logHtml(log) {
    return log.length
      ? '<ol class="saga-log">' +
          log
            .map(
              x =>
                '<li class="' +
                (x.end ? 'end ' : '') +
                (x.tone || '') +
                '"><span>' +
                (x.emoji ? FW.icon(x.emoji) : '•') +
                '</span><div><b>' +
                (x.ch ? 'Ch. ' + x.ch + ' · ' : '') +
                H.esc(x.chapter) +
                '</b>' +
                H.esc(x.text) +
                '</div></li>'
            )
            .join('') +
          '</ol>'
      : '<p class="legend-key">Nothing has happened yet.</p>';
  }

  /* ---------------- once: what ruling a kingdom means (testers missed that it has its own events) ---------------- */
  function kingdomTip() {
    const L = st.legend;
    if (!L || !L.saga || !L.saga.kingdom || App.store.get('fw.tipKingdom', false) || $('.tip-card')) return;
    App.store.set('fw.tipKingdom', true);
    const d = document.createElement('div');
    d.className = 'tip-card';
    d.setAttribute('role', 'status');
    d.innerHTML =
      '<b>' +
      H.esc(tt('You rule a kingdom now')) +
      '</b>' +
      H.esc(
        tt(
          'Between chapters, news comes from your kingdom: golden ages and trade booms help you, famine and plague cost you, and a dragon or a coup must be fought off. Lose the coup and you lose the throne.'
        )
      ) +
      '<div class="cta"><button class="btn small primary" data-tip="ok">' +
      H.esc(tt('Got it')) +
      '</button></div>';
    document.body.appendChild(d);
    d.querySelector('[data-tip="ok"]').onclick = () => d.remove();
    setTimeout(() => d.remove(), 25000);
  }

  /* ---------------- one wheel, as the story asks for it ---------------- */
  function spinUI(cfg) {
    const L = st.legend;
    if (cfg.kind === 'story') curCh = null;
    banner(cfg.kind);
    sheet();
    $('#btnStoryExit').hidden = cfg.kind !== 'story';
    const isBattle = cfg.kind === 'battle';
    return F.playStep({
      emoji: cfg.emoji,
      // the banner above already says which chapter this is
      title: cfg.kind === 'story' ? 'What happens next?' : cfg.title,
      entries: cfg.entries,
      mode: cfg.mode,
      hue: cfg.hue,
      // a world event in force shows before the story wheel's own hint
      hint: cfg.event ? cfg.event + ' · ' + tt(cfg.hint || '') : cfg.hint,
      preFx: isBattle ? H.battle(L.displayName(), cfg.foe, cfg.arena, cfg.report) : '',
      wsKey: cfg.kind === 'story' ? 'story' : '', // offers "Never roll this again" under a chapter
      onResult: idx => {
        $('#btnStoryExit').hidden = true;
        const e = cfg.entries[idx];
        if (isBattle) return { fx: H.battle(L.displayName(), cfg.foe, cfg.arena, cfg.report) };
        if (cfg.kind === 'story') {
          const ch = S.CHAPTER_BY_ID[e.id];
          curCh = ch;
          st.where = st.spinWhere = 'story:' + ch.id;
          banner('picked'); // the chapter is chosen but not counted yet
          return {
            sub: tt('Chapter') + ' ' + (L.saga.ch + 1),
            fx: H.fxCard((ch.emoji || '') + ' ' + ch.name, '', '', []),
          };
        }
        const chips = e.dsl ? FW.chips(FW.parse(e.dsl)) : [];
        return {
          sub: H.esc(e.text || ''),
          fx: H.fxCard(e.name, e.tone === 'bad' ? '' : e.text, e.tone === 'bad' ? e.text : '', chips),
        };
      },
      afterResult: () => {
        sheet();
        kingdomTip();
      },
    });
  }

  /* ---------------- the story loop ---------------- */
  async function runStory() {
    const L = st.legend;
    if (!L) return;
    F.abortRun();
    App.closeModal();
    st.where = st.spinWhere = 'spin'; // until a chapter is picked
    const run = F.newRun();
    if (!L.saga) {
      S.newSaga(L, opts(), st.rng);
      st.tokensUsed = 0;
    }
    st.auto = false;
    F.syncAutoBtn();
    inStory = true;
    const myRun = (storyRun = {});
    F.show('spin');
    FW.Audio.setScene('story');
    F.renderSteps(0, 0);
    $('#sheet').classList.toggle('collapsed', window.innerWidth < 980);
    const io = {
      rng: st.rng,
      spin: spinUI,
      choose: cfg => {
        banner('chapter');
        sheet();
        $('#btnStoryExit').hidden = true;
        return F.chooseStep(cfg);
      },
    };
    try {
      while (!L.saga.end) {
        // if the player leaves in the middle of a chapter, that chapter is undone
        const snap = JSON.stringify({ saga: L.saga, chron: L.chron, ally: L.ally });
        try {
          await S.playTurn(L, io, opts(), (FW.mergeOverrides ? FW.mergeOverrides(st.overrides) : st.overrides).story);
        } catch (e) {
          if (e === F.ABORT) {
            const o = JSON.parse(snap);
            L.saga = o.saga;
            L.chron = o.chron;
            L.ally = o.ally;
          }
          throw e;
        }
        if (run !== F.runId()) return;
        // every finished chapter is kept in the save slots (162), so leaving mid-saga loses only the chapter in play
        if (App.saveSlot) App.saveSlot(L);
        if (window.FWAchieve) window.FWAchieve.check(L);
      }
      $('#btnStoryExit').hidden = true;
      await ending(L, run);
      App.showCard();
    } catch (e) {
      if (e !== F.ABORT) throw e;
    } finally {
      $('#btnStoryExit').hidden = true;
      // a newer run (a restarted story) owns the banner now
      if (storyRun === myRun) {
        inStory = false;
        banner();
      }
    }
  }
  /* ---------------- "How was this saga?" (199): a short note after an ending. Nothing is sent unless the player
     picks an answer and presses Send, after seeing what goes: the answer, the ending, the chapter count, the luck,
     the game version and their own words. It goes with the error reports (kind "saga"), read with
     scripts/error-reports.js. Asked once per saga; "Don't ask again" turns it off. ---------------- */
  const FB_OFF = 'fw.sagaFbOff';
  const FB_ANSWERS = [
    ['good', '👍', 'Loved it'],
    ['ok', '😐', 'It was fine'],
    ['bad', '👎', 'Not for me'],
  ];
  const fbAsked = L => (window.FWApp.store.get('fw.sagaFb', []) || []).indexOf(String(L.seed)) >= 0;
  function sagaFeedbackHtml(L) {
    if (!FW.Report || !FW.Report.available() || window.FWApp.store.get(FB_OFF, false) || fbAsked(L)) return '';
    return (
      '<div class="saga-fb" id="sagaFb"><p><b>' +
      H.esc(tt('How was this saga?')) +
      '</b></p><div class="cta">' +
      FB_ANSWERS.map(
        a => '<button class="btn small" data-fb="' + a[0] + '">' + a[1] + ' ' + H.esc(tt(a[2])) + '</button>'
      ).join('') +
      '</div><button class="pop-link" id="fbOff">' +
      H.esc(tt("Don't ask again")) +
      '</button></div>'
    );
  }
  function bindSagaFeedback(L) {
    const box = $('#sagaFb');
    if (!box) return;
    const A = window.FWApp,
      s = L.saga;
    const remember = () => {
      const seen = (A.store.get('fw.sagaFb', []) || []).slice(-200);
      seen.push(String(L.seed));
      A.store.set('fw.sagaFb', seen);
    };
    $('#fbOff').onclick = () => {
      A.store.set(FB_OFF, true);
      box.remove();
    };
    box.querySelectorAll('[data-fb]').forEach(b =>
      b.addEventListener('click', () => {
        const ans = FB_ANSWERS.find(a => a[0] === b.dataset.fb);
        const msg = 'Saga: ' + ans[0] + ' · ' + s.end + ' · ' + s.ch + ' chapters · ' + L.luck + ' luck',
          facts = S.feedbackFacts(L, opts());
        box.innerHTML =
          '<p><b>' +
          H.esc(ans[1] + ' ' + tt(ans[2])) +
          '</b></p><label class="legend-key" for="fbNote">' +
          H.esc(tt('Anything to add? (optional)')) +
          '</label><textarea id="fbNote" maxlength="1000" rows="3"></textarea><p class="legend-key">' +
          H.esc(
            tt('What is sent') +
              ': ' +
              msg +
              (facts ? ' · ' + facts : '') +
              ', ' +
              tt('the game version and your words. No names or saves.')
          ) +
          '</p><div class="cta"><button class="btn small primary" id="fbSend">' +
          H.esc(tt('Send')) +
          '</button><button class="btn small ghost" id="fbSkip">' +
          H.esc(tt('Skip')) +
          '</button></div>';
        $('#fbSkip').onclick = () => {
          remember();
          box.remove();
        };
        $('#fbSend').onclick = async () => {
          const R = FW.Report;
          $('#fbSend').disabled = true;
          try {
            await R.send({
              version: FW.VERSION,
              platform: R.platform(!!window.fatewheelDesktop, navigator.userAgent),
              kind: 'saga',
              screen: 'ending',
              message: msg,
              detail: facts, // what the newer story features did in this saga (S.feedbackFacts)
              note: R.scrub($('#fbNote').value).trim().slice(0, 1000),
            });
            remember();
            box.innerHTML = '<p>' + H.esc(tt('Thank you! It helps more than you would think.')) + '</p>';
          } catch (e) {
            $('#fbSend').disabled = false;
            A.toast(tt('Could not send it right now. Try again later.'));
          }
        };
      })
    );
  }

  async function ending(L, run) {
    const s = L.saga,
      icon = S.endIcon[s.end] || '📖';
    F.setChip(icon, 'The end of ' + L.displayName(), 0);
    banner('end');
    F.setResult(S.endLabel[s.end] || 'The End', { pop: true, rare: !!S.RARE_END[s.end] });
    $('#resultSub').textContent = s.endText;
    const art =
      FW.ENDING_ART && FW.ENDING_ART.indexOf(s.end) >= 0
        ? '<img class="end-art" src="art/endings/' + s.end + '.webp" alt="">'
        : '';
    $('#effects').innerHTML =
      // what happened next and the recap first, where they are seen without scrolling; then the painting and the log
      '<div class="fx-card"><h3>' +
      H.esc(S.summary(L)) +
      '</h3>' +
      epilogueHtml(L) +
      '<div class="cta"><button class="btn primary" id="btnRecap">' +
      FW.icon('📜') +
      ' ' +
      H.esc(tt('Saga recap')) +
      '</button></div>' +
      sagaFeedbackHtml(L) +
      art +
      logHtml(s.log) +
      cutNote(s) +
      '</div>';
    $('#btnRecap').onclick = () => recapModal(L);
    logTools($('#effects'), L);
    bindSagaFeedback(L);
    if (S.MORTAL[s.end]) FW.Audio.bad();
    else FW.Audio.reveal(true);
    FW.Audio.sting(S.MORTAL[s.end] ? 'defeat' : S.RARE_END[s.end] ? 'legend' : 'victory');
    if (window.FWAchieve) window.FWAchieve.check(L);
    if (window.FWApp.contentTip) window.FWApp.contentTip(); // once: where to switch content off
    sheet();
    $('#btnSpin').hidden = true;
    F.setControls('result');
    $('#btnRespin').hidden = true;
    await F.finishWait(run);
  }

  /* ---------------- dynasty: play on as the heir ---------------- */
  // before the heir's wheels: what carries over from the parent and what will be spun fresh
  function heirIntro(P, inh) {
    return new Promise(resolve => {
      const s = P.saga,
        tr = inh.dyn && inh.dyn.trait,
        lad = FW.LADDERS && FW.LADDERS[inh.best],
        li = (what, detail, chips) =>
          '<li><b>' +
          H.esc(tt(what)) +
          '</b>' +
          (detail ? ' <span>' + H.esc(detail) + '</span>' : '') +
          (chips ? H.chips(FW.chips(FW.parse(chips))) : '') +
          '</li>';
      let list =
        li('Race', inh.race + (inh.sub ? ' (' + inh.sub + ')' : '')) +
        li('House', inh.dyn ? inh.dyn.house + ' · ' + tt('Gen') + ' ' + (inh.dyn.gen + 1) : '') +
        li('Talent', tt("the parent's best stat") + (lad ? ': ' + tt(lad.label) : ''), inh.best + '+1') +
        li(
          'Renown',
          tt('the family name is worth more with every generation'),
          inh.dsl.replace(/^\S+\+1\s*/, '').replace(/fate\+1\s*/, '')
        );
      if (tr) list += li('Family trait', tt(tr.name), tr.dsl);
      if (inh.kingdom) list += li('Kingdom', inh.kingdom.name + (s.world ? ' (' + tt('the world') + ')' : ''));
      if (inh.artifact) list += li('Heirloom', inh.artifact.name, inh.artifact.dsl || 'pwr+1');
      if (inh.heir && inh.heir.blessed) list += li('Blessing', tt('a prophesied child'), 'fate+1');
      if (inh.nem) list += li('Nemesis', inh.nem.name + ' · ' + tt('still hunting your family'));
      App.openModal(
        '<button class="btn small ghost close">' +
          H.esc(tt('Close')) +
          ' ✕</button><h2>' +
          H.esc(tt('What the heir inherits')) +
          '</h2><p class="legend-key">' +
          H.esc(inh.heir.name + ' · ' + tt('heir of') + ' ' + inh.parent) +
          '</p><ul class="heir-list">' +
          list +
          '</ul><p class="legend-key">' +
          H.esc(
            tt(
              'Everything else (class, powers, weapon, looks and the rest) is spun fresh for the heir, and the story starts again at chapter 1.'
            )
          ) +
          '</p><div class="cta"><button class="btn primary" id="heirGo">' +
          H.esc(tt('Spin the heir')) +
          '</button></div>'
      );
      let go = false;
      $('#heirGo').onclick = () => {
        go = true;
        App.closeModal();
      };
      const root = $('#modalRoot'),
        mo = new MutationObserver(() => {
          if (root.firstChild && $('#heirGo')) return;
          mo.disconnect();
          resolve(go);
        });
      mo.observe(root, { childList: true });
      setTimeout(() => {
        const b = $('#heirGo');
        if (b) b.focus();
      }, 30);
    });
  }
  async function continueAsHeir() {
    const P = st.legend;
    if (!S.canContinue(P, opts())) return;
    const inh = S.inheritance(P);
    if (!(await heirIntro(P, inh))) return; // closed without starting
    App.saveToHall(); // keep the parent in the Hall of Legends
    const person = JSON.parse(JSON.stringify(st.person));
    const surname = inh.dyn.house.replace(/^House /, '');
    st.person.presets = { race: inh.race };
    if (inh.sub) st.person.presets.sub = inh.sub;
    st.person.name = inh.heir.name + ' ' + surname;
    try {
      await App.runLegend(false);
    } finally {
      st.person.presets = person.presets;
      st.person.name = person.name;
      st.person.spinLooks = person.spinLooks;
    }
    const C = st.legend;
    if (C === P || st.screen !== 'card') return; // the player left before the child was finished
    S.startHeir(C, inh, opts(), st.rng);
    App.showCard();
    App.toast(C.displayName() + ' carries on ' + inh.dyn.house);
  }

  /* ---------------- the epilogue: what became of everything (story.js, S.epilogue) ---------------- */
  function epilogueHtml(L) {
    const lines = S.epilogue ? S.epilogue(L) : [];
    return lines.length
      ? '<div class="epilogue"><h4>' + H.esc(tt('Epilogue')) + '</h4><p>' + H.esc(lines.join(' ')) + '</p></div>'
      : '';
  }

  /* ---------------- the saga recap: the whole story at a glance ---------------- */
  function recapModal(L) {
    const r = S.recap(L);
    if (!r) return;
    const t = tt,
      pct = p => Math.round(p * 100) + '%';
    // a label can pick its form by the number: {p:year|years} (i18n.js, FW.fmt)
    const stat = (n, label) =>
      '<div><b>' + H.esc(String(n)) + '</b><span>' + H.esc(FW.fmt(t(label), { n })) + '</span></div>';
    // the upset is always a win and the cruel loss always a loss; only the closest fight stores its result
    const fight = (icon, label, f, res) =>
      f
        ? '<li><b>' +
          FW.icon(icon) +
          ' ' +
          H.esc(t(label)) +
          '</b><span>' +
          H.esc(
            t('Ch.') +
              ' ' +
              f.ch +
              ' · ' +
              f.foe +
              ' · ' +
              pct(f.p) +
              ' ' +
              t('to win') +
              ' · ' +
              t(RES[res || f.res] || '')
          ) +
          '</span></li>'
        : '';
    const fights =
      fight('⚖️', 'Closest fight', r.closest) +
      fight('🔥', 'Biggest upset', r.upset, 'win') +
      fight('💔', 'Cruellest loss', r.heartbreak, 'lose');
    const legacy = [
      r.kingdom && [t('Ruled'), r.kingdom],
      r.conquered.length && [t('Conquered'), r.conquered.join(', ')],
      r.artifacts.length && [t('Artifacts'), r.artifacts.join(', ')],
      r.love && [t('Loved'), r.love],
      r.heir && [t('Heir'), r.heir],
      r.scars.length && [t('Scars'), r.scars.map(t).join(', ')],
      r.after && [t('After the ending'), t(r.after)],
      r.bought.length && [t('Bought'), r.bought.join(', ')],
      r.stage && r.stage !== 'In their prime' && [t('Life stage'), t(r.stage)],
      r.guild && [t('Guild'), r.guild],
      r.align && [t('Alignment'), t(r.alignName)],
      r.ancestor && [t('Saved by an ancestor'), r.ancestor],
      r.events.length && [t('World events'), r.events.map(t).join(', ')],
      r.secrets.length && [t('Secret chapters'), r.secrets.map(t).join(', ')],
    ].filter(Boolean);
    const line = r.timeline
      .map(
        x =>
          '<li class="' +
          (x.end ? 'end ' : '') +
          (x.upset ? 'upset ' : '') +
          (x.tone || '') +
          '"><span>' +
          (x.emoji ? FW.icon(x.emoji) : '•') +
          '</span><div><b>' +
          H.esc(t('Ch.') + ' ' + x.ch + ' · ' + t(x.chapter)) +
          (x.upset ? ' · ' + H.esc(t('against the odds')) : '') +
          '</b>' +
          H.esc(x.text) +
          '</div></li>'
      )
      .join('');
    const fam =
      r.family.length > 1
        ? '<h3>' +
          H.esc(t('Family')) +
          '</h3><ol class="recap-family">' +
          r.family
            .map(
              m =>
                '<li class="' +
                (m.current ? 'cur' : '') +
                '"><b>' +
                H.esc(t('Gen') + ' ' + m.gen + ' · ' + m.name) +
                '</b><span>' +
                H.esc(
                  (m.end ? (S.endLabel[m.end] ? t(S.endLabel[m.end]) : m.end) : '') +
                    (m.ch ? ' · ' + m.ch + ' ' + t('chapters') : '')
                ) +
                '</span></li>'
            )
            .join('') +
          '</ol>'
        : '';
    App.openModal(
      '<button class="btn small ghost close">' +
        H.esc(t('Close')) +
        ' ✕</button><h2>' +
        H.esc(t('Saga recap')) +
        '</h2><p class="legend-key">' +
        H.esc(r.name + (r.endLabel ? ' · ' + t(r.endLabel) : '')) +
        '</p><div class="recap-stats">' +
        stat(r.chapters, '{p:chapter|chapters}') +
        stat(r.years, '{p:year|years}') +
        (r.ageEnd != null ? stat(r.ageStart + ' → ' + r.ageEnd, 'age') : '') +
        stat(
          r.fights.won + ' / ' + r.fights.lost + (r.fights.draw ? ' / ' + r.fights.draw : ''),
          r.fights.draw ? 'won / lost / drawn' : 'won / lost'
        ) +
        (r.cheated ? stat(r.cheated, '{p:close call with death|close calls with death}') : '') +
        (r.fame ? stat(r.fame, 'fame') : '') +
        (r.infamy ? stat(r.infamy, 'infamy') : '') +
        (r.gold ? stat(r.gold, 'gold') : '') +
        '</div>' +
        (fights ? '<ul class="recap-fights">' + fights + '</ul>' : '') +
        '<h3>' +
        H.esc(t('Turning points')) +
        '</h3>' +
        (line
          ? '<ol class="saga-log recap-line">' + line + '</ol>'
          : '<p class="legend-key">' + H.esc(t('A quiet life.')) + '</p>') +
        epilogueHtml(L) +
        (S.mapPath(L).length > 1
          ? '<h3>' +
            H.esc(t('Map of the saga')) +
            '</h3><canvas class="saga-map" id="sagaMap" width="1600" height="900" role="img" aria-label="' +
            H.esc(t('A painted map with the hero’s path from chapter to chapter')) +
            '"></canvas>'
          : '') +
        (legacy.length
          ? '<h3>' +
            H.esc(t('Legacy')) +
            '</h3><dl class="recap-legacy">' +
            legacy.map(([k, v]) => '<dt>' + H.esc(k) + '</dt><dd>' + H.esc(v) + '</dd>').join('') +
            '</dl>'
          : '') +
        facesHtml(L) +
        fam
    );
    drawSagaMap(L, $('#sagaMap'));
  }
  // the nemesis and the companions at the end of the saga, with their faces (165, 166)
  function facesHtml(L) {
    const s = L.saga,
      t = x => (FW.t ? FW.t(x) : x);
    const tile = (src, name, what) =>
      '<figure><img src="' +
      H.esc(src) +
      '" alt="" loading="lazy"><figcaption><b>' +
      H.esc(name) +
      '</b><span>' +
      H.esc(what) +
      '</span></figcaption></figure>';
    const tiles = (s.nem ? [tile(S.nemArt(s.nem), s.nem.name, t('Nemesis'))] : []).concat(
      L.ally.slice(0, 8).map(a => tile(S.allyArt(a), a.name, t('Companion')))
    );
    return tiles.length
      ? '<h3>' + H.esc(t('Friends and foes')) + '</h3><div class="recap-faces">' + tiles.join('') + '</div>'
      : '';
  }
  /* the map of the saga (168): the painted map, the hero's path from chapter to chapter, a numbered stop for each
     and the ending marked at the last one */
  function drawSagaMap(L, cv) {
    if (!cv) return;
    const stops = S.mapPath(L),
      c = cv.getContext('2d'),
      W = cv.width,
      Hh = cv.height,
      css = getComputedStyle(document.documentElement),
      accent = (css.getPropertyValue('--accent') || '#e0a040').trim(),
      font = (css.getPropertyValue('--font-display') || 'serif').trim();
    const im = new Image();
    im.onload = () => {
      c.drawImage(im, 0, 0, W, Hh);
      c.fillStyle = 'rgba(0,0,0,.18)';
      c.fillRect(0, 0, W, Hh);
      const P = stops.map(p => [p.x * W, p.y * Hh]);
      // the road: a dark under-stroke and a dashed line on top, curving a little between stops. Early legs fade, so a
      // long saga still reads: the most recent part of the journey is the brightest
      const leg = i => {
        const [x0, y0] = P[i - 1],
          [x1, y1] = P[i];
        c.beginPath();
        c.moveTo(x0, y0);
        c.quadraticCurveTo((x0 + x1) / 2 + (y1 - y0) * 0.15, (y0 + y1) / 2 - (x1 - x0) * 0.15, x1, y1);
        c.stroke();
      };
      const fade = i => (P.length <= 6 ? 1 : 0.25 + 0.75 * Math.pow(i / (P.length - 1), 1.5));
      c.lineCap = 'round';
      c.lineJoin = 'round';
      for (let i = 1; i < P.length; i++) {
        c.globalAlpha = fade(i);
        c.setLineDash([]);
        c.strokeStyle = 'rgba(20,10,5,.7)';
        c.lineWidth = 9;
        leg(i);
        c.setLineDash([16, 12]);
        c.strokeStyle = accent;
        c.lineWidth = 5;
        leg(i);
      }
      c.setLineDash([]);
      c.globalAlpha = 1;
      // numbered stops; the last one bigger, with the ending
      stops.forEach((p, i) => {
        const [x, y] = P[i],
          last = i === stops.length - 1,
          r = last ? 30 : 21;
        c.globalAlpha = Math.max(0.55, fade(i));
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = last ? accent : 'rgba(18,12,8,.92)';
        c.fill();
        c.lineWidth = 4;
        c.strokeStyle = last ? '#fff3da' : accent;
        c.stroke();
        c.fillStyle = last ? '#1a1008' : '#fff3da';
        c.font = '700 ' + (last ? 26 : 22) + 'px ' + font;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(String(p.ch), x, y + 1);
        c.globalAlpha = 1;
      });
      const end = stops[stops.length - 1];
      if (end && L.saga.end) {
        const label =
          (S.endLabel[L.saga.end] ? (FW.t ? FW.t(S.endLabel[L.saga.end]) : S.endLabel[L.saga.end]) : '') || '';
        if (label) {
          c.font = '700 34px ' + font;
          const w = c.measureText(label).width + 36,
            x = Math.min(W - w / 2 - 10, Math.max(w / 2 + 10, P[P.length - 1][0])),
            y = P[P.length - 1][1] > 120 ? P[P.length - 1][1] - 62 : P[P.length - 1][1] + 62;
          c.fillStyle = 'rgba(18,12,8,.85)';
          c.fillRect(x - w / 2, y - 26, w, 52);
          c.fillStyle = accent;
          c.textBaseline = 'middle';
          c.fillText(label, x, y + 2);
        }
      }
    };
    im.src = 'art/saga-map.webp';
  }
  const RES = { win: 'won', lose: 'lost', draw: 'drawn' };

  /* ---------------- the family tree ---------------- */
  function houseModal() {
    const L = st.legend,
      s = L && L.saga;
    if (!s || !s.dyn) return;
    const t = FW.t || (x => x),
      tree = S.familyTree(L),
      tr = s.dyn.trait;
    const row = (r, i) =>
      '<li class="' +
      (r.current ? 'cur' : '') +
      '"><span class="ft-gen">' +
      H.esc(t('Gen') + ' ' + r.gen) +
      '</span><div><b>' +
      H.esc(r.name) +
      '</b><span>' +
      H.esc(
        [
          r.race,
          r.rating + ' ' + t(r.rank),
          r.end
            ? (S.endLabel[r.end] ? t(S.endLabel[r.end]) : r.end) + ' · ' + r.ch + ' ' + t('chapters')
            : t('the story goes on'),
          r.kingdom,
        ]
          .filter(Boolean)
          .join(' · ')
      ) +
      '</span></div></li>' +
      (i < tree.length - 1 ? '<li class="ft-link" aria-hidden="true">│</li>' : '');
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>' +
        H.esc(s.dyn.house) +
        '</h2>' +
        (tr
          ? '<p><b>' +
            H.esc(t('Family trait')) +
            ':</b> ' +
            H.esc(t(tr.name)) +
            ' ' +
            H.chips(FW.chips(FW.parse(tr.dsl))) +
            '</p><p class="legend-key">' +
            H.esc(t(tr.text)) +
            ' ' +
            H.esc(t('Every heir carries it, and each generation adds renown to the house name.')) +
            '</p>'
          : '') +
        '<ol class="family-tree">' +
        tree.map(row).join('') +
        '</ol>'
    );
  }
  $('#btnHouse').onclick = houseModal;

  /* ---------------- card panel ---------------- */
  App.hooks.cardShown = L => {
    const s = L.saga,
      o = opts();
    $('#sagaBox').hidden = !(s && s.log.length);
    $('#btnHouse').hidden = !(s && s.dyn);
    if (s && s.dyn)
      $('#btnHouse').textContent =
        '🏰 ' + s.dyn.house + (s.dyn.gen > 1 ? ' · ' + (FW.t ? FW.t('Gen') : 'Gen') + ' ' + s.dyn.gen : '');
    if (s) {
      $('#sagaSum').textContent = S.summary(L);
      $('#sagaList').innerHTML = logHtml(s.log) + cutNote(s);
      logTools($('#sagaList'), L);
    }
    $('#btnStory').hidden = !!(s && s.end);
    $('#btnStory').textContent = s ? '📖 Continue the story' : '📖 Begin the story';
    const heir = S.canContinue(L, o);
    $('#btnHeir').hidden = !heir;
    if (heir) $('#btnHeir').textContent = '👑 Continue as ' + s.heir.name;
  };

  /* ---------------- Game options ---------------- */
  App.hooks.optionsModal = function () {
    const o = opts();
    const v = FW.Audio.vol,
      sl = (k, label) =>
        '<label class="vol-row"><span>' +
        label +
        '</span><input type="range" min="0" max="100" value="' +
        Math.round(v[k] * 100) +
        '" data-vol="' +
        k +
        '"><b>' +
        Math.round(v[k] * 100) +
        '</b></label>';
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Game options</h2><h3 class="opt-h">Sound</h3>' +
        sl('master', 'Master volume') +
        sl('sfx', 'Effects') +
        sl('music', 'Music') +
        '<p class="legend-key">Each theme has its own sounds and music. Mods can replace them with their own files.</p><h3 class="opt-h">Story</h3><p>Switch story features on or off. Chapters themselves can be removed or made rarer in the Wheel Workshop (Story chapters).</p>' +
        S.OPTIONS.map(
          x =>
            '<label class="check opt-row"><input type="checkbox" data-o="' +
            x.id +
            '"' +
            (o[x.id] ? ' checked' : '') +
            '><span><b>' +
            H.esc(x.name) +
            '</b><br><small>' +
            H.esc(x.blurb) +
            '</small></span></label>'
        ).join('') +
        '<p class="legend-key">Changes apply from the next chapter.</p>'
    );
    document.querySelectorAll('#modalRoot [data-vol]').forEach(r =>
      r.addEventListener('input', () => {
        const val = r.value / 100;
        r.nextElementSibling.textContent = r.value;
        FW.Audio.init();
        FW.Audio.setVolume({ [r.dataset.vol]: val });
        App.store.set('fw.audio', FW.Audio.vol);
      })
    );
    document.querySelectorAll('#modalRoot [data-o]').forEach(cb =>
      cb.addEventListener('change', () => {
        const cur = App.store.get('fw.options', {});
        cur[cb.dataset.o] = cb.checked;
        App.store.set('fw.options', cur);
        App.toast(S.OPTIONS.find(x => x.id === cb.dataset.o).name + (cb.checked ? ' on' : ' off'));
        if (window.FWAchieve) window.FWAchieve.sync();
      })
    );
  };

  $('#btnStory').onclick = () => {
    FW.Audio.init();
    runStory();
  };
  $('#btnHeir').onclick = () => {
    FW.Audio.init();
    continueAsHeir();
  };
  $('#btnStoryExit').onclick = () => {
    F.abortRun();
    App.showCard();
  };
  // the battle report shows the nemesis with their portrait (render.js)
  FW.extraFace = name => {
    const n = st.legend && st.legend.saga && st.legend.saga.nem;
    return n && n.name === name ? S.nemArt(n) : '';
  };
  App.inStory = () => inStory;
  App.runStory = runStory;
  App.continueAsHeir = continueAsHeir;
})();
