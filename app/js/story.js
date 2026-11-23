/* Destiny Unbound story mode - the saga that follows a finished character. Pure logic (no DOM): works in the browser and in node.
   A chapter is an async script that asks `io.spin(cfg)` for wheel results; the app shows real wheels, the tests pick at random.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const S = (FW.Story = {});
  if (!FW.Names && typeof require === 'function') require('./names.js'); // node: tests, the balance report, the bot
  if (!FW.fmt && typeof require === 'function') require('./i18n.js'); // the grammar helpers (FW.fmt)
  const Nm = () => FW.Names;

  /* ---------------- options (every feature can be switched off) ---------------- */
  S.OPTIONS = [
    {
      id: 'requirements',
      name: 'Chapter requirements',
      blurb: 'Some chapters stay locked until you earn them (no conquering the world without a kingdom).',
    },
    {
      id: 'death',
      name: 'Death',
      blurb: 'Lost battles, plagues and curses can end your story. Off: your hero always survives, scarred.',
    },
    { id: 'aging', name: 'Aging', blurb: 'Years pass each chapter. Old heroes retire or die of old age more often.' },
    { id: 'nemesis', name: 'Nemesis', blurb: 'A rival who grows stronger with you and keeps coming back.' },
    {
      id: 'kingdomEvents',
      name: 'Kingdom events',
      blurb: 'Rulers face golden ages, famines, coups and dragons between chapters.',
    },
    { id: 'loyalty', name: 'Companion loyalty', blurb: 'Allies can grow loyal, leave you or betray you.' },
    { id: 'dynasty', name: 'Dynasty', blurb: 'If you have an heir, continue the story as your child.' },
    {
      id: 'beyond',
      name: 'After the ending',
      blurb: 'Heroes who retire, ascend, are damned or become undying get one more chapter about what came after.',
    },
    {
      id: 'merchant',
      name: 'Travelling merchant',
      blurb: 'Chapters pay out gold, and now and then a merchant turns up between chapters to sell you something.',
    },
    {
      id: 'worldEvents',
      name: 'World events',
      blurb: 'Now and then a famine, a comet or a war colours the next few chapters.',
    },
    {
      id: 'returning',
      name: 'Old legends return',
      blurb:
        'Heroes from your Hall of Legends who lived, or cheated death, can turn up as a mentor, rival or stranger.',
    },
    { id: 'achievements', name: 'Achievements', blurb: 'Unlock badges for great (and terrible) sagas.' },
  ];
  // endings where the hero dies; with the Death option off they survive instead
  S.MORTAL = { dead: true, martyr: true, sealed: true, damned: true, undying: true };
  // second chances: in chapters 1-6 three in five deaths become narrow escapes, later almost half (sagas run longer)
  S.REPEAT_FADE = 0.6; // a repeatable chapter keeps 60% of its slice each time it happens (train twice: 36%)
  S.YOUNG_SAGA = 6;
  S.YOUNG_SAVE = 0.6;
  S.LATE_SAVE = 0.45;
  // what a narrow escape from death reads like (an outcome can give its own with `alive`)
  S.CLOSE_CALLS = [
    'Death comes close, but you survive with a terrible scar.',
    'You wake up days later, alive somehow, with a scar to show for it.',
    'A healer drags you back from the edge. The scar stays.',
    "You should have died. Something wasn't ready to let you go.",
    'Left for dead, you crawl back to the living.',
    'Your heart stops for a moment, then beats again.',
  ];
  S.defaults = () => {
    const o = {};
    S.OPTIONS.forEach(x => (o[x.id] = true));
    return o;
  };
  S.opts = o => Object.assign(S.defaults(), o || {});

  /* ---------------- small helpers ---------------- */
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length) % arr.length];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const E = (name, w, dsl, text, more) => Object.assign({ name, w, dsl: dsl || '', text: text || '' }, more || {});
  const good = (name, w, dsl, text, more) => E(name, w, dsl, text, Object.assign({ tone: 'good' }, more));
  const bad = (name, w, dsl, text, more) => E(name, w, dsl, text, Object.assign({ tone: 'bad' }, more));
  S.pick = pick;

  /* ---------------- enemies ---------------- */
  S.FACTIONS = [
    ['Bandit Kings', 30, 'a=metal'],
    ['Goblin Warband', 28, 'a=poison w=holy'],
    ['Beast Tribes', 40, 'a=nature w=fire'],
    ['Orc Horde', 44, 'a=metal w=mind'],
    ['Sea Kingdoms', 48, 'a=water w=lightning'],
    ['Desert Sultanate', 50, 'a=fire w=ice'],
    ['Dwarven Holds', 52, 'a=metal r=fire w=water'],
    ['Frost Jarldom', 54, 'a=ice r=ice w=fire'],
    ['Elven Concord', 56, 'a=nature w=fire'],
    ['Iron Legion', 58, 'a=metal w=lightning'],
    ['Holy Inquisition', 60, 'a=holy w=shadow'],
    ['Necromancer Covenant', 62, 'a=shadow r=poison w=holy'],
    ['Sky Empire', 64, 'a=lightning r=lightning w=ice'],
    ['Vampire Courts', 66, 'a=shadow,blood w=holy,fire'],
    ['Mage Academy', 68, 'a=mind,fire w=metal'],
    ['Demon Legion', 72, 'a=fire,shadow r=fire w=holy'],
    ['Void Cult', 75, 'a=void,mind w=holy'],
    ['Dragon Clans', 80, 'a=fire r=fire w=ice'],
    ['Celestial Host', 86, 'a=holy r=holy w=void'],
    ['Titan Lords', 89, 'a=metal r=poison w=mind'],
    ['Eldritch Choir', 92, 'a=mind,void r=mind w=holy'],
    ['The Old Gods', 97, 'a=time,holy r=void w=void'],
  ].map(f => ({ name: f[0], w: 1, dsl: 'lv=' + f[1] + ' ' + f[2], perk: 'Faction power ' + f[1] }));
  /* a race as an enemy people: stronger and rarer races field stronger armies */
  S.racePower = function (race) {
    const p = FW.P(race);
    let sum = 0;
    FW.COMBAT_STATS.concat(['pwr']).forEach(s => (sum += p.mods[s] || 0));
    return clamp(Math.round(30 + 2.5 * sum + 11 * Math.log10(25 / Math.max(0.1, race.w))), 22, 98);
  };
  S.raceFaction = race => ({
    name: 'The ' + race.name + ' peoples',
    w: race.w,
    race: race.name,
    dsl:
      'lv=' +
      S.racePower(race) +
      (FW.P(race).atk.length ? ' a=' + FW.P(race).atk.join(',') : '') +
      (FW.P(race).weak.length ? ' w=' + FW.P(race).weak.join(',') : ''),
    perk: 'Army power ' + S.racePower(race),
  });
  S.allBosses = () => {
    const out = [];
    FW.UNIVERSES.forEach(u => u.opps.forEach(o => out.push(Object.assign({}, o, { uni: u.name }))));
    return out;
  };
  const DRAGONS = [
    ['Ashwing the Young', 58, 'a=fire r=fire w=ice'],
    ['Rimefang', 66, 'a=ice r=ice w=fire'],
    ['Stormcrown', 72, 'a=lightning r=lightning w=nature'],
    ['Venomscale', 64, 'a=poison r=poison w=holy'],
    ['Nightmaw', 78, 'a=shadow r=shadow w=holy'],
    ['The Gold Tyrant', 84, 'a=fire,holy r=fire w=void'],
    ['Vaelgor the World-Burner', 94, 'a=fire,void r=fire w=ice'],
  ].map(d => ({ name: d[0], w: 1, dsl: 'lv=' + d[1] + ' ' + d[2] }));
  S.DRAGONS = DRAGONS;
  const ARTIFACT_KIND = ['Sword', 'Crown', 'Ring', 'Armour', 'Staff', 'Amulet', 'Bow', 'Gauntlet', 'Shield', 'Lantern'];
  const ARTIFACT_OF = [
    'Embers',
    'the Deep',
    'Storms',
    'Dawn',
    'Ashes',
    'the Moon',
    'Kings',
    'Whispers',
    'the Void',
    'Thorns',
    'Stars',
    'Winter',
  ];

  /* ---------------- saga state ---------------- */
  S.newSaga = function (L, opts, rng, inherit) {
    const o = S.opts(opts);
    const s = {
      v: 1,
      ch: 0,
      used: [],
      log: [],
      fights: null,
      years: 0,
      end: null,
      endText: '',
      kingdom: null,
      artifacts: [],
      conquered: [],
      world: false,
      guild: '',
      love: '',
      heir: null,
      nem: null,
      flags: {},
      dyn: null,
    };
    s.dyn =
      inherit && inherit.dyn
        ? {
            house: inherit.dyn.house,
            gen: inherit.dyn.gen + 1,
            parent: inherit.parent || '',
            trait: inherit.dyn.trait || S.rollTrait(rng),
            history: (inherit.dyn.history || []).concat(inherit.record ? [inherit.record] : []).slice(-12),
          }
        : {
            house: 'House ' + (L.name ? L.name.split(' ').slice(-1)[0] : Nm().house(rng).slice(6)),
            gen: 1,
            parent: '',
            trait: S.rollTrait(rng),
            history: [],
          };
    if (inherit) {
      if (inherit.kingdom) s.kingdom = Object.assign({}, inherit.kingdom);
      if (inherit.artifact) s.artifacts.push(Object.assign({}, inherit.artifact, { inherited: true }));
      if (inherit.nem) s.nem = Object.assign({}, inherit.nem, { lv: inherit.nem.lv + 3, met: 0 });
      if (inherit.gold) s.flags.gold = inherit.gold;
    }
    if (o.nemesis && !s.nem) s.nem = S.makeNemesis(L, rng);
    const a0 = S.startAlign(L);
    if (a0) s.flags.align = a0;
    const st0 = S.lifeStage(L);
    if (st0 != null) s.flags.stage = st0;
    L.saga = s;
    return s;
  };

  /* ---------------- alignment (108): choices and deeds nudge the hero towards good or evil ----------------
     A number from -5 to 5 in the saga's flags. It starts from the hero's nature, moves with mercy or cruelty and with
     what the hero does, and from 2 either way it tilts the story wheel and some chapters a little. */
  S.ALIGN_MAX = 5;
  S.ALIGN_LEAN = 0.1; // per point from 2 up: matching chapters get 10% bigger slices, the others 10% smaller
  S.ALIGN_CH = {
    good: ['quest', 'rescue', 'mentor', 'religion', 'siege', 'lastStand', 'apprentice'],
    evil: ['heist', 'pact', 'conquerRace', 'conquerWorld', 'betrayal', 'rebellion'],
  };
  const GOOD_NATURE = /Good$|^(Hero|Guardian|Protector|Pacifist|Merciful|Kind-hearted|Justice Seeker)$/;
  const EVIL_NATURE = /Evil$|^(Sadist|Tyrant|Ruthless|Bloodthirsty|Conqueror)$/;
  S.startAlign = L => {
    const n = L.has && L.has('per') ? L.pickName('per') : '';
    return GOOD_NATURE.test(n) ? 1 : EVIL_NATURE.test(n) ? -1 : 0;
  };
  S.align = s => (s && s.flags && +s.flags.align) || 0;
  S.drift = (s, d) => {
    if (!s || !d) return;
    s.flags = s.flags || {};
    s.flags.align = clamp(S.align(s) + d, -S.ALIGN_MAX, S.ALIGN_MAX);
  };
  S.alignName = a => (a >= 4 ? 'Saintly' : a >= 2 ? 'Good' : a <= -4 ? 'Wicked' : a <= -2 ? 'Dark' : 'Neutral');
  // how much the hero's alignment changes a chapter's slice on the story wheel
  S.alignLean = (s, id) => {
    const a = S.align(s);
    if (Math.abs(a) < 2) return 1;
    const side = S.ALIGN_CH.good.indexOf(id) >= 0 ? 1 : S.ALIGN_CH.evil.indexOf(id) >= 0 ? -1 : 0;
    if (!side) return 1;
    const f = 1 + S.ALIGN_LEAN * (Math.abs(a) - 1);
    return Math.sign(a) === side ? f : 1 / f;
  };

  /* ---------------- world events (111): a famine, a comet, a war that colours a few chapters ----------------
     Rolled with the saga's own seed (so they never shift the story's dice), at most one at a time. */
  S.EVENT_CHANCE = 0.12;
  S.EVENT_LEN = 3;
  S.WORLD_EVENTS = [
    {
      id: 'famine',
      name: 'A famine year',
      emoji: '🌾',
      text: 'The harvests fail across the land. Hungry people do desperate things.',
      boost: { plague: 2, rebellion: 2, heist: 1.6, treasure: 0.6, tournament: 0.6 },
    },
    {
      id: 'comet',
      name: 'The comet',
      emoji: '☄️',
      text: 'A comet hangs in the sky for months. Everyone says it means something.',
      boost: { oracle: 2.5, otherworld: 2, ascend: 2, religion: 1.6, awaken: 1.5 },
    },
    {
      id: 'plague',
      name: 'A plague season',
      emoji: '🦠',
      text: 'Sickness spreads from town to town. The dead do not all stay quiet.',
      boost: { plague: 3, haunted: 2, religion: 1.5, love: 0.6 },
    },
    {
      id: 'war',
      name: 'A year of war',
      emoji: '⚔️',
      text: 'The great powers go to war, and every sword is wanted.',
      boost: { siege: 2.5, conquerRace: 1.6, rebellion: 1.5, duel: 1.5, tournament: 0.5 },
    },
    {
      id: 'dragons',
      name: 'The dragon migration',
      emoji: '🐉',
      text: 'The dragons are flying south, and they are hungry.',
      boost: { dragon: 3, treasure: 1.5, voyage: 0.7 },
    },
    {
      id: 'festival',
      name: 'A festival year',
      emoji: '🎉',
      text: 'A hundred years of peace, and the whole land celebrates.',
      boost: { tournament: 2.5, love: 2, heist: 1.5, rival: 1.5, siege: 0.4 },
    },
  ];
  S.EVENT_BY_ID = {};
  S.WORLD_EVENTS.forEach(e => (S.EVENT_BY_ID[e.id] = e));
  S.event = s => (s && s.flags && s.flags.event && S.EVENT_BY_ID[s.flags.event.id]) || null;
  // before a chapter: maybe a new event starts (logged); returns the event in force
  S.rollEvent = function (L, o) {
    const s = L.saga;
    if (!o.worldEvents) return null;
    if (S.event(s)) return S.event(s);
    if (s.ch < 2 || FW.makeRng(String(L.seed) + ':event:' + s.ch)() >= S.EVENT_CHANCE) return null;
    const seen = (s.flags.events = s.flags.events || []);
    const left = S.WORLD_EVENTS.filter(e => seen.indexOf(e.id) < 0);
    if (!left.length) return null;
    const ev = left[Math.floor(FW.makeRng(String(L.seed) + ':eventKind:' + s.ch)() * left.length) % left.length];
    s.flags.event = { id: ev.id, left: S.EVENT_LEN };
    seen.push(ev.id);
    s.log.push({ ch: s.ch + 1, chapter: ev.name, emoji: ev.emoji, text: ev.text });
    return ev;
  };
  // after a chapter: the event runs down
  S.tickEvent = s => {
    const e = s.flags && s.flags.event;
    if (e && --e.left <= 0) delete s.flags.event;
  };

  /* ---------------- guild ranks (119) ---------------- */
  S.GUILD_RANKS = ['', 'Initiate', 'Member', 'Veteran', 'Officer', 'Guild master'];
  S.GUILDS = {
    "Adventurers' Guild": {
      master: 'Guildmaster',
      work: 'a monster contract',
      fit: 'quest',
      ch: ['quest', 'dungeon', 'boss'],
    },
    "Mages' Circle": { master: 'Archmage', work: 'a dangerous experiment', fit: 'study', ch: ['study', 'artifact'] },
    "Thieves' Guild": {
      master: 'Master of Shadows',
      work: 'a job for the guild',
      fit: 'heist',
      ch: ['heist', 'treasure'],
    },
    "Assassins' Order": { master: 'Grandmaster', work: 'a contract', fit: 'heist', ch: ['heist', 'duel'] },
    "Merchants' League": { master: 'Merchant Prince', work: 'a risky trade deal', fit: '', ch: ['treasure', 'voyage'] },
  };
  S.guildRank = s => (s && s.guild ? (s.flags && +s.flags.guildRank) || 1 : 0);
  S.rankName = s => {
    const r = S.guildRank(s);
    if (!r) return '';
    if (r >= 5) return (S.GUILDS[s.guild] && S.GUILDS[s.guild].master) || S.GUILD_RANKS[5];
    return S.GUILD_RANKS[r];
  };
  S.makeNemesis = function (L, rng) {
    const base = FW.compute(L).baseRating;
    const race = FW.RACES[FW.weightedIndex(FW.RACES, rng)];
    return {
      name: Nm().nemesis(rng, race.name),
      race: race.name,
      lv: Math.round(clamp(base + 2 + rng() * 8, 25, 99)),
      met: 0,
      alive: true,
      ally: false,
    };
  };
  S.sanitize = function (s) {
    if (!s || typeof s !== 'object') return null;
    const arr = x => (Array.isArray(x) ? x : []);
    return {
      v: 1,
      ch: +s.ch || 0,
      used: arr(s.used).filter(x => typeof x === 'string'),
      log: arr(s.log).slice(-200),
      fights: S.cleanFights(s.fights),
      years: +s.years || 0,
      end: typeof s.end === 'string' ? s.end : null,
      endText: String(s.endText || ''),
      kingdom: s.kingdom && typeof s.kingdom === 'object' ? s.kingdom : null,
      artifacts: arr(s.artifacts),
      conquered: arr(s.conquered).filter(x => typeof x === 'string'),
      world: !!s.world,
      guild: String(s.guild || ''),
      love: String(s.love || ''),
      heir: s.heir && typeof s.heir === 'object' ? s.heir : null,
      tale: String(s.tale || '').slice(0, 6000),
      nem: s.nem && typeof s.nem === 'object' ? s.nem : null,
      flags: s.flags && typeof s.flags === 'object' ? s.flags : {},
      dyn: s.dyn && typeof s.dyn === 'object' ? s.dyn : { house: 'House Unknown', gen: 1 },
      cut: Math.max(0, Math.floor(+s.cut || 0)), // log lines left out of a long Legend Code
    };
  };

  /* ---------------- age ---------------- */
  const LIFE = { s: { old: 65, max: 110 }, m: { old: 300, max: 550 }, l: { old: 3500, max: 8000 }, a: null };
  S.lifespan = L => LIFE[(L.entry('race') && FW.P(L.entry('race')).life) || 's'];
  S.age = L => {
    const y = L.picks.age && L.picks.age.years;
    return y ? y + ((L.saga && L.saga.years) || 0) : null;
  };
  S.isOld = L => {
    const life = S.lifespan(L),
      a = S.age(L);
    return !!(life && a && a >= life.old);
  };
  /* ---------------- life stages (103): growing older changes the hero ----------------
     0 in their prime, 1 middle-aged (from 70% of the race's "old" age), 2 old, 3 venerable (halfway from old to the
     race's longest life). Ageless races have none. Each new stage reached during a saga takes a little from the body
     and gives a little to the mind (S.STAGE_FX), says so in the log, and from "old" on opens the elder chapters. */
  S.LIFE_STAGES = ['In their prime', 'Middle-aged', 'Old', 'Venerable'];
  S.STAGE_FX = [null, 'spd-1 int+1', 'str-1 int+1', 'dur-1 fate+1'];
  S.STAGE_LINES = [
    null,
    [
      '{hero} is not as quick as {g:he|she|they} used to be, and far harder to fool.',
      'Grey at the temples now, {hero} fights smarter than {g:he fights|she fights|they fight} fast.',
      'At {age}, {hero} has stopped rushing in, and started winning anyway.',
    ],
    [
      'At {age}, {hero}’s sword arm is slower, but {g:he sees|she sees|they see} every fight coming.',
      'Old age takes some of {hero}’s strength and gives back wisdom.',
      'At {age}, {hero} needs a moment to get up in the morning, and no time at all to read a liar.',
    ],
    [
      'At {age}, {hero} is frail in body, sharp as a blade in mind, and luckier than anyone has a right to be.',
      '{hero} has outlived friends, foes and kings. At {age}, fate itself seems fond of {g:him|her|them}.',
    ],
  ];
  S.lifeStage = L => {
    const life = S.lifespan(L),
      a = S.age(L);
    if (!life || !a) return null;
    if (a >= life.old + (life.max - life.old) * 0.5) return 3;
    if (a >= life.old) return 2;
    if (a >= life.old * 0.7) return 1;
    return 0;
  };
  // after a chapter: a hero who reached a new life stage changes (only forwards, and not for the age they started at)
  S.ageUp = function (L, o) {
    const s = L.saga,
      st = S.lifeStage(L);
    if (st == null || !o.aging) return null;
    if (s.flags.stage == null) s.flags.stage = st; // a saga from before life stages: start counting now
    const out = [];
    while (s.flags.stage < st) {
      const k = ++s.flags.stage;
      L.chron.push({ label: 'Age: ' + S.LIFE_STAGES[k], dsl: S.STAGE_FX[k], text: '', kind: 'story', key: 'age' + k });
      const line = S.vary(S.STAGE_LINES[k], L, 'stage' + k).replace(/\{age\}/g, String(S.age(L)));
      s.log.push({
        ch: s.ch,
        chapter: 'Growing older',
        emoji: '⏳',
        text: FW.fmt(line, { g: L.pres }).replace(/\{hero\}/g, L.displayName()),
      });
      out.push(k);
    }
    return out;
  };

  /* ---------------- power and battles ---------------- */
  // story bonuses on top of the character's power rating; war = armies, duel = you alone
  S.bonuses = function (L, scale, o) {
    const s = L.saga || {},
      out = [];
    const allies = (L.ally || []).filter(a => !a.gone);
    if (allies.length) {
      const lo = o && o.loyalty;
      const v =
        allies.reduce(
          (t, a) => t + (a.lv || 40) * (lo ? clamp((a.loyalty == null ? 60 : a.loyalty) / 70, 0.3, 1.3) : 1),
          0
        ) / (scale === 'war' ? 20 : 45);
      out.push({ label: 'Allies at your side (' + allies.length + ')', d: Math.min(scale === 'war' ? 10 : 5, v) });
    }
    if (scale === 'war' && s.kingdom) out.push({ label: 'The army of ' + s.kingdom.name, d: 6 });
    if (scale === 'war' && s.conquered && s.conquered.length)
      out.push({ label: 'Conquered peoples march with you', d: Math.min(9, 3 * s.conquered.length) });
    if (s.artifacts && s.artifacts.length)
      out.push({ label: 'Artifacts (' + s.artifacts.length + ')', d: Math.min(6, 1.5 * s.artifacts.length) });
    return out.filter(b => b.d > 0.05);
  };
  S.report = function (L, enemy, arena, scale, o) {
    const rep = FW.matchup(L, enemy, arena);
    S.bonuses(L, scale, o).forEach(b => {
      rep.adj.push({ label: b.label, d: b.d, kind: 'buff' });
      rep.hero += b.d;
    });
    const P = 1 / (1 + Math.exp(-(rep.hero - rep.opp) / 9)),
      draw = 0.05;
    rep.pWin = clamp(P * (1 - draw), 0.02, 0.96);
    rep.pDraw = draw;
    rep.pLose = Math.max(0.01, 1 - rep.pWin - draw);
    rep.pWin = 1 - rep.pLose - draw;
    return rep;
  };
  const foe = (name, lv, dsl) => ({ name, w: 1, dsl: 'lv=' + Math.round(clamp(lv, 12, 99)) + (dsl ? ' ' + dsl : '') });
  S.foe = foe;
  // level of an ordinary story foe: near your own power, give or take (FOE_EASE tilts ordinary foes slightly your way)
  S.FOE_EASE = 5;
  const nearYou = (L, rng, lo, hi) => FW.compute(L).baseRating - S.FOE_EASE + lo + rng() * (hi - lo);
  // a wheel of fixed-power foes (bosses, dragons): foes far above you get thinner slices, like arena matchmaking
  const matched = (L, list) => {
    const r = FW.compute(L).baseRating;
    return list.map(x => (FW.matchWeight ? x.w * FW.matchWeight(FW.P(x).lv, r) : x.w));
  };

  async function fight(L, io, ctx, enemy, cfg) {
    cfg = cfg || {};
    const arena = FW.pickArena(io.rng);
    const rep = S.report(L, enemy, arena, cfg.scale || 'duel', ctx.o);
    ctx.lastFoe = enemy.name;
    ctx.lastArena = arena.name;
    const i = await io.spin({
      kind: 'battle',
      emoji: cfg.emoji || '⚔️',
      title: cfg.title || 'Do you win?',
      report: rep,
      foe: enemy.name,
      arena: arena.name,
      mode: 'cat',
      hue: 0,
      hint: 'Slice sizes are your real odds',
      entries: [
        E('Victory', rep.pWin, '', '', { color: '#2f9e57', colorLight: 38 }),
        E('Stalemate', rep.pDraw, '', '', { color: '#777', colorLight: 46 }),
        E('Defeat', rep.pLose, '', '', { color: '#b8383b', colorLight: 40 }),
      ],
    });
    if (i === 0 && rep.pWin < 0.2 && L.saga) L.saga.flags.underdog = true;
    if (L.saga) S.noteFight(L.saga, enemy.name, rep.pWin, ['win', 'draw', 'lose'][i]);
    if (S.onFight) S.onFight(enemy.name, ['win', 'draw', 'lose'][i], L); // the Bestiary (codex.js)
    // a boss with two phases rises again: win the second fight too
    if (i === 0 && rep.phases) return fight(L, io, ctx, FW.phaseTwo(enemy), Object.assign({}, cfg, phaseCfg(enemy)));
    return ['win', 'draw', 'lose'][i];
  }
  const phaseCfg = enemy => ({ title: enemy.name + ' rises again, stronger. Do you win?', emoji: '🔥' });

  /* ---------------- applying a result ---------------- */
  function fill(t, ctx, L) {
    const s = L.saga;
    // {g:his|her|their} follows the hero's presentation (i18n.js, FW.fmt)
    return FW.fmt(String(t || ''), { g: L.pres })
      .replace(/\{foe\}/g, ctx.foe || ctx.lastFoe || 'the enemy')
      .replace(/\{kingdom\}/g, s.kingdom ? s.kingdom.name : 'your kingdom')
      .replace(/\{nem\}/g, s.nem ? s.nem.name : 'your rival')
      .replace(/\{ally\}/g, ctx.ally ? ctx.ally.name : 'an ally')
      .replace(/\{heir\}/g, s.heir ? s.heir.name : 'your child')
      .replace(/\{hero\}/g, L.displayName())
      .replace(/\{arena\}/g, ctx.lastArena || 'the field')
      .replace(/\{art\}/g, ctx.art || 'the artifact');
  }
  // a line can come in variants (a list); the saga's seed and chapter pick one, so it never shifts the story's dice
  S.vary = (t, L, key) =>
    Array.isArray(t) ? t[Math.floor(FW.makeRng(String(L.seed) + ':line:' + key)() * t.length) % t.length] : t;
  /* scars: a narrow escape, or a lost fight that leaves its mark. Each has a small penalty, some a grim bonus. They
     go into the chronicle (so they count on the card) and the log says what happened. At most three. */
  S.SCARS = [
    ['A missing eye', 'wpn-1 behind:all+1', 'an empty eye socket'],
    ['A limp', 'spd-1', 'a limp that never goes away'],
    ['A face of scars', 'rt+1 int-1', 'a face no one forgets'],
    ['Two missing fingers', 'wpn-1 fgt+1', 'two fingers fewer'],
    ['A cracked skull', 'int-1 dur+1', 'a skull that healed thicker'],
    ['Burn scars', 'dur-1 r=fire', 'burns that taught the skin to bear fire'],
    ['A wound that never closed', 'dur-1 behind:all+1', 'a wound that still bleeds when the hero fights hardest'],
    ['A frostbitten hand', 'wpn-1 r=ice', 'a hand the cold can no longer hurt'],
  ].map(x => ({ name: x[0], dsl: x[1], text: x[2] }));
  S.MAX_SCARS = 3;
  S.addScar = function (L, ctx) {
    const s = L.saga;
    s.flags.scars = s.flags.scars || [];
    if (s.flags.scars.length >= S.MAX_SCARS) return null;
    const left = S.SCARS.filter(x => s.flags.scars.indexOf(x.name) < 0),
      r = FW.makeRng(String(L.seed) + ':scar:' + s.ch)();
    const sc = left[Math.floor(r * left.length) % left.length];
    s.flags.scars.push(sc.name);
    L.chron.push({ label: 'Scar: ' + sc.name, dsl: sc.dsl, text: 'Scar: ' + sc.name, kind: 'story', key: ctx.ch });
    return sc;
  };
  // a companion can save the hero from death once, after fate's own second chance has passed
  S.PET_SAVE = 0.3;
  const petName = L => (L.has('pet') && !L.isNone('pet') ? L.pickName('pet') : '');
  /* fame and infamy: good outcomes in heroic chapters bring fame; crimes, conquests and dark bargains bring infamy.
     Both stay in the saga (flags) and tilt chapters where people know your name (S.fit, `rep`). */
  S.REP = {
    fame: ['quest', 'dungeon', 'boss', 'dragon', 'rescue', 'tournament', 'siege', 'showdown', 'lastStand', 'duel'],
    infamy: ['heist', 'pact', 'conquerRace', 'conquerWorld', 'betrayal', 'exile', 'rebellion'],
  };
  S.rep = (s, k) => (s && s.flags && +s.flags[k]) || 0;
  S.apply = function (L, ent, ctx) {
    const s = L.saga,
      o = ctx.o;
    let e = ent;
    const mortal = S.MORTAL[e.end];
    const close = text => ({ end: null, dsl: '', text: text || e.alive || S.CLOSE_CALLS, tone: 'bad', scar: true });
    if (S.MORTAL[e.end] && o.death && ctx.rng && ctx.rng() < (s.ch <= S.YOUNG_SAGA ? S.YOUNG_SAVE : S.LATE_SAVE))
      e = Object.assign({}, e, close());
    if (S.MORTAL[e.end] && !o.death) e = Object.assign({}, e, close());
    // the companion steps in (once); its own seeded roll, so it never shifts the story's dice
    if (S.MORTAL[e.end] && petName(L) && !(s.flags && s.flags.petSaved)) {
      if (FW.makeRng(String(L.seed) + ':pet:' + s.ch)() < S.PET_SAVE) {
        s.flags.petSaved = petName(L);
        e = Object.assign(
          {},
          e,
          close('At the last moment your ' + petName(L).toLowerCase() + ' drags {hero} out of harm’s way.')
        );
      }
    }
    // a healing draught from the merchant (110)
    if (S.MORTAL[e.end] && s.flags.draught) {
      delete s.flags.draught;
      e = Object.assign({}, e, close('{hero} drinks the healing draught with a last breath, and lives.'));
    }
    // an heir can call on a dead ancestor once per saga (105)
    if (S.MORTAL[e.end] && o.dynasty && !s.flags.ancestor) {
      const anc = S.ancestor(L);
      if (anc) {
        s.flags.ancestor = anc.name;
        e = Object.assign(
          {},
          e,
          close(
            'The spirit of ' +
              anc.name +
              ', ' +
              anc.kin +
              ', stands between {hero} and death. {g:He calls|She calls|They call} on {g:his|her|their} blood, and the blow does not land.'
          )
        );
      }
    }
    // cheated death: counted for the recap and for heroes who come back in later sagas
    if (mortal && !e.end) {
      s.flags = s.flags || {};
      s.flags.cheated = (s.flags.cheated || 0) + 1;
    }
    // fame and infamy
    if (!e.end && ctx.ch) {
      s.flags = s.flags || {};
      if (e.tone === 'good' && S.REP.fame.indexOf(ctx.ch) >= 0) s.flags.fame = S.rep(s, 'fame') + 1;
      if (S.REP.infamy.indexOf(ctx.ch) >= 0 && (e.tone === 'good' || ctx.ch === 'exile'))
        s.flags.infamy = S.rep(s, 'infamy') + 1;
      // alignment: an outcome can say which way it pulls; otherwise good deeds and dark ones that succeed
      if (e.align) S.drift(s, e.align);
      else if (e.tone === 'good' && S.ALIGN_CH.good.indexOf(ctx.ch) >= 0) S.drift(s, 1);
      else if (e.tone === 'good' && S.ALIGN_CH.evil.indexOf(ctx.ch) >= 0) S.drift(s, -1);
    }
    let scarText = '';
    // gold (110): an outcome's own, or the chapter's base for a good outcome, seeded around it
    const gBase = e.gold != null ? e.gold : !e.end && e.tone === 'good' && ctx.ch ? S.GOLD_CH[ctx.ch] || 0 : 0;
    if (gBase > 0) {
      const got = S.addGold(s, gBase * (0.6 + 0.8 * FW.makeRng(String(L.seed) + ':gold:' + s.ch + ':' + e.name)()));
      if (got) scarText += ' (+' + got + ' gold)';
    }
    // the guild notices good work in its own line of business (119): one rank up, as far as Officer
    const gd = s.guild && S.GUILDS[s.guild];
    if (gd && !e.end && e.tone === 'good' && gd.ch.indexOf(ctx.ch) >= 0 && S.guildRank(s) < 4) {
      s.flags.guildRank = S.guildRank(s) + 1;
      scarText += ' The ' + s.guild + ' takes note: {hero} is now ' + S.GUILD_RANKS[s.flags.guildRank] + '.';
    }
    if (e.scar) {
      const sc = S.addScar(L, ctx);
      if (sc) scarText = ' It leaves {g:him|her|them} with ' + sc.text + '.';
      else if (!e.dsl) e = Object.assign({}, e, { dsl: 'dur-1' });
    }
    if (e.dsl) L.chron.push({ label: ctx.chName + ': ' + e.name, dsl: e.dsl, text: '', kind: 'story', key: ctx.ch });
    if (e.fx) e.fx(s, L, ctx);
    if (e.years) s.years += e.years;
    const text = fill(S.vary(e.text || e.name, L, s.ch + ':' + e.name) + scarText, ctx, L);
    if (!e.quiet)
      s.log.push(
        Object.assign(
          { ch: s.ch, chapter: ctx.chName, emoji: ctx.emoji, text },
          e.tone ? { tone: e.tone } : {},
          e.end ? { end: e.end } : {}
        )
      );
    if (e.end) {
      s.end = e.end;
      s.endText = text;
    }
    return e;
  };
  // spin a wheel of outcome entries and apply the winner
  /* ---------------- choices: the player picks, the wheel decides how it goes ----------------
     io.choose shows the options and resolves with the index picked. Without it (tests, the balance report, the
     Discord bot) a random option is taken, so every path is still played. */
  async function choose(L, io, ctx, cfg) {
    const n = cfg.options.length;
    if (n < 2) return 0;
    if (io.choose) {
      const i = await io.choose({
        emoji: cfg.emoji || ctx.emoji,
        title: cfg.title,
        options: cfg.options.map(o => ({ label: o.label, hint: o.hint || '' })),
      });
      return picked(L, cfg, clamp(i | 0, 0, n - 1));
    }
    return picked(L, cfg, Math.floor(io.rng() * n) % n);
  }
  // mercy and cruelty move the hero's alignment (an option with `align`)
  const picked = (L, cfg, i) => {
    const op = cfg.options[i];
    if (op && op.align && L.saga) S.drift(L.saga, op.align);
    return i;
  };
  // the ancestor who answers: the nearest one in the family line, and what they were to the hero
  S.ancestor = L => {
    const s = L.saga,
      h = (s && s.dyn && s.dyn.history) || [];
    if (!h.length) return null;
    const a = h[h.length - 1],
      d = Math.max(1, ((s.dyn && s.dyn.gen) || 2) - (a.gen || 1));
    const kin = d === 1 ? 'parent' : d === 2 ? 'grandparent' : d === 3 ? 'great-grandparent' : 'ancestor';
    return { name: String(a.name || 'an ancestor').split(', ')[0], kin: '{hero}’s ' + kin };
  };
  S.choose = choose;

  /* ---------------- gold and the travelling merchant (110) ----------------
     Good outcomes in chapters that pay (S.GOLD_CH) bring gold, a seeded amount around the chapter's base; an outcome
     can name its own (`gold`). Between chapters a merchant sometimes turns up and sells one thing. Gold lives in the
     saga's flags; an heir inherits half of it. */
  S.GOLD_CH = {
    treasure: 40,
    heist: 55,
    dungeon: 35,
    boss: 45,
    dragon: 70,
    quest: 25,
    tournament: 35,
    voyage: 30,
    guildWork: 20,
    guildMaster: 60,
    conquerRace: 50,
    conquerWorld: 120,
    rescue: 20,
    artifact: 15,
    kingdom: 40,
    siege: 30,
    duel: 20,
    lastStand: 25,
    drownedCrown: 100,
    lichKing: 50,
  };
  S.gold = s => (s && s.flags && +s.flags.gold) || 0;
  S.addGold = (s, n) => {
    if (!s || !n) return 0;
    s.flags = s.flags || {};
    s.flags.gold = Math.max(0, S.gold(s) + Math.round(n));
    return Math.round(n);
  };
  S.MERCHANT_CHANCE = 0.15;
  S.MERCHANT_ITEMS = [
    {
      id: 'draught',
      name: 'A healing draught',
      price: 80,
      hint: 'The next time you would die, you live.',
      fx: s => (s.flags.draught = true),
    },
    { id: 'whetstone', name: 'A dwarven whetstone', price: 30, dsl: 'wpn+1', hint: '+1 weapon skill.' },
    { id: 'charm', name: 'A lucky charm', price: 35, dsl: 'fate+1', hint: '+1 Fate Token.' },
    { id: 'boots', name: 'Boots of the old roads', price: 35, dsl: 'spd+1', hint: '+1 speed.' },
    { id: 'tome', name: 'A tome of secrets', price: 45, dsl: 'int+1', hint: '+1 intellect.' },
    { id: 'shield', name: 'An ironbark shield', price: 45, dsl: 'dur+1', hint: '+1 durability.' },
    { id: 'elixir', name: 'An elixir of giants', price: 60, dsl: 'str+1', hint: '+1 strength.' },
    { id: 'focus', name: 'A spell focus', price: 55, dsl: 'pwr+1', hint: '+1 power.' },
    {
      id: 'sellsword',
      name: 'A sellsword’s contract',
      price: 70,
      hint: 'A hired blade joins you.',
      fx: (s, L, rng) =>
        L.ally.push({ name: 'a hired sellsword', lv: Math.round(40 + 20 * rng()), how: 'hired', loyalty: 50 }),
    },
    {
      id: 'title',
      name: 'A noble title',
      price: 120,
      dsl: 'rt+2',
      hint: 'Bought respectability (+2 renown).',
      fx: s => (s.flags.fame = S.rep(s, 'fame') + 1),
    },
  ];
  // a merchant turns up after this chapter? (seeded, so it never shifts the story's dice)
  S.merchantDue = (L, o) => {
    const s = L.saga;
    if (!o.merchant || s.end || s.ch < 2) return false;
    if (S.gold(s) < Math.min(...S.MERCHANT_ITEMS.map(x => x.price))) return false;
    return FW.makeRng(String(L.seed) + ':merchant:' + s.ch)() < S.MERCHANT_CHANCE;
  };
  // three wares, picked with the seed; the ones the hero can afford are offered
  S.merchantWares = L => {
    const r = FW.makeRng(String(L.seed) + ':wares:' + L.saga.ch),
      pool = S.MERCHANT_ITEMS.slice(),
      out = [];
    while (out.length < 3 && pool.length) out.push(pool.splice(Math.floor(r() * pool.length) % pool.length, 1)[0]);
    return out.filter(x => x.price <= S.gold(L.saga));
  };
  S.buy = function (L, item, rng) {
    const s = L.saga;
    if (!item || item.price > S.gold(s)) return false;
    S.addGold(s, -item.price);
    if (item.dsl)
      L.chron.push({ label: 'Bought: ' + item.name, dsl: item.dsl, text: '', kind: 'story', key: 'buy' + s.ch });
    if (item.fx) item.fx(s, L, rng || Math.random);
    s.flags.bought = (s.flags.bought || []).concat([item.name]);
    s.log.push({
      ch: s.ch,
      chapter: 'A travelling merchant',
      emoji: '🧳',
      text:
        L.displayName() + ' buys ' + item.name.replace(/^An? /, m => m.toLowerCase()) + ' for ' + item.price + ' gold.',
      tone: 'good',
    });
    return true;
  };
  async function merchant(L, io, c) {
    const wares = S.merchantWares(L);
    if (!wares.length) return null;
    // its own seeded dice (for the player's sellsword and for a bot's pick), so the merchant never shifts the story
    const rng = FW.makeRng(String(L.seed) + ':buy:' + L.saga.ch);
    const i = await choose(L, Object.assign({}, io, { rng }), c, {
      emoji: '🧳',
      title: 'A travelling merchant opens a cart full of wonders. You have ' + S.gold(L.saga) + ' gold.',
      options: wares
        .map(w => ({ label: w.name + ' (' + w.price + ' gold)', hint: w.hint }))
        .concat([{ label: 'Buy nothing', hint: 'Keep your gold.' }]),
    });
    if (i < wares.length) S.buy(L, wares[i], rng);
    return i < wares.length ? wares[i] : null;
  }
  S.merchant = merchant;

  /* ---------------- chapters that react to the hero ----------------
     For some chapters a fitting class, personality, element or background makes the good slices bigger (and an
     unfitting one the bad slices), and the wheel says why. */
  S.FIT = {
    heist: {
      what: 'the heist',
      cls: ['Rogue', 'Assassin', 'Ninja', 'Illusionist', 'Bard', 'Merchant', 'Dancer'],
      per: ['Opportunist', 'Trickster', 'Mastermind', 'Calculating', 'Greedy', 'Manipulator', 'Chaotic Neutral'],
      bg: /thief|con artist|street|criminal|pickpocket|smuggl/i,
      against: { cls: ['Paladin', 'Templar', 'Knight'], per: ['Lawful Good', 'Honourable', 'Pacifist'] },
      rep: { infamy: 1, fame: -1 }, // the underworld trusts a known name; everyone else knows your face
      align: -1,
      age: -1,
    },
    haunted: {
      what: 'the dead',
      cls: ['Necromancer', 'Cleric', 'Templar', 'Paladin', 'Shaman', 'Healer', 'Witch', 'Monster Hunter', 'Warlock'],
      elem: ['Spirit', 'Light', 'Shadow', 'Moon'],
      per: ['Serene', 'Stoic', 'Brooding'],
      against: { per: ['Coward', 'Paranoid', 'Shy'] },
    },
    sea: {
      what: 'the sea',
      cls: ['Pirate', 'Ranger', 'Beastmaster', 'Druid'],
      elem: ['Water', 'Storm', 'Wind', 'Ice'],
      bg: /pirate|sail|ship|fisher|harbou?r/i,
      against: { weak: ['Water'] },
      mount: ['Griffin', 'Pegasus', 'Wyvern', 'Giant Owl', 'Drake', 'Sea Serpent'], // flying or swimming
    },
    train: {
      what: 'training',
      cls: ['Warrior', 'Monk', 'Brawler', 'Gladiator', 'Samurai', 'Knight', 'Duelist', 'Berserker', 'Archer'],
      per: ['Stoic', 'Glory Hound', 'Honourable', 'Ambitious', 'Hot-headed'],
      against: { per: ['Coward', 'Free Spirit', 'Playful'] },
      age: -1,
    },
    study: {
      what: 'study',
      cls: ['Mage', 'Sorcerer', 'Alchemist', 'Chronomancer', 'Runesmith', 'Engineer', 'Tactician', 'Witch', 'Warlock'],
      per: ['Scholar', 'Mad Genius', 'Calculating', 'Mastermind', 'Serene'],
      against: { per: ['Hot-headed', 'Thrill Seeker', 'Bloodthirsty'] },
      age: 1,
    },
    quest: {
      what: 'the quest',
      cls: ['Ranger', 'Hero of Legend', 'Chosen One', 'Monster Hunter', 'Paladin', 'Knight'],
      per: ['Hero', 'Justice Seeker', 'Kind-hearted', 'Protector', 'Guardian', 'Neutral Good', 'Lawful Good'],
      against: { per: ['Coward', 'Greedy', 'Sadist'] },
      rep: { fame: 1 },
      mount: true,
      align: 1,
    },
    mentor: {
      what: 'learning from a mentor',
      per: ['Scholar', 'Loyal', 'Honourable', 'Serene', 'Kind-hearted', 'Shy'],
      against: { per: ['Arrogant', 'Paranoid', 'Loner'] },
      rep: { fame: 1, infamy: -1 },
      align: 1,
      age: 1,
    },
    cunning: {
      what: 'outwitting a demon',
      cls: ['Mage', 'Warlock', 'Witch', 'Alchemist', 'Tactician', 'Bard', 'Illusionist', 'Chronomancer'],
      per: ['Mastermind', 'Calculating', 'Scholar', 'Trickster', 'Manipulator', 'Mad Genius'],
      against: { per: ['Hot-headed', 'Bloodthirsty', 'Gentle Giant'] },
    },
    dragontalk: {
      what: 'talking to a dragon',
      cls: ['Dragon Rider', 'Bard', 'Druid', 'Beastmaster', 'Merchant', 'Sorcerer'],
      per: ['Serene', 'Calculating', 'Manipulator', 'Honourable', 'Gentle Giant'],
      against: { per: ['Arrogant', 'Hot-headed', 'Bloodthirsty', 'Greedy'] },
      age: 1,
    },
  };
  const LABEL_OF = { cls: 'class', per: 'nature', elem: 'element', weak: 'weakness' };
  S.fit = function (L, key) {
    const r = S.FIT[key];
    if (!r) return { m: 1, why: '' };
    const has = (id, list) => {
      if (!list || !L.has(id)) return '';
      const n = L.pickName(id);
      if (list instanceof RegExp) return list.test(n) ? n : '';
      return list.indexOf(n) >= 0 ? n : '';
    };
    const plus = [],
      minus = [];
    ['cls', 'per', 'elem', 'bg', 'weak'].forEach(k => {
      const name = k =>
        k === 'bg'
          ? 'your past'
          : 'your ' + (k === 'weak' ? 'weakness to ' : '') + '{n}' + (k === 'weak' ? '' : ' ' + LABEL_OF[k]);
      const a = has(k, r[k]);
      if (a) plus.push(name(k).replace('{n}', a));
      const b = r.against && has(k, r.against[k]);
      if (b) minus.push(name(k).replace('{n}', b));
    });
    // people who know your name (fame and infamy, from 3 up), and a mount for the journey (113)
    const s = L.saga;
    Object.keys(r.rep || {}).forEach(k => {
      if (S.rep(s, k) >= 3) (r.rep[k] > 0 ? plus : minus).push('your ' + k);
    });
    if (r.mount && L.has('mount') && !L.isNone('mount')) {
      const mt = L.pickName('mount');
      if (r.mount === true || r.mount.indexOf(mt) >= 0) plus.push('your ' + mt.toLowerCase());
    }
    // the years: an old hero knows more and moves less (103)
    if (r.age && (S.lifeStage(L) || 0) >= 2) (r.age > 0 ? plus : minus).push(r.age > 0 ? 'your years' : 'your age');
    // a good heart or a dark one (alignment, from 2 either way)
    const al = S.align(s);
    if (r.align && Math.abs(al) >= 2)
      (Math.sign(al) === Math.sign(r.align) ? plus : minus).push(al > 0 ? 'your good heart' : 'your dark heart');
    const m = Math.pow(1.6, Math.min(2, plus.length)) / Math.pow(1.6, Math.min(2, minus.length));
    const up = x => x.charAt(0).toUpperCase() + x.slice(1);
    const why =
      m > 1
        ? up(plus.join(' and ')) + (plus.length > 1 ? ' help' : ' helps') + ' with ' + r.what + '.'
        : m < 1
          ? up(minus.join(' and ')) + (minus.length > 1 ? ' work' : ' works') + ' against you in ' + r.what + '.'
          : '';
    return { m, why };
  };

  async function outcome(L, io, ctx, cfg) {
    let ents = cfg.entries.filter(x => x && x.w > 0 && (!x.if || x.if(L.saga, L, ctx)));
    // a choice first: it narrows the wheel to what follows from it, and can tilt the slices
    if (cfg.choice) {
      const opts = cfg.choice.options.filter(
        o => (!o.if || o.if(L.saga, L, ctx)) && (!o.keep || ents.some(e => o.keep.indexOf(e.name) >= 0))
      );
      if (opts.length) {
        const o = opts[await choose(L, io, ctx, { emoji: cfg.emoji, title: cfg.choice.title, options: opts })];
        ctx.choice = o.label;
        ctx.choiceFit = o.fit || '';
        if (o.keep) ents = ents.filter(e => o.keep.indexOf(e.name) >= 0);
        if (o.boost) ents = ents.map(e => (o.boost[e.name] ? Object.assign({}, e, { w: e.w * o.boost[e.name] }) : e));
      }
    }
    let hint = cfg.hint || '';
    const fitKey = (cfg.choice && ctx.choiceFit) || cfg.fit;
    const fit = fitKey ? S.fit(L, fitKey) : { m: 1, why: '' };
    if (fit.m !== 1) {
      ents = ents.map(e =>
        e.tone === 'good' || e.tone === 'bad'
          ? Object.assign({}, e, { w: e.tone === 'good' ? e.w * fit.m : e.w / fit.m })
          : e
      );
      hint = fit.why + (hint ? ' ' + hint : '');
    }
    const line = x => S.vary(x.text, L, L.saga.ch + ':' + x.name); // the same variant the log gets
    const shown = ents.map(x => Object.assign({}, x, { text: fill(line(x), ctx, L) }));
    const i = await io.spin({
      emoji: cfg.emoji || ctx.emoji,
      title: cfg.title,
      entries: shown,
      mode: cfg.mode || 'cat',
      hue: cfg.hue != null ? cfg.hue : 40,
      hint,
    });
    let e = ents[i];
    // the saga log says when the hero's nature made the difference
    if ((fit.m > 1 && e.tone === 'good') || (fit.m < 1 && e.tone === 'bad'))
      e = Object.assign({}, e, { text: line(e) + ' (' + fit.why.replace(/\.$/, '') + '.)' });
    return S.apply(L, e, ctx);
  }
  const addAlly = (L, name, lv, how, loyalty) => {
    L.ally.push({ name, lv: Math.round(lv), how, loyalty });
  };
  const removeAlly = (L, a) => {
    const i = L.ally.indexOf(a);
    if (i >= 0) L.ally.splice(i, 1);
  };
  const lowestLoyal = (L, rng) => {
    const al = L.ally.filter(a => !a.gone);
    if (!al.length) return null;
    const ws = al.map(a => ({ w: Math.max(5, 105 - (a.loyalty == null ? 60 : a.loyalty)) }));
    return al[FW.weightedIndex(ws, rng)];
  };
  const loyal = (L, d) =>
    L.ally.forEach(a => {
      a.loyalty = clamp((a.loyalty == null ? 60 : a.loyalty) + d, 0, 100);
    });
  // an artifact; one in three is named after its maker ("Durgrim's Crown")
  const newArtifact = (rng, kind, dsl, quality) => {
    const k = kind || pick(ARTIFACT_KIND, rng);
    const maker = Nm().person(rng, pick(['dwarven', 'elven', 'human', 'infernal'], rng));
    return {
      name: rng() < 0.33 ? maker + "'s " + k : k + ' of ' + pick(ARTIFACT_OF, rng),
      maker,
      dsl,
      quality: quality || 'fine',
    };
  };

  /* shared result sets */
  const WIN_LOOT = [
    good('Glory', 6, 'rt+1', 'Songs are sung about {hero}.'),
    good('A sack of gold', 5, 'fate+1', 'Rich enough to buy your luck.', { gold: 60 }),
    good('A new ally', 3, '', '{foe} swears to follow you.', {
      fx: (s, L, c) => addAlly(L, c.foe || c.lastFoe, 35 + 30 * c.rng(), 'recruit', 55),
    }),
    good('A strange relic', 2, 'pwr+1', 'You found {art}.', { fx: (s, L, c) => s.artifacts.push(c.newArt) }),
  ];
  const LOSS = [
    bad('Scarred', 8, '', 'You survive {foe}, scarred.', { scar: true }),
    bad('Captured', 4, '', 'Held prisoner for a year.', { years: 1 }),
    bad('Humbled', 6, 'int+1', 'You learn more from losing than winning.'),
    bad(
      'Killed',
      3,
      '',
      [
        'Slain by {foe} at {arena}.',
        '{foe} strikes the final blow at {arena}.',
        '{hero} falls at {arena}, and {foe} walks away.',
        'At {arena}, {foe} ends the story of {hero}.',
        '{hero} dies at {arena} with {g:his|her|their} weapon still in hand.',
        'The crowd at {arena} goes silent as {foe} stands over {hero}.',
      ],
      { end: 'dead' }
    ),
  ];

  const has = (s, k) => !!s[k];
  /* ---------------- chapters: listed in app/js/chapters/*.js, which add themselves in this order ---------------- */
  S.CHAPTER_FILES = ['quests', 'power', 'people', 'fortune', 'arcs', 'arcs-more', 'world', 'elders', 'secrets'];
  S.CHAPTERS = [];
  S.CHAPTER_BY_ID = {};
  S.addChapters = list =>
    list.forEach(ch => {
      S.CHAPTERS.push(ch);
      S.CHAPTER_BY_ID[ch.id] = ch;
    });

  /* ---------------- the story wheel ---------------- */
  S.retireWeight = function (L, o) {
    const s = L.saga || { ch: 0 };
    let w = 0.8 + 0.18 * s.ch;
    if (o.aging && S.isOld(L)) {
      const life = S.lifespan(L),
        a = S.age(L);
      w += 2 + 4 * clamp((a - life.old) / (life.max - life.old), 0, 2);
    }
    return w;
  };
  /* entries for the story wheel: used chapters stay on the wheel in grey (dw = drawn size, w = 0 so it never lands) */
  S.wheelEntries = function (L, opts, ov) {
    const o = S.opts(opts),
      s = L.saga;
    ov = ov || {};
    const removed = ov.removed || [],
      weights = ov.weights || {};
    const out = [];
    S.CHAPTERS.forEach(ch => {
      if (removed.indexOf(ch.name) >= 0 && !ch.retire) return;
      if (ch.opt && !o[ch.opt]) return;
      if (ch.notOpt && o[ch.notOpt]) return;
      let w = weights[ch.name] > 0 ? weights[ch.name] : ch.w;
      // a chapter that can repeat gets a thinner slice each time it happens, so sagas don't loop on the same few
      const reps = (s.flags && s.flags.reps && s.flags.reps[ch.id]) || 0;
      if (ch.repeat && !ch.retire && !ch.hideLocked && reps) w *= Math.pow(S.REPEAT_FADE, reps);
      if (ch.retire) w = S.retireWeight(L, o);
      else {
        w *= S.alignLean(s, ch.id);
        const ev = o.worldEvents && S.event(s);
        if (ev && ev.boost[ch.id]) w *= ev.boost[ch.id];
      }
      const used = !ch.repeat && s.used.indexOf(ch.id) >= 0;
      const locked = !used && ch.req && !ch.req(s, L, o) && (o.requirements || ch.hard);
      if (locked && ch.hideLocked) return;
      out.push({
        name: (locked ? '🔒 ' : '') + ch.name,
        id: ch.id,
        w: used || locked ? 0 : w,
        dw: used || locked ? Math.min(w, 2) * 0.7 : w,
        dsl: '',
        gray: used || locked,
        used,
        locked,
        emoji: ch.emoji,
        text: locked ? 'Locked: ' + (ch.reqText || 'not yet') : used ? 'Already done' : '',
      });
    });
    return out;
  };

  /* ---------------- kingdom events and old age (between chapters) ---------------- */
  async function kingdomEvent(L, io, c) {
    const s = L.saga;
    c.chName = 'Kingdom event';
    c.emoji = '👑';
    const e = await outcome(L, io, c, {
      title: 'News from ' + s.kingdom.name,
      emoji: '👑',
      hue: 45,
      entries: [
        good('A golden age', 3, 'rt+1 fate+1', '{kingdom} enters a golden age.'),
        bad('Famine', 3, 'fate-1', 'Famine strikes {kingdom}.'),
        good('A royal wedding', 2, 'fate+1', 'A royal wedding brings a new ally.', {
          fx: () => addAlly(L, 'your royal in-laws', 45, 'befriend', 70),
        }),
        good('Trade boom', 3, 'int+1', 'Merchants flock to {kingdom}.'),
        E('A dragon attacks the capital', 2, '', 'A dragon descends on {kingdom}!'),
        E('A coup', 2, '', 'Your generals plot against you.'),
        bad('Plague in the capital', 2, 'dur-1', 'Plague spreads through {kingdom}.'),
      ],
    });
    if (e.name === 'A dragon attacks the capital') {
      const d = pick(DRAGONS, io.rng);
      c.foe = d.name;
      const r = await fight(L, io, c, d, {
        scale: 'war',
        emoji: '🐉',
        title: 'Can {kingdom} hold?'.replace('{kingdom}', s.kingdom.name),
      });
      S.apply(
        L,
        r === 'win'
          ? good('Dragon driven off', 1, 'rt+2', 'You defend {kingdom} from {foe}.')
          : r === 'lose'
            ? bad('The capital burns', 1, 'rt-1 fate-1', '{foe} burns the capital of {kingdom}.')
            : E('The dragon leaves', 1, '', '{foe} leaves, for now.'),
        c
      );
    } else if (e.name === 'A coup') {
      c.foe = 'the generals';
      const r = await fight(L, io, c, foe('the generals', nearYou(L, io.rng, -12, 6)), {
        title: 'Can you stop the coup?',
      });
      S.apply(
        L,
        r === 'lose'
          ? bad('Overthrown', 1, 'rt-2', 'The generals take {kingdom}.', {
              fx: s2 => {
                s2.kingdom = null;
              },
            })
          : good('Coup crushed', 1, 'rt+1', 'You crush the coup.'),
        c
      );
    }
  }
  async function oldAge(L, io, c) {
    const life = S.lifespan(L),
      a = S.age(L);
    c.chName = 'Old age';
    c.emoji = '🕯️';
    const risk = clamp((a - life.old) / (life.max - life.old), 0.06, 3);
    await outcome(L, io, c, {
      title: 'You are ' + a + '. Does your body hold?',
      emoji: '🕯️',
      hue: 30,
      entries: [
        good('Still going strong', 3, '', 'At ' + a + ', {hero} is still going.', { quiet: true }),
        bad('Slowing down', 2, 'spd-1', 'Age catches up with you.'),
        bad(
          'Dies peacefully in their sleep',
          risk * 2,
          '',
          [
            '{hero} dies peacefully of old age at ' + a + '.',
            'At ' + a + ', {hero} falls asleep by the fire and does not wake.',
            '{hero} dies at ' + a + ', surrounded by the people {g:he|she|they} saved.',
            'At ' + a + ', {hero} watches one last sunrise and is gone.',
            '{hero} dies at ' + a + ', in the middle of telling one last story.',
          ],
          {
            end: 'dead',
            alive: 'Your body is failing. You retire at last.',
          }
        ),
      ],
    });
    if (!c.o.death && L.saga.log[L.saga.log.length - 1].text.indexOf('retire at last') >= 0) {
      L.saga.end = 'retired';
      L.saga.endText = 'Your body is failing. {hero} retires at last.'.replace('{hero}', L.displayName());
    }
  }

  /* ---------------- one full turn: spin the story wheel, play the chapter, then the in-between events ---------------- */
  S.playTurn = async function (L, io, opts, ov) {
    const o = S.opts(opts),
      s = L.saga;
    if (s.end) return null;
    const ev = S.rollEvent(L, o);
    const ents = S.wheelEntries(L, o, ov);
    const i = await io.spin({
      kind: 'story',
      emoji: '📖',
      title: 'Chapter ' + (s.ch + 1) + ': what happens next?',
      entries: ents,
      mode: 'cat',
      hue: 30,
      hint: 'Grey slices are done or locked',
      event: ev ? ev.emoji + ' ' + ev.name + ': ' + ev.text : '',
    });
    const ch = S.CHAPTER_BY_ID[ents[i].id];
    s.ch++;
    if (ch.secret) {
      s.flags.secrets = (s.flags.secrets || []).concat([ch.id]);
      if (S.onSecret) S.onSecret(ch.id, L); // the Codex (codex.js)
    }
    if (ev) S.tickEvent(s);
    if (!ch.repeat) s.used.push(ch.id);
    else if (!ch.retire) {
      s.flags.reps = s.flags.reps || {};
      s.flags.reps[ch.id] = (s.flags.reps[ch.id] || 0) + 1;
    }
    const c = { o, ch: ch.id, chName: ch.name, emoji: ch.emoji, rng: io.rng };
    s.years += ch.retire ? 0 : 1 + Math.floor(io.rng() * 3);
    await ch.run(L, io, c);
    if (!s.end && o.kingdomEvents && s.kingdom && ch.id !== 'kingdom' && io.rng() < 0.3)
      await kingdomEvent(L, io, Object.assign({}, c));
    if (!s.end) S.ageUp(L, o);
    if (S.merchantDue(L, o))
      await merchant(L, io, Object.assign({}, c, { chName: 'A travelling merchant', emoji: '🧳' }));
    if (!s.end && o.aging && S.isOld(L) && io.rng() < 0.5) await oldAge(L, io, Object.assign({}, c));
    if (s.end && S.AFTER[s.end] && o.beyond && !s.flags.after) await afterEnd(L, io, Object.assign({}, c));
    if (s.end && !o.dynasty) s.heir = s.heir || null;
    return ch;
  };

  /* ---------------- after the ending: heroes who rise, fall to the pit or refuse to die get one more chapter ----------------
     It does not change the ending; it says what came of them on the other side. */
  S.AFTER = {
    // a playable retirement (117): the hero picks how to spend the quiet years, the wheel says how it goes
    retired: {
      name: 'Retirement',
      emoji: '🍺',
      title: 'The quiet years. How do they go?',
      choice: {
        title: 'How does {hero} spend the quiet years?',
        options: [
          {
            label: 'Open a tavern',
            hint: 'Old heroes always end up behind a bar.',
            keep: ['The best tavern in the land', 'A tavern full of stories', 'Trouble walks in'],
          },
          {
            label: 'Take on students',
            hint: 'Someone should learn what you know.',
            keep: ['A student surpasses you', 'A school of your own', 'A student turns bad'],
          },
          {
            label: 'Write a memoir',
            hint: 'Tell it the way it really happened. Mostly.',
            keep: ['A memoir that is still read', 'A memoir no one believes', 'A memoir that names names'],
          },
        ],
      },
      entries: [
        good(
          'The best tavern in the land',
          3,
          '',
          '{hero} opens a tavern, and adventurers come from three kingdoms to drink where a legend pours.'
        ),
        good(
          'A tavern full of stories',
          2,
          '',
          'Every night {hero} tells one more story by the fire. Some of them are even true.'
        ),
        bad('Trouble walks in', 1.5, '', 'One night an old enemy walks into the tavern. {hero} still has the sword.'),
        good(
          'A student surpasses you',
          2,
          '',
          'One of {hero}’s students becomes greater than {g:him|her|them}, which was the whole point.',
          {
            fx: (s, L, c) => {
              if (!s.heir) s.heir = { name: Nm().person(c.rng || Math.random, 'human'), kind: 'student' };
            },
          }
        ),
        good('A school of your own', 2, '', 'The school {hero} founded is still training heroes a century later.'),
        bad('A student turns bad', 1.5, '', 'One student takes everything {hero} taught and uses it for evil.'),
        good('A memoir that is still read', 3, '', '{hero}’s memoir is still read, and still argued about.'),
        E(
          'A memoir no one believes',
          2,
          '',
          'Nobody believes half of {hero}’s memoir. The true half is the strangest.'
        ),
        bad(
          'A memoir that names names',
          1.5,
          '',
          'The memoir names names. Several powerful people never forgive {hero}.'
        ),
      ],
    },
    ascended: {
      name: 'Among the gods',
      emoji: '🌟',
      title: 'Among the gods. What does {hero} become?',
      entries: [
        good(
          'A god of small things',
          3,
          '',
          '{hero} becomes the god of lost keys and late travellers. The prayers are small, but they never stop.'
        ),
        good('A new star', 2, '', '{hero} becomes a new star. Sailors steer by it.'),
        good(
          'A patron of heroes',
          2,
          '',
          '{hero} watches over the next ones who spin the wheel, and tips it now and then.'
        ),
        E('A distant watcher', 2, '', '{hero} sees everything and touches nothing, as the old gods taught.'),
        bad('A forgotten god', 1.5, '', 'Within a century the prayers stop. {hero} fades, one temple at a time.'),
      ],
    },
    damned: {
      name: 'In the pit',
      emoji: '🔥',
      title: 'In the pit. What becomes of {hero}?',
      entries: [
        bad('Chained', 3, '', '{hero} is chained in the deepest pit, where even the demons do not go.'),
        E('A demon’s servant', 2, '', '{hero} serves the thing that holds the contract, and learns its secrets.'),
        good(
          'Escapes, centuries later',
          1.5,
          '',
          'Centuries later, {hero} claws back out. The world above has forgotten the name.'
        ),
        good('Rules a corner of the pit', 1.5, '', '{hero} fights until a corner of the pit answers to no one else.'),
        bad('Becomes a demon', 1.5, '', '{hero} becomes one of them, and is summoned by fools for a thousand years.'),
      ],
    },
    undying: {
      name: 'The long night',
      emoji: '🌘',
      title: 'The long night. What does {hero} do with forever?',
      entries: [
        good(
          'Guards the old roads',
          3,
          '',
          '{hero} walks the old roads at night, and travellers who meet {g:him|her|them} get home safe.'
        ),
        E('Sleeps', 2, '', '{hero} sleeps under a hill, waiting for the world to need {g:him|her|them} again.'),
        good('Keeps the stories', 2, '', '{hero} collects the stories of the dead, so someone remembers them.'),
        bad('Hunted', 2, '', 'The living hunt {hero} from village to village. They never quite succeed.'),
        bad('Forgets', 1.5, '', 'One century at a time, {hero} forgets who {g:he was|she was|they were}.'),
      ],
    },
  };
  async function afterEnd(L, io, c) {
    const a = S.AFTER[L.saga.end];
    c.chName = a.name;
    c.emoji = a.emoji;
    const end = L.saga.end,
      endText = L.saga.endText;
    const e = await outcome(L, io, c, {
      title: a.title.replace('{hero}', L.displayName()),
      emoji: a.emoji,
      hue: 270,
      entries: a.entries,
      choice: a.choice && Object.assign({}, a.choice, { title: a.choice.title.replace('{hero}', L.displayName()) }),
    });
    L.saga.flags.after = (e && e.name) || a.name;
    L.saga.end = end; // the ending stays what it was
    L.saga.endText = endText;
  }

  /* ---------------- dynasty: family traits and the house's history ----------------
     A house gets one trait when it is founded; every heir born into it carries the trait, and the house's history
     (each ancestor's name, rank, ending and chapters) passes down with it. Each generation also adds a little renown:
     the older the house, the more its name is worth (up to +3). */
  S.TRAITS = [
    { name: 'Iron-blooded', dsl: 'dur+1', text: 'The family is hard to kill.' },
    { name: 'Quick of hand', dsl: 'spd+1', text: 'Nobody in the family was ever caught napping.' },
    { name: 'A line of scholars', dsl: 'int+1', text: 'Every child grows up among books.' },
    { name: 'Born to fight', dsl: 'fgt+1', text: 'The children learn to fight before they can read.' },
    { name: 'Old magic', dsl: 'pwr+1', text: 'Magic runs in the blood.' },
    { name: 'Fortune-favoured', dsl: 'fate+1', text: 'Luck follows the family like a dog.' },
    { name: 'Sworn to the sword', dsl: 'wpn+1', text: 'Every heir is handed a blade.' },
    { name: 'Strong as oxen', dsl: 'str+1', text: 'Broad shoulders run in the family.' },
    { name: 'Storm-touched', dsl: 'r=lightning', text: 'Lightning has never harmed one of them.' },
    { name: 'Moon-blessed', dsl: 'dark:all+1', text: 'The family is at its best at night.' },
    { name: 'Cursed blood', dsl: 'all+1 fate-1', text: 'Strong, and unlucky. An old curse, an old strength.' },
  ];
  S.rollTrait = rng => Object.assign({}, S.TRAITS[Math.floor(rng() * S.TRAITS.length) % S.TRAITS.length]);
  /* the parent's line in the house history */
  S.record = function (L) {
    const s = L.saga,
      c = FW.compute(L);
    return {
      gen: (s.dyn && s.dyn.gen) || 1,
      name: L.displayName(),
      race: L.raceName(),
      rating: c.rating,
      rank: c.rank,
      end: s.end || '',
      ch: s.ch || 0,
      kingdom: s.kingdom ? s.kingdom.name : '',
    };
  };
  /* the whole family line, oldest first, ending with this hero */
  S.familyTree = function (L) {
    const s = L.saga;
    if (!s || !s.dyn) return [];
    return (s.dyn.history || []).concat([Object.assign(S.record(L), { current: true })]);
  };

  /* ---------------- dynasty: what the heir inherits ---------------- */
  // endings that leave nothing behind (no body, no grave, no throne to pass on) end the family line too
  /* ---------------- old legends: heroes from the Hall of Legends who can turn up in a new saga ----------------
     Only heroes who are still alive at the end of their story, or who cheated death (the Undying), come back.
     The app sets S.hallSource to the Hall; in node (tests, the bot) there is no Hall unless one is set. */
  S.hallSource = null;
  S.RETURN_AS = {
    retired: 'who retired long ago',
    legend: 'whose legend is still sung',
    ascended: 'who rose beyond mortal life',
    fulfilled: 'who fulfilled a prophecy',
    lost: 'who vanished long ago',
    undying: 'who cheated death itself',
  };
  S.canReturn = h => {
    const end = h && h.saga && h.saga.end;
    return !!h && !!h.title && (!end || !S.MORTAL[end] || end === 'undying');
  };
  S.heroName = h => String((h && h.saga && h.saga.who) || (h && h.title) || '').split(', ')[0];
  S.oldLegends = L => {
    const all = (S.hallSource && S.hallSource()) || [],
      me = L.displayName();
    return all.filter(h => S.canReturn(h) && S.heroName(h) && S.heroName(h) !== me);
  };
  S.returnPhrase = h => {
    const sg = h.saga || {},
      cheated = +sg.cheated || 0;
    if (sg.end === 'undying') return S.RETURN_AS.undying;
    if (cheated > 1) return 'who has cheated death ' + cheated + ' times';
    if (cheated === 1) return 'who once cheated death';
    return S.RETURN_AS[sg.end] || 'from the Hall of Legends';
  };

  S.NO_HEIR = { lost: true, sealed: true, damned: true };
  S.canContinue = (L, opts) => {
    const s = L.saga;
    return !!(s && s.end && !S.NO_HEIR[s.end] && s.heir && S.opts(opts).dynasty);
  };
  S.inheritance = function (L) {
    const s = L.saga,
      c = FW.compute(L);
    const best = FW.COMBAT_STATS.slice().sort((a, b) => (c.stats[b].lvl || 0) - (c.stats[a].lvl || 0))[0];
    const art =
      s.artifacts.slice().sort((a, b) => (b.quality === 'legendary') - (a.quality === 'legendary'))[0] || null;
    return {
      dyn: s.dyn,
      parent: L.displayName(),
      kingdom: s.kingdom,
      artifact: art,
      nem: s.nem && s.nem.alive && !s.nem.ally ? s.nem : null,
      race: L.raceName(),
      sub: L.has('sub') ? L.pickName('sub') : '',
      best,
      heir: s.heir,
      record: S.record(L),
      gold: Math.floor(S.gold(s) / 2),
      dsl:
        best +
        '+1' +
        (s.heir && s.heir.blessed ? ' fate+1' : '') +
        (s.world ? ' rt+2' : s.kingdom ? ' rt+1' : '') +
        ' rt+' +
        Math.min(3, (s.dyn && s.dyn.gen) || 1),
    };
  };
  S.startHeir = function (L, inh, opts, rng) {
    S.newSaga(L, opts, rng, inh);
    L.chron.push({
      label: 'Inheritance from ' + inh.parent,
      dsl: inh.dsl,
      text: 'Child of ' + inh.parent + ': inherited their talent.',
      kind: 'story',
    });
    const tr = L.saga.dyn.trait;
    if (tr)
      L.chron.push({
        label: 'Family trait: ' + tr.name,
        dsl: tr.dsl,
        text: '',
        kind: 'story',
      });
    if (inh.artifact)
      L.chron.push({
        label: 'Heirloom: ' + inh.artifact.name,
        dsl: inh.artifact.dsl || 'pwr+1',
        text: '',
        kind: 'story',
      });
    L.saga.log.push({
      ch: 0,
      chapter: 'Inheritance',
      emoji: '👑',
      text:
        L.displayName() +
        ', ' +
        (inh.heir ? inh.heir.kind + ' of ' : 'heir of ') +
        inh.parent +
        ', takes up the family name of ' +
        inh.dyn.house +
        (inh.kingdom ? ' and the throne of ' + inh.kingdom.name : '') +
        '.',
      tone: 'good',
    });
    return L.saga;
  };

  /* ---------------- summaries (card, text, art) ---------------- */
  S.endLabel = {
    dead: 'Died',
    retired: 'Retired',
    ascended: 'Ascended',
    lost: 'Lost between worlds',
    martyr: 'Died a hero',
    sealed: 'Sealed away',
    damned: 'Taken by the demon',
    fulfilled: 'Prophecy fulfilled',
    undying: 'Risen undead',
    legend: 'Passed into legend',
  };
  S.endIcon = {
    dead: '🪦',
    retired: '🌅',
    ascended: '✨',
    lost: '🌀',
    martyr: '🕊️',
    sealed: '🗝️',
    damned: '🔥',
    fulfilled: '📜',
    undying: '💀',
    legend: '🌟',
  };
  S.RARE_END = { ascended: true, fulfilled: true, legend: true };
  S.summary = function (L) {
    const s = L.saga;
    if (!s) return '';
    const parts = [s.ch + ' chapter' + (s.ch === 1 ? '' : 's')];
    if (s.end) parts.push(S.endLabel[s.end] || s.end);
    if (s.world) parts.push('ruled the world');
    else if (s.kingdom) parts.push('ruler of ' + s.kingdom.name);
    if (s.dyn && s.dyn.gen > 1) parts.push(s.dyn.house + ', gen ' + s.dyn.gen);
    return parts.join(' · ');
  };
  /* ---------------- the saga recap: the story at a glance, for the end of a saga ----------------
     Turning points are the log lines from chapters that change a life (a kingdom, love, an heir, a dragon...), fights
     won against the odds and the ending; at most RECAP_MAX of them, the ending always included. */
  // how much a chapter changes a life: 2 for the big turns, 1 for the rest worth remembering
  S.TURNING = {
    kingdom: 2,
    conquerWorld: 2,
    love: 2,
    heir: 2,
    ascend: 2,
    loseAll: 2,
    fate: 2,
    awaken: 2,
    lastStand: 2,
    heirGrown: 2,
    found: 2,
    religion: 2,
    pact: 2,
    otherworld: 2,
    boss: 1,
    dragon: 1,
    evolve: 1,
    artifact: 1,
    conquerRace: 1,
    guild: 1,
    tournament: 1,
    apprentice: 1,
    betrayal: 1,
    nemesis: 1,
    showdown: 1,
    rival: 1,
    curse: 1,
    exile: 1,
    rebellion: 1,
    debt: 1,
    succession: 1,
    mentor: 1,
    duel: 1,
    guildMaster: 2,
  };
  S.RECAP_MAX = 8;
  /* ---------------- the saga inside a Legend Code ----------------
     Codes carry the whole saga, and the server keeps short card codes up to 20,000 characters. forCode makes a lean
     copy (no empty fields); if a code is still too long, trimForCode drops one log line at a time, the oldest
     ordinary line first, and never a turning point or the ending. `cut` says how many were left out. */
  S.CODE_MAX = 19000;
  S.forCode = function (s) {
    const c = Object.assign({}, s);
    c.log = (s.log || []).map(x =>
      Object.assign(
        { ch: x.ch, chapter: x.chapter, emoji: x.emoji, text: x.text },
        x.tone ? { tone: x.tone } : {},
        x.end ? { end: x.end } : {}
      )
    );
    if (!c.cut) delete c.cut;
    return c;
  };
  S.trimForCode = function (c) {
    const byName = {};
    S.CHAPTERS.forEach(ch => (byName[ch.name] = ch.id));
    let i = c.log.findIndex(x => !x.end && !S.TURNING[byName[x.chapter]]);
    if (i < 0) i = c.log.findIndex(x => !x.end);
    if (i < 0) return false;
    c.log.splice(i, 1);
    c.cut = (c.cut || 0) + 1;
    return true;
  };
  /* fights, kept small because the saga travels inside Legend Codes: the counts, the chapters of wins against the
     odds, and only the three fights the recap names */
  S.UPSET = 0.35; // a win at these odds or worse is a turning point
  S.noteFight = function (s, foe, p, res) {
    const F = (s.fights = s.fights || { w: 0, l: 0, d: 0, up: [] });
    const x = { ch: s.ch, foe: String(foe || ''), p: Math.round(p * 100) / 100 };
    F[res === 'win' ? 'w' : res === 'lose' ? 'l' : 'd']++;
    if (res === 'win' && x.p < S.UPSET && F.up.indexOf(s.ch) < 0) F.up.push(s.ch);
    if (!F.closest || Math.abs(x.p - 0.5) < Math.abs(F.closest.p - 0.5)) F.closest = Object.assign({ res }, x);
    if (res === 'win' && x.p < 0.5 && (!F.upset || x.p < F.upset.p)) F.upset = x;
    if (res === 'lose' && x.p > 0.5 && (!F.heartbreak || x.p > F.heartbreak.p)) F.heartbreak = x;
  };
  S.cleanFights = function (F) {
    if (!F || typeof F !== 'object' || Array.isArray(F)) return null;
    const one = x =>
      x && typeof x === 'object'
        ? Object.assign(
            { ch: +x.ch || 0, foe: String(x.foe || '').slice(0, 80), p: Math.min(1, Math.max(0, +x.p || 0)) },
            x.res ? { res: String(x.res).slice(0, 4) } : {}
          )
        : null;
    const out = {
      w: +F.w || 0,
      l: +F.l || 0,
      d: +F.d || 0,
      up: (Array.isArray(F.up) ? F.up : [])
        .map(Number)
        .filter(n => n > 0)
        .slice(0, 50),
    };
    ['closest', 'upset', 'heartbreak'].forEach(k => {
      const v = one(F[k]);
      if (v) out[k] = v;
    });
    return out;
  };
  S.recap = function (L) {
    const s = L.saga;
    if (!s) return null;
    const byName = {};
    S.CHAPTERS.forEach(c => (byName[c.name] = c.id));
    const F = s.fights || { w: 0, l: 0, d: 0, up: [] };
    const upsetAt = {};
    (F.up || []).forEach(ch => (upsetAt[ch] = true));
    // one line per chapter at most: its first line, or the ending
    const seen = {},
      picks = [];
    (s.log || []).forEach((x, i) => {
      const id = byName[x.chapter] || '';
      const score = x.end ? 4 : upsetAt[x.ch] ? 3 : S.TURNING[id] || 0;
      if (!score) return;
      if (seen[x.ch] && !x.end) return;
      seen[x.ch] = true;
      picks.push({ i, score, x, upset: !!upsetAt[x.ch] && !x.end });
    });
    const keep = picks
      .slice()
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(0, S.RECAP_MAX)
      .sort((a, b) => a.i - b.i)
      .map(p => ({
        ch: p.x.ch,
        emoji: p.x.emoji || '',
        chapter: p.x.chapter || '',
        text: p.x.text || '',
        tone: p.x.tone || '',
        end: !!p.x.end,
        upset: p.upset,
      }));
    const age = S.age(L);
    return {
      name: L.displayName(),
      end: s.end,
      endLabel: S.endLabel[s.end] || '',
      chapters: s.ch,
      years: s.years || 0,
      ageEnd: age,
      ageStart: age != null ? age - (s.years || 0) : null,
      stage: S.lifeStage(L) != null ? S.LIFE_STAGES[S.lifeStage(L)] : '',
      fights: { total: F.w + F.l + F.d, won: F.w, lost: F.l, draw: F.d },
      closest: F.closest || null,
      upset: F.upset || null,
      heartbreak: F.heartbreak || null,
      cheated: (s.flags && s.flags.cheated) || 0,
      oldLegend: (s.flags && s.flags.oldLegend) || '',
      fame: S.rep(s, 'fame'),
      infamy: S.rep(s, 'infamy'),
      scars: ((s.flags && s.flags.scars) || []).slice(),
      after: (s.flags && s.flags.after) || '',
      gold: S.gold(s),
      bought: ((s.flags && s.flags.bought) || []).slice(),
      align: S.align(s),
      alignName: S.alignName(S.align(s)),
      guild: s.guild ? S.rankName(s) + ', ' + s.guild : '',
      ancestor: (s.flags && s.flags.ancestor) || '',
      secrets: ((s.flags && s.flags.secrets) || []).map(id => (S.CHAPTER_BY_ID[id] || { name: id }).name),
      events: ((s.flags && s.flags.events) || []).map(id => (S.EVENT_BY_ID[id] || { name: id }).name),
      timeline: keep,
      family: S.familyTree(L),
      heir: s.heir ? s.heir.name + ' (' + s.heir.kind + ')' : '',
      love: s.love || '',
      kingdom: s.world ? 'the world' : s.kingdom ? s.kingdom.name : '',
      artifacts: (s.artifacts || []).map(a => a.name).filter(Boolean),
      conquered: (s.conquered || []).slice(),
    };
  };
  /* what "How was this saga?" sends besides the answer: what the story features did, so testers' feedback can be
     matched to them. Counts, ids and option names only: no hero names, no saga text. Shown to the player first. */
  S.feedbackFacts = function (L, opts) {
    const s = L.saga;
    if (!s) return '';
    const f = s.flags || {},
      F = s.fights || { w: 0, l: 0, d: 0 },
      o = S.opts(opts),
      out = [];
    const add = (k, v) => v !== '' && v != null && v !== 0 && out.push(k + ' ' + v);
    add('gen', s.dyn && s.dyn.gen > 1 ? s.dyn.gen : 0);
    add('fights', F.w + F.l + F.d ? F.w + '/' + F.l + '/' + F.d : '');
    add('align', S.align(s) ? S.alignName(S.align(s)) + ' ' + S.align(s) : '');
    add('gold', S.gold(s));
    add('bought', (f.bought || []).length);
    add('fame', S.rep(s, 'fame'));
    add('infamy', S.rep(s, 'infamy'));
    add('guild', s.guild ? S.rankName(s) : '');
    add('scars', (f.scars || []).length);
    add('close calls', +f.cheated || 0);
    add('ancestor save', f.ancestor ? 'yes' : '');
    add('old legend', f.oldLegend ? 'yes' : '');
    add('events', (f.events || []).join('+'));
    add('secret', (f.secrets || []).join('+'));
    add('after', f.after || '');
    add('heir', s.heir ? s.heir.kind : '');
    add(
      'off',
      S.OPTIONS.filter(x => !o[x.id])
        .map(x => x.id)
        .join('+')
    );
    return out.join(' · ');
  };

  /* ---------------- faces for companions and the nemesis (165, 166) ----------------
     A companion who was an arena foe or a dragon keeps that portrait; the others get one by what they are. A nemesis
     gets one of eight villain portraits, fixed by their name. Paths are relative to app/. */
  S.ALLY_ART = [
    ['dragon', /dragon|wyrm|drake/i],
    ['mentor', /mentor/i],
    ['beloved', /beloved/i],
    ['ghost', /ghost|spirit|shade/i],
    ['army', /army|legion|soldiers/i],
    ['townsfolk', /people of|villagers|townsfolk/i],
    ['royal', /royal|in-laws|king|queen|prince/i],
    ['traveller', /traveller|another world/i],
    ['prisoner', /prisoner|chains/i],
    ['apprentice', /apprentice|heir|child/i],
  ];
  S.allyArt = a => {
    if (!a || !a.name) return '';
    const face = FW.FOE_ART && FW.FOE_ART[a.name];
    if (face) return 'art/foes/' + face + '.webp';
    if (a.how === 'love') return 'art/allies/beloved.webp';
    const hit = S.ALLY_ART.find(x => x[1].test(a.name));
    return 'art/allies/' + (hit ? hit[0] : a.how === 'rescued' ? 'prisoner' : 'warrior') + '.webp';
  };
  S.NEMESIS_ART = ['warlord', 'sorceress', 'assassin', 'fallen', 'necromancer', 'beastlord', 'schemer', 'prophet'];
  const nameHash = s => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h;
  };
  S.nemArt = n =>
    n && n.name ? 'art/nemesis/' + S.NEMESIS_ART[nameHash(String(n.name)) % S.NEMESIS_ART.length] + '.webp' : '';

  /* ---------------- the map of the saga (168) ----------------
     The painted map (app/art/saga-map.webp) has a capital in the middle, mountains in the north, a forest in the west,
     a volcano in the east, a desert in the south-east, swamps in the south-west and a sea with islands to the south.
     Each chapter happens somewhere on it; the recap draws the hero's path from place to place. Points are fractions
     of the map's width and height; a chapter picks one of its region's spots with the saga's seed. */
  S.MAP_REGIONS = {
    capital: [
      [0.49, 0.4],
      [0.45, 0.45],
      [0.54, 0.44],
    ],
    plains: [
      [0.41, 0.56],
      [0.55, 0.58],
      [0.36, 0.47],
      [0.62, 0.5],
    ],
    forest: [
      [0.2, 0.38],
      [0.27, 0.46],
      [0.15, 0.48],
      [0.31, 0.32],
    ],
    mountains: [
      [0.55, 0.14],
      [0.4, 0.18],
      [0.69, 0.16],
      [0.8, 0.22],
    ],
    volcano: [
      [0.73, 0.32],
      [0.68, 0.38],
      [0.79, 0.4],
    ],
    desert: [
      [0.73, 0.62],
      [0.82, 0.58],
      [0.66, 0.68],
    ],
    swamp: [
      [0.27, 0.6],
      [0.2, 0.66],
      [0.34, 0.68],
    ],
    ruins: [
      [0.26, 0.36],
      [0.6, 0.3],
      [0.44, 0.66],
      [0.58, 0.68],
    ],
    sea: [
      [0.48, 0.84],
      [0.62, 0.8],
      [0.35, 0.78],
      [0.9, 0.62],
    ],
    coast: [
      [0.18, 0.76],
      [0.86, 0.46],
      [0.42, 0.74],
    ],
    edge: [
      [0.09, 0.3],
      [0.93, 0.32],
      [0.92, 0.74],
    ],
  };
  S.CH_REGION = {
    train: 'plains',
    study: 'capital',
    treasure: 'ruins',
    quest: 'forest',
    dungeon: 'mountains',
    boss: 'volcano',
    dragon: 'mountains',
    evolve: 'ruins',
    artifact: 'ruins',
    kingdom: 'capital',
    conquerRace: 'plains',
    conquerWorld: 'capital',
    guild: 'capital',
    guildWork: 'capital',
    guildMaster: 'capital',
    tournament: 'capital',
    rescue: 'swamp',
    love: 'plains',
    heir: 'capital',
    apprentice: 'plains',
    betrayal: 'capital',
    nemesis: 'desert',
    showdown: 'desert',
    rival: 'plains',
    oldLegend: 'forest',
    curse: 'swamp',
    exile: 'desert',
    plague: 'swamp',
    rebellion: 'capital',
    otherworld: 'edge',
    religion: 'mountains',
    ascend: 'mountains',
    loseAll: 'desert',
    timeSkip: 'plains',
    oracle: 'mountains',
    omen: 'ruins',
    fate: 'volcano',
    pact: 'volcano',
    debt: 'volcano',
    seal: 'mountains',
    awaken: 'volcano',
    lastStand: 'plains',
    heirGrown: 'capital',
    siege: 'capital',
    voyage: 'sea',
    heist: 'capital',
    haunted: 'swamp',
    mentor: 'forest',
    duel: 'plains',
    succession: 'capital',
    found: 'coast',
    retire: 'forest',
    passSword: 'forest',
    lastAdventure: 'mountains',
    oldEnemy: 'desert',
    elderCouncil: 'capital',
    lichKing: 'swamp',
    lastEgg: 'volcano',
    meetYourself: 'ruins',
    dawn: 'desert',
    drownedCrown: 'sea',
  };
  // where the saga went: one stop per chapter, in order ({ch, id, chapter, emoji, x, y, end})
  S.mapPath = function (L) {
    const s = L.saga;
    if (!s) return [];
    const byName = {};
    S.CHAPTERS.forEach(c => (byName[c.name] = c.id));
    const stops = [],
      seen = {};
    (s.log || []).forEach(x => {
      const id = byName[x.chapter];
      if (!id || !x.ch || seen[x.ch]) return;
      seen[x.ch] = true;
      const spots = S.MAP_REGIONS[S.CH_REGION[id] || 'plains'],
        r = FW.makeRng(String(L.seed) + ':map:' + x.ch);
      const p = spots[Math.floor(r() * spots.length) % spots.length];
      stops.push({
        ch: x.ch,
        id,
        chapter: x.chapter,
        emoji: x.emoji || '',
        x: Math.min(0.96, Math.max(0.04, p[0] + (r() - 0.5) * 0.05)),
        y: Math.min(0.94, Math.max(0.06, p[1] + (r() - 0.5) * 0.05)),
        end: false,
      });
    });
    if (stops.length && s.end) stops[stops.length - 1].end = true;
    return stops;
  };
  /* ---------------- the epilogue: what became of everything, after the end ----------------
     A few sentences built from what the saga left behind: the kingdom, the heir, the nemesis, a love or an unfinished
     thread, and a closing line for the ending. The wording is picked with the hero's own seed, so the same hero always
     gets the same epilogue (also when opened from a Legend Code). Story text, so English for now. */
  S.EPILOGUE_MAX = 4;
  S.epilogue = function (L) {
    const s = L.saga;
    if (!s || !s.end) return [];
    const rng = FW.makeRng((L.seed || L.displayName()) + ':epilogue'),
      one = list => list[Math.floor(rng() * list.length) % list.length];
    const Hero = L.displayName(),
      hero = Hero.replace(/^The /, 'the '),
      dead = !!S.MORTAL[s.end],
      gone = dead || s.end === 'lost' || s.end === 'ascended',
      heir = s.heir && s.heir.name,
      house = s.dyn && s.dyn.house,
      out = [];
    // the kingdom
    if (s.world)
      out.push(
        gone
          ? heir
            ? 'The empire passes to ' + heir + ', who spends a lifetime holding it together.'
            : one([
                'Without ' + hero + ', the empire splinters into a dozen quarrelling crowns.',
                'The world ' + hero + ' conquered falls apart within a year, and nobody agrees on what to call it.',
              ])
          : 'The empire holds for a generation, long enough for the roads and the songs to outlive it.'
      );
    else if (s.kingdom) {
      const k = s.kingdom.name,
        strong = (s.kingdom.power || 0) >= 60;
      out.push(
        heir
          ? k + ' passes to ' + heir + (strong ? ', strong and at peace.' : ', along with its debts and its enemies.')
          : gone
            ? strong
              ? k + ' mourns ' + hero + ' for a year, then crowns a council of old friends.'
              : one([
                  'With no heir, ' + k + ' falls to its neighbours within a decade.',
                  k + ' does not survive the first winter without ' + hero + '.',
                ])
            : strong
              ? k + ' prospers, and still keeps a chair empty for ' + hero + ' at every feast.'
              : k + ' limps on, ruled by whoever shouts the loudest.'
      );
    }
    // the heir
    if (heir && !s.world && !s.kingdom)
      out.push(
        s.heir.blessed
          ? heir + ', the prophesied child, grows up knowing exactly what is expected of them.'
          : one([
              heir + ' grows up on stories of ' + hero + ', and believes about half of them.',
              heir + ' carries the name of ' + (house || 'the family') + ' into a new age.',
            ])
      );
    // the nemesis, if they ever met
    const n = s.nem;
    if (n && n.met > 0)
      out.push(
        !n.alive
          ? one(['Nobody mourns ' + n.name + '.', 'The grave of ' + n.name + ' stays unmarked, as everyone agreed.'])
          : n.ally
            ? n.name +
              ', once an enemy, ' +
              (dead ? 'keeps watch over the grave of ' + hero + '.' : 'becomes an old friend.')
            : heir
              ? n.name + ' is still out there, and has started asking about ' + heir + '.'
              : one([
                  n.name + ' is still out there, waiting for a rematch that will never come.',
                  n.name + ' tells everyone the fight with ' + hero + ' was a draw.',
                ])
      );
    // a love, or a thread left hanging
    const F = s.flags || {};
    if (s.love && out.length < S.EPILOGUE_MAX - 1)
      out.push(
        dead
          ? 'The one ' + hero + ' loved (' + s.love + ') never quite forgives the world.'
          : gone
            ? 'The one ' + hero + ' loved (' + s.love + ') waits for a long time, and then stops waiting.'
            : Hero + ' grows old beside ' + s.love + ', which turns out to be the bravest thing of all.'
      );
    else if (F.pact && F.pact.stage === 1 && out.length < S.EPILOGUE_MAX - 1)
      out.push('Somewhere below, a demon is still waiting to collect what it is owed.');
    else if (F.seal && F.seal.stage < 3 && s.end !== 'sealed' && out.length < S.EPILOGUE_MAX - 1)
      out.push('Far beneath the world, the ancient seal still holds. For now.');
    else if (F.prophecy && F.prophecy.stage < 3 && !F.fulfilled && out.length < S.EPILOGUE_MAX - 1)
      out.push('The prophecy is never fulfilled, and scholars still argue about who it meant.');
    else if (F.city && out.length < S.EPILOGUE_MAX - 1)
      out.push('The city of ' + F.city + ' still celebrates its founding day with too much wine.');
    // fillers for a quieter life: an artifact, the guild
    const art0 = (s.artifacts || []).map(x => x && x.name).filter(Boolean)[0],
      // 'the Amulet of Dawn', but 'Loreriel's Amulet' as it is (also when the name starts with 'The')
      bare = art0 && art0.replace(/^the /i, ''),
      art = bare && (/'s\b/.test(bare) ? bare : 'the ' + bare),
      Art = art && art[0].toUpperCase() + art.slice(1);
    if (art && out.length < S.EPILOGUE_MAX - 1)
      out.push(
        heir
          ? Art + ' passes to ' + heir + '.'
          : one([
              Art + ' ends up behind glass, guarded by a very nervous guard.',
              'Nobody knows what became of ' + art + '.',
            ])
      );
    if (s.guild && out.length < S.EPILOGUE_MAX - 1)
      out.push(
        'The ' +
          s.guild +
          ' hangs a portrait of ' +
          hero +
          ' in its hall' +
          (s.guild.indexOf('Thieves') === 0 || s.guild.indexOf('Assassins') === 0
            ? ', and pretends never to have met them.'
            : '.')
      );
    // the closing line
    const close = {
      dead: ['The stories about ' + hero + ' get bigger every year.', 'A small stone marks where ' + hero + ' fell.'],
      martyr: ['Every year, on the day ' + hero + ' fell, someone leaves flowers.'],
      retired: [
        'Bards still get the life of ' + hero + ' wrong, and nobody minds.',
        'On quiet evenings, ' + hero + ' still reaches for a sword that is no longer there.',
      ],
      legend: [
        'Children still play at being ' + hero + '.',
        'Bards still sing of ' + hero + ', each version grander than the last.',
      ],
      ascended: ['Some nights, a new star seems to watch over the land.'],
      lost: ['Sailors swear they sometimes see ' + hero + ' at the edge of the world.'],
      sealed: ['The seal holds, and the world never learns what ' + hero + ' gave to keep it shut.'],
      damned: ['Mothers use the name ' + hero + ' to frighten children into bed.'],
      fulfilled: ['The prophecy is carved over the city gate, with the name of ' + hero + ' beneath it.'],
      undying: ['Something that was once ' + hero + ' still walks the roads at night.'],
    }[s.end] || ['And so the saga of ' + hero + ' ends.'];
    out.splice(S.EPILOGUE_MAX - 1);
    out.push(one(close));
    return out;
  };
  S.artFacts = function (L) {
    const s = L.saga;
    if (!s) return null;
    return {
      kingdom: s.kingdom ? s.kingdom.name : '',
      world: s.world,
      artifacts: s.artifacts.map(a => a.name).slice(-2),
      conquered: s.conquered.slice(-3),
      end: s.end,
      nemesis: s.nem ? s.nem.name : '',
      last: s.log.length ? s.log[s.log.length - 1].text : '',
    };
  };

  /* the helpers chapters use (app/js/chapters/*.js) */
  S.lib = {
    ARTIFACT_KIND,
    ARTIFACT_OF,
    DRAGONS,
    E,
    LABEL_OF,
    LIFE,
    LOSS,
    Nm,
    WIN_LOOT,
    addAlly,
    bad,
    choose,
    clamp,
    fight,
    fill,
    foe,
    good,
    has,
    kingdomEvent,
    lowestLoyal,
    loyal,
    matched,
    nearYou,
    newArtifact,
    oldAge,
    outcome,
    phaseCfg,
    pick,
    removeAlly,
  };

  // in the browser, index.html loads the chapter files after this one; in node, requiring this file loads them
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function')
    S.CHAPTER_FILES.forEach(f => require('./chapters/' + f + '.js'));
})(typeof window !== 'undefined' ? window : globalThis);
