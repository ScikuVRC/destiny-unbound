# Contributing to Destiny Unbound

Thanks for wanting to help! Destiny Unbound is a free, open-source game made by one person, so every bug report,
idea, mod and fix counts.

Come say hi on the Discord first if you like: <https://discord.gg/McDS5HVxzJ>

## Ways to help

- **Report a bug.** Use the [bug report form](https://github.com/ScikuVRC/destiny-unbound/issues/new/choose) or the
  Discord's #bug-reports forum. One bug per report, with your game version and the steps to make it happen.
- **Suggest an idea.** Use the suggestion form or the Discord's #suggestions forum.
- **Test the alpha.** Join the Discord and pick "Help test the alpha". The checklist is pinned in #feedback, and
  the full plan is in [docs/alpha-testing.md](docs/alpha-testing.md).
- **Make a mod or wheel pack.** No coding needed for most of it. Get the mod kit from the
  [itch.io page](https://bzrkherja.itch.io/destiny-unbound) and read [docs/modding.md](docs/modding.md). Share it in
  #mods-and-packs.
- **Translate.** The game has English and Spanish. Translations are plain text files in `app/lang/`; see
  [docs/modding.md](docs/modding.md) for how they work, and ask on the Discord before starting a new language.
- **Write code.** Pick an issue labelled
  [good first issue](https://github.com/ScikuVRC/destiny-unbound/labels/good%20first%20issue), or ask on the Discord
  what would help most.

## Working on the code

You need Node.js 20 or newer.

```bash
npm install
```

```bash
npm start
```

```bash
npm test
```

`npm start` opens the desktop app. The game itself is plain HTML, CSS and JavaScript in `app/` with no build step,
so you can also open `app/index.html` in a browser. [docs/development.md](docs/development.md) explains the code
layout, the tests and how releases work.

Before you send a pull request:

1. Run `npm test`. All checks must pass.
2. Keep each pull request to one change, and say what it fixes or adds and how you checked it.
3. If you change something players see, check it in at least one theme at a phone size and a desktop size.
4. New wheel entries go in `app/js/data-extra.js` (or a new data file loaded after it). The tests check that names
   are unique and that every buff and debuff code parses.
5. If you change text players see, add the Spanish line to `app/lang/es.js` if you can, or say in the pull request
   that it still needs translating.

## Licences

- The game's code and content are under **GPL-3.0-or-later**. By contributing, you agree your contribution is
  licensed under it.
- The mod kit's templates and examples are **CC0**, so modders can use them freely.
- Don't add art, music, text or names you don't have the rights to, including from other games, books, films or
  tabletop settings. Original work only.

## Be kind

Follow the [rules on the Discord](https://discord.gg/McDS5HVxzJ): be kind, keep it safe for work, and no harassment.
The same rules apply here.
