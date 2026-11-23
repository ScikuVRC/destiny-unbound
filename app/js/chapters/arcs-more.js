/* Destiny Unbound story chapters: More story arcs (3): the hungry blade (a cursed weapon that grows stronger and
   hungrier) and the war of the banners (a civil war where the hero picks a side). Each runs over three chapters: the
   first starts a thread in saga.flags, and the later ones stay hidden until it is their turn.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, Nm, addAlly, bad, choose, fight, foe, good, nearYou, outcome, removeAlly } = S.lib;
  const BLADE = 'the Hungering Blade';
  const later = ch => Object.assign({ hard: true, hideLocked: true }, ch);
  const up = x => x.charAt(0).toUpperCase() + x.slice(1); // a side's name at the start of a sentence
  // the war's two sides
  S.BANNERS = {
    crown: { name: 'the Silver Crown', foe: 'the Ember Rebellion', what: 'the old throne and its laws' },
    rebels: { name: 'the Ember Rebellion', foe: 'the Silver Crown', what: 'a free land with no king' },
  };
  S.addChapters([
    /* ---- the hungry blade: find it -> feed it or starve it -> it wants its wielder ---- */
    {
      id: 'hungryBlade',
      name: 'A blade that whispers',
      emoji: '🗡️',
      w: 1.2,
      run: async (L, io, c) => {
        const way = await choose(L, io, c, {
          emoji: '🗡️',
          title: 'In a ruined shrine, a black sword whispers your name. What do you do?',
          options: [
            { label: 'Take it', hint: 'It promises power. They always do.' },
            { label: 'Leave it in the stone', hint: 'Some things are better left buried.', align: 1 },
          ],
        });
        if (way === 1)
          return S.apply(
            L,
            good('Left in the stone', 1, 'fate+1', '{hero} walks away. The whispering follows for a mile, then stops.'),
            c
          );
        return S.apply(
          L,
          E('The Hungering Blade', 1, 'wpn+2', '{hero} takes the black sword. It is light, and warm, and hungry.', {
            fx: s => {
              s.flags.blade = { stage: 1, fed: 0 };
              s.artifacts.push({
                name: 'The Hungering Blade',
                maker: 'no one remembers',
                dsl: 'wpn+2',
                quality: 'legendary',
              });
            },
          }),
          c
        );
      },
    },
    later({
      id: 'bladeHunger',
      name: 'The blade is hungry',
      emoji: '🩸',
      w: 14,
      req: s => !!(s.flags.blade && s.flags.blade.stage === 1),
      run: async (L, io, c) => {
        const s = L.saga;
        s.flags.blade.stage = 2;
        const way = await choose(L, io, c, {
          emoji: '🩸',
          title: 'The blade wants blood. What do you do?',
          options: [
            { label: 'Feed it', hint: 'Find someone who deserves it. Probably.', align: -1 },
            { label: 'Starve it', hint: 'Your will against its hunger.', align: 1 },
          ],
        });
        if (way === 0) {
          c.foe = 'a stranger on the road';
          const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -10, 4)), {
            emoji: '🩸',
            title: 'The blade picks a victim. Do you win?',
          });
          return S.apply(
            L,
            r === 'win'
              ? E(
                  'The blade drinks',
                  1,
                  'fgt+1',
                  'The blade drinks, and {hero} feels stronger. And a little less like {hero}.',
                  {
                    tone: 'bad',
                    fx: s2 => (s2.flags.blade.fed += 2),
                  }
                )
              : r === 'lose'
                ? bad('Bitten by your own blade', 1, '', 'The fight goes wrong, and the blade bites its own wielder.', {
                    scar: true,
                  })
                : E('Not today', 1, '', 'The victim gets away. The blade sulks for a week.'),
            c
          );
        }
        return outcome(L, io, c, {
          title: 'Can {hero} starve the blade?'.replace('{hero}', L.displayName()),
          hue: 280,
          entries: [
            good('Your will holds', 3, 'int+1', 'Night after night the blade whispers, and {hero} does not listen.'),
            bad('It feeds anyway', 2, 'dur-1', '{hero} wakes with blood on the blade, and no memory of the night.', {
              fx: s2 => (s2.flags.blade.fed += 1),
            }),
            bad('Nightmares', 2, 'fate-1', 'The blade fills every dream with the faces of the dead.'),
          ],
        });
      },
    }),
    later({
      id: 'bladeReckoning',
      name: 'The blade wants you',
      emoji: '⚫',
      w: 20,
      req: s => !!(s.flags.blade && s.flags.blade.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga,
          fed = s.flags.blade.fed;
        s.flags.blade.stage = 3;
        const dropBlade = s2 => (s2.artifacts = s2.artifacts.filter(a => a.name !== 'The Hungering Blade'));
        const way = await choose(L, io, c, {
          emoji: '⚫',
          title: 'The blade is done with victims. Now it wants its wielder. What do you do?',
          options: [
            { label: 'Break it', hint: 'Fight the thing inside the sword.', align: 1 },
            { label: 'Master it', hint: 'Make it yours, the way it made itself yours.', align: -1 },
            { label: 'Throw it into the sea', hint: 'Let the deep keep it.' },
          ],
        });
        if (way === 0) {
          c.foe = BLADE;
          const r = await fight(L, io, c, foe(BLADE, nearYou(L, io.rng, 2 + fed * 2, 12 + fed * 2), 'a=shadow,blood'), {
            emoji: '⚫',
            title: 'The spirit in the blade rises against {hero}. Do you win?'.replace('{hero}', L.displayName()),
          });
          return S.apply(
            L,
            r === 'win'
              ? good(
                  'The blade breaks',
                  1,
                  'rt+2',
                  'With a scream like a hundred voices, the Hungering Blade breaks in two.',
                  {
                    fx: dropBlade,
                  }
                )
              : r === 'lose'
                ? bad(
                    'Taken by the blade',
                    1,
                    '',
                    'The blade wins. Something wearing {hero}’s face walks away with it.',
                    {
                      end: 'undying',
                      alive: 'The blade nearly takes {hero}, and lets go only at dawn.',
                    }
                  )
                : E('A stalemate', 1, '', 'Neither wins. {hero} buries the blade deep, and does not sleep well.', {
                    fx: dropBlade,
                  }),
            c
          );
        }
        if (way === 1)
          return outcome(L, io, c, {
            title: 'Does {hero} master the blade?'.replace('{hero}', L.displayName()),
            hue: 280,
            entries: [
              good(
                'Master of the blade',
                3,
                'pwr+2 wpn+2',
                'The blade bows. From now on it hungers for {hero}’s enemies only.'
              ),
              bad('The blade wins', 1 + fed, '', 'The blade was always the master. {hero} becomes its sheath.', {
                end: 'damned',
                alive: 'Half mastered, half mastering, {hero} and the blade reach an uneasy truce.',
              }),
            ],
          });
        return S.apply(
          L,
          E(
            'Gone, for now',
            1,
            'fate+1',
            '{hero} throws the blade into the sea. Somewhere, someday, a fisherman will find it.',
            {
              fx: dropBlade,
            }
          ),
          c
        );
      },
    }),

    /* ---- the war of the banners: pick a side -> the war comes to you -> how it ends ---- */
    {
      id: 'warBanners',
      name: 'Two banners rise',
      emoji: '🚩',
      w: 1.2,
      run: async (L, io, c) => {
        const way = await choose(L, io, c, {
          emoji: '🚩',
          title: 'Civil war: the Silver Crown against the Ember Rebellion. Both want {hero}. What do you do?'.replace(
            '{hero}',
            L.displayName()
          ),
          options: [
            { label: 'Join the Silver Crown', hint: 'Order, the old laws, and a king who pays well.' },
            { label: 'Join the Ember Rebellion', hint: 'Freedom, fire, and no one to pay you at all.' },
            { label: 'Stay out of it', hint: 'Wars end. Neutral heroes live to see it.' },
          ],
        });
        if (way === 2)
          return S.apply(L, E('Neutral', 1, '', '{hero} stays out of the war, and both sides remember it.'), c);
        const side = way === 0 ? 'crown' : 'rebels';
        return S.apply(
          L,
          good(
            'Sworn to ' + S.BANNERS[side].name,
            1,
            'rt+1',
            '{hero} swears to fight for ' + S.BANNERS[side].what + '.',
            {
              fx: s => (s.flags.war = { stage: 1, side, wins: 0 }),
            }
          ),
          c
        );
      },
    },
    later({
      id: 'warBattle',
      name: 'The war comes to you',
      emoji: '⚔️',
      w: 14,
      req: s => !!(s.flags.war && s.flags.war.stage === 1),
      run: async (L, io, c) => {
        const s = L.saga,
          side = S.BANNERS[s.flags.war.side];
        s.flags.war.stage = 2;
        c.foe = 'the army of ' + side.foe.replace(/^the /, '');
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -4, 10)), {
          scale: 'war',
          emoji: '⚔️',
          title: 'The great battle of the war. Does ' + side.name + ' win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good(
                'The battle is won',
                1,
                'rt+1 fgt+1',
                '{hero} turns the battle, and ' + side.name + ' cheers the name.',
                {
                  fx: s2 => (s2.flags.war.wins += 2),
                }
              )
            : r === 'lose'
              ? bad('The battle is lost', 1, '', up(side.name) + ' is routed, and {hero} with it.', {
                  scar: true,
                  fx: s2 => (s2.flags.war.wins -= 1),
                })
              : E('Neither side breaks', 1, '', 'The battle ends at nightfall with both armies bleeding.', {
                  fx: s2 => (s2.flags.war.wins += 0),
                }),
          c
        );
      },
    }),
    later({
      id: 'warEnd',
      name: 'The end of the war',
      emoji: '🕊️',
      w: 20,
      req: s => !!(s.flags.war && s.flags.war.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga,
          w = s.flags.war,
          side = S.BANNERS[w.side];
        w.stage = 3;
        const win = Math.max(0.5, 3 + w.wins),
          lose = Math.max(0.5, 3 - w.wins);
        return outcome(L, io, c, {
          title: 'How does the war end?',
          hue: 200,
          entries: [
            good(
              'Victory for ' + side.name,
              win,
              'rt+2',
              w.side === 'crown'
                ? 'The Silver Crown wins, and the grateful king gives {hero} a land of {g:his|her|their} own.'
                : 'The Ember Rebellion wins, and the land is free. They sing about {hero} in every square.',
              {
                fx: s2 => {
                  if (w.side === 'crown' && !s2.kingdom)
                    s2.kingdom = { name: 'Silver March', style: 'Granted', power: 45 };
                  if (w.side === 'rebels') s2.flags.fame = S.rep(s2, 'fame') + 2;
                  s2.flags.war.won = true;
                },
              }
            ),
            E('An uneasy peace', 2, 'fate+1', 'Neither side wins. A treaty is signed, and nobody trusts it.'),
            bad(
              'The cause is lost',
              lose,
              'rt-1',
              up(side.name) + ' falls. {hero} is hunted by the winners for years.',
              {
                fx: s2 => (s2.flags.infamy = S.rep(s2, 'infamy') + 1),
              }
            ),
          ],
        });
      },
    }),

    /* ---- the lost sibling: a letter -> the trail -> who they became ---- */
    {
      id: 'lostSibling',
      name: 'A sibling you never knew',
      emoji: '✉️',
      w: 1.2,
      run: async (L, io, c) => {
        const n = Nm().person(io.rng, L.raceName());
        const way = await choose(L, io, c, {
          emoji: '✉️',
          title:
            'A dying woman tells {hero} the truth: there was a twin, taken as a baby. Their name was '.replace(
              '{hero}',
              L.displayName()
            ) +
            n +
            '. What do you do?',
          options: [
            { label: 'Search for them', hint: 'Somewhere out there is someone with your face.' },
            { label: 'Let the past lie', hint: 'Some doors are closed for a reason.' },
          ],
        });
        if (way === 1)
          return S.apply(
            L,
            E('The past stays buried', 1, '', '{hero} never looks for ' + n + '. Some nights, {hero} wonders.'),
            c
          );
        return S.apply(
          L,
          good('The search begins', 1, 'fate+1', '{hero} sets out to find ' + n + '.', {
            fx: s => (s.flags.sibling = { stage: 1, name: n, clue: false }),
          }),
          c
        );
      },
    },
    later({
      id: 'siblingTrail',
      name: 'On the trail',
      emoji: '👣',
      w: 14,
      req: s => !!(s.flags.sibling && s.flags.sibling.stage === 1),
      run: async (L, io, c) => {
        const s = L.saga,
          n = s.flags.sibling.name;
        s.flags.sibling.stage = 2;
        return outcome(L, io, c, {
          title: 'Where does the trail of ' + n + ' lead?',
          hue: 120,
          entries: [
            good('A real clue', 4, 'int+1', 'A village remembers ' + n + ', and which road they took.', {
              fx: s2 => (s2.flags.sibling.clue = true),
            }),
            bad('A false trail', 3, 'fate-1', 'A month on the wrong road. The trail is cold, but not dead.'),
            bad('Ambushed on the road', 2, '', 'Someone does not want ' + n + ' found. The ambush leaves its mark.', {
              scar: true,
            }),
          ],
        });
      },
    }),
    later({
      id: 'siblingFound',
      name: 'Face to face',
      emoji: '👥',
      w: 20,
      req: s => !!(s.flags.sibling && s.flags.sibling.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga,
          sib = s.flags.sibling,
          n = sib.name;
        sib.stage = 3;
        const e = await outcome(L, io, c, {
          title: 'At last, ' + n + '. Who did they become?',
          hue: 120,
          entries: [
            good(
              'A joyful reunion',
              sib.clue ? 5 : 3,
              'fate+1',
              '{hero} finds ' + n + ', and they talk until dawn about the life they never shared.',
              {
                fx: () => addAlly(L, n + ' (your twin)', FW.compute(L).baseRating - 4, 'family', 90),
              }
            ),
            E('Strangers with the same eyes', 3, 'int+1', n + ' is kind, and a stranger. They promise to write.'),
            E(
              'Your sibling serves your enemy',
              2,
              '',
              n + ' wears the colours of {hero}’s enemies, and draws a sword.'
            ),
            bad(
              'Too late',
              1.5,
              'dur-1',
              n + ' died a year ago. {hero} stands at a grave with {g:his|her|their} own face carved on it.'
            ),
          ],
        });
        if (e.name !== 'Your sibling serves your enemy') return e;
        c.foe = n;
        const r = await fight(L, io, c, foe(n, nearYou(L, io.rng, -6, 8)), {
          emoji: '👥',
          title: 'Twin against twin. Do you win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good('Spared and turned', 1, 'rt+1', '{hero} wins, spares ' + n + ', and wins them back too.', {
                align: 1,
                fx: () => addAlly(L, n + ' (your twin)', FW.compute(L).baseRating - 6, 'family', 70),
              })
            : r === 'lose'
              ? bad('Beaten by your twin', 1, '', n + ' wins, and walks away without a word.', { scar: true })
              : E(
                  'Neither can strike',
                  1,
                  '',
                  'Neither twin can strike the last blow. They part, each the other’s mirror.'
                ),
          c
        );
      },
    }),

    /* ---- the grey fever: a sickness in the east -> it spreads -> how it ends ---- */
    {
      id: 'greyFever',
      name: 'The grey fever',
      emoji: '🤒',
      w: 1.2,
      run: async (L, io, c) => {
        const way = await choose(L, io, c, {
          emoji: '🤒',
          title: 'A grey fever spreads from the east, village by village. What does {hero} do?'.replace(
            '{hero}',
            L.displayName()
          ),
          options: [
            { label: 'Help the sick', hint: 'Someone has to. Someone could catch it.', align: 1 },
            { label: 'Look for a cure', hint: 'Old books, older healers.', fit: 'study' },
            { label: 'Get far away', hint: 'Fevers don’t follow those who run fast enough.', align: -1 },
          ],
        });
        const start = (sick, cure) => s => (s.flags.fever = { stage: 1, sick, cure });
        if (way === 2)
          return S.apply(
            L,
            E('Fled the fever', 1, 'spd+1', '{hero} rides west and does not look back.', { fx: start(false, 0) }),
            c
          );
        if (way === 1)
          return outcome(L, io, c, {
            title: 'What do the old books say?',
            hue: 90,
            fit: 'study',
            entries: [
              good('A lead on a cure', 3, 'int+1', 'An old herbal names a flower that grows only on one mountain.', {
                fx: start(false, 2),
              }),
              E('Nothing useful', 2, '', 'The books know a hundred fevers, but not this one.', { fx: start(false, 0) }),
            ],
          });
        return outcome(L, io, c, {
          title: 'Among the sick...',
          hue: 90,
          entries: [
            good('Lives saved', 3, 'rt+1', '{hero} carries water, digs graves and saves who can be saved.', {
              fx: start(false, 1),
            }),
            bad(
              '{hero} catches it',
              2,
              'dur-1',
              'The fever finds {hero} too. The grey creeps up {g:his|her|their} arms.',
              { fx: start(true, 1) }
            ),
          ],
        });
      },
    },
    later({
      id: 'feverSpreads',
      name: 'The fever spreads',
      emoji: '🦠',
      w: 14,
      req: s => !!(s.flags.fever && s.flags.fever.stage === 1),
      run: async (L, io, c) => {
        const s = L.saga,
          f = s.flags.fever;
        f.stage = 2;
        if (f.sick)
          return outcome(L, io, c, {
            title: 'The fever burns inside {hero}. Does {g:he|she|they} pull through?'
              .replace(/\{hero\}/g, L.displayName())
              .replace(/\{g:([^}]*)\}/g, m => FW.fmt(m, { g: L.pres })),
            hue: 90,
            entries: [
              good(
                'The fever breaks',
                3,
                'dur+1',
                'On the ninth night the fever breaks. {hero} wakes thin, weak, and alive.',
                {
                  fx: s2 => (s2.flags.fever.sick = false),
                }
              ),
              bad('Still burning', 2, 'str-1', 'The fever lingers, and {hero} fights with shaking hands.'),
              bad('The grey takes {hero}', 1, '', '{hero} dies of the grey fever, still trying to help.', {
                end: 'dead',
                alive: 'The fever nearly takes {hero}, and leaves {g:him|her|them} grey at the temples.',
              }),
            ],
          });
        return outcome(L, io, c, {
          title: 'The fever reaches the cities. What happens?',
          hue: 90,
          entries: [
            good('Quarantine holds', 3, 'rt+1', '{hero} helps close the gates in time. The city lives.', {
              fx: s2 => (s2.flags.fever.cure += 1),
            }),
            bad('The capital falls sick', 3, 'fate-1', 'The fever reaches the capital, and the markets fall silent.'),
            E('A healer’s secret', 2, '', 'A healer whispers that the fever fears a flower on the high mountain.', {
              fx: s2 => (s2.flags.fever.cure += 1),
            }),
          ],
        });
      },
    }),
    later({
      id: 'feverEnd',
      name: 'The last of the fever',
      emoji: '🌸',
      w: 20,
      req: s => !!(s.flags.fever && s.flags.fever.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga,
          f = s.flags.fever;
        f.stage = 3;
        const al = L.ally.filter(a => !a.gone);
        return outcome(L, io, c, {
          title: 'How does the grey fever end?',
          hue: 90,
          entries: [
            good(
              'The cure',
              1 + f.cure * 1.5,
              'rt+2',
              '{hero} brings the mountain flower down, and the grey fever ends.',
              {
                fx: s2 => (s2.flags.fame = S.rep(s2, 'fame') + 2),
              }
            ),
            E('It burns itself out', 3, '', 'One spring the fever is simply gone. Nobody knows why.'),
            bad(
              'It takes a friend',
              al.length ? 2 : 0,
              '',
              al.length ? 'The last of the fever takes ' + al[0].name + '.' : '',
              {
                fx: () => removeAlly(L, al[0]),
              }
            ),
            bad('A land of graves', 1.5, 'fate-1', 'By the end, half the villages in the east are empty.'),
          ],
        });
      },
    }),

    /* ---- the grand circuit: enter -> the second round -> the final ---- */
    {
      id: 'circuit',
      name: 'The Grand Circuit',
      emoji: '🏟️',
      w: 1.2,
      run: async (L, io, c) => {
        const way = await choose(L, io, c, {
          emoji: '🏟️',
          title:
            'The Grand Circuit comes once a generation: three tournaments in three cities. Does {hero} enter?'.replace(
              '{hero}',
              L.displayName()
            ),
          options: [
            { label: 'Enter', hint: 'Glory, gold and a crowd that wants blood.' },
            { label: 'Watch from the stands', hint: 'Let the young ones bleed.' },
          ],
        });
        if (way === 1)
          return S.apply(
            L,
            E(
              'A seat in the stands',
              1,
              '',
              '{hero} watches the Circuit with a cup of wine, and bets on the wrong fighter.'
            ),
            c
          );
        c.foe = 'a hungry young fighter';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -12, 0)), {
          emoji: '🏟️',
          title: 'The first round. Do you win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good(
                'Through to the next city',
                1,
                'rt+1',
                '{hero} wins the first round, and the Circuit moves on to the next city.',
                {
                  fx: s => (s.flags.circuit = { stage: 1, wins: 1 }),
                }
              )
            : r === 'lose'
              ? bad('Out in the first round', 1, 'rt-1', '{hero} is knocked out in the first round. The crowd laughs.')
              : E('Through on points', 1, '', 'A draw, and {hero} goes through on points.', {
                  fx: s => (s.flags.circuit = { stage: 1, wins: 0 }),
                }),
          c
        );
      },
    },
    later({
      id: 'circuitRound',
      name: 'The Circuit, second city',
      emoji: '🤺',
      w: 14,
      req: s => !!(s.flags.circuit && s.flags.circuit.stage === 1),
      run: async (L, io, c) => {
        const s = L.saga;
        s.flags.circuit.stage = 2;
        c.foe = 'the champion of the second city';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -6, 6)), {
          emoji: '🤺',
          title: 'The second city’s champion. Do you win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good('Into the final', 1, 'fgt+1', '{hero} beats the champion of the second city. One city left.', {
                fx: s2 => (s2.flags.circuit.wins += 1),
              })
            : r === 'lose'
              ? bad('Knocked out', 1, '', 'The second city’s champion wins, and {hero} limps home.', {
                  scar: true,
                  fx: s2 => (s2.flags.circuit.stage = 3),
                })
              : E('A bloody draw', 1, '', 'A draw so bloody the judges let both through.'),
          c
        );
      },
    }),
    later({
      id: 'circuitFinal',
      name: 'The Circuit final',
      emoji: '🏆',
      w: 20,
      req: s => !!(s.flags.circuit && s.flags.circuit.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga;
        s.flags.circuit.stage = 3;
        c.foe = 'the reigning Grand Champion';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, 2, 14)), {
          emoji: '🏆',
          title: 'The final, before fifty thousand people. Do you win?',
        });
        return S.apply(
          L,
          r === 'win'
            ? good(
                'Grand Champion',
                1,
                'rt+2 fate+1',
                '{hero} wins the Grand Circuit. Fifty thousand people chant the name.',
                {
                  gold: 150,
                  fx: s2 => {
                    s2.flags.fame = S.rep(s2, 'fame') + 2;
                    s2.flags.circuit.won = true;
                  },
                }
              )
            : r === 'lose'
              ? bad(
                  'Runner-up',
                  1,
                  'rt+1',
                  '{hero} loses the final, and still leaves richer and more famous than {g:he|she|they} came.',
                  {
                    gold: 50,
                  }
                )
              : E(
                  'A shared crown',
                  1,
                  'rt+1',
                  'The final ends in a draw, and for the first time in history the crown is shared.',
                  {
                    gold: 80,
                  }
                ),
          c
        );
      },
    }),
  ]);
  Object.assign(S.TURNING, {
    hungryBlade: 1,
    bladeHunger: 1,
    bladeReckoning: 2,
    warBanners: 1,
    warBattle: 1,
    warEnd: 2,
    lostSibling: 1,
    siblingFound: 2,
    greyFever: 1,
    feverEnd: 2,
    circuit: 1,
    circuitFinal: 2,
  });
  Object.assign(S.CH_REGION || {}, {
    hungryBlade: 'ruins',
    bladeHunger: 'plains',
    bladeReckoning: 'volcano',
    warBanners: 'capital',
    warBattle: 'plains',
    warEnd: 'capital',
    lostSibling: 'plains',
    siblingTrail: 'forest',
    siblingFound: 'coast',
    greyFever: 'swamp',
    feverSpreads: 'capital',
    feverEnd: 'mountains',
    circuit: 'capital',
    circuitRound: 'plains',
    circuitFinal: 'capital',
  });
})(typeof window !== 'undefined' ? window : globalThis);
