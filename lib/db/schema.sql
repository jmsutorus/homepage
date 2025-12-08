-- Homepage Database Schema
-- SQLite database for mood tracking, task management, and API caching

-- Auth.js (NextAuth) Tables
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

-- User Roles Table
-- Stores user roles for RBAC (per user)
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId)
);

-- Indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_userId ON user_roles(userId);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Trigger to update updated_at timestamp on user_roles
CREATE TRIGGER IF NOT EXISTS update_user_roles_timestamp
AFTER UPDATE ON user_roles
BEGIN
  UPDATE user_roles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

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
-- Stores daily mood ratings and notes (per user)
CREATE TABLE IF NOT EXISTS mood_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, date)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_mood_entries_userId ON mood_entries(userId);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);

-- Tasks Table
-- Stores todo items with priorities and due dates (per user)
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0 NOT NULL,
  completed_date TEXT, -- YYYY-MM-DD format, set when task is marked complete
  due_date TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId);
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
-- Stores athlete profile information (per user)
CREATE TABLE IF NOT EXISTS strava_athlete (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
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
  last_sync TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Index for strava_athlete
CREATE INDEX IF NOT EXISTS idx_strava_athlete_userId ON strava_athlete(userId);

-- Strava Activities Table
-- Stores exercise activities from Strava (per user)
CREATE TABLE IF NOT EXISTS strava_activities (
  id INTEGER PRIMARY KEY,
  userId TEXT NOT NULL,
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
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (athlete_id) REFERENCES strava_athlete(id)
);

-- Indexes for strava_activities
CREATE INDEX IF NOT EXISTS idx_strava_activities_userId ON strava_activities(userId);
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
-- Stores custom workout activities/sessions (per user)
CREATE TABLE IF NOT EXISTS workout_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
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
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (strava_activity_id) REFERENCES strava_activities(id) ON DELETE SET NULL
);

-- Indexes for workout activities
CREATE INDEX IF NOT EXISTS idx_workout_activities_userId ON workout_activities(userId);
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
-- Stores media library entries (movies, TV shows, books, video games) with markdown content (per user)
CREATE TABLE IF NOT EXISTS media_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier (e.g., 'the-matrix')
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

-- Indexes for media_content
CREATE INDEX IF NOT EXISTS idx_media_content_userId ON media_content(userId);
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
-- Stores calendar events with notifications (per user)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId);
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
-- Stores park entries (National Parks, State Parks, Wilderness areas, etc.) with markdown content (per user)
CREATE TABLE IF NOT EXISTS parks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier (e.g., 'yosemite-national-park')
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

-- Indexes for parks
CREATE INDEX IF NOT EXISTS idx_parks_userId ON parks(userId);
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

-- Journals Table
-- Stores journal entries with markdown content and flexible tagging (per user)
CREATE TABLE IF NOT EXISTS journals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier (e.g., 'my-day-2024-01-15')
  title TEXT NOT NULL,
  journal_type TEXT CHECK(journal_type IN ('daily', 'general')) DEFAULT 'general', -- Type of journal
  daily_date TEXT, -- ISO date string (YYYY-MM-DD) - only for daily journals
  mood INTEGER CHECK(mood BETWEEN 0 AND 10), -- Mood/rating scale (optional for general, linked for daily)
  tags TEXT, -- JSON array of tag strings for flexible categorization
  featured BOOLEAN DEFAULT 0, -- Whether to feature on homepage
  published BOOLEAN DEFAULT 1, -- Whether to show publicly
  content TEXT NOT NULL, -- Markdown content (body)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug),
  UNIQUE(userId, journal_type, daily_date) -- Ensure only one daily journal per date per user
);

-- Indexes for journals
CREATE INDEX IF NOT EXISTS idx_journals_userId ON journals(userId);
CREATE INDEX IF NOT EXISTS idx_journals_slug ON journals(slug);
CREATE INDEX IF NOT EXISTS idx_journals_featured ON journals(featured);
CREATE INDEX IF NOT EXISTS idx_journals_published ON journals(published);
CREATE INDEX IF NOT EXISTS idx_journals_created_at ON journals(created_at);
CREATE INDEX IF NOT EXISTS idx_journals_updated_at ON journals(updated_at);
CREATE INDEX IF NOT EXISTS idx_journals_journal_type ON journals(journal_type);
CREATE INDEX IF NOT EXISTS idx_journals_daily_date ON journals(daily_date);

-- Trigger to update updated_at timestamp on journals
CREATE TRIGGER IF NOT EXISTS update_journals_timestamp
AFTER UPDATE ON journals
BEGIN
  UPDATE journals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Journal Links Table
