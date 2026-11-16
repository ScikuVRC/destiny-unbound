/* Destiny Unbound error reports: when something goes wrong (or the desktop game stopped unexpectedly last time), a
   small note offers to send a report. Pressing it shows exactly what would be sent: the game version, the platform,
   the screen, the error and the recent log lines, plus an optional note. Nothing leaves the device unless the player
   presses Send. Home folders and e-mail addresses are taken out first. Options > Saves and privacy can turn the offer off.
   The server side is worker/src/errors.js. SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  'use strict';
  const FW = (g.FW = g.FW || {});
  const R = (FW.Report = {});
  const LIMITS = { message: 300, detail: 6000, note: 1000 };
  R.LIMITS = LIMITS;

  /* the same cleaning as the server, so what the player sees is what is stored */
  R.scrub = s =>
    String(s == null ? '' : s)
      .replace(/[A-Za-z]:[\\/]+Users[\\/]+[^\\/:'")\n]+/gi, 'C:/Users/<user>')
      .replace(/\/(Users|home)\/[^/\\\s:'")<]+/g, '/$1/<user>')
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '<email>')
      // eslint-disable-next-line no-control-regex -- removes control characters on purpose
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

  R.platform = (desktop, ua) => {
    if (!desktop) return 'browser';
    ua = String(ua || '');
    return /Windows/i.test(ua) ? 'windows' : /Mac/i.test(ua) ? 'mac' : 'linux';
  };

  /* build a report. o: { kind: 'error' | 'crash' | 'manual', message, log: [lines], extra: [lines], screen, desktop, ua, version } */
  R.build = function (o) {
    const log = (o.log || []).slice(-40);
    let message = o.message;
    if (!message) {
      const last = log.filter(l => /\[(error|crash)\]/.test(l)).pop();
      message = last ? last.replace(/^\S+ \[(error|crash)\] /, '') : '';
    }
    let detail = log.join('\n');
    if (o.extra && o.extra.length)
      detail = 'Desktop log:\n' + o.extra.slice(-40).join('\n') + '\n\nGame log:\n' + detail;
    return {
      version: o.version || FW.VERSION,
      platform: R.platform(o.desktop, o.ua),
      kind: o.kind || 'error',
      screen: /^[a-z][a-z0-9-]{0,29}$/.test(o.screen || '') ? o.screen : '',
      message: R.scrub(message).trim().slice(0, LIMITS.message),
      detail: R.scrub(detail).slice(-LIMITS.detail),
      note: '',
    };
  };

  /* ---------------- in the game ---------------- */
  if (typeof document === 'undefined') return;
  const App = () => g.FWApp,
    SYS = () => FW.System,
    D = g.fatewheelDesktop || null;
  const t = s => (FW.t ? FW.t(s) : s);
  const esc = s =>
    String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  R.available = () => !!FW.WORLD_URL;
  R.wanted = () => R.available() && !(FW.prefs && FW.prefs.errorAsk === false);

  function current(kind, crash) {
    const A = App();
    return R.build({
      kind,
      message: crash ? 'The game stopped unexpectedly: ' + crash.reason + ' (exit ' + crash.exitCode + ')' : '',
      log: SYS() ? SYS().readLog() : [],
      extra: crash && crash.log,
      screen: A && A.state ? A.state.screen : '',
      desktop: !!D,
      ua: g.navigator && g.navigator.userAgent,
    });
  }

  R.send = async function (rep) {
    const res = await fetch(FW.WORLD_URL + '/v1/error', {
      method: 'POST',
      body: JSON.stringify(rep),
      headers: { 'Content-Type': 'text/plain' }, // a simple request: no CORS preflight
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || 'HTTP ' + res.status);
    return j;
  };

  /* the report as the player will see it */
  const preview = rep =>
    [
      'Version: ' + rep.version + ' (' + rep.platform + ')',
      rep.screen ? 'Screen: ' + rep.screen : '',
      'Problem: ' + (rep.message || '(none)'),
      '',
      rep.detail,
    ]
      .filter((l, i) => l || i === 3)
      .join('\n');

  R.modal = function (kind, crash) {
    const A = App();
    if (!A || !R.available()) return;
    const rep = current(kind || 'manual', crash);
    A.openModal(
      '<button class="btn small ghost close">' +
        esc(t('Close ✕')) +
        '</button><h2>' +
        esc(t('Send an error report')) +
        '</h2><p>' +
        esc(
          t(
            'This sends the report below to the developer so the problem can be fixed. Nothing else is sent: no saves, names or anything about you. Nothing is sent until you press Send.'
          )
        ) +
        '</p><label class="er-lab" for="erNote">' +
        esc(t('Anything to add? (optional)')) +
        '</label><textarea id="erNote" rows="3" maxlength="' +
        LIMITS.note +
        '" placeholder="' +
        esc(t('What were you doing when it happened?')) +
        '"></textarea><p class="er-lab">' +
        esc(t('What will be sent')) +
        '</p><pre class="er-body" id="erBody" tabindex="0">' +
        esc(preview(rep)) +
        '</pre><div class="cta"><button class="btn primary" id="erSend">' +
        esc(t('Send report')) +
        '</button><button class="btn ghost" id="erCancel">' +
        esc(t('Cancel')) +
        '</button></div>'
    );
    const $ = id => document.getElementById(id);
    $('erCancel').onclick = () => A.closeModal();
    $('erSend').onclick = async () => {
      const btn = $('erSend');
      btn.disabled = true;
      btn.textContent = t('Sending…');
      rep.note = R.scrub($('erNote').value).trim().slice(0, LIMITS.note);
      if (!rep.message && !rep.note) rep.message = 'Report from the Send feedback screen';
      try {
        const j = await R.send(rep);
        A.closeModal();
        A.toast(t('Report sent. Thank you!') + (j.id ? ' (#' + j.id + ')' : ''));
        if (SYS()) SYS().log('info', 'error report sent' + (j.id ? ' #' + j.id : ''));
      } catch (e) {
        btn.disabled = false;
        btn.textContent = t('Send report');
        A.toast(t('Could not send the report. Check your connection, or use Send feedback instead.'), 'tip');
      }
    };
  };

  /* a small note in the corner; never more than once a session */
  let offered = false;
  R.offer = function (kind, crash) {
    if (offered || !R.wanted() || !App()) return;
    offered = true;
    const box = document.createElement('div');
    box.className = 'err-offer';
    box.setAttribute('role', 'status');
    box.innerHTML =
      '<span>' +
      esc(t(kind === 'crash' ? 'The game stopped unexpectedly last time.' : 'Something went wrong.')) +
      '</span><button class="btn small primary" type="button">' +
      esc(t('Send report')) +
      '</button><button class="btn small ghost" type="button" aria-label="' +
      esc(t('Close')) +
      '">✕</button>';
    const [send, close] = box.querySelectorAll('button');
    const done = () => box.remove();
    send.onclick = () => {
      done();
      R.modal(kind, crash);
    };
    close.onclick = done;
    document.body.appendChild(box);
    setTimeout(done, 20000);
  };

  const onError = () => setTimeout(() => R.offer('error'), 600);
  g.addEventListener('error', e => {
    if (e && e.filename !== undefined && !e.message) return; // a missing image or sound, not a script error
    onError();
  });
  g.addEventListener('unhandledrejection', onError);
  if (D && D.lastCrash)
    setTimeout(() => {
      D.lastCrash()
        .then(c => c && R.offer('crash', c))
        .catch(() => {});
    }, 2500);
})(typeof window !== 'undefined' ? window : globalThis);
