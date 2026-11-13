// Destiny Unbound world counter: totals of heroes and saga endings, shared by the Discord bot (/stats) and the game
// (opt-in, Options > Data). It stores only numbers. No IPs, names, legend codes or user IDs are kept or logged.
// HTTP: POST /v1/count  {"kind":"hero"} or {"kind":"end","end":"dead"}   ·   GET /v1/totals
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const ENDINGS = ['dead', 'retired', 'ascended', 'lost', 'martyr', 'sealed', 'damned', 'fulfilled', 'undying', 'legend'];
const MORTAL = { dead: 1, martyr: 1, sealed: 1, damned: 1, undying: 1 };

function createStore(file) {
  const blank = () => ({ heroes: 0, discordSpins: 0, endings: {}, since: new Date().toISOString().slice(0, 10) });
  let data = blank();
  try { const j = JSON.parse(fs.readFileSync(file, 'utf8')); if (j && typeof j === 'object') data = Object.assign(blank(), j, { endings: Object.assign({}, j.endings) }); } catch (e) { /* first run */ }
  let dirty = false, timer = null;
  const save = () => {
    if (!dirty) return; dirty = false;
    try { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(data)); fs.renameSync(tmp, file); } catch (e) { console.error('Could not save stats: ' + e.message); }
  };
  const touch = () => { dirty = true; if (!timer) timer = setTimeout(() => { timer = null; save(); }, 5000); };
  return {
    hero() { data.heroes++; touch(); },
    spin() { data.discordSpins++; touch(); },
    end(e) { if (ENDINGS.indexOf(e) < 0) return false; data.endings[e] = (data.endings[e] || 0) + 1; touch(); return true; },
    totals() {
      const sagas = ENDINGS.reduce((t, e) => t + (data.endings[e] || 0), 0);
      const deaths = ENDINGS.filter(e => MORTAL[e]).reduce((t, e) => t + (data.endings[e] || 0), 0);
      return { heroes: data.heroes, discordSpins: data.discordSpins, sagas, deaths, endings: Object.assign({}, data.endings), since: data.since };
    },
    flush() { if (timer) { clearTimeout(timer); timer = null; } save(); }
  };
}

// a small per-address limit so no one can flood the counter (addresses are only held in memory, for one minute)
function limiter(perMinute) {
  let hits = new Map(), started = Date.now();
  return ip => {
    if (Date.now() - started > 60000) { hits = new Map(); started = Date.now(); }
    const n = (hits.get(ip) || 0) + 1; hits.set(ip, n); return n <= perMinute;
  };
}

function startServer(store, port, host) {
  const allow = limiter(30);
  const send = (res, code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' });
    res.end(body == null ? '' : JSON.stringify(body));
  };
  const server = http.createServer((req, res) => {
    const url = (req.url || '').split('?')[0];
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }); return res.end(); }
    if (req.method === 'GET' && url === '/v1/totals') return send(res, 200, store.totals());
    if (req.method === 'POST' && url === '/v1/count') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      if (!allow(ip)) return send(res, 429, { error: 'slow down' });
      let body = '';
      req.on('data', c => { body += c; if (body.length > 200) req.destroy(); });
      req.on('end', () => {
        let j = null; try { j = JSON.parse(body); } catch (e) { return send(res, 400, { error: 'bad json' }); }
        if (j && j.kind === 'hero') { store.hero(); return send(res, 204); }
        if (j && j.kind === 'end' && store.end(j.end)) return send(res, 204);
        return send(res, 400, { error: 'unknown count' });
      });
      return;
    }
    send(res, 404, { error: 'not found' });
  });
  server.listen(port, host || '127.0.0.1', () => console.log('World counter listening on ' + (host || '127.0.0.1') + ':' + port));
  return server;
}

module.exports = { ENDINGS, MORTAL, createStore, startServer };
