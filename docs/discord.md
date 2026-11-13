# Discord status (Rich Presence)

The desktop app can show what a player is doing in their Discord status:

> **Playing Destiny Unbound**
> Living a saga
> Chapter 4 · The Forgotten One, Salamanderkin
> 00:12 elapsed · [Play free]

It talks only to the Discord app on the player's own computer, through Discord's local connection
(`electron/discord.js`). Nothing goes over the network from the game, and if Discord isn't running nothing happens.
Players can switch it off in **Options > Gameplay > Discord status**. The browser version can't do this.

## What it shows

| Where the player is | Top line | Second line |
| --- | --- | --- |
| Main menu | In the main menu | |
| New Legend | Choosing a fate | Heroic luck |
| Spinning a legend | Forging a new legend | the hero's title and race so far |
| Daily challenge | Daily challenge | the hero so far |
| Story | Living a saga | Chapter 4 · the hero |
| Arena | Fighting in the arena | the hero |
| Card | Admiring a legend | the hero · their rank |
| Card after a saga ends | A saga has ended | the hero · fell / retired / ascended / was lost |
| Options | Changing the options | |

The big picture is the game's emblem, and the small one shows the current theme. The hero shown is their title and
race, never the custom name a player typed. The code that writes these lines is `app/js/presence.js`.

## Setting it up (once)

**Done (2026-11-13):** the application "Destiny Unbound" has Application ID `1570658915233046528` (in `package.json`),
the emblem as its icon, and the five art assets below. Checked against the real Discord app. The steps are kept here in
case the application ever has to be made again.

The feature stays switched off until the game has a Discord **Application ID**. To create one:

1. Sign in at <https://discord.com/developers/applications> and press **New Application**.
2. Name it **Destiny Unbound**: Discord shows this name after "Playing". Accept the terms.
3. On **General Information**, upload `docs/discord/emblem.png` as the app icon and copy the **Application ID**
   (a long number).
4. Open **Rich Presence > Art Assets** and upload these five pictures, keeping their names as the asset keys:

   | File | Asset key |
   | --- | --- |
   | `docs/discord/emblem.png` | `emblem` |
   | `docs/discord/ashen.png` | `ashen` |
   | `docs/discord/astral.png` | `astral` |
   | `docs/discord/iron.png` | `iron` |
   | `docs/discord/bloodmoon.png` | `bloodmoon` |

   New pictures can take a few minutes to appear in Discord.
5. Put the Application ID into `package.json`:

   ```json
   "discordAppId": "123456789012345678",
   ```

6. Build and release as usual. The next build shows the status and the switch in Options.

To try it before releasing, start the app with the ID set for that run only:

```bash
FATEWHEEL_DISCORD_ID=123456789012345678 npm start
```

Mod themes use their base theme's small picture.

## Discord's game detection

Rich Presence is separate from Discord's automatic game detection (its list of known games). Until Destiny Unbound
is on that list, players can still add it by hand in Discord: **User Settings > Registered Games > Add it!**, and pick
Destiny Unbound. Once the Application ID is set, Rich Presence shows "Playing Destiny Unbound" without that step.

## Release announcements on the server

When a version tag is pushed, the release workflow's last job (`announce` in `.github/workflows/release.yml`) runs
`scripts/discord-announce.js`. It posts "Destiny Unbound x.y.z is out" to **#announcements** as a "Destiny Unbound"
message with the emblem, a link to the GitHub release, the itch.io link and a "What's new" list. That list is made
from the commit titles since the previous version tag, without version bumps and `progress.md` commits. Alpha and
beta versions also point to #bug-reports. It never pings anyone.

It needs a webhook, which is a secret link that lets the workflow post in that one channel. Set it up once:

1. In Discord, open **#announcements > Edit Channel > Integrations > Webhooks > New Webhook**. Name it
   "Destiny Unbound", give it `docs/discord/emblem.png` as its picture, and keep the channel as #announcements.
   Press **Copy Webhook URL**.
2. On GitHub, open the repository's **Settings > Secrets and variables > Actions > New repository secret**. Name it
   `DISCORD_WEBHOOK`, paste the URL as the value, and save. Or, in a terminal:

   ```bash
   gh secret set DISCORD_WEBHOOK --repo ScikuVRC/destiny-unbound
   ```

   It asks for the value without showing it.

Treat the webhook URL like a password: anyone who has it can post in #announcements. If it leaks, delete the
webhook in Discord and make a new one. Without the secret the job does nothing, so releases still work.

To see the message without posting it:

```bash
node scripts/discord-announce.js v0.1.0-alpha.5 --dry
```

## Tests

`tests/discord.test.js` runs the connection against a stand-in Discord: the handshake, the activity frames, the
rate limit (at most one update every 4 seconds; Discord allows about 5 per 20 seconds), switching off, pings and what
happens when Discord isn't running. It also checks the text for each screen, and the release announcement.
