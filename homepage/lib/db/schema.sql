-- Homepage Database Schema
-- SQLite database for mood tracking, task management, and API caching

-- Mood Entries Table
-- Stores daily mood ratings and notes
CREATE TABLE IF NOT EXISTS mood_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);

-- Tasks Table
-- Stores todo items with priorities and due dates
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0 NOT NULL,
  due_date TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);

-- API Cache Table
-- Stores cached API responses with expiration
CREATE TABLE IF NOT EXISTS api_cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- Trigger to update updated_at timestamp on mood_entries
CREATE TRIGGER IF NOT EXISTS update_mood_entries_timestamp
AFTER UPDATE ON mood_entries
BEGIN
  UPDATE mood_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on tasks
CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp
AFTER UPDATE ON tasks
BEGIN
  UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Strava Athlete Table
-- Stores athlete profile information
CREATE TABLE IF NOT EXISTS strava_athlete (
  id INTEGER PRIMARY KEY,
  username TEXT,
  firstname TEXT,
  lastname TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  sex TEXT,
  premium BOOLEAN DEFAULT 0,
  profile_medium TEXT,
  profile TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_sync TIMESTAMP
);

-- Strava Activities Table
-- Stores exercise activities from Strava
CREATE TABLE IF NOT EXISTS strava_activities (
  id INTEGER PRIMARY KEY,
  athlete_id INTEGER,
  name TEXT NOT NULL,
  distance REAL DEFAULT 0,
  moving_time INTEGER DEFAULT 0,
  elapsed_time INTEGER DEFAULT 0,
  total_elevation_gain REAL DEFAULT 0,
  type TEXT,
  sport_type TEXT,
  start_date TEXT NOT NULL,
  start_date_local TEXT,
  timezone TEXT,
  achievement_count INTEGER DEFAULT 0,
  kudos_count INTEGER DEFAULT 0,
  trainer BOOLEAN DEFAULT 0,
  commute BOOLEAN DEFAULT 0,
  average_speed REAL,
  max_speed REAL,
  average_heartrate REAL,
  max_heartrate REAL,
  elev_high REAL,
  elev_low REAL,
  pr_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (athlete_id) REFERENCES strava_athlete(id)
);

-- Indexes for strava_activities
CREATE INDEX IF NOT EXISTS idx_strava_activities_athlete_id ON strava_activities(athlete_id);
CREATE INDEX IF NOT EXISTS idx_strava_activities_start_date ON strava_activities(start_date);
CREATE INDEX IF NOT EXISTS idx_strava_activities_type ON strava_activities(type);
CREATE INDEX IF NOT EXISTS idx_strava_activities_sport_type ON strava_activities(sport_type);

-- Trigger to update updated_at timestamp on strava_athlete
CREATE TRIGGER IF NOT EXISTS update_strava_athlete_timestamp
AFTER UPDATE ON strava_athlete
BEGIN
  UPDATE strava_athlete SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on strava_activities
CREATE TRIGGER IF NOT EXISTS update_strava_activities_timestamp
AFTER UPDATE ON strava_activities
BEGIN
  UPDATE strava_activities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
