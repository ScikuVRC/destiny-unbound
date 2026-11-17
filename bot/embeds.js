// What the bot shows: the legend card for /spin, the world totals for /stats and the notes for /patchnotes.
// Pure functions of their inputs, so tests/bot.test.js can check them without Discord.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { EmbedBuilder } = require('discord.js');
const notes = require('./patchnotes.js');

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
const GOLD = 0xc8902c;

function notesCard(version, list = notes.load()) {
  const s = notes.find(list, version);
  if (!s) return null;
  return new EmbedBuilder()
    .setColor(GOLD)
    .setTitle(`Destiny Unbound ${s.version}${notes.isMicro(s.version) ? ' · small update' : ''}`)
    .setURL(notes.releaseUrl(s.version))
    .setDescription(notes.toDiscord(s.body) || 'No notes for this version.')
    .setFooter({ text: (s.date ? s.date + ' · ' : '') + 'Full notes and downloads: the title link' });
}

// the game's totals from the world counter, with the /spin count kept on the bot server; local totals if it's down
function mergeTotals(local, world) {
  if (!world) return Object.assign({}, local, { offline: true });
  return {
    heroes: world.heroes || 0,
    sagas: world.sagas || 0,
    deaths: world.deaths || 0,
    endings: world.endings || {},
    since: world.since || local.since,
    discordSpins: local.discordSpins,
  };
}

function statsCard(w) {
  const n = v => (v || 0).toLocaleString('en-US');
  const ends = Object.keys(END_LABEL)
    .filter(k => w.endings && w.endings[k])
    .sort((a, b) => w.endings[b] - w.endings[a])
    .map(k => `${END_LABEL[k]}: **${n(w.endings[k])}**`);
  return new EmbedBuilder()
    .setColor(GOLD)
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

// L: what legend.js describe() returns. author: the line above the title (default: "<who> spun the wheels of fate")
function legendCard(L, who, author) {
  const pick = k => (L.lines.find(l => l.k === k) || {}).v || '-';
  const stats = ['STRENGTH', 'SPEED', 'DURABILITY', 'INTELLIGENCE', 'FIGHTING SKILLS']
    .map(k => `**${k[0] + k.slice(1).toLowerCase()}:** ${pick(k)}`)
    .join('\n');
  const e = new EmbedBuilder()
    .setColor(COLOURS[L.luck] || GOLD)
    .setAuthor({ name: author || `${who} spun the wheels of fate · ${L.luck} luck` })
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
  if (L.saga) e.addFields({ name: 'Saga', value: cut(L.saga, 1024) });
  if (L.epilogue) e.addFields({ name: 'Epilogue', value: '*' + cut(L.epilogue, 1000) + '*' });
  return e;
}
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// /daily: the opt-in daily-challenge leaderboard from the world counter (GET /v1/daily)
function dailyCard(d) {
  const top = (d && d.top) || [];
  const rows = top.map(
    (r, i) =>
      `**${i + 1}.** ${r.name}${r.race ? ' (' + r.race + ')' : ''} · **${r.score}** · ` +
      `${END_LABEL[r.ending] || r.ending || 'still going'}${r.ch ? ' · ' + r.ch + ' ch.' : ''}`
  );
  return new EmbedBuilder()
    .setColor(GOLD)
    .setTitle(`Daily challenge · ${d.day}`)
    .setDescription(
      rows.length
        ? rows.join('\n')
        : 'Nobody has posted a score today yet. Play the daily challenge from the home screen to be first.'
    )
    .setFooter({
      text:
        `${d.players || 0} player${d.players === 1 ? '' : 's'} today · everyone gets the same hero` +
        ' · posting is opt-in (Options > Data)',
    });
}

// /versus: two heroes, the arena, the odds and who won
function versusCard(a, b, r) {
  const pct = p => Math.round(p * 100) + '%';
  const win = r.winner === 'a' ? a.title : r.winner === 'b' ? b.title : null;
  const side = x => `**${x.title}**\n${x.race} · ${x.rank} · ${x.rating}`;
  return new EmbedBuilder()
    .setColor(r.winner === 'draw' ? 0x777777 : GOLD)
    .setTitle(win ? `🏆 ${win} wins` : '⚖️ A draw')
    .setDescription(`At the ${r.arena}. The odds were ${pct(r.pA)} / ${pct(r.pDraw)} draw / ${pct(r.pB)}.`)
    .addFields(
      { name: 'Fighter one' + (a.random ? ' (spun now)' : ''), value: side(a), inline: true },
      { name: 'Fighter two' + (b.random ? ' (spun now)' : ''), value: side(b), inline: true }
    )
    .setFooter({ text: "Destiny Unbound · the game's own Versus odds" });
}

module.exports = { END_LABEL, COLOURS, notesCard, mergeTotals, statsCard, legendCard, dailyCard, versusCard };
