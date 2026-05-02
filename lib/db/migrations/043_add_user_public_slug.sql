-- Add public_slug to user table
ALTER TABLE user ADD COLUMN public_slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_public_slug ON user(public_slug);
