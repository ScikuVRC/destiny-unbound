# Art credits and AI image record

Every painted image in Destiny Unbound was **Created with Grok** (Grok Imagine, by xAI), on the developer's own
SuperGrok account, and then cropped, blended and composed into the game by hand. Everything else you see (the
playable wheels, character cards, icons and interface) is drawn in code.

This file keeps a record of each image and the prompt that made it, as xAI's terms make the user responsible for
their outputs. The `app/art` copies are the ones the game ships (the title art as WebP since 0.2.0-alpha.4.8); `mockups/menu/art` holds the same files plus the
retired Adventurer's Sheet look. Images made from these (the store covers and itch.io backgrounds in
`docs/store`, the Steam library hero (enlarged with the open-source Real-ESRGAN upscaler), the store screenshots and the trailer) contain this art too.

## Terms checked

Checked on 2026-11-13 against xAI's consumer [Terms of Service](https://x.ai/legal/terms-of-service) (last updated
27 October 2026), [Acceptable Use Policy](https://x.ai/legal/acceptable-use-policy) (effective 14 August 2026) and
[Brand Guidelines](https://x.ai/legal/brand-guidelines) (14 February 2025):

- **Ownership:** the user keeps ownership of their inputs and outputs. xAI keeps a broad licence to use them too.
- **Commercial use:** the consumer terms don't forbid it.
- **Attribution:** required. The game must show "Created with Grok" legibly wherever the images are published or
  distributed. It is in the in-game credits, the README, the itch.io page and the store kit.
- **No exclusivity or warranty:** outputs may not be unique, and the user carries all risk, including copyright
  claims. xAI gives no indemnity.
- **Press:** contact legal@x.ai before naming xAI or Grok in press releases.
- **Automation:** the Acceptable Use Policy forbids reaching the service "through unauthorized automated or
  non-human means". Make future images by hand on grok.com, or through xAI's official API under its own terms.

This is a summary for the project, not legal advice. The terms change, so check them again before a big release.

## Images and prompts

### `app/art/ashen-bg.webp`

Ashen Crown title background. Generated 2026-11-12.

> Create an image, wide 16:9: dark fantasy video game title screen background. A ruined gothic city of black stone in ash and smoke, glowing embers drifting upward, molten orange firelight rising from a chasm below, broken towers in the distance. The left third of the image is darker and empty so a menu can sit there. Cinematic painterly concept art, highly detailed, dramatic lighting. No text, no logo, no characters.

### `app/art/ashen-wheel.webp`

Ashen Crown wheel painting. Generated 2026-11-12.

> Create another image, square 1:1: an ornate ancient Wheel of Fate emblem seen straight from the front, centered. Forged dark iron and engraved gold, runes and compass stars carved around the outer ring, twelve segments with small sigils, a cracked glowing molten-gold core, and a long sword-like golden pointer at the top. Isolated on a plain pure black background. Same dark fantasy painterly style, highly detailed metal. No text.

### `mockups/menu/art/tabletop-bg.jpg`

Retired Adventurer's Sheet mockup background (not in the game). Generated 2026-11-12.

> Create another image, wide 16:9: fantasy tabletop RPG game title screen background. An old wooden game table lit by warm candlelight, a large open leather-bound book with blank aged parchment pages in the center, scattered polyhedral dice, a quill and ink pot, a hand-drawn fantasy map and a few tokens around the edges. Both book pages are empty so a title and a menu can be placed on them. Cozy painterly concept art, highly detailed. No text, no logo.

### `mockups/menu/art/tabletop-wheel.jpg`

Retired Adventurer's Sheet mockup wheel (not in the game). Generated 2026-11-12.

> Create another image, square 1:1: a hand-inked Wheel of Fate drawn on aged parchment, seen straight from the front, centered. Sepia and black ink linework with fine cross-hatching, a compass rose and small hand-drawn sigils in each segment, a carved red twenty-sided die as the hub, a red ink arrow pointer at the top. Plain parchment background around it. Highly detailed illustration in the style of an old adventurer's journal. No text.

### `app/art/iron-bg.webp`

Iron Litany title background. Generated 2026-11-12.

> Create another image, wide 16:9: grimdark gothic sci-fi game title screen background. The inside of a colossal cathedral-forge at war: towering gothic arches, brass pipes and chains, giant cogs, oxblood banners, a blood-red sky seen through broken stained-glass windows, smoke and sparks, cold candlelight. The center of the image is darker and open so a title and a menu can sit there. Cinematic painterly concept art, highly detailed. No text, no logo, no characters, no skulls.

### `app/art/iron-wheel.webp`

Iron Litany wheel painting. Generated 2026-11-12.

> Create another image, square 1:1: a massive gothic Wheel of Fate emblem seen straight from the front, centered. A riveted brass and gunmetal cogwheel with gear teeth around the rim, oxblood red enamel segments with engraved gothic sigils, a glowing red gem set in a smaller cog at the hub, and a tall brass spike pointer at the top. Isolated on a plain pure black background. Grimdark gothic sci-fi, painterly, highly detailed metal. No text, no skulls.

### `app/art/bloodmoon-bg.webp`

Blood Moon title background. Generated 2026-11-12.

> Create another image, wide 16:9: gothic horror game title screen background. A huge dark blood-red moon rising behind the black spires and rooftops of a Victorian gothic cathedral city at night, thin mist in the streets, cold silver moonlight on wet cobblestones, a few distant lit windows. The left third of the image is darker and empty so a menu can sit there. Cinematic painterly concept art, eerie and elegant, highly detailed. No text, no logo, no characters.

### `app/art/bloodmoon-wheel.webp`

Blood Moon wheel painting. Generated 2026-11-12.

> Create another image, square 1:1: an eldritch gothic Wheel of Fate emblem seen straight from the front, centered. Black wrought iron with fine silver filigree and curling ornaments around the rim, dark crimson and deep violet segments with faint engraved sigils, a single green reptilian eye with a slit pupil at the center, and a curved silver claw as the pointer at the top. A faint crimson glow behind it. Isolated on a plain pure black background. Gothic horror, elegant, painterly, highly detailed. No text.

### `app/art/ashen-logo.webp`

Ashen Crown logo. Generated 2026-11-12.

> Generate an image: a dark fantasy video game title logo that reads exactly "DESTINY UNBOUND" (two words, spelled D-E-S-T-I-N-Y  U-N-B-O-U-N-D), large ornate engraved gold metal letters with glowing ember-orange edges and floating sparks, a broken golden chain and a small rune wheel emblem behind the text, centered, wide horizontal composition, on a pure solid black background, no other text.

### `mockups/menu/art/tabletop-logo.jpg`

Retired Adventurer's Sheet mockup logo (not in the game). Generated 2026-11-12.

> Generate a new image: a tabletop fantasy game title logo that reads exactly "DESTINY UNBOUND" (spelled D-E-S-T-I-N-Y  U-N-B-O-U-N-D), hand-inked illuminated manuscript lettering in deep crimson red and dark brown ink with gold leaf accents, a small compass rose and a twenty-sided die emblem, quill flourishes, centered, wide horizontal composition, on a plain flat light cream parchment background, no other text.

### `app/art/iron-logo.webp`

Iron Litany logo. Generated 2026-11-12.

> Generate a new image: a grimdark gothic sci-fi cathedral style game title logo that reads exactly "DESTINY UNBOUND" (spelled D-E-S-T-I-N-Y  U-N-B-O-U-N-D), heavy blackletter gothic letters forged from tarnished brass and gold with riveted iron, a skull-and-cog emblem with spread wings above, red wax purity seal with ribbon, centered, wide horizontal composition, on a pure solid black background, no other text.

### `app/art/bloodmoon-logo.webp`

Blood Moon logo. Generated 2026-11-12.

> Generate a new image: a gothic horror game title logo that reads exactly "DESTINY UNBOUND" (spelled D-E-S-T-I-N-Y  U-N-B-O-U-N-D), elegant Victorian serif capitals in tarnished silver with thin blood-red highlights, wrought-iron filigree and thorned vines, a small crimson blood moon disc behind the text, centered, wide horizontal composition, on a pure solid black background, no other text.

### `app/art/astral-bg.webp`

Astral Oracle title background. Generated 2026-11-12.

> Generate a new image: wide cinematic fantasy game main menu background, an ancient celestial observatory of white marble and silver on a snowy mountain peak at night, giant brass astrolabe rings and a telescope, a vast swirling nebula sky in deep midnight blue, violet and teal with bright stars and a glowing constellation map, soft moonlight, the left third of the image darker and calmer for a menu, painterly highly detailed concept art, no text.

### `app/art/astral-wheel.webp`

Astral Oracle wheel painting. Generated 2026-11-12.

> Generate a new image: a single ornate celestial fortune wheel seen straight on, an astrolabe of polished silver and sapphire blue enamel, twelve segments each engraved with a glowing constellation glyph, outer ring of tiny stars and moon phases, a radiant white-blue star core in the center, a slender silver pointer at the top, fantasy game asset, centered, on a pure solid black background, no text.

### `app/art/astral-logo.webp`

Astral Oracle logo. Generated 2026-11-12.

> Generate a new image: an elegant celestial fantasy game title logo that reads exactly "DESTINY UNBOUND" (spelled D-E-S-T-I-N-Y  U-N-B-O-U-N-D), refined engraved silver capital letters with a soft icy blue glow and tiny star sparkles, a thin crescent moon and an astrolabe ring arc behind the text, constellation lines connecting small stars, centered, wide horizontal composition, on a pure solid black background, no other text.

### `app/icons/icon-source.png`

App icon (every icon size is made from it by scripts/make-icons.js). Generated 2026-11-12.

> Generate a new image: a video game app icon, a bold ornate fortune wheel emblem of polished gold with eight glowing rune segments and a bright molten-orange glowing core, a broken golden chain link shattering across the front of the wheel, strong simple silhouette that reads clearly at small sizes, the emblem small and centered in the middle of the image with lots of empty space around it, on a plain smooth dark charcoal background with a soft warm vignette glow behind the emblem, no text, no letters.

### `brand/logo-ashen.png`, `logo-astral.png`, `logo-iron.png`, `logo-bloodmoon.png`

Transparent versions of the four theme logos above (no new image was generated). Made 2026-11-13 by
`scripts/make-transparent-logos.py`, which turns each logo's black background into transparency and keeps the
artwork. Created with Grok, like the originals.

## Arena backdrops and foe portraits (2026-11-14)

Made by hand on grok.com (Grok Imagine, Quality 2.0, four images per prompt; one picked per prompt), then resized
and saved as WebP: backdrops 1280x720 in `app/art/arena/`, portraits 512x512 in `app/art/foes/`. Created with Grok.
The battle report shows the backdrop of the arena's first condition and the foe's portrait when it has one.

### `app/art/arena/dark.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: a haunted graveyard under a moonless night sky, crooked tombstones, dead trees, cold blue moonlight and low mist. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/sun.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: an ancient sun-baked colosseum at blazing noon, sand arena floor, broken stone arches, harsh white sunlight and heat haze. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/water.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: ruins of a sunken temple deep underwater, broken pillars covered in coral and kelp, shafts of light from the surface far above, drifting particles, deep teal and blue. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/storm.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: a jagged mountain summit in a raging thunderstorm, forks of lightning, black churning clouds, wind-torn banners on a ruined stone platform. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/void.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: the void between worlds, broken islands of rock floating in a starless violet nothing, a swirling black hole with a glowing rim in the distance, shards of shattered reality. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/fire.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: a volcanic forge inside a mountain, rivers of glowing lava, a narrow stone bridge over magma, giant anvils and chains, embers rising in the dark. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/ice.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: a frozen waste in a blizzard, towering cliffs of blue ice, a frozen lake cracked underfoot, snow whipping through pale cold light. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/holy.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: the nave of a vast sacred cathedral, golden light pouring through tall stained-glass windows, marble floor, rows of stone saints, dust in the light beams. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/wild.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: a clearing in an ancient primeval forest, colossal mossy trees with twisted roots, ferns, green-gold sunbeams through the canopy, old standing stones. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/urban.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: rooftops of a sprawling gothic city at dusk, slate roofs and chimneys, a great clocktower, glowing lantern-lit streets far below, smoke and a crimson sky. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/arena/plains.webp`

> Painterly dark fantasy video game battle arena background, wide 16:9: wide open grassy plains under a dramatic overcast sky, a ruined castle on a distant hill, wind through the long grass, an old battlefield with broken spears. Atmospheric, cinematic lighting, highly detailed concept art. No characters, no text, no logo.

### `app/art/foes/ashwing.webp`

> Painterly dark fantasy video game boss portrait, square: Ashwing the Young, a young fire dragon with ember-red scales and glowing cracks of heat between them, small sharp horns, smoke curling from its jaws. Head and neck, facing the viewer, dramatic rim lighting, dark smoky background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/rimefang.webp`

> Painterly dark fantasy video game boss portrait, square: Rimefang, an ancient ice dragon with pale blue crystalline scales, frost-rimed horns and icicle fangs, freezing mist pouring from its jaws, cold glowing eyes. Head and neck, facing the viewer, dramatic rim lighting, dark misty background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/stormcrown.webp`

> Painterly dark fantasy video game boss portrait, square: Stormcrown, a storm dragon with slate-grey scales and a crown of jagged horns crackling with blue lightning, storm clouds swirling around its head, glowing white eyes. Head and neck, facing the viewer, dramatic rim lighting, dark stormy background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/venomscale.webp`

> Painterly dark fantasy video game boss portrait, square: Venomscale, a serpentine poison dragon with dark green and black scales, acid-green venom dripping from its fangs, toxic green vapour, slit yellow eyes. Head and neck, facing the viewer, dramatic rim lighting, dark swampy background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/nightmaw.webp`

> Painterly dark fantasy video game boss portrait, square: Nightmaw, a shadow dragon with scales black as a moonless night, wisps of darkness peeling off its horns, faint violet glow in its eyes and throat, a vast maw of needle teeth. Head and neck, facing the viewer, dramatic rim lighting, deep black background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/goldtyrant.webp`

> Painterly dark fantasy video game boss portrait, square: The Gold Tyrant, a colossal dragon with burnished gold scales and a crown of horns, white-gold holy fire in its throat, jewels embedded in its hide from centuries on a hoard, proud cruel eyes. Head and neck, facing the viewer, dramatic rim lighting, dark background with glinting treasure, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/vaelgor.webp`

> Painterly dark fantasy video game boss portrait, square: Vaelgor the World-Burner, an apocalyptic titan dragon with obsidian scales split by rivers of magma, horns like broken mountains, a burning void glowing in its open jaws, ash and embers filling the air. Head and neck, facing the viewer, dramatic rim lighting, dark burning background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/kaelun.webp`

> Painterly dark fantasy video game boss portrait, square: Dread Sovereign Kaelun, the last king of a kingdom of ash, an undead king in blackened ash-grey plate armour, a crown of smouldering embers, cracked grey skin glowing orange from within, cold burning eyes. Head and shoulders, facing the viewer, dramatic rim lighting, dark smoky background with drifting ash, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/shogun.webp`

> Painterly dark fantasy video game boss portrait, square: Shogun Prime, a cyber-samurai warlord of a neon megacity, ornate black and crimson samurai armour fused with chrome machinery, a glowing red visor slit, neon kanji-free signs reflected on the armour, rain. Head and shoulders, facing the viewer, dramatic rim lighting in magenta and cyan, dark rainy background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/gorun.webp`

> Painterly dark fantasy video game boss portrait, square: Planet-Eater Gorun, a colossal cosmic giant whose dark skin is full of stars and nebulae, a cracked planet held near its open mouth, eyes like two burning suns, crown of orbiting moons. Head and shoulders, facing the viewer, dramatic rim lighting, deep space background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/stormhart.webp`

> Painterly dark fantasy video game boss portrait, square: Elder Storm-Hart, an ancient colossal stag spirit of the forest, antlers branching into crackling lightning and storm clouds, moss and vines on its neck, wise furious glowing eyes. Head and neck, facing the viewer, dramatic rim lighting, dark stormy forest background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/ulm.webp`

> Painterly dark fantasy video game boss portrait, square: Forge-God Ulm, a towering god of the forge made of dark iron, a beard of flowing molten metal, eyes like furnace slits, rivets and runes on his iron skin, a great hammer on his shoulder, sparks flying. Head and shoulders, facing the viewer, dramatic rim lighting, dark forge background with orange glow, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/nameless.webp`

> Painterly dark fantasy video game boss portrait, square: The Nameless Throne, the absent king of a court in the void, a tall robed figure with no face, only a smooth dark oval where a face should be, an empty floating crown of black glass above it, tendrils of violet void unravelling from its robes. Head and shoulders, facing the viewer, dramatic rim lighting, starless violet background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/zhalmarr.webp`

> Painterly dark fantasy video game boss portrait, square: Dragon Emperor Zhalmarr, sovereign of all wyrms, an ancient regal dragon with deep crimson and bronze scales, wearing an emperor's golden crown and jade ornaments woven between its horns, long whiskers, smoke and gold leaf drifting. Head and neck, facing the viewer, dramatic rim lighting, dark imperial background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/drowned.webp`

> Painterly dark fantasy video game boss portrait, square: The Drowned Emperor, a dead king who still holds court beneath the sea, pale blue-grey skin, a crown of coral and barnacles, seaweed tangled in long white hair, glowing sea-green eyes, robes drifting in the water, bubbles rising. Head and shoulders, facing the viewer, dramatic rim lighting, dark underwater background with light from above, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/unwound.webp`

> Painterly dark fantasy video game boss portrait, square: The Unwound King, a clockwork automaton monarch, a cracked porcelain face mask over exposed brass gears and springs, a crown of clock hands, one eye a glowing amber lens, a huge ticking heart visible through his chest plate. Head and shoulders, facing the viewer, dramatic rim lighting, dark background with drifting gears, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/eclipse.webp`

> Painterly dark fantasy video game boss portrait, square: the Mother of Eclipses, a celestial witch-queen of a hollow moon, a black eclipsed sun as a halo behind her head with a thin ring of white fire, silver-grey skin, closed serene eyes, a gown of night sky and stars. Head and shoulders, facing the viewer, dramatic rim lighting, dark starry background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/prophet.webp`

> Painterly dark fantasy video game boss portrait, square: the Thunder Prophet, a gaunt wild-eyed preacher of a haunted desert frontier, wide-brimmed hat and long tattered duster coat, a bone necklace, lightning crawling over his raised hand and in his white eyes, dust storm behind him. Head and shoulders, facing the viewer, dramatic rim lighting, dark stormy desert background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/headmistress.webp`

> Painterly dark fantasy video game boss portrait, square: the Headmistress of an arcane academy, an elderly archmage woman with silver hair pinned up, half-moon spectacles, a high-collared midnight-blue robe embroidered with constellations, utterly calm expression, spell books floating behind her with faint runic light. Head and shoulders, facing the viewer, dramatic rim lighting, dark library background, highly detailed concept art. No text, no logo, no frame.

### `app/art/foes/deepking.webp`

> Painterly dark fantasy video game boss portrait, square: the Deep King, a colossal sea kaiju rising from a black ocean, a craggy armoured head the size of a mountain, barnacles and old shipwrecks clinging to it, bioluminescent teal eyes, seawater pouring off its jaws, a stormy night sky. Head and shoulders, facing the viewer, dramatic rim lighting, dark ocean background, highly detailed concept art. No text, no logo, no frame.

## Ending illustrations and default hero portraits (2026-11-14)

Made by hand on grok.com (Grok Imagine, Quality 2.0), one picked per prompt and saved through Grok's "Copy image".
Endings are 1280x720 WebP in `app/art/endings/` (one per ending: dead, retired, ascended, lost, martyr, sealed,
damned, fulfilled, undying, legend). Portraits are 640x960 WebP in `app/art/portraits/`, shown on the cards of heroes
of that race who have no picture of their own (`FW.PORTRAITS` in `app/data/arena.js`). Created with Grok.
Originals are in the local `art-source/grok-2026-11-14b/` folder.

Ending prompts all start "Painterly dark fantasy video game ending illustration, wide 16:9:" and end "cinematic
lighting, highly detailed concept art. No text, no logo." The scenes: a fallen warrior's grave on a hill at a red
dusk (dead); a lakeside cottage at sunset with a sword and shield over the door (retired); a radiant figure rising in
a pillar of light (ascended); a ship sailing through a rift at the edge of the world (lost); a hero's funeral pyre on
a bridge, a city holding lanterns (martyr); a rune-sealed vault with a figure frozen in crystal (sealed); a burning
contract falling into hellfire, demonic hands below (damned); an oracle's tablet lighting up under a comet
(fulfilled); a hand bursting from a moonlit grave (undying); a colossal hero statue over a city square (legend).

Portrait prompts all start "Painterly dark fantasy video game character portrait, tall 2:3:" and end "Head and
shoulders, facing the viewer, centred in the upper half, plain dark smoky background, dramatic rim lighting, highly
detailed concept art. No text, no logo, no frame." The subjects: a young human woman and man adventurer in leather and
a travelling cloak; a dwarf with braided red hair, an iron circlet and fur-trimmed armour; an orc warrior with a
topknot and tusks, and an orc woman with beaded braids and war paint; a goblin tinkerer with goggles; an elf woman
with a silver circlet and an elf man in a green hood; a dark elf woman in spider-silk armour; a wolf-like beastkin
hunter; a halfling woman in a green hooded cloak; a skeleton warrior with glowing blue eyes; a lizardfolk warrior; an
old gnome inventor.

## Chapter illustrations, wheel rims and hubs, and the Verdant Wild theme (2026-11-16)

Generated 2026-11-16 on the developer's SuperGrok account at grok.com (Grok Imagine, Quality 2.0, four images per
prompt). **How they were made:** at the developer's request, Claude (Anthropic's AI assistant) typed these prompts
into grok.com in the developer's own signed-in browser and saved the results; the developer accepted the account
risk this carries under xAI's Acceptable Use Policy (see "Automation" above). Claude then picked one image per
prompt, cut out and resized the game copies with `scripts/make-wheel-skins.py`, `scripts/make-chapter-art.js` and
`scripts/make-menu-css.js`. The untouched originals and the list of picks are in `art-source/grok-2026-11-16/`.