-- Extensible linking system allowing journals to reference any object type (per user)
-- Links can point to media, parks, other journals, strava activities, or future object types
CREATE TABLE IF NOT EXISTS journal_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  journal_id INTEGER NOT NULL, -- The journal containing the link
  linked_type TEXT NOT NULL, -- Type of linked object: 'media', 'park', 'journal', 'activity'
  linked_id INTEGER NOT NULL, -- ID of the linked object in its respective table
  linked_slug TEXT, -- Slug of linked object (for easier lookups, optional)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);

-- Indexes for journal_links (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_journal_links_userId ON journal_links(userId);
CREATE INDEX IF NOT EXISTS idx_journal_links_journal_id ON journal_links(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_links_linked_type ON journal_links(linked_type);
CREATE INDEX IF NOT EXISTS idx_journal_links_linked_id ON journal_links(linked_id);
CREATE INDEX IF NOT EXISTS idx_journal_links_type_id ON journal_links(linked_type, linked_id);
CREATE INDEX IF NOT EXISTS idx_journal_links_type_slug ON journal_links(linked_type, linked_slug);

-- Quick Link Categories Table
-- Stores user-customizable link category sections for the homepage (per user)
CREATE TABLE IF NOT EXISTS quick_link_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0, -- Order in which categories are displayed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for quick_link_categories
CREATE INDEX IF NOT EXISTS idx_quick_link_categories_userId ON quick_link_categories(userId);
CREATE INDEX IF NOT EXISTS idx_quick_link_categories_order ON quick_link_categories(userId, order_index);

-- Trigger to update updated_at timestamp on quick_link_categories
CREATE TRIGGER IF NOT EXISTS update_quick_link_categories_timestamp
AFTER UPDATE ON quick_link_categories
BEGIN
  UPDATE quick_link_categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Quick Links Table
-- Stores individual links within categories (per user)
CREATE TABLE IF NOT EXISTS quick_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'link', -- Lucide icon name in kebab-case
  order_index INTEGER NOT NULL DEFAULT 0, -- Order within the category
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES quick_link_categories(id) ON DELETE CASCADE
);

-- Indexes for quick_links
CREATE INDEX IF NOT EXISTS idx_quick_links_userId ON quick_links(userId);
CREATE INDEX IF NOT EXISTS idx_quick_links_category_id ON quick_links(category_id);
CREATE INDEX IF NOT EXISTS idx_quick_links_order ON quick_links(category_id, order_index);

-- Trigger to update updated_at timestamp on quick_links
CREATE TRIGGER IF NOT EXISTS update_quick_links_timestamp
AFTER UPDATE ON quick_links
BEGIN
  UPDATE quick_links SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Calendar Colors Table
-- Stores customizable color settings for calendar items (per user)
CREATE TABLE IF NOT EXISTS calendar_colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'activity', 'workout.upcoming', 'workout.completed', 'media', 'park', etc.
  bg_color TEXT NOT NULL, -- Tailwind background color class (e.g., 'bg-orange-500')
  text_color TEXT NOT NULL, -- Tailwind text color class (e.g., 'text-orange-500')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, category)
);

-- Indexes for calendar_colors
CREATE INDEX IF NOT EXISTS idx_calendar_colors_userId ON calendar_colors(userId);
CREATE INDEX IF NOT EXISTS idx_calendar_colors_category ON calendar_colors(category);

-- Trigger to update updated_at timestamp on calendar_colors
CREATE TRIGGER IF NOT EXISTS update_calendar_colors_timestamp
AFTER UPDATE ON calendar_colors
BEGIN
  UPDATE calendar_colors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;



-- Habits Table
-- Stores user-defined habits to track (per user)
CREATE TABLE IF NOT EXISTS habits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', etc.
  target INTEGER DEFAULT 1, -- Number of times per period
  active BOOLEAN DEFAULT 1, -- Whether the habit is currently being tracked
  completed BOOLEAN DEFAULT 0, -- Whether the habit has been marked as completed/achieved
  order_index INTEGER DEFAULT 0, -- Display order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for habits
CREATE INDEX IF NOT EXISTS idx_habits_userId ON habits(userId);
CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(active);

-- Trigger to update updated_at timestamp on habits
CREATE TRIGGER IF NOT EXISTS update_habits_timestamp
AFTER UPDATE ON habits
BEGIN
  UPDATE habits SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Habit Completions Table
