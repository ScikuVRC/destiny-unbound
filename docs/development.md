# Development guide

## Build and run

Needs Node.js 22.13 or newer (the tests use its built-in SQLite).

```bash
npm install
```

```bash
npm start
```

```bash
npm run dist
```

- `npm start` opens the desktop app from source.
- `npm run dist` writes the Windows installer and portable `.exe` to `dist/`.
- `npm run dist:mac` and `npm run dist:linux` build for those systems; run each on that system.

**In a browser.** Open `app/index.html` directly (everything works from `file://`), or serve the `app` folder:

```bash
python -m http.server 5173 --bind 127.0.0.1
```

Run that from the `app` folder; on Windows, `Start FateWheel.bat` does the same. Serving over http also lets
the game install as a web app (PWA).

## Tests and checks

```bash
npm test              # the test suites (the bot's need its packages once: npm ci --prefix bot)
npm run lint          # ESLint: real mistakes such as undefined names and duplicate keys
npm run format        # Prettier: formats JavaScript and JSON (CSS and HTML keep their compact form)
```

171 checks in 10 suites:

- **engine (28):** data validity, unique names, tier shifts, odds, conditional buffs, Legend Codes, arena maths, own
  Workshop entries and their effect limits.
- **art (18):** every generator and language-model connector against a mock server.
- **story (28):** 500 full sagas with random options, requirements, every option switched off, dynasty, arcs and
  endings, the saga recap, epilogues, Legend Codes that stay under the card-code limit, ancestor spirits, alignment,
  world events, secret chapters, retirement and guild ranks.
- **extras (20):** packs, achievements, translations and the plural and gender markers, player level, the Codex and
  Bestiary (with secret chapters and the collection), hidden achievements, unlockable titles and card backs, versus formats, spin speeds, Hall statistics and the spreadsheet export, the world boss.
- **mods (14):** validation, CSS that tries to escape its theme or load outside pictures, every mod kit template
  loads, the kit's generated reference is up to date.
- **system (12):** version and cache numbers agree, a release bump on a copy, preferences, save import checks, no API
  keys in exported saves, title-screen art, offline caching, arena matchmaking.
- **save (15):** real saves from four older releases load and update step by step (`tests/saves/`, made with
  `scripts/make-save-fixture.js <tag>`), a backup comes first, newer saves are left alone.
- **discord (8):** the Discord status against a stand-in Discord (handshake, activity, rate limit, switching off,
  pings, Discord not running), the text for each screen, and the release announcement.
- **world (13):** the world counter, leaderboard, card codes, error reports and "where I stop playing", in the game
  and on the server. The server tests run the worker against node's built-in SQLite with the real schema
  (`tests/d1.js`), including the daily cap per address and `/v1/health`.
- **bot (15):** the Discord bot's commands with stand-in interactions (`/spin` cooldown and channel, `/stats`,
  `/patchnotes` and its autocomplete, `/daily`, `/legend`, `/versus`, valid command definitions, the traffic warning).

**On every push** (`.github/workflows/ci.yml`), in four jobs:

| Job | What it runs |
| --- | --- |
| test | `npm test`, `node scripts/bump-version.js --check`, `node scripts/balance-report.js --check` |
| accessibility | `scripts/a11y-check.js`: the axe audit (WCAG 2.1 A and AA) on 14 screens and dialogs |
| performance | `scripts/perf-check.js`: start time, what the title screen loads, smooth spins, against fixed limits |
| lint | ESLint, the Prettier check, and `scripts/deps-check.js`: the licence of everything that ships (fonts too) and high or critical security advisories |

The Electron checks run on a virtual display in CI (`xvfb-run`). Locally they open hidden windows with a throwaway
profile, so they never touch your saves.

## Tools

**Checks you can run by hand**

