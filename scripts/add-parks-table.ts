import { getDatabase } from "../lib/db/index";
import { PARK_CATEGORIES } from "../lib/db/enums/park-enums";

/**
 * Migration script to add the parks table to the database
 */
function addParksTable() {
  console.log("🔄 Adding parks table to database...");

  const db = getDatabase();

  // Check if parks table already exists
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='parks'"
    )
    .get();

  if (tableExists) {
    console.log("⚠️  Parks table already exists, skipping migration");
    return;
  }

  // Generate CHECK constraint from enum values
  const categoryCheck = PARK_CATEGORIES.map(cat => `'${cat}'`).join(', ');

  // Create parks table
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS parks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT CHECK(category IN (${categoryCheck})) NOT NULL,
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
    );
  `;

  db.exec(createTableSQL);

  // Create index on slug for faster lookups
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_slug ON parks(slug);");

  // Create index on category for filtering
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_category ON parks(category);");

  // Create index on state for filtering
  db.exec("CREATE INDEX IF NOT EXISTS idx_parks_state ON parks(state);");

  // Create index on published for filtering
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_parks_published ON parks(published);"
  );

  console.log("✅ Parks table added successfully!");
}

/**
 * Run migration if this file is executed directly
 */
if (require.main === module) {
  try {
    addParksTable();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding parks table:", error);
    process.exit(1);
  }
}
