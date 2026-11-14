# Destiny Unbound: what can be improved

Written 2026-11-13, after 0.2.0-alpha.1. Based on a pass through the code, assets, tests and docs.
Each item has a rough size: **S** (an hour or two), **M** (a day), **L** (several days or more).
Items marked ★ are the ones I'd do first. ✅ = done, ⬜ = not yet. Numbers stay the same as items get done.

Where the game stands: about 6,800 lines of game code, 26 wheels per hero, 98 races, 49 story chapters,
10 endings, 13 arena worlds with 77 opponents, 34 achievements, 4 themes, 5 languages, 87 automated checks.

---

## 1. Gameplay

### Story mode
1. ✅ ★ **Choices, not only spins (M).** Done 2026-11-14: the demon's debt, the dragon, a beaten nemesis and a beaten boss. Every outcome is a wheel. Let the player pick between two or three options at
   key moments (spare or kill, pay the demon or fight it), with the wheel deciding how it goes. This is the biggest
   step from "watching" to "playing".
2. ✅ ★ **Chapters that react to your hero (M).** Done 2026-11-14 for heists, hauntings, the sea, training, study, quests, mentors and demon loopholes. Class, personality, element and weakness barely change the story. A
   Thief should get better heist odds (the guild already does this), a Necromancer different haunted outcomes, a
   hero weak to fire a worse dragon fight, and the text should mention it.
3. ⬜ **More arcs (M each).** Four exist. Candidates: a cursed artifact that grows stronger and hungrier, a war between
   two factions where you pick a side, a lost sibling, a plague that spreads across chapters, a tournament circuit.
