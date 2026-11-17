// The slash commands: what the bot does with each interaction. Everything it needs is passed in, so
// tests/bot.test.js can drive it with stand-in interactions instead of a live Discord connection.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { notesCard, statsCard, legendCard, dailyCard, versusCard } = require('./embeds.js');

const PLAY = 'https://bzrkherja.itch.io/destiny-unbound';
const COOLDOWN = 5000; // one /spin, /legend or /versus per person per 5 seconds, so nobody floods a channel
const playButton = () =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Play Destiny Unbound').setURL(PLAY)
  );

// deps: { roll(luck), store: { spin() }, totals: async () => world totals, notes: patchnotes module,
//         daily: async () => today's leaderboard or null, fetchCode: async (short code) => full Legend Code,
//         readLegend, describe, spinLegend, versus (legend.js), spinChannel: name, now: () => ms, log }
function createHandler(deps) {
  const { roll, store, totals, notes, spinChannel = 'spin-the-wheel', now = Date.now, log = console.error } = deps;
  const { daily, fetchCode, readLegend, describe, spinLegend, versus } = deps;
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
    const who = (i.member && i.member.displayName) || i.user.username;
    const quiet = content => i.reply({ content, flags: MessageFlags.Ephemeral }).catch(log);
    // a short cooldown per person and command, so nobody floods a channel
    const cooling = () => {
      const k = i.user.id + ':' + i.commandName,
        t = now();
      if (t - (recent.get(k) || 0) < COOLDOWN) return true;
      recent.set(k, t);
      if (recent.size > 5000) recent.clear();
      return false;
    };
    const BUSY = 'The wheels are still turning. Try again in a few seconds.';
    // in a server with a #spin-the-wheel channel, spins (and versus, which spins heroes too) only happen there
    const awayFromHome = () => {
      const home = i.guild && i.guild.channels.cache.find(c => c.name === spinChannel && c.isTextBased());
      return home && i.channelId !== home.id ? home : null;
    };

    if (i.commandName === 'daily') {
      if (!daily) return quiet('The daily leaderboard is not set up for this bot.');
      try {
        await i.deferReply();
        const d = await daily();
        await i.editReply(
          d
            ? { embeds: [dailyCard(d)], components: [playButton()], allowedMentions: { parse: [] } }
            : { content: 'The daily leaderboard is not reachable right now. Try again later.' }
        );
      } catch (e) {
        log(e);
      }
      return;
    }

    if (i.commandName === 'legend') {
      if (cooling()) return quiet(BUSY);
      let L;
      try {
        L = await readLegend(i.options.getString('code'), fetchCode);
      } catch (e) {
        return quiet(
          'That is not a Legend Code I can read (' +
            (e.message || e) +
            '). Paste a short card code like DU-7K3QXM (Share > Get a card code in the game) or a full code.'
        );
      }
      const d = describe(L);
      return i
        .reply({
          embeds: [legendCard(d, who, `${who} shared a legend · ${d.luck} luck`)],
          components: [playButton()],
          allowedMentions: { parse: [] },
        })
        .catch(log);
    }

    if (i.commandName === 'versus') {
      const home = awayFromHome();
      if (home) return quiet(`Versus fights happen in <#${home.id}>. See you there!`);
      if (cooling()) return quiet(BUSY);
      const luck = i.options.getString('luck') || 'heroic';
      const fighter = async opt => {
        const code = i.options.getString(opt);
        if (!code) return Object.assign(describeL(spinLegend(luck)), { random: true });
        return describeL(await readLegend(code, fetchCode));
      };
      // keep the Legend objects for the odds, the descriptions for the card
      const objs = [];
      const describeL = L => (objs.push(L), describe(L));
      let a, b;
      try {
        a = await fighter('fighter1');
        b = await fighter('fighter2');
      } catch (e) {
        return quiet('Could not read a fighter: ' + (e.message || e) + '. Use short card codes like DU-7K3QXM.');
      }
      if (a.title === b.title) b.title += ' (2)';
      const r = versus(objs[0], objs[1]);
      return i
        .reply({ embeds: [versusCard(a, b, r)], components: [playButton()], allowedMentions: { parse: [] } })
        .catch(log);
    }

    if (i.commandName !== 'spin') return;
    const home = awayFromHome();
    if (home)
      return i.reply({ content: `Spins happen in <#${home.id}>. See you there!`, flags: MessageFlags.Ephemeral });
    if (cooling())
      return i.reply({
        content: BUSY,
        flags: MessageFlags.Ephemeral,
      });
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
