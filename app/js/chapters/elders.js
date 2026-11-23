/* Destiny Unbound story chapters: In old age (103). Chapters that only come once the hero is old (life stage 2 and
   up, story.js S.lifeStage) and Aging is on: pass on the sword, one last adventure, the old enemy, the council.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, Nm, bad, choose, fight, foe, good, nearYou, outcome } = S.lib;
  const old = (s, L) => (S.lifeStage(L) || 0) >= 2;
  const elder = ch =>
    Object.assign({ opt: 'aging', hard: true, hideLocked: true, reqText: 'grow old first' }, ch, {
      req: (s, L, o) => old(s, L) && (!ch.req || ch.req(s, L, o)),
    });
  S.addChapters([
    elder({
      id: 'passSword',
      name: 'Pass on the sword',
      emoji: '🗡️',
      w: 3,
      run: async (L, io, c) => {
        const n = Nm().person(io.rng, L.raceName());
        return outcome(L, io, c, {
          title: '{hero} looks for someone to pass the sword to. What happens?'.replace('{hero}', L.displayName()),
          hue: 35,
          fit: 'mentor',
          entries: [
            good(
              'A worthy successor',
              3,
              'rt+1',
              '{hero} finds ' + n + ', and hands over the sword and every lesson.',
              {
                fx: s => {
                  if (!s.heir) s.heir = { name: n, kind: 'student', grown: true }; // already grown: no 'comes of age'
                },
              }
            ),
            good('Your style lives on', 3, 'fate+1', 'A whole school of fighters copies the way {hero} fights.'),
            E('No one is ready', 2, '', 'Nobody is ready yet. {hero} keeps the sword a while longer.'),
            bad('The student fails you', 1.5, 'fate-1', n + ' takes the sword and the lessons, and sells both.'),
          ],
        });
      },
    }),
    elder({
      id: 'lastAdventure',
      name: 'One last adventure',
      emoji: '🌄',
      w: 2,
      run: async (L, io, c) => {
        c.foe = 'one last great foe';
        const r = await fight(L, io, c, foe('one last great foe', nearYou(L, io.rng, 10, 20)), {
          emoji: '🌄',
          title: 'One last adventure, against the greatest foe of all. Do you win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good('A final triumph', 1, '', '{hero} wins one last great battle, and walks into the songs for good.', {
                end: 'legend',
              })
            : r === 'lose'
              ? bad(
                  'A warrior’s death',
                  1,
                  '',
                  '{hero} falls on the last adventure, sword in hand, as {g:he|she|they} wanted.',
                  {
                    end: 'dead',
                    alive: 'Beaten and bleeding, {hero} comes home from the last adventure, and never leaves again.',
                  }
                )
              : E('Home, at last', 1, '', 'Neither side wins. {hero} goes home, and this time stays there.', {
                  end: 'retired',
                }),
          c
        );
      },
    }),
    elder({
      id: 'oldEnemy',
      name: 'The old enemy',
      emoji: '🕰️',
      w: 3,
      req: s => !!(s.nem && s.nem.alive && !s.nem.ally),
      run: async (L, io, c) => {
        const s = L.saga,
          n = s.nem;
        const way = await choose(L, io, c, {
          emoji: '🕰️',
          title: n.name + ' has grown old too, and comes to find you. What do you do?',
          options: [
            { label: 'Fight one last time', hint: 'Settle it while you both still can.' },
            { label: 'Make peace', hint: 'Two old enemies, with nobody else left who remembers.', align: 1 },
          ],
        });
        if (way === 0) {
          c.foe = n.name;
          const r = await fight(L, io, c, foe(n.name, n.lv), {
            emoji: '🕰️',
            title: 'The last duel with ' + n.name + '. Do you win?',
          });
          return S.apply(
            L,
            r === 'win'
              ? good('The last duel', 1, 'rt+2', 'Old and slow, {hero} still wins the last duel. {nem} is gone.', {
                  fx: s2 => (s2.nem.alive = false),
                })
              : r === 'lose'
                ? bad('Beaten by the old enemy', 1, '', '{nem} wins the last duel, and {hero} does not get up.', {
                    end: 'dead',
                    alive: '{nem} wins the last duel, and walks away without finishing it.',
                  })
                : E('Too old for this', 1, '', 'Both too tired to finish it, {hero} and {nem} sit down and laugh.'),
            c
          );
        }
        return outcome(L, io, c, {
          title: 'Will ' + n.name + ' make peace?',
          hue: 200,
          entries: [
            good('Old enemies, old friends', 3, 'fate+1', '{hero} and {nem} share a bottle, and the old war is over.', {
              fx: s2 => (s2.nem.ally = true),
            }),
            E('A cold handshake', 2, '', '{nem} shakes hands, but does not smile. It is enough.', {
              fx: s2 => (s2.nem.ally = true),
            }),
            bad('Spat at', 2, 'rt-1', '{nem} spits at your feet and walks off. Some wars never end.'),
          ],
        });
      },
    }),
    elder({
      id: 'elderCouncil',
      name: 'Council of elders',
      emoji: '🏛️',
      w: 2,
      req: s => !!(s.kingdom || S.guildRank(s) >= 4 || S.rep(s, 'fame') >= 3),
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'The young ones come to {hero} for advice. What happens?'.replace('{hero}', L.displayName()),
          hue: 45,
          fit: 'study',
          entries: [
            good('Wise counsel', 3, 'int+1 rt+1', 'The advice of {hero} saves a city from a foolish war.'),
            good(
              'A war averted',
              2,
              'fate+1',
              'Two kingdoms make peace because {hero} told them a story about the last war.'
            ),
            E('Nobody listens', 2, '', 'Nobody listens to old {hero}. They will learn.'),
            bad(
              'Seen as a relic',
              1.5,
              'rt-1',
              'The new rulers smile politely at {hero}, and stop inviting {g:him|her|them}.'
            ),
          ],
        }),
    }),
  ]);
  ['passSword', 'lastAdventure', 'oldEnemy', 'elderCouncil'].forEach(id => (S.TURNING[id] = 2));
})(typeof window !== 'undefined' ? window : globalThis);
