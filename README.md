# Destiny Unbound

A spin-the-wheel character generator. Spin wheels for race, birthplace, age, height, looks, background,
personality, class, six stat ladders, weapon, enhancement, element, power, weakness, companion, title and
a mark of fate. Then live their story: spin chapters until your hero retires or dies, found a dynasty, and
have an AI image generator paint the portrait.
All content, names and art are original, and every spin carries buffs and debuffs.

Destiny Unbound is free software under the GNU General Public License v3.0 or later (see [LICENSE](LICENSE)).

## Desktop app

Download the Windows installer (`DestinyUnbound-Setup-<version>.exe`), the portable `.exe`, the macOS `.dmg` or the
Linux `.AppImage` from the project's releases and run it. The builds are not code-signed, so Windows SmartScreen may show "Windows protected
your PC": choose **More info**, then **Run anyway**.

Build it yourself (needs Node.js 20 or newer):

```bash
npm install
```

```bash
npm start
```

```bash
npm run dist
```

`npm start` opens the app from source; `npm run dist` writes the installer and the portable `.exe` to `dist/`.
`npm run dist:mac` and `npm run dist:linux` build for those systems (run them on that system).

**Updates.** The installed desktop app checks GitHub releases at startup (switch this off in **Game
options**), downloads a new version in the background and offers **Restart and update**. This needs a
public repository with a release; the portable `.exe` does not update itself.

**Releases are automatic.** Set the new `version` in `package.json`, commit, then push a matching tag
(for version 1.1.0: `git tag v1.1.0` and `git push origin v1.1.0`). GitHub Actions runs the tests, builds
Windows, macOS and Linux, and attaches the files to a new release (`.github/workflows/release.yml`).
Every push and pull request also runs the tests (`.github/workflows/ci.yml`).

In the desktop app, links to ChatGPT, Grok and Gemini open in your normal browser. Your legends, settings
and portraits are stored in the app's own data folder. A generator on another computer in your network
must be reachable over `https`, or run on the same PC (`localhost`/`127.0.0.1`).

## Run it in a browser

- Quickest: open `app/index.html` in a browser (double-click). Everything works from `file://`.
- Windows: double-click `Start FateWheel.bat`. It serves the app on http://127.0.0.1:5173 (needs Python).
  Use this when you want to install it as a phone/desktop app (PWA), since service workers need http.
- Manually: `python -m http.server 5173 --bind 127.0.0.1` from the `app` folder.

## What is on the wheels

| Wheel | Entries | Wheel | Entries |
| --- | --- | --- | --- |
| Race | 98 (21 with a sub-wheel, 204 sub-entries) | Weapon | 82 |
| Birthplace | 64 | Enhancement | 55 |
| Age | 23 (from teen to older than time; the wheel depends on lifespan) | Element | 25 |
| Height | 38 steps, scaled by race | Power | 177 |
| Background | 61 | Weakness | 64 |
| Personality | 52 | Companion | 38 |
| Class | 45 | Title | 94 |
| Hair / eyes / outfit | 38 / 27 / 36 | Mark of fate | 33 |
| Arena | 34 | Opponents | 77 across 13 universes |
| Win outcomes | 13 | Defeat outcomes | 10 |

| Stat ladder | Tiers | Range |
| --- | --- | --- |
| Strength | 42 | Feeble to Boundless |
| Speed | 33 | Sluggish to Beyond time |
| Durability | 42 | Paper-thin to Absolute durability |
| Intelligence | 28 | Mindless to Beyond knowing |
| Fighting skills | 29 | Never fought to Beyond mortal reckoning |
| Weapon / Power mastery | 27 each | Untrained to Origin |

Buffs and debuffs move whole tiers, so on the longer ladders each +1 is a finer step than before.
Legend Codes made before the ladders grew are converted on load and keep the same tier names.

Short-lived races (humans and the like) only see the ages up to 130, long-lived ones get centuries
and millennia, and ageless races can roll anything up to "Older than Time itself".

## Story mode

On the finished card press **Begin the story**. A Story wheel decides each chapter: train, study, find
treasure, do a quest, explore a dungeon, fight a boss, slay a dragon, evolve, forge an artifact, forge a
kingdom, conquer a race, conquer the world, join a guild, win a tournament, rescue someone, find love, have
an heir, take an apprentice, curses, plagues, exile, rebellion, journeys to other worlds, founding a
religion, ascending to godhood, losing everything, years passing, your nemesis, a final showdown, and Retire.

