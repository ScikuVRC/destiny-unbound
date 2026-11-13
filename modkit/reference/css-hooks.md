# CSS hooks

Class names and ids you can style from a theme's CSS file. Your CSS only applies while your theme is selected; use
`&` for the page itself (`& { background: ... }`).

To find anything not listed here, open the game in a browser, right-click the thing you want to change and choose
**Inspect**.

Style these freely (colours, borders, shadows, fonts, backgrounds), but leave sizes and positions alone. The game
lays out each screen to fit the window: side by side on laptops and desktops, stacked on very tall windows, one
column on phones. See "Style, don't move" in the guide.

## Every screen

| Selector | What it is |
| --- | --- |
| `&` | The page (`body`). Set the background here. |
| `header.top`, `.top-actions` | The bar at the top, and its buttons. |
| `.btn` | Every button. |
| `.btn.primary` | Main buttons (Spin, Next, Begin the story...). |
| `.btn.ghost`, `.btn.small` | Quiet and small buttons. |
| `.modal`, `.overlay` | Dialogs (Hall of Legends, Mods, Credits...) and the dimmed layer behind them. |
| `.sheet`, `.card-panel`, `.fx-card` | Boxes and panels. |
| `.toast` | The short messages at the bottom. |
| `.legend-key` | Small explanatory text. |

## Spinning (`#screen-spin`)

| Selector | What it is |
| --- | --- |
| `.steps` | The progress dots at the top. |
| `.chip-emoji` | The emoji above the question. |
| `.chip` | The question ("What's your race?"). |
| `.result` | The big result (beside or above the wheel, depending on the window). `.result.rare` for rare results. |
| `.result-sub` | The small line under the result. |
| `.wheel-wrap` | The box around the wheel. The wheel itself is drawn on a canvas: colour it with the theme's `wheel` settings, not CSS. Don't set its size: the game fits it to the window. |
| `.controls` | The Spin / Re-spin / Next buttons. |
| `.tokens` | The Fate Token counter. |
| `.effects`, `.fx-card` | The "Bonuses for ..." box under the buttons. |
| `#sheet`, `#sheet .row`, `#sheet .row.cur`, `#sheet .row.empty` | The "Your Legend" panel, its rows, the row being spun, and rows not rolled yet (hidden unless the player clicks Show upcoming; `#sheet.all` while they're shown). |
| `.sheet-more` | The Show upcoming / Hide upcoming button under the legend rows. |
| `.cnt` | The small count badges (Fate Tokens left on Re-spin, wheels still to come on Show upcoming). |
| `#btnSpinSet`, `.spinset` | The Spin settings button and its pop-up (Fate Tokens, speed, direction). |
| `.spin-layout`, `.stage` | The screen's layout boxes. Style them, but leave their size and grid alone. |

## New Legend (`#screen-home`) and the card (`#screen-card`)

| Selector | What it is |
| --- | --- |
| `.hero` | The heading area of New Legend. |
| `.opt`, `.opt.sel` | The luck and look choices, and the chosen one. |
| `.hall-item` | Rows in the Hall of Legends, packs and mods lists. |
| `#screen-card .card-panel` | The panels on the card screen. The card picture itself is drawn on a canvas: colour it with the theme's `card` settings. |

## Title screen (`#screen-title`)

The title screen belongs to the theme's base. Its parts sit inside `.tscr`:

| Selector | What it is |
| --- | --- |
| `.tscr .bgart` | The painted background. |
| `.tscr .wheelart` | The painted wheel. |
| `.tscr .title .logoart` | The painted logo. |
| `.tscr .panel` | The menu box. |
| `.tscr .item`, `.tscr .item.on` | Menu items, and the highlighted one. |
| `.tscr .foot` | The bar at the bottom. |

You can replace the painted pictures with your own files, for example
`.tscr .bgart { background: url(art/my-background.jpg) center / cover; }`. The picture must be inside your mod.

## Options (`#screen-options`)

`.o-tabs` (the tab row), `.o-grp` (a group of settings), `.o-row` (one setting), `.o-seg` (a row of choices),
`.o-tog` (a switch), `.o-sl` (a slider).

## Accessibility classes

The game adds these to the page when a player turns the matching option on. Keep your theme readable with them:

| Class on `&` | Option |
| --- | --- |
| `.hc` | High contrast |
| `.anim-reduced`, `.anim-off`, `.calm` | Less or no motion |
| `.no-glow` | Glow effects off |

For example: `&.hc .result { text-shadow: none; }`
