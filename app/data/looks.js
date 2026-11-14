/* Destiny Unbound content: Hair, eyes, clothing and the portrait styles.
   Pure data: no game logic lives here. Rows in FW.table(`...`) read Name|weight|effects|perk|flaw;
   see app/data/README.md for the effect codes. Order matters: Legend Codes and seeds refer to it. */
(function (g) {
  const FW = g.FW;

  FW.HAIR = FW.table(`
Short black hair|10|||
Long black hair|8|||
Messy brown hair|9|||
Braided brown hair|7|||
Short blond hair|7|||
Long golden hair|6|||
Wild red hair|6|||
Auburn ponytail|5|||
Shaved head|5|||
Long silver hair|4|||
White hair in a topknot|4|||
Grey-streaked hair|4|int+1|Earned every grey strand|
Dark blue hair|3|||
Emerald green hair|3|||
Pink twin tails|2.5|||
Lavender curls|2.5|||
Ash-white undercut|3|||
Dreadlocks with gold rings|3|||
Hair like living flame|1|a=fire|It gives off real heat|
Hair of drifting starlight|0.8|pwr+1|Tiny constellations move in it|
Hair of flowing water|0.8|a=water|Never quite dry|
Curly black hair|7|||
Shaggy dark brown hair|7|||
Long wavy auburn hair|5|||
Sandy windswept hair|5|||
Golden curls|4|||
Short silver crop|3|||
Copper braids|3|||
Jet-black hair with a white streak|3|||
Grey wolf-cut hair|3|||
Cherry-red bob|2.5|||
Ice-blue braids|2|||
Twin braids tied with ribbons|3|||
Tall mohawk|2.5|||
Bald with tattooed scalp|2.5|int+1|Every tattoo is a spell|
Hair woven with leaves and flowers|1.5|wild:all+1|The forest grows in it|
Hair of black smoke|0.8|dark:all+1|It drifts even without wind|
Hair of glowing crystal|0.6|pwr+1|Rings softly when you move|
`);

  FW.EYES = FW.table(`
Brown eyes|10|||
Dark eyes|9|||
Blue eyes|8|||
Green eyes|7|||
Grey eyes|6|||
Hazel eyes|6|||
Amber eyes|4|||
Violet eyes|3|||
Red eyes|3|||
Golden eyes|3|||
Mismatched eyes, one blue and one gold|2|||
Pale blind eyes that still see|1.5|int+1 dark:all+1|Sight without light|
An eyepatch over one eye|3|fgt+1 spd-1|Learned to fight half-blind|No depth perception
Glowing white eyes|1.5|pwr+1|Power leaks out through them|
Slit-pupiled serpent eyes|2|spd+1|Tracks the smallest movement|
Eyes like a starry night sky|0.8|int+1 pwr+1|People forget what they were saying|
Ice-blue eyes|5|||
Dark green eyes|5|||
Silver eyes|3|||
Pink eyes|2.5|||
Fiery orange eyes|2|||
Cat-like yellow eyes|2|dark:spd+1|Sees in the dark|
Tired eyes with dark circles|3|int+1 spd-1|Sleepless genius|Always exhausted
Black eyes with no whites|1.5|dark:all+1|Unsettling to meet|
Eyes that glow purple|1.5|pwr+1|Magic shows in your gaze|
Blindfolded, fights by sound|1.5|fgt+1|Hears every footstep|
Eyes with clock-hand pupils|0.6|spd+1|Always a second ahead|
`);

  FW.GARB = FW.table(`
Travel-worn leather and a patched cloak|10||Looks like any wanderer|
Simple peasant clothes|8|behind:all+1|Nobody sees you coming|
Hooded dark cloak|7|dark:spd+1|Made for night work|
Chainmail and a tabard|6|dur+1|Solid, honest protection|
Heavy plate armour|4|dur+2 spd-1|A walking fortress|Loud and slow
Light scale armour|5|dur+1|Moves with you|
Flowing mage robes|5|pwr+1 dur-1|Embroidered with wards|Protects against nothing sharp
Monk's wraps and prayer beads|4|fgt+1|Nothing to grab, nothing to slow you|
Noble's embroidered coat|4|rt+1|Tailored to be remembered|
Fur and bone tribal armour|4|str+1 ice:dur+1|Warm and intimidating|
Sleek black assassin's garb|3|spd+1 dark:all+1 sun:all-1|Vanishes in shadow|Obvious at noon
Pirate coat and tricorn hat|3|spd+1 water:all+1|Sea-proof|
Ragged bandages and chains|3|dur+1 behind:all+1|Has clearly survived worse|
Ornate ceremonial armour|2.5|dur+1 rt+1 spd-1|Polished for parade|More gold than steel
Samurai armour|2.5|dur+1 wpn+1|Lacquered plates|
Desert wraps and a veil|3|sun:all+1|Made for the heat|
Clockwork exosuit|1.5|str+1 dur+1 w=lightning|Brass muscles|Needs winding
Armour grown from living crystal|1|dur+2 r=fire|Hums when struck|
Robes woven from night sky|0.8|pwr+2 dark:all+1|The stars on it move|
Radiant golden regalia|0.8|rt+2 holy:all+1|Hard to look at directly|
Ranger's green hood and cloak|5|wild:all+1|Blends into the woods|
Knight's surcoat and cape|4|dur+1|A banner on your back|
Thief's patched hood with many pockets|4|spd+1|Something useful in every pocket|
Black trench coat|4|urban:all+1|City-hunter's look|
Wizard's pointed hat and starry robes|3|pwr+1 dur-1|Every star is stitched by hand|Not armour
Ronin's worn kimono|3|wpn+1|Faded colours of an old lord|
Sailor's striped shirt and bandana|3|water:all+1|Smells like the sea|
Gothic lace and velvet|3|dark:all+1|Dressed for a midnight ball|
Priest's white vestments|3|holy:all+1|Embroidered with prayers|
Gladiator harness and helm|3|fgt+1 dur-1|Made to show off|Bare skin
Steampunk goggles and leather apron|3|int+1|Tools for every job|
Cyber jacket with neon trim|2.5|urban:all+1 spd+1|Glows in the rain|
Royal ballgown and jewels|2|rt+1|Every eye in the room|
Feathered shaman cloak|2|pwr+1|Each feather is a spirit|
Armour of dragon scales|0.8|dur+2 r=fire|Taken from a dragon - somehow|
Shadow-woven cloak that drinks light|0.8|dark:all+2|Torches dim as you pass|
`);

  FW.ART_STYLES = [
    {
      id: 'fantasy',
      name: 'Dark fantasy painting',
      text: 'epic dark-fantasy digital painting, dramatic rim lighting, rich colour, highly detailed, trading card illustration',
    },
    {
      id: 'anime',
      name: 'Anime',
      text: 'anime key visual, clean line art, cel shading, vivid colours, dynamic composition',
    },
    {
      id: 'realistic',
      name: 'Cinematic realism',
      text: 'cinematic photorealistic concept art, volumetric light, shallow depth of field, 85mm lens',
    },
    {
      id: 'comic',
      name: 'Comic book',
      text: 'western comic book cover art, bold ink outlines, halftone shading, strong colours',
    },
    {
      id: 'oil',
      name: 'Classical oil painting',
      text: 'classical oil painting, visible brushwork, chiaroscuro lighting, museum quality',
    },
    {
      id: 'storybook',
      name: 'Storybook watercolour',
      text: 'storybook watercolour illustration, soft washes, ink outlines, gentle palette',
    },
    {
      id: 'pixel',
      name: 'Pixel art',
      text: 'detailed 16-bit pixel art character portrait, limited palette, crisp pixels',
    },
    {
      id: 'ink',
      name: 'Black and white manga',
      text: 'black and white manga illustration, screentone shading, dramatic inking',
    },
  ];

  FW.ART_FRAMES = [
    { id: 'portrait', name: 'Portrait (waist up)', text: 'waist-up character portrait, facing the viewer' },
    { id: 'full', name: 'Full body', text: 'full-body character illustration, heroic stance, whole figure in frame' },
    { id: 'scene', name: 'Action scene', text: 'wide dynamic action scene, the character in the middle of the moment' },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
