-- Migration 016: Add is_infinite column to habits
-- Date: 2025-12-17
-- Description: Adds is_infinite boolean field to mark habits that never end

-- Add is_infinite column to habits table
-- Habits with is_infinite = 1 can be completed daily but never reach a "target"
ALTER TABLE habits ADD COLUMN is_infinite BOOLEAN DEFAULT 0;
