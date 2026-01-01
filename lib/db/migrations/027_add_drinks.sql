-- Migration: Add drinks and drink_logs tables
-- Description: Track drinks (beer/wine) and consumption logs

-- Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('beer', 'wine', 'cocktail', 'spirit', 'other', 'coffee', 'tea')),
  producer TEXT,
  year INTEGER,
  abv REAL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 10),
  notes TEXT,
  image_url TEXT,
  favorite INTEGER DEFAULT 0,
  status TEXT DEFAULT 'tasted' CHECK(status IN ('tasted', 'want_to_try', 'stocked')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

-- Create drink_logs junction table
CREATE TABLE IF NOT EXISTS drink_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  drinkId INTEGER NOT NULL,
  date TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  rating INTEGER CHECK(rating >= 1 AND rating <= 10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (drinkId) REFERENCES drinks(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_drinks_userId ON drinks(userId);
CREATE INDEX IF NOT EXISTS idx_drinks_slug ON drinks(slug);
CREATE INDEX IF NOT EXISTS idx_drinks_type ON drinks(type);
CREATE INDEX IF NOT EXISTS idx_drinks_status ON drinks(status);
CREATE INDEX IF NOT EXISTS idx_drinks_favorite ON drinks(favorite);

CREATE INDEX IF NOT EXISTS idx_drink_logs_userId ON drink_logs(userId);
CREATE INDEX IF NOT EXISTS idx_drink_logs_drinkId ON drink_logs(drinkId);
CREATE INDEX IF NOT EXISTS idx_drink_logs_date ON drink_logs(date);


