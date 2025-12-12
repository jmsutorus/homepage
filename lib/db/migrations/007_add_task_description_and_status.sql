-- Migration 007: Add description and status fields to tasks
-- Date: 2025-12-11
-- Description: Enhances tasks with description field and flexible status system

-- Add description column to tasks table
ALTER TABLE tasks ADD COLUMN description TEXT;

-- Add status column to tasks table
-- Default to 'active' for new tasks
ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'active';

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create task_statuses table for user-defined custom statuses
CREATE TABLE IF NOT EXISTS task_statuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT, -- Optional color for UI (hex code or tailwind class)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, name),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Create indexes for task_statuses
CREATE INDEX IF NOT EXISTS idx_task_statuses_userId ON task_statuses(userId);

-- Trigger to update updated_at timestamp on task_statuses
CREATE TRIGGER IF NOT EXISTS update_task_statuses_timestamp
AFTER UPDATE ON task_statuses
BEGIN
  UPDATE task_statuses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Data Migration: Set status based on current completed boolean
-- Completed tasks → 'completed', active tasks → 'active'
UPDATE tasks SET status = CASE
  WHEN completed = 1 THEN 'completed'
  ELSE 'active'
END;
