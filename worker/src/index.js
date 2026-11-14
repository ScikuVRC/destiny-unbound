// Destiny Unbound world counter on Cloudflare Workers (free plan, D1 database). The game sends one anonymous count
// when a player who opted in finishes a hero or a saga ends; the Discord bot's /stats reads the totals.
// Only numbers are stored for the counter: no IPs, names, legend codes or IDs.
// POST /v1/count  {"kind":"hero"} or {"kind":"end","end":"dead"}   ·   GET /v1/totals
// Daily leaderboard (a separate opt-in): POST /v1/daily {day,pid,name,race,score,end,ch} · GET /v1/daily?day=YYYY-MM-DD
//   It stores the hero's name (filtered), race, score, ending and chapters, and a random per-install id. No IPs.
// Short card codes: POST /v1/card {code} -> {id}, GET /v1/card/<id> -> {code}. Only the Legend Code is stored, 90 days.
// SPDX-License-Identifier: GPL-3.0-or-later
import { checkEntry, KEEP_DAYS, TOP } from './board.js';
import * as cards from './cards.js';

const ENDINGS = ['dead', 'retired', 'ascended', 'lost', 'martyr', 'sealed', 'damned', 'fulfilled', 'undying', 'legend'];
const MORTAL = { dead: 1, martyr: 1, sealed: 1, damned: 1, undying: 1 };
const CORS = { 'Access-Control-Allow-Origin': '*' };
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (req.method === 'OPTIONS')
      return new Response(null, {
        status: 204,
        headers: {
          ...CORS,
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    if (req.method === 'GET' && path === '/v1/totals') {
      const { results } = await env.DB.prepare('SELECT k, n FROM counts').all();
      const out = { heroes: 0, sagas: 0, deaths: 0, endings: {}, since: env.SINCE || '' };
      for (const r of results) {
        if (r.k === 'hero') out.heroes = r.n;
        else if (r.k.startsWith('end:') && ENDINGS.includes(r.k.slice(4))) {
          const e = r.k.slice(4);
          out.endings[e] = r.n;
          out.sagas += r.n;
          if (MORTAL[e]) out.deaths += r.n;
        }
      }
      return json(out);
    }
    if (req.method === 'POST' && path === '/v1/count') {
      if (env.LIMITER) {
        const { success } = await env.LIMITER.limit({ key: req.headers.get('cf-connecting-ip') || 'x' });
        if (!success) return json({ error: 'slow down' }, 429);
      }
      const text = (await req.text()).slice(0, 200);
      let j = null;
      try {
        j = JSON.parse(text);
      } catch (e) {
        return json({ error: 'bad json' }, 400);
      }
      const key =
        j && j.kind === 'hero' ? 'hero' : j && j.kind === 'end' && ENDINGS.includes(j.end) ? 'end:' + j.end : null;
      if (!key) return json({ error: 'unknown count' }, 400);
      await env.DB.prepare('INSERT INTO counts (k, n) VALUES (?, 1) ON CONFLICT(k) DO UPDATE SET n = n + 1')
        .bind(key)
        .run();
      return new Response(null, { status: 204, headers: CORS });
    }
    if (req.method === 'GET' && path === '/v1/daily') {
      const day = new URL(req.url).searchParams.get('day') || new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return json({ error: 'bad day' }, 400);
      const { results } = await env.DB.prepare(
        'SELECT name, race, score, ending, ch FROM daily WHERE day = ? ORDER BY score DESC, ch DESC LIMIT ?'
      )
        .bind(day, TOP)
        .all();
      const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM daily WHERE day = ?').bind(day).first();
      return json({ day, top: results, players: (count && count.n) || 0 });
    }
    if (req.method === 'POST' && path === '/v1/daily') {
      if (env.LIMITER) {
        const { success } = await env.LIMITER.limit({ key: req.headers.get('cf-connecting-ip') || 'x' });
        if (!success) return json({ error: 'slow down' }, 429);
      }
      let j = null;
      try {
        j = JSON.parse((await req.text()).slice(0, 600));
      } catch (e) {
        return json({ error: 'bad json' }, 400);
      }
      const row = checkEntry(j);
      if (row.error) return json({ error: row.error }, 400);
      await env.DB.prepare(
        'INSERT INTO daily (day, pid, name, race, score, ending, ch) VALUES (?, ?, ?, ?, ?, ?, ?) ' +
          'ON CONFLICT(day, pid) DO UPDATE SET name = excluded.name, race = excluded.race, score = excluded.score, ' +
          'ending = excluded.ending, ch = excluded.ch WHERE excluded.score > daily.score'
      )
        .bind(row.day, row.pid, row.name, row.race, row.score, row.ending, row.ch)
        .run();
      const old = new Date(Date.now() - KEEP_DAYS * 864e5).toISOString().slice(0, 10);
      await env.DB.prepare('DELETE FROM daily WHERE day < ?').bind(old).run();
      return json({ ok: true, name: row.name });
    }
    if (req.method === 'POST' && path === '/v1/card') {
      if (env.LIMITER) {
        const { success } = await env.LIMITER.limit({ key: req.headers.get('cf-connecting-ip') || 'x' });
        if (!success) return json({ error: 'slow down' }, 429);
      }
      let j = null;
      try {
        j = JSON.parse((await req.text()).slice(0, cards.MAX_CODE + 200));
      } catch (e) {
        return json({ error: 'bad json' }, 400);
      }
      const code = j && typeof j.code === 'string' ? j.code.trim() : '';
      const bad = cards.checkCode(code);
      if (bad) return json({ error: bad }, 400);
      const hash = await cards.hashOf(code);
      const day = new Date().toISOString().slice(0, 10);
      const known = await env.DB.prepare('SELECT id FROM cards WHERE hash = ?').bind(hash).first();
      if (known) {
        await env.DB.prepare('UPDATE cards SET day = ? WHERE id = ?').bind(day, known.id).run();
        return json({ id: 'DU-' + known.id, days: cards.KEEP_DAYS });
      }
      for (let n = 0; n < 5; n++) {
        const id = cards.makeId();
        const r = await env.DB.prepare('INSERT OR IGNORE INTO cards (id, code, hash, day) VALUES (?, ?, ?, ?)')
          .bind(id, code, hash, day)
          .run();
        if (r.meta && r.meta.changes) {
          const old = new Date(Date.now() - cards.KEEP_DAYS * 864e5).toISOString().slice(0, 10);
          await env.DB.prepare('DELETE FROM cards WHERE day < ?').bind(old).run();
          return json({ id: 'DU-' + id, days: cards.KEEP_DAYS });
        }
      }
      return json({ error: 'try again' }, 503);
    }
    if (req.method === 'GET' && path.startsWith('/v1/card/')) {
      const id = cards.normaliseId(decodeURIComponent(path.slice(9)));
      if (!id) return json({ error: 'not a card code' }, 400);
      const row = await env.DB.prepare('SELECT code FROM cards WHERE id = ?').bind(id).first();
      return row ? json({ id: 'DU-' + id, code: row.code }) : json({ error: 'no card with that code' }, 404);
    }
    return json({ error: 'not found' }, 404);
  },
};
