-- Migration: Add people table for birthday tracking
-- Description: Allows users to track birthdays and anniversaries for contacts (family, friends, work, etc.)

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  birthday TEXT NOT NULL, -- YYYY-MM-DD (year optional: 0000-MM-DD for unknown year)
  relationship TEXT DEFAULT 'other' CHECK(relationship IN ('family', 'friends', 'work', 'other')),
  photo TEXT, -- Avatar URL/path (optional)
  email TEXT,
  phone TEXT,
  notes TEXT,
  anniversary TEXT, -- YYYY-MM-DD (optional, for anniversaries)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_people_userId ON people(userId);
CREATE INDEX IF NOT EXISTS idx_people_birthday ON people(birthday);
CREATE INDEX IF NOT EXISTS idx_people_relationship ON people(relationship);

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_people_timestamp
AFTER UPDATE ON people
BEGIN
  UPDATE people SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
