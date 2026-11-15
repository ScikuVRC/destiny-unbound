# Options and "Your wheels" remodel (mockups, 2026-11-14)

Why: players don't find out that they can remove content they don't want, and Options is hard to navigate. Today
content removal is split across three places (Options › Gameplay story switches, the Wheel Workshop hidden in the
in-game ☰ menu, Wheel packs in the same menu), and Options has 7 tabs with several rows twice.

Open the `.html` files in a browser or see `png/` (1366×768). Yellow notes are the design notes.

| # | Screen | What changes |
| --- | --- | --- |
| 1 | Title menu | "Mods" becomes **Your wheels** ("Choose what can happen"). The ☰ menu links to it instead of listing Workshop, packs and mods separately. |
| 2 | Your wheels › What can happen | Presets (Everything, Gentle, Classic fantasy, Custom) and plain-word switches: the 4 saga rules plus chapter groups. Each switch sets the covered entries to weight 0. |
| 3 | Your wheels › Wheel Workshop | Search, the 8 main wheels first, on/off checkboxes, a likelihood slider in words, a live wheel, auto-save. |
| 4 | Your wheels › Packs and mods | One list of add-ons with real switches, a restart banner only when needed, "make your own" on the side. |
| 5 | Options › General | 7 tabs become 5: General, Sound, Accessibility, Controls, Saves and privacy. |
| 6 | On a result | "Not your thing? Never roll this again" under every result, plus a one-time tip after the first saga. |

## Options audit

**Remove (it already lives somewhere else):**

- Luck (Gameplay): chosen on the home screen and the top bar.
- Sound captions in Audio: kept once, in Accessibility.
- The 8 story switches (Gameplay): move to Your wheels › What can happen.
- Credits, Send feedback, Download error log (Data): the title-screen footer has Credits and Feedback; the error
  log goes inside the feedback dialog.
- First-run guide "Show it again" (Gameplay): move to the How the rules work help screen.
- Sound on/off toggle (Audio): the mute button in the top bar does this; Master volume at 0 is the same.

**Merge:**

- Frame limit + Wheel sharpness + Glows and particles → **Performance: Low / Balanced / High**.
- Animations (Full / Reduced / Off) → Spin speed gets **Instant**; Reduce motion stays in Accessibility.
- Graphics + Gameplay + Language tabs → **General**.
- Data → **Saves and privacy** (backups, move your save, world counter, daily leaderboard, reset). Play stats
  move to the Hall of Legends or Achievements, where players look at their history.

**Keep, maybe tuck under "More":** Emoji instead of drawn icons, Spin direction, Mute in background.

## Build notes

- The content switches are a layer over the Workshop: each one writes weight 0 for its entries, so Legend Codes,
  packs and saved Workshop edits keep working, and the Workshop shows those entries as "Off".
- "Never roll this again" writes the same weight 0 for that one entry, with Undo in the toast.
- Everything here needs translating into the 4 other languages.
