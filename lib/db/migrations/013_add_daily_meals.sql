-- Migration 013: Add daily_meals table
-- Date: 2025-12-16
-- Description: Creates daily_meals table for tracking recipes eaten each day

-- Daily Meals Table
CREATE TABLE IF NOT EXISTS daily_meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner')),
  mealId INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (mealId) REFERENCES meals(id) ON DELETE CASCADE,
  UNIQUE(userId, date, meal_type)
);

-- Indexes for daily_meals
CREATE INDEX IF NOT EXISTS idx_daily_meals_userId ON daily_meals(userId);
CREATE INDEX IF NOT EXISTS idx_daily_meals_date ON daily_meals(date);
CREATE INDEX IF NOT EXISTS idx_daily_meals_userId_date ON daily_meals(userId, date);
CREATE INDEX IF NOT EXISTS idx_daily_meals_mealId ON daily_meals(mealId);

-- Trigger for daily_meals updated_at
CREATE TRIGGER IF NOT EXISTS update_daily_meals_timestamp
AFTER UPDATE ON daily_meals
BEGIN
  UPDATE daily_meals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
