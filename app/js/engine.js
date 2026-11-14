/* Destiny Unbound engine - pure logic (no DOM). Works in browser and node. */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const STATS = FW.STATS,
    COMBAT = FW.COMBAT_STATS,
    LAD = FW.LADDERS;

  /* ---------- RNG (seedable) ---------- */
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    };
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  FW.makeRng = function (seed) {
    if (seed == null) seed = String(Math.random()) + Date.now();
    return mulberry32(xmur3(String(seed))());
  };
  FW.randomSeed = function () {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  };

  /* ---------- DSL ---------- */
  const STAT_RE = /^(all|str|spd|dur|int|fgt|wpn|pwr)([+-]\d+)$/;
  function addMod(mods, key, d) {
    if (key === 'all') COMBAT.forEach(s => (mods[s] = (mods[s] || 0) + d));
    else mods[key] = (mods[key] || 0) + d;
  }
  function parseMods(str) {
    const mods = {};
    str.split(',').forEach(t => {
      const m = STAT_RE.exec(t);
      if (!m) throw new Error('bad mod "' + t + '"');
      addMod(mods, m[1], parseInt(m[2], 10));
    });
    return mods;
  }
  const _cache = new Map();
  FW.parse = function (dsl) {
    dsl = dsl || '';
    if (_cache.has(dsl)) return _cache.get(dsl);
    const p = {
      mods: {},
      conds: [],
      weak: [],
      res: [],
      atk: [],
      fate: 0,
      hs: null,
      life: null,
      q: 0,
      rar: 0,
      tt: 0,
      rt: 0,
      lv: null,
      none: false,
      o: {},
    };
    dsl
      .split(/\s+/)
      .filter(Boolean)
      .forEach(tok => {
        tok = tok.replace(/^@/, '');
        let m;
        if (tok === 'none') p.none = true;
        else if ((m = STAT_RE.exec(tok))) addMod(p.mods, m[1], parseInt(m[2], 10));
        else if ((m = /^(dark|sun|water|storm|void|fire|ice|holy|wild|urban|behind|ahead):(.+)$/.exec(tok)))
          p.conds.push({ env: m[1], mods: parseMods(m[2]) });
        else if ((m = /^w=(.+)$/.exec(tok))) p.weak.push(...m[1].split(','));
        else if ((m = /^r=(.+)$/.exec(tok))) p.res.push(...m[1].split(','));
        else if ((m = /^a=(.+)$/.exec(tok))) p.atk.push(...m[1].split(','));
        else if ((m = /^fate([+-]\d+)$/.exec(tok))) p.fate += parseInt(m[1], 10);
        else if ((m = /^rt([+-]\d+)$/.exec(tok))) p.rt += parseInt(m[1], 10);
        else if ((m = /^hs=([\d.]+)$/.exec(tok))) p.hs = parseFloat(m[1]);
        else if ((m = /^life=([smla])$/.exec(tok))) p.life = m[1];
        else if ((m = /^q=([1-5])$/.exec(tok))) p.q = parseInt(m[1], 10);
        else if ((m = /^rar=([1-6])$/.exec(tok))) p.rar = parseInt(m[1], 10);
        else if ((m = /^tt=([1-3])$/.exec(tok))) p.tt = parseInt(m[1], 10);
        else if ((m = /^lv=(\d+)$/.exec(tok))) p.lv = parseInt(m[1], 10);
        else if ((m = /^o\.(\w+)\*([\d.]+)$/.exec(tok))) p.o[m[1]] = parseFloat(m[2]);
        else throw new Error('bad DSL token "' + tok + '" in "' + dsl + '"');
      });
    _cache.set(dsl, p);
    return p;
  };
  const P = (FW.P = e => FW.parse(e ? e.dsl : ''));

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  FW.cap = cap;
  function modText(mods) {
    const vals = COMBAT.map(s => mods[s] || 0);
    const parts = [];
    let rest = Object.assign({}, mods);
    if (vals[0] !== 0 && vals.every(v => v === vals[0])) {
      parts.push((vals[0] > 0 ? '+' : '−') + Math.abs(vals[0]) + ' ALL');
      COMBAT.forEach(s => delete rest[s]);
    }
    STATS.forEach(s => {
      const d = rest[s];
      if (d) parts.push((d > 0 ? '+' : '−') + Math.abs(d) + ' ' + LAD[s].short);
    });
    return parts.join(', ');
  }
  const sumMods = m => Object.values(m).reduce((a, b) => a + b, 0);
  /* chips for a parsed entry -> [{t, k}] k: buff | debuff | cond-buff | cond-debuff | info */
  FW.chips = function (p) {
    const out = [];
    const flat = modText(p.mods);
    flat
      .split(', ')
      .filter(Boolean)
      .forEach(t => out.push({ t, k: t[0] === '+' ? 'buff' : 'debuff' }));
    p.conds.forEach(c => {
      const t = cap(FW.ENV_LABEL[c.env]) + ': ' + modText(c.mods);
      out.push({ t, k: sumMods(c.mods) >= 0 ? 'cond-buff' : 'cond-debuff', cond: true });
    });
    if (p.fate)
      out.push({ t: (p.fate > 0 ? '+' : '−') + Math.abs(p.fate) + ' Fate Token', k: p.fate > 0 ? 'buff' : 'debuff' });
    if (p.rt) out.push({ t: (p.rt > 0 ? '+' : '−') + Math.abs(p.rt) + ' Renown', k: p.rt > 0 ? 'buff' : 'debuff' });
    p.weak.forEach(w => out.push({ t: 'Weak to ' + cap(w), k: 'debuff' }));
    p.res.forEach(w => out.push({ t: 'Resists ' + cap(w), k: 'buff' }));
    p.atk.forEach(w => out.push({ t: cap(w) + ' attacks', k: 'info' }));
    if (p.hs && p.hs !== 1) out.push({ t: 'Height ×' + p.hs, k: 'info' });
    out.forEach(c => (c.tip = FW.chipTip(c.t)));
    return out;
  };
  /* A plain-language explanation of a chip, shown when the player hovers or taps it. */
  const STAT_WORD = { STR: 'Strength', SPD: 'Speed', DUR: 'Durability', INT: 'Intelligence', FGT: 'Fighting' };
  Object.assign(STAT_WORD, { WPN: 'Weapon skill', PWR: 'Power skill', ALL: 'every fighting stat' });
  // "+1 FGT" -> "Fighting 1 tier up" (on its ladder); in a fight, "Fighting 1 tier higher"
  function shiftTip(part, fight) {
    const m = /^([+−-])(\d+) ([A-Z]+)$/.exec(part.trim());
    if (!m) return '';
    const n = +m[2],
      up = m[1] === '+',
      what = STAT_WORD[m[3]] || m[3],
      tiers = n + (n === 1 ? ' tier' : ' tiers');
    return what + ' ' + tiers + (fight ? (up ? ' higher' : ' lower') : up ? ' up' : ' down');
  }
  FW.chipTip = function (t) {
    let m;
    if ((m = /^(.+?): (.+)$/.exec(t)))
      return (
        'Only in a fight ' +
        m[1].toLowerCase() +
        ': ' +
        m[2]
          .split(', ')
          .map(x => shiftTip(x, true))
          .join(', ') +
        '. Dashed chips count only in a matching arena or moment.'
      );
    if (/^[+−-]\d+ Fate Token/.test(t)) return 'Fate Tokens let you re-spin a result you dislike.';
    if (/^[+−-]\d+ Renown$/.test(t)) return 'Renown adds straight to your power rating.';
    if ((m = /^Weak to (.+)$/.exec(t)))
      return 'Foes who attack with ' + m[1] + ' have a much better chance against you.';
    if ((m = /^Resists (.+)$/.exec(t))) return 'Foes who attack with ' + m[1] + ' have a worse chance against you.';
    if ((m = /^(.+) attacks$/.exec(t)))
      return 'You fight with ' + m[1] + ': better odds against foes weak to it, worse against foes who resist it.';
    if (/^Height ×/.test(t)) return 'How tall you are compared with a human.';
    const parts = t.split(', ').map(x => shiftTip(x, false));
    return parts.every(Boolean) ? 'Moves your result on the ladder: ' + parts.join(', ') + '.' : '';
  };

  /* ---------- ladders ---------- */
  function ladderBase(n, pk, decay) {
    const w = [],
      d = decay || 0.8;
    for (let i = 0; i < n; i++) w.push(Math.max(0.02, i <= pk ? 0.55 + 0.45 * (i / pk) : Math.pow(d, i - pk)));
    return w;
  }
  FW.ladderBase = ladderBase;
  FW.applyTier = function (stat, raw, bonus) {
    const n = LAD[stat].names.length;
    let v = raw + bonus,
      over = 0,
      under = 0;
    if (v > n - 1) {
      over = v - (n - 1);
      v = n - 1;
    }
    if (v < 0) {
      under = -v;
      v = 0;
    }
    return { idx: v, over, under, name: LAD[stat].names[v], raw, bonus };
  };
  const lvlOf = (stat, t) => (t ? Math.min(115, ((t.idx + t.over) / (LAD[stat].names.length - 1)) * 100) : 0);
  FW.lvlOf = lvlOf;

  /* ---------- heights ---------- */
  FW.fmtHeight = function (inch) {
    if (inch < 12) return Math.max(1, Math.round(inch)) + ' in';
    if (inch < 144) {
      let ft = Math.floor(inch / 12),
        r = Math.round(inch - ft * 12);
      if (r === 12) {
        ft++;
        r = 0;
      }
      return ft + "'" + r + '"';
    }
    const ft = Math.round(inch / 12);
    return ft.toLocaleString('en-US') + ' ft';
  };
  FW.heightClass = inch => FW.HEIGHT_CLASSES.find(c => inch < c.max);

  /* ---------- stage definitions ---------- */
  FW.STAGES = [
    { id: 'race', emoji: '🧝', title: "What's your Race?" },
    { id: 'sub', emoji: '🧬', title: 'Which kind?', optional: true },
    { id: 'birth', emoji: '🏰', title: "Where's your Birthplace?" },
    { id: 'age', emoji: '⏳', title: "What's your Age?" },
    { id: 'height', emoji: '📏', title: "What's your Height?", mystery: true },
    { id: 'hair', emoji: '💇', title: "What's your Hair?", look: true, optional: true },
    { id: 'eyes', emoji: '👀', title: 'What are your Eyes like?', look: true },
    { id: 'garb', emoji: '🧥', title: 'What do you wear?', look: true },
    { id: 'bg', emoji: '📜', title: "What's your Background?" },
    { id: 'per', emoji: '🎭', title: "What's your Personality?" },
    { id: 'cls', emoji: '🎓', title: "What's your Class?" },
    { id: 'str', emoji: '💪', title: "What's your Strength?", ladder: 'str' },
    { id: 'spd', emoji: '⚡', title: "What's your Speed?", ladder: 'spd' },
    { id: 'dur', emoji: '🛡️', title: "What's your Durability?", ladder: 'dur', mystery: true },
    { id: 'int', emoji: '🧠', title: "What's your Intelligence?", ladder: 'int' },
    { id: 'wpn', emoji: '🗡️', title: "What's your Weapon?" },
    { id: 'wpnm', emoji: '⚔️', title: "What's your Weapon mastery?", ladder: 'wpn', optional: true },
    { id: 'fgt', emoji: '🥋', title: "What's your Fighting skills?", ladder: 'fgt' },
    { id: 'enh', emoji: '🔥', title: 'Any Enhancement?' },
    { id: 'elem', emoji: '🌀', title: "What's your Element?" },
    { id: 'pow', emoji: '✨', title: "What's your Power?" },
    { id: 'powm', emoji: '🔮', title: "What's your Power mastery?", ladder: 'pwr', optional: true },
    { id: 'weak', emoji: '💔', title: "What's your Weakness?" },
    { id: 'pet', emoji: '🐾', title: 'Any Companion?' },
    { id: 'title', emoji: '👑', title: "What's your Title?" },
    { id: 'mark', emoji: '🌠', title: 'Does Fate mark you?' },
  ];
  FW.STAGE_BY_ID = {};
  FW.STAGES.forEach(s => (FW.STAGE_BY_ID[s.id] = s));
  const LISTS = {
    race: () => FW.RACES,
    birth: () => FW.BIRTH,
    bg: () => FW.BACKGROUNDS,
    per: () => FW.PERSONALITIES,
    wpn: () => FW.WEAPONS,
    enh: () => FW.ENHANCEMENTS,
    pow: () => FW.POWERS,
    weak: () => FW.WEAKNESSES,
    title: () => FW.TITLES,
    mark: () => FW.MARKS,
    cls: () => FW.CLASSES || [],
    elem: () => FW.ELEMENTS || [],
    pet: () => FW.PETS || [],
    hair: () => FW.HAIR || [],
    eyes: () => FW.EYES || [],
    garb: () => FW.GARB || [],
  };
  /* stages added after the first release: optional in old Legend Codes */
  FW.NEW_STAGES = ['hair', 'eyes', 'garb', 'cls', 'elem', 'pet'];
  FW.LISTS = LISTS;
  FW.findByName = (list, name) => list.find(e => e.name === name);

  /* ---------- Legend ---------- */
  class Legend {
    constructor(opts) {
      opts = opts || {};
      this.luck = opts.luck || 'heroic';
      this.seed = opts.seed || FW.randomSeed();
      this.picks = {}; // stageId -> {name} | {idx} | {name, years} | {inches}
      this.chron = []; // post-fight effects [{label, dsl, text}]
      this.ally = [];
      this.tokensUsed = 0;
      this.imageData = null;
      this.name = opts.name || ''; // optional hero name
      this.pres = opts.pres || ''; // presentation: '', 'masc', 'fem', 'andro'
      this.chosen = []; // stage ids the player picked by hand
      this.saga = null; // story mode state (story.js)
    }
    displayName() {
      return this.name || this.pickName('title') || 'The Nameless';
    }
    luckInfo() {
      return FW.LUCK.find(l => l.id === this.luck) || FW.LUCK[1];
    }
    entry(id) {
      const p = this.picks[id];
      if (!p || !p.name) return null;
      let e = null;
      if (id === 'sub') {
        const r = this.raceName();
        const s = FW.SUBS[r];
        e = s ? FW.findByName(s.rows, p.name) : null;
      } else if (id === 'age')
        e = FW.findByName(FW.AGES, p.name) || FW.findByName(FW.AGES, (FW.AGE_ALIAS || {})[p.name]);
      else {
        const L = LISTS[id];
        e = L ? FW.findByName(L(), p.name) : null;
      }
      // custom Workshop entries have no data row: treat them as neutral flavour
      return e || { name: p.name, w: 1, dsl: '', perk: 'Custom entry', flaw: '', custom: true };
    }
    raceName() {
      return this.picks.race ? this.picks.race.name : null;
    }
    has(id) {
      return !!this.picks[id];
    }
    pickName(id) {
      return this.picks[id] && this.picks[id].name;
    }
    isNone(id) {
      const e = this.entry(id);
      return !e || FW.P(e).none;
    }
    stageApplies(id) {
      if (id === 'sub') return !!(this.raceName() && FW.SUBS[this.raceName()]);
      if (id === 'hair') return !((FW.HAIRLESS || []).indexOf(this.raceName()) >= 0);
      if (id === 'wpnm') return this.has('wpn') && !this.isNone('wpn');
      if (id === 'powm') return this.has('pow') && !this.isNone('pow');
      return true;
    }
    heightClass() {
      return this.picks.height ? FW.heightClass(this.picks.height.inches) : null;
    }
    /* ordered list of {label, kind, p} */
    sources() {
      const out = [];
      const add = (label, kind, p) => out.push({ label, kind, p });
      const e = id => this.entry(id);
      let x;
      if ((x = e('race'))) add('Race: ' + x.name, 'race', FW.P(x));
      if ((x = e('sub'))) add(this.pickName('sub'), 'race', FW.P(x));
      if ((x = e('birth'))) add('Birthplace: ' + x.name, 'birth', FW.P(x));
      if ((x = e('age'))) add('Age: ' + x.name, 'age', FW.P(x));
      if ((x = this.heightClass()) && x.dsl) add('Height: ' + x.name, 'height', FW.parse(x.dsl));
      if ((x = e('hair')) && x.dsl) add('Hair: ' + x.name, 'look', FW.P(x));
      if ((x = e('eyes')) && x.dsl) add('Eyes: ' + x.name, 'look', FW.P(x));
      if ((x = e('garb')) && x.dsl) add('Outfit: ' + x.name, 'look', FW.P(x));
      if ((x = e('bg'))) add('Background', 'bg', FW.P(x));
      if ((x = e('per'))) add('Personality: ' + x.name, 'per', FW.P(x));
      if ((x = e('cls'))) add('Class: ' + x.name, 'cls', FW.P(x));
      if ((x = e('wpn'))) {
        const race = this.raceName();
        const aff = FW.AFFINITY[race];
        if (!FW.P(x).none && aff && aff.indexOf(x.name) >= 0)
          add(race + ' affinity with ' + x.name, 'synergy', FW.parse('wpn+1'));
        if (FW.P(x).none && FW.NATURAL_WEAPONS.indexOf(race) >= 0)
          add('Natural weapons (' + race + ')', 'synergy', FW.parse('fgt+1'));
        if (!FW.P(x).none) add('Weapon: ' + x.name, 'weapon', FW.parse(x.dsl.replace(/q=\d/, '').trim()));
      }
      if ((x = e('enh')) && !FW.P(x).none) add('Enhancement: ' + x.name, 'enh', FW.P(x));
      if ((x = e('elem')) && !FW.P(x).none) add('Element: ' + x.name, 'elem', FW.P(x));
      if ((x = e('pow')) && !FW.P(x).none) {
        add('Power: ' + x.name, 'power', FW.parse(x.dsl.replace(/rar=\d/, '').trim()));
        const w = e('wpn');
        if (w && !FW.P(w).none) {
          const shared = FW.P(w).atk.filter(t => FW.P(x).atk.indexOf(t) >= 0);
          if (shared.length)
            add(
              'Resonance: ' + w.name + ' × ' + x.name + ' (' + cap(shared[0]) + ')',
              'synergy',
              FW.parse('fgt+1 rt+1')
            );
        }
      }
      if ((x = e('weak')) && !FW.P(x).none) add('Weakness: ' + x.name, 'weak', FW.P(x));
      if ((x = e('pet')) && !FW.P(x).none) add('Companion: ' + x.name, 'pet', FW.P(x));
      if ((x = e('title'))) add(x.name, 'title', FW.P(x));
      if ((x = e('mark')) && !FW.P(x).none) add('Mark: ' + x.name, 'mark', FW.P(x));
      this.chron.forEach(c => add(c.label, 'chron', FW.parse(c.dsl)));
      return out;
    }
    /* flat (unconditional) bonus to a stat from sources so far */
    bonusFor(stat) {
      let b = 0;
      this.sources().forEach(s => {
        b += s.p.mods[stat] || 0;
      });
      return b;
    }
    toCode() {
      const j = { v: 1, l: this.luck, p: this.picks, c: this.chron, a: this.ally, s: this.seed };
      if (FW.LADDER_VERSION > 1) j.t = FW.LADDER_VERSION;
      if (this.name) j.n = this.name;
      if (this.pres) j.g = this.pres;
      if (this.chosen.length) j.h = this.chosen;
      if (this.saga) j.y = this.saga;
      if (this.daily) j.d = this.daily;
      const s = JSON.stringify(j);
      const b64 =
        typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, 'utf8').toString('base64');
      return 'FW1.' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    static fromCode(code) {
      code = String(code || '').trim();
      if (code.indexOf('FW1.') !== 0) throw new Error('Not a Legend Code');
      let j;
      try {
        let b = code.slice(4).replace(/-/g, '+').replace(/_/g, '/');
        while (b.length % 4) b += '=';
        const s =
          typeof atob !== 'undefined' ? decodeURIComponent(escape(atob(b))) : Buffer.from(b, 'base64').toString('utf8');
        j = JSON.parse(s);
      } catch (e) {
        throw new Error('Corrupt Legend Code');
      }
      if (!j || j.v !== 1 || !j.p || typeof j.p !== 'object') throw new Error('Corrupt Legend Code');
      const L = new Legend({
        luck: j.l,
        seed: j.s,
        name: typeof j.n === 'string' ? j.n.slice(0, 40) : '',
        pres: ['masc', 'fem', 'andro'].indexOf(j.g) >= 0 ? j.g : '',
      });
      L.chosen = Array.isArray(j.h) ? j.h.filter(x => typeof x === 'string').slice(0, 30) : [];
      L.picks = j.p;
      L.chron = Array.isArray(j.c) ? j.c : [];
      L.ally = Array.isArray(j.a) ? j.a : [];
      if (!(j.t >= 2)) FW.upgradeLadderPicks(L.picks);
      if (j.y && FW.Story) L.saga = FW.Story.sanitize(j.y);
      if (typeof j.d === 'string' && /^\d{4}-\d\d-\d\d$/.test(j.d)) L.daily = j.d;
      FW.validateLegend(L);
      return L;
    }
  }
  FW.Legend = Legend;
  /* codes made before the ladders grew store tier numbers from the old lists: move each to the same tier name */
  FW.upgradeLadderPicks = function (picks) {
    if (!FW.LADDER_V1) return picks;
    ['str', 'spd', 'dur', 'int', 'fgt', 'wpn', 'pwr'].forEach(k => {
      const id = { wpn: 'wpnm', pwr: 'powm' }[k] || k,
        pk = picks[id],
        old = FW.LADDER_V1[k];
      if (!pk || !old || !(pk.idx >= 0 && pk.idx < old.length)) return;
      const i = LAD[k].names.indexOf(old[pk.idx]);
      if (i >= 0) pk.idx = i;
    });
    return picks;
  };
  FW.validateLegend = function (L) {
    const p = L.picks;
    [
      'race',
      'birth',
      'age',
      'height',
      'bg',
      'per',
      'str',
      'spd',
      'dur',
      'int',
      'wpn',
      'fgt',
      'enh',
      'pow',
      'weak',
      'title',
      'mark',
    ].forEach(id => {
      if (!p[id]) throw new Error('Legend is missing: ' + id);
    });
    ['race', 'birth', 'age', 'bg', 'per', 'wpn', 'enh', 'pow', 'weak', 'title', 'mark'].forEach(id => {
      if (!L.entry(id)) throw new Error('Unknown ' + id + ': ' + p[id].name);
    });
    Object.keys(p).forEach(id => {
      if (!FW.STAGE_BY_ID[id] || !p[id] || typeof p[id] !== 'object') throw new Error('Unknown field: ' + id);
    });
    ['str', 'spd', 'dur', 'int', 'fgt', 'wpn', 'pwr'].forEach(k => {
      const id = { wpn: 'wpnm', pwr: 'powm' }[k] || k;
      if (!L.stageApplies(id)) return;
      const pk = p[id];
      if (!pk || !(pk.idx >= 0 && pk.idx < LAD[k].names.length)) throw new Error('Bad tier for ' + k);
    });
    if (!(p.height.inches > 0)) throw new Error('Bad height');
    return true;
  };

  /* ---------- wheel construction ---------- */
  function tiltList(entries, k) {
    if (!k) return entries;
    const e = 1 / (1 + 0.35 * k);
    // "No X" slices keep their weight and only shrink gently with luck; everything else flattens toward richer odds
    return entries.map(x => Object.assign({}, x, { w: FW.P(x).none ? x.w / (1 + 0.5 * k) : Math.pow(x.w, e) }));
  }
  function applyOverrides(rows, ov) {
    if (!ov) return rows;
    let out = rows
      .filter(r => !(ov.removed || []).includes(r.name))
      .map(r => (ov.weights && ov.weights[r.name] > 0 ? Object.assign({}, r, { w: ov.weights[r.name] }) : r));
    (ov.added || []).forEach(a => {
      if (a && a.name && a.w > 0)
        out.push({ name: a.name, w: a.w, dsl: '', perk: 'Custom entry', flaw: '', custom: true });
    });
    return out.length ? out : rows;
  }
  /* returns {id,title,emoji,mode,hue,mystery,entries:[{name,w,perk,flaw,dsl}] } */
  FW.buildStage = function (id, legend, ctx) {
    ctx = ctx || {};
    const k = legend.luckInfo().k;
    const ov = ctx.overrides || {};
    const def = FW.STAGE_BY_ID[id];
    const out = { id, title: def.title, emoji: def.emoji, mystery: !!def.mystery, mode: 'cat', hue: 0, entries: [] };
    if (def.ladder) {
      const L = LAD[def.ladder];
      const n = L.names.length;
      let base = ladderBase(n, L.pk, L.decay);
      const o = ov['ladder:' + def.ladder];
      out.entries = L.names.map((name, i) => {
        let w = base[i];
        if (o && o.weights && o.weights[name] > 0) w = o.weights[name];
        return { name, w: w * Math.exp(k * (i / (n - 1))), dsl: '', perk: '', flaw: '', rank: i / (n - 1) };
      });
      out.mode = 'ladder';
      out.hue = L.hue;
      out.mystery = out.mystery || L.mystery;
      out.stat = def.ladder;
      out.bonus = legend.bonusFor(def.ladder);
      out.title = def.title;
      out.emoji = L.emoji || def.emoji;
      return out;
    }
    if (id === 'sub') {
      const s = FW.SUBS[legend.raceName()];
      out.title = s.title;
      out.emoji = s.emoji;
      out.entries = tiltList(applyOverrides(s.rows, ov['sub:' + legend.raceName()]), k);
      out.mode = 'gradient';
      out.hue = 335;
      return out;
    }
    if (id === 'age') {
      const life = (legend.entry('race') && FW.P(legend.entry('race')).life) || 's';
      const lim = FW.AGE_LIMIT[life];
      const rows = FW.AGES.slice(0, lim);
      out.entries = rows.map((r, i) => ({
        name: r.name,
        w: r.w * Math.exp(k * 0.6 * (i / (rows.length - 1 || 1))),
        dsl: r.dsl,
        perk: r.perk,
        flaw: r.flaw,
      }));
      out.mode = 'stripe';
      out.hue = 100;
      return out;
    }
    if (id === 'height') {
      const hs = (legend.entry('race') && FW.P(legend.entry('race')).hs) || 1;
      out.entries = FW.HEIGHTS.map(h => {
        const inch = Math.max(1, Math.round(h * hs));
        const w = Math.exp(-Math.pow((h - 69) / 11, 2)) + 0.03;
        return { name: FW.fmtHeight(inch), w, dsl: '', perk: '', flaw: '', inches: inch };
      });
      // merge duplicates that format to the same label
      const seen = {};
      out.entries = out.entries.filter(e => {
        if (seen[e.name]) {
          seen[e.name].w += e.w;
          return false;
        }
        seen[e.name] = e;
        return true;
      });
      out.mode = 'stripe';
      out.hue = 100;
      return out;
    }
    const rows = applyOverrides(LISTS[id](), ov[id]);
    out.entries = tiltList(rows, k);
    const modes = {
      race: ['cat', 0],
      birth: ['cat', 30],
      bg: ['stripe', 245],
      per: ['stripe', 125],
      wpn: ['stripe', 105],
      enh: ['stripe', 120],
      pow: ['stripe', 120],
      weak: ['ladderish', 2],
      title: ['stripe', 118],
      mark: ['cat', 265],
      cls: ['cat', 20],
      elem: ['cat', 190],
      pet: ['stripe', 28],
      hair: ['cat', 40],
      eyes: ['cat', 200],
      garb: ['stripe', 280],
    };
    const m = modes[id] || ['cat', 0];
    out.mode = m[0];
    out.hue = m[1];
    return out;
  };
  /* weighted pick: returns index */
  FW.weightedIndex = function (entries, rng) {
    let t = 0;
    entries.forEach(e => (t += e.w));
    let r = rng() * t;
    for (let i = 0; i < entries.length; i++) {
      r -= entries[i].w;
      if (r < 0) return i;
    }
    return entries.length - 1;
  };
  /* commit a result for a stage (entryIdx from the built stage) */
  FW.commitPick = function (legend, stage, idx, rng) {
    const e = stage.entries[idx];
    const id = stage.id;
    if (stage.mode === 'ladder') legend.picks[id] = { idx };
    else if (id === 'height') legend.picks[id] = { inches: e.inches };
    else if (id === 'age') {
      const ai = FW.AGES.findIndex(a => a.name === e.name);
      const rg = FW.AGE_RANGES[ai];
      legend.picks[id] = { name: e.name, years: rg ? rg[0] + Math.floor(rng() * (rg[1] - rg[0] + 1)) : null };
    } else legend.picks[id] = { name: e.name };
    // changing race invalidates dependents
    if (id === 'race') {
      delete legend.picks.sub;
    }
    if (id === 'wpn' && FW.P(e).none) delete legend.picks.wpnm;
    if (id === 'pow' && FW.P(e).none) delete legend.picks.powm;
    return legend.picks[id];
  };
  FW.nextStageIndex = function (legend, from) {
    for (let i = from + 1; i < FW.STAGES.length; i++) if (legend.stageApplies(FW.STAGES[i].id)) return i;
    return FW.STAGES.length;
  };
  FW.stageTotal = legend => FW.STAGES.filter(s => legend.stageApplies(s.id)).length;

  /* ---------- compute ---------- */
  const W = { str: 0.22, dur: 0.18, spd: 0.16, fgt: 0.14, int: 0.08, wpnE: 0.07, powE: 0.15 };
  FW.WEIGHTS = W;
  function condRating(stat, d) {
    const n = LAD[stat].names.length;
    const unit = 100 / (n - 1);
    const wt = stat === 'wpn' ? W.wpnE : stat === 'pwr' ? W.powE * 0.45 : W[stat];
    return wt * d * unit;
  }
  FW.compute = function (legend) {
    const srcs = legend.sources();
    const c = {
      stats: {},
      weak: [],
      res: [],
      atk: [],
      conds: [],
      fate: 0,
      rt: 0,
      sources: srcs,
      hasWeapon: !legend.isNone('wpn'),
      hasPower: !legend.isNone('pow'),
    };
    const uniq = (a, t) => {
      t.forEach(x => {
        if (a.indexOf(x) < 0) a.push(x);
      });
    };
    srcs.forEach(s => {
      uniq(c.weak, s.p.weak);
      uniq(c.res, s.p.res);
      uniq(c.atk, s.p.atk);
      c.fate += s.p.fate;
      c.rt += s.p.rt;
      s.p.conds.forEach(cd => c.conds.push({ label: s.label, env: cd.env, mods: cd.mods }));
    });
    // weapon/power flavour tags live on the raw entry dsl
    const we = legend.entry('wpn');
    if (we) uniq(c.atk, FW.P(we).atk);
    const pe = legend.entry('pow');
    if (pe) uniq(c.atk, FW.P(pe).atk);
    STATS.forEach(stat => {
      const id = { wpn: 'wpnm', pwr: 'powm' }[stat] || stat;
      const pk = legend.picks[id];
      if (!legend.stageApplies(id) || !pk) {
        c.stats[stat] = { na: true, stat };
        return;
      }
      const parts = [];
      let b = 0;
      srcs.forEach(s => {
        const d = s.p.mods[stat] || 0;
        if (d) {
          b += d;
          parts.push({ label: s.label, d });
        }
      });
      const t = FW.applyTier(stat, pk.idx, b);
      t.stat = stat;
      t.parts = parts;
      t.na = false;
      t.lvl = lvlOf(stat, t);
      c.stats[stat] = t;
    });
    // rating
    const lv = s => (c.stats[s].na ? 0 : c.stats[s].lvl);
    const q = we ? FW.P(we).q : 0;
    const wpnE = c.hasWeapon ? (0.45 + (0.55 * q) / 5) * lv('wpn') : 0.7 * lv('fgt');
    const rar = pe ? FW.P(pe).rar : 0;
    const powE = c.hasPower ? 0.55 * ((rar / 6) * 100) + 0.45 * lv('pwr') : 0.5 * lv('fgt');
    const parts = {
      str: W.str * lv('str'),
      dur: W.dur * lv('dur'),
      spd: W.spd * lv('spd'),
      fgt: W.fgt * lv('fgt'),
      int: W.int * lv('int'),
      wpn: W.wpnE * wpnE,
      pwr: W.powE * powE,
    };
    c.parts = parts;
    c.baseRating = Object.values(parts).reduce((a, b) => a + b, 0) + c.rt;
    c.rating = Math.round(c.baseRating * 10) / 10;
    c.rank = FW.rankName(c.baseRating);
    c.fateTokens = Math.max(0, legend.luckInfo().tokens + c.fate);
    c.height = legend.picks.height ? FW.fmtHeight(legend.picks.height.inches) : '';
    c.heightClass = legend.heightClass();
    return c;
  };
  FW.RANKS = [
    [0, 'Commoner'],
    [20, 'Fighter'],
    [32, 'Veteran'],
    [44, 'Champion'],
    [56, 'Warlord'],
    [68, 'Mythic'],
    [80, 'Demigod'],
    [92, 'Cosmic Being'],
  ];
  FW.rankName = r => {
    let n = FW.RANKS[0][1];
    FW.RANKS.forEach(x => {
      if (r >= x[0]) n = x[1];
    });
    return n;
  };

  /* ---------- card lines ---------- */
  function tierText(t) {
    return t.name + (t.over ? ' +' + t.over : '');
  }
  FW.SUB_LABEL = {
    Elf: 'ELVEN KIN',
    Vampire: 'BLOODLINE',
    Demon: 'KIND OF DEMON',
    Dragonborn: 'DRACONIC BLOODLINE',
    Spirit: 'KIND OF SPIRIT',
    Angel: 'TYPE OF ANGEL',
    Human: 'HERITAGE',
    Beastkin: 'BEAST BLOOD',
    Elemental: 'ELEMENT',
    Dwarf: 'CLAN',
    Orc: 'CLAN',
    God: 'DOMAIN',
    Djinn: 'KIND OF DJINN',
  };
  FW.cardLines = function (legend, c) {
    c = c || FW.compute(legend);
    const L = [];
    const e = id => legend.entry(id);
    const race = legend.raceName();
    L.push({ k: 'RACE', v: race });
    if (legend.has('sub'))
      L.push({
        k: FW.SUB_LABEL[race] || (FW.SUBS[race] && FW.SUBS[race].label) || 'TYPE',
        v: legend.pickName('sub'),
        sub: true,
      });
    L.push({ k: 'TITLE', v: legend.pickName('title') });
    if (legend.has('cls')) L.push({ k: 'CLASS', v: legend.pickName('cls') });
    const age = legend.picks.age,
      yrs = age.years ? age.years + ((legend.saga && legend.saga.years) || 0) : 0;
    L.push({
      k: 'AGE',
      v: yrs
        ? yrs.toLocaleString('en-US') + (yrs > 100 ? ' years' : '')
        : age.name + (legend.saga && legend.saga.years ? ' (+' + legend.saga.years + ' years)' : ''),
    });
    L.push({ k: 'HEIGHT', v: c.height });
    ['str', 'spd', 'dur', 'int'].forEach(s =>
      L.push({
        k: LAD[s].label.toUpperCase(),
        v: tierText(c.stats[s]),
        d: c.stats[s].bonus
          ? 'rolled ' +
            LAD[s].names[c.stats[s].raw] +
            ' (' +
            (c.stats[s].bonus > 0 ? '+' : '−') +
            Math.abs(c.stats[s].bonus) +
            ')'
          : '',
      })
    );
    L.push({
      k: 'FIGHTING SKILLS',
      v: tierText(c.stats.fgt),
      d: c.stats.fgt.bonus
        ? 'rolled ' +
          LAD.fgt.names[c.stats.fgt.raw] +
          ' (' +
          (c.stats.fgt.bonus > 0 ? '+' : '−') +
          Math.abs(c.stats.fgt.bonus) +
          ')'
        : '',
    });
    L.push({ k: 'WEAPON', v: c.hasWeapon ? legend.pickName('wpn') + ' (' + tierText(c.stats.wpn) + ')' : 'None' });
    L.push({ k: 'POWER', v: c.hasPower ? legend.pickName('pow') + ' (' + tierText(c.stats.pwr) + ')' : 'None' });
    if (legend.has('elem') && !legend.isNone('elem')) L.push({ k: 'ELEMENT', v: legend.pickName('elem') });
    L.push({ k: 'ENHANCEMENT', v: FW.P(e('enh')).none ? 'None' : legend.pickName('enh') });
    L.push({ k: 'WEAKNESS', v: FW.P(e('weak')).none ? 'None' : legend.pickName('weak') });
    if (legend.has('pet') && !legend.isNone('pet')) L.push({ k: 'COMPANION', v: legend.pickName('pet') });
    if (legend.saga && legend.saga.ch && FW.Story) L.push({ k: 'SAGA', v: FW.Story.summary(legend) });
    return L;
  };
  FW.extraLines = function (legend) {
    const e = id => legend.entry(id);
    const x = [];
    x.push({ k: 'BIRTHPLACE', v: legend.pickName('birth') });
    x.push({ k: 'BACKGROUND', v: legend.pickName('bg') });
    x.push({ k: 'PERSONALITY', v: legend.pickName('per') });
    x.push({ k: "FATE'S MARK", v: !legend.has('mark') || FW.P(e('mark')).none ? 'Unmarked' : legend.pickName('mark') });
    const looks = ['hair', 'eyes', 'garb'].filter(id => legend.has(id)).map(id => legend.pickName(id));
    if (looks.length) x.push({ k: 'LOOKS', v: looks.join('; ') });
    if (legend.name) x.unshift({ k: 'NAME', v: legend.name });
    return x;
  };
  FW.legendText = function (legend) {
    const c = FW.compute(legend);
    const lines = FW.cardLines(legend, c)
      .concat(FW.extraLines(legend))
      .map(l => l.k + ': ' + l.v);
    lines.push('POWER RATING: ' + c.rating + ' (' + c.rank + ')');
    if (legend.saga && legend.saga.log.length && FW.Story) {
      lines.push('', 'SAGA (' + FW.Story.summary(legend) + ')');
      legend.saga.log.forEach(x => lines.push((x.ch ? 'Chapter ' + x.ch + ' - ' : '') + x.chapter + ': ' + x.text));
    }
    return lines.join('\n');
  };

  /* ---------- fight ---------- */
  FW.pickArena = function (rng) {
    return FW.ARENAS[FW.weightedIndex(FW.ARENAS, rng)];
  };
  FW.matchup = function (legend, opp, arena) {
    const c = FW.compute(legend);
    const adj = [];
    const po = FW.P(opp);
    const oppLv = po.lv;
    const base = c.baseRating;
    const behind = oppLv - base > 8,
      ahead = base - oppLv > 8;
    const tags = arena ? arena.tags : [];
    let total = base;
    c.conds.forEach(cd => {
      let on = false,
        why = '';
      if (cd.env === 'behind') {
        on = behind;
        why = 'when losing';
      } else if (cd.env === 'ahead') {
        on = ahead;
        why = 'when winning';
      } else if (tags.indexOf(cd.env) >= 0) {
        on = true;
        why = FW.ENV_LABEL[cd.env];
      }
      if (!on) return;
      let d = 0;
      Object.keys(cd.mods).forEach(s => {
        if (!c.stats[s].na) d += condRating(s, cd.mods[s]);
      });
      if (Math.abs(d) < 0.05) return;
      adj.push({ label: cd.label + ' ' + why, d, kind: d >= 0 ? 'buff' : 'debuff' });
      total += d;
    });
    const hset = [...new Set(c.atk)];
    po.atk.forEach(t => {
      if (c.weak.indexOf(t) >= 0) {
        adj.push({ label: 'Exploited weakness: ' + cap(t), d: -8, kind: 'debuff' });
        total -= 8;
      }
    });
    po.atk.forEach(t => {
      if (c.res.indexOf(t) >= 0) {
        adj.push({ label: 'You resist ' + cap(t), d: 5, kind: 'buff' });
        total += 5;
      }
    });
    hset.forEach(t => {
      if (po.weak.indexOf(t) >= 0) {
        adj.push({ label: 'Your ' + cap(t) + ' hits their weakness', d: 7, kind: 'buff' });
        total += 7;
      }
    });
    hset.forEach(t => {
      if (po.res.indexOf(t) >= 0) {
        adj.push({ label: 'They resist ' + cap(t), d: -4, kind: 'debuff' });
        total -= 4;
      }
    });
    // a boss's own trick (FW.BOSS_MECH): a ward, an immunity, a punished element, rage, or a second phase
    const mech = FW.BOSS_MECH && !opp.phase ? FW.BOSS_MECH[opp.name] : null;
    if (mech) {
      const who = opp.name;
      if (mech.kind === 'ward') {
        const lost = adj.filter(a => / hits their weakness$/.test(a.label)).reduce((t, a) => t + a.d, 0);
        if (lost) {
          adj.push({ label: who + "'s ward: no weakness can be found", d: -lost, kind: 'debuff', boss: true });
          total -= lost;
        }
      } else if (mech.kind === 'immune' && hset.indexOf(mech.elem) >= 0) {
        const lost = adj
          .filter(a => a.label === 'Your ' + cap(mech.elem) + ' hits their weakness')
          .reduce((t, a) => t + a.d, 0);
        adj.push({ label: who + ' is immune to ' + cap(mech.elem), d: -(lost + 5), kind: 'debuff', boss: true });
        total -= lost + 5;
      } else if (mech.kind === 'punish' && hset.indexOf(mech.elem) >= 0) {
        adj.push({ label: who + ' punishes ' + cap(mech.elem), d: -7, kind: 'debuff', boss: true });
        total -= 7;
      } else if (mech.kind === 'enrage' && total < oppLv) {
        adj.push({ label: who + ' is enraged by weaker foes', d: -4, kind: 'debuff', boss: true });
        total -= 4;
      }
    }
    const P = 1 / (1 + Math.exp(-(total - oppLv) / 9));
    const draw = 0.04;
    let win = Math.min(0.97, Math.max(0.02, P * (1 - draw)));
    let lose = 1 - win - draw;
    if (lose < 0.0099) {
      lose = 0.0099;
      win = 1 - lose - draw;
    }
    return {
      hero: total,
      base,
      opp: oppLv,
      adj,
      pWin: win,
      pLose: lose,
      pDraw: draw,
      behind,
      ahead,
      c,
      mech: mech || null,
      phases: !!(mech && mech.kind === 'phases'),
    };
  };
  /* a boss with two phases rises again after you win: stronger, and without its trick a second time */
  FW.phaseTwo = function (opp) {
    const p = FW.P(opp);
    return Object.assign({}, opp, {
      dsl: opp.dsl.replace(/lv=\d+/, 'lv=' + Math.min(99, p.lv + 8)),
      phase: 2,
      name: opp.name,
    });
  };
  FW.MECH_TEXT = {
    ward: 'Warded: your element finds no weakness',
    immune: 'Immune to {elem}',
    punish: 'Punishes {elem}',
    enrage: 'Enraged by weaker foes',
    phases: 'Two phases: rises again, stronger',
  };
  FW.mechText = m => (m ? (FW.MECH_TEXT[m.kind] || '').replace('{elem}', cap(m.elem || '')) : '');
  /* the opponent wheel: with a legend, foes far above its power rating get thinner slices (never below ~35%), so a
     weak hero is less often handed a hopeless fight while every foe can still be drawn. Slice size stays the true odds. */
  // how much of its slice a foe keeps on a matchmaking wheel: full up to 4 points above you, then shrinking to 10%
  FW.matchWeight = (foeLv, rating) =>
    rating == null ? 1 : 0.1 + 0.9 * Math.exp(-Math.max(0, foeLv - rating - 4) / 10);
  FW.oppEntries = function (uni, legend) {
    const r = legend ? FW.compute(legend).baseRating : null;
    return uni.opps.map(o => Object.assign({}, o, { w: o.w * FW.matchWeight(FW.P(o).lv, r) }));
  };
  FW.outcomeEntries = function (legend) {
    const per = legend.entry('per');
    const mult = per ? FW.P(per).o : {};
    return FW.OUTCOMES.map(o => ({
      key: o.key,
      name: o.name,
      w: o.w * (mult[o.key] != null ? mult[o.key] : 1),
      base: o.w,
      mult: mult[o.key] != null ? mult[o.key] : 1,
      blurb: o.blurb,
      reward: o.reward,
    }));
  };
  FW.defeatEntries = function (legend) {
    const mk = legend.entry('mark');
    const fateGood = legend.luck === 'divine' ? 1.8 : legend.luck === 'mythic' ? 1.4 : 1;
    return FW.DEFEATS.map(d => ({
      key: d.key,
      name: d.name,
      w:
        d.w *
        (d.key === 'awaken' || d.key === 'escaped' || d.key === 'rescued'
          ? fateGood
          : d.key === 'death'
            ? 1 / fateGood
            : 1),
      blurb: d.blurb,
    }));
  };
  FW.applyConsequence = function (legend, kind, key, opp, rng, ctx) {
    ctx = ctx || {};
    const add = (label, dsl, text) =>
      legend.chron.push(
        Object.assign(
          { label, dsl, text, kind, key, opp: opp.name, arena: ctx.arena || '', uni: ctx.uni || '' },
          typeof ctx.p === 'number' ? { p: Math.round(ctx.p * 1000) / 1000 } : {}
        )
      );
    // outcomes added by content packs carry their own reward
    const custom = (kind === 'win' ? FW.OUTCOMES : kind === 'lose' ? FW.DEFEATS : []).find(o => o.key === key && o.dsl);
    if (custom) add(custom.name + ': ' + opp.name, custom.dsl, custom.text || custom.blurb);
    else if (kind === 'win') {
      if (key === 'kill') add('Reputation: slayer of ' + opp.name, 'rt+1', 'Your name is feared (+1 Renown).');
      else if (key === 'banish') add('Banished ' + opp.name, 'rt+1', 'Word spreads (+1 Renown).');
      else if (key === 'spare') add('Mercy to ' + opp.name, 'fate+1', 'He remembers your mercy (+1 Fate Token).');
      else if (key === 'absorb') {
        const st = COMBAT[Math.floor(rng() * COMBAT.length)];
        add('Absorbed ' + opp.name + "'s power", st + '+1', 'His strength flows into you (+1 ' + LAD[st].label + ').');
      } else {
        legend.ally.push({ name: opp.name, lv: FW.P(opp).lv, how: key });
        add('Ally: ' + opp.name, 'rt+2', opp.name + ' now fights at your side (+2 Renown).');
      }
    } else if (kind === 'lose') {
      if (key === 'scar') add('Battle scar', 'dur-1', 'A permanent scar (−1 Durability).');
      else if (key === 'escaped') add('Narrow escape', 'fate+1', 'You live to fight again (+1 Fate Token).');
      else if (key === 'awaken')
        add('Awakening', 'str+2 pwr+1', "Power wakes at death's door (+2 Strength, +1 Power mastery).");
      else if (key === 'rescued') {
        legend.ally.push({ name: 'a mysterious rescuer', lv: 40, how: 'rescued' });
        add('Rescued by an ally', 'rt+1', 'A friend pulls you from the fire (+1 Renown).');
      } else if (key === 'captured') add('Captured', 'rt+0', 'Chained but unbroken.');
      else if (key === 'death') add('Fallen hero', 'rt+0', 'Your legend ends here.');
    } else add('Stalemate with ' + opp.name, 'rt+0', 'A rematch looms.');
    return legend.chron[legend.chron.length - 1];
  };
})(typeof window !== 'undefined' ? window : globalThis);
