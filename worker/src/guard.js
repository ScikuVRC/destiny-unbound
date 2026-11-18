// Abuse protection for the write routes: the per-minute rate limit (Workers rate limiting), then a daily cap per
// address, and a daily tally of writes so a sudden jump shows up in GET /v1/health (and the bot can warn about it).
// Addresses are never stored. The cap keeps a hash of (today's random salt + address + route); the salt is made fresh
// each day and yesterday's salt and hashes are deleted, so a hash can't be traced back or linked across days.
// SPDX-License-Identifier: GPL-3.0-or-later

// writes one address may make per day, per route; well above what one player does
export const CAPS = { count: 300, daily: 40, card: 60, error: 20, boss: 60 };
export const KEEP_DAYS = 30; // how long the daily tallies are kept
export const JUMP = { factor: 5, floor: 200 }; // a jump: today is 5x the week's average and at least 200 writes

export const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

async function sha(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)]
    .slice(0, 12)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function saltFor(DB, day) {
  const row = await DB.prepare('SELECT s FROM salt WHERE day = ?').bind(day).first();
  if (row) return row.s;
  const s = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
  await DB.prepare('INSERT OR IGNORE INTO salt (day, s) VALUES (?, ?)').bind(day, s).run();
  // a new day: yesterday's salt and hashes go, and tallies older than KEEP_DAYS
  await DB.prepare('DELETE FROM salt WHERE day < ?').bind(day).run();
  await DB.prepare('DELETE FROM caps WHERE day < ?').bind(day).run();
  const old = today(Date.parse(day) - KEEP_DAYS * 864e5);
  await DB.prepare('DELETE FROM traffic WHERE day < ?').bind(old).run();
  return (await DB.prepare('SELECT s FROM salt WHERE day = ?').bind(day).first()).s;
}

// null when the write may go ahead, otherwise [status, message]
export async function guard(env, ip, route, now = Date.now()) {
  if (env.LIMITER) {
    const { success } = await env.LIMITER.limit({ key: ip || 'x' });
    if (!success) return [429, 'slow down'];
  }
  const DB = env.DB,
    day = today(now),
    cap = CAPS[route] || 50;
  await DB.prepare(
    'INSERT INTO traffic (day, route, n, capped) VALUES (?, ?, 1, 0) ON CONFLICT(day, route) DO UPDATE SET n = n + 1'
  )
    .bind(day, route)
    .run();
  const h = await sha((await saltFor(DB, day)) + '|' + (ip || 'x') + '|' + route);
  const row = await DB.prepare(
    'INSERT INTO caps (day, h, n) VALUES (?, ?, 1) ON CONFLICT(day, h) DO UPDATE SET n = n + 1 RETURNING n'
  )
    .bind(day, h)
    .first();
  if (row && row.n > cap) {
    await DB.prepare('UPDATE traffic SET capped = capped + 1 WHERE day = ? AND route = ?').bind(day, route).run();
    return [429, 'daily limit reached'];
  }
  return null;
}

// the last week or so of writes per day, and whether today jumped
export function health(rows, now = Date.now()) {
  const days = {};
  for (const r of rows) {
    const d = (days[r.day] = days[r.day] || { day: r.day, total: 0, capped: 0 });
    d[r.route] = r.n;
    d.total += r.n;
    d.capped += r.capped || 0;
  }
  const list = Object.values(days).sort((a, b) => (a.day < b.day ? 1 : -1));
  const t = today(now),
    cur = (list[0] && list[0].day === t && list[0]) || { day: t, total: 0, capped: 0 };
  const before = list.filter(d => d.day < t).slice(0, 7);
  const avg = before.length ? before.reduce((a, d) => a + d.total, 0) / before.length : 0;
  const jump = cur.total >= JUMP.floor && cur.total > JUMP.factor * Math.max(avg, 1);
  return {
    today: cur,
    weekAverage: Math.round(avg),
    jump,
    note: jump
      ? `Writes today (${cur.total}) are over ${JUMP.factor}x the week's average (${Math.round(avg)}).`
      : 'Normal.',
    days: list.slice(0, 8),
  };
}
