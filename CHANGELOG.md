# Changelog

What changed in each release of Destiny Unbound. The release workflow uses the section for each version as its
GitHub release notes. Builds: [GitHub releases](https://github.com/ScikuVRC/destiny-unbound/releases) and
[itch.io](https://bzrkherja.itch.io/destiny-unbound).

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
