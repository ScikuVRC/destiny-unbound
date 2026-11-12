# Destiny Unbound: store page kit

Everything needed to fill in an itch.io or Steam page. Screenshots are in `screenshots/` (1920×1080 PNG) and a
30-second teaser is `trailer.mp4` (rebuild it with `node scripts/make-trailer.js` after new screenshots).

## Name and tagline

- **Name:** Destiny Unbound
- **Tagline (under 80 characters):** Spin the wheels of fate. Forge a legend. Live its story, or die trying.
- **Short description (under 300 characters, Steam's limit):**
  Spin over forty wheels to forge a fantasy hero: race, powers, weapon, weakness and more, each with buffs and
  debuffs. Then live their saga, chapter by chapter, through quests, wars, love and heirs until they retire,
  ascend or fall. Free and open source.

## About the game

Destiny Unbound is a spin-the-wheel character forge and story game.

**Forge a legend.** Every part of your hero is a spin: race and bloodline, birthplace, age, height, class,
strength, speed, powers, weapon, companion, weakness, title and more. Bigger slices are likelier, so a human
farmhand is common and a god is a sliver. Every result brings buffs and debuffs that push the other wheels up or
down their tiers. Choose your luck, from Mortal (fair odds) to Divine (cosmic heroes).

**Live the story.** A finished legend begins its saga. Spin each chapter: quests, dragons, kingdoms, wars,
rivals, love and heirs. Used chapters grey out. Death is a real possibility, and when the saga ends your heir can
carry the house on.

**Fight in the arena.** Send your hero against foes from thirteen worlds. Their weaknesses, your resistances and
the arena itself shift the odds, and the wheel shows them honestly.

**Make it yours.** Four painted themes (Ashen Crown, Astral Oracle, Iron Litany and Blood Moon), each with its own
wheel, sounds and music. A Wheel Workshop to change any wheel. Mods for your own themes, sounds and entries.
A daily challenge with the same spins for everyone. Optional AI portraits with the image generator you choose.

**Free and open source** under the GPL. No ads, no accounts, works offline.

## Features (bullet list)

- 40+ wheels and over 1,400 entries, each with buffs and debuffs
- Story mode with sagas, nemeses, kingdoms, dynasties and heirs
- Arena fights across thirteen worlds, 77 opponents
- Four painted themes with their own wheels, sounds and music
- Daily challenge, Hall of Legends, 22 achievements
- Wheel Workshop and mod support (themes, sounds, wheel entries)
- Full controller support, rebindable keys, colour-blind-safe wheels, high contrast, sound captions
- English and Spanish

## Tags

Character Generator, RPG, Fantasy, Dark Fantasy, Choose Your Own Adventure, Roguelite, Randomness,
Singleplayer, Free to Play, Open Source, Moddable, Casual, Controller.

## System requirements

- **OS:** Windows 10 or 11 (64-bit). macOS and Linux builds exist but are untested in this alpha.
- **Processor:** any dual-core from the last ten years
- **Memory:** 4 GB RAM (the game uses about 200 MB)
- **Graphics:** anything that runs a modern browser; no dedicated GPU needed
- **Storage:** 400 MB
- **Internet:** not needed (only for updates and optional AI portraits)

## AI content disclosure (Steam asks for this; itch.io has a similar field)

- **Code and text:** the game is made by one person without funding for a team. Much of the code was written
  with an AI coding assistant (Claude, by Anthropic), and many wheel entries, story texts and the Spanish
  translation were drafted with AI help, then edited and tested by hand.
- **Pre-generated art:** the painted title-screen backgrounds, wheel paintings, the four logos and the app icon
  were generated with Grok Imagine (xAI) and then placed and composed in the game by hand. Everything else (the
  playable wheels, cards, icons and interface) is drawn in code.
- **Live-generated content:** optional, off by default. Players can connect their own image generator or
  language model to paint a portrait or write a saga's tale. The game sends only the character's description.
  Nothing is generated unless the player sets it up and asks.
- Before publishing, check xAI's current terms for commercial use of Grok images and keep a record of the
  prompts. The images are in `app/art` and `mockups/menu/art`, and the prompts are summarized in the git history.

## Pictures a store page needs (not made yet)

- itch.io: a cover image 630×500 (the Ashen Crown logo over its painted city works well).
- Steam: header capsule 920×430, small capsule 462×174, main capsule 1232×706, vertical capsule 748×896, library
  hero 3840×1240 and library logo (a transparent PNG). These can be cut from the painted backgrounds and logos;
  the logo needs a transparent version first.

## Content notes

Fantasy violence and death described in text (no gore). Romance is mentioned in story chapters (not explicit).
Suitable for teens and up.
