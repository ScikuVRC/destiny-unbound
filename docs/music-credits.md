# Music credits and AI music record

The game has two kinds of music. **Classic** music is synthesized live in code for each theme. **HD music** is a
set of recorded tracks. Players pick one when they first launch the game and can switch any time in Options > Audio.
The current HD tracks are **placeholders made with ACE-Step** (an open-source AI music model, MIT licence) by the developer. They are disclosed in the
README's AI disclosure, the in-game credits and the store pages (itch.io: "AI Generated Sound").

This file records each track, the same way [art-credits.md](art-credits.md) does for the painted art.

## How the tracks are set up

- **Shipped files:** `app/music/<slot>.ogg`, listed in `app/data/music.js`.
- **Per-theme versions:** a theme can have its own version of any slot in `app/music/<theme>/` (listed under
  `FW.MUSIC_THEMES` in `app/data/music.js`). Without one, the shared track plays in every theme.
- **Originals:** the untouched downloads are kept in `music-src/`, which is not committed.
- **Processing:** each original was loudness-normalized to -18 LUFS, trailing silence was trimmed, and it was saved
  as Ogg Vorbis (quality 4).

To redo a track:

```
ffmpeg -i music-src/title.mp3 -af "loudnorm=I=-18:TP=-1.5:LRA=11,silenceremove=stop_periods=-1:stop_duration=1:stop_threshold=-60dB" -ar 48000 -c:a libvorbis -q:a 4 app/music/title.ogg
```

## Tracks

| Slot | Used for | File | Length | Model | Made |
| --- | --- | --- | --- | --- | --- |
| `title` | menus | `music/title.ogg` | 3:25 | ACE-Step | 2026-11-14 |
| `spin` | making a hero | `music/spin.ogg` | 2:39 | ACE-Step | 2026-11-14 |
| `story` | sagas | `music/story.ogg` | 3:18 | ACE-Step | 2026-11-14 |
| `battle` | fights, bosses, versus | `music/battle.ogg` | 2:00 | ACE-Step | 2026-11-14 |
| `victory` | won fight, good ending | `music/victory.ogg` | 0:15 | ACE-Step | 2026-11-14 |
| `defeat` | lost fight, death | `music/defeat.ogg` | 0:15 | ACE-Step | 2026-11-14 |
| `legend` | rare endings | `music/legend.ogg` | 0:14 | ACE-Step | 2026-11-14 |

## Prompts

Suggested prompts for each slot (note the exact prompt and seed used in the table above when a track is kept). In ACE-Step, put them in the tags box and write `[instrumental]` in
the lyrics box. For loops, add `seamless loop, no intro, no outro`.

| Slot | Prompt |
| --- | --- |
| `title` | dark fantasy, orchestral, main theme, instrumental, slow solemn strings, low male choir, distant war drums, hurdy-gurdy, mysterious, grand, cinematic, minor key, 70 bpm |
| `spin` | dark fantasy, medieval folk, instrumental, plucked lute ostinato, harp, soft frame drum, light shaker, curious, anticipation, playful but mysterious, steady rhythm, 95 bpm |
| `story` | dark fantasy, cinematic folk, instrumental, solo cello melody, folk fiddle, warm low strings, soft wind ambience, wistful, hopeful, journey, adventure, minor key, 80 bpm |
| `battle` | epic dark fantasy, battle music, orchestral, instrumental, pounding taiko drums, war drums, aggressive low brass, staccato strings, chanting choir, tense, driving, fast, minor key, 140 bpm |
| `victory` | short triumphant fantasy fanfare, orchestral, instrumental, brass and timpani, rising, bright major chord ending, 5 seconds |
| `defeat` | short tragic fantasy sting, instrumental, solo cello, low choir, slow falling minor chord, fading out, 5 seconds |
| `legend` | short glorious ascension fanfare, orchestral, full choir, shimmering bells, harp glissando, rising to a radiant major chord, 8 seconds |

For per-theme versions, add one of these to a prompt: `ash and embers` (Ashen Crown), `celestial, ethereal` (Astral
Oracle), `pipe organ, industrial` (Iron Litany), `gothic, eerie` (Blood Moon).

## Using a hosted service instead

If a future track comes from Suno, only use songs made and downloaded on a paid Pro or Premier plan. Free-plan songs
are non-commercial only, and other users' songs can't be used at all. Suno's terms (effective 3 September 2026) were
checked on 2026-11-14.

## Making tracks with ACE-Step

ACE-Step 1.5 (MIT licence) is installed next to the game, in `../ACE-Step-1.5`. `scripts/make-music.py` makes
takes for any slot with the prompts above:

```
uv run --project ../ACE-Step-1.5 python scripts/make-music.py                 # every slot, 3 takes each
uv run --project ../ACE-Step-1.5 python scripts/make-music.py title battle -n 4
uv run --project ../ACE-Step-1.5 python scripts/make-music.py title --theme bloodmoon
```

Takes land in `music-src/takes/` as WAV files named `<slot>-<seed>.wav`. Keep the best one, convert it with the
ffmpeg line above, and log the model (ACE-Step 1.5 turbo) and seed in the table.
