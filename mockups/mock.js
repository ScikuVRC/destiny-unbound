/* Mockup builder: renders three phone screens with the real app components. */
(function () {
  const FW = window.FW, H = FW.html;
  const theme = document.body.dataset.theme, variant = document.body.dataset.variant;

  function sample() {
    const L = new FW.Legend({ luck: 'heroic', seed: 'mockup-' + theme });
    const ix = (stat, name) => FW.LADDERS[stat].names.indexOf(name);
    L.picks = {
      race: { name: 'Shadowborn' }, birth: { name: 'Dead Land' }, age: { name: 'Senior (61-100)', years: 83 }, height: { inches: 79 },
      bg: { name: 'You were betrayed by your family.' }, per: { name: 'Ruthless' },
      str: { idx: ix('str', 'Mountain level') }, spd: { idx: ix('spd', 'Sub-relativistic') }, dur: { idx: ix('dur', 'Town level') }, int: { idx: ix('int', 'Battle genius') },
      wpn: { name: 'Claymore' }, wpnm: { idx: ix('wpn', 'Master') }, fgt: { idx: ix('fgt', 'Skilled') },
      enh: { name: 'Beast Mode' }, pow: { name: 'Plant Manipulation' }, powm: { idx: ix('pwr', 'Expert') },
      weak: { name: 'Lightning' }, title: { name: 'The Scarlet King' }, mark: { name: 'Blessed by the Moon' }
    };
    return L;
  }
  const S = sample();
  const comp = FW.compute(S);

  function spinFrame(cfg) {
    const stageDef = FW.STAGE_BY_ID[cfg.stage];
    const L = cfg.legend || S;
    const stage = FW.buildStage(cfg.stage, L, {});
    const idx = stage.entries.findIndex(e => e.name === cfg.pick);
    const total = 20, cur = cfg.step;
    let steps = ''; for (let i = 0; i < total; i++) steps += '<i class="' + (i < cur ? 'done' : i === cur ? 'cur' : '') + '"></i>';
    const bonus = stage.mode === 'ladder' ? L.bonusFor(stage.stat) : 0;
    const t = stage.mode === 'ladder' ? FW.applyTier(stage.stat, idx, bonus) : null;
    const chipTitle = (cfg.num ? cfg.num + '- ' : '') + stage.title;
    const sub = t && bonus ? '<div class="tier-line"><span>' + H.esc(stage.entries[idx].name) + '</span><span class="arrow">→</span><span class="final">' + H.esc(t.name) + '</span></div>' : (cfg.sub || '');
    return '<div class="phone"><div class="screen-in">' +
      '<div class="steps">' + steps + '</div>' +
      '<div class="chip-emoji">' + stage.emoji + '</div>' +
      '<div class="chip"><span>' + H.esc(chipTitle) + '</span>' + (bonus ? '<span class="chip-bonus ' + (bonus < 0 ? 'neg' : '') + '">' + (bonus > 0 ? '+' : '') + bonus + '</span>' : '') + '</div>' +
      '<div class="result rare' + H.resultClass(stage.entries[idx].name) + '">' + H.esc(stage.entries[idx].name) + '</div><div class="result-sub">' + sub + '</div>' +
      '<div class="wheel-wrap" data-stage="' + cfg.stage + '"><canvas></canvas></div>' +
      '<div class="controls"><button class="btn small">↻ Re-spin</button> ' + H.tokens(2, 3) + '<button class="btn primary">Next ▸</button></div>' +
      '<div class="effects">' + cfg.fx + '</div></div></div>';
  }

  const raceFx = (function () { const e = FW.findByName(FW.RACES, 'Shadowborn'); return H.fxCard('Bonuses for Shadowborn', e.perk, e.flaw, FW.chips(FW.P(e)), '', true); })();

  const A = new FW.Legend({ luck: 'mythic', seed: 'angel' });
  A.picks = { race: { name: 'Angel' }, sub: { name: 'Archangel' } };
  const archFx = (function () { const e = FW.findByName(FW.SUBS.Angel.rows, 'Archangel'); const a = FW.findByName(FW.RACES, 'Angel'); return H.fxCard('Archangel perks', e.perk, '', FW.chips(FW.P(e)).concat([{ t: 'Flight', k: 'buff' }, { t: 'Immortality', k: 'buff' }, { t: 'Divine aura', k: 'buff' }]), '', true); })();
  const spdLegend = new FW.Legend({ luck: 'heroic' }); spdLegend.picks = { race: { name: 'Shadowborn' } };
  const spdFx = H.fxCard('Speed', '', '', [{ t: '+2 SPD from Shadowborn', k: 'buff' }], '<div class="legend-key">Rolled Sub-relativistic, lifted two tiers by your race bonus.</div>');
  const enhE = FW.findByName(FW.ENHANCEMENTS, 'Beast Mode');
  const enhFx = H.fxCard('Beast Mode', enhE.perk, enhE.flaw, FW.chips(FW.P(enhE)));

  const cfgs = {
    race:  { stage: 'race', pick: 'Shadowborn', step: 0, num: 1, legend: new FW.Legend({ luck: 'heroic' }), fx: raceFx },
    angel: { stage: 'sub', pick: 'Archangel', step: 1, num: '', legend: A, fx: archFx },
    speed: { stage: 'spd', pick: 'Sub-relativistic', step: 8, num: 5, legend: spdLegend, fx: spdFx },
    enh:   { stage: 'enh', pick: 'Beast Mode', step: 14, num: 11, legend: S, fx: enhFx }
  };

  const opp = FW.UNIVERSES[0].opps.find(o => o.name === 'Crowned Wraith');
  const arena = FW.ARENAS.find(a => a.name === 'Moonless Night');
  const rep = FW.matchup(S, opp, arena);

  const fightFrame = '<div class="phone"><div class="screen-in">' +
    '<div class="chip-emoji">⚔️</div><div class="chip"><span>Do you win?</span></div>' +
    '<div class="result">Victory</div><div class="result-sub">Odds are weighted by your buffs and debuffs</div>' +
    '<div class="wheel-wrap" data-stage="win"><canvas></canvas></div>' +
    '<div class="effects">' + H.battle('The Scarlet King', opp.name, arena.name, rep) + '</div></div></div>';

  const cardFrame = '<div class="phone"><div class="screen-in" style="padding:0"><canvas class="card-canvas" id="mockcard" style="box-shadow:none;border-radius:0;max-width:none"></canvas></div></div>';

  const root = document.getElementById('mock');
  root.innerHTML = '<div class="frame"><h4>1 · Spin screen</h4>' + spinFrame(cfgs[variant]) + '</div>' +
    '<div class="frame"><h4>2 · Final character card</h4>' + cardFrame + '</div>' +
    '<div class="frame"><h4>3 · Arena: odds from buffs &amp; debuffs</h4>' + fightFrame + '</div>';

  requestAnimationFrame(() => {
    // spin wheel
    const cfg = cfgs[variant];
    const wrap = root.querySelector('.wheel-wrap[data-stage="' + cfg.stage + '"]');
    const w = new FW.Wheel(wrap.querySelector('canvas'), theme);
    const stage = FW.buildStage(cfg.stage, cfg.legend, {});
    w.setEntries(stage.entries, { mode: stage.mode, hue: stage.hue });
    const idx = stage.entries.findIndex(e => e.name === cfg.pick);
    w.showResult(idx, 0.5);
    // win wheel
    const ww = new FW.Wheel(root.querySelector('.wheel-wrap[data-stage="win"] canvas'), theme);
    ww.setEntries([{ name: 'Victory', w: rep.pWin, color: '#2f9e57', colorLight: 38 }, { name: 'Stalemate', w: rep.pDraw, color: '#777', colorLight: 46 }, { name: 'Defeat', w: rep.pLose, color: '#b8383b', colorLight: 40 }], { mode: 'cat', hue: 0 });
    ww.showResult(0, 0.5);
    // card
    FW.drawCard(document.getElementById('mockcard'), S, { theme });
    document.getElementById('mockcard').style.width = '100%';
  });
})();
