/* FATEWHEEL translations. Each language is a dictionary from the English text to the translated text (see app/lang/).
   Any text on the page that has an entry is translated as it appears, including menus and pop-ups built later;
   wheel labels and the card call FW.t() directly. Text without an entry stays in English.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = g.FW = g.FW || {};
  FW.LANG_PACKS = FW.LANG_PACKS || {};
  FW.LANG_PACKS.en = FW.LANG_PACKS.en || { name: 'English', strings: {} };
  let lang = 'en';
  try { lang = JSON.parse(localStorage.getItem('fw.lang') || '"en"'); } catch (e) { lang = 'en'; }
  if (!FW.LANG_PACKS[lang]) lang = 'en';
  FW.lang = lang;
  const dict = FW.LANG_PACKS[lang].strings || {};
  // keep leading/trailing symbols and spaces ("▶ Spin a Legend") and translate the words in between
  const SPLIT = /^([\s\W -⯿\uD800-\uDFFF️]*?)([\p{L}\p{N}][\s\S]*?)([\s.:!?…]*)$/u;
  FW.t = function (text) {
    if (lang === 'en' || text == null) return text;
    const s = String(text); if (dict[s] != null) return dict[s];
    const m = SPLIT.exec(s); if (m && dict[m[2]] != null) return m[1] + dict[m[2]] + m[3];
    return s;
  };
  FW.fillLangSelect = function (sel) {
    if (!sel) return;
    sel.innerHTML = Object.keys(FW.LANG_PACKS).sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : FW.LANG_PACKS[a].name.localeCompare(FW.LANG_PACKS[b].name))).map(id => '<option value="' + id + '"' + (id === lang ? ' selected' : '') + '>' + FW.LANG_PACKS[id].name + '</option>').join('');
    sel.onchange = () => FW.setLang(sel.value);
  };
  if (typeof document !== 'undefined') { const fill = () => FW.fillLangSelect(document.getElementById('langSel')); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else setTimeout(fill, 0); }
  FW.setLang = function (id) { try { localStorage.setItem('fw.lang', JSON.stringify(id)); } catch (e) { /* ignore */ } location.reload(); };
  if (lang === 'en' || typeof document === 'undefined') return;

  const ATTRS = ['placeholder', 'title', 'aria-label'];
  function tNode(n) { const v = n.nodeValue; if (!v || !v.trim()) return; const t = FW.t(v.trim()); if (t !== v.trim()) n.nodeValue = v.replace(v.trim(), t); }
  function walk(root) {
    if (root.nodeType === 3) return tNode(root);
    if (root.nodeType !== 1 || root.tagName === 'SCRIPT' || root.tagName === 'STYLE' || root.tagName === 'TEXTAREA') return;
    ATTRS.forEach(a => { if (root.hasAttribute && root.hasAttribute(a)) { const v = root.getAttribute(a), t = FW.t(v); if (t !== v) root.setAttribute(a, t); } });
    for (let c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  function start() {
    document.documentElement.lang = lang;
    walk(document.body);
    new MutationObserver(list => list.forEach(m => {
      if (m.type === 'characterData') tNode(m.target);
      else m.addedNodes.forEach(walk);
    })).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})(typeof window !== 'undefined' ? window : globalThis);