- Each chapter opens its own follow-up wheels. Conquer a race asks which race you are at war with (every
  race has an army power based on its strengths and rarity), rolls the war with your real odds, then asks
  what you do with the defeated.
- Used chapters turn grey and cannot land again; Train, Study, Find treasure, quests, dungeons, wars and
  your nemesis can repeat. Retire starts as a thin slice and grows a little every chapter, faster when
  your hero is old.
- Battles use your power rating plus your kingdom, allies, conquered peoples and artifacts, against the
  enemy's power, in a random arena (so your situational buffs count). Death is a real outcome.
- The saga is shown on the card, saved in the Legend Code and used by the Art Studio (a ruler gets a
  crown, artifacts appear in the picture). **Write the tale** turns the saga into a short story with the
  language model chosen in the Art Studio.
- **Dynasty:** if your hero had an heir, **Continue as (heir)** saves the parent to the Hall and spins a
  child of the same race who inherits the house name, the throne, an heirloom artifact, a family talent
  and any living nemesis.

**Game options** (home screen or menu) switch features on or off: chapter requirements, death, aging,
nemesis, kingdom events, companion loyalty, dynasty and achievements. Single chapters can be removed or
made rarer in the Wheel Workshop under "Story chapters" (Retire always stays).

## More ways to play

- **Daily challenge:** the same seed for everyone each day, Heroic luck, no hand-picked results. Play the
  story to the end for a score, then **Copy result** to share it.
- **Versus:** pick two legends (current, from the Hall, or pasted codes); the arena and both sides' buffs,
  weaknesses and elements decide the odds. Neither card changes.
- **Record:** the top bar button records a vertical 1080x1920 video (MP4 where the browser supports it,
  otherwise WebM) with the wheel sounds, ready for TikTok, Shorts or Reels.
- **Achievements:** 22 badges. Some unlock rare wheel entries (a title, a mark, a weapon, a power and a
  companion).

## Wheel packs

A pack is a `.json` file that adds entries, with their own buffs and debuffs, to any wheel, and can change
slice sizes. Install, switch off, export or delete packs from the menu (**Wheel packs**). Your own Workshop
edits can be exported as a pack. See [`packs/example-sky-pirates.json`](packs/example-sky-pirates.json):

```json
{ "format": "fatewheel-pack", "version": 1, "name": "My pack", "description": "...", "author": "...",
  "entries": { "race": [ { "name": "Cloudborn", "w": 3, "dsl": "spd+1 storm:all+1 life=l", "perk": "...", "flaw": "...", "art": "how it looks in AI art" } ] },
  "workshop": { "pet": { "weights": { "Raven": 8 }, "removed": ["Pet Rock"] } } }
```

Wheels: `race birth bg per cls wpn enh elem pow weak pet title mark hair eyes garb`. `w` is the slice
size. `dsl` uses the same codes as the built-in data (described at the top of `app/js/data.js`): stat
shifts such as `str+2 spd-1` (`str spd dur int fgt wpn pwr all`), situational shifts such as
`dark:all+1`, `w=fire` weaknesses, `r=ice` resistances, `a=holy` attack types, `fate+1`, `rt+1`. Powers
need `rar=1` to `rar=6`, weapons `q=1` to `q=5`; sensible defaults are added when missing. Entries never
replace a built-in entry with the same name. A Legend Code that uses pack entries opens anywhere, but
those entries only have their buffs and debuffs where the pack is installed.

## Translations

The language is chosen under **Look** on the home screen. Each language is one file in `app/lang/`: a
dictionary from the English text to the translation. Spanish covers the interface, every wheel's
question, all stat tiers, story chapters, options and card labels; wheel content (race names, weapons,
story results) is still English. To add a language, copy `app/lang/es.js`, change the id and name,
translate the values and add a `<script>` line for it in `app/index.html` next to `es.js`. Any text
without an entry simply stays in English, so a translation can grow a bit at a time.

## Themes

Pick a look under **Look** on the home screen or with the theme button in the top bar. Each theme has
its own page style, wheel art and character-card frame:

