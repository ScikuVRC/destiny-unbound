// node tests/art.test.js  - new content, art prompt and every image / language-model connector against a local mock server
const assert = require('assert');
const http = require('http');
const zlib = require('zlib');
['data.js', 'engine.js', 'art.js'].forEach(f => require('../app/js/' + f));
const FW = globalThis.FW;
let passed = 0;
const jobs = [];
const t = (name, fn) => jobs.push([name, fn]);

/* a real 8x8 PNG so the bytes are a valid image */
function png() {
  const crcT = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcT[n] = c >>> 0;
  }
  const crc = b => {
    let c = 0xffffffff;
    for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(8, 0);
  ihdr.writeUInt32BE(8, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc(8 * 25);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      raw[y * 25 + 1 + x * 3] = 200;
      raw[y * 25 + 2 + x * 3] = 60 + x * 20;
      raw[y * 25 + 3 + x * 3] = 120;
    }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
const PNG = png(),
  B64 = PNG.toString('base64');
const seen = [];
const server = http.createServer((req, res) => {
  const bufs = [];
  req.on('data', d => bufs.push(d));
  req.on('end', () => {
    const raw = Buffer.concat(bufs);
    let body = null;
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch (e) {
      body = raw.toString('latin1');
    }
    seen.push({ method: req.method, url: req.url, headers: req.headers, body });
    const json = (o, code) => {
      res.writeHead(code || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(o));
    };
    const u = req.url;
    if (u === '/v1/images/generations')
      return req.headers.authorization === 'Bearer bad'
        ? json({ error: { message: 'Incorrect API key provided' } }, 401)
        : json({ data: [{ b64_json: B64 }] });
    if (u === '/xai/v1/images/generations') return json({ data: [{ b64_json: B64 }] });
    if (u === '/xai2/v1/images/generations')
      return body.response_format
        ? json({ error: 'Unknown field response_format' }, 400)
        : json({ data: [{ url: 'http://127.0.0.1:' + server.address().port + '/file.png' }] });
    if (u === '/urlapi/images/generations')
      return json({ data: [{ url: 'http://127.0.0.1:' + server.address().port + '/file.png' }] });
    if (u === '/file.png') {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return res.end(PNG);
    }
    if (u === '/sdapi/v1/txt2img') return json({ images: [B64] });
    if (u === '/object_info/CheckpointLoaderSimple')
      return json({
        CheckpointLoaderSimple: { input: { required: { ckpt_name: [['dream.safetensors', 'other.ckpt']] } } },
      });
    if (u === '/prompt') return json({ prompt_id: 'abc123' });
    if (u === '/history/abc123') {
      server.polls = (server.polls || 0) + 1;
      return json(
        server.polls < 2
          ? {}
          : {
              abc123: {
                outputs: { 9: { images: [{ filename: 'DestinyUnbound_1.png', subfolder: '', type: 'output' }] } },
              },
            }
      );
    }
    if (u.indexOf('/view?filename=DestinyUnbound_1.png') === 0) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return res.end(PNG);
    }
    if (u === '/v2beta/stable-image/generate/core') {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return res.end(PNG);
    }
    if (u === '/v1beta/interactions')
      return json({
        id: 'i1',
        steps: [
          {
            type: 'model_output',
            content: [
              { type: 'text', text: 'here' },
              { type: 'image', mime_type: 'image/png', data: B64 },
            ],
          },
        ],
      });
    if (u === '/v1/chat/completions')
      return json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: '<think>plan</think>\n"A towering knight in the rain, oil painting"',
            },
          },
        ],
      });
    if (u === '/v1/messages') {
      if (server.reject400 && body && body.fallbacks)
        return json({ error: { message: 'fallbacks: Extra inputs are not permitted' } }, 400);
      if (server.refuse) return json({ stop_reason: 'refusal', content: [] });
      return json({
        stop_reason: 'end_turn',
        content: [
          { type: 'thinking', thinking: '' },
          { type: 'text', text: 'A pale vampire queen on a moonlit balcony, dark fantasy painting' },
        ],
      });
    }
    json({ error: { message: 'no such route ' + u } }, 404);
  });
});

