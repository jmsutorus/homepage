-- Migration: Add userId column to api_cache table for user data isolation
-- This migration adds userId to the api_cache table and creates necessary indexes

-- Add userId column to api_cache
ALTER TABLE api_cache ADD COLUMN userId TEXT;

-- Add foreign key constraint (SQLite doesn't support ADD CONSTRAINT, so we note it for reference)
-- FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE

-- Create index for userId lookups
CREATE INDEX IF NOT EXISTS idx_api_cache_userId ON api_cache(userId);

-- Create composite index for userId + key lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_api_cache_userId_key ON api_cache(userId, key);

-- NOTE: Existing cache entries will have NULL userId
-- They should be cleared or migrated manually if needed
-- Consider running: DELETE FROM api_cache WHERE userId IS NULL;
