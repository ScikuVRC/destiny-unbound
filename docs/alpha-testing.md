# Destiny Unbound alpha test plan (0.1.0-alpha.1)

## Goals

1. Find crashes, freezes and lost saves before anyone else plays.
2. Learn whether the first ten minutes make sense without help (the main menu, New Legend, the first story).
3. Check the game on PCs other than the developer's: different screens, scaling, controllers, slower laptops.
4. Hear what feels unfair, boring or confusing in the wheels, the story and the arena.

## Who

5–15 people. Mix players who like character generators or tabletop RPGs with a few who do not, and include at
least one person each with a controller, a high-DPI or 4K screen, an older laptop and colour blindness or a
screen reader, if possible.

## How testers get the game

- Send them `DestinyUnbound-Setup-0.1.0-alpha.1.exe` (installs, updates itself once updates are hosted) or the
  portable `.exe` (no install, never updates itself).
- **Windows will warn them** because the alpha is not code-signed: "Windows protected your PC". They click
  **More info → Run anyway**. Tell them this in the invite so it does not look like malware.
- Saves live in `%APPDATA%\FateWheel` (the game's old name, kept so saves carry over) and survive uninstalling.

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
- [ ] Optional: install the example mod (Menu > Mods) or make a small one.

## How feedback comes back

- **In the game:** Options > Data > **Send feedback** saves a folder with their note, a screenshot, the error log
  and (if they tick it) their play stats. They zip it and send it to you.
- **Where they send it:** choose one channel and put it in the invite: a Discord channel, an email address, or
  GitHub Issues (github.com/ScikuVRC/destiny-unbound/issues), where the game's "Report a bug online" button
  points. Testers need a free GitHub account to post there.
- Ask three questions at the end: What was the best moment? What was the most confusing moment? Would you play
  again tomorrow, and why or why not?

## Timeline (suggested)

- Week 1: send the invite and the build. Testers do session one.
- Week 2: testers do session two. Fix crashes and blockers as they come in and ship alpha.2 if needed.
- End of week 2: collect the three questions, write up what changes for the beta.

## Known issues in this alpha (tell testers up front)

- The build is not code-signed, so Windows SmartScreen warns on first launch.
- Automatic updates work for the installer once a release is published on GitHub
  (github.com/ScikuVRC/destiny-unbound/releases); the portable `.exe` never updates itself.
- Fullscreen is borderless fullscreen; there is no exclusive fullscreen mode.
- Sound always uses the system's default output device.
- Spanish covers the menus, Options and most of the game; some story text may still be in English.
- macOS and Linux builds have not been tested.
- AI portraits and tales need the player's own image generator or API key (optional).

## After the alpha

Answer before the beta: Is the first story too long or too short? Do testers find the arena fair at Mortal luck?
Which theme do they pick most? What do they wish the wheels had?
