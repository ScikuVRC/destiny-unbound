/* Destiny Unbound story chapters: Secret chapters (114). Very rare chapters that only appear for heroes who fit them,
   like a Necromancer meeting the Lich King. They stay off the story wheel until the hero fits, and then take a thin
   slice (S.SECRET_W: about 1 in 300 chapters). Found ones go into the Codex.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { DRAGONS, E, addAlly, bad, choose, fight, foe, good, matched, nearYou, newArtifact, outcome, pick } = S.lib;
  S.SECRET_W = 0.3;
  // does the hero's wheel result for `id` match one of `names`?
  const is = (L, id, names) => L.has(id) && !L.isNone(id) && names.indexOf(L.pickName(id)) >= 0;
  const UNDEAD = [
    'Skeleton',
    'Vampire',
    'Ghoul',
    'Revenant',
    'Zombie',
    'Mummy',
    'Lich',
    'Banshee',
    'Dullahan',
    'Shade',
  ];
  const SEA = ['Mermaid', 'Leviathan', 'Sharkfolk', 'Undine', 'Naga'];
  const HATCHLINGS = ['Emberwing', 'Ashfang', 'Skyrend', 'Cinderheart', 'Stormscale', 'Little Doom'];
  // a weighted pick of dragons (the same thin-slice rule as the dragon chapter)
  const pickWeighted = (ws, rng) =>
    FW.weightedIndex(
      ws.map(w => ({ w })),
      rng
    );
  const secret = ch =>
    Object.assign({ w: S.SECRET_W, secret: true, hard: true, hideLocked: true, reqText: 'a secret' }, ch);
  S.SECRETS = [
    secret({
      id: 'lichKing',
      name: 'Secret: The Lich King',
      emoji: '💀',
      fits: 'A Necromancer or a Lich',
      req: (s, L) => is(L, 'cls', ['Necromancer']) || is(L, 'race', ['Lich']),
      run: async (L, io, c) => {
        const way = await choose(L, io, c, {
          emoji: '💀',
          title: 'The Lich King has watched your work, and offers to teach you. What do you do?',
          options: [
            { label: 'Kneel and learn', hint: 'Power beyond death, at a price.', align: -1 },
            { label: 'Refuse him', hint: 'He does not take no well.', align: 1 },
            { label: 'Steal his phylactery', hint: 'Where a lich keeps its soul. Be quick.' },
          ],
        });
        if (way === 1) {
          c.foe = 'the Lich King';
          const r = await fight(L, io, c, foe('the Lich King', nearYou(L, io.rng, 4, 14)), {
            emoji: '💀',
            title: 'The Lich King rises from his throne. Do you win?',
          });
          return S.apply(
            L,
            r === 'win'
              ? good('The Lich King falls', 1, 'pwr+2 rt+2', '{hero} destroys the Lich King. The dead sleep easier.')
              : r === 'lose'
                ? bad('Taken by the Lich King', 1, '', 'The Lich King adds {hero} to his court of the dead.', {
                    end: 'undying',
                    alive: 'The Lich King lets {hero} live, as a warning to the others.',
                  })
                : E('A truce of the dead', 1, '', 'Neither can destroy the other. They part as wary equals.'),
            c
          );
        }
        if (way === 2) {
          c.newArt = newArtifact(io.rng, 'Phylactery', 'pwr+3 dark:all+1', 'legendary');
          c.art = c.newArt.name;
          return outcome(L, io, c, {
            title: 'Do you get the phylactery out?',
            hue: 280,
            fit: 'heist',
            entries: [
              good('The phylactery', 3, '', '{hero} walks out with {art}, and the Lich King’s soul with it.', {
                fx: (s, L2, c2) => s.artifacts.push(c2.newArt),
              }),
              bad('Caught', 3, '', 'The Lich King catches {hero} with a hand on his soul.', { scar: true }),
              bad('Cursed', 2, 'fate-2', 'The Lich King lets {hero} go, with a curse that never lifts.'),
            ],
          });
        }
        return outcome(L, io, c, {
          title: 'What does the Lich King teach you?',
          hue: 280,
          entries: [
            good('Master of the dead', 3, 'pwr+3 dark:all+1', 'The Lich King teaches {hero} the oldest necromancy.'),
            E('A cold apprentice', 3, 'pwr+2 w=holy', 'The lessons work. {hero} never feels warm again.', {
              tone: 'bad',
            }),
            bad('Bound to him', 1, '', '{hero} learns too well, and becomes one of his.', {
              end: 'undying',
              alive: 'Halfway to becoming one of his, {hero} tears free.',
            }),
          ],
        });
      },
    }),
    secret({
      id: 'lastEgg',
      name: 'Secret: The last dragon egg',
      emoji: '🥚',
      fits: 'A Dragon Rider, a Dragonborn, or a hero on a drake or wyvern',
      req: (s, L) =>
        is(L, 'cls', ['Dragon Rider']) || is(L, 'race', ['Dragonborn']) || is(L, 'mount', ['Drake', 'Riding Wyvern']),
      run: async (L, io, c) => {
        const name = pick(HATCHLINGS, io.rng);
        const e = await outcome(L, io, c, {
          title: 'Deep in a cold volcano, the last dragon egg. What happens?',
          hue: 20,
          entries: [
            good('A dragon hatches', 3, 'pwr+1', 'The egg cracks, and ' + name + ' imprints on {hero}.', {
              fx: () => addAlly(L, name + ' the dragon', 55 + 25 * io.rng(), 'befriend', 95),
            }),
            good(
              'Dragon-bonded',
              2,
              'fgt+1 r=fire',
              'The egg warms in {hero}’s hands, and something passes between them.'
            ),
            E('The egg sleeps', 2, '', 'The egg will not hatch, not yet. {hero} carries it everywhere.'),
            E('The mother returns', 2, '', 'A shadow falls across the cave. The mother has come back.'),
          ],
        });
        if (e.name !== 'The mother returns') return e;
        const d = DRAGONS[pickWeighted(matched(L, DRAGONS), io.rng)];
        c.foe = d.name;
        const r = await fight(L, io, c, d, { emoji: '🐉', title: d.name + ' wants her egg back. Do you win?' });
        return S.apply(
          L,
          r === 'win'
            ? good('Dragonslayer', 1, 'rt+2', '{hero} defeats {foe} and keeps the egg.')
            : r === 'lose'
              ? bad('Burned', 1, '', '{foe} takes the egg back, and leaves {hero} for dead.', {
                  end: 'dead',
                  alive: '{foe} takes the egg back. {hero} crawls out of the volcano alive.',
                })
              : E('Given back', 1, 'fate+1', '{hero} gives the egg back. {foe} remembers the kindness.', { align: 1 }),
          c
        );
      },
    }),
    secret({
      id: 'meetYourself',
      name: 'Secret: Meet yourself',
      emoji: '⏳',
      fits: 'A Chronomancer, a Chronoborn, or a hero of the Time element',
      req: (s, L) => is(L, 'cls', ['Chronomancer']) || is(L, 'race', ['Chronoborn']) || is(L, 'elem', ['Time']),
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'An old traveller with {hero}’s face steps out of nowhere. What happens?'.replace(
            '{hero}',
            L.displayName()
          ),
          hue: 190,
          entries: [
            good('A warning from the future', 3, 'fate+2', 'An older {hero} warns about a day that has not come yet.'),
            good('Trading secrets', 3, 'int+2', 'The two of them talk all night. Both are wiser for it.'),
            E('An argument', 2, '', '{hero} and {g:his|her|their} older self cannot agree on anything.'),
            bad('A paradox', 2, '', 'Time knots itself around them, and ten years go by in an afternoon.', {
              years: 10,
            }),
            bad('Erased', 0.6, '', '{hero} changes one small thing, and stops ever having been born.', { end: 'lost' }),
          ],
        }),
    }),
    secret({
      id: 'dawn',
      name: 'Secret: The dawn that does not burn',
      emoji: '🌄',
      fits: 'An undead hero of light, the stars, the moon or the spirit world',
      req: (s, L) => is(L, 'race', UNDEAD) && is(L, 'elem', ['Light', 'Star', 'Moon', 'Spirit']),
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'A healer has found a cure for death. What happens?',
          hue: 45,
          choice: {
            title: 'A healer offers {hero} a cure for death itself. Do you take it?'.replace('{hero}', L.displayName()),
            options: [
              { label: 'Take the cure', hint: 'Warm again. Mortal again.', keep: ['Alive again', 'The cure fails'] },
              {
                label: 'Refuse it',
                hint: 'Death has its uses.',
                keep: ['Undead, by choice', 'The healer takes it badly'],
              },
            ],
          },
          entries: [
            good(
              'Alive again',
              3,
              'dur-1 fate+2',
              'For the first time in an age, {hero} stands in the sun and it does not burn.'
            ),
            bad('The cure fails', 2, '', 'The cure fails, and it hurts more than dying did.', { scar: true }),
            good('Undead, by choice', 3, 'pwr+2', '{hero} keeps the long night, and is stronger for choosing it.'),
            bad('The healer takes it badly', 2, 'fate-1', 'The healer tells everyone what {hero} is.'),
          ],
        }),
    }),
    secret({
      id: 'drownedCrown',
      name: 'Secret: The drowned crown',
      emoji: '🔱',
      fits: 'A Pirate, a hero of the sea, or a rider of a sea serpent',
      req: (s, L) => is(L, 'cls', ['Pirate']) || is(L, 'race', SEA) || is(L, 'mount', ['Sea Serpent']),
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'A storm drags {hero} under, to a crown at the bottom of the sea. What happens?'.replace(
            '{hero}',
            L.displayName()
          ),
          hue: 200,
          entries: [
            good('King of the drowned', 3, 'rt+2', '{hero} puts on the crown, and the drowned kingdom kneels.', {
              fx: s => {
                if (!s.kingdom) s.kingdom = { name: 'Drowned Kingdom', style: 'Sunken', power: 55 };
              },
            }),
            good('Leaves it there', 2, 'fate+2', '{hero} leaves the crown where it lies. The sea is grateful.', {
              align: 1,
            }),
            bad('The drowned want it back', 2, '', 'The drowned do not give up their crown easily.', { scar: true }),
            bad('Claimed by the sea', 0.6, '', '{hero} stays below with the crown, and never comes up.', {
              end: 'lost',
            }),
          ],
        }),
    }),
  ];
  S.SECRETS.forEach(ch => (S.TURNING[ch.id] = 2));
  S.addChapters(S.SECRETS);
})(typeof window !== 'undefined' ? window : globalThis);
