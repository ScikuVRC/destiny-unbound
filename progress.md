# Destiny Unbound: progress

A running record of where the game stands. Update it when something ships, starts or gets decided.
This file is public: server addresses, account, payment and moderation details go in `private-notes.md` (not on GitHub).
Last updated: 2026-11-13 · Current version: **0.2.0-alpha.3.2**

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
| Discord status (Rich Presence) | 0.1.0-alpha.4 | ✅ released 2026-11-13 |
| Discord server links in the game | 0.1.0-alpha.5 | ✅ released 2026-11-13 |
| New achievements, accessibility pass, phone layout, French, German and Japanese, Ember Dominion mod template | 0.1.0-alpha.6 | ✅ released 2026-11-13 |
| Story arcs and endings, balance pass, spin screen redesign, world counter | 0.2.0-alpha.1 | ✅ released 2026-11-13 |
| Content split from code, linter, CSP, transparent logos, mod theme fix | 0.2.0-alpha.2 | ✅ released 2026-11-13 |
| Story choices, hero-aware chapters, card moment, battle art, icons, official mods, daily leaderboard | 0.2.0-alpha.3 | ✅ released 2026-11-14 |
| Trading-card fronts and back, /patchnotes on Discord (small update) | 0.2.0-alpha.3.1 | ✅ released 2026-11-14 |
| Shared cards: viewer, collection, Versus, short card codes (small update) | 0.2.0-alpha.3.2 | ✅ released 2026-11-14 |
| Alpha test with 5-15 players | two weeks after release | ⬜ |
| Beta (fixes from the alpha, signed build, store page) | 0.2.0-beta.1 | ⬜ |
| 1.0 on itch.io | 1.0.0 | ⬜ |

---

## Right now

