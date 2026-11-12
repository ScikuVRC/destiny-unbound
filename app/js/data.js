/* FATEWHEEL data - every wheel's entries.
   Row format:  Name|weight|dsl|perk text|flaw text
   DSL tokens (space separated):
     str+2 spd-1 dur+1 int+1 fgt+1 wpn+1 pwr+1 all+1   stat tier shifts
     dark:all+2  sun:str-1,spd-1  behind:all+1          conditional shifts (fight only)
         envs: dark sun water storm void fire ice holy wild urban behind ahead
     w=holy,fire  weak to elements     r=poison  resists     a=shadow  attacks with
     fate+1  extra Fate Token          hs=1.6  height scale   life=s|m|l|a  lifespan
     q=3 weapon quality   rar=4 power rarity   tt=2 title tier   rt+2 flat rating   lv=60 opponent level
     none = the "No X" slice
     o.kill*1.5  outcome weight multiplier (personality)
*/
(function (g) {
  const FW = g.FW = g.FW || {};

  function table(text) {
    return text.split('\n').map(s => s.trim()).filter(s => s && s[0] !== '#').map(line => {
      const f = line.split('|');
      return { name: f[0].trim(), w: parseFloat(f[1]), dsl: (f[2] || '').trim(), perk: (f[3] || '').trim(), flaw: (f[4] || '').trim() };
    });
  }
  FW.table = table;

  /* ---------------- ladders ---------------- */
  FW.LADDERS = {
    str: { label: 'Strength', short: 'STR', emoji: '💪', hue: 4, pk: 8, mystery: false, names: ['Frail','Weak','Below average','Average','Trained','Above average','Strong','Very strong','Peak human','Street level','Building level','Large building level','Block level','Town level','City level','Mountain level','Island level','Country level','Continent level','Planet level','Star level','Solar system level','Galaxy level','Universal level','Multiversal level','Godly'] },
    spd: { label: 'Speed', short: 'SPD', emoji: '⚡', hue: 52, pk: 5, mystery: false, names: ['Very slow','Slow','Below average','Average human','Athletic human','Elite runner','Peak human','Combat speed','Subsonic','Transonic','Supersonic','Supersonic+','Hypersonic','Hypersonic+','High hypersonic','Massively hypersonic','Massively hypersonic+','Sub-relativistic','Relativistic','FTL','Massively FTL','Infinite speed','Immeasurable'] },
    dur: { label: 'Durability', short: 'DUR', emoji: '🛡️', hue: 95, pk: 5, mystery: true, names: ['Fragile','Below average','Average','Tough','Resilient','Very resilient','Iron body','Steel body','Wall level','Small building level','Building level','Large building level','Block level','Town level','City level','Mountain level','Island level','Country level','Continent level','Planet level','Star level','Solar system level','Galaxy level','Universal level','Multiversal level','Near-immortal','Undying','Invincible','Absolute durability'] },
    int: { label: 'Intelligence', short: 'INT', emoji: '🧠', hue: 210, pk: 4, mystery: false, names: ['Very dumb','Dumb','Below average','Slightly below average','Average','Slightly above average','Above average','Smart','Very smart','Genius','Battle genius','Supergenius','Superhuman mind','Cosmic intellect','Universal intellect','Multiversal intellect','Near-omniscient','Omniscient'] },
    wpn: { label: 'Weapon mastery', short: 'WPN', emoji: '⚔️', hue: 112, pk: 4, mystery: false, names: ['Learner','Initiate','Adept','Skilled','Pro','Veteran','Elite','Expert','Master','Grandmaster','Legendary','Ascendant','Awakened','Transcendent','Supreme','Eternal'] },
    fgt: { label: 'Fighting skills', short: 'FGT', emoji: '🥋', hue: 0, pk: 5, mystery: false, names: ['Clumsy','Average minus','Average','Average plus','Slightly above average','Above average','Competent','Skilled','Well-trained','Experienced','Advanced','Strong','Very strong','Elite','High elite','Master','Grandmaster','Legendary','Transcendent','Supreme'] },
    pwr: { label: 'Power mastery', short: 'PWR', emoji: '🔮', hue: 128, pk: 4, mystery: false, names: ['Learner','Initiate','Adept','Skilled','Pro','Veteran','Elite','Expert','Master','Grandmaster','Legendary','Ascendant','Awakened','Transcendent','Supreme','Eternal'] }
  };
  FW.STATS = ['str','spd','dur','int','fgt','wpn','pwr'];
  FW.COMBAT_STATS = ['str','spd','dur','int','fgt'];
  FW.ENVS = ['dark','sun','water','storm','void','fire','ice','holy','wild','urban','behind','ahead'];
  FW.ENV_LABEL = { dark:'in darkness', sun:'in sunlight', water:'near water', storm:'in a storm', void:'in the void', fire:'near fire', ice:'in the cold', holy:'on holy ground', wild:'in the wilds', urban:'in a city', behind:'when losing', ahead:'when winning' };

  /* ---------------- luck levels ---------------- */
  FW.LUCK = [
    { id: 'mortal', name: 'Mortal',  k: 0,   tokens: 3, blurb: 'Fair odds. Most heroes are ordinary.' },
    { id: 'heroic', name: 'Heroic',  k: 2.2, tokens: 2, blurb: 'Rare slices swell. Legends happen.' },
    { id: 'mythic', name: 'Mythic',  k: 4.5, tokens: 2, blurb: 'Gods notice you. Cosmic tiers appear.' },
    { id: 'divine', name: 'Divine',  k: 7.5, tokens: 1, blurb: 'Reality bends - like the viral spins.' }
  ];

  /* ---------------- races ---------------- */
  FW.RACES = table(`
Human|22|fate+1 life=s|Adaptable - gain +1 Fate Token|
Dwarf|8|str+1 dur+1 spd-1 r=fire hs=0.78 life=m|Stonekin - tunnel-born endurance|Short legs, slow on open ground
Orc|8|str+2 int-1 wild:str+1 life=s|Warborn - raw strength, stronger in the wilds|Brutish instincts
Goblin|7|spd+1 int+1 str-1 dur-1 hs=0.7 life=s|Scrappy tinkerers|Frail frame
Skeleton|6|dur+1 r=poison,mind w=holy dark:dur+1 life=l|Undying bones - immune to poison and fatigue|Brittle against holy power
Beastkin|7|spd+1 str+1 int-1 life=s|Primal senses|Instinct over reason
Lizardfolk|6|dur+1 str+1 w=ice ice:spd-2 life=m|Scaled hide, strong in warm lands|Cold-blooded: sluggish in the cold
Elf|7|spd+1 int+1 str-1 wild:fgt+1 life=l|Graceful and long-lived, deadly in forests|Slender frame
Dark Elf|5|spd+1 fgt+1 dark:fgt+1 sun:all-1 life=l|Night-hunters - sharper in the dark|Dazzled by bright daylight
Fairy|4|spd+2 int+1 pwr+1 str-2 dur-2 w=metal hs=0.2 life=l|Flight and glamour|Cold iron burns
Mermaid|4|spd+1 int+1 water:all+2 urban:all-1 life=l|Sea-song - dominant in water|Out of her element in cities
Slime|4|dur+2 str-1 int-1 r=poison w=fire hs=0.8 life=l|Amorphous body - shrugs off blows|Fire dries it out
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
Titan|1|int-1 spd-1 str+1 dur+1 hs=8 life=a|Colossal ancient|Easy target
Eldritch Horror|0.8|int+2 pwr+2 dur+1 dark:pwr+2 sun:all-1 w=mind a=mind,void hs=3 life=a|Thing from beyond|Mind-shattering madness
Cosmic Entity|0.5|all+2 pwr+2 w=void life=a|Star-born being|Hunted by the void
Eternal|0.3|all+2 fate+1 life=a|Time cannot touch you|Lonely forever
God|0.25|all+3 pwr+3 fate+1 life=a|A divine being|Hunted by rival pantheons
`);

  /* sub-wheels keyed by race name */
  FW.SUBS = {
    'Elf': { title: 'Which elven kin?', emoji: '🧝', rows: table(`
Wood Elf|6|spd+1 wild:all+1|Forest-wise
High Elf|4|int+1 pwr+1|Scholar-mage
Sun Elf|3|fgt+1 sun:all+1 dark:all-1|Dawn-blessed
Moon Elf|3|int+1 dark:all+1|Night-seer
Sea Elf|2|water:all+1|Tide-kin
Elder Elf|1|int+2 pwr+1 str-1|Ancient sage|Frail with age
`)},
    'Vampire': { title: 'Which bloodline?', emoji: '🧛', rows: table(`
Fledgling|14||Newly turned
Thrall|12|dur-1 str-1|Bound servant|Weak blood
Night Hunter|10|spd+1|Stalker
Blood Knight|8|fgt+1 str+1|Sworn blade
Blood Noble|5|int+1 pwr+1|Court schemer
Elder|2|all+1 pwr+1|Centuries of power
Progenitor|0.6|all+2 pwr+2 sun:all-2|First of the line|Utterly helpless in sunlight
`)},
    'Demon': { title: 'What kind of demon?', emoji: '😈', rows: table(`
Fiend|14|str+1|Hellspawn
Imp|12|spd+1 str-1 dur-1|Tiny trickster
Brute Demon|8|str+2 int-1|Mindless might
Hellknight|6|fgt+1 dur+1|Infernal soldier
Warlock Demon|5|pwr+2 str-1|Spellcaster
Archdemon|2|all+1 pwr+1|Lord of legions
Demon Lord|0.8|all+2 pwr+2|Ruler of a circle of hell
Prince of Hell|0.3|all+3 pwr+3|Rivals gods
`)},
    'Dragonborn': { title: 'Which draconic bloodline?', emoji: '🐲', rows: table(`
Red Drake|10|a=fire|Furnace breath
Frost Drake|8|r=ice a=ice w=fire|Winter breath
Storm Drake|6|a=lightning r=lightning|Thunder breath
Venom Drake|6|a=poison r=poison|Acid breath
Gold Drake|3|int+1 pwr+1 a=holy|Radiant wyrmblood
Void Drake|1.5|pwr+2 a=void|Starless wyrmblood
Elder Wyrmblood|1|all+1 pwr+1|Ancient dragon heart
`)},
    'Spirit': { title: 'What kind of spirit?', emoji: '👻', rows: table(`
Nature Spirit|10|r=nature|Rooted in the wild
Ancestral Spirit|8|int+1|Voice of the dead
Storm Spirit|6|spd+1 a=lightning|Tempest-born
Vengeful Ghost|6|str+1 pwr+1 dark:all+1|Wronged and furious
Sorrow Wraith|5|int+1 a=mind|Grief given form
Elemental Lord|2|all+1 pwr+2|Primal sovereign
Void Spirit|1|pwr+2 a=void|Whisper from nothing
`)},
    'Angel': { title: 'What type of angel?', emoji: '🪽', rows: table(`
Guardian Angel|14|dur+1|Protector of mortals
Messenger Angel|12|spd+1|Swift herald
Healing Angel|12|dur+1 int+1|Mender of wounds
Warrior Angel|10|fgt+1 str+1|Soldier of the host
Virtue Angel|8|pwr+1|Miracle-worker
Power Angel|7|str+1 fgt+1|Keeper of the borders
Dominion Angel|5|int+1 pwr+1|Governor of angels
Throne Angel|4|dur+2|Seat of judgement
Cherub|3|int+1 pwr+1 a=fire|Flame-eyed guardian
Seraph|1.5|all+1 pwr+1 a=fire|Burning six-winged one
Archangel|1|all+1 pwr+1|Archangel perks: +1 to all stats, flight, immortality, divine aura
`)}
  };

  /* ---------------- birthplace ---------------- */
  FW.BIRTH = table(`
Broken Kingdom|9|fgt+1|War-hardened refugees
Forest Village|9|spd+1 wild:all+1|Hunters of the green
Cursed Village|6|pwr+1 fate-1|Hexwise|Whispers of ill luck follow you
Dead Land|6|dur+1 r=poison dark:dur+1|Barren and bone-dry|Nothing grows, nothing is kind
Flame Kingdom|6|r=fire a=fire fire:all+1|Forge-hardened
Ice Kingdom|6|r=ice w=fire ice:all+1|Frost-born
Mist Village|6|spd+1 int+1 str-1|Hidden in the fog
Iron Kingdom|6|dur+1 wpn+1 r=metal w=lightning|Smith-guild upbringing
Ruin City|6|int+1 spd+1 urban:all+1|Scavenger of old wonders
Merchant Republic|6|int+1 fate+1 str-1|Fortune and fine print
Shadow Realm|5|spd+1 dark:all+1 sun:all-1|Raised between lamps
Beast Forest|5|str+1 wild:all+1 int-1|Raised by claws
War Island|5|fgt+2 wpn+1|Born to the arena
Salt Desert|5|dur+1 sun:dur+1 water:all-1|Water-starved survivor
Sky Island|4|spd+1 storm:spd+1 water:dur-1|Cloud-walker
Holy Kingdom|4|int+1 holy:all+1 w=shadow|Chapel-schooled
Thunder City|4|spd+1 r=lightning storm:all+1|Storm-forged
Crystal City|4|int+1 pwr+1 urban:all+1|Arcane marketplace
Sun Empire|4|str+1 sun:all+1 dark:all-1|Sun-crowned
Deep Hollow|4|dur+1 dark:all+1|Cavern dweller
Dragon Peak|3|str+1 pwr+1 r=fire|Wyrm-watched
Abyss Realm|3|pwr+1 dur+1 dark:all+1 sun:all-1|Drowned dark
Floating Archipelago|3|spd+1 water:all+1|Island-hopper
Cloud Monastery|3|int+1 pwr+1 fgt+1|Silent masters
Star Temple|2|int+1 pwr+2|Observatory-born
Fallen Realm|2|pwr+1 fgt+1 fate-1|Ruined by its own gods
The Nowhere|1|pwr+2 void:all+2 fate-1|Born between worlds|Reality barely holds you
`);

  /* ---------------- age ---------------- */
  FW.AGES = table(`
Young (0-20)|14|spd+1 int-1|Quick and reckless|
Adult (21-40)|26||Prime of life|
Middle-aged (41-60)|18|fgt+1 spd-1|Battle-seasoned|Slowing down
Senior (61-100)|10|int+1 wpn+1 str-1 spd-1|Wise veteran|Aching bones
Centuries old|7|int+1 wpn+1|Centuries of practice|
Millennia old|3.5|int+2 pwr+1|Ancient memory|
Older than Earth|1.2|int+2 pwr+2|Remembers the first dawn|
Older than the Solar System|0.6|int+2 pwr+2 fgt+1|Remembers the first stars|
Older than the Galaxy|0.3|int+3 pwr+3|Witness of creation|
Older than the Universe|0.1|int+3 pwr+3 fgt+2|Was here before there was a here|
`);
  FW.AGE_RANGES = [[12,20],[21,40],[41,60],[61,100],[101,999],[1000,9999],null,null,null,null];
  FW.AGE_LIMIT = { s: 4, m: 5, l: 6, a: 10 };

  /* ---------------- height (human-scale inches) ---------------- */
  FW.HEIGHTS = [34,40,46,52,56,60,63,66,68,70,72,74,76,78,80,84,88,92,96,108,120,144];
  FW.HEIGHT_CLASSES = [
    { max: 24,        name: 'Tiny',     dsl: 'spd+2 str-2 dur-2', perk: 'Almost impossible to hit', flaw: 'One blow can end you' },
    { max: 48,        name: 'Small',    dsl: 'spd+1 str-1', perk: 'Nimble', flaw: 'Short reach' },
    { max: 66,        name: 'Short',    dsl: '', perk: '', flaw: '' },
    { max: 78,        name: 'Average',  dsl: '', perk: '', flaw: '' },
    { max: 96,        name: 'Tall',     dsl: 'str+1', perk: 'Long reach', flaw: '' },
    { max: 180,       name: 'Giant',    dsl: 'str+2 dur+1 spd-1', perk: 'Crushing frame', flaw: 'Easy target' },
    { max: 1200,      name: 'Colossal', dsl: 'str+3 dur+2 spd-2 urban:spd-1', perk: 'Walking landmark', flaw: 'Cannot fit inside buildings' },
    { max: Infinity,  name: 'Titanic',  dsl: 'str+4 dur+3 spd-3', perk: 'A moving mountain', flaw: 'Everything is smaller than you' }
  ];

  /* ---------------- background ---------------- */
  FW.BACKGROUNDS = table(`
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
`);

  /* ---------------- personality ---------------- */
  FW.PERSONALITIES = table(`
Hero|8|fgt+1 o.spare*1.5 o.recruit*1.4 o.kill*0.5 o.enslave*0.2|Inspires allies
Anti-Hero|7|str+1 o.kill*1.2 o.spare*0.8|Gets results
Vigilante|6|spd+1 fgt+1 o.kill*1.4 o.spare*0.7|Takes justice into own hands
Guardian|6|dur+1 o.spare*1.3 o.recruit*1.3|Shields others
Protector|6|dur+1 o.recruit*1.5 o.kill*0.7|Stands between danger and the weak
Pacifist|4|int+1 dur+1 str-1 fgt-1 o.spare*3 o.befriend*2 o.kill*0.1 o.enslave*0.1|Calm under pressure|Hates to strike first
Merciful|5|int+1 o.spare*2 o.kill*0.4|Offers a way out
Ruthless|5|str+1 fgt+1 o.kill*2 o.spare*0.3|No hesitation|Makes enemies
Sadist|3|str+1 fgt+1 int-1 o.kill*1.8 o.enslave*2 o.spare*0.2|Thrives on fear|Reckless
Opportunist|5|spd+1 int+1 o.recruit*1.3 o.enslave*1.3|Spots every opening
Mastermind|4|int+2 o.enslave*1.8 o.recruit*1.4|Plans six moves ahead
Manipulator|4|int+1 o.enslave*2 o.recruit*1.2|Pulls strings
Conqueror|3|str+1 fgt+1 ahead:all+1 o.enslave*2 o.kill*1.2|Presses every advantage
Tyrant|3|str+1 int+1 o.enslave*2.5 o.kill*1.5 o.spare*0.2 o.befriend*0.2|Commands fear
Revolutionary|4|fgt+1 behind:all+1 o.recruit*1.8|Fights harder against the odds
Justice Seeker|5|fgt+1 int+1 o.banish*1.8 o.spare*1.2 o.kill*0.8|Righteous focus
Lawful Good|6|dur+1 int+1 o.spare*1.4 o.kill*0.6 o.banish*1.3|Code of honour
Neutral Good|6|fgt+1 o.spare*1.2 o.recruit*1.2|Does what is right
Chaotic Good|5|spd+1 fgt+1 o.recruit*1.3 o.befriend*1.3|Free spirit with a kind heart
Lawful Neutral|5|int+1 o.banish*1.6|By the book
True Neutral|6|fate+1|Balanced and adaptable
Chaotic Neutral|5|spd+1 int-1|Unpredictable
Lawful Evil|4|int+1 str+1 o.enslave*1.8 o.kill*1.3 o.spare*0.5|Cold order
Neutral Evil|4|str+1 o.kill*1.5 o.spare*0.5|Self-serving
Chaotic Evil|4|str+2 int-1 o.kill*1.7 o.spare*0.2|Destruction for its own sake
Stoic|5|dur+1 int+1 spd-1|Unshakable
Hot-headed|5|str+1 fgt+1 int-1 behind:str+1|Burns bright|Acts before thinking
`);

  /* ---------------- weapons (quality q 1-5) ---------------- */
  FW.WEAPONS = table(`
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
`);
  /* race <-> weapon affinity (+1 weapon mastery) */
  FW.AFFINITY = {
    'Dwarf': ['Axe','Warhammer','Mace'], 'Orc': ['Axe','Greatsword','Claymore','Warhammer'],
    'Elf': ['Bow','Rapier','Saber'], 'Dark Elf': ['Twin Daggers','Crossbow','Dual Swords'],
    'Skeleton': ['Scythe','Spear'], 'Reaper': ['Scythe','Soul Reaver'], 'Goblin': ['Dagger','Throwing Knives','Crossbow'],
    'Beastkin': ['Spear','Whip'], 'Angel': ['Holy Lance','Claymore','Saber','Starforged Blade'], 'Demon': ['Cursed Blade','Flame Tongue','Chain Sickle'],
    'Mermaid': ['Trident'], 'Frost Giant': ['Frostbrand','Warhammer'], 'Dragonborn': ['Dragonbone Greatsword','Greatsword'],
    'Vampire': ['Rapier','Cursed Blade'], 'Kitsune': ['Katana','Arcane Tome'], 'Oni': ['Mace','Warhammer']
  };
  FW.NATURAL_WEAPONS = ['Orc','Beastkin','Werewolf','Dragonborn','Lizardfolk','Oni','Ghoul','Chimera','Leviathan','Vampire'];

  /* ---------------- enhancement ---------------- */
  FW.ENHANCEMENTS = table(`
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
`);

  /* ---------------- powers (rar 1-6) ---------------- */
  const POWER_BASE = { 1: 5, 2: 3.2, 3: 2, 4: 1.1, 5: 0.45, 6: 0.1 };
  FW.POWER_BASE = POWER_BASE;
  function powerRows(rar, items) {
    return items.split(',').map(s => s.trim()).filter(Boolean).map(s => {
      const m = s.split('=');
      const name = m[0].trim(); const a = m[1] ? ' a=' + m[1].trim() : '';
      return { name, w: POWER_BASE[rar], dsl: 'rar=' + rar + a, perk: '', flaw: '' };
    });
  }
  FW.POWERS = [{ name: 'No powers', w: 40, dsl: 'none', perk: 'Mundane - relies on skill and steel', flaw: '' }].concat(
    powerRows(1, 'Enhanced Senses, Quick Reflexes, Night Vision, Minor Telekinesis, Animal Empathy, Light Healing, Camouflage, Poison Resistance, Fire Resistance, Ice Resistance, Lightning Resistance, Weapon Imbuement, Spirit Reinforcement, Echolocation'),
    powerRows(2, 'Plant Manipulation=nature, Fire Manipulation=fire, Water Manipulation=water, Wind Manipulation, Earth Manipulation, Lightning Manipulation=lightning, Ice Manipulation=ice, Poison Manipulation=poison, Bone Manipulation, Crystal Manipulation, Metal Manipulation=metal, Temperature Manipulation, Sound Manipulation, Shadow Manipulation=shadow, Light Manipulation=holy, Blood Manipulation=blood, Regeneration, Regrowth, Flight, Telepathy=mind, Summoning, Weapon Summoning, Illusion Casting=mind, Rage Boost, Beast Transformation, Mana Control, Aura Manipulation, Emotion Manipulation=mind'),
    powerRows(3, 'Mind Manipulation=mind, Memory Manipulation=mind, Dream Manipulation=mind, Nightmare Manipulation=mind, Gravity Manipulation, Spirit Manipulation, Curse Manipulation=shadow, Absorption, Reversal, Counter Attack, Trickery, Duplication, Cloning, Phasing, Intangibility, Teleportation, Precognition, Dragon Form=fire, Angel Form=holy, Demon Form=shadow, Seal Breaking, Soul Breaking=void, Celestial Blessing=holy'),
    powerRows(4, 'Probability Manipulation, Luck Manipulation, Portal Creation, Time Skip=time, Immortality, Resurrection, Matter Manipulation, Energy Manipulation, Space Manipulation, Void Manipulation=void, Dimensional Travel, Soul Manipulation=void, Reality Distortion'),
    powerRows(5, 'Fate Manipulation, Time Stop=time, Time Manipulation=time, Absolute Defense, Absolute Offense, Concept Manipulation'),
    powerRows(6, 'Omnipotence, Reality Warping, Creation and Destruction')
  );

  /* ---------------- weaknesses ---------------- */
  FW.WEAKNESSES = table(`
No weaknesses|60|none|Nothing exploitable|
Lightning|4|w=lightning|Conductive body|Lightning wounds you deeply
Fire|4|w=fire|Burns easily|Fire wounds you deeply
Ice|4|w=ice|Chills to the bone|Ice wounds you deeply
Holy Light|4|w=holy|Sacred power burns|Holy power wounds you deeply
Shadow|3|w=shadow|Consumed by darkness|Shadow wounds you deeply
Poison|4|w=poison|Weak blood|Poison wounds you deeply
Silver and Cold Iron|3|w=metal|Allergic to the metals|Metal wounds you deeply
Mind Control|3|w=mind|Open mind|Mind attacks wound you deeply
Water|3|w=water water:dur-1|Drowned by the tide|Water wounds you deeply
Sunlight|3|sun:all-2|Weakened by daylight|
Darkness|3|dark:all-1|Night-blind|
Time Drain|2|w=time|Time cannot be spared|
Void Exposure|2|w=void|Fraying at the edges|
Poisoned State|3|dur-1 w=poison|Poison runs in your veins|
Cursed Weakness|3|str-1 fate-1|Cursed to fail|
Vitality Drain|3|dur-1 behind:all-1|Fades when hurt|
Blood Curse|2|w=blood dur-1|Bleeds without end|
Energy Leak|3|pwr-1|Power seeps away|
Focus Break|3|int-1 urban:int-1|Easily distracted|
Reactive Failure|2|fgt-1|Reflexes misfire|
Trauma|3|int-1 storm:all-1|Old scars flare|
Broken Vessel|2|dur-2|Cracked body|
Soulbound Body|2|pwr-1 w=holy|Soul tethered to a vow|
Delayed Recovery|3|behind:dur-1|Slow to heal|
Slow Regeneration|3|dur-1|Wounds linger|
Technique Rejection|2|pwr-1|Skills misfire under pressure|
Power Recoil|3|pwr-1 dur-1|Your power hurts you|
Self Damage|2|str-1 dur-1|Hits yourself too|
Overconfidence|3|ahead:all-2|Underestimates foes|Gets sloppy when winning
Fragile Mind|2|int-1 w=mind|Breaks under pressure|
Cowardice|2|behind:all-2|Panics when losing|
Berserk Curse|2|int-2 str+1|Loses control|
Seal Mark|2|pwr-2|Half your power is sealed|
Insatiable Hunger|2|fgt-1|Distracted by hunger|
Glass Cannon|2|dur-2 str+1|Hits hard, breaks easily|
`);

  /* ---------------- titles ---------------- */
  (function () {
    const t1 = ['Pure','Silent','Wandering','Pale','Mourning','Gilded','Hollow','Thorned','Veiled','Sleeping','Drowned','Ashen','Forgotten','Broken','Merciful'];
    const t2 = ['Burning','Frost','Crimson','Radiant','Storm-born','Iron','Hungering','Shattered','Unbound','Wrathful','Cursed','Chosen','Unyielding','Dreaming','Blighted'];
    const t3 = ['Doom','Eternal','Void','Starless','Nameless','Sovereign','Fallen','Last','First','Endless'];
    FW.TITLES = [];
    t1.forEach(a => FW.TITLES.push({ name: 'The ' + a + ' One', w: 5, dsl: 'tt=1 rt+1', perk: 'Whispered in taverns', flaw: '' }));
    t2.forEach(a => FW.TITLES.push({ name: 'The ' + a + ' One', w: 3, dsl: 'tt=2 rt+2', perk: 'Feared across the realm', flaw: '' }));
    t3.forEach(a => FW.TITLES.push({ name: 'The ' + a + ' One', w: 1.2, dsl: 'tt=3 rt+3', perk: 'A name that stops battles', flaw: '' }));
    [['The Scarlet King',2,2],['The Divine Judge',1.5,3],['The Shattered Knight',2.5,2],['The Pale Empress',1.5,3],['The Grave Warden',3,2],['The Last Lantern',2.5,2],['The Hollow Saint',1.5,3],['The Iron Prophet',2.5,2]]
      .forEach(x => FW.TITLES.push({ name: x[0], w: x[1], dsl: 'tt=' + x[2] + ' rt+' + x[2], perk: 'A legend in the making', flaw: '' }));
  })();

  /* ---------------- mark of fate ---------------- */
  FW.MARKS = table(`
Unmarked|60|none|Fate has not chosen a side|
Lucky Star|8|fate+1|Fortune smiles|
Blessed by the Moon|5|fate+1 dark:all+1|Moon-kissed|
Touched by Dawn|5|fate+1 sun:all+1|Dawn-kissed|
Echo of a Hero|3|fgt+1 wpn+1|Shades of a champion|
Marked by Death|4|fgt+1 dur-1 behind:all+1|Fights hardest at death's door|Death watches closely
Wolf's Pact|3|str+1 spd+1 fate-1|Bargained with the pack|The pack will collect
Cursed Bloodline|5|fate-1 pwr+1|Old sins, old power|Old sins, old debts
Chosen of the Old Gods|2.5|fate+2 pwr+1|Ancient favour|
Stargazer's Gift|2|int+2|Sees the pattern|
Crown of Thorns|2|dur+1 fate-1 rt+2|Pain and glory|
Doomed Prophecy|3|fate-2 pwr+2|Destined to fall - or to rise|
`);

  /* ---------------- fight ---------------- */
  FW.ARENAS = [
    { name: 'Moonless Night', tags: ['dark'], w: 10 }, { name: 'Blazing Noon', tags: ['sun'], w: 10 },
    { name: 'Sunken Temple', tags: ['water','holy'], w: 6 }, { name: 'Thunderstorm Peak', tags: ['storm'], w: 7 },
    { name: 'The Void Between', tags: ['void','dark'], w: 3 }, { name: 'Volcanic Forge', tags: ['fire'], w: 6 },
    { name: 'Frozen Waste', tags: ['ice'], w: 6 }, { name: 'Sacred Cathedral', tags: ['holy','sun'], w: 5 },
    { name: 'Ancient Forest', tags: ['wild'], w: 8 }, { name: 'Neon Megacity', tags: ['urban'], w: 7 },
    { name: 'Open Plains', tags: [], w: 12 }
  ];

  FW.UNIVERSES = [
    { name: 'Ashen Dominion', emoji: '🔥', hue: 12, blurb: 'Dark-fantasy kingdoms of ash and iron', opps: table(`
Warden of Cinders|10|lv=28 a=fire w=ice|Smoulders without rest
Ghoulking Marrow|9|lv=34 a=poison w=fire|Carrion crown
Hollow Knight Mord|8|lv=40 a=shadow w=holy|Armour with no one inside
Bone Colossus|7|lv=47 w=lightning|Walking cathedral of ribs
Crowned Wraith|6|lv=52 a=shadow r=shadow w=holy|Hunger in a crown
Ember Empress|4|lv=62 a=fire r=fire w=ice|Queen of the burning throne
Ashen Lich Veyra|3|lv=74 a=shadow,mind w=holy|Death-scholar
Dread Sovereign Kaelun|1.5|lv=88 a=shadow,void r=shadow w=holy|The last king of ash
`)},
    { name: 'Neon Ronin', emoji: '🌃', hue: 300, blurb: 'Cyber-samurai in a rain-lit megacity', opps: table(`
Chrome Oni|10|lv=30 a=metal w=lightning|Street enforcer
Street Sensei Kuro|9|lv=38|Teaches with a stick, finishes with a blade
Circuit Witch|8|lv=45 a=lightning w=water|Hexes the grid
Overclocked Tengu|7|lv=52 a=lightning r=lightning|Wings of copper
Ghost-Blade Yami|5|lv=58 a=shadow,metal|Vanishes between frames
Datastream Dragon|3|lv=72 a=lightning,mind|Lives in the network
Shogun Prime|2|lv=84 a=metal r=metal w=lightning|Corporate warlord
`)},
    { name: 'Star Accord', emoji: '🚀', hue: 215, blurb: 'Fleets, hives and star-knights', opps: table(`
Void Marine Orrin|10|lv=32 a=metal|Boarding-party veteran
Dread Drone Prime|8|lv=42 a=metal w=lightning|Machine hive-mind
Hive Matriarch Zzyl|7|lv=50 a=poison r=poison w=fire|Queen of the swarm
Nova Knight Seren|5|lv=60 a=fire,holy|Star-forged paladin
Quasar Duelist Ilya|4|lv=70 a=lightning r=lightning|Faster than light-lag
Planet-Eater Gorun|2|lv=90 a=void r=fire|Consumes worlds
`)},
    { name: 'Verdant Pantheon', emoji: '🌿', hue: 130, blurb: 'Wild gods of root, river and storm', opps: table(`
Thornlord Ashvane|10|lv=35 a=nature w=fire|Brambles for armour
Stag-King Haldir|8|lv=48 a=nature|Antlered monarch
River Mother Naia|7|lv=55 a=water r=water w=lightning|Tide in human form
Worldroot Titan|5|lv=75 a=nature r=nature w=fire|Roots reach the core
Avatar of Spring|3|lv=66 a=nature,holy w=fire|Renewal incarnate
Elder Storm-Hart|2|lv=80 a=lightning r=lightning w=ice|The tempest awake
`)},
    { name: 'Iron Covenant', emoji: '⚙️', hue: 35, blurb: 'War-forges, rune-smiths and siege titans', opps: table(`
General Brannock|10|lv=40 a=metal|Veteran of a hundred sieges
Rune-Smith Oda|8|lv=50 a=fire,metal|Hammers spells into steel
Siege Golem Mk-IV|7|lv=58 a=metal r=poison w=lightning|Walks through walls
Warlord Vask|6|lv=68 a=metal|Lord of the iron legions
Forge-God Ulm|2|lv=85 a=fire,metal r=fire w=ice|The covenant's patron
`)},
    { name: 'Void Court', emoji: '🕳️', hue: 270, blurb: 'The masked nobles of the empty dark', opps: table(`
Whisper Jester|10|lv=36 a=mind|Laughs in your own voice
Eclipse Duchess|7|lv=60 a=void,shadow w=holy|Hosts a banquet of nothing
Mirror Archon|6|lv=66 a=mind r=mind|Returns your own strength
Hollow Star|4|lv=80 a=void r=void|A dead sun with a will
The Nameless Throne|1|lv=95 a=void,time r=void,shadow|The Court's absent king
`)},
    { name: 'Dragonfall', emoji: '🐉', hue: 20, blurb: 'The age when wyrms ruled the sky', opps: table(`
Wyrmling Tessa|10|lv=30 a=fire|Hatchling with an attitude
Frost Wyrm Skarn|7|lv=58 a=ice r=ice w=fire|Glacier-scaled
Elder Storm Dragon|4|lv=74 a=lightning r=lightning w=ice|Rides the thunderhead
Dragon Emperor Zhalmarr|1.5|lv=92 a=fire,holy r=fire|Sovereign of wyrms
`)}
  ];

  FW.OUTCOMES = [
    { key: 'kill',     name: 'Kill him',          w: 25, blurb: 'Your name is feared.',        reward: 'rt+1' },
    { key: 'spare',    name: 'Spare him',         w: 24, blurb: 'He remembers your mercy.',    reward: 'fate+1' },
    { key: 'recruit',  name: 'Recruit him',       w: 20, blurb: 'A powerful ally joins you.',  reward: 'ally' },
    { key: 'enslave',  name: 'Enslave him',       w: 14, blurb: 'He serves under a binding.',  reward: 'ally' },
    { key: 'banish',   name: 'Banish him',        w: 9,  blurb: 'Sent beyond the edge of the world.', reward: 'rt+1' },
    { key: 'befriend', name: 'Befriend him',      w: 8,  blurb: 'An unlikely friendship begins.', reward: 'ally' },
    { key: 'absorb',   name: 'Absorb his power',  w: 5,  blurb: 'His strength becomes yours.', reward: 'absorb' }
  ];
  FW.DEFEATS = [
    { key: 'scar',     name: 'Left for dead',            w: 20, blurb: 'You survive, scarred: -1 Durability.' },
    { key: 'captured', name: 'Captured by the enemy',    w: 16, blurb: 'Chained, but not forgotten.' },
    { key: 'rescued',  name: 'Rescued by an ally',       w: 16, blurb: 'A friend pulls you out of the fire.' },
    { key: 'escaped',  name: 'Escaped through shadows',  w: 18, blurb: 'You live to fight again: +1 Fate Token.' },
    { key: 'awaken',   name: 'Awakening',                w: 6,  blurb: 'Near death, your power wakes: +2 Strength, +1 Power mastery.' },
    { key: 'death',    name: 'Your legend ends here',    w: 10, blurb: 'A hero\'s death. The Hall remembers.' }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
