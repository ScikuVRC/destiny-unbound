/* A stand-in for Cloudflare D1 in the tests: node's built-in SQLite with the worker's real schema, behind the same
   prepare(sql).bind(...).run() / .first() / .all() calls the worker uses. SPDX-License-Identifier: GPL-3.0-or-later */
'use strict';
const fs = require('fs');
const path = require('path');

function makeD1() {
  // node:sqlite prints an "experimental" warning on some versions; keep test output clean
  const emit = process.emitWarning;
  process.emitWarning = () => {};
  const { DatabaseSync } = require('node:sqlite');
  process.emitWarning = emit;
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync(path.join(__dirname, '..', 'worker', 'schema.sql'), 'utf8'));
  const plain = r => (r ? { ...r } : null);
  const statement = (sql, args = []) => ({
    bind: (...a) => statement(sql, a),
    run: async () => {
      const st = db.prepare(sql);
      if (/\bRETURNING\b/i.test(sql)) return { results: st.all(...args).map(plain), meta: { changes: 1 } };
      const r = st.run(...args);
      return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    },
    first: async () => plain(db.prepare(sql).get(...args)),
    all: async () => ({
      results: db
        .prepare(sql)
        .all(...args)
        .map(plain),
    }),
  });
  return { prepare: sql => statement(sql), sql: db };
}

module.exports = { makeD1 };
