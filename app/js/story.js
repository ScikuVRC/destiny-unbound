/* Destiny Unbound story mode - the saga that follows a finished character. Pure logic (no DOM): works in the browser and in node.
   A chapter is an async script that asks `io.spin(cfg)` for wheel results; the app shows real wheels, the tests pick at random.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const S = (FW.Story = {});

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
    { id: 'achievements', name: 'Achievements', blurb: 'Unlock badges for great (and terrible) sagas.' },
  ];
  // endings where the hero dies; with the Death option off they survive instead
  S.MORTAL = { dead: true, martyr: true, sealed: true, damned: true, undying: true };
  // second chances: in chapters 1-6 three in five deaths become narrow escapes, later almost half (sagas run longer)
  S.REPEAT_FADE = 0.6; // a repeatable chapter keeps 60% of its slice each time it happens (train twice: 36%)
  S.YOUNG_SAGA = 6;
  S.YOUNG_SAVE = 0.6;
  S.LATE_SAVE = 0.45;
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
  const NEMESES = [
    'Kael the Envious',
    'Mirelle Ashborne',
    'Varg of the Broken Oath',
    'Seraphine Nightwhisper',
    'Dorran Coldheart',
    'The Grey Pretender',
    'Ysolde the Unforgiving',
    'Malrec Thornblood',
    'Ivo the Smiling',
    'Nyx Halloway',
    'Brannoc Vile',
    'Lady Cinder',
    'Orlan the Second',
    'Thessaly Venn',
  ];
  const HEIRS = [
    'Aric',
    'Bryn',
    'Cael',
    'Daria',
    'Eamon',
    'Freya',
    'Garrick',
    'Hale',
    'Isolde',
    'Joren',
    'Kira',
    'Lio',
    'Mara',
    'Nils',
    'Orla',
    'Peregrine',
    'Rhea',
    'Soren',
    'Tamsin',
    'Vale',
    'Wren',
    'Yara',
  ];
  const HOUSES = [
    'Ashgrove',
    'Blackthorn',
    'Brightwater',
    'Coldmere',
    'Duskbane',
    'Emberfall',
    'Greymantle',
    'Hollowell',
    'Ironvale',
    'Moonridge',
    'Ravencrest',
    'Stormhold',
    'Sunmere',
    'Wolfsbane',
  ];
  const REALMS = [
    'Aldmere',
    'Brakkor',
    'Caelvorn',
    'Dunhallow',
    'Everfrost',
    'Galdren',
    'Highmoor',
    'Kesh',
    'Lunaris',
    'Morvane',
    'Novaterra',
    'Ostrel',
    'Ravenreach',
    'Solace',
    'Thalgar',
    'Valemont',
  ];
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
        ? { house: inherit.dyn.house, gen: inherit.dyn.gen + 1, parent: inherit.parent || '' }
        : { house: 'House ' + (L.name ? L.name.split(' ').slice(-1)[0] : pick(HOUSES, rng)), gen: 1, parent: '' };
    if (inherit) {
      if (inherit.kingdom) s.kingdom = Object.assign({}, inherit.kingdom);
      if (inherit.artifact) s.artifacts.push(Object.assign({}, inherit.artifact, { inherited: true }));
      if (inherit.nem) s.nem = Object.assign({}, inherit.nem, { lv: inherit.nem.lv + 3, met: 0 });
    }
    if (o.nemesis && !s.nem) s.nem = S.makeNemesis(L, rng);
    L.saga = s;
    return s;
  };
  S.makeNemesis = function (L, rng) {
    const base = FW.compute(L).baseRating;
    const race = FW.RACES[FW.weightedIndex(FW.RACES, rng)];
    return {
      name: pick(NEMESES, rng),
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
    return ['win', 'draw', 'lose'][i];
  }

  /* ---------------- applying a result ---------------- */
  function fill(t, ctx, L) {
    const s = L.saga;
    return String(t || '')
      .replace(/\{foe\}/g, ctx.foe || ctx.lastFoe || 'the enemy')
      .replace(/\{kingdom\}/g, s.kingdom ? s.kingdom.name : 'your kingdom')
      .replace(/\{nem\}/g, s.nem ? s.nem.name : 'your rival')
      .replace(/\{ally\}/g, ctx.ally ? ctx.ally.name : 'an ally')
      .replace(/\{heir\}/g, s.heir ? s.heir.name : 'your child')
      .replace(/\{hero\}/g, L.displayName())
      .replace(/\{arena\}/g, ctx.lastArena || 'the field')
      .replace(/\{art\}/g, ctx.art || 'the artifact');
  }
  S.apply = function (L, ent, ctx) {
    const s = L.saga,
      o = ctx.o;
    let e = ent;
    if (S.MORTAL[e.end] && o.death && ctx.rng && ctx.rng() < (s.ch <= S.YOUNG_SAGA ? S.YOUNG_SAVE : S.LATE_SAVE))
      e = Object.assign({}, e, {
        end: null,
        dsl: 'dur-1',
        text: e.alive || 'Death comes close, but you survive with a terrible scar.',
        tone: 'bad',
      });
    if (S.MORTAL[e.end] && !o.death)
      e = Object.assign({}, e, {
        end: null,
        dsl: 'dur-1',
        text: e.alive || 'Death comes close, but you survive with a terrible scar.',
        tone: 'bad',
      });
    if (e.dsl) L.chron.push({ label: ctx.chName + ': ' + e.name, dsl: e.dsl, text: '', kind: 'story', key: ctx.ch });
    if (e.fx) e.fx(s, L, ctx);
    if (e.years) s.years += e.years;
    const text = fill(e.text || e.name, ctx, L);
    if (!e.quiet)
      s.log.push({
        ch: s.ch,
        chapter: ctx.chName,
        emoji: ctx.emoji,
        text,
        tone: e.tone || '',
        end: e.end || null,
        foe: ctx.lastFoe || '',
        arena: ctx.lastArena || '',
      });
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
      return clamp(i | 0, 0, n - 1);
    }
    return Math.floor(io.rng() * n) % n;
  }
  S.choose = choose;

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
    },
    train: {
      what: 'training',
      cls: ['Warrior', 'Monk', 'Brawler', 'Gladiator', 'Samurai', 'Knight', 'Duelist', 'Berserker', 'Archer'],
      per: ['Stoic', 'Glory Hound', 'Honourable', 'Ambitious', 'Hot-headed'],
      against: { per: ['Coward', 'Free Spirit', 'Playful'] },
    },
    study: {
      what: 'study',
      cls: ['Mage', 'Sorcerer', 'Alchemist', 'Chronomancer', 'Runesmith', 'Engineer', 'Tactician', 'Witch', 'Warlock'],
      per: ['Scholar', 'Mad Genius', 'Calculating', 'Mastermind', 'Serene'],
      against: { per: ['Hot-headed', 'Thrill Seeker', 'Bloodthirsty'] },
    },
    quest: {
      what: 'the quest',
      cls: ['Ranger', 'Hero of Legend', 'Chosen One', 'Monster Hunter', 'Paladin', 'Knight'],
      per: ['Hero', 'Justice Seeker', 'Kind-hearted', 'Protector', 'Guardian', 'Neutral Good', 'Lawful Good'],
      against: { per: ['Coward', 'Greedy', 'Sadist'] },
    },
    mentor: {
      what: 'learning from a mentor',
      per: ['Scholar', 'Loyal', 'Honourable', 'Serene', 'Kind-hearted', 'Shy'],
      against: { per: ['Arrogant', 'Paranoid', 'Loner'] },
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
    const shown = ents.map(x => Object.assign({}, x, { text: fill(x.text, ctx, L) }));
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
      e = Object.assign({}, e, { text: e.text + ' (' + fit.why.replace(/\.$/, '') + '.)' });
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
  const newArtifact = (rng, kind, dsl, quality) => ({
    name: (kind || pick(ARTIFACT_KIND, rng)) + ' of ' + pick(ARTIFACT_OF, rng),
    dsl,
    quality: quality || 'fine',
  });

  /* shared result sets */
  const WIN_LOOT = [
    good('Glory', 6, 'rt+1', 'Songs are sung about {hero}.'),
    good('A sack of gold', 5, 'fate+1', 'Rich enough to buy your luck.'),
    good('A new ally', 3, '', '{foe} swears to follow you.', {
      fx: (s, L, c) => addAlly(L, c.foe || c.lastFoe, 35 + 30 * c.rng(), 'recruit', 55),
    }),
    good('A strange relic', 2, 'pwr+1', 'You found {art}.', { fx: (s, L, c) => s.artifacts.push(c.newArt) }),
  ];
  const LOSS = [
    bad('Scarred', 8, 'dur-1', 'You survive {foe}, scarred.'),
    bad('Captured', 4, '', 'Held prisoner for a year.', { years: 1 }),
    bad('Humbled', 6, 'int+1', 'You learn more from losing than winning.'),
    bad('Killed', 3, '', 'Slain by {foe} at {arena}.', { end: 'dead' }),
  ];

  /* ---------------- chapters ---------------- */
  const has = (s, k) => !!s[k];
  S.CHAPTERS = [
    {
      id: 'train',
      name: 'Train',
      emoji: '🏋️',
      w: 4.5,
      repeat: true,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'How does training go?',
          fit: 'train',
          hue: 10,
          entries: [
            good('Muscles of iron', 4, 'str+1', 'Months of training: +1 Strength.'),
            good('Lightning footwork', 4, 'spd+1', 'Your feet blur: +1 Speed.'),
            good('Hardened body', 4, 'dur+1', 'Blows bounce off: +1 Durability.'),
            good('Perfect form', 4, 'fgt+1', 'Every move clean: +1 Fighting skills.'),
            good('Weapon drills', 3, 'wpn+1', 'Steel feels like part of your arm.'),
            good('A master takes notice', 1, 'fgt+1 wpn+1', 'A legendary teacher trains you personally.'),
            bad('Training injury', 3, 'spd-1', 'You push too hard and tear something.'),
            E('Plateau', 3, '', 'You train hard. Nothing changes.'),
          ],
        }),
    },
    {
      id: 'study',
      name: 'Study',
      emoji: '📚',
      w: 4,
      repeat: true,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'What do you learn?',
          fit: 'study',
          hue: 210,
          entries: [
            good('Ancient tome', 5, 'int+1', 'Old books, new ideas: +1 Intelligence.'),
            good('Arcane insight', 4, 'pwr+1', 'Your power answers more quickly.'),
            good('Battle strategy', 3, 'int+1 fgt+1', 'You learn to win before the fight.'),
            E('Forbidden spell', 2, 'pwr+2 fate-1', 'Power, at a price.', { tone: 'bad' }),
            bad('Too much knowledge', 2, 'int-1', 'Something you read keeps you awake at night.'),
            E('Nothing sticks', 3, '', 'The books win this time.'),
          ],
        }),
    },
    {
      id: 'treasure',
      name: 'Find treasure',
      emoji: '💰',
      w: 3.5,
      repeat: true,
      run: async (L, io, c) => {
        c.newArt = newArtifact(io.rng, null, 'pwr+1');
        return outcome(L, io, c, {
          title: 'What do you find?',
          hue: 45,
          entries: [
            good('Dragon gold', 5, 'rt+1', 'A hoard fit for a king.'),
            good('A lucky charm', 4, 'fate+1', 'It hums when danger is near.'),
            good('An ancient artifact', 3, 'pwr+1', 'You found {art}.', { fx: s => s.artifacts.push(c.newArt) }),
            good('A legendary weapon', 2, 'wpn+1', 'An old blade that remembers its last owner.'),
            bad('Cursed gold', 3, 'fate-1 rt+1', 'Rich, and very, very unlucky.'),
            bad('It was a mimic', 3, 'dur-1', 'The chest bites back.'),
            E('Empty chest', 3, '', 'Someone got here first.'),
            bad('A deadly trap', 1, '', 'The vault seals behind you.', {
              end: 'dead',
              alive: 'A trap nearly kills you; you crawl out scarred.',
            }),
          ],
        });
      },
    },
    {
      id: 'quest',
      name: 'Do a quest',
      emoji: '🗺️',
      w: 4,
      repeat: true,
      run: async (L, io, c) => {
        const q = await outcome(L, io, c, {
          title: 'What is the quest?',
          hue: 160,
          entries: [
            E('Save a village from raiders', 5, '', 'A village begs for help.'),
            E('Escort a royal caravan', 4, '', 'A caravan needs a guard.'),
            E('Hunt a man-eating beast', 4, '', 'Something hunts in the woods.'),
            E('Recover a stolen relic', 3, '', 'A temple wants its relic back.'),
            E("Break a witch's curse", 3, '', 'A whole town is cursed.'),
          ],
        });
        c.foe =
          {
            'Save a village from raiders': 'the raider chief',
            'Escort a royal caravan': 'the ambushers',
            'Hunt a man-eating beast': 'the beast',
            'Recover a stolen relic': 'the relic thieves',
            "Break a witch's curse": 'the witch',
          }[q.name] || 'the foe';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -12, 8)));
        c.newArt = newArtifact(io.rng, null, 'pwr+1');
        if (r === 'win') return outcome(L, io, c, { title: 'Your reward?', entries: WIN_LOOT });
        if (r === 'lose') return outcome(L, io, c, { title: 'What happens to you?', hue: 0, entries: LOSS });
        return S.apply(L, E('Unfinished', 1, '', 'The quest ends in a stalemate.'), c);
      },
    },
    {
      id: 'dungeon',
      name: 'Explore a dungeon',
      emoji: '🕳️',
      w: 4,
      repeat: true,
      run: async (L, io, c) => {
        c.foe = pick(
          [
            'the Bone Warden',
            'a gelatinous horror',
            'the Lich of the lower vault',
            'a minotaur in the maze',
            'the Spider Matron',
          ],
          io.rng
        );
        const r = await fight(
          L,
          io,
          c,
          foe(c.foe, nearYou(L, io.rng, -6, 14), pick(['a=shadow w=holy', 'a=poison w=fire', 'a=mind', ''], io.rng)),
          { emoji: '🕳️', title: 'Do you survive the dungeon?' }
        );
        c.newArt = newArtifact(io.rng, null, pick(['pwr+1', 'dur+1', 'str+1', 'spd+1'], io.rng));
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'What lies in the deepest room?',
            entries: [
              good('An artifact', 4, '', 'You claim {art}.', {
                fx: s => {
                  s.artifacts.push(c.newArt);
                  L.chron.push({ label: 'Artifact: ' + c.newArt.name, dsl: c.newArt.dsl, text: '', kind: 'story' });
                },
              }),
              good('A forgotten power', 2, 'pwr+2', 'Old magic soaks into you.'),
              good('Treasure', 4, 'rt+1 fate+1', 'Gold, and the story to go with it.'),
              good('A prisoner to free', 2, '', 'You free a prisoner who joins you.', {
                fx: () => addAlly(L, 'the freed prisoner', 40, 'rescued', 80),
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'Trapped in the dark...',
            hue: 0,
            entries: [
              bad('Crawl out wounded', 6, 'dur-1', 'You crawl out of the dungeon bleeding.'),
              bad('Lost for a year', 3, '', 'You are lost in the dark for a year.', { years: 1 }),
              bad('The dungeon claims you', 4, '', 'Your bones join the others in the dark.', { end: 'dead' }),
            ],
          });
        return S.apply(L, E('Retreat', 1, '', 'You retreat before the last room.'), c);
      },
    },
    {
      id: 'boss',
      name: 'Fight a boss',
      emoji: '👹',
      w: 4,
      run: async (L, io, c) => {
        const bosses = S.allBosses(),
          bw = matched(L, bosses);
        const bi = await io.spin({
          emoji: '👹',
          title: 'Which boss do you face?',
          entries: bosses.map((b, k) => E(b.name, bw[k], b.dsl, b.uni + ': ' + (b.perk || ''))),
          mode: 'stripe',
          hue: 0,
          hint: 'Bosses far above you get thinner slices',
        });
        const boss = bosses[bi];
        c.foe = boss.name;
        const r = await fight(L, io, c, boss);
        if (r === 'win') {
          let oe = FW.outcomeEntries(L);
          const MERCY = ['spare', 'recruit', 'befriend', 'heal', 'teach', 'banish', 'imprison'];
          const HARSH = ['kill', 'enslave', 'absorb', 'trophy', 'curse', 'throne', 'imprison', 'banish'];
          const way = await choose(L, io, c, {
            emoji: '🏆',
            title: boss.name + ' is beaten. Mercy?',
            options: [
              { label: 'Show mercy', hint: 'Spare, heal, recruit or teach.' },
              { label: 'No mercy', hint: 'Kill, enslave, curse or take what is theirs.' },
            ],
          });
          const keep = way === 0 ? MERCY : HARSH;
          if (oe.some(x => keep.indexOf(x.key) >= 0)) oe = oe.filter(x => keep.indexOf(x.key) >= 0);
          const oi = await io.spin({
            emoji: '🏆',
            title: 'What do you do to ' + boss.name + '?',
            entries: oe.map(x => E(x.name, x.w, '', x.blurb)),
            mode: 'cat',
            hue: 130,
            hint: 'Your personality changes the slice sizes',
          });
          const ch = FW.applyConsequence(L, 'win', oe[oi].key, boss, io.rng, { arena: c.lastArena, uni: boss.uni });
          const al = L.ally[L.ally.length - 1];
          if (al && al.name === boss.name && al.loyalty == null)
            al.loyalty = { recruit: 55, befriend: 80, enslave: 20 }[oe[oi].key] || 50;
          return S.apply(L, good(oe[oi].name, 1, '', 'You defeat ' + boss.name + '. ' + ch.text), c);
        }
        if (r === 'lose') {
          const de = FW.defeatEntries(L);
          const di = await io.spin({
            emoji: '💀',
            title: 'What happens to you?',
            entries: de.map(x => E(x.name, x.w, '', x.blurb)),
            mode: 'stripe',
            hue: 5,
          });
          if (de[di].key === 'death')
            return S.apply(L, bad('Slain', 1, '', 'Slain by ' + boss.name + '.', { end: 'dead' }), c);
          const ch = FW.applyConsequence(L, 'lose', de[di].key, boss, io.rng, { arena: c.lastArena, uni: boss.uni });
          return S.apply(L, bad(de[di].name, 1, '', 'Beaten by ' + boss.name + '. ' + ch.text), c);
        }
        return S.apply(L, E('Stalemate', 1, '', boss.name + ' withdraws. This is not over.'), c);
      },
    },
    {
      id: 'dragon',
      name: 'Slay a dragon',
      emoji: '🐉',
      w: 3,
      run: async (L, io, c) => {
        const dw = matched(L, DRAGONS);
        const di = await io.spin({
          emoji: '🐉',
          title: 'Which dragon?',
          entries: DRAGONS.map((d, k) => E(d.name, dw[k], d.dsl, 'Power ' + FW.P(d).lv)),
          mode: 'stripe',
          hue: 15,
          hint: 'Dragons far above you get thinner slices',
        });
        const d = DRAGONS[di];
        c.foe = d.name;
        const way = await choose(L, io, c, {
          emoji: '🐉',
          title: d.name + ' wakes. What do you do?',
          options: [
            { label: 'Fight it', hint: 'Win, and the realm never forgets you.' },
            { label: 'Talk to it', hint: 'Dragons are proud and clever. So must you be.' },
            { label: 'Sneak into its hoard', hint: 'Quiet feet and quick hands.' },
          ],
        });
        if (way === 1) {
          const t = await outcome(L, io, c, {
            title: 'Will ' + d.name + ' listen?',
            hue: 35,
            fit: 'dragontalk',
            entries: [
              good('A pact of fire', 2, 'rt+2', '{foe} agrees to fight beside you, for now.', {
                fx: () => addAlly(L, d.name, FW.P(d).lv, 'befriend', 40),
              }),
              good('A gift for your nerve', 3, 'fate+1 rt+1', '{foe} admires your nerve and gives you a gift.'),
              good('Ancient secrets', 2, 'int+1 pwr+1', '{foe} tells you things no human has heard.'),
              bad('It laughs, and attacks', 4, '', '{foe} has heard enough.', { quiet: true }),
            ],
          });
          if (t.name !== 'It laughs, and attacks') return t;
        } else if (way === 2) {
          c.newArt = newArtifact(io.rng, null, 'pwr+1');
          const t = await outcome(L, io, c, {
            title: 'Can you rob ' + d.name + '?',
            hue: 45,
            fit: 'heist',
            entries: [
              good('Rob the hoard', 3, 'rt+1 fate+1', 'You fill your pockets and slip away while {foe} sleeps.'),
              good('Steal its treasure', 1.5, 'pwr+1', 'You steal {art} from under its nose.', {
                fx: s2 => s2.artifacts.push(c.newArt),
              }),
              bad('Burned as you flee', 3, 'dur-1', '{foe} wakes too soon. You escape, burned.'),
              bad('It wakes up', 3, '', '{foe} opens one eye.', { quiet: true }),
            ],
          });
          if (t.name !== 'It wakes up') return t;
        }
        const r = await fight(L, io, c, d, { emoji: '🐉' });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The dragon falls. Now what?',
            entries: [
              good('Dragonslayer', 5, 'rt+3', '{hero} slays {foe}. The realm will never forget.'),
              good('Bathe in its blood', 3, 'dur+2 r=fire', 'Dragon blood hardens your skin.'),
              good('Take its hoard', 3, 'rt+1 fate+2', 'The hoard of {foe} is yours.'),
              good('Spare it and ride it', 2, 'spd+1 rt+2', '{foe} becomes your mount.', {
                fx: () => addAlly(L, d.name, FW.P(d).lv, 'befriend', 65),
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'Dragonfire...',
            hue: 0,
            entries: [
              bad('Burned', 5, 'dur-1 w=fire', 'You carry the burns forever.'),
              bad('Eaten', 4, '', '{foe} swallows {hero} whole.', { end: 'dead' }),
              bad('Flee in shame', 4, 'rt-1', 'You run. Everyone saw.'),
            ],
          });
        return S.apply(L, E('Standoff', 1, '', '{foe} flies off, wounded.'), c);
      },
    },
    {
      id: 'evolve',
      name: 'Evolve',
      emoji: '🧬',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'How do you evolve?',
          hue: 280,
          entries: [
            good('Awakened bloodline', 3, 'all+1', 'Your blood remembers what you are.'),
            good('Second form', 3, 'str+2 dur+1', 'A larger, harder body.'),
            good('Mind ascension', 3, 'int+2 pwr+1', 'You think on a different level.'),
            good('Elemental rebirth', 2, 'pwr+2', 'Raw element flows through you.'),
            E('Become a monster', 2, 'str+2 int-2 w=holy', 'Stronger, and less yourself.', { tone: 'bad' }),
            bad('Failed evolution', 2, 'dur-1', 'The change goes wrong.'),
          ],
        }),
    },
    {
      id: 'artifact',
      name: 'Forge an artifact',
      emoji: '⚒️',
      w: 4,
      run: async (L, io, c) => {
        const k = await outcome(L, io, c, {
          title: 'What do you forge?',
          hue: 30,
          entries: ARTIFACT_KIND.map(n => E(n, 1, '', 'You begin forging a ' + n.toLowerCase() + '.')),
        });
        const q = await io.spin({
          emoji: '⚒️',
          title: 'How well does it turn out?',
          hue: 30,
          mode: 'cat',
          entries: [
            good('Masterpiece', 4, 'pwr+1 fgt+1', ''),
            good('Legendary', 1.5, 'all+1 pwr+1', ''),
            E('Cursed', 2, 'pwr+2 fate-1', '', { tone: 'bad' }),
            E('Ordinary', 3, 'dur+1', ''),
            bad('Shattered in the forge', 1.5, '', ''),
          ],
        });
        const Q = ['Masterpiece', 'Legendary', 'Cursed', 'Ordinary', 'Shattered in the forge'][q],
          dsl = ['pwr+1 fgt+1', 'all+1 pwr+1', 'pwr+2 fate-1', 'dur+1', ''][q];
        if (!dsl) return S.apply(L, bad(Q, 1, '', 'The ' + k.name.toLowerCase() + ' shatters in the forge.'), c);
        const art = newArtifact(io.rng, k.name, dsl, Q.toLowerCase());
        c.art = art.name;
        return S.apply(
          L,
          good(Q, 1, dsl, 'You forge {art} (' + Q.toLowerCase() + ').', {
            tone: Q === 'Cursed' ? 'bad' : 'good',
            fx: s => s.artifacts.push(art),
          }),
          c
        );
      },
    },
    {
      hard: true,
      id: 'kingdom',
      name: 'Forge a kingdom',
      emoji: '🏰',
      w: 4,
      repeat: true,
      req: s => !s.kingdom,
      reqText: 'only if you have no kingdom',
      run: async (L, io, c) => {
        const realm = pick(REALMS, io.rng);
        const r = await outcome(L, io, c, {
          title: 'How do you rule ' + realm + '?',
          hue: 50,
          entries: [
            good('Benevolent ruler', 4, 'fate+1 rt+1', 'You found the kingdom of ' + realm + ' and rule it kindly.'),
            good('Iron fist', 3, 'str+1 rt+2', 'You found ' + realm + ' and rule through fear.'),
            good('Merchant kingdom', 3, 'int+1 fate+1', 'You found ' + realm + ', a kingdom of trade.'),
            good('Holy kingdom', 2, 'holy:all+1 rt+1', 'You found ' + realm + ' in the name of the gods.'),
            good('Mage kingdom', 2, 'pwr+1 int+1', 'You found ' + realm + ', ruled by magic.'),
            good('War kingdom', 3, 'fgt+1 rt+1', 'You found ' + realm + ', built for conquest.'),
          ],
        });
        L.saga.kingdom = { name: realm, style: r.name, power: 50 };
      },
    },
    {
      id: 'conquerRace',
      name: 'Conquer a race',
      emoji: '⚔️',
      w: 3,
      repeat: true,
      req: (s, L) => !!s.kingdom || L.ally.length >= 3,
      reqText: 'needs a kingdom or 3 allies',
      run: async (L, io, c) => {
        const s = L.saga,
          mine = L.raceName();
        const list = FW.RACES.filter(r => r.name !== mine && s.conquered.indexOf(r.name) < 0).map(S.raceFaction);
        const ri = await io.spin({
          emoji: '🗡️',
          title: 'Which race are you at war with?',
          entries: list.map(f => E(f.name, f.w, f.dsl, f.perk)),
          mode: 'cat',
          hue: 0,
        });
        const f = list[ri];
        c.foe = f.name;
        const r = await fight(L, io, c, f, { scale: 'war', title: 'How does the war go?' });
        if (r === 'win') {
          s.conquered.push(f.race);
          loyal(L, 5);
          return outcome(L, io, c, {
            title: 'What do you do with them?',
            hue: 130,
            entries: [
              good('Annex their lands', 5, 'rt+2', '{foe} become part of {kingdom}.'),
              good('Make them allies', 3, 'rt+1', '{foe} join you as allies.', {
                fx: () => addAlly(L, f.name, FW.P(f).lv, 'befriend', 70),
              }),
              E('Enslave them', 2, 'rt+2 fate-1', '{foe} are put in chains.', { tone: 'bad' }),
              good('Learn their secrets', 3, 'int+1 pwr+1', 'You study the magic of {foe}.'),
              E('Wipe them out', 1, 'rt+2 fate-2', 'History will remember what you did to {foe}.', { tone: 'bad' }),
              good('Rule as their god', 1, 'rt+3 fate+1', '{foe} worship {hero}.'),
            ],
          });
        }
        if (r === 'lose') {
          loyal(L, -8);
          return outcome(L, io, c, {
            title: 'The war is lost...',
            hue: 0,
            entries: [
              bad('Retreat', 5, 'rt-1', 'Your army retreats from {foe}.'),
              bad('Allies fall', 3, '', 'Your allies die covering your retreat.', {
                if: (s2, L2) => L2.ally.length > 0,
                fx: () => {
                  L.ally.splice(0, Math.ceil(L.ally.length / 2));
                },
              }),
              bad('Lose territory', 3, '', '{foe} take half of {kingdom}.', {
                if: s2 => !!s2.kingdom,
                fx: s2 => {
                  s2.kingdom.power = Math.max(10, (s2.kingdom.power || 50) - 20);
                },
              }),
              bad('Captured', 2, '', '{foe} keep you prisoner for three years.', { years: 3 }),
              bad('Die on the battlefield', 3, '', '{hero} falls in the war with {foe}.', { end: 'dead' }),
            ],
          });
        }
        return S.apply(L, E('Peace treaty', 1, 'fate+1', 'Neither side can win. You sign a treaty with {foe}.'), c);
      },
    },
    {
      id: 'conquerWorld',
      name: 'Conquer the world',
      emoji: '🌍',
      w: 2,
      req: s => s.conquered.length >= 1,
      reqText: 'needs a conquered race',
      run: async (L, io, c) => {
        const top = S.FACTIONS.filter(f => FW.P(f).lv >= 60);
        const fi = await io.spin({
          emoji: '🌍',
          title: 'Who leads the resistance?',
          entries: top.map(f => E(f.name, 1, f.dsl, f.perk)),
          mode: 'stripe',
          hue: 220,
        });
        const f = top[fi];
        c.foe = f.name;
        const r = await fight(L, io, c, foe(f.name, FW.P(f).lv + 6, f.dsl.replace(/lv=\d+\s*/, '')), {
          scale: 'war',
          title: 'Does the world fall?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'How do you rule the world?',
            hue: 50,
            entries: [
              good('Emperor of all', 4, 'rt+5', '{hero} rules the known world.', { fx: s => (s.world = true) }),
              good('Benevolent unifier', 3, 'rt+3 fate+2', 'You unite the world in peace.', {
                fx: s => (s.world = true),
              }),
              E('Tyrant of the world', 2, 'rt+4 fate-2', 'The whole world kneels in fear.', {
                tone: 'bad',
                fx: s => (s.world = true),
              }),
              good('Give the crown away', 1, 'fate+3', 'You win the world and give it back.', {
                fx: s => (s.world = true),
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The world fights back...',
            hue: 0,
            entries: [
              bad('Executed by the alliance', 4, '', '{foe} execute {hero} in front of the world.', { end: 'dead' }),
              bad('Empire crumbles', 3, 'rt-2', 'Your empire falls apart.', {
                fx: s => {
                  s.kingdom = null;
                  s.conquered = [];
                },
              }),
              bad('Exiled to the edge of the world', 3, '', 'You are exiled to the edge of the world.', { years: 5 }),
            ],
          });
        return S.apply(L, E('Cold war', 1, '', 'The world splits in two, half of it yours.'), c);
      },
    },
    {
      id: 'guild',
      name: 'Join a guild',
      emoji: '🛡️',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Which guild takes you in?',
          hue: 200,
          entries: [
            good("Adventurers' Guild", 4, 'fgt+1', "You join the Adventurers' Guild.", {
              fx: s => (s.guild = "Adventurers' Guild"),
            }),
            good("Mages' Circle", 3, 'pwr+1', "You join the Mages' Circle.", { fx: s => (s.guild = "Mages' Circle") }),
            good("Thieves' Guild", 3, 'spd+1', "You join the Thieves' Guild.", {
              fx: s => (s.guild = "Thieves' Guild"),
            }),
            good("Assassins' Order", 2, 'fgt+1 dark:all+1', "You join the Assassins' Order.", {
              fx: s => (s.guild = "Assassins' Order"),
            }),
            good("Merchants' League", 3, 'fate+1', "You join the Merchants' League.", {
              fx: s => (s.guild = "Merchants' League"),
            }),
            bad('Kicked out', 2, 'rt-1', 'No guild will have you.'),
          ],
        }),
    },
    {
      id: 'tournament',
      name: 'Win a tournament',
      emoji: '🏆',
      w: 3,
      run: async (L, io, c) => {
        c.foe = pick(
          [
            'Sir Aldous the Undefeated',
            'the masked champion',
            'Gorran Two-Axes',
            "the Emperor's duelist",
            'Lyra Swiftblade',
          ],
          io.rng
        );
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -4, 12)), {
          emoji: '🏆',
          title: 'Do you win the final?',
        });
        if (r === 'win')
          return S.apply(L, good('Champion', 1, 'rt+2 fgt+1', '{hero} wins the grand tournament against {foe}.'), c);
        return outcome(L, io, c, {
          title: 'You lose the final...',
          hue: 0,
          entries: [
            bad('Humbled', 5, 'int+1', '{foe} wins. You learn from it.'),
            bad('Injured', 3, 'spd-1', 'A bad fall in the final.'),
            bad('A fatal blow', 1, '', 'An accident in the arena. {hero} does not get up.', { end: 'dead' }),
          ],
        });
      },
    },
    {
      id: 'rescue',
      name: 'Rescue someone',
      emoji: '🆘',
      w: 3,
      run: async (L, io, c) => {
        const who = await outcome(L, io, c, {
          title: 'Who needs rescuing?',
          hue: 190,
          entries: [
            E('A captured prince', 3, '', 'A prince is held for ransom.'),
            E('Your old village', 4, '', 'Your old village is under attack.'),
            E('A lost child', 3, '', 'A child is lost in the haunted woods.'),
            E('A god in chains', 1, '', 'A god is chained beneath a mountain.'),
            E('A stranger', 3, '', 'A stranger screams for help.'),
          ],
        });
        c.foe = 'the captors';
        c.ally = { name: who.name.replace(/^A |^Your /, 'the ').toLowerCase() };
        const r = await fight(L, io, c, foe('the captors', nearYou(L, io.rng, -10, 10)));
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'Saved! What happens next?',
            entries: [
              good('A lifelong friend', 4, '', '{ally} becomes your loyal companion.', {
                fx: () => addAlly(L, c.ally.name, who.name === 'A god in chains' ? 90 : 35, 'rescued', 90),
              }),
              good('A reward', 4, 'rt+1 fate+1', 'You are rewarded handsomely.'),
              good(
                'A blessing',
                who.name === 'A god in chains' ? 4 : 1,
                'all+1 fate+1',
                'The one you saved blesses you.'
              ),
            ],
          });
        return S.apply(L, bad('Too late', 1, 'fate-1', 'You arrive too late. You carry it forever.'), c);
      },
    },
    {
      id: 'love',
      name: 'Find love',
      emoji: '💞',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Who wins your heart?',
          hue: 330,
          entries: [
            good('A fellow adventurer', 4, 'fate+1', 'You fall in love on the road.', {
              fx: s => {
                s.love = 'a fellow adventurer';
                addAlly(L, 'your beloved', 40, 'love', 95);
              },
            }),
            good('A noble', 3, 'rt+1 fate+1', 'You marry into nobility.', { fx: s => (s.love = 'a noble') }),
            good('A former enemy', 2, 'fgt+1', 'Love, after many fights.', { fx: s => (s.love = 'a former enemy') }),
            good('A spirit of the forest', 1, 'pwr+1', 'A love not quite of this world.', {
              fx: s => (s.love = 'a forest spirit'),
            }),
            good('A dragon in disguise', 0.6, 'str+1 r=fire', 'Your beloved turns out to be a dragon.', {
              fx: s => (s.love = 'a dragon in disguise'),
            }),
            bad('Unrequited', 3, 'int+1', 'They never feel the same way.'),
          ],
        }),
    },
    {
      id: 'heir',
      name: 'Have an heir',
      emoji: '👶',
      w: 3,
      run: async (L, io, c) => {
        const n = pick(HEIRS, io.rng);
        return outcome(L, io, c, {
          title: 'Is an heir born?',
          hue: 50,
          entries: [
            good('A son', 4, 'fate+1', 'Your son ' + n + ' is born.', { fx: s => (s.heir = { name: n, kind: 'son' }) }),
            good('A daughter', 4, 'fate+1', 'Your daughter ' + n + ' is born.', {
              fx: s => (s.heir = { name: n, kind: 'daughter' }),
            }),
            good('Twins', 1.5, 'fate+2', 'Twins! The eldest is ' + n + '.', {
              fx: s => (s.heir = { name: n, kind: 'twin' }),
            }),
            good('An adopted orphan', 2, 'fate+1', 'You adopt ' + n + ', an orphan of the war.', {
              fx: s => (s.heir = { name: n, kind: 'adopted child' }),
            }),
            good('A child of prophecy', 0.8, 'rt+2', n + ' is born under a falling star.', {
              fx: s => (s.heir = { name: n, kind: 'prophesied child', blessed: true }),
            }),
            bad('No heir comes', 3, '', 'The years pass without an heir.'),
          ],
        });
      },
    },
    {
      id: 'apprentice',
      name: 'Take an apprentice',
      emoji: '🧑‍🎓',
      w: 2,
      run: async (L, io, c) => {
        const n = pick(HEIRS, io.rng);
        return outcome(L, io, c, {
          title: 'What is your apprentice like?',
          hue: 120,
          entries: [
            good('A prodigy', 2, 'rt+1', n + ' learns everything you teach, and fast.', {
              fx: () => addAlly(L, n + ' (apprentice)', 45, 'apprentice', 80),
            }),
            good('Loyal to the end', 3, '', n + ' would die for you.', {
              fx: () => addAlly(L, n + ' (apprentice)', 30, 'apprentice', 95),
            }),
            E('A traitor in waiting', 2, '', n + ' smiles a little too much.', {
              fx: () => addAlly(L, n + ' (apprentice)', 40, 'apprentice', 15),
            }),
            good('Teaching teaches you', 3, 'int+1', 'Teaching ' + n + ' sharpens your own skills.'),
          ],
        });
      },
    },
    {
      hard: true,
      id: 'betrayal',
      name: 'Betrayed by an ally',
      emoji: '🗡️',
      w: 3,
      opt: 'loyalty',
      req: (s, L) => L.ally.length > 0,
      reqText: 'needs an ally',
      run: async (L, io, c) => {
        const a = lowestLoyal(L, io.rng);
        if (!a)
          return S.apply(L, E('Suspicion', 1, 'int+1', 'You suspect everyone. There is no one to betray you.'), c);
        c.ally = a;
        const lo = a.loyalty == null ? 60 : a.loyalty;
        return outcome(L, io, c, {
          title: 'What does ' + a.name + ' do?',
          hue: 0,
          entries: [
            bad('Stab you in the back', 1 + (100 - lo) / 25, 'dur-1', '{ally} stabs you in the back and flees.', {
              fx: () => removeAlly(L, a),
            }),
            bad('Steal an artifact', 2, '', '{ally} steals your artifact and vanishes.', {
              if: s => s.artifacts.length > 0,
              fx: s => {
                s.artifacts.pop();
                removeAlly(L, a);
              },
            }),
            bad('Join your nemesis', 1 + (100 - lo) / 40, '', '{ally} joins {nem}.', {
              if: s => s.nem && s.nem.alive,
              fx: s => {
                s.nem.lv += 5;
                removeAlly(L, a);
              },
            }),
            good('You saw it coming', 2, 'int+1', 'You catch {ally} before the knife lands.', {
              fx: () => removeAlly(L, a),
            }),
            good(
              'A misunderstanding',
              lo / 30,
              'fate+1',
              'It was a misunderstanding. {ally} is more loyal than ever.',
              {
                fx: () => {
                  a.loyalty = clamp(lo + 25, 0, 100);
                },
              }
            ),
            bad('A poisoned cup', 0.6, '', '{ally} poisons {hero}.', { end: 'dead' }),
          ],
        });
      },
    },
    {
      hard: true,
      id: 'nemesis',
      name: 'Your nemesis strikes',
      emoji: '😈',
      w: 4,
      repeat: true,
      opt: 'nemesis',
      req: s => !!(s.nem && s.nem.alive && !s.nem.ally),
      hideLocked: true,
      run: async (L, io, c) => {
        const s = L.saga,
          n = s.nem;
        n.met++;
        n.lv = Math.round(clamp(Math.max(n.lv, FW.compute(L).baseRating - 2) + 2, 20, 99));
        c.foe = n.name;
        const r = await fight(L, io, c, foe(n.name, n.lv), { emoji: '😈', title: n.name + ' attacks! Do you win?' });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'What becomes of ' + n.name + '?',
            choice: {
              title: n.name + ' is beaten. What do you do?',
              options: [
                {
                  label: 'Finish them',
                  hint: 'End it, if they let you.',
                  keep: ['Nemesis slain', 'Badly wounded', 'Flees, swearing revenge'],
                  boost: { 'Nemesis slain': 2 },
                },
                {
                  label: 'Show mercy',
                  hint: 'Mercy can make an enemy think.',
                  keep: ['You spare them', 'Flees, swearing revenge', 'Joins your side'],
                  boost: { 'You spare them': 1.5 },
                },
                {
                  label: 'Offer them a place at your side',
                  hint: 'Old enemies make fierce friends, or worse traitors.',
                  keep: ['Joins your side', 'You spare them', 'Flees, swearing revenge'],
                  boost: { 'Joins your side': 3 },
                },
              ],
            },
            entries: [
              good('Flees, swearing revenge', 5, 'rt+1', '{nem} flees, swearing revenge.', {
                fx: () => {
                  n.lv += 3;
                },
              }),
              good('Badly wounded', 3, 'rt+1', '{nem} will carry your mark.', {
                fx: () => {
                  n.lv -= 6;
                },
              }),
              good('You spare them', 2, 'fate+1', 'You spare {nem}. They hate you for it.'),
              good('Nemesis slain', 2, 'rt+2', 'You end {nem} for good.', {
                fx: () => {
                  n.alive = false;
                },
              }),
              good('Joins your side', 0.8, 'rt+1', '{nem} finally kneels and joins you.', {
                fx: () => {
                  n.ally = true;
                  addAlly(L, n.name, n.lv, 'befriend', 45);
                },
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: n.name + ' wins...',
            hue: 0,
            entries: [
              bad('Steals an artifact', 3, '', '{nem} takes your artifact.', {
                if: s2 => s2.artifacts.length > 0,
                fx: s2 => {
                  s2.artifacts.pop();
                  n.lv += 2;
                },
              }),
              bad('Seizes your kingdom', 2, 'rt-2', '{nem} takes {kingdom} from you.', {
                if: s2 => !!s2.kingdom,
                fx: s2 => {
                  s2.kingdom = null;
                  n.lv += 4;
                },
              }),
              bad('Scarred', 4, 'dur-1', '{nem} leaves you a scar to remember.'),
              bad('Kills a companion', 2, '', '{nem} kills one of your companions.', {
                if: (s2, L2) => L2.ally.length > 0,
                fx: () => {
                  L.ally.pop();
                },
              }),
              bad('Killed by your nemesis', 2, '', '{nem} finally kills {hero}.', { end: 'dead' }),
            ],
          });
        return S.apply(L, E('Stalemate', 1, '', 'You and {nem} fight to a standstill.'), c);
      },
    },
    {
      hard: true,
      id: 'showdown',
      name: 'Final showdown',
      emoji: '🔥',
      w: 3,
      opt: 'nemesis',
      req: s => !!(s.nem && s.nem.alive && !s.nem.ally && s.nem.met >= 2),
      reqText: 'meet your nemesis twice first',
      run: async (L, io, c) => {
        const n = L.saga.nem;
        c.foe = n.name;
        const r = await fight(L, io, c, foe(n.name, n.lv + 6), { emoji: '🔥', title: 'The final duel with ' + n.name });
        if (r === 'win') {
          n.alive = false;
          return S.apply(
            L,
            good('The long war ends', 1, 'all+1 rt+3', '{hero} destroys {nem} in the final showdown.'),
            c
          );
        }
        if (r === 'lose')
          return S.apply(
            L,
            bad('Defeated at the end', 1, '', '{nem} wins the final showdown. {hero} falls.', {
              end: 'dead',
              alive: '{nem} wins and leaves you broken, but alive.',
            }),
            c
          );
        return S.apply(L, E('No winner', 1, '', 'Both of you walk away. Neither will ever forget.'), c);
      },
    },
    {
      id: 'rival',
      name: 'A rival appears',
      emoji: '😠',
      w: 3,
      notOpt: 'nemesis',
      run: async (L, io, c) => {
        c.foe = pick(NEMESES, io.rng);
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -6, 10)));
        return S.apply(
          L,
          r === 'win'
            ? good('Rival beaten', 1, 'rt+1', 'You beat your rival {foe}.')
            : r === 'lose'
              ? bad('Rival wins', 1, 'fgt+1', '{foe} beats you. You train twice as hard.')
              : E('Even match', 1, '', 'You and {foe} are perfectly matched.'),
          c
        );
      },
    },
    {
      id: 'curse',
      name: 'Cursed',
      emoji: '🧿',
      w: 1.5,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'What is the curse?',
          hue: 270,
          entries: [
            bad('Curse of weakness', 3, 'str-1', 'Your strength drains away.'),
            bad('Curse of misfortune', 3, 'fate-1', 'Nothing goes right anymore.'),
            E('Lycanthropy', 2, 'dark:str+2 sun:all-1', 'You become a beast under the moon.', { tone: 'bad' }),
            E('Cursed blood', 2, 'pwr+1 w=holy', 'Dark power, holy pain.', { tone: 'bad' }),
            good('Curse broken', 3, 'fate+1', 'You break the curse before it takes hold.'),
            good('The curse becomes power', 1, 'pwr+2', 'You turn the curse into a weapon.'),
            bad('Withering curse', 1, '', 'The curse eats you from the inside.', {
              end: 'dead',
              alive: 'The curse nearly kills you.',
            }),
            bad(
              'Undying',
              0.7,
              '',
              '{hero} dies, and the curse will not let them stay dead. They rise again, cold and changed.',
              { end: 'undying', alive: 'You die for a moment, and come back a little colder.' }
            ),
          ],
        }),
    },
    {
      id: 'exile',
      name: 'Exiled',
      emoji: '🚪',
      w: 1.2,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Exiled! What happens?',
          hue: 25,
          entries: [
            bad('Lose your kingdom', 3, '', 'You are driven out of {kingdom}.', {
              if: s => !!s.kingdom,
              fx: s => {
                s.kingdom = null;
              },
            }),
            good('Hardened by the wastes', 3, 'dur+1', 'The wastes make you tougher.', { years: 2 }),
            good('An army of exiles', 2, 'rt+1', 'Other exiles gather around you.', {
              fx: () => addAlly(L, 'the exile army', 50, 'befriend', 70),
            }),
            E('Bitter and alone', 3, 'int+1 fate-1', 'You spend years alone with your thoughts.', {
              years: 4,
              tone: 'bad',
            }),
            good('A new home', 3, 'fate+1', 'You find a new home far away.'),
          ],
        }),
    },
    {
      id: 'plague',
      name: 'Plague',
      emoji: '☠️',
      w: 2,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'The plague comes...',
          hue: 90,
          entries: [
            good('Immune', 3, 'r=poison', 'The plague passes you by.'),
            bad('Survive, scarred', 4, 'dur-1', 'You survive, but it leaves its mark.'),
            bad('Lose a companion', 2, '', 'The plague takes one of your companions.', {
              if: (s, L2) => L2.ally.length > 0,
              fx: () => {
                L.ally.pop();
              },
            }),
            good('Heal the sick', 2, 'fate+1 rt+1', 'You nurse a city back to health.'),
            bad('Your kingdom suffers', 2, 'rt-1', '{kingdom} loses a third of its people.', { if: s => !!s.kingdom }),
            bad('Die of plague', 2, '', 'The plague takes {hero}.', { end: 'dead' }),
          ],
        }),
    },
    {
      hard: true,
      id: 'rebellion',
      name: 'Rebellion in your kingdom',
      emoji: '🔥',
      w: 3,
      req: s => !!s.kingdom,
      reqText: 'needs a kingdom',
      run: async (L, io, c) => {
        c.foe = 'the rebels';
        const r = await fight(L, io, c, foe('the rebels of ' + L.saga.kingdom.name, nearYou(L, io.rng, -10, 8)), {
          scale: 'war',
          title: 'Can you crush the rebellion?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The rebels are beaten. Now what?',
            entries: [
              good('Show mercy', 3, 'fate+1', 'You pardon the rebels. {kingdom} loves you for it.'),
              E('Make an example', 3, 'rt+2 fate-1', 'You hang the leaders at the gates.', { tone: 'bad' }),
              good('Hear their demands', 2, 'int+1', 'You listen, and change {kingdom} for the better.'),
            ],
          });
        return outcome(L, io, c, {
          title: 'The rebels win...',
          hue: 0,
          entries: [
            bad('Overthrown', 4, 'rt-2', 'You lose {kingdom} to the rebels.', {
              fx: s => {
                s.kingdom = null;
              },
            }),
            bad('Flee the capital', 3, 'rt-1', 'You flee your own capital.'),
            bad('Beheaded', 2, '', 'The rebels behead {hero}.', { end: 'dead' }),
          ],
        });
      },
    },
    {
      id: 'otherworld',
      name: 'Journey to another world',
      emoji: '🌀',
      w: 2,
      run: async (L, io, c) => {
        const ui = await io.spin({
          emoji: '🌀',
          title: 'Which world?',
          entries: FW.UNIVERSES.map(u => E(u.name, 1, '', u.blurb)),
          mode: 'cat',
          hue: 260,
        });
        c.foe = FW.UNIVERSES[ui].name;
        return outcome(L, io, c, {
          title: 'What happens in ' + FW.UNIVERSES[ui].name + '?',
          hue: 260,
          entries: [
            good('Return stronger', 3, 'all+1', 'You return from {foe} stronger.'),
            good('Bring back a power', 2, 'pwr+2', 'You bring back a power from {foe}.'),
            bad('Trapped for twenty years', 2, '', 'You are trapped in {foe} for twenty years.', { years: 20 }),
            good('Bring back a friend', 2, '', 'Someone from {foe} follows you home.', {
              fx: () => addAlly(L, 'a traveller from ' + FW.UNIVERSES[ui].name, 55, 'befriend', 75),
            }),
            bad('Lose your memories', 2, 'int-1', 'You come back without your memories.'),
            E('Never return', 1, '', '{hero} never comes back from {foe}.', { end: 'lost' }),
          ],
        });
      },
    },
    {
      id: 'religion',
      name: 'Found a religion',
      emoji: '⛪',
      w: 2,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'How does your faith spread?',
          hue: 50,
          entries: [
            good('Thousands of followers', 3, 'rt+2', 'Thousands follow your teachings.'),
            good('Worshipped as a god', 1.5, 'rt+2 fate+1', 'Your followers call you divine.'),
            E('Holy war', 2, 'holy:all+1 rt+1 fate-1', 'Your faith starts a holy war.', { tone: 'bad' }),
            bad('Heresy hunters', 2, 'w=holy', 'The old churches hunt you.'),
            bad('Nobody believes', 3, '', 'Nobody believes a word.'),
          ],
        }),
    },
    {
      id: 'ascend',
      name: 'Ascend to godhood',
      emoji: '✨',
      w: 1.5,
      run: async (L, io, c) => {
        c.foe = 'the trial of the gods';
        const r = await fight(L, io, c, foe('the trial of the gods', 82, 'a=holy,time'), {
          emoji: '✨',
          title: 'Do you pass the trial of the gods?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The heavens open...',
            hue: 50,
            entries: [
              good('Become a god', 2, 'all+2 pwr+2', '{hero} ascends and becomes a god.', { end: 'ascended' }),
              good('Demigod', 3, 'all+1 pwr+1', 'Half-way to the heavens, and staying here.'),
            ],
          });
        return outcome(L, io, c, {
          title: 'You fail the trial...',
          hue: 0,
          entries: [
            bad('Struck down', 3, '', 'The gods strike {hero} down for daring.', { end: 'dead' }),
            bad('Cast out', 4, 'fate-1', 'The gods throw you back to the world.'),
            bad('Burned by divinity', 3, 'dur-1 w=holy', 'Divine fire scars your soul.'),
          ],
        });
      },
    },
    {
      id: 'loseAll',
      name: 'Lose everything',
      emoji: '🌪️',
      w: 1.5,
      run: async (L, io, c) =>
        S.apply(
          L,
          bad(
            'Everything is gone',
            1,
            'behind:all+2',
            'You lose your home, your treasures and your friends. Nothing left to lose.',
            {
              fx: s => {
                s.kingdom = null;
                s.artifacts = [];
                L.ally.splice(0);
              },
            }
          ),
          c
        ),
    },
    {
      id: 'timeSkip',
      name: 'Years pass',
      emoji: '⏳',
      w: 3,
      repeat: true,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Ten quiet years. How do they change you?',
          hue: 100,
          entries: [
            good('Wiser', 3, 'int+1', 'You grow wiser.', { years: 10 }),
            bad('Rusty', 3, 'fgt-1', 'You grow rusty.', { years: 10 }),
            good('Settled', 3, 'fate+1', 'You settle down for a while.', { years: 10 }),
            good('Your legend grows', 2, 'rt+1', 'Stories about you keep spreading.', { years: 10 }),
          ],
        }),
    },

    /* ---- story arcs: a chapter starts a thread (saga.flags) and later chapters, hidden until then, carry it on ---- */
    // the prophecy: oracle -> signs -> it comes true (or you defy it)
    {
      id: 'oracle',
      name: 'Visit an oracle',
      emoji: '🔮',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'What does the oracle foretell?',
          hue: 270,
          entries: [
            E('A crown awaits you', 3, 'fate+1', '"You will wear a crown that no one gives you," says the oracle.', {
              fx: s => {
                s.flags.prophecy = { kind: 'crown', stage: 1 };
              },
            }),
            E('You will save the world', 3, 'rt+1', '"When the sky breaks, you alone will stand," says the oracle.', {
              fx: s => {
                s.flags.prophecy = { kind: 'savior', stage: 1 };
              },
            }),
            E(
              'A friend will betray you',
              2,
              'int+1',
              '"The hand you trust most will hold the knife," says the oracle.',
              {
                tone: 'bad',
                fx: s => {
                  s.flags.prophecy = { kind: 'betrayal', stage: 1 };
                },
              }
            ),
            E(
              'You will become a legend',
              2,
              '',
              '"You will become a story, and the story will outlive you," says the oracle.',
              {
                fx: s => {
                  s.flags.prophecy = { kind: 'legend', stage: 1 };
                },
              }
            ),
            bad('The oracle sees nothing', 2, 'fate-1', 'The oracle looks at you, goes pale and says nothing at all.'),
          ],
        }),
    },
    {
      hard: true,
      hideLocked: true,
      id: 'omen',
      name: 'Signs of the prophecy',
      emoji: '🌠',
      w: 20,
      req: s => !!(s.flags.prophecy && s.flags.prophecy.stage === 1),
      run: async (L, io, c) => {
        const p = L.saga.flags.prophecy,
          next = () => {
            p.stage = 2;
          };
        return outcome(L, io, c, {
          title: 'The prophecy stirs. What do you see?',
          hue: 270,
          entries: [
            good('A sign in the sky', 3, 'fate+1', 'A comet crosses the sky, just as the oracle said.', { fx: next }),
            good('Strangers know your name', 3, 'rt+1', 'People you have never met whisper about the prophecy.', {
              fx: next,
            }),
            E('You try to run from it', 2, 'spd+1', 'You try to outrun your fate. Every road leads back.', {
              fx: next,
            }),
            bad('A false prophet', 2, 'fate-1', 'Someone else claims your prophecy and raises an army.', {
              fx: () => {
                next();
                p.rival = true;
              },
            }),
          ],
        });
      },
    },
    {
      hard: true,
      hideLocked: true,
      id: 'fate',
      name: 'The prophecy comes true',
      emoji: '📜',
      w: 25,
      req: s => !!(s.flags.prophecy && s.flags.prophecy.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga,
          p = s.flags.prophecy;
        p.stage = 3;
        const done = () => {
          s.flags.fulfilled = true;
        };
        const defy = good('Defy the prophecy', 2, 'fate+2', 'You refuse your fate and write your own.');
        if (p.kind === 'betrayal') {
          const a = lowestLoyal(L, io.rng);
          if (!a)
            return S.apply(
              L,
              good(
                'No one left to betray you',
                1,
                'fate+1',
                'The prophecy waits for a friend you never made. It never comes true.'
              ),
              c
            );
          c.ally = a;
          return outcome(L, io, c, {
            title: 'The knife comes from {ally}. What happens?'.replace('{ally}', a.name),
            hue: 0,
            entries: [
              bad('The betrayal', 3, 'dur-1', '{ally} betrays you, just as the oracle said.', {
                fx: () => {
                  removeAlly(L, a);
                  done();
                },
              }),
              good('You forgive them', 2, 'fate+1', 'You forgive {ally}. The prophecy breaks in your hands.', {
                fx: () => {
                  a.loyalty = 100;
                },
              }),
              E('You strike first', 2, 'rt+1 fate-1', 'You strike {ally} down before the knife can fall.', {
                tone: 'bad',
                fx: () => {
                  removeAlly(L, a);
                },
              }),
              defy,
              bad('The knife finds you', 0.6, '', '{ally} kills {hero}, just as the oracle said.', {
                end: 'dead',
                fx: done,
              }),
            ],
          });
        }
        if (p.kind === 'legend')
          return outcome(L, io, c, {
            title: 'Your story is everywhere. Do you become it?',
            hue: 50,
            entries: [
              good('Pass into legend', 2, 'rt+3', 'One morning {hero} is simply gone. The songs say they never died.', {
                end: 'legend',
                fx: done,
              }),
              good('Live up to the songs', 3, 'rt+2 fate+1', 'You become the hero the songs describe.', { fx: done }),
              defy,
            ],
          });
        c.foe = p.rival ? 'the false prophet' : p.kind === 'crown' ? 'the old dynasty' : 'the breaking sky';
        const r = await fight(
          L,
          io,
          c,
          foe(
            c.foe,
            p.kind === 'savior' ? Math.max(70, nearYou(L, io.rng, 4, 14)) : nearYou(L, io.rng, -2, 12),
            p.kind === 'savior' ? 'a=void,lightning w=holy' : ''
          ),
          { emoji: '📜', scale: p.kind === 'crown' ? 'war' : 'duel', title: 'Does the prophecy come true?' }
        );
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The prophecy is fulfilled. Now what?',
            hue: 50,
            entries:
              p.kind === 'crown'
                ? [
                    good('Crowned as foretold', 4, 'rt+2', 'You take the crown, as the oracle said.', {
                      fx: s2 => {
                        done();
                        if (!s2.kingdom) s2.kingdom = { name: pick(REALMS, io.rng), style: 'Prophesied', power: 55 };
                      },
                    }),
                    good(
                      'Ride into legend',
                      1.5,
                      'rt+3',
                      '{hero} takes the crown, rules for a day and rides away into legend.',
                      { end: 'fulfilled', fx: done }
                    ),
                  ]
                : [
                    good(
                      'The world is saved',
                      4,
                      'rt+3 fate+1',
                      '{hero} stands alone when the sky breaks, and the world is saved.',
                      { fx: done }
                    ),
                    good(
                      'Ride into legend',
                      1.5,
                      'rt+3',
                      '{hero} saves the world and walks off into the sunrise, a prophecy fulfilled.',
                      { end: 'fulfilled', fx: done }
                    ),
                  ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The prophecy goes wrong...',
            hue: 0,
            entries: [
              bad('A broken prophecy', 4, 'fate-2', 'The prophecy breaks, and so does something in you.'),
              bad('Fulfilled at a price', 2, 'dur-1', 'It comes true, but not the way anyone hoped.', { fx: done }),
              bad(
                'Die so it comes true',
                p.kind === 'savior' ? 2 : 0.6,
                '',
                '{hero} gives their life, and the prophecy comes true without them.',
                { end: 'martyr', fx: done }
              ),
            ],
          });
        return S.apply(
          L,
          E('Not yet', 1, '', 'The day comes and goes. Maybe the oracle was wrong.', {
            fx: () => {
              p.stage = 2;
            },
          }),
          c
        );
      },
    },
    // the demon pact: power now, the bill later
    {
      id: 'pact',
      name: 'Bargain with a demon',
      emoji: '🩸',
      w: 2,
      run: async (L, io, c) => {
        const sign = s => {
          s.flags.pact = { stage: 1 };
        };
        return outcome(L, io, c, {
          title: 'A demon offers you a deal. What do you ask for?',
          hue: 0,
          entries: [
            E('Power beyond measure', 3, 'pwr+2 all+1', 'You sign in blood. Power floods in.', {
              tone: 'bad',
              fx: sign,
            }),
            E('A crown', 2, 'rt+2', 'You sign, and wake up on a throne.', {
              tone: 'bad',
              if: s => !s.kingdom,
              fx: s => {
                sign(s);
                s.kingdom = { name: pick(REALMS, io.rng), style: 'Demon-given', power: 50 };
              },
            }),
            E('Youth', 2, 'dur+1', 'You sign, and thirty years fall away from you.', {
              tone: 'bad',
              fx: s => {
                sign(s);
                s.years = Math.max(0, s.years - 30);
              },
            }),
            E('Luck', 2, 'fate+3', 'You sign. Coins land your way from now on.', { tone: 'bad', fx: sign }),
            good('Refuse', 3, 'fate+1', 'You tear up the contract. The demon laughs and leaves.'),
          ],
        });
      },
    },
    {
      hard: true,
      hideLocked: true,
      repeat: true,
      id: 'debt',
      name: 'The demon comes to collect',
      emoji: '👿',
      w: 15,
      req: s => !!(s.flags.pact && s.flags.pact.stage === 1),
      run: async (L, io, c) => {
        const d = L.saga.flags.pact;
        d.stage = 2;
        c.foe = 'the demon';
        const how = await outcome(L, io, c, {
          title: 'The demon wants its due. What happens?',
          hue: 0,
          choice: {
            title: 'The demon wants its due. What do you do?',
            options: [
              { label: 'Refuse and fight', hint: 'No more deals. Steel and fire.', keep: ['Fight the demon'] },
              {
                label: 'Pay what you owe',
                hint: 'A treasure, years of your life, or worse.',
                keep: ['Pay with a treasure', 'Pay with years', 'Pay with your soul'],
              },
              {
                label: 'Look for a loophole',
                hint: 'A sharp mind can twist a contract. A dull one gets damned.',
                keep: ['Find a loophole', 'Pay with years', 'Pay with your soul'],
                boost: { 'Find a loophole': 2.5 },
                fit: 'cunning',
              },
            ],
          },
          entries: [
            E('Fight the demon', 4, '', 'You refuse to pay.', { quiet: true }),
            bad('Pay with a treasure', 2, '', 'You pay with your finest artifact.', {
              if: s => s.artifacts.length > 0,
              fx: s => {
                s.artifacts.pop();
              },
            }),
            bad('Pay with years', 2, '', 'The demon takes twenty years of your life.', { years: 20 }),
            good('Find a loophole', 1.5, 'int+1 rt+1', 'You find a loophole in the contract. The demon howls.', {
              fx: s => {
                s.flags.cheated = true;
              },
            }),
            bad('Pay with your soul', 1, '', 'The demon drags {hero} below.', {
              end: 'damned',
              alive: 'The demon tries to take your soul, and gets only part of it.',
            }),
          ],
        });
        if (how.name !== 'Fight the demon') return how;
        const r = await fight(
          L,
          io,
          c,
          foe('the demon', Math.max(60, nearYou(L, io.rng, 0, 14)), 'a=fire,shadow w=holy'),
          { emoji: '👿', title: 'Can you beat the demon?' }
        );
        if (r === 'win')
          return S.apply(
            L,
            good('Contract burned', 1, 'rt+2', 'You beat the demon and burn the contract.', {
              fx: s => {
                s.flags.cheated = true;
              },
            }),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The demon wins...',
            hue: 0,
            entries: [
              bad('Dragged below', 2, '', 'The demon drags {hero} below.', {
                end: 'damned',
                alive: 'The demon drags you halfway below before you claw your way back.',
              }),
              bad('The debt doubles', 3, 'fate-2', 'The demon lets you go, and doubles what you owe.', {
                fx: () => {
                  d.stage = 1;
                },
              }),
              bad('Marked', 3, 'w=holy', 'The demon brands you as its own.'),
            ],
          });
        return S.apply(
          L,
          E('It will be back', 1, '', 'The demon fades, smiling. It will be back.', {
            fx: () => {
              d.stage = 1;
            },
          }),
          c
        );
      },
    },
    // the sealed evil: seal weakens -> it wakes -> the world needs a hero
    {
      id: 'seal',
      name: 'The ancient seal weakens',
      emoji: '🗝️',
      w: 2,
      run: async (L, io, c) => {
        const stir = s => {
          s.flags.seal = { stage: 1 };
        };
        return outcome(L, io, c, {
          title: 'Something old stirs beneath the world. How do you notice?',
          hue: 250,
          entries: [
            bad('The dead walk', 3, 'dur-1', 'The dead rise from their graves and walk toward the old mountain.', {
              fx: stir,
            }),
            E('Strange dreams', 3, 'int+1', 'Every night you dream of a door, and something knocking.', { fx: stir }),
            bad('A cult rises', 2, 'fate-1', 'A cult gathers in the hills, chanting a name no one should know.', {
              fx: stir,
            }),
            good(
              'You mend the seal',
              2,
              'fate+1 pwr+1',
              'You find the cracking seal and mend it before anything gets out.'
            ),
          ],
        });
      },
    },
    {
      hard: true,
      hideLocked: true,
      id: 'awaken',
      name: 'The evil awakens',
      emoji: '👁️',
      w: 20,
      req: s => !!(s.flags.seal && s.flags.seal.stage === 1),
      run: async (L, io, c) => {
        L.saga.flags.seal.stage = 2;
        c.foe = 'the Herald of the Sleeper';
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -2, 12), 'a=void,shadow w=holy'), {
          emoji: '👁️',
          title: 'The Herald comes for you. Do you win?',
        });
        if (r === 'win')
          return S.apply(
            L,
            good('Herald slain', 1, 'rt+1 fgt+1', 'You cut down the Herald. The Sleeper stirs anyway.'),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The Herald wins...',
            hue: 0,
            entries: [
              bad('Darkness spreads', 4, 'fate-1', 'The Herald walks on, and the sky grows dark.'),
              bad('Slain by the Herald', 2, '', 'The Herald of the Sleeper kills {hero}.', { end: 'dead' }),
            ],
          });
        return S.apply(
          L,
          E('The Herald withdraws', 1, '', 'The Herald withdraws into the dark, to wake its master.'),
          c
        );
      },
    },
    {
      hard: true,
      hideLocked: true,
      id: 'lastStand',
      name: 'The world needs a hero',
      emoji: '🌑',
      w: 25,
      req: s => !!(s.flags.seal && s.flags.seal.stage === 2),
      run: async (L, io, c) => {
        const s = L.saga;
        s.flags.seal.stage = 3;
        c.foe = 'the Sleeper beneath the world';
        const r = await fight(L, io, c, foe(c.foe, 88, 'a=void,shadow,mind w=holy'), {
          scale: 'war',
          emoji: '🌑',
          title: 'The Sleeper wakes. Can the world be saved?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The Sleeper falls. What becomes of you?',
            hue: 50,
            entries: [
              good('The evil is destroyed', 4, 'all+1 rt+4', '{hero} destroys the Sleeper beneath the world.', {
                fx: s2 => {
                  s2.flags.evilSlain = true;
                },
              }),
              good(
                'Pass into legend',
                1,
                'rt+4',
                '{hero} destroys the Sleeper and vanishes in the light. The songs never stop.',
                {
                  end: 'legend',
                  fx: s2 => {
                    s2.flags.evilSlain = true;
                  },
                }
              ),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The Sleeper is too strong...',
            hue: 0,
            entries: [
              bad('Seal it with your life', 3, '', '{hero} gives their life to seal the Sleeper away again.', {
                end: 'sealed',
                alive: 'You seal the Sleeper away again, and it nearly costs you everything.',
              }),
              bad('Fall so others can flee', 2, '', '{hero} holds the Sleeper back long enough for the world to run.', {
                end: 'martyr',
                alive: 'You hold the Sleeper back until everyone escapes, and crawl out last.',
              }),
              bad(
                'The world falls into shadow',
                2,
                'fate-2 rt-2',
                'The Sleeper walks the world. You live on, in the dark.'
              ),
            ],
          });
        return S.apply(L, E('It sleeps again', 1, 'fate+1', 'The Sleeper sinks back beneath the world. For now.'), c);
      },
    },
    // the heir grows up
    {
      hard: true,
      hideLocked: true,
      id: 'heirGrown',
      name: 'Your heir comes of age',
      emoji: '🧒',
      w: 8,
      req: s => !!(s.heir && !s.heir.grown),
      run: async (L, io, c) => {
        const s = L.saga,
          h = s.heir;
        h.grown = true;
        const lv = nearYou(L, io.rng, -12, 4);
        return outcome(L, io, c, {
          title: h.name + ' is grown. Who have they become?',
          hue: 50,
          entries: [
            good('A worthy heir', 4, 'fate+1', '{heir} grows up strong and fights at your side.', {
              fx: () => addAlly(L, h.name + ' (your heir)', lv, 'family', 95),
            }),
            good('Greater than you', 1.5, 'rt+1', '{heir} becomes greater than you ever were.', {
              fx: () => {
                h.blessed = true;
                addAlly(L, h.name + ' (your heir)', lv + 12, 'family', 90);
              },
            }),
            bad('A bitter rival', 2, 'fate-1', '{heir} turns against you and leaves in anger.', {
              fx: () => {
                h.rival = true;
              },
            }),
            E('Off on their own adventure', 2, '', '{heir} leaves home to write their own story.'),
            E('Takes your throne', 2, '', '{heir} takes the throne of {kingdom}. You step aside.', {
              if: s2 => !!s2.kingdom,
              end: 'retired',
            }),
          ],
        });
      },
    },

    /* ---- more chapters ---- */
    {
      id: 'siege',
      name: 'Defend a city',
      emoji: '🏯',
      w: 3,
      run: async (L, io, c) => {
        const f = pick(S.FACTIONS.slice(0, 16), io.rng);
        c.foe = f.name;
        const r = await fight(L, io, c, foe(f.name, nearYou(L, io.rng, -8, 10), f.dsl.replace(/lv=\d+\s*/, '')), {
          scale: 'war',
          emoji: '🏯',
          title: 'Does the city hold?',
        });
        if (r === 'win')
          return outcome(L, io, c, {
            title: 'The siege is broken. What now?',
            entries: [
              good(
                'Hero of the walls',
                4,
                'fgt+1 rt+1',
                'The city sings of the day {hero} held the walls against {foe}.'
              ),
              good('The city stands', 3, 'rt+2', 'You break the siege of {foe}.'),
              good('Made lord of the city', 1.5, 'rt+1', 'The grateful city makes you its lord.', {
                if: s => !s.kingdom,
                fx: s => {
                  s.kingdom = { name: pick(REALMS, io.rng), style: 'City-state', power: 40 };
                },
              }),
            ],
          });
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The walls fall...',
            hue: 0,
            entries: [
              bad('The city falls', 4, 'rt-1 fate-1', '{foe} take the city.'),
              bad('Taken prisoner', 2, '', '{foe} keep you prisoner for two years.', { years: 2 }),
              bad(
                'Hold the gate to the last',
                2,
                '',
                '{hero} holds the gate so the people can flee, and does not leave it.',
                { end: 'martyr', alive: 'You hold the gate until the last refugee is out, and somehow live.' }
              ),
            ],
          });
        return S.apply(L, E('The siege is lifted', 1, 'fate+1', '{foe} give up and march away.'), c);
      },
    },
    {
      id: 'voyage',
      name: 'Sail the open sea',
      emoji: '⛵',
      w: 3,
      repeat: true,
      run: async (L, io, c) => {
        const e = await outcome(L, io, c, {
          title: 'What happens at sea?',
          fit: 'sea',
          hue: 200,
          entries: [
            good('Discover a new land', 3, 'rt+1 int+1', 'You find a coast that is on no map.'),
            good('Pirate treasure', 3, 'fate+1 rt+1', "You find a pirate's buried treasure."),
            E('A kraken rises', 3, '', 'Something huge rises from the deep.', { quiet: true }),
            bad('Shipwrecked', 3, 'dur-1', 'Shipwrecked on a nameless island for a year.', { years: 1 }),
            good("A mermaid's gift", 1.5, 'pwr+1 r=water', 'A mermaid gives you a pearl that hums with the sea.'),
            bad('Sail off the map', 0.4, '', '{hero} sails past the edge of the map and is never seen again.', {
              end: 'lost',
            }),
          ],
        });
        if (e.name !== 'A kraken rises') return e;
        c.foe = 'the kraken';
        const r = await fight(L, io, c, foe('the kraken', nearYou(L, io.rng, -2, 14), 'a=water r=water w=lightning'), {
          emoji: '🐙',
          title: 'Can you beat the kraken?',
        });
        if (r === 'win')
          return S.apply(
            L,
            good('Kraken slayer', 1, 'str+1 rt+2', 'You slay the kraken. Sailors will tell this one forever.'),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The kraken drags the ship down...',
            hue: 0,
            entries: [
              bad('Barely survive', 4, 'dur-1', 'You wash up on a beach, half-drowned.'),
              bad('Dragged into the deep', 2, '', 'The kraken drags {hero} into the deep.', { end: 'dead' }),
            ],
          });
        return S.apply(L, E('The kraken sinks away', 1, '', 'The kraken sinks back into the dark water.'), c);
      },
    },
    {
      id: 'heist',
      name: 'Pull off a heist',
      emoji: '💎',
      w: 3,
      run: async (L, io, c) => {
        const thief = L.saga.guild === "Thieves' Guild";
        c.newArt = newArtifact(io.rng, null, 'pwr+1');
        return outcome(L, io, c, {
          title: 'How does the heist go?',
          fit: 'heist',
          hue: 280,
          hint: thief ? "The Thieves' Guild is helping you" : '',
          entries: [
            good('A perfect heist', thief ? 5 : 2, 'rt+1 fate+1', 'In and out. Nobody even knows it happened.'),
            good('Steal a famous artifact', 2, 'pwr+1', 'You steal {art}.', { fx: s => s.artifacts.push(c.newArt) }),
            bad('Caught red-handed', thief ? 1 : 3, 'rt-1', "Caught! Two years in the king's dungeon.", { years: 2 }),
            bad('Double-crossed', 2, 'fate-1', 'Your partner runs off with the loot.'),
            E('Rob a king', 1, 'rt+2 fate-1', 'You rob a king. Now a king wants you dead.', { tone: 'bad' }),
          ],
        });
      },
    },
    {
      id: 'haunted',
      name: 'Haunted',
      emoji: '👻',
      w: 2.5,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'A ghost follows you. What does it want?',
          fit: 'haunted',
          hue: 180,
          entries: [
            good('Lay it to rest', 3, 'fate+1', 'You finish what the ghost could not, and it finally rests.'),
            good('A ghostly companion', 1.5, '', 'The ghost decides to stay with you.', {
              fx: () => addAlly(L, 'a restless ghost', 45, 'befriend', 60),
            }),
            good('Secrets of the dead', 2, 'pwr+1 r=shadow', 'The ghost teaches you what the dead know.'),
            bad('Driven half mad', 2, 'int-1', 'The whispers never stop.'),
            E('Possessed', 2, 'pwr+1 fate-1', 'Something else shares your body now.', { tone: 'bad' }),
            E('The ghost is you', 1, 'int+1', 'The ghost wears your face, from a life you have forgotten.'),
          ],
        }),
    },
    {
      id: 'mentor',
      name: 'Meet a mentor',
      emoji: '🧙',
      w: 3,
      run: async (L, io, c) =>
        outcome(L, io, c, {
          title: 'Who takes you under their wing?',
          fit: 'mentor',
          hue: 120,
          entries: [
            good('A master of the blade', 3, 'fgt+1 wpn+1', 'An old swordmaster teaches you everything.'),
            good('An old archmage', 3, 'pwr+1 int+1', 'An archmage shares secrets older than kingdoms.'),
            good('A retired hero', 2, 'rt+1 fate+1', 'A retired hero takes up the sword again, for you.', {
              fx: () => addAlly(L, 'your old mentor', 60, 'befriend', 85),
            }),
            E('Dies in your arms', 2, 'all+1', 'Your mentor dies, and leaves you everything they knew.', {
              tone: 'bad',
            }),
            E(
              'A dark secret',
              1.5,
              'pwr+1 fate-1',
              'Your mentor taught you well. Then you learn what they really were.',
              { tone: 'bad' }
            ),
          ],
        }),
    },
    {
      id: 'duel',
      name: 'A duel of honour',
      emoji: '🤺',
      w: 3,
      repeat: true,
      run: async (L, io, c) => {
        c.foe = pick(
          [
            'Count Verano',
            'a scarred knight',
            'the Duchess of Blades',
            'an insulted wizard',
            'a young hothead',
            'Sir Gideon the Grey',
          ],
          io.rng
        );
        const r = await fight(L, io, c, foe(c.foe, nearYou(L, io.rng, -6, 10)), {
          emoji: '🤺',
          title: 'Who wins the duel?',
        });
        if (r === 'win') return S.apply(L, good('Honour satisfied', 1, 'rt+1 fgt+1', 'You beat {foe} at dawn.'), c);
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'You lose the duel...',
            hue: 0,
            entries: [
              bad('Yield', 4, 'rt-1', 'You yield to {foe}.'),
              bad('Wounded', 3, 'dur-1', '{foe} leaves you bleeding in the grass.'),
              bad('Killed in the duel', 1, '', '{foe} kills {hero} at dawn.', { end: 'dead' }),
            ],
          });
        return S.apply(L, good('Respect earned', 1, 'fate+1', 'Neither of you falls. You part as friends.'), c);
      },
    },
    {
      hard: true,
      id: 'succession',
      name: 'War of succession',
      emoji: '⚜️',
      w: 3,
      req: s => !!(s.kingdom && s.heir),
      reqText: 'needs a kingdom and an heir',
      run: async (L, io, c) => {
        c.foe = 'the pretender';
        const r = await fight(L, io, c, foe('the pretender', nearYou(L, io.rng, -8, 8)), {
          scale: 'war',
          emoji: '⚜️',
          title: 'A cousin claims the throne of ' + L.saga.kingdom.name + '. Who wins?',
        });
        if (r === 'win')
          return S.apply(
            L,
            good(
              'Your line is secure',
              1,
              'rt+2 fate+1',
              '{heir} will rule {kingdom} after you. No one doubts it now.'
            ),
            c
          );
        if (r === 'lose')
          return outcome(L, io, c, {
            title: 'The pretender wins...',
            hue: 0,
            entries: [
              bad('The pretender takes the throne', 4, 'rt-2', 'The pretender takes {kingdom}.', {
                fx: s => {
                  s.kingdom = null;
                },
              }),
              bad('Your heir flees', 3, 'fate-1', '{heir} has to flee the country.'),
              bad('Die defending your heir', 1.5, '', '{hero} dies so that {heir} can escape.', {
                end: 'martyr',
                alive: 'You hold the pretender off long enough for {heir} to escape, and barely live.',
              }),
            ],
          });
        return S.apply(
          L,
          E('The kingdom splits', 1, '', '{kingdom} splits in two.', {
            tone: 'bad',
            fx: s => {
              s.kingdom.power = Math.max(10, (s.kingdom.power || 50) - 20);
            },
          }),
          c
        );
      },
    },
    {
      id: 'found',
      name: 'Found a city',
      emoji: '🏛️',
      w: 2,
      run: async (L, io, c) => {
        const city = pick(
          ['Brightharbor', 'Stonebridge', 'Ashford', 'Duskhaven', 'Goldmere', 'Highwatch', 'Lanternfall', 'Saltmarch'],
          io.rng
        );
        return outcome(L, io, c, {
          title: 'You found ' + city + '. What does it become?',
          hue: 40,
          entries: [
            good('A thriving city', 3, 'rt+2', city + ' grows rich and proud.', {
              fx: s => {
                s.flags.city = city;
              },
            }),
            good('An academy of heroes', 2, 'int+1 fgt+1', city + ' becomes a school for heroes.', {
              fx: s => {
                s.flags.city = city;
              },
            }),
            good('A haven for outcasts', 2, 'fate+1', city + ' takes in everyone no one else wants.', {
              fx: s => {
                s.flags.city = city;
                addAlly(L, 'the people of ' + city, 40, 'befriend', 90);
              },
            }),
            E(
              'A city of thieves',
              1.5,
              'spd+1 fate-1',
              city + ' becomes the best place in the world to buy stolen things.',
              {
                tone: 'bad',
                fx: s => {
                  s.flags.city = city;
                },
              }
            ),
            bad('A ghost town', 2, 'rt-1', 'Nobody comes. ' + city + ' stays empty.'),
          ],
        });
      },
    },

    {
      id: 'retire',
      name: 'Retire',
      emoji: '🌅',
      w: 1,
      repeat: true,
      retire: true,
      run: async (L, io, c) =>
        L.saga.ch >= 12 && io.rng() < 0.2
          ? S.apply(
              L,
              good(
                'Passed into legend',
                1,
                '',
                'One morning {hero} walks into the mist and is never seen again. The songs never stop.',
                { end: 'legend' }
              ),
              c
            )
          : S.apply(L, good('Retired', 1, '', '{hero} lays down their weapons and retires.', { end: 'retired' }), c),
    },
  ];
  S.CHAPTER_BY_ID = {};
  S.CHAPTERS.forEach(ch => (S.CHAPTER_BY_ID[ch.id] = ch));

  /* ---------------- the story wheel ---------------- */
  S.retireWeight = function (L, o) {
    const s = L.saga || { ch: 0 };
    let w = 0.8 + 0.25 * s.ch;
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
        bad('Dies peacefully in their sleep', risk * 2, '', '{hero} dies peacefully of old age at ' + a + '.', {
          end: 'dead',
          alive: 'Your body is failing. You retire at last.',
        }),
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
    const ents = S.wheelEntries(L, o, ov);
    const i = await io.spin({
      kind: 'story',
      emoji: '📖',
      title: 'Chapter ' + (s.ch + 1) + ': what happens next?',
      entries: ents,
      mode: 'cat',
      hue: 30,
      hint: 'Grey slices are done or locked',
    });
    const ch = S.CHAPTER_BY_ID[ents[i].id];
    s.ch++;
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
    if (!s.end && o.aging && S.isOld(L) && io.rng() < 0.5) await oldAge(L, io, Object.assign({}, c));
    if (s.end && !o.dynasty) s.heir = s.heir || null;
    return ch;
  };

  /* ---------------- dynasty: what the heir inherits ---------------- */
  // endings that leave nothing behind (no body, no grave, no throne to pass on) end the family line too
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
      dsl: best + '+1' + (s.heir && s.heir.blessed ? ' fate+1' : '') + (s.world ? ' rt+2' : s.kingdom ? ' rt+1' : ''),
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
})(typeof window !== 'undefined' ? window : globalThis);
