# Destiny Unbound: progress

A running record of where the game stands. Update it when something ships, starts or gets decided.
Last updated: 2026-11-13 · Current version: **0.1.0-alpha.3**

Legend: ✅ done · 🔄 in progress · ⬜ to do · 💭 idea, not decided

---

## Milestones

| Milestone | Target | Status |
| --- | --- | --- |
| Playable prototype (wheels, card, arena) | - | ✅ |
| Story mode, dynasty, achievements, mods | - | ✅ |
| Desktop app (Windows installer, portable, auto-update) | - | ✅ |
| Alpha released (GitHub and itch.io) | 0.1.0-alpha.1 | ✅ released 2026-11-12 |
| First bug-fix alpha | 0.1.0-alpha.2 | ✅ released 2026-11-13 (wheel bounce fix) |
| Play-through fixes, mod kit, itch.io layout | 0.1.0-alpha.3 | ✅ released 2026-11-13 |
| Alpha test with 5-15 players | two weeks after release | ⬜ |
| Beta (fixes from the alpha, signed build, store page) | 0.2.0-beta.1 | ⬜ |
| 1.0 on itch.io | 1.0.0 | ⬜ |

---

## Right now

- ✅ Rename the GitHub repo to `destiny-unbound` and make it public (done 2026-11-12)
- ✅ Push the latest commits after the rename
- ✅ Publish 0.1.0-alpha.1 as a GitHub pre-release (done 2026-11-12: Windows, macOS and Linux builds)
- ✅ itch.io page published 2026-11-12: https://bzrkherja.itch.io/destiny-unbound (playable in the browser, Windows builds via `npm run itch`, AI disclosure)
- ⬜ Set up itch.io payments (PayPal or Stripe) so the "$0 or donate" option can take donations
- ⏸ Discord server for testers: on hold (2026-11-13) until the owner can sign in to Discord. Until then feedback goes to GitHub Issues, itch.io comments and the in-game Send feedback
- ⬜ Send tester invites (see `docs/alpha-testing.md`)

- ✅ Mod kit (2026-11-13): guide, reference, JSON schemas and 7 templates in `modkit/`; `npm run modkit` builds the zip, which ships with every GitHub release and on itch.io

## Bugs (alpha patching)

Newest first. Fixed bugs ship in the next alpha build.

| Status | Bug | Cause and fix |
| --- | --- | --- |
| ✅ Shipped in 0.1.0-alpha.3 | itch.io: you can't see the whole game, it doesn't scale, and you can't scroll even in fullscreen | itch.io's "Enable scrollbars" embed option was off, which blocks scrolling inside the game frame, and the spin screen was too tall for the 960×540 frame. Scrollbars are now on, and short landscape windows put the wheel beside the question and buttons, sized to the window, so a whole spin fits (`app/css/ui.css`). The first-run guide moves aside on short windows. |
| ✅ Shipped in 0.1.0-alpha.3 | Phones: the title screen's footer runs off the right edge and cuts off "Support on Ko-fi" | The footer never wrapped. On narrow screens it now wraps and centres, and hides the keyboard hint (`app/css/ui.css`). |
| ✅ Shipped in 0.1.0-alpha.3 | The card says "0 ally allies" / "2 ally allies" | Broken plural in the card's rating line; also now translated (`app/js/app.js`). |
| ✅ Shipped in 0.1.0-alpha.3 | "Fate Tokens" stays in English on the luck choices and the card in Spanish | The text was built in code without the translator; now translated, with the missing Spanish words added. |
| ✅ Shipped in 0.1.0-alpha.3 | After a story, the card offers "Another fight" for a hero who never fought | The label counted story chronicle entries as fights; now only arena fights count. |
| ✅ Shipped in 0.1.0-alpha.3 | Wheel packs and Mods screens, and Options > Language, send players to "the README" for help that moved to `docs/modding.md` | Pointers updated (English and Spanish). Also "1 wheels" / "1 entries" plurals on the packs list. |
| ✅ Shipped in 0.1.0-alpha.3 | First-run guide step 1 says "Start here with New Legend" but doesn't highlight it | Loading mods redrew the menu and dropped the highlight; a redraw now keeps it (`app/js/menu.js`). |
| ✅ Shipped in 0.1.0-alpha.2 (2026-11-13) | The wheel bounces up and down while spinning | The result line above the wheel shows each name as it passes the pointer; long names used a smaller font and some wrapped, so the line's height jumped between 41 and 86 px and pushed the wheel. The line now has one fixed height with the text centred in it (`app/css/base.css`). |

