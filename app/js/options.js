/* Destiny Unbound Options screen: Graphics, Audio, Gameplay, Accessibility, Controls, Language and Data.
   Settings apply as soon as they change; display changes in the desktop app ask to be kept (and undo themselves after 12 seconds).
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html,
    App = window.FWApp,
    P = FW.prefs,
    S = FW.Story,
    SYS = FW.System,
    D = window.fatewheelDesktop || null;
  const $ = s => document.querySelector(s);
  const t = s => (FW.t ? FW.t(s) : s);
  const LOOKS = ['ashen', 'astral', 'iron', 'bloodmoon'];
  const TABS = [
    ['graphics', 'Graphics'],
    ['audio', 'Audio'],
    ['gameplay', 'Gameplay'],
    ['access', 'Accessibility'],
    ['controls', 'Controls'],
    ['language', 'Language'],
    ['data', 'Data'],
  ];
  const ACTIONS = [
    ['advance', 'Spin / skip / next'],
    ['next', 'Next (second key)'],
    ['back', 'Back / close'],
    ['respin', 'Re-spin (Fate Token)'],
    ['auto', 'Auto-play on or off'],
    ['options', 'Open Options'],
    ['menu', 'Main menu'],
  ];
  const SIZES = [
    [1280, 720],
    [1366, 768],
    [1600, 900],
    [1920, 1080],
    [2560, 1440],
    [3840, 2160],
  ];
  let tab = 'graphics',
    back = 'title',
    win = null,
    restartNote = false;
  const O = (FW.Options = { capturing: false });
  O.isOpen = () => App.state.screen === 'options';
  O.open = function (which) {
    if (which) tab = which;
    if (!O.isOpen()) back = App.state.screen || 'title';
    App.closeModal();
    App.flow.show('options');
    render();
  };
  O.close = function () {
    O.capturing = false;
    App.flow.show(back === 'options' ? 'title' : back);
  };
  App.hooks.optionsModal = () => O.open('gameplay');
  const ob = $('#btnOptions');
  if (ob) ob.onclick = () => O.open();

  /* ---------------- controls ---------------- */
  const row = (label, control, note) =>
    '<div class="o-row"><span class="o-lab">' +
    H.esc(t(label)) +
    (note ? '<small>' + H.esc(t(note)) + '</small>' : '') +
    '</span><div class="o-ctl">' +
    control +
    '</div></div>';
  const seg = (id, opts, cur) =>
    '<div class="o-seg" role="radiogroup" data-seg="' +
    id +
    '">' +
    opts
      .map(
        o =>
          '<button role="radio" aria-checked="' +
          (String(o[0]) === String(cur)) +
          '" class="' +
          (String(o[0]) === String(cur) ? 'on' : '') +
          '" data-v="' +
          H.esc(String(o[0])) +
          '">' +
          H.esc(t(o[1])) +
          '</button>'
      )
      .join('') +
    '</div>';
  const slider = (id, val, label) =>
    '<div class="o-sl"><input type="range" min="0" max="100" step="1" value="' +
    Math.round(val) +
    '" data-sl="' +
    id +
    '" aria-label="' +
    H.esc(t(label)) +
    '"><b>' +
    Math.round(val) +
    '%</b></div>';
  const tog = (id, on, label) =>
    '<button class="o-tog' +
    (on ? ' on' : '') +
    '" role="switch" aria-checked="' +
    !!on +
    '" data-tog="' +
    id +
    '" aria-label="' +
    H.esc(t(label)) +
    '"><i></i><span>' +
    H.esc(t(on ? 'On' : 'Off')) +
    '</span></button>';
  const SEL_LABEL = { res: 'Window size', theme: 'Theme', lang: 'Language' };
  const sel = (id, opts, cur) =>
    '<select class="o-sel" data-sel="' +
    id +
    '" aria-label="' +
    H.esc(t(SEL_LABEL[id] || id)) +
    '">' +
    opts
      .map(
        o =>
          '<option value="' +
          H.esc(String(o[0])) +
          '"' +
          (String(o[0]) === String(cur) ? ' selected' : '') +
          '>' +
          H.esc(t(o[1])) +
          '</option>'
      )
      .join('') +
    '</select>';
  const btn = (id, label, cls) =>
    '<button class="btn small ' + (cls || '') + '" data-btn="' + id + '">' + H.esc(t(label)) + '</button>';
  const keyName = k =>
    ({ ' ': 'Space', Escape: 'Esc', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' })[k] ||
    (k && k.length === 1 ? k.toUpperCase() : k || '-');

  /* ---------------- tabs ---------------- */
  const BODY = {
    graphics() {
      const look = LOOKS.indexOf(App.state.theme) >= 0 ? App.state.theme : 'ashen';
      let h = '<div class="o-grp"><h3>' + H.esc(t('Display')) + '</h3>';
      if (D && D.windowInfo) {
        const w = win || { mode: P.display, size: [1280, 720], work: [1920, 1040] };
        h += row(
          'Display mode',
          seg(
            'display',
            [
              ['windowed', 'Windowed'],
              ['maximized', 'Maximized'],
              ['fullscreen', 'Fullscreen'],
            ],
            w.mode
          ),
          'Fullscreen covers the whole screen without borders.'
        );
        const fits = SIZES.filter(s => s[0] <= w.work[0] && s[1] <= w.work[1]);
        const cur = w.size[0] + 'x' + w.size[1];
        const opts = fits.map(s => [s[0] + 'x' + s[1], s[0] + ' × ' + s[1]]);
        if (!opts.some(o => o[0] === cur)) opts.push([cur, w.size[0] + ' × ' + w.size[1] + ' (' + t('current') + ')']);
        h += row(
          'Window size',
          sel('res', opts, cur) +
            (w.mode !== 'windowed' ? '<small class="o-note">' + H.esc(t('Used in windowed mode.')) + '</small>' : '')
        );
        h +=
          row(
            'VSync',
            tog('vsync', w.vsync, 'VSync'),
            'Off can feel snappier on fast screens but may tear. Applies after a restart.'
          ) +
          (restartNote
            ? '<p class="o-note">' +
              H.esc(t('Restart the game to apply VSync.')) +
              ' ' +
              btn('relaunch', 'Restart now', 'primary') +
              '</p>'
            : '');
      } else {
        h += row(
          'Fullscreen',
          tog('fullscreen', !!document.fullscreenElement, 'Fullscreen'),
          'Your browser may ask first; Esc leaves fullscreen.'
        );
      }
      h += row(
        'Interface scale',
        seg(
          'uiScale',
          [
            [80, '80%'],
            [90, '90%'],
            [100, '100%'],
            [110, '110%'],
            [125, '125%'],
            [150, '150%'],
          ],
          P.uiScale
        )
      );
      h += '</div><div class="o-grp"><h3>' + H.esc(t('Quality')) + '</h3>';
      h += row(
        'Frame limit',
        seg(
          'fps',
          [
            [30, '30'],
            [60, '60'],
            [120, '120'],
            [144, '144'],
            [0, 'Display'],
          ],
          P.fps
        ),
        'How often the wheel redraws while it spins.'
      );
      h += row(
        'Animations',
        seg(
          'anim',
          [
            ['full', 'Full'],
            ['reduced', 'Reduced'],
            ['off', 'Off'],
          ],
          P.anim
        ),
        'Reduced spins faster with fewer effects; Off shows results at once.'
      );
      h += row(
        'Wheel sharpness',
        seg(
          'quality',
          [
            ['low', 'Low'],
            ['medium', 'Medium'],
            ['high', 'High'],
          ],
          P.quality
        ),
        'Lower is lighter on older PCs.'
      );
      h += row('Glows and particles', tog('glow', P.glow, 'Glows and particles'));
      h += row(
        'Emoji instead of drawn icons',
        tog('emojiIcons', P.emojiIcons, 'Emoji instead of drawn icons'),
        "The game's own icons match each theme. Switch this on to see your system's emoji instead."
      );
      h += row(
        'Theme',
        sel(
          'theme',
          Object.keys(FW.THEMES).map(k => [k, FW.THEMES[k].name + (FW.THEMES[k].mod ? ' (mod)' : '')]),
          App.state.theme
        )
      );
      return h + '</div>';
    },
    audio() {
      const v = FW.Audio.vol;
      let h = '<div class="o-grp"><h3>' + H.esc(t('Volume')) + '</h3>';
      h += row('Sound', tog('sound', App.state.sound, 'Sound'));
      h += row('Master volume', slider('master', v.master * 100, 'Master volume'));
      h += row('Music', slider('music', v.music * 100, 'Music'));
      h += row('Sound effects', slider('sfx', v.sfx * 100, 'Sound effects'));
      h += row('Interface', slider('ui', P.uiVol * 100, 'Interface'), 'Menu clicks.');
      h += '</div><div class="o-grp"><h3>' + H.esc(t('Behaviour')) + '</h3>';
      h += row(
        'Mute in background',
        tog('muteBg', P.muteBg, 'Mute in background'),
        'Silence the game when its window is not in focus.'
      );
      h += row(
        'Sound captions',
        tog('captions', P.captions, 'Sound captions'),
        'Show a short line saying what each sound means.'
      );
      h +=
        '<p class="o-note">' +
        H.esc(
          t(
            "Sound plays through your system's default output device. Each theme has its own effects and music; mods can replace them."
          )
        ) +
        '</p>';
      return h + '</div>';
    },
    gameplay() {
      const o = FW.gameOptions ? FW.gameOptions() : {};
      let h = '<div class="o-grp"><h3>' + H.esc(t('Spinning')) + '</h3>';
      h += row(
        'Spin speed',
        seg(
          'speed',
          [
            ['normal', 'Normal'],
            ['fast', 'Fast'],
          ],
          App.state.speed
        )
      );
      h += row(
        'Spin direction',
        seg(
          'spinDir',
          [
            ['ccw', 'Counter-clockwise'],
            ['cw', 'Clockwise'],
          ],
          App.state.spinDir
        )
      );
      h += row(
        'Luck',
        seg(
          'luck',
          FW.LUCK.map(l => [l.id, l.name]),
          App.state.luck
        ),
        "Shifts every wheel's odds for your next legend."
      );
      h += row('First-run guide', btn('guide', 'Show it again'));
      if (FW.discordAvailable)
        h += row(
          'Discord status',
          tog('discord', P.discord !== false, 'Discord status'),
          'Show what you\'re playing in your Discord status, for example "Living a saga · Chapter 4". It only talks to the Discord app on this computer.'
        );
      h += '</div>';
      if (S && S.OPTIONS) {
        h +=
          '<div class="o-grp"><h3>' +
          H.esc(t('Story')) +
          '</h3><p class="o-note">' +
          H.esc(
            t(
              'Switch story features on or off. Changes apply from the next chapter. Chapters themselves can be removed or made rarer in the Wheel Workshop.'
            )
          ) +
          '</p>';
        h += S.OPTIONS.map(x => row(x.name, tog('story:' + x.id, !!o[x.id], x.name), x.blurb)).join('') + '</div>';
      }
      return h;
    },
    access() {
      let h = '<div class="o-grp"><h3>' + H.esc(t('Reading')) + '</h3>';
      h += row(
        'Text size',
        seg(
          'textSize',
          [
            [90, '90%'],
            [100, '100%'],
            [115, '115%'],
            [130, '130%'],
            [150, '150%'],
          ],
          P.textSize
        )
      );
      h += row(
        'High contrast',
        tog('contrast', P.contrast, 'High contrast'),
        'Stronger text and borders on solid backgrounds.'
      );
      h += row(
        'Colour-blind-safe wheels',
        tog('cbSafe', P.cbSafe, 'Colour-blind-safe wheels'),
        'Slices use a palette that stays distinct with every common kind of colour blindness.'
      );
      h += '</div><div class="o-grp"><h3>' + H.esc(t('Motion and sound')) + '</h3>';
      h += row(
        'Reduce motion and flashing',
        tog('reduceMotion', P.reduceMotion, 'Reduce motion and flashing'),
        'No shaking, sliding or flashing; shorter spins.'
      );
      h += row('Sound captions', tog('captions', P.captions, 'Sound captions'));
      h +=
        '<p class="o-note">' +
        H.esc(
          t('Menus, buttons and results are labelled for screen readers, and everything works with the keyboard alone.')
        ) +
        '</p>';
      return h + '</div>';
    },
    controls() {
      let h =
        '<div class="o-grp"><h3>' +
        H.esc(t('Keyboard')) +
        '</h3><p class="o-note">' +
        H.esc(t('Click a key to change it, then press the new key (Esc cancels).')) +
        '</p>';
      h += ACTIONS.map(a =>
        row(a[1], '<button class="o-key" data-key="' + a[0] + '">' + H.esc(keyName(P.keys[a[0]])) + '</button>')
      ).join('');
      h += row('Also always', '<span class="o-fixed">↑ ↓ W S · Enter · Esc · Tab</span>');
      h += '<p>' + btn('resetKeys', 'Reset keys') + '</p></div>';
      const dev = FW.Nav ? FW.Nav.device : 'kb',
        ps = dev === 'ps';
      h +=
        '<div class="o-grp"><h3>' +
        H.esc(t('Controller')) +
        '</h3><p class="o-note">' +
        H.esc(
          t(
            'Xbox, PlayStation and Switch controllers work over USB or Bluetooth. Prompts change to match the controller you use.'
          )
        ) +
        '</p>';
      [
        ['D-pad / left stick', 'Move'],
        [ps ? '✕' : 'Ⓐ', 'Confirm, spin, next'],
        [ps ? '○' : 'Ⓑ', 'Back / close'],
        [ps ? '□' : 'Ⓧ', 'Re-spin'],
        [ps ? '△' : 'Ⓨ', 'Auto-play'],
        [ps ? 'OPTIONS' : 'Start / ☰', 'Options'],
      ].forEach(r => {
        h += row(r[1], '<span class="o-fixed">' + H.esc(r[0]) + '</span>');
      });
      return h + '</div>';
    },
    language() {
      const packs = Object.keys(FW.LANG_PACKS || { en: { name: 'English' } });
      return (
        '<div class="o-grp"><h3>' +
        H.esc(t('Language')) +
        '</h3>' +
        row(
          'Language',
          sel(
            'lang',
            packs.map(id => [id, FW.LANG_PACKS[id].name]),
            FW.lang || 'en'
          ),
          'The game restarts in the new language.'
        ) +
        '<p class="o-note">' +
        H.esc(
          t(
            "Translations are files in app/lang; untranslated text stays in English. Want to help translate? See docs/modding.md in the game's source on GitHub."
          )
        ) +
        '</p></div>'
      );
    },
    data() {
      const st = SYS.stats;
      let h =
        '<div class="o-grp"><h3>' +
        H.esc(t('Backups')) +
        '</h3><p class="o-note">' +
        H.esc(
          t(
            D
              ? 'A backup is made once a day (the newest 10 are kept). Restoring backs up your current save first.'
              : 'A backup is made once a day in this browser (the newest 3 are kept). Restoring backs up your current save first.'
          )
        ) +
        '</p>';
      h +=
        '<div id="oBackups" class="o-list"><p class="o-note">…</p></div><p>' +
        btn('backupNow', 'Back up now') +
        (D ? ' ' + btn('openBackups', 'Open backups folder', 'ghost') : '') +
        '</p></div>';
      h +=
        '<div class="o-grp"><h3>' +
        H.esc(t('Move your save')) +
        '</h3><p class="o-note">' +
        H.esc(
          t(
            'Export everything (Hall of Legends, settings, Workshop edits, achievements) to one file and load it on another PC. API keys and painted portraits are not included.'
          )
        ) +
        '</p><p>' +
        btn('export', 'Export save', 'primary') +
        ' ' +
        btn('import', 'Import save') +
        '</p></div>';
      h +=
        '<div class="o-grp"><h3>' +
        H.esc(t('Play stats')) +
        '</h3><p class="o-note">' +
        H.esc(t('Kept only on this device. They are added to a feedback report only if you tick the box.')) +
        '</p><div class="o-stats">' +
        [
          ['Sessions', st.sessions],
          ['Minutes played', st.minutes],
          ['Legends started', st.legendsStarted],
          ['Legends finished', st.legendsFinished],
          ['Stories begun', st.stories],
          ['Chapters played', st.chapters],
          ['Deaths', st.deaths],
          ['Retirements', st.retirements],
          ['Arena fights', st.arenaFights],
          ['Daily challenges', st.dailies],
        ]
          .map(r => '<div><b>' + (r[1] || 0) + '</b><span>' + H.esc(t(r[0])) + '</span></div>')
          .join('') +
        '</div>' +
        endingsHtml(st.endings) +
        '<p>' +
        btn('resetStats', 'Reset stats', 'ghost') +
        '</p></div>';
      if (FW.World && FW.World.available()) {
        h +=
          '<div class="o-grp"><h3>' +
          H.esc(t('World counter')) +
          '</h3>' +
          row(
            'Add my results to the world counter',
            tog('world', FW.World.enabled(), 'Add my results to the world counter'),
            'Off by default. When on, the game sends one anonymous count each time you finish a hero or a saga ends (only "a hero" or the name of the ending: no names, codes or IDs), and shows everyone\'s totals here. The same totals are behind /stats on our Discord.'
          ) +
          (FW.World.enabled() ? '<div id="oWorld"><p class="o-note">…</p></div>' : '') +
          row(
            'Post my daily challenge results',
            tog('board', FW.World.boardEnabled(), 'Post my daily challenge results'),
            'Off by default. When on, finishing a daily challenge saga posts your hero\'s name, race, score, ending and chapter count to that day\'s leaderboard, with a random id so you appear once a day. Names with rude words are shown as "A nameless hero". Nothing else is sent.'
          ) +
          '</div>';
      }
      h +=
        '<div class="o-grp"><h3>' +
        H.esc(t('Help and reports')) +
        '</h3><p>' +
        btn('feedback', 'Send feedback', 'primary') +
        ' ' +
        (D ? btn('logs', 'Open logs folder') : btn('dlLog', 'Download error log')) +
        (D ? ' ' + btn('updates', 'Check for updates') : '') +
        ' ' +
        btn('credits', 'Credits', 'ghost') +
        '</p><p class="o-note" id="oUpd"></p>' +
        (D
          ? row(
              'Check for updates automatically',
              tog(
                'autoUpd',
                App.store.get('fw.updates', { auto: true }).auto !== false,
                'Check for updates automatically'
              ),
              'New versions download in the background; you choose when to restart. This is version ' + FW.VERSION + '.'
            )
          : '') +
        '</div>';
      h +=
        '<div class="o-grp danger"><h3>' +
        H.esc(t('Reset')) +
        '</h3><p>' +
        btn('resetAll', 'Reset all saved data', 'ghost') +
        ' ' +
        btn('resetPrefs', 'Reset all options', 'ghost') +
        '</p></div>';
      return h;
    },
  };

  function render() {
    const root = $('#screen-options');
    if (!root) return;
    const k = (() => {
      const id = App.state.theme,
        th = FW.THEMES[id] || {};
      const x = LOOKS.indexOf(id) >= 0 ? id : th.base;
      return LOOKS.indexOf(x) >= 0 ? x : 'ashen';
    })();
    root.innerHTML =
      '<div class="optscr"><div class="optbg" style="background-image:url(art/' +
      k +
      '-bg.jpg)"></div><div class="optbox">' +
      '<h2>' +
      H.esc(t('Options')) +
      '</h2><div class="o-tabs" role="tablist">' +
      TABS.map(
        x =>
          '<button role="tab" aria-selected="' +
          (x[0] === tab) +
          '" class="' +
          (x[0] === tab ? 'on' : '') +
          '" data-tab="' +
          x[0] +
          '">' +
          H.esc(t(x[1])) +
          '</button>'
      ).join('') +
      '</div>' +
      '<div class="o-body" role="tabpanel">' +
      BODY[tab]() +
      '</div>' +
      '<div class="o-btns"><button class="btn ghost" data-btn="resetTab">' +
      H.esc(t('Reset this tab')) +
      '</button><span class="o-hint">' +
      H.esc(t('Changes apply right away.')) +
      '</span><button class="btn primary" data-btn="back">' +
      H.esc(t('Back')) +
      '</button></div></div></div>';
    wire(root);
    if (tab === 'data') {
      listBackups();
      listWorld();
    }
    if (tab === 'graphics' && D && D.windowInfo && !win)
      D.windowInfo().then(w => {
        if (w) {
          win = w;
          if (tab === 'graphics' && O.isOpen()) render();
        }
      });
  }
  function wire(root) {
    root.querySelectorAll('[data-tab]').forEach(b =>
      b.addEventListener('click', () => {
        tab = b.dataset.tab;
        win = null;
        render();
        FW.Audio.click();
        const n = root.querySelector('[data-tab="' + tab + '"]');
        if (n) n.focus();
      })
    );
    root.querySelectorAll('[data-seg]').forEach(g =>
      g.querySelectorAll('button').forEach(b =>
        b.addEventListener('click', () => {
          setSeg(g.dataset.seg, b.dataset.v);
          FW.Audio.click();
        })
      )
    );
    root.querySelectorAll('[data-sl]').forEach(r =>
      r.addEventListener('input', () => {
        r.nextElementSibling.textContent = r.value + '%';
        setSlider(r.dataset.sl, r.value / 100);
      })
    );
    root.querySelectorAll('[data-tog]').forEach(b =>
      b.addEventListener('click', () => {
        setTog(b.dataset.tog, !b.classList.contains('on'));
        FW.Audio.click();
      })
    );
    root
      .querySelectorAll('[data-sel]')
      .forEach(s => s.addEventListener('change', () => setSel(s.dataset.sel, s.value)));
    root.querySelectorAll('[data-btn]').forEach(b => b.addEventListener('click', () => button(b.dataset.btn, b)));
    root.querySelectorAll('[data-key]').forEach(b => b.addEventListener('click', () => captureKey(b)));
  }
  const keepFocus = sel => {
    const n = document.querySelector('#screen-options ' + sel);
    if (n) n.focus();
  };

  /* ---------------- applying settings ---------------- */
  function rebuildWheel() {
    const w = App.state.wheel;
    if (w) {
      w.size = 0;
      w.resize();
      w.buildFace();
      w.draw();
    }
    if (App.state.screen === 'card' && App.state.legend) App.drawCardNow();
  }
  function setSeg(id, v) {
    const num = /^-?\d+$/.test(v) ? +v : v;
    if (id === 'display') return display({ mode: v });
    if (id === 'speed') {
      App.state.speed = v;
      App.syncSpeedBtn();
      App.persist();
    } else if (id === 'spinDir') {
      App.state.spinDir = v;
      App.syncDirBtn();
      App.persist();
    } else if (id === 'luck') App.setLuck(v);
    else {
      FW.setPref(id, num);
      if (id === 'quality') rebuildWheel();
      if (id === 'uiScale') setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    }
    render();
    keepFocus('[data-seg="' + id + '"] [data-v="' + v + '"]');
  }
  function setSlider(id, v) {
    if (id === 'ui') {
      P.uiVol = v;
      FW.savePrefs();
      return;
    }
    FW.Audio.init();
    FW.Audio.setVolume({ [id]: v });
    App.store.set('fw.audio', FW.Audio.vol);
  }
  function setTog(id, on) {
    if (id === 'sound') {
      App.state.sound = on;
      App.syncSound();
      App.persist();
      FW.Audio.init();
    } else if (id === 'vsync') {
      D.setVsync(on);
      if (win) win.vsync = on;
      restartNote = true;
    } else if (id === 'fullscreen') {
      (on ? document.documentElement.requestFullscreen() : document.exitFullscreen())
        .catch(() => App.toast(t('Your browser blocked fullscreen')))
        .then(() => setTimeout(render, 150));
      return;
    } else if (id === 'autoUpd') App.store.set('fw.updates', { auto: on });
    else if (id === 'world') FW.World.setEnabled(on);
    else if (id === 'board') FW.World.setBoard(on);
    else if (id.indexOf('story:') === 0) {
      const k = id.slice(6),
        cur = App.store.get('fw.options', {});
      cur[k] = on;
      App.store.set('fw.options', cur);
      if (window.FWAchieve) window.FWAchieve.sync();
    } else {
      FW.setPref(id, on);
      if (id === 'cbSafe' || id === 'glow') rebuildWheel();
      if (id === 'muteBg' && SYS.syncBackgroundMute) SYS.syncBackgroundMute();
    }
    render();
    keepFocus('[data-tog="' + id + '"]');
  }
  function setSel(id, v) {
    if (id === 'theme') {
      App.setTheme(v);
      render();
      return keepFocus('[data-sel="theme"]');
    }
    if (id === 'lang') return FW.setLang(v);
    if (id === 'res') {
      const m = /^(\d+)x(\d+)$/.exec(v);
      if (m) display({ mode: 'windowed', w: +m[1], h: +m[2] });
    }
  }
  /* desktop display changes: apply, then ask to keep them; undo after 12 seconds without an answer */
  async function display(next) {
    if (!D || !D.setWindow) return;
    const before = await D.windowInfo();
    await D.setWindow(next);
    P.display = next.mode;
    if (next.w) P.res = next.w + 'x' + next.h;
    FW.savePrefs();
    await new Promise(r => setTimeout(r, 350));
    win = await D.windowInfo();
    render();
    let left = 12,
      timer = null;
    const undo = async () => {
      clearInterval(timer);
      App.closeModal();
      await D.setWindow({ mode: before.mode, w: before.size[0], h: before.size[1] });
      P.display = before.mode;
      FW.savePrefs();
      await new Promise(r => setTimeout(r, 350));
      win = await D.windowInfo();
      render();
    };
    App.openModal(
      '<h2>' +
        H.esc(t('Keep these display settings?')) +
        '</h2><p id="dsLeft">' +
        H.esc(t('Going back in')) +
        ' ' +
        left +
        ' s</p><div class="cta"><button class="btn primary" id="dsKeep">' +
        H.esc(t('Keep')) +
        '</button><button class="btn ghost" id="dsUndo">' +
        H.esc(t('Go back')) +
        '</button></div>'
    );
    $('#dsKeep').onclick = () => {
      clearInterval(timer);
      App.closeModal();
      keepFocus('[data-seg="display"] .on');
    };
    $('#dsUndo').onclick = undo;
    $('#dsKeep').focus();
    timer = setInterval(() => {
      left--;
      const el = $('#dsLeft');
      if (!el) return clearInterval(timer);
      el.textContent = t('Going back in') + ' ' + left + ' s';
      if (left <= 0) undo();
    }, 1000);
  }
  function captureKey(b) {
    const act = b.dataset.key;
    O.capturing = true;
    b.textContent = t('Press a key…');
    b.classList.add('wait');
    const on = e => {
      e.preventDefault();
      e.stopPropagation();
      document.removeEventListener('keydown', on, true);
      O.capturing = false;
      if (e.key === 'Escape' && act !== 'back') return render();
      if (['Tab', 'Shift', 'Control', 'Alt', 'Meta'].indexOf(e.key) >= 0) return render();
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const other = Object.keys(P.keys).find(a => a !== act && P.keys[a] === k);
      if (other) P.keys[other] = P.keys[act]; // swap instead of clashing
      P.keys[act] = k;
      FW.savePrefs();
      render();
      keepFocus('[data-key="' + act + '"]');
    };
    document.addEventListener('keydown', on, true);
  }
  /* how each saga ended (local stats), in the order of the story's ending list; endings never reached are left out */
  function endingsHtml(ends) {
    const S = FW.Story;
    if (!S || !ends) return '';
    const rows = Object.keys(S.endLabel)
      .filter(k => ends[k])
      .map(
        k =>
          '<div><b>' + ends[k] + '</b><span>' + (S.endIcon[k] || '') + ' ' + H.esc(t(S.endLabel[k])) + '</span></div>'
      );
    return rows.length
      ? '<h4 class="o-sub">' +
          H.esc(t('How your sagas ended')) +
          '</h4><div class="o-stats">' +
          rows.join('') +
          '</div>'
      : '';
  }
  async function listWorld() {
    const box = $('#oWorld');
    if (!box || !FW.World) return;
    const w = await FW.World.totals();
    if (!$('#oWorld')) return;
    if (!w) {
      box.innerHTML = '<p class="o-note">' + H.esc(t("The world counter can't be reached right now.")) + '</p>';
      return;
    }
    const n = v => (+v || 0).toLocaleString();
    const ends = w.endings || {};
    box.innerHTML =
      '<h4 class="o-sub">' +
      H.esc(t('World totals')) +
      '</h4><div class="o-stats"><div><b>' +
      n(w.heroes) +
      '</b><span>' +
      H.esc(t('Heroes made in the game')) +
      '</span></div><div><b>' +
      n(w.sagas) +
      '</b><span>' +
      H.esc(t('Sagas ended')) +
      '</span></div><div><b>' +
      n(w.deaths) +
      '</b><span>' +
      H.esc(t('Deaths')) +
      '</span></div></div>' +
      endingsHtml(ends);
  }
  async function listBackups() {
    const box = $('#oBackups');
    if (!box) return;
    const list = await SYS.listBackups();
    box.innerHTML = list.length
      ? list
          .map(
            b =>
              '<div class="o-bk"><span>' +
              H.esc(b.label) +
              ' <small>' +
              Math.max(1, Math.round(b.size / 1024)) +
              ' KB</small></span><button class="btn small" data-restore="' +
              H.esc(b.id) +
              '">' +
              H.esc(t('Restore')) +
              '</button></div>'
          )
          .join('')
      : '<p class="o-note">' + H.esc(t('No backups yet.')) + '</p>';
    box.querySelectorAll('[data-restore]').forEach(b =>
      b.addEventListener('click', async () => {
        const text = await SYS.readBackup(b.dataset.restore);
        if (!text) return App.toast(t('That backup could not be read'));
        App.openModal(
          '<h2>' +
            H.esc(t('Restore this backup?')) +
            '</h2><p>' +
            H.esc(t('Your current save is backed up first, then the game reloads with this one.')) +
            '</p><div class="cta"><button class="btn primary" id="rbYes">' +
            H.esc(t('Restore')) +
            '</button><button class="btn ghost" id="rbNo">' +
            H.esc(t('Cancel')) +
            '</button></div>'
        );
        $('#rbNo').onclick = App.closeModal;
        $('#rbYes').onclick = () => SYS.restore(text).catch(e => App.toast(e.message));
      })
    );
  }
  function button(id, b) {
    const acts = {
      back: O.close,
      relaunch: () => D.relaunch(),
      guide: () => {
        FW.Nav.resetGuide();
        O.close();
        if (App.state.screen !== 'title') App.showTitle();
      },
      resetKeys: () => {
        P.keys = Object.assign({}, FW.PREF_DEFAULTS.keys);
        FW.savePrefs();
        render();
      },
      backupNow: async () => {
        const n = await SYS.backup(true);
        App.toast(n ? t('Backup saved') : t('Nothing to back up yet'));
        listBackups();
      },
      openBackups: () => D.openBackups(),
      export: () => SYS.exportSave(),
      import: () => SYS.importSave(),
      resetStats: () => {
        Object.keys(SYS.stats).forEach(k => {
          SYS.stats[k] = typeof SYS.stats[k] === 'object' ? {} : typeof SYS.stats[k] === 'number' ? 0 : SYS.stats[k];
        });
        App.store.set('fw.stats', SYS.stats);
        render();
      },
      feedback: () => SYS.feedbackModal(),
      logs: () => D.openLogs(),
      dlLog: () =>
        SYS.download(
          new Blob([SYS.readLog().join('\n') || 'No errors logged.'], { type: 'text/plain' }),
          'destiny-unbound-log.txt'
        ),
      updates: () => {
        const n = $('#oUpd');
        if (n) n.textContent = t('Checking for updates...');
        D.onUpdate(s => {
          const el = $('#oUpd');
          if (el)
            el.textContent =
              {
                none: 'You have the latest version.',
                available: 'Downloading version ' + (s.version || '') + '...',
                ready: 'Version ' + s.version + ' is ready: restart to install.',
                error: 'Could not check for updates (' + (s.message || 'offline') + ').',
                unsupported: s.message || '',
              }[s.state] || el.textContent;
        });
        D.checkForUpdates();
      },
      credits: () => App.creditsModal(),
      resetAll: () => App.resetData(),
      resetPrefs: () => {
        FW.resetPrefs();
        rebuildWheel();
        render();
        App.toast(t('Options reset'));
      },
      resetTab: () => {
        const d = FW.PREF_DEFAULTS,
          keys =
            {
              graphics: ['uiScale', 'fps', 'anim', 'quality', 'glow', 'emojiIcons'],
              audio: ['uiVol', 'muteBg', 'captions'],
              access: ['textSize', 'contrast', 'cbSafe', 'reduceMotion', 'captions'],
              controls: ['keys'],
            }[tab] || [];
        keys.forEach(k => {
          P[k] = JSON.parse(JSON.stringify(d[k]));
        });
        FW.savePrefs();
        FW.applyPrefs();
        if (tab === 'audio') {
          FW.Audio.setVolume({ master: 0.8, sfx: 0.9, music: 0.35 });
          App.store.set('fw.audio', FW.Audio.vol);
        }
        if (tab === 'gameplay') {
          App.state.speed = 'normal';
          App.state.spinDir = 'ccw';
          App.syncSpeedBtn();
          App.syncDirBtn();
          App.persist();
        }
        rebuildWheel();
        render();
        App.toast(t('This tab is back to its defaults'));
      },
    };
    if (acts[id]) acts[id](b);
  }
  FW.onPref = k => {
    if (k === 'uiScale' && FW.Nav) window.dispatchEvent(new Event('resize'));
  };
})();
