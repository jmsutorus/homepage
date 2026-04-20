-- Add category and billing_day columns to subscriptions table
ALTER TABLE subscriptions ADD COLUMN category TEXT;
ALTER TABLE subscriptions ADD COLUMN billing_day INTEGER;
