-- Migration: Add published and featured columns to drinks and events
-- Description: Ensure these tables support public showcase filtering

-- Add columns to drinks if they don't exist
-- SQLite doesn't support IF NOT EXISTS in ALTER TABLE, so we handle it by intent
ALTER TABLE drinks ADD COLUMN featured BOOLEAN DEFAULT 0;
ALTER TABLE drinks ADD COLUMN published BOOLEAN DEFAULT 1;

-- Add columns to events if they don't exist
ALTER TABLE events ADD COLUMN featured BOOLEAN DEFAULT 0;
ALTER TABLE events ADD COLUMN published BOOLEAN DEFAULT 1;
