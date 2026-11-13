/* Destiny Unbound Discord status (desktop app only): describes what the player is doing, for example
   "Living a saga · Chapter 4 · The Forgotten One, Salamanderkin", and hands it to the desktop app, which passes it to
   the Discord app on the same computer. Players can switch it off in Options > Gameplay.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW, App = window.FWApp, D = window.fatewheelDesktop;
  const PAGE = 'https://bzrkherja.itch.io/destiny-unbound';

  const endWord = e => ({ dead: 'fell', retired: 'retired', ascended: 'ascended', lost: 'was lost', martyr: 'died a hero', sealed: 'was sealed away', damned: 'was taken below', fulfilled: 'fulfilled a prophecy', undying: 'rose again', legend: 'passed into legend' }[e] || 'the end');

  /* What to show, from the game's state. Pure, so it can be tested without Discord. */
  FW.presenceFor = function (S, opts) {
    opts = opts || {};
    const L = S.legend, theme = (FW.THEMES[S.theme] || {}).name || '';
    let hero = '';
    // the title and race, never a custom hero name; until the title wheel is spun, just the race
    try { if (L && L.picks && L.picks.race) hero = [L.picks.title && L.pickName('title'), L.raceName()].filter(Boolean).join(', '); } catch (e) { hero = ''; }
    const base = { image: 'emblem', imageText: 'Destiny Unbound', small: (FW.THEMES[S.theme] && FW.THEMES[S.theme].base) || S.theme, smallText: theme, buttons: [{ label: 'Play free', url: PAGE }] };
    const out = (details, state) => Object.assign({}, base, { details, state });
    const saga = L && L.saga, ended = saga && saga.end;
    switch (S.screen) {
      case 'title': return out('In the main menu');
      case 'options': return out('Changing the options');
      case 'home': return out('Choosing a fate', (FW.LUCK.find(l => l.id === S.luck) || {}).name ? FW.LUCK.find(l => l.id === S.luck).name + ' luck' : undefined);
      case 'spin':
        // a finished fight stays in S.fight, so a story chapter is recognised by the wheel's question
        if (S.fight && !/^\s*chapter/i.test(opts.chip || '')) return out('Fighting in the arena', hero || undefined);
        if (ended) return out('A saga has ended', hero + ' · ' + endWord(ended));
        if (saga) {   // the chapter number comes from the wheel's question: one chapter can log several entries
          const m = /chapter\s+(\d+)/i.exec(opts.chip || ''), n = m ? m[1] : opts.chapter;   // follow-up wheels keep the last number
          return out('Living a saga', (n ? 'Chapter ' + n + (hero ? ' · ' : '') : '') + hero || undefined);
        }
        if (L && typeof L.seed === 'string' && L.seed.indexOf('daily-') === 0) return out('Daily challenge', hero || 'Forging today\'s hero');
        return out('Forging a new legend', hero || ((FW.LUCK.find(l => l.id === S.luck) || {}).name || '') + ' luck');
      case 'card': {
        if (!L) return out('Looking at a legend');
        if (ended) return out('A saga has ended', hero + ' · ' + endWord(ended));
        let power = '';
        try { const c = FW.compute(L); power = ' · ' + c.rank; } catch (e) { power = ''; }
        return out('Admiring a legend', hero + power);
      }
      default: return out('Spinning the wheels of fate');
    }
  };

  if (!D || !D.discordSet || !App) return;
  let on = false, last = '', chapter = null, chapterOf = null;
  const send = () => {
    if (!on) return;
    const el = document.getElementById('chipTitle'), chip = el ? el.textContent : '', m = /chapter\s+(\d+)/i.exec(chip);
    if (App.state.legend !== chapterOf) { chapterOf = App.state.legend; chapter = null; }
    if (m) chapter = m[1];
    let p; try { p = FW.presenceFor(App.state, { chip, chapter }); } catch (e) { return; }
    const json = JSON.stringify(p);
    if (json !== last) { last = json; D.discordSet(p).catch(() => {}); }
  };
  const apply = () => {
    const want = !FW.prefs || FW.prefs.discord !== false;
    D.discordEnable(want).then(r => { on = !!r; last = ''; send(); }).catch(() => { on = false; });
  };
  D.discordInfo().then(info => {
    FW.discordAvailable = !!(info && info.available);
    if (!FW.discordAvailable) return;
    apply();
    setInterval(send, 3000);   // the desktop app only forwards real changes, at most once every 4 seconds
    const prevPref = FW.onPref;
    FW.onPref = (k, v) => { if (prevPref) prevPref(k, v); if (k === 'discord') apply(); };
  }).catch(() => {});
})();