### Verdant Wild title screen: `app/art/wild-bg.webp`, `wild-wheel.webp`, `wild-logo.webp`

Background (16:9, variant 4):

> Wide 16:9 dark fantasy video game title screen background. An ancient enchanted fae forest at dusk: colossal twisted trees with living roots, moss-covered standing stones carved with glowing runes, drifting golden-green fireflies and pollen motes, shafts of gold-green light through a misty canopy, a hidden overgrown ruin deep in the distance. The left third of the image is darker and empty so a menu can sit there. Cinematic painterly concept art, highly detailed, dramatic lighting, rich emerald, moss and old-gold palette. No text, no logo, no characters.

Logo (16:9, variant 1):

> Generate an image: a dark fantasy video game title logo that reads exactly "DESTINY UNBOUND" (two words, spelled D-E-S-T-I-N-Y  U-N-B-O-U-N-D), large ornate letters carved from living wood and inlaid with old gold, thin vines and small leaves curling around the letters, glowing golden-green fireflies drifting around, a small rune wheel of woven branches behind the text, centered, wide horizontal composition, on a pure solid black background, no other text.

Wheel painting (1:1, variant 1):

> Square 1:1: an ornate ancient Wheel of Fate emblem seen straight from the front, centered. Carved from living dark wood and twisted vines with old gold inlay, small leaves and runes carved around the outer ring, twelve segments with small leaf, acorn and moon sigils, a glowing emerald-gold seed at the core, a long thorned golden pointer at the top. Isolated on a plain pure black background. Dark fantasy painterly style, highly detailed. No text.

