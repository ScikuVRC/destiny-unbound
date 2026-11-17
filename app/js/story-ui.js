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
      row('Age', age ? age + (S.isOld(L) && opts().aging ? ' (old)' : '') : s.years ? '+' + s.years + ' years' : '') +
      row('House', s.dyn ? s.dyn.house + (s.dyn.gen > 1 ? ', gen ' + s.dyn.gen : '') : '');
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
      row('Guild', s.guild) +
      row('Beloved', s.love) +
      row('Heir', s.heir ? s.heir.name + ' (' + s.heir.kind + ')' : '');
    if (s.nem)
      h += row(
        'Nemesis',
        s.nem.name + ' · ' + (s.nem.ally ? 'now your ally' : s.nem.alive ? 'power ' + s.nem.lv : 'defeated')
      );
    if (L.ally.length)
      h +=
        '<h2 style="margin-top:12px">Companions</h2>' +
        L.ally
          .map(a =>
            row(
              a.name,
              (a.lv ? 'power ' + a.lv : '') + (opts().loyalty && a.loyalty != null ? ' · loyalty ' + a.loyalty : '')
            )
          )
          .join('');
    h += '<h2 style="margin-top:12px">' + H.esc(tt('Journal')) + '</h2>' + journalHtml(s.log);
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
      '<div class="journal">' +
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
      hint: cfg.hint,
      preFx: isBattle ? H.battle(L.displayName(), cfg.foe, cfg.arena, cfg.report) : '',
      wsKey: cfg.kind === 'story' ? 'story' : '', // offers "Never roll this again" under a chapter
      onResult: idx => {
        $('#btnStoryExit').hidden = true;
        const e = cfg.entries[idx];
        if (isBattle) return { fx: H.battle(L.displayName(), cfg.foe, cfg.arena, cfg.report) };
        if (cfg.kind === 'story') {
          const ch = S.CHAPTER_BY_ID[e.id];
          curCh = ch;
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
      '<div class="fx-card">' + art + '<h3>' + H.esc(S.summary(L)) + '</h3>' + logHtml(s.log) + '</div>';
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
      $('#sagaList').innerHTML = logHtml(s.log);
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
  App.runStory = runStory;
  App.continueAsHeir = continueAsHeir;
})();
