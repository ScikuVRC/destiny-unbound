# World counter (Cloudflare Worker)

Counts heroes made and how sagas end, for players who tick **Options > Data > Add my results to the world counter**
in the game. The Discord bot's `/stats` reads the totals and adds its own `/spin` count. Only numbers are stored.

## Set up (once)

```bash
cd worker
npx wrangler login
npx wrangler d1 create destiny-unbound-counter
```

Put the `database_id` it prints into `wrangler.toml`, then:

```bash
npx wrangler d1 execute destiny-unbound-counter --remote --file=schema.sql
npx wrangler deploy
```

`deploy` prints the address (`https://destiny-unbound-counter.<account>.workers.dev`). Put it in `FW.WORLD_URL` in
`app/js/system.js`, and in `WORLD_URL` in the bot's `/etc/destiny-bot.env`.

## API

- `POST /v1/count` with `{"kind":"hero"}` or `{"kind":"end","end":"dead"}` (endings: dead, retired, ascended, lost,
  martyr, sealed, damned, fulfilled, undying, legend)
- `GET /v1/totals` returns `{ heroes, sagas, deaths, endings: { ... }, since }`
- `POST /v1/daily` with `{"day":"2026-11-14","pid":"<random id>","name":"...","race":"...","score":120,"end":"dead","ch":12}`: the daily leaderboard (a separate opt-in in the game). Checked in `src/board.js`: the day
  must be within a day of today (UTC), names are filtered, one row per player per day keeps the best score, and
  rows older than 14 days are deleted.
- `GET /v1/daily?day=2026-11-14` returns `{ day, top: [{ name, race, score, ending, ch }], players }` (top ten)

- `POST /v1/card` with `{"code":"FW1...."}` stores a Legend Code and returns `{ id: "DU-7K3QXM", days: 90 }` (the same
  code always gets the same id); `GET /v1/card/DU-7K3QXM` returns `{ id, code }`. Checked in `src/cards.js`; rows
  older than 90 days are deleted.
- `POST /v1/count` with `{"kind":"quit","where":"story:dragon"}`: where a player stopped (a separate opt-in in the
  game). `where` is a screen (`title`, `home`, `card`, `options`, `spin`) or `make:<wheel id>` / `story:<chapter id>`;
  at most 400 different places are kept. Not part of `/v1/totals`; read them with `node scripts/quit-report.js`.
- `POST /v1/error` with `{"version","platform","kind","screen","message","detail","note"}` stores an error report a
  player chose to send (checked and cleaned in `src/errors.js`) and returns `{ ok, id }`. Kept 30 days, at most 2000.
  There is no way to read them over the web: run `node scripts/error-reports.js [count] [--full]` (uses wrangler).

- `GET /v1/health` returns writes per day for the last week (`days`), `today`, `weekAverage` and `jump` (today is
  over 5x the week's average and at least 200 writes). No personal data. The bot can warn about a jump (bot/README.md).

## Abuse protection

Every write route (`/v1/count`, `/v1/daily`, `/v1/card`, `/v1/error`) has the per-minute rate limit in `wrangler.toml`
and a daily cap per address (`src/guard.js`: 300 counts, 40 leaderboard posts, 60 card codes, 20 error reports).
Addresses are not stored: the cap keeps a hash of a random salt made fresh each day, the address and the route,
and the salt and hashes are deleted the next day, so a hash can't be traced back or linked across days.

After changing `schema.sql`, run it again on the live database (it only adds what is missing):

```bash
npx wrangler d1 execute destiny-unbound-counter --remote --file=schema.sql
npx wrangler deploy
```
