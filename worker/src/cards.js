// Short card codes: a player who presses "Get a short code" stores their Legend Code here and gets back a code like
// DU-7K3QXM that anyone can open in the game. Only the Legend Code itself is stored (it holds the hero's rolls,
// name and saga), with the day it was made; nothing about the player. Codes expire after KEEP_DAYS.
// SPDX-License-Identifier: GPL-3.0-or-later
export const KEEP_DAYS = 90;
export const MAX_CODE = 20000;
// no 0/O, 1/I/L or U/V, so codes are easy to read aloud and type
export const ALPHABET = '23456789ABCDEFGHJKMNPQRSTWXYZ';
export const ID_LEN = 6;

/* a Legend Code is "FW1." followed by URL-safe base64 */
export function checkCode(code) {
  if (typeof code !== 'string') return 'bad code';
  const c = code.trim();
  if (c.length > MAX_CODE) return 'code too long';
  if (!/^FW1\.[A-Za-z0-9_-]{20,}$/.test(c)) return 'not a Legend Code';
  return '';
}

/* "du-7k3qxm", "DU7K3QXM" or "7K3QXM" -> "7K3QXM", or '' if it can't be a short code */
export function normaliseId(s) {
  const t = String(s || '')
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .replace(/^DU/, '');
  return t.length === ID_LEN && [...t].every(ch => ALPHABET.includes(ch)) ? t : '';
}

export function makeId(random = Math.random) {
  let s = '';
  for (let i = 0; i < ID_LEN; i++) s += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return s;
}

export async function hashOf(code) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
