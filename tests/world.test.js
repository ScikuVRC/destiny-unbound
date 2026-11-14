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

  fs.rmSync(dir, { recursive: true, force: true });
  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
