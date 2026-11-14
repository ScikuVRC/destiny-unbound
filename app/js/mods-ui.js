/* Destiny Unbound Mods screen, mod loading at startup, and desktop updates.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    App = window.FWApp,
    H = FW.html,
    M = FW.Mods,
    D = window.fatewheelDesktop || null;
  const $ = s => document.querySelector(s);
  const MODKIT_URL = 'https://bzrkherja.itch.io/destiny-unbound'; // the mod kit is one of the downloads there (and on GitHub releases)

  /* ---------------- startup ---------------- */
  M.ready = M.load()
    .then(() => {
      const want = App.state.wantTheme;
      App.setTheme(want && FW.THEMES[want] ? want : App.state.theme); // also lists mod themes under Look
      if (M.errors.length) console.warn('Destiny Unbound mods:', M.errors);
    })
    .catch(e => console.warn('Destiny Unbound mods failed to load', e));

  /* ---------------- Mods screen ---------------- */
  function summary(m) {
    const p = [];
    if (m.themes.length) p.push(m.themes.length + ' theme' + (m.themes.length > 1 ? 's' : ''));
    const snd = Object.keys(m.sounds).length + m.themes.reduce((t, x) => t + Object.keys(x.sounds).length, 0);
    if (snd) p.push(snd + ' sound' + (snd > 1 ? 's' : ''));
    const ent = m.packs.reduce((t, x) => t + Object.keys(x.entries).reduce((a, k) => a + x.entries[k].length, 0), 0);
    if (ent) p.push(ent + ' wheel entries');
    return p.join(' · ');
  }
  let changed = false;
  function modsModal() {
    const row = m =>
      '<div class="hall-item' +
      (m.official ? ' official' : '') +
      '"><div><b>' +
      H.esc(m.name) +
      '</b><span>' +
      H.esc(m.description || '') +
      (m.official ? '' : m.author ? ' · by ' + H.esc(m.author) : '') +
      '<br>' +
      H.esc(summary(m)) +
      ' · ' +
      H.esc(FW.t(m.official ? 'Official' : m.source === 'folder' ? 'Mods folder' : 'imported')) +
      '</span></div><div><label class="check"><input type="checkbox" data-mod="' +
      H.esc(m.id) +
      '"' +
      (m.enabled ? ' checked' : '') +
      '> on</label>' +
      (m.source === 'imported' ? ' <button class="btn small ghost" data-rm="' + H.esc(m.key) + '">✕</button>' : '') +
      '</div></div>';
    const official = M.loaded.filter(m => m.official),
      own = M.loaded.filter(m => !m.official);
    const rows =
      (official.length
        ? '<h3 class="opt-h">' +
          H.esc(FW.t('Official mods')) +
          '</h3><p class="legend-key">' +
          H.esc(FW.t('Made by the Destiny Unbound team and included with the game. Switch one on, then restart.')) +
          '</p>' +
          official.map(row).join('')
        : '') +
      '<h3 class="opt-h">' +
      H.esc(FW.t('Your mods')) +
      '</h3>' +
      (own.length ? own.map(row).join('') : '<p>No mods installed yet.</p>');
    const errs = M.errors.length
      ? '<div class="warn"><b>Some mods could not load</b><ul>' +
        M.errors.map(e => '<li>' + H.esc(e) + '</li>').join('') +
        '</ul></div>'
      : '';
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Mods</h2><p>Mods add your own themes (colours, fonts, wheel colours, card style), sounds and music, and new wheel entries. Mods cannot run code, and their style only applies while their theme is selected. Use mods at your own discretion; only install mods you trust.</p>' +
        rows +
        errs +
        '<p id="modNote" class="legend-key">' +
        (changed ? 'Restart to apply your changes.' : '') +
        '</p>' +
        '<div class="cta" style="justify-content:flex-start;flex-wrap:wrap">' +
        (D ? '<button class="btn primary small" id="modOpen">📂 Open mods folder</button>' : '') +
        '<button class="btn small" id="modImport">Import a mod folder</button><button class="btn small" id="modReload">↻ Restart to apply</button></div>' +
        '<input type="file" id="modDir" webkitdirectory multiple hidden><p id="modErr" style="color:var(--bad);min-height:1.2em"></p>' +
        '<p class="legend-key">' +
        (D ? 'Put each mod in its own folder inside the Mods folder, then restart. ' : '') +
        'Want to make your own? The free mod kit has a step-by-step guide, ready-to-copy templates and the full reference.</p>' +
        '<div class="cta" style="justify-content:flex-start"><a class="btn small" href="' +
        MODKIT_URL +
        '" target="_blank" rel="noopener">📦 Get the mod kit</a></div>'
    );
    const root = $('#modalRoot');
    root.querySelectorAll('[data-mod]').forEach(cb =>
      cb.addEventListener('change', () => {
        M.setEnabled(cb.dataset.mod, cb.checked);
        changed = true;
        $('#modNote').textContent = 'Restart to apply your changes.';
      })
    );
    root.querySelectorAll('[data-rm]').forEach(b =>
      b.addEventListener('click', async () => {
        await M.remove(b.dataset.rm);
        M.loaded = M.loaded.filter(x => x.key !== b.dataset.rm);
        changed = true;
        modsModal();
      })
    );
    if (D) $('#modOpen').onclick = () => D.openModsFolder();
    $('#modReload').onclick = () => location.reload();
    $('#modImport').onclick = () => $('#modDir').click();
    $('#modDir').onchange = async e => {
      try {
        const m = await M.importFiles(e.target.files);
        App.toast('Mod imported: ' + m.name + '. Restarting to load it...');
        setTimeout(() => location.reload(), 1200);
      } catch (er) {
        $('#modErr').textContent = 'Could not import: ' + (er.message || er);
      }
    };
  }
  App.modsModal = modsModal;

  /* ---------------- desktop updates ---------------- */
  if (!D) return;
  const upd = () => App.store.get('fw.updates', { auto: true });
  let status = { state: 'idle' };
  function banner(text, action) {
    let b = $('#updBanner');
    if (!b) {
      b = document.createElement('div');
      b.id = 'updBanner';
      b.className = 'upd-banner';
      document.body.appendChild(b);
    }
    b.innerHTML =
      '<span>' +
      H.esc(text) +
      '</span>' +
      (action ? '<button class="btn primary small" id="updGo">' + H.esc(action) + '</button>' : '') +
      '<button class="btn small ghost" id="updX">✕</button>';
    $('#updX').onclick = () => b.remove();
    if (action) $('#updGo').onclick = () => D.installUpdate();
  }
  D.onUpdate(s => {
    status = s;
    if (s.state === 'ready') banner('Destiny Unbound ' + s.version + ' is ready to install.', 'Restart and update');
    const el = $('#updStatus');
    if (el) el.textContent = statusText();
  });
  function statusText() {
    return (
      {
        idle: '',
        checking: 'Checking for updates...',
        none: 'You have the latest version.',
        available: 'Downloading version ' + (status.version || '') + '...',
        progress: 'Downloading... ' + (status.percent || 0) + '%',
        ready: 'Version ' + status.version + ' is ready: restart to install.',
        error: 'Could not check for updates (' + (status.message || 'offline') + ').',
        unsupported: status.message || 'Updates are not available for this copy.',
      }[status.state] || ''
    );
  }
  if (upd().auto) setTimeout(() => D.checkForUpdates(), 4000);
  // the update switch and "Check for updates" live in Options > Data (options.js)
})();
