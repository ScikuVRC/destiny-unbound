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
