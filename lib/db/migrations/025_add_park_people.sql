-- Migration 025: Add park_people junction table
-- Date: 2025-12-22
-- Description: Creates many-to-many relationship between parks and people

-- Create park_people junction table
CREATE TABLE IF NOT EXISTS park_people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  parkId INTEGER NOT NULL,
  personId INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (parkId) REFERENCES parks(id) ON DELETE CASCADE,
  FOREIGN KEY (personId) REFERENCES people(id) ON DELETE CASCADE,
  UNIQUE(parkId, personId)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_park_people_userId ON park_people(userId);
CREATE INDEX IF NOT EXISTS idx_park_people_parkId ON park_people(parkId);
CREATE INDEX IF NOT EXISTS idx_park_people_personId ON park_people(personId);
CREATE INDEX IF NOT EXISTS idx_park_people_park_person ON park_people(parkId, personId);