### Chapter illustrations: `app/art/chapters/<chapter>.webp`

All 16:9. Every prompt begins "Wide 16:9 dark fantasy chapter illustration, the main subject centered in a wide
horizontal band:" and ends "Cinematic painterly concept art, highly detailed, … No text, no logo." The middle part:

- `train` (variant 4): a lone warrior training at dawn in a ruined mountain courtyard, striking a battered wooden practice dummy, a weapon rack of swords and spears, mist and falling autumn leaves, distant peaks. (dramatic warm rim light)
- `study` (variant 4): a candle-lit arcane library in a tall stone tower, towering bookshelves and ladders, an open grimoire glowing with golden runes on a cluttered desk, star charts, an astrolabe, floating dust in shafts of moonlight. (dramatic lighting)
- `nemesis` (variant 2): a hooded rival in a dark cloak standing on a crag above a burning village at night, cloak whipping in the wind, a drawn blade at their side, face hidden in shadow, watching and waiting. (ominous red and ember light)
- `dungeon` (variant 4): a torch-lit stone dungeon corridor descending into darkness, rusted iron gates, chains on the walls, scattered old bones, a flickering torch, faint glowing eyes deep in the dark. (dramatic torchlight)
- `quest` (variant 2): a lone cloaked traveler with a staff on a winding road toward distant snowy mountains at sunrise, a weathered signpost, a ruined watchtower, vast sweeping valley landscape. (golden morning light)
- `treasure` (variant 1): a hidden cave treasure hoard, heaps of gold coins, a jeweled chalice, a crown and gemstones spilling from an open iron-bound chest that glows from within, a shaft of light falling through a crack in the cave ceiling. (warm gold light in deep shadow)
- `timeSkip` (variant 2): the passing of years, one ancient lone oak tree on a hill shown changing from spring blossom on the left through summer and autumn to winter snow on the right, the seasons blending seamlessly across the image, a faint giant hourglass shape in the clouds above. (soft dreamlike light)
- `kingdom` (variant 1): a grand royal throne hall, an empty stone throne lit by a beam of sunlight, tall hanging banners, stained glass windows, kneeling courtier silhouettes, a castle city visible through great arches behind. (majestic golden light)
- `duel` (variant 2): two sword fighters circling each other inside a ring of burning torches on a rain-soaked stone plaza at night, one in dark plate armor and one in a long coat, blades raised, sparks and rain, onlookers in shadow. (dramatic firelight)
- `artifact` (variant 4): an ancient relic vault sealed for centuries, a glowing amulet floating above a carved stone altar, rings of runes lighting up on the floor and walls, dust and cobwebs, the heavy vault door half open. (mystical blue-gold glow)
- `boss` (variant 2): a colossal horned dark lord in jagged black armor rising from a broken throne in a ruined cathedral, glowing eyes, a huge cleaver, smoke and embers, a tiny lone hero silhouette standing before him for scale. (ominous red light)
- `siege` (variant 1): a stone castle under siege at dusk, trebuchets hurling fire, volleys of burning arrows arcing over the walls, a dark army with banners and siege ladders in the foreground, smoke rising into a red sky. (epic scale)