-- Stores completion records for habits (per user)
CREATE TABLE IF NOT EXISTS habit_completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  habit_id INTEGER NOT NULL,
  userId TEXT NOT NULL, -- Denormalized for easier querying
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  value INTEGER DEFAULT 1, -- Amount completed (for future use with numeric targets)
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(habit_id, date) -- Initially assume 1 completion per day per habit
);

-- Indexes for habit_completions
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_userId ON habit_completions(userId);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(userId, date);

-- Steam Yearly Stats Table
-- Stores cached steam achievement counts per game per year (per user)
CREATE TABLE IF NOT EXISTS steam_yearly_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  year INTEGER NOT NULL,
  gameId INTEGER NOT NULL,
  gameName TEXT NOT NULL,
  achievements_count INTEGER DEFAULT 0,
  total_playtime INTEGER DEFAULT 0, -- Snapshot of total playtime at sync
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, year, gameId)
);

-- Indexes for steam_yearly_stats
CREATE INDEX IF NOT EXISTS idx_steam_yearly_stats_userId ON steam_yearly_stats(userId);
CREATE INDEX IF NOT EXISTS idx_steam_yearly_stats_year ON steam_yearly_stats(year);

-- Saved Searches Table
-- Stores user's saved search configurations (per user)
CREATE TABLE IF NOT EXISTS saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  query TEXT,
  filters TEXT, -- JSON object of filters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for saved_searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_userId ON saved_searches(userId);

-- Trigger to update updated_at timestamp on saved_searches
CREATE TRIGGER IF NOT EXISTS update_saved_searches_timestamp
AFTER UPDATE ON saved_searches
BEGIN
  UPDATE saved_searches SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goals Table
-- Stores user-defined goals with markdown content, tags, and progress tracking (per user)
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier (e.g., 'learn-spanish')
  title TEXT NOT NULL,
  description TEXT, -- Short summary
  content TEXT, -- Markdown notes
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'on_hold', 'completed', 'archived', 'abandoned')) DEFAULT 'not_started',
  target_date TEXT, -- ISO date string (YYYY-MM-DD) - deadline
  completed_date TEXT, -- ISO date string (YYYY-MM-DD) - when finished
  tags TEXT, -- JSON array of tag strings
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

-- Indexes for goals
CREATE INDEX IF NOT EXISTS idx_goals_userId ON goals(userId);
CREATE INDEX IF NOT EXISTS idx_goals_slug ON goals(slug);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);

-- Trigger to update updated_at timestamp on goals
CREATE TRIGGER IF NOT EXISTS update_goals_timestamp
AFTER UPDATE ON goals
BEGIN
  UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goal Milestones Table
-- Stores milestones (sub-goals) within a goal
CREATE TABLE IF NOT EXISTS goal_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goalId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT, -- ISO date string (YYYY-MM-DD), should be <= parent goal target_date
  completed INTEGER DEFAULT 0,
  completed_date TEXT, -- ISO date string (YYYY-MM-DD)
  order_index INTEGER DEFAULT 0, -- Display order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
);

-- Indexes for goal_milestones
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goalId ON goal_milestones(goalId);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_completed ON goal_milestones(completed);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_target_date ON goal_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_order ON goal_milestones(goalId, order_index);

-- Trigger to update updated_at timestamp on goal_milestones
CREATE TRIGGER IF NOT EXISTS update_goal_milestones_timestamp
AFTER UPDATE ON goal_milestones
BEGIN
  UPDATE goal_milestones SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goal Checklist Items Table
-- Stores checklist items for goals and milestones
CREATE TABLE IF NOT EXISTS goal_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goalId INTEGER, -- For goal-level checklists (NULL if milestone checklist)
  milestoneId INTEGER, -- For milestone-level checklists (NULL if goal checklist)
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0, -- Display order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (milestoneId) REFERENCES goal_milestones(id) ON DELETE CASCADE,
  CHECK (goalId IS NOT NULL OR milestoneId IS NOT NULL)
);

-- Indexes for goal_checklist_items
CREATE INDEX IF NOT EXISTS idx_goal_checklist_items_goalId ON goal_checklist_items(goalId);
CREATE INDEX IF NOT EXISTS idx_goal_checklist_items_milestoneId ON goal_checklist_items(milestoneId);
CREATE INDEX IF NOT EXISTS idx_goal_checklist_items_order ON goal_checklist_items(goalId, milestoneId, order_index);

-- Trigger to update updated_at timestamp on goal_checklist_items
CREATE TRIGGER IF NOT EXISTS update_goal_checklist_items_timestamp
AFTER UPDATE ON goal_checklist_items
BEGIN
  UPDATE goal_checklist_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goal Links Table
