/* Destiny Unbound content: HD music, recorded tracks that replace the synthesized music when the player opts in
   (asked on first launch, then Options > Audio > HD music). The files live in app/music/; an empty slot keeps the
   synthesized music, so the game works with any number of tracks. Every track's source is logged in
   docs/music-credits.md. The current tracks are placeholders made with an AI music model.
   Loops: title (menus), spin (making a hero), story (sagas), battle (arena fights, bosses, versus).
   Stingers, played once over the music: victory (a won fight or a good ending), defeat (a lost fight or death),
   legend (the rare endings). */
(function (g) {
  const FW = g.FW;

  // Shared by every theme.
  FW.MUSIC_FILES = {
    title: 'music/title.ogg',
    spin: 'music/spin.ogg',
    story: 'music/story.ogg',
    battle: 'music/battle.ogg',
    victory: 'music/victory.ogg',
    defeat: 'music/defeat.ogg',
    legend: 'music/legend.ogg',
  };
  // A theme's own tracks, used instead of the shared ones when present,
  // for example bloodmoon: { title: 'music/bloodmoon/title.ogg' }.
  FW.MUSIC_THEMES = {};
  FW.hasMusicFiles = () => Object.keys(FW.MUSIC_FILES).some(k => FW.MUSIC_FILES[k]);
})(typeof window !== 'undefined' ? window : globalThis);
