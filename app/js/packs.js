/* Destiny Unbound wheel packs: shareable JSON files that add wheel entries (with buffs and debuffs) and Workshop edits.
   Pack format (see packs/example-sky-pirates.json):
     { "format": "fatewheel-pack", "version": 1, "name": "...", "description": "...", "author": "...",
       "entries": { "race": [ { "name": "...", "w": 3, "dsl": "spd+1", "perk": "...", "flaw": "...", "art": "how it looks" } ], "wpn": [...], ... },
       "workshop": { "pet": { "weights": { "Raven": 10 }, "removed": ["Pet Rock"] } } }
   SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html;
  const KEYS = {
    race: 'Races',
    birth: 'Birthplaces',
    bg: 'Backgrounds',
    per: 'Personalities',
    cls: 'Classes',
    wpn: 'Weapons',
    enh: 'Enhancements',
    elem: 'Elements',
    pow: 'Powers',
    weak: 'Weaknesses',
    pet: 'Companions',
    title: 'Titles',
    mark: 'Marks of Fate',
    hair: 'Hair',
    eyes: 'Eyes',
    garb: 'Outfits',
  };
  const listOf = k => FW.LISTS[k] && FW.LISTS[k]();
  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        /* ignore */
      }
    },
  };

  /* check a pack and return a cleaned copy; throws with a readable message */
  FW.validatePack = function (p) {
    if (!p || p.format !== 'fatewheel-pack')
      throw new Error('This is not a Destiny Unbound pack (missing "format": "fatewheel-pack").');
    const name = String(p.name || '')
      .trim()
      .slice(0, 60);
    if (!name) throw new Error('The pack needs a name.');
    const out = {
      format: 'fatewheel-pack',
      version: 1,
      name,
      description: String(p.description || '').slice(0, 300),
      author: String(p.author || '').slice(0, 60),
      entries: {},
      workshop: {},
    };
    let count = 0;
    Object.keys(p.entries || {}).forEach(k => {
      if (!KEYS[k]) throw new Error('Unknown wheel "' + k + '". Use one of: ' + Object.keys(KEYS).join(', ') + '.');
      if (!Array.isArray(p.entries[k])) throw new Error('"' + k + '" must be a list of entries.');
      out.entries[k] = p.entries[k].slice(0, 200).map((e, i) => {
        const n = String((e && e.name) || '')
          .trim()
          .slice(0, 60);
        if (!n) throw new Error(k + ' entry ' + (i + 1) + ' has no name.');
        const w = Number(e.w == null ? 3 : e.w);
        if (!(w > 0 && w <= 200)) throw new Error('"' + n + '": weight must be between 0 and 200.');
        let dsl = String(e.dsl || '').trim();
        if (k === 'pow' && !/rar=\d/.test(dsl)) dsl = ('rar=2 ' + dsl).trim();
        if (k === 'wpn' && !/q=\d/.test(dsl) && !/(^|\s)none(\s|$)/.test(dsl)) dsl = ('q=2 ' + dsl).trim();
        if (k === 'title' && !/tt=\d/.test(dsl)) dsl = ('tt=1 rt+1 ' + dsl).trim();
        if (k === 'race' && !/life=/.test(dsl)) dsl = (dsl + ' life=m').trim();
        try {
          FW.parse(dsl);
        } catch (er) {
          throw new Error('"' + n + '": ' + er.message);
        }
        count++;
        return {
          name: n,
          w,
          dsl,
          perk: String(e.perk || '').slice(0, 120),
          flaw: String(e.flaw || '').slice(0, 120),
          art: String(e.art || '').slice(0, 200),
        };
      });
    });
    Object.keys(p.workshop || {}).forEach(k => {
      const o = p.workshop[k] || {};
      if (!(KEYS[k] || k === 'story' || /^(sub|ladder):/.test(k))) return;
      out.workshop[k] = {
        weights: {},
        removed: Array.isArray(o.removed) ? o.removed.map(String).slice(0, 300) : [],
        added: [],
      };
      Object.keys(o.weights || {}).forEach(n => {
        const v = Number(o.weights[n]);
        if (v > 0 && v <= 1000) out.workshop[k].weights[n] = v;
      });
    });
    if (!count && !Object.keys(out.workshop).length) throw new Error('The pack is empty.');
    return out;
  };

  /* add / remove a pack's entries in the live wheel lists */
  function applyEntries(pack, id) {
    Object.keys(pack.entries).forEach(k => {
      const list = listOf(k);
      if (!list) return;
      pack.entries[k].forEach(e => {
        if (list.some(x => x.name === e.name)) return; // never shadow an existing entry
        list.push({ name: e.name, w: e.w, dsl: e.dsl, perk: e.perk, flaw: e.flaw, _pack: id });
        if (k === 'race' && e.art && FW.RACE_ART) FW.RACE_ART[e.name] = e.art;
      });
    });
  }
  function removeEntries(id) {
    Object.keys(KEYS).forEach(k => {
      const list = listOf(k);
      if (!list) return;
      for (let i = list.length - 1; i >= 0; i--) if (list[i]._pack === id) list.splice(i, 1);
    });
  }
  FW.installPackEntries = applyEntries;
  FW.removePackEntries = removeEntries;

  const packs = () => store.get('fw.packs', []);
  const savePacks = p => store.set('fw.packs', p);
  packs()
    .filter(p => p.enabled)
    .forEach(p => {
      try {
        applyEntries(FW.validatePack(p), p.id);
      } catch (e) {
        /* a broken pack is skipped */
      }
    });

  /* Workshop edits from enabled packs sit underneath the player's own edits */
  FW.mergeOverrides = function (user) {
    const out = {};
    packs()
      .filter(p => p.enabled && p.workshop)
      .forEach(p =>
        Object.keys(p.workshop).forEach(k => {
          const o = (out[k] = out[k] || { weights: {}, removed: [], added: [] });
          Object.assign(o.weights, p.workshop[k].weights || {});
          (p.workshop[k].removed || []).forEach(n => {
            if (o.removed.indexOf(n) < 0) o.removed.push(n);
          });
        })
      );
    Object.keys(user || {}).forEach(k => {
      const u = user[k] || {},
        o = (out[k] = out[k] || { weights: {}, removed: [], added: [] });
      Object.assign(o.weights, u.weights || {});
      (u.removed || []).forEach(n => {
        if (o.removed.indexOf(n) < 0) o.removed.push(n);
      });
      o.added = (o.added || []).concat(u.added || []);
    });
    return out;
  };

  /* ---------------- UI ---------------- */
  const App = window.FWApp;
  if (!App) return;
  const download = (text, file) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 8000);
  };
  function addPack(p) {
    const all = packs();
    const id = 'p' + Date.now().toString(36);
    const old = all.find(x => x.name === p.name);
    if (old) {
      removeEntries(old.id);
      all.splice(all.indexOf(old), 1);
    }
    all.push(Object.assign({ id, enabled: true }, p));
    savePacks(all);
    applyEntries(p, id);
    return all[all.length - 1];
  }
  FW.addPack = addPack;
  function packsModal() {
    const all = packs();
    const count = p => Object.keys(p.entries || {}).reduce((t, k) => t + p.entries[k].length, 0);
    const rows = all.length
      ? all
          .map(
            p =>
              '<div class="hall-item"><div><b>' +
              H.esc(p.name) +
              '</b><span>' +
              H.esc(p.description || '') +
              (p.author ? ' · by ' + H.esc(p.author) : '') +
              ' · ' +
              count(p) +
              (count(p) === 1 ? ' entry' : ' entries') +
              (Object.keys(p.workshop || {}).length
                ? ' · Workshop edits for ' +
                  Object.keys(p.workshop).length +
                  (Object.keys(p.workshop).length === 1 ? ' wheel' : ' wheels')
                : '') +
              '</span></div><div><label class="check"><input type="checkbox" data-en="' +
              p.id +
              '"' +
              (p.enabled ? ' checked' : '') +
              '> on</label> <button class="btn small ghost" data-exp="' +
              p.id +
              '">Export</button> <button class="btn small ghost" data-del="' +
              p.id +
              '">✕</button></div></div>'
          )
          .join('')
      : '<p>No packs installed yet.</p>';
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>Wheel packs</h2><p>Packs add new entries, with their own buffs and debuffs, to any wheel, and can change slice sizes. Share them as <b>.json</b> files. A Legend Code that uses pack entries opens anywhere, but those entries only have their buffs and debuffs where the same pack is installed.</p>' +
        rows +
        '<div class="cta" style="justify-content:flex-start"><button class="btn primary small" id="pkImport">Import a pack file</button><button class="btn small" id="pkExport">Export my Workshop edits as a pack</button></div><input type="file" id="pkFile" accept=".json,application/json" hidden><p id="pkErr" style="color:var(--bad);min-height:1.3em"></p><p class="legend-key">How to write a pack: see docs/modding.md (Wheel packs) and packs/example-sky-pirates.json, in the game\'s source on GitHub.</p>'
    );
    const root = document.getElementById('modalRoot');
    root.querySelectorAll('[data-en]').forEach(cb =>
      cb.addEventListener('change', () => {
        const a = packs(),
          p = a.find(x => x.id === cb.dataset.en);
        if (!p) return;
        p.enabled = cb.checked;
        savePacks(a);
        if (p.enabled) applyEntries(FW.validatePack(p), p.id);
        else removeEntries(p.id);
        App.toast(p.name + (p.enabled ? ' on' : ' off'));
      })
    );
    root.querySelectorAll('[data-del]').forEach(b =>
      b.addEventListener('click', () => {
        removeEntries(b.dataset.del);
        savePacks(packs().filter(x => x.id !== b.dataset.del));
        packsModal();
      })
    );
    root.querySelectorAll('[data-exp]').forEach(b =>
      b.addEventListener('click', () => {
        const p = packs().find(x => x.id === b.dataset.exp);
        const c = FW.validatePack(p);
        download(JSON.stringify(c, null, 2), p.name.replace(/[^\w]+/g, '_') + '.destiny-unbound.json');
      })
    );
    document.getElementById('pkImport').onclick = () => document.getElementById('pkFile').click();
    document.getElementById('pkFile').onchange = async e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try {
        const p = FW.validatePack(JSON.parse(await f.text()));
        addPack(p);
        App.toast('Pack installed: ' + p.name);
        packsModal();
      } catch (er) {
        document.getElementById('pkErr').textContent = 'Could not install: ' + (er.message || er);
      }
    };
    document.getElementById('pkExport').onclick = () => {
      const ws = App.state.overrides || {};
      if (!Object.keys(ws).length) {
        document.getElementById('pkErr').textContent = 'You have no Workshop edits yet.';
        return;
      }
      const pack = {
        format: 'fatewheel-pack',
        version: 1,
        name: 'My Workshop pack',
        description: 'Workshop edits exported from Destiny Unbound',
        entries: {},
        workshop: {},
      };
      Object.keys(ws).forEach(k => {
        pack.workshop[k] = { weights: ws[k].weights || {}, removed: ws[k].removed || [] };
        const add = (ws[k].added || []).filter(a => KEYS[k]);
        if (add.length) pack.entries[k] = add.map(a => ({ name: a.name, w: a.w, dsl: '' }));
      });
      download(JSON.stringify(pack, null, 2), 'my_workshop.destiny-unbound.json');
    };
  }
  App.packsModal = packsModal;
})();
