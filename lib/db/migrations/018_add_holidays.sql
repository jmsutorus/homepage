-- Migration: Add holidays table
-- Holidays are global (not per-user), managed by admins, visible to all users

-- Holidays Table
CREATE TABLE IF NOT EXISTS holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
  day INTEGER NOT NULL CHECK(day BETWEEN 1 AND 31),
  year INTEGER, -- NULL for recurring holidays, specific year for one-time
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, month, day, year)
);

-- Indexes for holidays
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(month, day);
CREATE INDEX IF NOT EXISTS idx_holidays_year ON holidays(year);

-- Trigger for holidays updated_at
CREATE TRIGGER IF NOT EXISTS update_holidays_timestamp
AFTER UPDATE ON holidays
BEGIN
  UPDATE holidays SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
