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
