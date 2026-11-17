// Destiny Unbound Discord bot: /spin rolls a random legend with the game's real wheels and shows its card;
// /stats shows the world counter (heroes made and how sagas ended; see stats.js); /patchnotes shows what changed in a
// release, read from CHANGELOG.md (patchnotes.js). What each command does is in handler.js, what it shows in
// embeds.js; this file only connects them to Discord.
// Needs DISCORD_TOKEN (the bot's token) in the environment. Run: node bot/index.js
// Optional: ALERT_CHANNEL_ID, a channel id for a warning when the world counter's traffic jumps (checked hourly).
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { roll, LUCKS } = require('./legend.js');
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

const commands = [
  new SlashCommandBuilder()
    .setName('spin')
    .setDescription('Spin the wheels of fate and forge a random legend')
    .addStringOption(o =>
      o
        .setName('luck')
        .setDescription('How kind fate is (default: Heroic)')
        .addChoices(...LUCKS.map(l => ({ name: l.name, value: l.id })))
    ),
  new SlashCommandBuilder().setName('stats').setDescription('How many heroes fate has made, and how their sagas ended'),
  new SlashCommandBuilder()
    .setName('patchnotes')
    .setDescription("What's new in Destiny Unbound")
    .addStringOption(o =>
      o.setName('version').setDescription('A version, like 0.2.0-alpha.3 (default: the newest)').setAutocomplete(true)
    ),
];

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

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  try {
    await new REST({ version: '10' }).setToken(TOKEN).put(Routes.applicationCommands(client.user.id), {
      body: commands.map(c => c.toJSON()),
    });
    console.log(`Logged in as ${client.user.tag}; /spin, /stats and /patchnotes are registered.`);
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

client.on('interactionCreate', createHandler({ roll, store, totals, notes, spinChannel: SPIN_CHANNEL }));

if (process.env.STATS_PORT) startServer(store, +process.env.STATS_PORT, process.env.STATS_HOST);
process.on('SIGTERM', () => {
  store.flush();
  client.destroy();
  process.exit(0);
});
client.login(TOKEN);
