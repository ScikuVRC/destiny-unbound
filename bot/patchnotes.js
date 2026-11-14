// Patch notes from CHANGELOG.md, for the Discord bot's /patchnotes and the release announcement.
// The changelog has one "## <version> (<date>)" section per release; "## Unreleased" is skipped.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const fs = require('fs');
const path = require('path');

const FILE = process.env.CHANGELOG_FILE || path.join(__dirname, '..', 'CHANGELOG.md');
const REPO = 'https://github.com/ScikuVRC/destiny-unbound';

/* every released section, newest first: { version, date, body } */
function sections(text) {
  const out = [];
  let cur = null;
  String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .forEach(line => {
      const m = /^## (\S+)(?: \(([^)]*)\))?\s*$/.exec(line);
      if (m) {
        cur = /^unreleased$/i.test(m[1]) ? null : { version: m[1], date: m[2] || '', body: [] };
        if (cur) out.push(cur);
      } else if (cur) cur.body.push(line);
    });
  out.forEach(s => (s.body = s.body.join('\n').trim()));
  return out;
}

const load = () => {
  try {
    return sections(fs.readFileSync(FILE, 'utf8'));
  } catch (e) {
    return [];
  }
};

/* a release's notes, or the newest; version may be written with or without the leading v */
function find(list, version) {
  if (!version) return list[0] || null;
  const v = String(version).trim().replace(/^v/i, '').toLowerCase();
  return list.find(s => s.version.toLowerCase() === v) || null;
}

/* changelog markdown -> Discord: headings in bold, wrapped list items joined, links kept, within a length limit */
function toDiscord(body, max) {
  max = max || 3800;
  const lines = [];
  body.split('\n').forEach(raw => {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) return lines.push('');
    const h = /^#{3,}\s+(.*)$/.exec(line);
    if (h) return lines.push('__**' + h[1] + '**__');
    if (/^\s*[-*] /.test(line)) return lines.push('• ' + line.replace(/^\s*[-*] /, ''));
    if (/^\s{2,}\S/.test(line) && lines.length && lines[lines.length - 1]) {
      lines[lines.length - 1] += ' ' + line.trim(); // a wrapped list item continues
      return;
    }
    if (lines.length && lines[lines.length - 1] && !/^(• |__\*\*)/.test(lines[lines.length - 1]))
      lines[lines.length - 1] += ' ' + line.trim(); // a wrapped paragraph
    else lines.push(line.trim());
  });
  let text = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
  if (text.length > max) {
    const cut = text.lastIndexOf('\n', max - 40);
    text = text.slice(0, cut > 0 ? cut : max - 40).trim() + '\n\n…and more in the full notes.';
  }
  return text;
}

/* a small update is a build of an existing stage, like 0.2.0-alpha.3.1 */
const isMicro = version => /-[a-z]+\.\d+\.\d+$/i.test(version);
const releaseUrl = version => REPO + '/releases/tag/v' + version;

module.exports = { sections, load, find, toDiscord, isMicro, releaseUrl, FILE };
