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
    h += '<h2 style="margin-top:12px">Saga so far</h2>' + logHtml(s.log.slice(-8));
    $('#sheetTitle').textContent = 'Your Saga';
    $('#sheetBody').innerHTML = h;
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

  /* ---------------- one wheel, as the story asks for it ---------------- */
  function spinUI(cfg) {
    const L = st.legend;
    sheet();
    $('#btnStoryExit').hidden = cfg.kind !== 'story';
    const isBattle = cfg.kind === 'battle';
    return F.playStep({
      emoji: cfg.emoji,
      title: cfg.title,
      entries: cfg.entries,
      mode: cfg.mode,
      hue: cfg.hue,
      hint: cfg.hint,
      preFx: isBattle ? H.battle(L.displayName(), cfg.foe, cfg.arena, cfg.report) : '',
      onResult: idx => {
        $('#btnStoryExit').hidden = true;
        const e = cfg.entries[idx];
        if (isBattle) return { fx: H.battle(L.displayName(), cfg.foe, cfg.arena, cfg.report) };
        if (cfg.kind === 'story') {
          const ch = S.CHAPTER_BY_ID[e.id];
          return { sub: 'Chapter ' + (L.saga.ch + 1), fx: H.fxCard((ch.emoji || '') + ' ' + ch.name, '', '', []) };
        }
        const chips = e.dsl ? FW.chips(FW.parse(e.dsl)) : [];
        return {
          sub: H.esc(e.text || ''),
          fx: H.fxCard(e.name, e.tone === 'bad' ? '' : e.text, e.tone === 'bad' ? e.text : '', chips),
        };
      },
      afterResult: sheet,
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
    F.show('spin');
    FW.Audio.setScene('story');
    F.renderSteps(0, 0);
    $('#sheet').classList.toggle('collapsed', window.innerWidth < 980);
    const io = {
      rng: st.rng,
      spin: spinUI,
      choose: cfg => {
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
    }
  }
  async function ending(L, run) {
    const s = L.saga,
      icon = S.endIcon[s.end] || '📖';
    F.setChip(icon, 'The end of ' + L.displayName(), 0);
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
    sheet();
    $('#btnSpin').hidden = true;
    F.setControls('result');
    $('#btnRespin').hidden = true;
    await F.finishWait(run);
  }

  /* ---------------- dynasty: play on as the heir ---------------- */
  async function continueAsHeir() {
    const P = st.legend;
    if (!S.canContinue(P, opts())) return;
    const inh = S.inheritance(P);
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
