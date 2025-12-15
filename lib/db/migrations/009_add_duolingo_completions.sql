-- Migration: Add Duolingo Completions Table
-- Created: 2025-12-15
-- Description: Stores daily Duolingo lesson completion records since Duolingo's API doesn't expose this data

-- Duolingo Completions Table
CREATE TABLE IF NOT EXISTS duolingo_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, date) -- One completion per day per user
);

-- Indexes for duolingo_completions
CREATE INDEX IF NOT EXISTS idx_duolingo_completions_userId ON duolingo_completions(userId);
CREATE INDEX IF NOT EXISTS idx_duolingo_completions_date ON duolingo_completions(date);
CREATE INDEX IF NOT EXISTS idx_duolingo_completions_user_date ON duolingo_completions(userId, date);
