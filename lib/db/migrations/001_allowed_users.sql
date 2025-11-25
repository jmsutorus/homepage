-- Allowed Users Table
-- Restricts login access to specific users during beta period
CREATE TABLE IF NOT EXISTS allowed_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the initial allowed user
INSERT OR IGNORE INTO allowed_users (email) VALUES ('jmsutorus@gmail.com');