| Command | What it does |
| --- | --- |
| `node scripts/balance-report.js [legends] [sagas] [--check]` | Plays thousands of legends, fights and sagas per luck level: ranks, arena odds, how sagas end. `--check` fails when a number leaves its range (`TARGETS` in the script) |
| `node scripts/win-rates.js [heroes] [luck]` | Every race and class against all arena foes: average rating and chance to win |
| `node scripts/achievement-report.js` | How often each achievement unlocks (plays heirs too); marks the ones it cannot simulate |
| `npx electron scripts/layout-check.js [outDir] [--only=WxH] [--screens=...] [--lang=de] [--theme=wild]` | Opens each main screen at common window sizes, saves screenshots and reports what doesn't fit. Extra screens: `recap`, `options-audio`, `options-access`, `options-controls`, `options-data`, `content-happen`, `content-workshop`, `content-addons` |
| `npx electron scripts/a11y-check.js [--screens=...] [--theme=...]` | The axe accessibility audit |
| `npx electron scripts/perf-check.js [--cpu=4]` | The performance budget. `--cpu=4` slows the CPU like a cheap phone (limits not applied) |
| `node scripts/deps-check.js [--no-audit]` | Licences and security advisories of everything that ships |
| `npx electron scripts/ui-mockups.js` | Shows one moment of play in each layout variant and measures it |

**What players send** (all opt-in; the server ones need `npx wrangler login` once, see [worker/README.md](../worker/README.md))

| Command | What it shows |
| --- | --- |
| `node scripts/world-vs-sim.js` | Real saga endings from the world counter next to simulated ones (needs 50 real sagas) |
| `node scripts/quit-report.js [n]` | Where players who share it stopped playing |
| `node scripts/error-reports.js [n] [--full]` | Error reports players chose to send |

**Making things**

| Command | What it makes |
| --- | --- |
| `node scripts/bump-version.js` | `--cache`: every `?v=` and the service worker cache, after changing app files. `<version> --summary "..." --notes notes.md`: a whole release bump. `--check`: every place agrees |
| `npm run modkit` | `dist/DestinyUnbound-ModKit-<version>.zip` from `modkit/`, and its generated reference from the game's data (a test fails if the reference is out of date) |
| `node scripts/make-icons.js` | Every icon size from `app/icons/icon-source.png` (runs before every build) |
| `node scripts/make-menu-css.js` | The title-screen CSS and WebP art from the approved mockups in `mockups/menu/_gen-art.js` |
| `python scripts/make-wheel-skins.py` | The painted wheel rims and hubs (`app/art/skins/`, `app/js/skins-data.js`) |
| `node scripts/make-chapter-art.js` | The chapter illustrations (`app/art/chapters/`, needs ffmpeg) |
| `python scripts/make-transparent-logos.py` | Transparent theme logos in `brand/` |
| `npx electron scripts/make-store-art.js` | itch.io and Steam capsules in `docs/store/capsules/` |
| `uv run --project ../ACE-Step-1.5 python scripts/make-music.py` | HD music takes with ACE-Step ([music-credits.md](music-credits.md)) |
| `node scripts/fetch-fonts.js` | Downloads the theme fonts into `app/fonts` (already done; fonts are committed) |
| `node scripts/make-example-sounds.js` | The example mod's two WAV sounds |
| `node scripts/make-save-fixture.js <tag>` | A sample save made with an older release's own code, for the save tests |
| `npm run trailer` | Records real gameplay and makes the trailer and GIF in `dist/trailer/` (see below) |
| `node scripts/make-slideshow.js` | `docs/store/trailer.mp4`, a slideshow of the store screenshots (needs ffmpeg) |

**Publishing**