| Theme | Genre | Wheel |
| --- | --- | --- |
| Ashen Crown | Dark fantasy | Iron rim with glowing runes, ember hub, sword pointer |
| Astral Oracle | Celestial high fantasy | Night-blue star ring, glowing star hub, silver needle |
| Iron Litany | Grimdark gothic sci-fi | Brass cog rim with rivets, red gem hub, brass spike |
| Blood Moon | Gothic horror | Silver filigree, a watching eye in the hub, silver claw |

The fonts are bundled in `app/fonts` so every theme works offline and in the desktop app
(`node scripts/fetch-fonts.js` downloads them again).

## Sound and music

Every theme has its own sound effects (wheel ticks, reveals, rare results, bad news) and its own
ambient music, all made live in code: an ember-lit drone with crackling fire (Ashen Crown), shimmering
starlight bells (Astral Oracle), an organ drone with machinery (Iron Litany), wind and a heartbeat (Blood
Moon). Volumes for master, effects and music are in **Game options**; the speaker button mutes everything.
Mods can replace any of these sounds with their own files.

## Mods

Mods let players add their own **themes** (colours, fonts, CSS, wheel colours, card colours),
**sounds and music**, and **wheel entries** with their own buffs and debuffs. A mod is a folder with a
`mod.json`; copy [`mods/example-mod`](mods/example-mod) to start.

- **Desktop app:** Menu > **Mods** > **Open mods folder**, put each mod in its own folder there, then press
  **Restart to apply**.
- **Browser:** Menu > **Mods** > **Import a mod folder** (it is stored in that browser).
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

- `base` is one of `ashen`, `astral`, `iron`, `bloodmoon` (old mods that say `tabletop` get `astral`): the theme starts from it (wheel art, card frame,
  sound style) and you change what you like.
- `vars` sets the page colours and fonts: `--bg --topbar --fg --muted --line --panel --panel-fg --chip-bg
  --chip-fg --chip-border --chip-radius --accent --accent2 --accent-fg --good --bad --btn-bg --btn-fg --radius
  --font --font-display --font-chip --font-result --result-weight`.
- `css` is a normal stylesheet that only applies while the theme is selected (use `&` for the page itself).
  `url()` may only point to files in the mod folder; `@import` and outside addresses are removed.
- `wheel`: `pal` (pairs of inner/outer slice colours), `lad` (stat ladder colours, lowest to highest), `gray`,
  `line`, `ink`, `inkDark`, `inkLight`, `hit`, `glow`, `font`, `upper`, `italic`.
- `card`: `panel stroke key val sub accent font head caps frame`.
- `sounds` (for one theme, or for every theme at the top level): `tick reveal rare bad click music`.
  Audio files: mp3, ogg, wav, m4a, aac, flac or webm. Music loops.
- `packs`: the same format as wheel packs (see below).

Mods cannot run code. Everything in `mod.json` is checked when it loads, and a mod with a problem is
listed with the reason in the Mods screen. Use mods at your own discretion and only install mods you trust.

## Make it yours

The home screen has a "Make it yours" panel: hero name, presentation, whether the appearance wheels
are spun or rolled quietly, and "Choose instead of spinning" for race, class, element, hair, eyes,
outfit and companion. Anything chosen by hand skips its wheel and is marked "chosen by you".

## Art Studio (AI portrait)

On the finished card press **Generate AI art**. The studio writes an image prompt from the character
(race look, hair, eyes, outfit, weapon, power, element, companion, personality, power level) and from
what happened in the arena (the latest fight, scars, allies). You can edit the prompt, pick a style and
framing, optionally have a language model polish it, then send it to a generator.

| Generator | Where it runs | Setup |
| --- | --- | --- |
| Stable Diffusion WebUI (AUTOMATIC1111 / Forge) | Your PC | Start with `--api --cors-allow-origins=*` |
| ComfyUI | Your PC | Start with `--enable-cors-header "*"` |
| Custom OpenAI-compatible | Your PC or any service | Any `/images/generations` address (LocalAI, proxies) |
| OpenAI (ChatGPT image model) | Online | Your own API key from platform.openai.com |
| xAI (Grok image model) | Online | Your own API key from console.x.ai |
| Stability AI | Online | Your own API key |
| Google Gemini image | Online | Your own API key |

| Language model (optional prompt polish) | Where it runs | Setup |
| --- | --- | --- |
| Ollama | Your PC | Set `OLLAMA_ORIGINS=*`, restart Ollama |
| LM Studio | Your PC | Start the local server, switch on "Enable CORS" |
| Custom OpenAI-compatible | Your PC or any service | Any `/chat/completions` address |
| OpenAI, xAI Grok, Anthropic Claude | Online | Your own API key |

