/* Destiny Unbound name generator: people, houses, realms, cities, ships and the makers of artifacts, built from
   syllables so every saga meets new names. Every function takes the saga's rng, so a seed always gives the same
   names. Pure logic (no DOM): works in the browser, in node tests and in the Discord bot.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const pick = (a, rng) => a[Math.floor(rng() * a.length) % a.length];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // syllables per naming style: first part, middle (optional), ending
  const STYLE = {
    human: {
      a: [
        'al',
        'bran',
        'cor',
        'da',
        'ed',
        'gar',
        'hal',
        'is',
        'jor',
        'ka',
        'le',
        'mar',
        'ne',
        'or',
        'ro',
        'se',
        'tam',
        'wil',
        'ya',
        'el',
      ],
      m: ['', '', '', 'an', 'el', 'ri', 'o', 'ar'],
      z: ['ric', 'wyn', 'a', 'en', 'dric', 'ra', 'ton', 'is', 'ard', 'ia', 'mund', 'elle', 'ion', 'win', 'na'],
    },
    elven: {
      a: ['ae', 'cel', 'el', 'fae', 'gal', 'il', 'lor', 'mae', 'nim', 'sil', 'tha', 'vae', 'ar', 'eli', 'ny'],
      m: ['', 'a', 'e', 'ri', 'la', 'ne', 'tha'],
      z: ['riel', 'wen', 'dor', 'las', 'thil', 'nor', 'iel', 'ion', 'ae', 'wyn', 'diel', 'ra'],
    },
    dwarven: {
      a: ['bal', 'bor', 'dur', 'gim', 'grun', 'kaz', 'mor', 'thor', 'brom', 'dag', 'hild', 'tor', 'ulf', 'vor'],
      m: ['', '', 'a', 'i', 'u'],
      z: ['in', 'grim', 'dun', 'rak', 'li', 'gar', 'mek', 'dis', 'run', 'brak', 'hild', 'ok'],
    },
    orcish: {
      a: ['gor', 'grak', 'mog', 'thrak', 'uruk', 'zug', 'brog', 'krag', 'nar', 'ug', 'gash', 'dur'],
      m: ['', '', 'a', 'u', 'ka'],
      z: ['ash', 'nak', 'tuk', 'grim', 'gul', 'bag', 'rot', 'zog', 'mok', 'gar', 'thul'],
    },
    infernal: {
      a: ['az', 'bel', 'mal', 'xar', 'vor', 'zeph', 'ash', 'mor', 'nyx', 'kre', 'sha', 'ura'],
      m: ['', 'a', 'e', 'o', 'ra', 'ze'],
      z: ['zael', 'gorn', 'phas', 'rith', 'thar', 'oth', 'iel', 'mon', 'xis', 'rax', 'eth'],
    },
    fey: {
      a: ['bri', 'fen', 'lil', 'mir', 'pip', 'quil', 'thi', 'wil', 'ella', 'sor', 'tan', 'ivy'],
      m: ['', 'a', 'i', 'li', 'ne'],
      z: ['wick', 'bell', 'thorn', 'dew', 'ra', 'wyn', 'sy', 'ette', 'a', 'mere'],
    },
    beast: {
      a: ['ka', 'ru', 'sha', 'tor', 'wa', 'gra', 'hra', 'ash', 'fen', 'ral', 'ska', 'tu'],
      m: ['', '', 'a', 'o', 'ra'],
      z: ['ka', 'rek', 'tha', 'fang', 'mar', 'gan', 'ro', 'shi', 'ruk', 'nai'],
    },
    draconic: {
      a: ['vae', 'zar', 'kael', 'tyr', 'drak', 'syr', 'aur', 'ix', 'ry', 'vor', 'thy', 'ka'],
      m: ['', 'a', 'o', 'tha', 'ri'],
      z: ['gor', 'thrax', 'nyx', 'ion', 'rath', 'mira', 'zith', 'aros', 'vex', 'oth'],
    },
    undead: {
      a: ['mor', 'vel', 'cra', 'sar', 'nev', 'gha', 'lich', 'ul', 'sep', 'mal', 'ash', 'vor'],
      m: ['', 'e', 'u', 'ul', 'o'],
      z: ['dred', 'vain', 'gul', 'mort', 'cris', 'thas', 'eth', 'ren', 'oth', 'is'],
    },
  };
  // which naming style a race uses (by words in its name; humans when nothing matches)
  const RACE_STYLE = [
    [/elf|elven|fae|sylph|nymph|dryad|kitsune|moon|star|celestial|angel|light/i, 'elven'],
    [/dwarf|gnome|golem|giant|titan|stone|forge|gargoyle/i, 'dwarven'],
    [/orc|goblin|ogre|troll|hobgoblin|kobold|gnoll/i, 'orcish'],
    [/demon|devil|tiefling|oni|imp|infernal|shadow|abyss|void/i, 'infernal'],
    [/fairy|pixie|sprite|halfling|mothfolk|mycelid|satyr|wisp/i, 'fey'],
    [/beast|wolf|were|cat|fox|owl|bear|rat|frog|harpy|tengu|lizard|kin\b|folk/i, 'beast'],
    [/drag|wyrm|drake|naga|serpent|phoenix|thunderbird|leviathan/i, 'draconic'],
    [/skeleton|vampire|lich|ghost|reaper|mummy|dullahan|undead|revenant|spirit/i, 'undead'],
  ];
  const styleFor = race => {
    const r = String(race || '');
    const hit = RACE_STYLE.find(([re]) => re.test(r));
    return hit ? hit[1] : 'human';
  };

  // names that are hard to say: three vowels or consonants in a row, a doubled vowel, two vowels that clash
  const AWKWARD = /[aeiou]{3}|[^aeiouy]{3}|([aeiou])\1|ao|oa|ae[aeiou]|uo|ou[aeiou]|^.{11,}$/i;
  function word(rng, style) {
    const S = STYLE[style] || STYLE.human;
    let w = '';
    for (let tries = 0; tries < 30; tries++) {
      w = pick(S.a, rng) + pick(S.m, rng) + pick(S.z, rng);
      if (w.length >= 4 && !AWKWARD.test(w)) break;
    }
    return cap(w.slice(0, 10));
  }

  const EPITHET = [
    'the Envious',
    'the Unforgiving',
    'the Smiling',
    'the Hollow',
    'the Patient',
    'Ashborne',
    'Coldheart',
    'the Second',
    'the Grey',
    'Nightwhisper',
    'Thornblood',
    'of the Broken Oath',
    'the Pale',
    'Oathbreaker',
    'the Unkind',
    'Ironhand',
    'the Last',
    'Bloodsworn',
    'the Gilded',
    'Halfmoon',
  ];
  const HOUSE_A = [
    'Ash',
    'Black',
    'Bright',
    'Cold',
    'Dusk',
    'Ember',
    'Grey',
    'Hollow',
    'Iron',
    'Moon',
    'Raven',
    'Storm',
    'Sun',
    'Wolf',
    'Thorn',
    'Frost',
    'Gold',
    'Oak',
    'Silver',
    'Red',
  ];
  const HOUSE_Z = [
    'grove',
    'thorn',
    'water',
    'mere',
    'bane',
    'fall',
    'mantle',
    'well',
    'vale',
    'ridge',
    'crest',
    'hold',
    'helm',
    'wood',
    'ford',
    'gard',
    'brook',
    'spire',
  ];
  const PLACE_Z = [
    'mere',
    'holm',
    'reach',
    'gard',
    'vale',
    'mark',
    'ford',
    'haven',
    'moor',
    'fell',
    'wick',
    'stead',
    'march',
    'hollow',
  ];
  const SHIP_A = [
    'The Salt',
    'The Grey',
    'The Red',
    'The Laughing',
    'The Drowned',
    'The Wandering',
    'The Iron',
    'The Silver',
    'The Black',
    'The Last',
    'The Storm',
    'The Lucky',
  ];
  const SHIP_Z = [
    'Widow',
    'Gull',
    'Maiden',
    'Serpent',
    'Lantern',
    'Promise',
    'Crown',
    'Wolf',
    'Fortune',
    'Tide',
    'Saint',
    'Rose',
  ];

  const N = (FW.Names = {
    STYLES: Object.keys(STYLE),
    styleFor,
    /* a personal name in the style of a race (or a style name) */
    person: (rng, raceOrStyle) => word(rng, STYLE[raceOrStyle] ? raceOrStyle : styleFor(raceOrStyle)),
    /* a rival with an epithet: "Varnel the Envious" */
    nemesis: (rng, race) => word(rng, styleFor(race)) + ' ' + pick(EPITHET, rng),
    house: rng => 'House ' + pick(HOUSE_A, rng) + pick(HOUSE_Z, rng),
    realm: rng => {
      const w = word(rng, pick(['human', 'elven', 'dwarven', 'draconic'], rng));
      return w.length <= 6 && rng() < 0.5 ? w + pick(PLACE_Z, rng) : w;
    },
    city: rng => pick(HOUSE_A, rng) + pick(PLACE_Z, rng),
    ship: rng => pick(SHIP_A, rng) + ' ' + pick(SHIP_Z, rng),
    /* who made an artifact: "forged by Durgrim of Ironhold" */
    maker: rng => {
      const st = pick(['dwarven', 'elven', 'human', 'infernal'], rng);
      return word(rng, st) + (rng() < 0.5 ? ' of ' + pick(HOUSE_A, rng) + pick(PLACE_Z, rng) : '');
    },
  });
  void N;
})(typeof window !== 'undefined' ? window : globalThis);
