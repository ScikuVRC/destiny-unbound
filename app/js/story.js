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
    }
    if (o.nemesis && !s.nem) s.nem = S.makeNemesis(L, rng);
    L.saga = s;
    return s;
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
  S.apply = function (L, ent, ctx) {
    const s = L.saga,
      o = ctx.o;
    let e = ent;
    const mortal = S.MORTAL[e.end];
    if (S.MORTAL[e.end] && o.death && ctx.rng && ctx.rng() < (s.ch <= S.YOUNG_SAGA ? S.YOUNG_SAVE : S.LATE_SAVE))
      e = Object.assign({}, e, {
        end: null,
        dsl: 'dur-1',
        text: e.alive || S.CLOSE_CALLS,
        tone: 'bad',
      });
    if (S.MORTAL[e.end] && !o.death)
      e = Object.assign({}, e, {
        end: null,
        dsl: 'dur-1',
        text: e.alive || S.CLOSE_CALLS,
        tone: 'bad',
      });
    // cheated death: counted for the recap and for heroes who come back in later sagas
    if (mortal && !e.end) {
      s.flags = s.flags || {};
      s.flags.cheated = (s.flags.cheated || 0) + 1;
    }
    if (e.dsl) L.chron.push({ label: ctx.chName + ': ' + e.name, dsl: e.dsl, text: '', kind: 'story', key: ctx.ch });
    if (e.fx) e.fx(s, L, ctx);
    if (e.years) s.years += e.years;
    const text = fill(S.vary(e.text || e.name, L, s.ch + ':' + e.name), ctx, L);
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
  S.CHAPTER_FILES = ['quests', 'power', 'people', 'fortune', 'arcs', 'world'];
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
      fights: { total: F.w + F.l + F.d, won: F.w, lost: F.l, draw: F.d },
      closest: F.closest || null,
      upset: F.upset || null,
      heartbreak: F.heartbreak || null,
      cheated: (s.flags && s.flags.cheated) || 0,
      oldLegend: (s.flags && s.flags.oldLegend) || '',
      timeline: keep,
      family: S.familyTree(L),
      heir: s.heir ? s.heir.name + ' (' + s.heir.kind + ')' : '',
      love: s.love || '',
      kingdom: s.world ? 'the world' : s.kingdom ? s.kingdom.name : '',
      artifacts: (s.artifacts || []).map(a => a.name).filter(Boolean),
      conquered: (s.conquered || []).slice(),
    };
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
