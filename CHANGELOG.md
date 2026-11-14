# Changelog

What changed in each release of Destiny Unbound. The release workflow uses the section for each version as its
GitHub release notes. Builds: [GitHub releases](https://github.com/ScikuVRC/destiny-unbound/releases) and
[itch.io](https://bzrkherja.itch.io/destiny-unbound).

## 0.2.0-alpha.3.5 (2026-11-14)

A small update that makes rare results feel rare.

### New

- **Rare results get a moment.** When the wheel is about to land on a rare slice, it slows down and creeps over the
  last few slices so you see it coming. Then the slice flashes and stays lit with a bright outline, the result
  pops in with a glow, and the rare fanfare plays. Reduced motion keeps it calm, and with animations off nothing
  changes.

## 0.2.0-alpha.3.4 (2026-11-14)

A small update that clears up the buttons.

### Changed

- **Fewer buttons on the card.** **Share ▾** now holds the card code, the picture (share or save as PNG) and the
  text, with the long Legend Code as a small link at the bottom; it still works offline and never expires.
  **Portrait ▾** holds Generate AI art and Use my own picture. Turn over and the card style stay as they were.
- **Share from the Hall.** Each saved legend has a **Share** button that gives a short card code, or the long code.
- **Tidier screens.** The row of extra buttons under New Legend is gone; Hall of Legends, Open a shared card,
  Wheel Workshop, Versus and Options are all in the ☰ menu. **Record a video** moved into the ☰ menu too; while it
  records, the Stop button stays in the top bar.

## 0.2.0-alpha.3.3 (2026-11-14)

A small update with a lot of new faces: hero portraits, painted endings, boss tricks and living dynasties.

### New

- **New names in every saga.** Rivals, heirs, houses, kingdoms, cities, ships and the makers of artifacts get names
  made up as you play, in a style that fits their race (elven, dwarven, orcish, infernal and more). A 🎲 button
  next to the hero name suggests one.
- **Card frames by rank.** The card's border grows richer as your hero rises: iron, bronze, silver, gold with
  brackets, glowing gems, and a prismatic frame for a Cosmic Being.
- **Bosses have tricks.** The dragons and the strongest foe of every world each have one: a ward that hides their
  weakness, an immunity, an element they punish, a rage against weaker foes, or a second phase where they rise
  again, stronger. The battle report shows it.
- **Dynasties.** Every house gets a family trait that all its heirs carry, the house remembers each generation,
  and each generation adds renown to the name. **Family tree** on the card shows the whole line.
- **Painted endings.** Every ending has its own illustration on the final screen.
- **Faces for heroes.** Humans, dwarves, orcs, goblins, elves, dark elves, beastkin, halflings, skeletons, lizardfolk
  and gnomes now get a painted portrait on their card when you haven't made one of your own; it follows the
  presentation you chose. Created with Grok.

## 0.2.0-alpha.3.2 (2026-11-14)

A small update: open, collect and fight other players' cards, and share yours with a short code.

### New

- **Open other players' cards.** Paste a card code (or a long Legend Code) in **Open a shared card**: the card opens
  in a viewer, front and back, and your own hero stays as it is. Keep the ones you like in **Collected cards** in
  the Hall of Legends, and pick them as fighters in Versus.
- **Short card codes.** **Get a card code** on your card gives a short code like DU-7K3QXM to share instead of the
  long Legend Code. The first time, it explains what is stored: your card's Legend Code, for 90 days.

## 0.2.0-alpha.3.1 (2026-11-14)

A small update: the trading-card look, and patch notes on Discord.

### New

- **Your card is a trading card.** The front shows your hero's picture, name, type and a line about them; press
  **Turn over** (or click the card) for the back with the rating, every stat, where they're from and what they
  carry. Two fronts: **Arch** (a tarot-style window with a rank seal, the default) and **Full art** (the picture
  fills the card); switch with the Card button, and the game remembers your choice. Every theme colours its own.
- **Save PNG saves both sides** as two pictures, and Share sends both where your device allows it.
- **Patch notes on Discord:** `/patchnotes` shows what's new (pick any version), and release announcements now
  post these notes instead of a list of code changes.

### Fixes

- The back of the card no longer breaks when it's drawn before the last wheel has been spun.

## 0.2.0-alpha.3 (2026-11-14)

You make choices in the story now, your hero's nature changes the odds, battles have painted art, and the
Grimdark pack is built in. Thanks to everyone voting in the Discord poll.

### New

- **Story choices.** At key moments you choose, then the wheel decides how it goes: refuse the demon, pay it or
  hunt for a loophole; fight a dragon, talk to it or rob its hoard; finish a beaten nemesis, spare them or offer
  them a place at your side; show a beaten boss mercy or none.
- **Chapters react to your hero.** Your class, nature, element and past change the odds in heists, hauntings, at
  sea, in training, study, quests and with a mentor, and the wheel says why ("Your Rogue class helps with the
  heist").
- **The winning slice lights up** with a short flash and a bright outline when the wheel stops.
- **Your card has a moment:** it turns over into view, flips to show its back (where you're from, your rating,
  your saga and a Copy Legend Code button), and Share sends the picture or copies it to paste anywhere.
- **Tooltips on every buff and debuff:** hover or tap "+1 FGT" or "In darkness: +1 ALL" to see what it means.
- **Painted art in battles:** a backdrop for every kind of arena, and portraits of the seven dragons and the
  strongest foe of each of the thirteen worlds. Created with Grok.
- **The game's own icons:** line icons in each theme's colours for every wheel and story chapter. Prefer emoji?
  Options > Graphics.
- **Daily leaderboard (optional, off by default):** post your daily challenge results and see today's top ten.

### Balance

- The weakest races and classes got a little stronger (Fairy, Titan, Slime, Mycelid, Kobold; Merchant, Sorcerer,
  Alchemist). Checked against every arena foe with the new `scripts/win-rates.js`.

- **Official mods.** The Mods screen has a new Official mods section with mods made by us that come with the game.
  The first is **The Ember Dominion**: a grimdark far-future theme (Void Cathedral) and about forty new wheel
  entries. It's off by default: switch it on in Mods, restart, then pick Void Cathedral from the theme button.

## 0.2.0-alpha.2 (2026-11-13)

Fixes, a restyled mod kit template, and groundwork for what comes next. Thanks to everyone voting in the Discord
poll on what to build next.

### Fixes

- Mod themes now get every colour and font they leave out from their base theme, as the mod kit guide says. Before,
  they fell back to Ashen Crown's look.
- Spanish: the master volume and the "Master" tier no longer share one translation; French and German now call the
  tier "Maître" and "Meister" (they read "Général" and "Gesamt" before).

### Behind the scenes

- **Content split from code.** Every wheel's entries now live in `app/data/`, grouped by topic, as plain data with
  a guide to the format. Each wheel is in one place instead of spread over three files. The game plays the same:
  every table was checked to be identical.
- **Content Security Policy.** The page only runs the game's own scripts.
- **Linter and formatter.** ESLint and Prettier, run in CI. All JavaScript was formatted once.
- **Mod kit: The Ember Dominion** (template 07) is restyled for the 0.2 spin screen: hard-edged buttons, the Spin
  settings pop-up, count badges, legend rows and Show upcoming all match its Void Cathedral look.
- **Transparent logos** for all four themes in `brand/`, for store pages and mod themes.

## 0.2.0-alpha.1 (2026-11-13)

The first 0.2 build: a much bigger story, fairer odds, a cleaner spin screen and an optional world counter.

### New

- **Story arcs.** Some chapters start a thread that later chapters pick up: an oracle's prophecy that comes true
  (or that you defy), a demon pact that comes due, an ancient seal that breaks and a world that needs a hero, and
  an heir who grows up to be your ally, your rival or your successor.
- **8 new chapters (49 in all):** defend a city, sail the open sea (watch for the kraken), pull off a heist,
  haunted, meet a mentor, a duel of honour, a war of succession, found a city.
- **6 new endings (10 in all):** died a hero, sealed away, taken by the demon, prophecy fulfilled, risen undead,
  passed into legend. Some endings leave no heir behind.
- **5 new achievements (34 in all)** for the arcs and endings.
- **How your sagas ended**, in Options > Data, for every ending.
- **World counter (optional, off by default).** Switch it on in Options > Data to add anonymous counts to
  everyone's totals: only "a hero was made" or the name of an ending, never names or codes. The totals show there
  and with `/stats` on our Discord.

### Balance

Checked with 10,000 legends and 10,000 sagas at every luck level.

- Sagas run longer: about 12 chapters on average (was 7-8), and early deaths are rarer.
- Fairer fights: on Heroic, arena wins went from 51% to 60% and story battles from 45% to 53%; about 35% of
  sagas end in death (was 48%). Bosses and dragons are matched to your power, and Mortal heroes roll a bit better.
- More variety: Train, Study, Find treasure and Do a quest come up less, curses and exile about half as often, and
  a chapter that repeats gets a smaller slice each time.

### Spin screen

- Everything lines up in one centre column, with the buttons in an even grid.
- Re-spin shows how many Fate Tokens are left. Speed, direction and the token counter moved into
  **Spin settings**.
- The legend panel shows what you've rolled, laid out like a character sheet; **Show upcoming** lists the wheels
  still to come.
- Laptop screens (1366x768, 1280x800, 1600x900) keep the SPIN button on screen, and big monitors use the full
  width with the legend at the right edge. The itch.io player fits without scrolling to SPIN.

### Mods

- The mod kit guide explains the screen layouts ("style, don't move"), and the CSS reference lists the new parts
  (legend rows, Show upcoming, Spin settings).

## 0.1.0-alpha.6 (2026-11-13)

### New

- **Seven new achievements (29 in all).** Play the daily challenge on three days, win your first arena fight, win
  five arena fights with one hero (earns the title "The Arena Champion"), win a fight at under 15% odds, spare a
  beaten foe, recruit a beaten foe, and lose a fight and then fight again.
- **Mod kit template 07: The Ember Dominion.** An original grimdark sci-fi content pack with its own theme and
  wheel entries, ready to copy and change. The title tier docs now give the correct range (`tt=1..3`).
- **French, German and Japanese.** Pick them in Options > Language. They cover the menus, Options and most of the
  game; story text is still in English. These are AI drafts that no native speaker has checked yet, so if you speak
  one of them, corrections are very welcome on the Discord or GitHub.
- **Achievements in your language.** Achievement names, descriptions and rewards are now translated (they were
  always in English before).

### Accessibility

- Screen readers get page landmarks, headings and named dialogs.
- Dialogs keep keyboard focus inside while open and give it back when they close.
- A visible focus ring, keyboard support on the logo, labels on every dropdown, and better contrast on locked
  achievements.
- An automated accessibility audit (axe) now finds no problems.

### Fixes

- Escape closes a dialog without also going back a screen.
- Phones: the top bar wraps instead of hiding buttons, the title menu scrolls on short screens, and nothing
  scrolls sideways. The wheel stays smooth even on slow phones.
- Phones, more: the top bar fits on one row on most phones in English, the wheel sizes itself to the screen so
  SPIN stays visible, buttons and links are easier to tap, a dialog's Close button stays visible while you scroll,
  and the language picker on the New Legend screen matches the theme.

## 0.1.0-alpha.5 (2026-11-13)

- A Discord link in the title-screen footer, a "Talk on Discord" button in Send feedback, and a Community section
  in Credits.

## 0.1.0-alpha.4 (2026-11-13)

- Discord status (Rich Presence) in the desktop app.

## 0.1.0-alpha.3 (2026-11-13)

- Play-through fixes, the mod kit, and an itch.io layout that fits and scrolls.

## 0.1.0-alpha.2 (2026-11-13)

- Fixed the wheel bouncing up and down while it spins.

## 0.1.0-alpha.1 (2026-11-12)

- First public alpha.
