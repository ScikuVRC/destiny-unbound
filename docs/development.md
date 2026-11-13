# Development guide

## Build and run

Needs Node.js 20 or newer.

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

## Tests and tools

```bash
npm test
```

81 checks in 7 suites:

- **engine (26):** data validity, unique names, tier shifts, odds, conditional buffs, Legend Codes, arena maths.
- **art (18):** every generator and language-model connector against a mock server.
- **story (8):** 500 full sagas with random options, requirements, every option switched off, dynasty.
- **extras (5):** packs, achievements, translations.
- **mods (10):** validation, CSS that tries to escape its theme or load outside pictures, every mod kit template loads, the kit's generated reference is up to date.
- **system (8):** version, preferences, save import checks, no API keys in exported saves, title-screen art,
  offline caching, arena matchmaking.
- **discord (6):** the Discord status against a stand-in Discord (handshake, activity, rate limit, switching off,
  pings, Discord not running) and the text for each screen.

| Script | What it does |
| --- | --- |
| `node scripts/balance-report.js` | Plays thousands of legends, fights and sagas per luck level; prints rank spread, arena odds and how sagas end |
| `node scripts/make-menu-css.js` | Rebuilds the title-screen CSS and art from the approved mockups in `mockups/menu/_gen-art.js` |
| `node scripts/make-icons.js` | Makes every icon size from `app/icons/icon-source.png` (runs before every build) |
| `node scripts/make-trailer.js` | Builds `docs/store/trailer.mp4` from the store screenshots (needs ffmpeg) |
| `npm run modkit` | Builds `dist/DestinyUnbound-ModKit-<version>.zip` from `modkit/` and refreshes its generated reference (`reference/theme-variables.md`, `reference/wheels.md`) from the game's data. The release workflow builds and attaches it too; a test fails if the reference is out of date |
| `npm run itch` | Uploads the Windows installer and portable `.exe` from `dist/` to itch.io with [butler](https://itch.io/docs/butler/) (`-- --web` adds the browser build, `-- --modkit` the mod kit, `-- --no-windows` skips the Windows builds, `-- --dry` only shows what it would do). Log butler in once with `butler login` |

The desktop app understands a few test switches (environment variables):

| Variable | Effect |
| --- | --- |
| `FATEWHEEL_SMOKE=1` | Plays one legend (and its story, unless `FATEWHEEL_SMOKE_SHORT=1`) in a hidden window, prints the result as JSON and quits |
| `FATEWHEEL_USERDATA=<folder>` | Uses another save folder (a clean first launch) |
| `FATEWHEEL_MODS_DIR=<folder>` | Uses another Mods folder |
| `FATEWHEEL_OFFLINE=1` | Cuts the app off from the network |
| `FATEWHEEL_UPDATE_URL=<url>` | Reads updates from a plain web folder instead of GitHub |
| `FATEWHEEL_DISCORD_ID=<id>` | Uses this Discord Application ID instead of `discordAppId` in package.json |
| `FATEWHEEL_DISCORD_PIPE=<name>` | Sends the Discord status to a stand-in instead of the Discord app (also during `FATEWHEEL_SMOKE`) |
| `FATEWHEEL_UPDATE_TEST=1` | With an installed build: checks for an update, prints each step, installs it |

## Releases and updates

To release:

1. Set the new `version` in `package.json` and `app/js/version.js`. A test checks they match.
2. Commit.
3. Push a matching tag, for example:

   ```bash
   git tag v0.1.0-alpha.2
   ```

   ```bash
   git push origin v0.1.0-alpha.2
   ```

GitHub Actions then runs the tests, builds Windows, macOS and Linux, and attaches the files to a release
(`.github/workflows/release.yml`). A tag with a dash becomes a pre-release. Every push also runs the tests
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
| `app/js/data.js`, `data-more.js`, `data-extra.js` | Wheel content |
| `app/js/engine.js` | Rules: stages, buffs and debuffs, rating, arena |
| `app/js/story.js`, `story-ui.js` | Story mode rules and screens |
| `app/js/wheel.js`, `card.js`, `render.js`, `app.js` | Wheel canvas, card renderer, HTML helpers, main flow |
| `app/js/menu.js`, `menu-data.js`, `css/menu.css` | Themed title screen, keyboard and controller input, guide, credits, thank-you screen |
| `app/js/options.js`, `prefs.js`, `css/ui.css` | Options screen and the preferences every part reads |
| `app/js/system.js`, `version.js` | Error log, backups, save export and import, play stats, feedback; version |
| `app/js/audio.js` | Themed sound effects and generative music (WebAudio) |
| `app/js/art.js`, `studio.js` | Art prompt builder, generator connectors, the Art Studio |
| `app/js/extras.js` | Saga writer, daily challenge, versus, video recorder |
| `app/js/packs.js`, `achievements.js`, `i18n.js`, `app/lang/` | Wheel packs, achievements, translations |
| `app/js/mods.js`, `mods-ui.js` | Mod loading and safety checks; Mods screen and desktop updates |
| `app/art/`, `app/icons/`, `app/fonts/` | Painted title art, icons, bundled fonts |
| `electron/discord.js`, `app/js/presence.js` | Discord status: the local connection to Discord, and what the game shows. Setup: [discord.md](discord.md) |
| `electron/main.js`, `preload.js` | Desktop shell and the small set of desktop features the page can reach |
| `modkit/` | The mod kit: guide, reference, JSON schemas and templates (zipped by `npm run modkit`) |
| `mockups/` | Design mockups; `menu/` holds the painted main menus the game is built from |
| `docs/` | This guide, modding, Art Studio, alpha test plan, store kit, art credits (every AI image and its prompt) |
| `tests/` | Test suites |

## Contributing

Bug reports and pull requests are welcome. Run `npm test` before sending a change. New wheel entries go in
`app/js/data-extra.js` (or a new data file loaded after it); the tests check that names are unique and every
buff/debuff code parses. By contributing you agree that your contribution is licensed under GPL-3.0-or-later.
