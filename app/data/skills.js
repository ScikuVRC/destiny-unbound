/* Destiny Unbound content: Class, element, weapons, enhancements and powers.
   Pure data: no game logic lives here. Rows in FW.table(`...`) read Name|weight|effects|perk|flaw;
   see app/data/README.md for the effect codes. Order matters: Legend Codes and seeds refer to it. */
(function (g) {
  const FW = g.FW;

  FW.CLASSES = FW.table(`
Commoner|10|behind:all+1 fate+1|No training, plenty of nerve|No training at all
Warrior|8|fgt+1 str+1|Front-line fighter|
Knight|6|dur+1 wpn+1|Armoured oath-keeper|
Rogue|7|spd+1 int+1 dur-1|Shadows and shortcuts|Lightly protected
Ranger|6|spd+1 wpn+1 wild:all+1|Wilderness scout|
Mage|6|pwr+1 int+1 str-1|Student of the arcane|Bookish build
Cleric|5|dur+1 int+1 holy:all+1|Faith as a shield|
Monk|5|fgt+2 wpn-1|The body is the weapon|Distrusts steel
Berserker|4|str+2 int-1 behind:str+1|Rage as a strategy|Forgets the plan
Paladin|3|fgt+1 dur+1 holy:all+1 w=shadow|Holy champion|Shadow tests the vow
Assassin|4|spd+1 fgt+1 dark:all+1|One strike, from behind|
Bard|5|int+1 fate+1|Stories, songs and suspicious luck|
Druid|4|pwr+1 wild:all+1 urban:all-1|Speaks for the wild|Ill at ease among walls
Necromancer|3|pwr+1 int+1 dark:all+1 w=holy|Commands the dead|Holy light scatters the work
Warlock|3|pwr+2 fate-1|Power on loan|The patron will collect
Summoner|3|pwr+1 int+1 dur-1|Never fights alone|Fragile alone
Samurai|3|wpn+2 fgt+1 ahead:all-1|One perfect cut|Honour slows the finish
Gunslinger|3|spd+1 wpn+1 int+1 fgt-1|Fastest draw|Poor in a brawl
Alchemist|4|int+2 str-1|Bottled solutions|Needs preparation
Beastmaster|4|str+1 spd+1 wild:all+1|Fights beside claws|
Tactician|3|int+2 fgt+1 str-1|Wins before the fight starts|Not a brawler
Spellblade|2.5|wpn+1 pwr+1 fgt+1|Steel in one hand, fire in the other|
Pirate|4|spd+1 fgt+1 water:all+1|No rules on the water|
Blacksmith|4|str+1 dur+1 wpn+1 spd-1|Knows every weapon's weak point|Heavy arms, slow feet
Dancer|3|spd+2 str-1|Every dodge is choreography|
Chosen One|0.8|all+1 fate+1 rt+2|The prophecy has your name on it|So does every villain
Archer|5|wpn+1 spd+1|Eyes on the target|
Brawler|5|str+1 fgt+1 wpn-1|Fists first, questions never|Clumsy with weapons
Merchant|5|int+1 fate+1 fgt-1|Can buy a way out|Not a fighter
Gladiator|4|str+1 fgt+1 rt+1|Fights for the crowd|
Duelist|4|fgt+1 spd+1 wpn+1 dur-1|One opponent at a time|Lightly armoured
Healer|4|dur+1 int+1 fate+1 fgt-1|Keeps everyone standing|Hates to hurt anyone
Witch|4|pwr+1 int+1 dark:all+1|Hexes and herbs|
Sorcerer|4|pwr+2 dur-1|Born with magic|Fragile body
Shaman|4|pwr+1 int+1 storm:all+1|Speaks with spirits|
Engineer|4|int+2 wpn+1 fgt-1|Builds the solution|Bad at close quarters
Ninja|3|spd+2 fgt+1 dark:all+1 dur-1|Unseen until it is too late|No armour
Templar|3|dur+1 fgt+1 holy:all+1|Sword of the faith|
Monster Hunter|3|wpn+1 fgt+1 dark:all+1|Knows what goes bump in the night|
Illusionist|3|int+1 pwr+1 a=mind|Nothing is what it seems|
Runesmith|3|wpn+1 pwr+1 int+1 spd-1|Carves power into steel|Slow to prepare
Hexblade|2|wpn+1 pwr+1 a=shadow fate-1|A cursed weapon chose you|The curse is hungry
Dragon Rider|1|spd+1 str+1 rt+2 r=fire|Rides a dragon into battle|
Chronomancer|1|spd+1 pwr+2 a=time|Bends seconds|
Hero of Legend|0.5|all+1 pwr+1 rt+2|Songs are already being written|
`);

  FW.ELEMENTS = FW.table(`
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
Storm|2.5|spd+1 a=lightning storm:all+2 w=nature|Thunder and gale together|Grounded by roots
Magma|2|str+1 a=fire r=fire w=water fire:all+1|Molten rock|Cooled by water
Crystal|2|dur+1 a=metal r=fire w=sound|Hard and bright|Shatters at the right note
Acid|2|a=poison r=poison w=water|Eats through armour|Diluted by water
Spirit|1.5|int+1 pwr+1 a=mind r=poison w=holy|Soul-fire|Holy rites banish it
Moon|1.5|pwr+1 dark:all+2 a=shadow w=fire|Silver and silent|Burned by flame
Star|1|pwr+1 a=holy,fire void:all+1|Light from a distant sun|
Gravity|0.8|str+1 pwr+1 a=void|Everything falls toward you|
`);

  FW.WEAPONS = FW.table(`
No weapon|140|none|Bare-handed: Fighting skills counts for more|
Dagger|5|q=1|Quick and concealable|
Shortsword|5|q=1|Reliable sidearm|
Mace|4|q=1|Armour-crusher|
Spear|5|q=2|Reach and control|
Axe|5|q=2|Heavy chopper|
Bow|5|q=2|Ranged precision|
Crossbow|4|q=2|Armour-piercing bolt|
Rapier|3|q=2|Duelist's point|
Whip|3|q=2|Disarming lash|
Twin Daggers|4|q=2|Flurry of cuts|
Throwing Knives|4|q=2|Ranged volley|
Staff|4|q=2 a=nature|Arcane focus|
Dual Swords|4|q=3|Two blades, twice the pressure|
Katana|4|q=3|Razor-sharp curved blade|
Saber|4|q=3|Cavalry cut|
Claymore|3.5|q=3|One of the coolest swords|
Greatsword|3.5|q=3|Heavy two-hander|
Warhammer|3.5|q=3|Skull-cracker|
Halberd|3|q=3|Polearm|
Trident|3|q=3 a=water|Sea-king's spear|
Scythe|3|q=3|Reaper's tool|
Chain Sickle|3|q=3|Chained blade|
Gauntlets|3|q=3|Steel fists|
Sword and Shield|4|q=3|Balanced defence|
Arcane Tome|2|q=3 a=mind|Spell compendium|
Cursed Blade|2|q=4 a=shadow|Hungry for souls|
Holy Lance|2|q=4 a=holy|Blessed spear|
Frostbrand|2|q=4 a=ice|Rime-edged sword|
Flame Tongue|2|q=4 a=fire|Burning blade|
Stormcaller Spear|2|q=4 a=lightning|Thunder-spear|
Venomfang|2|q=4 a=poison|Dripping dagger|
Soul Reaver|0.8|q=5 a=void|Devours spirits|
Dragonbone Greatsword|0.8|q=5 a=fire|Forged from a wyrm|
Starforged Blade|0.6|q=5 a=holy|Metal from a fallen star|
Worldsplitter|0.3|q=5 a=void|Said to cleave continents|
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
Club|4|q=1|Simple and honest|
Hatchet|4|q=1|Chops wood and problems|
Brass Knuckles|4|q=1|Punches with interest|
Pitchfork|3|q=1|A farmer's last resort|
Javelin|4|q=2|Thrown with intent|
Morning Star|3|q=2|Spikes on a stick|
Kukri|3|q=2|Curved, forward-weighted blade|
Blowgun|2.5|q=2 a=poison|Silent darts|
Lance|3|q=3|Made for the charge|
Zweihander|3|q=3|A two-handed giant of a sword|
Khopesh|2.5|q=3|Sickle-sword of the desert|
Odachi|2.5|q=3|A blade longer than you are|
Harpoon|2.5|q=3 a=water|Hooked and roped|
Meteor Hammer|2|q=3|Weights on a long rope|
Musket|2.5|q=3|Slow to load, loud to fire|
Spellgun|1.5|q=4 a=lightning|Fires bottled lightning|
Plague Censer|1.5|q=4 a=poison|Swings a cloud of sickness|
Winter's Bow|1.5|q=4 a=ice|Arrows of frozen air|
Blood Sickle|1.5|q=4 a=blood|Drinks what it cuts|
Thunder Gauntlets|1.5|q=4 a=lightning|Every punch is a storm|
Mirror Shield|1.2|q=4 a=holy|Returns spells to the sender|
Gravity Hammer|1.2|q=4|Lands with the weight of a mountain|
Phoenix Bow|0.5|q=5 a=fire|Its arrows are reborn after every shot|
Abyssal Trident|0.5|q=5 a=void,water|Pulled from the bottom of the world|
Kingmaker Sword|0.4|q=5 a=holy|Whoever holds it is obeyed|
Worldtree Staff|0.4|q=5 a=nature|Cut from the tree that holds up the sky|
Comet Cannon|0.3|q=5 a=fire,void|Fires a falling star|
`);

  FW.NATURAL_WEAPONS = [
    'Orc',
    'Beastkin',
    'Werewolf',
    'Dragonborn',
    'Lizardfolk',
    'Oni',
    'Ghoul',
    'Chimera',
    'Leviathan',
    'Vampire',
    'Ogre',
    'Troll',
    'Minotaur',
    'Harpy',
    'Naga',
    'Arachne',
    'Yeti',
    'Gargoyle',
    'Sphinx',
    'Centaur',
    'Kobold',
    'Gnoll',
    'Bearfolk',
    'Sharkfolk',
    'Owlfolk',
    'Zombie',
    'Wendigo',
    'Treant',
    'Behemoth',
    'Thunderbird',
  ];

  FW.AFFINITY = {
    Dwarf: ['Axe', 'Warhammer', 'Mace'],
    Orc: ['Axe', 'Greatsword', 'Claymore', 'Warhammer'],
    Elf: ['Bow', 'Rapier', 'Saber'],
    'Dark Elf': ['Twin Daggers', 'Crossbow', 'Dual Swords'],
    Skeleton: ['Scythe', 'Spear'],
    Reaper: ['Scythe', 'Soul Reaver'],
    Goblin: ['Dagger', 'Throwing Knives', 'Crossbow'],
    Beastkin: ['Spear', 'Whip'],
    Angel: ['Holy Lance', 'Claymore', 'Saber', 'Starforged Blade'],
    Demon: ['Cursed Blade', 'Flame Tongue', 'Chain Sickle'],
    Mermaid: ['Trident', 'Tidecaller Glaive'],
    'Frost Giant': ['Frostbrand', 'Warhammer'],
    Dragonborn: ['Dragonbone Greatsword', 'Greatsword'],
    Vampire: ['Rapier', 'Cursed Blade'],
    Kitsune: ['Katana', 'Arcane Tome'],
    Oni: ['Mace', 'Warhammer'],
    Halfling: ['Sling', 'Dagger', 'Throwing Knives'],
    Gnome: ['Crossbow', 'Flintlock Pistol', 'Hand Cannon'],
    Kobold: ['Sling', 'Spear', 'Dagger'],
    Ogre: ['Mace', 'Warhammer', 'Flail'],
    Troll: ['Mace', 'Flail'],
    Centaur: ['Bow', 'Great Bow', 'Spear', 'Glaive'],
    Minotaur: ['Axe', 'Warhammer', 'Halberd'],
    Harpy: ['Throwing Knives', 'Chakram'],
    Satyr: ['Battle Harp', 'Spear'],
    Naga: ['Trident', 'Glaive', 'Venomfang'],
    Dryad: ['Thornwhip', 'Staff', 'Bow'],
    Tengu: ['Katana', 'War Fan', 'Glaive'],
    Arachne: ['Puppet Strings', 'Twin Daggers', 'Venomfang'],
    Yeti: ['Frostbrand', 'Mace'],
    Valkyrie: ['Holy Lance', 'Spear', 'Sword and Shield'],
    Lich: ['Staff', 'Arcane Tome', 'Scythe'],
    Djinn: ['Saber', 'Chakram'],
    Revenant: ['Greatsword', 'Cursed Blade'],
    Nephilim: ['Starforged Blade', 'Greatsword'],
    Mothfolk: ['Moonblade', 'War Fan'],
    Voidling: ['Soul Reaver', 'Moonblade'],
    Ratfolk: ['Dagger', 'Sling', 'Blowgun'],
    Hobgoblin: ['Spear', 'Sword and Shield', 'Shortsword'],
    Gnoll: ['Flail', 'Spear', 'Axe'],
    Frogfolk: ['Spear', 'Blowgun', 'Whip'],
    Bearfolk: ['Axe', 'Warhammer', 'Gauntlets'],
    Sharkfolk: ['Trident', 'Harpoon', 'Tidecaller Glaive'],
    Cyclops: ['Warhammer', 'Gravity Hammer', 'Hand Cannon'],
    Mummy: ['Khopesh', 'Scythe', 'Cursed Blade'],
    Dullahan: ['Scythe', 'Whip', 'Lance'],
    Android: ['Flintlock Pistol', 'Spellgun', 'Hand Cannon'],
    Salamanderkin: ['Flame Tongue', 'Spear'],
    Lightborn: ['Holy Lance', 'Mirror Shield'],
    Treant: ['Worldtree Staff', 'Club'],
    Demigod: ['Godslayer Spear', 'Kingmaker Sword', 'Claymore'],
    Wendigo: ["Winter's Bow", 'Frostbrand'],
    Undine: ['Trident', 'Harpoon'],
    Gorgon: ['Bow', 'Venomfang'],
    Zombie: ['Pitchfork', 'Club'],
    Thunderbird: ['Thunder Gauntlets', 'Stormcaller Spear'],
  };

  FW.ENHANCEMENTS = FW.table(`
No enhancement|105|none|Raw talent only|
Beast Mode|6|str+2 dur+1 int-1|Primal power|Mind clouded by instinct
Iron Skin|6|dur+2 spd-1|Hardened flesh|Heavy steps
Berserk Mode|5|str+2 spd+1 int-2 behind:all+1|Rage surge|Reckless
Overdrive|5|spd+2 fgt+1 dur-1|Accelerated body|Burns out fast
Shadow Cloak|5|spd+1 dark:all+1 a=shadow|Wrapped in night|
Primal Instinct|5|spd+1 fgt+1 int-1|Hunter's reflexes|
Hyper Focus|4|int+2 fgt+1 spd-1|Slows time for the mind|
Sage Mode|4|int+2 pwr+1 spd-1|Calm power|Slow to start
Blood Frenzy|4|str+2 fgt+1 dur-1 w=blood|Bloodlust|Bleeds out quickly
Monster Form|4|str+2 dur+1 int-2|Unleashed beast|Barely rational
Warrior's Trance|4|fgt+2 int-1|Battle-meditation|
Demon Form|3|str+1 pwr+1 fgt+1 w=holy a=shadow|Infernal transformation|Holy light hurts
Angel Form|3|spd+1 pwr+1 fgt+1 w=shadow a=holy|Radiant transformation|Shadow hurts
Dragon Form|3|str+2 dur+2 spd-1 a=fire|Draconic transformation|
Elemental Overload|3|pwr+2 dur-1 a=fire|Power surge|Body strains
Limit Break|3|all+2 pwr+1 rt-2|Overcharge|Burnout when the fight drags on
Stone Form|3|dur+3 spd-2|Living rock|
Phantom Step|3|spd+2 dur-1|Blur of motion|
Titan Form|2|str+3 dur+2 spd-2|Grows to great size|
Thunderstep|2|spd+3 dur-1 a=lightning w=water|Lightning velocity|
Solar Surge|2|str+1 pwr+1 sun:all+2 dark:all-1|Sun-fuelled|Fades at night
Lunar Surge|2|spd+1 pwr+1 dark:all+2 sun:all-1|Moon-fuelled|Fades by day
True Potential|2|fgt+2 wpn+1 pwr+1|Everything clicks|
Awakened State|2|all+1 pwr+1|Latent power wakes|
Void Mantle|1.5|pwr+2 dur+1 a=void w=holy|Cloak of nothing|
Ascended Form|1|all+2 pwr+2|True form|
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
Eagle Eye|5|wpn+1 int+1|Never misses|
Bulwark Stance|5|dur+2 spd-1|Plants like a wall|Hard to move, even for you
Feral Shift|4|spd+2 fgt+1 int-1|Claws out|Forgets the plan
Mirror Image|3|spd+1 int+1|Which one is real?|
Spirit Link|3|int+1 pwr+1 fate+1|Ancestors fight beside you|
Venom Glands|3|fgt+1 a=poison r=poison|Every hit stings|
Thorn Skin|3|dur+1 a=nature w=fire|Hurts to touch|Dry thorns burn
Bone Armour|3|dur+2 w=holy|Ribs grown into a shell|Holy light cracks it
Ki Overflow|3|fgt+2 pwr+1 dur-1|Energy pours out of every strike|Leaves you drained
Tidal Form|2.5|spd+1 water:all+2 a=water w=lightning|Becomes the wave|
Plague Bearer|2|dur+1 int-1 a=poison r=poison|Sickness walks with you|
Sunfire Halo|2|pwr+1 sun:all+1 holy:all+1 a=holy|A crown of burning light|
Blood Moon Form|2|str+2 pwr+1 dark:all+2 sun:all-2|Red moon rising|Useless by day
Mecha Suit|2|str+2 dur+2 spd-1 w=lightning|Steel shell with a pilot inside|Short-circuits
Celestial Body|1|all+2 a=holy w=void|Skin of starlight|
Godhood Fragment|0.6|all+2 pwr+2 fate+1|A shard of a dead god inside you|
`);

  FW.POWER_BASE = { 1: 5, 2: 3.2, 3: 2, 4: 1.1, 5: 0.45, 6: 0.1 };

  FW.POWERS = FW.table(`
No powers|40|none|Mundane - relies on skill and steel|
Enhanced Senses|5|rar=1||
Quick Reflexes|5|rar=1||
Night Vision|5|rar=1||
Minor Telekinesis|5|rar=1||
Animal Empathy|5|rar=1||
Light Healing|5|rar=1||
Camouflage|5|rar=1||
Poison Resistance|5|rar=1||
Fire Resistance|5|rar=1||
Ice Resistance|5|rar=1||
Lightning Resistance|5|rar=1||
Weapon Imbuement|5|rar=1||
Spirit Reinforcement|5|rar=1||
Echolocation|5|rar=1||
Plant Manipulation|3.2|rar=2 a=nature||
Fire Manipulation|3.2|rar=2 a=fire||
Water Manipulation|3.2|rar=2 a=water||
Wind Manipulation|3.2|rar=2||
Earth Manipulation|3.2|rar=2||
Lightning Manipulation|3.2|rar=2 a=lightning||
Ice Manipulation|3.2|rar=2 a=ice||
Poison Manipulation|3.2|rar=2 a=poison||
Bone Manipulation|3.2|rar=2||
Crystal Manipulation|3.2|rar=2||
Metal Manipulation|3.2|rar=2 a=metal||
Temperature Manipulation|3.2|rar=2||
Sound Manipulation|3.2|rar=2||
Shadow Manipulation|3.2|rar=2 a=shadow||
Light Manipulation|3.2|rar=2 a=holy||
Blood Manipulation|3.2|rar=2 a=blood||
Regeneration|3.2|rar=2||
Regrowth|3.2|rar=2||
Flight|3.2|rar=2||
Telepathy|3.2|rar=2 a=mind||
Summoning|3.2|rar=2||
Weapon Summoning|3.2|rar=2||
Illusion Casting|3.2|rar=2 a=mind||
Rage Boost|3.2|rar=2||
Beast Transformation|3.2|rar=2||
Mana Control|3.2|rar=2||
Aura Manipulation|3.2|rar=2||
Emotion Manipulation|3.2|rar=2 a=mind||
Mind Manipulation|2|rar=3 a=mind||
Memory Manipulation|2|rar=3 a=mind||
Dream Manipulation|2|rar=3 a=mind||
Nightmare Manipulation|2|rar=3 a=mind||
Gravity Manipulation|2|rar=3||
Spirit Manipulation|2|rar=3||
Curse Manipulation|2|rar=3 a=shadow||
Absorption|2|rar=3||
Reversal|2|rar=3||
Counter Attack|2|rar=3||
Trickery|2|rar=3||
Duplication|2|rar=3||
Cloning|2|rar=3||
Phasing|2|rar=3||
Intangibility|2|rar=3||
Teleportation|2|rar=3||
Precognition|2|rar=3||
Dragon Form|2|rar=3 a=fire||
Angel Form|2|rar=3 a=holy||
Demon Form|2|rar=3 a=shadow||
Seal Breaking|2|rar=3||
Soul Breaking|2|rar=3 a=void||
Celestial Blessing|2|rar=3 a=holy||
Probability Manipulation|1.1|rar=4||
Luck Manipulation|1.1|rar=4||
Portal Creation|1.1|rar=4||
Time Skip|1.1|rar=4 a=time||
Immortality|1.1|rar=4||
Resurrection|1.1|rar=4||
Matter Manipulation|1.1|rar=4||
Energy Manipulation|1.1|rar=4||
Space Manipulation|1.1|rar=4||
Void Manipulation|1.1|rar=4 a=void||
Dimensional Travel|1.1|rar=4||
Soul Manipulation|1.1|rar=4 a=void||
Reality Distortion|1.1|rar=4||
Fate Manipulation|0.45|rar=5||
Time Stop|0.45|rar=5 a=time||
Time Manipulation|0.45|rar=5 a=time||
Absolute Defense|0.45|rar=5||
Absolute Offense|0.45|rar=5||
Concept Manipulation|0.45|rar=5||
Omnipotence|0.1|rar=6||
Reality Warping|0.1|rar=6||
Creation and Destruction|0.1|rar=6||
Iron Stomach|5|rar=1||
Perfect Balance|5|rar=1||
Danger Sense|5|rar=1||
Beast Speech|5|rar=1||
Minor Illusions|5|rar=1 a=mind||
Spark Touch|5|rar=1 a=lightning||
Frost Breath|5|rar=1 a=ice||
Sand Manipulation|3.2|rar=2||
Smoke Manipulation|3.2|rar=2||
Ink Manipulation|3.2|rar=2||
Thread Manipulation|3.2|rar=2||
Glass Manipulation|3.2|rar=2||
Magnetism|3.2|rar=2 a=metal||
Acid Spit|3.2|rar=2 a=poison||
Thorn Growth|3.2|rar=2 a=nature||
Mist Form|3.2|rar=2||
Echo Clones|3.2|rar=2||
Paper Charms|3.2|rar=2||
Moonlight Weaving|3.2|rar=2 a=shadow||
Puppetry|2|rar=3 a=mind||
Rune Writing|2|rar=3||
Shapeshifting|2|rar=3||
Necromancy|2|rar=3 a=shadow||
Storm Calling|2|rar=3 a=lightning||
Glacier Calling|2|rar=3 a=ice||
Solar Flare|2|rar=3 a=holy||
Blood Pact|2|rar=3 a=blood||
Shadow Stitching|2|rar=3 a=shadow||
Size Shifting|2|rar=3||
Pocket Dimension|2|rar=3||
Weather Dominion|1.1|rar=4 a=lightning||
Star Calling|1.1|rar=4 a=holy||
Life Drain|1.1|rar=4 a=blood||
Mirror World|1.1|rar=4||
Law Binding|1.1|rar=4||
Dream Walking|1.1|rar=4 a=mind||
Black Flame|1.1|rar=4 a=void||
Causality Manipulation|0.45|rar=5 a=time||
Authority|0.45|rar=5||
Erasure|0.45|rar=5 a=void||
Miracle Working|0.45|rar=5 a=holy||
Narrative Control|0.1|rar=6||
Infinity|0.1|rar=6||
Water Breathing|5|rar=1 a=water||
Wall Crawling|5|rar=1||
Pain Tolerance|5|rar=1||
Photographic Memory|5|rar=1||
Voice Mimicry|5|rar=1||
Pathfinding|5|rar=1||
Green Thumb|5|rar=1 a=nature||
Static Charge|5|rar=1 a=lightning||
Cold Touch|5|rar=1 a=ice||
Lucky Guess|5|rar=1||
Heat Vision|3.2|rar=2 a=fire||
Super Jump|3.2|rar=2||
Elasticity|3.2|rar=2||
Invisibility|3.2|rar=2||
Sonic Scream|3.2|rar=2 a=sound||
Insect Swarm|3.2|rar=2 a=poison||
Spider Silk|3.2|rar=2||
Darkness Generation|3.2|rar=2 a=shadow||
Healing Touch|3.2|rar=2||
Force Field|3.2|rar=2||
Wood Manipulation|3.2|rar=2 a=nature||
Lava Manipulation|3.2|rar=2 a=fire||
Steel Skin|3.2|rar=2 a=metal||
Super Speed|2|rar=3||
Power Mimicry|2|rar=3||
Petrification|2|rar=3||
Astral Projection|2|rar=3 a=mind||
Possession|2|rar=3 a=mind||
Dragon Summoning|2|rar=3 a=fire||
Plague Spreading|2|rar=3 a=poison||
Ice Age|2|rar=3 a=ice||
Earthquake Generation|2|rar=3||
Elemental Fusion|2|rar=3||
Antimatter|1.1|rar=4 a=void||
Star Forging|1.1|rar=4 a=holy||
Planar Shifting|1.1|rar=4||
Undying Flame|1.1|rar=4 a=fire||
Gravity Well|1.1|rar=4||
Soul Forging|1.1|rar=4 a=void||
Rewind|0.45|rar=5 a=time||
Death Touch|0.45|rar=5 a=void||
Absolute Zero|0.45|rar=5 a=ice||
Wish Granting|0.45|rar=5||
Multiverse Travel|0.45|rar=5||
Beyond Existence|0.1|rar=6 a=void||
True Omniscience|0.1|rar=6 a=mind||
`);
})(typeof window !== 'undefined' ? window : globalThis);
