import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

console.log("Verifying parks table schema...\n");

try {
  // Get the table schema
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='parks'").get() as { sql: string };

  console.log("Current parks table schema:");
  console.log(schema.sql);

  // Test that all categories work
  const categories = [
    'National Park',
    'State Park',
    'Wilderness',
    'Monument',
    'Recreation Area',
    'City Park',
    'National Seashore',
    'National Forest',
    'Other'
  ];

  console.log("\n\nVerifying all categories are accepted...");

  for (const category of categories) {
    try {
      // Try to insert a test record (will rollback)
      db.exec("BEGIN TRANSACTION");
      const stmt = db.prepare("INSERT INTO parks (slug, title, category, content) VALUES (?, ?, ?, ?)");
      stmt.run(`test-${category.toLowerCase().replace(/\s+/g, '-')}`, `Test ${category}`, category, "Test content");
      db.exec("ROLLBACK");
      console.log(`✓ ${category}`);
    } catch (error) {
      db.exec("ROLLBACK");
      console.log(`✗ ${category} - FAILED`);
    }
  }

  console.log("\n✓ Verification complete!");
} catch (error) {
  console.error("Error verifying schema:", error);
} finally {
  db.close();
}
