# Destiny Unbound modding guide

This guide walks through everything a mod can do, from changing a few colours to adding a hundred new wheel
entries. Each section points to a template in `templates/` that shows it working.

- [1. How mods work](#1-how-mods-work)
- [2. Installing and testing](#2-installing-and-testing)
- [3. mod.json](#3-modjson)
- [4. Themes](#4-themes)
- [5. Sounds and music](#5-sounds-and-music)
- [6. New wheel entries](#6-new-wheel-entries)
- [7. Buff and debuff codes](#7-buff-and-debuff-codes)
- [8. Changing the odds of built-in entries](#8-changing-the-odds-of-built-in-entries)
- [9. Wheel packs (entries without a mod)](#9-wheel-packs-entries-without-a-mod)
- [10. Limits and safety rules](#10-limits-and-safety-rules)
- [11. Troubleshooting](#11-troubleshooting)
- [12. Sharing](#12-sharing)

## 1. How mods work

A mod is a folder. Inside is a file called `mod.json` that says what the mod adds, plus any files it uses:

```
my-mod/
  mod.json        required: what the mod contains
  theme.css       optional: extra styling for your theme
  my-font.woff2   optional: a font
  tick.wav        optional: sounds and music
```

A mod can contain any mix of three things:

| Part | What it does | Template |
| --- | --- | --- |
| `themes` | New looks: colours, fonts, wheel and card colours, CSS, per-theme sounds | 01, 02, 06 |
| `sounds` | Sounds and music for every theme | 03 |
| `packs` | New wheel entries with buffs and debuffs, and changed odds | 04, 06 |

Mods can't run code. The game checks every value when it loads a mod, and anything it doesn't allow is refused
with a message saying why.

## 2. Installing and testing

**Desktop app**

1. In the game, open **Mods** (main menu) and press **Open mods folder**.
2. Copy your mod's folder into it, so you have `Mods/my-mod/mod.json`.
3. Press **Restart to apply**. Do this again every time you change a file.

**Browser** (including itch.io)

1. Open **Mods** and press **Import a mod folder**, then pick your mod's folder. The game restarts to load it.
2. The mod is stored in that browser. To update it, import it again (same `id` replaces the old one).

**Checking it worked**

- The Mods screen lists every mod with a switch to turn it on or off. A mod with a problem is listed with the
  reason, for example `my-mod: Ember Rose: card "key" must be a colour.`
- New themes appear in the theme button at the top of the screen and in **New Legend > Look**.
- New entries appear on their wheels the next time you spin.

**Tip:** while you work, the desktop app is quicker: edit the file in the Mods folder, then press
**Restart to apply**.

## 3. mod.json

The smallest valid mod (`templates/00-blank`):

```json
{
  "format": "fatewheel-mod",
  "version": 1,
  "id": "my-mod",
  "name": "My Mod",
  "author": "Your name",
  "description": "What it adds.",
  "sounds": {}
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `format` | yes | Always `"fatewheel-mod"`. (FateWheel was the game's earlier name; the format keeps it.) |
| `version` | yes | Always `1`. |
| `id` | yes | Lowercase letters, numbers and dashes, up to 40 characters. Must be unique: two mods with the same id replace each other. |
| `name` | yes | Shown on the Mods screen. Up to 60 characters. |
| `author`, `description` | no | Shown on the Mods screen. Up to 60 and 300 characters. |
| `themes` | no | A list of up to 12 themes ([section 4](#4-themes)). |
| `sounds` | no | Sounds for every theme ([section 5](#5-sounds-and-music)). |
| `packs` | no | Up to 10 lists of wheel entries ([section 6](#6-new-wheel-entries)). |

A mod needs at least one theme, sound or pack, or the game calls it empty.

`"$schema"` lines at the top of the templates are optional. They let editors such as VS Code check your file and
suggest field names as you type. The game ignores them.

**JSON tips:** use double quotes, put commas between items but not after the last one, and keep `{ }` and
`[ ]` balanced. If the Mods screen says the file can't be read, paste it into any online JSON checker.

## 4. Themes

A theme always starts from one of the four built-in looks and changes what you ask it to. Everything you don't
set comes from the base.

```json
"themes": [
  {
    "id": "ember-rose",
    "name": "Ember Rose",
    "blurb": "Gothic romance",
    "base": "bloodmoon",
    "vars": { "--accent": "#e8507a" },
    "css": "theme.css",
    "fonts": [],
    "wheel": { "glow": "#ff6f9a" },
    "card": { "key": "#e8507a" },
    "sounds": {}
  }
]
```

| Field | Notes |
| --- | --- |
| `id`, `name` | `name` shows in the theme menu (up to 40 characters). |
| `blurb` | A short line under the name in New Legend > Look. |
| `base` | `ashen` (Ashen Crown), `astral` (Astral Oracle), `iron` (Iron Litany) or `bloodmoon` (Blood Moon). The base gives your theme its title screen, wheel art, card frame and sound style. |
| `vars` | Page colours and fonts. See [reference/theme-variables.md](reference/theme-variables.md) for every variable and its value in each base. |
| `css` | A CSS file in your mod, for anything `vars` can't do. |
| `fonts` | Fonts that your `vars`, `wheel.font` and CSS can use. |
| `wheel` | Wheel colours. |
| `card` | Character card colours. |
| `sounds` | Sounds that only play in this theme. |

### Page colours: `vars`

The fastest way to a new look. `templates/01-colours-only` is a complete theme made only of `vars`, `wheel` and
`card`. The most visible variables:

| Variable | Used for |
| --- | --- |
| `--bg` | Page background |
| `--fg`, `--muted` | Main text, quieter text |
| `--panel`, `--panel-fg` | Boxes, menus and dialogs |
| `--accent`, `--accent-fg` | Main buttons, highlights and the text on them |
| `--accent2` | Second highlight colour |
| `--chip-fg`, `--chip-border` | The wheel's question ("What's your race?") |
| `--font`, `--font-display`, `--font-result` | Body text, headings, the big result above the wheel |

Values are colours (`#e8507a`, `rgba(232,80,122,.5)`, `hsl(340,75%,61%)`), sizes (`6px`) or font lists
(`"Cinzel", serif`). A value may not load anything: no `url(...)`.

### Wheel colours: `wheel`

| Field | Notes |
| --- | --- |
| `pal` | Slice colours: a list of `[inner, outer]` pairs, used in turn. Up to 8 pairs. |
| `lad` | Stat ladder colours, from the lowest tier to the highest. 2 to 8 colours. |
| `gray` | Two colours for "No weapon"-style empty slices. |
| `line` | Lines between slices. |
| `ink`, `inkDark` | Slice text on dark slices, and on light slices: the game picks the one that stays readable. |
| `hit` | The flash on the winning slice. |
| `glow` | The glow around the wheel. |
| `font` | Slice text font, for example `"\"IM Fell English\", serif"`. |
| `upper`, `italic` | `true` or `false`: capital letters, italic text. |

The colour-blind-safe setting in Options replaces `pal` with a safe palette, so players who need it keep it.

### Card colours: `card`

`panel`, `stroke`, `key`, `val` and `accent` are colours (the box behind the details, its border, row labels, row
values and highlights). `font` (row text) and `head` (the name at the top) are font lists. `caps` is `true` or
`false` (capital-letter labels). `frame` picks the card frame of another base, for example `"frame": "astral"`.

### Fonts

The game already includes these fonts, so you can use them in any theme without adding files:
**Cinzel**, **Cormorant Garamond**, **Cormorant SC**, **EB Garamond**, **IM Fell English**, **IM Fell English SC**,
**Share Tech Mono** and **UnifrakturCook**.

To add your own, put the file in your mod and list it:

```json
"fonts": [ { "family": "My Font", "file": "fonts/my-font.woff2", "weight": 400, "style": "normal" } ],
"vars": { "--font-display": "\"My Font\", serif" }
```

Use `.woff2` if you can (also `.woff`, `.ttf`, `.otf`), up to 8 per theme. Only use fonts whose licence lets you
share them; `templates/02-styled-theme` includes an Open Font License font and its licence file.

### CSS

The `css` file can style anything. It only applies while your theme is selected, so it can't break other themes.
Write normal CSS, and use `&` for the page itself:

```css
& { background: radial-gradient(70% 45% at 50% -10%, #3a1020, #0a0508 70%) fixed; }
.btn.primary { background: linear-gradient(#e8507a, #8a1f3c); }
.result { text-shadow: 0 0 24px #ff6f9a; }
```

[reference/css-hooks.md](reference/css-hooks.md) lists the main class names. To see more, open the game in a
browser, right-click anything and choose **Inspect**.

**Style, don't move.** The game arranges each screen to fit the window, so leave sizes and positions to it: no
`width`, `height`, `grid`, `position` or `display` on the screen layout (`.spin-layout`, `.stage`, `.wheel-wrap`,
`.sheet`, `.screen`). Colours, borders, shadows, fonts and backgrounds are all yours. The spin screen has three
layouts, and your theme should look right in each:

- **Side by side** (most laptop and desktop windows up to 1200 pixels tall, and the itch.io player): the wheel on
  the left, the question, result and buttons in the middle, the legend panel on the right (below it in narrow
  windows).
- **Stacked** (very tall windows, 2560x1440 and up): the question and result above the wheel, buttons below.
- **Phone** (narrow windows): everything in one column.

To check, resize the game window (or the browser) from small to large while your theme is selected.

For safety, the game removes anything that could load files from outside your mod: `@import`, web addresses,
`image-set()` and similar. `url(...)` may only point to files inside your mod, for example
`url(art/background.jpg)`. CSS escapes (backslashes) are removed too.

## 5. Sounds and music

```json
"sounds": {
  "tick": "sounds/tick.wav",
  "reveal": "sounds/reveal.wav",
  "rare": "sounds/rare.wav",
  "bad": "sounds/bad.wav",
  "click": "sounds/click.wav",
  "music": "sounds/music.ogg"
}
```

| Sound | When it plays |
| --- | --- |
| `tick` | Each time the wheel passes a slice. Keep it very short (under 0.1 s). |
| `reveal` | When the wheel stops on a result. |
| `rare` | When the result is rare, a fight is won, or a saga ends well. |
| `bad` | When a fight is lost or the hero dies. |
| `click` | Buttons. |
| `music` | Background music. It loops, so make the end flow into the start. |

Put `sounds` at the top of mod.json for every theme, or inside a theme for that theme only. A theme's own sound
wins over the mod-wide one. Sounds you don't replace keep the game's synthesized ones.

Formats: mp3, ogg, wav, m4a, aac, flac or webm, up to 30 MB each. `.ogg` or `.mp3` keep music small.
`templates/03-sounds` has one of each.

## 6. New wheel entries

Entries go in `packs`. Each pack has a name and lists of entries per wheel:

```json
"packs": [
  {
    "name": "Frontier entries",
    "entries": {
      "race": [
        { "name": "Dustborn", "w": 3, "dsl": "dur+1 sun:all+1 w=water life=m",
          "perk": "Thrives where others wither", "flaw": "Rain makes them ill",
          "art": "dustborn with sand-coloured skin and amber eyes" }
      ],
      "wpn": [ { "name": "Rattlesnake Whip", "w": 2, "dsl": "q=2 a=poison", "perk": "Strikes twice" } ]
    }
  }
]
```

| Field | Notes |
| --- | --- |
| `name` | Shown on the wheel and card. Up to 60 characters. Must not be the same as a built-in entry (that one is kept instead). |
| `w` | Slice size, from more than 0 up to 200. Built-in entries are mostly 2 to 10; "No weapon"-style slices are much bigger. |
| `dsl` | Buffs and debuffs ([section 7](#7-buff-and-debuff-codes)). Can be empty for looks-only wheels like hair. |
| `perk`, `flaw` | Short good and bad lines shown under the result. Up to 120 characters. |
| `art` | Races only: how the race looks, used for AI portraits. Up to 200 characters. |

**Wheels you can add to:** `race`, `birth`, `bg`, `per`, `cls`, `wpn`, `enh`, `elem`, `pow`, `weak`, `pet`,
`title`, `mark`, `hair`, `eyes`, `garb`. [reference/wheels.md](reference/wheels.md) says what each one is and
lists every built-in entry.

A few wheels need one code, and the game adds a sensible one if you leave it out:

| Wheel | Code | Default |
| --- | --- | --- |
| `pow` (powers) | `rar=1` to `rar=6`: rarity | `rar=2` |
| `wpn` (weapons) | `q=1` to `q=5`: quality | `q=2` |
| `title` | `tt=1` to `tt=3`: title tier | `tt=1 rt+1` |
| `race` | `life=s`, `m`, `l` or `a`: lifespan (short, medium, long, ageless) | `life=m` |

`templates/04-new-entries` adds an entry to every wheel, each with a different kind of buff or debuff.

**Legend Codes:** a legend that uses your entries can be shared as a code and opens anywhere. Where your mod isn't
installed, those entries show their name but have no buffs or debuffs.

## 7. Buff and debuff codes

Codes go in `dsl`, separated by spaces. [reference/dsl-codes.md](reference/dsl-codes.md) has the full list;
the common ones:

| Code | Meaning |
| --- | --- |
| `str+2`, `spd-1` | Move a stat up or down its ladder. Stats: `str` strength, `spd` speed, `dur` durability, `int` intelligence, `fgt` fighting skills, `wpn` weapon mastery, `pwr` power mastery, `all` the five combat stats. |
| `dark:all+2` | Only in fights in that place or situation. Several stats: `sun:str-1,spd-1`. |
| `w=fire` | Weak to fire. `r=ice` resists ice. `a=holy` attacks with holy. Several: `w=fire,ice`. |
| `fate+1` | An extra Fate Token (a re-spin). |
| `rt+2` | Adds straight to the power rating. |
| `hs=1.4` | Height scale (races): 1.4 is 40% taller. |
| `none` | Marks a "No weapon"-style empty slice. |

Situations for `dark:`-style codes: `dark`, `sun`, `water`, `storm`, `void`, `fire`, `ice`, `holy`, `wild`, `urban`,
`behind` (when losing), `ahead` (when winning).

Elements the game uses for `w=`, `r=` and `a=`: `fire`, `water`, `ice`, `lightning`, `poison`, `shadow`, `holy`,
`mind`, `metal`, `void`, `nature`, `time`, `sound`, `blood`.

**Balance tip:** most built-in entries add up to about +2 overall (for example `str+2`, or `str+2 int-1 fate+1`).
Something much stronger should have a small `w` so it stays rare.

## 8. Changing the odds of built-in entries

A pack can change slice sizes and remove built-in entries with `workshop`, the same thing the in-game Wheel
Workshop does:

```json
"workshop": {
  "pet": { "weights": { "Raven": 12, "Loyal Hound": 2 }, "removed": ["Pet Rock"] },
  "race": { "weights": { "Human": 30 } }
}
```

Names must match the built-in entry exactly; [reference/wheels.md](reference/wheels.md) lists them all.
Weights go up to 1000. Players can still change these again in their own Wheel Workshop.

## 9. Wheel packs (entries without a mod)

If you only want to share entries, a wheel pack is simpler: a single `.json` file instead of a folder. Players
install it from **Menu > Wheel packs > Import a pack file**, and can export it again from there.

A pack file is the same as one item of a mod's `packs`, plus a header:

```json
{ "format": "fatewheel-pack", "version": 1, "name": "Sky Pirates", "author": "...", "description": "...",
  "entries": { ... }, "workshop": { ... } }
```

See `templates/05-wheel-pack`. Players can also make a pack from their Wheel Workshop edits with
**Export my Workshop edits as a pack**.

**A whole setting.** To add a complete setting (a "content pack") with its own look, make a mod with a theme and
a big `packs` list. `templates/07-ember-dominion` does this: a grimdark far-future setting with the Void Cathedral
theme and about forty entries across the wheels. Keep settings original. Names, factions and symbols from other
games, books or films belong to their owners, and a mod that copies them can be taken down.

## 10. Limits and safety rules

| Limit | Value |
| --- | --- |
| Themes per mod | 12 |
| Packs per mod | 10 |
| Entries per wheel in one pack | 200 |
| Fonts per theme | 8 |
| One sound file | 30 MB |
| Whole mod imported in a browser | 60 MB |
| CSS file | 100,000 characters |

Files must be inside the mod's folder: no `..`, no paths starting with `/` and no web addresses. Nothing in a mod
can load from the internet or run code.

## 11. Troubleshooting

| What you see | What to do |
| --- | --- |
| The mod isn't listed at all | Desktop: check the path is `Mods/my-mod/mod.json`, not `Mods/my-mod/my-mod/mod.json`. Then restart. |
| "Not a Destiny Unbound mod" | `"format": "fatewheel-mod"` is missing or misspelt. |
| "Unexpected token" or similar | The JSON has a typo: often a missing or extra comma. Check it in a JSON checker. |
| "unknown variable" | Only the variables in reference/theme-variables.md are allowed. Put anything else in your CSS. |
| "must be a colour" | Use `#rrggbb`, `rgb()`, `rgba()`, `hsl()` or `hsla()`. Colour names like `red` aren't accepted there. |
| "has the wrong file type" | Check the file extension against [section 5](#5-sounds-and-music) or the fonts list. |
| "Missing file" (browser) | Import the whole folder, not just mod.json. |
| A new entry doesn't appear | Its name is the same as a built-in entry, or the mod is switched off on the Mods screen. |
| My CSS does nothing | Check your theme is the selected one, and that the rule isn't overridden: try a more specific selector. |
| The theme looks like the base | `vars` names must start with `--` and be spelt exactly as in the reference. |

The desktop app also writes errors to its log: Options > Data > Download error log.

## 12. Sharing

Zip your mod's folder and share it anywhere: itch.io, Discord, GitHub, a forum. Tell people:

- what it adds, and which base theme it uses;
- that desktop players unzip it into their Mods folder, and browser players use Import a mod folder;
- the licence of anything you didn't make yourself (fonts, sounds).

Destiny Unbound is free and open source (GPL-3.0-or-later). Your mods are your own work, and you choose their
licence.
