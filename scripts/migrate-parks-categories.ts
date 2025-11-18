import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

console.log("Starting parks table migration to add missing categories...");

try {
  // Begin transaction
  db.exec("BEGIN TRANSACTION");

  // Create new parks table with updated CHECK constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS parks_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN ('National Park', 'State Park', 'Wilderness', 'Monument', 'Recreation Area', 'City Park', 'National Seashore', 'National Forest', 'Other')) NOT NULL,
      state TEXT,
      poster TEXT,
      description TEXT,
      visited TEXT,
      tags TEXT,
      rating INTEGER CHECK(rating BETWEEN 0 AND 10),
      featured BOOLEAN DEFAULT 0,
      published BOOLEAN DEFAULT 1,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Copy all data from old table to new table
  db.exec(`
    INSERT INTO parks_new (id, slug, title, category, state, poster, description, visited, tags, rating, featured, published, content, created_at, updated_at)
    SELECT id, slug, title, category, state, poster, description, visited, tags, rating, featured, published, content, created_at, updated_at
    FROM parks
  `);

  // Drop old table
  db.exec("DROP TABLE parks");

  // Rename new table to original name
  db.exec("ALTER TABLE parks_new RENAME TO parks");

  // Recreate indexes
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_category ON parks(category)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_state ON parks(state)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_slug ON parks(slug)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_visited ON parks(visited)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_featured ON parks(featured)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_published ON parks(published)");

  // Recreate trigger
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_parks_timestamp
    AFTER UPDATE ON parks
    BEGIN
      UPDATE parks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);

  // Commit transaction
  db.exec("COMMIT");

  console.log("✓ Migration completed successfully!");
  console.log("✓ Parks table now supports all 9 category types:");
  console.log("  - National Park");
  console.log("  - State Park");
  console.log("  - Wilderness");
  console.log("  - Monument");
  console.log("  - Recreation Area");
  console.log("  - City Park");
  console.log("  - National Seashore");
  console.log("  - National Forest");
  console.log("  - Other");
} catch (error) {
  // Rollback on error
  db.exec("ROLLBACK");
  console.error("✗ Migration failed:", error);
  process.exit(1);
} finally {
  db.close();
}
