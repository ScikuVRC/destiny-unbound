/* FATEWHEEL content pack 2: a finer age wheel and more entries for every wheel.
   Loaded after data-more.js, before engine.js. Old names are kept (or aliased) so old Legend Codes still load. */
(function (g) {
  const FW = g.FW, table = FW.table;
  const add = (list, text) => table(text).forEach(r => list.push(r));

  /* ---------------- age (rebuilt: 25 slices, ordered youngest to oldest) ----------------
     Columns after the usual row: min years, max years ('' = no number shown), lifespan needed (s m l a), art word.
     A short-lived race (life=s) only sees the 's' rows, a long-lived one sees s+m+l, ageless ones see all. */
  const AGE_ROWS = `
Teen (13-17)|8|spd+1 int-1 fate+1|Quick to learn, quicker to act|Untested|13|17|s|teenage
Young adult (18-24)|14|spd+1|In your physical prime|Short on experience|18|24|s|young adult
Adult (25-32)|16||Prime of life||25|32|s|adult
Seasoned adult (33-40)|12|fgt+1|Knows a few dirty tricks||33|40|s|adult, a few lines of experience on the face
Middle-aged (41-50)|10|fgt+1 spd-1|Battle-seasoned|Slowing down|41|50|s|middle-aged
Grizzled (51-60)|8|fgt+1 wpn+1 spd-1|Scarred veteran of many wars|Knees complain|51|60|s|grizzled, weathered and scarred
Elder (61-75)|6|int+1 wpn+1 str-1 spd-1|Wise veteran|Aching bones|61|75|s|elderly
Venerable (76-100)|4|int+2 wpn+1 str-1 spd-1 dur-1|Has outlived every rival|Brittle bones|76|100|s|very old, white-haired and wrinkled
Impossibly old (101-130)|1.2|int+2 wpn+1 str-2 spd-1 fate+1|Should not still be alive|Held together by spite|101|130|s|impossibly old and frail-looking
Long-lived (131-299)|5|int+1 wpn+1|Has watched empires change||131|299|m|ageless face with old, knowing eyes
Centuries old|5|int+1 wpn+1 fgt+1|Centuries of practice||300|999|m|ageless, with centuries in their eyes
Reincarnated soul|1.5|int+1 fate+1|Remembers past lives|Haunted by old deaths|||m|young-looking with ancient eyes
Millennia old|3.5|int+2 pwr+1|Ancient memory||1000|9999|l|ancient, ageless
Ten thousand years|2|int+2 pwr+1 wpn+1|Remembers lost civilisations||10000|99999|l|ancient, ageless, with an air of lost ages
Frozen in time|1.2|int+1 dur+1|Has not aged a day since the curse|Time forgot you|||l|young-looking but subtly out of time
Older than recorded history|1.4|int+2 pwr+2|Was there before the first writing||100000|999999|l|primeval, ageless
As old as the gods|0.9|int+2 pwr+2 fate+1|Drank with the first gods||1000000|99999999|a|primeval, godlike agelessness
Older than Earth|1.2|int+2 pwr+2|Remembers the first dawn||||a|ancient, ageless
Older than the Moon|0.7|int+2 pwr+2 dark:all+1|Saw the Moon being born||||a|ancient, ageless, moonlit
Older than the Solar System|0.6|int+2 pwr+2 fgt+1|Remembers the first stars||||a|ancient, ageless
Older than the Galaxy|0.3|int+3 pwr+3|Witness of creation||||a|ancient, ageless, cosmic
Older than the Universe|0.1|int+3 pwr+3 fgt+2|Was here before there was a here||||a|beyond age, cosmic
Older than Time itself|0.05|int+3 pwr+3 fgt+2 fate+1|Time is younger than you||||a|beyond age, cosmic, outside time
`;
  const order = { s: 0, m: 1, l: 2, a: 3 };
  FW.AGES = []; FW.AGE_RANGES = []; FW.AGE_WORDS = [];
  AGE_ROWS.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
    const f = line.split('|');
    FW.AGES.push({ name: f[0], w: parseFloat(f[1]), dsl: f[2] || '', perk: f[3] || '', flaw: f[4] || '', life: f[7] });
    FW.AGE_RANGES.push(f[5] && f[6] ? [parseInt(f[5], 10), parseInt(f[6], 10)] : null);
    FW.AGE_WORDS.push(f[8] || '');
  });
  // the wheel shows the first N rows for each lifespan, so rows must stay grouped by lifespan
  FW.AGE_LIMIT = { s: 0, m: 0, l: 0, a: 0 };
  FW.AGES.forEach(r => Object.keys(FW.AGE_LIMIT).forEach(k => { if (order[r.life] <= order[k]) FW.AGE_LIMIT[k]++; }));
  // names used before this pack, so old Legend Codes still load
  FW.AGE_ALIAS = { 'Young (0-20)': 'Young adult (18-24)', 'Adult (21-40)': 'Adult (25-32)', 'Middle-aged (41-60)': 'Middle-aged (41-50)', 'Senior (61-100)': 'Elder (61-75)' };

  /* ---------------- stat ladders: more tiers ----------------
     Every old tier name is kept, in the same order, so old Legend Codes are remapped by name (FW.LADDER_V1).
     peak: the tier most rolls land around (same tier as before). */
  const mastery = ['Untrained', 'Learner', 'Novice', 'Initiate', 'Apprentice', 'Adept', 'Skilled', 'Proficient', 'Pro', 'Veteran', 'Elite', 'Specialist', 'Expert', 'Master', 'High master', 'Grandmaster', 'Sage', 'Legendary', 'Mythical', 'Ascendant', 'Awakened', 'Divine', 'Transcendent', 'Supreme', 'Absolute', 'Eternal', 'Origin'];
  const LADDER_V2 = {
    str: { peak: 'Peak human', names: ['Feeble', 'Frail', 'Weak', 'Below average', 'Average', 'Fit', 'Trained', 'Above average', 'Strong', 'Very strong', 'Athlete', 'Peak human', 'Superhuman', 'Street level', 'Wall level', 'Small building level', 'Building level', 'Large building level', 'Block level', 'Multi-block level', 'Town level', 'Large town level', 'City level', 'Multi-city level', 'Mountain level', 'Island level', 'Country level', 'Continent level', 'Moon level', 'Planet level', 'Star level', 'Large star level', 'Solar system level', 'Galaxy level', 'Multi-galaxy level', 'Universal level', 'High universal level', 'Multiversal level', 'Outerversal level', 'Godly', 'Beyond godly', 'Boundless'] },
    spd: { peak: 'Elite runner', names: ['Sluggish', 'Very slow', 'Slow', 'Below average', 'Average human', 'Above average human', 'Athletic human', 'Elite runner', 'Peak human', 'Superhuman', 'Combat speed', 'Subsonic', 'Subsonic+', 'Transonic', 'Supersonic', 'Supersonic+', 'Hypersonic', 'Hypersonic+', 'High hypersonic', 'Massively hypersonic', 'Massively hypersonic+', 'Sub-relativistic', 'Sub-relativistic+', 'Relativistic', 'Relativistic+', 'Speed of light', 'FTL', 'FTL+', 'Massively FTL', 'Massively FTL+', 'Infinite speed', 'Immeasurable', 'Beyond time'] },
    dur: { peak: 'Very resilient', names: ['Paper-thin', 'Fragile', 'Delicate', 'Below average', 'Average', 'Sturdy', 'Tough', 'Resilient', 'Very resilient', 'Hardened', 'Iron body', 'Steel body', 'Diamond body', 'Wall level', 'Small building level', 'Building level', 'Large building level', 'Block level', 'Multi-block level', 'Town level', 'Large town level', 'City level', 'Multi-city level', 'Mountain level', 'Island level', 'Country level', 'Continent level', 'Moon level', 'Planet level', 'Star level', 'Large star level', 'Solar system level', 'Galaxy level', 'Multi-galaxy level', 'Universal level', 'Multiversal level', 'Outerversal level', 'Near-immortal', 'Undying', 'Conceptually immortal', 'Invincible', 'Absolute durability'] },
    int: { peak: 'Average', names: ['Mindless', 'Very dumb', 'Dumb', 'Simple-minded', 'Below average', 'Slightly below average', 'Average', 'Slightly above average', 'Above average', 'Clever', 'Smart', 'Very smart', 'Gifted', 'Genius', 'Battle genius', 'Extraordinary genius', 'Supergenius', 'Peak human mind', 'Superhuman mind', 'Planetary intellect', 'Stellar intellect', 'Galactic intellect', 'Cosmic intellect', 'Universal intellect', 'Multiversal intellect', 'Near-omniscient', 'Omniscient', 'Beyond knowing'] },
    wpn: { peak: 'Pro', names: mastery },
    pwr: { peak: 'Pro', names: mastery.slice() },
    fgt: { peak: 'Above average', names: ['Never fought', 'Clumsy', 'Scrappy', 'Average minus', 'Average', 'Average plus', 'Slightly above average', 'Above average', 'Competent', 'Skilled', 'Well-trained', 'Experienced', 'Battle-hardened', 'Advanced', 'Strong', 'Very strong', 'Elite', 'High elite', 'Prodigy', 'Master', 'Martial saint', 'Grandmaster', 'Legendary', 'Mythical', 'Godlike', 'Transcendent', 'Supreme', 'Absolute', 'Beyond mortal reckoning'] }
  };
  FW.LADDER_V1 = {};
  Object.keys(LADDER_V2).forEach(s => {
    const L = FW.LADDERS[s], n = LADDER_V2[s];
    FW.LADDER_V1[s] = L.names.slice();
    // same fall-off per share of the ladder as the shorter list had
    L.decay = Math.pow(0.8, (FW.LADDER_V1[s].length - 1) / (n.names.length - 1));
    L.names = n.names; L.pk = n.names.indexOf(n.peak);
  });
  FW.LADDER_VERSION = 2;

  /* ---------------- height: more steps on the wheel ---------------- */
  [30, 50, 58, 62, 64, 65, 67, 69, 71, 73, 75, 82, 86, 100, 132, 168].forEach(h => { if (FW.HEIGHTS.indexOf(h) < 0) FW.HEIGHTS.push(h); });
  FW.HEIGHTS.sort((a, b) => a - b);

  /* ---------------- races ---------------- */
  add(FW.RACES, `
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

  /* ---------------- sub-wheels: new ones ---------------- */
  Object.assign(FW.SUBS, {
    'Werewolf': { title: 'What is your place in the pack?', emoji: '🐺', label: 'PACK RANK', rows: table(`
Omega|10|behind:all+1|Bullied, and stronger for it
Lone Wolf|9|fgt+1|Hunts alone
Pack Hunter|9|spd+1|Never the only wolf in the fight
Beta|6|str+1 fgt+1|Second in command
Alpha|3|str+1 fgt+1 rt+1|Leads the pack
Moon-cursed|2|str+2 dark:all+1 int-1|Turns every night|Never chose this
Lycan Lord|0.8|all+1 str+1|Father of a thousand packs
`)},
    'Fairy': { title: 'Which court do you serve?', emoji: '🧚', label: 'COURT', rows: table(`
Flower Sprite|10|wild:all+1|Lives in a single bloom
Pixie|9|spd+1 fate+1|Mischief incarnate
Brownie|7|int+1 dur+1|Secret household helper
Will-o'-wisp|5|dark:all+1 a=holy|Lantern in the bog
Summer Court|4|sun:all+1 pwr+1|Warm and fickle
Winter Court|4|ice:all+1 pwr+1 r=ice|Cold and patient
Fairy Queen|0.8|all+1 pwr+2|Rules the hollow hills
`)},
    'Mermaid': { title: 'Which waters are yours?', emoji: '🧜', label: 'WATERS', rows: table(`
Reef Merfolk|10|spd+1|Bright scales, quick fins
River Merfolk|8|wild:all+1|Lives under the willows
Deep-sea Merfolk|6|dark:all+1 dur+1|Glows in the dark
Arctic Merfolk|5|r=ice ice:all+1|Swims under the ice
Siren|4|int+1 a=mind|A song that drags sailors down
Sea Witch|2|pwr+2|Trades in voices and wishes
Ocean Royalty|1|all+1 rt+1|Heir to the coral throne
`)},
    'Golem': { title: 'What are you made of?', emoji: '🗿', label: 'MATERIAL', rows: table(`
Clay|12|str-1 dur+1|Easy to repair
Stone|10|dur+1|Patient and heavy
Iron|7|str+1 dur+1 w=lightning|Rust is the only enemy
Flesh|5|str+1 r=poison w=fire|Stitched together
Bronze|5|str+1 r=fire|Hums when struck
Crystal|3|pwr+1 w=sound|Light passes through you
Obsidian|2|dur+2 r=fire|Black volcanic glass
Adamantine|0.6|dur+3 str+1|Nothing scratches you
`)},
    'Kitsune': { title: 'How many tails?', emoji: '🦊', label: 'TAILS', rows: table(`
One tail|12||A young fox spirit
Two tails|9|int+1|Learning the tricks
Three tails|7|pwr+1|Fox-fire at will
Five tails|4|int+1 pwr+1|Respected among foxes
Seven tails|2|pwr+2 fate+1|Bends the weather
Nine tails|0.7|all+1 pwr+2|The legendary fox
`)},
    'Skeleton': { title: 'Who were you in life?', emoji: '💀', label: 'FORMER LIFE', rows: table(`
Farmer|10|dur+1|Still holds the pitchfork
Soldier|9|fgt+1|Still in formation
Sailor|7|water:all+1|Found at the bottom of the sea
Knight|5|wpn+1 dur+1|Rusted armour, iron will
Mage|4|pwr+1 int+1|Bones full of old spells
King|2|rt+2 int+1|Still wears the crown
Dragon Rider|0.8|str+1 spd+1 rt+1|Rode the sky before dying
`)},
    'Zombie': { title: 'How fresh are you?', emoji: '🧟', label: 'FRESHNESS', rows: table(`
Fresh|10|spd+1|Could pass for alive
Shambling|10|spd-1 dur+1|Slow, but never stops
Rotten|6|a=poison|The smell is a weapon
Runner|4|spd+2 int-1|Fast and furious
Smart Zombie|2|int+2|Remembers who you were
Plague King|0.8|all+1 a=poison|Every bite spreads your crown
`)},
    'Undine': { title: 'Which waters gave you shape?', emoji: '💧', label: 'SPRING', rows: table(`
Spring|10|dur+1|Fresh and clean
Rain|8|storm:all+1|Falls with the storm
Waterfall|6|str+1|Crashing force
Mist|5|spd+1 dark:all+1|Hard to grasp
Ocean|2|all+1 water:all+1|The whole sea in one body
`)}
  });

  /* ---------------- sub-wheels: more rows in the existing ones ---------------- */
  const more = (race, text) => table(text).forEach(r => FW.SUBS[race].rows.push(r));
  more('Elf', `
Snow Elf|3|r=ice ice:all+1|Lives among glaciers
Desert Elf|3|sun:all+1|Sand-cloaked nomad
Blood Elf|2|pwr+1 str+1 w=holy|Magic-hungry exile
Star Elf|1|pwr+1 void:all+1|Came down from the night sky
`);
  more('Vampire', `
Dhampir|9|spd+1 sun:all+1|Half-vampire, walks in daylight
Feral Vampire|7|str+1 int-1|More beast than noble
Shadow Vampire|4|dark:all+2|Melts into the night
`);
  more('Demon', `
Succubus Kin|6|int+1 a=mind|Feeds on desire
Hellhound Rider|4|spd+1 fgt+1 a=fire|Rides a burning dog
Abyssal Horror|1.5|str+2 dur+1 a=void|From the bottom of the pit
`);
  more('Dragonborn', `
Sea Drake|5|water:all+1 a=water|Tide breath
Earth Drake|5|dur+1|Stone-scaled
Crystal Drake|2|dur+1 pwr+1|Prism breath
Shadow Drake|2|dark:all+1 a=shadow|Smoke breath
`);
  more('Spirit', `
House Spirit|8|dur+1|Protects a single home
Fox Spirit|5|int+1 fate+1|Playful trickster
Fire Spirit|4|a=fire r=fire|Dances in the hearth
`);
  more('Angel', `
Fallen Angel|5|str+1 dark:all+1 w=holy|Cast out, but still winged
Recording Angel|4|int+2|Writes down every deed
Angel of Death|1|pwr+2 a=shadow|Escorts the dying
`);
  more('Human', `
City-born|10|urban:all+1|Grew up in the crowds
Desert Folk|6|sun:all+1|Tough as old leather
Seafarer|6|water:all+1 spd+1|Born on a ship
Mountain Folk|6|dur+1|Thin air, thick skin
Sorcerer-blooded|2|pwr+1 int+1|Magic in the family
Hero's Descendant|1.5|fgt+1 rt+1|Great-grandchild of a legend
`);
  more('Beastkin', `
Deer|6|spd+1 wild:all+1|Startles easily, runs forever
Owl|4|int+1 dark:all+1|Sees in the dark
Horse|5|spd+1 dur+1|Endless stamina
Shark|3|str+1 water:all+1|Smells blood a mile away
Dragon|1|str+1 pwr+1 r=fire|Rarest blood of all
`);
  more('Elemental', `
Sand|4|dur+1 sun:all+1|Living dune
Metal|3|dur+1 a=metal r=metal w=lightning|Living ore
Nature|4|a=nature wild:all+1 w=fire|Living forest
Void|1|pwr+2 a=void w=holy|Living nothing
`);
  more('Dwarf', `
Ironbelly|7|r=poison dur+1|Drinks anything
Deepdelver|5|dark:all+1|Has never seen the sun
Skyforge|2|r=lightning storm:all+1|Built a forge on a mountain peak
`);
  more('Orc', `
Seareaver|5|water:all+1 fgt+1|Orc pirates
Moonfang|4|dark:all+1 spd+1|Night raiders
Stonehide|4|dur+1 str+1|Mountain orcs
`);
  more('God', `
Love|5|int+1 fate+1 a=mind|Everyone adores you
Knowledge|4|int+3|Knows every answer
Chaos|3|pwr+2 fate-1|Nothing stays the same
Dreams|3|int+1 pwr+1 a=mind|Rules the night's stories
Beasts|4|str+1 wild:all+2|Every animal answers
`);
  more('Djinn', `
Ghul|5|str+1 dark:all+1|Desert hunter
Storm Djinn|4|spd+1 a=lightning storm:all+1|Rides the sandstorm
Shadow Djinn|3|dark:all+1 a=shadow|Grants the wrong wishes
`);

  /* ---------------- birthplaces ---------------- */
  add(FW.BIRTH, `
Farmstead|9|str+1 dur+1|Honest work, early mornings
Fishing Village|7|dur+1 water:all+1|Up before the sun
Nomad Caravan|6|spd+1 sun:all+1|Home is wherever the camels stop
Pirate Cove|5|fgt+1 water:all+1|Raised by cutthroats
Rainforest Canopy|5|spd+1 wild:all+1|Born among the treetops
Smog City|5|dur+1 urban:all+1 r=poison|Factories that never sleep
Royal Capital|5|int+1 rt+1 urban:all+1|Grew up under the palace walls
Mountain Monastery|4|fgt+1 int+1 ice:all+1|Up a thousand stairs
Volcano Rim Village|4|dur+1 r=fire fire:all+1|Lava for a neighbour
Bamboo Valley|4|spd+1 fgt+1 wild:all+1|Trained among the stalks
Tundra Outpost|4|dur+1 r=ice ice:all+1|Six months of night
Floating Market|4|int+1 fate+1 water:all+1|Bartering before you could walk
Battlefield Camp|4|fgt+1 wpn+1|Born between two battles
Prison Colony|4|fgt+1 dur+1 fate-1|Born behind bars|Branded at birth
Haunted Manor|3|int+1 dark:all+1 fate-1|Never alone|The house still talks to you
Spiral Tower City|3|int+1 pwr+1 urban:all+1|A mage-city in one endless tower
Fae Crossroads|2|pwr+1 fate+1 w=metal|Where the fairy roads meet|Cold iron stings
Meteor Crater Town|2|pwr+1 str+1 void:all+1|The rock from the sky changed everyone
Hell's Outskirts|1.5|str+1 fire:all+1 r=fire w=holy|Brimstone suburbs|Holy water burns
Heaven's Gate|1|int+1 holy:all+2 w=shadow|Born on the threshold of paradise|Shadow sickens you
Inside a Sleeping God|0.6|pwr+2 fate+1|Your town was built on a giant who dreams|One day it will wake
`);

  /* ---------------- backgrounds ---------------- */
  add(FW.BACKGROUNDS, `
You were a cook in a mercenary camp.|6|dur+1 int+1|Everyone owes you a meal|
You were a knight's squire who lost your knight.|6|wpn+1 dur+1|Polished every buckle|Blames yourself
You were a circus acrobat.|5|spd+2 str-1|Lands on your feet|Light build
You were a miner who dug too deep.|5|str+1 dur+1 dark:all+1|Strong back, sharp ears|Something down there knows your name
You were a soldier in a war no one remembers.|5|fgt+1 dur+1 behind:all+1|Survived the impossible|Nightmares
You were a gravedigger who heard knocking.|4|dur+1 dark:all+1|Not afraid of the dead|The dead remember you
You were a librarian who read the forbidden shelf.|4|int+2 fate-1|Knows things|Some books read back
You were an assassin who refused the last contract.|4|fgt+1 spd+1|Lethal precision|Your guild wants you dead
You were a royal food taster.|4|dur+1 r=poison|Iron stomach|Paranoid at every meal
You were a priest who lost your faith.|4|int+1 pwr+1 holy:all-1|Knows the rites|Holy ground feels cold
You were a wizard's apprentice who broke the staff.|4|pwr+1 int+1 dur-1|Raw talent|The wizard is still angry
You were a monster hunter who began to pity the monsters.|4|fgt+1 int+1|Knows every weak point|Your guild calls you a traitor
You were a fisherman's child who found a sea god's ring.|3|pwr+1 fate+1 water:all+1|Blessed by the tide|The sea god wants it back
You were a beggar who was secretly a prince.|3|int+1 fate+1 rt+1|Knows both worlds|The court thinks you are dead
You were a mapmaker who mapped a place that does not exist.|3|int+1 pwr+1|Knows the shortcuts|Gets lost on purpose
You were a con artist who conned a demon.|3|int+1 fate+1 rt+1|Silver tongue|The demon wants a word
You were a slave who led a revolt.|3|fgt+1 rt+1 behind:all+2|Unbreakable will|The old masters hunt you
You were reincarnated from another world.|2|int+1 fate+2|Second life, first-hand knowledge|Homesick for a world no one believes in
You were an office worker who woke up here one morning.|2|int+1 str-1 behind:all+1|Excellent at spreadsheets|Never held a sword
You were the chosen wielder of a talking sword.|2|wpn+2 fate-1|The sword guides your hand|The sword has opinions
You were a time traveller stranded in this age.|1.5|int+2 fate+1|Knows how it ends|Can never go home
`);

  /* ---------------- personalities ---------------- */
  add(FW.PERSONALITIES, `
Kind-hearted|6|dur+1 o.spare*1.6 o.befriend*1.6 o.kill*0.4|Sees the good in everyone
Loyal|6|dur+1 fgt+1 o.recruit*1.4 o.spare*1.2|Never abandons a friend
Free Spirit|5|spd+1 o.befriend*1.6 o.enslave*0.2|Goes where the wind goes
Brooding|5|fgt+1 dark:all+1 o.spare*0.8|Mysterious and moody
Playful|5|spd+1 fate+1 o.befriend*1.5 o.kill*0.6|Turns fights into games
Ambitious|5|int+1 ahead:all+1 o.recruit*1.6 o.enslave*1.3|Always climbing
Arrogant|4|str+1 ahead:all+1 behind:all-1 o.kill*1.3 o.enslave*1.3|Knows they are the best|Falls apart when wrong
Shy|4|int+1 o.befriend*1.3 o.recruit*0.7|Quiet observer|Hates attention
Calculating|4|int+2 o.recruit*1.3 o.absorb*1.3|Every move is a sum
Thrill Seeker|4|spd+1 behind:all+1 o.befriend*1.2|Loves the danger
Serene|4|int+1 pwr+1 o.spare*1.5 o.banish*1.3|Still water runs deep
Paranoid|3|int+1 spd+1 o.kill*1.4 o.befriend*0.4|Always ready|Trusts no one
Gentle Giant|3|str+1 dur+1 o.spare*1.8 o.kill*0.4|Strong enough to be gentle
Mad Genius|3|int+3 dur-1 o.absorb*1.8 o.enslave*1.3|Brilliant|Unstable
Bloodthirsty|3|str+1 fgt+1 int-1 o.kill*2.5 o.spare*0.1|Lives for the kill|Cannot stop
`);

  /* ---------------- weapons ---------------- */
  add(FW.WEAPONS, `
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
  Object.assign(FW.AFFINITY, {
    'Ratfolk': ['Dagger', 'Sling', 'Blowgun'], 'Hobgoblin': ['Spear', 'Sword and Shield', 'Shortsword'], 'Gnoll': ['Flail', 'Spear', 'Axe'],
    'Frogfolk': ['Spear', 'Blowgun', 'Whip'], 'Bearfolk': ['Axe', 'Warhammer', 'Gauntlets'], 'Sharkfolk': ['Trident', 'Harpoon', 'Tidecaller Glaive'],
    'Cyclops': ['Warhammer', 'Gravity Hammer', 'Hand Cannon'], 'Mummy': ['Khopesh', 'Scythe', 'Cursed Blade'], 'Dullahan': ['Scythe', 'Whip', 'Lance'],
    'Android': ['Flintlock Pistol', 'Spellgun', 'Hand Cannon'], 'Salamanderkin': ['Flame Tongue', 'Spear'], 'Lightborn': ['Holy Lance', 'Mirror Shield'],
    'Treant': ['Worldtree Staff', 'Club'], 'Demigod': ['Godslayer Spear', 'Kingmaker Sword', 'Claymore'], 'Wendigo': ['Winter\'s Bow', 'Frostbrand'],
    'Undine': ['Trident', 'Harpoon'], 'Gorgon': ['Bow', 'Venomfang'], 'Zombie': ['Pitchfork', 'Club'], 'Thunderbird': ['Thunder Gauntlets', 'Stormcaller Spear']
  });
  ['Gnoll', 'Bearfolk', 'Sharkfolk', 'Owlfolk', 'Zombie', 'Wendigo', 'Treant', 'Behemoth', 'Thunderbird'].forEach(r => FW.NATURAL_WEAPONS.push(r));

  /* ---------------- enhancements ---------------- */
  add(FW.ENHANCEMENTS, `
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

  /* ---------------- powers ---------------- */
  (function () {
    const B = FW.POWER_BASE;
    const rows = (rar, items) => items.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      const m = s.split('='); FW.POWERS.push({ name: m[0].trim(), w: B[rar], dsl: 'rar=' + rar + (m[1] ? ' a=' + m[1].trim() : ''), perk: '', flaw: '' });
    });
    rows(1, 'Water Breathing=water, Wall Crawling, Pain Tolerance, Photographic Memory, Voice Mimicry, Pathfinding, Green Thumb=nature, Static Charge=lightning, Cold Touch=ice, Lucky Guess');
    rows(2, 'Heat Vision=fire, Super Jump, Elasticity, Invisibility, Sonic Scream=sound, Insect Swarm=poison, Spider Silk, Darkness Generation=shadow, Healing Touch, Force Field, Wood Manipulation=nature, Lava Manipulation=fire, Steel Skin=metal');
    rows(3, 'Super Speed, Power Mimicry, Petrification, Astral Projection=mind, Possession=mind, Dragon Summoning=fire, Plague Spreading=poison, Ice Age=ice, Earthquake Generation, Elemental Fusion');
    rows(4, 'Antimatter=void, Star Forging=holy, Planar Shifting, Undying Flame=fire, Gravity Well, Soul Forging=void');
    rows(5, 'Rewind=time, Death Touch=void, Absolute Zero=ice, Wish Granting, Multiverse Travel');
    rows(6, 'Beyond Existence=void, True Omniscience=mind');
  })();

  /* ---------------- weaknesses ---------------- */
  add(FW.WEAKNESSES, `
Bad Luck|3|fate-1|Things just go wrong|
Brittle Bones|3|dur-1|Breaks too easily|
Sleepless Nights|3|int-1|Never quite rested|
Gullible|3|int-1 w=mind|Believes every lie|
Blind Spot|3|fgt-1|Always open on the left|
Easily Bored|3|ahead:fgt-1|Loses interest mid-fight|
Heat Sensitivity|3|w=fire fire:all-1|Wilts in the heat|
Cold Sensitivity|3|w=ice ice:all-1|Shivers into mistakes|
Light Sensitivity|3|sun:spd-1 sun:int-1|Squints all day|
Claustrophobia|2|urban:all-1|Walls close in|
Fear of Storms|2|storm:all-2|Freezes at thunder|
Mana Burnout|2|pwr-1 behind:pwr-1|Runs dry when it matters|
Weak Heart|2|dur-1 behind:spd-1|Cannot keep up the pace|
Wooden Stake|2|w=nature|One splinter to the heart|
Salt Lines|2|w=holy|Cannot cross a line of salt|
True Name Known|1.5|fate-1 w=mind|Anyone with your name can command you|
`);

  /* ---------------- titles ---------------- */
  [['The Unbowed', 3, 1], ['The Lantern Bearer', 3.5, 1], ['The Gentle Giant', 3.5, 1], ['The Silver Tongue', 3.5, 1], ['The Unlucky', 4, 1], ['The Small but Mighty', 4, 1],
   ['The Rust Knight', 3, 1], ['The Lucky Fool', 4, 1], ['The Sleepless Watcher', 3, 1], ['The Stray', 4, 1],
   ['The Thousand Cuts', 2.5, 2], ['The Grave Dancer', 2.5, 2], ['The Witch of the Fens', 2.5, 2], ['The Hound of the North', 2.5, 2], ['The Ninth Life', 2.5, 2],
   ['The Crow King', 2, 2], ['The Lady of Knives', 2, 2], ['The Kindly Dread', 2, 2], ['The Weeping Blade', 2.5, 2], ['The Twice-Born', 2, 2], ['The Moonlit Wolf', 2.5, 2], ['The Pale Rider', 2, 2],
   ['The Sword Saint', 1.5, 3], ['The Sunbreaker', 1.2, 3], ['The Worldwalker', 1.2, 3], ['The Last Light', 1.2, 3], ['The Godless Saint', 1.2, 3], ['The One Who Returned', 1, 3]]
    .forEach(x => FW.TITLES.push({ name: x[0], w: x[1], dsl: 'tt=' + x[2] + ' rt+' + x[2], perk: ['Whispered in taverns', 'Feared across the realm', 'A name that stops battles'][x[2] - 1], flaw: '' }));

  /* ---------------- marks of fate ---------------- */
  add(FW.MARKS, `
Blessed Hands|3|dur+1 int+1|Wounds close faster around you|
Thunder Scar|3|spd+1 r=lightning|Survived a lightning strike|
Grave-Touched|3|dur+1 dark:all+1 w=holy|Died once, briefly|Holy ground remembers
Comet-Born|3|pwr+1 fate+1|A comet crossed the sky the night you were born|
Seventh Child|3|fate+1 pwr+1|Seventh child of a seventh child|
Black Cat Crossing|3|spd+1 fate-1|Quick reflexes from constant near-misses|Bad luck follows
Oathmarked|3|fgt+1 fate-1|An oath gives you strength|Break it and lose everything
Siren's Kiss|2|int+1 water:all+1|The sea sings to you|
Dragon's Gaze|2|str+1 r=fire|A dragon looked at you and let you live|
Heir Unknown|2|rt+1 fate+1|Secret royal blood|
Eclipse Child|2|pwr+1 dark:all+1 sun:all+1|Born when the sun went dark|
Forgotten Name|2|fate+1 rt-1|No one remembers you - useful|Hard to become famous
Kingslayer's Brand|2|fgt+1 rt+1 fate-1|Feared by every throne|Every crown wants you dead
Phoenix Feather|1.5|fate+2|You will rise again|
`);

  /* ---------------- arenas ---------------- */
  [{ name: 'Grand Colosseum', tags: ['sun'], w: 8 }, { name: 'Haunted Graveyard', tags: ['dark'], w: 6 }, { name: 'Pirate Ship in a Storm', tags: ['water', 'storm'], w: 5 },
   { name: 'Floating Sky Islands', tags: ['storm'], w: 4 }, { name: 'Abandoned Subway', tags: ['urban', 'dark'], w: 5 }, { name: 'Lava Bridge', tags: ['fire'], w: 5 },
   { name: 'Crystal Caverns', tags: ['dark'], w: 5 }, { name: 'Royal Throne Room', tags: ['urban', 'holy'], w: 4 }, { name: 'Cherry Blossom Garden', tags: ['wild', 'sun'], w: 5 },
   { name: 'Ruined Castle', tags: [], w: 8 }, { name: 'Snowy Mountain Pass', tags: ['ice', 'storm'], w: 5 }, { name: 'Swamp of Whispers', tags: ['water', 'wild', 'dark'], w: 4 },
   { name: 'Stairway to Heaven', tags: ['holy', 'sun'], w: 3 }, { name: 'Underwater Ruins', tags: ['water'], w: 4 }, { name: 'Rooftops at Midnight', tags: ['urban', 'dark'], w: 5 },
   { name: 'Inside a Black Hole', tags: ['void'], w: 1.5 }].forEach(a => FW.ARENAS.push(a));

  /* ---------------- universes (opponents) ---------------- */
  FW.UNIVERSES.push(
    { name: 'Dust and Spirits', emoji: '🤠', hue: 28, blurb: 'Gunslingers and ghosts on a haunted frontier', opps: table(`
Rattlesnake Kid|10|lv=27 a=poison|Fastest draw in three towns
Sheriff Bones|8|lv=38 a=shadow w=holy|Still enforcing the law after death
Coyote Trickster|7|lv=47 a=mind|Never the same face twice
Iron Horse Baron|5|lv=58 a=metal,fire w=water|Owns the railroad and everyone on it
Ghost Rider Ezra|3|lv=71 a=shadow,fire w=holy|Rides a burning horse
The Thunder Prophet|1.5|lv=87 a=lightning r=lightning w=nature|Calls down storms on sinners
`)},
    { name: 'Arcane Academy', emoji: '🏫', hue: 262, blurb: 'Rival students and professors at a school of magic', opps: table(`
Top Student Mirabel|10|lv=30 a=fire|Never got a grade below perfect
Hall Monitor Grim|8|lv=37 a=metal|Enforces curfew with a golem
Potions Master Vex|7|lv=49 a=poison r=poison w=fire|Has an antidote for everything except himself
Headless Librarian|5|lv=57 a=mind w=fire|Shushes with lethal force
Exiled Professor Kael|3|lv=73 a=void,mind w=holy|Taught the forbidden class
The Headmistress|1.2|lv=92 a=time,holy r=mind|Has never once raised her voice
`)},
    { name: 'Kaiju Coast', emoji: '🦖', hue: 150, blurb: 'Giant monsters and the pilots who fight them', opps: table(`
Mecha Cadet Rin|10|lv=31 a=metal w=lightning|First week in the cockpit
Crab Titan Kragg|8|lv=44 a=water r=water w=lightning|Shell like a fortress
Smog Serpent|7|lv=52 a=poison r=poison w=fire|Breathes factory smoke
Admiral Steelheart|5|lv=63 a=metal,fire w=lightning|Commands the last fleet
Volcano Lizard Gorrak|3|lv=79 a=fire r=fire w=ice|Wakes once a century
The Deep King|1.2|lv=94 a=water,void r=water w=holy|The reason the sea is so quiet
`)}
  );

  /* ---------------- fight outcomes (new ones carry their own reward) ---------------- */
  FW.OUTCOMES.push(
    { key: 'trophy',   name: 'Take his weapon',     w: 9, blurb: 'A trophy for your wall.',            reward: 'rt+1', dsl: 'rt+1 wpn+1', text: 'You claim his weapon as a trophy (+1 Weapon mastery, +1 Renown).', scene: 'holding up the weapon taken from the defeated' },
    { key: 'teach',    name: 'Make him teach you',  w: 6, blurb: 'His technique becomes yours.',       reward: 'skill', dsl: 'fgt+1', text: 'He teaches you his technique (+1 Fighting skills).', scene: 'training side by side with' },
    { key: 'imprison', name: 'Imprison him',        w: 7, blurb: 'Locked away for good.',              reward: 'rt+1', dsl: 'rt+1', text: 'He rots in your dungeon (+1 Renown).', scene: 'locking a cell door on' },
    { key: 'heal',     name: 'Heal his wounds',     w: 5, blurb: 'Kindness has its own power.',        reward: 'fate+1', dsl: 'fate+1 int+1', text: 'You heal your enemy (+1 Fate Token, +1 Intelligence).', scene: 'kneeling to bandage the wounds of' },
    { key: 'curse',    name: 'Curse him',           w: 4, blurb: 'Power, for a price.',                reward: 'pwr', dsl: 'pwr+1 fate-1', text: 'You curse him, and the curse feeds you (+1 Power mastery, −1 Fate Token).', scene: 'casting a dark curse over' },
    { key: 'throne',   name: 'Take his throne',     w: 3, blurb: 'His followers now kneel to you.',    reward: 'rt+3', dsl: 'rt+3', text: 'His followers kneel to you (+3 Renown).', scene: 'seated on the throne of' }
  );
  FW.DEFEATS.push(
    { key: 'humbled',  name: 'Humbled, but wiser',     w: 12, blurb: 'You learn from the beating: +1 Intelligence.', dsl: 'int+1', text: 'You learn from the beating (+1 Intelligence).', scene: 'kneeling in defeat, studying' },
    { key: 'vow',      name: 'Swore revenge',          w: 10, blurb: 'You train for the rematch: +1 Fighting skills.', dsl: 'fgt+1', text: 'You swear revenge and train for the rematch (+1 Fighting skills).', scene: 'swearing revenge on' },
    { key: 'disgraced',name: 'Disgraced',              w: 9,  blurb: 'Word of the loss spreads: −1 Renown.', dsl: 'rt-1', text: 'Word of the loss spreads (−1 Renown).', scene: 'walking away in disgrace from' },
    { key: 'cursed',   name: 'Cursed by the victor',   w: 7,  blurb: 'A curse that also gives: −1 Fate Token, +1 Power mastery.', dsl: 'fate-1 pwr+1', text: 'The victor curses you, and it changes you (−1 Fate Token, +1 Power mastery).', scene: 'marked by a glowing curse from' }
  );

  /* ---------------- class ---------------- */
  add(FW.CLASSES, `
Archer|5|wpn+1 spd+1|Eyes on the target
Brawler|5|str+1 fgt+1 wpn-1|Fists first, questions never|Clumsy with weapons
Merchant|5|int+1 fate+1 fgt-1|Can buy a way out|Not a fighter
Gladiator|4|str+1 fgt+1 rt+1|Fights for the crowd
Duelist|4|fgt+1 spd+1 wpn+1 dur-1|One opponent at a time|Lightly armoured
Healer|4|dur+1 int+1 fate+1 fgt-1|Keeps everyone standing|Hates to hurt anyone
Witch|4|pwr+1 int+1 dark:all+1|Hexes and herbs
Sorcerer|4|pwr+2 dur-1|Born with magic|Fragile body
Shaman|4|pwr+1 int+1 storm:all+1|Speaks with spirits
Engineer|4|int+2 wpn+1 fgt-1|Builds the solution|Bad at close quarters
Ninja|3|spd+2 fgt+1 dark:all+1 dur-1|Unseen until it is too late|No armour
Templar|3|dur+1 fgt+1 holy:all+1|Sword of the faith
Monster Hunter|3|wpn+1 fgt+1 dark:all+1|Knows what goes bump in the night
Illusionist|3|int+1 pwr+1 a=mind|Nothing is what it seems
Runesmith|3|wpn+1 pwr+1 int+1 spd-1|Carves power into steel|Slow to prepare
Hexblade|2|wpn+1 pwr+1 a=shadow fate-1|A cursed weapon chose you|The curse is hungry
Dragon Rider|1|spd+1 str+1 rt+2 r=fire|Rides a dragon into battle
Chronomancer|1|spd+1 pwr+2 a=time|Bends seconds
Hero of Legend|0.5|all+1 pwr+1 rt+2|Songs are already being written
`);

  /* ---------------- element ---------------- */
  add(FW.ELEMENTS, `
Storm|2.5|spd+1 a=lightning storm:all+2 w=nature|Thunder and gale together|Grounded by roots
Magma|2|str+1 a=fire r=fire w=water fire:all+1|Molten rock|Cooled by water
Crystal|2|dur+1 a=metal r=fire w=sound|Hard and bright|Shatters at the right note
Acid|2|a=poison r=poison w=water|Eats through armour|Diluted by water
Spirit|1.5|int+1 pwr+1 a=mind r=poison w=holy|Soul-fire|Holy rites banish it
Moon|1.5|pwr+1 dark:all+2 a=shadow w=fire|Silver and silent|Burned by flame
Star|1|pwr+1 a=holy,fire void:all+1|Light from a distant sun|
Gravity|0.8|str+1 pwr+1 a=void|Everything falls toward you|
`);

  /* ---------------- companion ---------------- */
  add(FW.PETS, `
Pet Rock|4|dur+1 fate+1|Never complains
Battle Goat|4|str+1 dur+1|Headbutts first
Monkey Thief|4|spd+1 fate+1|Steals for you, mostly
Messenger Pigeon|4|int+1|Always knows the way home
Sea Turtle|3|dur+1 water:all+1|Slow, wise and armoured
Snow Fox|3|spd+1 ice:all+1|White as fresh snow
Giant Spider|2.5|fgt+1 dark:all+1 a=poison|Eight legs of loyalty
Fire Salamander|2.5|r=fire a=fire|Lives in your campfire
Living Book|2|int+2|Knows almost everything, and says so
Will-o'-the-Wisp|2|int+1 fate+1 dark:all+1|Lights the way
Storm Hawk|2|spd+1 storm:all+1 a=lightning|Rides the lightning
Golem Buddy|2|str+1 dur+1 spd-1|A small stone friend|Slow to follow
Shadow Panther|1.5|spd+1 fgt+1 dark:all+1|Hunts from the dark
Moon Rabbit|1.2|spd+1 fate+1 dark:all+1|Jumps between moonbeams
Wyvern|1|str+1 spd+1 rt+1|A small dragon with a big attitude
Kraken Hatchling|1|str+1 water:all+2|Still fits in a bucket
Unicorn|0.8|dur+1 fate+1 holy:all+1 a=holy|Pure-hearted and stubborn
`);

  /* ---------------- looks ---------------- */
  add(FW.HAIR, `
Curly black hair|7||
Shaggy dark brown hair|7||
Long wavy auburn hair|5||
Sandy windswept hair|5||
Golden curls|4||
Short silver crop|3||
Copper braids|3||
Jet-black hair with a white streak|3||
Grey wolf-cut hair|3||
Cherry-red bob|2.5||
Ice-blue braids|2||
Twin braids tied with ribbons|3||
Tall mohawk|2.5||
Bald with tattooed scalp|2.5|int+1|Every tattoo is a spell
Hair woven with leaves and flowers|1.5|wild:all+1|The forest grows in it
Hair of black smoke|0.8|dark:all+1|It drifts even without wind
Hair of glowing crystal|0.6|pwr+1|Rings softly when you move
`);
  add(FW.EYES, `
Ice-blue eyes|5||
Dark green eyes|5||
Silver eyes|3||
Pink eyes|2.5||
Fiery orange eyes|2||
Cat-like yellow eyes|2|dark:spd+1|Sees in the dark
Tired eyes with dark circles|3|int+1 spd-1|Sleepless genius|Always exhausted
Black eyes with no whites|1.5|dark:all+1|Unsettling to meet
Eyes that glow purple|1.5|pwr+1|Magic shows in your gaze
Blindfolded, fights by sound|1.5|fgt+1|Hears every footstep
Eyes with clock-hand pupils|0.6|spd+1|Always a second ahead
`);
  add(FW.GARB, `
Ranger's green hood and cloak|5|wild:all+1|Blends into the woods
Knight's surcoat and cape|4|dur+1|A banner on your back
Thief's patched hood with many pockets|4|spd+1|Something useful in every pocket
Black trench coat|4|urban:all+1|City-hunter's look
Wizard's pointed hat and starry robes|3|pwr+1 dur-1|Every star is stitched by hand|Not armour
Ronin's worn kimono|3|wpn+1|Faded colours of an old lord
Sailor's striped shirt and bandana|3|water:all+1|Smells like the sea
Gothic lace and velvet|3|dark:all+1|Dressed for a midnight ball
Priest's white vestments|3|holy:all+1|Embroidered with prayers
Gladiator harness and helm|3|fgt+1 dur-1|Made to show off|Bare skin
Steampunk goggles and leather apron|3|int+1|Tools for every job
Cyber jacket with neon trim|2.5|urban:all+1 spd+1|Glows in the rain
Royal ballgown and jewels|2|rt+1|Every eye in the room
Feathered shaman cloak|2|pwr+1|Each feather is a spirit
Armour of dragon scales|0.8|dur+2 r=fire|Taken from a dragon - somehow
Shadow-woven cloak that drinks light|0.8|dark:all+2|Torches dim as you pass
`);

  /* ---------------- looks for the new races ---------------- */
  ['Shade', 'Crystalborn', 'Mummy', 'Dullahan', 'Treant', 'Thunderbird', 'Behemoth', 'Frogfolk', 'Sharkfolk', 'Salamanderkin', 'Owlfolk', 'Gorgon', 'Wendigo', 'Android'].forEach(r => FW.HAIRLESS.push(r));
  Object.assign(FW.RACE_ART, {
    'Ratfolk': 'ratfolk with a whiskered rat face, round ears and a long tail', 'Hobgoblin': 'tall disciplined hobgoblin with orange-red skin and pointed ears', 'Gnoll': 'hyena-headed gnoll with spotted fur',
    'Frogfolk': 'frogfolk with smooth green skin, wide eyes and a frog face', 'Bearfolk': 'bearfolk with a bear head and thick brown fur', 'Owlfolk': 'owlfolk with an owl face, feathers and large round eyes',
    'Sharkfolk': 'sharkfolk with grey skin, a shark head, fins and rows of teeth', 'Zombie': 'zombie with grey rotting skin and stitched wounds', 'Homunculus': 'small homunculus, a pale alchemical being with glass-like eyes',
    'Lightborn': 'lightborn person with faintly glowing skin and golden eyes', 'Salamanderkin': 'salamanderkin with red scales and flames flickering along the spine', 'Undine': 'undine whose body is partly made of clear flowing water',
    'Sylph': 'sylph with an airy translucent body and hair like wind', 'Forest Giant': 'gentle forest giant with mossy skin and leaves in the beard', 'Cyclops': 'huge one-eyed cyclops',
    'Mummy': 'mummy wrapped in ancient linen bandages with glowing eyes', 'Shade': 'shade, a living shadow with faint white eyes', 'Crystalborn': 'crystalborn with a body of faceted glowing crystal',
    'Android': 'android with flawless synthetic skin and visible seams of light', 'Gorgon': 'gorgon with living snakes for hair', 'Dullahan': 'headless dark rider carrying their own glowing head',
    'Wendigo': 'gaunt wendigo with a deer skull for a head and antlers', 'Treant': 'treant, a walking ancient tree with a face in the bark', 'Dreamborn': 'dreamborn with a body that fades into swirling dream mist',
    'Thunderbird': 'thunderbird-kin with vast storm-cloud wings crackling with lightning', 'Demigod': 'demigod with a faint golden aura', 'Behemoth': 'colossal horned behemoth with rocky hide',
    'Archfey': 'archfey ruler with iridescent butterfly wings and a crown of thorns and flowers', 'Chronoborn': 'chronoborn with clock-face patterns glowing on the skin and afterimages around the body'
  });
  FW.RACE_HUE = { Ratfolk: 30, Hobgoblin: 15, Gnoll: 40, Frogfolk: 110, Bearfolk: 25, Owlfolk: 38, Sharkfolk: 200, Zombie: 95, Homunculus: 180, Lightborn: 50, Salamanderkin: 10,
    Undine: 190, Sylph: 170, 'Forest Giant': 120, Cyclops: 30, Mummy: 42, Shade: 260, Crystalborn: 185, Android: 205, Gorgon: 140, Dullahan: 270, Wendigo: 210, Treant: 105,
    Dreamborn: 290, Thunderbird: 225, Demigod: 48, Behemoth: 20, Archfey: 310, Chronoborn: 45 };
  // extra card-art features for the new races
  FW.RACE_LOOK = { winged: ['Owlfolk', 'Thunderbird', 'Archfey', 'Sylph'], horned: ['Wendigo', 'Behemoth'], halo: ['Lightborn', 'Demigod'], eared: ['Hobgoblin', 'Gnoll', 'Ratfolk', 'Archfey'] };
})(typeof window !== 'undefined' ? window : globalThis);
