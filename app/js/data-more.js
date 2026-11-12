/* FATEWHEEL expansion content: more races, sub-wheels, new wheels (class, element, companion, looks)
   and the visual descriptions used by the art prompt. Loaded after data.js, before engine.js. */
(function (g) {
  const FW = g.FW, table = FW.table;
  const add = (list, text) => table(text).forEach(r => list.push(r));

  /* ---------------- more races ---------------- */
  add(FW.RACES, `
Halfling|7|spd+1 fate+1 str-1 hs=0.6 life=s|Lucky and light-footed - +1 Fate Token|Small frame
Gnome|5|int+2 str-1 hs=0.55 life=m|Tinker-genius|Tiny and easy to shove aside
Kobold|5|spd+1 int+1 str-1 dur-1 dark:all+1 hs=0.6 life=s|Tunnel trapper, bolder in the dark|Scrawny
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
Mycelid|3|dur+1 int+1 spd-1 wild:all+1 r=poison a=poison w=fire life=l|Fungus-folk sharing one patient mind|Dry heat ruins the spores
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
`);

  /* ---------------- more sub-wheels ---------------- */
  Object.assign(FW.SUBS, {
    'Human': { title: 'What is your heritage?', emoji: '🧑', rows: table(`
Commoner|14||Salt of the earth
Nomad|8|spd+1|Raised on the road
Highlander|7|str+1 ice:all+1|Mountain-bred
Islander|7|water:all+1|Raised on the tide
Highborn|5|int+1 fate+1|Old money, old tutors
Witchblood|3|pwr+1|A grandmother's secret
Giantblood|2|str+1 dur+1|Broad as a doorway
Starborn|1|all+1|Born under a falling star
`)},
    'Beastkin': { title: 'Which beast is in your blood?', emoji: '🐾', rows: table(`
Wolf|10|fgt+1 dark:spd+1|Pack hunter
Cat|9|spd+1|Always lands on her feet
Fox|8|int+1|Sly and quick
Rabbit|7|spd+2 str-1|Impossible to catch
Bear|6|str+1 dur+1 spd-1|Unstoppable bulk
Boar|5|str+1 dur+1 int-1|Charges first
Raven|5|int+1 fate+1|Omen-reader
Serpent|4|spd+1 a=poison|Venom bite
Tiger|3|str+1 spd+1|Apex ambusher
Lion|2|str+1 fgt+1 rt+1|Born to lead
`)},
    'Elemental': { title: 'Which element are you made of?', emoji: '🌪️', rows: table(`
Fire|8|a=fire r=fire w=water fire:all+1|Living flame
Water|8|a=water r=water w=lightning water:all+1|Living tide
Earth|8|dur+1 r=metal w=nature|Living stone
Air|7|spd+1 storm:all+1|Living wind
Ice|6|a=ice r=ice w=fire ice:all+1|Living frost
Lightning|5|spd+1 a=lightning r=lightning w=water|Living storm
Magma|3|str+1 a=fire r=fire w=ice|Living eruption
Shadow|3|a=shadow r=shadow w=holy dark:all+1|Living dark
Light|2|a=holy r=holy w=shadow sun:all+1|Living radiance
`)},
    'Dwarf': { title: 'Which clan forged you?', emoji: '⛏️', rows: table(`
Deepforge|10|wpn+1|Smiths of the under-halls
Stonebeard|9|dur+1|Wall-builders
Goldvein|7|fate+1|Lucky prospectors
Ashpick|6|r=fire fire:all+1|Volcano miners
Frosthelm|5|r=ice ice:all+1|Glacier holders
Runecarver|3|int+1 pwr+1|Keepers of the old script
Kingsblood|1|all+1 rt+1|Heirs of the first hall
`)},
    'Orc': { title: 'Which clan raised you?', emoji: '🪓', rows: table(`
Bloodtusk|10|str+1|Raiders
Ironjaw|8|dur+1|Shield-breakers
Ashwalker|7|r=fire|Wasteland wanderers
Wolfrider|6|spd+1|Mounted skirmishers
Spirit-talker|4|int+1 pwr+1|Clan shamans
Skullcrown|2|fgt+1 str+1 rt+1|Clan of warlords
`)},
    'God': { title: 'What is your domain?', emoji: '⚡', rows: table(`
Harvest|10|dur+1 wild:all+1|Patron of fields
Sea|8|water:all+2 a=water|Lord of tides
Forge|8|wpn+2 a=fire|Maker of blades
War|7|fgt+2 str+1|First into every battle
Sun|6|sun:all+2 a=holy|The burning eye
Moon|6|dark:all+2|The quiet watcher
Trickery|6|int+1 fate+2|Nothing goes as planned
Storm|5|spd+1 storm:all+2 a=lightning|Voice of thunder
Death|4|pwr+2 a=shadow|Everyone meets you once
Time|2|spd+2 pwr+2 a=time|Yesterday is negotiable
Creation|1|all+1 pwr+3|The first word
`)},
    'Djinn': { title: 'What kind of djinn?', emoji: '🪔', rows: table(`
Lamp-bound|10|pwr-1 fate+1|Owes three wishes|Bound to a vessel
Sandwalker|8|spd+1 sun:all+1|Desert wind
Ifrit|6|str+1 a=fire r=fire|Smokeless fire
Marid|5|pwr+1 a=water water:all+1|Sea-djinn
Wish-king|1.5|all+1 pwr+2|Free and crowned
`)}
  });

  /* ---------------- more birthplaces / backgrounds / personalities ---------------- */
  add(FW.BIRTH, `
Clockwork Capital|5|int+1 urban:all+1 w=lightning|City of gears and timetables
Bone Marsh|5|dur+1 r=poison water:spd-1|Fever-swamp upbringing
Glass Desert|4|spd+1 sun:all+1 ice:all-1|Dunes fused by an old war
Lantern Harbor|6|int+1 fate+1 water:all+1|Port of a thousand flags
Hanging Gardens|4|int+1 wild:all+1|Terraced green above the clouds
Obsidian Citadel|4|dur+1 fgt+1 r=fire|Fortress of black glass
Whispering Steppe|6|spd+1 wild:spd+1|Horse-lords and endless grass
Moonwell Grove|3|pwr+1 dark:all+1|Silver water under old trees
Sunken Atoll|3|water:all+2 urban:all-1|Half the town is under the tide
Titan's Graveyard|2|str+1 dur+1 fate-1|Raised among colossal bones|The dead giants are restless
Mirror Lake Shrine|3|int+1 holy:all+1|Pilgrim town on still water
Ember Isles|4|spd+1 a=fire fire:all+1|Volcano fishermen
Frostfang Pass|4|dur+1 r=ice ice:all+1|Toll-keepers of the high road
Carnival Roads|5|spd+1 fate+1|Born in a travelling show
The Undercity|5|spd+1 dark:all+1 sun:all-1|Sewers, markets and no sky
Dream Shore|1.5|pwr+2 int+1 fate-1|A coast that is only there at night|You are never fully awake
`);
  add(FW.BACKGROUNDS, `
You were a blacksmith's apprentice who forged a cursed blade.|5|wpn+1 str+1 fate-1|Knows steel|The blade remembers you
You were a pirate who lost a ship and a crew.|5|fgt+1 spd+1 water:all+1|Sea legs|Wanted in every port
You were a court jester who knew too many secrets.|4|int+1 spd+1 fate+1|Underestimated by everyone|Powerful enemies
You were a failed chosen one.|4|behind:all+2 fate-1|Nothing left to lose|The prophecy moved on without you
You were a healer who could not save your village.|5|int+1 dur+1|Steady hands|Guilt
You were a bounty hunter who spared the wrong target.|5|fgt+1 wpn+1|Relentless tracker|A debt unpaid
You were a farmhand who found a sword in a field.|7|str+1 wpn+1 int-1|Honest strength|No training
You were an arena champion who walked away.|3|fgt+2 rt+1 ahead:all+1|Crowd favourite|Old rivals want a rematch
You were a tomb robber who woke something.|4|spd+1 int+1 dark:all+1|Light fingers|Something follows you
You were a lighthouse keeper who saw the thing in the fog.|4|int+1 storm:all+1|Patient watcher|Nobody believes you
You were an exiled prince with a stolen crown.|3|int+1 fgt+1 rt+1|Raised to rule|Hunted by the usurper
You were a wandering bard who sang the wrong song.|5|spd+1 fate+1|Friends in every tavern|Banned from three kingdoms
You were an experiment that escaped the laboratory.|3|pwr+1 dur+1 int-1|Altered body|Your makers want you back
You were a temple guard who broke your vow.|4|dur+1 fgt+1 holy:all-1|Disciplined|Holy ground shames you
You were raised by a dragon who called you hatchling.|2|str+1 pwr+1 r=fire|Wyrm-taught|Terrible table manners
You were a clockmaker who repaired a god's watch.|2|int+2 fate+1|Precise beyond reason|A god owes you, and resents it
`);
  add(FW.PERSONALITIES, `
Trickster|5|spd+1 int+1 o.befriend*1.5 o.banish*1.4 o.kill*0.6|Never where you expect
Loner|5|fgt+1 o.recruit*0.4 o.befriend*0.5 o.spare*1.3|Needs no one|Refuses help
Glory Hound|4|str+1 ahead:all+1 behind:all-1 o.kill*1.3|Shines in front of a crowd|Sulks when losing
Coward|3|spd+2 fgt-1 behind:spd+1 o.spare*1.5 o.kill*0.5|Fastest retreat in the realm|Flinches
Zealot|4|fgt+1 dur+1 int-1 holy:all+1 o.kill*1.5 o.banish*1.5 o.spare*0.5|Unshakable faith|Blind to doubt
Scholar|5|int+2 str-1 o.spare*1.3 o.recruit*1.2|Reads the fight like a book|Soft hands
Cheerful|6|dur+1 fate+1 o.befriend*2 o.kill*0.5|Impossible to discourage
Vengeful|5|str+1 fgt+1 behind:all+1 o.kill*2 o.spare*0.2|Never forgets|Never forgives
Honourable|5|fgt+1 dur+1 o.spare*1.6 o.enslave*0.1|Fights fair|Predictable
Greedy|4|int+1 spd+1 o.enslave*1.6 o.absorb*2 o.spare*0.6|Always profits|Trusts no partner
`);

  /* ---------------- more weapons ---------------- */
  add(FW.WEAPONS, `
Sling|4|q=1|A shepherd's weapon|
Quarterstaff|4|q=1|A traveller's best friend|
Flail|3|q=2|Spiked ball on a chain|
Glaive|3|q=3|Bladed polearm|
War Fan|2.5|q=3|Bladed fan, graceful and deadly|
Chakram|2.5|q=3|Returning ring-blade|
Nunchaku|3|q=2|Twin sticks on a cord|
Boomerang|2.5|q=2|Always comes back|
Flintlock Pistol|3|q=3|One loud answer|
Hand Cannon|2|q=4 a=fire|Kicks like a mule|
Great Bow|2.5|q=3|Taller than its archer|
Battle Harp|1.5|q=3 a=mind|Songs that cut|
Puppet Strings|1.5|q=4 a=mind|Razor wire and marionettes|
Shield Pair|2|q=3|Defence is the weapon|
Moonblade|1.5|q=4 a=shadow|Sharpest under no moon|
Thornwhip|1.5|q=4 a=nature|Living bramble lash|
Tidecaller Glaive|1.5|q=4 a=water|Carries the weight of the sea|
Chrono Edge|0.4|q=5 a=time|Cuts a second ahead of itself|
Godslayer Spear|0.3|q=5 a=holy,void|Made for exactly one purpose|
`);
  Object.assign(FW.AFFINITY, {
    'Halfling': ['Sling', 'Dagger', 'Throwing Knives'], 'Gnome': ['Crossbow', 'Flintlock Pistol', 'Hand Cannon'], 'Kobold': ['Sling', 'Spear', 'Dagger'],
    'Ogre': ['Mace', 'Warhammer', 'Flail'], 'Troll': ['Mace', 'Flail'], 'Centaur': ['Bow', 'Great Bow', 'Spear', 'Glaive'], 'Minotaur': ['Axe', 'Warhammer', 'Halberd'],
    'Harpy': ['Throwing Knives', 'Chakram'], 'Satyr': ['Battle Harp', 'Spear'], 'Naga': ['Trident', 'Glaive', 'Venomfang'], 'Dryad': ['Thornwhip', 'Staff', 'Bow'],
    'Tengu': ['Katana', 'War Fan', 'Glaive'], 'Arachne': ['Puppet Strings', 'Twin Daggers', 'Venomfang'], 'Yeti': ['Frostbrand', 'Mace'],
    'Valkyrie': ['Holy Lance', 'Spear', 'Sword and Shield'], 'Lich': ['Staff', 'Arcane Tome', 'Scythe'], 'Djinn': ['Saber', 'Chakram'],
    'Revenant': ['Greatsword', 'Cursed Blade'], 'Mermaid': ['Trident', 'Tidecaller Glaive'], 'Nephilim': ['Starforged Blade', 'Greatsword'],
    'Mothfolk': ['Moonblade', 'War Fan'], 'Voidling': ['Soul Reaver', 'Moonblade']
  });
  ['Ogre', 'Troll', 'Minotaur', 'Harpy', 'Naga', 'Arachne', 'Yeti', 'Gargoyle', 'Sphinx', 'Centaur', 'Kobold'].forEach(r => FW.NATURAL_WEAPONS.push(r));

  /* ---------------- more enhancements / powers / weaknesses / titles / marks ---------------- */
  add(FW.ENHANCEMENTS, `
Battle Aura|4|fgt+1 dur+1|A visible pressure around you|
Adrenaline Rush|5|spd+1 str+1 behind:all+1|Second wind|Crashes afterwards
Crystal Armor|3|dur+2 r=fire w=lightning|Grown, not forged|Rings like a bell
Ghost Walk|3|spd+1 int+1 dur-1 r=metal|Half a step out of the world|
Storm Heart|2.5|spd+1 pwr+1 storm:all+2 a=lightning|Thunder in the chest|
Frost Veil|3|dur+1 ice:all+1 a=ice w=fire|Wrapped in winter|
Inferno Drive|3|str+2 spd+1 dur-1 a=fire w=water|Burning from the inside|Burns you too
Hive Mind|2|int+2 fgt+1 w=mind|Many thoughts at once|One loud noise breaks it
Wild Growth|3|dur+1 str+1 wild:all+1 a=nature w=fire|Bark, thorn and root|
Chrono Burst|1.5|spd+3 int+1 dur-1 a=time|A few stolen seconds|Ages you
Second Heart|2.5|dur+2 behind:dur+1|Keeps beating|
Kingly Presence|2|int+1 fgt+1 rt+2|Enemies hesitate|
`);
  (function () {
    const B = FW.POWER_BASE;
    const rows = (rar, items) => items.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      const m = s.split('='); FW.POWERS.push({ name: m[0].trim(), w: B[rar], dsl: 'rar=' + rar + (m[1] ? ' a=' + m[1].trim() : ''), perk: '', flaw: '' });
    });
    rows(1, 'Iron Stomach, Perfect Balance, Danger Sense, Beast Speech, Minor Illusions=mind, Spark Touch=lightning, Frost Breath=ice');
    rows(2, 'Sand Manipulation, Smoke Manipulation, Ink Manipulation, Thread Manipulation, Glass Manipulation, Magnetism=metal, Acid Spit=poison, Thorn Growth=nature, Mist Form, Echo Clones, Paper Charms, Moonlight Weaving=shadow');
    rows(3, 'Puppetry=mind, Rune Writing, Shapeshifting, Necromancy=shadow, Storm Calling=lightning, Glacier Calling=ice, Solar Flare=holy, Blood Pact=blood, Shadow Stitching=shadow, Size Shifting, Pocket Dimension');
    rows(4, 'Weather Dominion=lightning, Star Calling=holy, Life Drain=blood, Mirror World, Law Binding, Dream Walking=mind, Black Flame=void');
    rows(5, 'Causality Manipulation=time, Authority, Erasure=void, Miracle Working=holy');
    rows(6, 'Narrative Control, Infinity');
  })();
  add(FW.WEAKNESSES, `
Sound|3|w=sound|Sensitive hearing|Loud noise staggers you
Nature's Grudge|2|w=nature wild:all-1|The forest remembers|
Pride|3|ahead:all-1 behind:int-1|Cannot admit a mistake|
Bound Oath|3|fate-1|Sworn to something inconvenient|
Old Wound|4|spd-1 ice:dur-1|It aches in the cold|
Moon Sickness|2|dark:int-1 dark:fgt-1|Restless under the moon|
Glass Jaw|3|dur-1 behind:dur-1|One clean hit|
Homesick|3|urban:all-1|Never at ease in cities|
Gluttony|2|spd-1|Heavy after every meal|
Phobia of Water|2|water:all-2|Will not cross a stream|
Borrowed Time|1.5|fate-1 dur-1|The debt is nearly due|
Honour Bound|3|ahead:fgt-1|Never strikes a fallen foe|
`);
  [['The Laughing Storm', 3, 2], ['The Quiet Blade', 3.5, 1], ['The Ember Witch', 2.5, 2], ['The Thorn Regent', 2, 2], ['The Unburnt', 2.5, 2], ['The Wolf of Winter', 2.5, 2],
   ['The Tide Sovereign', 1.5, 3], ['The Clockwork Saint', 1.5, 3], ['The Star Eater', 1, 3], ['The Kind Monster', 3.5, 1], ['The Oathbreaker', 3, 2], ['The Moth Queen', 1.5, 3],
   ['The Road Wanderer', 4, 1], ['The Ninth Shadow', 2, 2], ['The Dawn Herald', 2.5, 2], ['The Bone Gardener', 2, 2], ['The Ash Walker', 3.5, 1], ['The Final Riddle', 1, 3]]
    .forEach(x => FW.TITLES.push({ name: x[0], w: x[1], dsl: 'tt=' + x[2] + ' rt+' + x[2], perk: ['Whispered in taverns', 'Feared across the realm', 'A name that stops battles'][x[2] - 1], flaw: '' }));
  add(FW.MARKS, `
Storm-Called|3|spd+1 storm:all+1|Lightning never strikes you by accident|
Tide-Marked|3|fate+1 water:all+1|The sea returns what you lose|
Ember Brand|3|str+1 fire:all+1 w=ice|A burn that never cooled|
Raven's Favour|3|int+1 fate+1|Something is watching over you|
Twin Soul|2|fate+1 behind:all+1|Someone, somewhere, shares your pain|
Hollow Crown|2|rt+2 fate-1 ahead:all+1|Destined to rule, briefly|
Thirteenth Hour|1.5|spd+1 pwr+1 fate-1|You were born in a minute that does not exist|
`);

  /* ---------------- more arenas and universes ---------------- */
  [{ name: 'Clocktower Rooftops', tags: ['urban', 'storm'], w: 5 }, { name: 'Drowned Harbor', tags: ['water', 'dark'], w: 5 }, { name: 'Burning Library', tags: ['fire', 'urban'], w: 4 },
   { name: 'Glacier Cathedral', tags: ['ice', 'holy'], w: 4 }, { name: 'Midnight Jungle', tags: ['wild', 'dark'], w: 5 }, { name: 'Desert of Glass', tags: ['sun', 'fire'], w: 5 },
   { name: 'Edge of the World', tags: ['void', 'storm'], w: 2 }].forEach(a => FW.ARENAS.push(a));
  FW.UNIVERSES.push(
    { name: 'Tideborn Deep', emoji: '🌊', hue: 195, blurb: 'Sunken empires and things with too many arms', opps: table(`
Reef Raider Kessa|10|lv=29 a=water w=lightning|Smiles like a shark
Brine Knight Odo|8|lv=41 a=water,metal w=lightning|Armour grown from coral
Siren Regent Lyss|7|lv=53 a=mind,water w=sound|A voice you obey
Trench Stalker|6|lv=61 a=shadow r=water w=holy|No one has seen all of it
Kraken Oracle|3|lv=77 a=water,mind r=water w=fire|Reads the future in ink
The Drowned Emperor|1.5|lv=91 a=water,void r=water,ice w=lightning|Still holds court below
`)},
    { name: 'Clockwork Meridian', emoji: '🕰️', hue: 45, blurb: 'A brass world wound by forgotten engineers', opps: table(`
Gearling Swarm|10|lv=27 a=metal w=lightning|A thousand tiny wrenches
Inspector Brass|8|lv=39 a=metal r=poison w=lightning|Finds faults in everyone
Pendulum Duelist|7|lv=49 a=metal|Never off the beat
Steam Baroness Vell|5|lv=59 a=fire r=fire w=ice|Rules by pressure
Chronosmith Arkwell|3|lv=73 a=time,metal w=lightning|Repairs yesterday
The Unwound King|1.5|lv=89 a=time r=mind w=lightning|Ticks once a century
`)},
    { name: 'Hollow Moon', emoji: '🌙', hue: 250, blurb: 'Dreams, moths and a city inside the moon', opps: table(`
Lamp Thief Pim|10|lv=26 a=shadow w=holy|Steals the light you stand in
Sleepwalker Knight|8|lv=42 a=mind w=sound|Fights without waking
Moth Abbess|7|lv=51 a=shadow,mind w=fire|A sermon of wings
Nightmare Courser|5|lv=63 a=mind r=shadow w=holy|Rides through bad dreams
The Tidal Wolf|3|lv=76 a=ice,shadow r=ice w=fire|Chases the moon it lives in
Mother of Eclipses|1.2|lv=93 a=void,shadow r=shadow,mind w=holy|When she blinks, it is night
`)}
  );

  /* ---------------- new wheel: class ---------------- */
  FW.CLASSES = table(`
Commoner|10|behind:all+1 fate+1|No training, plenty of nerve|No training at all
Warrior|8|fgt+1 str+1|Front-line fighter
Knight|6|dur+1 wpn+1|Armoured oath-keeper
Rogue|7|spd+1 int+1 dur-1|Shadows and shortcuts|Lightly protected
Ranger|6|spd+1 wpn+1 wild:all+1|Wilderness scout
Mage|6|pwr+1 int+1 str-1|Student of the arcane|Bookish build
Cleric|5|dur+1 int+1 holy:all+1|Faith as a shield
Monk|5|fgt+2 wpn-1|The body is the weapon|Distrusts steel
Berserker|4|str+2 int-1 behind:str+1|Rage as a strategy|Forgets the plan
Paladin|3|fgt+1 dur+1 holy:all+1 w=shadow|Holy champion|Shadow tests the vow
Assassin|4|spd+1 fgt+1 dark:all+1|One strike, from behind
Bard|5|int+1 fate+1|Stories, songs and suspicious luck
Druid|4|pwr+1 wild:all+1 urban:all-1|Speaks for the wild|Ill at ease among walls
Necromancer|3|pwr+1 int+1 dark:all+1 w=holy|Commands the dead|Holy light scatters the work
Warlock|3|pwr+2 fate-1|Power on loan|The patron will collect
Summoner|3|pwr+1 int+1 dur-1|Never fights alone|Fragile alone
Samurai|3|wpn+2 fgt+1 ahead:all-1|One perfect cut|Honour slows the finish
Gunslinger|3|spd+1 wpn+1 int+1 fgt-1|Fastest draw|Poor in a brawl
Alchemist|4|int+2 str-1|Bottled solutions|Needs preparation
Beastmaster|4|str+1 spd+1 wild:all+1|Fights beside claws
Tactician|3|int+2 fgt+1 str-1|Wins before the fight starts|Not a brawler
Spellblade|2.5|wpn+1 pwr+1 fgt+1|Steel in one hand, fire in the other
Pirate|4|spd+1 fgt+1 water:all+1|No rules on the water
Blacksmith|4|str+1 dur+1 wpn+1 spd-1|Knows every weapon's weak point|Heavy arms, slow feet
Dancer|3|spd+2 str-1|Every dodge is choreography
Chosen One|0.8|all+1 fate+1 rt+2|The prophecy has your name on it|So does every villain
`);

  /* ---------------- new wheel: element ---------------- */
  FW.ELEMENTS = table(`
No element|70|none|No elemental affinity|
Fire|6|a=fire r=fire w=water fire:all+1|Your blows burn|Doused by water
Water|6|a=water r=water w=lightning water:all+1|Flowing and patient|Lightning runs through you
Earth|6|dur+1 a=nature r=metal w=ice|Unmovable|Frost cracks stone
Wind|6|spd+1 storm:spd+1 w=ice|Light on your feet|
Ice|5|a=ice r=ice w=fire ice:all+1|Cold precision|Melted by fire
Lightning|5|spd+1 a=lightning r=lightning w=nature storm:all+1|Fast as the flash|Grounded by roots
Nature|5|a=nature r=nature,poison w=fire wild:all+1|Growth and thorns|Burns easily
Metal|4|dur+1 a=metal r=metal w=lightning|Edge and armour|Conducts
Light|3|a=holy r=holy w=shadow sun:all+1|Radiant|Dimmed by shadow
Shadow|3|a=shadow r=shadow w=holy dark:all+1|Unseen|Burned by light
Poison|3|a=poison r=poison w=holy|Slow certainty|
Sound|2.5|spd+1 a=sound w=mind|Shattering resonance|
Blood|2|str+1 a=blood w=poison|Life as fuel|Thin blood
Mind|2|int+1 a=mind r=mind w=sound|Thought made force|
Time|0.6|spd+1 pwr+1 a=time r=time|A half-second ahead|
Void|0.6|pwr+2 a=void r=void w=holy void:all+2|Hungry nothing|Light unmakes it
`);

  /* ---------------- new wheel: companion ---------------- */
  FW.PETS = table(`
No companion|75|none|You travel alone|
Loyal Hound|6|fgt+1|Never leaves your side
Raven|6|int+1|Scouts ahead and gossips
Stray Cat|6|fate+1|Brings luck, takes credit
Hunting Hawk|5|spd+1 wild:all+1|Eyes in the sky
Grey Wolf|5|fgt+1 dark:spd+1|Hunts beside you
War Horse|5|spd+1 urban:spd-1|Carries you into battle|Awkward in alleys
Old Owl|4|int+1 dark:int+1|Sees what you miss at night
Pocket Slime|4|dur+1 r=poison|Soaks up blows and spills
Cave Bear|3|str+1 dur+1 spd-1|A wall with claws|Slow to rouse
Fox Spirit|3|int+1 pwr+1|A second, slyer opinion
Imp Familiar|3|pwr+1 fate-1 a=fire|Helpful, technically|Lies for fun
Fairy Sprite|3|spd+1 pwr+1 w=metal|A tiny, loud guide
Clockwork Drone|3|int+1 wpn+1 w=lightning|Never misses a calculation
Mimic Chest|2.5|dur+1 fate+1|Carries your loot, eats thieves
Shadow Hound|2|fgt+1 dark:all+1 a=shadow|Runs inside your shadow
Griffin|1.5|spd+2 str+1 rt+1|A mount worthy of songs
Baby Dragon|1.2|str+1 pwr+1 r=fire a=fire rt+1|Small now|Expensive to feed
Phoenix Chick|1|fate+2 r=fire|Death is a short nap
Celestial Stag|0.8|all+1 holy:all+1|Walks on light
Void Cat|0.6|pwr+2 fate+1 void:all+1|Sits where reality is thin
`);

  /* ---------------- looks (mostly cosmetic; they feed the art prompt) ---------------- */
  FW.HAIR = table(`
Short black hair|10||
Long black hair|8||
Messy brown hair|9||
Braided brown hair|7||
Short blond hair|7||
Long golden hair|6||
Wild red hair|6||
Auburn ponytail|5||
Shaved head|5||
Long silver hair|4||
White hair in a topknot|4||
Grey-streaked hair|4|int+1|Earned every grey strand
Dark blue hair|3||
Emerald green hair|3||
Pink twin tails|2.5||
Lavender curls|2.5||
Ash-white undercut|3||
Dreadlocks with gold rings|3||
Hair like living flame|1|a=fire|It gives off real heat
Hair of drifting starlight|0.8|pwr+1|Tiny constellations move in it
Hair of flowing water|0.8|a=water|Never quite dry
`);
  FW.EYES = table(`
Brown eyes|10||
Dark eyes|9||
Blue eyes|8||
Green eyes|7||
Grey eyes|6||
Hazel eyes|6||
Amber eyes|4||
Violet eyes|3||
Red eyes|3||
Golden eyes|3||
Mismatched eyes, one blue and one gold|2||
Pale blind eyes that still see|1.5|int+1 dark:all+1|Sight without light
An eyepatch over one eye|3|fgt+1 spd-1|Learned to fight half-blind|No depth perception
Glowing white eyes|1.5|pwr+1|Power leaks out through them
Slit-pupiled serpent eyes|2|spd+1|Tracks the smallest movement
Eyes like a starry night sky|0.8|int+1 pwr+1|People forget what they were saying
`);
  FW.GARB = table(`
Travel-worn leather and a patched cloak|10||Looks like any wanderer
Simple peasant clothes|8|behind:all+1|Nobody sees you coming
Hooded dark cloak|7|dark:spd+1|Made for night work
Chainmail and a tabard|6|dur+1|Solid, honest protection
Heavy plate armour|4|dur+2 spd-1|A walking fortress|Loud and slow
Light scale armour|5|dur+1|Moves with you
Flowing mage robes|5|pwr+1 dur-1|Embroidered with wards|Protects against nothing sharp
Monk's wraps and prayer beads|4|fgt+1|Nothing to grab, nothing to slow you
Noble's embroidered coat|4|rt+1|Tailored to be remembered
Fur and bone tribal armour|4|str+1 ice:dur+1|Warm and intimidating
Sleek black assassin's garb|3|spd+1 dark:all+1 sun:all-1|Vanishes in shadow|Obvious at noon
Pirate coat and tricorn hat|3|spd+1 water:all+1|Sea-proof
Ragged bandages and chains|3|dur+1 behind:all+1|Has clearly survived worse
Ornate ceremonial armour|2.5|dur+1 rt+1 spd-1|Polished for parade|More gold than steel
Samurai armour|2.5|dur+1 wpn+1|Lacquered plates
Desert wraps and a veil|3|sun:all+1|Made for the heat
Clockwork exosuit|1.5|str+1 dur+1 w=lightning|Brass muscles|Needs winding
Armour grown from living crystal|1|dur+2 r=fire|Hums when struck
Robes woven from night sky|0.8|pwr+2 dark:all+1|The stars on it move
Radiant golden regalia|0.8|rt+2 holy:all+1|Hard to look at directly
`);
  /* races with no hair: the hair wheel is skipped */
  FW.HAIRLESS = ['Skeleton', 'Slime', 'Golem', 'Lizardfolk', 'Dragonborn', 'Leviathan', 'Eldritch Horror', 'Automaton', 'Gargoyle', 'Mycelid', 'Naga', 'Kobold', 'Elemental', 'Spirit', 'Voidling', 'Cosmic Entity', 'Primordial', 'Mothfolk', 'Lich', 'Reaper', 'Cyborg', 'Sphinx'];

  /* ---------------- art descriptions ---------------- */
  FW.RACE_ART = {
    'Human': 'human', 'Dwarf': 'stocky bearded dwarf', 'Orc': 'green-skinned orc with tusks', 'Goblin': 'small green goblin with long ears', 'Skeleton': 'animated skeleton with glowing eye sockets',
    'Beastkin': 'beastkin with animal ears and a tail', 'Lizardfolk': 'scaled lizardfolk with a reptilian head and tail', 'Elf': 'graceful elf with long pointed ears', 'Dark Elf': 'dark elf with ash-grey skin, white hair and pointed ears',
    'Fairy': 'tiny fairy with translucent insect wings', 'Mermaid': 'merfolk with a shimmering fish tail and fins', 'Slime': 'humanoid made of translucent gel', 'Golem': 'towering golem of carved stone with glowing runes',
    'Half-Giant': 'huge broad-shouldered half-giant', 'Vampire': 'pale vampire with fangs', 'Werewolf': 'werewolf, half human and half wolf, with fur and claws', 'Kitsune': 'kitsune with fox ears and several fox tails',
    'Oni': 'horned oni with red skin and tusks', 'Banshee': 'ghostly banshee with flowing spectral hair', 'Chimera': 'chimera-blooded hybrid with lion, goat and serpent features', 'Succubus': 'horned demon-kin with small bat wings and a tail',
    'Shadowborn': 'shadowborn being made of living shadow with glowing eyes', 'Phoenixkin': 'phoenixkin with feathers of flame along the arms', 'Demon': 'horned demon with dark wings', 'Dragonborn': 'dragonborn with a draconic head, scales and a tail',
    'Celestial': 'celestial being with skin of faint starlight', 'Angel': 'angel with large feathered wings and a halo', 'Spirit': 'translucent glowing spirit', 'Leviathan': 'colossal sea-titan with fins and scales',
    'Reaper': 'hooded reaper, a skeletal figure in tattered robes', 'Ghoul': 'gaunt grey-skinned ghoul', 'Cyborg': 'cyborg with exposed metal limbs and glowing implants', 'Mutant': 'mutant with asymmetric glowing growths',
    'Frost Giant': 'towering frost giant with blue skin and an icy beard', 'Titan': 'colossal ancient titan', 'Eldritch Horror': 'eldritch horror with tentacles and too many eyes', 'Cosmic Entity': 'cosmic entity whose body is a window onto galaxies',
    'Eternal': 'ageless eternal with calm, timeless features', 'God': 'radiant god wreathed in divine light',
    'Halfling': 'small cheerful halfling with curly hair and bare feet', 'Gnome': 'tiny gnome with a big nose and goggles', 'Kobold': 'small scaly kobold with a snout and horns', 'Ogre': 'hulking ogre with a heavy jaw',
    'Troll': 'lanky moss-skinned troll with a long nose', 'Centaur': 'centaur with a human torso on a horse body', 'Minotaur': 'bull-headed minotaur with great horns', 'Harpy': 'harpy with feathered wings for arms and taloned feet',
    'Satyr': 'satyr with goat legs and curled horns', 'Naga': 'naga with a human torso and a long serpent body', 'Dryad': 'dryad with bark-like skin and leaves growing from the body', 'Hellblood': 'person of infernal ancestry with curved horns and a slender tail',
    'Gargoyle': 'stone-skinned gargoyle with bat wings', 'Tengu': 'tengu with black crow wings and a beaked mask', 'Arachne': 'arachne with a human torso on a giant spider body', 'Yeti': 'huge white-furred yeti',
    'Automaton': 'brass clockwork automaton with visible gears', 'Mothfolk': 'mothfolk with fluffy antennae, large dark eyes and patterned moth wings', 'Mycelid': 'mushroom-folk with a wide fungal cap for a head', 'Changeling': 'pale changeling with blank white eyes and shifting features',
    'Revenant': 'revenant, an undead avenger with burning eyes and old wounds', 'Elemental': 'elemental, a humanoid body made entirely of raw element', 'Djinn': 'djinn whose lower body trails off into swirling smoke', 'Valkyrie': 'valkyrie with white wings and a winged helm',
    'Lich': 'lich, a skeletal archmage with a crown and glowing eyes', 'Nephilim': 'tall nephilim with a single pair of pale wings', 'Sphinx': 'sphinx with a human face, a lion body and wings', 'Starchild': 'starchild with softly glowing skin dotted with stars',
    'Voidling': 'voidling, a silhouette of pure darkness outlined in violet light', 'Primordial': 'primordial giant made of rock, storm and molten light'
  };
  FW.ART_STYLES = [
    { id: 'fantasy', name: 'Dark fantasy painting', text: 'epic dark-fantasy digital painting, dramatic rim lighting, rich colour, highly detailed, trading card illustration' },
    { id: 'anime', name: 'Anime', text: 'anime key visual, clean line art, cel shading, vivid colours, dynamic composition' },
    { id: 'realistic', name: 'Cinematic realism', text: 'cinematic photorealistic concept art, volumetric light, shallow depth of field, 85mm lens' },
    { id: 'comic', name: 'Comic book', text: 'western comic book cover art, bold ink outlines, halftone shading, strong colours' },
    { id: 'oil', name: 'Classical oil painting', text: 'classical oil painting, visible brushwork, chiaroscuro lighting, museum quality' },
    { id: 'storybook', name: 'Storybook watercolour', text: 'storybook watercolour illustration, soft washes, ink outlines, gentle palette' },
    { id: 'pixel', name: 'Pixel art', text: 'detailed 16-bit pixel art character portrait, limited palette, crisp pixels' },
    { id: 'ink', name: 'Black and white manga', text: 'black and white manga illustration, screentone shading, dramatic inking' }
  ];
  FW.ART_FRAMES = [
    { id: 'portrait', name: 'Portrait (waist up)', text: 'waist-up character portrait, facing the viewer' },
    { id: 'full', name: 'Full body', text: 'full-body character illustration, heroic stance, whole figure in frame' },
    { id: 'scene', name: 'Action scene', text: 'wide dynamic action scene, the character in the middle of the moment' }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
