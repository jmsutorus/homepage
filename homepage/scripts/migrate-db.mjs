import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = join(__dirname, "..", "data", "homepage.db");

console.log("🔧 Running database migration...");
console.log("📁 Database path:", dbPath);

try {
  // Create database instance
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");

  // Read schema SQL file
  const schemaPath = join(__dirname, "..", "lib", "db", "schema.sql");
  console.log("📄 Schema path:", schemaPath);

  const schema = readFileSync(schemaPath, "utf-8");

  // Execute schema
  db.exec(schema);

  console.log("✅ Database migration completed successfully!");

  // Check if journals table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='journals'").all();
  console.log("📊 Journals table exists:", tables.length > 0);

  if (tables.length > 0) {
    // Check columns in journals table
    const columns = db.prepare("PRAGMA table_info(journals)").all();
    console.log("📋 Journals table columns:");
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });
  }

  db.close();
  console.log("🎉 Migration complete!");
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
