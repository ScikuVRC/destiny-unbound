/* Destiny Unbound story chapters: Growing stronger and going out into the world: training, study, treasure, quests, dungeons, bosses, dragons, evolving, artifacts.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const {
    ARTIFACT_KIND,
    DRAGONS,
    E,
    LOSS,
    WIN_LOOT,
    addAlly,
    bad,
    choose,
    fight,
    foe,
    good,
    matched,
    nearYou,
    newArtifact,
    outcome,
    pick,
  } = S.lib;
  S.addChapters([
    {
      id: 'train',
      name: 'Train',
      emoji: '🏋️',
      w: 4.5,
      repeat: true,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'How does training go?',
          fit: 'train',
          hue: 10,
          entries: [
            good('Muscles of iron', 4, 'str+1', 'Months of training: +1 Strength.'),
            good('Lightning footwork', 4, 'spd+1', 'Your feet blur: +1 Speed.'),
            good('Hardened body', 4, 'dur+1', 'Blows bounce off: +1 Durability.'),
            good('Perfect form', 4, 'fgt+1', 'Every move clean: +1 Fighting skills.'),
            good('Weapon drills', 3, 'wpn+1', 'Steel feels like part of your arm.'),
            good('A master takes notice', 1, 'fgt+1 wpn+1', 'A legendary teacher trains you personally.'),
            bad('Training injury', 3, 'spd-1', 'You push too hard and tear something.'),
            E('Plateau', 3, '', 'You train hard. Nothing changes.'),
          ],
        }),
    },
    {
      id: 'study',
      name: 'Study',
      emoji: '📚',
      w: 4,
      repeat: true,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'What do you learn?',
          fit: 'study',
          hue: 210,
          entries: [
            good('Ancient tome', 5, 'int+1', 'Old books, new ideas: +1 Intelligence.'),
            good('Arcane insight', 4, 'pwr+1', 'Your power answers more quickly.'),
            good('Battle strategy', 3, 'int+1 fgt+1', 'You learn to win before the fight.'),
            E('Forbidden spell', 2, 'pwr+2 fate-1', 'Power, at a price.', { tone: 'bad' }),
            bad('Too much knowledge', 2, 'int-1', 'Something you read keeps you awake at night.'),
            E('Nothing sticks', 3, '', 'The books win this time.'),
          ],
        }),
    },
    {
      id: 'treasure',
      name: 'Find treasure',
      emoji: '💰',
      w: 3.5,
      repeat: true,
      run: async (L, io, c) => {
        c.newArt = newArtifact(io.rng, null, 'pwr+1');
        return outcome(L, io, c, {
          title: 'What do you find?',
          hue: 45,
          entries: [
            good('Dragon gold', 5, 'rt+1', 'A hoard fit for a king.', { gold: 120 }),
            good('A lucky charm', 4, 'fate+1', 'It hums when danger is near.'),
            good('An ancient artifact', 3, 'pwr+1', 'You found {art}.', { fx: s => s.artifacts.push(c.newArt) }),
            good('A legendary weapon', 2, 'wpn+1', 'An old blade that remembers its last owner.'),
            bad('Cursed gold', 3, 'fate-1 rt+1', 'Rich, and very, very unlucky.', { gold: 80 }),
            bad('It was a mimic', 3, 'dur-1', 'The chest bites back.'),
            E('Empty chest', 3, '', 'Someone got here first.'),
            bad('A deadly trap', 1, '', 'The vault seals behind you.', {
              end: 'dead',
              alive: 'A trap nearly kills you; you crawl out scarred.',
            }),
          ],
        });
      },
    },
    {
      id: 'quest',
      name: 'Do a quest',
      emoji: '🗺️',
      w: 4,
      repeat: true,
      run: async (L, io, c) => {
        const q = await outcome(L, io, c, {
          title: 'What is the quest?',
          hue: 160,
          entries: [
            E('Save a village from raiders', 5, '', 'A village begs for help.'),
            E('Escort a royal caravan', 4, '', 'A caravan needs a guard.'),
            E('Hunt a man-eating beast', 4, '', 'Something hunts in the woods.'),
            E('Recover a stolen relic', 3, '', 'A temple wants its relic back.'),
            E("Break a witch's curse", 3, '', 'A whole town is cursed.'),
          ],
        });
        c.foe =
          {
            'Save a village from raiders': 'the raider chief',
            'Escort a royal caravan': 'the ambushers',
            'Hunt a man-eating beast': 'the beast',
            'Recover a stolen relic': 'the relic thieves',
            "Break a witch's curse": 'the witch',
          }[q.name] || 'the foe';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -12, 8)));
        c.newArt = newArtifact(io.rng, null, 'pwr+1');
        if (r === 'win') return outcome(L, io, c, { title: 'Your reward?', entries: WIN_LOOT });
        if (r === 'lose') return outcome(L, io, c, { title: 'What happens to you?', hue: 0, entries: LOSS });
        return S.apply(L, E('Unfinished', 1, '', 'The quest ends in a stalemate.'), c);
      },
    },
    {
      id: 'dungeon',
      name: 'Explore a dungeon',
      emoji: '🕳️',
      w: 4,
      repeat: true,
      run: async (L, io, c) => {
        c.foe = pick(
          [
            'the Bone Warden',
            'a gelatinous horror',
            'the Lich of the lower vault',
            'a minotaur in the maze',
            'the Spider Matron',
          ],
          io.rng
        );
        const r = await fight(
          L,
          io,
          c,
          foe(c.foe, nearYou(L, io.rng, -6, 14), pick(['a=shadow w=holy', 'a=poison w=fire', 'a=mind', ''], io.rng)),
          { emoji: '🕳️', title: 'Do you survive the dungeon?' }
        );
        c.newArt = newArtifact(io.rng, null, pick(['pwr+1', 'dur+1', 'str+1', 'spd+1'], io.rng));
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'What lies in the deepest room?',
            entries: [
              good('An artifact', 4, '', 'You claim {art}.', {
                fx: s => {
                  s.artifacts.push(c.newArt);
                  L.chron.push({ label: 'Artifact: ' + c.newArt.name, dsl: c.newArt.dsl, text: '', kind: 'story' });
                },
              }),
              good('A forgotten power', 2, 'pwr+2', 'Old magic soaks into you.'),
              good('Treasure', 4, 'rt+1 fate+1', 'Gold, and the story to go with it.'),
              good('A prisoner to free', 2, '', 'You free a prisoner who joins you.', {
                fx: () => addAlly(L, 'the freed prisoner', 40, 'rescued', 80),
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'Trapped in the dark...',
            hue: 0,
            entries: [
              bad('Crawl out wounded', 6, 'dur-1', 'You crawl out of the dungeon bleeding.'),
              bad('Lost for a year', 3, '', 'You are lost in the dark for a year.', { years: 1 }),
              bad(
                'The dungeon claims you',
                4,
                '',
                [
                  'Your bones join the others in the dark.',
                  'A trap springs in the dark, and the dungeon keeps {hero}.',
                  '{hero} takes a wrong turn in the dark and never finds the way out.',
                ],
                { end: 'dead' }
              ),
            ],
          });
        return S.apply(L, E('Retreat', 1, '', 'You retreat before the last room.'), c);
      },
    },
    {
      id: 'boss',
      name: 'Fight a boss',
      emoji: '👹',
      w: 4,
      run: async (L, io, c) => {
        const bosses = S.allBosses(),
          bw = matched(L, bosses);
        const bi = await io.spin({
          emoji: '👹',
          title: 'Which boss do you face?',
          entries: bosses.map((b, k) => E(b.name, bw[k], b.dsl, b.uni + ': ' + (b.perk || ''))),
          mode: 'stripe',
          hue: 0,
          hint: 'Bosses far above you get thinner slices',
        });
        const boss = bosses[bi];
        c.foe = boss.name;
        const r = await fight(L, io, c, boss);
        if (r === 'win') {
          let oe = FW.outcomeEntries(L);
          const MERCY = ['spare', 'recruit', 'befriend', 'heal', 'teach', 'banish', 'imprison'];
          const HARSH = ['kill', 'enslave', 'absorb', 'trophy', 'curse', 'throne', 'imprison', 'banish'];
          const way = await choose(L, io, c, {
            emoji: '🏆',
            title: boss.name + ' is beaten. Mercy?',
            options: [
              { label: 'Show mercy', hint: 'Spare, heal, recruit or teach.', align: 1 },
              { label: 'No mercy', hint: 'Kill, enslave, curse or take what is theirs.', align: -1 },
            ],
          });
          const keep = way === 0 ? MERCY : HARSH;
          if (oe.some(x => keep.indexOf(x.key) >= 0)) oe = oe.filter(x => keep.indexOf(x.key) >= 0);
          const oi = await io.spin({
            emoji: '🏆',
            title: 'What do you do to ' + boss.name + '?',
            entries: oe.map(x => E(x.name, x.w, '', x.blurb)),
            mode: 'cat',
            hue: 130,
            hint: 'Your personality changes the slice sizes',
          });
          const ch = FW.applyConsequence(L, 'win', oe[oi].key, boss, io.rng, { arena: c.lastArena, uni: boss.uni });
          const al = L.ally[L.ally.length - 1];
          if (al && al.name === boss.name && al.loyalty == null)
            al.loyalty = { recruit: 55, befriend: 80, enslave: 20 }[oe[oi].key] || 50;
          return S.apply(L, good(oe[oi].name, 1, '', 'You defeat ' + boss.name + '. ' + ch.text), c);
        }
        if (r === 'lose') {
          const de = FW.defeatEntries(L);
          const di = await io.spin({
            emoji: '💀',
            title: 'What happens to you?',
            entries: de.map(x => E(x.name, x.w, '', x.blurb)),
            mode: 'stripe',
            hue: 5,
          });
          if (de[di].key === 'death')
            return S.apply(L, bad('Slain', 1, '', 'Slain by ' + boss.name + '.', { end: 'dead' }), c);
          const ch = FW.applyConsequence(L, 'lose', de[di].key, boss, io.rng, { arena: c.lastArena, uni: boss.uni });
          return S.apply(L, bad(de[di].name, 1, '', 'Beaten by ' + boss.name + '. ' + ch.text), c);
        }
        return S.apply(L, E('Stalemate', 1, '', boss.name + ' withdraws. This is not over.'), c);
      },
    },
    {
      id: 'dragon',
      name: 'Slay a dragon',
      emoji: '🐉',
      w: 3,
      run: async (L, io, c) => {
        const dw = matched(L, DRAGONS);
        const di = await io.spin({
          emoji: '🐉',
          title: 'Which dragon?',
          entries: DRAGONS.map((d, k) => E(d.name, dw[k], d.dsl, 'Power ' + FW.P(d).lv)),
          mode: 'stripe',
          hue: 15,
          hint: 'Dragons far above you get thinner slices',
        });
        const d = DRAGONS[di];
        c.foe = d.name;
        const way = await choose(L, io, c, {
          emoji: '🐉',
          title: d.name + ' wakes. What do you do?',
          options: [
            { label: 'Fight it', hint: 'Win, and the realm never forgets you.' },
            { label: 'Talk to it', hint: 'Dragons are proud and clever. So must you be.' },
            { label: 'Sneak into its hoard', hint: 'Quiet feet and quick hands.', align: -1 },
          ],
        });
        if (way === 1) {
          const t = await outcome(L, io, c, {
            title: 'Will ' + d.name + ' listen?',
            hue: 35,
            fit: 'dragontalk',
            entries: [
              good('A pact of fire', 2, 'rt+2', '{foe} agrees to fight beside you, for now.', {
                fx: () => addAlly(L, d.name, FW.P(d).lv, 'befriend', 40),
              }),
              good('A gift for your nerve', 3, 'fate+1 rt+1', '{foe} admires your nerve and gives you a gift.'),
              good('Ancient secrets', 2, 'int+1 pwr+1', '{foe} tells you things no human has heard.'),
              bad('It laughs, and attacks', 4, '', '{foe} has heard enough.', { quiet: true }),
            ],
          });
          if (t.name !== 'It laughs, and attacks') return t;
        } else if (way === 2) {
          c.newArt = newArtifact(io.rng, null, 'pwr+1');
          const t = await outcome(L, io, c, {
            title: 'Can you rob ' + d.name + '?',
            hue: 45,
            fit: 'heist',
            entries: [
              good('Rob the hoard', 3, 'rt+1 fate+1', 'You fill your pockets and slip away while {foe} sleeps.'),
              good('Steal its treasure', 1.5, 'pwr+1', 'You steal {art} from under its nose.', {
                fx: s2 => s2.artifacts.push(c.newArt),
              }),
              bad('Burned as you flee', 3, 'dur-1', '{foe} wakes too soon. You escape, burned.'),
              bad('It wakes up', 3, '', '{foe} opens one eye.', { quiet: true }),
            ],
          });
          if (t.name !== 'It wakes up') return t;
        }
        const r = await fight(L, io, c, d, { emoji: '🐉' });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The dragon falls. Now what?',
            entries: [
              good('Dragonslayer', 5, 'rt+3', '{hero} slays {foe}. The realm will never forget.'),
              good('Bathe in its blood', 3, 'dur+2 r=fire', 'Dragon blood hardens your skin.'),
              good('Take its hoard', 3, 'rt+1 fate+2', 'The hoard of {foe} is yours.'),
              good('Spare it and ride it', 2, 'spd+1 rt+2', '{foe} becomes your mount.', {
                fx: () => addAlly(L, d.name, FW.P(d).lv, 'befriend', 65),
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'Dragonfire...',
            hue: 0,
            entries: [
              bad('Burned', 5, 'dur-1 w=fire', 'You carry the burns forever.'),
              bad(
                'Eaten',
                4,
                '',
                [
                  '{foe} swallows {hero} whole.',
                  '{foe} burns {hero} to ash.',
                  '{hero} wounds {foe}, but not deeply enough.',
                ],
                { end: 'dead' }
              ),
              bad('Flee in shame', 4, 'rt-1', 'You run. Everyone saw.'),
            ],
          });
        return S.apply(L, E('Standoff', 1, '', '{foe} flies off, wounded.'), c);
      },
    },
    {
      id: 'evolve',
      name: 'Evolve',
      emoji: '🧬',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'How do you evolve?',
          hue: 280,
          entries: [
            good('Awakened bloodline', 3, 'all+1', 'Your blood remembers what you are.'),
            good('Second form', 3, 'str+2 dur+1', 'A larger, harder body.'),
            good('Mind ascension', 3, 'int+2 pwr+1', 'You think on a different level.'),
            good('Elemental rebirth', 2, 'pwr+2', 'Raw element flows through you.'),
            E('Become a monster', 2, 'str+2 int-2 w=holy', 'Stronger, and less yourself.', { tone: 'bad' }),
            bad('Failed evolution', 2, 'dur-1', 'The change goes wrong.'),
          ],
        }),
    },
    {
      id: 'artifact',
      name: 'Forge an artifact',
      emoji: '⚒️',
      w: 4,
      run: async (L, io, c) => {
        const k = await outcome(L, io, c, {
          title: 'What do you forge?',
          hue: 30,
          entries: ARTIFACT_KIND.map(n => E(n, 1, '', 'You begin forging a ' + n.toLowerCase() + '.')),
        });
        const q = await io.spin({
          emoji: '⚒️',
          title: 'How well does it turn out?',
          hue: 30,
          mode: 'cat',
          entries: [
            good('Masterpiece', 4, 'pwr+1 fgt+1', ''),
            good('Legendary', 1.5, 'all+1 pwr+1', ''),
            E('Cursed', 2, 'pwr+2 fate-1', '', { tone: 'bad' }),
            E('Ordinary', 3, 'dur+1', ''),
            bad('Shattered in the forge', 1.5, '', ''),
          ],
        });
        const Q = ['Masterpiece', 'Legendary', 'Cursed', 'Ordinary', 'Shattered in the forge'][q],
          dsl = ['pwr+1 fgt+1', 'all+1 pwr+1', 'pwr+2 fate-1', 'dur+1', ''][q];
        if (!dsl) return S.apply(L, bad(Q, 1, '', 'The ' + k.name.toLowerCase() + ' shatters in the forge.'), c);
        const art = newArtifact(io.rng, k.name, dsl, Q.toLowerCase());
        c.art = art.name;
        return S.apply(
          L,
          good(Q, 1, dsl, 'You forge {art} (' + Q.toLowerCase() + ').', {
            tone: Q === 'Cursed' ? 'bad' : 'good',
            fx: s => s.artifacts.push(art),
          }),
          c
        );
      },
    },
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
