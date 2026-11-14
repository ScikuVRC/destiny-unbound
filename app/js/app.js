/* Destiny Unbound app - screens, spin flow, arena, dialogs */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html,
    LAD = FW.LADDERS;
  const $ = s => document.querySelector(s);
  const ABORT = { abort: true };

  /* ---------- storage ---------- */
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        /* private mode: ignore */
      }
    },
  };
  const saved = store.get('fw.settings', {});
  const state = {
    theme: FW.THEMES[saved.theme] ? saved.theme : FW.THEME_ALIAS[saved.theme] || 'ashen',
    wantTheme: saved.theme || '',
    luck: FW.LUCK.some(l => l.id === saved.luck) ? saved.luck : 'heroic',
    sound: saved.sound !== false,
    speed: saved.speed === 'fast' ? 'fast' : 'normal',
    spinDir: saved.spinDir === 'cw' ? 'cw' : 'ccw',
    auto: false,
    legend: null,
    image: null,
    rng: FW.makeRng(),
    seed: '',
    runId: 0,
    phase: 0,
    waiter: null,
    mode: 'ready',
    tokensUsed: 0,
    wheel: null,
    hall: store.get('fw.hall', []),
    overrides: store.get('fw.overrides', {}),
    fight: null,
    screen: 'title',
    imageBlob: null,
    person: Object.assign({ name: '', pres: '', spinLooks: true, presets: {} }, store.get('fw.person', {})),
  };
  if (!state.person.presets || typeof state.person.presets !== 'object') state.person.presets = {};
  const hooks = {}; // filled in by studio.js
  const hook = (name, a) => {
    try {
      return hooks[name] && hooks[name](a);
    } catch (e) {
      /* optional feature */
    }
  };
  const persist = () =>
    store.set('fw.settings', {
      theme: state.wantTheme && !FW.THEMES[state.wantTheme] ? state.wantTheme : state.theme,
      luck: state.luck,
      sound: state.sound,
      speed: state.speed,
      spinDir: state.spinDir,
    });
  FW.Audio.on = state.sound;
  FW.Audio.theme = state.theme;
  Object.assign(FW.Audio.vol, store.get('fw.audio', {}));

  /* ---------- small helpers ---------- */
  const tr = s => (FW.t ? FW.t(s) : s); // translate text built in code (the page text is translated separately)
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  function copy(text, okMsg) {
    const done = () => toast(okMsg || 'Copied');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } catch (e) {
        toast('Copy failed - select and copy manually');
      }
      ta.remove();
    }
  }
  const luckInfo = () => FW.LUCK.find(l => l.id === state.luck);
  function show(name) {
    state.screen = name;
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
    document.body.classList.toggle('on-title', name === 'title');
    window.scrollTo(0, 0);
    if (name === 'spin') ensureWheel().resize();
    hook('screenShown', name);
  }
  function ensureWheel() {
    if (!state.wheel) {
      state.wheel = new FW.Wheel($('#wheel'), state.theme);
    }
    state.wheel.dir = state.spinDir === 'cw' ? 1 : -1;
    return state.wheel;
  }

  /* ---------- theme / luck / sound ---------- */
  function setTheme(name) {
    if (!FW.THEMES[name]) return;
    state.theme = name;
    state.wantTheme = name;
    document.body.dataset.theme = name;
    persist();
    FW.Audio.setTheme(name);
    $('#btnTheme').textContent = FW.THEMES[name].name;
    if (state.wheel) state.wheel.setTheme(name);
    renderHomeOpts();
    if (state.screen === 'card' && state.legend) drawCardNow();
    const bg = getComputedStyle(document.body).backgroundColor;
    const m = document.querySelector('meta[name=theme-color]');
    if (m) m.content = bg;
  }
  function setLuck(id) {
    state.luck = id;
    persist();
    $('#btnLuck').textContent = 'Luck: ' + luckInfo().name;
    renderHomeOpts();
  }
  function renderHomeOpts() {
    $('#luckOpts').innerHTML = FW.LUCK.map(
      l =>
        '<button class="opt ' +
        (l.id === state.luck ? 'sel' : '') +
        '" data-luck="' +
        l.id +
        '"><b>' +
        l.name +
        '</b><span>' +
        (FW.t ? FW.t(l.blurb) : l.blurb) +
        ' &middot; ' +
        l.tokens +
        ' ' +
        (FW.t ? FW.t(l.tokens > 1 ? 'Fate Tokens' : 'Fate Token') : l.tokens > 1 ? 'Fate Tokens' : 'Fate Token') +
        '</span></button>'
    ).join('');
    $('#themeOpts').innerHTML = Object.keys(FW.THEMES)
      .map(
        k =>
          '<button class="opt ' +
          (k === state.theme ? 'sel' : '') +
          '" data-theme="' +
          k +
          '"><b>' +
          H.esc(FW.THEMES[k].name) +
          '</b><span>' +
          H.esc(
            (FW.t ? FW.t : x => x)(
              FW.THEMES[k].blurb ||
                {
                  ashen: 'Dark fantasy',
                  astral: 'Celestial fantasy',
                  iron: 'Grimdark sci-fi',
                  bloodmoon: 'Gothic horror',
                }[k] ||
                ''
            )
          ) +
          (FW.THEMES[k].mod ? ' · mod' : '') +
          '</span></button>'
      )
      .join('');
  }

  /* ---------- steps / chips / result ---------- */
  function renderSteps(total, cur) {
    let s = '';
    for (let i = 0; i < total; i++) s += '<i class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"></i>';
    $('#steps').innerHTML = s;
  }
  function setChip(emoji, title, bonus) {
    $('#chipEmoji').textContent = emoji;
    $('#chipTitle').textContent = title;
    const b = $('#chipBonus');
    if (bonus) {
      b.textContent = (bonus > 0 ? '+' : '−') + Math.abs(bonus);
      b.className = 'chip-bonus' + (bonus < 0 ? ' neg' : '');
    } else {
      b.textContent = '';
    }
  }
  function setResult(text, o) {
    o = o || {};
    const r = $('#result');
    const t = text || ' ';
    r.className = 'result' + H.resultClass(t) + (o.rare ? ' rare' : '');
    r.textContent = t;
    if (o.pop) {
      void r.offsetWidth;
      r.classList.add('pop');
    }
  }
  function setControls(mode) {
    state.mode = mode;
    $('#btnSpin').hidden = !(mode === 'ready' || mode === 'spinning');
    $('#btnSpin').disabled = mode === 'spinning';
    $('#btnRespin').hidden = mode !== 'result';
    $('#btnNext').hidden = mode !== 'result';
  }
  function tokensLeft() {
    const c = state.legend ? FW.compute(state.legend) : { fateTokens: 0 };
    return Math.max(0, c.fateTokens - state.tokensUsed);
  }
  function updateTokens() {
    const c = FW.compute(state.legend);
    $('#tokenBox').innerHTML = H.tokens(tokensLeft(), c.fateTokens);
    // the count of Fate Tokens left sits on the Re-spin button itself (a separate badge, so the word still translates)
    $('#btnRespin').innerHTML =
      '&#8635; <span>Re-spin</span> <b class="cnt" aria-label="' +
      H.esc(FW.t('Fate Tokens left')) +
      '">' +
      tokensLeft() +
      '</b>';
    $('#btnRespin').disabled = tokensLeft() <= 0;
    $('#btnRespin').title = tokensLeft() <= 0 ? 'No Fate Tokens left' : 'Spend a Fate Token to spin this wheel again';
  }

  /* ---------- waiting for the player ---------- */
  function waitFor() {
    state.phase++;
    return new Promise(res => {
      state.waiter = res;
    });
  }
  function fire(v) {
    const w = state.waiter;
    if (w) {
      state.waiter = null;
      w(v);
    }
  }
  function autoFire(v, ms) {
    const ph = state.phase,
      run = state.runId;
    setTimeout(() => {
      if (state.auto && ph === state.phase && run === state.runId) fire(v);
    }, ms);
  }
  function abortRun() {
    state.runId++;
    fire('abort');
    if (state.wheel && state.wheel.spinning) state.wheel.skip();
  }

  /* ---------- the generic wheel step ---------- */
  async function playStep(cfg) {
    const run = state.runId;
    const chk = () => {
      if (run !== state.runId) throw ABORT;
    };
    const wheel = ensureWheel();
    setChip(cfg.emoji, cfg.title, cfg.bonus);
    setResult('');
    $('#resultSub').textContent = cfg.hint || '';
    $('#effects').innerHTML = cfg.preFx || '';
    wheel.setEntries(cfg.entries, { mode: cfg.mode, hue: cfg.hue });
    const total = cfg.entries.reduce((a, e) => a + e.w, 0);
    let immediate = false;
    for (;;) {
      setControls('ready');
      updateTokens();
      let a = 'spin';
      if (!immediate) {
        const p = waitFor();
        if (state.auto) autoFire('spin', 450);
        a = await p;
        chk();
      }
      immediate = false;
      if (a !== 'spin') continue;
      setControls('spinning');
      FW.Audio.init();
      $('#effects').innerHTML = '';
      setResult(cfg.mystery ? '???' : '');
      $('#resultSub').textContent = '';
      const idx = FW.weightedIndex(cfg.entries, state.rng);
      wheel.onLabel = (e, i, final) => {
        if (!final && !cfg.mystery) setResult(e.name);
      };
      wheel.onTick = (i, sp) => FW.Audio.tick(sp);
      await wheel.spinTo(idx, {
        duration: FW.spinDuration ? FW.spinDuration(state.speed) : state.speed === 'fast' ? 2300 : 4600,
        rng: state.rng,
      });
      chk();
      const e = cfg.entries[idx];
      const rare = e.w / total < 0.025 && cfg.entries.length > 4;
      setResult(cfg.display ? cfg.display(idx) : e.name, { rare, pop: true });
      FW.Audio.reveal(rare);
      const info = (cfg.onResult && cfg.onResult(idx)) || {};
      $('#resultSub').innerHTML = info.sub || '';
      $('#effects').innerHTML = info.fx || '';
      if (cfg.afterResult) cfg.afterResult();
      setControls('result');
      updateTokens();
      const p2 = waitFor();
      if (state.auto) autoFire('next', cfg.autoDelay || 1500);
      const b = await p2;
      chk();
      if (b === 'respin') {
        if (tokensLeft() <= 0) {
          toast('No Fate Tokens left');
          continue;
        }
        state.tokensUsed++;
        immediate = true;
        continue;
      }
      if (b === 'next') {
        if (cfg.onCommit) cfg.onCommit(idx);
        return idx;
      }
    }
  }

  /* ---------- sheet ---------- */
  function refreshSheet(curId) {
    if (!state.legend) return;
    const c = FW.compute(state.legend);
    $('#sheetTitle').textContent = 'Your Legend';
    const rows = H.sheetRows(state.legend, c, curId),
      upcoming = (rows.match(/class="row empty"/g) || []).length;
    // rows not rolled yet stay hidden until the player asks for them (remembered); everything rolled always shows
    const all = !!store.get('fw.sheetAll', false);
    $('#sheet').classList.toggle('all', all);
    $('#sheetBody').innerHTML =
      H.rating(c) +
      '<div class="rows">' +
      rows +
      '</div>' +
      (upcoming
        ? '<button class="btn small ghost sheet-more" id="sheetMore" aria-pressed="' +
          all +
          '"><span>' +
          (all ? 'Hide upcoming' : 'Show upcoming') +
          '</span>' +
          (all ? '' : ' <b class="cnt">' + upcoming + '</b>') +
          '</button>'
        : '');
    const more = $('#sheetMore');
    if (more)
      more.onclick = () => {
        store.set('fw.sheetAll', !all);
        refreshSheet(curId);
        const m = $('#sheetMore');
        if (m) m.focus();
      };
  }
  function refreshFightSheet() {
    const L = state.legend,
      c = FW.compute(L),
      f = state.fight || {};
    $('#sheetTitle').textContent = 'The Arena';
    let h =
      '<div class="vs"><div><b>' +
      c.rating.toFixed(1) +
      '</b><span>' +
      H.esc(L.pickName('title')) +
      '</span></div><div style="opacity:.6">VS</div><div><b>' +
      (f.opp ? FW.P(f.opp).lv : '?') +
      '</b><span>' +
      H.esc(f.opp ? f.opp.name : 'Unknown foe') +
      '</span></div></div>';
    if (f.arena) h += '<div class="adj"><span>Arena</span><b>' + H.esc(f.arena.name) + '</b></div>';
    h += '<h2 style="margin-top:14px">Your modifiers</h2>' + H.modTable(c);
    $('#sheetBody').innerHTML = h;
  }

  /* ---------- per-stage result text ---------- */
  function synergyChips(L) {
    return L.sources()
      .filter(s => s.kind === 'synergy')
      .map(s => ({ t: s.label, k: 'buff' }));
  }
  function stageInfo(stage, idx) {
    const L = state.legend,
      e = stage.entries[idx],
      id = stage.id;
    if (stage.mode === 'ladder') {
      const comp = FW.compute(L),
        t = comp.stats[stage.stat];
      const chips = t.parts.map(p => ({
        t: (p.d > 0 ? '+' : '−') + Math.abs(p.d) + ' ' + p.label,
        k: p.d > 0 ? 'buff' : 'debuff',
      }));
      const sub = t.bonus
        ? '<div class="tier-line"><span>' +
          H.esc(e.name) +
          '</span><span class="arrow">→</span><span class="final">' +
          H.esc(t.name + (t.over ? ' +' + t.over : '')) +
          '</span></div>'
        : t.parts.length
          ? 'Your modifiers cancel out (net 0)'
          : 'No tier bonuses apply';
      const note = t.bonus
        ? '<div class="legend-key">Your modifiers shifted the rolled tier ' +
          (t.bonus > 0 ? 'up' : 'down') +
          ' by ' +
          Math.abs(t.bonus) +
          (t.over ? ' (past the top, +' + t.over + ' overflow)' : '') +
          '.</div>'
        : '';
      return { sub, fx: H.fxCard(LAD[stage.stat].label, '', '', chips, note) };
    }
    if (id === 'height') {
      const cls = FW.heightClass(e.inches),
        p = cls.dsl ? FW.parse(cls.dsl) : null;
      return {
        sub: H.esc(cls.name + ' build'),
        fx: H.fxCard('Height: ' + e.name, cls.perk, cls.flaw, p ? FW.chips(p) : []),
      };
    }
    const p = FW.P(e);
    if (id === 'age') {
      const a = L.picks.age;
      return { sub: a.years ? H.esc(a.years + ' years old') : '', fx: H.fxCard(e.name, e.perk, e.flaw, FW.chips(p)) };
    }
    let title = e.name;
    if (id === 'race') title = 'Bonuses for ' + e.name;
    else if (id === 'sub') title = e.name + ' perks';
    else if (id === 'birth') title = 'Born in ' + e.name;
    else if (id === 'bg') title = 'Your past';
    else if (id === 'per') title = e.name + ' – how you act';
    else if (id === 'cls') title = 'Class: ' + e.name;
    else if (id === 'elem' && !FW.P(e).none) title = 'Element: ' + e.name;
    else if (id === 'pet' && !FW.P(e).none) title = 'Companion: ' + e.name;
    else if (id === 'hair' || id === 'eyes' || id === 'garb') title = 'Your look';
    let chips = FW.chips(p);
    if (id === 'wpn' || id === 'pow') chips = chips.concat(synergyChips(L));
    if (id === 'wpn' && !p.none)
      chips.unshift({ t: 'Weapon quality ' + '★'.repeat(p.q) + '☆'.repeat(5 - p.q), k: 'info' });
    if (id === 'pow' && !p.none) chips.unshift({ t: 'Rarity ' + '★'.repeat(p.rar) + '☆'.repeat(6 - p.rar), k: 'info' });
    if (id === 'title') chips.unshift({ t: 'Legend tier ' + '★'.repeat(p.tt) + '☆'.repeat(3 - p.tt), k: 'info' });
    const lookNote =
      (id === 'hair' || id === 'eyes' || id === 'garb') && !chips.length
        ? '<div class="legend-key">Cosmetic - it shapes your portrait, not your stats.</div>'
        : '';
    return { fx: H.fxCard(title, e.perk, e.flaw, chips, lookNote, id === 'race' || id === 'sub') };
  }

  /* ---------- main legend flow ---------- */
  async function runLegend(auto) {
    abortRun();
    closeModal();
    const run = ++state.runId;
    state.seed = ($('#seedInput').value || '').trim();
    state.legend = new FW.Legend({
      luck: state.luck,
      seed: state.seed || undefined,
      name: state.person.name,
      pres: state.person.pres,
    });
    state.rng = FW.makeRng(state.legend.seed + ':spin');
    state.tokensUsed = 0;
    state.image = null;
    state.imageBlob = null;
    state.fight = null;
    state.auto = !!auto;
    syncAutoBtn();
    show('spin');
    $('#sheet').classList.toggle('collapsed', window.innerWidth < 980);
    const L = state.legend;
    try {
      let i = -1;
      while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
        const def = FW.STAGES[i];
        const stage = FW.buildStage(def.id, L, {
          overrides: FW.mergeOverrides ? FW.mergeOverrides(state.overrides) : state.overrides,
        });
        // hand-picked by the player on the home screen: commit it and skip the wheel
        const want = state.person.presets[def.id];
        const wi = want ? stage.entries.findIndex(e => e.name === want) : -1;
        if (wi >= 0) {
          FW.commitPick(L, stage, wi, state.rng);
          if (L.chosen.indexOf(def.id) < 0) L.chosen.push(def.id);
          continue;
        }
        // appearance wheels can be rolled quietly
        if (def.look && state.person.spinLooks === false) {
          FW.commitPick(L, stage, FW.weightedIndex(stage.entries, state.rng), state.rng);
          continue;
        }
        renderSteps(FW.STAGES.length, i);
        refreshSheet(def.id);
        await playStep({
          emoji: stage.emoji,
          title: stage.title,
          bonus: stage.mode === 'ladder' ? stage.bonus : 0,
          entries: stage.entries,
          mode: stage.mode,
          hue: stage.hue,
          mystery: stage.mystery,
          onResult: idx => {
            FW.commitPick(L, stage, idx, state.rng);
            return stageInfo(stage, idx);
          },
          afterResult: () => refreshSheet(def.id),
        });
        if (run !== state.runId) return;
      }
      showCard();
    } catch (e) {
      if (e !== ABORT) throw e;
    }
  }

  /* ---------- card ---------- */
  function drawCardNow() {
    FW.drawCard($('#cardCanvas'), state.legend, { theme: state.theme, image: state.image });
  }
  function showCard() {
    const L = state.legend,
      c = FW.compute(L);
    show('card');
    drawCardNow();
    $('#cardRating').innerHTML =
      H.rating(c) +
      '<p class="legend-key" style="margin:0 0 6px">' +
      c.fateTokens +
      ' ' +
      tr(c.fateTokens === 1 ? 'Fate Token' : 'Fate Tokens') +
      ' &middot; ' +
      L.ally.length +
      ' ' +
      tr(L.ally.length === 1 ? 'ally' : 'allies') +
      '</p>';
    $('#cardParts').innerHTML = H.partsBars(c);
    $('#cardMods').innerHTML =
      H.modTable(c) +
      (c.weak.length || c.res.length
        ? '<div class="mods" style="margin-top:10px">' +
          c.weak.map(w => '<span class="mod debuff">Weak to ' + FW.cap(w) + '</span>').join('') +
          c.res.map(w => '<span class="mod buff">Resists ' + FW.cap(w) + '</span>').join('') +
          c.atk.map(w => '<span class="mod info">' + FW.cap(w) + ' attacks</span>').join('') +
          '</div>'
        : '');
    const ch = L.chron.filter(x => x.text);
    $('#chronBox').hidden = !ch.length;
    $('#chronList').innerHTML = ch.map(x => '<li>' + H.esc(x.text) + '</li>').join('');
    $('#btnFight').textContent = L.chron.some(x => x.kind !== 'story') ? '⚔ Another fight' : '⚔ Enter the Arena'; // story chapters also add chronicle entries; only real fights count
    hook('cardShown', L);
  }
  function savePng() {
    const cv = $('#cardCanvas');
    const name = state.legend.displayName().replace(/[^\w]+/g, '_');
    cv.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'destiny-unbound_' + name + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }
  function saveToHall() {
    const L = state.legend,
      c = FW.compute(L);
    const item = {
      id: Date.now().toString(36),
      code: L.toCode(),
      title: (L.name ? L.name + ', ' : '') + L.pickName('title'),
      race: (L.has('sub') ? L.pickName('sub') + ' ' : '') + L.raceName(),
      rating: c.rating,
      rank: c.rank,
      date: new Date().toISOString().slice(0, 10),
    };
    if (L.saga && FW.Story)
      item.saga = {
        summary: FW.Story.summary(L),
        end: L.saga.end,
        house: L.saga.dyn && L.saga.dyn.house,
        gen: L.saga.dyn && L.saga.dyn.gen,
      };
    state.hall = state.hall.filter(h => h.code !== item.code);
    state.hall.unshift(item);
    state.hall = state.hall.slice(0, 60);
    store.set('fw.hall', state.hall);
    hook('hallSave', item);
    toast(state.imageBlob ? 'Saved to the Hall with its portrait' : 'Saved to the Hall of Legends');
  }

  /* ---------- arena ---------- */
  async function runFight() {
    abortRun();
    closeModal();
    const run = ++state.runId;
    const L = state.legend;
    state.fight = {};
    state.auto = false;
    syncAutoBtn();
    show('spin');
    $('#sheet').classList.toggle('collapsed', window.innerWidth < 980);
    const steps = 5;
    try {
      renderSteps(steps, 0);
      refreshFightSheet();
      const ui = await playStep({
        emoji: '🌌',
        title: 'What universe do you fight?',
        entries: FW.UNIVERSES.map(u => ({ name: u.name, w: 1, dsl: '' })),
        mode: 'cat',
        hue: 210,
        mystery: true,
        hint: 'Tap SPIN to find your battlefield',
        onResult: idx => ({ sub: H.esc(FW.UNIVERSES[idx].blurb) }),
      });
      const uni = FW.UNIVERSES[ui];
      state.fight.uni = uni;
      renderSteps(steps, 1);
      const oi = await playStep({
        emoji: '🗡️',
        title: 'Who do you fight?',
        entries: FW.oppEntries(uni, L).map(o => ({ name: o.name, w: o.w, dsl: o.dsl })),
        mode: 'stripe',
        hue: uni.hue,
        mystery: true,
        onResult: idx => {
          const o = uni.opps[idx],
            p = FW.P(o);
          const chips = [{ t: 'Level ' + p.lv, k: 'info' }].concat(
            p.atk.map(a => ({ t: FW.cap(a) + ' attacks', k: 'info' })),
            p.weak.map(a => ({ t: 'Weak to ' + FW.cap(a), k: 'buff' })),
            p.res.map(a => ({ t: 'Resists ' + FW.cap(a), k: 'debuff' }))
          );
          return { sub: H.esc(o.perk), fx: H.fxCard(o.name, o.perk, '', chips) };
        },
      });
      const opp = uni.opps[oi];
      state.fight.opp = opp;
      refreshFightSheet();
      renderSteps(steps, 2);
      const ai = await playStep({
        emoji: '🏟️',
        title: 'Where do you fight?',
        entries: FW.ARENAS.map(a => ({ name: a.name, w: a.w, dsl: '' })),
        mode: 'cat',
        hue: 200,
        onResult: idx => {
          const a = FW.ARENAS[idx];
          const comp = FW.compute(L);
          const hits = comp.conds.filter(cd => a.tags.indexOf(cd.env) >= 0);
          const chips = a.tags
            .map(t => ({ t: FW.cap(FW.ENV_LABEL[t] || t), k: 'info' }))
            .concat(
              hits.map(cd => ({
                t: cd.label + ' triggers',
                k: cd.mods && Object.values(cd.mods).reduce((x, y) => x + y, 0) >= 0 ? 'cond-buff' : 'cond-debuff',
              }))
            );
          return {
            fx: H.fxCard(
              a.name,
              a.tags.length
                ? 'Conditions: ' + a.tags.map(t => FW.ENV_LABEL[t]).join(', ')
                : 'Neutral ground - no situational effects.',
              '',
              chips
            ),
          };
        },
      });
      const arena = FW.ARENAS[ai];
      state.fight.arena = arena;
      refreshFightSheet();
      const rep = FW.matchup(L, opp, arena);
      state.fight.rep = rep;
      const fctx = { arena: arena.name, uni: uni.name, p: rep.pWin }; // the win chance is kept for the Giant Slayer achievement
      renderSteps(steps, 3);
      const wi = await playStep({
        emoji: '⚔️',
        title: 'Do you win?',
        entries: [
          { name: 'Victory', w: rep.pWin, dsl: '', color: '#2f9e57', colorLight: 38 },
          { name: 'Stalemate', w: rep.pDraw, dsl: '', color: '#777', colorLight: 46 },
          { name: 'Defeat', w: rep.pLose, dsl: '', color: '#b8383b', colorLight: 40 },
        ],
        mode: 'cat',
        hue: 0,
        hint: 'Slice sizes are your real odds',
        preFx: H.battle(L.pickName('title'), opp.name, arena.name, rep),
        onResult: () => ({ fx: H.battle(L.pickName('title'), opp.name, arena.name, rep) }),
      });
      const result = ['win', 'draw', 'lose'][wi];
      if (result === 'win') FW.Audio.reveal(true);
      else if (result === 'lose') FW.Audio.bad();
      renderSteps(steps, 4);
      if (result === 'draw') {
        const c = FW.applyConsequence(L, 'draw', 'draw', opp, state.rng, fctx);
        setChip('🤝', 'Stalemate', 0);
        setResult('Both retreat', { pop: true });
        $('#resultSub').textContent = c.text;
        $('#effects').innerHTML = '';
        $('#btnSpin').hidden = true;
        setControls('result');
        $('#btnRespin').hidden = true;
        await finishWait(run);
      } else if (result === 'win') {
        const oe = FW.outcomeEntries(L);
        const mult = oe
          .filter(o => Math.abs(o.mult - 1) > 0.01)
          .map(o => ({ t: o.name + ' ×' + o.mult, k: o.mult > 1 ? 'buff' : 'debuff' }));
        const note = mult.length ? H.fxCard('Your ' + L.pickName('per') + ' nature bends the odds', '', '', mult) : '';
        await playStep({
          emoji: '🏆',
          title: 'What do you do to him?',
          entries: oe.map(o => ({ name: o.name, w: o.w, dsl: '' })),
          mode: 'cat',
          hue: 130,
          preFx: note,
          hint: 'Your personality changes the slice sizes',
          onResult: idx => ({ sub: H.esc(oe[idx].blurb), fx: H.fxCard(oe[idx].name, oe[idx].blurb, '', []) }),
          onCommit: idx => {
            FW.applyConsequence(L, 'win', oe[idx].key, opp, state.rng, fctx);
          },
        });
      } else {
        const de = FW.defeatEntries(L);
        await playStep({
          emoji: '💀',
          title: 'What happens to you?',
          entries: de.map(d => ({ name: d.name, w: d.w, dsl: '' })),
          mode: 'stripe',
          hue: 5,
          onResult: idx => ({ sub: H.esc(de[idx].blurb), fx: H.fxCard(de[idx].name, '', de[idx].blurb, []) }),
          onCommit: idx => {
            FW.applyConsequence(L, 'lose', de[idx].key, opp, state.rng, fctx);
          },
        });
      }
      if (run !== state.runId) return;
      showCard();
      toast('The chronicle was added to your card');
    } catch (e) {
      if (e !== ABORT) throw e;
    }
  }
  async function finishWait(run) {
    $('#btnNext').textContent = 'Back to card ▸';
    const p = waitFor();
    const a = await p;
    $('#btnNext').textContent = 'Next ▸';
    if (run !== state.runId) throw ABORT;
  }

  /* ---------- modals ---------- */
  let modalReturn = null; // where keyboard focus goes back to when a dialog closes
  function closeModal() {
    if ($('#modalRoot').firstChild) hook('modalClosed');
    $('#modalRoot').innerHTML = '';
    if (modalReturn && modalReturn.isConnected) {
      try {
        modalReturn.focus({ preventScroll: true });
      } catch (e) {
        /* gone */
      }
    }
    modalReturn = null;
  }
  function openModal(html) {
    if (!$('#modalRoot').firstChild) modalReturn = document.activeElement;
    $('#modalRoot').innerHTML =
      '<div class="overlay" id="ov"><div class="modal" role="dialog" aria-modal="true" tabindex="-1">' +
      html +
      '</div></div>';
    const dlg = $('#modalRoot .modal'),
      head = dlg.querySelector('h2, h3');
    if (head) {
      head.id = head.id || 'modalTitle';
      dlg.setAttribute('aria-labelledby', head.id);
    } else dlg.setAttribute('aria-label', 'Dialog');
    $('#ov').addEventListener('mousedown', e => {
      if (e.target.id === 'ov') closeModal();
    });
    const m = $('#modalRoot .close');
    if (m) m.addEventListener('click', closeModal);
    // move keyboard focus into the dialog (a field if it has one, else the dialog itself) and keep Tab inside it
    setTimeout(() => {
      if (!dlg.isConnected || dlg.contains(document.activeElement)) return;
      const f = dlg.querySelector('input:not([type=hidden]):not([disabled]), textarea, select');
      (f || dlg).focus({ preventScroll: true });
    }, 0);
    dlg.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const items = [
        ...dlg.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])'
        ),
      ].filter(x => x.offsetParent !== null);
      if (!items.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dlg)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }
  function menuModal() {
    openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Menu</h2><div class="opt-grid">' +
        '<button class="opt" data-act="hall"><b>Hall of Legends</b><span>Your saved characters</span></button>' +
        '<button class="opt" data-act="options"><b>Options</b><span>Graphics, sound, gameplay, accessibility, controls and saves</span></button>' +
        '<button class="opt" data-act="mods"><b>Mods</b><span>Your own themes, sounds, music and wheel entries</span></button>' +
        '<button class="opt" data-act="packs"><b>Wheel packs</b><span>Install or share packs of new wheel entries</span></button>' +
        '<button class="opt" data-act="ach"><b>Achievements</b><span>Badges and the rare entries they unlock</span></button>' +
        '<button class="opt" data-act="versus"><b>Versus</b><span>Pit two legends against each other</span></button>' +
        '<button class="opt" data-act="workshop"><b>Wheel Workshop</b><span>Edit slice sizes, remove or add entries</span></button>' +
        '<button class="opt" data-act="import"><b>Import a Legend Code</b><span>Open a character someone shared</span></button>' +
        '<button class="opt" data-act="help"><b>How the rules work</b><span>Tiers, buffs, debuffs, luck and the arena</span></button>' +
        '<a class="opt" href="https://ko-fi.com/bzrkherja" target="_blank" rel="noopener"><b>&#9749; Support on Ko-fi</b><span>Enjoying Destiny Unbound? Buy the developer a coffee</span></a>' +
        '<button class="opt" data-act="reset"><b>Reset saved data</b><span>Clears settings, Hall and Workshop edits</span></button></div>'
    );
    $('#modalRoot')
      .querySelectorAll('[data-act]')
      .forEach(b =>
        b.addEventListener('click', () =>
          ({
            hall: hallModal,
            workshop: workshopModal,
            import: importModal,
            help: helpModal,
            reset: resetData,
            options: () => hook('optionsModal'),
            packs: () => window.FWApp.packsModal(),
            mods: () => window.FWApp.modsModal(),
            ach: () => window.FWApp.achievementsModal(),
            versus: () => window.FWApp.versusModal(),
          })[b.dataset.act]()
        )
      );
  }
  function resetData() {
    openModal(
      '<h2>Reset everything?</h2><p>This clears your settings, every saved legend and portrait, your Art Studio setup (including remembered keys) and all Workshop edits on this device. It cannot be undone.</p><div class="cta" style="justify-content:flex-start"><button class="btn primary" id="rsYes">Yes, reset</button><button class="btn ghost" id="rsNo">Cancel</button></div>'
    );
    $('#rsNo').onclick = closeModal;
    $('#rsYes').onclick = () => {
      ['fw.settings', 'fw.hall', 'fw.overrides', 'fw.person', 'fw.art', 'fw.options', 'fw.achievements'].forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (e) {
          /* ignore */
        }
      });
      state.hall = [];
      state.overrides = {};
      hook('reset');
      closeModal();
      toast('Saved data cleared');
    };
  }
  function hallModal() {
    const rows = state.hall.length
      ? state.hall
          .map(
            h =>
              '<div class="hall-item"><div><b>' +
              H.esc(h.title) +
              '</b><span>' +
              H.esc(h.race) +
              ' · rating ' +
              h.rating +
              ' (' +
              H.esc(h.rank) +
              ') · ' +
              h.date +
              (h.saga
                ? '<br>📖 ' +
                  H.esc(h.saga.summary) +
                  (h.saga.house ? ' · ' + H.esc(h.saga.house) + ', generation ' + h.saga.gen : '')
                : '') +
              '</span></div><div><button class="btn small" data-view="' +
              h.id +
              '">View</button> <button class="btn small ghost" data-code="' +
              h.id +
              '">Code</button> <button class="btn small ghost" data-del="' +
              h.id +
              '">✕</button></div></div>'
          )
          .join('')
      : '<p>No legends saved yet. Finish a spin and press <b>Save to Hall</b>.</p>';
    openModal('<button class="btn small ghost close">Close ✕</button><h2>Hall of Legends</h2>' + rows);
    const root = $('#modalRoot');
    root.querySelectorAll('[data-view]').forEach(b =>
      b.addEventListener('click', () => {
        const h = state.hall.find(x => x.id === b.dataset.view);
        loadCode(h.code, h.id);
      })
    );
    root
      .querySelectorAll('[data-code]')
      .forEach(b =>
        b.addEventListener('click', () =>
          copy(state.hall.find(x => x.id === b.dataset.code).code, 'Legend Code copied')
        )
      );
    root.querySelectorAll('[data-del]').forEach(b =>
      b.addEventListener('click', () => {
        state.hall = state.hall.filter(x => x.id !== b.dataset.del);
        store.set('fw.hall', state.hall);
        hook('hallDelete', b.dataset.del);
        hallModal();
      })
    );
  }
  function loadCode(code, hallId) {
    try {
      const L = FW.Legend.fromCode(code);
      abortRun();
      state.legend = L;
      state.image = null;
      state.imageBlob = null;
      state.tokensUsed = 0;
      closeModal();
      showCard();
      hook('hallLoad', hallId);
      return true;
    } catch (e) {
      return e.message || 'Invalid code';
    }
  }
  function importModal() {
    openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Import a Legend Code</h2><p>Paste a code that starts with <b>FW1.</b></p><textarea id="codeIn" rows="4" placeholder="FW1...."></textarea><p id="codeErr" style="color:var(--bad);min-height:1.4em"></p><button class="btn primary" id="codeGo">Open legend</button>'
    );
    $('#codeGo').onclick = () => {
      const r = loadCode($('#codeIn').value);
      if (r !== true) $('#codeErr').textContent = 'Could not open that code: ' + r;
    };
  }
  function helpModal() {
    openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>How the rules work</h2>' +
        '<p><b>Slice size is probability.</b> Each wheel’s slices are drawn in proportion to their odds. The result is decided fairly first, then the wheel animates to it.</p>' +
        '<p><b>Tier ladders.</b> Strength, Speed, Durability, Intelligence, Fighting and the two Mastery wheels are ladders. A modifier of +2 lifts your rolled tier two steps; past the top it shows as an overflow such as <i>Omniscient +1</i>.</p>' +
        '<p><b>Buffs and debuffs.</b> <span class="mod buff">+1 STR</span> always apply. <span class="mod cond-buff">In darkness: +2 ALL</span> only apply in matching arenas. <span class="mod cond-debuff">When winning: −2 ALL</span> trigger on the state of the fight (behind / ahead).</p>' +
        '<p><b>Synergies.</b> Weapon affinity (+1 weapon skill), natural weapons (+1 Fighting when bare-handed) and element resonance between weapon and power (+1 Fighting).</p>' +
        '<p><b>Power rating</b> blends Strength 22%, Durability 18%, Speed 16%, Fighting 14%, Power 15%, Intelligence 8%, Weapon 7%, plus Renown. It sets your odds in the arena.</p>' +
        '<p><b>Arena.</b> Your rating plus situational buffs and debuffs (arena conditions, exploited weaknesses, element matchups) face the opponent’s level. The “Do you win?” wheel uses the exact odds. Your personality bends the “What do you do to him?” wheel.</p>' +
        '<p><b>Class, element, companion and outfit</b> each add their own buffs and debuffs. Hair and eyes are mostly cosmetic and shape your portrait. On the home screen you can name your hero and choose some results by hand instead of spinning.</p>' +
        '<p><b>Art Studio.</b> On the card, <i>Generate AI art</i> writes an image prompt from your character and what happened in the arena, then sends it to the generator you choose: one on your own PC, or an online service with your own key.</p>' +
        '<p><b>Luck levels</b> tilt the odds toward higher tiers and richer results: Mortal is fair, Divine produces cosmic heroes. <b>Fate Tokens</b> let you re-spin.</p>'
    );
  }
  function workshopModal() {
    const LISTS = FW.LISTS;
    const items = [
      ['race', 'Races'],
      ['birth', 'Birthplaces'],
      ['bg', 'Backgrounds'],
      ['per', 'Personalities'],
      ['cls', 'Classes'],
      ['wpn', 'Weapons'],
      ['enh', 'Enhancements'],
      ['elem', 'Elements'],
      ['pow', 'Powers'],
      ['weak', 'Weaknesses'],
      ['pet', 'Companions'],
      ['title', 'Titles'],
      ['mark', 'Marks of Fate'],
      ['hair', 'Hair'],
      ['eyes', 'Eyes'],
      ['garb', 'Outfits'],
    ]
      .concat(FW.Story ? [['story', 'Story chapters']] : [])
      .concat(Object.keys(FW.SUBS).map(k => ['sub:' + k, k + ' kinds']))
      .concat(FW.STATS.map(s => ['ladder:' + s, LAD[s].label + ' tiers']));
    let key = 'race';
    const base = k => {
      if (k.indexOf('sub:') === 0) return FW.SUBS[k.slice(4)].rows.map(r => ({ name: r.name, w: r.w }));
      if (k === 'story') return FW.Story.CHAPTERS.filter(c => !c.retire).map(c => ({ name: c.name, w: c.w }));
      if (k.indexOf('ladder:') === 0) {
        const L = LAD[k.slice(7)];
        const w = FW.ladderBase(L.names.length, L.pk, L.decay);
        return L.names.map((n, i) => ({ name: n, w: Math.round(w[i] * 100) / 100 }));
      }
      return LISTS[k]().map(r => ({ name: r.name, w: r.w }));
    };
    let ov = {};
    const load = () => {
      ov = JSON.parse(JSON.stringify(state.overrides[key] || { weights: {}, removed: [], added: [] }));
      ov.weights = ov.weights || {};
      ov.removed = ov.removed || [];
      ov.added = ov.added || [];
    };
    const render = () => {
      const isLadder = key.indexOf('ladder:') === 0;
      const rows = base(key)
        .map(r => {
          const removed = ov.removed.indexOf(r.name) >= 0;
          const w = ov.weights[r.name] != null ? ov.weights[r.name] : r.w;
          return (
            '<div class="ws-row" style="' +
            (removed ? 'opacity:.4' : '') +
            '"><span>' +
            H.esc(r.name) +
            '</span><input type="number" min="0.01" step="0.1" value="' +
            w +
            '" data-w="' +
            H.esc(r.name) +
            '" ' +
            (removed ? 'disabled' : '') +
            '>' +
            (isLadder
              ? '<span></span>'
              : '<button class="btn small ghost" data-rm="' +
                H.esc(r.name) +
                '" title="Remove / restore">' +
                (removed ? '↩' : '✕') +
                '</button>') +
            '</div>'
          );
        })
        .join('');
      const added = ov.added
        .map(
          (a, i) =>
            '<div class="ws-row"><span>' +
            H.esc(a.name) +
            ' <small>(custom)</small></span><input type="number" min="0.01" step="0.1" value="' +
            a.w +
            '" data-aw="' +
            i +
            '"><button class="btn small ghost" data-arm="' +
            i +
            '">✕</button></div>'
        )
        .join('');
      $('#wsBody').innerHTML =
        rows +
        added +
        (isLadder
          ? ''
          : '<div class="field"><input id="wsName" placeholder="New entry name" maxlength="40"><input id="wsW" type="number" value="5" min="0.01" step="0.1" style="max-width:90px"><button class="btn small" id="wsAdd">Add</button></div><p class="legend-key">Custom entries have no stat effects.</p>');
      const body = $('#wsBody');
      body.querySelectorAll('[data-w]').forEach(i =>
        i.addEventListener('input', () => {
          const v = parseFloat(i.value);
          if (v > 0) ov.weights[i.dataset.w] = v;
        })
      );
      body.querySelectorAll('[data-rm]').forEach(b =>
        b.addEventListener('click', () => {
          const n = b.dataset.rm;
          const ix = ov.removed.indexOf(n);
          if (ix >= 0) ov.removed.splice(ix, 1);
          else ov.removed.push(n);
          render();
        })
      );
      body.querySelectorAll('[data-aw]').forEach(i =>
        i.addEventListener('input', () => {
          const v = parseFloat(i.value);
          if (v > 0) ov.added[+i.dataset.aw].w = v;
        })
      );
      body.querySelectorAll('[data-arm]').forEach(b =>
        b.addEventListener('click', () => {
          ov.added.splice(+b.dataset.arm, 1);
          render();
        })
      );
      const add = $('#wsAdd');
      if (add)
        add.onclick = () => {
          const n = $('#wsName').value.trim(),
            w = parseFloat($('#wsW').value);
          if (!n) return toast('Give the entry a name');
          if (!(w > 0)) return toast('Weight must be above 0');
          ov.added.push({ name: n, w });
          render();
        };
    };
    openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Wheel Workshop</h2><p>Make a result more or less likely, remove it, or add your own. Weights are relative: 10 is ten times as likely as 1. Changes apply to your next spins.</p><select id="wsSel">' +
        items.map(i => '<option value="' + i[0] + '">' + i[1] + '</option>').join('') +
        '</select><div id="wsBody" style="margin:12px 0"></div><div class="cta" style="justify-content:flex-start;margin:0"><button class="btn primary" id="wsSave">Save this wheel</button><button class="btn ghost" id="wsReset">Reset this wheel</button></div>'
    );
    $('#wsSel').onchange = () => {
      key = $('#wsSel').value;
      load();
      render();
    };
    $('#wsSave').onclick = () => {
      const empty = !Object.keys(ov.weights).length && !ov.removed.length && !ov.added.length;
      if (empty) delete state.overrides[key];
      else state.overrides[key] = ov;
      store.set('fw.overrides', state.overrides);
      toast('Saved');
    };
    $('#wsReset').onclick = () => {
      delete state.overrides[key];
      store.set('fw.overrides', state.overrides);
      load();
      render();
      toast('Reset to defaults');
    };
    load();
    render();
  }

  /* ---------- wiring ---------- */
  function syncAutoBtn() {
    $('#btnAutoToggle').textContent = 'Auto: ' + (state.auto ? 'on' : 'off');
  }
  function syncSpeedBtn() {
    $('#btnSpeed').textContent = 'Speed: ' + state.speed;
  }
  function syncDirBtn() {
    $('#btnDir').textContent = state.spinDir === 'cw' ? '↻ Clockwise' : '↺ Counter-clockwise';
    if (state.wheel) state.wheel.dir = state.spinDir === 'cw' ? 1 : -1;
  }
  function syncSound() {
    $('#btnSound').innerHTML = state.sound ? '&#128266;' : '&#128263;';
    FW.Audio.on = state.sound;
    FW.Audio.applyVolume();
  }

  $('#btnStart').onclick = () => {
    FW.Audio.init();
    runLegend(false);
  };
  $('#btnAuto').onclick = () => {
    FW.Audio.init();
    runLegend(true);
  };
  $('#btnHall').onclick = hallModal;
  $('#btnImport').onclick = importModal;
  $('#btnWorkshop').onclick = workshopModal;
  $('#btnMenu').onclick = menuModal;
  $('#brand').onclick = () => {
    abortRun();
    closeModal();
    show('home');
  };
  $('#brand').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      $('#brand').click();
    }
  });
  $('#btnSpin').onclick = () => fire('spin');
  $('#btnNext').onclick = () => fire('next');
  $('#btnRespin').onclick = () => {
    if (tokensLeft() > 0) fire('respin');
    else toast('No Fate Tokens left');
  };
  $('#wheel').addEventListener('click', () => {
    if (state.wheel && state.wheel.spinning) state.wheel.skip();
    else if (state.mode === 'ready') fire('spin');
  });
  $('#btnAutoToggle').onclick = () => {
    state.auto = !state.auto;
    syncAutoBtn();
    if (state.auto && state.waiter) {
      if (state.mode === 'ready') autoFire('spin', 300);
      else if (state.mode === 'result') autoFire('next', 600);
    }
  };
  $('#btnSpeed').onclick = () => {
    state.speed = state.speed === 'normal' ? 'fast' : 'normal';
    syncSpeedBtn();
    persist();
  };
  $('#btnDir').onclick = () => {
    state.spinDir = state.spinDir === 'cw' ? 'ccw' : 'cw';
    syncDirBtn();
    persist();
  };
  // Spin settings: speed, direction and the Fate Token counter, in a small pop-up next to Auto
  const spinSet = open => {
    const p = $('#spinSet'),
      b = $('#btnSpinSet');
    if (!p) return;
    p.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
  };
  $('#btnSpinSet').onclick = e => {
    e.stopPropagation();
    spinSet($('#spinSet').hidden);
    if (!$('#spinSet').hidden) $('#btnSpeed').focus();
  };
  document.addEventListener('click', e => {
    if (!$('#spinSet').hidden && !e.target.closest('.spinset-wrap')) spinSet(false);
  });
  document.addEventListener(
    'keydown',
    e => {
      if (e.key === 'Escape' && !$('#spinSet').hidden) {
        e.stopImmediatePropagation();
        e.preventDefault();
        spinSet(false);
        $('#btnSpinSet').focus();
      }
    },
    true
  );
  $('#btnSound').onclick = () => {
    state.sound = !state.sound;
    syncSound();
    persist();
    FW.Audio.init();
    FW.Audio.click();
  };
  $('#btnLuck').onclick = () => {
    const i = FW.LUCK.findIndex(l => l.id === state.luck);
    setLuck(FW.LUCK[(i + 1) % FW.LUCK.length].id);
    if (state.screen !== 'home') toast('Luck applies to your next legend');
  };
  $('#btnTheme').onclick = () => {
    const k = Object.keys(FW.THEMES);
    setTheme(k[(k.indexOf(state.theme) + 1) % k.length]);
  };
  $('#sheetToggle').onclick = () => $('#sheet').classList.toggle('collapsed');
  $('#luckOpts').addEventListener('click', e => {
    const b = e.target.closest('[data-luck]');
    if (b) setLuck(b.dataset.luck);
  });
  $('#themeOpts').addEventListener('click', e => {
    const b = e.target.closest('[data-theme]');
    if (b) setTheme(b.dataset.theme);
  });
  $('#btnPng').onclick = savePng;
  $('#btnCopyText').onclick = () => copy(FW.legendText(state.legend), 'Character text copied');
  $('#btnCopyCode').onclick = () => copy(state.legend.toCode(), 'Legend Code copied');
  $('#btnSaveHall').onclick = saveToHall;
  $('#btnAgain').onclick = () => runLegend(false);
  $('#btnFight').onclick = () => runFight();
  $('#btnPortrait').onclick = () => $('#portraitFile').click();
  $('#portraitFile').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    hook('portraitFile', f);
    e.target.value = '';
  });
  document.addEventListener('keydown', e => {
    const K = FW.prefs ? FW.prefs.keys : { advance: ' ', next: 'Enter', back: 'Escape' };
    // closing a dialog uses up the key press, so the menu doesn't also treat it as "go back a screen"
    if ((e.key === 'Escape' || e.key === K.back) && $('#modalRoot').firstChild) {
      e.preventDefault();
      closeModal();
      return;
    }
    if ($('#modalRoot').firstChild || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || ''))
      return;
    if (state.screen !== 'spin') return;
    if (e.key === K.advance || e.key === K.next) {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') return;
      e.preventDefault();
      if (state.wheel && state.wheel.spinning) state.wheel.skip();
      else if (state.mode === 'ready') fire('spin');
      else if (state.mode === 'result') fire('next');
    }
  });

  document.body.dataset.theme = state.theme;
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => FW.Audio.init(), { once: true }));
  $('#btnTheme').textContent = FW.THEMES[state.theme].name;
  $('#btnLuck').textContent = 'Luck: ' + luckInfo().name;
  renderHomeOpts();
  syncAutoBtn();
  syncSpeedBtn();
  syncDirBtn();
  syncSound();
  if (
    'serviceWorker' in navigator &&
    /^https?:$/.test(location.protocol) &&
    location.hostname !== 'localhost' &&
    location.hostname !== '127.0.0.1'
  )
    navigator.serviceWorker.register('sw.js').catch(() => {});

  window.FWApp = {
    state,
    store,
    hooks,
    runLegend,
    runFight,
    showCard,
    setTheme,
    setLuck,
    fire,
    toast,
    copy,
    openModal,
    closeModal,
    drawCardNow,
    loadCode,
    saveToHall,
    resetData,
    hallModal,
    syncSound,
    syncSpeedBtn,
    syncDirBtn,
    persist,
    flow: {
      playStep,
      show,
      abortRun,
      ABORT,
      renderSteps,
      syncAutoBtn,
      setChip,
      setResult,
      setControls,
      updateTokens,
      newRun: () => ++state.runId,
      runId: () => state.runId,
      finishWait,
    },
  };
})();
