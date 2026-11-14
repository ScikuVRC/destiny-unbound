/* Destiny Unbound world counter: OPT-IN. When the player ticks the box in Options > Data, the game adds one
   anonymous count to the world totals each time a hero is finished or a saga ends (just "a hero" or the ending's
   name: no names, codes, IDs or anything else). Off by default; while it is off this file never touches the network.
   The same server is behind the Discord bot's /stats.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const App = g.FWApp;
  const KEY = 'fw.world',
    BOARD = 'fw.board';
  const ENDINGS = [
    'dead',
    'retired',
    'ascended',
    'lost',
    'martyr',
    'sealed',
    'damned',
    'fulfilled',
    'undying',
    'legend',
  ];
  const W = (FW.World = {
    url: FW.WORLD_URL || '', // set in system.js; empty = the counter is not available in this build
    ENDINGS,
    available: () => !!W.url,
    enabled: () => !!(W.url && App && App.store.get(KEY, { on: false }).on),
    setEnabled: on => {
      if (App) App.store.set(KEY, { on: !!on });
    },
    /* one count: kind 'hero', or kind 'end' with an ending key. Fire and forget; failures are ignored. */
    send(kind, end) {
      if (!W.enabled()) return false;
      if (kind !== 'hero' && !(kind === 'end' && ENDINGS.indexOf(end) >= 0)) return false;
      try {
        // text/plain keeps this a simple request (no CORS preflight); the body is tiny and fixed
        fetch(W.url + '/v1/count', {
          method: 'POST',
          body: JSON.stringify(kind === 'end' ? { kind, end } : { kind }),
          headers: { 'Content-Type': 'text/plain' },
          keepalive: true,
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
        }).catch(() => {});
        return true;
      } catch (e) {
        return false;
      }
    },
    /* ---------- the daily challenge leaderboard: a separate opt-in ----------
       When on, a finished daily saga posts the hero's name, race, score, ending and chapter count, with a random id
       made once per install so a player has one row a day. Viewing the board is always the player's own click. */
    boardEnabled: () => !!(W.url && App && App.store.get(BOARD, { on: false }).on),
    setBoard(on) {
      if (!App) return;
      const b = App.store.get(BOARD, { on: false });
      b.on = !!on;
      if (on && !/^[a-z0-9]{12,32}$/.test(b.pid || ''))
        b.pid = Array.from(
          { length: 20 },
          () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
        ).join('');
      App.store.set(BOARD, b);
    },
    postDaily(e) {
      if (!W.boardEnabled()) return Promise.resolve(null);
      const b = App.store.get(BOARD, {});
      const body = {
        day: e.day,
        pid: b.pid,
        name: String(e.name || '').slice(0, 40),
        race: String(e.race || '').slice(0, 30),
        score: Math.round(e.score),
        end: e.end,
        ch: Math.round(e.ch || 0),
      };
      return fetch(W.url + '/v1/daily', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'text/plain' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null);
    },
    async daily(day) {
      if (!W.url) return null;
      try {
        const r = await fetch(W.url + '/v1/daily?day=' + encodeURIComponent(day), {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          cache: 'no-store',
        });
        if (!r.ok) return null;
        const j = await r.json();
        return j && Array.isArray(j.top) ? j : null;
      } catch (e) {
        return null;
      }
    },
    /* the world totals, or null if the server can't be reached. Only asked for while the counter is on. */
    async totals() {
      if (!W.enabled()) return null;
      try {
        const r = await fetch(W.url + '/v1/totals', {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          cache: 'no-store',
        });
        if (!r.ok) return null;
        const j = await r.json();
        return j && typeof j === 'object' ? j : null;
      } catch (e) {
        return null;
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