**Limits and cost.** API keys are billed per picture by the provider and have rate limits. A chat
subscription (ChatGPT Plus, SuperGrok, Gemini Advanced) does not include API use. For online
generators the studio shows a warning and stops after a daily number of pictures you set (10 by default).

**Using a subscription instead of a key.** A subscription cannot be signed into from another app, so
the studio has a two-step route: "Copy prompt and open ChatGPT / Grok / Gemini" opens the site with the
prompt, where you sign in as usual; then bring the picture back with "Choose the saved picture" or by
pasting it (Ctrl+V). Those plans have their own picture limits.

Keys are sent only to the address shown in the studio. They stay in memory unless you tick
"Remember API keys", which stores them unencrypted in that browser. The generated portrait is placed on
the card, exported with **Save PNG**, and saved with the legend in the Hall of Legends (on that device).

Tested against local stand-in servers that mimic each service's request and reply format. The online
services have not been called with real keys, so model names or formats may need adjusting if a
provider has changed its API: base URL and model are editable for every provider.

## Tests

```bash
npm test
```

26 engine checks (data validity, unique names, tier shifts, odds, conditional buffs, Legend Codes incl.
old age names and old tier numbers, arena maths, new outcomes), 18 art checks (art prompt, every
generator and language-model connector against a mock server, error messages, cancelling), 8 story
checks (500 full sagas with random options, grey slices, requirements, every option switched off,
Workshop removals, dynasty), 5 checks for packs, achievements and translations, and 6 for mods and themes.

## Layout

| Path | What it is |
| --- | --- |
| `app/js/data.js`, `data-more.js`, `data-extra.js` | Wheel content. `data-more.js` adds races, sub-wheels, class, element, companion, looks and art descriptions; `data-extra.js` adds the finer age wheel and more entries for every wheel |
| `app/js/engine.js` | Rules: stages, buffs and debuffs, rating, arena |
| `app/js/art.js` | Art prompt builder and the image / language-model connectors |
| `app/js/studio.js` | "Make it yours" panel and the Art Studio screen |
| `app/js/wheel.js`, `card.js`, `render.js`, `app.js` | Wheel canvas, card renderer, HTML helpers, main flow |
| `app/js/story.js`, `story-ui.js` | Story mode rules (chapters, factions, nemesis, kingdom events, dynasty, options) and its screens |
| `app/js/extras.js` | Saga writer, daily challenge, versus and the video recorder |
| `app/js/packs.js`, `achievements.js`, `i18n.js`, `app/lang/` | Wheel packs, achievements, translations |
| `app/js/audio.js` | Themed sound effects and ambient music (WebAudio) |
| `app/js/mods.js`, `mods-ui.js` | Mod loading and checks; the Mods screen and desktop updates |
| `electron/preload.js` | The few desktop features the game can reach: the Mods folder and updates |
| `mods/example-mod` | An example mod to copy |
| `packs/` | Example wheel pack |
| `.github/workflows/` | Tests on every push; builds and releases on version tags |
| `electron/main.js` | Desktop shell: serves `app/` on a private `app://` address, sends web links to your browser |
| `scripts/make-icons.js` | Renders the app icon to PNG for the desktop builds |
| `mockups/` | Design mockups: `themed/` (the four current themes), `desktop/` and `modern/` (other directions); the top-level pages are the first, retired themes |
| `tests/` | Node test suites (`npm test`) |

## Support

Destiny Unbound is free. If you enjoy it and want to support its development, you can buy me a coffee on
[Ko-fi](https://ko-fi.com/bzrkherja). The game also has a **Support on Ko-fi** link in the menu and on the home screen.

## Contributing

Bug reports and pull requests are welcome. Run `npm test` before sending a change. New wheel entries go in
`app/js/data-extra.js` (or a new data file loaded after it); the tests check that names are unique and
every buff/debuff code parses. By contributing you agree that your contribution is licensed under
GPL-3.0-or-later.

## License

Copyright (C) 2026 Destiny Unbound contributors

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3 of the License, or (at your
option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
[GNU General Public License](LICENSE) for more details.

The fonts in `app/fonts` are by their respective authors and licensed under the SIL Open Font License 1.1
(the license text for each family is next to its files).
