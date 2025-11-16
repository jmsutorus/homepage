/**
 * Migration script to add userId columns to all data tables for multi-user support
 * Run this script with: node scripts/add-user-id-columns.mjs
 */

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, "..", "data", "homepage.db");

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

console.log("🔄 Starting migration: Adding userId columns to all data tables...\n");

// Tables that need userId column
const tables = [
  "mood_entries",
  "tasks",
  "strava_athlete",
  "strava_activities",
  "workout_activities",
  "media_content",
  "events",
  "parks",
  "journals",
  "journal_links",
];

// Check if we have any users in the database
const userCheck = db.prepare("SELECT id FROM user LIMIT 1").get();
let defaultUserId = null;

if (!userCheck) {
  console.log("⚠️  No users found in database.");
  console.log("   You'll need to create a user first before this migration can complete.");
  console.log("   Run the app and sign up to create your first user.\n");
  process.exit(1);
}

defaultUserId = userCheck.id;
console.log(`✅ Found default user: ${defaultUserId}\n`);

// Function to check if column exists
function columnExists(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((col) => col.name === columnName);
}

// Begin transaction
db.exec("BEGIN TRANSACTION");

try {
  for (const table of tables) {
    console.log(`📋 Processing table: ${table}`);

    // Check if userId column already exists
    if (columnExists(table, "userId")) {
      console.log(`   ⏭️  Column 'userId' already exists, skipping...\n`);
      continue;
    }

    // Add userId column (allow NULL temporarily for migration)
    console.log(`   ➕ Adding userId column...`);
    db.exec(`ALTER TABLE ${table} ADD COLUMN userId TEXT`);

    // Set all existing rows to the default user
    const updateStmt = db.prepare(`UPDATE ${table} SET userId = ? WHERE userId IS NULL`);
    const result = updateStmt.run(defaultUserId);
    console.log(`   ✅ Updated ${result.changes} rows with default userId`);

    // Note: SQLite doesn't support ADD NOT NULL constraint directly
    // We'll handle this in the schema file for new rows
    console.log(`   ℹ️  Note: NOT NULL constraint will be enforced for new rows only`);

    // Add index for userId
    console.log(`   📊 Creating index on userId...`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_${table}_userId ON ${table}(userId)`);

    console.log(`   ✅ Table ${table} migration complete\n`);
  }

  // Commit transaction
  db.exec("COMMIT");
  console.log("✅ Migration completed successfully!\n");
  console.log("📝 Next steps:");
  console.log("   1. Update lib/db/schema.sql to include userId columns");
  console.log("   2. Update all database query functions to filter by userId");
  console.log("   3. Update all API routes to use authenticated user's ID\n");
} catch (error) {
  // Rollback on error
  db.exec("ROLLBACK");
  console.error("❌ Migration failed:", error.message);
  console.error("\n🔄 All changes have been rolled back\n");
  process.exit(1);
}

db.close();
