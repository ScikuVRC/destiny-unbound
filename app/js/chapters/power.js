/* Destiny Unbound story chapters: Power and rule: kingdoms, conquering peoples and worlds, guilds, tournaments, rescues.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, Nm, addAlly, bad, fight, foe, good, loyal, nearYou, outcome, pick } = S.lib;
  // joining a guild starts at the bottom (119): Initiate, then Member, Veteran, Officer and guild master
  const join = (s, name) => {
    s.guild = name;
    s.flags.guildRank = 1;
  };
  const rankUp = s => {
    s.flags.guildRank = Math.min(4, S.guildRank(s) + 1);
  };
  S.addChapters([
    {
      hard: true,
      id: 'kingdom',
      name: 'Forge a kingdom',
      emoji: '🏰',
      w: 4,
      repeat: true,
      req: s => !s.kingdom,
      reqText: 'only if you have no kingdom',
      run: async (L, io, c) => {
        const realm = Nm().realm(io.rng);
        const r = await outcome(L, io, c, {
          title: 'How do you rule ' + realm + '?',
          hue: 50,
          entries: [
            good('Benevolent ruler', 4, 'fate+1 rt+1', 'You found the kingdom of ' + realm + ' and rule it kindly.'),
            good('Iron fist', 3, 'str+1 rt+2', 'You found ' + realm + ' and rule through fear.'),
            good('Merchant kingdom', 3, 'int+1 fate+1', 'You found ' + realm + ', a kingdom of trade.'),
            good('Holy kingdom', 2, 'holy:all+1 rt+1', 'You found ' + realm + ' in the name of the gods.'),
            good('Mage kingdom', 2, 'pwr+1 int+1', 'You found ' + realm + ', ruled by magic.'),
            good('War kingdom', 3, 'fgt+1 rt+1', 'You found ' + realm + ', built for conquest.'),
          ],
        });
        L.saga.kingdom = { name: realm, style: r.name, power: 50 };
      },
    },
    {
      id: 'conquerRace',
      name: 'Conquer a race',
      emoji: '⚔️',
      w: 3,
      repeat: true,
      req: (s, L) => !!s.kingdom || L.ally.length >= 3,
      reqText: 'needs a kingdom or 3 allies',
      run: async (L, io, c) => {
        const s = L.saga,
          mine = L.raceName();
        const list = FW.RACES.filter(r => r.name !== mine && s.conquered.indexOf(r.name) < 0).map(S.raceFaction);
        const ri = await io.spin({
          emoji: '🗡️',
          title: 'Which race are you at war with?',
          entries: list.map(f => E(f.name, f.w, f.dsl, f.perk)),
          mode: 'cat',
          hue: 0,
        });
        const f = list[ri];
        c.foe = f.name;
        const r = await fight(L, io, c, f, { scale: 'war', title: 'How does the war go?' });
        if (r === 'win') {
          s.conquered.push(f.race);
          loyal(L, 5);
          return outcome(L, io, c, {
            title: 'What do you do with them?',
            hue: 130,
            entries: [
              good('Annex their lands', 5, 'rt+2', '{foe} become part of {kingdom}.'),
              good('Make them allies', 3, 'rt+1', '{foe} join you as allies.', {
                fx: () => addAlly(L, f.name, FW.P(f).lv, 'befriend', 70),
              }),
              E('Enslave them', 2, 'rt+2 fate-1', '{foe} are put in chains.', { tone: 'bad' }),
              good('Learn their secrets', 3, 'int+1 pwr+1', 'You study the magic of {foe}.'),
              E('Wipe them out', 1, 'rt+2 fate-2', 'History will remember what you did to {foe}.', { tone: 'bad' }),
              good('Rule as their god', 1, 'rt+3 fate+1', '{foe} worship {hero}.'),
            ],
          });
        }
        if (r === 'lose') {
          loyal(L, -8);
          return outcome(L, io, c, {
            title: 'The war is lost...',
            hue: 0,
            entries: [
              bad('Retreat', 5, 'rt-1', 'Your army retreats from {foe}.'),
              bad('Allies fall', 3, '', 'Your allies die covering your retreat.', {
                if: (s2, L2) => L2.ally.length > 0,
                fx: () => {
                  L.ally.splice(0, Math.ceil(L.ally.length / 2));
                },
              }),
              bad('Lose territory', 3, '', '{foe} take half of {kingdom}.', {
                if: s2 => !!s2.kingdom,
                fx: s2 => {
                  s2.kingdom.power = Math.max(10, (s2.kingdom.power || 50) - 20);
                },
              }),
              bad('Captured', 2, '', '{foe} keep you prisoner for three years.', { years: 3 }),
              bad(
                'Die on the battlefield',
                3,
                '',
                [
                  '{hero} falls in the war with {foe}.',
                  'An arrow finds {hero} in the last hour of the war with {foe}.',
                  '{hero} dies holding the line against {foe}.',
                ],
                { end: 'dead' }
              ),
            ],
          });
        }
        return S.apply(L, E('Peace treaty', 1, 'fate+1', 'Neither side can win. You sign a treaty with {foe}.'), c);
      },
    },
    {
      id: 'conquerWorld',
      name: 'Conquer the world',
      emoji: '🌍',
      w: 2,
      req: s => s.conquered.length >= 1,
      reqText: 'needs a conquered race',
      run: async (L, io, c) => {
        const top = S.FACTIONS.filter(f => FW.P(f).lv >= 60);
        const fi = await io.spin({
          emoji: '🌍',
          title: 'Who leads the resistance?',
          entries: top.map(f => E(f.name, 1, f.dsl, f.perk)),
          mode: 'stripe',
          hue: 220,
        });
        const f = top[fi];
        c.foe = f.name;
        const r = await fight(L, io, c, foe(f.name, FW.P(f).lv + 6, f.dsl.replace(/lv=\d+\s*/, '')), {
          scale: 'war',
          title: 'Does the world fall?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'How do you rule the world?',
            hue: 50,
            entries: [
              good('Emperor of all', 4, 'rt+5', '{hero} rules the known world.', { fx: s => (s.world = true) }),
              good('Benevolent unifier', 3, 'rt+3 fate+2', 'You unite the world in peace.', {
                fx: s => (s.world = true),
              }),
              E('Tyrant of the world', 2, 'rt+4 fate-2', 'The whole world kneels in fear.', {
                tone: 'bad',
                fx: s => (s.world = true),
              }),
              good('Give the crown away', 1, 'fate+3', 'You win the world and give it back.', {
                fx: s => (s.world = true),
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The world fights back...',
            hue: 0,
            entries: [
              bad(
                'Executed by the alliance',
                4,
                '',
                [
                  '{foe} execute {hero} in front of the world.',
                  '{foe} hang {hero} from the walls of {g:his|her|their} own capital.',
                ],
                { end: 'dead' }
              ),
              bad('Empire crumbles', 3, 'rt-2', 'Your empire falls apart.', {
                fx: s => {
                  s.kingdom = null;
                  s.conquered = [];
                },
              }),
              bad('Exiled to the edge of the world', 3, '', 'You are exiled to the edge of the world.', { years: 5 }),
            ],
          });
        return S.apply(L, E('Cold war', 1, '', 'The world splits in two, half of it yours.'), c);
      },
    },
    {
      id: 'guild',
      name: 'Join a guild',
      emoji: '🛡️',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Which guild takes you in?',
          hue: 200,
          entries: [
            good("Adventurers' Guild", 4, 'fgt+1', "You join the Adventurers' Guild.", {
              fx: s => join(s, "Adventurers' Guild"),
            }),
            good("Mages' Circle", 3, 'pwr+1', "You join the Mages' Circle.", { fx: s => join(s, "Mages' Circle") }),
            good("Thieves' Guild", 3, 'spd+1', "You join the Thieves' Guild.", {
              fx: s => join(s, "Thieves' Guild"),
            }),
            good("Assassins' Order", 2, 'fgt+1 dark:all+1', "You join the Assassins' Order.", {
              fx: s => join(s, "Assassins' Order"),
            }),
            good("Merchants' League", 3, 'fate+1', "You join the Merchants' League.", {
              fx: s => join(s, "Merchants' League"),
            }),
            bad('Kicked out', 2, 'rt-1', 'No guild will have you.'),
          ],
        }),
    },
    {
      id: 'guildWork',
      name: 'Guild work',
      emoji: '📜',
      w: 5,
      repeat: true,
      hard: true,
      hideLocked: true,
      req: s => !!s.guild && S.guildRank(s) < 4,
      reqText: 'join a guild first',
      run: async (L, io, c) => {
        const s = L.saga,
          gd = S.GUILDS[s.guild] || { work: 'a job for the guild', fit: '' },
          next = S.GUILD_RANKS[S.guildRank(s) + 1];
        return outcome(L, io, c, {
          title: 'The ' + s.guild + ' sends you on ' + gd.work + '. How does it go?',
          hue: 200,
          fit: gd.fit || undefined,
          entries: [
            good('Promoted', 4, 'rt+1', 'The job goes well. {hero} rises to ' + next + ' of the ' + s.guild + '.', {
              fx: rankUp,
            }),
            good('Well paid', 3, 'fate+1', 'The job pays well, and the ' + s.guild + ' takes note.'),
            E('A quiet season', 2, '', 'Nothing much happens in the ' + s.guild + ' this year.'),
            bad('A botched job', 2, 'fate-1', 'The job goes wrong, and the ' + s.guild + ' remembers.'),
            bad('Expelled', 1, 'rt-1', 'The ' + s.guild + ' throws {hero} out.', {
              fx: s2 => {
                s2.guild = '';
                s2.flags.guildRank = 0;
              },
            }),
          ],
        });
      },
    },
    {
      id: 'guildMaster',
      name: 'Head of the guild',
      emoji: '🏛️',
      w: 3,
      repeat: true, // a split vote can be tried again
      hard: true,
      hideLocked: true,
      req: s => !!s.guild && S.guildRank(s) === 4,
      reqText: 'become an officer of your guild',
      run: async (L, io, c) => {
        const s = L.saga,
          title = (S.GUILDS[s.guild] || {}).master || 'Guild master';
        c.foe = 'the old ' + title.toLowerCase();
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -2, 10)), {
          emoji: '🏛️',
          title: 'The ' + title + ' of the ' + s.guild + ' will not step down. Do you win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good('Head of the guild', 1, 'rt+2 fate+1', '{hero} becomes ' + title + ' of the ' + s.guild + '.', {
                fx: s2 => (s2.flags.guildRank = 5),
              })
            : r === 'lose'
              ? bad(
                  'Cast out',
                  1,
                  'rt-1',
                  'The old ' + title.toLowerCase() + ' wins and throws {hero} out of the guild.',
                  {
                    fx: s2 => {
                      s2.guild = '';
                      s2.flags.guildRank = 0;
                    },
                  }
                )
              : E('Not yet', 1, '', 'The guild is split. {hero} stays an officer, for now.'),
          c
        );
      },
    },
    {
      id: 'tournament',
      name: 'Win a tournament',
      emoji: '🏆',
      w: 3,
      run: async (L, io, c) => {
        c.foe = pick(
          [
            'Sir Aldous the Undefeated',
            'the masked champion',
            'Gorran Two-Axes',
            "the Emperor's duelist",
            'Lyra Swiftblade',
          ],
          io.rng
        );
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -4, 12)), {
          emoji: '🏆',
          title: 'Do you win the final?',
        });
        if (r === 'win')
          return S.apply(L, good('Champion', 1, 'rt+2 fgt+1', '{hero} wins the grand tournament against {foe}.'), c);
        return outcome(L, io, c, {
          title: 'You lose the final...',
          hue: 0,
          entries: [
            bad('Humbled', 5, 'int+1', '{foe} wins. You learn from it.'),
            bad('Injured', 3, 'spd-1', 'A bad fall in the final.'),
            bad(
              'A fatal blow',
              1,
              '',
              [
                'An accident in the arena. {hero} does not get up.',
                'A broken strap, a slipped blade. {hero} dies on the arena sand.',
              ],
              { end: 'dead' }
            ),
          ],
        });
      },
    },
    {
      id: 'rescue',
      name: 'Rescue someone',
      emoji: '🆘',
      w: 3,
      run: async (L, io, c) => {
        const who = await outcome(L, io, c, {
          title: 'Who needs rescuing?',
          hue: 190,
          entries: [
            E('A captured prince', 3, '', 'A prince is held for ransom.'),
            E('Your old village', 4, '', 'Your old village is under attack.'),
            E('A lost child', 3, '', 'A child is lost in the haunted woods.'),
            E('A god in chains', 1, '', 'A god is chained beneath a mountain.'),
            E('A stranger', 3, '', 'A stranger screams for help.'),
          ],
        });
        c.foe = 'the captors';
        c.ally = { name: who.name.replace(/^A |^Your /, 'the ').toLowerCase() };
        const r = await fight(L, io, c, foe('the captors', nearYou(L, io.rng, -10, 10)));
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'Saved! What happens next?',
            entries: [
              good('A lifelong friend', 4, '', '{ally} becomes your loyal companion.', {
                fx: () => addAlly(L, c.ally.name, who.name === 'A god in chains' ? 90 : 35, 'rescued', 90),
              }),
              good('A reward', 4, 'rt+1 fate+1', 'You are rewarded handsomely.'),
              good(
                'A blessing',
                who.name === 'A god in chains' ? 4 : 1,
                'all+1 fate+1',
                'The one you saved blesses you.'
              ),
            ],
          });
        return S.apply(L, bad('Too late', 1, 'fate-1', 'You arrive too late. You carry it forever.'), c);
      },
    },
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
