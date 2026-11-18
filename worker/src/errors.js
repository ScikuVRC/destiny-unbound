// Error reports: sent only when a player presses "Send report" after seeing exactly what it contains (the game
// version, the platform, the screen, the error and recent log lines, and an optional note). No IPs, names, saves or
// IDs are stored. Reports are kept KEEP_DAYS days and at most MAX_ROWS in all; the developer reads them with
// `node scripts/error-reports.js`. There is no public way to read them.
// SPDX-License-Identifier: GPL-3.0-or-later
export const KEEP_DAYS = 30;
export const MAX_ROWS = 2000;
export const LIMITS = { message: 300, detail: 6000, note: 1000 };
export const PLATFORMS = ['windows', 'mac', 'linux', 'browser'];
export const KINDS = ['error', 'crash', 'manual', 'saga']; // saga: "How was this saga?" after an ending

/* take out anything that could name the player's machine: home folders and e-mail addresses */
export function scrub(s) {
  return (
    String(s == null ? '' : s)
      .replace(/[A-Za-z]:[\\/]+Users[\\/]+[^\\/:'")\n]+/gi, 'C:/Users/<user>')
      .replace(/\/(Users|home)\/[^/\\\s:'")<]+/g, '/$1/<user>')
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<email>')
      // eslint-disable-next-line no-control-regex -- removes control characters on purpose
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
  );
}

/* check a report from the game; returns a row to store, or { error } */
export function checkReport(j) {
  if (!j || typeof j !== 'object') return { error: 'bad report' };
  const version = String(j.version || '');
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.]{1,20})?$/.test(version)) return { error: 'bad version' };
  const platform = PLATFORMS.includes(j.platform) ? j.platform : '';
  if (!platform) return { error: 'bad platform' };
  const kind = KINDS.includes(j.kind) ? j.kind : '';
  if (!kind) return { error: 'bad kind' };
  const screen = /^[a-z][a-z0-9-]{0,29}$/.test(String(j.screen || '')) ? j.screen : '';
  const message = scrub(j.message).trim().slice(0, LIMITS.message);
  const detail = scrub(j.detail).slice(0, LIMITS.detail);
  const note = scrub(j.note).trim().slice(0, LIMITS.note);
  if (!message && !note) return { error: 'empty report' };
  return { day: new Date().toISOString().slice(0, 10), version, platform, kind, screen, message, detail, note };
}
