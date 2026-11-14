# Modding Destiny Unbound

Mods and wheel packs let players add their own content. Neither can run code: everything is checked when it
loads, and anything with a problem is listed with the reason. Only install mods you trust.

> **New to modding? Get the mod kit.** It has a step-by-step guide, seven ready-to-copy templates (from a
> colours-only theme to a full mod with CSS, fonts, sounds and new entries), the full reference with every built-in
> entry, and JSON schemas so your editor checks `mod.json` as you type. Download `DestinyUnbound-ModKit-<version>.zip`
> from the [itch.io page](https://bzrkherja.itch.io/destiny-unbound) or the
> [GitHub releases](https://github.com/ScikuVRC/destiny-unbound/releases), or browse it in [`modkit/`](../modkit).
> This page is the short reference.

## Mods

A mod can add **themes** (colours, fonts, CSS, wheel and card colours), **sounds and music**, and **wheel
entries** with their own buffs and debuffs. A mod is a folder with a `mod.json`; copy
[`mods/example-mod`](../mods/example-mod) to start.

- **Desktop app:** Menu > **Mods** > **Open mods folder**, put each mod in its own folder there, then press
  **Restart to apply**.
- **Browser:** Menu > **Mods** > **Import a mod folder** (the mod is stored in that browser).
- Mods can be switched on and off, and imported mods removed, from the same screen.

```json
{ "format": "fatewheel-mod", "version": 1, "id": "my-mod", "name": "My Mod", "author": "Me", "description": "...",
  "themes": [ { "id": "verdant", "name": "Verdant Grove", "blurb": "Druid circle", "base": "ashen",
      "vars": { "--bg": "#08120b", "--accent": "#6fc25a" },
      "css": "theme.css",
      "fonts": [ { "family": "My Font", "file": "my-font.woff2", "weight": 400, "style": "normal" } ],
      "wheel": { "pal": [["#14301a", "#22502b"]], "lad": ["#eaf7d6", "#0b1f0c"], "hit": "rgba(150,255,110,.5)", "glow": "#7dff6a", "font": "\"My Font\", serif" },
      "card": { "key": "#6fc25a", "accent": "#d9c36a", "panel": "rgba(8,18,11,.88)", "frame": "ashen" },
      "sounds": { "tick": "knock.wav", "reveal": "chime.wav", "music": "grove.ogg" } } ],
  "sounds": { "bad": "thud.wav" },
  "packs": [ { "name": "My entries", "entries": { "race": [ { "name": "Grove Warden", "w": 2, "dsl": "dur+1 wild:all+2 life=l" } ] } } ] }
```

(`fatewheel-mod` is the format's internal name from before the game was renamed; it stays so existing mods keep
working.)

| Field | Meaning |
| --- | --- |
| `base` | `ashen`, `astral`, `iron` or `bloodmoon`. The theme starts from it (wheel art, card frame, sound style, title screen). Old mods that say `tabletop` get `astral`. |
| `vars` | Page colours and fonts: `--bg --topbar --fg --muted --line --panel --panel-fg --chip-bg --chip-fg --chip-border --chip-radius --accent --accent2 --accent-fg --good --bad --btn-bg --btn-fg --radius --font --font-display --font-chip --font-result --result-weight`. Values may not load anything from outside the mod. |
| `css` | A normal stylesheet that only applies while the theme is selected (use `&` for the page itself). `url()` may only point to files in the mod; `@import`, outside addresses and other ways of loading pictures are removed, and the CSS cannot reach outside its theme. Style colours, borders, fonts and backgrounds; leave sizes and positions to the game, which fits every screen to the window. |
| `wheel` | `pal` (pairs of inner/outer slice colours), `lad` (stat ladder colours, lowest to highest), `gray`, `line`, `ink`, `inkDark`, `inkLight`, `hit`, `glow`, `font`, `upper`, `italic`. |
| `card` | `panel stroke key val sub accent font head caps frame`. |
| `sounds` | For one theme, or for every theme at the top level: `tick reveal rare bad click music`. Audio files: mp3, ogg, wav, m4a, aac, flac or webm, up to 30 MB each. Music loops. |
| `packs` | The same format as wheel packs (below). |

## Wheel packs

A pack is a `.json` file that adds entries, with their own buffs and debuffs, to any wheel, and can change
slice sizes. Install, switch off, export or delete packs from the menu (**Wheel packs**). Your own Workshop
edits can be exported as a pack. See [`packs/example-sky-pirates.json`](../packs/example-sky-pirates.json):

```json
{ "format": "fatewheel-pack", "version": 1, "name": "My pack", "description": "...", "author": "...",
  "entries": { "race": [ { "name": "Cloudborn", "w": 3, "dsl": "spd+1 storm:all+1 life=l", "perk": "...", "flaw": "...", "art": "how it looks in AI art" } ] },
  "workshop": { "pet": { "weights": { "Raven": 8 }, "removed": ["Pet Rock"] } } }
```

- Wheels: `race birth bg per cls wpn enh elem pow weak pet title mark hair eyes garb`.
- `w` is the slice size.
- `dsl` uses the same codes as the built-in data (described in `app/data/README.md`):
  - stat shifts such as `str+2 spd-1` (`str spd dur int fgt wpn pwr all`)
  - situational shifts such as `dark:all+1`
  - `w=fire` weaknesses, `r=ice` resistances, `a=holy` attack types
  - `fate+1`, `rt+1`
- Powers need `rar=1` to `rar=6` and weapons `q=1` to `q=5`; sensible defaults are added when missing.
- Entries never replace a built-in entry with the same name.
- A Legend Code that uses pack entries opens anywhere, but those entries only have their buffs and debuffs where
  the pack is installed.

## Translations

Each language is one file in `app/lang/`: a dictionary from the English text to the translation. To add a
language:

1. Copy `app/lang/es.js` and change the id and name.
2. Translate the values.
3. Add a `<script>` line for it in `app/index.html`, next to `es.js`.

Text without an entry stays in English, so a translation can grow a bit at a time.
