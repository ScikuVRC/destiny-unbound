// The slash commands: what the bot does with each interaction. Everything it needs is passed in, so
// tests/bot.test.js can drive it with stand-in interactions instead of a live Discord connection.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { notesCard, statsCard, legendCard } = require('./embeds.js');

const PLAY = 'https://bzrkherja.itch.io/destiny-unbound';
const COOLDOWN = 5000; // one /spin per person per 5 seconds, so nobody floods a channel
const playButton = () =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Play Destiny Unbound').setURL(PLAY)
  );

// deps: { roll(luck), store: { spin() }, totals: async () => world totals, notes: patchnotes module,
//         spinChannel: name, now: () => ms, log: errors go here }
function createHandler(deps) {
  const { roll, store, totals, notes, spinChannel = 'spin-the-wheel', now = Date.now, log = console.error } = deps;
  const recent = new Map();
  return async function handle(i) {
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
      const e = notesCard(v, notes.load());
      return i
        .reply(
          e
            ? { embeds: [e], components: [playButton()], allowedMentions: { parse: [] } }
            : { content: `There are no notes for version ${v}.`, flags: MessageFlags.Ephemeral }
        )
        .catch(log);
    }
    if (i.commandName === 'stats') {
      try {
        await i.deferReply();
        await i.editReply({ embeds: [statsCard(await totals())], allowedMentions: { parse: [] } });
      } catch (e) {
        log(e);
      }
      return;
    }
    if (i.commandName !== 'spin') return;
    // in a server with a #spin-the-wheel channel, spins only happen there (admins included)
    const home = i.guild && i.guild.channels.cache.find(c => c.name === spinChannel && c.isTextBased());
    if (home && i.channelId !== home.id)
      return i.reply({ content: `Spins happen in <#${home.id}>. See you there!`, flags: MessageFlags.Ephemeral });
    const t = now(),
      last = recent.get(i.user.id) || 0;
    if (t - last < COOLDOWN)
      return i.reply({
        content: 'The wheels are still turning. Try again in a few seconds.',
        flags: MessageFlags.Ephemeral,
      });
    recent.set(i.user.id, t);
    if (recent.size > 5000) recent.clear();
    try {
      const L = roll(i.options.getString('luck') || 'heroic');
      await i.reply({
        embeds: [legendCard(L, (i.member && i.member.displayName) || i.user.username)],
        components: [playButton()],
        allowedMentions: { parse: [] },
      });
      store.spin();
    } catch (e) {
      log(e);
      if (!i.replied)
        await i.reply({ content: 'Fate stumbled. Please try again.', flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  };
}

// The traffic alert (off unless ALERT_CHANNEL_ID is set): reads the world counter's /v1/health and returns the
// message to post when writes jumped today, once per day. Returns null when there is nothing to say.
async function checkHealth({ url, fetchFn = fetch, state, now = Date.now }) {
  const r = await fetchFn(url + '/v1/health', { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const h = await r.json();
  const day = new Date(now()).toISOString().slice(0, 10);
  if (!h.jump || state.warned === day) return null;
  state.warned = day;
  return (
    '⚠️ **World counter traffic jump.** ' +
    h.note +
    ` Writes stopped by the daily cap: ${(h.today && h.today.capped) || 0}. Details: ${url}/v1/health`
  );
}

module.exports = { createHandler, checkHealth, PLAY, COOLDOWN };
