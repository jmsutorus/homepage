-- Migration 022: Add relationship types table
-- Date: 2025-12-22
-- Description: Creates relationship_types table for user-defined relationship labels
--              and adds relationship_type_id and is_partner columns to people table

-- Create relationship_types table for user-defined relationship types
CREATE TABLE IF NOT EXISTS relationship_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, name),
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Create indexes for relationship_types
CREATE INDEX IF NOT EXISTS idx_relationship_types_userId ON relationship_types(userId);

-- Add relationship_type_id column to people table (nullable foreign key)
ALTER TABLE people ADD COLUMN relationship_type_id INTEGER REFERENCES relationship_types(id) ON DELETE SET NULL;

-- Add is_partner column to people table (marks current romantic partner)
ALTER TABLE people ADD COLUMN is_partner INTEGER DEFAULT 0;

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_people_relationship_type_id ON people(relationship_type_id);
CREATE INDEX IF NOT EXISTS idx_people_is_partner ON people(is_partner);
