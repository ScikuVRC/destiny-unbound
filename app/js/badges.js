/* Destiny Unbound achievement badges: one emblem per achievement, drawn in code like the icon set, on a medal whose
   shape and metal show how rare it is (bronze: most players earn it, silver: some do, gold: few do; from
   scripts/achievement-report.js). Locked badges are dull grey. Players who prefer emoji (Options > Display) keep them.
   FW.badge(id, emoji) returns the badge's SVG. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});

  /* emblems the icon set doesn't have yet (24x24, one stroke weight, like icons.js) */
  const NEW = {
    die: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>',
    grave: '<path d="M6 21V10a6 6 0 0 1 12 0v11"/><path d="M3.5 21h17M12 8.5v6M9.5 11h5"/>',
    ten: '<path d="M7.5 5.5l9 13M16.5 5.5l-9 13"/><path d="M5 5.5h5M14 5.5h5M5 18.5h5M14 18.5h5"/>',
    hands:
      '<path d="M2.5 11 6 7.5l3.2 1.4L12 7l3.5 1.6L21.5 11"/><path d="M6 7.5V14l4.6 4.2a1.6 1.6 0 0 0 2.3-.1L18 12.4 17.4 9"/><path d="M10 15.4l2.4-2.4M12.3 17.2l2.4-2.4"/>',
    mouse:
      '<path d="M4.5 17c0-4.7 3.5-8.5 8-8.5 3.4 0 5.8 2.2 6.8 5.2l2.2 1.3-2.3.9c-1 2.6-3.6 4.1-6.7 4.1H7"/><circle cx="9" cy="7.2" r="2.6"/><path d="M15.6 13.4h.01M4.5 17c-1.6.2-2.2 1.6-1.6 3.2"/>',
    calendar:
      '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17.2h.01M12 17.2h.01"/>',
    calendar3:
      '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M6.3 14.6l1.2 1.3 2-2.5M10.8 14.6l1.2 1.3 2-2.5M15.3 14.6l1.2 1.3 2-2.5"/>',
    dove: '<path d="M3 13.5c3 .4 5.2-.2 7.2-2.2l3.3-4.4a3 3 0 0 1 5 1.4l2.5 1-2.5 1.2c-.6 5-4.6 8.3-9.6 8.3-2.5 0-4.5-1.1-5.9-2.6"/><path d="M10.2 11.3 7.2 5.6c3 0 5.3 1.4 6.1 3.6M17.4 8.5h.01"/>',
    medal:
      '<path d="M8.4 3 12 9.6 15.6 3"/><circle cx="12" cy="15.2" r="5.6"/><path d="M12 12.3l.9 1.9 2.1.3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.4 2.1-.3z"/>',
    star: '<path d="M12 3.2l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.1 6.6 20l1-6.1-4.4-4.3 6.1-.9z"/>',
    candle:
      '<path d="M8.5 21v-9.6h7V21M6 21h12M12 11.4V8.8"/><path d="M12 8.8c-1.7-1.4-1.7-3.4 0-5.6 1.7 2.2 1.7 4.2 0 5.6z"/>',
  };

  /* id: [emblem, tier]  (the emblem is a key of NEW or of the icon set) */
  const B = {
    first: ['die', 1],
    story: ['book', 1],
    brief: ['grave', 3],
    ch10: ['ten', 1],
    ch25: ['shield', 2],
    retire: ['sunset', 1],
    ascend: ['sparkle', 3],
    lost: ['spiral', 3],
    king: ['castle', 1],
    world: ['globe', 3],
    dragon: ['wing', 2],
    nemesis: ['horned', 3],
    turncoat: ['hands', 3],
    heir: ['child', 2],
    dynasty: ['crown', 3],
    hoard: ['gem', 3],
    army: ['swords', 2],
    underdog: ['mouse', 3],
    cosmic: ['comet', 2],
    god: ['bolt', 3],
    old: ['hourglass', 1],
    daily: ['calendar', 2],
    daily3: ['calendar3', 3],
    arena: ['sword', 1],
    arena5: ['trophy', 1],
    giant: ['fist', 3],
    mercy: ['dove', 1],
    recruit: ['medal', 1],
    survivor: ['heart', 1],
    prophecy: ['scroll', 2],
    devil: ['evil', 3],
    sleeper: ['moon', 3],
    legend: ['star', 2],
    martyr: ['candle', 3],
  };
  FW.BADGES = B;
  FW.BADGE_TIERS = ['', 'bronze', 'silver', 'gold'];

  const METAL = {
    1: ['#f0b37a', '#a8642e', '#5e3416'],
    2: ['#f4f7fa', '#a9b4bf', '#58626c'],
    3: ['#fff0b0', '#e0a93a', '#7a4f10'],
  };
  // medal shapes on a 64x64 grid: a round medal, an eight-sided seal, a sunburst
  const RAYS = (() => {
    let d = '';
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        r = i % 2 ? 26 : 31;
      d += (i ? 'L' : 'M') + (32 + r * Math.sin(a)).toFixed(1) + ' ' + (32 - r * Math.cos(a)).toFixed(1);
    }
    return d + 'z';
  })();
  const OCT = (() => {
    let d = '';
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      d += (i ? 'L' : 'M') + (32 + 29 * Math.sin(a)).toFixed(1) + ' ' + (32 - 29 * Math.cos(a)).toFixed(1);
    }
    return d + 'z';
  })();
  const esc = s =>
    String(s == null ? '' : s).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );

  FW.badge = function (id, emoji) {
    const b = B[id];
    const paths = b && (NEW[b[0]] || (FW.ICONS && FW.ICONS[b[0]]));
    if (!paths || (FW.iconsOn && !FW.iconsOn())) return '<span class="badge-emoji">' + esc(emoji || '') + '</span>';
    const t = b[1],
      [hi, mid, lo] = METAL[t],
      gid = 'bdg' + t;
    const shape =
      t === 3
        ? '<path d="' + RAYS + '" fill="url(#' + gid + ')" stroke="' + lo + '" stroke-width="1.2"/>'
        : t === 2
          ? '<path d="' + OCT + '" fill="url(#' + gid + ')" stroke="' + lo + '" stroke-width="1.4"/>'
          : '<circle cx="32" cy="32" r="29" fill="url(#' +
            gid +
            ')" stroke="' +
            lo +
            '" stroke-width="1.4"/>' +
            '<circle cx="32" cy="32" r="25.5" fill="none" stroke="' +
            lo +
            '" stroke-width="1" stroke-dasharray="2 2.6" opacity=".7"/>';
    return (
      '<svg class="badge badge-' +
      FW.BADGE_TIERS[t] +
      '" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><radialGradient id="' +
      gid +
      '" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="' +
      hi +
      '"/><stop offset=".55" stop-color="' +
      mid +
      '"/><stop offset="1" stop-color="' +
      lo +
      '"/></radialGradient></defs>' +
      shape +
      '<circle cx="32" cy="32" r="18.5" fill="rgba(20,12,6,.55)" stroke="' +
      hi +
      '" stroke-opacity=".55" stroke-width="1"/>' +
      '<g transform="translate(19.4 19.4) scale(1.05)" fill="none" stroke="' +
      hi +
      '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
      paths +
      '</g></svg>'
    );
  };
})(typeof window !== 'undefined' ? window : globalThis);
