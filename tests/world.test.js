/* World counter tests: the bot's stats store and HTTP server, and the game's opt-in client. Run: node tests/world.test.js */
const assert = require('assert');
const fs = require('fs'),
  os = require('os'),
  path = require('path');
const { createStore, startServer, ENDINGS } = require('../bot/stats.js');
let pass = 0,
  fail = 0;
async function t(name, fn) {
  try {
    await fn();
    pass++;
    console.log('  ok   ' + name);
  } catch (e) {
    fail++;
    console.log(
      '  FAIL ' + name + '\n       ' + ((e && e.stack) || e).toString().split('\n').slice(0, 4).join('\n       ')
    );
  }
}

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'du-world-')),
    file = path.join(dir, 'stats.json');

  await t('the store counts heroes, Discord spins and every ending, and keeps them across restarts', async () => {
    const s = createStore(file);
    s.hero();
    s.hero();
    s.spin();
    assert(s.end('dead'));
    assert(s.end('legend'));
    assert(s.end('martyr'));
    assert(!s.end('nonsense'), 'unknown endings are refused');
    const w = s.totals();
    assert.strictEqual(w.heroes, 2);
    assert.strictEqual(w.discordSpins, 1);
    assert.strictEqual(w.sagas, 3);
    assert.strictEqual(w.deaths, 2);
    s.flush();
    const again = createStore(file).totals();
    assert.strictEqual(again.heroes, 2);
    assert.strictEqual(again.endings.legend, 1);
    assert.deepStrictEqual(
      Object.keys(JSON.parse(fs.readFileSync(file, 'utf8'))).sort(),
      ['discordSpins', 'endings', 'heroes', 'since'],
      'only numbers are stored'
    );
  });

  await t('the server accepts only the two known counts, sends totals, and limits floods', async () => {
    const s = createStore(path.join(dir, 'srv.json')),
      srv = startServer(s, 0);
    await new Promise(r => srv.once('listening', r));
    const base = 'http://127.0.0.1:' + srv.address().port;
    const post = body =>
      fetch(base + '/v1/count', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
    assert.strictEqual((await post({ kind: 'hero' })).status, 204);
    assert.strictEqual((await post({ kind: 'end', end: 'fulfilled' })).status, 204);
    assert.strictEqual((await post({ kind: 'end', end: 'bad' })).status, 400);
    assert.strictEqual((await post({ kind: 'name', name: 'Bob' })).status, 400);
    assert.strictEqual((await post('not json')).status, 400);
    const r = await fetch(base + '/v1/totals');
    assert.strictEqual(r.headers.get('access-control-allow-origin'), '*');
    const w = await r.json();
    assert.strictEqual(w.heroes, 1);
    assert.strictEqual(w.endings.fulfilled, 1);
    let limited = false;
    for (let i = 0; i < 40 && !limited; i++) limited = (await post({ kind: 'hero' })).status === 429;
    assert(limited, 'no flood limit');
    srv.close();
  });

  await t('the game sends nothing unless the player opts in, and only fixed counts', async () => {
    const sent = [],
      mem = {};
    globalThis.window = globalThis;
    globalThis.fetch = async (url, o) => {
      sent.push({ url, body: o && o.body });
      return { ok: true, json: async () => ({ heroes: 5 }) };
    };
    globalThis.FWApp = {
      store: {
        get: (k, d) => (k in mem ? mem[k] : d),
        set: (k, v) => {
          mem[k] = v;
        },
      },
    };
    globalThis.FW = { WORLD_URL: 'https://counter.example' };
    require('../app/js/world.js');
    const W = globalThis.FW.World;
    assert(!W.enabled(), 'must be off by default');
    assert(
      !W.send('hero') && !W.send('end', 'dead') && (await W.totals()) === null && sent.length === 0,
      'sent something while off'
    );
    W.setEnabled(true);
    assert(W.send('hero'));
    assert(W.send('end', 'legend'));
    assert(!W.send('end', 'my name'));
    assert.deepStrictEqual(
      sent.map(x => x.body),
      ['{"kind":"hero"}', '{"kind":"end","end":"legend"}']
    );
    assert.strictEqual((await W.totals()).heroes, 5);
    assert.deepStrictEqual(W.ENDINGS.slice().sort(), ENDINGS.slice().sort(), 'game and bot know the same endings');
  });

  await t('the daily leaderboard checks every entry and filters rude names', async () => {
    const B = await import('../worker/src/board.js');
    const now = new Date('2026-11-14T12:00:00Z');
    const ok = {
      day: '2026-11-14',
      pid: 'abcdefghij1234',
      name: 'Lady Cinder',
      race: 'Elf',
      score: 120,
      end: 'dead',
      ch: 12,
    };
    const row = B.checkEntry(ok, now);
    assert.deepStrictEqual(row, {
      day: '2026-11-14',
      pid: 'abcdefghij1234',
      name: 'Lady Cinder',
      race: 'Elf',
      score: 120,
      ending: 'dead',
      ch: 12,
    });
    assert(!B.checkEntry(Object.assign({}, ok, { day: '2026-11-15' }), now).error, 'tomorrow is fine (time zones)');
    assert(B.checkEntry(Object.assign({}, ok, { day: '2026-11-10' }), now).error, 'old days are refused');
    assert(B.checkEntry(Object.assign({}, ok, { pid: 'x' }), now).error);
    assert(B.checkEntry(Object.assign({}, ok, { score: 9999 }), now).error);
    assert(B.checkEntry(Object.assign({}, ok, { score: 1.5 }), now).error);
    assert(B.checkEntry(Object.assign({}, ok, { end: 'nonsense' }), now).error);
    ['Sir F u c k', 'sh1t lord', 'www.spam.com', 'B!tch Queen', 'join discord.gg/x'].forEach(n =>
      assert.strictEqual(B.cleanName(n), B.NAMELESS, 'should be filtered: ' + n)
    );
    ['Cumberland the Bold', 'Ana the Analyst', 'The Grave Dancer', 'Lady Cinder'].forEach(n =>
      assert.strictEqual(B.cleanName(n), n, 'should pass: ' + n)
    );
    assert.strictEqual(B.cleanName('<b>Bold</b>\u0007'), 'bBold/b', 'no markup or control characters');
    assert.strictEqual(B.cleanName('x'.repeat(80)).length, 40);
    assert.deepStrictEqual(B.ENDINGS.slice().sort(), ENDINGS.slice().sort(), 'board and bot know the same endings');
  });

  await t('the game posts to the leaderboard only after opting in, with a random id and nothing else', async () => {
    const W = globalThis.FW.World,
      sent = [];
    globalThis.fetch = async (url, o) => {
      sent.push({ url, body: o && o.body });
      return { ok: true, json: async () => ({ ok: true, top: [], players: 0 }) };
    };
    assert(!W.boardEnabled(), 'the leaderboard must be off by default');
    assert.strictEqual(await W.postDaily({ day: '2026-11-14', name: 'X', score: 1, end: 'dead' }), null);
    assert.strictEqual(sent.length, 0, 'sent something while off');
    W.setBoard(true);
    await W.postDaily({ day: '2026-11-14', name: 'Lady Cinder', race: 'Elf', score: 99.6, end: 'legend', ch: 7 });
    assert.strictEqual(sent.length, 1);
    const b = JSON.parse(sent[0].body);
    assert.deepStrictEqual(Object.keys(b).sort(), ['ch', 'day', 'end', 'name', 'pid', 'race', 'score']);
    assert(/^[a-z0-9]{20}$/.test(b.pid) && b.score === 100);
    assert(/\/v1\/daily$/.test(sent[0].url));
    W.setBoard(false);
    W.setBoard(true);
    await W.postDaily({ day: '2026-11-14', name: 'Again', score: 5, end: 'dead' });
    assert.strictEqual(JSON.parse(sent[1].body).pid, b.pid, 'the id stays the same');
  });

  fs.rmSync(dir, { recursive: true, force: true });
  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