function fullLegend(seed, luck) {
  const rng = FW.makeRng(seed);
  const L = new FW.Legend({ luck: luck || 'heroic', seed });
  let i = -1;
  while ((i = FW.nextStageIndex(L, i)) < FW.STAGES.length) {
    const st = FW.buildStage(FW.STAGES[i].id, L, {});
    FW.commitPick(L, st, FW.weightedIndex(st.entries, rng), rng);
  }
  return L;
}
const last = () => seen[seen.length - 1];
const isPng = async b => {
  const a = new Uint8Array(await b.arrayBuffer());
  return a[0] === 137 && a[1] === 80 && a.length === PNG.length;
};

t('expansion data is valid: rows parse, names unique, links resolve', () => {
  const lists = {
    CLASSES: FW.CLASSES,
    ELEMENTS: FW.ELEMENTS,
    PETS: FW.PETS,
    HAIR: FW.HAIR,
    EYES: FW.EYES,
    GARB: FW.GARB,
    RACES: FW.RACES,
    WEAPONS: FW.WEAPONS,
    POWERS: FW.POWERS,
    TITLES: FW.TITLES,
  };
  Object.entries(lists).forEach(([n, rows]) => {
    const s = new Set();
    rows.forEach(r => {
      FW.parse(r.dsl);
      assert(r.w > 0, n + ' weight ' + r.name);
      assert(!s.has(r.name), n + ' duplicate ' + r.name);
      s.add(r.name);
    });
  });
  assert(FW.RACES.length >= 65, 'races ' + FW.RACES.length);
  assert(FW.POWERS.length >= 125);
  assert(Object.keys(FW.SUBS).length >= 13);
  FW.RACES.forEach(r => assert(FW.RACE_ART[r.name], 'no art description for ' + r.name));
  FW.HAIRLESS.forEach(r => assert(FW.findByName(FW.RACES, r), 'hairless ' + r));
  Object.keys(FW.AFFINITY).forEach(r => {
    assert(FW.findByName(FW.RACES, r), 'affinity race ' + r);
    FW.AFFINITY[r].forEach(w => assert(FW.findByName(FW.WEAPONS, w), 'affinity weapon ' + w + ' for ' + r));
  });
  FW.NATURAL_WEAPONS.forEach(r => assert(FW.findByName(FW.RACES, r), 'natural ' + r));
  assert.strictEqual(new Set(FW.NATURAL_WEAPONS).size, FW.NATURAL_WEAPONS.length);
  ['cls', 'elem', 'pet'].forEach(id => assert(FW.STAGE_BY_ID[id]));
  assert.strictEqual(FW.ELEMENTS.filter(e => FW.P(e).none).length, 1);
  assert.strictEqual(FW.PETS.filter(e => FW.P(e).none).length, 1);
});

