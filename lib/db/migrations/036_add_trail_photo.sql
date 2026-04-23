-- Migration: Add photo_url to park_trails
ALTER TABLE park_trails ADD COLUMN photo_url TEXT;