-- Links goals to other entities (habits, tasks, journals) to track related items
CREATE TABLE IF NOT EXISTS goal_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  goalId INTEGER NOT NULL,
  linked_type TEXT NOT NULL, -- Type of linked object: 'habit', 'task', 'journal'
  linked_id INTEGER NOT NULL, -- ID of the linked object in its respective table
  linked_slug TEXT, -- Slug of linked object (for journals)
  note TEXT, -- Optional note about why this is linked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
);

-- Indexes for goal_links
CREATE INDEX IF NOT EXISTS idx_goal_links_userId ON goal_links(userId);
CREATE INDEX IF NOT EXISTS idx_goal_links_goalId ON goal_links(goalId);
CREATE INDEX IF NOT EXISTS idx_goal_links_linked_type ON goal_links(linked_type);
CREATE INDEX IF NOT EXISTS idx_goal_links_linked_id ON goal_links(linked_id);
CREATE INDEX IF NOT EXISTS idx_goal_links_type_id ON goal_links(linked_type, linked_id);

-- Achievements Table
-- Defines available achievements in the system
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY, -- String ID like 'early-bird', 'bookworm-1'
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Lucide icon name
  category TEXT NOT NULL, -- 'mood', 'media', 'habits', 'tasks', 'parks', 'journal', 'general'
  points INTEGER DEFAULT 10,
  target_value INTEGER DEFAULT 1, -- Value needed to unlock (e.g., 10 books)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements Table
-- Tracks user progress and unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  achievementId TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT 0,
  unlocked_at TIMESTAMP,
  progress INTEGER DEFAULT 0, -- Current progress value
  notified INTEGER DEFAULT 0, -- 0 = not notified, 1 = notified
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(userId, achievementId)
);

-- Indexes for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_userId ON user_achievements(userId);
-- Indexes for habit_completions
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_userId ON habit_completions(userId);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions(userId, date);

-- Steam Yearly Stats Table
-- Stores cached steam achievement counts per game per year (per user)
CREATE TABLE IF NOT EXISTS steam_yearly_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  year INTEGER NOT NULL,
  gameId INTEGER NOT NULL,
  gameName TEXT NOT NULL,
  achievements_count INTEGER DEFAULT 0,
  total_playtime INTEGER DEFAULT 0, -- Snapshot of total playtime at sync
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, year, gameId)
);

-- Indexes for steam_yearly_stats
CREATE INDEX IF NOT EXISTS idx_steam_yearly_stats_userId ON steam_yearly_stats(userId);
CREATE INDEX IF NOT EXISTS idx_steam_yearly_stats_year ON steam_yearly_stats(year);

-- Saved Searches Table
-- Stores user's saved search configurations (per user)
CREATE TABLE IF NOT EXISTS saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  query TEXT,
  filters TEXT, -- JSON object of filters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for saved_searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_userId ON saved_searches(userId);

-- Trigger to update updated_at timestamp on saved_searches
CREATE TRIGGER IF NOT EXISTS update_saved_searches_timestamp
AFTER UPDATE ON saved_searches
BEGIN
  UPDATE saved_searches SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goals Table
-- Stores user-defined goals with markdown content, tags, and progress tracking (per user)
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly identifier (e.g., 'learn-spanish')
  title TEXT NOT NULL,
  description TEXT, -- Short summary
  content TEXT, -- Markdown notes
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'on_hold', 'completed', 'archived', 'abandoned')) DEFAULT 'not_started',
  target_date TEXT, -- ISO date string (YYYY-MM-DD) - deadline
  completed_date TEXT, -- ISO date string (YYYY-MM-DD) - when finished
  tags TEXT, -- JSON array of tag strings
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId, slug)
);

-- Indexes for goals
CREATE INDEX IF NOT EXISTS idx_goals_userId ON goals(userId);
CREATE INDEX IF NOT EXISTS idx_goals_slug ON goals(slug);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON goals(priority);

-- Trigger to update updated_at timestamp on goals
CREATE TRIGGER IF NOT EXISTS update_goals_timestamp
AFTER UPDATE ON goals
BEGIN
  UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goal Milestones Table
-- Stores milestones (sub-goals) within a goal
CREATE TABLE IF NOT EXISTS goal_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goalId INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT, -- ISO date string (YYYY-MM-DD), should be <= parent goal target_date
  completed INTEGER DEFAULT 0,
  completed_date TEXT, -- ISO date string (YYYY-MM-DD)
  order_index INTEGER DEFAULT 0, -- Display order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
);

-- Indexes for goal_milestones
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goalId ON goal_milestones(goalId);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_completed ON goal_milestones(completed);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_target_date ON goal_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_order ON goal_milestones(goalId, order_index);

