03 - Sounds
===========
Music Box: replaces every sound, in every theme: the effects, the music (with its own battle music), and the
short tunes that play after a fight or a saga. The sounds are made in code by the mod kit, so they are free
to reuse.

  tick     Each time the wheel passes a slice. Keep it very short (under 0.1 seconds).
  reveal   When the wheel stops on a result.
  rare     A rare result, a won fight or a good ending.
  bad      A lost fight or a hero's death.
  click    Buttons.
  music    Background music. It loops, so make the end flow into the start.

Music for one scene (optional; a scene without its own track plays "music"):

  music-title    The title screen and New Legend.
  music-spin     While the hero is made.
  music-story    During a saga.
  music-battle   In the arena and versus. This template has one.

Stingers: a short tune over the music, which goes quiet underneath (a few seconds is plenty):

  victory   After a won fight or a happy ending.
  defeat    After a lost fight or a death.
  legend    A legendary ending.

Sounds at the top of mod.json play in every theme. To give one theme its own sounds, put a "sounds" block inside
that theme instead (see 06-full-example). Leave a sound out and the game keeps its own.

Formats: mp3, ogg, wav, m4a, aac, flac or webm, up to 30 MB each. Music is much smaller as .ogg or .mp3; the
music here is a short .wav only so the kit can make it without other tools.
Only use sounds you made yourself or whose licence lets you share them.