### Wheel rims and hubs: `app/art/skins/<theme>-rim.webp` and `<theme>-hub.webp`

All 1:1, cut out of their black backgrounds by `scripts/make-wheel-skins.py`. Rim prompts begin "Square 1:1 game
asset: a single perfectly circular ornate ring frame seen straight from the front, filling the image edge to edge.
The ring band is thin, about one tenth of the image width, and the whole inside of the ring is completely empty plain
pure black." Hub prompts begin "Square 1:1 game asset: a single round ornate hub medallion for the center of a wheel,
seen straight from the front, perfectly circular, filling about 80 percent of the image, centered." Both end
"Isolated on a plain pure black background. … No text." The materials:

- Ashen Crown (rim 3, hub 2): forged dark iron with engraved gold filigree, rivets and small runes, thin ember-orange glowing cracks / a glowing molten ember-orange core. Dark fantasy painterly style.
- Astral Oracle (rim 4, hub 1): polished silver and deep sapphire star-metal, tiny engraved constellations and moon phases, small star gems, a faint cool blue glow / a glowing pale blue star crystal at the core. Mystical painterly style.
- Iron Litany (rim 3, hub 3): gothic blackened iron and worn brass, gear teeth around the outer edge, heavy rivets, oxblood red enamel panels / shaped like a great cog, a glowing red core. Grimdark painterly style, no skulls.
- Blood Moon (rim 3, hub 1): blackened silver with thorned gothic filigree, small crimson garnets / a large glowing crimson blood-moon garnet at the core. Gothic painterly style, eerie and elegant.
- Verdant Wild (rim 3, hub 1): woven from living dark wood and twisted vines with old gold leaf inlay, small carved leaves and runes, tiny golden-green glowing fireflies / a glowing emerald-gold seed at the core. Dark fantasy painterly style.

