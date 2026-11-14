/* Tests for the Discord status: the IPC client against a stand-in Discord, and the texts it shows.
   Run: node tests/discord.test.js */
const assert = require('assert'),
  net = require('net'),
  path = require('path'),
  os = require('os'),
  fs = require('fs');
const { Presence, toActivity, encode, OP } = require('../electron/discord.js');
globalThis.window = globalThis;
const mem = {};
globalThis.localStorage = {
  getItem: k => (k in mem ? mem[k] : null),
  setItem: (k, v) => {
    mem[k] = String(v);
  },
  removeItem: k => {
    delete mem[k];
  },
};
['data.js', 'engine.js', 'story.js', 'wheel.js', 'presence.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW;
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
      '  FAIL ' + name + '\n       ' + ((e && e.stack) || e).toString().split('\n').slice(0, 3).join('\n       ')
    );
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ID = '123456789012345678';

/* A stand-in for the Discord app: accepts the handshake, answers READY, records every frame. */
function fakeDiscord(prefix) {
  const frames = [],
    sockets = [];
  const server = net.createServer(s => {
    sockets.push(s);
    let buf = Buffer.alloc(0);
    s.on('data', d => {
      buf = Buffer.concat([buf, d]);
      while (buf.length >= 8) {
        const op = buf.readInt32LE(0),
          len = buf.readInt32LE(4);
        if (buf.length < 8 + len) return;
        const msg = JSON.parse(buf.slice(8, 8 + len).toString('utf8'));
        buf = buf.slice(8 + len);
        frames.push({ op, msg });
        if (op === OP.HANDSHAKE) s.write(encode(OP.FRAME, { cmd: 'DISPATCH', evt: 'READY', data: { v: 1 } }));
      }
    });
    s.on('error', () => {});
  });
  const where = prefix + '0';
  if (process.platform !== 'win32')
    try {
      fs.unlinkSync(where);
    } catch (e) {
      /* not there */
    }
  return new Promise(res =>
    server.listen(where, () =>
      res({
        frames,
        sockets,
        close: () =>
          new Promise(r => {
            sockets.forEach(s => s.destroy());
            server.close(r);
          }),
      })
    )
  );
}
const prefix =
  process.platform === 'win32'
    ? '\\\\?\\pipe\\du-discord-test-' + process.pid + '-'
    : path.join(os.tmpdir(), 'du-discord-test-' + process.pid + '-');