- ✅ Rename the GitHub repo to `destiny-unbound` and make it public (done 2026-11-12)
- ✅ Push the latest commits after the rename
- ✅ Publish 0.1.0-alpha.1 as a GitHub pre-release (done 2026-11-12: Windows, macOS and Linux builds)
- ✅ itch.io page published 2026-11-12: https://bzrkherja.itch.io/destiny-unbound (playable in the browser, Windows builds via `npm run itch`, AI disclosure)
- ✅ Discord channels, 2026-11-13: Start here (#welcome, #rules, #announcements), Community (#general, #share-your-legends, #mods-and-packs, #spin-the-wheel, #art-and-portraits, #off-topic), Testing (#bug-reports, #suggestions, #feedback, #tester-chat for Testers), a staff area and General voice. Permissions set per role, and anti-spam and moderation protection turned on. `/spin` only works in #spin-the-wheel
- ✅ Discord bot, 2026-11-13: `/spin` (and `/spin luck:Mythic`) rolls a legend with the game's real wheels (`bot/`). Runs on a small Linux server; setup and updates in `bot/README.md`
- ✅ Discord server, 2026-11-13: created ("Destiny Unbound", emblem icon). Channels: Start here (#welcome, #rules, #announcements, read-only for members), Community (#general, #share-your-legends, #mods-and-packs, General voice), Testing (#bug-reports and #suggestions forums, #feedback). Permanent invite: https://discord.gg/McDS5HVxzJ. Roles: Developer (owner), Moderator, Tester, Modder. Community mode and Onboarding on: new members answer "What brings you to Destiny Unbound?" (Help test the alpha → Tester, Make mods and wheel packs → Modder, Play and hang out), get a welcome sign and three to-dos. #bug-reports and #suggestions have posting guidelines and tags (Fixed and Planned are moderator-only). Tester invite texts and checklist: `docs/tester-invite.md`. Welcome and rules posted and pinned; linked from the README and the itch.io page. In the game (since 0.1.0-alpha.5): a Discord link in the title-screen footer, a "Talk on Discord" button in Send feedback, and a Community section in Credits (`FW.DISCORD_URL` in `app/js/system.js`)
- ✅ Discord welcome post updated 2026-11-13: "Where to go" now lists #off-topic, #spin-the-wheel and #art-and-portraits, and tells Testers about #tester-chat (still pinned)
- ✅ Release announcements, 2026-11-13: every release tag posts an embed in #announcements through a webhook (`scripts/discord-announce.js`, the `announce` job in `release.yml`, secret `DISCORD_WEBHOOK`). `announce-test.yml` sends a manual test post
- ✅ itch.io uploads from CI: the `itch` job in `release.yml` uploads every release tag (`BUTLER_API_KEY` secret added 2026-11-13; first run with 0.1.0-alpha.6). By hand: `node scripts/itch-push.js --web --modkit`
- ✅ Issue forms (bug report, suggestion) and `CONTRIBUTING.md`, 2026-11-13
- ✅ Trailer and GIF from real gameplay, 2026-11-13 (`npm run trailer`; GIF in the README and a 2.2 MB one on itch.io). ⬜ Upload the trailer to YouTube or Vimeo so the itch.io page can embed it
- ✅ Tester invites ready, 2026-11-13: texts in `docs/tester-invite.md` (Tester role and Testing channels, itch.io and Discord links, what to test, bug reports in #bug-reports or the GitHub issue forms), plan in `docs/alpha-testing.md`. Sent by the developer as an open call

## Ready for the next alpha (not released yet)

- Nothing yet

## Released

### 0.2.0-alpha.1 (2026-11-13, notes in `CHANGELOG.md`)

- ✅ Story arcs (prophecy, demon pact, sealed evil, heir comes of age), 8 new chapters (49), 6 new endings (10), 5 new achievements (34)
- ✅ Balance: 10,000-saga checks per luck; Heroic arena 51% -> 60%, story battles 45% -> 53%, deaths 48% -> 35%; more chapter variety
- ✅ Spin screen lined up: Re-spin token badge, Spin settings pop-up, legend shows rolled rows with Show upcoming; desktop and itch.io layouts checked with `scripts/layout-check.js`
- ✅ Opt-in world counter (`worker/`, Options > Data) and `/stats` on the Discord bot

### 0.1.0-alpha.6 (2026-11-13, notes in `CHANGELOG.md`)

- ✅ Seven new achievements (29 in all): daily challenges on three days, first arena win, five arena wins with one hero ("The Arena Champion" title), win at under 15% odds, spare a beaten foe, recruit a beaten foe, lose a fight and fight again. `node scripts/achievement-report.js` shows how often each one is earned
- ✅ Accessibility pass: page landmarks and headings, named dialogs that trap and return focus, a visible focus ring, keyboard support on the logo, labelled selects, better contrast on locked achievements; the axe audit finds 0 problems
- ✅ Escape closes a dialog without also going back a screen
- ✅ Phones: the top bar wraps instead of hiding buttons, and the title menu scrolls on short screens; no sideways scrolling at phone sizes; the wheel stays smooth with the CPU slowed 6×
- ✅ Fuller phone layout: the top bar fits one row at 375 px in English, the wheel sizes to the screen height so SPIN stays on screen, 34-40 px tap targets on touch screens, a dialog's Close button stays visible while it scrolls, and a themed language select
- ✅ Achievement names, descriptions and rewards are translated (they were always English before)
- ✅ French, German and Japanese (AI drafts of all 707 menu and game texts; corrections from native speakers welcome). Story text stays in English
- ✅ Mod kit: template 07, **The Ember Dominion**, an original grimdark sci-fi content pack (theme plus wheel entries); title tier docs fixed to `tt=1..3`

### Earlier alphas

- ✅ Mod kit (2026-11-13): guide, reference, JSON schemas and 7 templates in `modkit/`; `npm run modkit` builds the zip, which ships with every GitHub release and on itch.io

- ✅ Discord status (Rich Presence), 2026-11-13: built and tested (`electron/discord.js`, `app/js/presence.js`, `docs/discord.md`). Discord application created (ID `1570658915233046528` in package.json `discordAppId`), icon and five art assets uploaded, checked against the real Discord app. Shipped in 0.1.0-alpha.4

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

## 0.2: the next major update

0.1.0-alpha.6 is the last 0.1 release. Everything new now goes toward 0.2.

### Focus (chosen 2026-11-13, in this order)

1. ✅ **More story**: new chapter types, longer sagas, more endings (0.2.0-alpha.1)
2. ⬜ **More Discord bot commands** (for example today's daily challenge, or a Legend Code shown as a card)
3. ✅ **A transparent logo** for store pages and the title screens of mod themes: all four theme logos, in `brand/`

### Must have (the beta basics)

- ⬜ Fix what the alpha testers find (two-week test with 5-15 players, after the invites go out)
- ⬜ Desktop layout: SPIN sits below the fold at 1280×800
- ⬜ Phones: the painted title menu (it still falls back to a simple list); check the phone layout on a real iPhone and Android
- ⬜ Test the macOS and Linux builds ([#3](https://github.com/ScikuVRC/destiny-unbound/issues/3), [#2](https://github.com/ScikuVRC/destiny-unbound/issues/2))
- ⬜ Story text translated: Spanish first ([#4](https://github.com/ScikuVRC/destiny-unbound/issues/4)), then French, German and Japanese
- ⬜ Native-speaker review of the French, German and Japanese packs (ask on the Discord)
- ⬜ Code-signing certificate for Windows (stops the SmartScreen warning); add `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` secrets. Costs money: decide first

### Later than 0.2

- 💭 Steam (decided 2026-11-13 to wait): store page, capsule images, Steam achievements and cloud saves

### Already settled

- ✅ xAI's terms checked 2026-11-13: outputs are ours to use, but "Created with Grok" must be shown where the art is published (added to the credits, README, itch.io and store kit); every image and prompt is in `docs/art-credits.md`. Make future art by hand on grok.com or through the official API, since the usage policy forbids automated access

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
| Automated checks | 84 passing (7 suites) | `npm test` |
| Arena average win chance (Mortal / Heroic / Mythic / Divine) | 43% / 57% / 72% / 85% (was 36 / 51 / 69 / 84) | `node scripts/balance-report.js 10000 10000` |
| Mortal-luck arena fights at 10% or less | 12% (was 23%) | balance report |
| Story battles, average win chance (Heroic) | 54% (was 45%) | balance report |
| Sagas ending in a death (Heroic) | 40% (was 48%) | balance report |
| Saga length (median / 1 in 10) | 12-13 / 28 chapters (was 7-8 / 18) | balance report |
| Deaths in chapter 1 | 2-3% (was 5-9%) | balance report |
| Installer size | about 120 MB | `npm run dist` |

## Decisions log

| Date | Decision |
| --- | --- |
| 2026-11-12 | Name: Destiny Unbound. Internal id stays `fatewheel` so saves and updates carry over |
| 2026-11-12 | Main menu matches the selected theme (all four painted designs) |
| 2026-11-12 | Astral Oracle replaces the Adventurer's Sheet theme |
| 2026-11-12 | Analytics stay local only; nothing is sent automatically |
| 2026-11-13 | One exception, opt-in only: the world counter (Options > Data, off by default) sends an anonymous "hero made" or "saga ended: <ending>" count to a Cloudflare Worker (`worker/`); `/stats` on the Discord shows the totals |
| 2026-11-12 | Repository becomes public as `ScikuVRC/destiny-unbound` |
| 2026-11-12 | AI use is disclosed in the README, the credits and the store page |
| 2026-11-13 | Content packs are mods; the sci-fi pack is original (no licensed setting) |
| 2026-11-13 | `/spin` only works in #spin-the-wheel |
| 2026-11-13 | 0.1.0-alpha.6 is the last 0.1 release; the next focus is the 0.2 major update |
| 2026-11-13 | Balance patch after tester feedback ("the odds are against us"), checked with 10,000 legends and 10,000 sagas per luck level: tighter arena matchmaking, bosses and dragons matched to your power, ordinary story foes 5 points easier, more second chances. Mortal stays the hard mode |
| 2026-11-13 | Story wheel variety: Train, Study, Find treasure and Do a quest have smaller slices, Cursed and Exiled are about half as likely, and a repeatable chapter keeps 60% of its slice each time it happens |
