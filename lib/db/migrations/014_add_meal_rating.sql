-- Migration: Add rating column to meals table
-- Allows users to rate their recipes on a 1-5 scale

-- Add rating column to meals table
ALTER TABLE meals ADD COLUMN rating INTEGER;

-- Create index for rating (optional, for sorting/filtering by rating)
CREATE INDEX IF NOT EXISTS idx_meals_rating ON meals(rating);
