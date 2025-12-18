-- Migration script to add the 'type' column to the vacations table
-- Run this SQL directly against your database

-- Add the type column
ALTER TABLE vacations 
ADD COLUMN type TEXT CHECK(type IN ('beach', 'ski', 'cruise', 'road-trip', 'city', 'camping', 'adventure', 'cultural', 'theme-park', 'festival', 'business', 'staycation', 'other')) DEFAULT 'other';

-- Update any existing NULL values to 'other'
UPDATE vacations 
SET type = 'other' 
WHERE type IS NULL;

-- Verify the migration
SELECT 
  name,
  type as column_type,
  dflt_value as default_value
FROM pragma_table_info('vacations') 
WHERE name = 'type';
