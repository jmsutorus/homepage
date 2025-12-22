-- Migration 023: Add vacation_people junction table
-- Date: 2025-12-22
-- Description: Creates many-to-many relationship between vacations and people

-- Create vacation_people junction table
CREATE TABLE IF NOT EXISTS vacation_people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  vacationId INTEGER NOT NULL,
  personId INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE,
  FOREIGN KEY (personId) REFERENCES people(id) ON DELETE CASCADE,
  UNIQUE(vacationId, personId)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_vacation_people_userId ON vacation_people(userId);
CREATE INDEX IF NOT EXISTS idx_vacation_people_vacationId ON vacation_people(vacationId);
CREATE INDEX IF NOT EXISTS idx_vacation_people_personId ON vacation_people(personId);
CREATE INDEX IF NOT EXISTS idx_vacation_people_vacation_person ON vacation_people(vacationId, personId);
