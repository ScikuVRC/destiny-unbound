/* Destiny Unbound icon set: line icons drawn for the game (24x24, one stroke weight) that take the theme's colour,
   so the wheels, the legend sheet and the story look like one game on every system. Emoji the set doesn't cover
   stay emoji, and players can switch back to emoji in Options > Display.
   FW.icon(emoji) returns the icon's SVG (or the escaped emoji). SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const P = {
    person: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20.5c.8-4 3.6-6.2 7-6.2s6.2 2.2 7 6.2"/>',
    child:
      '<circle cx="12" cy="9" r="4.2"/><path d="M7 20.5c.6-3 2.6-4.8 5-4.8s4.4 1.8 5 4.8"/><path d="M10.4 9.6h.01M13.6 9.6h.01"/>',
    dna: '<path d="M8 3c0 5 8 5 8 9s-8 4-8 9"/><path d="M16 3c0 5-8 5-8 9s8 4 8 9"/><path d="M9.2 6.5h5.6M9.2 17.5h5.6M10.5 12h3"/>',
    castle:
      '<path d="M4 21V8h2.5v2.5H9V8h2.5v2.5h1V8H15v2.5h2.5V8H20v13z"/><path d="M10 21v-3.5a2 2 0 0 1 4 0V21"/><path d="M4 13h16"/>',
    hourglass:
      '<path d="M7 3h10M7 21h10"/><path d="M8 3v2.5c0 3 8 4.2 8 6.5s-8 3.5-8 6.5V21M16 3v2.5c0 3-8 4.2-8 6.5s8 3.5 8 6.5V21"/>',
    ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.2"/><path d="M6.5 8v3M10 8v4.2M13.5 8v3M17 8v4.2"/>',
    comb: '<path d="M3.5 9.5h17v3.2h-17z"/><path d="M5.5 12.7V19M8.5 12.7V19M11.5 12.7V19M14.5 12.7V19M17.5 12.7V19"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    coat: '<path d="M8 3 12 6l4-3 4.5 4-2.5 3v11H6V10L3.5 7z"/><path d="M12 6v15M9.5 13h.01M14.5 13h.01"/>',
    scroll:
      '<path d="M7 4h11a2 2 0 0 1 2 2v1h-3"/><path d="M17 7v11a3 3 0 0 1-3 3H6a3 3 0 0 0 3-3V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2h4"/><path d="M11.5 10H15M11.5 14H15"/>',
    masks:
      '<path d="M3.5 4.5h8v6a4 4 0 0 1-8 0z"/><path d="M12.5 9.5h8v6a4 4 0 0 1-8 0z"/><path d="M5.8 8h.01M9.2 8h.01M6 11.2c.8.8 2.2.8 3 0M14.8 13h.01M18.2 13h.01M15 17.2c.8-.8 2.2-.8 3 0"/>',
    cap: '<path d="M2 9.5 12 4.5l10 5-10 5z"/><path d="M6 11.5v4.8c3.4 2.2 8.6 2.2 12 0v-4.8M21.5 9.7V15"/>',
    dumbbell: '<path d="M2.5 9.5v5M6 7v10M18 7v10M21.5 9.5v5M6 12h12"/>',
    bolt: '<path d="M13.5 2 4.5 13.5h7L10.5 22l9-11.5h-7z"/>',
    shield: '<path d="M12 3 20 6v6c0 5-3.6 8-8 9.2C7.6 20 4 17 4 12V6z"/><path d="M12 7v10M8.5 11h7"/>',
    bulb: '<path d="M9.2 18h5.6M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6 1 1.4 1 2.4h5.6c0-1 .3-1.8 1-2.4A6 6 0 0 0 12 3z"/>',
    sword: '<path d="M20.5 3.5 19.6 8l-9.4 9.4-3.6-3.6L16 4.4z"/><path d="m5 13 6 6M7.6 16.4 4 20"/>',
    swords:
      '<path d="M3.5 3.5 14 14M20.5 3.5 10 14"/><path d="M6.5 17.5 9 15M17.5 17.5 15 15"/><path d="m4 19.5 2-2M20 19.5l-2-2M3.5 3.5 7 4M20.5 3.5 17 4"/>',
    fist: '<path d="M7 11V7.6a1.5 1.5 0 0 1 3 0V10M10 10V6.6a1.5 1.5 0 0 1 3 0V10M13 10V7.6a1.5 1.5 0 0 1 3 0V11M16 11V9.6a1.5 1.5 0 0 1 3 0V13c0 4.4-3 8-7 8h-.6c-3 0-5-2-6-4.8l-.9-2.7a1.5 1.5 0 0 1 2.7-1.2L7 14"/>',
    flame:
      '<path d="M12 2.5c1.2 4 6 6 6 11.5a6 6 0 0 1-12 0c0-3.2 1.8-5.3 3.2-6.3 0 2.2.9 3.3 2 3.3 0-3.4-.8-5.9.8-8.5z"/><path d="M12 21a2.6 2.6 0 0 1-2.6-2.6c0-1.6 1.4-2.7 2.6-4 1.2 1.3 2.6 2.4 2.6 4A2.6 2.6 0 0 1 12 21z"/>',
    spiral:
      '<path d="M12 12a1.6 1.6 0 0 1 3.2 0 3.2 3.2 0 0 1-6.4 0 4.8 4.8 0 0 1 9.6 0 6.4 6.4 0 0 1-12.8 0 8 8 0 0 1 16 0"/>',
    sparkle:
      '<path d="M11 3 12.9 8.6 18.5 10.5 12.9 12.4 11 18 9.1 12.4 3.5 10.5 9.1 8.6z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    orb: '<circle cx="12" cy="10" r="6.8"/><path d="M7 21h10l-1.8-3.6H8.8z"/><path d="M9 7.6a3.6 3.6 0 0 1 3-1.6"/>',
    heartbreak:
      '<path d="M12 20s-8.5-5-8.5-11A4.6 4.6 0 0 1 12 6.4 4.6 4.6 0 0 1 20.5 9c0 6-8.5 11-8.5 11z"/><path d="m12 6.4-1.8 4 2.8 2-2 4.2"/>',
    heart: '<path d="M12 20s-8.5-5-8.5-11A4.6 4.6 0 0 1 12 6.4 4.6 4.6 0 0 1 20.5 9c0 6-8.5 11-8.5 11z"/>',
    paw: '<path d="M12 12.6c-3 0-5.2 3.2-5.2 5.4 0 1.6 1.5 2.2 2.6 1.6.9-.4 1.6-.6 2.6-.6s1.7.2 2.6.6c1.1.6 2.6 0 2.6-1.6 0-2.2-2.2-5.4-5.2-5.4z"/><circle cx="5.6" cy="10" r="1.7"/><circle cx="9.3" cy="6.3" r="1.7"/><circle cx="14.7" cy="6.3" r="1.7"/><circle cx="18.4" cy="10" r="1.7"/>',
    crown: '<path d="M3 8l4.2 4.2L12 5l4.8 7.2L21 8l-2 11H5z"/><path d="M5 19h14"/>',
    comet:
      '<path d="m15.5 3.5 1.2 3.3 3.5.2-2.8 2.2 1 3.4-2.9-2-2.9 2 1-3.4L10.8 7l3.5-.2z"/><path d="M3 21l7.5-7.5M3 16.5l4.6-4.6M7.5 21l4.6-4.6"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5V20"/>',
    bag: '<path d="M9.2 3.5h5.6l-1.4 3.2h-2.8z"/><path d="M8 8.5c-2.3 2.3-3.5 5.3-3.5 7.6A4.9 4.9 0 0 0 9.4 21h5.2a4.9 4.9 0 0 0 4.9-4.9c0-2.3-1.2-5.3-3.5-7.6z"/><path d="M12 11.5v6.5M14 12.8h-2.8a1.3 1.3 0 0 0 0 2.6h1.6a1.3 1.3 0 0 1 0 2.6H10"/>',
    map: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
    arch: '<path d="M4.5 21V10a7.5 7.5 0 0 1 15 0v11z"/><path d="M9 21v-5.5a3 3 0 0 1 6 0V21M4.5 21h15"/>',
    horned:
      '<path d="M4.5 3.5 7.6 8.4M19.5 3.5 16.4 8.4"/><circle cx="12" cy="14" r="7"/><path d="m8.8 12.6 1.8 1M15.2 12.6l-1.8 1M9 17.6c1.8-1 4.2-1 6 0"/>',
    wing: '<path d="M2.5 8.5c2.2 0 3.8 1.2 4.6 3C8 9.3 9.9 8.2 12 8.2s4 1.1 4.9 3.3c.8-1.8 2.4-3 4.6-3-.8 3.4-2.6 6-4.8 7-.5-1-1.4-1.6-2.6-1.6-.3 1.8-1.1 3-2.1 3.8-1-.8-1.8-2-2.1-3.8-1.2 0-2.1.6-2.6 1.6-2.2-1-4-3.6-4.8-7z"/><path d="m10.6 8.4-.8-2.6M13.4 8.4l.8-2.6"/>',
    anvil:
      '<path d="M3.5 13.5h11.5l-2.2 3H6.3z"/><path d="M7 16.5v3.5M12 16.5v3.5M4.5 20.5h10"/><path d="m14.2 3.6 5.2 5.2-2 2-5.2-5.2zM15.8 7.2 9.5 13.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18"/>',
    trophy:
      '<path d="M8 3.5h8v5.5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5a3 3 0 0 0 3.2 4M16 5.5h3a3 3 0 0 1-3.2 4M12 13v3.5M8 21h8M9.5 16.5h5V21h-5z"/>',
    buoy: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="m6 6 3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>',
    angry:
      '<circle cx="12" cy="12" r="9"/><path d="m7.5 8.5 3 1.5M16.5 8.5l-3 1.5M9 11.5h.01M15 11.5h.01M8.5 17c2-1.4 5-1.4 7 0"/>',
    evil: '<circle cx="12" cy="12" r="9"/><path d="m7.5 9 3 1.2M16.5 9l-3 1.2M8 15c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M5.5 5 3 2.5M18.5 5 21 2.5"/>',
    curse:
      '<circle cx="12" cy="12" r="9"/><path d="M5 12s2.8-4.6 7-4.6 7 4.6 7 4.6-2.8 4.6-7 4.6S5 12 5 12z"/><circle cx="12" cy="12" r="2"/>',
    door: '<path d="M5.5 21V3.5h13V21M3.5 21h17"/><path d="M14.5 12.5h.01"/>',
    skull:
      '<path d="M12 3a7.5 7.5 0 0 0-7.5 7.5c0 3 1.5 4.6 3 5.6V19h9v-2.9c1.5-1 3-2.6 3-5.6A7.5 7.5 0 0 0 12 3z"/><circle cx="9.3" cy="11" r="1.7"/><circle cx="14.7" cy="11" r="1.7"/><path d="M10 19v2.5M14 19v2.5M12 19v2.5"/>',
    temple: '<path d="M12 2v4M10 4h4"/><path d="M4.5 21V11L12 6l7.5 5v10z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    tornado: '<path d="M3 4.5h18M5 8.5h14M7.5 12.5h10M10 16.5h6M11.5 20.5h2.5"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5z"/>',
    drop: '<path d="M12 3s6.5 7.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.2 12 3 12 3z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
    key: '<circle cx="7" cy="12" r="3.6"/><path d="M10.6 12H21M18 12v3.2M15 12v2.2"/>',
    ship: '<path d="M2.5 16.5h19L18 21H6z"/><path d="M12 3v13.5M12 4l6.5 10H12M12 6.5 6.5 14H12"/>',
    gem: '<path d="M6.5 3.5h11l3.5 5.5L12 21 3 9z"/><path d="M3 9h18M9.5 3.5 8 9l4 12 4-12-1.5-5.5"/>',
    ghost:
      '<path d="M5.5 21V10a6.5 6.5 0 0 1 13 0v11l-2.2-2-2.1 2-2.2-2-2.2 2-2.1-2z"/><path d="M9.8 10.5h.01M14.2 10.5h.01"/>',
    wizard: '<path d="M3 20.5h18"/><path d="M6 20.5 10.8 3.5l5.2 8-2.4.8 2.9 8.2"/><path d="M8.6 12.5h5"/>',
    rapier: '<path d="m21 3-12.5 12.5"/><path d="M6 13l5 5M8.5 15.5 4 20"/><circle cx="4" cy="20" r=".8"/>',
    columns:
      '<path d="M3 9.5 12 4l9 5.5z"/><path d="M5.5 9.5v8.5M9.5 9.5v8.5M14.5 9.5v8.5M18.5 9.5v8.5M3 21h18M3.5 18h17"/>',
    sunset:
      '<path d="M3 17.5h18M3 21h18M6.5 17.5a5.5 5.5 0 0 1 11 0"/><path d="M12 5v3.5M4.6 9.6l2.2 2.2M19.4 9.6l-2.2 2.2"/>',
    fleur:
      '<path d="M12 3c-2 2.6-2 5.6 0 8.5 2-2.9 2-5.9 0-8.5z"/><path d="M12 11.5c-1.6-2.6-5.6-3.2-7-.6-1 2 .6 4.4 3 3.6M12 11.5c1.6-2.6 5.6-3.2 7-.6 1 2-.6 4.4-3 3.6"/><path d="M7.5 15h9M12 15v6"/>',
  };
  // emoji -> icon. The variation selector (U+FE0F) is ignored when looking up.
  const MAP = {
    '🧝': 'person',
    '🧬': 'dna',
    '🏰': 'castle',
    '🏯': 'castle',
    '⏳': 'hourglass',
    '📏': 'ruler',
    '💇': 'comb',
    '👀': 'eye',
    '👁': 'eye',
    '🧥': 'coat',
    '📜': 'scroll',
    '🎭': 'masks',
    '🎓': 'cap',
    '🧑‍🎓': 'cap',
    '💪': 'dumbbell',
    '🏋': 'dumbbell',
    '⚡': 'bolt',
    '🛡': 'shield',
    '🧠': 'bulb',
    '🗡': 'sword',
    '⚔': 'swords',
    '🥋': 'fist',
    '🔥': 'flame',
    '🌀': 'spiral',
    '✨': 'sparkle',
    '🔮': 'orb',
    '💔': 'heartbreak',
    '💞': 'heart',
    '🐾': 'paw',
    '👑': 'crown',
    '🌠': 'comet',
    '📚': 'book',
    '💰': 'bag',
    '🗺': 'map',
    '🕳': 'arch',
    '👹': 'horned',
    '👿': 'horned',
    '😈': 'evil',
    '🐉': 'wing',
    '⚒': 'anvil',
    '🌍': 'globe',
    '🏆': 'trophy',
    '🆘': 'buoy',
    '👶': 'child',
    '🧒': 'child',
    '😠': 'angry',
    '🧿': 'curse',
    '🚪': 'door',
    '☠': 'skull',
    '💀': 'skull',
    '⛪': 'temple',
    '🌪': 'tornado',
    '🌑': 'moon',
    '🩸': 'drop',
    '🗝': 'key',
    '⛵': 'ship',
    '💎': 'gem',
    '👻': 'ghost',
    '🧙': 'wizard',
    '🤺': 'rapier',
    '⚜': 'fleur',
    '🏛': 'columns',
    '🌅': 'sunset',
  };
  FW.ICONS = P;
  FW.ICON_FOR = MAP;
  const esc = s =>
    String(s == null ? '' : s).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  FW.iconName = e => {
    if (!e) return '';
    const k = String(e).replace(/️/g, '');
    return MAP[k] || '';
  };
  FW.iconsOn = () => !(FW.prefs && FW.prefs.emojiIcons);
  /* the icon for an emoji, as inline SVG; the emoji itself when the set has none or the player prefers emoji */
  FW.icon = function (e, cls) {
    const n = FW.iconsOn() ? FW.iconName(e) : '';
    if (!n) return esc(e || '');
    return (
      '<svg class="ico' +
      (cls ? ' ' + cls : '') +
      '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      P[n] +
      '</svg>'
    );
  };
})(typeof window !== 'undefined' ? window : globalThis);
