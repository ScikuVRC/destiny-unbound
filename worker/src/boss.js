// The world boss: one shared health bar a week. Players who share counts send the damage of each fight; only the
// week's total and the number of fights are stored (no names, IDs or addresses).
// POST /v1/boss {week, damage} · GET /v1/boss?week=YYYY-Www -> {week, dealt, fighters}
// SPDX-License-Identifier: GPL-3.0-or-later
export const MAX_HIT = 5000; // the most one fight can deal (the game caps it the same way)
export const KEEP_WEEKS = 12;

// the week a moment falls in, as YYYY-Www (ISO weeks start on Monday); the same as FW.Boss.week in the game
export function weekOf(now) {
  const d = new Date(now == null ? Date.now() : now);
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = Date.UTC(t.getUTCFullYear(), 0, 1);
  const wk = Math.ceil(((t - y0) / 864e5 + 1) / 7);
  return t.getUTCFullYear() + '-W' + String(wk).padStart(2, '0');
}

// a fight report: only this week (a minute either side of midnight counts too), and a damage the game can deal
export function checkHit(j, now) {
  if (!j || typeof j !== 'object') return { error: 'bad report' };
  const t = now == null ? Date.now() : now;
  const ok = [weekOf(t), weekOf(t - 60000), weekOf(t + 60000)];
  if (typeof j.week !== 'string' || ok.indexOf(j.week) < 0) return { error: 'not this week' };
  const dmg = Number(j.damage);
  if (!Number.isInteger(dmg) || dmg < 1 || dmg > MAX_HIT) return { error: 'bad damage' };
  return { week: j.week, damage: dmg };
}

export function oldWeek(now) {
  return weekOf((now == null ? Date.now() : now) - KEEP_WEEKS * 7 * 864e5);
}
