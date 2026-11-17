// Destiny Unbound Discord bot: /spin rolls a random legend with the game's real wheels and shows its card;
// /stats shows the world counter (heroes made and how sagas ended; see stats.js); /patchnotes shows what changed in a
// release, read from CHANGELOG.md (patchnotes.js); /daily shows today's daily-challenge leaderboard; /legend shows a
// hero from a card code; /versus lets two heroes fight with the game's Versus odds. What each command does is in handler.js, what it shows in
// embeds.js; this file only connects them to Discord.
// Needs DISCORD_TOKEN (the bot's token) in the environment. Run: node bot/index.js
// Optional: ALERT_CHANNEL_ID, a channel id for a warning when the world counter's traffic jumps (checked hourly).
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { buildCommands } = require('./commands.js');
const { roll, LUCKS, readLegend, describe, spinLegend, versus } = require('./legend.js');
const { createStore, startServer } = require('./stats.js');
const notes = require('./patchnotes.js');
const { mergeTotals } = require('./embeds.js');
const { createHandler, checkHealth } = require('./handler.js');

const TOKEN = process.env.DISCORD_TOKEN || '';
const SPIN_CHANNEL = process.env.SPIN_CHANNEL || 'spin-the-wheel'; // if a server has a channel with this name, /spin only works there
const ALERT_CHANNEL = process.env.ALERT_CHANNEL_ID || '';
// the world counter: kept in STATS_FILE; its HTTP side listens on STATS_PORT (local only unless STATS_HOST says otherwise)
const WORLD_URL = (process.env.WORLD_URL || '').replace(/\/+$/, '');
const store = createStore(process.env.STATS_FILE || require('path').join(__dirname, 'data', 'stats.json'));
if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(TOKEN)) {
  console.error('Set DISCORD_TOKEN to the bot token (Developer Portal > Bot > Reset Token).');
  process.exit(1);
}

const commands = buildCommands(LUCKS);

// the game's totals live on the world counter (worker/, WORLD_URL); /spin counts are kept here on the bot server
async function totals() {
  const local = store.totals();
  if (!WORLD_URL) return local;
  try {
    const r = await fetch(WORLD_URL + '/v1/totals', { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return mergeTotals(local, await r.json());
  } catch (e) {
    console.error('World counter unreachable: ' + e.message);
    return mergeTotals(local, null);
  }
}

// short card codes and the daily leaderboard live on the world counter too
async function fetchCode(id) {
  if (!WORLD_URL) throw new Error('short card codes need the world counter');
  const r = await fetch(WORLD_URL + '/v1/card/' + encodeURIComponent(id), { signal: AbortSignal.timeout(2500) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.code) throw new Error(j.error || 'no card with that code');
  return j.code;
}
async function daily() {
  try {
    const r = await fetch(WORLD_URL + '/v1/daily', { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) {
    console.error('Daily leaderboard unreachable: ' + e.message);
    return null;
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', async () => {
  try {
    await new REST({ version: '10' }).setToken(TOKEN).put(Routes.applicationCommands(client.user.id), {
      body: commands.map(c => c.toJSON()),
    });
    console.log(`Logged in as ${client.user.tag}; ${commands.map(c => '/' + c.name).join(', ')} are registered.`);
  } catch (e) {
    console.error('Could not register the commands: ' + e.message);
  }
  if (ALERT_CHANNEL && WORLD_URL) {
    const state = {};
    const tick = async () => {
      try {
        const msg = await checkHealth({ url: WORLD_URL, state });
        if (msg)
          await (await client.channels.fetch(ALERT_CHANNEL)).send({ content: msg, allowedMentions: { parse: [] } });
      } catch (e) {
        console.error('Traffic check failed: ' + e.message);
      }
    };
    tick();
    setInterval(tick, 60 * 60 * 1000).unref();
  }
});

client.on(
  'interactionCreate',
  createHandler({
    roll,
    store,
    totals,
    notes,
    spinChannel: SPIN_CHANNEL,
    daily: WORLD_URL ? daily : null,
    fetchCode: WORLD_URL ? fetchCode : null,
    readLegend,
    describe,
    spinLegend,
    versus,
  })
);

if (process.env.STATS_PORT) startServer(store, +process.env.STATS_PORT, process.env.STATS_HOST);
process.on('SIGTERM', () => {
  store.flush();
  client.destroy();
  process.exit(0);
});
client.login(TOKEN);
