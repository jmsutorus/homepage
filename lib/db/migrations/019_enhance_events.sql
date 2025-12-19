-- Migration: Enhance events with slug, content, and photos
-- Adds dedicated event pages with markdown content and photo galleries

-- Add slug column to events table
ALTER TABLE events ADD COLUMN slug TEXT;

-- Add content column to events table (for markdown content)
ALTER TABLE events ADD COLUMN content TEXT;

-- Create unique index on slug per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug_user ON events(userId, slug);

-- Generate slugs for existing events from title + id
UPDATE events 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '''', ''), '"', ''), '.', '')) || '-' || id
WHERE slug IS NULL;

-- Event Photos Table
-- Stores external image URLs for event photo galleries
CREATE TABLE IF NOT EXISTS event_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eventId INTEGER NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  date_taken TEXT, -- YYYY-MM-DD format
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);

-- Indexes for event_photos
CREATE INDEX IF NOT EXISTS idx_event_photos_eventId ON event_photos(eventId);
CREATE INDEX IF NOT EXISTS idx_event_photos_order ON event_photos(eventId, order_index);

-- Trigger for event_photos updated_at
CREATE TRIGGER IF NOT EXISTS update_event_photos_timestamp
AFTER UPDATE ON event_photos
BEGIN
  UPDATE event_photos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
