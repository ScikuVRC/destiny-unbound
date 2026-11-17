/* Destiny Unbound story chapters: Out in the world: sieges, voyages, heists, hauntings, mentors, duels, succession, founding, retiring.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, Nm, addAlly, bad, fight, foe, good, nearYou, newArtifact, outcome, pick } = S.lib;
  S.addChapters([
    /* ---- more chapters ---- */
    {
      id: 'siege',
      name: 'Defend a city',
      emoji: '🏯',
      w: 3,
      run: async (L, io, c) => {
        const f = pick(S.FACTIONS.slice(0, 16), io.rng);
        c.foe = f.name;
        const r = await fight(L, io, c, foe(f.name, nearYou(L, io.rng, -8, 10), f.dsl.replace(/lv=\d+\s*/, '')), {
          scale: 'war',
          emoji: '🏯',
          title: 'Does the city hold?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The siege is broken. What now?',
            entries: [
              good(
                'Hero of the walls',
                4,
                'fgt+1 rt+1',
                'The city sings of the day {hero} held the walls against {foe}.'
              ),
              good('The city stands', 3, 'rt+2', 'You break the siege of {foe}.'),
              good('Made lord of the city', 1.5, 'rt+1', 'The grateful city makes you its lord.', {
                if: s => !s.kingdom,
                fx: s => {
                  s.kingdom = { name: Nm().realm(io.rng), style: 'City-state', power: 40 };
                },
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The walls fall...',
            hue: 0,
            entries: [
              bad('The city falls', 4, 'rt-1 fate-1', '{foe} take the city.'),
              bad('Taken prisoner', 2, '', '{foe} keep you prisoner for two years.', { years: 2 }),
              bad(
                'Hold the gate to the last',
                2,
                '',
                '{hero} holds the gate so the people can flee, and does not leave it.',
                { end: 'martyr', alive: 'You hold the gate until the last refugee is out, and somehow live.' }
              ),
            ],
          });
        return S.apply(L, E('The siege is lifted', 1, 'fate+1', '{foe} give up and march away.'), c);
      },
    },
    {
      id: 'voyage',
      name: 'Sail the open sea',
      emoji: '⛵',
      w: 3,
      repeat: true,
      run: async (L, io, c) => {
        const ship = Nm().ship(io.rng);
        const e = await outcome(L, io, c, {
          title: 'Aboard ' + ship + ': what happens at sea?',
          fit: 'sea',
          hue: 200,
          entries: [
            good('Discover a new land', 3, 'rt+1 int+1', 'You find a coast that is on no map.'),
            good('Pirate treasure', 3, 'fate+1 rt+1', "You find a pirate's buried treasure."),
            E('A kraken rises', 3, '', 'Something huge rises from the deep.', { quiet: true }),
            bad('Shipwrecked', 3, 'dur-1', 'Shipwrecked on a nameless island for a year.', { years: 1 }),
            good("A mermaid's gift", 1.5, 'pwr+1 r=water', 'A mermaid gives you a pearl that hums with the sea.'),
            bad('Sail off the map', 0.4, '', '{hero} sails past the edge of the map and is never seen again.', {
              end: 'lost',
            }),
          ],
        });
        if (e.name !== 'A kraken rises') return e;
        c.foe = 'the kraken';
        const r = await fight(L, io, c, foe('the kraken', nearYou(L, io.rng, -2, 14), 'a=water r=water w=lightning'), {
          emoji: '🐙',
          title: 'Can you beat the kraken?',
        });
        if (r === 'win')
          return S.apply(
            L,
            good('Kraken slayer', 1, 'str+1 rt+2', 'You slay the kraken. Sailors will tell this one forever.'),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The kraken drags the ship down...',
            hue: 0,
            entries: [
              bad('Barely survive', 4, 'dur-1', 'You wash up on a beach, half-drowned.'),
              bad(
                'Dragged into the deep',
                2,
                '',
                [
                  'The kraken drags {hero} into the deep.',
                  'Tentacles close around {hero} and pull {g:him|her|them} under.',
                  'The kraken breaks the ship in two, and {hero} sinks with it.',
                ],
                { end: 'dead' }
              ),
            ],
          });
        return S.apply(L, E('The kraken sinks away', 1, '', 'The kraken sinks back into the dark water.'), c);
      },
    },
    {
      id: 'heist',
      name: 'Pull off a heist',
      emoji: '💎',
      w: 3,
      run: async (L, io, c) => {
        const thief = L.saga.guild === "Thieves' Guild";
        c.newArt = newArtifact(io.rng, null, 'pwr+1');
        return outcome(L, io, c, {
          title: 'How does the heist go?',
          fit: 'heist',
          hue: 280,
          hint: thief ? "The Thieves' Guild is helping you" : '',
          entries: [
            good('A perfect heist', thief ? 5 : 2, 'rt+1 fate+1', 'In and out. Nobody even knows it happened.'),
            good('Steal a famous artifact', 2, 'pwr+1', 'You steal {art}.', { fx: s => s.artifacts.push(c.newArt) }),
            bad('Caught red-handed', thief ? 1 : 3, 'rt-1', "Caught! Two years in the king's dungeon.", { years: 2 }),
            bad('Double-crossed', 2, 'fate-1', 'Your partner runs off with the loot.'),
            E('Rob a king', 1, 'rt+2 fate-1', 'You rob a king. Now a king wants you dead.', { tone: 'bad' }),
          ],
        });
      },
    },
    {
      id: 'haunted',
      name: 'Haunted',
      emoji: '👻',
      w: 2.5,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'A ghost follows you. What does it want?',
          fit: 'haunted',
          hue: 180,
          entries: [
            good('Lay it to rest', 3, 'fate+1', 'You finish what the ghost could not, and it finally rests.'),
            good('A ghostly companion', 1.5, '', 'The ghost decides to stay with you.', {
              fx: () => addAlly(L, 'a restless ghost', 45, 'befriend', 60),
            }),
            good('Secrets of the dead', 2, 'pwr+1 r=shadow', 'The ghost teaches you what the dead know.'),
            bad('Driven half mad', 2, 'int-1', 'The whispers never stop.'),
            E('Possessed', 2, 'pwr+1 fate-1', 'Something else shares your body now.', { tone: 'bad' }),
            E('The ghost is you', 1, 'int+1', 'The ghost wears your face, from a life you have forgotten.'),
          ],
        }),
    },
    {
      id: 'mentor',
      name: 'Meet a mentor',
      emoji: '🧙',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Who takes you under their wing?',
          fit: 'mentor',
          hue: 120,
          entries: [
            good('A master of the blade', 3, 'fgt+1 wpn+1', 'An old swordmaster teaches you everything.'),
            good('An old archmage', 3, 'pwr+1 int+1', 'An archmage shares secrets older than kingdoms.'),
            good('A retired hero', 2, 'rt+1 fate+1', 'A retired hero takes up the sword again, for you.', {
              fx: () => addAlly(L, 'your old mentor', 60, 'befriend', 85),
            }),
            E('Dies in your arms', 2, 'all+1', 'Your mentor dies, and leaves you everything they knew.', {
              tone: 'bad',
            }),
            E(
              'A dark secret',
              1.5,
              'pwr+1 fate-1',
              'Your mentor taught you well. Then you learn what they really were.',
              { tone: 'bad' }
            ),
          ],
        }),
    },
    {
      id: 'duel',
      name: 'A duel of honour',
      emoji: '🤺',
      w: 3,
      repeat: true,
      run: async (L, io, c) => {
        c.foe = pick(
          [
            'Count Verano',
            'a scarred knight',
            'the Duchess of Blades',
            'an insulted wizard',
            'a young hothead',
            'Sir Gideon the Grey',
          ],
          io.rng
        );
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -6, 10)), {
          emoji: '🤺',
          title: 'Who wins the duel?',
        });
        if (r === 'win') return S.apply(L, good('Honour satisfied', 1, 'rt+1 fgt+1', 'You beat {foe} at dawn.'), c);
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'You lose the duel...',
            hue: 0,
            entries: [
              bad('Yield', 4, 'rt-1', 'You yield to {foe}.'),
              bad('Wounded', 3, 'dur-1', '{foe} leaves you bleeding in the grass.'),
              bad(
                'Killed in the duel',
                1,
                '',
                [
                  '{foe} kills {hero} at dawn.',
                  "{foe}'s blade is a heartbeat faster. {hero} falls at dawn.",
                  '{hero} falls in the duel, honour intact.',
                ],
                { end: 'dead' }
              ),
            ],
          });
        return S.apply(L, good('Respect earned', 1, 'fate+1', 'Neither of you falls. You part as friends.'), c);
      },
    },
    {
      hard: true,
      id: 'succession',
      name: 'War of succession',
      emoji: '⚜️',
      w: 3,
      req: s => !!(s.kingdom && s.heir),
      reqText: 'needs a kingdom and an heir',
      run: async (L, io, c) => {
        c.foe = 'the pretender';
        const r = await fight(L, io, c, foe('the pretender', nearYou(L, io.rng, -8, 8)), {
          scale: 'war',
          emoji: '⚜️',
          title: 'A cousin claims the throne of ' + L.saga.kingdom.name + '. Who wins?',
        });
        if (r === 'win')
          return S.apply(
            L,
            good(
              'Your line is secure',
              1,
              'rt+2 fate+1',
              '{heir} will rule {kingdom} after you. No one doubts it now.'
            ),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The pretender wins...',
            hue: 0,
            entries: [
              bad('The pretender takes the throne', 4, 'rt-2', 'The pretender takes {kingdom}.', {
                fx: s => {
                  s.kingdom = null;
                },
              }),
              bad('Your heir flees', 3, 'fate-1', '{heir} has to flee the country.'),
              bad('Die defending your heir', 1.5, '', '{hero} dies so that {heir} can escape.', {
                end: 'martyr',
                alive: 'You hold the pretender off long enough for {heir} to escape, and barely live.',
              }),
            ],
          });
        return S.apply(
          L,
          E('The kingdom splits', 1, '', '{kingdom} splits in two.', {
            tone: 'bad',
            fx: s => {
              s.kingdom.power = Math.max(10, (s.kingdom.power || 50) - 20);
            },
          }),
          c
        );
      },
    },
    {
      id: 'found',
      name: 'Found a city',
      emoji: '🏛️',
      w: 2,
      run: async (L, io, c) => {
        const city = Nm().city(io.rng);
        return outcome(L, io, c, {
          title: 'You found ' + city + '. What does it become?',
          hue: 40,
          entries: [
            good('A thriving city', 3, 'rt+2', city + ' grows rich and proud.', {
              fx: s => {
                s.flags.city = city;
              },
            }),
            good('An academy of heroes', 2, 'int+1 fgt+1', city + ' becomes a school for heroes.', {
              fx: s => {
                s.flags.city = city;
              },
            }),
            good('A haven for outcasts', 2, 'fate+1', city + ' takes in everyone no one else wants.', {
              fx: s => {
                s.flags.city = city;
                addAlly(L, 'the people of ' + city, 40, 'befriend', 90);
              },
            }),
            E(
              'A city of thieves',
              1.5,
              'spd+1 fate-1',
              city + ' becomes the best place in the world to buy stolen things.',
              {
                tone: 'bad',
                fx: s => {
                  s.flags.city = city;
                },
              }
            ),
            bad('A ghost town', 2, 'rt-1', 'Nobody comes. ' + city + ' stays empty.'),
          ],
        });
      },
    },
    {
      id: 'retire',
      name: 'Retire',
      emoji: '🌅',
      w: 1,
      repeat: true,
      retire: true,
      run: async (L, io, c) =>
        L.saga.ch >= 10 && io.rng() < 0.35
          ? S.apply(
              L,
              good(
                'Passed into legend',
                1,
                '',
                'One morning {hero} walks into the mist and is never seen again. The songs never stop.',
                { end: 'legend' }
              ),
              c
            )
          : S.apply(
              L,
              good('Retired', 1, '', '{hero} lays down {g:his|her|their} weapons and retires.', { end: 'retired' }),
              c
            ),
    },
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
