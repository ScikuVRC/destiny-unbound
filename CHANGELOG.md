# Changelog

What changed in each release of Destiny Unbound. The release workflow uses the section for each version as its
GitHub release notes. Builds: [GitHub releases](https://github.com/ScikuVRC/destiny-unbound/releases) and
[itch.io](https://bzrkherja.itch.io/destiny-unbound).

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
