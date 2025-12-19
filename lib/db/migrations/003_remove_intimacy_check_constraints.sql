-- Migration: Remove check constraints from intimacy_entries table
-- Removes constraints: intimacy_entries_check_2 (initiation),
--                       intimacy_entries_check_3 (location),
--                       intimacy_entries_check_4 (mood_before),
--                       intimacy_entries_check_5 (mood_after)

-- Step 1: Rename the existing table
ALTER TABLE intimacy_entries RENAME TO intimacy_entries_old;

-- Step 2: Create new table without the check constraints
CREATE TABLE IF NOT EXISTS intimacy_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  time TEXT, -- Time in HH:MM format (optional)
  duration INTEGER, -- Duration in minutes
  satisfaction_rating INTEGER CHECK(satisfaction_rating BETWEEN 1 AND 5),
  initiation TEXT DEFAULT 'mutual', -- Removed CHECK constraint
  type TEXT, -- Type/category (flexible text field)
  location TEXT DEFAULT 'home', -- Removed CHECK constraint
  mood_before TEXT, -- Removed CHECK constraint
  mood_after TEXT, -- Removed CHECK constraint
  positions TEXT, -- JSON array of position names
  notes TEXT, -- Private notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Step 3: Copy data from old table to new table
INSERT INTO intimacy_entries (
  id, userId, date, time, duration, satisfaction_rating,
  initiation, type, location, mood_before, mood_after,
  positions, notes, created_at, updated_at
)
SELECT
  id, userId, date, time, duration, satisfaction_rating,
  initiation, type, location, mood_before, mood_after,
  positions, notes, created_at, updated_at
FROM intimacy_entries_old;

-- Step 4: Drop the old table
DROP TABLE intimacy_entries_old;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_intimacy_entries_userId ON intimacy_entries(userId);
CREATE INDEX IF NOT EXISTS idx_intimacy_entries_date ON intimacy_entries(date);
CREATE INDEX IF NOT EXISTS idx_intimacy_entries_satisfaction ON intimacy_entries(satisfaction_rating);
CREATE INDEX IF NOT EXISTS idx_intimacy_entries_initiation ON intimacy_entries(initiation);

-- Step 6: Recreate the update trigger
CREATE TRIGGER IF NOT EXISTS update_intimacy_entries_timestamp
AFTER UPDATE ON intimacy_entries
BEGIN
  UPDATE intimacy_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