## Portraits for every other race (2026-11-23)

Generated 2026-11-23 on the developer's SuperGrok account at grok.com (Grok Imagine, image mode, Quality 2.0, 2:3,
four images per prompt). **How they were made:** at the developer's request, Claude (Anthropic's AI assistant) typed
these prompts into grok.com in the developer's own signed-in Chrome and saved the results; the developer accepted the
account risk this carries under xAI's Acceptable Use Policy (see "Automation" above). Claude picked one image per
prompt from contact sheets and `art-source/race-portraits/make-webp.js` made the 640x960 WebP game copies in
`app/art/portraits/`. The four originals per race, the prompts (`prompts.json`) and the picks (`picks.json`) are
in the local `art-source/race-portraits/` folder. Created with Grok.

Every prompt has the same frame as the first portraits: "Painterly dark fantasy video game character portrait, tall
2:3:" + the subject + ". Head and shoulders, facing the viewer, centred in the upper half, plain dark smoky
background, dramatic rim lighting, highly detailed concept art. No text, no logo, no frame." The subjects
(file, variant picked):

- **Fairy** (`fairy-f1`, 2): a fairy woman with iridescent dragonfly wings, pointed ears and a crown of thorny wildflowers, glowing pollen in the air.
- **Mermaid** (`mermaid-f1`, 2): a mermaid with sea-green scales on her shoulders and cheekbones, long wet dark hair woven with pearls and kelp, gill slits on her neck.
- **Slime** (`slime-1`, 2): a humanoid made of translucent glowing green slime, bubbles and a swallowed dagger floating inside its body, a vaguely face-like shape.
- **Golem** (`golem-1`, 1): a stone golem with a carved granite face, glowing blue runes cut into its chest and brow, moss in the cracks.
- **Half-Giant** (`halfgiant-m1`, 2): a towering half-giant man with a broad scarred face, a shaved head and a fur mantle, a huge iron torc around his neck.
- **Vampire** (`vampire-1`, 3): an elegant pale vampire noble with red eyes, sharp fangs and a high-collared black and crimson coat, candlelight behind.
- **Werewolf** (`werewolf-1`, 3): a snarling werewolf with grey fur, yellow eyes and torn leather armour, a full moon glow behind its head.
- **Kitsune** (`kitsune-f1`, 3): a kitsune woman with fox ears, several fluffy white-tipped tails curling behind her, a red and white robe and blue foxfire flames.
- **Oni** (`oni-m1`, 3): a red-skinned oni with two curved horns, wild black hair, tusks and a spiked iron club over his shoulder.
- **Banshee** (`banshee-f1`, 2): a ghostly banshee woman with long white hair streaming upward, hollow glowing eyes and a mouth open in a silent wail, translucent.
- **Chimera** (`chimera-1`, 3): a chimera with a lion's head and mane, a goat's horns rising beside it and a serpent coiled over its shoulder, fierce eyes.
- **Succubus** (`succubus-f1`, 2): a succubus with curling black horns, bat wings folded behind her, violet skin and a sly smile, dark jewellery.
- **Shadowborn** (`shadowborn-1`, 1): a shadowborn figure made of living shadow, wisps of darkness pouring off a hooded silhouette, two pale glowing eyes.
- **Phoenixkin** (`phoenixkin-1`, 3): a phoenixkin with feathered hair of living flame in red and gold, ember-bright eyes and fiery plumage on the shoulders.
- **Demon** (`demon-1`, 3): a hulking demon with charred red skin, massive ram horns, glowing cracks of lava in its hide and burning eyes.
- **Dragonborn** (`dragonborn-1`, 1): a dragonborn warrior with bronze scales, a draconic snout, horns sweeping back and ornate plate armour, smoke curling from its nostrils.
- **Celestial** (`celestial-1`, 3): a celestial being with skin like the night sky full of stars, a halo of constellations and calm silver eyes.
- **Angel** (`angel-f1`, 3): an angel woman with great white feathered wings, golden armour, a radiant halo and a stern gaze.
- **Spirit** (`spirit-1`, 1): a translucent blue spirit of a long-dead traveller, softly glowing, wisps of mist trailing from its outline.
- **Leviathan** (`leviathan-1`, 3): a leviathan-blooded sea titan with dark blue scales, a crest of fins, deep-sea bioluminescent markings and water streaming off it.
- **Reaper** (`reaper-1`, 3): a reaper in a tattered black hooded robe, a bone-white skull face in the shadows of the hood and a great scythe over its shoulder.
- **Ghoul** (`ghoul-1`, 2): a gaunt grey-skinned ghoul with sunken eyes, long sharp teeth and ragged grave clothes.
- **Cyborg** (`cyborg-1`, 4): a cyborg warrior, half of the face replaced by brass and steel plates, a glowing red mechanical eye, cables at the neck.
- **Mutant** (`mutant-1`, 3): a mutant with mottled skin, one oversized arm, glowing green veins and a third eye on the forehead, scavenged armour.
- **Frost Giant** (`frostgiant-m1`, 2): a frost giant with pale blue skin, a beard of icicles, a horned iron helm and frost on his fur cloak.
- **Titan** (`titan-1`, 2): a colossal titan of bronze-coloured skin, eyes like molten gold, ancient carved armour and clouds drifting at its shoulders.
- **Eldritch Horror** (`eldritch-1`, 2): an eldritch horror, a shape of writhing tentacles and too many eyes around a dark gaping maw, impossible geometry.
- **Cosmic Entity** (`cosmic-1`, 2): a cosmic entity, a humanoid shape made of nebulae and swirling galaxies, a single bright star where its heart would be.
- **Eternal** (`eternal-1`, 2): an eternal being with ageless grey eyes, robes embroidered with hourglasses and sand slowly drifting upward around them.
- **God** (`god-1`, 3): a god in radiant golden armour with a crown of light, eyes blazing white, an aura of divine fire.
- **Kobold** (`kobold-1`, 2): a small kobold with reddish-brown scales, a lizard snout, a miner's candle helmet and a crude spear.
- **Ogre** (`ogre-m1`, 3): a huge ogre with a heavy brow, a lumpy bald head, tusks, crude hide armour and a stupid grin.
- **Troll** (`troll-1`, 4): a green-skinned troll with a long hooked nose, mossy hair, tusks and long arms, regenerating scars across its face.
- **Centaur** (`centaur-1`, 3): a centaur archer, a human torso on a chestnut horse body, braided hair, a longbow and a quiver of feathered arrows.
- **Minotaur** (`minotaur-1`, 2): a minotaur with a bull's head, huge curved horns, a brass nose ring and a double-headed axe.
- **Harpy** (`harpy-f1`, 3): a harpy with storm-grey feathered wings for arms, talon hands, wild windswept hair and fierce golden eyes.
- **Satyr** (`satyr-1`, 1): a grinning satyr with small goat horns, curly hair, a wreath of grapevines and a set of pan pipes.
- **Naga** (`naga-1`, 3): a naga with the upper body of a person and a long emerald serpent tail, a cobra hood behind the head and glowing venom-green magic.
- **Dryad** (`dryad-f1`, 2): a dryad with bark-textured skin, leaves and blossoms growing in her hair, amber eyes and vines curling around her arms.
- **Hellblood** (`hellblood-1`, 4): a hellblood with small curved horns, red-tinted skin, a pointed tail over the shoulder and a charming smirk, a rogue's coat.
- **Gargoyle** (`gargoyle-1`, 2): a gargoyle with grey stone skin, folded stone wings, a snarling face and cracked horns, perched on a cathedral ledge.
- **Tengu** (`tengu-1`, 1): a tengu with a crow's head and black feathers, crow wings, a samurai's lacquered armour and a katana.
- **Arachne** (`arachne-f1`, 2): an arachne with the upper body of a woman and spider legs rising behind her, several small glowing eyes, silk threads.
- **Yeti** (`yeti-1`, 4): a yeti with thick white fur, a dark blue face, frost in its fur and big blunt teeth, snow falling.
- **Automaton** (`automaton-1`, 2): a clockwork automaton with a polished brass mask face, glowing amber eye lenses and visible gears turning in its chest.
- **Mothfolk** (`mothfolk-1`, 2): a mothfolk with soft grey-white fur, feathery antennae, huge dark compound eyes and dusty patterned wings, drawn to a lantern.
- **Mycelid** (`mycelid-1`, 4): a mycelid, a humanoid made of fungus with a broad mushroom cap for a head, glowing spores drifting around it.
- **Changeling** (`changeling-1`, 1): a changeling, its pale face half-shifted between two different people, blank grey eyes and a hooded cloak.
- **Revenant** (`revenant-1`, 3): a revenant, a corpse-pale warrior with burning blue eyes, rusted armour and a noose scar, come back for revenge.
- **Elemental** (`elemental-1`, 3): an elemental made of swirling fire, water, stone and wind meeting in one humanoid shape.
- **Djinn** (`djinn-1`, 1): a djinn of smokeless blue fire, gold bracelets and earrings, a curling smoke tail instead of legs and glowing eyes.
- **Valkyrie** (`valkyrie-f1`, 2): a valkyrie with a winged silver helm, braided blonde hair, a spear and feathered wings, chooser of the slain.
- **Lich** (`lich-1`, 3): a lich, a skeletal archmage with a jewelled crown, rotting purple robes and green soul-fire burning in its eye sockets.
- **Nephilim** (`nephilim-1`, 4): a nephilim, a tall half-divine warrior with one feathered wing and a faint halo, mortal scars on the face.
- **Sphinx** (`sphinx-1`, 2): a sphinx with a human face, a lion's mane and golden headdress, wise ancient eyes, desert sand behind.
- **Starchild** (`starchild-1`, 4): a starchild with pale silver skin that glows softly, hair like a stream of stars and wide curious eyes.
- **Voidling** (`voidling-1`, 4): a voidling, a flickering silhouette of pure black emptiness with violet edges, a cold glint where eyes should be.
- **Primordial** (`primordial-1`, 3): a primordial being of ancient rock and magma, a face like a cliff, eyes older than the world.
- **Ratfolk** (`ratfolk-1`, 2): a ratfolk with brown fur, long whiskers, a patched hooded cloak, clever beady eyes and a dagger.
- **Hobgoblin** (`hobgoblin-1`, 4): a disciplined hobgoblin legionary with orange skin, a crested iron helm, a red military cloak and a stern face.
- **Gnoll** (`gnoll-1`, 2): a gnoll with a spotted hyena head, a manic grin full of teeth, bone trophies and a crude bone-handled axe.
- **Frogfolk** (`frogfolk-1`, 3): a frogfolk warrior with green and yellow spotted skin, big golden eyes, a reed helmet and a bone spear.
- **Bearfolk** (`bearfolk-1`, 1): a bearfolk bruiser with thick brown fur, a bear's head, small bright eyes and leather straps across the chest.
- **Owlfolk** (`owlfolk-1`, 3): an owlfolk with brown and white feathers, a round owl face with huge amber eyes and a scholar's robe.
- **Sharkfolk** (`sharkfolk-1`, 4): a sharkfolk with grey skin, a shark's head full of teeth, gill slits and a harpoon, sea water dripping.
- **Zombie** (`zombie-1`, 4): a zombie with greenish decaying skin, a vacant stare, torn burial clothes and an exposed cheekbone.
- **Homunculus** (`homunculus-1`, 1): a small homunculus with smooth grey-pink skin, large dark eyes, alchemical symbols painted on its head and a glass flask.
- **Lightborn** (`lightborn-1`, 2): a lightborn with faintly glowing golden skin, white-gold hair and a soft radiance around them, wearing white robes.
- **Salamanderkin** (`salamanderkin-1`, 2): a salamanderkin with orange and black spotted scales, a long lizard face and flames flickering along its back.
- **Undine** (`undine-f1`, 4): an undine, a water nymph whose hair and body flow like moving water, droplets floating around her.
- **Sylph** (`sylph-1`, 2): a sylph, a slender airy being with pale hair blown upward by wind, translucent wing-like veils and grey-blue eyes.
- **Forest Giant** (`forestgiant-1`, 1): a gentle forest giant with bark-like skin, a beard of moss and leaves, birds nesting on the shoulder.
- **Cyclops** (`cyclops-m1`, 3): a cyclops forge giant with one large eye, a leather apron, a smith's hammer and soot-covered skin.
- **Mummy** (`mummy-1`, 3): a mummy king wrapped in ancient bandages, a golden pharaoh's headdress and glowing blue eyes.
- **Shade** (`shade-1`, 1): a shade, a walking human-shaped shadow with a faint outline and grim white eyes, a long coat of darkness.
- **Crystalborn** (`crystalborn-1`, 4): a crystalborn whose body is living faceted amethyst crystal, light refracting through the face.
- **Android** (`android-1`, 2): an android with a flawless porcelain-white synthetic face, thin seams along the jaw and softly glowing blue eyes.
- **Gorgon** (`gorgon-f1`, 3): a gorgon with a crown of living green snakes for hair, reptilian golden eyes and scaled skin at the neck.
- **Dullahan** (`dullahan-1`, 4): a headless dullahan knight in black armour holding its own glowing-eyed head under one arm, a green ghostly flame at the neck.
- **Wendigo** (`wendigo-1`, 3): a wendigo, a gaunt antlered creature with a deer skull face, frost-bitten grey skin and hollow glowing eyes, snowstorm.
- **Treant** (`treant-1`, 2): a treant, an ancient walking tree with a face in the bark, branches for hair and glowing green eyes.
- **Dreamborn** (`dreamborn-1`, 2): a dreamborn with a soft hazy outline, pastel nebula colours, floating fragments of a dream around the head and sleepy eyes.
- **Thunderbird** (`thunderbird-1`, 3): a thunderbird-blooded warrior with a great eagle's head, dark storm-blue feathers crackling with lightning.
- **Demigod** (`demigod-1`, 3): a demigod hero with a golden laurel, a muscular build, divine light in the eyes and a bronze breastplate.
- **Behemoth** (`behemoth-1`, 3): a behemoth, a massive horned beast-titan with thick armoured hide, small fierce eyes and steam from its nostrils.
- **Archfey** (`archfey-f1`, 2): an archfey queen with antlers wreathed in flowers, glittering eyes, gossamer wings and a regal cold smile.
- **Chronoborn** (`chronoborn-1`, 4): a chronoborn whose silhouette shows several overlapping afterimages, clock gears and sand swirling around them.

