#!/usr/bin/env node
/* Posts a "new version is out" message to the Discord server's #announcements channel through a channel webhook.
   The release workflow runs it after a GitHub release is published (.github/workflows/release.yml).

   node scripts/discord-announce.js v0.1.0-alpha.6          posts it (needs DISCORD_WEBHOOK in the environment)
   node scripts/discord-announce.js v0.1.0-alpha.6 --dry    only prints the message

   The "What's new" list is the commit titles since the previous version tag, without housekeeping commits.
   SPDX-License-Identifier: GPL-3.0-or-later */
'use strict';
const { execFileSync } = require('child_process');
const https = require('https');

const REPO = 'https://github.com/ScikuVRC/destiny-unbound';
const ITCH = 'https://bzrkherja.itch.io/destiny-unbound';
const ICON = 'https://raw.githubusercontent.com/ScikuVRC/destiny-unbound/main/app/icons/icon-512.png';
const GOLD = 0xc8902c;
const BUG_CHANNEL = '<#1570680790369570907>';   // #bug-reports on the Destiny Unbound server (a webhook needs the id to link it)

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();

/* Commit titles between the previous version tag and this one, minus version bumps and notes housekeeping. */
function changes(tag) {
  let prev = '';
  try { prev = git('describe', '--tags', '--abbrev=0', '--match', 'v*', tag + '^'); } catch (e) { /* first release */ }
  const range = prev ? prev + '..' + tag : tag;
  return git('log', '--no-merges', '--format=%s', range).split('\n').map(s => s.trim()).filter(Boolean)
    .filter(s => !/^(Version \d|progress\.md|Merge )/i.test(s));
}

function message(tag, list) {
  const version = tag.replace(/^v/, '');
  const pre = /-/.test(version);
  const lines = list.slice(0, 8).map(s => '• ' + s.replace(/[*_~`|>]/g, '\\$&'));
  if (list.length > 8) lines.push('• …and ' + (list.length - 8) + ' more');
  const description = [
    lines.length ? "**What's new**\n" + lines.join('\n') : '',
    `🎮 **Play or download:** ${ITCH}`,
    'Installed copies offer the update automatically.' + (pre ? ' This is an early alpha: please report bugs in ' + BUG_CHANNEL + '.' : '')
  ].filter(Boolean).join('\n\n');
  return {
    username: 'Destiny Unbound',
    avatar_url: ICON,
    allowed_mentions: { parse: [] },   // never ping anyone
    embeds: [{
      title: `Destiny Unbound ${version} is out`,
      url: `${REPO}/releases/tag/${tag}`,
      description: description.slice(0, 4000),
      color: GOLD,
      footer: { text: 'Windows · Mac · Linux · Browser' },
      timestamp: new Date().toISOString()
    }]
  };
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body));
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, res => {
      let out = ''; res.on('data', d => { out += d; });
      res.on('end', () => (res.statusCode >= 200 && res.statusCode < 300 ? resolve() : reject(new Error('Discord answered ' + res.statusCode + ': ' + out.slice(0, 300)))));
    });
    req.on('error', reject); req.end(data);
  });
}

if (require.main === module) {
  const tag = process.argv[2];
  if (!/^v\d+\.\d+\.\d+/.test(tag || '')) { console.error('Usage: node scripts/discord-announce.js v1.2.3 [--dry]'); process.exit(2); }
  const body = message(tag, changes(tag));
  if (process.argv.includes('--dry')) { console.log(JSON.stringify(body, null, 2)); process.exit(0); }
  const url = process.env.DISCORD_WEBHOOK || '';
  if (!url) { console.log('No DISCORD_WEBHOOK secret set: skipping the Discord announcement.'); process.exit(0); }
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(url)) { console.error('DISCORD_WEBHOOK is not a Discord webhook URL.'); process.exit(1); }
  post(url, body).then(() => console.log('Announced ' + tag + ' on Discord.'), e => { console.error(e.message); process.exit(1); });
}

module.exports = { message, changes };
