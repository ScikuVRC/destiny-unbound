# Task test: today's game vs the remodel prototype (2026-11-14)

## Setup

- 50 AI testers ran 300 tasks in 5 rounds of 10: 25 on today's game (after the bug fixes) and 25 on the clickable prototype (`proto.html`).
- Each round used five personas. Across all rounds: casual, non-native English speaker, gamer, cautious newcomer, parent, speedrunner, teen, screen-reader user, modder, returning player, impatient player, skeptic, roleplayer, streamer, tired player, 10-year-old, UX critic, keyboard user, dyslexic player, grandparent, minimalist, explorer, competitive player, wheel-of-names user and translator.
- Each persona was given a different task order.
- The testers saw only the screen text and clicked by label. None had seen the design or the code.
- "Done" means the setting was really saved: every tester's final steps were replayed from a fresh start and the saved data was checked.
- An earlier pilot, before the bug fixes, scored today's game 7/15. It found the Workshop's lost-save bug.

## Results

| | Today's game (fixed) | Prototype |
| --- | --- | --- |
| Tasks really done | **149 of 150** | **150 of 150** |
| Tries for all six tasks, median (mean, worst) | 15 (14.5, 22) | **11** (11.0, 17) |
| Tries for the content tasks (Zombie, Dragonborn, romance), median (worst) | 10 (18) | **5** (8) |
| Worst case for "no romance" | 9 tries | 4 tries |
| Tasks the tester wasn't sure about | 5 | 1 |

Try counts are the testers' own estimates and rough, but the pattern held in every round. With the save bug fixed, players do reach every goal in today's game. Content removal takes about twice as many tries, because the Workshop is hidden in the in-game ☰ menu and romance is buried in the "Story chapters" dropdown. Both versions are equally easy for "turn death off", "spin faster" and "turn on a mod".

## Bugs found and fixed in today's game during the test

1. The Workshop threw edits away unless "Save this wheel" was pressed. It now saves every change.
2. The Mods screen showed a fixed "on" label, and after reopening it snapped back to Off. It now shows the real state.
3. The hand-pick lists still offered entries removed in the Workshop. Removed entries are now hidden there.

## What the prototype still needs (most-mentioned first)

1. **Say each switch's state in words** (about 15 testers). "Switch ON Death" read as an order, not a state. Use "Death: On", and an aria-label like "Death, on".
2. **Rename the menu entry.** "Your wheels / Choose what can happen" puzzled several testers, and one looked for "Mods" on the main menu. Suggested: **"Content & mods"**, subtitled "Turn things off, change odds, add mods".
3. **Explain the mod restart.** Testers on both versions weren't sure a mod is on before restarting. Add "On (loads after restart)" and make Restart the main button in the banner.
4. **Pair the likelihood buttons as opposites:** "Rarer" and "More common", and label the step: "+ (about twice as likely)".
5. **Separate Death from Aging.** Add a line on Death: "Old age is a separate switch: Aging".
6. Done during the test: search jumps to the wheel that contains the match, the active preset is highlighted, each entry shows its percentage, and changes say "Saved".

## Caveats

These are AI testers working through a text view. They test findability, missing feedback and silent failures well. They don't judge looks or mouse travel. A short round with a few real players is still worth doing before release.
