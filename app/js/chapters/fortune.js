/* Destiny Unbound story chapters: Turns of fortune: curses, exile, plague, rebellion, other worlds, religion, ascension, losing everything, lost years.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, addAlly, bad, fight, foe, good, nearYou, outcome } = S.lib;
  S.addChapters([
    {
      id: 'curse',
      name: 'Cursed',
      emoji: '🧿',
      w: 1.5,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'What is the curse?',
          hue: 270,
          entries: [
            bad('Curse of weakness', 3, 'str-1', 'Your strength drains away.'),
            bad('Curse of misfortune', 3, 'fate-1', 'Nothing goes right anymore.'),
            E('Lycanthropy', 2, 'dark:str+2 sun:all-1', 'You become a beast under the moon.', { tone: 'bad' }),
            E('Cursed blood', 2, 'pwr+1 w=holy', 'Dark power, holy pain.', { tone: 'bad' }),
            good('Curse broken', 3, 'fate+1', 'You break the curse before it takes hold.'),
            good('The curse becomes power', 1, 'pwr+2', 'You turn the curse into a weapon.'),
            bad('Withering curse', 1, '', 'The curse eats you from the inside.', {
              end: 'dead',
              alive: 'The curse nearly kills you.',
            }),
            bad(
              'Undying',
              0.7,
              '',
              '{hero} dies, and the curse will not let {g:him|her|them} stay dead. {g:He rises|She rises|They rise} again, cold and changed.',
              { end: 'undying', alive: 'You die for a moment, and come back a little colder.' }
            ),
          ],
        }),
    },
    {
      id: 'exile',
      name: 'Exiled',
      emoji: '🚪',
      w: 1.2,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Exiled! What happens?',
          hue: 25,
          entries: [
            bad('Lose your kingdom', 3, '', 'You are driven out of {kingdom}.', {
              if: s => !!s.kingdom,
              fx: s => {
                s.kingdom = null;
              },
            }),
            good('Hardened by the wastes', 3, 'dur+1', 'The wastes make you tougher.', { years: 2 }),
            good('An army of exiles', 2, 'rt+1', 'Other exiles gather around you.', {
              fx: () => addAlly(L, 'the exile army', 50, 'befriend', 70),
            }),
            E('Bitter and alone', 3, 'int+1 fate-1', 'You spend years alone with your thoughts.', {
              years: 4,
              tone: 'bad',
            }),
            good('A new home', 3, 'fate+1', 'You find a new home far away.'),
          ],
        }),
    },
    {
      id: 'plague',
      name: 'Plague',
      emoji: '☠️',
      w: 2,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'The plague comes...',
          hue: 90,
          entries: [
            good('Immune', 3, 'r=poison', 'The plague passes you by.'),
            bad('Survive, scarred', 4, 'dur-1', 'You survive, but it leaves its mark.'),
            bad('Lose a companion', 2, '', 'The plague takes one of your companions.', {
              if: (s, L2) => L2.ally.length > 0,
              fx: () => {
                L.ally.pop();
              },
            }),
            good('Heal the sick', 2, 'fate+1 rt+1', 'You nurse a city back to health.'),
            bad('Your kingdom suffers', 2, 'rt-1', '{kingdom} loses a third of its people.', { if: s => !!s.kingdom }),
            bad(
              'Die of plague',
              2,
              '',
              [
                'The plague takes {hero}.',
                'The fever burns for nine days. On the tenth, {hero} is gone.',
                '{hero} nurses the sick until the plague takes {g:him|her|them} too.',
              ],
              { end: 'dead' }
            ),
          ],
        }),
    },
    {
      hard: true,
      id: 'rebellion',
      name: 'Rebellion in your kingdom',
      emoji: '🔥',
      w: 3,
      req: s => !!s.kingdom,
      reqText: 'needs a kingdom',
      run: async (L, io, c) => {
        c.foe = 'the rebels';
        const r = await fight(L, io, c, foe('the rebels of ' + L.saga.kingdom.name, nearYou(L, io.rng, -10, 8)), {
          scale: 'war',
          title: 'Can you crush the rebellion?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The rebels are beaten. Now what?',
            entries: [
              good('Show mercy', 3, 'fate+1', 'You pardon the rebels. {kingdom} loves you for it.'),
              E('Make an example', 3, 'rt+2 fate-1', 'You hang the leaders at the gates.', { tone: 'bad' }),
              good('Hear their demands', 2, 'int+1', 'You listen, and change {kingdom} for the better.'),
            ],
          });
        return outcome(L, io, c, {
          title: 'The rebels win...',
          hue: 0,
          entries: [
            bad('Overthrown', 4, 'rt-2', 'You lose {kingdom} to the rebels.', {
              fx: s => {
                s.kingdom = null;
              },
            }),
            bad('Flee the capital', 3, 'rt-1', 'You flee your own capital.'),
            bad(
              'Beheaded',
              2,
              '',
              [
                'The rebels behead {hero}.',
                'The rebels drag {hero} to the block in the town square.',
                "A rebel axe ends {hero}'s rule and life together.",
              ],
              { end: 'dead' }
            ),
          ],
        });
      },
    },
    {
      id: 'otherworld',
      name: 'Journey to another world',
      emoji: '🌀',
      w: 2,
      run: async (L, io, c) => {
        const ui = await io.spin({
          emoji: '🌀',
          title: 'Which world?',
          entries: FW.UNIVERSES.map(u => E(u.name, 1, '', u.blurb)),
          mode: 'cat',
          hue: 260,
        });
        c.foe = FW.UNIVERSES[ui].name;
        return outcome(L, io, c, {
          title: 'What happens in ' + FW.UNIVERSES[ui].name + '?',
          hue: 260,
          entries: [
            good('Return stronger', 3, 'all+1', 'You return from {foe} stronger.'),
            good('Bring back a power', 2, 'pwr+2', 'You bring back a power from {foe}.'),
            bad('Trapped for twenty years', 2, '', 'You are trapped in {foe} for twenty years.', { years: 20 }),
            good('Bring back a friend', 2, '', 'Someone from {foe} follows you home.', {
              fx: () => addAlly(L, 'a traveller from ' + FW.UNIVERSES[ui].name, 55, 'befriend', 75),
            }),
            bad('Lose your memories', 2, 'int-1', 'You come back without your memories.'),
            E('Never return', 1, '', '{hero} never comes back from {foe}.', { end: 'lost' }),
          ],
        });
      },
    },
    {
      id: 'religion',
      name: 'Found a religion',
      emoji: '⛪',
      w: 2,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'How does your faith spread?',
          hue: 50,
          entries: [
            good('Thousands of followers', 3, 'rt+2', 'Thousands follow your teachings.'),
            good('Worshipped as a god', 1.5, 'rt+2 fate+1', 'Your followers call you divine.'),
            E('Holy war', 2, 'holy:all+1 rt+1 fate-1', 'Your faith starts a holy war.', { tone: 'bad' }),
            bad('Heresy hunters', 2, 'w=holy', 'The old churches hunt you.'),
            bad('Nobody believes', 3, '', 'Nobody believes a word.'),
          ],
        }),
    },
    {
      id: 'ascend',
      name: 'Ascend to godhood',
      emoji: '✨',
      w: 1.5,
      run: async (L, io, c) => {
        c.foe = 'the trial of the gods';
        const r = await fight(L, io, c, foe('the trial of the gods', 82, 'a=holy,time'), {
          emoji: '✨',
          title: 'Do you pass the trial of the gods?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The heavens open...',
            hue: 50,
            entries: [
              good('Become a god', 2, 'all+2 pwr+2', '{hero} ascends and becomes a god.', { end: 'ascended' }),
              good('Demigod', 3, 'all+1 pwr+1', 'Half-way to the heavens, and staying here.'),
            ],
          });
        return outcome(L, io, c, {
          title: 'You fail the trial...',
          hue: 0,
          entries: [
            bad(
              'Struck down',
              3,
              '',
              [
                'The gods strike {hero} down for daring.',
                "Lightning from a clear sky ends {hero}'s climb to godhood.",
                'The gods do not share. {hero} burns.',
              ],
              { end: 'dead' }
            ),
            bad('Cast out', 4, 'fate-1', 'The gods throw you back to the world.'),
            bad('Burned by divinity', 3, 'dur-1 w=holy', 'Divine fire scars your soul.'),
          ],
        });
      },
    },
    {
      id: 'loseAll',
      name: 'Lose everything',
      emoji: '🌪️',
      w: 1.5,
      run: async (L, io, c) =>
        S.apply(
          L,
          bad(
            'Everything is gone',
            1,
            'behind:all+2',
            'You lose your home, your treasures and your friends. Nothing left to lose.',
            {
              fx: s => {
                s.kingdom = null;
                s.artifacts = [];
                s.flags.gold = 0;
                L.ally.splice(0);
              },
            }
          ),
          c
        ),
    },
    {
      id: 'timeSkip',
      name: 'Years pass',
      emoji: '⏳',
      w: 3,
      repeat: true,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Ten quiet years. How do they change you?',
          hue: 100,
          entries: [
            good('Wiser', 3, 'int+1', 'You grow wiser.', { years: 10 }),
            bad('Rusty', 3, 'fgt-1', 'You grow rusty.', { years: 10 }),
            good('Settled', 3, 'fate+1', 'You settle down for a while.', { years: 10 }),
            good('Your legend grows', 2, 'rt+1', 'Stories about you keep spreading.', { years: 10 }),
          ],
        }),
    },
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
