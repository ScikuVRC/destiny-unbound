02 - Styled theme
=================
Frostbound: a theme with its own CSS file and its own font, starting from Astral Oracle.

Files
  mod.json                       The theme: colours, the font, wheel and card settings.
  theme.css                      Extra styling, with comments explaining each rule.
  fonts/UnifrakturCook-700.woff2 A blackletter font, used for headings and the big result.
  fonts/UnifrakturCook.OFL.txt   The font's licence (SIL Open Font License). Keep it next to the font if you share it.

How the font works
  1. "fonts" in mod.json gives the file a family name: "Frost Blackletter".
  2. The vars "--font-display" and "--font-result", and the card's "head", then use that name.
  You can also use the fonts the game already has without adding files: Cinzel, Cormorant Garamond,
  Cormorant SC, EB Garamond, IM Fell English, IM Fell English SC, Share Tech Mono and UnifrakturCook.

Only add fonts whose licence lets you share them. Fonts from Google Fonts (OFL) are a safe choice.
