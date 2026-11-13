/* Destiny Unbound main menu: the themed title screen, keyboard and controller navigation (with matching button
   prompts), the first-run guide, Credits, and remembering the last legend for "Continue".
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW, H = FW.html, App = window.FWApp, D = window.fatewheelDesktop || null;
  const $ = s => document.querySelector(s);
  const LOOKS = ['ashen', 'astral', 'iron', 'bloodmoon'];
  const t = s => (FW.t ? FW.t(s) : s);

  /* ---------------- the last legend, for Continue / Story / Arena ---------------- */
  const last = () => App.store.get('fw.last', null);
  const prevShown = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prevShown) prevShown(L);
    try { App.store.set('fw.last', { code: L.toCode(), name: L.displayName(), race: L.raceName(), ch: L.saga ? L.saga.ch || 0 : 0, end: L.saga ? L.saga.end || '' : '', date: new Date().toISOString().slice(0, 10) }); } catch (e) { /* not finished yet */ }
  };
  function needLegend(what) { App.toast(t('Spin a legend first') + ' - ' + what); App.flow.show('home'); }
  function withLast(fn, what) { const l = last(); if (!l) return needLegend(what); if (App.loadCode(l.code) !== true) { App.store.set('fw.last', null); return needLegend(what); } fn(l); }

  /* ---------------- menu items ---------------- */
  const ITEMS = [
    { k: 'Continue', run: () => withLast(() => {}, ''), sub: () => { const l = last(); return l ? l.name + '  ◆  ' + (l.end ? t('Saga ended') : l.ch ? t('Chapter') + ' ' + l.ch : t('Story not started')) : ''; }, hide: () => !last() },
    { k: 'New Legend', run: () => App.flow.show('home') },
    { k: 'Story', run: () => { const l = last(); if (l && l.end) return withLast(() => App.toast(t('That saga has ended: spin a new legend or continue as an heir')), ''); withLast(() => { FW.Audio.init(); App.runStory(); }, t('its story begins on the card')); } },
    { k: 'Arena', run: () => withLast(() => { FW.Audio.init(); App.runFight(); }, t('then send it into the arena')) },
    { k: 'Daily Challenge', run: () => { FW.Audio.init(); App.startDaily(); } },
    { k: 'Hall of Legends', run: () => $('#btnHall').click() },
    { k: 'Mods', run: () => App.modsModal() },
    { k: 'Options', run: () => FW.Options.open() },
    { k: 'Quit', run: () => D && D.quit(), hide: () => !(D && D.quit) }
  ];
  let sel = 0;
  const looks = () => { const id = App.state.theme, th = FW.THEMES[id] || {}; const k = LOOKS.indexOf(id) >= 0 ? id : th.base; return LOOKS.indexOf(k) >= 0 ? k : 'ashen'; };
  const visible = () => [...document.querySelectorAll('#screen-title .item')].filter(b => !b.hidden);

  function render() {
    const k = looks(), el = $('#screen-title'); if (!el) return;
    const mods = (FW.Mods && FW.Mods.loaded || []).filter(m => m.enabled !== false).map(m => m.name);
    el.innerHTML = '<div class="tscr" data-look="' + k + '"><div class="bgart"></div><div class="fxlayer">' + (k === 'ashen' ? '<div class="embers"></div>' : k === 'astral' ? '<div class="stars"></div>' : '') + '</div>' +
      '<div class="stage"><div class="wheelart" aria-hidden="true"></div>' +
      '<div class="title"><h2 class="logoart" role="img" aria-label="Destiny Unbound">Destiny Unbound</h2><p>' + H.esc(t((FW.MENU_TAGS || {})[k] || '')) + '</p></div>' +
      '<nav class="panel" role="menu" aria-label="' + H.esc(t('Main menu')) + '">' + ITEMS.map((it, i) => {
        const sub = it.sub ? it.sub() : '';
        return '<button class="item" role="menuitem" data-i="' + i + '"' + (it.hide && it.hide() ? ' hidden' : '') + '>' + icon(it.k) + '<div>' + H.esc(t(it.k)) + (sub ? '<small>' + H.esc(sub) + '</small>' : '') + '</div></button>';
      }).join('') + '</nav></div>' +
      '<div class="foot"><span>v' + H.esc(FW.VERSION) + (mods.length ? ' · ' + H.esc(t('Mods')) + ': ' + H.esc(mods.join(', ')).slice(0, 80) : '') + '</span><span class="hint" id="navHint"></span>' +
      '<span class="links"><button data-l="ach">' + H.esc(t('Achievements')) + '</button>·<button data-l="credits">' + H.esc(t('Credits')) + '</button>·<button data-l="feedback">' + H.esc(t('Feedback')) + '</button>·<a class="fl" href="' + H.esc(FW.DISCORD_URL) + '" target="_blank" rel="noopener">Discord</a>·<a href="https://ko-fi.com/bzrkherja" target="_blank" rel="noopener"><b>☕ ' + H.esc(t('Support on Ko-fi')) + '</b></a></span></div></div>';
    el.querySelectorAll('.item').forEach(b => {
      b.addEventListener('mouseenter', () => pick(+b.dataset.i, false));
      b.addEventListener('focus', () => pick(+b.dataset.i, false));
      b.addEventListener('click', () => activate(+b.dataset.i));
    });
    el.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => ({ ach: () => App.achievementsModal(), credits: credits, feedback: () => FW.System.feedbackModal() })[b.dataset.l]()));
    const vis = visible(); if (!vis.some(b => +b.dataset.i === sel)) sel = vis.length ? +vis[0].dataset.i : 0;
    pick(sel, false); fit(); hint();
    if (coachItem >= 0 && $('#coach')) { const c = el.querySelector('.item[data-i="' + coachItem + '"]'); if (c) c.classList.add('coach-hl'); }   // a redraw (e.g. when mods finish loading) keeps the guide's highlight
  }
  let coachItem = -1;
  function icon(k) { const d = (FW.MENU_ICONS || {})[k]; return d ? '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>' : ''; }
  function pick(i, focus) {
    sel = i;
    document.querySelectorAll('#screen-title .item').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    const b = document.querySelector('#screen-title .item[data-i="' + i + '"]');
    if (focus && b) b.focus({ preventScroll: true });
  }
  function move(d) {
    const vis = visible().map(b => +b.dataset.i); if (!vis.length) return;
    const at = Math.max(0, vis.indexOf(sel)); pick(vis[(at + d + vis.length) % vis.length], true); if (FW.Audio) FW.Audio.click();
  }
  function activate(i) { if (FW.Audio) { FW.Audio.init(); FW.Audio.click(); } try { ITEMS[i].run(); } catch (e) { FW.System && FW.System.log('error', 'menu ' + ITEMS[i].k + ': ' + e.message); } }
  function fit() {
    const st = document.querySelector('#screen-title .stage'); if (!st) return;
    if (matchMedia('(max-aspect-ratio: 1/1)').matches) { st.style.zoom = ''; st.style.left = st.style.top = ''; return; }   // stacked phone layout
    const z = parseFloat(document.documentElement.style.zoom) || 1, W = innerWidth / z, Hh = innerHeight / z;
    const s = Math.min(W / 1280, Hh / 720);
    // zoom (not transform) keeps the painted wheel and logo blending with the background behind them
    st.style.zoom = s.toFixed(4); st.style.left = ((W / s - 1280) / 2).toFixed(1) + 'px'; st.style.top = ((Hh / s - 720) / 2).toFixed(1) + 'px';
  }
  window.addEventListener('resize', fit);

  /* ---------------- screens: the title screen becomes the home of the game ---------------- */
  const prevScreen = App.hooks.screenShown;
  App.hooks.screenShown = name => {
    if (prevScreen) prevScreen(name);
    if (name === 'title') { render(); setTimeout(() => pick(sel, true), 30); firstRun(); }
  };
  App.showTitle = () => { App.flow.abortRun(); App.closeModal(); App.flow.show('title'); };
  const brand = $('#brand'); if (brand) { brand.onclick = App.showTitle; brand.title = t('Main menu'); }
  const homeHead = document.querySelector('#screen-home .hero');
  if (homeHead) { const b = document.createElement('button'); b.className = 'btn small ghost back-menu'; b.textContent = '◂ ' + t('Main menu'); b.onclick = App.showTitle; homeHead.prepend(b); }
  const prevTheme = App.setTheme;
  App.setTheme = function (n) { prevTheme(n); if (App.state.screen === 'title') render(); };
  if (FW.Mods && FW.Mods.ready && FW.Mods.ready.then) FW.Mods.ready.then(() => { if (App.state.screen === 'title') render(); });

  /* ---------------- input: keyboard, mouse and controllers ---------------- */
  const Nav = FW.Nav = { device: 'kb' };
  const GLYPHS = {
    kb: () => '↑↓ ' + t('Select') + ' · Enter ' + t('Confirm') + ' · Esc ' + t('Back'),
    xbox: () => 'Ⓐ ' + t('Confirm') + ' · Ⓑ ' + t('Back') + ' · ☰ ' + t('Options'),
    ps: () => '✕ ' + t('Confirm') + ' · ○ ' + t('Back') + ' · ' + t('Options') + ': OPTIONS',
    nin: () => 'Ⓐ ' + t('Confirm') + ' · Ⓑ ' + t('Back') + ' · ＋ ' + t('Options')
  };
  function hint() { const el = $('#navHint'); if (el) el.textContent = GLYPHS[Nav.device](); document.body.dataset.input = Nav.device; }
  function setDevice(d) { if (Nav.device !== d) { Nav.device = d; hint(); } }
  document.addEventListener('mousemove', () => { if (Nav.device !== 'kb') setDevice('kb'); }, { passive: true });

  const typing = () => /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && !(document.activeElement.type === 'range' || document.activeElement.type === 'checkbox');
  const modalOpen = () => !!$('#modalRoot').firstChild;
  const K = () => FW.prefs.keys;
  /* move focus through the buttons and controls of whatever is in front (a dialog, Options or the current screen) */
  function focusables() {
    const root = modalOpen() ? $('#modalRoot') : document.querySelector('.screen.active') || document.body;
    return [...root.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')].filter(e => !e.disabled && !e.hidden && e.offsetParent !== null && e.tabIndex >= 0);
  }
  function step(d) {
    const list = focusables(); if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    const n = list[i < 0 ? (d > 0 ? 0 : list.length - 1) : (i + d + list.length) % list.length];
    n.focus(); n.scrollIntoView({ block: 'nearest' });
  }
  /* one place that turns keys and controller buttons into game actions */
  Nav.act = function (a) {
    const ae = document.activeElement;
    if (App.state.screen === 'title' && !modalOpen()) {
      if (a === 'up') return move(-1); if (a === 'down') return move(1);
      if (a === 'ok') return activate(sel);
      if (a === 'options') return FW.Options.open();
      return;
    }
    if (a === 'back') { if (modalOpen()) return App.closeModal(); if (FW.Options && FW.Options.isOpen()) return FW.Options.close(); if (App.state.screen === 'home' || App.state.screen === 'card') return App.showTitle(); return; }
    if (a === 'options') { if (FW.Options) return FW.Options.isOpen() ? FW.Options.close() : FW.Options.open(); }
    if (App.state.screen === 'spin' && !modalOpen()) {
      if (a === 'ok' || a === 'advance') { if (ae && ae.tagName === 'BUTTON' && a === 'ok') return ae.click(); return document.dispatchEvent(new KeyboardEvent('keydown', { key: K().advance, bubbles: true })); }
      if (a === 'respin') return $('#btnRespin').hidden ? null : $('#btnRespin').click();
      if (a === 'auto') return $('#btnAutoToggle').click();
    }
    if (a === 'up' || a === 'left') { if (ae && ae.type === 'range') return nudge(ae, -1); return step(-1); }
    if (a === 'down' || a === 'right') { if (ae && ae.type === 'range') return nudge(ae, 1); return step(1); }
    if (a === 'ok' && ae && ae !== document.body) { if (ae.type === 'checkbox') { ae.click(); return; } ae.click(); }
  };
  function nudge(r, d) { const s = +r.step || 1; r.value = Math.max(+r.min, Math.min(+r.max, +r.value + d * s * (r.max - r.min > 20 ? 5 : 1))); r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); }

  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return;
    setDevice('kb');
    if (FW.Options && FW.Options.capturing) return;
    const k = e.key, kk = K();
    if (App.state.screen === 'title' && !modalOpen()) {
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { e.preventDefault(); return Nav.act('up'); }
      if (k === 'ArrowDown' || k === 's' || k === 'S') { e.preventDefault(); return Nav.act('down'); }
      if (k === 'Enter' || k === ' ') { e.preventDefault(); return Nav.act('ok'); }
      if (k.toLowerCase() === (kk.options || '').toLowerCase()) return Nav.act('options');
      return;
    }
    if (typing()) return;
    if (k === kk.back && k !== 'Escape' && !modalOpen()) { e.preventDefault(); return Nav.act('back'); }
    if (k === 'Escape' && !modalOpen()) { if (FW.Options && FW.Options.isOpen()) { e.preventDefault(); return FW.Options.close(); } if (App.state.screen === 'home' || App.state.screen === 'card') return App.showTitle(); }
    if (modalOpen()) return;
    const low = k.length === 1 ? k.toLowerCase() : k;
    if (low === (kk.options || '').toLowerCase()) return Nav.act('options');
    if (low === (kk.menu || '').toLowerCase() && App.state.screen !== 'spin') return App.showTitle();
    if (App.state.screen === 'spin') { if (low === (kk.respin || '').toLowerCase()) return Nav.act('respin'); if (low === (kk.auto || '').toLowerCase()) return Nav.act('auto'); }
  });

  /* controllers (standard mapping): d-pad or left stick to move, A/Cross to confirm, B/Circle to go back,
     Start/Options for Options, X/Square to re-spin, Y/Triangle for auto-play */
  const pads = {}; let polling = false;
  const kindOf = id => (/054c|playstation|dualsense|dualshock|ps4|ps5/i.test(id) ? 'ps' : /057e|nintendo|switch|joy-con|pro controller/i.test(id) ? 'nin' : 'xbox');
  window.addEventListener('gamepadconnected', e => { setDevice(kindOf(e.gamepad.id)); if (FW.System) FW.System.log('info', 'controller connected: ' + e.gamepad.id.slice(0, 60)); if (!polling) { polling = true; requestAnimationFrame(poll); } });
  function poll(now) {
    const list = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    if (!list.length) { polling = false; return; }
    list.forEach(gp => {
      const st = pads[gp.index] || (pads[gp.index] = { held: {}, next: {} });
      const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
      const ax = gp.axes || [];
      const dirs = { up: b(12) || ax[1] < -0.55, down: b(13) || ax[1] > 0.55, left: b(14) || ax[0] < -0.55, right: b(15) || ax[0] > 0.55 };
      const btns = { ok: b(0), back: b(1), respin: b(2), auto: b(3), options: b(9) };
      const fire = (name, on, repeat) => {
        if (!on) { st.held[name] = false; return; }
        if (!st.held[name]) { st.held[name] = true; st.next[name] = now + 380; setDevice(kindOf(gp.id)); Nav.act(name); }
        else if (repeat && now >= st.next[name]) { st.next[name] = now + 110; Nav.act(name); }
      };
      Object.keys(dirs).forEach(k => fire(k, dirs[k], true));
      Object.keys(btns).forEach(k => fire(k, btns[k], false));
    });
    requestAnimationFrame(poll);
  }

  /* ---------------- first-run guide ---------------- */
  const GUIDE = [
    { item: 'New Legend', title: 'Welcome to Destiny Unbound', text: 'Spin the wheels of fate to forge a legend: race, powers, weapon, weakness and more. Bigger slices are likelier. Start here with New Legend.' },
    { item: 'Story', title: 'Then live the story', text: 'A finished legend can begin its saga: spin chapters of quests, wars, love and heirs until you retire, ascend or die.' },
    { item: 'Daily Challenge', title: 'Challenges and the Hall', text: 'The Daily Challenge gives everyone the same spins each day. Save your favourite legends to the Hall of Legends.' },
    { item: 'Options', title: 'Make it yours', text: 'Options has graphics, sound, accessibility and controls (keyboard or controller). Mods add your own themes, sounds and wheel entries.' }
  ];
  function firstRun() {
    if (App.store.get('fw.guide', false) || $('#coach')) return;
    let n = 0;
    const box = document.createElement('div'); box.id = 'coach'; box.className = 'coach'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
    const done = () => { coachItem = -1; App.store.set('fw.guide', true); box.remove(); document.querySelectorAll('.coach-hl').forEach(e => e.classList.remove('coach-hl')); };
    const draw = () => {
      const g = GUIDE[n];
      document.querySelectorAll('.coach-hl').forEach(e => e.classList.remove('coach-hl'));
      const i = ITEMS.findIndex(x => x.k === g.item), b = document.querySelector('#screen-title .item[data-i="' + i + '"]');
      coachItem = i;
      if (b) { b.classList.add('coach-hl'); pick(i, false); }
      box.innerHTML = '<small>' + (n + 1) + ' / ' + GUIDE.length + '</small><b>' + H.esc(t(g.title)) + '</b><p>' + H.esc(t(g.text)) + '</p><div><button class="btn small ghost" id="coSkip">' + H.esc(t('Skip')) + '</button><button class="btn small primary" id="coNext">' + H.esc(t(n === GUIDE.length - 1 ? 'Got it' : 'Next')) + '</button></div>';
      $('#coSkip').onclick = done;
      $('#coNext').onclick = () => { n++; if (n >= GUIDE.length) done(); else draw(); };
      setTimeout(() => { const nx = $('#coNext'); if (nx) nx.focus(); }, 20);
    };
    draw();
  }
  Nav.resetGuide = () => App.store.set('fw.guide', false);

  /* ---------------- a one-time thank-you, after the player's first finished legend ---------------- */
  function thanks() {
    App.openModal('<div class="thanks"><img src="icons/icon-192.png" alt="" width="84" height="84"><h2>' + H.esc(t('Thank you for trying Destiny Unbound')) + '</h2>' +
      '<p>' + H.esc(t('This game is made by one person, in their spare time, and it is free and open source. If you enjoy it, please consider supporting me and my future projects. Every coffee helps more than you would think.')) + '</p>' +
      '<div class="cta"><a class="btn primary" id="thKofi" href="https://ko-fi.com/bzrkherja" target="_blank" rel="noopener">☕ ' + H.esc(t('Support on Ko-fi')) + '</a><button class="btn ghost" id="thLater">' + H.esc(t('Maybe later')) + '</button></div>' +
      '<small>' + H.esc(t('You will not see this again. The Ko-fi link is always in the main menu.')) + '</small></div>');
    $('#thLater').onclick = App.closeModal; $('#thKofi').addEventListener('click', () => setTimeout(App.closeModal, 300));
    setTimeout(() => { const b = $('#thLater'); if (b) b.focus(); }, 30);
  }
  const prevCard = App.hooks.cardShown;
  App.hooks.cardShown = L => {
    if (prevCard) prevCard(L);
    if (App.store.get('fw.thanks', false) || !L || !L.picks || !L.picks.mark) return;
    App.store.set('fw.thanks', true);
    setTimeout(() => { if (!$('#modalRoot').firstChild) thanks(); else App.store.set('fw.thanks', false); }, 2600);   // after the card settles; retried next time if a dialog was open
  };
  App.thanksModal = thanks;

  /* ---------------- credits ---------------- */
  function credits() {
    const fonts = ['Cinzel', 'Cormorant Garamond', 'Cormorant SC', 'EB Garamond', 'IM Fell English', 'IM Fell English SC', 'Share Tech Mono', 'UnifrakturCook'];
    App.openModal('<button class="btn small ghost close">' + H.esc(t('Close')) + ' ✕</button><h2>' + H.esc(t('Credits')) + '</h2><div class="credits">' +
      '<h3 class="opt-h">Destiny Unbound</h3><p>v' + H.esc(FW.VERSION) + ' · ' + H.esc(t('Made by the Destiny Unbound contributors.')) + '</p>' +
      '<p>' + H.esc(t('Free software under the GNU General Public License v3.0 or later: you may use, study, share and change it.')) + ' <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GPL-3.0</a></p>' +
      '<h3 class="opt-h">' + H.esc(t('Art')) + '</h3><p>' + H.esc(t('Painted art: Created with Grok. The title-screen backgrounds, wheel paintings, logos and app icon were generated with Grok Imagine (xAI) for this game. The playable wheels, character cards, icons and interface are drawn in code.')) + '</p>' +
      '<h3 class="opt-h">' + H.esc(t('Made with AI help')) + '</h3><p>' + H.esc(t('This game is made by one person without funding for a team. Much of the code was written with an AI coding assistant (Claude, by Anthropic), and many wheel entries, story texts and the Spanish translation were drafted with AI help, then edited and tested by hand.')) + '</p>' +
      '<h3 class="opt-h">' + H.esc(t('Sound and music')) + '</h3><p>' + H.esc(t('All sound effects and music are synthesized live in code. Mods may add their own sounds; their authors keep their rights.')) + '</p>' +
      '<h3 class="opt-h">' + H.esc(t('Fonts')) + '</h3><p>' + fonts.map(H.esc).join(', ') + '. ' + H.esc(t('Each under the SIL Open Font License 1.1 (the license files are in the fonts folder).')) + '</p>' +
      '<h3 class="opt-h">' + H.esc(t('Built with')) + '</h3><p>Electron (MIT), electron-updater (MIT).</p>' +
      '<h3 class="opt-h">' + H.esc(t('Community')) + '</h3><p>' + H.esc(t('Report bugs, suggest ideas, and share your legends and mods on the Destiny Unbound Discord.')) + ' <a href="' + H.esc(FW.DISCORD_URL) + '" target="_blank" rel="noopener">' + H.esc(t('Join the Discord')) + '</a></p>' +
      '<h3 class="opt-h">' + H.esc(t('Thanks')) + '</h3><p>' + H.esc(t('Everyone who plays, tests, reports bugs, makes mods or supports the game on Ko-fi.')) + '</p></div>');
  }
  App.creditsModal = credits;

  /* ---------------- start on the title screen ---------------- */
  if (App.state.screen === 'title') App.flow.show('title');
})();
