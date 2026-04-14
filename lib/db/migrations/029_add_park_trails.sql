-- Create park_trails table
CREATE TABLE IF NOT EXISTS park_trails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parkId INTEGER NOT NULL,
  name TEXT NOT NULL,
  distance REAL,
  elevation_gain INTEGER,
  difficulty TEXT,
  rating INTEGER CHECK(rating BETWEEN 0 AND 10),
  date_hiked TEXT, -- YYYY-MM-DD
  notes TEXT,
  alltrails_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parkId) REFERENCES parks(id) ON DELETE CASCADE
);

-- Indexes for park_trails
CREATE INDEX IF NOT EXISTS idx_park_trails_parkId ON park_trails(parkId);

-- Trigger for park_trails updated_at
CREATE TRIGGER IF NOT EXISTS update_park_trails_timestamp
AFTER UPDATE ON park_trails
BEGIN
  UPDATE park_trails SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
