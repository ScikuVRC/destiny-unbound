# Destiny Unbound: store page kit

Everything needed to fill in an itch.io or Steam page. Screenshots are in `screenshots/` (1920×1080 PNG) and a
84-second trailer is `trailer.mp4` (rebuild it with `node scripts/make-trailer.js` after new screenshots).

## Name and tagline

- **Name:** Destiny Unbound
- **Tagline (under 80 characters):** Spin the wheels of fate. Forge a legend. Live its story, or die trying.
- **Short description (under 300 characters, Steam's limit):**
  Spin over forty wheels to forge a fantasy hero, then live their saga: make choices, fight bosses, found a
  dynasty and reach one of ten endings, or die trying. Free and open source.

## About the game

Destiny Unbound is a spin-the-wheel character forge and story game.

**Forge a legend.** Every part of your hero is a spin: race and bloodline, birthplace, age, class, strength,
speed, powers, weapon, companion, weakness, title and more. Bigger slices are likelier, so a human farmhand is
common and a god is a sliver, and when a sliver hits, the wheel creeps over the last slices and lights up. Every
result brings buffs and debuffs that push the other wheels up or down. Choose your luck, from Mortal (fair
odds) to Divine (cosmic heroes).

**Live the saga.** A finished legend begins its story, chapter by chapter: quests, dragons, kingdoms, wars,
rivals, love and heirs. At key moments you choose (fight the dragon, talk to it, or rob its hoard) and the wheel
decides how it goes. Your class and personality change the odds. Death is real, and ten endings wait, each with
its own painting.

**Found a dynasty.** When a saga ends, your heir carries the house on with a family trait, an heirloom and any
living nemesis. The family tree remembers every generation.

**Fight in the arena.** Send your hero against 77 foes from thirteen worlds. Bosses have tricks: wards,
immunities, rage and second phases. Their weaknesses, your resistances and the arena shift the odds, and the
wheel shows them honestly.

**Make it yours.** Four painted themes (Ashen Crown, Astral Oracle, Iron Litany and Blood Moon), painted hero
portraits and rank frames, optional HD music, a Wheel Workshop to change any wheel, and mods for your own themes,
sounds and entries. A daily challenge with the same spins for everyone and an opt-in leaderboard.

**Free and open source** under the GPL. No ads, no accounts, works offline.

## Features (bullet list)

- 40+ wheels and over 1,400 entries, each with buffs and debuffs
- Rare results get their moment: the wheel slows, the slice lights up
- Story mode with 49 kinds of chapter, real choices, nemeses, kingdoms and heirs
- Ten endings, each with its own painting
- Dynasties with family traits and a family tree
- Arena fights across thirteen worlds, 77 opponents, bosses with their own tricks
- Painted hero portraits and card frames that grow grander with your rank
- Four painted themes with their own wheels, sounds and music, plus optional HD music
- Daily challenge with an opt-in leaderboard, Hall of Legends, collection, 34 achievements, versus mode
- Share a hero with a short card code
- Wheel Workshop and mod support (themes, sounds, wheel entries)
- Full controller support, rebindable keys, colour-blind-safe wheels, high contrast, sound captions
- English, Spanish, French, German and Japanese

## Tags

Character Generator, RPG, Fantasy, Dark Fantasy, Choose Your Own Adventure, Roguelite, Randomness,
Singleplayer, Free to Play, Open Source, Moddable, Casual, Controller.

## System requirements

- **OS:** Windows 10 or 11 (64-bit). macOS and Linux builds are on GitHub Releases but untested in this alpha.
- **Processor:** any dual-core from the last ten years
- **Memory:** 4 GB RAM (the game uses about 200 MB)
- **Graphics:** anything that runs a modern browser; no dedicated GPU needed
- **Storage:** 400 MB
- **Internet:** not needed (only for updates and optional AI portraits)

## AI content disclosure (Steam asks for this; itch.io has a similar field)

- **Code and text:** the game is made by one person without funding for a team. Much of the code was written
  with an AI coding assistant (Claude, by Anthropic), and many wheel entries, story texts and the
  translations were drafted with AI help, then edited and tested by hand.
- **Pre-generated art:** Created with Grok. The painted title-screen backgrounds, wheel paintings, hero portraits,
  ending paintings, boss and dragon portraits, arena backdrops, the four logos and the app icon were generated with Grok Imagine (xAI) and then placed and composed in the game by hand.
  Everything else (the playable wheels, cards, icons and interface) is drawn in code.
- **Pre-generated music:** the optional HD music (offered on first launch, off unless the player picks it) is a
  set of placeholder tracks made with ACE-Step (an open-source AI music model), normalized and trimmed by hand; every track is in
  [`docs/music-credits.md`](../music-credits.md). The classic music and all sound effects are synthesized in code.
  On itch.io, tick "AI Generated Sound".
- **Live-generated content:** optional, off by default. Players can connect their own image generator or
  language model to paint a portrait or write a saga's tale. The game sends only the character's description.
  Nothing is generated unless the player sets it up and asks.
- xAI's terms were checked on 2026-11-13, and every image and its prompt is recorded in
  [`docs/art-credits.md`](../art-credits.md). xAI asks for the words "Created with Grok" wherever the art is
  published, so keep that phrase in any store page's description. Check the terms again before a Steam release.

## Pictures a store page needs (not made yet)

- itch.io: a cover image 630×500 (the Ashen Crown logo over its painted city works well).
- Steam: header capsule 920×430, small capsule 462×174, main capsule 1232×706, vertical capsule 748×896, library
  hero 3840×1240 and library logo (a transparent PNG). These can be cut from the painted backgrounds and logos;
  transparent logos for all four themes are in `brand/`.

## Content notes

Fantasy violence and death described in text (no gore). Romance is mentioned in story chapters (not explicit).
Suitable for teens and up.
