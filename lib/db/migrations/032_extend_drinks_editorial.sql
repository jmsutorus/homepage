-- Migration: Extend drinks table with editorial fields
-- Description: Add body_feel, serving_temp, and pairings for detailed drink info

ALTER TABLE drinks ADD COLUMN body_feel TEXT;
ALTER TABLE drinks ADD COLUMN serving_temp TEXT;
ALTER TABLE drinks ADD COLUMN pairings TEXT;
