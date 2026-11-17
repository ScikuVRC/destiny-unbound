# Destiny Unbound: what can be improved

First written 2026-11-13, after 0.2.0-alpha.1. Rewritten 2026-11-17, after 0.3.0-alpha.1, with 100 new ideas
(103-202); updated the same day: 60 of the first 102 and 10 of the new ideas are done and listed at the end.

Each item has a rough size: **S** (an hour or two), **M** (a day), **L** (several days or more).
Items marked ★ are the ones I'd do first. ✅ = done, ⬜ = not yet. Numbers stay the same as items get done.

Where the game stands: 26 wheels per hero, 98 races, 49 story chapters, 10 endings with epilogues and a saga recap,
13 arena worlds with 77 opponents, 34 achievements, 5 themes, 5 languages, a Discord bot with 6 commands,
139 automated checks plus balance, accessibility, performance and licence checks in CI.

**Contents:** [Still to do (1-102)](#still-to-do-from-the-first-list) · [New ideas (103-202)](#new-ideas-103-202) ·
[Done](#done) · [Suggested order](#suggested-order)

---

## Still to do from the first list

### Story mode

3. ⬜ **More arcs (M each).** Four exist. Candidates: a cursed artifact that grows stronger and hungrier, a war between
   two factions where you pick a side, a lost sibling, a plague that spreads across chapters, a tournament circuit.
4. ⬜ **Companion arcs (M).** Companions are a name and a loyalty number. Give them small events: a quarrel, a request,
   a sacrifice, a betrayal that was foreshadowed. (GitHub issue #1 asks for more companions.)
5. ⬜ **The nemesis as a character (M).** Give the nemesis a motive rolled at the start (envy, revenge, duty), lines
   that change with each meeting, and an ending where you become friends or they take your place.
6. ⬜ **Kingdom management light (M).** A kingdom is one object with a "power" number. Add two or three stats (gold,
   army, loyalty) that kingdom events move and that wars read.
10. ⬜ **Difficulty presets for the story (S).** "Gentle / Standard / Brutal" on top of the luck level, changing the
    second-chance rates that already exist in code.

### Arena and versus

11. ⬜ **Arena progression (M).** Fights are one-offs. Add a ladder or gauntlet: five fights in a row, rising rewards,
    one life.
13. ⬜ **Versus improvements (S-M).** Best of three, shareable challenge codes ("beat my hero"), a result card to post.
14. ⬜ **Team fights (L).** Use your companions: three against three.

### Character creation

16. ⬜ **Synergies and set bonuses (M).** Reward combinations (fire element + fire weapon + dragon bloodline) with a
    named bonus shown on the card. Gives players something to hope for while spinning.
18. ⬜ **Quick create (S).** A "surprise me" button that builds a hero in five seconds for players who want the story.
19. ⬜ **Hero comparison (S).** Compare two heroes from the Hall side by side.

### Keeping players

21. ⬜ **Weekly themed events (S each).** "Dragon week": dragon chapters more likely, a special achievement.
22. ⬜ **Unlockables (M).** Achievements unlock wheel entries today. Add cosmetic unlocks: card frames, wheel skins,
    titles, result fonts.
23. ⬜ **A collection book (M).** Track every race, ending, boss and artifact you've seen; show the gaps.
24. ⬜ **Saga goals (S).** Optional objectives picked at the start ("found a dynasty", "slay three dragons") with a
    score bonus.

### Interface and feel

33. ⬜ **Phone layout (M).** Partly done 2026-11-15 and 2026-11-16: Options and Content & mods fit at 320-412 px, and
    phones held sideways put the wheel beside the question, all in emulation (`scripts/layout-check.js`). Still not
    tried on a real phone.
34. ⬜ **Controller polish (S).** Check the Spin settings pop-up and Show upcoming with a controller.
35. ⬜ **Settings search (S).** Partly done 2026-11-14: Options has a Reset this tab button; no search yet.
36. ⬜ **A proper pause menu during story and spins (S).**

### Audio

52. ⬜ ★ **Real sound effects (M).** Wheel ticks, the stop, reveal, rare reveal, button clicks, achievement, death,
    victory. Around 25 sounds. Free licensed packs (CC0) or recorded foley; the mod system already loads custom
    sound files, so the plumbing exists.
54. ⬜ **Adaptive layers (M).** Raise intensity as the wheel slows or a fight gets close.
55. ⬜ **Ending stingers (S).** Ten endings, ten short musical cues.
56. ⬜ **Ambience per arena or chapter (M).** Wind, tavern, battlefield, sea.
57. ⬜ **Voice (L, optional).** A narrator for chapter titles and endings would add a lot; it is also the most expensive.
58. ⬜ **Audio options (S).** Separate sliders exist; add a "dynamic range: night mode" and test with headphones.
59. ⬜ **Haptics on phones and controllers (S).** A tick per slice, a thump on the result.

### Writing and localisation

60. ⬜ ★ **Story text in the other languages (L).** Menus are translated; the story is English everywhere. Spanish
    first (issue #4), then French, German, Japanese.
61. ⬜ ★ **Native-speaker review of French, German and Japanese (M, needs volunteers).** They are AI drafts.
62. ⬜ **Text variety (M).** Most outcomes have one line. Three variants each would stop sagas reading the same.
65. ⬜ **A style guide for writers and translators (S).**
66. ⬜ **Move story text out of code (M).** Chapter text lives inside `story.js` as string literals, which is why
    translating it is hard. A data file per language fixes that.
67. ⬜ **Race names in other languages (S).** Race names stay English everywhere today.
68. ⬜ **More languages (M each).** Portuguese (Brazil), Russian, Chinese, Korean are the usual next four for itch and
    Steam audiences.

### Code

73. ⬜ **Modules instead of script tags (M).** Files attach to a global `FW` and load in a fixed order. ES modules with
    a bundler (esbuild) would give real imports, dead-code checks and a smaller download.
75. ⬜ **Type checking (M).** JSDoc types checked by TypeScript (`checkJs`) would catch wrong field names and missing
    arguments without rewriting anything.
76. ⬜ **Browser tests in CI (M).** Add a few end-to-end tests: finish a hero, play three chapters, open every modal,
    switch language. `scripts/layout-check.js` could run in CI too.
78. ⬜ **Bigger saves in IndexedDB (M).** localStorage is limited (about 5 MB) and synchronous. The Hall of Legends and
    portraits will outgrow it.
85. ⬜ **Electron: auto-update channel choice (S).** Let players pick stable or alpha once a stable build exists.

### Community, store and release

94. ⬜ **Windows code signing (S, costs money).** Removes the SmartScreen warning that scares new players.
95. ⬜ **Mac and Linux testing (M).** Never tested by a human (issues #2 and #3).
97. ⬜ **Devlogs (S each).** Ongoing: one per release on itch.io and Discord (0.2 and 0.3 are posted; the next one is
    drafted in `docs/store/devlog-draft.md`, not committed).
100. ⬜ **Steam (L).** Decided to wait. Needs a store page, Steam achievements, cloud saves and a signed build (the
     capsule art and library hero are ready).

---

## New ideas (103-202)

### Story mode

103. ⬜ **Age that matters (S).** Old heroes lose a little strength and gain wisdom; a few chapters only appear
     after 60.
105. ⬜ **Ancestor spirits (S).** An heir can call on a dead ancestor once per saga for a second chance.
106. ⬜ **After the ending (M).** Damned, Ascended and Undying heroes get one extra chapter set in what comes after.
107. ⬜ **Fame and infamy (M).** Two reputation tracks instead of one; towns, guilds and rulers react to them.
108. ⬜ **Alignment drift (M).** Choices nudge the hero towards good or evil and shift later wheels a little.
109. ⬜ **Scars (S).** A lost fight can leave a lasting scar: shown on the card, mentioned in the log, a small penalty
     or a grim bonus.
110. ⬜ **Gold and a travelling merchant (M).** Chapters pay out gold; a merchant between chapters sells one item.
111. ⬜ **World events (S).** A famine year, a comet, a plague season: a banner that colours a few chapters.
112. ⬜ **Romance in more than one chapter (M).** Courtship, a rival suitor, a wedding, children that can become heirs.
113. ⬜ **Mounts and pets (S).** A new wheel; a mount helps travel chapters, a pet can save the hero once.
114. ⬜ ★ **Secret chapters (S each).** Very rare chapters (about 1 in 500) that only appear for certain combinations,
     like a Necromancer meeting the Lich King.
115. ⬜ **Prophecy foreshadowing (S).** The prophecy is read out vaguely at the start and its meaning shows at the end.
116. ⬜ **Two-hero sagas (L).** Two heroes take turns, their paths cross, and one can save or betray the other.
117. ⬜ **A playable retirement (S).** Retired heroes get a last chapter: a tavern, students, a memoir.
118. ⬜ **Turn back fate (S).** Spend Fate Tokens to undo one death per saga, at a real cost.
119. ⬜ **Guild ranks (M).** Joining a guild gives ranks to climb, with a guild master chapter at the top.
120. ⬜ **Shared saga seeds (S).** Share a seed so friends start the same saga and compare how it went.

### Arena and versus

121. ⬜ ★ **Hall tournament (M).** Eight heroes from your Hall in a bracket, fought with the real odds.
122. ⬜ **Arena hazards (S).** Each world adds a twist: lava, fog, a sacred ground that favours holy heroes.
123. ⬜ **Fight replay (S).** A turn-by-turn view of how a fight was won or lost.
124. ⬜ **Wager tokens on a fight (S).** Bet Fate Tokens on your hero before an arena fight.
125. ⬜ **World boss (M).** A weekly boss that every player chips away at through the world counter (opt-in).
126. ⬜ **Sparring (S).** Fight any opponent without risk to see the odds and learn matchups.
127. ⬜ **Fight today's champion (S).** Versus against the top hero on the daily leaderboard.
128. ⬜ **Matchup chart (S).** A screen that shows which elements and classes beat which.
129. ⬜ **World champion titles (S).** Beat every foe of a world to earn its title on the card.
130. ⬜ **Hero pool fights (L).** Submit a hero to a shared pool; other players fight it and you see how it did.

### Character creation

131. ⬜ **Hero presets (S).** Save a set of locked wheels and start from it next time.
132. ⬜ **Wheel history (S).** The last ten results of each wheel, to see streaks and near misses.
134. ⬜ **Origin story (S).** A short paragraph about where the hero came from, shown when the card is made.
135. ⬜ **Twins (S).** A rare result that makes two heroes sharing race and bloodline.
136. ⬜ **Cursed slices (S).** Rare bad results with a hidden upside that shows later in the saga.
137. ⬜ **Charge the spin (S).** Hold to wind up a stronger spin; looks better, the result stays random.
138. ⬜ **Photo mode for the card (M).** Pick a pose, backdrop and filter before sharing.

### Progression and keeping players

142. ⬜ **Daily streaks (S).** Count days in a row of the daily challenge, with a small badge.
143. ⬜ **Hall filters and search (S).** Sort and filter the Hall by race, ending, rank or date.
146. ⬜ **Tiered achievements (S).** Progress bars and bronze, silver and gold steps for long achievements.
147. ⬜ **Hidden achievements (S).** Secret ones with a riddle as the only hint.
148. ⬜ **Monthly challenge (S).** One fixed rule for a month ("all heroes are undead"), with its own badge.
149. ⬜ **Export your statistics (S).** Your stats and Hall as a spreadsheet file.
150. ⬜ **On this day (S).** The title screen recalls a hero you made a month or a year ago.

### Interface and feel

151. ⬜ **Dyslexia-friendly font option (S).**
152. ⬜ **Screen reader pass (S).** Play a full saga with NVDA and fix what gets in the way.
153. ⬜ **One-handed phone mode (S).** Every button within thumb reach when the phone is held upright.
154. ⬜ **Confirm before leaving a saga (S).** A small check when leaving a saga that is still going.
155. ⬜ **Keyboard help (S).** Press ? to see every shortcut.
156. ⬜ **Story speed and auto-advance (S).** Slow, normal, fast, or let the saga play itself.
157. ⬜ **Search the saga log (S).** Find a name or event in a long saga, and bookmark lines.
158. ⬜ **A pointer that flaps (S).** The pointer bends on each slice and settles when the wheel stops.
159. ⬜ **Particles for legendary results (S).** Embers, sparks or petals, matched to the theme.
160. ⬜ **A title screen that remembers (S).** The last hero's name or ending shows on the title screen.
161. ⬜ **Ultrawide and 4K check (S).** Make sure layout and art hold up at 3440 px and 4K.
162. ⬜ **Save slots (M).** Several sagas side by side instead of one at a time.

### Art

163. ⬜ **Portraits for the other races (L).** 19 portraits cover the 11 most common races; the other 87 still show
     a silhouette.
164. ⬜ **The other chapter illustrations (L).** 12 of 49 chapters have a painting.
165. ⬜ **Companion portraits (M).** A small set by companion type.
166. ⬜ **Nemesis portraits (M).** One per nemesis motive, once item 5 exists.
167. ⬜ **Moving title screens (M).** A slow parallax or drifting particles over the painted title art.
168. ⬜ ★ **A map of the saga (M).** A painted world map with the hero's path drawn across it, in the recap.
169. ⬜ **Card frames per theme (M).** Each theme gets its own set of eight rank frames.
170. ⬜ **Seasonal title variants (S).** Snow in winter, falling leaves in autumn.

### Audio

171. ⬜ **Listen through the HD music (S).** Check every theme's tracks fit their moments, and replace the weak ones.
172. ⬜ **Musical motifs for race groups (L).** Elves, dwarves, undead and so on each get a short theme.
173. ⬜ **A sound for the rare creep (S).** A rising note while a rare slice creeps towards the pointer.
174. ⬜ **Music ducking (S).** Lower the music under stingers and big results.
175. ⬜ **Jukebox (S).** Play any unlocked track from the extras menu.
176. ⬜ **Sound examples in the mod kit (S).** A sample sound pack that shows modders how to replace sounds.

### Writing and lore

177. ⬜ **Tone per theme (M).** Darker wording in grim themes, lighter in the forest theme.
178. ⬜ **A quote on the card (S).** One line in the hero's voice, chosen by personality.
182. ⬜ **Credits with your saga (S).** A Legend ending rolls credits that name the hero's companions and foes.
183. ⬜ **Community chapters (S).** A guide for players who want to write chapters as mods.

### Mods

184. ⬜ **Hot reload (S).** Mods reload in the desktop app without restarting.
185. ⬜ **Clear mod errors (S).** A broken mod says what and where, in the game, in plain words.
186. ⬜ **Share mods by code (M).** Small wheel packs shared as a code, like Legend Codes.
187. ⬜ **Steam Workshop (L).** Once the game is on Steam.
188. ⬜ **Story chapters as mods (M).** A documented way to add chapters, choices and endings.

### Code and tech

189. ⬜ **Cloud save with a recovery code (M).** Keep the Hall safe across devices through the world counter, opt-in.
190. ⬜ **Snapshot tests of story text (S).** Catch accidental changes to chapter text.
191. ⬜ **Fuzz the Legend Code reader (S).** Feed it broken and huge codes to make sure it never crashes.
192. ⬜ **Lazy loading (S).** Load languages and story art only when needed.
193. ⬜ **Offline check for the browser version (S).** Test that the itch.io version works with the network off.
194. ⬜ **Crash-free rate (S).** A simple number from the error reports per release.
195. ⬜ **Android APK (M).** Wrap the game with Capacitor once updates slow down (looked at 2026-11-17: about half a
     day for a first APK).

### Community and release

196. ⬜ **Daily hero of the day (S).** The bot posts the top daily hero to Discord each evening.
197. ⬜ **Bot: /challenge (S).** Posts the daily seed so the server plays the same saga.
198. ⬜ **QR code on shared cards (S).** Scan the card image to open the hero.
199. ⬜ **Feedback in the game (S).** A short "how was this saga?" note after an ending, opt-in.
200. ⬜ **Streamer mode (L).** Twitch chat votes on choices and spins.
201. ⬜ **Store pages in other languages (S).** itch.io and Steam text in the five game languages.
202. ⬜ **Playtest sessions (S).** Scheduled sessions on Discord with a short survey afterwards.

---

## Done

60 of the first 102, and 10 of the new ideas.

### Done 2026-11-17 (second batch)

99. ✅ **Mod gallery.** 2026-11-17: [mod-gallery.md](mod-gallery.md), a Share a mod form on GitHub and a #mods forum on the Discord (tags: Theme, Wheel pack, Sounds, Work in progress).
27. ✅ **Apply the spin-screen polish everywhere.** 2026-11-17: the Spin button sits right under the home settings, the card's look choices are one Style menu, and the Hall has a level bar, statistics and favourites.
29. ✅ **Wheel readability with many slices.** 2026-11-17: a strip under crowded wheels (24 slices or more) names the slice at the pointer and two on each side while it turns.
31. ✅ **Onboarding.** 2026-11-17: a guided first hero: four short notes during the first spins (what a wheel does, buffs and debuffs, Fate Tokens, luck and Auto). Players with saved heroes skip it.
32. ✅ **Transitions.** 2026-11-17: screens fade in, pop-ups rise in, and the wheel winds up a little before each spin (none with animations off, a plain fade when reduced).
64. ✅ **Gendered and plural text.** 2026-11-17: `{p:one|other}` plural forms with each language's own rules and `{g:his|her|their}` that follows the hero's presentation (`FW.fmt` in `i18n.js`). Story lines about the hero use it.
72. ✅ **Break up `story.js`.** 2026-11-17: the 49 chapters live in six files in `app/js/chapters/` (3,206 lines down to about 1,250); the same seeds tell exactly the same stories.
101. ✅ **Press kit.** 2026-11-17: [press-kit.md](press-kit.md): fact sheet, description, images, how it was made, contact.
104. ✅ **Heroes from your Hall return.** 2026-11-17: only heroes who lived, or cheated death (the Undying), come back as a mentor, a rival who tests you, or a stranger. An option in the story settings.
133. ✅ **Wheel editor in the game.** 2026-11-17: your own Workshop entries get a description and checked effects (stats, a Fate Token, a weakness and a resistance, lifespan for races), capped at three steps up; they travel in Legend Codes and are checked again when one loads.
139. ✅ **Card backs.** 2026-11-17: Classic plus five patterns (Starfield, Rune circle, Gilded lattice, Embers, Void spiral), unlocked by player level.
140. ✅ **Print-ready card.** 2026-11-17: Share > Print sheet: front and back on A4 at 400 dpi, 64 × 96 mm with crop marks.
141. ✅ **Player level.** 2026-11-17: experience for heroes, chapters, endings and achievements (each counted once); levels unlock card backs.
144. ✅ **Hall statistics.** 2026-11-17: count, sagas, average and best rating, the most common races, endings and ranks.
145. ✅ **Favourite heroes.** 2026-11-17: pin up to five; favourites list first and the first one shows on the title screen.
179. ✅ **Codex.** 2026-11-17: races, worlds and endings fill in as you meet them, with the gaps showing (from the Hall and the title screen).
180. ✅ **Bestiary.** 2026-11-17: every arena foe and dragon with level, elements, trick and your record against them.
181. ✅ **More ways to die.** 2026-11-17: the common deaths have two to six versions each, and narrow escapes six; the recap counts close calls with death.

### Gameplay

1. ✅ ★ **Choices, not only spins.** 2026-11-14: the demon's debt, the dragon, a beaten nemesis and a beaten boss.
2. ✅ ★ **Chapters that react to your hero.** 2026-11-14: heists, hauntings, the sea, training, study, quests, mentors
   and demon loopholes.
7. ✅ **Saga recap screen.** 2026-11-17: chapters, years, fights, the closest fight, biggest upset, turning points,
   legacy and family.
8. ✅ **Epilogues.** 2026-11-17: up to four sentences on the kingdom, heir, nemesis and a closing line per ending.
9. ✅ **Dynasty depth.** 2026-11-14: family traits, house history, growing renown, family tree.
12. ✅ **Boss mechanics.** 2026-11-14: wards, immunities, punished elements, rage, two phases.
15. ✅ **Reroll with consequences.** Decided 2026-11-17: re-spins stay as they are, because players like them.
17. ✅ **Rarity moments.** 2026-11-14: rare results creep, flash and play a fanfare.
20. ✅ **Daily challenge leaderboard.** 2026-11-14, opt-in.

### Interface and feel

25. ✅ ★ **The winning slice lights up.** 2026-11-14.
26. ✅ ★ **A real character card moment.** 2026-11-14: reveal, flip, Share.
28. ✅ **Story screen identity.** 2026-11-15: chapter banner with portrait, the saga as a journal.
30. ✅ **Tooltips for tags.** 2026-11-14.

### Art and assets

37. ✅ ★ **Transparent logo.** 2026-11-13: all four theme logos in `brand/`.
38. ✅ ★ **Default portraits.** 2026-11-14: 19 portraits for the 11 most common races.
39. ✅ **Chapter illustrations.** 2026-11-16: the 12 most common chapters.
40. ✅ **Ending illustrations.** 2026-11-14: all 10.
41. ✅ **Boss and dragon portraits.** 2026-11-14: 7 dragons and the strongest foe of all 13 worlds.
42. ✅ **Arena backdrops.** 2026-11-14: 11 backdrops.
43. ✅ **Icon set.** 2026-11-14: 56 line icons.
44. ✅ **Card frames by rank.** 2026-11-14: eight frames.
45. ✅ **Achievement badges.** 2026-11-16: bronze, silver or gold, drawn in code.
46. ✅ **Wheel skins.** 2026-11-16: a painted rim and hub per theme.
47. ✅ **Painted title menu for phones.** 2026-11-16.
48. ✅ **Store assets.** 2026-11-16: covers, capsules, banner, screenshots, a story GIF; Steam library hero 2026-11-17.
49. ✅ **Trailer.** 2026-11-14: 1080p, on YouTube, linked from the README and itch.io.
50. ✅ **Fifth theme.** 2026-11-16: Verdant Wild; its HD music came 2026-11-17.
51. ✅ **Image format.** 2026-11-16: title art in WebP, 3.8 MB down to 1.6 MB.

### Audio and writing

53. ✅ ★ **Music.** 2026-11-14: optional HD music per theme made with ACE-Step, disclosed in Options and the credits.
63. ✅ **Names for everything.** 2026-11-14: rivals, heirs, houses, realms, cities, ships, makers.

### Code

69. ✅ ★ **Linter and formatter.** 2026-11-13: ESLint and Prettier in CI.
70. ✅ ★ **Content Security Policy.** 2026-11-13.
71. ✅ ★ **Split data from logic.** 2026-11-13: all wheel content in `app/data/`.
74. ✅ **Automated version and cache bump.** 2026-11-17: `scripts/bump-version.js`.
77. ✅ **Save format versioning and migration tests.** 2026-11-16.
79. ✅ **Error reporting.** 2026-11-16: opt-in "Send report" that shows what is sent.
80. ✅ **Performance budget.** 2026-11-17: `scripts/perf-check.js` in CI.
81. ✅ **Accessibility tests in CI.** 2026-11-17: axe on 14 screens and dialogs.
82. ✅ **Dependency and licence check in CI.** 2026-11-17: `scripts/deps-check.js`.
83. ✅ **Bot tests and structure.** 2026-11-17: `bot/handler.js`, `bot/embeds.js`, `tests/bot.test.js`.
84. ✅ **Worker abuse protection.** 2026-11-17: daily caps without storing addresses, `GET /v1/health`.
86. ✅ **Developer docs.** 2026-11-17: `docs/development.md` rewritten.

### Balance and data

87. ✅ **Per-race and per-class win rates.** 2026-11-14: `scripts/win-rates.js`, weakest races and classes tuned.
88. ✅ **Achievement rates.** 2026-11-16: Dynasty at 7%; Born Divine stays rare on purpose.
89. ✅ **Ending spread.** 2026-11-16: retiring 54% to 43%, legend 7% to 14%.
90. ✅ **Balance report in CI.** 2026-11-17: target ranges per luck level.
91. ✅ **Use the world counter data.** 2026-11-16: `scripts/world-vs-sim.js`.
92. ✅ **Telemetry for fun.** 2026-11-16: the opt-in "Share where I stop playing".

### Community and release

93. ✅ ★ **A stable release plan.** 2026-11-14: [release-plan.md](release-plan.md).
96. ✅ **Itch.io page refresh.** 2026-11-14.
98. ✅ **Bot commands.** 2026-11-17: `/daily`, `/legend` and `/versus`.
102. ✅ **A roadmap players can see.** 2026-11-14: [ROADMAP.md](../ROADMAP.md).

---

## Suggested order

1. **Feel:** real sound effects (52), ending stingers (55), pause menu (36).
2. **Play:** quick create (18), saga goals (24), secret chapters (114), a map of the saga (168).
3. **Depth:** companion and nemesis arcs (4, 5), Hall tournament (121), arena gauntlet (11), collection book (23).
4. **Reach:** a real phone test (33), story text translated (60, now ready for plural and gender markers),
   native-speaker reviews (61).
5. **Foundations:** move story text out of code (66), browser tests in CI (76), type checking (75).
