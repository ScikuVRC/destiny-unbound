/* Destiny Unbound story chapters: The people in a hero's life: love, heirs, apprentices, betrayal, the nemesis, rivals.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, Nm, addAlly, bad, clamp, fight, foe, good, lowestLoyal, nearYou, outcome, removeAlly } = S.lib;
  S.addChapters([
    {
      id: 'love',
      name: 'Find love',
      emoji: '💞',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Who wins your heart?',
          hue: 330,
          entries: [
            good('A fellow adventurer', 4, 'fate+1', 'You fall in love on the road.', {
              fx: s => {
                s.love = 'a fellow adventurer';
                addAlly(L, 'your beloved', 40, 'love', 95);
              },
            }),
            good('A noble', 3, 'rt+1 fate+1', 'You marry into nobility.', { fx: s => (s.love = 'a noble') }),
            good('A former enemy', 2, 'fgt+1', 'Love, after many fights.', { fx: s => (s.love = 'a former enemy') }),
            good('A spirit of the forest', 1, 'pwr+1', 'A love not quite of this world.', {
              fx: s => (s.love = 'a forest spirit'),
            }),
            good('A dragon in disguise', 0.6, 'str+1 r=fire', 'Your beloved turns out to be a dragon.', {
              fx: s => (s.love = 'a dragon in disguise'),
            }),
            bad('Unrequited', 3, 'int+1', 'They never feel the same way.'),
          ],
        }),
    },
    {
      id: 'heir',
      name: 'Have an heir',
      emoji: '👶',
      w: 3,
      run: async (L, io, c) => {
        const n = Nm().person(io.rng, L.raceName());
        return outcome(L, io, c, {
          title: 'Is an heir born?',
          hue: 50,
          entries: [
            good('A son', 4, 'fate+1', 'Your son ' + n + ' is born.', { fx: s => (s.heir = { name: n, kind: 'son' }) }),
            good('A daughter', 4, 'fate+1', 'Your daughter ' + n + ' is born.', {
              fx: s => (s.heir = { name: n, kind: 'daughter' }),
            }),
            good('Twins', 1.5, 'fate+2', 'Twins! The eldest is ' + n + '.', {
              fx: s => (s.heir = { name: n, kind: 'twin' }),
            }),
            good('An adopted orphan', 2, 'fate+1', 'You adopt ' + n + ', an orphan of the war.', {
              fx: s => (s.heir = { name: n, kind: 'adopted child' }),
            }),
            good('A child of prophecy', 0.8, 'rt+2', n + ' is born under a falling star.', {
              fx: s => (s.heir = { name: n, kind: 'prophesied child', blessed: true }),
            }),
            bad('No heir comes', 3, '', 'The years pass without an heir.'),
          ],
        });
      },
    },
    {
      id: 'apprentice',
      name: 'Take an apprentice',
      emoji: '🧑‍🎓',
      w: 2,
      run: async (L, io, c) => {
        const n = Nm().person(io.rng, L.raceName());
        return outcome(L, io, c, {
          title: 'What is your apprentice like?',
          hue: 120,
          entries: [
            good('A prodigy', 2, 'rt+1', n + ' learns everything you teach, and fast.', {
              fx: () => addAlly(L, n + ' (apprentice)', 45, 'apprentice', 80),
            }),
            good('Loyal to the end', 3, '', n + ' would die for you.', {
              fx: () => addAlly(L, n + ' (apprentice)', 30, 'apprentice', 95),
            }),
            E('A traitor in waiting', 2, '', n + ' smiles a little too much.', {
              fx: () => addAlly(L, n + ' (apprentice)', 40, 'apprentice', 15),
            }),
            good('Teaching teaches you', 3, 'int+1', 'Teaching ' + n + ' sharpens your own skills.'),
          ],
        });
      },
    },
    {
      hard: true,
      id: 'betrayal',
      name: 'Betrayed by an ally',
      emoji: '🗡️',
      w: 3,
      opt: 'loyalty',
      req: (s, L) => L.ally.length > 0,
      reqText: 'needs an ally',
      run: async (L, io, c) => {
        const a = lowestLoyal(L, io.rng);
        if (!a)
          return S.apply(L, E('Suspicion', 1, 'int+1', 'You suspect everyone. There is no one to betray you.'), c);
        c.ally = a;
        const lo = a.loyalty == null ? 60 : a.loyalty;
        return outcome(L, io, c, {
          title: 'What does ' + a.name + ' do?',
          hue: 0,
          entries: [
            bad('Stab you in the back', 1 + (100 - lo) / 25, 'dur-1', '{ally} stabs you in the back and flees.', {
              fx: () => removeAlly(L, a),
            }),
            bad('Steal an artifact', 2, '', '{ally} steals your artifact and vanishes.', {
              if: s => s.artifacts.length > 0,
              fx: s => {
                s.artifacts.pop();
                removeAlly(L, a);
              },
            }),
            bad('Join your nemesis', 1 + (100 - lo) / 40, '', '{ally} joins {nem}.', {
              if: s => s.nem && s.nem.alive,
              fx: s => {
                s.nem.lv += 5;
                removeAlly(L, a);
              },
            }),
            good('You saw it coming', 2, 'int+1', 'You catch {ally} before the knife lands.', {
              fx: () => removeAlly(L, a),
            }),
            good(
              'A misunderstanding',
              lo / 30,
              'fate+1',
              'It was a misunderstanding. {ally} is more loyal than ever.',
              {
                fx: () => {
                  a.loyalty = clamp(lo + 25, 0, 100);
                },
              }
            ),
            bad(
              'A poisoned cup',
              0.6,
              '',
              [
                '{ally} poisons {hero}.',
                'The wine tastes wrong. {ally} smiles as {hero} falls.',
                '{ally} poisons {hero} at a feast in {g:his|her|their} honour.',
              ],
              { end: 'dead' }
            ),
          ],
        });
      },
    },
    {
      hard: true,
      id: 'nemesis',
      name: 'Your nemesis strikes',
      emoji: '😈',
      w: 4,
      repeat: true,
      opt: 'nemesis',
      req: s => !!(s.nem && s.nem.alive && !s.nem.ally),
      hideLocked: true,
      run: async (L, io, c) => {
        const s = L.saga,
          n = s.nem;
        n.met++;
        n.lv = Math.round(clamp(Math.max(n.lv, FW.compute(L).baseRating - 2) + 2, 20, 99));
        c.foe = n.name;
        const r = await fight(L, io, c, foe(n.name, n.lv), { emoji: '😈', title: n.name + ' attacks! Do you win?' });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'What becomes of ' + n.name + '?',
            choice: {
              title: n.name + ' is beaten. What do you do?',
              options: [
                {
                  label: 'Finish them',
                  align: -1,
                  hint: 'End it, if they let you.',
                  keep: ['Nemesis slain', 'Badly wounded', 'Flees, swearing revenge'],
                  boost: { 'Nemesis slain': 2 },
                },
                {
                  label: 'Show mercy',
                  align: 1,
                  hint: 'Mercy can make an enemy think.',
                  keep: ['You spare them', 'Flees, swearing revenge', 'Joins your side'],
                  boost: { 'You spare them': 1.5 },
                },
                {
                  label: 'Offer them a place at your side',
                  align: 1,
                  hint: 'Old enemies make fierce friends, or worse traitors.',
                  keep: ['Joins your side', 'You spare them', 'Flees, swearing revenge'],
                  boost: { 'Joins your side': 3 },
                },
              ],
            },
            entries: [
              good('Flees, swearing revenge', 5, 'rt+1', '{nem} flees, swearing revenge.', {
                fx: () => {
                  n.lv += 3;
                },
              }),
              good('Badly wounded', 3, 'rt+1', '{nem} will carry your mark.', {
                fx: () => {
                  n.lv -= 6;
                },
              }),
              good('You spare them', 2, 'fate+1', 'You spare {nem}. They hate you for it.'),
              good('Nemesis slain', 2, 'rt+2', 'You end {nem} for good.', {
                fx: () => {
                  n.alive = false;
                },
              }),
              good('Joins your side', 0.8, 'rt+1', '{nem} finally kneels and joins you.', {
                fx: () => {
                  n.ally = true;
                  addAlly(L, n.name, n.lv, 'befriend', 45);
                },
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: n.name + ' wins...',
            hue: 0,
            entries: [
              bad('Steals an artifact', 3, '', '{nem} takes your artifact.', {
                if: s2 => s2.artifacts.length > 0,
                fx: s2 => {
                  s2.artifacts.pop();
                  n.lv += 2;
                },
              }),
              bad('Seizes your kingdom', 2, 'rt-2', '{nem} takes {kingdom} from you.', {
                if: s2 => !!s2.kingdom,
                fx: s2 => {
                  s2.kingdom = null;
                  n.lv += 4;
                },
              }),
              bad('Scarred', 4, 'dur-1', '{nem} leaves you a scar to remember.'),
              bad('Kills a companion', 2, '', '{nem} kills one of your companions.', {
                if: (s2, L2) => L2.ally.length > 0,
                fx: () => {
                  L.ally.pop();
                },
              }),
              bad(
                'Killed by your nemesis',
                2,
                '',
                [
                  '{nem} finally kills {hero}.',
                  'After all these years, {nem} wins.',
                  '{nem} stands over {hero} at last.',
                ],
                { end: 'dead' }
              ),
            ],
          });
        return S.apply(L, E('Stalemate', 1, '', 'You and {nem} fight to a standstill.'), c);
      },
    },
    {
      hard: true,
      id: 'showdown',
      name: 'Final showdown',
      emoji: '🔥',
      w: 3,
      opt: 'nemesis',
      req: s => !!(s.nem && s.nem.alive && !s.nem.ally && s.nem.met >= 2),
      reqText: 'meet your nemesis twice first',
      run: async (L, io, c) => {
        const n = L.saga.nem;
        c.foe = n.name;
        const r = await fight(L, io, c, foe(n.name, n.lv + 6), { emoji: '🔥', title: 'The final duel with ' + n.name });
        if (r === 'win') {
          n.alive = false;
          return S.apply(
            L,
            good('The long war ends', 1, 'all+1 rt+3', '{hero} destroys {nem} in the final showdown.'),
            c
          );
        }
        if (r === 'lose')
          return S.apply(
            L,
            bad('Defeated at the end', 1, '', '{nem} wins the final showdown. {hero} falls.', {
              end: 'dead',
              alive: '{nem} wins and leaves you broken, but alive.',
            }),
            c
          );
        return S.apply(L, E('No winner', 1, '', 'Both of you walk away. Neither will ever forget.'), c);
      },
    },
    {
      id: 'rival',
      name: 'A rival appears',
      emoji: '😠',
      w: 3,
      notOpt: 'nemesis',
      run: async (L, io, c) => {
        c.foe = Nm().nemesis(io.rng, FW.RACES[FW.weightedIndex(FW.RACES, io.rng)].name);
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -6, 10)));
        return S.apply(
          L,
          r === 'win'
            ? good('Rival beaten', 1, 'rt+1', 'You beat your rival {foe}.')
            : r === 'lose'
              ? bad('Rival wins', 1, 'fgt+1', '{foe} beats you. You train twice as hard.')
              : E('Even match', 1, '', 'You and {foe} are perfectly matched.'),
          c
        );
      },
    },
    {
      // a hero from the player's own Hall of Legends turns up (see S.oldLegends in story.js)
      id: 'oldLegend',
      name: 'An old legend returns',
      emoji: '🕰️',
      w: 2,
      opt: 'returning',
      hideLocked: true,
      hard: true,
      req: (s, L) => S.oldLegends(L).length > 0,
      reqText: 'needs a living hero in your Hall of Legends',
      run: async (L, io, c) => {
        const all = S.oldLegends(L),
          h = all[Math.floor(io.rng() * all.length) % all.length],
          name = S.heroName(h),
          who = name + ', ' + S.returnPhrase(h),
          end = (h.saga && h.saga.end) || '',
          lv = (+h.rating || FW.compute(L).baseRating) - S.FOE_EASE;
        c.foe = name;
        L.saga.flags.oldLegend = name;
        const mentor = end === 'retired' || end === 'fulfilled' ? 4 : 2,
          rival = end === 'legend' || end === 'ascended' ? 4 : 2,
          stranger = end === 'lost' || end === 'undying' ? 4 : 2;
        const r = await outcome(L, io, c, {
          title: name + ' crosses your path. As what?',
          hue: 200,
          entries: [
            good('A mentor', mentor, 'fgt+1 int+1', who + ', takes {hero} under their wing.', {
              fx: () => addAlly(L, name, lv + S.FOE_EASE, 'befriend', 80),
            }),
            E('A rival', rival, '', who + ', wants to see if {hero} is worthy.', { tone: 'bad', rival: true }),
            good('A stranger', stranger, 'fate+1', 'A hooded stranger shares a fire with {hero}: ' + who + '.'),
          ],
        });
        if (!r || !r.rival) return r;
        const f = await fight(L, io, c, foe(name, lv), { emoji: '⚔️', title: name + ' tests you. Do you win?' });
        return S.apply(
          L,
          f === 'win'
            ? good('Worthy', 1, 'rt+2', '{hero} beats {foe}, and {foe} bows to a new legend.')
            : f === 'lose'
              ? bad('Not yet', 1, 'fgt+1', '{foe} wins, then shows {hero} how it was done.')
              : E('Equals', 1, 'rt+1', '{hero} and {foe} fight to a standstill and part as equals.'),
          c
        );
      },
    },
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
