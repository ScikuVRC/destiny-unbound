/* Destiny Unbound translations. Each language is a dictionary from the English text to the translated text (see app/lang/).
   Any text on the page that has an entry is translated as it appears, including menus and pop-ups built later;
   wheel labels and the card call FW.t() directly. Text without an entry stays in English.
   SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) {
  const FW = (g.FW = g.FW || {});
  FW.LANG_PACKS = FW.LANG_PACKS || {};
  FW.LANG_PACKS.en = FW.LANG_PACKS.en || { name: 'English', strings: {} };
  let lang = 'en';
  try {
    lang = JSON.parse(localStorage.getItem('fw.lang') || '"en"');
  } catch (e) {
    lang = 'en';
  }
  if (!FW.LANG_PACKS[lang]) lang = 'en';
  FW.lang = lang;
  const dict = FW.LANG_PACKS[lang].strings || {};
  // keep leading/trailing symbols and spaces ("▶ Spin a Legend") and translate the words in between
  // eslint-disable-next-line no-irregular-whitespace, no-misleading-character-class -- emoji and punctuation on purpose
  const SPLIT = /^([\s\W -⯿\uD800-\uDFFF️]*?)([\p{L}\p{N}][\s\S]*?)([\s.:!?…]*)$/u;
  FW.t = function (text) {
    if (lang === 'en' || text == null) return text;
    const s = String(text);
    if (dict[s] != null) return dict[s];
    const m = SPLIT.exec(s);
    if (m && dict[m[2]] != null) return m[1] + dict[m[2]] + m[3];
    return s;
  };

  /* Grammar for text that depends on a number or on the hero (English and translations alike):
       {p:chapter|chapters}  picks a form by the count `n`, with the language's own plural rules. List the forms in
                             the order zero|one|two|few|many|other, keeping only the ones the language has
                             (English and German: one|other; French: one|many|other; Japanese: just one form).
       {g:he|she|they}       picks by the hero's presentation: masculine|feminine|neutral (neutral when not set).
       {n}                   the number itself.
     FW.fmt(text, { n, g }) fills these in; FW.tf(text, vars) translates first. See docs/modding.md. */
  const ORDER = ['zero', 'one', 'two', 'few', 'many', 'other'];
  const rulesFor = {};
  FW.pluralIndex = function (n, language) {
    const l = language || lang;
    let r = rulesFor[l];
    if (!r) {
      try {
        const pr = new Intl.PluralRules(l),
          cats = ORDER.filter(c => pr.resolvedOptions().pluralCategories.indexOf(c) >= 0);
        r = rulesFor[l] = { pr, cats };
      } catch (e) {
        r = rulesFor[l] = { pr: null, cats: ['one', 'other'] };
      }
    }
    const cat = r.pr ? r.pr.select(+n || 0) : +n === 1 ? 'one' : 'other';
    return r.cats.indexOf(cat);
  };
  FW.genderIndex = pres => (pres === 'masc' ? 0 : pres === 'fem' ? 1 : 2);
  FW.fmt = function (text, vars) {
    const v = vars || {};
    return String(text == null ? '' : text)
      .replace(/\{p:([^{}]*)\}/g, (m, forms) => {
        const f = forms.split('|'),
          i = FW.pluralIndex(v.n);
        return f[Math.min(i < 0 ? f.length - 1 : i, f.length - 1)];
      })
      .replace(/\{g:([^{}]*)\}/g, (m, forms) => {
        const f = forms.split('|'),
          i = typeof v.g === 'number' ? v.g : FW.genderIndex(v.g);
        return f[Math.min(i, f.length - 1)];
      })
      .replace(/\{n\}/g, v.n == null ? '{n}' : String(v.n));
  };
  FW.tf = (text, vars) => FW.fmt(FW.t(text), vars);

  FW.fillLangSelect = function (sel) {
    if (!sel) return;
    sel.innerHTML = Object.keys(FW.LANG_PACKS)
      .sort((a, b) => (a === 'en' ? -1 : b === 'en' ? 1 : FW.LANG_PACKS[a].name.localeCompare(FW.LANG_PACKS[b].name)))
      .map(
        id =>
          '<option value="' + id + '"' + (id === lang ? ' selected' : '') + '>' + FW.LANG_PACKS[id].name + '</option>'
      )
      .join('');
    sel.onchange = () => FW.setLang(sel.value);
  };
  if (typeof document !== 'undefined') {
    const fill = () => FW.fillLangSelect(document.getElementById('langSel'));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill);
    else setTimeout(fill, 0);
  }
  FW.setLang = function (id) {
    try {
      localStorage.setItem('fw.lang', JSON.stringify(id));
    } catch (e) {
      /* ignore */
    }
    location.reload();
  };
  if (lang === 'en' || typeof document === 'undefined') return;

  const ATTRS = ['placeholder', 'title', 'aria-label'];
  function tNode(n) {
    const v = n.nodeValue;
    if (!v || !v.trim()) return;
    const t = FW.t(v.trim());
    if (t !== v.trim()) n.nodeValue = v.replace(v.trim(), t);
  }
  function walk(root) {
    if (root.nodeType === 3) return tNode(root);
    if (root.nodeType !== 1 || root.tagName === 'SCRIPT' || root.tagName === 'STYLE' || root.tagName === 'TEXTAREA')
      return;
    ATTRS.forEach(a => {
      if (root.hasAttribute && root.hasAttribute(a)) {
        const v = root.getAttribute(a),
          t = FW.t(v);
        if (t !== v) root.setAttribute(a, t);
      }
    });
    for (let c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  function start() {
    document.documentElement.lang = lang;
    walk(document.body);
    new MutationObserver(list =>
      list.forEach(m => {
        if (m.type === 'characterData') tNode(m.target);
        else m.addedNodes.forEach(walk);
      })
    ).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})(typeof window !== 'undefined' ? window : globalThis);
