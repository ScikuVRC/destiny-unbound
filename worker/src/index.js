// Destiny Unbound world counter on Cloudflare Workers (free plan, D1 database). The game sends one anonymous count
// when a player who opted in finishes a hero or a saga ends; the Discord bot's /stats reads the totals.
// Only numbers are stored: no IPs, names, legend codes or IDs.
// POST /v1/count  {"kind":"hero"} or {"kind":"end","end":"dead"}   ·   GET /v1/totals
// SPDX-License-Identifier: GPL-3.0-or-later
const ENDINGS = ['dead', 'retired', 'ascended', 'lost', 'martyr', 'sealed', 'damned', 'fulfilled', 'undying', 'legend'];
const MORTAL = { dead: 1, martyr: 1, sealed: 1, damned: 1, undying: 1 };
const CORS = { 'Access-Control-Allow-Origin': '*' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    if (req.method === 'GET' && path === '/v1/totals') {
      const { results } = await env.DB.prepare('SELECT k, n FROM counts').all();
      const out = { heroes: 0, sagas: 0, deaths: 0, endings: {}, since: env.SINCE || '' };
      for (const r of results) {
        if (r.k === 'hero') out.heroes = r.n;
        else if (r.k.startsWith('end:') && ENDINGS.includes(r.k.slice(4))) { const e = r.k.slice(4); out.endings[e] = r.n; out.sagas += r.n; if (MORTAL[e]) out.deaths += r.n; }
      }
      return json(out);
    }
    if (req.method === 'POST' && path === '/v1/count') {
      if (env.LIMITER) { const { success } = await env.LIMITER.limit({ key: req.headers.get('cf-connecting-ip') || 'x' }); if (!success) return json({ error: 'slow down' }, 429); }
      const text = (await req.text()).slice(0, 200);
      let j = null; try { j = JSON.parse(text); } catch (e) { return json({ error: 'bad json' }, 400); }
      const key = j && j.kind === 'hero' ? 'hero' : j && j.kind === 'end' && ENDINGS.includes(j.end) ? 'end:' + j.end : null;
      if (!key) return json({ error: 'unknown count' }, 400);
      await env.DB.prepare('INSERT INTO counts (k, n) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1').bind(key).run();
      return new Response(null, { status: 204, headers: CORS });
    }
    return json({ error: 'not found' }, 404);
  }
};
