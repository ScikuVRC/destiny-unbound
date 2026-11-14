// Destiny Unbound Discord bot: /spin rolls a random legend with the game's real wheels and shows its card;
// /stats shows the world counter (heroes made and how sagas ended; see stats.js); /patchnotes shows what changed in a
// release, read from CHANGELOG.md (patchnotes.js).
// Needs DISCORD_TOKEN (the bot's token) in the environment. Run: node bot/index.js
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const { roll, LUCKS } = require('./legend.js');
const { createStore, startServer } = require('./stats.js');
const notes = require('./patchnotes.js');

const TOKEN = process.env.DISCORD_TOKEN || '';
const PLAY = 'https://bzrkherja.itch.io/destiny-unbound';
const SPIN_CHANNEL = process.env.SPIN_CHANNEL || 'spin-the-wheel'; // if a server has a channel with this name, /spin only works there
// the world counter: kept in STATS_FILE; its HTTP side listens on STATS_PORT (local only unless STATS_HOST says otherwise)
const WORLD_URL = (process.env.WORLD_URL || '').replace(/\/+$/, '');
const store = createStore(process.env.STATS_FILE || require('path').join(__dirname, 'data', 'stats.json'));
const END_LABEL = {
  dead: '🪦 Died',
  retired: '🌅 Retired',
  ascended: '✨ Ascended',
  lost: '🌀 Lost between worlds',
  martyr: '🕊️ Died a hero',
  sealed: '🗝️ Sealed away',
  damned: '🔥 Taken by the demon',
  fulfilled: '📜 Prophecy fulfilled',
  undying: '💀 Risen undead',
  legend: '🌟 Passed into legend',
};
const COLOURS = { Mortal: 0x8a8a8a, Heroic: 0xc8902c, Mythic: 0x8a5fd6, Divine: 0xf0d36a };
if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(TOKEN)) {
  console.error('Set DISCORD_TOKEN to the bot token (Developer Portal > Bot > Reset Token).');
  process.exit(1);
}

const command = new SlashCommandBuilder()
  .setName('spin')
  .setDescription('Spin the wheels of fate and forge a random legend')
  .addStringOption(o =>
    o
      .setName('luck')
      .setDescription('How kind fate is (default: Heroic)')
      .addChoices(...LUCKS.map(l => ({ name: l.name, value: l.id })))
  );
const statsCommand = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('How many heroes fate has made, and how their sagas ended');
const notesCommand = new SlashCommandBuilder()
  .setName('patchnotes')
  .setDescription("What's new in Destiny Unbound")
  .addStringOption(o =>
    o.setName('version').setDescription('A version, like 0.2.0-alpha.3 (default: the newest)').setAutocomplete(true)
  );

function notesCard(version) {
  const list = notes.load(),
    s = notes.find(list, version);
  if (!s) return null;
  return new EmbedBuilder()
    .setColor(0xc8902c)
    .setTitle(`Destiny Unbound ${s.version}${notes.isMicro(s.version) ? ' · small update' : ''}`)
    .setURL(notes.releaseUrl(s.version))
    .setDescription(notes.toDiscord(s.body) || 'No notes for this version.')
    .setFooter({ text: (s.date ? s.date + ' · ' : '') + 'Full notes and downloads: the title link' });
}

