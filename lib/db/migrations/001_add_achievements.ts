import { getDatabase } from "../index";

export async function up() {
  console.log("Running migration: add_achievements_tables");
  const db = getDatabase();

  await db.execute(`
    -- Achievements Table
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      points INTEGER DEFAULT 10,
      target_value INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- User Achievements Table
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      achievementId TEXT NOT NULL,
      unlocked BOOLEAN DEFAULT 0,
      unlocked_at TIMESTAMP,
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (achievementId) REFERENCES achievements(id) ON DELETE CASCADE,
      UNIQUE(userId, achievementId)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_user_achievements_userId ON user_achievements(userId);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_achievementId ON user_achievements(achievementId);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked);

    -- Trigger
    CREATE TRIGGER IF NOT EXISTS update_user_achievements_timestamp
    AFTER UPDATE ON user_achievements
    BEGIN
      UPDATE user_achievements SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log("Migration completed successfully");
}
