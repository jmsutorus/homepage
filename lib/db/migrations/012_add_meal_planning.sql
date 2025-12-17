-- Migration 012: Add meal planning tables
-- Date: 2025-12-16
-- Description: Creates meals, meal_ingredients, and grocery_items tables for meal planning feature

-- Meals Table
CREATE TABLE IF NOT EXISTS meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  steps TEXT,
  servings INTEGER DEFAULT 1,
  prep_time INTEGER,
  cook_time INTEGER,
  image_url TEXT,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for meals
CREATE INDEX IF NOT EXISTS idx_meals_userId ON meals(userId);
CREATE INDEX IF NOT EXISTS idx_meals_name ON meals(name);

-- Trigger for meals updated_at
CREATE TRIGGER IF NOT EXISTS update_meals_timestamp
AFTER UPDATE ON meals
BEGIN
  UPDATE meals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Meal Ingredients Table
CREATE TABLE IF NOT EXISTS meal_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mealId INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  category TEXT DEFAULT 'other',
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (mealId) REFERENCES meals(id) ON DELETE CASCADE
);

-- Indexes for meal_ingredients
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_mealId ON meal_ingredients(mealId);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_category ON meal_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_order ON meal_ingredients(mealId, order_index);

-- Grocery Items Table
CREATE TABLE IF NOT EXISTS grocery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  category TEXT DEFAULT 'other',
  checked BOOLEAN DEFAULT 0,
  mealId INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (mealId) REFERENCES meals(id) ON DELETE SET NULL
);

-- Indexes for grocery_items
CREATE INDEX IF NOT EXISTS idx_grocery_items_userId ON grocery_items(userId);
CREATE INDEX IF NOT EXISTS idx_grocery_items_category ON grocery_items(category);
CREATE INDEX IF NOT EXISTS idx_grocery_items_checked ON grocery_items(checked);
CREATE INDEX IF NOT EXISTS idx_grocery_items_mealId ON grocery_items(mealId);
