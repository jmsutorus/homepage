-- Migration: Add positions column to intimacy_entries table
-- Date: 2025-12-16
-- Description: Adds the positions TEXT column to store JSON array of position names

-- Add positions column if it doesn't exist
ALTER TABLE intimacy_entries ADD COLUMN positions TEXT;
