-- Homepage Database Schema
-- SQLite database for mood tracking, task management, and API caching

-- Better-Auth Tables
-- User authentication and session management

-- User Table
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT 0,
  name TEXT,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Session Table
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Account Table (for OAuth providers like Strava and Google)
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, providerId)
);

-- Verification Table (for email verification)
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Indexes for better-auth tables
CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
CREATE INDEX IF NOT EXISTS idx_account_providerId ON account(providerId);

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
  completed_date TEXT, -- YYYY-MM-DD format, set when task is marked complete
  due_date TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_date ON tasks(completed_date);
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

-- Workout Activities Table
-- Stores custom workout activities/sessions
CREATE TABLE IF NOT EXISTS workout_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  time TEXT NOT NULL, -- Time in HH:MM format
  length INTEGER NOT NULL, -- Duration in minutes
  difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard', 'very hard')) DEFAULT 'moderate',
  type TEXT CHECK(type IN ('cardio', 'strength', 'flexibility', 'sports', 'mixed', 'other')) DEFAULT 'other',
  exercises TEXT NOT NULL, -- JSON array of exercise objects with reps/sets/description
  notes TEXT,
  completed BOOLEAN DEFAULT 0,
  completed_at TIMESTAMP,
  completion_notes TEXT, -- Post-activity notes when marked complete
  strava_activity_id INTEGER, -- Link to actual Strava activity if completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (strava_activity_id) REFERENCES strava_activities(id) ON DELETE SET NULL
);

-- Indexes for workout activities
CREATE INDEX IF NOT EXISTS idx_workout_activities_date ON workout_activities(date);
CREATE INDEX IF NOT EXISTS idx_workout_activities_type ON workout_activities(type);
CREATE INDEX IF NOT EXISTS idx_workout_activities_completed ON workout_activities(completed);
CREATE INDEX IF NOT EXISTS idx_workout_activities_difficulty ON workout_activities(difficulty);

-- Trigger to update updated_at timestamp on workout_activities
CREATE TRIGGER IF NOT EXISTS update_workout_activities_timestamp
AFTER UPDATE ON workout_activities
BEGIN
  UPDATE workout_activities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Media Content Table
-- Stores media library entries (movies, TV shows, books, video games) with markdown content
CREATE TABLE IF NOT EXISTS media_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'the-matrix')
  title TEXT NOT NULL,
  type TEXT CHECK(type IN ('movie', 'tv', 'book', 'game')) NOT NULL,
  status TEXT CHECK(status IN ('in-progress', 'completed', 'planned')) NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 0 AND 10),
  started TEXT, -- ISO date string (YYYY-MM-DD)
  completed TEXT, -- ISO date string (YYYY-MM-DD)
  released TEXT, -- ISO date string (YYYY-MM-DD)
  genres TEXT, -- JSON array of genre strings
  poster TEXT, -- Image URL for poster/cover
  tags TEXT, -- JSON array of tag strings
  description TEXT, -- Short description or plot summary
  length TEXT, -- Runtime/page count/episode count as string
  creator TEXT, -- JSON array of creator strings (directors/authors)
  featured BOOLEAN DEFAULT 0, -- Whether to feature on homepage
  published BOOLEAN DEFAULT 1, -- Whether to show publicly
  content TEXT NOT NULL, -- Markdown content (body)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for media_content
CREATE INDEX IF NOT EXISTS idx_media_content_type ON media_content(type);
CREATE INDEX IF NOT EXISTS idx_media_content_status ON media_content(status);
CREATE INDEX IF NOT EXISTS idx_media_content_slug ON media_content(slug);
CREATE INDEX IF NOT EXISTS idx_media_content_completed ON media_content(completed);
CREATE INDEX IF NOT EXISTS idx_media_content_featured ON media_content(featured);
CREATE INDEX IF NOT EXISTS idx_media_content_published ON media_content(published);

-- Trigger to update updated_at timestamp on media_content
CREATE TRIGGER IF NOT EXISTS update_media_content_timestamp
AFTER UPDATE ON media_content
BEGIN
  UPDATE media_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Events Table
-- Stores calendar events with notifications
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD) - start date
  start_time TEXT, -- Time in HH:MM format
  end_time TEXT, -- Time in HH:MM format
  all_day BOOLEAN DEFAULT 0,
  end_date TEXT, -- ISO date string (YYYY-MM-DD) - for multi-day events
  notifications TEXT, -- JSON array of notification objects: [{type: string, time: number, timeObject: string}]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_all_day ON events(all_day);

-- Trigger to update updated_at timestamp on events
CREATE TRIGGER IF NOT EXISTS update_events_timestamp
AFTER UPDATE ON events
BEGIN
  UPDATE events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Parks Table
-- Stores park entries (National Parks, State Parks, Wilderness areas, etc.) with markdown content
CREATE TABLE IF NOT EXISTS parks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (e.g., 'yosemite-national-park')
  title TEXT NOT NULL,
  category TEXT CHECK(category IN ('National Park', 'State Park', 'Wilderness', 'Monument', 'Recreation Area', 'City Park', 'National Seashore', 'National Forest', 'Other')) NOT NULL,
  state TEXT, -- US State abbreviation or full name
  poster TEXT, -- Image URL for park photo
  description TEXT, -- Short description of the park
  visited TEXT, -- ISO date string (YYYY-MM-DD) - date visited
  tags TEXT, -- JSON array of tag strings
  rating INTEGER CHECK(rating BETWEEN 0 AND 10),
  featured BOOLEAN DEFAULT 0, -- Whether to feature on homepage
  published BOOLEAN DEFAULT 1, -- Whether to show publicly
  content TEXT NOT NULL, -- Markdown content (body)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for parks
CREATE INDEX IF NOT EXISTS idx_parks_category ON parks(category);
CREATE INDEX IF NOT EXISTS idx_parks_state ON parks(state);
CREATE INDEX IF NOT EXISTS idx_parks_slug ON parks(slug);
CREATE INDEX IF NOT EXISTS idx_parks_visited ON parks(visited);
CREATE INDEX IF NOT EXISTS idx_parks_featured ON parks(featured);
CREATE INDEX IF NOT EXISTS idx_parks_published ON parks(published);

-- Trigger to update updated_at timestamp on parks
CREATE TRIGGER IF NOT EXISTS update_parks_timestamp
AFTER UPDATE ON parks
BEGIN
  UPDATE parks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
