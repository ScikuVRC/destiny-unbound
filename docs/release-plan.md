# Release plan: alpha, beta and 1.0

What each stage means, what has to be true before moving on, and how a release is made. Written 2026-11-14 at
0.2.0-alpha.2. The open items live in [progress.md](../progress.md); this page is the rules.

## The stages

| Stage | Version | Who it's for | Promise to players |
| --- | --- | --- | --- |
| **Alpha** (now) | `0.x.y-alpha.n` | Testers and curious players | Playable start to finish. Things change often, balance moves, saves are kept but layouts and numbers may not be final. |
| **Beta** | `0.x.y-beta.n` | Everyone on itch.io | Feature-complete for 1.0. Only fixes, balance, translation and polish. Saves, Legend Codes and mods made now keep working in 1.0. |
| **Release candidate** | `1.0.0-rc.n` | Everyone | What we think 1.0 is. Only fixes for real bugs. |
| **1.0** | `1.0.0` | Everyone, store pages | Stable. After it, `1.x` adds content without breaking saves, codes or mods; `1.0.x` only fixes. |

Pre-release builds (alpha, beta, rc) update to newer pre-releases automatically. From 1.0 the desktop app offers a
choice: stable updates only, or early builds too.

## Leaving alpha: the beta checklist

Every item must be done (or consciously moved to "after 1.0" with a note in progress.md):

- [ ] **Alpha test held:** two weeks with 5-15 players; every crash and every "I got stuck" report fixed.
- [ ] **No known crash** in the error logs testers send, and none open on GitHub.
- [ ] **Saves are safe:** a save format version and a migration test (improvement list item 77), so beta saves load
      in 1.0.
- [ ] **Every platform checked by a person:** Windows installer and portable, macOS, Linux AppImage, the itch.io
      browser player, one iPhone and one Android phone.
- [ ] **Layout:** the layout check passes at every listed size in all four themes; SPIN on screen at 1280x800.
- [ ] **Translations:** the story text in Spanish at least; French, German and Japanese menus reviewed by a native
      speaker (or marked "machine draft" in the language picker).
- [ ] **Balance:** the balance report and win-rate report run, with no race or class more than 5 points off its
      luck level's average apart from the rare top tier on purpose.
- [ ] **Store page ready:** fresh screenshots, trailer, the "Created with Grok" credit, the privacy section.
- [ ] **Feature freeze decided:** the list of what 1.0 contains is written down; anything else waits for 1.1.

## Leaving beta: the 1.0 checklist

- [ ] At least two beta releases, the last one with no new features.
- [ ] No open bug that loses saves, breaks a Legend Code, or stops a saga.
- [ ] Windows code signing decided (bought and set up, or a note on the itch.io page about the SmartScreen warning).
- [ ] A release candidate published for at least a week without a new serious bug.
- [ ] Credits, licences and the art log checked; every sound and image has its source recorded.

## A quiet week before each stage

Before tagging the first beta, the first release candidate and 1.0: one week with **no new features**. Only fixes,
text and balance. New ideas go on the list for the next version.

## Version numbers

- `0.MINOR.PATCH-stage.n` until 1.0. MINOR goes up for a big update (0.2 was story arcs and the new spin screen),
  PATCH for a smaller one, `n` for each build of the same stage.
- After 1.0: `1.MINOR.PATCH`. MINOR adds content, PATCH only fixes.
- A **small update** (a few fixes or one feature between builds) adds a number to the current build instead of
  starting a new one: `0.2.0-alpha.3.1`, `0.2.0-alpha.3.2`. It still updates installed copies, and the announcement
  is marked "small update".
- A version never goes backwards and is never reused.

## How a release is made

1. Every check is green: `npm test`, `npm run lint`, `npm run format:check`, `node scripts/make-modkit.js --check`.
2. The version goes up in `package.json`, `app/js/version.js`, the README badge, `docs/alpha-testing.md` and the bug
   report form; the cache version in `app/index.html` (`?v=`) and `app/sw.js` goes up too.
3. `CHANGELOG.md` gets the version's section (it becomes the GitHub release notes).
4. Commit, tag `v<version>`, push the commit and the tag. The release workflow builds Windows, macOS and Linux,
   publishes the GitHub release, uploads to itch.io and posts in #announcements.
5. After it's green: update the Discord bot server (`git pull` and restart) if anything under `bot/` or the game data
   changed, and redeploy the world counter if anything under `worker/` changed.
