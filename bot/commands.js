// The slash commands as Discord sees them: names, descriptions and options. Kept apart from index.js so the tests
// can check every definition is valid without logging in.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const { SlashCommandBuilder } = require('discord.js');

function buildCommands(LUCKS) {
  return [
    new SlashCommandBuilder()
      .setName('spin')
      .setDescription('Spin the wheels of fate and forge a random legend')
      .addStringOption(o =>
        o
          .setName('luck')
          .setDescription('How kind fate is (default: Heroic)')
          .addChoices(...LUCKS.map(l => ({ name: l.name, value: l.id })))
      ),
    new SlashCommandBuilder()
      .setName('stats')
      .setDescription('How many heroes fate has made, and how their sagas ended'),
    new SlashCommandBuilder()
      .setName('patchnotes')
      .setDescription("What's new in Destiny Unbound")
      .addStringOption(o =>
        o.setName('version').setDescription('A version, like 0.2.0-alpha.3 (default: the newest)').setAutocomplete(true)
      ),
    new SlashCommandBuilder().setName('daily').setDescription("Today's daily challenge leaderboard"),
    new SlashCommandBuilder()
      .setName('legend')
      .setDescription('Show a hero from the game as a card')
      .addStringOption(o =>
        o
          .setName('code')
          .setDescription('A short card code like DU-7K3QXM (in the game: Share > Get a card code)')
          .setRequired(true)
          .setMaxLength(6000)
      ),
    new SlashCommandBuilder()
      .setName('versus')
      .setDescription("Two heroes fight with the game's real odds")
      .addStringOption(o =>
        o.setName('fighter1').setDescription('A card code (leave empty to spin a hero)').setMaxLength(6000)
      )
      .addStringOption(o =>
        o.setName('fighter2').setDescription('A card code (leave empty to spin a hero)').setMaxLength(6000)
      )
      .addStringOption(o =>
        o
          .setName('luck')
          .setDescription('Luck for spun heroes (default: Heroic)')
          .addChoices(...LUCKS.map(l => ({ name: l.name, value: l.id })))
      ),
  ];
}

module.exports = { buildCommands };
