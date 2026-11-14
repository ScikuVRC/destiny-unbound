# Destiny Unbound alpha test plan

Current build: **0.2.0-alpha.3.3**. Ready-to-send invite texts are in [tester-invite.md](tester-invite.md).

## Goals

1. Find crashes, freezes and lost saves before anyone else plays.
2. Learn whether the first ten minutes make sense without help (the main menu, New Legend, the first story).
3. Check the game on PCs other than the developer's: different screens, scaling, controllers, slower laptops.
4. Hear what feels unfair, boring or confusing in the wheels, the story and the arena.

## Who

5–15 people. Mix players who like character generators or tabletop RPGs with a few who do not, and include at
least one person each with a controller, a high-DPI or 4K screen, an older laptop and colour blindness or a
screen reader, if possible. One Mac or Linux player would help a lot: those builds have not been tested yet.

## How testers join

1. They join the Discord: <https://discord.gg/McDS5HVxzJ>. On the first screen ("What brings you to Destiny
   Unbound?") they pick **Help test the alpha**, which gives them the **Tester** role automatically.
2. They get the game from <https://bzrkherja.itch.io/destiny-unbound>: play in the browser, or download the Windows
   installer (updates itself) or the portable version (no install, never updates itself). Mac and Linux builds are
   on the GitHub releases page: <https://github.com/ScikuVRC/destiny-unbound/releases>.
3. **Windows will warn them** because the alpha is not code-signed: "Windows protected your PC". They click
   **More info → Run anyway**. The invite says this so it does not look like malware.

Saves live in `%APPDATA%\FateWheel` (the game's old name, kept so saves carry over) and survive uninstalling. In
the browser they live in that browser's storage for the itch.io page.

## What to ask testers to do

First session (about 30 minutes):

- [ ] Start the game and read the four-step guide. Was anything unclear?
- [ ] Spin one legend by hand and one with Auto-spin.
- [ ] Begin its story and play until it ends (death, retirement or ascension).
- [ ] Try the arena once and the Daily Challenge once.
- [ ] Switch through all four themes. Does any screen look broken?
- [ ] Open Options and try display mode, window size, interface scale and the volume sliders.

Second session (any time later):

- [ ] Play with a controller if you have one (menus, spinning, Options).
- [ ] Try Options > Accessibility: text size, high contrast, colour-blind-safe wheels, sound captions.
- [ ] Save a legend to the Hall, export your save (Options > Data), and import it again.
- [ ] Continue a legend's story as its heir.
- [ ] Desktop app with Discord open: check your Discord status shows what you're doing.
- [ ] Optional: get the mod kit from the itch.io page and try a template, or install a mod (Menu > Mods).

## How feedback comes back

- **Bugs:** one post per bug in the Discord's **#bug-reports** forum. It asks for the version, platform, steps,
  what happened and a screenshot, and posts need a tag (Windows app, Browser, Mac or Linux, Crash or freeze,
  Looks wrong, Gameplay). Moderators mark solved ones **Fixed**.
- **Ideas:** **#suggestions**, one post per idea. Picked-up ideas get the **Planned** tag.
- **Everything else:** **#feedback**.
- **In the game:** Options > Data > **Send feedback** saves a folder with their note, a screenshot, the error log
  and (if they tick it) their play stats, which they can attach to a bug post. The same window has "Talk on
  Discord" and "Report a bug online" (GitHub Issues, for testers who prefer it).
- Ask three questions at the end: What was the best moment? What was the most confusing moment? Would you play
  again tomorrow, and why or why not?

## Timeline (suggested)

- Week 1: send the invite. Testers do session one.
- Week 2: testers do session two. Fix crashes and blockers as they come in and ship a new alpha if needed.
- End of week 2: collect the three questions, write up what changes for the beta.

## Known issues in this alpha (tell testers up front)

- The build is not code-signed, so Windows SmartScreen warns on first launch.
- The portable `.exe` never updates itself; the installer does.
- Fullscreen is borderless fullscreen; there is no exclusive fullscreen mode.
- Sound always uses the system's default output device.
- Spanish, French, German and Japanese cover the menus, Options and most of the game; story text is still in
  English. French, German and Japanese are AI drafts that no native speaker has checked yet.
- macOS and Linux builds have not been tested.
- AI portraits and tales need the player's own image generator or API key (optional).

## After the alpha

Answer before the beta: Is the first story too long or too short? Do testers find the arena fair at Mortal luck?
Which theme do they pick most? What do they wish the wheels had?
