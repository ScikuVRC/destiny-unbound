/* Tests for the Discord bot's commands: stand-in interactions go through bot/handler.js, and the cards from
   bot/embeds.js are checked as Discord would get them. No Discord connection is made.
   Needs the bot's packages: npm ci --prefix bot.  Run: node tests/bot.test.js */
const assert = require('assert');
let deps;
try {
  deps = require('../bot/handler.js');
} catch (e) {
  console.log('Skipped: the bot packages are not installed (npm ci --prefix bot).');
  process.exit(process.env.CI ? 1 : 0);
}
const { createHandler, checkHealth, COOLDOWN } = deps;
const E = require('../bot/embeds.js');
const { roll } = require('../bot/legend.js');
const LG = require('../bot/legend.js');
const { buildCommands } = require('../bot/commands.js');
// a hero with a finished saga, as a Legend Code (what a short card code stands for)
const SAGA_HERO = (() => {
  const L = LG.spinLegend('heroic', 'bot-saga'),
    S = LG.FW.Story,
    rng = LG.FW.makeRng('bot-saga:story'),
    o = {};
  S.OPTIONS.forEach(x => (o[x.id] = x.def !== false));
  S.newSaga(L, o, rng);
  return { L, o, rng };
})();
let SAGA_CODE = '';
const DAILY = {
  day: '2026-11-17',
  players: 3,
  top: [
    { name: 'The Ashen One', race: 'Elf', score: 140, ending: 'legend', ch: 14 },
    { name: 'A nameless hero', race: 'Orc', score: 90, ending: 'dead', ch: 6 },
  ],
};
const notes = require('../bot/patchnotes.js');
const { MessageFlags } = require(
  require.resolve('discord.js', { paths: [require('path').join(__dirname, '..', 'bot')] })
);

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
      '  FAIL ' +
        name +
        '\n       ' +
        String((e && e.stack) || e)
          .split('\n')
          .slice(0, 3)
          .join('\n       ')
    );
  }
}

// a stand-in for a Discord interaction: records what the bot answers
function fake(command, opts = {}, extra = {}) {
  const out = { replies: [], edits: [], deferred: false, choices: null };
  const i = {
    commandName: command,
    user: { id: extra.user || 'u1', username: 'Ana' },
    member: extra.member === undefined ? { displayName: 'Ana the Bold' } : extra.member,
    guild: extra.guild || null,
    channelId: extra.channelId || 'c1',
    replied: false,
    isAutocomplete: () => !!extra.autocomplete,
    isChatInputCommand: () => !extra.autocomplete,
    options: { getString: k => (k in opts ? opts[k] : null), getFocused: () => extra.focused || '' },
    reply: async r => {
      i.replied = true;
      out.replies.push(r);
    },
    deferReply: async () => (out.deferred = true),
    editReply: async r => out.edits.push(r),
    respond: async c => (out.choices = c),
  };
  return { i, out };
}
const guild = (...names) => ({
  channels: { cache: { find: f => names.map((n, k) => ({ id: 'ch' + k, name: n, isTextBased: () => true })).find(f) } },
});
const json = e => e.toJSON();

