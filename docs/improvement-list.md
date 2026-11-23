# Destiny Unbound: what can be improved

First written 2026-11-13, after 0.2.0-alpha.1. Rewritten 2026-11-17, after 0.3.0-alpha.1, with 100 new ideas
(103-202); updated since: 74 of the first 102 and 52 of the new ideas are done and listed at the end.

Each item has a rough size: **S** (an hour or two), **M** (a day), **L** (several days or more).
Items marked ★ are the ones I'd do first. ✅ = done, ⬜ = not yet. Numbers stay the same as items get done.

Where the game stands: 26 wheels per hero, 98 races, 56 story chapters (five of them secret), 10 endings with epilogues and a saga recap,
13 arena worlds with 77 opponents, 34 achievements, 5 themes, 5 languages, a Discord bot with 6 commands,
174 automated checks plus balance, accessibility, performance and licence checks in CI.

**Contents:** [Still to do (1-102)](#still-to-do-from-the-first-list) · [New ideas (103-202)](#new-ideas-103-202) ·
[Done](#done) · [Suggested order](#suggested-order)

---

## Still to do from the first list

### Story mode

5. ⬜ **The nemesis as a character (M).** Give the nemesis a motive rolled at the start (envy, revenge, duty), lines
   that change with each meeting, and an ending where you become friends or they take your place.
10. ⬜ **Difficulty presets for the story (S).** "Gentle / Standard / Brutal" on top of the luck level, changing the
    second-chance rates that already exist in code.

### Arena and versus


### Character creation

    named bonus shown on the card. Gives players something to hope for while spinning.
18. ⬜ **Quick create (S).** A "surprise me" button that builds a hero in five seconds for players who want the story.
19. ⬜ **Hero comparison (S).** Compare two heroes from the Hall side by side.

### Keeping players

21. ⬜ **Weekly themed events (S each).** "Dragon week": dragon chapters more likely, a special achievement.
24. ⬜ **Saga goals (S).** Optional objectives picked at the start ("found a dynasty", "slay three dragons") with a
    score bonus.

### Interface and feel

All done (see Done 2026-11-23).

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

112. ⬜ **Romance in more than one chapter (M).** Courtship, a rival suitor, a wedding, children that can become heirs.
115. ⬜ **Prophecy foreshadowing (S).** The prophecy is read out vaguely at the start and its meaning shows at the end.
116. ⬜ **Two-hero sagas (L).** Two heroes take turns, their paths cross, and one can save or betray the other.
118. ⬜ **Turn back fate (S).** Spend Fate Tokens to undo one death per saga, at a real cost.
120. ⬜ **Shared saga seeds (S).** Share a seed so friends start the same saga and compare how it went.

### Arena and versus

122. ⬜ **Arena hazards (S).** Each world adds a twist: lava, fog, a sacred ground that favours holy heroes.
123. ⬜ **Fight replay (S).** A turn-by-turn view of how a fight was won or lost.
124. ⬜ **Wager tokens on a fight (S).** Bet Fate Tokens on your hero before an arena fight.
126. ⬜ **Sparring (S).** Fight any opponent without risk to see the odds and learn matchups.
127. ⬜ **Fight today's champion (S).** Versus against the top hero on the daily leaderboard.
128. ⬜ **Matchup chart (S).** A screen that shows which elements and classes beat which.
130. ⬜ **Hero pool fights (L).** Submit a hero to a shared pool; other players fight it and you see how it did.

### Character creation

131. ⬜ **Hero presets (S).** Save a set of locked wheels and start from it next time.
132. ⬜ **Wheel history (S).** The last ten results of each wheel, to see streaks and near misses.
134. ⬜ **Origin story (S).** A short paragraph about where the hero came from, shown when the card is made.
135. ⬜ **Twins (S).** A rare result that makes two heroes sharing race and bloodline.
136. ⬜ **Cursed slices (S).** Rare bad results with a hidden upside that shows later in the saga.
138. ⬜ **Photo mode for the card (M).** Pick a pose, backdrop and filter before sharing.

### Progression and keeping players

143. ⬜ **Hall filters and search (S).** Sort and filter the Hall by race, ending, rank or date.
150. ⬜ **On this day (S).** The title screen recalls a hero you made a month or a year ago.

### Interface and feel

All done (see Done 2026-11-23).

### Art

164. ⬜ **The other chapter illustrations (L).** 12 of 49 chapters have a painting.
169. ⬜ **Card frames per theme (M).** Each theme gets its own set of eight rank frames.
170. ⬜ **Seasonal title variants (S).** Snow in winter, falling leaves in autumn.

### Audio

171. ⬜ **Listen through the HD music (S).** Check every theme's tracks fit their moments, and replace the weak ones.
172. ⬜ **Musical motifs for race groups (L).** Elves, dwarves, undead and so on each get a short theme.
173. ⬜ **A sound for the rare creep (S).** A rising note while a rare slice creeps towards the pointer.
174. ⬜ **Music ducking (S).** Lower the music under stingers and big results.
175. ⬜ **Jukebox (S).** Play any unlocked track from the extras menu.

### Writing and lore

177. ⬜ **Tone per theme (M).** Darker wording in grim themes, lighter in the forest theme.
182. ⬜ **Credits with your saga (S).** A Legend ending rolls credits that name the hero's companions and foes.
183. ⬜ **Community chapters (S).** A guide for players who want to write chapters as mods.

### Mods

184. ⬜ **Hot reload (S).** Mods reload in the desktop app without restarting.
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
200. ⬜ **Streamer mode (L).** Twitch chat votes on choices and spins.
201. ⬜ **Store pages in other languages (S).** itch.io and Steam text in the five game languages.
202. ⬜ **Playtest sessions (S).** Scheduled sessions on Discord with a short survey afterwards.

---

## Done

74 of the first 102, and 52 of the new ideas.

### Done 2026-11-23

4. ✅ **Companion arcs.** 2026-11-23: now and then, between chapters, a companion quarrels with you (make peace, stand your ground or send them away), asks for help with their own trouble, opens up by the fire, or swears an oath. A sworn companion may later take an assassin’s blade meant for you; a disloyal one is first seen whispering with strangers at night, and if you let it lie, betrays you and runs with half your gold. With few companions, a stranger may ask to join (issue #1). Only with Companion loyalty on; its own seeded dice.
6. ✅ **Kingdom management light.** 2026-11-23: a kingdom has a treasury, an army and the people’s loyalty (0-100, shown in the saga sheet). Kingdom events move them, a royal decree now and then lets you raise taxes, drill the army or hold a feast, wars read the army (+1.5 to +10.5 instead of a flat +6), and a disloyal people makes coups and rebellions harder to put down.
11. ✅ **Arena progression.** 2026-11-23: the Gauntlet, on the card screen: five fights in a row through one world, from its weakest foes to its strongest, with one life. Each round won pays at once and the rewards rise (+1 Renown up to +2 Renown and a Fate Token); you may walk away between rounds; a stalemate is fought again. Winning all five earns the title Gauntlet Champion; the best run is kept.

33. ✅ **Phone layout.** 2026-11-23: every screen checked in emulation from 320×568 to 412×915 and sideways (`scripts/layout-check.js`). On the smallest phones the top bar keeps one row while the pause button shows, the wheel shrinks a little so Spin stays on screen, and Pause story gets its own row. Still not tried on a real phone.
34. ✅ **Controller polish.** 2026-11-23: B / Circle closes the Spin settings pop-up first (as Esc does) instead of opening the pause menu, and moving focus out of the pop-up with the d-pad, a stick or Tab closes it. Show upcoming keeps focus when it opens and closes. Tested with simulated controller input, not a real pad.
153. ✅ **One-handed phone mode.** 2026-11-23: Options > Accessibility. On a phone held upright, Spin, Next and Re-spin sit in a dock at the bottom of the screen, the pause button just above it, the card buttons stick to the bottom, and dialogs open from the bottom.
154. ✅ **Confirm before leaving a saga.** 2026-11-23: going to the main menu in the middle of a story asks first; finished chapters are kept, only the chapter in play starts again. "Don't ask again" turns it off, and Options > Accessibility brings it back.
155. ✅ **Keyboard help.** 2026-11-23: press ? anywhere for every shortcut on one page, with the player's own keys and the controller buttons for the pad in use.
157. ✅ **Search the saga log.** 2026-11-23: sagas of eight lines or more get a search box and a Bookmarks filter on the card and the ending screen; every line has a star to bookmark it, kept per legend on this device.
158. ✅ **A pointer that flaps.** 2026-11-23: the pointer rides a damped spring: each slice pushes it back, it swings home between pegs, and it wobbles to rest after the stop. With animations reduced or off it only flicks, as before.
159. ✅ **Particles for legendary results.** 2026-11-23: a burst over the wheel when a rare slice lands, and over the card when a Mythic hero or better is revealed: embers, stars, sparks, ash and blood drops, or petals, by theme. Only with animations fully on and glow allowed.
160. ✅ **A title screen that remembers.** 2026-11-23: the last hero, their race and where the saga stands (or its ending, with its icon) show low on the painted side of the title screen, and under the menu on phones.
162. ✅ **Save slots.** 2026-11-23: up to six sagas side by side, newest first. Each legend keeps one slot, saved when its card shows and after every finished chapter; Continue opens a chooser when there is more than one, and a slot can be forgotten (two presses). When all six are used, the oldest ended saga makes room.

3. ✅ **More arcs.** 2026-11-23: five new three-chapter arcs (ten in all): the hungry blade (a whispering sword to feed or starve, then break, master or drown), the war of the banners (join the Silver Crown or the Ember Rebellion), a lost twin (search, follow the trail, and meet them: a reunion, a stranger, an enemy or a grave), the grey fever (help the sick, seek a cure or flee, then live through it) and the Grand Circuit (three tournaments in three cities).

16. ✅ **Synergies and set bonuses.** 2026-11-23: twelve sets of three pieces (an element, a class, a race, a weapon, a mount...), such as Child of the Flame or Lord of the Dead; two pieces give a named bonus, all three a bigger one. A note pops up while spinning when a piece lands, and the set shows among the buffs and on the back of the card. About three heroes in ten get two pieces, one in eighty a full set.
121. ✅ ★ **Hall tournament.** 2026-11-23: a fourth Versus format: the eight strongest heroes in your Hall (or four) in a seeded bracket, fought with the real odds; a draw is fought again. The champion is recorded and earns the title Champion of the Hall.
142. ✅ **Daily streaks.** 2026-11-23: days in a row of finished daily challenges, with a badge at 3, 7 and 30 days, on the menu and the daily line.
146. ✅ **Tiered achievements.** 2026-11-23: nine milestones in bronze, silver and gold (heroes made, chapters, arena fights, deaths, retirements, dailies, best streak, Codex entries, monthly badges), with progress bars at the top of the achievements screen.
148. ✅ **Monthly challenge.** 2026-11-23: twelve rules in turn, one a month for everyone (every hero undead, giants, the fey, no weapons...); finish a saga with a hero made under it to earn the month's badge. Daily Challenge on the menu now opens a chooser for today's and this month's challenge.
152. ✅ **Screen reader pass.** 2026-11-23: the result line no longer reads out every slice the pointer passes; a quiet announcer says the new wheel's question and its result with what it gives, and the wheel is labelled with its likeliest results and their odds. Not yet tried with NVDA itself.
167. ✅ **Moving title screens.** 2026-11-23: a slow drift over the painted art and particles for each look (embers, twinkling stars, falling sparks, drifting ash, fireflies); only with animations fully on, only while the title shows.

110. ✅ **Gold and a travelling merchant.** 2026-11-23: good outcomes in chapters that pay (treasure, heists, dragons, tournaments, conquests...) bring gold, shown in the saga log, on the saga sheet and in the recap; losing everything loses it too, and an heir inherits half. After about one chapter in seven a merchant offers three of ten wares (stat boosts, a healing draught that turns the next death into a narrow escape, a hired sellsword, a noble title); an option in the story settings.

103. ✅ **Age that matters.** 2026-11-23: heroes pass through life stages by their race's lifespan (middle-aged, old, venerable); each new stage takes a little from the body and gives a little to the mind, with a line in the saga. Old heroes get four chapters of their own (pass on the sword, one last adventure, the old enemy, the council of elders), and years help with study, mentors and dragons but slow training and heists. Ageless races never age; all of it follows the Aging option.

165. ✅ **Companion portraits.** 2026-11-23: eleven portraits by kind of companion (mentor, beloved, ghost, army, townsfolk, royal, traveller, freed prisoner, apprentice or heir, young dragon, sellsword); arena foes and dragons who join you keep their own. On the saga sheet and in the recap.
166. ✅ **Nemesis portraits.** 2026-11-23: eight villain portraits (warlord, sorceress, assassin, fallen knight, necromancer, beast-lord, schemer, cult prophet), one fixed by the nemesis's name, since motives (item 5) don't exist yet. On the saga sheet, in their fights' battle report and in the recap.
168. ✅ ★ **A map of the saga.** 2026-11-23: a painted world map in the recap with the hero's road from chapter to chapter: every chapter has its place (the capital, the volcano, the swamps, the sea...), stops are numbered, the ending is marked and older legs fade so long sagas still read.
163. ✅ **Portraits for every race.** 2026-11-23: one painted portrait for each of the 87 races that had none (Grok, picked from four each), so every hero's card now has a picture; 106 portraits in all.

### Done 2026-11-21

13. ✅ **Versus improvements.** 2026-11-21: Versus has three formats (one fight, best of three, team fight), a Copy a challenge button (a message with your hero's Legend Code; Versus reads the code out of a pasted message) and a result card to save as a picture.
14. ✅ **Team fights.** 2026-11-21: three against three in Versus, winner stays on: the loser of each bout is out and the next one steps in, a draw knocks both out. Fought with your heroes from the Hall, collected cards or pasted codes (not saga companions).
22. ✅ **Unlockables.** 2026-11-21: honour titles (16 from achievements, one per arena world) shown on the card under the hero's type line, and four card backs earned with achievements or a championship. Both are picked in the card's Style menu; All unlocks lists everything and how to earn it.
23. ✅ **Collection book.** 2026-11-21: a Collection page in the Codex for classes, mounts and the chapters you have lived through, with the gaps (races, worlds, endings, foes and secret chapters were already there).
35. ✅ **Settings search.** 2026-11-21: a search box in Options finds a setting on any tab and points at it.
36. ✅ **Pause menu.** 2026-11-21: Esc, the Back key, B/Circle or the pause button in the top bar while the wheels are up: resume, spin speed, Auto, Options, pause the story, main menu. Auto waits while it is open.
129. ✅ **World champion titles.** 2026-11-21: beat every foe of an arena world (in the arena or a saga) to earn "Champion of" that world as a title; All unlocks shows how many are left.
137. ✅ **Charge the spin.** 2026-11-21: hold Spin (or the wheel) and the wheel draws back; let go and it spins harder and longer. The result is decided the same way.
147. ✅ **Hidden achievements.** 2026-11-21: seven secret achievements (secret chapters, the Lich King, the kindest and darkest alignment, head of a guild, an ancestor's save, the best tavern) that show only a riddle until unlocked.
156. ✅ **Story speed.** 2026-11-21: a Slow spin speed and a Very long auto-play pause, next to the existing Auto (which lets the saga play itself) and Fast.

### Done 2026-11-19

105. ✅ **Ancestor spirits.** 2026-11-19: an heir who would die is saved once per saga by the nearest ancestor, named in the saga log and the recap (with the Dynasty option on).
108. ✅ **Alignment drift.** 2026-11-19: from -5 to 5, starting from the hero's nature; mercy, cruelty and what the hero does move it. From 2 either way it makes good or dark chapters a little more likely and helps or hurts quests, heists and mentors. On the saga sheet and in the recap.
111. ✅ **World events.** 2026-11-19: a famine year, a comet, a plague season, a year of war, the dragon migration or a festival year colours the next three chapters (more likely chapters, a line over the story wheel). An option in the story settings.
114. ✅ **Secret chapters.** 2026-11-19: five very rare chapters for heroes who fit them (the Lich King, the last dragon egg, meeting yourself, a cure for an undead hero, the drowned crown). Found ones go into a new Secret chapters page of the Codex, which hints at who can find the rest.
117. ✅ **A playable retirement.** 2026-11-19: a retired hero picks a tavern, students or a memoir, and the wheel says how it goes; a student can carry on the line as the heir.
119. ✅ **Guild ranks.** 2026-11-19: Initiate, Member, Veteran, Officer, earned through Guild work and good deeds in the guild's line of business; an officer can fight for the top (Guildmaster, Archmage, Master of Shadows, Grandmaster, Merchant Prince).

### Done 2026-11-18

176. ✅ **Sound examples in the mod kit.** 2026-11-18: mods can now also replace the music of one scene (title, hero-making, saga, battle) and the victory, defeat and legend tunes; the Music Box template (`modkit/templates/03-sounds`) has an example of each kind, made in code.

### Done 2026-11-17 (third batch)

106. ✅ **After the ending.** 2026-11-17: Ascended, Damned and Undying heroes get one more chapter (Among the gods, In the pit, The long night); an option in the story settings.
107. ✅ **Fame and infamy.** 2026-11-17: heroic chapters bring fame, crimes and conquests infamy; from 3 up they tilt quests, heists and mentors, and show in the recap.
109. ✅ **Scars.** 2026-11-17: eight scars from lost fights and narrow escapes, each a small penalty and some a grim bonus; at most three, on the card and in the recap.
113. ✅ **Mounts and pets.** 2026-11-17: a mount wheel with 19 mounts (a mount helps on quests, a flying or swimming one at sea), and a companion can save the hero from death once.
125. ✅ **World boss.** 2026-11-17: bosses take turns weekly, each with a looping animation made with Grok (four since 2026-11-23); each hero fights once a week with the real arena odds; players who share counts fight one shared health bar (`/v1/boss`).
149. ✅ **Export your statistics.** 2026-11-17: the Hall and statistics as a spreadsheet file (CSV), from the Hall of Legends.
151. ✅ **Easy-read text.** 2026-11-17: Options > Accessibility: a plain, evenly spaced system font with more spacing and no capitals-only headings (no font download needed).
161. ✅ **Ultrawide and 4K check.** 2026-11-17: the layout check now emulates sizes bigger than the screen; everything fits at 2560×1080, 3440×1440 and 3840×2160.
178. ✅ **A quote on the card.** 2026-11-17: two lines in the hero's own voice for each of the 52 personalities.
185. ✅ **Clear mod errors.** 2026-11-17: a broken mod.json says the line, the column and a likely fix, and a pop-up says when a mod could not load.
199. ✅ **Feedback in the game.** 2026-11-17: "How was this saga?" after an ending; sent with the error reports only when the player presses Send.

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

1. **Feel:** real sound effects (52), ending stingers (55).
2. **Play:** quick create (18), saga goals (24).
3. **Depth:** the nemesis as a character (5), difficulty presets (10).
4. **Reach:** a real phone test (33), story text translated (60, now ready for plural and gender markers),
   native-speaker reviews (61).
5. **Foundations:** move story text out of code (66), browser tests in CI (76), type checking (75).
