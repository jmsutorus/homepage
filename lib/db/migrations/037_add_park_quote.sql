-- Migration: Add quote to parks
ALTER TABLE parks ADD COLUMN quote TEXT;