(async () => {
  await t('without a valid Application ID the status stays off and never connects', async () => {
    const p = new Presence({ clientId: '', pipePrefix: prefix + 'none-' });
    p.setEnabled(true);
    assert.strictEqual(p.enabled, false);
    assert.strictEqual(p.usable, false);
    assert.strictEqual(new Presence({ clientId: 'abc' }).usable, false);
    assert.strictEqual(new Presence({ clientId: ID }).usable, true);
  });

  await t(
    'connects, sends the handshake with the Application ID, then the activity once Discord is ready',
    async () => {
      const d = await fakeDiscord(prefix + 'a-');
      const p = new Presence({ clientId: ID, pipePrefix: prefix + 'a-', pid: 4242, startedAt: 1_700_000_000_000 });
      p.setEnabled(true);
      p.set({
        details: 'Living a saga',
        state: 'Chapter 3 · The Forgotten One, Salamanderkin',
        image: 'emblem',
        imageText: 'Destiny Unbound',
        buttons: [
          { label: 'Play free', url: 'https://bzrkherja.itch.io/destiny-unbound' },
          { label: 'bad', url: 'javascript:alert(1)' },
        ],
      });
      await sleep(300);
      assert.deepStrictEqual(d.frames[0], { op: OP.HANDSHAKE, msg: { v: 1, client_id: ID } });
      const set = d.frames.find(f => f.msg.cmd === 'SET_ACTIVITY');
      assert(set, 'activity sent');
      assert.strictEqual(set.msg.args.pid, 4242);
      const a = set.msg.args.activity;
      assert.strictEqual(a.details, 'Living a saga');
      assert.strictEqual(a.state, 'Chapter 3 · The Forgotten One, Salamanderkin');
      assert.strictEqual(a.timestamps.start, 1_700_000_000);
      assert.deepStrictEqual(a.assets, { large_image: 'emblem', large_text: 'Destiny Unbound' });
      assert.deepStrictEqual(
        a.buttons,
        [{ label: 'Play free', url: 'https://bzrkherja.itch.io/destiny-unbound' }],
        'only https buttons'
      );
      p.close();
      await d.close();
    }
  );

  await t('rapid changes are combined (Discord rate limit) and switching off clears the status', async () => {
    const d = await fakeDiscord(prefix + 'b-');
    const p = new Presence({ clientId: ID, pipePrefix: prefix + 'b-' });
    p.setEnabled(true);
    p.set({ details: 'one' });
    await sleep(300);
    p.set({ details: 'two' });
    p.set({ details: 'three' });
    p.set({ details: 'three' });
    await sleep(300);
    const sets = () =>
      d.frames.filter(f => f.msg.cmd === 'SET_ACTIVITY').map(f => f.msg.args.activity && f.msg.args.activity.details);
    assert.deepStrictEqual(sets(), ['one'], 'second update waits for the 4 second gap');
    await sleep(4000);
    assert.deepStrictEqual(sets(), ['one', 'three'], 'only the latest of the rapid changes is sent');
    p.setEnabled(false);
    await sleep(100);
    assert.strictEqual(sets()[sets().length - 1], null, 'switching off clears the status');
    p.close();
    await d.close();
  });

  await t('answers pings, and quietly does nothing when Discord is not running', async () => {
    const d = await fakeDiscord(prefix + 'c-');
    const p = new Presence({ clientId: ID, pipePrefix: prefix + 'c-' });
    p.setEnabled(true);
    await sleep(200);
    d.sockets[0].write(encode(OP.PING, { n: 1 }));
    await sleep(150);
    assert(
      d.frames.some(f => f.op === OP.PONG && f.msg.n === 1),
      'pong sent'
    );
    p.close();
    await d.close();
    const q = new Presence({ clientId: ID, pipePrefix: prefix + 'nobody-' });
    q.setEnabled(true);
    q.set({ details: 'x' });
    await sleep(200);
    assert.strictEqual(q.sock, null);
    q.close();
  });

  await t('activity text is cleaned: control characters removed, 2 to 128 characters', () => {
    const a = toActivity({ details: 'x', state: 'a\nb'.repeat(80) }, 0);
    assert.strictEqual(a.details, 'x ');
    assert(a.state.length <= 128 && !/\n/.test(a.state));
    assert.strictEqual(toActivity(null, 0), null);
    assert.strictEqual(toActivity({}, 0).details, undefined);
  });

  await t('the status describes each screen, saga chapter, fight, daily challenge and ending', () => {
    const L = new FW.Legend({ luck: 'heroic', seed: 'x' });
    L.picks.race = { name: 'Elf' };
    const S = { theme: 'astral', luck: 'heroic', screen: 'title', legend: null, fight: null };
    const p = s => FW.presenceFor(Object.assign({}, S, s), { chip: s.chip });
    assert.strictEqual(p({}).details, 'In the main menu');
    assert.strictEqual(p({}).small, 'astral');
    assert.strictEqual(p({}).smallText, 'Astral Oracle');
    assert.strictEqual(p({ screen: 'home' }).state, 'Heroic luck');
    assert.strictEqual(p({ screen: 'spin', legend: L }).details, 'Forging a new legend');
    assert.strictEqual(p({ screen: 'spin', legend: L }).state, 'Elf', 'only the race until a title is spun');
    L.name = 'Secret Real Name';
    L.picks.title = { name: 'The Pure One' };
    assert.strictEqual(
      p({ screen: 'spin', legend: L }).state,
      'The Pure One, Elf',
      'title and race, never the custom name'
    );
    L.saga = { log: [{}, {}], end: null };
    assert.strictEqual(
      p({ screen: 'spin', legend: L, chip: 'Chapter 3: What happens next?' }).state.indexOf('Chapter 3'),
      0
    );
    assert.strictEqual(
      p({ screen: 'spin', legend: L, fight: {}, chip: 'Chapter 3: What happens next?' }).details,
      'Living a saga',
      'an old fight does not hide the story'
    );
    assert.strictEqual(
      p({ screen: 'spin', legend: L, fight: {}, chip: 'Who do you fight?' }).details,
      'Fighting in the arena'
    );
    L.saga.log = [{}, {}, {}, {}, {}]; // follow-up wheels add log entries: the number still comes from the question
    assert.strictEqual(
      p({ screen: 'spin', legend: L, chip: 'CHAPTER 3: What happens next?' }).state,
      'Chapter 3 · The Pure One, Elf'
    );
    assert.strictEqual(
      FW.presenceFor(Object.assign({}, S, { screen: 'spin', legend: L }), { chip: 'What do you find?', chapter: '3' })
        .state,
      'Chapter 3 · The Pure One, Elf',
      'follow-up wheels keep the chapter'
    );
    L.saga.end = 'dead';
    assert(/fell$/.test(p({ screen: 'card', legend: L }).state));
    assert.strictEqual(
      p({ screen: 'spin', legend: L, chip: 'The end of The Pure One' }).details,
      'A saga has ended',
      'the ending screen'
    );
    L.saga = null;
    L.seed = 'daily-2026-11-13';
    assert.strictEqual(p({ screen: 'spin', legend: L }).details, 'Daily challenge');
    assert(p({ screen: 'card', legend: L }).details === 'Admiring a legend');
  });

  await t('the release announcement links the release and itch.io, escapes markdown and never pings anyone', () => {
    const { message } = require('../scripts/discord-announce.js');
    const many = Array.from({ length: 10 }, (_, i) => 'Fix *number* ' + i);
    const m = message('v0.2.0-alpha.1', many),
      e = m.embeds[0];
    assert.strictEqual(e.title, 'Destiny Unbound 0.2.0-alpha.1 is out');
    assert.strictEqual(e.url, 'https://github.com/ScikuVRC/destiny-unbound/releases/tag/v0.2.0-alpha.1');
    assert(e.description.includes('https://bzrkherja.itch.io/destiny-unbound'));
    assert(e.description.includes('Fix \\*number\\* 0') && e.description.includes('…and 2 more'));
    assert(/<#\d+>/.test(e.description), 'pre-releases point to #bug-reports');
    assert.deepStrictEqual(m.allowed_mentions, { parse: [] });
    assert(!/<#\d+>/.test(message('v1.0.0', []).embeds[0].description), 'full releases skip the alpha note');
  });

  await t(
    'patch notes: every changelog release is found, Unreleased is skipped, and Discord gets readable text',
    () => {
      const N = require('../bot/patchnotes.js');
      const sample =
        '# Changelog\n\n## Unreleased\n\n- not out yet\n\n## 1.2.0-alpha.1.1 (2026-11-14)\n\nA small fix.\n\n' +
        '### Fixes\n\n- **Cards.** The back no longer\n  breaks before the last wheel.\n\n## 1.2.0-alpha.1 (2026-11-13)\n\n- First.\n';
      const list = N.sections(sample);
      assert.deepStrictEqual(
        list.map(s => s.version),
        ['1.2.0-alpha.1.1', '1.2.0-alpha.1']
      );
      assert.strictEqual(N.find(list).version, '1.2.0-alpha.1.1', 'the newest by default');
      assert.strictEqual(N.find(list, 'v1.2.0-alpha.1').date, '2026-11-13');
      assert.strictEqual(N.find(list, '9.9.9'), null);
      const d = N.toDiscord(list[0].body);
      assert(/__\*\*Fixes\*\*__/.test(d), d);
      assert(
        /• \*\*Cards\.\*\* The back no longer breaks before the last wheel\./.test(d),
        'wrapped lines are joined: ' + d
      );
      assert(N.toDiscord('- ' + 'x '.repeat(3000), 500).length <= 500);
      assert(N.isMicro('0.2.0-alpha.3.1') && !N.isMicro('0.2.0-alpha.3') && !N.isMicro('1.0.0'));
      // the real changelog has notes for every tagged release, and the announcement uses them
      const real = N.load();
      assert(real.length >= 9 && N.find(real, '0.2.0-alpha.3'), 'CHANGELOG.md sections');
      const { message } = require('../scripts/discord-announce.js');
      const m = message('v0.2.0-alpha.3', [], N.find(real, '0.2.0-alpha.3').body);
      assert(/Story choices/.test(m.embeds[0].description) && m.embeds[0].description.length <= 4000);
      assert(/small update/.test(message('v0.2.0-alpha.3.1', [], 'x').embeds[0].title));
    }
  );

  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
