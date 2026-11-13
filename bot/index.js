// Destiny Unbound Discord bot: /spin rolls a random legend with the game's real wheels and shows its card.
// Needs DISCORD_TOKEN (the bot's token) in the environment. Run: node bot/index.js
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { roll, LUCKS } = require('./legend.js');

const TOKEN = process.env.DISCORD_TOKEN || '';
const PLAY = 'https://bzrkherja.itch.io/destiny-unbound';
const SPIN_CHANNEL = process.env.SPIN_CHANNEL || 'spin-the-wheel';   // if a server has a channel with this name, /spin only works there
const COLOURS = { Mortal: 0x8a8a8a, Heroic: 0xc8902c, Mythic: 0x8a5fd6, Divine: 0xf0d36a };
if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(TOKEN)) { console.error('Set DISCORD_TOKEN to the bot token (Developer Portal > Bot > Reset Token).'); process.exit(1); }

const command = new SlashCommandBuilder()
  .setName('spin')
  .setDescription('Spin the wheels of fate and forge a random legend')
  .addStringOption(o => o.setName('luck').setDescription('How kind fate is (default: Heroic)')
    .addChoices(...LUCKS.map(l => ({ name: l.name, value: l.id }))));

function card(L, who) {
  const pick = k => (L.lines.find(l => l.k === k) || {}).v || '-';
  const stats = ['STRENGTH', 'SPEED', 'DURABILITY', 'INTELLIGENCE', 'FIGHTING SKILLS'].map(k => `**${k[0] + k.slice(1).toLowerCase()}:** ${pick(k)}`).join('\n');
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
    await new REST({ version: '10' }).setToken(TOKEN).put(Routes.applicationCommands(client.user.id), { body: [command.toJSON()] });
    console.log(`Logged in as ${client.user.tag}; /spin is registered.`);
  } catch (e) { console.error('Could not register /spin: ' + e.message); }
});

const recent = new Map();   // a small per-user cooldown so one person can't flood a channel
client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand() || i.commandName !== 'spin') return;
  // in a server with a #spin-the-wheel channel, spins only happen there (admins included)
  const home = i.guild && i.guild.channels.cache.find(c => c.name === SPIN_CHANNEL && c.isTextBased());
  if (home && i.channelId !== home.id) return i.reply({ content: `Spins happen in <#${home.id}>. See you there!`, flags: MessageFlags.Ephemeral });
  const now = Date.now(), last = recent.get(i.user.id) || 0;
  if (now - last < 5000) return i.reply({ content: 'The wheels are still turning. Try again in a few seconds.', flags: MessageFlags.Ephemeral });
  recent.set(i.user.id, now);
  if (recent.size > 5000) recent.clear();
  try {
    const L = roll(i.options.getString('luck') || 'heroic');
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Play Destiny Unbound').setURL(PLAY));
    await i.reply({ embeds: [card(L, i.member && i.member.displayName || i.user.username)], components: [row], allowedMentions: { parse: [] } });
  } catch (e) {
    console.error(e);
    if (!i.replied) await i.reply({ content: 'Fate stumbled. Please try again.', flags: MessageFlags.Ephemeral }).catch(() => {});
  }
});

process.on('SIGTERM', () => { client.destroy(); process.exit(0); });
client.login(TOKEN);
