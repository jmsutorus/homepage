-- Migration 010: Add task categories table
-- Date: 2025-12-16
-- Description: Creates task_categories table for user-defined categories with default categories

-- Create task_categories table for user-defined task categories
CREATE TABLE IF NOT EXISTS task_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, name),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Create indexes for task_categories
CREATE INDEX IF NOT EXISTS idx_task_categories_userId ON task_categories(userId);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
