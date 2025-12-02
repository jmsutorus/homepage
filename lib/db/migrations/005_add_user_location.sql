-- Migration: Add location column to user table for weather widget
-- This allows users to set their location for weather data display

-- Add location column (nullable for existing users)
ALTER TABLE user ADD COLUMN location TEXT;

-- Create index for performance on location queries
CREATE INDEX IF NOT EXISTS idx_user_location ON user(location);