## Before the beta

- ⬜ Code-signing certificate for Windows (stops the SmartScreen warning); add `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` secrets
- ✅ xAI's terms checked 2026-11-13: outputs are ours to use, but "Created with Grok" must be shown where the art is published (added to the credits, README, itch.io and store kit); every image and prompt is in `docs/art-credits.md`. Make future art by hand on grok.com or through the official API, since the usage policy forbids automated access
- ⬜ A transparent logo (store pages and mod themes)
- ⬜ Fix whatever the alpha testers find
- ⬜ Test the macOS and Linux builds
- ⬜ Translate the remaining story text into Spanish

## Ideas (not decided)

- 💭 A transparent-background logo for the store and the title screen of mod themes
- 💭 Exclusive fullscreen and choosing the sound output device (Electron limits both today)
- 💭 Phone layout pass (the game runs in a phone browser; the painted menu falls back to a simple list)
- 💭 More languages
- 💭 Steam, later (decided 2026-11-13 to wait): store page, capsule images, achievements and cloud saves

---

## Done

### Alpha preparation (0.1.0-alpha.1)

- ✅ Renamed from FateWheel to **Destiny Unbound** (saves, mods and updates keep working under the old internal id)
- ✅ Painted title screen for each theme, built from the approved mockups; logos and art made with Grok
- ✅ New theme **Astral Oracle** replaces Adventurer's Sheet (page style, wheel, card frame, sounds, music)
- ✅ Options screen: graphics, audio, gameplay, accessibility, controls (rebindable keys), language, data
- ✅ Controller support (Xbox, PlayStation, Switch) with matching button prompts
- ✅ Window size, position and mode remembered; mute when the window is in the background
- ✅ Error and crash log, in-game feedback reports with screenshot, daily save backups, save export and import
- ✅ Local-only play stats (shared only if the player ticks the box)
- ✅ First-run guide, credits screen, achievements screen with unlock banners, one-time thank-you and support screen
- ✅ New app icon; version 0.1.0-alpha.1; alpha builds follow pre-release updates
- ✅ Update path tested end to end (an installed alpha.1 updated itself to a test alpha.2)
- ✅ Balance pass: arena matchmaking so weak heroes get fewer hopeless fights
- ✅ Mod safety: theme CSS can't escape its theme or load outside images; Mods-folder shortcuts can't reach outside it
- ✅ Typo sweep (no misspellings found), Spanish for every new screen
- ✅ Performance (wheel redraw about 0.25 ms even at 4K on a slowed CPU) and memory soak (no leak)
- ✅ Works fully offline; clean first launch tested
- ✅ Store kit (text, 8 screenshots, 30-second teaser) and the alpha test plan

### Earlier

- ✅ 40+ wheels and over 1,400 entries with buffs and debuffs; long stat ladders; race-aware age and height
- ✅ Story mode: 32 chapter types, nemesis, kingdoms, wars, dynasty and heirs, story options
- ✅ Arena across 13 worlds and 77 opponents; versus mode; daily challenge
- ✅ Hall of Legends, Legend Codes, character cards, vertical video recorder
- ✅ Art Studio for optional AI portraits with the player's own generator
- ✅ Wheel Workshop, wheel packs, mods, Spanish translation
- ✅ Four themes with their own sounds and generative music
- ✅ Electron desktop app, GitHub Actions for tests and releases, Ko-fi link

---

## Numbers to watch

| What | Now | Where it comes from |
| --- | --- | --- |
| Automated checks | 73 passing | `npm test` |
| Mortal-luck arena fights at 10% or less | 23% | `node scripts/balance-report.js` |
| Sagas ending in death | about 47-50% | balance report |
| Deaths in chapter 1 | 5-9% | balance report |
| Installer size | about 120 MB | `npm run dist` |

## Decisions log

| Date | Decision |
| --- | --- |
| 2026-11-12 | Name: Destiny Unbound. Internal id stays `fatewheel` so saves and updates carry over |
| 2026-11-12 | Main menu matches the selected theme (all four painted designs) |
| 2026-11-12 | Astral Oracle replaces the Adventurer's Sheet theme |
| 2026-11-12 | Analytics stay local only; nothing is sent automatically |
| 2026-11-12 | Repository becomes public as `ScikuVRC/destiny-unbound` |
| 2026-11-12 | AI use is disclosed in the README, the credits and the store page |
