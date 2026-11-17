/* Destiny Unbound: the guided first hero. The first time a new player makes a hero, a few short notes appear at
   the right moments of the first three spins: what a wheel does, what buffs and debuffs are, what a Fate Token
   re-spins, and where luck and Auto are. It never blocks a spin; Skip ends it, and it never comes back.
   Players who already made heroes before this existed don't see it. SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    App = window.FWApp;
  if (!App) return;
  const H = FW.html,
    store = App.store,
    t = s => (FW.t ? FW.t(s) : s),
    $ = s => document.querySelector(s);
  const KEY = 'fw.firstHero';
  // someone who has played before already knows this
  if (!store.get(KEY, false) && (App.state.hall.length || Object.keys(store.get('fw.achievements', {}) || {}).length))
    store.set(KEY, true);

  const NOTES = [
    {
      on: 'ready',
      at: '#btnSpin',
      title: 'Your first hero',
      text: 'Each wheel decides one part of your hero. Bigger slices are likelier. Press Spin (or Space) to start.',
    },
    {
      on: 'result',
      at: '#effects',
      title: 'Buffs and debuffs',
      text: 'Green chips help in fights and red ones hurt. Dashed chips only count in a matching place or moment, like darkness or water.',
    },
    {
      on: 'result',
      at: '#btnRespin',
      title: 'Fate Tokens',
      text: 'Not happy with a result? Spend a Fate Token to spin that wheel again. Some results give you more tokens.',
    },
    {
      on: 'ready',
      at: '#btnAutoToggle',
      title: 'Luck and Auto',
      text: 'Your luck level (at the top) tilts every wheel toward rarer results. Press Auto to let the rest spin by themselves.',
    },
  ];
  let n = 0,
    box = null;
  const making = () => /^make:/.test(App.state.spinWhere || '') && App.state.screen === 'spin';
  const clearHl = () => document.querySelectorAll('.guide-hl').forEach(e => e.classList.remove('guide-hl'));
  function finish() {
    store.set(KEY, true);
    clearHl();
    if (box) box.remove();
    box = null;
  }
  function show(note) {
    clearHl();
    const el = $(note.at);
    if (el && !el.hidden) el.classList.add('guide-hl');
    if (!box) {
      box = document.createElement('div');
      box.className = 'coach guide';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    box.innerHTML =
      '<small>' +
      H.esc(t('First hero')) +
      ' · ' +
      (n + 1) +
      ' / ' +
      NOTES.length +
      '</small><b>' +
      H.esc(t(note.title)) +
      '</b><p>' +
      H.esc(t(note.text)) +
      '</p><div><button class="btn small ghost" id="guSkip">' +
      H.esc(t('Skip the tour')) +
      '</button><button class="btn small primary" id="guOk">' +
      H.esc(t(n === NOTES.length - 1 ? 'Got it' : 'OK')) +
      '</button></div>';
    $('#guSkip').onclick = finish;
    $('#guOk').onclick = () => {
      clearHl();
      box.hidden = true;
      if (n >= NOTES.length) finish();
    };
  }
  function on(kind) {
    if (store.get(KEY, false) || !making() || App.state.auto) return;
    const note = NOTES[n];
    if (!note || note.on !== kind) return;
    show(note);
    n++;
    if (box) box.hidden = false;
    if (n >= NOTES.length) store.set(KEY, true); // seen it all; the last note stays until OK
  }
  const chain = (name, fn) => {
    const prev = App.hooks[name];
    App.hooks[name] = a => {
      if (prev) prev(a);
      fn(a);
    };
  };
  chain('spinReady', () => on('ready'));
  chain('spinResult', () => on('result'));
  // leaving the spin screen hides the note; the tour picks up again on the next hero
  chain('screenShown', name => {
    if (name !== 'spin' && box) {
      clearHl();
      box.hidden = true;
    }
  });
  FW.resetFirstHero = () => {
    store.set(KEY, false);
    n = 0;
  };
})();
