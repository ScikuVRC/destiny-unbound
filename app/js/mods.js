/* Destiny Unbound mods: themes, sounds and wheel packs that players add themselves. No code runs from a mod.
   A mod is a folder with a mod.json (see mods/example-mod and docs/modding.md):
   { "format": "fatewheel-mod", "version": 1, "id": "my-mod", "name": "...", "author": "...", "description": "...",
     "themes": [ { "id": "verdant", "name": "Verdant Grove", "blurb": "Druid circle", "base": "astral",
                   "vars": { "--bg": "#0d1a10", "--accent": "#5fbf6a" }, "css": "theme.css",
                   "fonts": [ { "family": "My Font", "file": "my-font.woff2", "weight": 400, "style": "normal" } ],
                   "wheel": { "pal": [["#1d3a22", "#2c5a33"]], "lad": ["#e6f5d0", "#1a3a1a"], "hit": "rgba(150,255,120,.5)", "glow": "#7dff6a", "font": "\"My Font\", serif" },
                   "card": { "key": "#5fbf6a", "accent": "#9fe08a", "panel": "rgba(10,20,12,.88)" },
                   "sounds": { "tick": "tick.wav", "music": "grove.ogg" } } ],
     "sounds": { "reveal": "reveal.wav" },
     "packs": [ { "name": "...", "entries": { "race": [ ... ] } } ] }
   Desktop: mods live in the Mods folder (menu > Mods > Open mods folder). Browser: Mods > Import a mod.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const M = (FW.Mods = { loaded: [], errors: [] });
  const BASES = ['ashen', 'astral', 'iron', 'bloodmoon'];
  const baseOf = b =>
    BASES.indexOf(b) >= 0 ? b : FW.THEME_ALIAS && BASES.indexOf(FW.THEME_ALIAS[b]) >= 0 ? FW.THEME_ALIAS[b] : null; // old mods may say 'tabletop' (now 'astral')
  const VARS = [
    '--bg',
    '--topbar',
    '--fg',
    '--muted',
    '--line',
    '--panel',
    '--panel-fg',
    '--chip-bg',
    '--chip-fg',
    '--chip-border',
    '--chip-radius',
    '--accent',
    '--accent2',
    '--accent-fg',
    '--good',
    '--bad',
    '--btn-bg',
    '--btn-fg',
    '--radius',
    '--font',
    '--font-display',
    '--font-chip',
    '--font-result',
    '--result-weight',
  ];
  const SOUNDS = ['tick', 'reveal', 'rare', 'bad', 'click', 'music'];
  const SOUND_EXT = /\.(mp3|ogg|oga|wav|m4a|aac|flac|webm)$/i,
    FONT_EXT = /\.(woff2|woff|ttf|otf)$/i,
    CSS_EXT = /\.css$/i;
  const slug = s =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
  // nothing in a value may load from outside the mod: no url(), image-set(), image(), cross-fade() or src()
  const safeValue = v =>
    typeof v === 'string' &&
    v.length <= 200 &&
    !/url\s*\(|image-set|image\s*\(|cross-fade|src\s*\(|expression\s*\(|javascript:|[;{}<>@\\]/i.test(v);
  const safeFile = f => typeof f === 'string' && f.length <= 120 && !/(^|[\\/])\.\.([\\/]|$)|^[\\/]|^[a-z]+:/i.test(f);
  const color = v =>
    typeof v === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i.test(v.trim());

  /* check a mod.json and return a cleaned copy (throws with a readable message) */
  M.validate = function (m) {
    if (!m || m.format !== 'fatewheel-mod')
      throw new Error('Not a Destiny Unbound mod: mod.json needs "format": "fatewheel-mod".');
    const id = slug(m.id || m.name);
    if (!id) throw new Error('The mod needs an "id" (letters, numbers and dashes).');
    const out = {
      format: 'fatewheel-mod',
      version: 1,
      id,
      name: String(m.name || id).slice(0, 60),
      author: String(m.author || '').slice(0, 60),
      description: String(m.description || '').slice(0, 300),
      themes: [],
      sounds: {},
      packs: [],
    };
    const files = new Set();
    const file = (f, re, what) => {
      if (!safeFile(f)) throw new Error(what + ': "' + f + '" must be a file inside the mod folder.');
      if (re && !re.test(f)) throw new Error(what + ': "' + f + '" has the wrong file type.');
      files.add(f);
      return f;
    };
    const sounds = (s, where) => {
      const o = {};
      Object.keys(s || {}).forEach(k => {
        if (SOUNDS.indexOf(k) < 0)
          throw new Error(where + ': unknown sound "' + k + '". Use ' + SOUNDS.join(', ') + '.');
        o[k] = file(s[k], SOUND_EXT, where + ' sound ' + k);
      });
      return o;
    };
    (Array.isArray(m.themes) ? m.themes : []).slice(0, 12).forEach((t, i) => {
      const tid = slug(t && (t.id || t.name));
      if (!tid) throw new Error('Theme ' + (i + 1) + ' needs an id.');
      const base = baseOf(t.base) || 'ashen';
      const th = {
        id: 'mod-' + id + '-' + tid,
        name: String(t.name || tid).slice(0, 40),
        blurb: String(t.blurb || out.name).slice(0, 40),
        base,
        vars: {},
        css: null,
        fonts: [],
        wheel: {},
        card: {},
        sounds: {},
      };
      Object.keys(t.vars || {}).forEach(k => {
        if (VARS.indexOf(k) < 0) throw new Error(th.name + ': unknown variable ' + k + '.');
        if (!safeValue(t.vars[k])) throw new Error(th.name + ': the value of ' + k + ' is not allowed.');
        th.vars[k] = t.vars[k];
      });
      if (t.css) th.css = file(t.css, CSS_EXT, th.name + ' css');
      (Array.isArray(t.fonts) ? t.fonts : []).slice(0, 8).forEach(f => {
        const fam = String(f.family || '')
          .replace(/["';{}\\<>]/g, '')
          .slice(0, 40);
        if (!fam) throw new Error(th.name + ': a font needs a "family".');
        th.fonts.push({
          family: fam,
          file: file(f.file, FONT_EXT, th.name + ' font'),
          weight: /^\d{3}$/.test(String(f.weight)) ? String(f.weight) : '400',
          style: f.style === 'italic' ? 'italic' : 'normal',
        });
      });
      const w = t.wheel || {};
      const cols = a => Array.isArray(a) && a.length && a.every(color);
      if (w.pal) {
        if (!Array.isArray(w.pal) || !w.pal.every(p => Array.isArray(p) && p.length === 2 && p.every(color)))
          throw new Error(th.name + ': wheel "pal" must be a list of [inner, outer] colour pairs.');
        th.wheel.pal = w.pal.slice(0, 8);
      }
      if (w.lad) {
        if (!cols(w.lad) || w.lad.length < 2) throw new Error(th.name + ': wheel "lad" must be at least two colours.');
        th.wheel.lad = w.lad.slice(0, 8);
      }
      if (w.gray) {
        if (!cols(w.gray) || w.gray.length !== 2) throw new Error(th.name + ': wheel "gray" must be two colours.');
        th.wheel.gray = w.gray;
      }
      ['line', 'ink', 'inkDark', 'inkLight', 'hit', 'glow'].forEach(k => {
        if (w[k] != null) {
          if (!color(w[k])) throw new Error(th.name + ': wheel "' + k + '" must be a colour.');
          th.wheel[k] = w[k];
        }
      });
      if (w.font) {
        if (!safeValue(w.font)) throw new Error(th.name + ': wheel font not allowed.');
        th.wheel.font = w.font;
      }
      ['upper', 'italic'].forEach(k => {
        if (typeof w[k] === 'boolean') th.wheel[k] = w[k];
      });
      const c = t.card || {};
      ['panel', 'stroke', 'key', 'val', 'sub', 'accent'].forEach(k => {
        if (c[k] != null) {
          if (!color(c[k])) throw new Error(th.name + ': card "' + k + '" must be a colour.');
          th.card[k] = c[k];
        }
      });
      ['font', 'head'].forEach(k => {
        if (c[k] != null) {
          if (!safeValue(c[k])) throw new Error(th.name + ': card ' + k + ' not allowed.');
          th.card[k] = c[k];
        }
      });
      if (typeof c.caps === 'boolean') th.card.caps = c.caps;
      if (baseOf(c.frame)) th.card.frame = baseOf(c.frame);
      th.sounds = sounds(t.sounds, th.name);
      out.themes.push(th);
    });
    out.sounds = sounds(m.sounds, 'Mod');
    (Array.isArray(m.packs) ? m.packs : []).slice(0, 10).forEach((p, i) => {
      if (!FW.validatePack) return;
      out.packs.push(
        FW.validatePack(
          Object.assign({ format: 'fatewheel-pack', name: (p && p.name) || out.name + ' pack ' + (i + 1) }, p)
        )
      );
    });
    if (!out.themes.length && !Object.keys(out.sounds).length && !out.packs.length)
      throw new Error('The mod is empty: add themes, sounds or packs.');
    out.files = [...files];
    return out;
  };

  /* mod CSS only applies while its theme is active, may not load anything from outside the mod, and cannot import */
  M.scopeCss = function (css, themeId, resolve) {
    let s = String(css || '')
      .slice(0, 100000)
      .replace(/\/\*[\s\S]*?\*\//g, '');
    s = s.replace(/\\/g, ''); // no CSS escapes: they could spell url( or a closing brace in disguise
    s = s
      .replace(/@import[^;]*;?/gi, '')
      .replace(/expression\s*\(/gi, 'x(')
      .replace(/javascript:/gi, '')
      .replace(/behavior\s*:/gi, 'x:')
      .replace(/<\/?style/gi, '');
    s = s.replace(/(-webkit-)?image-set\s*\(|\bimage\s*\(|cross-fade\s*\(|\bsrc\s*\(/gi, 'x('); // these load pictures without url()
    s = s.replace(/url\([^)]*\)|\b[a-z][a-z0-9+.-]*:\/\/[^\s)'";]*/gi, m => (/^url\(/i.test(m) ? m : '')); // no web addresses outside url() (url() is checked below)
    // keep every rule inside the theme: cut the CSS where a stray } would close the wrapper early
    let depth = 0,
      cut = s.length;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{') depth++;
      else if (ch === '}' && --depth < 0) {
        cut = i;
        break;
      }
    }
    s = s.slice(0, cut);
    if (depth > 0) s += '}'.repeat(depth);
    s = s.replace(/url\(\s*(['"]?)([^'")]*)\1\s*\)/gi, (all, q, u) => {
      const r = safeFile(u) ? resolve(u) : null;
      return r ? 'url("' + r + '")' : 'none';
    });
    return 'body[data-theme="' + themeId + '"]{' + s + '}';
  };

  /* put a mod theme into the game (wheel art, page style, card, sound) */
  function baseVars(base) {
    const out = {};
    if (typeof document === 'undefined' || !document.body || typeof getComputedStyle !== 'function') return out;
    const probe = document.createElement('div');
    probe.dataset.theme = base;
    probe.hidden = true;
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    VARS.forEach(k => {
      const v = cs.getPropertyValue(k).trim();
      if (v) out[k] = v;
    });
    probe.remove();
    return out;
  }

  M.registerTheme = function (th, resolve) {
    const base = FW.THEMES[th.base];
    FW.THEMES[th.id] = Object.assign({}, base, th.wheel, {
      name: th.name,
      blurb: th.blurb,
      sound: th.base,
      base: th.base,
      mod: true,
    });
    if (FW.CARD_THEMES)
      FW.CARD_THEMES[th.id] = Object.assign({}, FW.CARD_THEMES[th.base], th.card, { frame: th.card.frame || th.base });
    let css = th.fonts
      .map(
        f =>
          '@font-face{font-family:"' +
          f.family +
          '";font-weight:' +
          f.weight +
          ';font-style:' +
          f.style +
          ';font-display:swap;src:url("' +
          resolve(f.file) +
          '")}'
      )
      .join('\n');
    // Variables the theme leaves out come from its base (the page only has the base's values under its own
    // data-theme, so read them from a hidden element that carries it).
    const all = Object.assign(baseVars(th.base), th.vars);
    const vars = Object.keys(all)
      .map(k => k + ':' + all[k])
      .join(';');
    css += '\n[data-theme="' + th.id + '"]{' + vars + '}';
    return css;
  };

  if (typeof document === 'undefined') return;
  /* ---------------- loading (browser / desktop) ---------------- */
  const App = g.FWApp;
  const DB = 'fatewheel-mods';
  const idb = () =>
    new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('mods', { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  const tx = async (mode, fn) => {
    const db = await idb();
    return new Promise((res, rej) => {
      const t = db.transaction('mods', mode),
        st = t.objectStore('mods');
      const r = fn(st);
      t.oncomplete = () => res(r && r.result);
      t.onerror = () => rej(t.error);
    });
  };
  M.imported = () => tx('readonly', st => st.getAll());
  const settings = () => (App ? App.store.get('fw.mods', {}) : {});
  M.isEnabled = id => settings()[id] !== false;
  M.setEnabled = (id, on) => {
    const s = settings();
    s[id] = !!on;
    App.store.set('fw.mods', s);
  };

  async function sources() {
    const out = [];
    if (g.fatewheelDesktop && g.fatewheelDesktop.listMods) {
      try {
        (await g.fatewheelDesktop.listMods()).forEach(m =>
          out.push({
            source: 'folder',
            folder: m.folder,
            text: m.manifest,
            resolve: f => 'mods/' + encodeURIComponent(m.folder) + '/' + f.split('/').map(encodeURIComponent).join('/'),
          })
        );
      } catch (e) {
        M.errors.push('Mods folder: ' + e.message);
      }
    }
    try {
      (await M.imported()).forEach(m => {
        const urls = {};
        Object.keys(m.files || {}).forEach(f => {
          urls[f] = URL.createObjectURL(m.files[f]);
        });
        out.push({ source: 'imported', key: m.id, text: m.manifest, resolve: f => urls[f] || '' });
      });
    } catch (e) {
      /* no IndexedDB (private window) */
    }
    return out;
  }
  M.load = async function () {
    const style =
      document.getElementById('modStyles') ||
      Object.assign(document.head.appendChild(document.createElement('style')), { id: 'modStyles' });
    let css = '';
    for (const src of await sources()) {
      let mod;
      try {
        mod = M.validate(JSON.parse(src.text));
      } catch (e) {
        M.errors.push((src.folder || src.key) + ': ' + e.message);
        continue;
      }
      mod.source = src.source;
      mod.folder = src.folder;
      mod.key = src.key;
      mod.enabled = M.isEnabled(mod.id);
      M.loaded.push(mod);
      if (!mod.enabled) continue;
      try {
        for (const th of mod.themes) {
          css += M.registerTheme(th, src.resolve) + '\n';
          if (th.css) {
            const r = await fetch(src.resolve(th.css));
            if (r.ok) css += M.scopeCss(await r.text(), th.id, src.resolve) + '\n';
          }
          await loadSounds(th.id, th.sounds, src.resolve);
        }
        await loadSounds('*', mod.sounds, src.resolve);
        mod.packs.forEach((p, i) => FW.installPackEntries && FW.installPackEntries(p, 'mod:' + mod.id + ':' + i));
      } catch (e) {
        M.errors.push(mod.name + ': ' + e.message);
      }
    }
    style.textContent = css;
    return M.loaded;
  };
  const MAX_SOUND = 30 * 1024 * 1024;
  async function loadSounds(themeId, map, resolve) {
    const files = {};
    for (const k of Object.keys(map || {})) {
      try {
        const r = await fetch(resolve(map[k]));
        if (!r.ok) continue;
        if (+(r.headers.get('content-length') || 0) > MAX_SOUND) {
          M.errors.push('Sound ' + map[k] + ' is larger than 30 MB');
          continue;
        }
        const buf = await r.arrayBuffer();
        if (buf.byteLength > MAX_SOUND) {
          M.errors.push('Sound ' + map[k] + ' is larger than 30 MB');
          continue;
        }
        files[k] = buf;
      } catch (e) {
        M.errors.push('Sound ' + map[k] + ': ' + e.message);
      }
    }
    if (Object.keys(files).length && FW.Audio.loadCustom) await FW.Audio.loadCustom(themeId, files);
  }

  /* import a mod from files the player picked (a folder, or mod.json plus its files) */
  M.importFiles = async function (fileList) {
    const files = [...fileList],
      man = files.find(f => /(^|\/)mod\.json$/i.test(f.webkitRelativePath || f.name));
    if (!man) throw new Error('Pick the mod folder, or mod.json together with its files.');
    const root = (man.webkitRelativePath || '').replace(/mod\.json$/i, '');
    const text = await man.text(),
      mod = M.validate(JSON.parse(text));
    let size = 0;
    const store = {};
    for (const f of mod.files) {
      const hit =
        files.find(x => (x.webkitRelativePath ? x.webkitRelativePath.slice(root.length) : x.name) === f) ||
        files.find(x => x.name === f.split('/').pop());
      if (!hit) throw new Error('Missing file: ' + f);
      size += hit.size;
      if (size > 60 * 1024 * 1024) throw new Error('The mod is larger than 60 MB.');
      store[f] = hit;
    }
    await tx('readwrite', st => st.put({ id: mod.id, manifest: text, files: store, added: Date.now() }));
    return mod;
  };
  M.remove = id => tx('readwrite', st => st.delete(id));
})(typeof window !== 'undefined' ? window : globalThis);
