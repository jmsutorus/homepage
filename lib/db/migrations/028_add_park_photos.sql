-- Create park_photos table
CREATE TABLE IF NOT EXISTS park_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parkId INTEGER NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  date_taken TEXT, -- YYYY-MM-DD (optional)
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parkId) REFERENCES parks(id) ON DELETE CASCADE
);

-- Indexes for park_photos
CREATE INDEX IF NOT EXISTS idx_park_photos_parkId ON park_photos(parkId);
CREATE INDEX IF NOT EXISTS idx_park_photos_order ON park_photos(parkId, order_index);

-- Trigger for park_photos updated_at
CREATE TRIGGER IF NOT EXISTS update_park_photos_timestamp
AFTER UPDATE ON park_photos
BEGIN
  UPDATE park_photos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