## Companions, nemeses and the map of the saga (2026-11-23)

Generated 2026-11-23 the same way as the race portraits above (the developer's SuperGrok account at grok.com, typed in
by Claude at the developer's request, one of four picked per prompt). Companion and nemesis portraits are 1:1 and the
game copies are 512x512 WebP in `app/art/allies/` and `app/art/nemesis/`; the map is 16:9, 1600x900 in
`app/art/saga-map.webp`. Originals and picks are in the local `art-source/allies-nemesis/` folder. Created with Grok.

Companion prompts: "Painterly dark fantasy video game companion portrait, square:" + the subject + ". Head and
shoulders, facing the viewer, plain dark smoky background, warm rim lighting, highly detailed concept art. No text,
no logo, no frame."

- `mentor` (4): an old grey-bearded mentor in a travel-worn robe with a gnarled staff, kind tired eyes, a lantern at his side.
- `beloved` (2): a beloved companion with a soft smile, windswept dark hair and a simple silver pendant, warm candlelight on the face.
- `ghost` (2): a restless ghost, a translucent pale figure in old-fashioned clothes with a sad gentle face, a faint blue glow and drifting mist.
- `army` (2): a ragged army standard-bearer holding a tattered banner, rows of soldiers with spears behind in the smoke.
- `townsfolk` (1): a hopeful townswoman holding up a lantern, a crowd of townsfolk with torches behind her.
- `royal` (3): a regal noble in a jewelled circlet and a fur-trimmed velvet robe, a proud but warm expression.
- `traveller` (3): a mysterious traveller from another world in strange ornate armour, eyes reflecting alien stars, a cloak of unfamiliar fabric.
- `prisoner` (2): a freed prisoner with broken shackles on the wrists, gaunt and unshaven, grateful determined eyes.
- `apprentice` (3): a young apprentice with an eager freckled face, a satchel of books and a wooden practice sword.
- `dragon` (2): a young dragon companion with gleaming bronze scales, curious golden eyes and a wisp of smoke from its nostrils.
- `warrior` (1): a battle-hardened sellsword with a scarred face, a notched sword over the shoulder and loyal steady eyes.

Nemesis prompts: "Painterly dark fantasy video game villain portrait, square:" + the subject + ". Head and shoulders,
facing the viewer, menacing, plain dark smoky background, cold rim lighting, highly detailed concept art. No text, no
logo, no frame."

- `warlord` (2): a brutal warlord in spiked black armour with a scarred face and a cruel grin.
- `sorceress` (2): a cold sorceress with violet eyes, dark lace and a high collar, shadow magic curling from her fingers.
- `assassin` (3): a masked assassin in dark leathers and a deep hood, only narrowed eyes showing, a curved dagger raised.
- `fallen` (2): a fallen knight in tarnished once-holy armour, hollow bitter eyes and a broken sun sigil on the breastplate.
- `necromancer` (4): a gaunt necromancer with a skull-topped staff, sunken cheeks and green deathlight glowing in the eyes.
- `beastlord` (3): a savage beast-lord wearing a wolf pelt over the shoulders, red war paint and feral yellow eyes.
- `schemer` (2): a smiling noble schemer in rich dark velvet and rings, raising a goblet of poisoned wine.
- `prophet` (3): a cult prophet with a burning sigil branded on the forehead, fanatical eyes and ragged ceremonial robes.

Map (second prompt, variant 2):

> Painterly dark fantasy overworld map, wide 16:9, top-down view of a single wild continent: jagged snowy peaks in the north, dense dark woods in the west, a lone castle city with tall towers at the heart, a glowing volcano in the east, golden dunes in the south-east, swamp and bog in the south-west, a vast sea with islands to the south, ancient ruins scattered between. Hand-painted, warm aged-parchment tones, soft vignette. Absolutely no text, no labels, no symbols, no compass, no border.

## World bosses

### `app/art/bosses/` (`hunger`, `colossus`, `storms`, `court`)

Made with Grok Imagine on 2026-11-17. Each boss first got a 6-second video (video mode, 1:1, 480p, the prompts
below); a frame of it then went into Grok Imagine's **Loop** mode (10 seconds, the video starts and ends on that
picture) with the same motion described, so the animation loops. `scripts/make-boss-art.js` cuts each loop into a
320×320 animated WebP (the last 0.3 s fades into the first to hide the seam) and a still frame for reduced motion.
The videos and loop pictures are kept in `art-source/grok-bosses/`. Created with Grok.