-- Trigger to update updated_at timestamp on goal_milestones
CREATE TRIGGER IF NOT EXISTS update_goal_milestones_timestamp
AFTER UPDATE ON goal_milestones
BEGIN
  UPDATE goal_milestones SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goal Checklist Items Table
-- Stores checklist items for goals and milestones
CREATE TABLE IF NOT EXISTS goal_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goalId INTEGER, -- For goal-level checklists (NULL if milestone checklist)
  milestoneId INTEGER, -- For milestone-level checklists (NULL if goal checklist)
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0, -- Display order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE,
  FOREIGN KEY (milestoneId) REFERENCES goal_milestones(id) ON DELETE CASCADE,
  CHECK (goalId IS NOT NULL OR milestoneId IS NOT NULL)
);

-- Indexes for goal_checklist_items
CREATE INDEX IF NOT EXISTS idx_goal_checklist_items_goalId ON goal_checklist_items(goalId);
CREATE INDEX IF NOT EXISTS idx_goal_checklist_items_milestoneId ON goal_checklist_items(milestoneId);
CREATE INDEX IF NOT EXISTS idx_goal_checklist_items_order ON goal_checklist_items(goalId, milestoneId, order_index);

-- Trigger to update updated_at timestamp on goal_checklist_items
CREATE TRIGGER IF NOT EXISTS update_goal_checklist_items_timestamp
AFTER UPDATE ON goal_checklist_items
BEGIN
  UPDATE goal_checklist_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Goal Links Table
-- Links goals to other entities (habits, tasks, journals) to track related items
CREATE TABLE IF NOT EXISTS goal_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  goalId INTEGER NOT NULL,
  linked_type TEXT NOT NULL, -- Type of linked object: 'habit', 'task', 'journal'
  linked_id INTEGER NOT NULL, -- ID of the linked object in its respective table
  linked_slug TEXT, -- Slug of linked object (for journals)
  note TEXT, -- Optional note about why this is linked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
);

-- Indexes for goal_links
CREATE INDEX IF NOT EXISTS idx_goal_links_userId ON goal_links(userId);
CREATE INDEX IF NOT EXISTS idx_goal_links_goalId ON goal_links(goalId);
CREATE INDEX IF NOT EXISTS idx_goal_links_linked_type ON goal_links(linked_type);
CREATE INDEX IF NOT EXISTS idx_goal_links_linked_id ON goal_links(linked_id);
CREATE INDEX IF NOT EXISTS idx_goal_links_type_id ON goal_links(linked_type, linked_id);

-- Achievements Table
-- Defines available achievements in the system
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY, -- String ID like 'early-bird', 'bookworm-1'
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Lucide icon name
  category TEXT NOT NULL, -- 'mood', 'media', 'habits', 'tasks', 'parks', 'journal', 'general'
  points INTEGER DEFAULT 10,
  target_value INTEGER DEFAULT 1, -- Value needed to unlock (e.g., 10 books)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements Table
-- Tracks user progress and unlocked achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  achievementId TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT 0,
  unlocked_at TIMESTAMP,
  progress INTEGER DEFAULT 0, -- Current progress value
  notified INTEGER DEFAULT 0, -- 0 = not notified, 1 = notified
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(userId, achievementId)
);

-- Indexes for user_achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_userId ON user_achievements(userId);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievementId ON user_achievements(achievementId);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked);

-- Trigger to update updated_at timestamp on user_achievements
CREATE TRIGGER IF NOT EXISTS update_user_achievements_timestamp
AFTER UPDATE ON user_achievements
BEGIN
  UPDATE user_achievements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Allowed Users Table
-- Restricts login access to specific users during beta period
CREATE TABLE IF NOT EXISTS allowed_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the initial allowed user
INSERT OR IGNORE INTO allowed_users (email) VALUES ('jmsutorus@gmail.com');
-- Task Templates Table
-- User-defined templates for creating tasks quickly
CREATE TABLE IF NOT EXISTS task_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high')),
  category TEXT,
  dueDate TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_task_templates_userId ON task_templates(userId);

-- Scratch Pad Table
-- Stores a single quick note per user for temporary jotting
CREATE TABLE IF NOT EXISTS scratch_pads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE(userId)
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_scratch_pads_userId ON scratch_pads(userId);

-- Trigger to update updated_at timestamp on scratch_pads
CREATE TRIGGER IF NOT EXISTS update_scratch_pads_timestamp
AFTER UPDATE ON scratch_pads
BEGIN
  UPDATE scratch_pads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
