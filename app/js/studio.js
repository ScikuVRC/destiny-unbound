/* Destiny Unbound personalisation panel + Art Studio (AI portrait). Loaded after app.js. */
(function () {
  'use strict';
  const FW = window.FW,
    H = FW.html,
    App = window.FWApp,
    state = App.state,
    store = App.store;
  const $ = s => document.querySelector(s);
  const esc = H.esc;

  /* ================= "Make it yours" panel on the home screen ================= */
  const PRESETS = [
    ['race', 'Race', () => FW.RACES],
    ['cls', 'Class', () => FW.CLASSES],
    ['elem', 'Element', () => FW.ELEMENTS],
    ['hair', 'Hair', () => FW.HAIR],
    ['eyes', 'Eyes', () => FW.EYES],
    ['garb', 'Outfit', () => FW.GARB],
    ['pet', 'Companion', () => FW.PETS],
  ];
  function savePerson() {
    store.set('fw.person', state.person);
  }
  function renderPerson() {
    const p = state.person;
    const sel = PRESETS.map(x => {
      const names = x[2]()
        .map(r => r.name)
        .sort((a, b) => a.localeCompare(b));
      return (
        '<label class="mini"><span>' +
        x[1] +
        '</span><select data-preset="' +
        x[0] +
        '"><option value="">🎲 Spin for it</option>' +
        names.map(n => '<option' + (p.presets[x[0]] === n ? ' selected' : '') + '>' + esc(n) + '</option>').join('') +
        '</select></label>'
      );
    }).join('');
    $('#personBox').innerHTML =
      '<label class="mini"><span>Hero name (optional)</span><span class="name-row"><input id="pName" maxlength="40" placeholder="e.g. Kael Ashborne" value="' +
      esc(p.name) +
      '"><button type="button" class="btn small ghost" id="pNameDice" title="Suggest a name" aria-label="Suggest a name">🎲</button></span></label>' +
      '<label class="mini"><span>Presentation</span><select id="pPres"><option value="">Not specified</option><option value="fem"' +
      (p.pres === 'fem' ? ' selected' : '') +
      '>Feminine</option><option value="masc"' +
      (p.pres === 'masc' ? ' selected' : '') +
      '>Masculine</option><option value="andro"' +
      (p.pres === 'andro' ? ' selected' : '') +
      '>Androgynous</option></select></label>' +
      '<label class="check"><input type="checkbox" id="pLooks"' +
      (p.spinLooks !== false ? ' checked' : '') +
      '> Spin the appearance wheels (hair, eyes, outfit). Off = rolled quietly.</label>' +
      '<details class="fold"' +
      (Object.keys(p.presets).some(k => p.presets[k]) ? ' open' : '') +
      '><summary>Choose instead of spinning</summary><div class="mini-grid">' +
      sel +
      '</div><p class="legend-key">Anything you choose here skips its wheel. Everything else is still up to fate.</p></details>';
    // a suggested name: a given name and a house name, in a random naming style
    $('#pNameDice').onclick = () => {
      const N = FW.Names,
        rng = Math.random;
      if (!N) return;
      const style = N.STYLES[Math.floor(rng() * N.STYLES.length)];
      p.name = N.person(rng, style) + ' ' + N.house(rng).slice(6);
      $('#pName').value = p.name;
      savePerson();
    };
    $('#pName').addEventListener('input', e => {
      p.name = e.target.value.trim().slice(0, 40);
      savePerson();
    });
    $('#pPres').addEventListener('change', e => {
      p.pres = e.target.value;
      savePerson();
    });
    $('#pLooks').addEventListener('change', e => {
      p.spinLooks = e.target.checked;
      savePerson();
    });
    $('#personBox')
      .querySelectorAll('[data-preset]')
      .forEach(s =>
        s.addEventListener('change', () => {
          p.presets[s.dataset.preset] = s.value;
          savePerson();
        })
      );
  }

  /* ================= portraits kept with Hall entries (IndexedDB, this device only) ================= */
  const idb = {
    open() {
      return new Promise((res, rej) => {
        try {
          const r = indexedDB.open('fatewheel', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('art');
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) {
          rej(e);
        }
      });
    },
    async tx(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const t = db.transaction('art', mode);
        const rq = fn(t.objectStore('art'));
        t.oncomplete = () => {
          db.close();
          res(rq && rq.result);
        };
        t.onerror = t.onabort = () => {
          db.close();
          rej(t.error);
        };
      });
    },
    put(k, v) {
      return this.tx('readwrite', s => s.put(v, k)).catch(() => null);
    },
    get(k) {
      return this.tx('readonly', s => s.get(k)).catch(() => null);
    },
    del(k) {
      return this.tx('readwrite', s => s.delete(k)).catch(() => null);
    },
    clear() {
      return this.tx('readwrite', s => s.clear()).catch(() => null);
    },
  };
  function blobToImage(blob) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(blob);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => {
        URL.revokeObjectURL(url);
        rej(new Error('That file is not an image the browser can show.'));
      };
      im.src = url;
    });
  }
  async function usePortrait(blob, msg) {
    const im = await blobToImage(blob);
    state.image = im;
    state.imageBlob = blob;
    App.drawCardNow();
    if (msg) App.toast(msg);
  }
  App.hooks.hallSave = item => {
    if (state.imageBlob) idb.put(item.id, state.imageBlob);
  };
  App.hooks.hallDelete = id => {
    idb.del(id);
  };
  App.hooks.hallLoad = async id => {
    const b = id && (await idb.get(id));
    if (b && state.screen === 'card') {
      try {
        await usePortrait(b);
      } catch (e) {
        /* unreadable: keep the drawn card */
      }
    }
  };
  App.hooks.reset = () => {
    idb.clear();
    state.person = { name: '', pres: '', spinLooks: true, presets: {} };
    keys.img = {};
    keys.llm = {};
    art = defaults();
    renderPerson();
  };
  App.hooks.portraitFile = f =>
    usePortrait(f, 'Portrait applied (kept on this device only)').catch(e => App.toast(e.message));

  /* ================= Art Studio ================= */
  const defaults = () => ({
    style: 'fantasy',
    frame: 'portrait',
    scene: true,
    extra: '',
    remember: false,
    cap: 10,
    used: { day: '', n: 0 },
    img: { provider: 'a1111', cfgs: {} },
    llm: { provider: '', cfgs: {} },
  });
  let art = Object.assign(defaults(), store.get('fw.art', {}));
  art.img = Object.assign({ provider: 'a1111', cfgs: {} }, art.img);
  art.llm = Object.assign({ provider: '', cfgs: {} }, art.llm);
  if (!FW.Art.IMAGE[art.img.provider]) art.img.provider = 'a1111';
  if (!(art.cap >= 1)) art.cap = 10;
  if (!art.used || typeof art.used !== 'object') art.used = { day: '', n: 0 };
  const today = () => new Date().toISOString().slice(0, 10);
  const usedToday = () => (art.used.day === today() ? art.used.n : 0);
  if (art.llm.provider && !FW.Art.LLM[art.llm.provider]) art.llm.provider = '';
  const keys = { img: {}, llm: {} }; // keys typed this session; written to storage only when "remember" is ticked
  let job = null,
    lastBlob = null,
    lastUrl = '',
    dirty = false;

  function saveArt() {
    const copy = JSON.parse(JSON.stringify(art));
    ['img', 'llm'].forEach(k =>
      Object.keys(copy[k].cfgs).forEach(id => {
        if (art.remember && keys[k][id]) copy[k].cfgs[id].key = keys[k][id];
        else delete copy[k].cfgs[id].key;
      })
    );
    store.set('fw.art', copy);
  }
  ['img', 'llm'].forEach(k =>
    Object.keys(art[k].cfgs).forEach(id => {
      if (art[k].cfgs[id].key) keys[k][id] = art[k].cfgs[id].key;
    })
  );
  function cfgOf(kind) {
    const group = art[kind],
      defs = kind === 'img' ? FW.Art.IMAGE : FW.Art.LLM,
      d = defs[group.provider];
    if (!d) return null;
    const c = (group.cfgs[group.provider] = group.cfgs[group.provider] || {});
    return {
      provider: group.provider,
      def: d,
      base: c.base != null ? c.base : d.base,
      model: c.model != null ? c.model : d.model,
      size: c.size || (d.sizes && d.sizes[0]) || '1024x1024',
      steps: c.steps || 25,
      key: keys[kind][group.provider] || '',
    };
  }
  function setCfg(kind, field, value) {
    const group = art[kind];
    const c = (group.cfgs[group.provider] = group.cfgs[group.provider] || {});
    if (field === 'key') keys[kind][group.provider] = value;
    else c[field] = value;
    saveArt();
  }
  App.llmCfg = () => cfgOf('llm');
  const build = () =>
    FW.artPrompt(state.legend, { style: art.style, frame: art.frame, scene: art.scene, extra: art.extra });
  const opt = (v, label, cur) =>
    '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(label) + '</option>';
  const hostOf = u => {
    try {
      return new URL(u).host;
    } catch (e) {
      return u;
    }
  };
  const isLocalUrl = u =>
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(u || '');

  function providerForm(kind) {
    const c = cfgOf(kind);
    if (!c) return '<p class="legend-key">Off. The prompt above is used as written.</p>';
    const d = c.def,
      id = kind === 'img' ? 'ai' : 'al';
    let h =
      '<div class="mini-grid">' +
      '<label class="mini"><span>Address (base URL)</span><input id="' +
      id +
      'Base" value="' +
      esc(c.base) +
      '" spellcheck="false" autocomplete="off"></label>' +
      '<label class="mini"><span>Model' +
      (d.model ? '' : ' (optional)') +
      '</span><input id="' +
      id +
      'Model" value="' +
      esc(c.model) +
      '" placeholder="' +
      (d.model ? esc(d.model) : 'default') +
      '" spellcheck="false" autocomplete="off"></label>';
    if (kind === 'img') {
      h +=
        '<label class="mini"><span>Size</span><select id="aiSize">' +
        (d.sizes || ['1024x1024']).map(s => opt(s, s.replace('x', ' × '), c.size)).join('') +
        '</select></label>';
      if (c.provider === 'a1111' || c.provider === 'comfy')
        h +=
          '<label class="mini"><span>Steps</span><input id="aiSteps" type="number" min="1" max="150" value="' +
          esc(c.steps) +
          '"></label>';
    }
    h +=
      '<label class="mini wide"><span>API key' +
      (d.key ? '' : ' (only if your server needs one)') +
      '</span><input id="' +
      id +
      'Key" type="password" value="' +
      esc(c.key) +
      '" placeholder="' +
      (d.key ? 'paste your key' : 'none') +
      '" autocomplete="off" spellcheck="false"></label></div>' +
      '<p class="note">' +
      esc(d.note) +
      '</p>';
    return h;
  }
  function sendsTo(kind) {
    const c = cfgOf(kind);
    return c ? hostOf(c.base) : '';
  }

  function openStudio() {
    if (!state.legend) return;
    const L = state.legend,
      hasFight = L.chron.some(x => x.opp);
    const p = build();
    dirty = false;
    const imgOpts = Object.keys(FW.Art.IMAGE).map(k => [k, FW.Art.IMAGE[k]]);
    const llmOpts = Object.keys(FW.Art.LLM).map(k => [k, FW.Art.LLM[k]]);
    const group = (list, cur, local) =>
      list
        .filter(x => !!x[1].local === local)
        .map(x => opt(x[0], x[1].name, cur))
        .join('');
    App.openModal(
      '<button class="btn small ghost close">Close ✕</button><h2>🎨 Art Studio</h2>' +
        '<p>Turn <b>' +
        esc(L.displayName()) +
        '</b> into a portrait. The prompt below is written from everything the wheels decided' +
        (hasFight ? ' and what happened in the arena' : '') +
        '. Send it to an image generator on your own PC or to an online service with your own key.</p>' +
        '<h3 class="step">1 · The prompt</h3>' +
        '<div class="mini-grid"><label class="mini"><span>Art style</span><select id="arStyle">' +
        FW.ART_STYLES.map(s => opt(s.id, s.name, art.style)).join('') +
        '</select></label>' +
        '<label class="mini"><span>Framing</span><select id="arFrame">' +
        FW.ART_FRAMES.map(s => opt(s.id, s.name, art.frame)).join('') +
        '</select></label>' +
        '<label class="mini wide"><span>Extra details (optional)</span><input id="arExtra" maxlength="200" placeholder="e.g. standing in the rain, crimson moon behind" value="' +
        esc(art.extra) +
        '"></label></div>' +
        (hasFight
          ? '<label class="check"><input type="checkbox" id="arScene"' +
            (art.scene ? ' checked' : '') +
            '> Show the latest arena moment instead of the birthplace</label>'
          : '') +
        '<textarea id="arPrompt" rows="7" spellcheck="false" aria-label="Image prompt">' +
        esc(p.prompt) +
        '</textarea>' +
        '<label class="mini wide" style="margin-top:8px"><span>Things to avoid (used by Stable Diffusion, ComfyUI, Stability and Gemini)</span><textarea id="arNeg" rows="2" spellcheck="false">' +
        esc(p.negative) +
        '</textarea></label>' +
        '<div class="card-actions"><button class="btn small" id="arRebuild">↻ Rewrite from character</button><button class="btn small" id="arCopy">Copy prompt</button></div>' +
        '<details class="fold" id="arLlmFold"' +
        (art.llm.provider ? ' open' : '') +
        '><summary>2 · Polish the prompt with a language model (optional)</summary>' +
        '<label class="mini wide"><span>Language model</span><select id="alProv"><option value="">Off</option><optgroup label="On your PC">' +
        group(llmOpts, art.llm.provider, true) +
        '</optgroup><optgroup label="Online (your own key)">' +
        group(llmOpts, art.llm.provider, false) +
        '</optgroup></select></label>' +
        '<div id="alForm"></div><div class="card-actions"><button class="btn small" id="alGo">✨ Polish prompt</button><span class="status" id="alStatus"></span></div></details>' +
        '<h3 class="step">3 · Image generator</h3>' +
        '<label class="mini wide"><span>Where should the picture be made?</span><select id="aiProv"><optgroup label="On your PC (free, private)">' +
        group(imgOpts, art.img.provider, true) +
        '</optgroup><optgroup label="Online (your own key)">' +
        group(imgOpts, art.img.provider, false) +
        '</optgroup></select></label>' +
        '<div id="aiForm"></div>' +
        '<label class="check"><input type="checkbox" id="arRemember"' +
        (art.remember ? ' checked' : '') +
        '> Remember API keys in this browser (stored unencrypted on this device; leave off on a shared PC)</label>' +
        '<p class="note" id="arPrivacy"></p>' +
        '<div class="warn" id="arWarn" hidden></div>' +
        '<div class="card-actions"><button class="btn primary" id="aiGo">🎨 Generate portrait</button><button class="btn ghost" id="aiCancel" hidden>Cancel</button><span class="status" id="aiStatus" aria-live="polite"></span></div>' +
        '<details class="fold" id="arSubFold"><summary>No API key? Use your ChatGPT, Grok or Gemini subscription</summary>' +
        '<p class="note">A paid plan such as ChatGPT Plus or SuperGrok makes pictures inside its own chat window, and it cannot be connected to another app: there is no sign-in for that, and this app never asks for your password. So do it in two steps. <b>1.</b> Press a button: the prompt is copied and the site opens in a new tab, where you sign in as usual. <b>2.</b> Save or copy the picture it makes, then bring it back here.</p>' +
        '<div class="warn">Subscriptions have their own picture limits per day or per few hours, and the limits change. If the site says you have reached your limit, wait or use a local generator.</div>' +
        '<div class="card-actions">' +
        FW.Art.SITES.map(
          s => '<button class="btn small" data-site="' + s.id + '">Copy prompt and open ' + esc(s.name) + '</button>'
        ).join('') +
        '</div>' +
        '<div class="card-actions"><button class="btn small" id="arPick">Choose the saved picture</button><span class="status">or copy the picture on the site and press Ctrl+V here</span><input type="file" id="arFile" accept="image/*" hidden></div></details>' +
        '<div class="art-out" id="arOut" hidden><img id="arImg" alt="Generated portrait"><div class="card-actions" style="justify-content:center"><button class="btn primary" id="arUse">Use on card</button><button class="btn small" id="arSave">Download image</button></div></div>'
    );

    const root = $('#modalRoot');
    const warn = () => {
      const c = cfgOf('img'),
        el = $('#arWarn');
      if (!el) return;
      const online = !isLocalUrl(c.base);
      el.hidden = !online;
      if (!online) return;
      el.innerHTML =
        '<b>Limits and cost.</b> Every picture is charged to your account at ' +
        esc(hostOf(c.base)) +
        ' and counts against that service\'s rate limits. A chat subscription does not cover it. To protect you, this app stops after <input id="arCap" type="number" min="1" max="500" value="' +
        esc(art.cap) +
        '" aria-label="Daily limit"> online pictures a day on this device. Used today: <b id="arUsed">' +
        usedToday() +
        '</b>.';
      $('#arCap').addEventListener('change', e => {
        const v = Math.max(1, Math.min(500, parseInt(e.target.value, 10) || 10));
        art.cap = v;
        e.target.value = v;
        saveArt();
      });
    };
    const showPicture = (blob, msg) => {
      if (lastUrl) URL.revokeObjectURL(lastUrl);
      lastBlob = blob;
      lastUrl = URL.createObjectURL(blob);
      $('#arImg').src = lastUrl;
      $('#arOut').hidden = false;
      const el = $('#aiStatus');
      el.className = 'status good';
      el.textContent = msg;
      $('#arOut').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    const takeFile = async f => {
      if (!f) return;
      try {
        await blobToImage(f);
        showPicture(f, 'Picture loaded. Press "Use on card".');
      } catch (e) {
        App.toast(e.message);
      }
    };
    if (pasteHandler) document.removeEventListener('paste', pasteHandler);
    pasteHandler = e => {
      const it = [...((e.clipboardData && e.clipboardData.items) || [])].find(
        i => i.kind === 'file' && /^image\//.test(i.type)
      );
      if (it && root.contains($('#arOut'))) {
        e.preventDefault();
        takeFile(it.getAsFile());
      }
    };
    document.addEventListener('paste', pasteHandler);
    const privacy = () => {
      warn();
      const a = sendsTo('img'),
        b = art.llm.provider ? sendsTo('llm') : '';
      $('#arPrivacy').textContent =
        'The prompt' +
        (cfgOf('img').key ? ' and your key are' : ' is') +
        ' sent to ' +
        a +
        (b && b !== a ? ' (and to ' + b + ' when you polish it)' : '') +
        ' and nowhere else. ' +
        (isLocalUrl(cfgOf('img').base)
          ? 'That address is on your own network.'
          : 'That is an online service: its own terms and prices apply.');
    };
    const wire = kind => {
      const id = kind === 'img' ? 'ai' : 'al';
      $('#' + id + 'Form').innerHTML = providerForm(kind);
      [
        ['Base', 'base'],
        ['Model', 'model'],
        ['Key', 'key'],
        ['Size', 'size'],
        ['Steps', 'steps'],
      ].forEach(f => {
        const el = $('#' + id + f[0]);
        if (el)
          el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
            setCfg(kind, f[1], el.value.trim());
            privacy();
          });
      });
      $('#alGo').disabled = !art.llm.provider;
      privacy();
    };
    wire('img');
    wire('llm');
    $('#aiProv').addEventListener('change', e => {
      art.img.provider = e.target.value;
      saveArt();
      wire('img');
    });
    $('#alProv').addEventListener('change', e => {
      art.llm.provider = e.target.value;
      saveArt();
      wire('llm');
    });
    $('#arRemember').addEventListener('change', e => {
      art.remember = e.target.checked;
      saveArt();
    });
    const rebuild = force => {
      if (dirty && !force) return;
      const q = build();
      $('#arPrompt').value = q.prompt;
      dirty = false;
    };
    $('#arStyle').addEventListener('change', e => {
      art.style = e.target.value;
      saveArt();
      rebuild();
      if (dirty) App.toast('Style saved - press "Rewrite from character" to apply it to your edited prompt');
    });
    $('#arFrame').addEventListener('change', e => {
      art.frame = e.target.value;
      saveArt();
      rebuild();
      if (dirty) App.toast('Framing saved - press "Rewrite from character" to apply it');
    });
    $('#arExtra').addEventListener('input', e => {
      art.extra = e.target.value;
      saveArt();
      rebuild();
    });
    if ($('#arScene'))
      $('#arScene').addEventListener('change', e => {
        art.scene = e.target.checked;
        saveArt();
        rebuild();
      });
    $('#arPrompt').addEventListener('input', () => {
      dirty = true;
    });
    $('#arRebuild').onclick = () => {
      rebuild(true);
      $('#arNeg').value = FW.ART_NEGATIVE;
      App.toast('Prompt rewritten from the character');
    };
    $('#arCopy').onclick = () => App.copy($('#arPrompt').value, 'Prompt copied');
    root.querySelectorAll('[data-site]').forEach(b =>
      b.addEventListener('click', () => {
        const text = $('#arPrompt').value.trim();
        if (!text) return App.toast('The prompt is empty');
        App.copy(text, 'Prompt copied - paste it there if the box is empty');
        window.open(FW.Art.siteUrl(b.dataset.site, text), '_blank', 'noopener');
      })
    );
    $('#arPick').onclick = () => $('#arFile').click();
    $('#arFile').addEventListener('change', e => {
      takeFile(e.target.files && e.target.files[0]);
      e.target.value = '';
    });

    const fail = (el, e) => {
      el.className = 'status bad';
      el.textContent = (e && e.message ? e.message : String(e)) + (e && e.hint ? ' ' + e.hint : '');
    };
    const busy = (el, label) => {
      const t0 = Date.now();
      el.className = 'status';
      el.textContent = label;
      return setInterval(() => {
        el.textContent = label + ' ' + Math.round((Date.now() - t0) / 1000) + 's';
      }, 1000);
    };
    $('#alGo').onclick = async () => {
      const c = cfgOf('llm');
      if (!c || job) return;
      const el = $('#alStatus'),
        ac = new AbortController(),
        timer = busy(el, 'Writing…');
      job = ac;
      $('#alGo').disabled = true;
      try {
        const style = (FW.ART_STYLES.find(s => s.id === art.style) || {}).text || '';
        const text = await FW.Art.enhance(c, { facts: build().facts, draft: $('#arPrompt').value, style }, ac.signal);
        if (!root.contains(el)) return;
        $('#arPrompt').value = text;
        dirty = true;
        el.className = 'status good';
        el.textContent = 'Prompt polished. Edit it freely.';
      } catch (e) {
        if (root.contains(el)) fail(el, e);
      } finally {
        clearInterval(timer);
        job = null;
        if (root.contains(el)) $('#alGo').disabled = !art.llm.provider;
      }
    };
    $('#aiGo').onclick = async () => {
      const c = cfgOf('img');
      if (!c || job) return;
      const online = !isLocalUrl(c.base);
      if (online && usedToday() >= art.cap) {
        const s = $('#aiStatus');
        s.className = 'status bad';
        s.textContent =
          'You have reached your own limit of ' +
          art.cap +
          ' online pictures for today. Raise the number in the yellow box to continue, or use a generator on your PC.';
        return;
      }
      const el = $('#aiStatus'),
        ac = new AbortController(),
        timer = busy(el, 'Generating…');
      job = ac;
      $('#aiGo').disabled = true;
      $('#aiCancel').hidden = false;
      const limit = setTimeout(() => ac.abort(), 10 * 60 * 1000);
      try {
        const blob = await FW.Art.generate(c, { prompt: $('#arPrompt').value, negative: $('#arNeg').value }, ac.signal);
        await blobToImage(blob); // proves the bytes are a real image before we offer it
        if (!root.contains(el)) return;
        if (online) {
          art.used = { day: today(), n: usedToday() + 1 };
          saveArt();
        }
        if (!root.contains(el)) return;
        showPicture(
          blob,
          'Done. Use it on the card, or generate again for a different take.' +
            (online ? ' (' + usedToday() + ' of ' + art.cap + ' online pictures today)' : '')
        );
        if ($('#arUsed')) $('#arUsed').textContent = usedToday();
        $('#aiGo').textContent = '🎨 Generate again';
      } catch (e) {
        if (root.contains(el)) fail(el, e);
      } finally {
        clearInterval(timer);
        clearTimeout(limit);
        job = null;
        if (root.contains(el)) {
          $('#aiGo').disabled = false;
          $('#aiCancel').hidden = true;
        }
      }
    };
    $('#aiCancel').onclick = () => {
      if (job) job.abort();
    };
    $('#arUse').onclick = async () => {
      if (!lastBlob) return;
      try {
        await usePortrait(lastBlob, 'Portrait added to your card');
        App.closeModal();
      } catch (e) {
        App.toast(e.message);
      }
    };
    $('#arSave').onclick = () => {
      if (!lastBlob) return;
      const ext = /jpeg/.test(lastBlob.type) ? 'jpg' : /webp/.test(lastBlob.type) ? 'webp' : 'png';
      const a = document.createElement('a');
      a.href = lastUrl;
      a.download = 'destiny-unbound_' + L.displayName().replace(/[^\w]+/g, '_') + '_art.' + ext;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
  }
  let pasteHandler = null;
  App.hooks.modalClosed = () => {
    if (job) {
      job.abort();
      job = null;
    }
    if (pasteHandler) {
      document.removeEventListener('paste', pasteHandler);
      pasteHandler = null;
    }
  };

  $('#btnArt').onclick = openStudio;
  renderPerson();
  App.openStudio = openStudio;
  App.art = () => art;
  App.usePortrait = usePortrait;
  App.renderPerson = renderPerson;
})();
