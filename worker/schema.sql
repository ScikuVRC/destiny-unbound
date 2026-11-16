-- one row per counter: 'hero', or 'end:<ending>'
CREATE TABLE IF NOT EXISTS counts (k TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0);
-- the daily challenge leaderboard (opt-in): one row per player per day, the best score; rows older than 14 days are
-- removed as new ones arrive
CREATE TABLE IF NOT EXISTS daily (
  day TEXT NOT NULL,
  pid TEXT NOT NULL,
  name TEXT NOT NULL,
  race TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL,
  ending TEXT NOT NULL,
  ch INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, pid)
);
CREATE INDEX IF NOT EXISTS daily_top ON daily (day, score DESC);
-- short card codes (made when a player presses "Get a short code"): the Legend Code and the day it was made;
-- the same Legend Code always gets the same short code; rows older than 90 days are removed as new ones arrive
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  day TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cards_day ON cards (day);
-- error reports: only sent when a player presses "Send report" after seeing what it holds (worker/src/errors.js);
-- rows older than 30 days are removed as new ones arrive, and at most 2000 are kept
CREATE TABLE IF NOT EXISTS errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  version TEXT NOT NULL,
  platform TEXT NOT NULL,
  kind TEXT NOT NULL,
  screen TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS errors_day ON errors (day);