| Command | What it does |
| --- | --- |
| `npm run itch` | Uploads the Windows builds from `dist/` to itch.io with [butler](https://itch.io/docs/butler/) (`-- --web` adds the browser build, `-- --modkit` the mod kit, `-- --no-windows` skips the Windows builds, `-- --dry` only shows what it would do). Log butler in once with `butler login` |
| `node scripts/discord-announce.js <tag> [--dry]` | The "new version is out" post in #announcements (the release workflow runs it) |

**Trailer and GIF.** `npm run trailer` plays the game in a hidden window with a throwaway profile (the four title
themes, an auto-spun legend, its card and the start of its story), then makes
`dist/trailer/destiny-unbound-trailer.mp4` (about 50 seconds, 1280×720, ending on a "play free" card) and
`dist/trailer/destiny-unbound.gif` (about 9 seconds). It needs ffmpeg on the PATH and takes about 3 minutes. Each
run spins a new legend, so the footage is different every time. The README's GIF is a copy in `docs/media/`.

## Releases and updates

To release:

1. Write the release notes (the `### New`, `### Changed`, `### Fixed` sections) in a file, for example `notes.md`.
2. Bump every place at once:

   ```bash
   node scripts/bump-version.js 0.2.0-alpha.5.1 --summary "What changed, one line" --notes notes.md
   ```

   This sets the version in `package.json` and its lock, `app/js/version.js`, the README badge, the bug form and
   `docs/alpha-testing.md`; adds the CHANGELOG section, the ROADMAP line and the row in `progress.md`; and raises
   the cache numbers. `node scripts/bump-version.js --check` (also in CI) confirms every place agrees.
3. Commit, then push a matching tag, for example:

   ```bash
   git tag -a v0.2.0-alpha.5.1 -m "0.2.0-alpha.5.1"
   ```

   ```bash
   git push origin main v0.2.0-alpha.5.1
   ```

GitHub Actions then runs the tests, builds Windows, macOS and Linux, and attaches the files to a release
(`.github/workflows/release.yml`). A tag with a dash becomes a pre-release. It then uploads the Windows builds, the
browser build and the mod kit to itch.io with butler, if the `BUTLER_API_KEY` secret is set. To set it up once:
make a key at <https://itch.io/user/settings/api-keys> (**Generate new API key**), then run
`gh secret set BUTLER_API_KEY --repo ScikuVRC/destiny-unbound` and paste the key when it asks. Without the secret, upload by hand with `node scripts/itch-push.js --web --modkit` after
`npm run dist` and `npm run modkit`. Once the release is up, it posts
"x.y.z is out" with the new commits to the Discord's #announcements channel, if the `DISCORD_WEBHOOK` secret is set
(see [discord.md](discord.md#release-announcements-on-the-server)). Every push also runs the tests
(`.github/workflows/ci.yml`).

The installed app checks GitHub releases at startup (players can switch this off in Options > Data), downloads
a new version in the background and offers **Restart and update**. Alpha and beta builds follow pre-releases;
normal builds ignore them. The portable `.exe` never updates itself.

**Code signing.**

1. Buy a Windows code-signing certificate.
2. Add two repository secrets: `WIN_CSC_LINK` (the `.pfx` file, base64-encoded) and `WIN_CSC_KEY_PASSWORD`.

The release build then signs the installer and the portable `.exe`. Without the secrets it builds unsigned, and
Windows SmartScreen warns on first launch. To sign locally, set `CSC_LINK` and `CSC_KEY_PASSWORD` before
`npm run dist`.

## Where things are stored

| What | Where |
| --- | --- |
| Saves, settings, Hall of Legends | `%APPDATA%\FateWheel` (the earlier name, kept so old saves carry over) |
| Daily backups (newest 10) | `%APPDATA%\FateWheel\backups` |
| Error and crash log, feedback reports | `%APPDATA%\FateWheel\logs` |
| Window size, mode and VSync | `%APPDATA%\FateWheel\window.json` |
| Mods | `%APPDATA%\FateWheel\mods` |

Uninstalling keeps all of these.

## Code layout

| Path | What it is |
| --- | --- |
| `app/official/` | Official mods that ship with the game, off until switched on in the Mods screen ([modding.md](modding.md)) |
| `app/data/` | Wheel content, as plain data grouped by topic (format: [app/data/README.md](../app/data/README.md)); `music.js` lists the HD music |
| `app/js/data.js` | The row parser the content uses; in node it also loads all of `app/data/` |
| `app/js/engine.js` | Rules: stages, buffs and debuffs, rating, arena, Legend Codes |
| `app/js/story.js`, `story-ui.js` | Story mode rules (fights, endings, dynasty, old legends, the saga recap) and screens |
| `app/js/chapters/` | The story chapters, one file per group; the load order is the order of the story wheel |
| `app/js/boss.js`, `worker/src/boss.js` | The weekly world boss: the game side and the shared health bar on the world counter |
| `app/js/hall.js`, `codex.js`, `guide.js` | Player level, favourites, Hall statistics, card backs and the print sheet; the Codex and Bestiary; the guided first hero |
| `app/js/wheel.js`, `card.js`, `render.js`, `app.js` | Wheel canvas, card renderer, HTML helpers, main flow |
| `app/js/skins-data.js`, `chapter-art.js`, `badges.js`, `icons.js` | Painted wheel rims and hubs, chapter illustrations, achievement badges, the icon set |
| `app/js/menu.js`, `menu-data.js`, `css/menu.css` | Themed title screen, keyboard and controller input, guide, credits, thank-you screen |
| `app/js/options.js`, `prefs.js`, `content.js`, `css/ui.css` | Options, the preferences every part reads, Content & mods |
| `app/js/save.js` | Save format versions: updates old saves step by step, with a backup first |
| `app/js/system.js`, `report.js`, `version.js` | Error log, backups, save export and import, play stats, feedback; error reports; version |
| `app/js/world.js` | The opt-in world counter, daily leaderboard, card codes and "where I stop playing" |
| `app/js/audio.js` | Themed sound effects and generative music (WebAudio), and the HD music player |
| `app/js/art.js`, `studio.js` | Art prompt builder, generator connectors, the Art Studio |
| `app/js/extras.js` | Saga writer, daily challenge, versus, video recorder |
| `app/js/packs.js`, `achievements.js`, `i18n.js`, `app/lang/` | Wheel packs, achievements, translations |
| `app/js/mods.js`, `mods-ui.js` | Mod loading and safety checks; Mods screen and desktop updates |
| `app/art/`, `app/music/`, `app/icons/`, `app/fonts/` | Painted art (title, wheels, chapters, endings, portraits), HD music, icons, bundled fonts |
| `electron/discord.js`, `app/js/presence.js` | Discord status: the local connection to Discord, and what the game shows. Setup: [discord.md](discord.md) |
| `electron/main.js`, `preload.js` | Desktop shell, crash recovery and the small set of desktop features the page can reach |
| `worker/` | The Cloudflare Worker behind the opt-in online features: world counter, leaderboard, card codes, error reports, abuse protection ([worker/README.md](../worker/README.md)) |
| `bot/` | The Discord bot: `/spin`, `/stats`, `/patchnotes`, `/daily`, `/legend`, `/versus` and the traffic warning ([bot/README.md](../bot/README.md)) |
| `modkit/` | The mod kit: guide, reference, JSON schemas and templates (zipped by `npm run modkit`) |
| `mockups/` | Design mockups; `menu/` holds the painted main menus the game is built from |
| `docs/` | This guide, modding, Art Studio, alpha test plan, store kit, art and music credits (every AI image and track) |
| `tests/` | Test suites, sample saves from older releases (`saves/`) and the stand-in database (`d1.js`) |
| `brand/` | Transparent logos for store pages and mod themes |

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md). Bug reports and pull requests are welcome. Run `npm test` and `npm run lint` before sending a change, and `npm run format`
to format it. New wheel entries go at the end of their wheel in `app/data/`; the tests check that names are unique
and every buff/debuff code parses. By contributing you agree that your contribution is licensed under GPL-3.0-or-later.
