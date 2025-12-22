-- Migration: Add birthday column to user table
-- Date: 2025-12-21
-- Description: Adds birthday field to user profile for birthday tracking and age-related features

-- Add birthday column (nullable for existing users)
ALTER TABLE user ADD COLUMN birthday TEXT;
