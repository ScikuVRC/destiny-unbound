// Daily challenge leaderboard: checks for what a player sends, kept apart from the Worker so tests can run them.
// Players opt in inside the game. An entry is the hero's name, race, score, ending and chapter count, plus a random
// id the game makes once per install (so one player has one row per day). No IPs, accounts or Legend Codes.
// SPDX-License-Identifier: GPL-3.0-or-later
export const ENDINGS = [
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
export const KEEP_DAYS = 14;
export const TOP = 10;
export const NAMELESS = 'A nameless hero';

// Words a hero name may not contain. Checked after folding look-alike characters (0 -> o, $ -> s ...) and removing
// spaces and punctuation, so "f u c k" and "fvck" are caught too. Names that fail are shown as "A nameless hero".
const BLOCK = [
  'fuck',
  'fuk',
  'fvck',
  'shit',
  'cunt',
  'nigg',
  'nigga',
  'fag',
  'rape',
  'rapist',
  'nazi',
  'hitler',
  'kike',
  'spic',
  'chink',
  'retard',
  'whore',
  'slut',
  'cock',
  'dick',
  'pussy',
  'penis',
  'vagina',
  'porn',
  'bitch',
  'tranny',
  'kys',
  'killyourself',
  'molest',
  'pedo',
  'paedo',
  'heil',
  'gook',
  'wetback',
  'dyke',
  'jizz',
  'cum',
  'anal',
  'boob',
  'tits',
  'nsfw',
  'onlyfans',
];
const FOLD = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's', '!': 'i', '|': 'i', '+': 't' };
const fold = s =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[01345789@$!|+]/g, c => FOLD[c] || c)
    .replace(/[^a-z]/g, '');

// Short words like "cum" or "anal" are only blocked as whole words, so "Cumberland" or "Analyst" still pass.
const WHOLE = new Set(['cum', 'anal', 'kys', 'fag', 'spic', 'gook', 'dick', 'cock', 'tits', 'boob']);

export function nameOk(name) {
  const words = name
    .toLowerCase()
    .split(/[^a-z0-9@$!|+]+/)
    .filter(Boolean)
    .map(fold);
  const joined = fold(name);
  for (const w of BLOCK) {
    if (WHOLE.has(w)) {
      if (words.includes(w)) return false;
    } else if (joined.includes(w)) return false;
  }
  if (/https?:|www\.|\.(com|net|org|gg|io|xyz|ru)\b|discord\.|@\w/i.test(name)) return false;
  return true;
}

// Clean text for display: no control characters, no markup, single spaces, limited length.
export function cleanText(s, max) {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '') // eslint-disable-line no-control-regex
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function cleanName(s) {
  const n = cleanText(s, 40);
  return n && nameOk(n) ? n : NAMELESS;
}

const isDay = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
export function dayOffset(day, now) {
  return Math.round(
    (Date.parse(day + 'T00:00:00Z') - Date.parse(now.toISOString().slice(0, 10) + 'T00:00:00Z')) / 864e5
  );
}

/* Checks an entry the game sent. Returns the row to store, or { error }. The day must be today, yesterday or
   tomorrow in UTC (players live in every time zone). */
export function checkEntry(j, now = new Date()) {
  if (!j || typeof j !== 'object') return { error: 'bad entry' };
  if (!isDay(j.day) || Math.abs(dayOffset(j.day, now)) > 1) return { error: 'wrong day' };
  if (typeof j.pid !== 'string' || !/^[a-z0-9]{12,32}$/.test(j.pid)) return { error: 'bad id' };
  const score = Number(j.score),
    ch = Number(j.ch);
  if (!Number.isInteger(score) || score < 0 || score > 500) return { error: 'bad score' };
  if (!Number.isInteger(ch) || ch < 0 || ch > 300) return { error: 'bad chapters' };
  if (!ENDINGS.includes(j.end)) return { error: 'bad ending' };
  const race = cleanText(j.race, 30);
  return {
    day: j.day,
    pid: j.pid,
    name: cleanName(j.name),
    race: race && nameOk(race) ? race : '',
    score,
    ending: j.end,
    ch,
  };
}