(async () => {
  const spins = [];
  let clock = 1e6;
  const errors = [];
  const make = over =>
    createHandler({
      roll: luck => roll(luck, 'test-' + luck),
      store: { spin: () => spins.push(1) },
      totals: async () => ({
        heroes: 12,
        sagas: 5,
        deaths: 2,
        endings: { dead: 2, legend: 3 },
        since: '2026-11-13',
        discordSpins: 4,
      }),
      notes,
      now: () => clock,
      log: e => errors.push(e),
      daily: async () => DAILY,
      fetchCode: async id => {
        if (id !== 'DU-ABC123') throw new Error('no card with that code');
        return SAGA_CODE;
      },
      readLegend: LG.readLegend,
      describe: LG.describe,
      spinLegend: (luck, seed) => LG.spinLegend(luck, seed || 'test-vs-' + Math.random()),
      versus: LG.versus,
      ...over,
    });

  await t('/spin answers with a legend card and a Play button, and counts the spin', async () => {
    const h = make();
    const { i, out } = fake('spin', { luck: 'mythic' });
    await h(i);
    assert.strictEqual(out.replies.length, 1);
    const r = out.replies[0],
      e = json(r.embeds[0]);
    assert(/Ana the Bold spun the wheels of fate · Mythic luck/.test(e.author.name), e.author.name);
    assert.strictEqual(e.color, E.COLOURS.Mythic);
    assert(
      e.fields.some(f => f.name === 'Class' && f.value !== '-'),
      'the class is filled in'
    );
    assert(/\*\*Strength:\*\*/.test(e.fields.find(f => f.name === 'Stats').value));
    assert.deepStrictEqual(r.allowedMentions, { parse: [] }, 'a hero name can never ping anyone');
    assert.strictEqual(r.components[0].toJSON().components[0].url, 'https://bzrkherja.itch.io/destiny-unbound');
    assert.strictEqual(spins.length, 1);
  });

  await t('/spin has a cooldown per person, and another person is not held back', async () => {
    const h = make();
    const a = fake('spin'),
      b = fake('spin'),
      c = fake('spin', {}, { user: 'u2' });
    await h(a.i);
    clock += COOLDOWN - 1;
    await h(b.i);
    await h(c.i);
    assert.strictEqual(b.out.replies[0].flags, MessageFlags.Ephemeral);
    assert(/still turning/.test(b.out.replies[0].content));
    assert(c.out.replies[0].embeds, 'someone else can spin');
    clock += 2;
    const d = fake('spin');
    await h(d.i);
    assert(d.out.replies[0].embeds, 'after the cooldown the first person can spin again');
  });

  await t('/spin points to #spin-the-wheel when a server has one, and works anywhere when it has not', async () => {
    const h = make();
    const away = fake('spin', {}, { guild: guild('general', 'spin-the-wheel'), channelId: 'ch0', user: 'u3' });
    await h(away.i);
    assert(/Spins happen in <#ch1>/.test(away.out.replies[0].content));
    assert.strictEqual(away.out.replies[0].flags, MessageFlags.Ephemeral);
    const there = fake('spin', {}, { guild: guild('general', 'spin-the-wheel'), channelId: 'ch1', user: 'u4' });
    await h(there.i);
    assert(there.out.replies[0].embeds);
    const none = fake('spin', {}, { guild: guild('general'), user: 'u5', member: null });
    await h(none.i);
    assert(/^Ana spun/.test(json(none.out.replies[0].embeds[0]).author.name), 'falls back to the user name');
  });

  await t('/spin says sorry instead of crashing when a roll fails', async () => {
    const h = make({
      roll: () => {
        throw new Error('boom');
      },
    });
    const { i, out } = fake('spin', {}, { user: 'u6' });
    await h(i);
    assert(/Fate stumbled/.test(out.replies[0].content) && errors.length);
  });

  await t('/stats shows the totals, sorted endings, and says so when the counter is down', async () => {
    const h = make();
    const { i, out } = fake('stats');
    await h(i);
    assert(out.deferred, 'deferred first, because the counter is on the network');
    const e = json(out.edits[0].embeds[0]);
    assert.strictEqual(e.fields[0].value, '12');
    assert.strictEqual(e.fields[2].value, '5 (2 died)');
    assert(/^🌟 Passed into legend: \*\*3\*\*\n🪦 Died: \*\*2\*\*$/.test(e.fields[3].value), e.fields[3].value);
    const down = E.statsCard(
      E.mergeTotals({ heroes: 0, sagas: 0, deaths: 0, endings: {}, since: 'x', discordSpins: 9 }, null)
    );
    const d = json(down);
    assert(/unreachable/.test(d.footer.text) && d.fields[1].value === '9' && /No saga/.test(d.fields[3].value));
  });

  await t('/stats keeps the /spin count from the bot server when the world counter answers', () => {
    const m = E.mergeTotals({ discordSpins: 7, since: 'a' }, { heroes: 3, sagas: 1, endings: { dead: 1 }, deaths: 1 });
    assert.deepStrictEqual(m, { heroes: 3, sagas: 1, deaths: 1, endings: { dead: 1 }, since: 'a', discordSpins: 7 });
  });

  await t('/patchnotes shows the newest notes, a chosen version, and a quiet answer for an unknown one', async () => {
    const h = make();
    const newest = notes.load()[0].version;
    const a = fake('patchnotes');
    await h(a.i);
    assert(json(a.out.replies[0].embeds[0]).title.includes(newest));
    const b = fake('patchnotes', { version: '0.2.0-alpha.3' });
    await h(b.i);
    assert(json(b.out.replies[0].embeds[0]).title.startsWith('Destiny Unbound 0.2.0-alpha.3'));
    const c = fake('patchnotes', { version: '9.9.9' });
    await h(c.i);
    assert(/no notes for version 9\.9\.9/.test(c.out.replies[0].content));
    assert.strictEqual(c.out.replies[0].flags, MessageFlags.Ephemeral);
  });

  await t('/patchnotes autocomplete offers at most 25 matching versions', async () => {
    const h = make();
    const a = fake('patchnotes', {}, { autocomplete: true, focused: 'alpha.4' });
    await h(a.i);
    assert(a.out.choices.length > 0 && a.out.choices.length <= 25);
    assert(a.out.choices.every(c => c.name.includes('alpha.4') && c.value === c.name));
  });

  // finish the sample hero's saga (story turns are async)
  {
    const { L, o, rng } = SAGA_HERO,
      io = { rng, spin: async c => LG.FW.weightedIndex(c.entries, rng) };
    while (!L.saga.end) await LG.FW.Story.playTurn(L, io, o);
    SAGA_CODE = L.toCode();
  }

  await t('every command is a valid Discord command, and the bot registers all six', () => {
    const list = buildCommands(LG.LUCKS).map(c => c.toJSON());
    assert.deepStrictEqual(
      list.map(c => c.name),
      ['spin', 'stats', 'patchnotes', 'daily', 'legend', 'versus']
    );
    list.forEach(c => assert(c.description.length > 0 && c.description.length <= 100, c.name));
    assert(list.find(c => c.name === 'legend').options[0].required, '/legend needs a code');
  });

  await t('/legend shows a hero from a short card code, with its saga and epilogue', async () => {
    const h = make();
    const { i, out } = fake('legend', { code: 'du-abc123' }, { user: 'L1' });
    await h(i);
    const e = json(out.replies[0].embeds[0]);
    assert.strictEqual(e.title, SAGA_HERO.L.displayName() + ', ' + SAGA_HERO.L.raceName());
    assert(/Ana the Bold shared a legend · Heroic luck/.test(e.author.name), e.author.name);
    assert(
      e.fields.some(f => f.name === 'Saga' && /chapter/.test(f.value)),
      'saga line'
    );
    assert(
      e.fields.some(f => f.name === 'Epilogue' && f.value.length > 20),
      'epilogue'
    );
    assert.deepStrictEqual(out.replies[0].allowedMentions, { parse: [] });
  });

  await t('/legend reads a full code too, and answers quietly for a bad or unknown one', async () => {
    const h = make();
    const full = fake('legend', { code: LG.spinLegend('mythic', 'full').toCode() }, { user: 'L2' });
    await h(full.i);
    assert(/Mythic luck/.test(json(full.out.replies[0].embeds[0]).author.name));
    for (const [code, user] of [
      ['hello there', 'L3'],
      ['DU-ZZZZZZ', 'L4'],
      ['FW1.broken', 'L5'],
    ]) {
      const x = fake('legend', { code }, { user });
      await h(x.i);
      assert.strictEqual(x.out.replies[0].flags, MessageFlags.Ephemeral, code);
      assert(/not a Legend Code I can read/.test(x.out.replies[0].content), code);
    }
    const none = fake('legend', { code: 'DU-ABC123' }, { user: 'L6' });
    await make({ fetchCode: null })(none.i);
    assert(/need the world counter/.test(none.out.replies[0].content), 'no world counter configured');
  });

  await t('/versus: two card codes, or heroes spun on the spot, fight with the game odds', async () => {
    const h = make();
    const a = fake('versus', { fighter1: 'DU-ABC123' }, { user: 'V1' });
    await h(a.i);
    const e = json(a.out.replies[0].embeds[0]);
    assert(/wins$|draw$/.test(e.title), e.title);
    assert(/^At the .+\. The odds were \d+% \/ 5% draw \/ \d+%\.$/.test(e.description), e.description);
    assert(e.fields[0].value.indexOf(SAGA_HERO.L.displayName()) >= 0, 'fighter one is the card');
    assert(/spun now/.test(e.fields[1].name), 'fighter two was spun');
    // the odds are the game's own
    const A = SAGA_HERO.L,
      B = LG.spinLegend('heroic', 'vs-b'),
      r = LG.versus(A, B, 'fixed');
    const o = LG.FW.versusOdds(
      A,
      B,
      LG.FW.ARENAS.find(x => x.name === r.arena)
    );
    assert.strictEqual(r.pA, o.pA);
    assert(Math.abs(r.pA + r.pDraw + r.pB - 1) < 1e-9);
    // a bad code, the channel rule and the cooldown
    const bad = fake('versus', { fighter2: 'not a code' }, { user: 'V2' });
    await h(bad.i);
    assert(/Could not read a fighter/.test(bad.out.replies[0].content));
    const away = fake('versus', {}, { guild: guild('general', 'spin-the-wheel'), channelId: 'ch0', user: 'V3' });
    await h(away.i);
    assert(/Versus fights happen in <#ch1>/.test(away.out.replies[0].content));
    const again = fake('versus', {}, { user: 'V1' });
    await h(again.i);
    assert(/still turning/.test(again.out.replies[0].content), 'cooldown');
  });

  await t("/daily shows today's leaderboard, an empty day, and says so when it is unreachable", async () => {
    const h = make();
    const a = fake('daily');
    await h(a.i);
    const e = json(a.out.edits[0].embeds[0]);
    assert.strictEqual(e.title, 'Daily challenge · 2026-11-17');
    assert(/\*\*1\.\*\* The Ashen One \(Elf\) · \*\*140\*\* · 🌟 Passed into legend · 14 ch\./.test(e.description));
    assert(/^3 players today/.test(e.footer.text));
    const empty = fake('daily');
    await make({ daily: async () => ({ day: '2026-11-18', players: 0, top: [] }) })(empty.i);
    assert(/Nobody has posted a score today/.test(json(empty.out.edits[0].embeds[0]).description));
    const down = fake('daily');
    await make({ daily: async () => null })(down.i);
    assert(/not reachable/.test(down.out.edits[0].content));
    const off = fake('daily');
    await make({ daily: null })(off.i);
    assert(/not set up/.test(off.out.replies[0].content));
  });

  await t('other commands and interactions are ignored', async () => {
    const h = make();
    const a = fake('nope');
    await h(a.i);
    assert.strictEqual(a.out.replies.length, 0);
  });

  await t('the traffic alert speaks once a day, only when the counter says traffic jumped', async () => {
    let body = { jump: false, note: 'Normal.', today: { capped: 0 } };
    const fetchFn = async () => ({ ok: true, json: async () => body });
    const state = {},
      now = () => Date.parse('2026-11-16T10:00:00Z');
    assert.strictEqual(await checkHealth({ url: 'https://w', fetchFn, state, now }), null);
    body = { jump: true, note: 'Writes today (900) are over 5x the week average (40).', today: { capped: 12 } };
    const msg = await checkHealth({ url: 'https://w', fetchFn, state, now });
    assert(/traffic jump/.test(msg) && /900/.test(msg) && /12/.test(msg) && /https:\/\/w\/v1\/health/.test(msg), msg);
    assert.strictEqual(await checkHealth({ url: 'https://w', fetchFn, state, now }), null, 'not twice the same day');
    const next = () => Date.parse('2026-11-17T10:00:00Z');
    assert(await checkHealth({ url: 'https://w', fetchFn, state, now: next }), 'again the next day');
    await assert.rejects(checkHealth({ url: 'https://w', fetchFn: async () => ({ ok: false, status: 500 }), state }));
  });

  console.log('\n' + pass + ' of ' + (pass + fail) + ' checks passed');
  process.exit(fail ? 1 : 0);
})();
