-- one row per counter: 'hero', or 'end:<ending>'
CREATE TABLE IF NOT EXISTS counts (k TEXT PRIMARY KEY, n INTEGER NOT NULL DEFAULT 0);