4. ⬜ **Companion arcs (M).** Companions are a name and a loyalty number. Give them small events: a quarrel, a request,
   a sacrifice, a betrayal that was foreshadowed. (GitHub issue #1 asks for more companions.)
5. ⬜ **The nemesis as a character (M).** Give the nemesis a motive rolled at the start (envy, revenge, duty), lines
   that change with each meeting, and an ending where you become friends or they take your place.
6. ⬜ **Kingdom management light (M).** A kingdom is one object with a "power" number. Add two or three stats (gold,
   army, loyalty) that kingdom events move and that wars read.
7. ⬜ **A saga recap screen (S).** At the end, show a timeline with the turning points, the closest fight, years lived
   and the family tree, not only the log.
8. ⬜ **Epilogues (S).** One paragraph built from flags: what happened to the kingdom, the heir, the nemesis.
9. ✅ **Dynasty depth (M).** Done 2026-11-14: family traits, house history, growing renown, family tree. Heirs inherit one stat and a kingdom. Add family traits, a family tree view and a house
   history that carries across generations (the "Dynasty" achievement is earned by 0% of simulated sagas).
10. ⬜ **Difficulty presets for the story (S).** "Gentle / Standard / Brutal" on top of the luck level, changing the
   second-chance rates that already exist in code.

### Arena and versus
11. ⬜ **Arena progression (M).** Fights are one-offs. Add a ladder or gauntlet: five fights in a row, rising rewards,
   one life.
12. ✅ **Boss mechanics (M).** Done 2026-11-14: wards, immunities, punished elements, rage, two phases. Bosses are a level and a few tags. Give the big ones a gimmick (immune until weakened,
   two phases, punishes a specific element).
13. ⬜ **Versus improvements (S-M).** Best of three, shareable challenge codes ("beat my hero"), a result card to post.
14. ⬜ **Team fights (L).** Use your companions: three against three.

### Character creation
15. ⬜ ★ **Reroll with consequences (S).** Fate Tokens only re-spin. Let a token also "nudge" the wheel one slice either
   way, or lock a result you love before a risky re-spin.
16. ⬜ **Synergies and set bonuses (M).** Reward combinations (fire element + fire weapon + dragon bloodline) with a
   named bonus shown on the card. Gives players something to hope for while spinning.
17. ⬜ **Rarity moments (S).** A rare result gets a glow today. Add a short "legendary" reveal: slow-down, sound sting,
   slice lighting up (the Grok mockups showed the winning slice glowing).
18. ⬜ **Quick create (S).** A "surprise me" button that builds a hero in five seconds for players who want the story.
19. ⬜ **Hero comparison (S).** Compare two heroes from the Hall side by side.

### Keeping players
20. ✅ **Daily challenge leaderboard (M).** Done 2026-11-14 (opt-in; the server part goes live with the next deploy). The world counter service exists; a per-day top-10 of scores (opt-in, a
   chosen display name) is a small step from it.
21. ⬜ **Weekly themed events (S each).** "Dragon week": dragon chapters more likely, a special achievement.
22. ⬜ **Unlockables (M).** Achievements unlock wheel entries today. Add cosmetic unlocks: card frames, wheel skins,
   titles, result fonts.
23. ⬜ **A collection book (M).** Track every race, ending, boss and artifact you've seen; show the gaps.
24. ⬜ **Saga goals (S).** Optional objectives picked at the start ("found a dynasty", "slay three dragons") with a
   score bonus.

---

## 2. Interface and feel

25. ✅ ★ **The winning slice lights up (S).** Done 2026-11-14. The wheel stops and only the text tells you where. Flash and hold the
   winning slice.
26. ✅ ★ **A real character card moment (M).** Done 2026-11-14: reveal, flip to the back, Share. The card is the reward for 26 spins. Animate it assembling, let players
   flip it, and add a "share" button that copies the image.
27. ⬜ **Apply the spin-screen polish everywhere (M).** The card, home, hall and options screens haven't had the same
   alignment pass as the spin screen.
28. ⬜ **Story screen identity (M).** Story chapters reuse the creation screen. Give them a chapter banner, a small
   portrait and the saga log as a proper journal.
29. ⬜ **Wheel readability with many slices (M).** The race wheel has 98 slices; labels at the small end are unreadable.
   Options: zoom the wheel near the pointer while it slows, or show the five slices around the pointer in a strip.
30. ✅ **Tooltips for tags (S).** Done 2026-11-14. "+1 FGT", "In the wilds: +1 ALL" mean nothing to a new player. Hover or tap to explain.
31. ⬜ **Onboarding (M).** The first-run guide is four tooltips. A short guided first hero ("spin three wheels, see
   what they do") would teach buffs, tokens and luck.
32. ⬜ **Transitions (S).** Screens cut. Short fades and a wheel "wind up" make it feel finished.
33. ⬜ **Phone layout (M).** Not checked on real phones. The painted title menu still falls back to a list there.
34. ⬜ **Controller polish (S).** Check the new Spin settings pop-up and Show upcoming with a controller.
35. ⬜ **Settings search and reset per option (S).**
36. ⬜ **A proper pause menu during story and spins (S).**

---

## 3. Art and assets to make

All painted art is made by hand on grok.com and credited "Created with Grok" (logged in `docs/art-credits.md`).

37. ✅ ★ **Transparent logo (S).** Done 2026-11-13: all four theme logos as transparent PNGs in `brand/`, for store
   pages, mod themes and overlays (rebuild with `scripts/make-transparent-logos.py`).
38. ✅ ★ **Default portraits (L).** Done 2026-11-14 for the 11 most common races (19 portraits). Heroes show a silhouette unless the player connects their own image generator.
   A set of painted portraits per race group (start with the 12 most common races, two variants each) would
   transform the card. This is the single biggest visual upgrade.
39. ⬜ **Chapter illustrations (L).** One small painting per chapter type (49), shown as the chapter banner. Start with
   the 12 most common.
40. ✅ **Ending illustrations (M).** Done 2026-11-14: all 10. One per ending (10). Endings are the screens players screenshot.
41. ✅ **Boss and dragon portraits (M).** Done 2026-11-14: 7 dragons and the strongest foe of all 13 worlds. 7 dragons and the top bosses.
42. ✅ **Arena backdrops (M).** Done 2026-11-14: 11 backdrops. 34 arenas are names only. Even 8 backdrops shared by groups would help.
43. ✅ **Icon set (M).** Done 2026-11-14: 56 line icons covering every wheel and chapter. The interface uses emoji, which look different on every system and clash with the painted
   style. A custom icon set (about 60 icons: the 26 wheel types, stats, chapter types) would make it look like one
   game.
44. ✅ **Card frames by rank (M).** Done 2026-11-14. Commoner to Cosmic Being: eight frames of rising fanciness.
45. ⬜ **Achievement badges (M).** 34 small emblems instead of emoji.
46. ⬜ **Wheel skins (M).** The wheel is drawn in code. Painted hubs and rims per theme, as overlays.
47. ⬜ **Painted title menu for phones (M).**
48. ⬜ **Store assets (M).** Capsule images, a banner, 6-8 fresh screenshots of 0.2, an animated GIF of an arc.
49. ⬜ **Trailer (S for you).** Upload the existing one; then a 0.2 trailer showing arcs and endings.
50. ⬜ **Fifth theme (L).** Parked: a new painted title screen, wheel, sounds and music.
51. ⬜ **Image format (S).** The 12 title images are JPG, 3.8 MB. WebP or AVIF would cut that by half or more and speed
   up the itch.io load.

---

## 4. Audio

Everything is synthesized in 146 lines of code: clever and tiny, but it sounds like a prototype.

52. ⬜ ★ **Real sound effects (M).** Wheel ticks, the stop, reveal, rare reveal, button clicks, achievement, death,
   victory. Around 25 sounds. Free licensed packs (CC0) or recorded foley; the mod system already loads custom
   sound files, so the plumbing exists.
53. ⬜ ★ **Music (L).** Each theme has a generated drone. Real tracks: a title piece, a spinning loop, a story loop, a
   battle loop and stingers for death, victory and ascension, per theme or shared. Options: commission, CC0
   libraries, or compose. Disclose the source like the art.
54. ⬜ **Adaptive layers (M).** Raise intensity as the wheel slows or a fight gets close.
55. ⬜ **Ending stingers (S).** Ten endings, ten short musical cues.
56. ⬜ **Ambience per arena or chapter (M).** Wind, tavern, battlefield, sea.
57. ⬜ **Voice (L, optional).** A narrator for chapter titles and endings would add a lot; it is also the most expensive.
58. ⬜ **Audio options (S).** Separate sliders exist; add a "dynamic range: night mode" and test with headphones.
59. ⬜ **Haptics on phones and controllers (S).** A tick per slice, a thump on the result.

---

## 5. Writing and localisation

60. ⬜ ★ **Story text in the other languages (L).** Menus are translated; the story is English everywhere. Spanish
   first (issue #4), then French, German, Japanese.
61. ⬜ ★ **Native-speaker review of French, German and Japanese (M, needs volunteers).** They are AI drafts.
62. ⬜ **Text variety (M).** Most outcomes have one line. Three variants each would stop sagas reading the same.
63. ✅ **Names for everything (S).** Done 2026-11-14: names for rivals, heirs, houses, realms, cities, ships, makers. Generated names for villages, rivals' houses, ships, artifacts' makers.
64. ⬜ **Gendered and plural text (M).** Story text avoids pronouns; languages like Spanish and French need agreement
   rules once the story is translated.
65. ⬜ **A style guide for writers and translators (S).**
66. ⬜ **Move story text out of code (M).** Chapter text lives inside `story.js` as string literals, which is why
   translating it is hard. A data file per language fixes that (see code section).
67. ⬜ **Race names in other languages (S).** Race names stay English everywhere today.
68. ⬜ **More languages (M each).** Portuguese (Brazil), Russian, Chinese, Korean are the usual next four for itch and
   Steam audiences.

---

## 6. Code

69. ✅ ★ **Add a linter and formatter (S).** Done 2026-11-13: ESLint and Prettier (120-character lines), checked in CI;
   all JavaScript formatted once. CSS and HTML keep their compact form. It found the shared "Master" translation bug.
70. ✅ ★ **Add a Content Security Policy to `index.html` (S).** Done 2026-11-13: only the game's own scripts run;
   network and images stay open for the player's AI services. Checked in the browser and the desktop app.
71. ✅ ★ **Split data from logic (M).** Done 2026-11-13 for the wheels: all content is in `app/data/` (seven files by
   topic, format in `app/data/README.md`), checked identical to before. Story text is still in code (item 66).
72. ⬜ **Break up `story.js` (M).** 574 lines with every chapter inline. One file per arc or chapter group, plus a
   small registry.
73. ⬜ **Modules instead of 31 script tags (M).** Files attach to a global `FW` and load in a fixed order. ES modules
   with a bundler (esbuild) would give real imports, dead-code checks, one cache-busted file instead of bumping
   `?v=` in 35 places by hand, and a smaller download.
74. ⬜ **Automate the version and cache bump (S).** `?v=57` and `fatewheel-v47` are edited by hand each change; today's
   work bumped them more than ten times. A build step or a script should do it.
75. ⬜ **Type checking (M).** JSDoc types checked by TypeScript (`checkJs`) would catch the mistakes that slipped
   through this week (a wrong field name, a missing argument) without rewriting anything.
76. ⬜ **Browser tests in CI (M).** The 87 checks run in Node. Add a few Playwright tests: finish a hero, play three
   chapters, open every modal, switch language. `scripts/layout-check.js` could run in CI too.
77. ⬜ **Save format versioning and migration tests (S).** Saves are in localStorage across about 20 keys. Add a schema
   version, a migration step, and tests that old saves still load.
78. ⬜ **Bigger saves in IndexedDB (M).** localStorage is limited (about 5 MB) and synchronous. The Hall of Legends and
   portraits will outgrow it.
79. ⬜ **Error reporting (S).** Errors go to a local log. An opt-in "send this error" button (to the existing
   Cloudflare worker) would surface real bugs.
80. ⬜ **Performance budget (S).** Measure load time on itch.io and frame time during a spin; fail CI if they regress.
81. ⬜ **Accessibility tests in CI (S).** The axe audit was run by hand once; automate it.
82. ⬜ **Dependency and licence check in CI (S).**
83. ⬜ **Bot: tests and structure (S).** `bot/index.js` has no tests of its own; the stats store does.
84. ⬜ **Worker: abuse protection (S).** The counter trusts any client. Rate limiting is on; add a daily cap per
   address and an alert if totals jump.
85. ⬜ **Electron: auto-update channel choice (S).** Let players pick stable or alpha once a stable build exists.
86. ⬜ **Developer docs (S).** `docs/development.md` predates the worker, the layout tools and the balance report.

---

## 7. Balance and data

87. ✅ **Per-race and per-class win rates (S).** Done 2026-11-14: `scripts/win-rates.js`, and the weakest races and classes tuned. The balance report shows the strongest and weakest races; act on
   them. The spread is about 10 points at each luck level.
88. ⬜ **Achievement rates (S).** "Dynasty" is at 0% and "Creature of Habit" can't be simulated; tune or redesign.
89. ⬜ **Ending spread (S).** "Prophecy fulfilled" (about 1%) and "sealed away" (about 2%) are rare enough that most
   players will never see them. Decide which should be rare on purpose.
90. ⬜ **Run the balance report in CI (S)** and fail when a number leaves its target range.
91. ⬜ **Use the world counter data (S).** Once players opt in, compare real endings with the simulated ones.
92. ⬜ **Telemetry for fun, not only fairness (M).** Which chapters make people quit? The local stats already count
   "quit on screen"; an opt-in aggregate would answer it.

---

## 8. Community, store and release

93. ✅ ★ **A stable release plan (S).** Done 2026-11-14: [release-plan.md](release-plan.md). Everything is "alpha". Define what beta and 1.0 mean (the list in
   `progress.md` is a start) and stop adding features for a week before each.
94. ⬜ **Windows code signing (S, costs money).** Removes the SmartScreen warning that scares new players.
95. ⬜ **Mac and Linux testing (M).** Never tested by a human (issues #2 and #3).
96. ⬜ **Itch.io page refresh (S).** New screenshots, the trailer embed, the 0.2 feature list, a devlog post.
97. ⬜ **Devlogs (S each).** Itch.io devlogs and a Discord post per release bring players back.
98. ⬜ **Bot commands (M).** On the 0.2 list: `/daily`, `/legend <code>` to show a card, `/versus`.
99. ⬜ **Mod gallery (M).** A place to share mods and wheel packs: a Discord forum channel first, a page later.
100. ⬜ **Steam (L).** Decided to wait. Needs a store page, capsule art, Steam achievements, cloud saves and a signed
   build.
101. ⬜ **Press kit (S).** One page with logo, screenshots, description and contact.
102. ✅ **A roadmap players can see (S).** Done 2026-11-14: [ROADMAP.md](../ROADMAP.md), linked from the README. A trimmed, public version of this list.

---

## 9. Suggested order

1. **Feel:** winning slice lights up (25), real sound effects (52), tag tooltips (30), card reveal (26).
2. **Play:** choices in story chapters (1), chapters that react to class and personality (2).
3. **Look:** ✅ transparent logo (37), default portraits for the most common races (38), a custom icon set (43).
4. **Foundations:** ✅ linter and formatter (69), ✅ CSP (70), ✅ data split from logic (71), automated version bump (74),
   browser tests in CI (76).
5. **Reach:** story text translated (60), native-speaker reviews (61), itch.io page refresh (96), trailer (49).
6. **Depth:** companion and nemesis arcs (4, 5), arena gauntlet (11), collection book (23), daily leaderboard (20).
