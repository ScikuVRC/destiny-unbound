/* Destiny Unbound story chapters: Story arcs that run across chapters: the prophecy, the demon pact, the sealed evil, the heir grown up.
   Part of story mode: app/js/story.js holds the rules and helpers, these files only add chapters, and the order the
   files load in (S.CHAPTER_FILES) is the order of the story wheel. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW,
    S = FW.Story;
  const { E, Nm, addAlly, bad, fight, foe, good, lowestLoyal, nearYou, outcome, removeAlly } = S.lib;
  S.addChapters([
    /* ---- story arcs: a chapter starts a thread (saga.flags) and later chapters, hidden until then, carry it on ---- */
    // the prophecy: oracle -> signs -> it comes true (or you defy it)
    {
      id: 'oracle',
      name: 'Visit an oracle',
      emoji: '🔮',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'What does the oracle foretell?',
          hue: 270,
          entries: [
            E('A crown awaits you', 3, 'fate+1', '"You will wear a crown that no one gives you," says the oracle.', {
              fx: s => {
                s.flags.prophecy = { kind: 'crown', stage: 1 };
              },
            }),
            E('You will save the world', 3, 'rt+1', '"When the sky breaks, you alone will stand," says the oracle.', {
              fx: s => {
                s.flags.prophecy = { kind: 'savior', stage: 1 };
              },
            }),
            E(
              'A friend will betray you',
              2,
              'int+1',
              '"The hand you trust most will hold the knife," says the oracle.',
              {
                tone: 'bad',
                fx: s => {
                  s.flags.prophecy = { kind: 'betrayal', stage: 1 };
                },
              }
            ),
            E(
              'You will become a legend',
              2,
              '',
              '"You will become a story, and the story will outlive you," says the oracle.',
              {
                fx: s => {
                  s.flags.prophecy = { kind: 'legend', stage: 1 };
                },
              }
            ),
            bad('The oracle sees nothing', 2, 'fate-1', 'The oracle looks at you, goes pale and says nothing at all.'),
          ],
        }),
    },
    {
      hard: true,
      hideLocked: true,
      id: 'omen',
      name: 'Signs of the prophecy',
      emoji: '🌠',
      w: 20,
      req: s => !!(s.flags.prophecy && s.flags.prophecy.stage === 1),
      run: async (L, io, c) => {
        const p = L.saga.flags.prophecy,
          next = () => {
            p.stage = 2;
          };
        return outcome(L, io, c, {
          title: 'The prophecy stirs. What do you see?',
          hue: 270,
          entries: [
            good('A sign in the sky', 3, 'fate+1', 'A comet crosses the sky, just as the oracle said.', { fx: next }),
            good('Strangers know your name', 3, 'rt+1', 'People you have never met whisper about the prophecy.', {
              fx: next,
            }),
            E('You try to run from it', 2, 'spd+1', 'You try to outrun your fate. Every road leads back.', {
              fx: next,
            }),
            bad('A false prophet', 2, 'fate-1', 'Someone else claims your prophecy and raises an army.', {
              fx: () => {
                next();
                p.rival = true;
              },
            }),
          ],
        });
      },
    },
    {
      hard: true,
      hideLocked: true,
      id: 'fate',
      name: 'The prophecy comes true',
      emoji: '📜',
      w: 25,
      req: s => !!(s.flags.prophecy && s.flags.prophecy.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga,
          p = s.flags.prophecy;
        p.stage = 3;
        const done = () => {
          s.flags.fulfilled = true;
        };
        const defy = good('Defy the prophecy', 2, 'fate+2', 'You refuse your fate and write your own.');
        if (p.kind === 'betrayal') {
          const a = lowestLoyal(L, io.rng);
          if (!a)
            return S.apply(
              L,
              good(
                'No one left to betray you',
                1,
                'fate+1',
                'The prophecy waits for a friend you never made. It never comes true.'
              ),
              c
            );
          c.ally = a;
          return outcome(L, io, c, {
            title: 'The knife comes from {ally}. What happens?'.replace('{ally}', a.name),
            hue: 0,
            entries: [
              bad('The betrayal', 3, 'dur-1', '{ally} betrays you, just as the oracle said.', {
                fx: () => {
                  removeAlly(L, a);
                  done();
                },
              }),
              good('You forgive them', 2, 'fate+1', 'You forgive {ally}. The prophecy breaks in your hands.', {
                fx: () => {
                  a.loyalty = 100;
                },
              }),
              E('You strike first', 2, 'rt+1 fate-1', 'You strike {ally} down before the knife can fall.', {
                tone: 'bad',
                fx: () => {
                  removeAlly(L, a);
                },
              }),
              defy,
              bad('The knife finds you', 0.6, '', '{ally} kills {hero}, just as the oracle said.', {
                end: 'dead',
                fx: done,
              }),
            ],
          });
        }
        if (p.kind === 'legend')
          return outcome(L, io, c, {
            title: 'Your story is everywhere. Do you become it?',
            hue: 50,
            entries: [
              good(
                'Pass into legend',
                2,
                'rt+3',
                'One morning {hero} is simply gone. The songs say {g:he|she|they} never died.',
                {
                  end: 'legend',
                  fx: done,
                }
              ),
              good('Live up to the songs', 3, 'rt+2 fate+1', 'You become the hero the songs describe.', { fx: done }),
              defy,
            ],
          });
        c.foe = p.rival ? 'the false prophet' : p.kind === 'crown' ? 'the old dynasty' : 'the breaking sky';
        const r = await fight(
          L,
          io,
          c,
          foe(
            c.foe,
            p.kind === 'savior' ? Math.max(70, nearYou(L, io.rng, 4, 14)) : nearYou(L, io.rng, -2, 12),
            p.kind === 'savior' ? 'a=void,lightning w=holy' : ''
          ),
          { emoji: '📜', scale: p.kind === 'crown' ? 'war' : 'duel', title: 'Does the prophecy come true?' }
        );
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The prophecy is fulfilled. Now what?',
            hue: 50,
            entries:
              p.kind === 'crown'
                ? [
                    good('Crowned as foretold', 4, 'rt+2', 'You take the crown, as the oracle said.', {
                      fx: s2 => {
                        done();
                        if (!s2.kingdom) s2.kingdom = { name: Nm().realm(io.rng), style: 'Prophesied', power: 55 };
                      },
                    }),
                    good(
                      'Ride into legend',
                      2.5,
                      'rt+3',
                      '{hero} takes the crown, rules for a day and rides away into legend.',
                      { end: 'fulfilled', fx: done }
                    ),
                  ]
                : [
                    good(
                      'The world is saved',
                      4,
                      'rt+3 fate+1',
                      '{hero} stands alone when the sky breaks, and the world is saved.',
                      { fx: done }
                    ),
                    good(
                      'Ride into legend',
                      2.5,
                      'rt+3',
                      '{hero} saves the world and walks off into the sunrise, a prophecy fulfilled.',
                      { end: 'fulfilled', fx: done }
                    ),
                  ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The prophecy goes wrong...',
            hue: 0,
            entries: [
              bad('A broken prophecy', 4, 'fate-2', 'The prophecy breaks, and so does something in you.'),
              bad('Fulfilled at a price', 2, 'dur-1', 'It comes true, but not the way anyone hoped.', { fx: done }),
              bad(
                'Die so it comes true',
                p.kind === 'savior' ? 2 : 0.6,
                '',
                '{hero} gives {g:his|her|their} life, and the prophecy comes true without {g:him|her|them}.',
                { end: 'martyr', fx: done }
              ),
            ],
          });
        return S.apply(
          L,
          E('Not yet', 1, '', 'The day comes and goes. Maybe the oracle was wrong.', {
            fx: () => {
              p.stage = 2;
            },
          }),
          c
        );
      },
    },
    // the demon pact: power now, the bill later
    {
      id: 'pact',
      name: 'Bargain with a demon',
      emoji: '🩸',
      w: 2,
      run: async (L, io, c) => {
        const sign = s => {
          s.flags.pact = { stage: 1 };
        };
        return outcome(L, io, c, {
          title: 'A demon offers you a deal. What do you ask for?',
          hue: 0,
          entries: [
            E('Power beyond measure', 3, 'pwr+2 all+1', 'You sign in blood. Power floods in.', {
              tone: 'bad',
              fx: sign,
            }),
            E('A crown', 2, 'rt+2', 'You sign, and wake up on a throne.', {
              tone: 'bad',
              if: s => !s.kingdom,
              fx: s => {
                sign(s);
                s.kingdom = { name: Nm().realm(io.rng), style: 'Demon-given', power: 50 };
              },
            }),
            E('Youth', 2, 'dur+1', 'You sign, and thirty years fall away from you.', {
              tone: 'bad',
              fx: s => {
                sign(s);
                s.years = Math.max(0, s.years - 30);
              },
            }),
            E('Luck', 2, 'fate+3', 'You sign. Coins land your way from now on.', { tone: 'bad', fx: sign }),
            good('Refuse', 3, 'fate+1', 'You tear up the contract. The demon laughs and leaves.'),
          ],
        });
      },
    },
    {
      hard: true,
      hideLocked: true,
      repeat: true,
      id: 'debt',
      name: 'The demon comes to collect',
      emoji: '👿',
      w: 15,
      req: s => !!(s.flags.pact && s.flags.pact.stage === 1),
      run: async (L, io, c) => {
        const d = L.saga.flags.pact;
        d.stage = 2;
        c.foe = 'the demon';
        const how = await outcome(L, io, c, {
          title: 'The demon wants its due. What happens?',
          hue: 0,
          choice: {
            title: 'The demon wants its due. What do you do?',
            options: [
              { label: 'Refuse and fight', hint: 'No more deals. Steel and fire.', keep: ['Fight the demon'] },
              {
                label: 'Pay what you owe',
                hint: 'A treasure, years of your life, or worse.',
                keep: ['Pay with a treasure', 'Pay with years', 'Pay with your soul'],
              },
              {
                label: 'Look for a loophole',
                hint: 'A sharp mind can twist a contract. A dull one gets damned.',
                keep: ['Find a loophole', 'Pay with years', 'Pay with your soul'],
                boost: { 'Find a loophole': 2.5 },
                fit: 'cunning',
              },
            ],
          },
          entries: [
            E('Fight the demon', 4, '', 'You refuse to pay.', { quiet: true }),
            bad('Pay with a treasure', 2, '', 'You pay with your finest artifact.', {
              if: s => s.artifacts.length > 0,
              fx: s => {
                s.artifacts.pop();
              },
            }),
            bad('Pay with years', 2, '', 'The demon takes twenty years of your life.', { years: 20 }),
            good('Find a loophole', 1.5, 'int+1 rt+1', 'You find a loophole in the contract. The demon howls.', {
              fx: s => {
                s.flags.cheated = true;
              },
            }),
            bad('Pay with your soul', 1, '', 'The demon drags {hero} below.', {
              end: 'damned',
              alive: 'The demon tries to take your soul, and gets only part of it.',
            }),
          ],
        });
        if (how.name !== 'Fight the demon') return how;
        const r = await fight(
          L,
          io,
          c,
          foe('the demon', Math.max(60, nearYou(L, io.rng, 0, 14)), 'a=fire,shadow w=holy'),
          { emoji: '👿', title: 'Can you beat the demon?' }
        );
        if (r === 'win')
          return S.apply(
            L,
            good('Contract burned', 1, 'rt+2', 'You beat the demon and burn the contract.', {
              fx: s => {
                s.flags.cheated = true;
              },
            }),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The demon wins...',
            hue: 0,
            entries: [
              bad('Dragged below', 2, '', 'The demon drags {hero} below.', {
                end: 'damned',
                alive: 'The demon drags you halfway below before you claw your way back.',
              }),
              bad('The debt doubles', 3, 'fate-2', 'The demon lets you go, and doubles what you owe.', {
                fx: () => {
                  d.stage = 1;
                },
              }),
              bad('Marked', 3, 'w=holy', 'The demon brands you as its own.'),
            ],
          });
        return S.apply(
          L,
          E('It will be back', 1, '', 'The demon fades, smiling. It will be back.', {
            fx: () => {
              d.stage = 1;
            },
          }),
          c
        );
      },
    },
    // the sealed evil: seal weakens -> it wakes -> the world needs a hero
    {
      id: 'seal',
      name: 'The ancient seal weakens',
      emoji: '🗝️',
      w: 2,
      run: async (L, io, c) => {
        const stir = s => {
          s.flags.seal = { stage: 1 };
        };
        return outcome(L, io, c, {
          title: 'Something old stirs beneath the world. How do you notice?',
          hue: 250,
          entries: [
            bad('The dead walk', 3, 'dur-1', 'The dead rise from their graves and walk toward the old mountain.', {
              fx: stir,
            }),
            E('Strange dreams', 3, 'int+1', 'Every night you dream of a door, and something knocking.', { fx: stir }),
            bad('A cult rises', 2, 'fate-1', 'A cult gathers in the hills, chanting a name no one should know.', {
              fx: stir,
            }),
            good(
              'You mend the seal',
              2,
              'fate+1 pwr+1',
              'You find the cracking seal and mend it before anything gets out.'
            ),
          ],
        });
      },
    },
    {
      hard: true,
      hideLocked: true,
      id: 'awaken',
      name: 'The evil awakens',
      emoji: '👁️',
      w: 20,
      req: s => !!(s.flags.seal && s.flags.seal.stage === 1),
      run: async (L, io, c) => {
        L.saga.flags.seal.stage = 2;
        c.foe = 'the Herald of the Sleeper';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -2, 12), 'a=void,shadow w=holy'), {
          emoji: '👁️',
          title: 'The Herald comes for you. Do you win?',
        });
        if (r === 'win')
          return S.apply(
            L,
            good('Herald slain', 1, 'rt+1 fgt+1', 'You cut down the Herald. The Sleeper stirs anyway.'),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The Herald wins...',
            hue: 0,
            entries: [
              bad('Darkness spreads', 4, 'fate-1', 'The Herald walks on, and the sky grows dark.'),
              bad('Slain by the Herald', 2, '', 'The Herald of the Sleeper kills {hero}.', { end: 'dead' }),
            ],
          });
        return S.apply(
          L,
          E('The Herald withdraws', 1, '', 'The Herald withdraws into the dark, to wake its master.'),
          c
        );
      },
    },
    {
      hard: true,
      hideLocked: true,
      id: 'lastStand',
      name: 'The world needs a hero',
      emoji: '🌑',
      w: 25,
      req: s => !!(s.flags.seal && s.flags.seal.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga;
        s.flags.seal.stage = 3;
        c.foe = 'the Sleeper beneath the world';
        const r = await fight(L, io, c, foe(c.foe, 88, 'a=void,shadow,mind w=holy'), {
          scale: 'war',
          emoji: '🌑',
          title: 'The Sleeper wakes. Can the world be saved?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The Sleeper falls. What becomes of you?',
            hue: 50,
            entries: [
              good('The evil is destroyed', 4, 'all+1 rt+4', '{hero} destroys the Sleeper beneath the world.', {
                fx: s2 => {
                  s2.flags.evilSlain = true;
                },
              }),
              good(
                'Pass into legend',
                1,
                'rt+4',
                '{hero} destroys the Sleeper and vanishes in the light. The songs never stop.',
                {
                  end: 'legend',
                  fx: s2 => {
                    s2.flags.evilSlain = true;
                  },
                }
              ),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The Sleeper is too strong...',
            hue: 0,
            entries: [
              bad(
                'Seal it with your life',
                3,
                '',
                '{hero} gives {g:his|her|their} life to seal the Sleeper away again.',
                {
                  end: 'sealed',
                  alive: 'You seal the Sleeper away again, and it nearly costs you everything.',
                }
              ),
              bad('Fall so others can flee', 2, '', '{hero} holds the Sleeper back long enough for the world to run.', {
                end: 'martyr',
                alive: 'You hold the Sleeper back until everyone escapes, and crawl out last.',
              }),
              bad(
                'The world falls into shadow',
                2,
                'fate-2 rt-2',
                'The Sleeper walks the world. You live on, in the dark.'
              ),
            ],
          });
        return S.apply(L, E('It sleeps again', 1, 'fate+1', 'The Sleeper sinks back beneath the world. For now.'), c);
      },
    },
    // the heir grows up
    {
      hard: true,
      hideLocked: true,
      id: 'heirGrown',
      name: 'Your heir comes of age',
      emoji: '🧒',
      w: 8,
      req: s => !!(s.heir && !s.heir.grown),
      run: async (L, io, c) => {
        const s = L.saga,
          h = s.heir;
        h.grown = true;
        const lv = nearYou(L, io.rng, -12, 4);
        return outcome(L, io, c, {
          title: h.name + ' is grown. Who have they become?',
          hue: 50,
          entries: [
            good('A worthy heir', 4, 'fate+1', '{heir} grows up strong and fights at your side.', {
              fx: () => addAlly(L, h.name + ' (your heir)', lv, 'family', 95),
            }),
            good('Greater than you', 1.5, 'rt+1', '{heir} becomes greater than you ever were.', {
              fx: () => {
                h.blessed = true;
                addAlly(L, h.name + ' (your heir)', lv + 12, 'family', 90);
              },
            }),
            bad('A bitter rival', 2, 'fate-1', '{heir} turns against you and leaves in anger.', {
              fx: () => {
                h.rival = true;
              },
            }),
            E('Off on their own adventure', 2, '', '{heir} leaves home to write their own story.'),
            E('Takes your throne', 2, '', '{heir} takes the throne of {kingdom}. You step aside.', {
              if: s2 => !!s2.kingdom,
              end: 'retired',
            }),
          ],
        });
      },
    },
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
