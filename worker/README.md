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

After changing `schema.sql`, run it again on the live database (it only adds what is missing):

```bash
npx wrangler d1 execute destiny-unbound-counter --remote --file=schema.sql
npx wrangler deploy
```
