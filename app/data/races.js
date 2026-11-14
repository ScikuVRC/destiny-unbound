/* Destiny Unbound content: Races, their sub-wheels, and how each race looks in a portrait.
   Pure data: no game logic lives here. Rows in FW.table(`...`) read Name|weight|effects|perk|flaw;
   see app/data/README.md for the effect codes. Order matters: Legend Codes and seeds refer to it. */
(function (g) {
  const FW = g.FW;

  FW.RACES = FW.table(`
Human|22|fate+1 life=s|Adaptable - gain +1 Fate Token|
Dwarf|8|str+1 dur+1 spd-1 r=fire hs=0.78 life=m|Stonekin - tunnel-born endurance|Short legs, slow on open ground
Orc|8|str+2 int-1 wild:str+1 life=s|Warborn - raw strength, stronger in the wilds|Brutish instincts
Goblin|7|spd+1 int+1 str-1 dur-1 hs=0.7 life=s|Scrappy tinkerers|Frail frame
Skeleton|6|dur+1 r=poison,mind w=holy dark:dur+1 life=l|Undying bones - immune to poison and fatigue|Brittle against holy power
Beastkin|7|spd+1 str+1 int-1 life=s|Primal senses|Instinct over reason
Lizardfolk|6|dur+1 str+1 w=ice ice:spd-2 life=m|Scaled hide, strong in warm lands|Cold-blooded: sluggish in the cold
Elf|7|spd+1 int+1 str-1 wild:fgt+1 life=l|Graceful and long-lived, deadly in forests|Slender frame
Dark Elf|5|spd+1 fgt+1 dark:fgt+1 sun:all-1 life=l|Night-hunters - sharper in the dark|Dazzled by bright daylight
Fairy|4|spd+2 int+1 pwr+2 str-2 w=metal hs=0.2 life=l|Flight and glamour|Cold iron burns
Mermaid|4|spd+1 int+1 water:all+2 urban:all-1 life=l|Sea-song - dominant in water|Out of her element in cities
Slime|4|dur+2 str-1 r=poison,metal w=fire hs=0.8 life=l|Amorphous body - shrugs off blows|Fire dries it out
Golem|4|str+2 dur+2 spd-2 int-1 w=lightning hs=1.5 life=l|Living stone|Lightning shatters the runes
Half-Giant|4|str+2 dur+1 spd-1 hs=1.6 life=m|Towering frame|Hard to hide, slow to turn
Vampire|3.5|spd+1 str+1 fgt+1 dark:all+1 sun:all-2 w=holy,fire life=a|Bloodline predator - regenerates by feeding|Burns in sunlight
Werewolf|3.5|str+2 spd+1 dark:str+1 w=metal life=m|Moonlit fury|Silver and cold iron wound it deeply
Kitsune|3|int+1 pwr+1 spd+1 str-1 life=a|Many-tailed trickster|Light frame
Oni|3|str+2 dur+1 int-1 w=holy hs=1.4 life=l|Horned brute|Cursed by holy rites
Banshee|2.5|int+1 pwr+1 dur-2 r=shadow,mind a=mind life=a|Wail that rattles minds|Fragile spirit-body
Chimera|2.5|str+1 dur+1 spd+1 int-2 life=m|Three beasts in one|Unstable mind
Succubus|2.5|int+2 pwr+1 str-1 dur-1 a=mind w=holy life=a|Charm and influence|Holy ground rejects her
Shadowborn|2.2|spd+2 int+1 fgt+1 dark:all+2 sun:all-1 a=shadow life=l|Bonuses: +2 Speed, +1 IQ, +1 Fighting. Much stronger when fighting in darkness and shadows|Dimmed in bright light
Phoenixkin|2|spd+1 pwr+1 fate+1 r=fire w=ice a=fire life=a|Rebirth - +1 Fate Token, fire-immune|Ice snuffs the flame
Demon|2|str+1 pwr+1 fire:all+1 w=holy life=a|Infernal might|Holy ground burns
Dragonborn|2|str+1 dur+2 pwr+1 r=fire a=fire hs=1.2 life=l|Scaled and fire-breathing|Proud and slow to dodge
Celestial|1.5|all+1 w=void a=holy life=a|Star-touched|The void unmakes celestials
Angel|1.5|int+1 pwr+1 holy:all+1 w=shadow,void a=holy life=a|Winged servant of the light|Shadow corrupts
Spirit|2|spd+1 int+1 pwr+1 dur-1 r=poison,metal w=holy life=a|Intangible drifter|Easy to disrupt
Leviathan|1.2|str+3 dur+3 int-1 hs=30 water:all+2 urban:spd-2 life=a|Sea-titan|Beached and clumsy in cities
Reaper|1.2|spd+1 fgt+2 pwr+2 dark:all+1 w=holy a=shadow life=a|Harvester of souls|Holy light burns
Ghoul|3|str+1 dur+1 r=poison w=holy,fire life=m|Carrion-fed hardiness|Ravenous hunger
Cyborg|3|str+1 dur+1 int+1 r=poison w=lightning life=m|Machine-grafted body|Shorts out in storms
Mutant|3|spd+1 str+1 pwr+1 dur-1 life=s|Unstable gene-gifts|Body is failing
Frost Giant|1.8|str+2 dur+2 spd-1 r=ice w=fire hs=3 life=l|Glacier-born titan|Fire melts him
Titan|1|str+2 dur+2 int-1 spd-1 hs=8 life=a|Colossal ancient|Easy target
Eldritch Horror|0.8|int+2 pwr+2 dur+1 dark:pwr+2 sun:all-1 w=mind a=mind,void hs=3 life=a|Thing from beyond|Mind-shattering madness
Cosmic Entity|0.5|all+2 pwr+2 w=void life=a|Star-born being|Hunted by the void
Eternal|0.3|all+2 fate+1 life=a|Time cannot touch you|Lonely forever
God|0.25|all+3 pwr+3 fate+1 life=a|A divine being|Hunted by rival pantheons
Halfling|7|spd+1 fate+1 str-1 hs=0.6 life=s|Lucky and light-footed - +1 Fate Token|Small frame
Gnome|5|int+2 str-1 hs=0.55 life=m|Tinker-genius|Tiny and easy to shove aside
Kobold|5|spd+1 int+1 str-1 dark:all+1 hs=0.6 life=s|Tunnel trapper, bolder in the dark|Scrawny
Ogre|5|str+2 dur+1 int-2 hs=1.5 life=s|Mountain of muscle|Slow-witted
Troll|4|str+1 dur+2 int-1 w=fire hs=1.4 life=m|Regenerating hide|Fire stops the healing
Centaur|4|spd+2 str+1 urban:spd-1 hs=1.3 life=m|Four-legged charge|Clumsy in tight streets
Minotaur|4|str+2 dur+1 int-1 hs=1.35 life=m|Horned charger|Sees red
Harpy|4|spd+2 dur-1 storm:spd+1 life=s|Sky raider, rides the storm|Hollow bones
Satyr|4|spd+1 fate+1 int-1 wild:fgt+1 life=m|Reveller with goat-legs and good luck|Easily distracted
Naga|3.5|spd+1 int+1 a=poison r=poison w=ice life=l|Serpent-bodied venom mage|Cold slows the coils
Dryad|3.5|int+1 pwr+1 wild:all+2 urban:all-1 w=fire a=nature life=l|Forest-bound spirit, mighty in the wilds|Withers among stone and smoke
Hellblood|3.5|int+1 pwr+1 r=fire w=holy life=m|Infernal ancestry - horns, tail and a silver tongue|Distrusted on sight
Gargoyle|3|dur+2 spd-1 dark:all+1 sun:spd-1 r=poison life=l|Living statue that wakes at night|Stiffens in daylight
Tengu|3|spd+1 fgt+1 wpn+1 storm:all+1 life=l|Crow-winged sword saint|Proud to a fault
Arachne|3|spd+1 fgt+1 dark:all+1 a=poison w=fire life=m|Eight-limbed ambusher|Webs burn fast
Yeti|3|str+2 dur+1 ice:all+1 r=ice w=fire hs=1.4 life=m|Snow-furred giant|Overheats quickly
Automaton|3|dur+2 int+1 spd-1 r=poison,mind w=lightning life=a|Clockwork body that never tires|Lightning scrambles the gears
Mothfolk|3|spd+1 int+1 dur-1 dark:all+1 w=fire life=s|Silent wings in the night|Drawn to the flame
Mycelid|3|dur+1 int+1 wild:all+1 r=poison a=poison w=fire life=l|Fungus-folk sharing one patient mind|Dry heat ruins the spores
Changeling|3|int+1 spd+1 fate+1 w=metal life=m|Wears any face - +1 Fate Token|Cold iron reveals the truth
Revenant|2.5|dur+2 fgt+1 behind:all+1 r=poison w=holy life=a|Came back for revenge, fights harder when losing|Holy rites can lay it to rest
Elemental|2|pwr+2 dur+1 life=a|A body of raw element|Bound to its opposite
Djinn|1.8|pwr+2 int+1 fate+1 a=fire,lightning w=metal life=a|Wish-granter of smokeless fire - +1 Fate Token|Can be bound in iron
Valkyrie|1.8|fgt+2 spd+1 holy:all+1 a=holy w=shadow life=a|Chooser of the slain|Shadow dims the wings
Lich|1.5|int+2 pwr+2 str-1 r=poison,mind w=holy a=shadow life=a|Undying archmage|Brittle body, hidden soul-jar
Nephilim|1.5|str+1 pwr+1 fgt+1 a=holy w=void hs=1.3 life=a|Half-mortal, half-divine|Belongs to neither world
Sphinx|1.2|int+3 str+1 a=mind hs=1.6 life=a|Riddle-keeper with a lion's body|Cannot refuse a riddle
Starchild|1|all+1 pwr+1 void:all+1 a=holy life=a|Fell from the night sky|Homesick for the stars
Voidling|0.8|spd+1 pwr+2 void:all+2 sun:all-1 a=void w=holy life=a|A shard of the empty dark|Light makes it flicker
Primordial|0.3|all+2 pwr+2 hs=6 life=a|Older than the gods|The young world barely holds you
Ratfolk|5|spd+1 int+1 str-1 urban:all+1 r=poison hs=0.7 life=s|Sewer-wise survivor, at home in any city|Small and distrusted
Hobgoblin|5|fgt+1 str+1 wpn+1 int-1 life=s|Disciplined goblin legionary|Rigid tactics
Gnoll|4|str+1 spd+1 fgt+1 int-2 wild:all+1 life=s|Hyena-headed raider|Cackles at the wrong moment
Frogfolk|4|spd+1 water:all+1 sun:dur-1 a=poison w=ice hs=0.8 life=s|Leaping swamp warrior with a toxic skin|Dries out in the sun
Bearfolk|4|str+2 dur+1 spd-1 hs=1.3 life=m|Bear-blooded bruiser|Sleeps half the winter
Owlfolk|3|int+2 dark:all+1 sun:spd-1 life=m|Silent, wise night hunter|Groggy by day
Sharkfolk|3|str+1 fgt+1 water:all+2 urban:all-1 life=m|Apex predator of the deep|Lost on dry land
Zombie|4|dur+2 str+1 int-2 spd-1 r=poison,mind w=fire,holy life=m|Feels no pain at all|Rotting and slow
Homunculus|3|int+2 str-1 dur-1 r=poison hs=0.5 life=s|Born in an alchemist's flask|A short-lived vessel
Lightborn|3|int+1 pwr+1 holy:all+1 w=shadow life=m|Descendant of angels, faintly glowing|Shadow dims the glow
Salamanderkin|3|str+1 dur+1 a=fire r=fire w=ice fire:all+1 life=m|Lives in the forge flames|Ice stops the heart
Undine|3|spd+1 int+1 water:all+2 w=lightning life=l|Water nymph who moves like a current|Lightning boils her
Sylph|3|spd+2 dur-1 storm:all+1 life=l|Born of the wind|Light as air, and as easy to scatter
Forest Giant|3|str+2 dur+1 wild:all+1 spd-1 hs=2.2 life=l|Gentle titan of the old woods|Slow to anger, slower to move
Cyclops|2.5|str+3 int-1 spd-1 hs=2.5 life=l|One-eyed forge giant|No depth perception
Mummy|2.5|dur+2 str+1 spd-1 r=poison w=fire life=a|Embalmed ancient king|Old wrappings catch fire
Shade|2.5|spd+1 dark:all+2 sun:all-2 r=poison a=shadow life=a|A walking shadow with a grudge|Noon nearly erases you
Crystalborn|2.5|dur+2 int+1 spd-1 r=fire w=sound life=a|A body of living crystal|Shattered by sound
Android|2.5|int+2 spd+1 r=poison,mind w=lightning life=a|Synthetic mind in a perfect body|An electric surge wipes the memory
Gorgon|1.5|int+1 pwr+2 a=poison,mind life=l|Serpent-haired, stone-gazing|Cannot look at her own reflection
Dullahan|1.5|fgt+2 dur+1 dark:all+1 w=holy a=shadow life=a|Headless rider of the night|Holy light breaks the curse
Wendigo|1.5|str+2 spd+1 ice:all+1 r=ice w=fire,holy hs=1.6 life=a|Hunger of the endless winter|Fire and faith drive it off
Treant|1.5|str+2 dur+3 spd-2 wild:all+1 w=fire hs=4 life=a|A walking ancient tree|Fire is death
Dreamborn|1.5|int+1 pwr+2 a=mind w=sound life=a|Escaped from someone else's dream|Loud noises might wake the dreamer
Thunderbird|1.2|spd+2 pwr+1 storm:all+2 a=lightning hs=1.8 life=a|Wings that make the storm|Sulks in still air
Demigod|0.8|all+1 pwr+1 fate+1 rt+1 life=l|Child of a god and a mortal|The divine parent's enemies are yours
Behemoth|0.8|str+3 dur+3 spd-2 hs=12 life=a|Land-titan of legend|Slow, enormous and always hungry
Archfey|0.6|int+2 pwr+2 fate+1 w=metal life=a|Ruler of a fairy court|Bound by every promise made
Chronoborn|0.6|spd+2 int+1 pwr+2 a=time life=a|Unstuck in time|Sometimes arrives before the fight starts
`);

  FW.SUBS = {
    Elf: {
      title: 'Which elven kin?',
      emoji: '🧝',
      rows: FW.table(`
Wood Elf|6|spd+1 wild:all+1|Forest-wise|
High Elf|4|int+1 pwr+1|Scholar-mage|
Sun Elf|3|fgt+1 sun:all+1 dark:all-1|Dawn-blessed|
Moon Elf|3|int+1 dark:all+1|Night-seer|
Sea Elf|2|water:all+1|Tide-kin|
Elder Elf|1|int+2 pwr+1 str-1|Ancient sage|Frail with age
Snow Elf|3|r=ice ice:all+1|Lives among glaciers|
Desert Elf|3|sun:all+1|Sand-cloaked nomad|
Blood Elf|2|pwr+1 str+1 w=holy|Magic-hungry exile|
Star Elf|1|pwr+1 void:all+1|Came down from the night sky|
`),
    },
    Vampire: {
      title: 'Which bloodline?',
      emoji: '🧛',
      rows: FW.table(`
Fledgling|14||Newly turned|
Thrall|12|dur-1 str-1|Bound servant|Weak blood
Night Hunter|10|spd+1|Stalker|
Blood Knight|8|fgt+1 str+1|Sworn blade|
Blood Noble|5|int+1 pwr+1|Court schemer|
Elder|2|all+1 pwr+1|Centuries of power|
Progenitor|0.6|all+2 pwr+2 sun:all-2|First of the line|Utterly helpless in sunlight
Dhampir|9|spd+1 sun:all+1|Half-vampire, walks in daylight|
Feral Vampire|7|str+1 int-1|More beast than noble|
Shadow Vampire|4|dark:all+2|Melts into the night|
`),
    },
    Demon: {
      title: 'What kind of demon?',
      emoji: '😈',
      rows: FW.table(`
Fiend|14|str+1|Hellspawn|
Imp|12|spd+1 str-1 dur-1|Tiny trickster|
Brute Demon|8|str+2 int-1|Mindless might|
Hellknight|6|fgt+1 dur+1|Infernal soldier|
Warlock Demon|5|pwr+2 str-1|Spellcaster|
Archdemon|2|all+1 pwr+1|Lord of legions|
Demon Lord|0.8|all+2 pwr+2|Ruler of a circle of hell|
Prince of Hell|0.3|all+3 pwr+3|Rivals gods|
Succubus Kin|6|int+1 a=mind|Feeds on desire|
Hellhound Rider|4|spd+1 fgt+1 a=fire|Rides a burning dog|
Abyssal Horror|1.5|str+2 dur+1 a=void|From the bottom of the pit|
`),
    },
    Dragonborn: {
      title: 'Which draconic bloodline?',
      emoji: '🐲',
      rows: FW.table(`
Red Drake|10|a=fire|Furnace breath|
Frost Drake|8|r=ice a=ice w=fire|Winter breath|
Storm Drake|6|a=lightning r=lightning|Thunder breath|
Venom Drake|6|a=poison r=poison|Acid breath|
Gold Drake|3|int+1 pwr+1 a=holy|Radiant wyrmblood|
Void Drake|1.5|pwr+2 a=void|Starless wyrmblood|
Elder Wyrmblood|1|all+1 pwr+1|Ancient dragon heart|
Sea Drake|5|water:all+1 a=water|Tide breath|
Earth Drake|5|dur+1|Stone-scaled|
Crystal Drake|2|dur+1 pwr+1|Prism breath|
Shadow Drake|2|dark:all+1 a=shadow|Smoke breath|
`),
    },
    Spirit: {
      title: 'What kind of spirit?',
      emoji: '👻',
      rows: FW.table(`
Nature Spirit|10|r=nature|Rooted in the wild|
Ancestral Spirit|8|int+1|Voice of the dead|
Storm Spirit|6|spd+1 a=lightning|Tempest-born|
Vengeful Ghost|6|str+1 pwr+1 dark:all+1|Wronged and furious|
Sorrow Wraith|5|int+1 a=mind|Grief given form|
Elemental Lord|2|all+1 pwr+2|Primal sovereign|
Void Spirit|1|pwr+2 a=void|Whisper from nothing|
House Spirit|8|dur+1|Protects a single home|
Fox Spirit|5|int+1 fate+1|Playful trickster|
Fire Spirit|4|a=fire r=fire|Dances in the hearth|
`),
    },
    Angel: {
      title: 'What type of angel?',
      emoji: '🪽',
      rows: FW.table(`
Guardian Angel|14|dur+1|Protector of mortals|
Messenger Angel|12|spd+1|Swift herald|
Healing Angel|12|dur+1 int+1|Mender of wounds|
Warrior Angel|10|fgt+1 str+1|Soldier of the host|
Virtue Angel|8|pwr+1|Miracle-worker|
Power Angel|7|str+1 fgt+1|Keeper of the borders|
Dominion Angel|5|int+1 pwr+1|Governor of angels|
Throne Angel|4|dur+2|Seat of judgement|
Cherub|3|int+1 pwr+1 a=fire|Flame-eyed guardian|
Seraph|1.5|all+1 pwr+1 a=fire|Burning six-winged one|
Archangel|1|all+1 pwr+1|Archangel perks: +1 to all stats, flight, immortality, divine aura|
Fallen Angel|5|str+1 dark:all+1 w=holy|Cast out, but still winged|
Recording Angel|4|int+2|Writes down every deed|
Angel of Death|1|pwr+2 a=shadow|Escorts the dying|
`),
    },
    Human: {
      title: 'What is your heritage?',
      emoji: '🧑',
      rows: FW.table(`
Commoner|14||Salt of the earth|
Nomad|8|spd+1|Raised on the road|
Highlander|7|str+1 ice:all+1|Mountain-bred|
Islander|7|water:all+1|Raised on the tide|
Highborn|5|int+1 fate+1|Old money, old tutors|
Witchblood|3|pwr+1|A grandmother's secret|
Giantblood|2|str+1 dur+1|Broad as a doorway|
Starborn|1|all+1|Born under a falling star|
City-born|10|urban:all+1|Grew up in the crowds|
Desert Folk|6|sun:all+1|Tough as old leather|
Seafarer|6|water:all+1 spd+1|Born on a ship|
Mountain Folk|6|dur+1|Thin air, thick skin|
Sorcerer-blooded|2|pwr+1 int+1|Magic in the family|
Hero's Descendant|1.5|fgt+1 rt+1|Great-grandchild of a legend|
`),
    },
    Beastkin: {
      title: 'Which beast is in your blood?',
      emoji: '🐾',
      rows: FW.table(`
Wolf|10|fgt+1 dark:spd+1|Pack hunter|
Cat|9|spd+1|Always lands on her feet|
Fox|8|int+1|Sly and quick|
Rabbit|7|spd+2 str-1|Impossible to catch|
Bear|6|str+1 dur+1 spd-1|Unstoppable bulk|
Boar|5|str+1 dur+1 int-1|Charges first|
Raven|5|int+1 fate+1|Omen-reader|
Serpent|4|spd+1 a=poison|Venom bite|
Tiger|3|str+1 spd+1|Apex ambusher|
Lion|2|str+1 fgt+1 rt+1|Born to lead|
Deer|6|spd+1 wild:all+1|Startles easily, runs forever|
Owl|4|int+1 dark:all+1|Sees in the dark|
Horse|5|spd+1 dur+1|Endless stamina|
Shark|3|str+1 water:all+1|Smells blood a mile away|
Dragon|1|str+1 pwr+1 r=fire|Rarest blood of all|
`),
    },
    Elemental: {
      title: 'Which element are you made of?',
      emoji: '🌪️',
      rows: FW.table(`
Fire|8|a=fire r=fire w=water fire:all+1|Living flame|
Water|8|a=water r=water w=lightning water:all+1|Living tide|
Earth|8|dur+1 r=metal w=nature|Living stone|
Air|7|spd+1 storm:all+1|Living wind|
Ice|6|a=ice r=ice w=fire ice:all+1|Living frost|
Lightning|5|spd+1 a=lightning r=lightning w=water|Living storm|
Magma|3|str+1 a=fire r=fire w=ice|Living eruption|
Shadow|3|a=shadow r=shadow w=holy dark:all+1|Living dark|
Light|2|a=holy r=holy w=shadow sun:all+1|Living radiance|
Sand|4|dur+1 sun:all+1|Living dune|
Metal|3|dur+1 a=metal r=metal w=lightning|Living ore|
Nature|4|a=nature wild:all+1 w=fire|Living forest|
Void|1|pwr+2 a=void w=holy|Living nothing|
`),
    },
    Dwarf: {
      title: 'Which clan forged you?',
      emoji: '⛏️',
      rows: FW.table(`
Deepforge|10|wpn+1|Smiths of the under-halls|
Stonebeard|9|dur+1|Wall-builders|
Goldvein|7|fate+1|Lucky prospectors|
Ashpick|6|r=fire fire:all+1|Volcano miners|
Frosthelm|5|r=ice ice:all+1|Glacier holders|
Runecarver|3|int+1 pwr+1|Keepers of the old script|
Kingsblood|1|all+1 rt+1|Heirs of the first hall|
Ironbelly|7|r=poison dur+1|Drinks anything|
Deepdelver|5|dark:all+1|Has never seen the sun|
Skyforge|2|r=lightning storm:all+1|Built a forge on a mountain peak|
`),
    },
    Orc: {
      title: 'Which clan raised you?',
      emoji: '🪓',
      rows: FW.table(`
Bloodtusk|10|str+1|Raiders|
Ironjaw|8|dur+1|Shield-breakers|
Ashwalker|7|r=fire|Wasteland wanderers|
Wolfrider|6|spd+1|Mounted skirmishers|
Spirit-talker|4|int+1 pwr+1|Clan shamans|
Skullcrown|2|fgt+1 str+1 rt+1|Clan of warlords|
Seareaver|5|water:all+1 fgt+1|Orc pirates|
Moonfang|4|dark:all+1 spd+1|Night raiders|
Stonehide|4|dur+1 str+1|Mountain orcs|
`),
    },
    God: {
      title: 'What is your domain?',
      emoji: '⚡',
      rows: FW.table(`
Harvest|10|dur+1 wild:all+1|Patron of fields|
Sea|8|water:all+2 a=water|Lord of tides|
Forge|8|wpn+2 a=fire|Maker of blades|
War|7|fgt+2 str+1|First into every battle|
Sun|6|sun:all+2 a=holy|The burning eye|
Moon|6|dark:all+2|The quiet watcher|
Trickery|6|int+1 fate+2|Nothing goes as planned|
Storm|5|spd+1 storm:all+2 a=lightning|Voice of thunder|
Death|4|pwr+2 a=shadow|Everyone meets you once|
Time|2|spd+2 pwr+2 a=time|Yesterday is negotiable|
Creation|1|all+1 pwr+3|The first word|
Love|5|int+1 fate+1 a=mind|Everyone adores you|
Knowledge|4|int+3|Knows every answer|
Chaos|3|pwr+2 fate-1|Nothing stays the same|
Dreams|3|int+1 pwr+1 a=mind|Rules the night's stories|
Beasts|4|str+1 wild:all+2|Every animal answers|
`),
    },
    Djinn: {
      title: 'What kind of djinn?',
      emoji: '🪔',
      rows: FW.table(`
Lamp-bound|10|pwr-1 fate+1|Owes three wishes|Bound to a vessel
Sandwalker|8|spd+1 sun:all+1|Desert wind|
Ifrit|6|str+1 a=fire r=fire|Smokeless fire|
Marid|5|pwr+1 a=water water:all+1|Sea-djinn|
Wish-king|1.5|all+1 pwr+2|Free and crowned|
Ghul|5|str+1 dark:all+1|Desert hunter|
Storm Djinn|4|spd+1 a=lightning storm:all+1|Rides the sandstorm|
Shadow Djinn|3|dark:all+1 a=shadow|Grants the wrong wishes|
`),
    },
    Werewolf: {
      title: 'What is your place in the pack?',
      emoji: '🐺',
      label: 'PACK RANK',
      rows: FW.table(`
Omega|10|behind:all+1|Bullied, and stronger for it|
Lone Wolf|9|fgt+1|Hunts alone|
Pack Hunter|9|spd+1|Never the only wolf in the fight|
Beta|6|str+1 fgt+1|Second in command|
Alpha|3|str+1 fgt+1 rt+1|Leads the pack|
Moon-cursed|2|str+2 dark:all+1 int-1|Turns every night|Never chose this
Lycan Lord|0.8|all+1 str+1|Father of a thousand packs|
`),
    },
    Fairy: {
      title: 'Which court do you serve?',
      emoji: '🧚',
      label: 'COURT',
      rows: FW.table(`
Flower Sprite|10|wild:all+1|Lives in a single bloom|
Pixie|9|spd+1 fate+1|Mischief incarnate|
Brownie|7|int+1 dur+1|Secret household helper|
Will-o'-wisp|5|dark:all+1 a=holy|Lantern in the bog|
Summer Court|4|sun:all+1 pwr+1|Warm and fickle|
Winter Court|4|ice:all+1 pwr+1 r=ice|Cold and patient|
Fairy Queen|0.8|all+1 pwr+2|Rules the hollow hills|
`),
    },
    Mermaid: {
      title: 'Which waters are yours?',
      emoji: '🧜',
      label: 'WATERS',
      rows: FW.table(`
Reef Merfolk|10|spd+1|Bright scales, quick fins|
River Merfolk|8|wild:all+1|Lives under the willows|
Deep-sea Merfolk|6|dark:all+1 dur+1|Glows in the dark|
Arctic Merfolk|5|r=ice ice:all+1|Swims under the ice|
Siren|4|int+1 a=mind|A song that drags sailors down|
Sea Witch|2|pwr+2|Trades in voices and wishes|
Ocean Royalty|1|all+1 rt+1|Heir to the coral throne|
`),
    },
    Golem: {
      title: 'What are you made of?',
      emoji: '🗿',
      label: 'MATERIAL',
      rows: FW.table(`
Clay|12|str-1 dur+1|Easy to repair|
Stone|10|dur+1|Patient and heavy|
Iron|7|str+1 dur+1 w=lightning|Rust is the only enemy|
Flesh|5|str+1 r=poison w=fire|Stitched together|
Bronze|5|str+1 r=fire|Hums when struck|
Crystal|3|pwr+1 w=sound|Light passes through you|
Obsidian|2|dur+2 r=fire|Black volcanic glass|
Adamantine|0.6|dur+3 str+1|Nothing scratches you|
`),
    },
    Kitsune: {
      title: 'How many tails?',
      emoji: '🦊',
      label: 'TAILS',
      rows: FW.table(`
One tail|12||A young fox spirit|
Two tails|9|int+1|Learning the tricks|
Three tails|7|pwr+1|Fox-fire at will|
Five tails|4|int+1 pwr+1|Respected among foxes|
Seven tails|2|pwr+2 fate+1|Bends the weather|
Nine tails|0.7|all+1 pwr+2|The legendary fox|
`),
    },
    Skeleton: {
      title: 'Who were you in life?',
      emoji: '💀',
      label: 'FORMER LIFE',
      rows: FW.table(`
Farmer|10|dur+1|Still holds the pitchfork|
Soldier|9|fgt+1|Still in formation|
Sailor|7|water:all+1|Found at the bottom of the sea|
Knight|5|wpn+1 dur+1|Rusted armour, iron will|
Mage|4|pwr+1 int+1|Bones full of old spells|
King|2|rt+2 int+1|Still wears the crown|
Dragon Rider|0.8|str+1 spd+1 rt+1|Rode the sky before dying|
`),
    },
    Zombie: {
      title: 'How fresh are you?',
      emoji: '🧟',
      label: 'FRESHNESS',
      rows: FW.table(`
Fresh|10|spd+1|Could pass for alive|
Shambling|10|spd-1 dur+1|Slow, but never stops|
Rotten|6|a=poison|The smell is a weapon|
Runner|4|spd+2 int-1|Fast and furious|
Smart Zombie|2|int+2|Remembers who you were|
Plague King|0.8|all+1 a=poison|Every bite spreads your crown|
`),
    },
    Undine: {
      title: 'Which waters gave you shape?',
      emoji: '💧',
      label: 'SPRING',
      rows: FW.table(`
Spring|10|dur+1|Fresh and clean|
Rain|8|storm:all+1|Falls with the storm|
Waterfall|6|str+1|Crashing force|
Mist|5|spd+1 dark:all+1|Hard to grasp|
Ocean|2|all+1 water:all+1|The whole sea in one body|
`),
    },
  };

  FW.RACE_ART = {
    Human: 'human',
    Dwarf: 'stocky bearded dwarf',
    Orc: 'green-skinned orc with tusks',
    Goblin: 'small green goblin with long ears',
    Skeleton: 'animated skeleton with glowing eye sockets',
    Beastkin: 'beastkin with animal ears and a tail',
    Lizardfolk: 'scaled lizardfolk with a reptilian head and tail',
    Elf: 'graceful elf with long pointed ears',
    'Dark Elf': 'dark elf with ash-grey skin, white hair and pointed ears',
    Fairy: 'tiny fairy with translucent insect wings',
    Mermaid: 'merfolk with a shimmering fish tail and fins',
    Slime: 'humanoid made of translucent gel',
    Golem: 'towering golem of carved stone with glowing runes',
    'Half-Giant': 'huge broad-shouldered half-giant',
    Vampire: 'pale vampire with fangs',
    Werewolf: 'werewolf, half human and half wolf, with fur and claws',
    Kitsune: 'kitsune with fox ears and several fox tails',
    Oni: 'horned oni with red skin and tusks',
    Banshee: 'ghostly banshee with flowing spectral hair',
    Chimera: 'chimera-blooded hybrid with lion, goat and serpent features',
    Succubus: 'horned demon-kin with small bat wings and a tail',
    Shadowborn: 'shadowborn being made of living shadow with glowing eyes',
    Phoenixkin: 'phoenixkin with feathers of flame along the arms',
    Demon: 'horned demon with dark wings',
    Dragonborn: 'dragonborn with a draconic head, scales and a tail',
    Celestial: 'celestial being with skin of faint starlight',
    Angel: 'angel with large feathered wings and a halo',
    Spirit: 'translucent glowing spirit',
    Leviathan: 'colossal sea-titan with fins and scales',
    Reaper: 'hooded reaper, a skeletal figure in tattered robes',
    Ghoul: 'gaunt grey-skinned ghoul',
    Cyborg: 'cyborg with exposed metal limbs and glowing implants',
    Mutant: 'mutant with asymmetric glowing growths',
    'Frost Giant': 'towering frost giant with blue skin and an icy beard',
    Titan: 'colossal ancient titan',
    'Eldritch Horror': 'eldritch horror with tentacles and too many eyes',
    'Cosmic Entity': 'cosmic entity whose body is a window onto galaxies',
    Eternal: 'ageless eternal with calm, timeless features',
    God: 'radiant god wreathed in divine light',
    Halfling: 'small cheerful halfling with curly hair and bare feet',
    Gnome: 'tiny gnome with a big nose and goggles',
    Kobold: 'small scaly kobold with a snout and horns',
    Ogre: 'hulking ogre with a heavy jaw',
    Troll: 'lanky moss-skinned troll with a long nose',
    Centaur: 'centaur with a human torso on a horse body',
    Minotaur: 'bull-headed minotaur with great horns',
    Harpy: 'harpy with feathered wings for arms and taloned feet',
    Satyr: 'satyr with goat legs and curled horns',
    Naga: 'naga with a human torso and a long serpent body',
    Dryad: 'dryad with bark-like skin and leaves growing from the body',
    Hellblood: 'person of infernal ancestry with curved horns and a slender tail',
    Gargoyle: 'stone-skinned gargoyle with bat wings',
    Tengu: 'tengu with black crow wings and a beaked mask',
    Arachne: 'arachne with a human torso on a giant spider body',
    Yeti: 'huge white-furred yeti',
    Automaton: 'brass clockwork automaton with visible gears',
    Mothfolk: 'mothfolk with fluffy antennae, large dark eyes and patterned moth wings',
    Mycelid: 'mushroom-folk with a wide fungal cap for a head',
    Changeling: 'pale changeling with blank white eyes and shifting features',
    Revenant: 'revenant, an undead avenger with burning eyes and old wounds',
    Elemental: 'elemental, a humanoid body made entirely of raw element',
    Djinn: 'djinn whose lower body trails off into swirling smoke',
    Valkyrie: 'valkyrie with white wings and a winged helm',
    Lich: 'lich, a skeletal archmage with a crown and glowing eyes',
    Nephilim: 'tall nephilim with a single pair of pale wings',
    Sphinx: 'sphinx with a human face, a lion body and wings',
    Starchild: 'starchild with softly glowing skin dotted with stars',
    Voidling: 'voidling, a silhouette of pure darkness outlined in violet light',
    Primordial: 'primordial giant made of rock, storm and molten light',
    Ratfolk: 'ratfolk with a whiskered rat face, round ears and a long tail',
    Hobgoblin: 'tall disciplined hobgoblin with orange-red skin and pointed ears',
    Gnoll: 'hyena-headed gnoll with spotted fur',
    Frogfolk: 'frogfolk with smooth green skin, wide eyes and a frog face',
    Bearfolk: 'bearfolk with a bear head and thick brown fur',
    Owlfolk: 'owlfolk with an owl face, feathers and large round eyes',
    Sharkfolk: 'sharkfolk with grey skin, a shark head, fins and rows of teeth',
    Zombie: 'zombie with grey rotting skin and stitched wounds',
    Homunculus: 'small homunculus, a pale alchemical being with glass-like eyes',
    Lightborn: 'lightborn person with faintly glowing skin and golden eyes',
    Salamanderkin: 'salamanderkin with red scales and flames flickering along the spine',
    Undine: 'undine whose body is partly made of clear flowing water',
    Sylph: 'sylph with an airy translucent body and hair like wind',
    'Forest Giant': 'gentle forest giant with mossy skin and leaves in the beard',
    Cyclops: 'huge one-eyed cyclops',
    Mummy: 'mummy wrapped in ancient linen bandages with glowing eyes',
    Shade: 'shade, a living shadow with faint white eyes',
    Crystalborn: 'crystalborn with a body of faceted glowing crystal',
    Android: 'android with flawless synthetic skin and visible seams of light',
    Gorgon: 'gorgon with living snakes for hair',
    Dullahan: 'headless dark rider carrying their own glowing head',
    Wendigo: 'gaunt wendigo with a deer skull for a head and antlers',
    Treant: 'treant, a walking ancient tree with a face in the bark',
    Dreamborn: 'dreamborn with a body that fades into swirling dream mist',
    Thunderbird: 'thunderbird-kin with vast storm-cloud wings crackling with lightning',
    Demigod: 'demigod with a faint golden aura',
    Behemoth: 'colossal horned behemoth with rocky hide',
    Archfey: 'archfey ruler with iridescent butterfly wings and a crown of thorns and flowers',
    Chronoborn: 'chronoborn with clock-face patterns glowing on the skin and afterimages around the body',
  };

  FW.RACE_HUE = {
    Ratfolk: 30,
    Hobgoblin: 15,
    Gnoll: 40,
    Frogfolk: 110,
    Bearfolk: 25,
    Owlfolk: 38,
    Sharkfolk: 200,
    Zombie: 95,
    Homunculus: 180,
    Lightborn: 50,
    Salamanderkin: 10,
    Undine: 190,
    Sylph: 170,
    'Forest Giant': 120,
    Cyclops: 30,
    Mummy: 42,
    Shade: 260,
    Crystalborn: 185,
    Android: 205,
    Gorgon: 140,
    Dullahan: 270,
    Wendigo: 210,
    Treant: 105,
    Dreamborn: 290,
    Thunderbird: 225,
    Demigod: 48,
    Behemoth: 20,
    Archfey: 310,
    Chronoborn: 45,
  };

  FW.RACE_LOOK = {
    winged: ['Owlfolk', 'Thunderbird', 'Archfey', 'Sylph'],
    horned: ['Wendigo', 'Behemoth'],
    halo: ['Lightborn', 'Demigod'],
    eared: ['Hobgoblin', 'Gnoll', 'Ratfolk', 'Archfey'],
  };

  FW.HAIRLESS = [
    'Skeleton',
    'Slime',
    'Golem',
    'Lizardfolk',
    'Dragonborn',
    'Leviathan',
    'Eldritch Horror',
    'Automaton',
    'Gargoyle',
    'Mycelid',
    'Naga',
    'Kobold',
    'Elemental',
    'Spirit',
    'Voidling',
    'Cosmic Entity',
    'Primordial',
    'Mothfolk',
    'Lich',
    'Reaper',
    'Cyborg',
    'Sphinx',
    'Shade',
    'Crystalborn',
    'Mummy',
    'Dullahan',
    'Treant',
    'Thunderbird',
    'Behemoth',
    'Frogfolk',
    'Sharkfolk',
    'Salamanderkin',
    'Owlfolk',
    'Gorgon',
    'Wendigo',
    'Android',
  ];
})(typeof window !== 'undefined' ? window : globalThis);
