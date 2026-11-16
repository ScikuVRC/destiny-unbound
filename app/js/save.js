/* Save format version and migrations. Everything the game keeps sits in localStorage under fw.* keys; fw.schema
   says which layout those keys use. At startup, before anything reads a save, older layouts are brought up to date
   one step at a time, after a copy of the untouched save is kept (du.premigrate; system.js also writes it as a backup).
   A save from a newer game is left alone. Changing how a key is stored? Add a step and a test (tests/save.test.js).
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  'use strict';
  const FW = (g.FW = g.FW || {});
  const SAVE = (FW.Save = {});
  const KEY = 'fw.schema',
    PRE = 'du.premigrate';

  /* The current layout. Saves from before 0.2.0-alpha.4.6 have no fw.schema and count as 0. */
  SAVE.SCHEMA = 1;

  /* STEPS[n] turns a layout n-1 save into layout n. It gets the parsed fw.* values ({ 'fw.hall': [...], ... }),
     changes them in place, and must also work when a key is missing or empty. */
  const OLD_THEMES = { classic: 'ashen', gilded: 'ashen', neon: 'iron', grimoire: 'astral', tabletop: 'astral' };
  SAVE.STEPS = {
    // 0.2.0-alpha.4.6: saves get a version number; theme names from before the first alpha become today's themes
    1: d => {
      const s = d['fw.settings'];
      if (s && typeof s === 'object' && OLD_THEMES[s.theme]) s.theme = OLD_THEMES[s.theme];
    },
  };

  const isSave = k => typeof k === 'string' && k.indexOf('fw.') === 0 && k !== KEY;

  /* Bring a set of saved keys ({ 'fw.x': JSON text }) from layout `from` to SAVE.SCHEMA.
     Returns { data, changed: [keys whose text changed], from, to }. Throws if a step fails; the input is never changed. */
  SAVE.migrate = function (raw, from) {
    from = Math.max(0, Math.floor(+from || 0));
    const parsed = {},
      before = {};
    Object.keys(raw).forEach(k => {
      if (!isSave(k)) return;
      before[k] = raw[k];
      try {
        parsed[k] = JSON.parse(raw[k]);
      } catch (e) {
        parsed[k] = undefined; // damaged: leave the text as it is, the game falls back to defaults when reading it
      }
    });
    for (let n = from + 1; n <= SAVE.SCHEMA; n++) if (SAVE.STEPS[n]) SAVE.STEPS[n](parsed);
    const data = Object.assign({}, before),
      changed = [];
    Object.keys(parsed).forEach(k => {
      if (parsed[k] === undefined) return;
      const s = JSON.stringify(parsed[k]);
      if (s !== before[k]) {
        data[k] = s;
        changed.push(k);
      }
    });
    return { data, changed, from, to: SAVE.SCHEMA };
  };

  /* Which layout a save uses: a number, 0 when it has none. */
  SAVE.schemaOf = function (raw) {
    const v = raw && raw[KEY] != null ? +JSON.parse(raw[KEY]) : 0;
    return isFinite(v) && v > 0 ? Math.floor(v) : 0;
  };

  /* ---------- writing: a failed write is reported once, so the player knows progress is not being kept ---------- */
  let warned = false,
    pending = null;
  SAVE.failed = function (e, key) {
    const why = (e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || '')) && 'full') || 'blocked';
    SAVE.lastError = { key, why, message: String((e && e.message) || e) };
    if (FW.System && FW.System.log) FW.System.log('error', 'save failed (' + key + '): ' + SAVE.lastError.message);
    if (warned) return;
    if (SAVE.onFail) {
      warned = true;
      SAVE.onFail(why);
    } else pending = why;
  };
  /* app.js calls this once it can show messages; a failure that happened earlier is shown then */
  SAVE.setWarn = function (fn) {
    SAVE.onFail = fn;
    if (pending && !warned) {
      warned = true;
      fn(pending);
    }
  };
  SAVE.write = function (key, text) {
    try {
      g.localStorage.setItem(key, text);
      return true;
    } catch (e) {
      SAVE.failed(e, key);
      return false;
    }
  };

  /* ---------- startup ---------- */
  SAVE.run = function (ls) {
    const res = { from: 0, to: SAVE.SCHEMA, migrated: false, newer: false, changed: [] };
    try {
      ls = ls || g.localStorage; // reading localStorage itself throws when the browser blocks storage
      const raw = {};
      for (let i = 0; i < ls.length; i++) {
        const k = ls.key(i);
        if (k && k.indexOf('fw.') === 0) raw[k] = ls.getItem(k);
      }
      let from = 0;
      try {
        from = SAVE.schemaOf(raw);
      } catch (e) {
        from = 0;
      }
      res.from = from;
      if (from > SAVE.SCHEMA) {
        res.newer = true; // a newer game wrote this save: change nothing
      } else if (from < SAVE.SCHEMA) {
        const keys = Object.keys(raw).filter(isSave);
        if (keys.length) {
          const m = SAVE.migrate(raw, from); // throws before anything is written if a step fails
          const pre = {};
          keys.forEach(k => (pre[k] = raw[k]));
          ls.setItem(
            PRE,
            JSON.stringify({ from, to: SAVE.SCHEMA, game: FW.VERSION, date: new Date().toISOString(), data: pre })
          );
          m.changed.forEach(k => ls.setItem(k, m.data[k]));
          res.changed = m.changed;
          res.migrated = true;
        }
        ls.setItem(KEY, String(SAVE.SCHEMA));
      }
    } catch (e) {
      res.error = String((e && e.message) || e); // the save stays as it was; reading code falls back to defaults
    }
    SAVE.startup = res;
    return res;
  };
  /* the untouched copy kept by the last migration, or null */
  SAVE.premigrate = function (ls) {
    try {
      return JSON.parse((ls || g.localStorage).getItem(PRE) || 'null');
    } catch (e) {
      return null;
    }
  };

  if (!g.__noSaveRun) SAVE.run();
})(typeof window !== 'undefined' ? window : globalThis);
