/* Destiny Unbound shared cards: opening someone else's card, collecting it, and short card codes.
   A shared card opens in a viewer (front, Turn over for the stats) and never replaces your own hero. You can keep it
   in "Collected cards" in the Hall of Legends and use it in Versus.
   Short codes (DU-7K3QXM) are made only when a player presses "Get a short code": the card's Legend Code is stored on
   the world counter server for 90 days so anyone can open it with the short code. Nothing else is sent.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    App = window.FWApp,
    H = FW.html;
  const $ = s => document.querySelector(s);
  const t = s => (FW.t ? FW.t(s) : s);
  const KEY = 'fw.collected',
    MAX = 300;
  const URL_BASE = () => FW.WORLD_URL || '';

  const C = (FW.Collect = {
    list: () => App.store.get(KEY, []),
    has: code => C.list().some(x => x.code === code),
    add(L, from) {
      const code = L.toCode();
      const list = C.list().filter(x => x.code !== code);
      const c = FW.compute(L);
      list.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        code,
        title: L.displayName(),
        race: (L.has('sub') ? L.pickName('sub') + ' ' : '') + L.raceName(),
        rating: c.rating,
        rank: c.rank,
        from: from || '',
        date: new Date().toISOString().slice(0, 10),
      });
      App.store.set(KEY, list.slice(0, MAX));
    },
    remove(id) {
      App.store.set(
        KEY,
        C.list().filter(x => x.id !== id)
      );
    },
    isShort: s => /^\s*(DU[\s-]?)?[23456789ABCDEFGHJKMNPQRSTWXYZ]{6}\s*$/i.test(String(s || '')),
    /* a long Legend Code, or a short code looked up on the server */
    async resolve(input) {
      const s = String(input || '').trim();
      if (/^FW1\./.test(s)) return { code: s, short: '' };
      if (!C.isShort(s)) throw new Error(t('Paste a card code (DU-…) or a Legend Code (FW1.…).'));
      if (!URL_BASE()) throw new Error(t('Short codes need the online service, which this copy does not have.'));
      let r;
      try {
        r = await fetch(URL_BASE() + '/v1/card/' + encodeURIComponent(s.replace(/\s/g, '')), {
          credentials: 'omit',
          referrerPolicy: 'no-referrer',
          cache: 'no-store',
        });
      } catch (e) {
        throw new Error(t("The card server can't be reached right now."));
      }
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.code) throw new Error(t('No card has that code (codes last 90 days).'));
      return { code: j.code, short: j.id || '' };
    },
    /* store this Legend Code on the server and get its short code */
    async shorten(code) {
      if (!URL_BASE()) throw new Error(t('Short codes need the online service, which this copy does not have.'));
      const r = await fetch(URL_BASE() + '/v1/card', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: { 'Content-Type': 'text/plain' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.id) throw new Error(j.error || 'HTTP ' + r.status);
      return j.id;
    },
  });

  /* ---------------- the viewer ---------------- */
  function viewer(L, short) {
    const style = App.store.get('fw.cardStyle', 'arch') === 'full' ? 'full' : 'arch';
    const kept = C.has(L.toCode());
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>' +
        H.esc(L.displayName()) +
        '</h2><p class="legend-key">' +
        H.esc(t("Someone else's card. Opening it doesn't change your own hero.")) +
        (short ? ' · ' + H.esc(short) : '') +
        '</p><div class="card-flip view-flip" id="vFlip"><div class="card-inner">' +
        '<canvas class="card-canvas card-front" id="vFront" aria-label="' +
        H.esc(t('Character card')) +
        '"></canvas><canvas class="card-canvas card-back" id="vBack" aria-hidden="true"></canvas></div></div>' +
        '<div class="cta" style="margin-top:12px"><button class="btn small" id="vTurn">' +
        H.esc(t('Turn over')) +
        '</button><button class="btn primary small" id="vKeep"' +
        (kept ? ' disabled' : '') +
        '>' +
        H.esc(t(kept ? 'In your collection' : 'Add to my collection')) +
        '</button><button class="btn small ghost" id="vFight">' +
        H.esc(t('Fight it in Versus')) +
        '</button></div>'
    );
    const o = { theme: App.state.theme, image: FW.defaultPortrait(L) };
    FW.drawCard($('#vFront'), L, Object.assign({ side: 'front', style }, o));
    FW.drawCard($('#vBack'), L, Object.assign({ side: 'back' }, o));
    const flip = () => {
      const f = $('#vFlip'),
        on = !f.classList.contains('flipped');
      f.classList.toggle('flipped', on);
      $('#vBack').setAttribute('aria-hidden', String(!on));
    };
    $('#vFlip').onclick = flip;
    $('#vTurn').onclick = flip;
    $('#vKeep').onclick = () => {
      C.add(L, short);
      $('#vKeep').disabled = true;
      $('#vKeep').textContent = t('In your collection');
      App.toast(t('Added to Collected cards in the Hall of Legends'));
    };
    $('#vFight').onclick = () => {
      if (!C.has(L.toCode())) C.add(L, short);
      if (FW.versusModal) FW.versusModal(L.toCode());
    };
  }
  C.view = viewer;

  /* Open a shared card: the box where a player pastes a code */
  function openModal(prefill) {
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>' +
        H.esc(t('Open a shared card')) +
        '</h2><p>' +
        H.esc(
          t(
            'Paste a card code like DU-7K3QXM, or a long Legend Code (FW1.…). It opens in a viewer; your own hero stays as it is.'
          )
        ) +
        '</p><textarea id="codeIn" rows="3" placeholder="DU-…  /  FW1.…"></textarea><p id="codeErr" style="color:var(--bad);min-height:1.4em"></p><button class="btn primary" id="codeGo">' +
        H.esc(t('Open card')) +
        '</button>'
    );
    if (prefill) $('#codeIn').value = prefill;
    $('#codeGo').onclick = async () => {
      $('#codeErr').textContent = '';
      $('#codeGo').disabled = true;
      try {
        const r = await C.resolve($('#codeIn').value);
        viewer(FW.Legend.fromCode(r.code), r.short);
      } catch (e) {
        if ($('#codeErr')) $('#codeErr').textContent = t('Could not open that card:') + ' ' + (e.message || e);
      } finally {
        if ($('#codeGo')) $('#codeGo').disabled = false;
      }
    };
  }
  C.openModal = openModal;

  /* the "Collected cards" part of the Hall of Legends */
  C.hallHtml = function () {
    const list = C.list();
    return (
      '<h3 class="opt-h">' +
      H.esc(t('Collected cards')) +
      '</h3>' +
      (list.length
        ? list
            .map(
              h =>
                '<div class="hall-item"><div><b>' +
                H.esc(h.title) +
                '</b><span>' +
                H.esc(h.race) +
                ' · ' +
                H.esc(t('rating')) +
                ' ' +
                h.rating +
                ' (' +
                H.esc(t(h.rank)) +
                ')' +
                (h.from ? ' · ' + H.esc(h.from) : '') +
                '</span></div><div><button class="btn small" data-cview="' +
                h.id +
                '">' +
                H.esc(t('View')) +
                '</button> <button class="btn small ghost" data-cdel="' +
                h.id +
                '" aria-label="' +
                H.esc(t('Remove')) +
                '">✕</button></div></div>'
            )
            .join('')
        : '<p class="legend-key">' +
          H.esc(t('Cards other players share with you go here. Open one with Open a shared card.')) +
          '</p>') +
      '<p><button class="btn small" id="hallOpenShared">' +
      H.esc(t('Open a shared card')) +
      '</button></p>'
    );
  };
  C.bindHall = function (root, rerender) {
    root.querySelectorAll('[data-cview]').forEach(b =>
      b.addEventListener('click', () => {
        const h = C.list().find(x => x.id === b.dataset.cview);
        if (h) viewer(FW.Legend.fromCode(h.code), h.from);
      })
    );
    root.querySelectorAll('[data-cdel]').forEach(b =>
      b.addEventListener('click', () => {
        C.remove(b.dataset.cdel);
        rerender();
      })
    );
    const o = root.querySelector('#hallOpenShared');
    if (o) o.onclick = () => openModal();
  };

  /* "Get a short code" on your own card */
  C.shareShort = async function (L) {
    try {
      const id = await C.shorten(L.toCode());
      App.copy(id, t('Card code copied:') + ' ' + id);
      return id;
    } catch (e) {
      App.toast(t('Could not make a short code:') + ' ' + (e.message || e));
      return '';
    }
  };
})();
