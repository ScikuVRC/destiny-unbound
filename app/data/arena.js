/* Destiny Unbound content: Arenas, opponent worlds, and what happens after a fight.
   Pure data: no game logic lives here. Rows in FW.table(`...`) read Name|weight|effects|perk|flaw;
   see app/data/README.md for the effect codes. Order matters: Legend Codes and seeds refer to it. */
(function (g) {
  const FW = g.FW;

  FW.ARENAS = [
    { name: 'Moonless Night', tags: ['dark'], w: 10 },
    { name: 'Blazing Noon', tags: ['sun'], w: 10 },
    { name: 'Sunken Temple', tags: ['water', 'holy'], w: 6 },
    { name: 'Thunderstorm Peak', tags: ['storm'], w: 7 },
    { name: 'The Void Between', tags: ['void', 'dark'], w: 3 },
    { name: 'Volcanic Forge', tags: ['fire'], w: 6 },
    { name: 'Frozen Waste', tags: ['ice'], w: 6 },
    { name: 'Sacred Cathedral', tags: ['holy', 'sun'], w: 5 },
    { name: 'Ancient Forest', tags: ['wild'], w: 8 },
    { name: 'Neon Megacity', tags: ['urban'], w: 7 },
    { name: 'Open Plains', tags: [], w: 12 },
    { name: 'Clocktower Rooftops', tags: ['urban', 'storm'], w: 5 },
    { name: 'Drowned Harbor', tags: ['water', 'dark'], w: 5 },
    { name: 'Burning Library', tags: ['fire', 'urban'], w: 4 },
    { name: 'Glacier Cathedral', tags: ['ice', 'holy'], w: 4 },
    { name: 'Midnight Jungle', tags: ['wild', 'dark'], w: 5 },
    { name: 'Desert of Glass', tags: ['sun', 'fire'], w: 5 },
    { name: 'Edge of the World', tags: ['void', 'storm'], w: 2 },
    { name: 'Grand Colosseum', tags: ['sun'], w: 8 },
    { name: 'Haunted Graveyard', tags: ['dark'], w: 6 },
    { name: 'Pirate Ship in a Storm', tags: ['water', 'storm'], w: 5 },
    { name: 'Floating Sky Islands', tags: ['storm'], w: 4 },
    { name: 'Abandoned Subway', tags: ['urban', 'dark'], w: 5 },
    { name: 'Lava Bridge', tags: ['fire'], w: 5 },
    { name: 'Crystal Caverns', tags: ['dark'], w: 5 },
    { name: 'Royal Throne Room', tags: ['urban', 'holy'], w: 4 },
    { name: 'Cherry Blossom Garden', tags: ['wild', 'sun'], w: 5 },
    { name: 'Ruined Castle', tags: [], w: 8 },
    { name: 'Snowy Mountain Pass', tags: ['ice', 'storm'], w: 5 },
    { name: 'Swamp of Whispers', tags: ['water', 'wild', 'dark'], w: 4 },
    { name: 'Stairway to Heaven', tags: ['holy', 'sun'], w: 3 },
    { name: 'Underwater Ruins', tags: ['water'], w: 4 },
    { name: 'Rooftops at Midnight', tags: ['urban', 'dark'], w: 5 },
    { name: 'Inside a Black Hole', tags: ['void'], w: 1.5 },
  ];

  FW.UNIVERSES = [
    {
      name: 'Ashen Dominion',
      emoji: '🔥',
      hue: 12,
      blurb: 'Dark-fantasy kingdoms of ash and iron',
      opps: FW.table(`
Warden of Cinders|10|lv=28 a=fire w=ice|Smoulders without rest|
Ghoulking Marrow|9|lv=34 a=poison w=fire|Carrion crown|
Hollow Knight Mord|8|lv=40 a=shadow w=holy|Armour with no one inside|
Bone Colossus|7|lv=47 w=lightning|Walking cathedral of ribs|
Crowned Wraith|6|lv=52 a=shadow r=shadow w=holy|Hunger in a crown|
Ember Empress|4|lv=62 a=fire r=fire w=ice|Queen of the burning throne|
Ashen Lich Veyra|3|lv=74 a=shadow,mind w=holy|Death-scholar|
Dread Sovereign Kaelun|1.5|lv=88 a=shadow,void r=shadow w=holy|The last king of ash|
`),
    },
    {
      name: 'Neon Ronin',
      emoji: '🌃',
      hue: 300,
      blurb: 'Cyber-samurai in a rain-lit megacity',
      opps: FW.table(`
Chrome Oni|10|lv=30 a=metal w=lightning|Street enforcer|
Street Sensei Kuro|9|lv=38|Teaches with a stick, finishes with a blade|
Circuit Witch|8|lv=45 a=lightning w=water|Hexes the grid|
Overclocked Tengu|7|lv=52 a=lightning r=lightning|Wings of copper|
Ghost-Blade Yami|5|lv=58 a=shadow,metal|Vanishes between frames|
Datastream Dragon|3|lv=72 a=lightning,mind|Lives in the network|
Shogun Prime|2|lv=84 a=metal r=metal w=lightning|Corporate warlord|
`),
    },
    {
      name: 'Star Accord',
      emoji: '🚀',
      hue: 215,
      blurb: 'Fleets, hives and star-knights',
      opps: FW.table(`
Void Marine Orrin|10|lv=32 a=metal|Boarding-party veteran|
Dread Drone Prime|8|lv=42 a=metal w=lightning|Machine hive-mind|
Hive Matriarch Zzyl|7|lv=50 a=poison r=poison w=fire|Queen of the swarm|
Nova Knight Seren|5|lv=60 a=fire,holy|Star-forged paladin|
Quasar Duelist Ilya|4|lv=70 a=lightning r=lightning|Faster than light-lag|
Planet-Eater Gorun|2|lv=90 a=void r=fire|Consumes worlds|
`),
    },
    {
      name: 'Verdant Pantheon',
      emoji: '🌿',
      hue: 130,
      blurb: 'Wild gods of root, river and storm',
      opps: FW.table(`
Thornlord Ashvane|10|lv=35 a=nature w=fire|Brambles for armour|
Stag-King Haldir|8|lv=48 a=nature|Antlered monarch|
River Mother Naia|7|lv=55 a=water r=water w=lightning|Tide in human form|
Worldroot Titan|5|lv=75 a=nature r=nature w=fire|Roots reach the core|
Avatar of Spring|3|lv=66 a=nature,holy w=fire|Renewal incarnate|
Elder Storm-Hart|2|lv=80 a=lightning r=lightning w=ice|The tempest awake|
`),
    },
    {
      name: 'Iron Covenant',
      emoji: '⚙️',
      hue: 35,
      blurb: 'War-forges, rune-smiths and siege titans',
      opps: FW.table(`
General Brannock|10|lv=40 a=metal|Veteran of a hundred sieges|
Rune-Smith Oda|8|lv=50 a=fire,metal|Hammers spells into steel|
Siege Golem Mk-IV|7|lv=58 a=metal r=poison w=lightning|Walks through walls|
Warlord Vask|6|lv=68 a=metal|Lord of the iron legions|
Forge-God Ulm|2|lv=85 a=fire,metal r=fire w=ice|The covenant's patron|
`),
    },
    {
      name: 'Void Court',
      emoji: '🕳️',
      hue: 270,
      blurb: 'The masked nobles of the empty dark',
      opps: FW.table(`
Whisper Jester|10|lv=36 a=mind|Laughs in your own voice|
Eclipse Duchess|7|lv=60 a=void,shadow w=holy|Hosts a banquet of nothing|
Mirror Archon|6|lv=66 a=mind r=mind|Returns your own strength|
Hollow Star|4|lv=80 a=void r=void|A dead sun with a will|
The Nameless Throne|1|lv=95 a=void,time r=void,shadow|The Court's absent king|
`),
    },
    {
      name: 'Dragonfall',
      emoji: '🐉',
      hue: 20,
      blurb: 'The age when wyrms ruled the sky',
      opps: FW.table(`
Wyrmling Tessa|10|lv=30 a=fire|Hatchling with an attitude|
Frost Wyrm Skarn|7|lv=58 a=ice r=ice w=fire|Glacier-scaled|
Elder Storm Dragon|4|lv=74 a=lightning r=lightning w=ice|Rides the thunderhead|
Dragon Emperor Zhalmarr|1.5|lv=92 a=fire,holy r=fire|Sovereign of wyrms|
`),
    },
    {
      name: 'Tideborn Deep',
      emoji: '🌊',
      hue: 195,
      blurb: 'Sunken empires and things with too many arms',
      opps: FW.table(`
Reef Raider Kessa|10|lv=29 a=water w=lightning|Smiles like a shark|
Brine Knight Odo|8|lv=41 a=water,metal w=lightning|Armour grown from coral|
Siren Regent Lyss|7|lv=53 a=mind,water w=sound|A voice you obey|
Trench Stalker|6|lv=61 a=shadow r=water w=holy|No one has seen all of it|
Kraken Oracle|3|lv=77 a=water,mind r=water w=fire|Reads the future in ink|
The Drowned Emperor|1.5|lv=91 a=water,void r=water,ice w=lightning|Still holds court below|
`),
    },
    {
      name: 'Clockwork Meridian',
      emoji: '🕰️',
      hue: 45,
      blurb: 'A brass world wound by forgotten engineers',
      opps: FW.table(`
Gearling Swarm|10|lv=27 a=metal w=lightning|A thousand tiny wrenches|
Inspector Brass|8|lv=39 a=metal r=poison w=lightning|Finds faults in everyone|
Pendulum Duelist|7|lv=49 a=metal|Never off the beat|
Steam Baroness Vell|5|lv=59 a=fire r=fire w=ice|Rules by pressure|
Chronosmith Arkwell|3|lv=73 a=time,metal w=lightning|Repairs yesterday|
The Unwound King|1.5|lv=89 a=time r=mind w=lightning|Ticks once a century|
`),
    },
    {
      name: 'Hollow Moon',
      emoji: '🌙',
      hue: 250,
      blurb: 'Dreams, moths and a city inside the moon',
      opps: FW.table(`
Lamp Thief Pim|10|lv=26 a=shadow w=holy|Steals the light you stand in|
Sleepwalker Knight|8|lv=42 a=mind w=sound|Fights without waking|
Moth Abbess|7|lv=51 a=shadow,mind w=fire|A sermon of wings|
Nightmare Courser|5|lv=63 a=mind r=shadow w=holy|Rides through bad dreams|
The Tidal Wolf|3|lv=76 a=ice,shadow r=ice w=fire|Chases the moon it lives in|
Mother of Eclipses|1.2|lv=93 a=void,shadow r=shadow,mind w=holy|When she blinks, it is night|
`),
    },
    {
      name: 'Dust and Spirits',
      emoji: '🤠',
      hue: 28,
      blurb: 'Gunslingers and ghosts on a haunted frontier',
      opps: FW.table(`
Rattlesnake Kid|10|lv=27 a=poison|Fastest draw in three towns|
Sheriff Bones|8|lv=38 a=shadow w=holy|Still enforcing the law after death|
Coyote Trickster|7|lv=47 a=mind|Never the same face twice|
Iron Horse Baron|5|lv=58 a=metal,fire w=water|Owns the railroad and everyone on it|
Ghost Rider Ezra|3|lv=71 a=shadow,fire w=holy|Rides a burning horse|
The Thunder Prophet|1.5|lv=87 a=lightning r=lightning w=nature|Calls down storms on sinners|
`),
    },
    {
      name: 'Arcane Academy',
      emoji: '🏫',
      hue: 262,
      blurb: 'Rival students and professors at a school of magic',
      opps: FW.table(`
Top Student Mirabel|10|lv=30 a=fire|Never got a grade below perfect|
Hall Monitor Grim|8|lv=37 a=metal|Enforces curfew with a golem|
Potions Master Vex|7|lv=49 a=poison r=poison w=fire|Has an antidote for everything except himself|
Headless Librarian|5|lv=57 a=mind w=fire|Shushes with lethal force|
Exiled Professor Kael|3|lv=73 a=void,mind w=holy|Taught the forbidden class|
The Headmistress|1.2|lv=92 a=time,holy r=mind|Has never once raised her voice|
`),
    },
    {
      name: 'Kaiju Coast',
      emoji: '🦖',
      hue: 150,
      blurb: 'Giant monsters and the pilots who fight them',
      opps: FW.table(`
Mecha Cadet Rin|10|lv=31 a=metal w=lightning|First week in the cockpit|
Crab Titan Kragg|8|lv=44 a=water r=water w=lightning|Shell like a fortress|
Smog Serpent|7|lv=52 a=poison r=poison w=fire|Breathes factory smoke|
Admiral Steelheart|5|lv=63 a=metal,fire w=lightning|Commands the last fleet|
Volcano Lizard Gorrak|3|lv=79 a=fire r=fire w=ice|Wakes once a century|
The Deep King|1.2|lv=94 a=water,void r=water w=holy|The reason the sea is so quiet|
`),
    },
  ];

  FW.OUTCOMES = [
    { key: 'kill', name: 'Kill him', w: 25, blurb: 'Your name is feared.', reward: 'rt+1' },
    { key: 'spare', name: 'Spare him', w: 24, blurb: 'He remembers your mercy.', reward: 'fate+1' },
    { key: 'recruit', name: 'Recruit him', w: 20, blurb: 'A powerful ally joins you.', reward: 'ally' },
    { key: 'enslave', name: 'Enslave him', w: 14, blurb: 'He serves under a binding.', reward: 'ally' },
    { key: 'banish', name: 'Banish him', w: 9, blurb: 'Sent beyond the edge of the world.', reward: 'rt+1' },
    { key: 'befriend', name: 'Befriend him', w: 8, blurb: 'An unlikely friendship begins.', reward: 'ally' },
    { key: 'absorb', name: 'Absorb his power', w: 5, blurb: 'His strength becomes yours.', reward: 'absorb' },
    {
      key: 'trophy',
      name: 'Take his weapon',
      w: 9,
      blurb: 'A trophy for your wall.',
      reward: 'rt+1',
      dsl: 'rt+1 wpn+1',
      text: 'You claim his weapon as a trophy (+1 Weapon mastery, +1 Renown).',
      scene: 'holding up the weapon taken from the defeated',
    },
    {
      key: 'teach',
      name: 'Make him teach you',
      w: 6,
      blurb: 'His technique becomes yours.',
      reward: 'skill',
      dsl: 'fgt+1',
      text: 'He teaches you his technique (+1 Fighting skills).',
      scene: 'training side by side with',
    },
    {
      key: 'imprison',
      name: 'Imprison him',
      w: 7,
      blurb: 'Locked away for good.',
      reward: 'rt+1',
      dsl: 'rt+1',
      text: 'He rots in your dungeon (+1 Renown).',
      scene: 'locking a cell door on',
    },
    {
      key: 'heal',
      name: 'Heal his wounds',
      w: 5,
      blurb: 'Kindness has its own power.',
      reward: 'fate+1',
      dsl: 'fate+1 int+1',
      text: 'You heal your enemy (+1 Fate Token, +1 Intelligence).',
      scene: 'kneeling to bandage the wounds of',
    },
    {
      key: 'curse',
      name: 'Curse him',
      w: 4,
      blurb: 'Power, for a price.',
      reward: 'pwr',
      dsl: 'pwr+1 fate-1',
      text: 'You curse him, and the curse feeds you (+1 Power mastery, −1 Fate Token).',
      scene: 'casting a dark curse over',
    },
    {
      key: 'throne',
      name: 'Take his throne',
      w: 3,
      blurb: 'His followers now kneel to you.',
      reward: 'rt+3',
      dsl: 'rt+3',
      text: 'His followers kneel to you (+3 Renown).',
      scene: 'seated on the throne of',
    },
  ];

  FW.DEFEATS = [
    { key: 'scar', name: 'Left for dead', w: 20, blurb: 'You survive, scarred: -1 Durability.' },
    { key: 'captured', name: 'Captured by the enemy', w: 16, blurb: 'Chained, but not forgotten.' },
    { key: 'rescued', name: 'Rescued by an ally', w: 16, blurb: 'A friend pulls you out of the fire.' },
    { key: 'escaped', name: 'Escaped through shadows', w: 18, blurb: 'You live to fight again: +1 Fate Token.' },
    { key: 'awaken', name: 'Awakening', w: 6, blurb: 'Near death, your power wakes: +2 Strength, +1 Power mastery.' },
    { key: 'death', name: 'Your legend ends here', w: 10, blurb: "A hero's death. The Hall remembers." },
    {
      key: 'humbled',
      name: 'Humbled, but wiser',
      w: 12,
      blurb: 'You learn from the beating: +1 Intelligence.',
      dsl: 'int+1',
      text: 'You learn from the beating (+1 Intelligence).',
      scene: 'kneeling in defeat, studying',
    },
    {
      key: 'vow',
      name: 'Swore revenge',
      w: 10,
      blurb: 'You train for the rematch: +1 Fighting skills.',
      dsl: 'fgt+1',
      text: 'You swear revenge and train for the rematch (+1 Fighting skills).',
      scene: 'swearing revenge on',
    },
    {
      key: 'disgraced',
      name: 'Disgraced',
      w: 9,
      blurb: 'Word of the loss spreads: −1 Renown.',
      dsl: 'rt-1',
      text: 'Word of the loss spreads (−1 Renown).',
      scene: 'walking away in disgrace from',
    },
    {
      key: 'cursed',
      name: 'Cursed by the victor',
      w: 7,
      blurb: 'A curse that also gives: −1 Fate Token, +1 Power mastery.',
      dsl: 'fate-1 pwr+1',
      text: 'The victor curses you, and it changes you (−1 Fate Token, +1 Power mastery).',
      scene: 'marked by a glowing curse from',
    },
  ];

  // Painted art (app/art/arena, app/art/foes; Created with Grok, see docs/art-credits.md). An arena shows the backdrop
  // of its first condition; one with none shows open plains. Foes without a portrait just show no picture.
  FW.ARENA_ART = {
    dark: 'dark',
    sun: 'sun',
    water: 'water',
    storm: 'storm',
    void: 'void',
    fire: 'fire',
    ice: 'ice',
    holy: 'holy',
    wild: 'wild',
    urban: 'urban',
    none: 'plains',
  };
  FW.FOE_ART = {
    'Ashwing the Young': 'ashwing',
    Rimefang: 'rimefang',
    Stormcrown: 'stormcrown',
    Venomscale: 'venomscale',
    Nightmaw: 'nightmaw',
    'The Gold Tyrant': 'goldtyrant',
    'Vaelgor the World-Burner': 'vaelgor',
    'Dread Sovereign Kaelun': 'kaelun',
    'Shogun Prime': 'shogun',
    'Planet-Eater Gorun': 'gorun',
    'Elder Storm-Hart': 'stormhart',
    'Forge-God Ulm': 'ulm',
    'The Nameless Throne': 'nameless',
    'Dragon Emperor Zhalmarr': 'zhalmarr',
    'The Drowned Emperor': 'drowned',
    'The Unwound King': 'unwound',
    'Mother of Eclipses': 'eclipse',
    'The Thunder Prophet': 'prophet',
    'The Headmistress': 'headmistress',
    'The Deep King': 'deepking',
  };

  // Boss tricks, by name (engine.js FW.matchup applies them; a 'phases' boss rises again after a win).
  // ward: your element bonuses don't count. immune: that element does nothing. punish: attacking with that element
  // costs you. enrage: harder when you're the weaker one. phases: a second fight, 8 levels stronger.
  FW.BOSS_MECH = {
    'Ashwing the Young': { kind: 'enrage' },
    Rimefang: { kind: 'immune', elem: 'ice' },
    Stormcrown: { kind: 'immune', elem: 'lightning' },
    Venomscale: { kind: 'immune', elem: 'poison' },
    Nightmaw: { kind: 'punish', elem: 'holy' },
    'The Gold Tyrant': { kind: 'punish', elem: 'shadow' },
    'Vaelgor the World-Burner': { kind: 'phases' },
    'Dread Sovereign Kaelun': { kind: 'phases' },
    'Shogun Prime': { kind: 'enrage' },
    'Planet-Eater Gorun': { kind: 'phases' },
    'Elder Storm-Hart': { kind: 'punish', elem: 'fire' },
    'Forge-God Ulm': { kind: 'immune', elem: 'fire' },
    'The Nameless Throne': { kind: 'ward' },
    'Dragon Emperor Zhalmarr': { kind: 'phases' },
    'The Drowned Emperor': { kind: 'immune', elem: 'water' },
    'The Unwound King': { kind: 'immune', elem: 'lightning' },
    'Mother of Eclipses': { kind: 'ward' },
    'The Thunder Prophet': { kind: 'punish', elem: 'lightning' },
    'The Headmistress': { kind: 'ward' },
    'The Deep King': { kind: 'phases' },
  };

  // Painted ending illustrations (app/art/endings/<ending>.webp) and default hero portraits
  // (app/art/portraits/<file>.webp) for heroes without their own picture. Created with Grok.
  // A portrait list per race: files ending in f are feminine, m masculine; others suit anyone.
  FW.ENDING_ART = [
    'dead',
    'retired',
    'ascended',
    'lost',
    'martyr',
    'sealed',
    'damned',
    'fulfilled',
    'undying',
    'legend',
  ];
  FW.PORTRAITS = {
    Human: ['human-f1', 'human-f2', 'human-m1', 'human-m2'],
    Dwarf: ['dwarf-m1', 'dwarf-m2', 'dwarf-m3'],
    Orc: ['orc-f1', 'orc-m1', 'orc-m2'],
    Goblin: ['goblin-m1'],
    Elf: ['elf-f1', 'elf-m1'],
    'Dark Elf': ['darkelf-f1'],
    Beastkin: ['beastkin-1'],
    Halfling: ['halfling-f1'],
    Skeleton: ['skeleton-1'],
    Lizardfolk: ['lizardfolk-1'],
    Gnome: ['gnome-m1'],
  };
})(typeof window !== 'undefined' ? window : globalThis);
