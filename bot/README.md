# Destiny Unbound Discord bot

`/spin` rolls a random legend with the game's real wheels and odds (it loads `app/js` directly) and posts its
card: title, race, rank, power rating, class, weapon, power, weakness and stats, with a button to play.
`/spin luck:Mythic` picks the luck level. Each person can spin once every 5 seconds, and it never pings anyone.
In a server that has a channel named `#spin-the-wheel`, spins only work there; anywhere else the bot privately
points to that channel (set `SPIN_CHANNEL` in the environment to use another name). On the Destiny Unbound server
the command is also limited to that channel in Server Settings > Integrations.

## Running it on a server (Ubuntu)

Once, on the server:

```bash
curl -fsSL https://raw.githubusercontent.com/ScikuVRC/destiny-unbound/main/bot/setup.sh -o setup.sh && bash setup.sh
```

The script installs Node.js and git, adds swap on small servers, gets the code, and runs the bot as the
`destiny-bot` service under its own user. The first time, it asks for the bot token. Paste it there; it's stored
in `/etc/destiny-bot.env`, readable by root only.

- Update to the latest code: `bash /opt/destiny-unbound/bot/setup.sh`
- Replace the token: `bash /opt/destiny-unbound/bot/setup.sh --token`
- Logs: `sudo journalctl -u destiny-bot -f`

## The bot account

The bot belongs to the "Destiny Unbound" application in the
[Discord Developer Portal](https://discord.com/developers/applications). Its token is under **Bot > Reset Token**.
Treat the token like a password; if it leaks, reset it there and run `setup.sh --token`.

Invite it to a server with this link (no special permissions are needed for slash commands):
<https://discord.com/oauth2/authorize?client_id=1570658915233046528&scope=bot%20applications.commands&permissions=0>

## Running it locally

```bash
cd bot && npm install && DISCORD_TOKEN=... node index.js
```

## /stats and the world counter

`/stats` shows how many heroes have been made and how sagas ended. The game's numbers come from the world counter
(a Cloudflare Worker, see [../worker/README.md](../worker/README.md)), which only counts players who switch it on in
Options > Data. The bot adds its own count of `/spin` heroes, kept in `bot/data/stats.json` on the server.

Set the counter's address in `/etc/destiny-bot.env`:

```bash
WORLD_URL=https://destiny-unbound-counter.destiny-unbound.workers.dev
```

Without `WORLD_URL`, `/stats` shows only the Discord spins. (`stats.js` can also serve the counter itself over HTTP:
set `STATS_PORT`, and put it behind HTTPS.)

## Traffic warning (optional)

With `ALERT_CHANNEL_ID=<channel id>` in `/etc/destiny-bot.env` (and `WORLD_URL` set), the bot checks the world
counter's `/v1/health` every hour and posts one warning a day in that channel when writes jump. Use a staff-only
channel. Without it, nothing is checked or posted.

## Code

`index.js` connects to Discord; `commands.js` defines the commands, `handler.js` decides what each one does,
`embeds.js` builds the cards and `legend.js` makes heroes with the game's own code.
`tests/bot.test.js` drives the handler with stand-in interactions (run `npm ci --prefix bot` once first).

## /daily, /legend and /versus

- `/daily` shows today's daily-challenge leaderboard (the top ten and how many played), from the world counter.
- `/legend code:DU-7K3QXM` shows a hero from the game as a card, with its saga and epilogue. It takes the short card
  codes players make in the game (Share > Get a card code) and, when it fits, a full Legend Code (Discord allows 6,000
  characters, and most full codes are longer).
- `/versus` lets two heroes fight with the game's own Versus odds in an arena spun with the game's weights. Give
  each fighter a card code, or leave one or both empty to spin a hero on the spot (`luck` sets their luck). Like
  `/spin`, it only works in `#spin-the-wheel` where that channel exists.

`/legend` and `/versus` have the same 5-second cooldown per person as `/spin`. All three need `WORLD_URL` for the
leaderboard and short codes; full codes and spun heroes work without it.

## /patchnotes

`/patchnotes` shows the newest release's notes from `CHANGELOG.md`; `/patchnotes version:0.2.0-alpha.3` shows an
older one (the box suggests versions as you type). The bot reads the changelog from its own checkout, so after a
release run `sudo git pull --ff-only` on the server and restart the bot. The release announcement in
#announcements uses the same notes (`scripts/discord-announce.js`).
