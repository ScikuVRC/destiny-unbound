/* Destiny Unbound content: Weaknesses, titles, marks and companions.
   Pure data: no game logic lives here. Rows in FW.table(`...`) read Name|weight|effects|perk|flaw;
   see app/data/README.md for the effect codes. Order matters: Legend Codes and seeds refer to it. */
(function (g) {
  const FW = g.FW;

  FW.WEAKNESSES = FW.table(`
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

  FW.TITLES = FW.table(`
The Pure One|5|tt=1 rt+1|Whispered in taverns|
The Silent One|5|tt=1 rt+1|Whispered in taverns|
The Wandering One|5|tt=1 rt+1|Whispered in taverns|
The Pale One|5|tt=1 rt+1|Whispered in taverns|
The Mourning One|5|tt=1 rt+1|Whispered in taverns|
The Gilded One|5|tt=1 rt+1|Whispered in taverns|
The Hollow One|5|tt=1 rt+1|Whispered in taverns|
The Thorned One|5|tt=1 rt+1|Whispered in taverns|
The Veiled One|5|tt=1 rt+1|Whispered in taverns|
The Sleeping One|5|tt=1 rt+1|Whispered in taverns|
The Drowned One|5|tt=1 rt+1|Whispered in taverns|
The Ashen One|5|tt=1 rt+1|Whispered in taverns|
The Forgotten One|5|tt=1 rt+1|Whispered in taverns|
The Broken One|5|tt=1 rt+1|Whispered in taverns|
The Merciful One|5|tt=1 rt+1|Whispered in taverns|
The Burning One|3|tt=2 rt+2|Feared across the realm|
The Frost One|3|tt=2 rt+2|Feared across the realm|
The Crimson One|3|tt=2 rt+2|Feared across the realm|
The Radiant One|3|tt=2 rt+2|Feared across the realm|
The Storm-born One|3|tt=2 rt+2|Feared across the realm|
The Iron One|3|tt=2 rt+2|Feared across the realm|
The Hungering One|3|tt=2 rt+2|Feared across the realm|
The Shattered One|3|tt=2 rt+2|Feared across the realm|
The Unbound One|3|tt=2 rt+2|Feared across the realm|
The Wrathful One|3|tt=2 rt+2|Feared across the realm|
The Cursed One|3|tt=2 rt+2|Feared across the realm|
The Chosen One|3|tt=2 rt+2|Feared across the realm|
The Unyielding One|3|tt=2 rt+2|Feared across the realm|
The Dreaming One|3|tt=2 rt+2|Feared across the realm|
The Blighted One|3|tt=2 rt+2|Feared across the realm|
The Doom One|1.2|tt=3 rt+3|A name that stops battles|
The Eternal One|1.2|tt=3 rt+3|A name that stops battles|
The Void One|1.2|tt=3 rt+3|A name that stops battles|
The Starless One|1.2|tt=3 rt+3|A name that stops battles|
The Nameless One|1.2|tt=3 rt+3|A name that stops battles|
The Sovereign One|1.2|tt=3 rt+3|A name that stops battles|
The Fallen One|1.2|tt=3 rt+3|A name that stops battles|
The Last One|1.2|tt=3 rt+3|A name that stops battles|
The First One|1.2|tt=3 rt+3|A name that stops battles|
The Endless One|1.2|tt=3 rt+3|A name that stops battles|
The Scarlet King|2|tt=2 rt+2|A legend in the making|
The Divine Judge|1.5|tt=3 rt+3|A legend in the making|
The Shattered Knight|2.5|tt=2 rt+2|A legend in the making|
The Pale Empress|1.5|tt=3 rt+3|A legend in the making|
The Grave Warden|3|tt=2 rt+2|A legend in the making|
The Last Lantern|2.5|tt=2 rt+2|A legend in the making|
The Hollow Saint|1.5|tt=3 rt+3|A legend in the making|
The Iron Prophet|2.5|tt=2 rt+2|A legend in the making|
The Laughing Storm|3|tt=2 rt+2|Feared across the realm|
The Quiet Blade|3.5|tt=1 rt+1|Whispered in taverns|
The Ember Witch|2.5|tt=2 rt+2|Feared across the realm|
The Thorn Regent|2|tt=2 rt+2|Feared across the realm|
The Unburnt|2.5|tt=2 rt+2|Feared across the realm|
The Wolf of Winter|2.5|tt=2 rt+2|Feared across the realm|
The Tide Sovereign|1.5|tt=3 rt+3|A name that stops battles|
The Clockwork Saint|1.5|tt=3 rt+3|A name that stops battles|
The Star Eater|1|tt=3 rt+3|A name that stops battles|
The Kind Monster|3.5|tt=1 rt+1|Whispered in taverns|
The Oathbreaker|3|tt=2 rt+2|Feared across the realm|
The Moth Queen|1.5|tt=3 rt+3|A name that stops battles|
The Road Wanderer|4|tt=1 rt+1|Whispered in taverns|
The Ninth Shadow|2|tt=2 rt+2|Feared across the realm|
The Dawn Herald|2.5|tt=2 rt+2|Feared across the realm|
The Bone Gardener|2|tt=2 rt+2|Feared across the realm|
The Ash Walker|3.5|tt=1 rt+1|Whispered in taverns|
The Final Riddle|1|tt=3 rt+3|A name that stops battles|
The Unbowed|3|tt=1 rt+1|Whispered in taverns|
The Lantern Bearer|3.5|tt=1 rt+1|Whispered in taverns|
The Gentle Giant|3.5|tt=1 rt+1|Whispered in taverns|
The Silver Tongue|3.5|tt=1 rt+1|Whispered in taverns|
The Unlucky|4|tt=1 rt+1|Whispered in taverns|
The Small but Mighty|4|tt=1 rt+1|Whispered in taverns|
The Rust Knight|3|tt=1 rt+1|Whispered in taverns|
The Lucky Fool|4|tt=1 rt+1|Whispered in taverns|
The Sleepless Watcher|3|tt=1 rt+1|Whispered in taverns|
The Stray|4|tt=1 rt+1|Whispered in taverns|
The Thousand Cuts|2.5|tt=2 rt+2|Feared across the realm|
The Grave Dancer|2.5|tt=2 rt+2|Feared across the realm|
The Witch of the Fens|2.5|tt=2 rt+2|Feared across the realm|
The Hound of the North|2.5|tt=2 rt+2|Feared across the realm|
The Ninth Life|2.5|tt=2 rt+2|Feared across the realm|
The Crow King|2|tt=2 rt+2|Feared across the realm|
The Lady of Knives|2|tt=2 rt+2|Feared across the realm|
The Kindly Dread|2|tt=2 rt+2|Feared across the realm|
The Weeping Blade|2.5|tt=2 rt+2|Feared across the realm|
The Twice-Born|2|tt=2 rt+2|Feared across the realm|
The Moonlit Wolf|2.5|tt=2 rt+2|Feared across the realm|
The Pale Rider|2|tt=2 rt+2|Feared across the realm|
The Sword Saint|1.5|tt=3 rt+3|A name that stops battles|
The Sunbreaker|1.2|tt=3 rt+3|A name that stops battles|
The Worldwalker|1.2|tt=3 rt+3|A name that stops battles|
The Last Light|1.2|tt=3 rt+3|A name that stops battles|
The Godless Saint|1.2|tt=3 rt+3|A name that stops battles|
The One Who Returned|1|tt=3 rt+3|A name that stops battles|
`);

  FW.MARKS = FW.table(`
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
Storm-Called|3|spd+1 storm:all+1|Lightning never strikes you by accident|
Tide-Marked|3|fate+1 water:all+1|The sea returns what you lose|
Ember Brand|3|str+1 fire:all+1 w=ice|A burn that never cooled|
Raven's Favour|3|int+1 fate+1|Something is watching over you|
Twin Soul|2|fate+1 behind:all+1|Someone, somewhere, shares your pain|
Hollow Crown|2|rt+2 fate-1 ahead:all+1|Destined to rule, briefly|
Thirteenth Hour|1.5|spd+1 pwr+1 fate-1|You were born in a minute that does not exist|
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

  FW.PETS = FW.table(`
No companion|75|none|You travel alone|
Loyal Hound|6|fgt+1|Never leaves your side|
Raven|6|int+1|Scouts ahead and gossips|
Stray Cat|6|fate+1|Brings luck, takes credit|
Hunting Hawk|5|spd+1 wild:all+1|Eyes in the sky|
Grey Wolf|5|fgt+1 dark:spd+1|Hunts beside you|
War Horse|5|spd+1 urban:spd-1|Carries you into battle|Awkward in alleys
Old Owl|4|int+1 dark:int+1|Sees what you miss at night|
Pocket Slime|4|dur+1 r=poison|Soaks up blows and spills|
Cave Bear|3|str+1 dur+1 spd-1|A wall with claws|Slow to rouse
Fox Spirit|3|int+1 pwr+1|A second, slyer opinion|
Imp Familiar|3|pwr+1 fate-1 a=fire|Helpful, technically|Lies for fun
Fairy Sprite|3|spd+1 pwr+1 w=metal|A tiny, loud guide|
Clockwork Drone|3|int+1 wpn+1 w=lightning|Never misses a calculation|
Mimic Chest|2.5|dur+1 fate+1|Carries your loot, eats thieves|
Shadow Hound|2|fgt+1 dark:all+1 a=shadow|Runs inside your shadow|
Griffin|1.5|spd+2 str+1 rt+1|A mount worthy of songs|
Baby Dragon|1.2|str+1 pwr+1 r=fire a=fire rt+1|Small now|Expensive to feed
Phoenix Chick|1|fate+2 r=fire|Death is a short nap|
Celestial Stag|0.8|all+1 holy:all+1|Walks on light|
Void Cat|0.6|pwr+2 fate+1 void:all+1|Sits where reality is thin|
Pet Rock|4|dur+1 fate+1|Never complains|
Battle Goat|4|str+1 dur+1|Headbutts first|
Monkey Thief|4|spd+1 fate+1|Steals for you, mostly|
Messenger Pigeon|4|int+1|Always knows the way home|
Sea Turtle|3|dur+1 water:all+1|Slow, wise and armoured|
Snow Fox|3|spd+1 ice:all+1|White as fresh snow|
Giant Spider|2.5|fgt+1 dark:all+1 a=poison|Eight legs of loyalty|
Fire Salamander|2.5|r=fire a=fire|Lives in your campfire|
Living Book|2|int+2|Knows almost everything, and says so|
Will-o'-the-Wisp|2|int+1 fate+1 dark:all+1|Lights the way|
Storm Hawk|2|spd+1 storm:all+1 a=lightning|Rides the lightning|
Golem Buddy|2|str+1 dur+1 spd-1|A small stone friend|Slow to follow
Shadow Panther|1.5|spd+1 fgt+1 dark:all+1|Hunts from the dark|
Moon Rabbit|1.2|spd+1 fate+1 dark:all+1|Jumps between moonbeams|
Wyvern|1|str+1 spd+1 rt+1|A small dragon with a big attitude|
Kraken Hatchling|1|str+1 water:all+2|Still fits in a bucket|
Unicorn|0.8|dur+1 fate+1 holy:all+1 a=holy|Pure-hearted and stubborn|
`);
})(typeof window !== 'undefined' ? window : globalThis);
