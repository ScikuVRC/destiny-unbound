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
