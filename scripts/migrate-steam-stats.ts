import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

console.log("Running migration to add steam_yearly_stats table...");

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS steam_yearly_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      year INTEGER NOT NULL,
      gameId INTEGER NOT NULL,
      gameName TEXT NOT NULL,
      achievements_count INTEGER DEFAULT 0,
      total_playtime INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
      UNIQUE(userId, year, gameId)
    );

    CREATE INDEX IF NOT EXISTS idx_steam_yearly_stats_userId ON steam_yearly_stats(userId);
    CREATE INDEX IF NOT EXISTS idx_steam_yearly_stats_year ON steam_yearly_stats(year);
  `);
  console.log("Migration completed successfully.");
} catch (error) {
  console.error("Migration failed:", error);
}
