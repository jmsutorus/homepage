import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "homepage.db");
const db = new Database(dbPath);

console.log("Adding saved_searches table...");

try {
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_saved_searches_userId ON saved_searches(userId);

    CREATE TRIGGER IF NOT EXISTS update_saved_searches_timestamp
    AFTER UPDATE ON saved_searches
    BEGIN
      UPDATE saved_searches SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
  console.log("Successfully added saved_searches table.");
} catch (error) {
  console.error("Error adding table:", error);
}
