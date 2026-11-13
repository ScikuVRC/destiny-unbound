/* Destiny Unbound world counter: OPT-IN. When the player ticks the box in Options > Data, the game adds one
   anonymous count to the world totals each time a hero is finished or a saga ends (just "a hero" or the ending's
   name: no names, codes, IDs or anything else). Off by default; while it is off this file never touches the network.
   The same server is behind the Discord bot's /stats.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW = g.FW || {};
  const App = g.FWApp;
  const KEY = 'fw.world';
  const ENDINGS = ['dead', 'retired', 'ascended', 'lost', 'martyr', 'sealed', 'damned', 'fulfilled', 'undying', 'legend'];
  const W = FW.World = {
    url: FW.WORLD_URL || '',   // set in system.js; empty = the counter is not available in this build
    ENDINGS,
    available: () => !!W.url,
    enabled: () => !!(W.url && App && App.store.get(KEY, { on: false }).on),
    setEnabled: on => { if (App) App.store.set(KEY, { on: !!on }); },
    /* one count: kind 'hero', or kind 'end' with an ending key. Fire and forget; failures are ignored. */
    send(kind, end) {
      if (!W.enabled()) return false;
      if (kind !== 'hero' && !(kind === 'end' && ENDINGS.indexOf(end) >= 0)) return false;
      try {
        // text/plain keeps this a simple request (no CORS preflight); the body is tiny and fixed
        fetch(W.url + '/v1/count', { method: 'POST', body: JSON.stringify(kind === 'end' ? { kind, end } : { kind }), headers: { 'Content-Type': 'text/plain' }, keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer' }).catch(() => {});
        return true;
      } catch (e) { return false; }
    },
    /* the world totals, or null if the server can't be reached. Only asked for while the counter is on. */
    async totals() {
      if (!W.enabled()) return null;
      try {
        const r = await fetch(W.url + '/v1/totals', { credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
        if (!r.ok) return null;
        const j = await r.json();
        return j && typeof j === 'object' ? j : null;
      } catch (e) { return null; }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
