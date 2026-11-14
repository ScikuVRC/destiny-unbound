# Game content

Every wheel's entries live here as plain data, so writers and translators can change content without touching
game logic. The files load in this order (`FW.DATA_FILES` in `app/js/data.js`, and the same list in
`app/index.html` and `app/sw.js`):

| File | What's in it |
| --- | --- |
| `core.js` | Stats, the tier ladders (Feeble to Beyond mortal reckoning), fight conditions, luck levels |
| `races.js` | Races, their sub-wheels (which elven kin?), and how each race looks in a portrait |
| `origins.js` | Birthplace, age, height, background, personality |
| `skills.js` | Class, element, weapons, natural weapons, race weapon affinity, enhancements, powers |
| `fate.js` | Weaknesses, titles, marks of fate, companions |
| `looks.js` | Hair, eyes, clothing, portrait styles and frames |
| `arena.js` | Arenas, the thirteen opponent worlds, what happens after a fight is won or lost |

Story chapters still keep their text in `app/js/story.js`.

## Rows

Most wheels are a table with one slice per line:

```
Name|weight|effects|perk|flaw
Dwarf|8|str+1 dur+1 spd-1 r=fire hs=0.78 life=m|Stonekin - tunnel-born endurance|Short legs, slow on open ground
```

- **weight:** how big the slice is. Bigger is likelier; compare it with the other rows of the same wheel.
- **perk / flaw:** the text shown on the card. Either can be empty.
- Blank lines and lines that start with `#` are skipped, so you can add comments.

## Effect codes

Space separated, in the third column:

| Code | Meaning |
| --- | --- |
| `str+2` `spd-1` `dur+1` `int+1` `fgt+1` `wpn+1` `pwr+1` `all+1` | shift a stat's tier up or down |
| `dark:all+2` `sun:str-1,spd-1` `behind:all+1` | shifts that apply only in a fight under that condition. Conditions: `dark sun water storm void fire ice holy wild urban behind ahead` |
| `w=holy,fire` | weak to these elements |
| `r=poison` | resists these |
| `a=shadow` | attacks with this element |
| `fate+1` | an extra Fate Token |
| `hs=1.6` | height scale |
| `life=s` / `m` / `l` / `a` | lifespan: short, medium, long, ageless |
| `q=3` | weapon quality |
| `rar=4` | power rarity (1 common to 6 cosmic) |
| `tt=2` | title tier (1 to 3) |
| `rt+2` | flat rating bonus |
| `lv=60` | an opponent's level |
| `none` | the "No X" slice of a wheel |
| `o.kill*1.5` | personality: multiplies the weight of a fight outcome |

## Things to keep in mind

- **Order matters.** Legend Codes, seeds and the daily challenge refer to entries by their place in a wheel. Add
  new rows at the end of a wheel, and never remove or reorder old ones. To retire a name, keep the row.
- **Ages** come in three matching lists in `origins.js`: `AGES` (the slices), `AGE_RANGES` (years shown, `null`
  for none) and `AGE_WORDS` (the word used in portrait prompts). Add to all three together.
- **Ladders** in `core.js`: `pk` is the index of the tier most rolls land around, and `decay` how fast rolls thin
  out above it. `LADDER_V1` keeps the old, shorter tier lists so old Legend Codes still load. Don't change it.
- After changing content, run `npm test`. It checks every wheel, and `node scripts/balance-report.js` shows how a
  change moves win rates and endings.
