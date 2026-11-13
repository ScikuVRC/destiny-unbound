# Buff and debuff codes (`dsl`)

Every wheel entry has a `dsl`: a list of codes separated by spaces. The game turns them into the buffs and
debuffs you see on the card. A wrong code stops the mod or pack from loading, with a message naming the entry.

## Stats

| Code | Stat |
| --- | --- |
| `str` | Strength |
| `spd` | Speed |
| `dur` | Durability |
| `int` | Intelligence |
| `fgt` | Fighting skills |
| `wpn` | Weapon mastery |
| `pwr` | Power mastery |
| `all` | The five combat stats together: str, spd, dur, int, fgt |

`str+2` moves Strength two tiers up its ladder; `spd-1` moves Speed one tier down. Each stat has a long ladder
(Strength runs from "Frail" to "Godly"), so +1 is a noticeable step but not a huge one.

## Situational buffs (fights only)

`place:stat+n` only applies in fights in that place or situation:

```
dark:all+2            +2 to every combat stat in the dark
sun:str-1,spd-1       -1 Strength and -1 Speed in sunlight
behind:all+1          +1 to everything while losing
```

| Situation | Meaning |
| --- | --- |
| `dark`, `sun` | In darkness, in sunlight |
| `water`, `storm`, `fire`, `ice` | Near water, in a storm, near fire, in the cold |
| `void`, `holy` | In the void, on holy ground |
| `wild`, `urban` | In the wilds, in a city |
| `behind`, `ahead` | While losing, while winning |

## Elements

| Code | Meaning |
| --- | --- |
| `w=fire` | Weak to fire: fire attacks hurt more. |
| `r=ice` | Resists ice. |
| `a=holy` | Attacks with holy. |

Several at once: `w=fire,ice`. Elements the game uses: `fire`, `water`, `ice`, `lightning`, `poison`, `shadow`,
`holy`, `mind`, `metal`, `void`, `nature`, `time`, `sound`, `blood`. Other words are accepted but nothing in the
game attacks with them, so they would have no effect.

## Other codes

| Code | Meaning | Used on |
| --- | --- | --- |
| `fate+1` | One more Fate Token (a re-spin). `fate-1` takes one away. | any wheel |
| `rt+2` | Adds straight to the power rating. | any wheel |
| `hs=1.4` | Height scale: 1.4 is 40% taller, 0.6 is much shorter. | races |
| `life=s` / `m` / `l` / `a` | Lifespan: short (human), medium (dwarf), long, or ageless (vampire, kitsune). Changes the ages the age wheel offers. | races (default `m`) |
| `q=1` to `q=5` | Weapon quality. | weapons (default `q=2`) |
| `rar=1` to `rar=6` | Power rarity: 1 common, 6 cosmic. | powers (default `rar=2`) |
| `tt=1` to `tt=5` | Title tier. | titles (default `tt=1 rt+1`) |
| `o.kill*1.5` | Makes an arena outcome likelier (above 1) or rarer (below 1). Outcomes: `kill`, `spare`, `recruit`, `befriend`, `enslave`, `banish`, `absorb`. | personalities |
| `none` | Marks the "No weapon"-style empty slice. You rarely need it. | any wheel |

## Examples from the game

| Entry | dsl |
| --- | --- |
| Human (race) | `fate+1 life=s` |
| Dwarf (race) | `str+1 dur+1 spd-1 r=fire hs=0.78 life=m` |
| Orc (race) | `str+2 int-1 wild:str+1 life=s` |
| Cursed Village (birthplace) | `pwr+1 fate-1` |
| "You were just a nobody." (background) | `behind:all+2 fate+1` |
| Hero (personality) | `fgt+1 o.spare*1.5 o.recruit*1.4 o.kill*0.5 o.enslave*0.2` |
| Iron Skin (enhancement) | `dur+2 spd-1` |
| Fire (element) | `a=fire r=fire w=water fire:all+1` |
| Lightning (weakness) | `w=lightning` |
| Raven (companion) | `int+1` |
| Blessed by the Moon (mark of fate) | `fate+1 dark:all+1` |
| Hooded dark cloak (outfit) | `dark:spd+1` |

Hair and eyes entries usually have an empty `dsl`: they only change how the hero looks.

## Balance

- Most built-in entries add up to about +2: `str+2`, or `str+2 int-1 fate+1`.
- Strong entries get a small `w` (slice size) so they stay rare: compare Human (`w` 22) with Phoenixkin (`w` 2)
  and Djinn (`w` 1.8).
- A buff that only works in one situation (`dark:all+2`) can be bigger than one that always works.
- Give a strong entry a `flaw` and a matching debuff; it makes for better stories.