- **Vaelthrax, the Hunger Below** (`hunger`):

  > A colossal ancient wyrm coiled in a burning cavern deep under a mountain, cracked obsidian scales glowing with molten veins, void-black smoke pouring from its jaws, eyes like dying suns, rivers of lava below. Dark fantasy boss portrait, cinematic painterly concept art, dramatic lighting, highly detailed. The wyrm slowly breathes, smoke and embers rise, lava glows and flickers, its eyes pulse. Camera stays still. Seamless loop. No text, no logo.

- **The Clockwork Colossus** (`colossus`):

  > A gigantic walking war machine the size of a city, brass and iron plates, towers and chimneys on its back, crackling lightning between its gears, striding across a stormy brass wasteland. Dark fantasy steampunk boss portrait, cinematic painterly concept art, dramatic lighting, highly detailed. Gears turn, steam vents from the chimneys, lightning arcs across its armour, storm clouds move. Camera stays still. Seamless loop. No text, no logo.

- **The Mother of Storms** (`storms`):

  > A towering woman made of storm and sea, hair of whirling clouds, a body of rising ocean waves, lightning in her eyes, standing in the eye of a hurricane over a black sea. Dark fantasy boss portrait, cinematic painterly concept art, dramatic lighting, highly detailed. Her hair swirls like clouds, waves rise and crash, lightning flickers. Camera stays still. Seamless loop. No text, no logo.

- **The Pale Court** (`court`):

  > An undead lich-queen on a bone throne in a vast cold hall, crowned in pale silver, ghostly nobles standing in the shadows behind her, violet soul-fire in her eyes, candles burning with cold blue flame. Gothic dark fantasy boss portrait, cinematic painterly concept art, dramatic lighting, highly detailed. Blue candle flames flicker, the ghostly nobles slowly shift, soul-fire pulses in her eyes, mist drifts. Camera stays still. Seamless loop. No text, no logo.
