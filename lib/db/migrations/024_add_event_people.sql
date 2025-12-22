-- Migration 024: Add event_people junction table
-- Date: 2025-12-22
-- Description: Creates many-to-many relationship between events and people

-- Create event_people junction table
CREATE TABLE IF NOT EXISTS event_people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  eventId INTEGER NOT NULL,
  personId INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (personId) REFERENCES people(id) ON DELETE CASCADE,
  UNIQUE(eventId, personId)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_event_people_userId ON event_people(userId);
CREATE INDEX IF NOT EXISTS idx_event_people_eventId ON event_people(eventId);
CREATE INDEX IF NOT EXISTS idx_event_people_personId ON event_people(personId);
CREATE INDEX IF NOT EXISTS idx_event_people_event_person ON event_people(eventId, personId);
