-- Migration 008: Add time_spent field to media_content
-- Date: 2025-12-15
-- Description: Adds time_spent field to track time spent on media items in minutes

-- Add time_spent column to media_content table
-- Field is in minutes, defaults to 0, not null
ALTER TABLE media_content ADD COLUMN time_spent INTEGER NOT NULL DEFAULT 0;

-- Create index for faster filtering and sorting by time_spent
CREATE INDEX IF NOT EXISTS idx_media_content_time_spent ON media_content(time_spent);
