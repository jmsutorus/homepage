-- Migration 011: Add event categories table
-- Date: 2025-12-16
-- Description: Creates event_categories table for user-defined categories and adds category field to events

-- Add category column to events table
ALTER TABLE events ADD COLUMN category TEXT;

-- Create event_categories table for user-defined event categories
CREATE TABLE IF NOT EXISTS event_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, name),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Create indexes for event_categories
CREATE INDEX IF NOT EXISTS idx_event_categories_userId ON event_categories(userId);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
