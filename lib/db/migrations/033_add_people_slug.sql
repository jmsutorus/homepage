-- Migration: Add slug to people table
-- Description: Adds slug support for editorial people detail pages

-- Add slug column to people table
ALTER TABLE people ADD COLUMN slug TEXT;

-- Create unique index on slug per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_people_slug_user ON people(userId, slug);

-- Generate slugs for existing people from name + id
-- Use a basic slugification in SQL for initial population
UPDATE people 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '''', ''), '"', ''), '.', '')) || '-' || id
WHERE slug IS NULL;