// the game's totals live on the world counter (worker/, WORLD_URL); /spin counts are kept here on the bot server
async function worldTotals() {
  const local = store.totals();
  if (!WORLD_URL) return local;
  try {
    const r = await fetch(WORLD_URL + '/v1/totals', { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const w = await r.json();
    return {
      heroes: w.heroes || 0,
      sagas: w.sagas || 0,
      deaths: w.deaths || 0,
      endings: w.endings || {},
      since: w.since || local.since,
      discordSpins: local.discordSpins,
    };
  } catch (e) {
    console.error('World counter unreachable: ' + e.message);
    return Object.assign(local, { offline: true });
  }
}
async function statsCard() {
  const w = await worldTotals(),
    n = v => (v || 0).toLocaleString('en-US');
  const ends = Object.keys(END_LABEL)
    .filter(k => w.endings[k])
    .sort((a, b) => w.endings[b] - w.endings[a])
    .map(k => `${END_LABEL[k]}: **${n(w.endings[k])}**`);
  return new EmbedBuilder()
    .setColor(0xc8902c)
    .setTitle('The wheels of fate so far')
    .addFields(
      { name: 'Heroes made in the game', value: n(w.heroes), inline: true },
      { name: 'Heroes spun here', value: n(w.discordSpins), inline: true },
      { name: 'Sagas ended', value: `${n(w.sagas)} (${n(w.deaths)} died)`, inline: true },
      { name: 'How the sagas ended', value: ends.length ? ends.join('\n') : 'No saga has ended yet.' }
    )
    .setFooter({
      text:
        (w.offline ? 'Game totals are unreachable right now · ' : '') +
        `Counting since ${w.since} · players choose to share in Options > Data`,
    });
}

function card(L, who) {
  const pick = k => (L.lines.find(l => l.k === k) || {}).v || '-';
  const stats = ['STRENGTH', 'SPEED', 'DURABILITY', 'INTELLIGENCE', 'FIGHTING SKILLS']
    .map(k => `**${k[0] + k.slice(1).toLowerCase()}:** ${pick(k)}`)
    .join('\n');
  const e = new EmbedBuilder()
    .setColor(COLOURS[L.luck] || 0xc8902c)
    .setAuthor({ name: `${who} spun the wheels of fate · ${L.luck} luck` })
    .setTitle(`${L.title}, ${L.race}`)
    .setDescription(`**${L.rank}** · power rating **${L.rating}**`)
    .addFields(
      { name: 'Class', value: pick('CLASS'), inline: true },
      { name: 'Age', value: pick('AGE'), inline: true },
      { name: 'Height', value: pick('HEIGHT'), inline: true },
      { name: 'Weapon', value: pick('WEAPON'), inline: true },
      { name: 'Power', value: pick('POWER'), inline: true },
      { name: 'Weakness', value: pick('WEAKNESS'), inline: true },
      { name: 'Stats', value: stats }
    )
    .setFooter({ text: 'Destiny Unbound · free and open source' });
  return e;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  try {
    await new REST({ version: '10' }).setToken(TOKEN).put(Routes.applicationCommands(client.user.id), {
      body: [command.toJSON(), statsCommand.toJSON(), notesCommand.toJSON()],
    });
    console.log(`Logged in as ${client.user.tag}; /spin, /stats and /patchnotes are registered.`);
  } catch (e) {
    console.error('Could not register the commands: ' + e.message);
  }
});

const recent = new Map(); // a small per-user cooldown so one person can't flood a channel
client.on('interactionCreate', async i => {
  if (i.isAutocomplete() && i.commandName === 'patchnotes') {
    const typed = String(i.options.getFocused() || '').toLowerCase();
    const choices = notes
      .load()
      .map(s => s.version)
      .filter(v => v.toLowerCase().includes(typed))
      .slice(0, 25)
      .map(v => ({ name: v, value: v }));
    return i.respond(choices).catch(() => {});
  }
  if (!i.isChatInputCommand()) return;
  if (i.commandName === 'patchnotes') {
    const v = i.options.getString('version');
    const e = notesCard(v);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Play Destiny Unbound').setURL(PLAY)
    );
    return i
      .reply(
        e
          ? { embeds: [e], components: [row], allowedMentions: { parse: [] } }
          : { content: `There are no notes for version ${v}.`, flags: MessageFlags.Ephemeral }
      )
      .catch(err => console.error(err));
  }
  if (i.commandName === 'stats') {
    try {
      await i.deferReply();
      await i.editReply({ embeds: [await statsCard()], allowedMentions: { parse: [] } });
    } catch (e) {
      console.error(e);
    }
    return;
  }
  if (i.commandName !== 'spin') return;
  // in a server with a #spin-the-wheel channel, spins only happen there (admins included)
  const home = i.guild && i.guild.channels.cache.find(c => c.name === SPIN_CHANNEL && c.isTextBased());
  if (home && i.channelId !== home.id)
    return i.reply({ content: `Spins happen in <#${home.id}>. See you there!`, flags: MessageFlags.Ephemeral });
  const now = Date.now(),
    last = recent.get(i.user.id) || 0;
  if (now - last < 5000)
    return i.reply({
      content: 'The wheels are still turning. Try again in a few seconds.',
      flags: MessageFlags.Ephemeral,
    });
  recent.set(i.user.id, now);
  if (recent.size > 5000) recent.clear();
  try {
    const L = roll(i.options.getString('luck') || 'heroic');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Play Destiny Unbound').setURL(PLAY)
    );
    await i.reply({
      embeds: [card(L, (i.member && i.member.displayName) || i.user.username)],
      components: [row],
      allowedMentions: { parse: [] },
    });
    store.spin();
  } catch (e) {
    console.error(e);
    if (!i.replied)
      await i.reply({ content: 'Fate stumbled. Please try again.', flags: MessageFlags.Ephemeral }).catch(() => {});
  }
});

if (process.env.STATS_PORT) startServer(store, +process.env.STATS_PORT, process.env.STATS_HOST);
process.on('SIGTERM', () => {
  store.flush();
  client.destroy();
  process.exit(0);
});
client.login(TOKEN);
