/* Destiny Unbound data loader. The content itself (every wheel's entries) lives in app/data/*.js as plain data;
   this file only holds the row parser they use. See app/data/README.md for the row format and effect codes.
   In the browser, index.html loads this file and then each content file. In node (tests, tools, the Discord
   bot), requiring this file loads all the content too.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});

  /* One row per line: Name|weight|effects|perk|flaw. Blank lines and lines starting with # are skipped. */
  function table(text) {
    return text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s && s[0] !== '#')
      .map(line => {
        const f = line.split('|');
        return {
          name: f[0].trim(),
          w: parseFloat(f[1]),
          dsl: (f[2] || '').trim(),
          perk: (f[3] || '').trim(),
          flaw: (f[4] || '').trim(),
        };
      });
  }
  FW.table = table;

  // The content files, in load order. index.html and sw.js list the same files.
  FW.DATA_FILES = ['core', 'races', 'origins', 'skills', 'fate', 'looks', 'arena'];

  if (typeof module !== 'undefined' && module.exports && typeof require === 'function')
    FW.DATA_FILES.forEach(f => require('../data/' + f + '.js'));
})(typeof window !== 'undefined' ? window : globalThis);
