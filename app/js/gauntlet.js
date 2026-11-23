/* Destiny Unbound: the arena gauntlet (11). Five fights in a row through one world, each foe stronger than the last,
   with one life: a defeat ends the run (and spins the usual defeat wheel). Each round won pays at once, and the
   rewards rise; between rounds you may walk away with what you have. A stalemate is fought again. Win all five and
   you are the Gauntlet Champion (a title in All unlocks).
   FW.Gauntlet is plain logic (tested in node); the run itself needs the page.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  const G = (FW.Gauntlet = {
    ROUNDS: 5,
    // what each round won pays, rising
    REWARDS: [
      { dsl: 'rt+1', text: '+1 Renown' },
      { dsl: 'fate+1', text: '+1 Fate Token' },
      { dsl: 'rt+1', text: '+1 Renown' },
      { dsl: 'rt+1 fate+1', text: '+1 Renown, +1 Fate Token' },
      { dsl: 'rt+2 fate+1', text: '+2 Renown, +1 Fate Token' },
    ],
    /* five bands of a world's foes from weakest to strongest; every band has two foes or more when the world has
       them, and the last always holds the strongest */
    ladder(uni) {
      const opps = (uni.opps || []).slice().sort((a, b) => FW.P(a).lv - FW.P(b).lv),
        n = opps.length,
        out = [];
      for (let r = 0; r < G.ROUNDS; r++) {
        let lo = Math.floor((r * n) / G.ROUNDS),
          hi = Math.max(lo + 1, Math.floor(((r + 1) * n) / G.ROUNDS));
        if (r === G.ROUNDS - 1) hi = n;
        if (hi - lo < 2 && n >= 2) {
          if (hi < n) hi++;
          else lo = Math.max(0, lo - 1);
        }
        out.push(opps.slice(Math.min(lo, n - 1), Math.max(hi, 1)));
      }
      return out;
    },
    // the chronicle line for a round won (it counts as an arena win, and carries the reward)
    rewardLine(r, opp, ctx) {
      const w = G.REWARDS[r];
      return Object.assign(
        {
          label: 'Gauntlet, round ' + (r + 1) + ': ' + opp.name,
          dsl: w.dsl,
          text: 'Round ' + (r + 1) + ' of the gauntlet won (' + w.text + ').',
          kind: 'win',
          key: 'gauntlet',
          opp: opp.name,
          arena: (ctx && ctx.arena) || '',
          uni: (ctx && ctx.uni) || '',
        },
        ctx && typeof ctx.p === 'number' ? { p: Math.round(ctx.p * 1000) / 1000 } : {}
      );
    },
    // the record kept on this device: best run, runs, and every championship
    record(prev, run) {
      const r = Object.assign({ best: 0, runs: 0, champs: [] }, prev || {});
      r.runs++;
      r.best = Math.max(r.best, run.won);
      if (run.won >= G.ROUNDS)
        r.champs = r.champs.concat([{ world: run.world, name: run.name, date: run.date }]).slice(-50);
      return r;
    },
  });

  if (typeof document === 'undefined' || !g.FWApp) return;
  const App = g.FWApp,
    H = FW.html,
    $ = s => document.querySelector(s),
    tr = s => (FW.t ? FW.t(s) : s);
  const winWheel = rep => [
    { name: 'Victory', w: rep.pWin, dsl: '', color: '#2f9e57', colorLight: 38 },
    { name: 'Stalemate', w: rep.pDraw, dsl: '', color: '#777', colorLight: 46 },
    { name: 'Defeat', w: rep.pLose, dsl: '', color: '#b8383b', colorLight: 40 },
  ];
  App.runGauntlet = async function () {
    const F = App.flow,
      st = App.state,
      L = st.legend;
    if (!L) return;
    F.abortRun();
    App.closeModal();
    const run = F.newRun();
    st.fight = {};
    st.where = st.spinWhere = 'spin';
    st.auto = false;
    F.syncAutoBtn();
    F.show('spin');
    FW.Audio.setScene('battle');
    $('#sheet').classList.toggle('collapsed', window.innerWidth < 980);
    const steps = G.ROUNDS + 1;
    let won = 0,
      uni = null,
      fell = false;
    const hook = (name, a) => App.hooks[name] && App.hooks[name](a);
    try {
      F.renderSteps(steps, 0);
      if (F.refreshFightSheet) F.refreshFightSheet();
      const ui = await F.playStep({
        emoji: '🌌',
        title: 'The gauntlet: which world do you fight through?',
        entries: FW.UNIVERSES.map(u => ({ name: u.name, w: 1, dsl: '' })),
        mode: 'cat',
        hue: 210,
        mystery: true,
        hint: tr('Five fights in a row, each foe stronger. One life.'),
        onResult: idx => ({ sub: H.esc(FW.UNIVERSES[idx].blurb) }),
      });
      uni = FW.UNIVERSES[ui];
      st.fight.uni = uni;
      const ladder = G.ladder(uni);
      for (let r = 0; r < G.ROUNDS; r++) {
        if (r > 0) {
          const c = await F.chooseStep({
            emoji: '🏟️',
            title: tr('Round') + ' ' + r + ' ' + tr('won') + '. ' + tr('Fight on?'),
            options: [
              { label: 'Fight on', hint: tr('Round') + ' ' + (r + 1) + ': ' + tr(G.REWARDS[r].text) },
              { label: 'Walk away', hint: 'Keep what you have won' },
            ],
          });
          if (c === 1) break;
        }
        F.renderSteps(steps, r + 1);
        const band = ladder[r];
        const oi = await F.playStep({
          emoji: '🗡️',
          title: tr('Round') + ' ' + (r + 1) + ' / ' + G.ROUNDS + ': ' + tr('who do you face?'),
          entries: band.map(o => ({ name: o.name, w: 1, dsl: o.dsl })),
          mode: 'stripe',
          hue: uni.hue,
          mystery: true,
          onResult: idx => {
            const o = band[idx],
              p = FW.P(o);
            return {
              sub: H.esc(o.perk),
              fx: H.fxCard(o.name, o.perk, '', [{ t: 'Level ' + p.lv, k: 'info' }]),
            };
          },
        });
        const opp = band[oi],
          arena = FW.pickArena(st.rng);
        st.fight.opp = opp;
        st.fight.arena = arena;
        if (F.refreshFightSheet) F.refreshFightSheet();
        // the fight; a stalemate is fought again, and a boss with two phases rises once more
        let foe = opp,
          res = 'draw',
          p = 0,
          rep = null,
          note = '';
        for (let tries = 0; res === 'draw' && tries < 6; tries++) {
          rep = FW.matchup(L, foe, arena);
          st.fight.rep = rep;
          p = rep.pWin;
          const wi = await F.playStep({
            emoji: note === 'rise' ? '🔥' : note ? '🤝' : '⚔️',
            title:
              note === 'rise'
                ? tr(opp.name + ' rises again, stronger. Do you win?')
                : note
                  ? tr('Stalemate: fight again. Do you win?')
                  : tr('Do you win?'),
            entries: winWheel(rep),
            mode: 'cat',
            hue: 0,
            hint: arena.name + ' · ' + tr('Slice sizes are your real odds'),
            preFx: H.battle(L.pickName('title'), foe.name, arena.name, rep),
            onResult: () => ({ fx: H.battle(L.pickName('title'), foe.name, arena.name, rep) }),
          });
          res = ['win', 'draw', 'lose'][wi];
          note = res === 'draw' ? 'draw' : '';
          if (res === 'win' && rep.phases && foe === opp) {
            foe = FW.phaseTwo(opp);
            res = 'draw'; // fight the second phase
            note = 'rise';
          }
        }
        if (res === 'draw') res = 'lose'; // six stalemates in a row: the crowd calls it for the champion
        hook('arenaResult', { opp: opp.name, world: uni.name, result: res });
        const fctx = { arena: arena.name, uni: uni.name, p };
        if (res === 'lose') {
          fell = true;
          FW.Audio.bad();
          FW.Audio.sting('defeat');
          const de = FW.defeatEntries(L);
          await F.playStep({
            emoji: '💀',
            title: 'What happens to you?',
            entries: de.map(d => ({ name: d.name, w: d.w, dsl: '' })),
            mode: 'stripe',
            hue: 5,
            onResult: idx => ({ sub: H.esc(de[idx].blurb), fx: H.fxCard(de[idx].name, '', de[idx].blurb, []) }),
            onCommit: idx => {
              FW.applyConsequence(L, 'lose', de[idx].key, opp, st.rng, fctx);
            },
          });
          break;
        }
        won = r + 1;
        L.chron.push(G.rewardLine(r, opp, fctx));
        FW.Audio.reveal(true);
        FW.Audio.sting(won === G.ROUNDS ? 'legend' : 'victory');
        App.toast(tr('Round') + ' ' + won + ' ' + tr('won') + ': ' + tr(G.REWARDS[r].text));
      }
      if (run !== F.runId()) return;
      const rec = G.record(App.store.get('fw.gauntlet', null), {
        won,
        world: uni.name,
        name: L.displayName(),
        date: new Date().toISOString().slice(0, 10),
      });
      App.store.set('fw.gauntlet', rec);
      App.showCard();
      App.toast(
        won === G.ROUNDS
          ? tr('Gauntlet Champion of') + ' ' + tr(uni.name) + '!'
          : fell
            ? tr('The gauntlet ends in round') + ' ' + (won + 1) + '.'
            : tr('You walk away after round') + ' ' + won + '.'
      );
    } catch (e) {
      if (e !== F.ABORT) throw e;
    }
  };
  const b = $('#btnGauntlet');
  if (b)
    b.onclick = () => {
      FW.Audio.init();
      App.runGauntlet();
    };
  App.gauntletSub = () => {
    const r = App.store.get('fw.gauntlet', null);
    return r && r.runs ? tr('Best gauntlet') + ': ' + r.best + ' / ' + G.ROUNDS : '';
  };
})(typeof window !== 'undefined' ? window : globalThis);
