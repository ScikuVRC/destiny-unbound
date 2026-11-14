/* Destiny Unbound content: Birthplace, age, height, background and personality.
   Pure data: no game logic lives here. Rows in FW.table(`...`) read Name|weight|effects|perk|flaw;
   see app/data/README.md for the effect codes. Order matters: Legend Codes and seeds refer to it. */
(function (g) {
  const FW = g.FW;

  FW.BIRTH = FW.table(`
Broken Kingdom|9|fgt+1|War-hardened refugees|
Forest Village|9|spd+1 wild:all+1|Hunters of the green|
Cursed Village|6|pwr+1 fate-1|Hexwise|Whispers of ill luck follow you
Dead Land|6|dur+1 r=poison dark:dur+1|Barren and bone-dry|Nothing grows, nothing is kind
Flame Kingdom|6|r=fire a=fire fire:all+1|Forge-hardened|
Ice Kingdom|6|r=ice w=fire ice:all+1|Frost-born|
Mist Village|6|spd+1 int+1 str-1|Hidden in the fog|
Iron Kingdom|6|dur+1 wpn+1 r=metal w=lightning|Smith-guild upbringing|
Ruin City|6|int+1 spd+1 urban:all+1|Scavenger of old wonders|
Merchant Republic|6|int+1 fate+1 str-1|Fortune and fine print|
Shadow Realm|5|spd+1 dark:all+1 sun:all-1|Raised between lamps|
Beast Forest|5|str+1 wild:all+1 int-1|Raised by claws|
War Island|5|fgt+2 wpn+1|Born to the arena|
Salt Desert|5|dur+1 sun:dur+1 water:all-1|Water-starved survivor|
Sky Island|4|spd+1 storm:spd+1 water:dur-1|Cloud-walker|
Holy Kingdom|4|int+1 holy:all+1 w=shadow|Chapel-schooled|
Thunder City|4|spd+1 r=lightning storm:all+1|Storm-forged|
Crystal City|4|int+1 pwr+1 urban:all+1|Arcane marketplace|
Sun Empire|4|str+1 sun:all+1 dark:all-1|Sun-crowned|
Deep Hollow|4|dur+1 dark:all+1|Cavern dweller|
Dragon Peak|3|str+1 pwr+1 r=fire|Wyrm-watched|
Abyss Realm|3|pwr+1 dur+1 dark:all+1 sun:all-1|Drowned dark|
Floating Archipelago|3|spd+1 water:all+1|Island-hopper|
Cloud Monastery|3|int+1 pwr+1 fgt+1|Silent masters|
Star Temple|2|int+1 pwr+2|Observatory-born|
Fallen Realm|2|pwr+1 fgt+1 fate-1|Ruined by its own gods|
The Nowhere|1|pwr+2 void:all+2 fate-1|Born between worlds|Reality barely holds you
Clockwork Capital|5|int+1 urban:all+1 w=lightning|City of gears and timetables|
Bone Marsh|5|dur+1 r=poison water:spd-1|Fever-swamp upbringing|
Glass Desert|4|spd+1 sun:all+1 ice:all-1|Dunes fused by an old war|
Lantern Harbor|6|int+1 fate+1 water:all+1|Port of a thousand flags|
Hanging Gardens|4|int+1 wild:all+1|Terraced green above the clouds|
Obsidian Citadel|4|dur+1 fgt+1 r=fire|Fortress of black glass|
Whispering Steppe|6|spd+1 wild:spd+1|Horse-lords and endless grass|
Moonwell Grove|3|pwr+1 dark:all+1|Silver water under old trees|
Sunken Atoll|3|water:all+2 urban:all-1|Half the town is under the tide|
Titan's Graveyard|2|str+1 dur+1 fate-1|Raised among colossal bones|The dead giants are restless
Mirror Lake Shrine|3|int+1 holy:all+1|Pilgrim town on still water|
Ember Isles|4|spd+1 a=fire fire:all+1|Volcano fishermen|
Frostfang Pass|4|dur+1 r=ice ice:all+1|Toll-keepers of the high road|
Carnival Roads|5|spd+1 fate+1|Born in a travelling show|
The Undercity|5|spd+1 dark:all+1 sun:all-1|Sewers, markets and no sky|
Dream Shore|1.5|pwr+2 int+1 fate-1|A coast that is only there at night|You are never fully awake
Farmstead|9|str+1 dur+1|Honest work, early mornings|
Fishing Village|7|dur+1 water:all+1|Up before the sun|
Nomad Caravan|6|spd+1 sun:all+1|Home is wherever the camels stop|
Pirate Cove|5|fgt+1 water:all+1|Raised by cutthroats|
Rainforest Canopy|5|spd+1 wild:all+1|Born among the treetops|
Smog City|5|dur+1 urban:all+1 r=poison|Factories that never sleep|
Royal Capital|5|int+1 rt+1 urban:all+1|Grew up under the palace walls|
Mountain Monastery|4|fgt+1 int+1 ice:all+1|Up a thousand stairs|
Volcano Rim Village|4|dur+1 r=fire fire:all+1|Lava for a neighbour|
Bamboo Valley|4|spd+1 fgt+1 wild:all+1|Trained among the stalks|
Tundra Outpost|4|dur+1 r=ice ice:all+1|Six months of night|
Floating Market|4|int+1 fate+1 water:all+1|Bartering before you could walk|
Battlefield Camp|4|fgt+1 wpn+1|Born between two battles|
Prison Colony|4|fgt+1 dur+1 fate-1|Born behind bars|Branded at birth
Haunted Manor|3|int+1 dark:all+1 fate-1|Never alone|The house still talks to you
Spiral Tower City|3|int+1 pwr+1 urban:all+1|A mage-city in one endless tower|
Fae Crossroads|2|pwr+1 fate+1 w=metal|Where the fairy roads meet|Cold iron stings
Meteor Crater Town|2|pwr+1 str+1 void:all+1|The rock from the sky changed everyone|
Hell's Outskirts|1.5|str+1 fire:all+1 r=fire w=holy|Brimstone suburbs|Holy water burns
Heaven's Gate|1|int+1 holy:all+2 w=shadow|Born on the threshold of paradise|Shadow sickens you
Inside a Sleeping God|0.6|pwr+2 fate+1|Your town was built on a giant who dreams|One day it will wake
`);

  FW.AGES = [
    {
      name: 'Teen (13-17)',
      w: 8,
      dsl: 'spd+1 int-1 fate+1',
      perk: 'Quick to learn, quicker to act',
      flaw: 'Untested',
      life: 's',
    },
    {
      name: 'Young adult (18-24)',
      w: 14,
      dsl: 'spd+1',
      perk: 'In your physical prime',
      flaw: 'Short on experience',
      life: 's',
    },
    { name: 'Adult (25-32)', w: 16, dsl: '', perk: 'Prime of life', flaw: '', life: 's' },
    { name: 'Seasoned adult (33-40)', w: 12, dsl: 'fgt+1', perk: 'Knows a few dirty tricks', flaw: '', life: 's' },
    {
      name: 'Middle-aged (41-50)',
      w: 10,
      dsl: 'fgt+1 spd-1',
      perk: 'Battle-seasoned',
      flaw: 'Slowing down',
      life: 's',
    },
    {
      name: 'Grizzled (51-60)',
      w: 8,
      dsl: 'fgt+1 wpn+1 spd-1',
      perk: 'Scarred veteran of many wars',
      flaw: 'Knees complain',
      life: 's',
    },
    {
      name: 'Elder (61-75)',
      w: 6,
      dsl: 'int+1 wpn+1 str-1 spd-1',
      perk: 'Wise veteran',
      flaw: 'Aching bones',
      life: 's',
    },
    {
      name: 'Venerable (76-100)',
      w: 4,
      dsl: 'int+2 wpn+1 str-1 spd-1 dur-1',
      perk: 'Has outlived every rival',
      flaw: 'Brittle bones',
      life: 's',
    },
    {
      name: 'Impossibly old (101-130)',
      w: 1.2,
      dsl: 'int+2 wpn+1 str-2 spd-1 fate+1',
      perk: 'Should not still be alive',
      flaw: 'Held together by spite',
      life: 's',
    },
    { name: 'Long-lived (131-299)', w: 5, dsl: 'int+1 wpn+1', perk: 'Has watched empires change', flaw: '', life: 'm' },
    { name: 'Centuries old', w: 5, dsl: 'int+1 wpn+1 fgt+1', perk: 'Centuries of practice', flaw: '', life: 'm' },
    {
      name: 'Reincarnated soul',
      w: 1.5,
      dsl: 'int+1 fate+1',
      perk: 'Remembers past lives',
      flaw: 'Haunted by old deaths',
      life: 'm',
    },
    { name: 'Millennia old', w: 3.5, dsl: 'int+2 pwr+1', perk: 'Ancient memory', flaw: '', life: 'l' },
    {
      name: 'Ten thousand years',
      w: 2,
      dsl: 'int+2 pwr+1 wpn+1',
      perk: 'Remembers lost civilisations',
      flaw: '',
      life: 'l',
    },
    {
      name: 'Frozen in time',
      w: 1.2,
      dsl: 'int+1 dur+1',
      perk: 'Has not aged a day since the curse',
      flaw: 'Time forgot you',
      life: 'l',
    },
    {
      name: 'Older than recorded history',
      w: 1.4,
      dsl: 'int+2 pwr+2',
      perk: 'Was there before the first writing',
      flaw: '',
      life: 'l',
    },
    {
      name: 'As old as the gods',
      w: 0.9,
      dsl: 'int+2 pwr+2 fate+1',
      perk: 'Drank with the first gods',
      flaw: '',
      life: 'a',
    },
    { name: 'Older than Earth', w: 1.2, dsl: 'int+2 pwr+2', perk: 'Remembers the first dawn', flaw: '', life: 'a' },
    {
      name: 'Older than the Moon',
      w: 0.7,
      dsl: 'int+2 pwr+2 dark:all+1',
      perk: 'Saw the Moon being born',
      flaw: '',
      life: 'a',
    },
    {
      name: 'Older than the Solar System',
      w: 0.6,
      dsl: 'int+2 pwr+2 fgt+1',
      perk: 'Remembers the first stars',
      flaw: '',
      life: 'a',
    },
    { name: 'Older than the Galaxy', w: 0.3, dsl: 'int+3 pwr+3', perk: 'Witness of creation', flaw: '', life: 'a' },
    {
      name: 'Older than the Universe',
      w: 0.1,
      dsl: 'int+3 pwr+3 fgt+2',
      perk: 'Was here before there was a here',
      flaw: '',
      life: 'a',
    },
    {
      name: 'Older than Time itself',
      w: 0.05,
      dsl: 'int+3 pwr+3 fgt+2 fate+1',
      perk: 'Time is younger than you',
      flaw: '',
      life: 'a',
    },
  ];

  FW.AGE_RANGES = [
    [13, 17],
    [18, 24],
    [25, 32],
    [33, 40],
    [41, 50],
    [51, 60],
    [61, 75],
    [76, 100],
    [101, 130],
    [131, 299],
    [300, 999],
    null,
    [1000, 9999],
    [10000, 99999],
    null,
    [100000, 999999],
    [1000000, 99999999],
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  FW.AGE_LIMIT = { s: 9, m: 12, l: 16, a: 23 };

  FW.AGE_WORDS = [
    'teenage',
    'young adult',
    'adult',
    'adult, a few lines of experience on the face',
    'middle-aged',
    'grizzled, weathered and scarred',
    'elderly',
    'very old, white-haired and wrinkled',
    'impossibly old and frail-looking',
    'ageless face with old, knowing eyes',
    'ageless, with centuries in their eyes',
    'young-looking with ancient eyes',
    'ancient, ageless',
    'ancient, ageless, with an air of lost ages',
    'young-looking but subtly out of time',
    'primeval, ageless',
    'primeval, godlike agelessness',
    'ancient, ageless',
    'ancient, ageless, moonlit',
    'ancient, ageless',
    'ancient, ageless, cosmic',
    'beyond age, cosmic',
    'beyond age, cosmic, outside time',
  ];

  FW.AGE_ALIAS = {
    'Young (0-20)': 'Young adult (18-24)',
    'Adult (21-40)': 'Adult (25-32)',
    'Middle-aged (41-60)': 'Middle-aged (41-50)',
    'Senior (61-100)': 'Elder (61-75)',
  };

  FW.HEIGHTS = [
    30, 34, 40, 46, 50, 52, 56, 58, 60, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 78, 80, 82, 84, 86,
    88, 92, 96, 100, 108, 120, 132, 144, 168,
  ];

  FW.HEIGHT_CLASSES = [
    { max: 24, name: 'Tiny', dsl: 'spd+2 str-2 dur-2', perk: 'Almost impossible to hit', flaw: 'One blow can end you' },
    { max: 48, name: 'Small', dsl: 'spd+1 str-1', perk: 'Nimble', flaw: 'Short reach' },
    { max: 66, name: 'Short', dsl: '', perk: '', flaw: '' },
    { max: 78, name: 'Average', dsl: '', perk: '', flaw: '' },
    { max: 96, name: 'Tall', dsl: 'str+1', perk: 'Long reach', flaw: '' },
    { max: 180, name: 'Giant', dsl: 'str+2 dur+1 spd-1', perk: 'Crushing frame', flaw: 'Easy target' },
    {
      max: 1200,
      name: 'Colossal',
      dsl: 'str+3 dur+2 spd-2 urban:spd-1',
      perk: 'Walking landmark',
      flaw: 'Cannot fit inside buildings',
    },
    {
      max: Infinity,
      name: 'Titanic',
      dsl: 'str+4 dur+3 spd-3',
      perk: 'A moving mountain',
      flaw: 'Everything is smaller than you',
    },
  ];

  FW.BACKGROUNDS = FW.table(`
You were just a nobody.|9|behind:all+2 fate+1|Underdog - gets stronger when losing|Nobody knows your name
You were a village orphan whose home burned.|8|fgt+1 dur+1|Survivor|Haunted by smoke
You were a soldier who abandoned the army.|7|fgt+1 wpn+1|Trained killer|Hunted as a deserter
You were a street thief with fast hands.|7|spd+1 int+1 str-1|Quick fingers|Untrained in open battle
You were a noble child cast out of the family.|6|int+1 fate+1|Educated|Spoiled
You were a hunter raised in the forest.|7|spd+1 wild:all+1|Tracker|Awkward in cities
You were a student hiding a forbidden art.|5|pwr+1 int+1|Secret knowledge|Wanted by the academy
You were a criminal seeking redemption.|6|fgt+1 fate+1|Second chance|Past catches up
You were a royal guard betrayed by your king.|5|wpn+1 fgt+1 ahead:all-1|Disciplined|Trusts no one
You were a cursed child feared by all.|5|pwr+2 fate-1|Hidden talent|Shunned
You were a runaway who lived with wolves.|5|spd+1 str+1 int-1|Feral instincts|Poor manners
You were a monk training in silence.|5|int+1 pwr+1|Focused mind|Naive about the world
You were a mercenary hired by the wrong side.|6|fgt+1 wpn+1|Battle-tested|Debts and enemies
You were born into a royal bloodline.|4|int+1 fate+1 rt+1|Authority|Assassins
You were betrayed by your family.|6|fgt+1 behind:fgt+1|Hardened|Cannot trust
You were banished by your clan.|6|dur+1 wild:all+1|Self-reliant|Alone
You were an apprentice of a dying master.|5|wpn+1 pwr+1|Heir to a style|Master's rivals hunt you
You were a shipwreck survivor.|5|dur+1 water:all+1|Endured the sea|Fears storms
You were a gladiator slave.|5|str+1 fgt+1 dur+1 fate-1|Arena-forged|Scarred
You were a scholar of forbidden ruins.|4|int+2 str-1|Lore-master|Frail
You were chosen by a dying god.|2|pwr+2 fate+1 rt+2|Divine spark|Hunted by rival gods
You were a plague survivor.|4|dur+1 r=poison|Immune to disease|Pariah
You were raised by monsters.|4|str+1 dur+1 int-1|Wild strength|Never learned human ways
You were the last of a lost people.|3|pwr+1 fate+1|Last heir|Everyone you knew is gone
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

  FW.PERSONALITIES = FW.table(`
Hero|8|fgt+1 o.spare*1.5 o.recruit*1.4 o.kill*0.5 o.enslave*0.2|Inspires allies|
Anti-Hero|7|str+1 o.kill*1.2 o.spare*0.8|Gets results|
Vigilante|6|spd+1 fgt+1 o.kill*1.4 o.spare*0.7|Takes justice into own hands|
Guardian|6|dur+1 o.spare*1.3 o.recruit*1.3|Shields others|
Protector|6|dur+1 o.recruit*1.5 o.kill*0.7|Stands between danger and the weak|
Pacifist|4|int+1 dur+1 str-1 fgt-1 o.spare*3 o.befriend*2 o.kill*0.1 o.enslave*0.1|Calm under pressure|Hates to strike first
Merciful|5|int+1 o.spare*2 o.kill*0.4|Offers a way out|
Ruthless|5|str+1 fgt+1 o.kill*2 o.spare*0.3|No hesitation|Makes enemies
Sadist|3|str+1 fgt+1 int-1 o.kill*1.8 o.enslave*2 o.spare*0.2|Thrives on fear|Reckless
Opportunist|5|spd+1 int+1 o.recruit*1.3 o.enslave*1.3|Spots every opening|
Mastermind|4|int+2 o.enslave*1.8 o.recruit*1.4|Plans six moves ahead|
Manipulator|4|int+1 o.enslave*2 o.recruit*1.2|Pulls strings|
Conqueror|3|str+1 fgt+1 ahead:all+1 o.enslave*2 o.kill*1.2|Presses every advantage|
Tyrant|3|str+1 int+1 o.enslave*2.5 o.kill*1.5 o.spare*0.2 o.befriend*0.2|Commands fear|
Revolutionary|4|fgt+1 behind:all+1 o.recruit*1.8|Fights harder against the odds|
Justice Seeker|5|fgt+1 int+1 o.banish*1.8 o.spare*1.2 o.kill*0.8|Righteous focus|
Lawful Good|6|dur+1 int+1 o.spare*1.4 o.kill*0.6 o.banish*1.3|Code of honour|
Neutral Good|6|fgt+1 o.spare*1.2 o.recruit*1.2|Does what is right|
Chaotic Good|5|spd+1 fgt+1 o.recruit*1.3 o.befriend*1.3|Free spirit with a kind heart|
Lawful Neutral|5|int+1 o.banish*1.6|By the book|
True Neutral|6|fate+1|Balanced and adaptable|
Chaotic Neutral|5|spd+1 int-1|Unpredictable|
Lawful Evil|4|int+1 str+1 o.enslave*1.8 o.kill*1.3 o.spare*0.5|Cold order|
Neutral Evil|4|str+1 o.kill*1.5 o.spare*0.5|Self-serving|
Chaotic Evil|4|str+2 int-1 o.kill*1.7 o.spare*0.2|Destruction for its own sake|
Stoic|5|dur+1 int+1 spd-1|Unshakable|
Hot-headed|5|str+1 fgt+1 int-1 behind:str+1|Burns bright|Acts before thinking
Trickster|5|spd+1 int+1 o.befriend*1.5 o.banish*1.4 o.kill*0.6|Never where you expect|
Loner|5|fgt+1 o.recruit*0.4 o.befriend*0.5 o.spare*1.3|Needs no one|Refuses help
Glory Hound|4|str+1 ahead:all+1 behind:all-1 o.kill*1.3|Shines in front of a crowd|Sulks when losing
Coward|3|spd+2 fgt-1 behind:spd+1 o.spare*1.5 o.kill*0.5|Fastest retreat in the realm|Flinches
Zealot|4|fgt+1 dur+1 int-1 holy:all+1 o.kill*1.5 o.banish*1.5 o.spare*0.5|Unshakable faith|Blind to doubt
Scholar|5|int+2 str-1 o.spare*1.3 o.recruit*1.2|Reads the fight like a book|Soft hands
Cheerful|6|dur+1 fate+1 o.befriend*2 o.kill*0.5|Impossible to discourage|
Vengeful|5|str+1 fgt+1 behind:all+1 o.kill*2 o.spare*0.2|Never forgets|Never forgives
Honourable|5|fgt+1 dur+1 o.spare*1.6 o.enslave*0.1|Fights fair|Predictable
Greedy|4|int+1 spd+1 o.enslave*1.6 o.absorb*2 o.spare*0.6|Always profits|Trusts no partner
Kind-hearted|6|dur+1 o.spare*1.6 o.befriend*1.6 o.kill*0.4|Sees the good in everyone|
Loyal|6|dur+1 fgt+1 o.recruit*1.4 o.spare*1.2|Never abandons a friend|
Free Spirit|5|spd+1 o.befriend*1.6 o.enslave*0.2|Goes where the wind goes|
Brooding|5|fgt+1 dark:all+1 o.spare*0.8|Mysterious and moody|
Playful|5|spd+1 fate+1 o.befriend*1.5 o.kill*0.6|Turns fights into games|
Ambitious|5|int+1 ahead:all+1 o.recruit*1.6 o.enslave*1.3|Always climbing|
Arrogant|4|str+1 ahead:all+1 behind:all-1 o.kill*1.3 o.enslave*1.3|Knows they are the best|Falls apart when wrong
Shy|4|int+1 o.befriend*1.3 o.recruit*0.7|Quiet observer|Hates attention
Calculating|4|int+2 o.recruit*1.3 o.absorb*1.3|Every move is a sum|
Thrill Seeker|4|spd+1 behind:all+1 o.befriend*1.2|Loves the danger|
Serene|4|int+1 pwr+1 o.spare*1.5 o.banish*1.3|Still water runs deep|
Paranoid|3|int+1 spd+1 o.kill*1.4 o.befriend*0.4|Always ready|Trusts no one
Gentle Giant|3|str+1 dur+1 o.spare*1.8 o.kill*0.4|Strong enough to be gentle|
Mad Genius|3|int+3 dur-1 o.absorb*1.8 o.enslave*1.3|Brilliant|Unstable
Bloodthirsty|3|str+1 fgt+1 int-1 o.kill*2.5 o.spare*0.1|Lives for the kill|Cannot stop
`);
})(typeof window !== 'undefined' ? window : globalThis);
