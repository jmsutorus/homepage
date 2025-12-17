-- GitHub Events Table
-- Stores synced GitHub activity events (per user)
CREATE TABLE IF NOT EXISTS github_events (
  id TEXT PRIMARY KEY, -- GitHub event ID
  userId TEXT NOT NULL,
  type TEXT NOT NULL, -- Event type (PushEvent, PullRequestEvent, etc.)
  actor_login TEXT NOT NULL, -- GitHub username
  actor_avatar_url TEXT, -- Avatar URL
  repo_id INTEGER NOT NULL, -- Repository ID
  repo_name TEXT NOT NULL, -- Repository name (e.g., 'owner/repo')
  payload TEXT, -- JSON payload (commits, PR info, etc.)
  public BOOLEAN DEFAULT 1,
  created_at TEXT NOT NULL, -- ISO timestamp from GitHub
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Indexes for github_events
CREATE INDEX IF NOT EXISTS idx_github_events_userId ON github_events(userId);
CREATE INDEX IF NOT EXISTS idx_github_events_created_at ON github_events(created_at);
CREATE INDEX IF NOT EXISTS idx_github_events_type ON github_events(type);
CREATE INDEX IF NOT EXISTS idx_github_events_repo_name ON github_events(repo_name);
CREATE INDEX IF NOT EXISTS idx_github_events_user_date ON github_events(userId, created_at);

-- GitHub Sync Status Table
-- Tracks last sync time per user
CREATE TABLE IF NOT EXISTS github_sync_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL UNIQUE,
  last_sync TIMESTAMP,
  last_sync_events_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Index for github_sync_status
CREATE INDEX IF NOT EXISTS idx_github_sync_status_userId ON github_sync_status(userId);

-- Trigger to update updated_at timestamp on github_sync_status
CREATE TRIGGER IF NOT EXISTS update_github_sync_status_timestamp
AFTER UPDATE ON github_sync_status
BEGIN
  UPDATE github_sync_status SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
