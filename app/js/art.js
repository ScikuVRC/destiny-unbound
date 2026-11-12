/* FATEWHEEL art: turns a finished legend into an image prompt, and talks to image generators
   and (optionally) a language model that rewrites the prompt. No DOM here: works in the browser and in node 18+.
   Keys are only ever sent to the address the player configured. */
(function (g) {
  const FW = g.FW = g.FW || {};
  const low = s => String(s || '').toLowerCase();

  /* ================= facts and prompt ================= */
  const PRES = { masc: 'male', fem: 'female', andro: 'androgynous' };
  const BUILD = { Tiny: 'tiny, only a few inches tall', Small: 'very short and slight', Tall: 'very tall', Giant: 'a giant towering over humans', Colossal: 'colossal, as big as a building', Titanic: 'titanic, the size of a mountain' };
  const RANK_CUE = { Commoner: 'a humble, ordinary presence', Fighter: 'a capable, scrappy presence', Veteran: 'a seasoned, confident presence', Champion: 'a heroic, commanding presence', Warlord: 'an intimidating aura of power', Mythic: 'a mythic aura that distorts the air', Demigod: 'a divine aura, the ground cracking under their power', 'Cosmic Being': 'reality itself bending around them, cosmic scale' };
  const STAT_CUE = { str: 'radiating immense physical might', spd: 'afterimages trailing from impossible speed', dur: 'unbreakable and unscathed', int: 'a piercing, all-knowing gaze', fgt: 'flawless martial poise' };
  const MOOD = [[/hero|guardian|protector|lawful good|neutral good|honourable/i, 'a noble, resolute expression'], [/ruthless|sadist|tyrant|evil|vengeful|conqueror|bloodthirsty|arrogant/i, 'a cold, menacing expression'], [/pacifist|merciful|cheerful|kind|gentle|loyal|serene|shy/i, 'a gentle, warm expression'],
    [/trickster|chaotic|opportunist|manipulator|greedy|playful|free spirit|calculating|ambitious|mad genius/i, 'a sly smirk'], [/stoic|loner|neutral|scholar|mastermind|brooding|paranoid/i, 'a calm, unreadable expression'], [/hot-headed|zealot|glory|revolutionary|vigilante|anti-hero|justice|thrill/i, 'a fierce, determined expression'], [/coward/i, 'a nervous, wide-eyed expression']];

  function ageWord(L) {
    const a = L.picks.age; if (!a) return '';
    const e = L.entry('age'); const i = e ? FW.AGES.indexOf(e) : -1;
    if (FW.AGE_WORDS && FW.AGE_WORDS[i]) return FW.AGE_WORDS[i];
    if (i === 0) return a.years && a.years < 18 ? 'teenage' : 'young adult';
    return ['', 'adult', 'middle-aged', 'elderly'][i] || 'ancient, ageless';
  }
  /* everything the art (or a language model) needs to know, as plain data */
  const S_AGE = L => (FW.Story && L.saga ? FW.Story.age(L) : null);
  FW.artFacts = function (L) {
    const c = FW.compute(L), e = id => L.entry(id), none = id => !L.has(id) || L.isNone(id);
    const race = L.raceName(), sub = L.has('sub') ? L.pickName('sub') : '';
    const hc = L.heightClass();
    const top = ['str', 'spd', 'dur', 'int', 'fgt'].filter(s => !c.stats[s].na && c.stats[s].lvl >= 60).sort((a, b) => c.stats[b].lvl - c.stats[a].lvl).slice(0, 2);
    const fights = L.chron.filter(x => x.opp);
    const f = {
      name: L.name || '', title: L.pickName('title') || '', presentation: PRES[L.pres] || '', age: ageWord(L), years: L.picks.age && L.picks.age.years || null,
      race, kind: sub, raceLook: (FW.RACE_ART && FW.RACE_ART[race]) || low(race), height: c.height, build: hc ? (BUILD[hc.name] || '') : '',
      hair: L.pickName('hair') || '', eyes: L.pickName('eyes') || '', outfit: L.pickName('garb') || '',
      class: L.pickName('cls') || '', personality: L.pickName('per') || '', background: L.pickName('bg') || '', birthplace: L.pickName('birth') || '',
      weapon: none('wpn') ? '' : L.pickName('wpn'), weaponMastery: c.hasWeapon ? c.stats.wpn.name : '', power: none('pow') ? '' : L.pickName('pow'), powerMastery: c.hasPower ? c.stats.pwr.name : '',
      enhancement: none('enh') ? '' : L.pickName('enh'), element: none('elem') ? '' : L.pickName('elem'), companion: none('pet') ? '' : L.pickName('pet'),
      weakness: none('weak') ? '' : L.pickName('weak'), mark: none('mark') ? '' : L.pickName('mark'),
      stats: {}, topStats: top, rating: c.rating, rank: c.rank,
      allies: L.ally.map(a => a.name).filter(n => n && !/mysterious/.test(n)).slice(-2),
      scars: L.chron.filter(x => x.key === 'scar').length,
      lastFight: fights.length ? fights[fights.length - 1] : null,
      story: L.chron.filter(x => x.text).map(x => (x.opp ? 'vs ' + x.opp + (x.arena ? ' at ' + x.arena : '') + ': ' : '') + x.text),
      saga: FW.Story && L.saga ? FW.Story.artFacts(L) : null
    };
    if (f.saga && L.saga) f.story = f.story.concat(L.saga.log.map(x => x.chapter + ': ' + x.text));
    if (f.saga && S_AGE(L)) { f.years = S_AGE(L); f.age = f.years >= 61 && f.age.indexOf('ancient') < 0 && f.age.indexOf('ageless') < 0 ? 'elderly' : f.age; }
    ['str', 'spd', 'dur', 'int', 'fgt'].forEach(s => { f.stats[FW.LADDERS[s].label] = c.stats[s].na ? '' : c.stats[s].name; });
    return f;
  };

  function customScene(list, lf) { const o = (list || []).find(x => x.key === lf.key && x.scene); return o ? o.scene + ' ' + lf.opp : ''; }
  function sceneText(lf) {
    if (!lf) return '';
    const at = lf.arena ? ' at the ' + lf.arena : '';
    if (lf.kind === 'win') {
      const how = { kill: 'standing victorious over the fallen ' + lf.opp, spare: 'lowering their weapon and sparing the defeated ' + lf.opp, recruit: 'offering a hand to the defeated ' + lf.opp, enslave: 'standing over the kneeling, bound ' + lf.opp,
        banish: 'casting ' + lf.opp + ' through a closing rift', befriend: 'laughing beside ' + lf.opp + ' after their duel', absorb: 'drawing glowing power out of the defeated ' + lf.opp }[lf.key] || customScene(FW.OUTCOMES, lf) || 'victorious over ' + lf.opp;
      return how + at;
    }
    if (lf.kind === 'lose') {
      return ({ scar: 'wounded and bandaged but defiant after losing to ' + lf.opp, captured: 'in chains, a prisoner of ' + lf.opp, rescued: 'being pulled from the battlefield by an ally after losing to ' + lf.opp,
        escaped: 'slipping away into the shadows, escaping ' + lf.opp, awaken: 'on one knee, erupting with newly awakened power before ' + lf.opp, death: 'a fallen hero lying in state, weapons laid beside them, mourned after the battle with ' + lf.opp }[lf.key] || customScene(FW.DEFEATS, lf) || 'defeated by ' + lf.opp) + at;
    }
    return 'locked in a deadlocked clash with ' + lf.opp + at;
  }
  FW.ART_NEGATIVE = 'nsfw, nudity, gore, text, watermark, signature, logo, frame, extra limbs, extra fingers, deformed hands, blurry, low quality, cropped head';
  /* opts: {style, frame, scene (bool), extra} -> {prompt, negative, facts} */
  FW.artPrompt = function (L, opts) {
    opts = opts || {};
    const f = FW.artFacts(L);
    const style = (FW.ART_STYLES || []).find(s => s.id === opts.style) || (FW.ART_STYLES || [])[0] || { text: 'fantasy illustration' };
    const frame = (FW.ART_FRAMES || []).find(s => s.id === opts.frame) || (FW.ART_FRAMES || [])[0] || { text: 'character portrait' };
    const who = [f.presentation, f.age, f.kind && low(f.raceLook).indexOf(low(f.kind)) < 0 ? f.kind + ' ' + f.race : f.race, f.class && f.class !== 'Commoner' ? low(f.class) : ''].filter(Boolean).join(' ');
    const parts = [];
    parts.push(frame.text + ': ' + (f.name ? f.name + ', known as "' + f.title + '"' : '"' + f.title + '"') + ', a ' + who);
    parts.push(f.raceLook);
    if (f.build) parts.push(f.build);
    if (f.hair) parts.push(low(f.hair));
    if (f.eyes) parts.push(low(f.eyes));
    if (f.outfit) parts.push('wearing ' + low(f.outfit));
    if (f.scars) parts.push(f.scars > 1 ? 'several battle scars' : 'a prominent battle scar');
    parts.push(f.weapon ? 'wielding a ' + low(f.weapon) + (/Master|Sage|Legendary|Mythical|Ascendant|Awakened|Divine|Transcendent|Supreme|Absolute|Eternal|Origin/.test(f.weaponMastery) ? ' with effortless mastery' : '') : 'bare-handed in a martial stance');
    if (f.power) parts.push('manifesting the power of ' + low(f.power) + ' as visible magic');
    if (f.element) parts.push(low(f.element) + ' energy swirling around them');
    if (f.enhancement) parts.push('transformed by ' + low(f.enhancement));
    if (f.mark) parts.push('bearing the mark "' + f.mark + '" as a glowing sigil');
    if (f.companion) parts.push('accompanied by a ' + low(f.companion));
    if (f.saga) {
      if (f.saga.world) parts.push('emperor of the known world, wearing an imperial crown'); else if (f.saga.kingdom) parts.push('ruler of the kingdom of ' + f.saga.kingdom + ', wearing a crown');
      if (f.saga.artifacts.length) parts.push('carrying the ' + f.saga.artifacts.join(' and the '));
      if (f.saga.end === 'ascended') parts.push('ascending into godhood, bathed in divine radiance');
    }
    const sceneNow = opts.scene !== false ? sceneText(f.lastFight) : '';
    const allies = f.allies.filter(n => !(sceneNow && f.lastFight && n === f.lastFight.opp));   // the foe in the scene is not also standing behind you
    if (allies.length) parts.push('with their ally ' + allies.join(' and ') + ' behind them');
    const mood = MOOD.find(m => m[0].test(f.personality)); parts.push(mood ? mood[1] : low(f.personality) + ' demeanour');
    f.topStats.forEach(s => parts.push(STAT_CUE[s]));
    if (RANK_CUE[f.rank]) parts.push(RANK_CUE[f.rank]);
    const scene = sceneNow;
    if (scene) parts.push(scene); else if (f.birthplace) parts.push('background: the ' + f.birthplace);
    if (opts.extra) parts.push(String(opts.extra).trim());
    parts.push(style.text);
    parts.push('fully clothed, tasteful, no text or lettering');
    return { prompt: parts.filter(Boolean).join(', '), negative: FW.ART_NEGATIVE, facts: f };
  };

  /* ================= transport helpers ================= */
  const trimBase = u => String(u || '').trim().replace(/\/+$/, '');
  function b64ToBlob(b64, type) {
    b64 = String(b64).replace(/^data:[^,]*,/, '').replace(/\s+/g, '');
    let bytes;
    if (typeof atob === 'function') { const bin = atob(b64); bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); }
    else bytes = new Uint8Array(Buffer.from(b64, 'base64'));
    return new Blob([bytes], { type: type || sniff(bytes) });
  }
  function sniff(b) { return b[0] === 0xff && b[1] === 0xd8 ? 'image/jpeg' : b[0] === 0x52 && b[1] === 0x49 ? 'image/webp' : 'image/png'; }
  class ArtError extends Error { constructor(msg, hint) { super(msg); this.name = 'ArtError'; this.hint = hint || ''; } }
  FW.ArtError = ArtError;
  async function call(name, url, init, signal) {
    let r;
    try { r = await fetch(url, Object.assign({}, init, { signal })); }
    catch (e) {
      if (e && e.name === 'AbortError') throw new ArtError('Cancelled.');
      throw new ArtError('Could not reach ' + name + ' at ' + url.replace(/\?.*$/, '') + '.', 'Check that it is running and the address is right. Local tools must also allow requests from a web page (CORS) - see the setup note for this provider.');
    }
    if (!r.ok) {
      let detail = ''; try { const t = await r.text(); try { const j = JSON.parse(t); detail = (j.error && (j.error.message || j.error)) || j.message || j.detail || (j.errors && j.errors.join('; ')) || t; } catch (e) { detail = t; } } catch (e) { /* no body */ }
      if (typeof detail !== 'string') detail = JSON.stringify(detail);
      const hint = r.status === 401 || r.status === 403 ? 'The key was rejected. Check the API key and that it has access to this model.' : r.status === 404 ? 'Address or model not found. Check the base URL and the model name.' : r.status === 429 ? 'Rate limit or quota reached. Wait a little or check your plan.' : '';
      throw new ArtError(name + ' answered ' + r.status + (detail ? ': ' + detail.slice(0, 300) : ''), hint);
    }
    return r;
  }
  const jsonInit = (body, headers) => ({ method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}), body: JSON.stringify(body) });
  const bearer = key => key ? { Authorization: 'Bearer ' + key } : {};
  function dims(size) { const m = /^(\d+)\s*[x×]\s*(\d+)$/.exec(String(size || '')); return m ? { w: +m[1], h: +m[2] } : { w: 1024, h: 1024 }; }
  function ratio(size) { const d = dims(size), r = d.w / d.h; const opts = [['1:1', 1], ['3:2', 1.5], ['2:3', 2 / 3], ['16:9', 16 / 9], ['9:16', 9 / 16], ['4:5', 0.8], ['5:4', 1.25]]; return opts.reduce((a, b) => Math.abs(b[1] - r) < Math.abs(a[1] - r) ? b : a)[0]; }
  /* find the first base64 image anywhere in a JSON reply (formats differ between API revisions) */
  function findImage(o, depth) {
    if (!o || typeof o !== 'object' || (depth || 0) > 12) return null;
    const mime = o.mime_type || o.mimeType || '';
    if (typeof o.data === 'string' && o.data.length > 40 && (/^image\//.test(mime) || o.type === 'image')) return { data: o.data, mime: /^image\//.test(mime) ? mime : '' };
    const keys = Array.isArray(o) ? o.map((_, i) => i) : Object.keys(o);
    for (let i = keys.length - 1; i >= 0; i--) { const hit = findImage(o[keys[i]], (depth || 0) + 1); if (hit) return hit; }
    return null;
  }
  const sleep = (ms, signal) => new Promise((res, rej) => { const t = setTimeout(res, ms); if (signal) signal.addEventListener('abort', () => { clearTimeout(t); rej(new ArtError('Cancelled.')); }, { once: true }); });

  /* ================= image providers ================= */
  const IMG = {};
  IMG.openai = {
    name: 'OpenAI - ChatGPT image model', local: false, key: true, base: 'https://api.openai.com/v1', model: 'gpt-image-2', sizes: ['1024x1024', '1024x1536', '1536x1024'],
    note: 'Needs an OpenAI API key (platform.openai.com) with image access. This is the API, billed per picture: a ChatGPT Plus or Pro subscription does not include it. The same form works for any service that offers an OpenAI-style /images/generations address: change the base URL and model.',
    async run(cfg, req, signal) {
      const body = { model: cfg.model || this.model, prompt: req.prompt, n: 1, size: cfg.size || '1024x1024' };
      const r = await call(this.name, trimBase(cfg.base || this.base) + '/images/generations', jsonInit(body, bearer(cfg.key)), signal);
      const j = await r.json(); const d = j && j.data && j.data[0];
      if (d && d.b64_json) return b64ToBlob(d.b64_json);
      if (d && d.url) { if (/^data:/.test(d.url)) return b64ToBlob(d.url); const im = await call(this.name + ' image download', d.url, {}, signal); return im.blob(); }
      throw new ArtError(this.name + ' replied without an image.', 'The model may not be an image model.');
    }
  };
  IMG.custom = Object.assign({}, IMG.openai, { name: 'Custom OpenAI-compatible', key: false, base: 'http://127.0.0.1:8080/v1', model: '', local: true,
    note: 'For LocalAI, a self-hosted proxy, or any cloud service with an OpenAI-style /images/generations address. Leave the key empty if it needs none.' });
  IMG.xai = {
    name: 'xAI - Grok image model', local: false, key: true, base: 'https://api.x.ai/v1', model: 'grok-imagine-image-2.0', sizes: ['1024x1024'],
    note: 'Needs an xAI API key (console.x.ai). This is the API, billed per picture: an X Premium or SuperGrok subscription does not include it. Size is chosen by the model.',
    async run(cfg, req, signal) {
      const url = trimBase(cfg.base || this.base) + '/images/generations';
      const send = b64 => call(this.name, url, jsonInit(Object.assign({ model: cfg.model || this.model, prompt: req.prompt, n: 1 }, b64 ? { response_format: 'b64_json' } : {}), bearer(cfg.key)), signal);
      let r;
      // ask for the picture inline; if this model does not take that option, ask again without it and download the link
      try { r = await send(true); } catch (e) { if (e instanceof ArtError && / answered (400|422)/.test(e.message)) r = await send(false); else throw e; }
      const j = await r.json(); const d = j && j.data && j.data[0];
      if (d && d.b64_json) return b64ToBlob(d.b64_json);
      if (d && d.url) { if (/^data:/.test(d.url)) return b64ToBlob(d.url); const im = await call(this.name + ' image download', d.url, {}, signal); return im.blob(); }
      throw new ArtError(this.name + ' replied without an image.', 'Check that the model name is an image model.');
    }
  };
  IMG.a1111 = {
    name: 'Stable Diffusion WebUI (AUTOMATIC1111 / Forge)', local: true, key: false, base: 'http://127.0.0.1:7860', model: '', sizes: ['512x512', '512x768', '768x512', '1024x1024', '832x1216', '1216x832'],
    note: 'Runs on your own PC. Start the WebUI with  --api --cors-allow-origins=*  (add them to COMMANDLINE_ARGS in webui-user.bat). Model is optional: leave it empty to use the checkpoint already loaded.',
    async run(cfg, req, signal) {
      const d = dims(cfg.size || '512x768');
      const body = { prompt: req.prompt, negative_prompt: req.negative || '', width: d.w, height: d.h, steps: Math.max(1, Math.min(150, parseInt(cfg.steps, 10) || 25)), cfg_scale: 7, batch_size: 1, n_iter: 1 };
      if (cfg.model) body.override_settings = { sd_model_checkpoint: cfg.model };
      const r = await call(this.name, trimBase(cfg.base || this.base) + '/sdapi/v1/txt2img', jsonInit(body), signal);
      const j = await r.json(); if (!j.images || !j.images[0]) throw new ArtError(this.name + ' replied without an image.');
      return b64ToBlob(j.images[0]);
    }
  };
  IMG.comfy = {
    name: 'ComfyUI', local: true, key: false, base: 'http://127.0.0.1:8188', model: '', sizes: ['512x512', '512x768', '768x512', '1024x1024', '832x1216', '1216x832'],
    note: 'Runs on your own PC. Start ComfyUI with  --enable-cors-header "*" . Model is a checkpoint file name; leave it empty to use the first checkpoint ComfyUI lists. Uses a basic text-to-image workflow (works with SD 1.5 and SDXL checkpoints).',
    async run(cfg, req, signal) {
      const base = trimBase(cfg.base || this.base), d = dims(cfg.size || '512x768');
      let ckpt = cfg.model;
      if (!ckpt) {
        const info = await (await call(this.name, base + '/object_info/CheckpointLoaderSimple', {}, signal)).json();
        let list = info && info.CheckpointLoaderSimple && info.CheckpointLoaderSimple.input && info.CheckpointLoaderSimple.input.required && info.CheckpointLoaderSimple.input.required.ckpt_name;
        if (Array.isArray(list) && Array.isArray(list[0])) list = list[0]; else if (Array.isArray(list) && list[1] && Array.isArray(list[1].options)) list = list[1].options;
        ckpt = Array.isArray(list) && typeof list[0] === 'string' ? list[0] : '';
        if (!ckpt) throw new ArtError('ComfyUI has no checkpoints installed.', 'Put a model file in ComfyUI/models/checkpoints, or type its file name in the Model box.');
      }
      const graph = {
        '3': { class_type: 'KSampler', inputs: { seed: Math.floor(Math.random() * 1e15), steps: Math.max(1, Math.min(150, parseInt(cfg.steps, 10) || 25)), cfg: 7, sampler_name: 'euler', scheduler: 'normal', denoise: 1, model: ['4', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['5', 0] } },
        '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: ckpt } },
        '5': { class_type: 'EmptyLatentImage', inputs: { width: d.w, height: d.h, batch_size: 1 } },
        '6': { class_type: 'CLIPTextEncode', inputs: { text: req.prompt, clip: ['4', 1] } },
        '7': { class_type: 'CLIPTextEncode', inputs: { text: req.negative || '', clip: ['4', 1] } },
        '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
        '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'FateWheel', images: ['8', 0] } }
      };
      const q = await (await call(this.name, base + '/prompt', jsonInit({ prompt: graph, client_id: 'fatewheel' }), signal)).json();
      const id = q && q.prompt_id; if (!id) throw new ArtError('ComfyUI did not accept the workflow.', q && q.error ? JSON.stringify(q.error).slice(0, 300) : '');
      const wait = cfg.pollMs || 1500;
      for (let i = 0; i < 400; i++) {
        await sleep(i ? wait : Math.min(wait, 400), signal);
        const h = await (await call(this.name, base + '/history/' + encodeURIComponent(id), {}, signal)).json();
        const item = h && h[id]; if (!item) continue;
        if (item.status && item.status.status_str === 'error') throw new ArtError('ComfyUI reported an error while generating.', 'Open ComfyUI to see the details. The checkpoint may not match the basic workflow.');
        const outs = item.outputs || {}; const node = Object.keys(outs).map(k => outs[k]).find(o => o.images && o.images.length);
        if (!node) continue;
        const im = node.images[0];
        const v = await call(this.name, base + '/view?filename=' + encodeURIComponent(im.filename) + '&subfolder=' + encodeURIComponent(im.subfolder || '') + '&type=' + encodeURIComponent(im.type || 'output'), {}, signal);
        return v.blob();
      }
      throw new ArtError('ComfyUI took too long.', 'The job may still be running: check the ComfyUI window.');
    }
  };
  IMG.stability = {
    name: 'Stability AI', local: false, key: true, base: 'https://api.stability.ai', model: 'core', sizes: ['1024x1024', '832x1216', '1216x832', '1344x768', '768x1344'],
    note: 'Needs a Stability AI API key. Model is the endpoint name: core or ultra. The size is sent as the nearest aspect ratio.',
    async run(cfg, req, signal) {
      const fd = new FormData(); fd.append('prompt', req.prompt); if (req.negative) fd.append('negative_prompt', req.negative); fd.append('aspect_ratio', ratio(cfg.size)); fd.append('output_format', 'png');
      const ep = /^[a-z0-9-]+$/.test(cfg.model || '') ? cfg.model : 'core';
      const r = await call(this.name, trimBase(cfg.base || this.base) + '/v2beta/stable-image/generate/' + ep, { method: 'POST', headers: Object.assign({ Accept: 'image/*' }, bearer(cfg.key)), body: fd }, signal);
      return r.blob();
    }
  };
  IMG.gemini = {
    name: 'Google Gemini image', local: false, key: true, base: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-nano-banana-2.1', sizes: ['1024x1024'],
    note: 'Needs a Google AI Studio API key. Uses the Interactions API. If your key only has older models, try gemini-2.5-flash-image. Size is chosen by the model.',
    async run(cfg, req, signal) {
      const body = { model: cfg.model || this.model, input: [{ type: 'text', text: req.prompt + (req.negative ? '\nAvoid: ' + req.negative : '') }] };
      const r = await call(this.name, trimBase(cfg.base || this.base) + '/interactions', jsonInit(body, { 'x-goog-api-key': cfg.key || '', 'Api-Revision': '2026-05-20' }), signal);
      const hit = findImage(await r.json());
      if (!hit) throw new ArtError(this.name + ' replied without an image.', 'The model may have answered with text only. Check that the model name is an image model.');
      return b64ToBlob(hit.data, hit.mime);
    }
  };

  /* ================= language models that rewrite the prompt ================= */
  const SYSTEM = 'You write prompts for AI image generators. You get the facts of a fictional fantasy character as JSON, plus a draft prompt. Write ONE improved image prompt of at most 110 words: a single paragraph of concrete visual description (appearance, clothing, weapon, magic, pose, expression, setting, lighting), ending with the art style given. Keep every visual fact from the draft. Use the story notes to choose the moment shown. Do not mention numbers, stats, game terms or the word "prompt". Keep it safe for work: the character is fully clothed. Reply with the prompt text only.';
  const userText = (facts, draft, style) => 'Character facts:\n' + JSON.stringify(facts, null, 1) + '\n\nDraft prompt:\n' + draft + '\n\nArt style: ' + style;
  const clean = t => String(t || '').replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^\s*(prompt\s*:)\s*/i, '').trim().replace(/^["'`]+|["'`]+$/g, '').trim();
  const LLM = {};
  function chatLLM(name, base, model, key, local, note) {
    return { name, base, model, key, local, note, async run(cfg, a, signal) {
      const body = { model: cfg.model || this.model, messages: [{ role: 'system', content: a.system || SYSTEM }, { role: 'user', content: a.user || userText(a.facts, a.draft, a.style) }], stream: false };
      if (!body.model) delete body.model;
      const r = await call(this.name, trimBase(cfg.base || this.base) + '/chat/completions', jsonInit(body, bearer(cfg.key)), signal);
      const j = await r.json(); const m = j && j.choices && j.choices[0] && j.choices[0].message;
      let t = m && m.content; if (Array.isArray(t)) t = t.map(p => p.text || '').join('');
      t = clean(t); if (!t) throw new ArtError(this.name + ' returned an empty answer.', 'Check the model name.');
      return t;
    } };
  }
  LLM.ollama = chatLLM('Ollama (local)', 'http://127.0.0.1:11434/v1', 'llama3.2', false, true, 'Runs on your own PC. Use a model you have pulled (ollama list). Allow browser requests by setting the environment variable OLLAMA_ORIGINS=* and restarting Ollama.');
  LLM.lmstudio = chatLLM('LM Studio (local)', 'http://127.0.0.1:1234/v1', '', false, true, 'Runs on your own PC. Start the local server in LM Studio and switch on "Enable CORS". Model can stay empty to use the loaded model.');
  LLM.custom = chatLLM('Custom OpenAI-compatible', 'http://127.0.0.1:8080/v1', '', false, true, 'For llama.cpp server, KoboldCpp, text-generation-webui, OpenRouter, or any service with an OpenAI-style /chat/completions address.');
  LLM.openai = chatLLM('OpenAI - ChatGPT models', 'https://api.openai.com/v1', 'gpt-5-mini', true, false, 'Needs an OpenAI API key (not a ChatGPT subscription). Type any chat model your key can use.');
  LLM.xai = chatLLM('xAI - Grok', 'https://api.x.ai/v1', 'grok-4', true, false, 'Needs an xAI API key (not an X Premium or SuperGrok subscription). Type any Grok chat model your key can use.');
  LLM.anthropic = {
    name: 'Anthropic Claude', base: 'https://api.anthropic.com/v1', model: 'claude-opus-5-5', key: true, local: false, note: 'Needs an Anthropic API key. The request goes straight from this page to Anthropic.',
    async run(cfg, a, signal) {
      const send = async withFallback => {
        const body = { model: cfg.model || this.model, max_tokens: 8000, output_config: { effort: 'low' }, system: a.system || SYSTEM, messages: [{ role: 'user', content: a.user || userText(a.facts, a.draft, a.style) }] };
        const headers = { 'x-api-key': cfg.key || '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
        if (withFallback) { body.fallbacks = 'default'; headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; }
        return call(this.name, trimBase(cfg.base || this.base) + '/messages', jsonInit(body, headers), signal);
      };
      let r;
      // server-side fallback for refusals where the model supports it; retry plainly if the model or account rejects the option
      try { r = await send(true); } catch (e) { if (e instanceof ArtError && / answered 400/.test(e.message)) r = await send(false); else throw e; }
      const j = await r.json();
      if (j.stop_reason === 'refusal') throw new ArtError('Claude declined to write this.', 'Edit the text by hand, or try a different character detail.');
      const t = clean((j.content || []).filter(b => b.type === 'text').map(b => b.text).join(''));
      if (!t) throw new ArtError(this.name + ' returned an empty answer.');
      return t;
    }
  };

  FW.Art = {
    IMAGE: IMG, LLM, b64ToBlob, findImage, ratio, dims,
    /* sites where a paid subscription makes pictures in the chat window; the app only opens them with the prompt */
    SITES: [{ id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q=' }, { id: 'grok', name: 'Grok', url: 'https://grok.com/?q=' }, { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/app' }],
    siteUrl(id, prompt) { const s = this.SITES.find(x => x.id === id); if (!s) return ''; return /\?q=$/.test(s.url) ? s.url + encodeURIComponent('Create an image: ' + String(prompt).slice(0, 1800)) : s.url; },
    /* cfg: {provider, base, key, model, size, steps}; req: {prompt, negative} -> Promise<Blob> */
    async generate(cfg, req, signal) {
      const p = IMG[cfg.provider]; if (!p) throw new ArtError('Choose an image generator first.');
      if (!req || !String(req.prompt || '').trim()) throw new ArtError('The prompt is empty.');
      if (p.key && !cfg.key) throw new ArtError(p.name + ' needs an API key.', 'Paste your key in the API key box. It is only sent to ' + trimBase(cfg.base || p.base).replace(/^https?:\/\//, '') + '.');
      const blob = await p.run(cfg, { prompt: String(req.prompt).trim(), negative: String(req.negative || '').trim() }, signal);
      if (!blob || !blob.size) throw new ArtError(p.name + ' returned an empty image.');
      if (blob.type && !/^image\//.test(blob.type) && blob.type !== 'application/octet-stream') throw new ArtError(p.name + ' returned ' + blob.type + ' instead of an image.');
      return blob;
    },
    /* cfg: {provider, base, key, model}; a: {facts, draft, style} -> Promise<string> */
    async enhance(cfg, a, signal) {
      const p = LLM[cfg.provider]; if (!p) throw new ArtError('Choose a language model first.');
      if (p.key && !cfg.key) throw new ArtError(p.name + ' needs an API key.');
      return p.run(cfg, a, signal);
    },
    /* free text with your own instructions (used by the saga writer): a: {system, user} */
    async write(cfg, a, signal) { return this.enhance(cfg, a, signal); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