t('300 full legends at every luck level: new stages commit, compute and round-trip', () => {
  ['mortal', 'heroic', 'mythic', 'divine'].forEach(luck => {
    for (let i = 0; i < 75; i++) {
      const L = fullLegend('x' + luck + i, luck);
      FW.validateLegend(L);
      const c = FW.compute(L);
      assert(isFinite(c.rating), 'rating');
      assert(L.has('cls') && L.has('elem') && L.has('pet') && L.has('eyes') && L.has('garb'));
      assert.strictEqual(L.has('hair'), FW.HAIRLESS.indexOf(L.raceName()) < 0, 'hair rule for ' + L.raceName());
      if (FW.SUBS[L.raceName()]) assert(L.has('sub'));
      const lines = FW.cardLines(L, c);
      assert(lines.length <= 18 && lines.every(x => x.v != null && x.v !== ''), 'card lines');
      const back = FW.Legend.fromCode(L.toCode());
      assert.deepStrictEqual(back.picks, L.picks);
      const p = FW.artPrompt(L, {});
      assert(p.prompt.length > 80 && !/undefined|null|NaN|\[object/.test(p.prompt), p.prompt);
    }
  });
});

t('class, element, companion and outfit give real buffs and debuffs', () => {
  const L = fullLegend('buffs');
  const base = Object.assign({}, L.picks);
  const str0 =
    ((L.picks.cls = { name: 'Commoner' }),
    (L.picks.garb = { name: 'Simple peasant clothes' }),
    (L.picks.elem = { name: 'No element' }),
    (L.picks.pet = { name: 'No companion' }),
    FW.compute(L));
  L.picks.cls = { name: 'Berserker' };
  assert.strictEqual(L.bonusFor('str') - str0.stats.str.bonus, 2);
  L.picks.garb = { name: 'Heavy plate armour' };
  const c1 = FW.compute(L);
  assert.strictEqual(c1.stats.dur.bonus - str0.stats.dur.bonus, 2);
  assert.strictEqual(c1.stats.spd.bonus - str0.stats.spd.bonus, -1);
  L.picks.elem = { name: 'Fire' };
  const c2 = FW.compute(L);
  assert(c2.atk.includes('fire') && c2.res.includes('fire') && c2.weak.includes('water'));
  L.picks.pet = { name: 'Phoenix Chick' };
  assert.strictEqual(FW.compute(L).fate - c2.fate, 2);
  assert(FW.compute(L).sources.some(s => s.label === 'Companion: Phoenix Chick'));
  L.picks = base;
});

t('old Legend Codes (no new stages, Human without heritage) still open', () => {
  const L = fullLegend('old1');
  L.picks.race = { name: 'Human' };
  ['sub', 'hair', 'eyes', 'garb', 'cls', 'elem', 'pet'].forEach(k => delete L.picks[k]);
  const back = FW.Legend.fromCode(L.toCode());
  const c = FW.compute(back);
  assert(isFinite(c.rating));
  assert(FW.cardLines(back, c).length >= 12);
  assert(FW.artPrompt(back, {}).prompt.length > 50);
  const bad = JSON.parse(JSON.stringify(L));
  const M = new FW.Legend({});
  M.picks = Object.assign({}, L.picks, { hacked: { name: 'x' } });
  assert.throws(() => FW.Legend.fromCode(M.toCode()), /Unknown field/);
});

t('name, presentation and hand-picked stages survive the code and show in the text', () => {
  const L = fullLegend('named');
  L.name = 'Kael Ashborne';
  L.pres = 'fem';
  L.chosen = ['race', 'hair'];
  const b = FW.Legend.fromCode(L.toCode());
  assert.strictEqual(b.name, 'Kael Ashborne');
  assert.strictEqual(b.pres, 'fem');
  assert.deepStrictEqual(b.chosen, ['race', 'hair']);
  assert(/NAME: Kael Ashborne/.test(FW.legendText(b)));
  assert.strictEqual(b.displayName(), 'Kael Ashborne');
  const p = FW.artPrompt(b, {}).prompt;
  assert(/Kael Ashborne/.test(p) && /female/.test(p));
});

t('art prompt carries the character: race look, looks, weapon, power, companion, style, framing', () => {
  const L = fullLegend('art1');
  Object.assign(L.picks, {
    race: { name: 'Vampire' },
    sub: { name: 'Blood Noble' },
    hair: { name: 'Long silver hair' },
    eyes: { name: 'Red eyes' },
    garb: { name: "Noble's embroidered coat" },
    cls: { name: 'Spellblade' },
    wpn: { name: 'Rapier' },
    wpnm: { idx: FW.LADDERS.wpn.names.indexOf('Grandmaster') },
    pow: { name: 'Blood Manipulation' },
    powm: { idx: FW.LADDERS.pwr.names.indexOf('Veteran') },
    elem: { name: 'Shadow' },
    pet: { name: 'Raven' },
    enh: { name: 'Lunar Surge' },
    per: { name: 'Ruthless' },
    title: { name: 'The Pale Empress' },
    mark: { name: 'Blessed by the Moon' },
  });
  const p = FW.artPrompt(L, { style: 'anime', frame: 'full', extra: 'crimson moon' });
  [
    'pale vampire with fangs',
    'long silver hair',
    'red eyes',
    "wearing noble's embroidered coat",
    'wielding a rapier with effortless mastery',
    'blood manipulation',
    'shadow energy',
    'lunar surge',
    'accompanied by a raven',
    'The Pale Empress',
    'spellblade',
    'cold, menacing',
    'anime key visual',
    'full-body',
    'crimson moon',
    'fully clothed',
  ].forEach(s => assert(p.prompt.includes(s), 'missing "' + s + '" in: ' + p.prompt));
  assert(/nsfw/.test(p.negative));
  L.picks.wpn = { name: 'No weapon' };
  delete L.picks.wpnm;
  assert(FW.artPrompt(L, {}).prompt.includes('bare-handed'));
});

t('art prompt shows what happened along the way (fights, scars, allies)', () => {
  const L = fullLegend('art2');
  const opp = FW.UNIVERSES[0].opps[4],
    rng = FW.makeRng('c');
  assert(FW.artPrompt(L, {}).prompt.includes('background: the ' + L.pickName('birth')));
  FW.applyConsequence(L, 'lose', 'scar', opp, rng, { arena: 'Frozen Waste', uni: 'Ashen Dominion' });
  let p = FW.artPrompt(L, {});
  assert(
    p.prompt.includes('a prominent battle scar') &&
      p.prompt.includes('after losing to Crowned Wraith at the Frozen Waste'),
    p.prompt
  );
  FW.applyConsequence(L, 'win', 'recruit', opp, rng, { arena: 'Moonless Night' });
  p = FW.artPrompt(L, {});
  assert(
    p.prompt.includes('offering a hand to the defeated Crowned Wraith at the Moonless Night') &&
      !p.prompt.includes('with their ally'),
    p.prompt
  );
  assert(FW.artPrompt(L, { scene: false }).prompt.includes('with their ally Crowned Wraith behind them'));
  assert.strictEqual(p.facts.story.length, 2);
  assert(/vs Crowned Wraith at Frozen Waste/.test(p.facts.story[0]));
  assert(!FW.artPrompt(L, { scene: false }).prompt.includes('offering a hand'));
  const b = FW.Legend.fromCode(L.toCode());
  assert.strictEqual(FW.artPrompt(b, {}).prompt, p.prompt);
});

const base = () => 'http://127.0.0.1:' + server.address().port;
t('OpenAI-style images: request shape, bearer key, base64 reply', async () => {
  const b = await FW.Art.generate(
    { provider: 'openai', base: base() + '/v1', key: 'sk-test', size: '1024x1536' },
    { prompt: 'a knight', negative: 'blurry' }
  );
  assert(await isPng(b));
  const r = last();
  assert.strictEqual(r.headers.authorization, 'Bearer sk-test');
  assert.deepStrictEqual(r.body, { model: 'gpt-image-2', prompt: 'a knight', n: 1, size: '1024x1536' });
});
t('OpenAI-style images: URL reply is downloaded; custom provider needs no key', async () => {
  const b = await FW.Art.generate(
    { provider: 'custom', base: base() + '/urlapi/', model: 'flux' },
    { prompt: 'a knight' }
  );
  assert(await isPng(b));
  assert.strictEqual(seen[seen.length - 2].body.model, 'flux');
  assert.strictEqual(seen[seen.length - 2].headers.authorization, undefined);
});
t('Grok (xAI): inline picture first, falls back to a link when the option is refused', async () => {
  let b = await FW.Art.generate({ provider: 'xai', base: base() + '/xai/v1', key: 'xai-k' }, { prompt: 'a knight' });
  assert(await isPng(b));
  assert.deepStrictEqual(last().body, {
    model: 'grok-imagine-image-2.0',
    prompt: 'a knight',
    n: 1,
    response_format: 'b64_json',
  });
  assert.strictEqual(last().headers.authorization, 'Bearer xai-k');
  const n = seen.length;
  b = await FW.Art.generate({ provider: 'xai', base: base() + '/xai2/v1', key: 'xai-k' }, { prompt: 'a knight' });
  assert(await isPng(b));
  assert.strictEqual(seen.length - n, 3);
  assert(!('response_format' in seen[n + 1].body));
  await assert.rejects(
    FW.Art.generate({ provider: 'xai', base: base() + '/xai/v1' }, { prompt: 'x' }),
    /needs an API key/
  );
  assert.strictEqual(FW.Art.LLM.xai.base, 'https://api.x.ai/v1');
  const u = FW.Art.siteUrl('chatgpt', 'a knight & "dragon"');
  assert(u.startsWith('https://chatgpt.com/?q=Create%20an%20image%3A%20a%20knight%20%26%20%22dragon%22'), u);
  assert(FW.Art.siteUrl('grok', 'x').startsWith('https://grok.com/?q='));
  assert.strictEqual(FW.Art.siteUrl('gemini', 'x'), 'https://gemini.google.com/app');
  assert.strictEqual(FW.Art.siteUrl('nope', 'x'), '');
});
t('errors are readable: missing key, rejected key, unreachable server, empty prompt, wrong route', async () => {
  const fail = async (cfg, req, re) => {
    try {
      await FW.Art.generate(cfg, req || { prompt: 'x' });
    } catch (e) {
      assert(e instanceof FW.ArtError, String(e));
      assert(re.test(e.message + ' ' + e.hint), e.message + ' | ' + e.hint);
      return;
    }
    assert.fail('should have failed');
  };
  await fail({ provider: 'openai', base: base() + '/v1' }, null, /needs an API key/);
  await fail(
    { provider: 'openai', base: base() + '/v1', key: 'bad' },
    null,
    /401: Incorrect API key.*key was rejected/
  );
  await fail({ provider: 'a1111', base: 'http://127.0.0.1:9' }, null, /Could not reach .*CORS/);
  await fail({ provider: 'a1111', base: base() }, { prompt: '   ' }, /prompt is empty/);
  await fail({ provider: 'custom', base: base() + '/nope' }, null, /404.*no such route/);
  await fail({ provider: 'zzz' }, null, /Choose an image generator/);
});
t('Stable Diffusion WebUI: txt2img body with negative prompt, size and steps', async () => {
  const b = await FW.Art.generate(
    { provider: 'a1111', base: base(), size: '512x768', steps: '30', model: 'dream.safetensors' },
    { prompt: 'a knight', negative: 'blurry' }
  );
  assert(await isPng(b));
  const r = last().body;
  assert.strictEqual(r.prompt, 'a knight');
  assert.strictEqual(r.negative_prompt, 'blurry');
  assert.strictEqual(r.width, 512);
  assert.strictEqual(r.height, 768);
  assert.strictEqual(r.steps, 30);
  assert.deepStrictEqual(r.override_settings, { sd_model_checkpoint: 'dream.safetensors' });
});
t('ComfyUI: finds a checkpoint, queues the workflow, polls history, downloads the image', async () => {
  const b = await FW.Art.generate(
    { provider: 'comfy', base: base(), size: '832x1216', pollMs: 5 },
    { prompt: 'a knight', negative: 'blurry' }
  );
  assert(await isPng(b));
  const q = seen.find(s => s.url === '/prompt').body.prompt;
  assert.strictEqual(q['4'].inputs.ckpt_name, 'dream.safetensors');
  assert.strictEqual(q['6'].inputs.text, 'a knight');
  assert.strictEqual(q['7'].inputs.text, 'blurry');
  assert.strictEqual(q['5'].inputs.width, 832);
  assert.strictEqual(q['5'].inputs.height, 1216);
  assert.deepStrictEqual(q['3'].inputs.positive, ['6', 0]);
  assert(server.polls >= 2);
});
t('Stability AI: multipart form with prompt, negative prompt and aspect ratio', async () => {
  const b = await FW.Art.generate(
    { provider: 'stability', base: base(), key: 'sk-stab', size: '832x1216' },
    { prompt: 'a knight', negative: 'blurry' }
  );
  assert(await isPng(b));
  const r = last();
  assert.strictEqual(r.headers.authorization, 'Bearer sk-stab');
  assert.strictEqual(r.headers.accept, 'image/*');
  assert(/multipart\/form-data/.test(r.headers['content-type']));
  [
    'name="prompt"\r\n\r\na knight',
    'name="negative_prompt"\r\n\r\nblurry',
    'name="aspect_ratio"\r\n\r\n2:3',
    'name="output_format"\r\n\r\npng',
  ].forEach(s => assert(String(r.body).includes(s), s));
  assert.strictEqual(FW.Art.ratio('1344x768'), '16:9');
  assert.strictEqual(FW.Art.ratio('1024x1024'), '1:1');
});
t('Gemini: interactions request and image found inside the reply', async () => {
  const b = await FW.Art.generate(
    { provider: 'gemini', base: base() + '/v1beta', key: 'g-key' },
    { prompt: 'a knight', negative: 'blurry' }
  );
  assert(await isPng(b));
  const r = last();
  assert.strictEqual(r.headers['x-goog-api-key'], 'g-key');
  assert.strictEqual(r.body.model, 'gemini-nano-banana-2.1');
  assert.strictEqual(r.body.input[0].type, 'text');
  assert(/a knight\nAvoid: blurry/.test(r.body.input[0].text));
  assert.strictEqual(
    FW.Art.findImage({
      candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'A'.repeat(60) } }] } }],
    }).mime,
    'image/png'
  );
  assert.strictEqual(FW.Art.findImage({ text: 'no image here' }), null);
});
t(
  'local language model (Ollama / LM Studio style): facts and draft are sent, thinking and quotes are stripped',
  async () => {
    const L = fullLegend('llm');
    const p = FW.artPrompt(L, {});
    const out = await FW.Art.enhance(
      { provider: 'ollama', base: base() + '/v1' },
      { facts: p.facts, draft: p.prompt, style: 'oil painting' }
    );
    assert.strictEqual(out, 'A towering knight in the rain, oil painting');
    const r = last();
    assert.strictEqual(r.body.model, 'llama3.2');
    assert.strictEqual(r.body.messages[0].role, 'system');
    assert(r.body.messages[1].content.includes(p.prompt) && r.body.messages[1].content.includes('"race"'));
    assert.strictEqual(r.headers.authorization, undefined);
    await FW.Art.enhance({ provider: 'lmstudio', base: base() + '/v1' }, { facts: {}, draft: 'd', style: 's' });
    assert(!('model' in last().body), 'empty model is not sent');
  }
);
t('Claude: browser headers, refusal handling, retry without the fallback option', async () => {
  const a = { facts: { race: 'Vampire' }, draft: 'draft', style: 'dark fantasy' };
  const out = await FW.Art.enhance({ provider: 'anthropic', base: base() + '/v1', key: 'sk-ant-test' }, a);
  assert(/vampire queen/.test(out));
  let r = last();
  assert.strictEqual(r.headers['x-api-key'], 'sk-ant-test');
  assert.strictEqual(r.headers['anthropic-version'], '2023-06-01');
  assert.strictEqual(r.headers['anthropic-dangerous-direct-browser-access'], 'true');
  assert.strictEqual(r.body.model, 'claude-opus-5-5');
  assert.strictEqual(r.body.fallbacks, 'default');
  assert(!('thinking' in r.body) && !('temperature' in r.body));
  assert.strictEqual(r.body.messages[0].role, 'user');
  server.reject400 = true;
  const n = seen.length;
  await FW.Art.enhance({ provider: 'anthropic', base: base() + '/v1', key: 'k' }, a);
  assert.strictEqual(seen.length - n, 2);
  assert(!('fallbacks' in last().body) && !last().headers['anthropic-beta']);
  server.reject400 = false;
  server.refuse = true;
  await assert.rejects(FW.Art.enhance({ provider: 'anthropic', base: base() + '/v1', key: 'k' }, a), /declined/);
  server.refuse = false;
  await assert.rejects(FW.Art.enhance({ provider: 'anthropic', base: base() + '/v1' }, a), /needs an API key/);
});
t('a generation can be cancelled', async () => {
  const ac = new AbortController();
  const p = FW.Art.generate(
    { provider: 'comfy', base: base(), model: 'x.ckpt', pollMs: 60000 },
    { prompt: 'a knight' },
    ac.signal
  );
  server.polls = 0;
  setTimeout(() => ac.abort(), 150);
  await assert.rejects(p, /Cancelled/);
});

server.listen(0, '127.0.0.1', async () => {
  for (const [name, fn] of jobs) {
    try {
      await fn();
      passed++;
      console.log('  ok   ' + name);
    } catch (e) {
      console.log('  FAIL ' + name + '\n       ' + String(e.stack).split('\n').slice(0, 4).join('\n       '));
      process.exitCode = 1;
    }
  }
  server.close();
  if (server.closeAllConnections) server.closeAllConnections();
  console.log('\n' + passed + ' of ' + jobs.length + ' checks passed');
});
