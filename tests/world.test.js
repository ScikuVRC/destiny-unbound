/* World counter tests: the bot's stats store and HTTP server, and the game's opt-in client. Run: node tests/world.test.js */
const assert = require('assert');
const fs = require('fs'),
  os = require('os'),
  path = require('path');
const { createStore, startServer, ENDINGS } = require('../bot/stats.js');
const { makeD1 } = require('./d1.js');
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

  await t(
    'short card codes: only Legend Codes are accepted, codes are easy to type, and lookups are forgiving',
    async () => {
      const C = await import('../worker/src/cards.js');
      assert.strictEqual(C.checkCode('FW1.' + 'a'.repeat(40)), '');
      assert(C.checkCode('hello'), 'not a code');
      assert(C.checkCode('FW1.<script>alert(1)</script>xxxxxxxxxxxxx'), 'only base64 characters');
      assert(C.checkCode('FW1.' + 'a'.repeat(C.MAX_CODE)), 'too long');
      for (let i = 0; i < 200; i++) {
        const id = C.makeId();
        assert(/^[23456789ABCDEFGHJKMNPQRSTWXYZ]{6}$/.test(id), id);
      }
      ['DU-7K3QXM', 'du-7k3qxm', 'DU 7K3QXM', '7k3qxm'].forEach(s => assert.strictEqual(C.normaliseId(s), '7K3QXM', s));
      ['DU-0OIL1U', '7K3QX', 'DU-7K3QXMM', ''].forEach(s => assert.strictEqual(C.normaliseId(s), '', s));
      assert.strictEqual(await C.hashOf('a'), await C.hashOf('a'));
      assert.notStrictEqual(await C.hashOf('a'), await C.hashOf('b'));
    }
  );

  await t('error reports: the server keeps only a checked, cleaned report', async () => {
    const E = await import('../worker/src/errors.js');
    const ok = E.checkReport({
      version: '0.2.0-alpha.4.6',
      platform: 'windows',
      kind: 'error',
      screen: 'spin',
      message: 'TypeError: x is undefined at C:\\Users\\Sciku\\AppData\\game.js:3',
      detail: 'line from /home/ana/game and /Users/bob/x, mail me at someone@example.com',
      note: 'it froze',
      extra: 'ignored',
    });
    assert(!ok.error, ok.error);
    assert.deepStrictEqual(Object.keys(ok).sort(), [
      'day',
      'detail',
      'kind',
      'message',
      'note',
      'platform',
      'screen',
      'version',
    ]);
    assert(!/Sciku|ana|bob|someone@/.test(ok.message + ok.detail), ok.message + ' / ' + ok.detail);
    assert(/<user>/.test(ok.message) && /<email>/.test(ok.detail));
    // a name with a space is taken out whole, and the file after it is kept
    assert.strictEqual(E.scrub('at C:/Users/Ana Maria/game/app.js:3'), 'at C:/Users/<user>/game/app.js:3');
    assert.strictEqual(E.scrub('C:\\Users\\Kim\\x.js'), 'C:/Users/<user>\\x.js');
    [
      { version: 'x', platform: 'windows', kind: 'error', message: 'm' },
      { version: '1.0.0', platform: 'amiga', kind: 'error', message: 'm' },
      { version: '1.0.0', platform: 'mac', kind: 'virus', message: 'm' },
      { version: '1.0.0', platform: 'mac', kind: 'error', message: '  ', note: '' },
      null,
    ].forEach(j => assert(E.checkReport(j).error, JSON.stringify(j)));
    const big = E.checkReport({
      version: '1.0.0',
      platform: 'linux',
      kind: 'crash',
      screen: 'Bad Screen!',
      message: 'm'.repeat(999),
      detail: 'd'.repeat(99999),
      note: 'n'.repeat(9999),
    });
    assert.strictEqual(big.message.length, E.LIMITS.message);
    assert.strictEqual(big.detail.length, E.LIMITS.detail);
    assert.strictEqual(big.note.length, E.LIMITS.note);
    assert.strictEqual(big.screen, '');
  });

  await t('error reports: POST /v1/error stores the row, trims old ones and returns its number', async () => {
    const W = (await import('../worker/src/index.js')).default;
    const DB = makeD1();
    for (let i = 0; i < 6; i++)
      DB.sql
        .prepare("INSERT INTO errors (day, version, platform, kind) VALUES (?, '1.0.0', 'browser', 'error')")
        .run(i ? '2099-01-01' : '2000-01-01');
    const post = body => W.fetch(new Request('https://x/v1/error', { method: 'POST', body }), { DB });
    const res = await post(
      JSON.stringify({ version: '0.2.0-alpha.4.6', platform: 'browser', kind: 'manual', message: '', note: 'a note' })
    );
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(await res.json(), { ok: true, id: 7 });
    const kept = DB.sql.prepare('SELECT id, note FROM errors ORDER BY id').all();
    assert.strictEqual(kept[kept.length - 1].note, 'a note');
    assert(!kept.some(r => r.id === 1), 'a report older than 30 days was removed');
    assert.strictEqual((await post('{nope')).status, 400);
    assert.strictEqual(
      (await post(JSON.stringify({ version: '1', platform: 'browser', kind: 'error', message: 'm' }))).status,
      400
    );
    const get = await W.fetch(new Request('https://x/v1/error'), { DB });
    assert.strictEqual(get.status, 404, 'reports cannot be read over the web');
  });

  await t(
    'error reports: the game builds the same cleaned report the server keeps, and never sends one by itself',
    async () => {
      globalThis.window = globalThis;
      require('../app/js/version.js');
      require('../app/js/report.js');
      const R = globalThis.FW.Report;
      const E = await import('../worker/src/errors.js');
      const sample = 'at C:\\Users\\Kim\\x.js and /home/kim/y and kim@mail.org';
      assert.strictEqual(R.scrub(sample), E.scrub(sample));
      const log = [
        '2026-11-16T10:00:00.000Z [info] started 0.2.0-alpha.4.6 (desktop)',
        '2026-11-16T10:00:05.000Z [error] TypeError: a is null at /js/app.js:10',
        '2026-11-16T10:00:06.000Z [info] after',
      ];
      const rep = R.build({ kind: 'error', log, screen: 'card', desktop: true, ua: 'Mozilla/5.0 (Windows NT 10.0)' });
      assert.strictEqual(rep.message, 'TypeError: a is null at /js/app.js:10');
      assert.strictEqual(rep.platform, 'windows');
      assert.strictEqual(rep.version, globalThis.FW.VERSION);
      assert(rep.detail.includes('[info] after'));
      const crash = R.build({
        kind: 'crash',
        message: 'The game stopped',
        log,
        extra: ['main: page stopped'],
        desktop: true,
        ua: 'Macintosh',
      });
      assert(crash.detail.startsWith('Desktop log:\nmain: page stopped') && crash.platform === 'mac');
      assert.strictEqual(R.build({ log: [], desktop: false }).platform, 'browser');
      const row = E.checkReport(Object.assign({}, rep, { note: 'n' }));
      assert(
        !row.error && row.message === rep.message && row.detail === rep.detail,
        'the server keeps what the player saw'
      );
      const src = fs.readFileSync(path.join(__dirname, '..', 'app', 'js', 'report.js'), 'utf8');
      assert.strictEqual((src.match(/R\.send\(/g) || []).length, 1, 'one place sends');
      assert(/\$\('erSend'\)\.onclick = async \(\) => \{[\s\S]*?R\.send\(rep\)/.test(src), 'and it is the Send button');
    }
  );

  await t(
    '"where I stop playing" is off by default, sends only a screen or an id, and the server caps it',
    async () => {
      const sent = [],
        mem = {};
      globalThis.window = globalThis;
      globalThis.fetch = async (url, o) => (
        sent.push({ url, body: o && o.body }),
        { ok: true, json: async () => ({}) }
      );
      const realNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
      Object.defineProperty(globalThis, 'navigator', {
        value: { sendBeacon: (url, blob) => (sent.push({ url, blob }), true) },
        configurable: true,
        writable: true,
      });
      globalThis.FWApp = { store: { get: (k, d) => (k in mem ? mem[k] : d), set: (k, v) => (mem[k] = v) } };
      globalThis.FW = { WORLD_URL: 'https://counter.example' };
      delete require.cache[require.resolve('../app/js/world.js')];
      require('../app/js/world.js');
      const W = globalThis.FW.World;
      assert(!W.quitsEnabled() && !W.sendQuit('spin') && sent.length === 0, 'sent something while off');
      W.setQuits(true);
      assert(!W.enabled() && !W.boardEnabled(), 'a separate switch from the counter and the board');
      assert(W.sendQuit('spin') && W.sendQuit('make:race') && W.sendQuit('story:dragon'));
      ['', 'my name', 'story:Some Free Text', 'make:race; drop', 'arena'].forEach(x => assert(!W.sendQuit(x), x));
      assert.strictEqual(sent.length, 3);
      assert(sent.every(x => x.url === 'https://counter.example/v1/count'));
      assert.deepStrictEqual(JSON.parse(await sent[2].blob.text()), { kind: 'quit', where: 'story:dragon' });
      if (realNav) Object.defineProperty(globalThis, 'navigator', realNav);
      else delete globalThis.navigator;

      const Wk = (await import('../worker/src/index.js')).default;
      const DB = makeD1();
      const count = k => (DB.sql.prepare('SELECT n FROM counts WHERE k = ?').get(k) || {}).n;
      const post = body =>
        Wk.fetch(new Request('https://x/v1/count', { method: 'POST', body: JSON.stringify(body) }), { DB });
      assert.strictEqual((await post({ kind: 'quit', where: 'story:dragon' })).status, 204);
      assert.strictEqual(count('quit:story:dragon'), 1);
      assert.strictEqual((await post({ kind: 'quit', where: 'free text here' })).status, 400);
      const add = DB.sql.prepare('INSERT INTO counts (k, n) VALUES (?, 1)');
      for (let i = 1; i < 400; i++) add.run('quit:make:w' + i);
      assert.strictEqual((await post({ kind: 'quit', where: 'story:another' })).status, 400, 'capped at 400 places');
      assert.strictEqual(
        (await post({ kind: 'quit', where: 'story:dragon' })).status,
        204,
        'a known place still counts'
      );
    }
  );

  await t('abuse protection: a daily cap per address, no address stored, and yesterday forgotten', async () => {
    const G = await import('../worker/src/guard.js');
    const DB = makeD1(),
      env = { DB },
      day1 = Date.parse('2026-11-16T12:00:00Z'),
      day2 = day1 + 864e5;
    for (let i = 0; i < G.CAPS.error; i++) assert.strictEqual(await G.guard(env, '203.0.113.9', 'error', day1), null);
    assert.deepStrictEqual(await G.guard(env, '203.0.113.9', 'error', day1), [429, 'daily limit reached']);
    assert.strictEqual(await G.guard(env, '198.51.100.4', 'error', day1), null, 'another address is not affected');
    assert.strictEqual(await G.guard(env, '203.0.113.9', 'card', day1), null, 'each route has its own cap');
    const dump = JSON.stringify(DB.sql.prepare('SELECT * FROM caps').all());
    assert(!/203\.0\.113|198\.51/.test(dump), 'no address in the database');
    const tr = DB.sql.prepare("SELECT n, capped FROM traffic WHERE route = 'error'").get();
    assert.deepStrictEqual({ ...tr }, { n: G.CAPS.error + 2, capped: 1 });
    // the next day: a fresh salt, yesterday's hashes gone, the cap starts again
    const salt1 = DB.sql.prepare('SELECT s FROM salt').get().s;
    assert.strictEqual(await G.guard(env, '203.0.113.9', 'error', day2), null);
    const salts = DB.sql.prepare('SELECT s FROM salt').all();
    assert(salts.length === 1 && salts[0].s !== salt1, 'one salt, a new one');
    assert.strictEqual(DB.sql.prepare('SELECT COUNT(*) AS n FROM caps').get().n, 1);
    // the per-minute limiter still comes first
    const slow = { DB, LIMITER: { limit: async () => ({ success: false }) } };
    assert.deepStrictEqual(await G.guard(slow, '203.0.113.9', 'count', day2), [429, 'slow down']);
  });

  await t('abuse protection: /v1/health shows writes per day and flags a sudden jump', async () => {
    const G = await import('../worker/src/guard.js');
    const now = Date.parse('2026-11-16T12:00:00Z');
    const week = [10, 11, 12, 13, 14, 15].map(d => ({ day: '2026-11-' + d, route: 'count', n: 40, capped: 0 }));
    const calm = G.health([...week, { day: '2026-11-16', route: 'count', n: 60, capped: 0 }], now);
    assert(!calm.jump && calm.weekAverage === 40 && calm.today.total === 60);
    const loud = G.health(
      [...week, { day: '2026-11-16', route: 'count', n: 900, capped: 12 }, { day: '2026-11-16', route: 'error', n: 5 }],
      now
    );
    assert(loud.jump && loud.today.total === 905 && loud.today.capped === 12, JSON.stringify(loud.today));
    assert(!G.health([{ day: '2026-11-16', route: 'count', n: 150 }], now).jump, 'a small first day is not a jump');
    const W = (await import('../worker/src/index.js')).default;
    const DB = makeD1();
    const r = await W.fetch(new Request('https://x/v1/count', { method: 'POST', body: '{"kind":"hero"}' }), { DB });
    assert.strictEqual(r.status, 204);
    const h = await (await W.fetch(new Request('https://x/v1/health'), { DB })).json();
    assert.strictEqual(h.today.count, 1);
    assert(!/ip|addr/i.test(JSON.stringify(h)), 'nothing about addresses');
  });

  await t("world boss: the server adds this week's damage, refuses other weeks and impossible hits", async () => {
    const Bs = await import('../worker/src/boss.js');
    const mon = Date.UTC(2026, 10, 16, 0, 0, 30); // a Monday just after midnight
    assert.strictEqual(Bs.weekOf(mon), '2026-W47');
    assert.strictEqual(Bs.weekOf(Date.UTC(2026, 10, 22, 23, 59)), '2026-W47', 'Sunday night is the same week');
    assert.strictEqual(Bs.weekOf(Date.UTC(2027, 0, 1)), '2026-W53');
    assert(Bs.checkHit({ week: '2026-W46', damage: 10 }, mon).week, 'a minute after midnight, last week still counts');
    assert(Bs.checkHit({ week: '2026-W40', damage: 10 }, mon).error);
    assert(Bs.checkHit({ week: '2026-W47', damage: Bs.MAX_HIT + 1 }, mon).error);
    assert(Bs.checkHit({ week: '2026-W47', damage: 2.5 }, mon).error);
    const W = (await import('../worker/src/index.js')).default;
    const DB = makeD1();
    const week = Bs.weekOf();
    const hit = d =>
      W.fetch(new Request('https://x/v1/boss', { method: 'POST', body: JSON.stringify({ week, damage: d }) }), { DB });
    assert.strictEqual((await hit(1200)).status, 200);
    const r2 = await (await hit(800)).json();
    assert.deepStrictEqual(r2, { week, dealt: 2000, fighters: 2 });
    assert.strictEqual((await hit(999999)).status, 400);
    const g = await (await W.fetch(new Request('https://x/v1/boss?week=' + week), { DB })).json();
    assert.deepStrictEqual(g, { week, dealt: 2000, fighters: 2 });
    const none = await (await W.fetch(new Request('https://x/v1/boss?week=2020-W01'), { DB })).json();
    assert.strictEqual(none.dealt, 0);
    // the game and the server agree on the week
    globalThis.window = globalThis;
    require('../app/js/boss.js');
    [mon, Date.UTC(2027, 0, 1), Date.UTC(2026, 11, 28, 12)].forEach(x =>
      assert.strictEqual(globalThis.FW.Boss.week(x), Bs.weekOf(x))
    );
  });

  fs.rmSync(dir, { recursive: true, force: true });
  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
